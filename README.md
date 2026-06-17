# Server Owners Support (SOS) 🛡️

موقع مجتمع أصحاب سيرفرات الديسكورد العربي.

---

## 📍 وين وصلنا (حالة المشروع)

### ✅ اللي خلصنا منه

| الشيء | الحالة | التفاصيل |
|-------|--------|----------|
| Frontend (React + Vite) | ✅ جاهز | داخل `artifacts/sos-website/src/` |
| API (Vercel Functions) | ✅ جاهز | داخل `api/` في جذر الـ repo |
| قاعدة البيانات | ✅ جاهز | Neon PostgreSQL (env var: `NEON_DATABASE_URL`) |
| نشر على Vercel | ✅ جاهز | `server-owners-support.vercel.app` |
| ترجمة عربي/إنجليزي | ✅ جاهز | `src/locales/ar.json` + `src/locales/en.json` |
| Discord OAuth | ✅ جاهز | Login / Callback / Logout / Me |
| نظام القوالب | ✅ جاهز | CRUD كامل |
| البوت | ✅ جاهز | تطبيق القالب على السيرفر تلقائياً |
| لوحة الإدارة | ✅ جاهز | إدارة المستخدمين والقوالب والإعدادات |

---

## 🏗️ هيكل المشروع

```
/ (جذر الـ repo)
├── api/                          ← Vercel Serverless Functions
│   ├── _lib/
│   │   ├── auth.ts              ← مساعدات الصلاحيات (JWT/session)
│   │   └── db.ts                ← اتصال Neon PostgreSQL
│   ├── auth/
│   │   ├── login.ts             ← بداية Discord OAuth
│   │   ├── callback.ts          ← استقبال Discord callback
│   │   ├── me.ts                ← بيانات المستخدم الحالي
│   │   └── logout.ts            ← تسجيل الخروج
│   ├── discord/guilds.ts        ← قائمة سيرفرات المستخدم
│   ├── templates/
│   │   ├── index.ts             ← GET/POST القوالب
│   │   └── [id].ts              ← GET/PUT/DELETE قالب واحد
│   ├── bot/apply.ts             ← تطبيق قالب عبر البوت
│   ├── admin/
│   │   ├── stats.ts             ← إحصائيات لوحة الإدارة
│   │   ├── users.ts             ← إدارة المستخدمين
│   │   ├── users/[discordId].ts ← حذف مستخدم
│   │   ├── settings.ts          ← إعدادات الموقع
│   │   └── settings/[key].ts    ← تعديل إعداد
│   ├── settings/invite.ts       ← رابط الدعوة
│   ├── healthz.ts               ← فحص الصحة
│   └── tsconfig.json            ← TypeScript config للـ functions
│
├── artifacts/sos-website/        ← Frontend React
│   ├── src/
│   │   ├── pages/               ← الصفحات
│   │   ├── components/          ← المكونات
│   │   ├── locales/             ← ترجمة عربي/إنجليزي
│   │   │   ├── ar.json
│   │   │   └── en.json
│   │   └── lib/
│   │       ├── i18n.ts          ← إعداد react-i18next
│   │       └── auth.ts          ← إدارة الجلسة
│   └── package.json
│
├── vercel.json                   ← إعدادات Vercel (rewrites + installCommand)
├── package.json                  ← workspace root (pg, drizzle-orm, @types/node)
└── pnpm-lock.yaml
```

---

## ⚙️ إعدادات Vercel

| الإعداد | القيمة |
|---------|--------|
| Project ID | `prj_jCfRH3VCIVkqYN2Hyz84yHBI0U55` |
| Team ID | `team_GL3uT9XSFgWMNTJWdUvWZ5NB` |
| Domain | `server-owners-support.vercel.app` |
| rootDirectory | `null` (جذر الـ repo) |
| buildCommand | `PORT=3000 BASE_PATH=/ pnpm --filter @workspace/sos-website build` |
| outputDirectory | `artifacts/sos-website/dist/public` |
| installCommand | `pnpm install --no-frozen-lockfile` |

---

## 🔐 المتغيرات البيئية (على Vercel)

| المتغير | الوصف |
|---------|-------|
| `NEON_DATABASE_URL` | اتصال Neon PostgreSQL |
| `DISCORD_CLIENT_ID` | Discord App Client ID |
| `DISCORD_CLIENT_SECRET` | Discord App Secret |
| `DISCORD_REDIRECT_URI` | `https://server-owners-support.vercel.app/api/auth/callback` |
| `DISCORD_BOT_TOKEN` | توكن البوت |
| `DATABASE_URL` | (قديم - نفس NEON_DATABASE_URL) |

---

## 🔗 روابط مهمة

- **الموقع الحي:** https://server-owners-support.vercel.app
- **GitHub:** https://github.com/KIL23LER/server-owners-support
- **Vercel Dashboard:** https://vercel.com/kil23ler/server-owners-support

---

## 🚀 كيف تعمل Deploy على Vercel

### الطريقة الأسهل — عبر GitHub
أي `push` على branch الـ `main` يطلع deployment تلقائي على Vercel.

### إذا أردت تعمل Deploy يدوياً (عبر Vercel Dashboard)
1. افتح https://vercel.com/kil23ler/server-owners-support
2. اضغط **"Redeploy"** على آخر deployment
3. اختر **"Redeploy without cache"** إذا في مشاكل

### إذا أردت تعمل Deploy عبر Vercel CLI
```bash
npm i -g vercel
vercel --prod --token=YOUR_VERCEL_TOKEN
```

### إذا انكسر الـ deployment وأردت ترجع لنسخة قديمة
1. افتح https://vercel.com/kil23ler/server-owners-support/deployments
2. اختر أي deployment قديم يعمل
3. اضغط **"Promote to Production"**

---

## 🛠️ تطوير محلي

```bash
# تثبيت الحزم
pnpm install

# تشغيل الـ frontend
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/sos-website dev

# بناء للإنتاج
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/sos-website build
```

---

## 📝 ملاحظات مهمة

- **Vercel Hobby Plan:** يسمح 12 serverless function كحد أقصى. الـ API functions مدمجة لتبقى ضمن الحد.
- **قاعدة البيانات:** Neon PostgreSQL — Schema موجود في `api/_lib/db.ts`.
- **الترجمة:** النظام يحفظ اللغة في `localStorage` تحت اسم `sos-lang`.
- **المصادقة:** جلسات مشفرة في cookies باستخدام JWT.
