# Ember deployment helper — run each section after previous completes

Write-Host "`n=== 1. Push to GitHub ===" -ForegroundColor Cyan
Write-Host "Create repo at https://github.com/new then run:"
Write-Host '  git remote add origin https://github.com/YOUR_USERNAME/glowco-ember.git'
Write-Host '  git push -u origin main'

Write-Host "`n=== 2. Railway CRM ===" -ForegroundColor Cyan
Write-Host "https://railway.app -> New Project -> GitHub -> Root: server"
Write-Host "Variables: MONGODB_URI, ANTHROPIC_API_KEY, DEMO_MODE=true, NODE_TLS_REJECT_UNAUTHORIZED=0"
Write-Host "Generate domain -> set CRM_CALLBACK_URL to that URL"

Write-Host "`n=== 3. Railway Stub ===" -ForegroundColor Cyan
Write-Host "Same project -> + New Service -> Root: stub"
Write-Host "CRM_CALLBACK_URL = CRM Railway URL"
Write-Host "Update CRM STUB_SERVICE_URL = Stub Railway URL"

Write-Host "`n=== 4. Vercel Frontend ===" -ForegroundColor Cyan
Write-Host "https://vercel.com -> Import repo -> Root: client"
Write-Host "VITE_API_URL = CRM Railway URL"
Write-Host "Update CRM CLIENT_URL = Vercel URL"

Write-Host "`n=== 5. Seed Atlas (after IP whitelist) ===" -ForegroundColor Cyan
Write-Host "  .\scripts\seed-atlas.ps1"

Write-Host ""
