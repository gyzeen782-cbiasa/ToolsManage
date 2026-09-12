# Profit Kalkukator App

Credit: WendStudio

Aplikasi pencatatan stok, kalkulator keuntungan, file management, catatan, dan backup yang berjalan offline.

## Menjalankan di HP

1. Upload seluruh isi folder project ke repository GitHub.
2. Aktifkan GitHub Pages dari Settings > Pages.
3. Pilih branch `main` dan folder `/root`.
4. Buka URL GitHub Pages.
5. Untuk penggunaan offline, buka aplikasi melalui browser yang mendukung penyimpanan lokal.
6. Jangan menghapus data situs/browser karena data IndexedDB dapat ikut terhapus.

## Catatan

- Service Worker aktif jika aplikasi dibuka melalui HTTPS/GitHub Pages.
- GitHub Pages menjalankan versi web. Untuk APK, project perlu dibungkus menggunakan tool Android/WebView seperti Capacitor atau layanan build yang mendukung project web.
- Backup JSON disediakan agar data dapat dipindahkan secara manual.
