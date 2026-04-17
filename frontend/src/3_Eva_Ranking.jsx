import './3_Eva_Ranking.css'  //Wichtig immer CSS importieren

export default function Eva_Ranking() {
  // ============================================================
  // BACKEND-VARIABLEN
  //
  // VOM BACKEND GELADEN (beim Seitenaufruf):
  //   rangliste (Array von Objekten):
  //     [{ vorname: String, nachname: String, transaktionen: int }, ...]
  //   Sortiert nach transaktionen absteigend
  // ============================================================

  // === BACKEND: Rangliste vom Backend laden ===
  // API-Call: GET /ranking
  // Response: [{ vorname: String, nachname: String, transaktionen: int }, ...]
  // Dummy-Daten zum Testen:
  const rangliste = [
    { vorname: 'Lisa', nachname: 'Mueller', transaktionen: 24 },
    { vorname: 'Max', nachname: 'Mustermann', transaktionen: 18 },
    { vorname: 'Anna', nachname: 'Schmidt', transaktionen: 15 },
    { vorname: 'Tim', nachname: 'Weber', transaktionen: 12 },
    { vorname: 'Sophie', nachname: 'Fischer', transaktionen: 9 },
    { vorname: 'Leon', nachname: 'Wagner', transaktionen: 7 },
    { vorname: 'Emma', nachname: 'Becker', transaktionen: 4 },
    { vorname: 'Paul', nachname: 'Hoffmann', transaktionen: 2 },
  ]
  // === ENDE BACKEND ===

  const medaillen = ['🥇', '🥈', '🥉']

  return (
    <div className="rk-seite">
      <h2 className="rk-titel">Ranking</h2>
      <p className="rk-untertitel">Wer hat die meisten Transaktionen?</p>

      <div className="rk-liste">
        {rangliste.map((p, i) => (
          <div key={i} className={`rk-eintrag ${i < 3 ? 'rk-top3' : ''} ${i === 0 ? 'rk-platz1' : ''}`}>
            <div className="rk-platz">
              {i < 3 ? <span className="rk-medaille">{medaillen[i]}</span> : <span className="rk-nummer">{i + 1}</span>}
            </div>
            <div className="rk-name">{p.vorname} {p.nachname}</div>
            <div className="rk-wert">{p.transaktionen}</div>
          </div>
        ))}

        {rangliste.length === 0 && (
          <div className="rk-leer">Noch keine Daten vorhanden</div>
        )}
      </div>
    </div>
  )
}
