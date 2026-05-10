# 🤖 AI-Buddy

> Your all-in-one AI-powered personal assistant — chat, create, learn, track, and grow.

![Version](https://img.shields.io/badge/version-0.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-2.76-3ECF8E?logo=supabase)

---

## ✨ Features

### 💬 Normal Chatbot
A general-purpose AI chat assistant for everyday queries and conversations.

### 🎨 Image Generation
Generate stunning images using AI — powered by Pollinations API.

### 📄 Document Summarization + Q&A Assistant
Upload documents, get instant summaries, and ask questions about the content. Powered by Groq + Gemini.

### 🧠 Neural Maps (Mind Mapping)
Visualize your ideas and concepts in interactive mind maps — just like NotebookLM.

### ✅ Productivity Tracker
Track your tasks, goals, and habits. Stay on top of your day with an AI assistant that knows your workflow.

### 🏥 Health Tracker + Personalized Assistant
Log your health data (sleep, water, exercise, meals, etc.). The AI analyzes your historical logs and gives you **personalized health advice** based on your actual patterns.

### 💰 Finance Tracker + Finance Assistant
Track your spending across categories. The AI analyzes where your money goes and **suggests actionable ways to save more** — based on your real financial data.

### 📚 Learning Module
- **Flashcard Generation** — auto-generate flashcards from any topic or document
- **Learning Assistant** — AI tutor to help you understand concepts
- **Mind Mapping** — visual learning the smart way
- **Notes Section** — add your own notes or let AI generate them for you

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite (SWC) |
| **Styling** | Tailwind CSS |
| **UI Components** | Shadcn/UI (Radix UI) |
| **Animations** | Framer Motion, Lottie React |
| **Routing** | React Router DOM v6 |
| **State Management** | TanStack React Query |
| **Forms & Validation** | React Hook Form + Zod |
| **Backend / Database** | Supabase (Auth, DB, Storage) |
| **AI / LLM** | Groq, Gemini, HuggingFace |
| **Image Generation** | Pollinations AI |
| **Charts** | Recharts |
| **PDF Export** | jsPDF |
| **Email** | Resend |
| **Auth** | Supabase Auth + Google OAuth |
| **Icons** | Lucide React, React Icons |
| **Notifications** | Sonner |
| **Theme** | next-themes (Dark/Light mode) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>=18.x`
- npm or yarn
- A Supabase project
- API keys (see below)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/insha-parveen/AI-Buddy.git

# 2. Navigate into the project
cd AI-Buddy

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env
# Fill in your keys in .env

# 5. Start the development server
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the root of the project and add the following:

```env
# Supabase
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_URL=your_supabase_project_url

# AI / LLM APIs
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Image Generation
POLLINATION_API_KEY=your_pollination_api_key
VITE_POLLINATION_API_KEY=your_pollination_api_key

# Authentication
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Email
RESEND_API_KEY=your_resend_api_key
```

> ⚠️ **Never commit your `.env` file to version control. It's already in `.gitignore`.**

### Where to get these keys?

| Key | Link |
|---|---|
| Supabase | [supabase.com](https://supabase.com) → Create Project |
| Groq | [console.groq.com](https://console.groq.com) |
| Gemini | [aistudio.google.com](https://aistudio.google.com) |
| HuggingFace | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| Pollinations | [pollinations.ai](https://pollinations.ai) |
| Google OAuth | [console.cloud.google.com](https://console.cloud.google.com) |
| Resend | [resend.com](https://resend.com) |

---

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 🌐 Deployment

This project can be deployed on **Vercel**, **Netlify**, or any static hosting provider.

```bash
# Build for production
npm run build

# The output will be in the /dist folder
```

> Make sure to add all your environment variables in your hosting provider's dashboard too!

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is private and not open source yet.

---

<div align="center">
  <b>Built with ❤️ Insha</b>
</div>