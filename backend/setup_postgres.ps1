# ============================================================
#  NIS AI School — Portable PostgreSQL Setup Script
#  Administrator huquqi talab etilmaydi
# ============================================================

$ErrorActionPreference = "Stop"
$ProgressPreference    = "SilentlyContinue"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  NIS AI School — PostgreSQL Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ─── Paths ───────────────────────────────────────────────────
$PG_ZIP      = "C:\Users\Islomjon\Downloads\pgsql-portable.zip"
$PG_DIR      = "C:\Users\Islomjon\pgsql"          # Portable postgres home
$PG_DATA     = "$PG_DIR\data"
$PG_BIN      = "$PG_DIR\bin"
$PGPORT      = 5432
$DB_NAME     = "nisaimaktabi"
$DB_USER     = "nisaimaktabi"
$DB_PASS     = "nisaimaktabi"
$BACKEND_DIR = $PSScriptRoot                        # NIS\backend folder

# ─── 1. ZIP ni tekshirish ─────────────────────────────────────
if (-not (Test-Path $PG_ZIP)) {
    Write-Host "❌ Fayl topilmadi: $PG_ZIP" -ForegroundColor Red
    Write-Host "   Avval yuklab oling:" -ForegroundColor Yellow
    Write-Host "   https://get.enterprisedb.com/postgresql/postgresql-16.3-1-windows-x64-binaries.zip" -ForegroundColor Yellow
    exit 1
}

