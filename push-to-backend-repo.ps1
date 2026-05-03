# Push to Backend Repository
# Run this script to push code to https://github.com/k230861-design/chargepilot.git

Write-Host "Pushing to backend repository..." -ForegroundColor Green

# Add remote if not exists
git remote remove backend 2>$null
git remote add backend https://github.com/k230861-design/chargepilot.git

# Push to backend repo
git push backend main --force

Write-Host "Done! Code pushed to https://github.com/k230861-design/chargepilot" -ForegroundColor Green
