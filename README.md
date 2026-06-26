# FarmGenius AI

> **Built for FUTMINNA Build With AI x Hackday 2026**
> An intelligent agricultural assistant platform powered by the Gemini API, designed specifically for Nigerian smallholder farmers.

## Live Demo

**[https://shree-aru.github.io/farmgenius-ai](https://shree-aru.github.io/farmgenius-ai)**

> Also available at: [https://sfcu3h7pl6kh4.kimi.page](https://sfcu3h7pl6kh4.kimi.page)

## The Problem

Nigeria has over 38 million smallholder farmers who face critical challenges:
- **30-40% crop losses** annually due to preventable diseases and poor planning
- **No access to expert agronomic advice** — extension officers are scarce and underfunded
- **Exploitation by middlemen** due to lack of real-time market pricing information
- **Low digital literacy** limiting access to modern farming techniques

## Our Solution

FarmGenius AI is a multimodal AI-powered agricultural intelligence platform that brings expert farming knowledge directly to every farmer's fingertips. Using the Gemini API's vision, text, and voice capabilities, we provide:

### Core Features

| Feature | Technology | What It Does |
|---------|-----------|--------------|
| **AI Crop Doctor** | Gemini Vision API | Farmers snap a photo of their crop → AI diagnoses diseases (Cassava Mosaic, Maize Streak, Blight, etc.) and prescribes treatment |
| **Smart Farming Plans** | Gemini Text API | Personalized crop calendars, planting schedules, and soil recommendations based on crop type, location, and season |
| **Market Intelligence** | Gemini Text API | Real-time crop prices, demand forecasting, and "best time to sell" recommendations for Nigerian markets |
| **Voice Assistant** | Web Speech API | Hands-free interaction for low-literacy farmers — speak in English or Hausa |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS v3 |
| **UI Components** | shadcn/ui (40+ components) |
| **Animations** | GSAP + ScrollTrigger + Three.js WebGL shaders |
| **Smooth Scroll** | Lenis |
| **AI Engine** | Google Gemini 1.5 Flash (multimodal: vision + text) |
| **Icons** | Lucide React |
| **Fonts** | Space Grotesk + Inter + JetBrains Mono |

## Gemini API Integration

Our Gemini API integration spans three modules:

### 1. Crop Disease Diagnosis (`src/lib/gemini.ts`)
- **Input**: Base64-encoded crop image
- **Prompt**: Structured prompt optimized for Nigerian/West African crop diseases
- **Output**: JSON with disease name, confidence, severity, description, treatment steps, prevention
- **Model**: `gemini-1.5-flash`

### 2. Farming Plan Generation (`src/lib/gemini-farming.ts`)
- **Input**: Crop type, farm size, location (Nigerian state), soil type, season
- **Output**: Personalized weekly timeline, NPK recommendations, weather advisories
- **Fallback**: Rich demo data for 8 crops across 4 soil types

### 3. Market Intelligence (`src/lib/gemini-market.ts`)
- **Input**: Crop name, market location
- **Output**: AI-generated demand forecast, price trend analysis, trade recommendations
- **Data**: Realistic Nigerian market prices in Naira

## Project Structure

```
FarmGenius AI/
├── public/
│   ├── img-nigerian-farm-1.jpg    # Hero background
│   ├── img-crop-scan.jpg          # Crop disease example
│   └── img-market-ui.png          # Market dashboard preview
├── src/
│   ├── components/
│   │   ├── Navbar.tsx              # Sticky nav with mobile menu
│   │   ├── Footer.tsx              # Multi-column footer
│   │   ├── Layout.tsx              # Lenis smooth scroll wrapper
│   │   ├── DataGradientField.tsx   # Three.js hero background
│   │   ├── DataParticles.tsx       # Canvas particle system
│   │   └── NeonBiomassPulse.tsx    # AI engine visualization
│   ├── pages/
│   │   ├── Home.tsx                # Landing page (5 sections)
│   │   ├── CropDoctor.tsx          # Photo diagnosis engine
│   │   ├── FarmingPlans.tsx        # Interactive crop planner
│   │   ├── MarketIntelligence.tsx  # Real-time market dashboard
│   │   └── About.tsx               # Mission & impact page
│   ├── lib/
│   │   ├── gemini.ts               # Crop diagnosis API
│   │   ├── gemini-farming.ts       # Farming plan API
│   │   └── gemini-market.ts        # Market intelligence API
│   ├── App.tsx                     # React Router setup
│   └── main.tsx                    # Entry point
├── design/                          # Design documents
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Getting Started

### Prerequisites
- Node.js 20+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/shree-aru/farmgenius-ai.git
cd farmgenius-ai

# Install dependencies
npm install

# Create environment file
echo "VITE_GEMINI_API_KEY=your_gemini_api_key_here" > .env

# Start development server
npm run dev

# Build for production
npm run build
```

### Setting Up Your Gemini API Key

1. Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a `.env` file in the project root
3. Add: `VITE_GEMINI_API_KEY=your_api_key_here`
4. Restart the dev server

## Design Philosophy

- **Dark premium aesthetic** — Inspired by high-end data visualization platforms
- **Earth-tone neon accents** — Sage green (`#8BAF9A`), neon lime (`#B8FF2C`), cyber amber (`#FF9900`)
- **Zero emojis** — Professional Lucide icons throughout
- **Mobile-first** — Designed for farmers using smartphones in rural areas
- **GSAP-powered animations** — Smooth, purposeful motion that enhances UX
- **Three.js WebGL effects** — Immersive data-gradient backgrounds

## Team & Acknowledgment

Built for the **FUTMINNA Build With AI Hackathon 2026**

---

*Empowering Nigerian farmers with AI-driven agricultural intelligence.*
