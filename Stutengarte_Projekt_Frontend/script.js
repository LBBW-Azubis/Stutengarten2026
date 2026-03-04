let kunden = [];
let aktuellerKunde = null;

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function login() {
  const ausweis = document.getElementById("ausweis").value.trim();
  const passwort = document.getElementById("passwort").value.trim();
  const status = document.getElementById("status");

  if (ausweis && passwort) {
    status.innerText = "Login erfolgreich";
    status.style.color = "green";
    setTimeout(() => showPage("menu"), 800);
  } else {
    status.innerText = "Bitte Daten eingeben";
    status.style.color = "red";
  }
}

document.getElementById("loginButton").addEventListener("click", login);

function kundeErstellen() {
  const name = document.getElementById("kundenName").value.trim();
  if (!name) return;

  const neuerKunde = {
    id: Date.now(),
    name: name,
    kontostand: 0
  };

  kunden.push(neuerKunde);
  document.getElementById("kundenName").value = "";
  alert("Kunde erstellt!");
  aktualisiereKundenListe();
}

function aktualisiereKundenListe() {
  const liste = document.getElementById("kundenListe");
  liste.innerHTML = "";

  kunden.forEach(k => {
    const option = document.createElement("option");
    option.value = k.id;
    option.textContent = k.name;
    liste.appendChild(option);
  });
}

function kundeWaehlen() {
  const id = document.getElementById("kundenListe").value;
  aktuellerKunde = kunden.find(k => k.id == id);
  alert("Kunde ausgewählt: " + aktuellerKunde.name);
}

function kontoAnzeigen() {
  const info = document.getElementById("kontoInfo");

  if (!aktuellerKunde) {
    info.innerText = "Kein Kunde ausgewählt";
    return;
  }

  info.innerText =
    "Name: " + aktuellerKunde.name +
    " | Kontostand: " + aktuellerKunde.kontostand + " €";
}

function deposit() {
  if (!aktuellerKunde) return;

  let amount = parseFloat(document.getElementById("depositAmount").value);
  if (!isNaN(amount) && amount > 0) {
    aktuellerKunde.kontostand += amount;
    kontoAnzeigen();
  }
}

function withdraw() {
  if (!aktuellerKunde) return;

  let amount = parseFloat(document.getElementById("withdrawAmount").value);
  if (!isNaN(amount) && amount > 0 && amount <= aktuellerKunde.kontostand) {
    aktuellerKunde.kontostand -= amount;
    kontoAnzeigen();
  }
}

function logout() {
  showPage("login");
}