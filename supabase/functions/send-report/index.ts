import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, extractContent } from "../_shared/ai-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const userEmail = user.email;
    if (!userEmail) throw new Error("User email not found");

    const [healthRes, financeRes, goalsRes] = await Promise.all([
      supabase.from("health_logs").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(30),
      supabase.from("finance_transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(50),
      supabase.from("learning_goals").select("*").eq("user_id", user.id),
    ]);

    const healthLogs = healthRes.data || [];
    const transactions = financeRes.data || [];
    const goals = goalsRes.data || [];

    console.log(`[SendReport] Fetched: ${healthLogs.length} health logs, ${transactions.length} transactions, ${goals.length} goals`);

    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    const topCategories: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => { topCategories[t.category] = (topCategories[t.category] || 0) + t.amount; });
    const sortedCategories = Object.entries(topCategories).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const completedGoals = goals.filter(g => g.status === "completed").length;
    const avgProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length) : 0;

    const healthTypes: Record<string, number[]> = {};
    healthLogs.forEach(log => { const val = (log.data as any)?.value; if (val !== undefined) { if (!healthTypes[log.log_type]) healthTypes[log.log_type] = []; healthTypes[log.log_type].push(val); } });
    const avgHealth: Record<string, number> = {};
    Object.entries(healthTypes).forEach(([type, values]) => { avgHealth[type] = Math.round(values.reduce((s, v) => s + v, 0) / values.length * 10) / 10; });

    const context = `
User: ${userEmail}
Report Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

FINANCE SUMMARY:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net Balance: $${balance.toFixed(2)}
- Top Expense Categories: ${sortedCategories.map(([c, a]) => `${c}: $${a.toFixed(2)}`).join(", ") || "None"}
- Total Transactions: ${transactions.length}

HEALTH SUMMARY (Last 30 days, ${healthLogs.length} logs):
${Object.entries(avgHealth).map(([type, avg]) => `- Average ${type}: ${avg}`).join("\n") || "- No health data logged"}

LEARNING GOALS:
- Total Goals: ${goals.length}
- Completed: ${completedGoals}
- In Progress: ${goals.filter(g => g.status === "active").length}
- Average Progress: ${avgProgress}%
${goals.slice(0, 5).map(g => `- ${g.title}: ${g.progress || 0}%`).join("\n")}
`;

    const result = await callAI({
      messages: [
        { role: "system", content: "You are a personal AI assistant generating a comprehensive wellness and productivity report. Be encouraging, insightful, and provide actionable recommendations. Format using clear sections with emojis." },
        { role: "user", content: `Generate a comprehensive weekly analysis report based on this data:\n\n${context}\n\nInclude: 1) Executive Summary 2) Financial Health Analysis with specific tips 3) Health & Wellness insights 4) Learning Progress review 5) Top 3 Actionable Recommendations for the coming week.` },
      ],
    });

    console.log(`[SendReport] AI Provider: ${result.provider}`);

    if (result.error) throw new Error(result.error);
    const aiAnalysis = extractContent(result.data) || "Analysis unavailable.";

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured.");

    const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0f;color:#e2e8f0;margin:0;padding:0}.container{max-width:640px;margin:0 auto;padding:32px 24px}.header{text-align:center;margin-bottom:32px;padding:32px;background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:16px}.header h1{margin:0 0 8px;font-size:28px;background:linear-gradient(to right,#a78bfa,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.header p{margin:0;color:#94a3b8;font-size:14px}.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:32px}.stat-card{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:16px;text-align:center}.stat-card .label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}.stat-card .value{font-size:22px;font-weight:700}.green{color:#4ade80}.red{color:#f87171}.blue{color:#60a5fa}.purple{color:#a78bfa}.analysis{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;white-space:pre-wrap;line-height:1.7;font-size:14px;color:#cbd5e1}.footer{text-align:center;margin-top:32px;color:#475569;font-size:12px}</style></head><body><div class="container"><div class="header"><h1>🤖 Your AI Analysis Report</h1><p>${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div><div class="stats-grid"><div class="stat-card"><div class="label">Balance</div><div class="value ${balance >= 0 ? "green" : "red"}">$${Math.abs(balance).toFixed(0)}</div></div><div class="stat-card"><div class="label">Goals</div><div class="value purple">${avgProgress}%</div></div><div class="stat-card"><div class="label">Health Logs</div><div class="value blue">${healthLogs.length}</div></div></div><div class="analysis">${aiAnalysis}</div><div class="footer"><p>Sent by your AI Assistant</p></div></div></body></html>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [userEmail],
        subject: `📊 Your AI Analysis Report - ${new Date().toLocaleDateString()}`,
        html: emailHtml
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      throw new Error(`Email sending failed: ${emailRes.status} - ${errText}. Make sure your Resend API key is valid and you are sending to a verified email (for free tier).`);
    }

    return new Response(JSON.stringify({ success: true, message: `Report sent to ${userEmail}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error in send-report:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to send report" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
