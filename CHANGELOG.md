# Changelog

Semua perubahan penting pada ZeroCode. Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), dan versioning mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.8.0-beta.1] - 2026-08-15

### Security Hardening (serverize backend)

- **Semua query database dipindah dari browser ke serverless functions.** Browser tidak lagi berhubungan langsung dengan Neon (`VITE_NEON_DATABASE_URL` tidak ada di bundle client).
- **Opaque session token** menggantikan session localStorage biasa:
  - Token random 32-byte, disimpan sebagai hash sha256 di tabel `sessions` (migration `migrations/security_hardening.sql`).
  - Expiry 30 hari, otomatis di-refresh `last_used_at`, logout menghapus session.
- **Authorization server-side** di semua endpoint:
  - `userId` diambil dari token, bukan body request (menutup BOLA/IDOR).
  - Admin operations cek `is_admin` di server (`requireAdmin`), bukan client-side.
- **Hapus backdoor admin**: email yang mengandung "admin" tidak lagi unlock semua kursus.
- **Admin secret code dipindah ke server** (`ADMIN_SECRET_CODE` env), tidak lagi dibandingkan di client.
- **Rate limiting** di endpoint auth (login, register, verify, resend, reset, promote) — in-memory sliding window.
- **Google OAuth diverifikasi server-side** (`oauth2.googleapis.com/tokeninfo` + audience check).
- **GitHub OAuth** exchange code server-side (client secret tidak pernah ke browser).
- **Hapus route `/migrate`** yang berisi `DROP TABLE` — jebakan data loss.
- **`sql.unsafe` dihapus** dari `ProgressProvider.endSession` (query eksplisit per kolom).

### Bug Fixes

- **Fix `version` undefined di `markCourseComplete`** — progress kursus tidak tersimpan sebelumnya.
- **Fix auth hang / 504**: `rateLimitAuth`/`rateLimitStrict` return `undefined` saat allowed sehingga handler keluar tanpa response. Sekarang return boolean.
- **Fix 405 / routing**: dynamic route bracket `[action].js` tidak ter-register sebagai serverless function di Vercel → semua `/api/*` 404/405. Diganti file flat + query param (`/api/auth?action=login`).
- **Fix reset password 404**: client memanggil `/api/auth/reset-password` tapi file ada di root — sekarang jadi satu handler.
- **Fix blank landing page**: `WHATSAPP_NUMBER` hilang setelah refactor pricing → `ReferenceError` → blank black. Di-import ulang.
- **Fix lucide icon**: `Github` brand icon dihapus di lucide 1.x → diganti `GitBranch`.

### Infrastruktur / Deployment

- **Vercel Hobby limit**: konsolidasi 24 → 10 serverless functions.
- **`shared/_lib/` dipindah keluar `api/`** supaya tidak terhitung sebagai function.
- **ErrorBoundary** global — satu page crash tidak lagi bikin seluruh app blank.
- **Code splitting**: `React.lazy` + `Suspense` per route. Bundle utama 6.7MB → 3.8MB (gzip 1.9MB → 1.1MB). Monaco/mermaid/3D jadi chunk terpisah.
- **Dependency upgrade**:
  - `nodemailer` 7 → 9 (menutup 6 advisories termasuk high SMTP command injection).
  - `framer-motion` 12 → 13.
  - `lucide-react` 0.561 → 1.31.
- **Dead code dihapus**: `aiService.js` (Groq) — AI panel sekarang pakai Gemini; `supabase.js` (tidak pernah dipakai); uninstall `@supabase/supabase-js`, `resend`.
- **Testing**: Vitest + 15 test (rate limiter regression, session hashing, pricing consistency).

### Produk / Bisnis

- **Single source of truth pricing** (`src/lib/pricing.js`): Starter Rp 50K, Developer Rp 75K, Professional Rp 80K, Master Rp 164K. Sebelumnya 3 sumber beda (landing 149/299/549K vs chatbot 50/75/80/164K).
- **SEO**: `sitemap.xml`, `robots.txt`, og:image, canonical, locale `id_ID`, meta description/keywords.
- **Trust signals jujur**: hapus testimonial fiktif, achievements palsu, stats overclaim dari README; update repo ref `dkycdr` → `alertxsto`.
- **Flow pembayaran WhatsApp lebih jelas**: pesan terstruktur + instruksi aktivasi 4 langkah di halaman Profile.

## [2.7.0-beta.1] - 2026 (sebelumnya)

### Added

- New Login/Register Experience: 'Neural Handshake' DNA Interface.
- Global Aesthetic Refinement: Darker backgrounds and sharper contrasts.
- Syllabus Update: Enhanced DNA Background visibility and 'Data Panel' containers.
- Security: Visual enhancements for authentication terminals.

## [2.6.0-beta.1] - 2026 (sebelumnya)

### Added

- OFFICIAL BETA RELEASE: ZeroCode Platform is now in Public Beta.
- New 'Neural Access' DNA Pricing Engine: 3D Canvas Helix with Infinite Scroll.
- Landing Page Overhaul: Cyberpunk HUD Navbar & 'Code Evolution' Hero.
- Visual Upgrade: Neon Grid Systems, Glitch Typography, and Holo-Terminal Previews.
- Performance: Optimized Canvas rendering for smooth 60fps animations.

## [2.5.5] - 2026 (sebelumnya)

### Fixed

- Fixed Critical Crash in Learning Navigation.
- Resolved key collision in CSS Curriculum.
- Optimized asset rendering for transparent logos.

### Changed

- New Brand Identity: 'Rocket Z0' Logo integration.

## [2.5.0] - 2025-12-22

### Added

- New AI Learning Assistant with context-aware code help.
- Forum 2.0: Elegant Dark UI, Visual Tagging, and Editing.
- Redesigned Navigation with Syllabus-based progress tracking.
- Fixed 'Get Unstuck' and optimized performance.

### Changed

- Complete Rebranding: 'ZeroCode' with High Contrast Identity.

## [2.2.0] - 2025-12-21

### Added

- Expanded Node.js course from 1 to 12 Units (Elite Standard).
- Added 'Deep Dive' informational modules for V8 and Event Loop.
- New Units: Authentication (JWT/Bcrypt), Real-time (Socket.io).
- Implemented Clustering & Deployment labs.

## [2.1.5] - 2025-12-21

### Added

- New Holographic Logo implementation.
- Added 'Updates' and 'Notification' system.
- Improved Dashboard responsive layout.

### Changed

- Redesigned Navigation Header with glassmorphism.

## [2.1.0] - 2025-12-20

### Added

- Refactored entire React curriculum to Elite Standard.
- Added 16 Units covering modern Hooks and Patterns.
- New Capstone Project: E-Commerce Dashboard.
- Fixed syntax highlighting in code runners.

## [2.0.8] - 2025-12-18

### Changed

- Refactored Tailwind CSS units for better clarity.
- Added 'Dark Mode' specific labs.
- Fixed validation regex for CSS Grid challenges.

## [2.0.0] - 2025-12-15

### Added

- Launched 'Nebula' AI Tutor Assistant.
- Context-aware help button in every lesson.
- Automated code review and hint system.
- Personality matrix updated for friendlier responses.

## [1.5.0] - 2025-11-30

### Added

- Added Role-Based Access Control (RBAC).
- Admin Dashboard for curriculum management.
- Secure JWT token handling.
- Email verification workflow.

## [1.0.0] - 2025-10-01

### Added

- Initial release of ZeroCode Platform.
- Basic JavaScript and HTML courses.
- Interactive Web-based IDE.
- User Progress Tracking.
