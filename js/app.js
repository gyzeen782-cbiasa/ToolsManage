document.addEventListener("DOMContentLoaded", async () => {
  const savedTheme = await getSetting("theme", "light");
  document.documentElement.dataset.theme = savedTheme;
  document.getElementById("theme-toggle").textContent = savedTheme === "dark" ? "🌙" : "☀️";
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(()=>{});
  document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.page)));
  document.getElementById("theme-toggle").addEventListener("click", async () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.getElementById("theme-toggle").textContent = next === "dark" ? "🌙" : "☀️";
    await setSetting("theme", next);
  });
  await renderApp();
});
function openModal(html) { document.getElementById("modal-box").innerHTML = html; document.getElementById("modal-backdrop").classList.remove("hidden"); }
function closeModal() { document.getElementById("modal-backdrop").classList.add("hidden"); document.getElementById("modal-box").innerHTML = ""; }
function fileFormHTML(file = null) {
  return `<form id="file-form" data-file-id="${file?.id || ""}"><div class="modal-head"><h2>${file ? "Edit File" : "Buat File Baru"}</h2><button type="button" class="close-btn" data-action="close-modal">×</button></div>
    <div class="field"><label>Nama File</label><input name="name" required value="${escapeHTML(file?.name || "")}" placeholder="Contoh: Stok Rokok"></div>
    <div class="field"><label>Kategori</label><input name="category" value="${escapeHTML(file?.category || "Umum")}" placeholder="Contoh: Rokok, Snack, Omset"></div>
    <div class="grid-2"><div class="field"><label>Ikon</label><select name="icon"><option>📁</option><option>📦</option><option>🛒</option><option>🥤</option><option>🍪</option><option>💰</option><option>📝</option></select></div><div class="field"><label>Persentase Default</label><input name="defaultPercent" type="number" min="0" step="0.01" value="${file?.defaultPercent ?? 8}"></div></div>
    <button class="btn full" type="submit">${file ? "Simpan Perubahan" : "Buat File"}</button></form>`;
}
function bindPageEvents() {
  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.onclick = async () => {
      const action = btn.dataset.action;
      if (action === "close-modal") closeModal();
      if (action === "go-files" || action === "back-files") navigate("files");
      if (action === "quick-create" || action === "create-file") openModal(fileFormHTML());
      if (action === "open-file") { currentPage="files"; currentFileId=btn.dataset.fileId; await renderApp(); }
      if (action === "edit-file") { const f=await getFileById(btn.dataset.fileId); openModal(fileFormHTML(f)); }
      if (action === "delete-file") { if(confirm("Hapus file ini beserta seluruh datanya?")) { await removeFile(btn.dataset.fileId); showToast("File dihapus"); renderApp(); } }
      if (action === "add-row") { const f=await getFileById(btn.dataset.fileId); openModal(rowFormHTML(f)); bindLiveRowPreview(); }
      if (action === "edit-row") { const f=await getFileById(currentFileId); const r=f.rows.find(x=>x.id===btn.dataset.rowId); openModal(rowFormHTML(f,r)); bindLiveRowPreview(); }
      if (action === "duplicate-row") { const f=await getFileById(currentFileId); const r=f.rows.find(x=>x.id===btn.dataset.rowId); f.rows.push({...r,id:uid("row"),name:r.name+" (Salinan)"}); await updateFile(f); showToast("Baris diduplikasi"); renderApp(); }
      if (action === "delete-row") { if(confirm("Hapus barang ini?")) { const f=await getFileById(currentFileId); f.rows=f.rows.filter(x=>x.id!==btn.dataset.rowId); await updateFile(f); showToast("Barang dihapus"); renderApp(); } }
      if (action === "save-file-note") { const f=await getFileById(btn.dataset.fileId); f.note=document.getElementById("file-note").value; await updateFile(f); showToast("Catatan file disimpan"); }
      if (action === "add-note") openModal(noteFormHTML());
      if (action === "edit-note") { const n=await dbGet("notes",btn.dataset.noteId); openModal(noteFormHTML(n)); }
      if (action === "delete-note") { if(confirm("Hapus catatan ini?")) { await dbDelete("notes",btn.dataset.noteId); renderApp(); } }
      if (action === "export-backup") exportBackup();
      if (action === "import-backup") importBackup();
      if (action === "clear-all-data") { if(confirm("Semua file, barang, dan catatan akan dihapus. Lanjutkan?")) { await dbClear("files"); await dbClear("notes"); showToast("Semua data dihapus"); navigate("home"); } }
    };
  });
  const fileSearch=document.getElementById("file-search");
  if(fileSearch) fileSearch.oninput=()=>document.querySelectorAll("[data-file-name]").forEach(x=>x.style.display=x.dataset.fileName.includes(fileSearch.value.toLowerCase())?"":"none");
  const rowSearch=document.getElementById("row-search");
  if(rowSearch) rowSearch.oninput=()=>document.querySelectorAll("[data-row-name]").forEach(x=>x.style.display=x.dataset.rowName.includes(rowSearch.value.toLowerCase())?"":"none");
  const rowSort=document.getElementById("row-sort");
  if(rowSort) rowSort.onchange=async()=>{ const f=await getFileById(currentFileId); let rows=[...f.rows]; if(rowSort.value==="name")rows.sort((a,b)=>a.name.localeCompare(b.name)); if(rowSort.value==="stock")rows.sort((a,b)=>b.stock-a.stock); if(rowSort.value==="total")rows.sort((a,b)=>calculateRow(b).total-calculateRow(a).total); document.getElementById("rows-body").innerHTML=renderRows(rows); bindPageEvents(); };
  const darkSetting=document.getElementById("dark-setting");
  if(darkSetting) darkSetting.onchange=async()=>{ const theme=darkSetting.checked?"dark":"light"; document.documentElement.dataset.theme=theme; document.getElementById("theme-toggle").textContent=theme==="dark"?"🌙":"☀️"; await setSetting("theme",theme); };
  const defaultPercent=document.getElementById("default-percent-setting");
  if(defaultPercent) defaultPercent.onchange=()=>setSetting("defaultPercent",Number(defaultPercent.value)||8);
  document.querySelectorAll("[data-calc]").forEach(btn=>btn.onclick=()=>handleCalcKey(btn.dataset.calc));
  const fileSort=document.getElementById("file-sort");
  if(fileSort) fileSort.onchange=async()=>{ let files=await getFiles(); if(fileSort.value==="oldest")files.sort((a,b)=>new Date(a.updatedAt)-new Date(b.updatedAt)); if(fileSort.value==="name")files.sort((a,b)=>a.name.localeCompare(b.name)); document.getElementById("file-list").innerHTML=renderFileCards(files); bindPageEvents(); };
  const fileForm=document.getElementById("file-form");
  if(fileForm) fileForm.onsubmit=async e=>{e.preventDefault(); const data=Object.fromEntries(new FormData(fileForm).entries()); const editing=await getFileById(fileForm.dataset.fileId); if(editing){Object.assign(editing,{name:data.name.trim(),category:data.category,icon:data.icon,defaultPercent:Number(data.defaultPercent)||8});await updateFile(editing);} else {data.defaultPercent=Number(data.defaultPercent)||await getSetting("defaultPercent",8);await createFile(data);} closeModal(); showToast("File berhasil disimpan"); renderApp();};
  const rowForm=document.getElementById("row-form");
  if(rowForm) rowForm.onsubmit=async e=>{e.preventDefault(); const f=await getFileById(currentFileId); const editingRow=f.rows.find(r=>r.id===rowForm.dataset.rowId); await saveRowFromForm(f,rowForm,editingRow?.id||null); closeModal(); showToast("Barang berhasil disimpan"); renderApp();};
  const noteForm=document.getElementById("note-form");
  if(noteForm) noteForm.onsubmit=async e=>{e.preventDefault(); const data=Object.fromEntries(new FormData(noteForm).entries()); const existing=noteForm.dataset.noteId?await dbGet("notes",noteForm.dataset.noteId):null; await dbPut("notes",{id:existing?.id||uid("note"),title:data.title.trim(),content:data.content.trim(),createdAt:existing?.createdAt||nowISO(),updatedAt:nowISO()}); closeModal(); showToast("Catatan disimpan"); renderApp();};
}
function bindLiveRowPreview() {
  const form=document.getElementById("row-form"); if(!form)return;
  const update=()=>{const data=Object.fromEntries(new FormData(form).entries()); document.getElementById("live-row-total").textContent=formatRupiah(calculateRow({stock:data.stock,modal:data.modal,percent:data.percent}).total);};
  form.oninput=update; update();
}
function handleCalcKey(key) {
  if(key==="C") calcExpression="";
  else if(key==="⌫") calcExpression=calcExpression.slice(0,-1);
  else if(key==="=") calculateExpression();
  else if(key==="×" || key==="÷" || key==="−" || key==="+" || key==="%" || key==="." || /^[0-9]$/.test(key)) calcExpression += key;
  updateCalcDisplay();
}