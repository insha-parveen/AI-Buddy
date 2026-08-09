# PowerShell script to deploy all Supabase Edge Functions and set essential secrets.
# Usage: run this after installing Supabase CLI and authenticing with `supabase login`.
# Make sure you have linked your project with `supabase link --project-ref bmetwadxcoehqlfsvpbqr`.

# Set environment variables or replace with actual keys
$GROQ_API_KEY = Read-Host "Enter GROQ_API_KEY (or leave blank)"
$GEMINI_API_KEY = Read-Host "Enter GEMINI_API_KEY (or leave blank)"
$RESEND_API_KEY = Read-Host "Enter RESEND_API_KEY (optional)"

if ($GROQ_API_KEY) { supabase secrets set GROQ_API_KEY=$GROQ_API_KEY }
if ($GEMINI_API_KEY) { supabase secrets set GEMINI_API_KEY=$GEMINI_API_KEY }
if ($RESEND_API_KEY) { supabase secrets set RESEND_API_KEY=$RESEND_API_KEY }

# Deploy functions
$functions = @(
    'chat-ai',
    'document-summarize',
    'finance-advice',
    'health-insights',
    'learning-assistant',
    'send-report'
)

foreach ($fn in $functions) {
    Write-Host "Deploying function: $fn"
    supabase functions deploy $fn
}

Write-Host "All functions deployed!"
