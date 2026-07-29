#!/usr/bin/env bash
set -u

# Usage:
#   ./create_test_customers.sh <BASE_URL> [COUNT] [DURATION_SECONDS]
#
# Example:
#   ./create_test_customers.sh "http://192.168.1.10:5000" 500 60
#
# Endpoint fixed to: POST /customer
# Payload: { "stutengarten_id": "...", "first_name": "...", "last_name": "..." }

BASE_URL="${1:-}"
COUNT="${2:-500}"
DURATION="${3:-60}"

if [[ -z "$BASE_URL" ]]; then
  echo "Fehler: BASE_URL fehlt."
  echo "Usage: $0 <BASE_URL> [COUNT] [DURATION_SECONDS]"
  exit 1
fi

URL="${BASE_URL%/}/customer"

FIRST_NAMES=(Max Anna Leon Lena Paul Mia Noah Emma Finn Sophie Jonas Marie Lukas Laura Ben Clara Tim Hannah Felix Nina)
LAST_NAMES=(Mueller Schmidt Schneider Fischer Weber Meyer Wagner Becker Hoffmann Schulz Koch Richter Klein Wolf Neumann Schroeder)

DELAY="$(awk -v d="$DURATION" -v c="$COUNT" 'BEGIN { printf "%.6f", d/c }')"

ok=0
failed=0
start_ts="$(date +%s)"

rand_from_array() {
  local -n arr=$1
  echo "${arr[$RANDOM % ${#arr[@]}]}"
}

# numeric id, likely expected by backend
gen_stutengarten_id() {
  # 9-digit pseudo-random id
  echo $((100000000 + RANDOM * 1000 + RANDOM % 1000))
}

tmp_resp="/tmp/customer_resp_$$.txt"

for ((i=1; i<=COUNT; i++)); do
  first="$(rand_from_array FIRST_NAMES)"
  last="$(rand_from_array LAST_NAMES)"
  stg_id="$(gen_stutengarten_id)"

  json=$(cat <<EOF
{"stutengarten_id":"$stg_id","first_name":"$first","last_name":"$last"}
EOF
)

  code="$(curl -sS -o "$tmp_resp" -w "%{http_code}" \
    -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "$json")"

  if [[ "$code" =~ ^2[0-9][0-9]$ ]]; then
    ok=$((ok + 1))
  else
    failed=$((failed + 1))
    resp="$(head -c 220 "$tmp_resp" 2>/dev/null || true)"
    echo "[$i/$COUNT] FAIL HTTP $code: $resp"
  fi

  sleep "$DELAY"
done

end_ts="$(date +%s)"
runtime=$((end_ts - start_ts))
rm -f "$tmp_resp"

echo ""
echo "=== Ergebnis ==="
echo "URL:         $URL"
echo "Gesendet:    $COUNT"
echo "Erfolgreich: $ok"
echo "Fehler:      $failed"
echo "Dauer:       ${runtime}s"
if [[ "$runtime" -gt 0 ]]; then
  rate="$(awk -v c="$COUNT" -v r="$runtime" 'BEGIN { printf "%.2f", c/r }')"
  echo "Rate:        ${rate} req/s"
fi
