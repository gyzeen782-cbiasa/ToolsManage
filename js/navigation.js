let currentPage = "home";
let currentFileId = null;
function navigate(page) { currentPage = page; currentFileId = null; renderApp(); }
function setActiveNav() {
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.page === currentPage));
}
async function renderApp() {
  setActiveNav();
  const content = document.getElementById("app-content");
  if (currentPage === "home") content.innerHTML = await homeHTML();
  if (currentPage === "files") content.innerHTML = currentFileId ? renderFileDetail(await getFileById(currentFileId)) : await filesHTML();
  if (currentPage === "calculator") content.innerHTML = calculatorHTML();
  if (currentPage === "notes") content.innerHTML = notesHTML(await getNotes());
  if (currentPage === "settings") content.innerHTML = await settingsHTML();
  bindPageEvents();
}
async function homeHTML() {
  const files = await getFiles();
  const total = files.reduce((acc, file) => {
    const t = calculateFileTotals(file); acc.stock += t.stock; acc.value += t.total; return acc;
  }, {stock:0,value:0});
  const recent = files[0];
  return `<div class="page">
    <section class="card hero"><p class="eyebrow" style="color:#dbeafe">WendStudio</p><h2>Kelola usaha lebih mudah.</h2><p class="muted">Catat stok, hitung keuntungan, dan simpan semuanya secara offline.</p><button class="btn" style="background:white;color:#1d4ed8" data-action="quick-create">＋ Buat File Baru</button></section>
    <div class="stats">
      <div class="stat"><div class="label">Jumlah File</div><div class="value">${files.length}</div></div>
      <div class="stat"><div class="label">Total Barang</div><div class="value">${total.stock}</div></div>
      <div class="stat"><div class="label">Nilai Stok</div><div class="value" style="font-size:16px">${formatRupiah(total.value)}</div></div>
      <div class="stat"><div class="label">Status</div><div class="value" style="font-size:16px;color:var(--success)">Offline</div></div>
    </div>
    <div class="section-head"><h3>File Terakhir</h3><button class="btn secondary small-btn" data-action="go-files">Lihat Semua</button></div>
    ${recent ? `<div class="file-card"><div class="file-icon">${escapeHTML(recent.icon)}</div><div class="file-info"><h3>${escapeHTML(recent.name)}</h3><div class="file-meta">${fileRowCount(recent)} barang · ${formatRupiah(calculateFileTotals(recent).total)}</div></div><button class="btn small-btn" data-action="open-file" data-file-id="${recent.id}">Buka</button></div>` : `<div class="card empty">Belum ada file. Buat file pertama kamu.</div>`}
  </div>`;
}
async function filesHTML() {
  const files = await getFiles();
  return `<div class="page"><div class="section-head"><div><p class="eyebrow">Workspace</p><h2>File Saya</h2><p class="muted">Pisahkan data berdasarkan kebutuhan usaha.</p></div><button class="btn" data-action="create-file">＋ File</button></div>
    <div class="search-row"><input id="file-search" placeholder="Cari file..."><select id="file-sort" style="max-width:145px"><option value="newest">Terbaru</option><option value="oldest">Terlama</option><option value="name">Nama A-Z</option></select></div>
    <div class="file-list" id="file-list">${renderFileCards(files)}</div>
  </div>`;
}
function renderFileCards(files) {
  if (!files.length) return `<div class="card empty">Belum ada file.</div>`;
  return files.map(file => `<div class="file-card" data-file-name="${escapeHTML(file.name.toLowerCase())}">
    <div class="file-icon">${escapeHTML(file.icon)}</div><div class="file-info"><h3>${escapeHTML(file.name)}</h3><div class="file-meta">${escapeHTML(file.category)} · ${fileRowCount(file)} baris · ${formatRupiah(calculateFileTotals(file).total)}</div></div>
    <div class="file-actions"><button class="mini-btn" data-action="open-file" data-file-id="${file.id}">↗</button><button class="mini-btn" data-action="edit-file" data-file-id="${file.id}">✎</button><button class="mini-btn danger" data-action="delete-file" data-file-id="${file.id}">×</button></div>
  </div>`).join("");
}