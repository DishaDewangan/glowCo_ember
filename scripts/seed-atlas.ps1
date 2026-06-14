# Run after Atlas IP whitelist is fixed
Set-Location $PSScriptRoot\server
npm run seed
Write-Host "Done! Check Atlas -> Browse Collections for customers, orders, products."
