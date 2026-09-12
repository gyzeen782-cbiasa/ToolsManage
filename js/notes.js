async function getNotes() { return (await dbGetAll("notes")).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)); }
function notesHTML(notes) {
  return `<div class="page">
    <div class="section-head"><div><p class="eyebrow">Personal Notes</p><h2>Catatan Umum</h2><p class="muted">Simpan hal penting untuk usaha kamu.</p></div><button class="btn" data-action="add-note">＋ Catatan</button></div>
    <div id="notes-list">${notes.length ? notes.map(note => `<div class="card note-card">
      <div class="note-date">${formatDate(note.updatedAt)}</div>
      <h3>${escapeHTML(note.title)}</h3>
      <p style="white-space:pre-wrap">${escapeHTML(note.content)}</p>
      <div class="actions"><button class="btn secondary small-btn" data-action="edit-note" data-note-id="${note.id}">Edit</button><button class="btn danger small-btn" data-action="delete-note" data-note-id="${note.id}">Hapus</button></div>
    </div>`).join("") : `<div class="card empty">Belum ada catatan umum.</div>`}</div>
  </div>`;
}
function noteFormHTML(note = null) {
  return `<form id="note-form"><div class="modal-head"><h2>${note ? "Edit Catatan" : "Catatan Baru"}</h2><button type="button" class="close-btn" data-action="close-modal">×</button></div>
    <div class="field"><label>Judul</label><input name="title" required value="${escapeHTML(note?.title || "")}" placeholder="Contoh: Belanja supplier"></div>
    <div class="field"><label>Isi Catatan</label><textarea name="content" required placeholder="Tulis catatan...">${escapeHTML(note?.content || "")}</textarea></div>
    <button class="btn full" type="submit">Simpan Catatan</button>
  </form>`;
}