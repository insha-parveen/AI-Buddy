# Supabase Personal Setup Guide

## 1. Secrets / Environment Variables

Add these in **Supabase Dashboard → Settings → Edge Functions → Secrets**:

| Secret Name | Where to Get It |
|---|---|
| `GROQ_API_KEY` | https://console.groq.com/keys |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey |

> **Note:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are auto-provided in Edge Functions.

---

## 2. Storage Buckets

```sql
-- Create the image storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-images', 'generated-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Auth users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generated-images' AND auth.uid() IS NOT NULL);

-- Allow public read
CREATE POLICY "Public can view generated images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 3. Database Tables

Run all SQL below in **Supabase Dashboard → SQL Editor**.

### 3a. Profiles

```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme": "dark", "language": "en"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
```

### 3b. Auto-create profile on signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3c. Updated-at trigger

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

### 3d. Chat

```sql
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.chat_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages from own conversations" ON public.chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_conversations WHERE id = chat_messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert messages to own conversations" ON public.chat_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM chat_conversations WHERE id = chat_messages.conversation_id AND user_id = auth.uid()));
```

### 3e. Documents

```sql
CREATE TABLE public.user_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  mind_map JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own documents" ON public.user_documents FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_documents_updated_at
  BEFORE UPDATE ON public.user_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 3f. Finance

```sql
CREATE TABLE public.finance_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions" ON public.finance_transactions FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE public.finance_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  budget_limit NUMERIC NOT NULL,
  color TEXT NOT NULL DEFAULT '#BB8FCE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own budgets" ON public.finance_budgets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 3g. Learning

```sql
CREATE TABLE public.flashcard_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own flashcard decks" ON public.flashcard_decks FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.learning_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own learning notes" ON public.learning_notes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.learning_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own learning goals" ON public.learning_goals FOR ALL
  USING (auth.uid() = user_id);
```

### 3h. Productivity

```sql
CREATE TABLE public.productivity_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo',
  category TEXT NOT NULL DEFAULT 'Work',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.productivity_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tasks" ON public.productivity_tasks FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.productivity_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  datetime TIMESTAMPTZ NOT NULL,
  recurring TEXT NOT NULL DEFAULT 'none',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.productivity_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reminders" ON public.productivity_reminders FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.productivity_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  progress NUMERIC NOT NULL DEFAULT 0,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_milestones INTEGER NOT NULL DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.productivity_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own productivity goals" ON public.productivity_goals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 3i. Health

```sql
CREATE TABLE public.health_habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'heart',
  color TEXT NOT NULL DEFAULT '#22c55e',
  streak INTEGER NOT NULL DEFAULT 0,
  completed_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own habits" ON public.health_habits FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_type TEXT NOT NULL,
  data JSONB NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own health logs" ON public.health_logs FOR ALL
  USING (auth.uid() = user_id);
```

---

## 4. Edge Functions to Deploy

Deploy each function with `supabase functions deploy <name>`:

| Function | Purpose | Required Secrets |
|---|---|---|
| `chat-ai` | AI chat responses | `GROQ_API_KEY` or `GEMINI_API_KEY` |
| `document-summarize` | Doc summary, Q&A, mind maps | `GROQ_API_KEY` or `GEMINI_API_KEY` |
| `finance-advice` | Financial AI advice | `GROQ_API_KEY` or `GEMINI_API_KEY` |
| `health-insights` | Health AI insights | `GROQ_API_KEY` or `GEMINI_API_KEY` |
| `learning-assistant` | Flashcards, notes, quizzes | `GROQ_API_KEY` or `GEMINI_API_KEY` |
| `send-report` | Email reports | `RESEND_API_KEY` |

### Shared AI Client

All AI functions use `supabase/functions/_shared/ai-client.ts` which tries providers in priority (Groq or Gemini, or your chosen gateway). You need at least one of `GROQ_API_KEY` or `GEMINI_API_KEY` set.

### config.toml

```toml
project_id = "YOUR_PROJECT_ID"

[functions.chat-ai]
verify_jwt = false

[functions.document-summarize]
verify_jwt = false

[functions.finance-advice]
verify_jwt = false

[functions.health-insights]
verify_jwt = false

[functions.learning-assistant]
verify_jwt = false

[functions.send-report]
verify_jwt = false
```

---

## 5. Frontend Environment (.env)

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
```

---

## 6. Auth Settings

- **Email auth:** Enabled (default)
- **Auto-confirm:** Disabled (users verify email)
- **Site URL:** Your deployed frontend URL

---

## 7. Important Notes

- The `GROQ_API_KEY` and `GEMINI_API_KEY` are independent — either one alone is sufficient for all AI features.
- All tables use RLS with `auth.uid() = user_id` — users can only see their own data.
- The `profiles` table is auto-populated on signup via the `handle_new_user` trigger.