# ─── 2. ZIP ni ochish ────────────────────────────────────────
if (-not (Test-Path "$PG_BIN\postgres.exe")) {
    Write-Host "📦 PostgreSQL portable ochilmoqda..." -ForegroundColor Yellow
    if (Test-Path $PG_DIR) { Remove-Item $PG_DIR -Recurse -Force }
    Expand-Archive -Path $PG_ZIP -DestinationPath "C:\Users\Islomjon\" -Force
    # ZIP ichida "pgsql" papkasi bor
    if (-not (Test-Path "$PG_BIN\postgres.exe")) {
        Write-Host "❌ postgres.exe topilmadi: $PG_BIN" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ PostgreSQL portable ochildi: $PG_DIR" -ForegroundColor Green
} else {
    Write-Host "✅ PostgreSQL portable allaqachon mavjud" -ForegroundColor Green
}

$psql    = "$PG_BIN\psql.exe"
$initdb  = "$PG_BIN\initdb.exe"
$pg_ctl  = "$PG_BIN\pg_ctl.exe"

# ─── 3. Data cluster yaratish ────────────────────────────────
if (-not (Test-Path "$PG_DATA\PG_VERSION")) {
    Write-Host ""
    Write-Host "🔧 PostgreSQL data cluster yaratilmoqda..." -ForegroundColor Yellow
    & $initdb -D $PG_DATA -U postgres -A trust --encoding=UTF8 --locale=C 2>&1
    Write-Host "✅ Cluster yaratildi" -ForegroundColor Green
} else {
    Write-Host "✅ Data cluster allaqachon mavjud" -ForegroundColor Green
}

# ─── 4. PostgreSQL serverni ishga tushirish ───────────────────
Write-Host ""
Write-Host "🔧 PostgreSQL server ishga tushirilmoqda..." -ForegroundColor Yellow

# Avval to'xtatamiz (agar ishlayotgan bo'lsa)
& $pg_ctl -D $PG_DATA stop -s 2>$null
Start-Sleep -Seconds 2

# Ishga tushiramiz
$logFile = "$PG_DIR\pg.log"
& $pg_ctl -D $PG_DATA -l $logFile start 2>&1
Start-Sleep -Seconds 4

# Ishga tushganini tekshirish
$pgRunning = & $pg_ctl -D $PG_DATA status 2>&1
if ($pgRunning -match "server is running") {
    Write-Host "✅ PostgreSQL server ishlamoqda (port $PGPORT)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Server holati: $pgRunning" -ForegroundColor Yellow
    Write-Host "   Log: $logFile" -ForegroundColor Gray
}

# ─── 5. User yaratish ─────────────────────────────────────────
Write-Host ""
Write-Host "🔧 '$DB_USER' foydalanuvchisi yaratilmoqda..." -ForegroundColor Yellow
$createUserSQL = "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='$DB_USER') THEN CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS' CREATEDB; END IF; END `$`$;"
& $psql -U postgres -h localhost -p $PGPORT -c $createUserSQL 2>&1
Write-Host "✅ User '$DB_USER' tayyor" -ForegroundColor Green

# ─── 6. Database yaratish ─────────────────────────────────────
Write-Host ""
Write-Host "🔧 '$DB_NAME' database yaratilmoqda..." -ForegroundColor Yellow
$dbExists = & $psql -U postgres -h localhost -p $PGPORT -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>&1
if ($dbExists -ne "1") {
    & $psql -U postgres -h localhost -p $PGPORT -c "CREATE DATABASE $DB_NAME OWNER $DB_USER ENCODING 'UTF8';" 2>&1
    Write-Host "✅ Database '$DB_NAME' yaratildi" -ForegroundColor Green
} else {
    Write-Host "✅ Database '$DB_NAME' allaqachon mavjud" -ForegroundColor Green
}

# ─── 7. Permissions ───────────────────────────────────────────
& $psql -U postgres -h localhost -p $PGPORT -d $DB_NAME -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER; GRANT ALL ON SCHEMA public TO $DB_USER;" 2>&1
Write-Host "✅ Permissions berildi" -ForegroundColor Green

# ─── 8. DATABASE_URL ni .env ga yozish ────────────────────────
Write-Host ""
Write-Host "🔧 .env faylini tekshirilmoqda..." -ForegroundColor Yellow
$envFile = "$BACKEND_DIR\.env"
$dbUrl   = "postgresql://${DB_USER}:${DB_PASS}@localhost:${PGPORT}/${DB_NAME}?schema=public"
$envContent = Get-Content $envFile -Raw
if ($envContent -notmatch [regex]::Escape($dbUrl)) {
    $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$dbUrl`""
    Set-Content -Path $envFile -Value $envContent -Encoding UTF8 -NoNewline
    Write-Host "✅ .env yangilandi: DATABASE_URL=$dbUrl" -ForegroundColor Green
} else {
    Write-Host "✅ .env allaqachon to'g'ri" -ForegroundColor Green
}

# ─── 9. Prisma Generate ───────────────────────────────────────
Write-Host ""
Write-Host "🔧 Prisma client generatsiya qilinmoqda..." -ForegroundColor Yellow
$env:DATABASE_URL = $dbUrl
Set-Location $BACKEND_DIR
npx prisma generate 2>&1
Write-Host "✅ Prisma client tayyor" -ForegroundColor Green

# ─── 10. Prisma DB Push (jadvallar yaratish) ──────────────────
Write-Host ""
Write-Host "🔧 Database jadvallar yaratilmoqda (prisma db push)..." -ForegroundColor Yellow
npx prisma db push --skip-generate 2>&1
Write-Host "✅ Jadvallar yaratildi" -ForegroundColor Green

# ─── 11. Full Migration Seed ──────────────────────────────────
Write-Host ""
Write-Host "🌱 Ma'lumotlar PostgreSQL ga ko'chirilmoqda..." -ForegroundColor Yellow
node prisma/migrate_seed.js 2>&1
Write-Host "✅ Migration seed muvaffaqiyatli" -ForegroundColor Green

# ─── FINISH ───────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ✅ BARCHA SOZLAMALAR TUGALLANDI!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  📡 DATABASE_URL: $dbUrl" -ForegroundColor Cyan
Write-Host "  👤 Admin:        admin@nis-ai.edu.uz" -ForegroundColor Cyan
Write-Host "  🔑 Admin parol:  NisAdmin2026!" -ForegroundColor Cyan
Write-Host ""
Write-Host "  PostgreSQL to'xtatish:  & '$pg_ctl' -D '$PG_DATA' stop" -ForegroundColor Gray
Write-Host "  PostgreSQL ishga tush:  & '$pg_ctl' -D '$PG_DATA' start" -ForegroundColor Gray
Write-Host ""
Write-Host "  Backendni qayta ishga tushiring: npm run dev" -ForegroundColor Yellow
Write-Host ""
