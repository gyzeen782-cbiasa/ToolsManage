async function getSetting(id, fallback) { const item = await dbGet("settings", id); return item ? item.value : fallback; }
async function setSetting(id, value) { await dbPut("settings", {id, value}); }
async function settingsHTML() {
  const dark = document.documentElement.dataset.theme === "dark";
  const defaultPercent = await getSetting("defaultPercent", 8);
  return `<div class="page">
    <div class="section-head"><div><p class="eyebrow">Customize</p><h2>Pengaturan</h2><p class="muted">Atur pengalaman aplikasi kamu.</p></div></div>
    <div class="card">
      <div class="setting-row"><div><strong>Mode Gelap</strong><div class="muted small">Gunakan tema gelap untuk malam hari.</div></div><label class="switch"><input id="dark-setting" type="checkbox" ${dark?"checked":""}><span class="slider-switch"></span></label></div>
      <div class="setting-row"><div><strong>Persentase Default</strong><div class="muted small">Dipakai saat membuat file baru.</div></div><input id="default-percent-setting" type="number" min="0" step="0.01" value="${defaultPercent}" style="max-width:100px"></div>
    </div>
    <div class="card">
      <h3>Backup & Restore</h3><p class="muted small">Simpan seluruh data sebagai file JSON dan pulihkan kembali tanpa internet.</p>
      <div class="actions"><button class="btn" data-action="export-backup">Export Backup</button><button class="btn secondary" data-action="import-backup">Import Backup</button></div>
    </div>
    <div class="card">
      <h3>Informasi Aplikasi</h3><p class="muted">Profit Kalkukator App</p><p class="muted small">Credit: WendStudio</p><p class="muted small">Versi MVP 1.0 · Offline-first</p>
    </div>
    <div class="card"><button class="btn danger full" data-action="clear-all-data">Hapus Seluruh Data</button></div>
  </div>`;
}