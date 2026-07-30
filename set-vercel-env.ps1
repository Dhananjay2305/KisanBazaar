$url     = "https://addnaontkrvwgcotzjyy.supabase.co"
$anon    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG5hb250a3J2d2djb3R6anl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTE5MzIsImV4cCI6MjA5NDIyNzkzMn0.RT6jDg8Nxwa3ozZ93yDmApd_np3nCIUJTMNcjFNbpQc"
$service = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG5hb250a3J2d2djb3R6anl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1MTkzMiwiZXhwIjoyMDk0MjI3OTMyfQ.IvLBTl3qTR8BqCVVtO_-4NkjqfNLYQQ2VBA7h6pYKcg"

$envs = @("production", "preview", "development")

foreach ($env in $envs) {
    Write-Host "--- Setting vars for: $env ---"

    npx.cmd vercel env add VITE_SUPABASE_URL $env --value $url --yes --force 2>&1
    npx.cmd vercel env add VITE_SUPABASE_ANON_KEY $env --value $anon --yes --force 2>&1
    npx.cmd vercel env add SUPABASE_SERVICE_ROLE_KEY $env --value $service --yes --force 2>&1
    # Also set plain SUPABASE_URL for the backend/serverless function
    npx.cmd vercel env add SUPABASE_URL $env --value $url --yes --force 2>&1

    Write-Host "Done: $env"
}

Write-Host ""
Write-Host "All env vars set! Now redeploying..."
npx.cmd vercel --prod --yes 2>&1
