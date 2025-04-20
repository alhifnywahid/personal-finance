<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/Bahasa-Indonesia-blue?style=for-the-badge" alt="README Indonesia"></a>
  <a href="README.en.md"><img src="https://img.shields.io/badge/Language-English-green?style=for-the-badge" alt="README English"></a>
</p>

# 💰 KeuanganKu – Aplikasi Keuangan Pribadi

**KeuanganKu** adalah aplikasi web yang dirancang untuk membantu Anda mengelola keuangan pribadi dengan mudah. Dengan fitur pencatatan transaksi, pelacakan utang/piutang, dan visualisasi keuangan, Anda dapat memantau kondisi finansial Anda secara efisien.

## ✨ Fitur Utama

- 📊 **Dashboard Ringkasan**: Lihat ringkasan keuangan Anda secara real-time.
- 🧾 **Manajemen Transaksi**: Tambah, edit, dan hapus transaksi dengan mudah.
- 🔁 **Pelacakan Utang/Piutang**: Catat dan pantau utang serta piutang Anda.
- 📅 **Filter & Pencarian**: Temukan transaksi berdasarkan tanggal, kategori, atau deskripsi.
- 🌙 **Mode Gelap**: Tampilan yang nyaman untuk penggunaan di malam hari.
- 📱 **Responsif & PWA**: Akses aplikasi dari berbagai perangkat dengan dukungan Progressive Web App.

## 🚀 Teknologi yang Digunakan

- **Next.js 14** – Framework React untuk aplikasi web modern.
- **TypeScript** – Bahasa pemrograman dengan tipe statis.
- **Tailwind CSS** – Framework CSS untuk desain yang konsisten.
- **Firebase** – Backend untuk autentikasi dan penyimpanan data.
- **date-fns** – Library untuk manipulasi tanggal.
- **PWA Support** – Instalasi aplikasi seperti aplikasi native.

## 📦 Instalasi

1. **Klon repositori ini:**

   ```bash
   git clone https://github.com/alhifnywahid/personal-finance.git
   cd personal-finance
   ```

2. **Instal dependensi:**

   ```bash
   npm install
   ```

3. **Konfigurasi environment variables:**

   Buat file `.env.local` dan tambahkan konfigurasi Firebase Anda:

   ```env
   NEXT_PUBLIC_FIREBASE_APIKEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECTID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APPID=your_app_id
   ```

4. **Jalankan aplikasi:**

   ```bash
   npm run dev
   ```

   Akses aplikasi di `http://localhost:3000`.

## 🧑‍💻 Kontribusi

Kontribusi sangat diterima! Silakan fork repositori ini dan buat pull request untuk perbaikan atau penambahan fitur.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).