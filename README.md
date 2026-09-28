# SARPRAS Event Request System

Aplikasi pengajuan kebutuhan antar divisi untuk satu event aktif. Halaman divisi bersifat publik; pengelolaan event, divisi, dan seluruh request memerlukan login admin. Event yang diarsipkan tetap dapat dibaca tetapi tidak dapat diubah melalui alur publik.

## Menjalankan development

1. Siapkan `.env.local` dari `.env.example`. Isi `AUTH_SECRET` dengan nilai acak yang panjang dan pilih `SEED_ADMIN_PASSWORD` khusus development. Jangan commit `.env.local`.
2. Jalankan PostgreSQL lokal: `docker compose up -d postgres`. Container memakai `127.0.0.1:55433` dan volume persisten.
3. Jalankan `pnpm install`, lalu `pnpm db:migrate`.
4. Jalankan `pnpm db:seed` untuk membuat admin dan contoh event/divisi/request apabila `SEED_INCLUDE_DEMO=true`.
5. Jalankan `pnpm dev`, lalu buka alamat yang ditampilkan Next.js.

Seed dapat dijalankan ulang. Akun admin yang sudah ada tidak diubah kata sandinya kecuali `SEED_RESET_ADMIN_PASSWORD=true`. Seed menolak berjalan jika `NODE_ENV=production`; jangan arahkan kredensial development ke database produksi.

Untuk membuat akun admin production tanpa membuat data demo, gunakan command terpisah:

```bash
ADMIN_NAME="Administrator" \
ADMIN_EMAIL="admin@domainanda.com" \
ADMIN_PASSWORD="gunakan-password-minimal-12-karakter" \
DATABASE_URL="postgresql://..." \
DATABASE_SSL=require \
pnpm db:create-admin
```

Command ini hanya membuat akun baru dan gagal jika email tersebut sudah terdaftar.

## Alur

- Publik: pilih event/divisi → ajukan request → pantau halaman Diajukan → divisi tujuan menandai status pada halaman Masuk.
- Admin: login di `/admin/login` → kelola event dan divisi → aktifkan event → pantau request di `/admin/requests`.
- Hanya satu event dapat aktif. Event lain dapat dilihat sebagai arsip.

## Verifikasi

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Stack: Next.js 16 App Router, React 19, PostgreSQL 16, Drizzle ORM, Auth.js, Tailwind CSS 4, dan komponen [NeoBrutalism](https://neobrutalism.com/docs/installation) varian Base UI.
