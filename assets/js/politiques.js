/**
 * Politiques de Confidentialité - Gestionnaire dynamique
 */
document.addEventListener('DOMContentLoaded', async () => {
  const appSelect = document.getElementById('app-select');
  const contentArea = document.getElementById('app-content-area');

  // 1. Charger dynamiquement la liste des applications depuis apps.json
  async function loadAppList() {
    try {
      const response = await fetch('../data/apps.json');
      if (!response.ok) throw new Error();
      const apps = await response.json();
      
      appSelect.innerHTML = '<option value="" disabled selected>-- Choisir une plateforme --</option>';
      apps.forEach(app => {
        const option = document.createElement('option');
        option.value = app;
        option.textContent = app.charAt(0).toUpperCase() + app.slice(1);
        appSelect.appendChild(option);
      });
    } catch (err) {
      appSelect.innerHTML = '<option value="" disabled>Erreur de chargement de la liste</option>';
    }
  }

  // 2. Gestion du changement de sélection
  appSelect.addEventListener('change', async (e) => {
    const appKey = e.target.value;
    contentArea.innerHTML = '<div class="text-center">Chargement des données...</div>';
    
    try {
      // Le chemin ../data/ remonte d'un niveau depuis /pages/ vers la racine
      const response = await fetch(`../data/${appKey}.json`);
      if (!response.ok) throw new Error('Fichier introuvable');
      const data = await response.json();
      renderAppData(data);
    } catch (error) {
      contentArea.innerHTML = `
        <div class="card" style="border-top: 3px solid var(--danger)">
          <h3>Erreur de chargement</h3>
          <p>Le fichier <code>data/${appKey}.json</code> est introuvable ou mal formé.</p>
          <p class="text-muted small">Note : Assurez-vous de lancer le projet via un serveur local (ex: Live Server dans VS Code).</p>
        </div>`;
    }
  });

  // 3. Rendu des données (Style similaire au Pixel Tracker)
  function renderAppData(data) {
    let html = `
      <section class="app-analysis-section">
        <div class="card mb-lg accent-primary">
          <div class="flex justify-between align-center mb-md">
            <h2 style="margin:0">${data.appName}</h2>
            <span class="badge badge-primary">Mise à jour : ${data.policyVersion || '2024'}</span>
          </div>
          <p>${data.description}</p>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:50px">Détails</th>
                <th>Catégorie</th>
                <th>Donnée collectée</th>
                <th>Sensibilité</th>
              </tr>
            </thead>
            <tbody>
              ${data.dataPoints.map((item, index) => `
                <tr>
                  <td>
                    <button class="detail-btn" onclick="toggleDetail(${index})">+</button>
                  </td>
                  <td><span class="badge badge-cat-generic">${item.category}</span></td>
                  <td><strong>${item.field}</strong></td>
                  <td><span class="badge ${getSensClass(item.sensitivity)}">${item.sensitivity}</span></td>
                </tr>
                <tr id="detail-${index}" class="detail-row" style="display:none">
                  <td colspan="4" class="detail-cell">
                    <div class="detail-grid">
                      <div class="detail-box">
                        <div class="detail-title">Description</div>
                        <div class="detail-text">${item.description}</div>
                      </div>
                      <div class="detail-box">
                        <div class="detail-title">Finalité / Usage</div>
                        <div class="detail-text">${item.purpose}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
    contentArea.innerHTML = html;
  }

  window.toggleDetail = (id) => {
    const row = document.getElementById(`detail-${id}`);
    const btn = row.previousElementSibling.querySelector('.detail-btn');
    const isHidden = row.style.display === 'none';
    row.style.display = isHidden ? 'table-row' : 'none';
    btn.textContent = isHidden ? '−' : '+';
  };

  function getSensClass(sens) {
    if (sens === "Élevée") return "badge-sens-high";
    if (sens === "Moyenne") return "badge-sens-med";
    return "badge-sens-low";
  }

  loadAppList();
});
