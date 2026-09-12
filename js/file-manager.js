async function getFiles() {
  return (await dbGetAll("files")).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}
async function getFileById(id) { return dbGet("files", id); }
async function createFile(data) {
  const file = {
    id: uid("file"),
    name: data.name.trim(),
    category: data.category || "Umum",
    icon: data.icon || "📁",
    defaultPercent: Number(data.defaultPercent) || 8,
    note: "",
    rows: [],
    createdAt: nowISO(),
    updatedAt: nowISO()
  };
  await dbPut("files", file);
  return file;
}
async function updateFile(file) {
  file.updatedAt = nowISO();
  await dbPut("files", file);
}
async function removeFile(id) { await dbDelete("files", id); }
function fileRowCount(file) { return (file.rows || []).length; }