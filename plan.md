# Rencana Implementasi — Bali Top Holiday Proposal Generator

## Tujuan produk
Membangun MVP web berbahasa Indonesia untuk mempercepat pembuatan proposal tour Bali dari sekitar 45 menit menjadi kurang dari 10 menit. Sales dapat memilih template, mengisi data klien, menyusun itinerary, memilih opsi harga, memvalidasi jadwal, melihat preview proposal, lalu mencetak/menyimpan PDF atau membagikan tautan.

## Pendekatan implementasi
- **Frontend**: React + TypeScript + Vite dari starter WebDev, dengan state lokal yang terstruktur untuk pengalaman cepat dan fallback demo.
- **Database**: Supabase project `ProposalBTH` menjadi sumber data master dan proposal. Aplikasi memakai `@supabase/supabase-js` melalui environment `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`; bila belum tersedia, demo seed tetap dapat dijalankan tanpa memblokir UI.
- **Backend/deployment**: Server starter dipertahankan untuk health check dan integrasi tRPC; deployment target dibuat siap untuk Vercel dari repository GitHub. PDF MVP memakai print stylesheet A4 agar dapat langsung disimpan sebagai PDF dari browser, dengan struktur dokumen yang sama dengan template PRD.
- **Data model**: tabel Supabase dibuat untuk pengaturan perusahaan, master destinasi/restoran/hotel, template paket, proposal, opsi harga, hari itinerary, aktivitas, fasilitas, dan approval/share link. Harga proposal menyimpan snapshot agar tidak berubah saat master berubah.
- **Keamanan**: hanya public publishable/anon key di browser; service role tidak dimasukkan ke source. Data demo dipisahkan dari logika provider dan siap diganti dengan query Supabase.

## Desain produk
- **Design movement**: editorial travel operations — perpaduan dashboard SaaS yang presisi dengan nuansa hospitality Bali yang hangat.
- **Core principles**: (1) angka dan status mudah dipindai, (2) alur wizard terasa ringan, (3) informasi penting selalu punya konteks, (4) aksen resort hanya digunakan untuk memperkuat keputusan bisnis.
- **Color philosophy**: biru navy memberi kepercayaan dan kontrol, biru laut memberi rasa perjalanan, emas-oranye menjadi signature yang mengingatkan matahari Bali, dan hijau/merah lembut membedakan included/excluded tanpa agresif.
- **Layout paradigm**: split workspace — navigasi tetap di kiri, area kerja yang lapang di tengah, dan preview dokumen sebagai rail kontekstual di kanan; di ponsel rail berubah menjadi tab.
- **Signature elements**: garis emas tipis di bawah header, panel “pulse” dengan angka besar untuk pipeline, dan preview kertas A4 dengan cap DRAFT.
- **Interaction philosophy**: setiap perubahan angka langsung memantulkan konsekuensinya (pax bayar/free, kamar, total, DP); warning tampil sebagai bantuan keputusan, bukan blocking kecuali aturan yang benar-benar invalid.
- **Animation**: transisi 160–220ms untuk panel/kartu, shimmer hanya saat loading, stepper memberi highlight singkat saat berpindah langkah; tidak ada animasi dekoratif yang mengganggu input cepat.
- **Typography system**: Inter untuk UI dan angka, Fraunces sebagai aksen editorial pada label proposal; heading padat, label kecil uppercase, body 13–15px.
- **Brand essence**: alat kerja proposal tercepat untuk tim Bali Top Holiday — rapi, hangat, dapat dipercaya. Kepribadian: decisive, welcoming, meticulous.
- **Brand voice**: headline singkat dan operasional, CTA berbasis hasil. Contoh: “Susun proposal yang siap dikirim.” dan “Hitung otomatis, kirim dengan percaya diri.”
- **Wordmark & logo**: wordmark “BALI TOP” dengan garis horizon kecil dan aksen matahari, dirender sebagai mark UI ringan agar tetap terbaca di sidebar.
- **Signature brand color**: `#F4B942` sun-gold.

## Ruang lingkup MVP yang diimplementasikan
1. Dashboard proposal dengan KPI, filter, pencarian, status, dan daftar proposal.
2. Wizard enam langkah: klien/trip, deskripsi, itinerary, hotel/harga, flight/fasilitas/syarat, review/penerbitan.
3. Pricing engine: aturan 1 free setiap 25 pax bayar, harga manual, total, kamar otomatis, DP.
4. Itinerary validation: jam selesai, overlap, gap > 90 menit, restoran untuk makan, flight arrival mismatch.
5. Preview proposal real-time dengan tampilan A4 dan print-to-PDF.
6. Seed data demo BTH-3H2M, destinasi, hotel, restoran, dan contoh proposal.
7. Halaman Master Data ringkas dan Pengaturan perusahaan sebagai fondasi CRUD.
8. Supabase migration dan adapter siap untuk persistence; demo mode tetap usable saat env belum diisi.

## Struktur proyek
- `client/src/pages/Home.tsx`: shell dashboard, navigasi, dashboard, wizard, master data, pengaturan.
- `client/src/lib/proposal-engine.ts`: seed data, kalkulasi pax/free, kamar, total, validasi itinerary, formatter.
- `client/src/lib/supabase.ts`: client Supabase opsional dan adapter persistence ringan.
- `client/src/index.css`: design system, layout, komponen proposal print.
- `server/`: server starter, health endpoint, dan titik integrasi API lanjutan.
- `supabase/migrations/`: skema Postgres untuk master data, proposal, itinerary, pricing, share, approval, dan audit.
- `public/manus-routes.json`: deklarasi route untuk preview/publikasi.

## Build workflow
1. Install dependency, aktifkan diagnostik TypeScript, dan implementasikan UI/engine.
2. Jalankan `pnpm check`, `pnpm test`, `pnpm build` dan smoke test HTTP pada `/api/health` serta `/manus-routes.json`.
3. Apply migration ke Supabase project ProposalBTH dan isi seed demo non-sensitif.
4. Commit ke repository canonical; buat repository GitHub private dan hubungkan ke Vercel setelah build lokal bersih.
5. Set environment Vercel dengan URL dan publishable key Supabase tanpa memasukkan service role ke browser.
