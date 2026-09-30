# 🚀 LinkedIn Recruiter Outreach System & CRM

A standalone, privacy-focused, AI-powered LinkedIn outreach assistant and recruitment pipeline CRM designed for job seekers and software engineers.

---

## 💡 Architecture & Philosophy

Rather than risking LinkedIn account restrictions with DOM scraping or brittle automated sending extensions, this system follows a **Safe & High-Converting Semi-Automated Workflow**:

```
1. User Manually Inputs Recruiter & Target Job Context
                ↓
2. AI Personalization Engine (Candidate Resume + Recruiter Context)
                ↓
3. Multi-Touch Sequence Generation (Connection Note <=200 chars for Free Accounts, Follow-ups, InMail)
                ↓
4. User Reviews, Customizes & Copies with 1-Click
                ↓
5. User Manually Pastes & Sends on LinkedIn (100% Account Safe)
                ↓
6. Interactive Kanban CRM Tracks Pipeline Lifecycle
```

---

## 🌟 Key Features

### 1. ✨ Outreach Studio (Multi-Touch Sequence Generator)
- **LinkedIn Free (200 Chars) & Premium (300 Chars) Support**:
  - **Touchpoint 1 (Connection Note)**: Defaults to strict **<= 200 character limit** tailored specifically for **LinkedIn Free/Standard accounts** (with toggle for 300 chars on Premium).
  - **✂️ Auto-Fit 200 Limit**: 1-click button to automatically compress and condense any longer message to fit safely under 200 characters without losing core impact.
  - **Touchpoint 2 (Follow-Up 1)**: Sent 2-3 days post-acceptance with concrete project demos / value drops.
  - **Touchpoint 3 (Follow-Up 2)**: Sent 5-7 days later as a low-pressure engineering inquiry.
  - **Touchpoint 4 (InMail / Full Pitch)**: Comprehensive pitch with bulleted metric-driven achievements.
- **Dynamic Outreach Tones**:
  - `💎 Value-First`: Leads with a relevant solution or architecture project.
  - `📈 Metric-Driven`: Highlights quantifiable engineering KPIs (e.g., 42% latency reduction).
  - `🤝 Conversational`: Warm peer-to-peer tone.
  - `🚀 Mission & Craft`: Resonates with company culture and engineering excellence.
- **Quick Fill Presets**: Instant 1-click test configurations (Stripe, Datadog, Vercel).

### 2. 📋 Interactive Kanban Pipeline CRM
- Visual drag-and-drop board across 7 lifecycle stages:
  - `Discovered` ➔ `Connection Sent` ➔ `Connected` ➔ `Follow-Up 1` ➔ `Follow-Up 2` ➔ `Interviewing` ➔ `Offer / Closed`
- Quick action buttons on cards:
  - `📋 1-Click Copy`: Copies the exact message needed for the current stage.
  - `➔ Quick Advance`: Moves candidate lead to the next pipeline stage.
  - `👁️ View Details`: Opens lead modal with notes and full sequence history.

### 3. 👥 Recruiter Directory (Leads Table)
- Search across recruiter names, companies, and target roles.
- Filter by pipeline stage and priority (`High`, `Medium`, `Normal`).
- Export leads to **CSV** or full **JSON backup**.

### 4. 📊 Analytics & Funnel Metrics
- Live metric cards: Total Sourced, Requests Sent, Connection Rate %, Active Interviews.
- Visual Conversion Funnel tracking drop-off across all outreach stages.

### 5. ⚙️ Candidate Profile & AI Engine Settings
- Custom candidate profile builder (Headline, Experience, Core Skills tags, Top 3 Achievements, Portfolio URL).
- Choice of AI provider:
  - **Built-in Smart Heuristic Engine**: Zero API key required, fast, offline, and guaranteed under 200 characters.
  - **Google Gemini API**: Direct LLM streaming generation via Gemini 1.5 Flash.
  - **OpenAI API**: Direct GPT-4o Mini JSON completion.

---

## 🚀 How to Run

1. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Brave, Safari).
2. Or serve it locally using any static web server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```

---

## 🔒 Privacy & Safety
- All leads, notes, and API keys are stored locally in browser `localStorage`.
- Zero external tracking or unauthorized third-party communication.
- 100% compliant with LinkedIn's terms of service.
