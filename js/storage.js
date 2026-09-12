const DB_NAME = "ProfitKalkukatorDB";
const DB_VERSION = 2;
let dbInstance = null;
let storageMode = "indexeddb";

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { storageMode = "local"; resolve(null); return; }
    if (dbInstance) return resolve(dbInstance);
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "id" });
      if (!db.objectStoreNames.contains("notes")) db.createObjectStore("notes", { keyPath: "id" });
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "id" });
    };
    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onversionchange = () => dbInstance.close();
      resolve(dbInstance);
    };
    request.onerror = () => { storageMode = "local"; resolve(null); };
    request.onblocked = () => { storageMode = "local"; resolve(null); };
  });
}

function localKey(store) { return `profit_kalkukator_${store}`; }
function localRead(store) {
  try { return JSON.parse(localStorage.getItem(localKey(store)) || "[]"); }
  catch { return []; }
}
function localWrite(store, values) { localStorage.setItem(localKey(store), JSON.stringify(values)); }

async function dbGetAll(storeName) {
  const db = await openDB();
  if (!db || storageMode === "local") return localRead(storeName);
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function dbGet(storeName, id) {
  if (!id) return undefined;
  const db = await openDB();
  if (!db || storageMode === "local") return localRead(storeName).find(item => item.id === id);
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, "readonly").objectStore(storeName).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbPut(storeName, value) {
  const db = await openDB();
  if (!db || storageMode === "local") {
    const values = localRead(storeName).filter(item => item.id !== value.id);
    values.push(value); localWrite(storeName, values); return value;
  }
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, "readwrite").objectStore(storeName).put(value);
    req.onsuccess = () => resolve(value);
    req.onerror = () => reject(req.error);
  });
}
async function dbDelete(storeName, id) {
  const db = await openDB();
  if (!db || storageMode === "local") { localWrite(storeName, localRead(storeName).filter(item => item.id !== id)); return; }
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, "readwrite").objectStore(storeName).delete(id);
    req.onsuccess = () => resolve(); req.onerror = () => reject(req.error);
  });
}
async function dbClear(storeName) {
  const db = await openDB();
  if (!db || storageMode === "local") { localWrite(storeName, []); return; }
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, "readwrite").objectStore(storeName).clear();
    req.onsuccess = () => resolve(); req.onerror = () => reject(req.error);
  });
}
function uid(prefix = "id") { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function nowISO() { return new Date().toISOString(); }
function formatDate(iso) { if (!iso) return "-"; return new Intl.DateTimeFormat("id-ID", { dateStyle:"medium", timeStyle:"short" }).format(new Date(iso)); }
function formatRupiah(value) { return new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(Number(value) || 0); }
function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char])); }
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container"); if (!container) return;
  const el = document.createElement("div"); el.className = `toast ${type}`; el.textContent = message; container.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}
