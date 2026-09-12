function renderFileDetail(file) {
  const totals = calculateFileTotals(file);
  const rows = file.rows || [];
  return `
    <div class="page">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHTML(file.category)}</p>
          <h2>${escapeHTML(file.icon)} ${escapeHTML(file.name)}</h2>
          <p class="muted small">Default persentase: ${file.defaultPercent}% · Diedit ${formatDate(file.updatedAt)}</p>
        </div>
        <button class="btn secondary small-btn" data-action="back-files">← Kembali</button>
      </div>
      <div class="card">
        <div class="actions">
          <button class="btn" data-action="add-row" data-file-id="${file.id}">＋ Tambah Barang</button>
          <button class="btn secondary" data-action="edit-file" data-file-id="${file.id}">Edit File</button>
        </div>
      </div>
      <div class="card">
        <div class="search-row">
          <input id="row-search" placeholder="Cari nama barang..." />
          <select id="row-sort" style="max-width:145px">
            <option value="newest">Terbaru</option>
            <option value="name">Nama A-Z</option>
            <option value="stock">Stock terbesar</option>
            <option value="total">Nilai terbesar</option>
          </select>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr>
              <th>Barang</th><th>Stock</th><th>Modal</th><th>%</th><th>Harga Jual</th><th>Jumlah</th><th>Aksi</th>
            </tr></thead>
            <tbody id="rows-body">${renderRows(rows)}</tbody>
          </table>
        </div>
        <div class="table-total">
          <div class="total-item"><span class="muted small">Total Stock</span><strong id="total-stock">${totals.stock}</strong></div>
          <div class="total-item"><span class="muted small">Total Modal</span><strong id="total-modal">${formatRupiah(totals.modal)}</strong></div>
          <div class="total-item"><span class="muted small">Total Setelah %</span><strong id="total-after">${formatRupiah(totals.afterPercent)}</strong></div>
          <div class="total-item"><span class="muted small">Total Jumlah</span><strong id="total-value">${formatRupiah(totals.total)}</strong></div>
        </div>
      </div>
      <div class="card">
        <h3>Catatan File</h3>
        <textarea id="file-note" placeholder="Tulis catatan untuk file ini...">${escapeHTML(file.note || "")}</textarea>
        <button class="btn full" data-action="save-file-note" data-file-id="${file.id}">Simpan Catatan</button>
      </div>
    </div>`;
}
function renderRows(rows) {
  if (!rows.length) return `<tr><td colspan="7"><div class="empty">Belum ada barang. Tambahkan data pertama kamu.</div></td></tr>`;
  return rows.map(row => {
    const c = calculateRow(row);
    return `<tr data-row-name="${escapeHTML(row.name.toLowerCase())}">
      <td><strong>${escapeHTML(row.name)}</strong></td>
      <td>${c.stock}</td>
      <td>${formatRupiah(c.modal)}</td>
      <td>${c.percent}%</td>
      <td>${formatRupiah(c.sellingUnit)}</td>
      <td><strong>${formatRupiah(c.total)}</strong></td>
      <td><div class="actions">
        <button class="mini-btn" data-action="edit-row" data-row-id="${row.id}">✎</button>
        <button class="mini-btn" data-action="duplicate-row" data-row-id="${row.id}">⧉</button>
        <button class="mini-btn danger" data-action="delete-row" data-row-id="${row.id}">×</button>
      </div></td>
    </tr>`;
  }).join("");
}
function rowFormHTML(file, row = null) {
  const editing = Boolean(row);
  return `<form id="row-form" data-row-id="${row?.id || ""}">
    <div class="modal-head"><h2>${editing ? "Edit Barang" : "Tambah Barang"}</h2><button type="button" class="close-btn" data-action="close-modal">×</button></div>
    <div class="field"><label>Nama Barang</label><input name="name" required value="${escapeHTML(row?.name || "")}" placeholder="Contoh: Rokok A"></div>
    <div class="grid-2">
      <div class="field"><label>Stock</label><input name="stock" type="number" min="0" step="1" required value="${row?.stock ?? 0}"></div>
      <div class="field"><label>Modal per Barang</label><input name="modal" type="number" min="0" step="1" required value="${row?.modal ?? 0}"></div>
    </div>
    <div class="field"><label>Persentase Keuntungan (%)</label><input name="percent" type="number" min="0" step="0.01" value="${row?.percent ?? file.defaultPercent}"></div>
    <div class="card" style="background:var(--surface-2);box-shadow:none">
      <span class="muted small">Jumlah otomatis</span>
      <h3 id="live-row-total">${formatRupiah(calculateRow(row || {stock:0,modal:0,percent:file.defaultPercent}).total)}</h3>
    </div>
    <button class="btn full" type="submit">${editing ? "Simpan Perubahan" : "Tambah Barang"}</button>
  </form>`;
}
async function saveRowFromForm(file, form, rowId = null) {
  const data = Object.fromEntries(new FormData(form).entries());
  const row = {
    id: rowId || uid("row"),
    name: data.name.trim(),
    stock: Number(data.stock) || 0,
    modal: Number(data.modal) || 0,
    percent: Number(data.percent) || 0,
    createdAt: rowId ? (file.rows.find(r => r.id === rowId)?.createdAt || nowISO()) : nowISO()
  };
  if (rowId) file.rows = file.rows.map(r => r.id === rowId ? row : r);
  else file.rows.push(row);
  await updateFile(file);
}