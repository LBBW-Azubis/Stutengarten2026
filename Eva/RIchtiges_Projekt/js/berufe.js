// js/berufe.js – Berufe-Verwaltung (localStorage)
(function(){
  const UNLOCK_CODE = '1234';
  const unlockBtn  = document.getElementById('unlock-btn');
  const adminCode  = document.getElementById('admin-code');
  const manageArea = document.getElementById('manage-area');
  const addBtn     = document.getElementById('add-beruf');
  const input      = document.getElementById('beruf-input');
  const listEl     = document.getElementById('berufe-list');

  function getBerufe() {
    try { return JSON.parse(localStorage.getItem('berufe') || '[]'); } catch(e) { return []; }
  }
  function saveBerufe(arr) { localStorage.setItem('berufe', JSON.stringify(arr)); }
  function render() {
    const berufe = getBerufe();
    listEl.innerHTML = '';
    berufe.forEach((b, idx) => {
      const li = document.createElement('li');
      li.style.padding = '8px 0';
      li.style.borderBottom = '1px solid #e0ede8';
      li.textContent = b;
      const del = document.createElement('button');
      del.textContent = 'Entfernen';
      del.className = 'btn btn-dunkel';
      del.style.marginLeft = '12px';
      del.onclick = () => { const arr=getBerufe(); arr.splice(idx,1); saveBerufe(arr); render(); };
      li.appendChild(del);
      listEl.appendChild(li);
    });
  }

  if (unlockBtn) {
    unlockBtn.addEventListener('click', () => {
      if (adminCode.value === UNLOCK_CODE) {
        manageArea.style.display = 'block';
        document.getElementById('auth-area').style.display = 'none';
        render();
      } else {
        alert('Code falsch.');
      }
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const val = input.value && input.value.trim();
      if (!val) return;
      const arr = getBerufe(); arr.push(val); saveBerufe(arr);
      input.value = ''; render();
    });
  }
})();