# FarmGenius AI — Hackathon Submission

**Event:** Build With AI x Hackday FUTMINNA 2026

---

## 1. Project Title & Description

### Title
**FarmGenius AI** — Intelligent Agricultural Assistant for Nigerian Farmers

### What Problem We're Solving

Nigeria is home to over 38 million smallholder farmers who produce the majority of the country's food. Yet they face devastating challenges:

- **30-40% of crops are lost annually** to preventable diseases, pests, and poor planning — simply because farmers lack access to expert agronomic advice.
- **Extension officer ratio is 1:3,000 farmers**, making personalized guidance practically impossible.
- **Exploitation by middlemen** is rampant because farmers have no access to real-time market pricing — they sell blind.
- **Low digital literacy** means traditional app-based solutions fail; farmers need intuitive, multimodal interfaces (voice + vision + text).

### What FarmGenius AI Does

FarmGenius AI is a multimodal AI-powered agricultural intelligence platform that democratizes access to expert farming knowledge. Using Google's Gemini API across vision, text, and voice modalities, the platform provides:

1. **AI Crop Doctor** — Farmers snap a photo of a diseased crop. Gemini's vision model analyzes the image and diagnoses the disease (Cassava Mosaic, Maize Streak, Tomato Blight, Yam Rot, Rice Blast, etc.), provides confidence scores, and prescribes step-by-step treatment plans.

2. **Smart Farming Plans** — An interactive planner that generates personalized crop calendars. Farmers input their crop type, farm size, location (Nigerian state), soil type, and season. Gemini produces a week-by-week timeline of activities — planting, fertilizing, weeding, pest control, harvesting — with NPK recommendations and weather advisories.

3. **Market Intelligence** — Real-time crop price tracking across Nigerian markets with AI-powered demand forecasting. Farmers get "best time to sell" recommendations, export opportunity alerts, and price volatility warnings — all in Naira.

4. **Voice Assistant** — A speech-enabled interface allowing farmers to ask questions hands-free in English (Hausa support planned), making the platform accessible to low-literacy users.

### Why It Matters

This is not just another app — it's a lifeline for the farmers who feed 220 million Nigerians. By putting AI-powered agricultural expertise in every farmer's pocket, FarmGenius AI directly addresses:

- **Food Security** — Reducing crop losses means more food on Nigerian tables
- **Farmer Livelihoods** — Better planning + market intelligence = higher incomes
- **Sustainable Agriculture** — Precision recommendations reduce waste and environmental impact
- **Digital Inclusion** — Multimodal interfaces (voice + vision) work for farmers regardless of literacy level

---

## 2. Demo

### Live Demo
**[https://sfcu3h7pl6kh4.kimi.page](https://sfcu3h7pl6kh4.kimi.page)**

### Demo Flow for Judges

1. **Landing Page** (`/`) — Scroll through the immersive hero with Three.js WebGL background, feature overview cards, AI engine visualization, social proof metrics, and footer CTA.

2. **Crop Doctor** (`/#/crop-doctor`) — Click "Analyze Crop", upload a crop photo (or use the demo), watch the animated scanning reticle, and see a complete AI-generated diagnosis report with treatment steps.

3. **Farming Plans** (`/#/farming-plans`) — Fill out the interactive form (crop type, Nigerian state, soil type, season), click "Generate Plan", and explore the animated timeline with week-by-week farming activities.

4. **Market Intelligence** (`/#/market-intelligence`) — Browse the live price ticker, crop price grid with sparklines, AI demand forecasting chart, interactive Nigeria market map, and AI insights panel.

5. **About** (`/#/about`) — Read the mission narrative, explore the problem/solution story, see the 4-step "How It Works" journey, and review the impact metrics.

---

## 3. Technical Details

### How We Built It

FarmGenius AI was built using a **design-first, multi-agent architecture** approach. We started with comprehensive design documents specifying every color, animation, and interaction, then parallelized development across 4 specialized page agents working simultaneously.

### Technologies, Frameworks & APIs Used

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend Framework** | React 19 + TypeScript + Vite | Core application |
| **Styling** | Tailwind CSS v3.4.19 | Utility-first responsive design |
| **UI Components** | shadcn/ui | 40+ pre-built accessible components |
| **Animations** | GSAP + ScrollTrigger | Scroll-driven entrance animations |
| **3D/WebGL** | Three.js + @react-three/fiber | Hero background effects, particle systems |
| **Smooth Scroll** | Lenis | Buttery page scrolling |
| **Routing** | React Router (HashRouter) | SPA navigation |
| **Icons** | Lucide React | Professional iconography |
| **Fonts** | Space Grotesk, Inter, JetBrains Mono | Premium typography |

### Gemini API Integration

We use the **Gemini 1.5 Flash** model across three multimodal touchpoints:

#### 1. Vision — Crop Disease Diagnosis
```typescript
// src/lib/gemini.ts
const response = await fetch(
  `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: DIAGNOSIS_PROMPT },  // Structured prompt for Nigerian crops
          { inline_data: { mimeType: 'image/jpeg', data: imageBase64 } }
        ]
      }]
    })
  }
);
// Returns: diseaseName, confidence, severity, description, treatment[], prevention[]
```

The prompt is specifically optimized for Nigerian and West African crop diseases including Cassava Mosaic Disease, Maize Streak Virus, Tomato Leaf Blight, Yam Anthracnose, Rice Blast, and Cocoa Black Pod.

#### 2. Text — Smart Farming Plans
```typescript
// src/lib/gemini-farming.ts
const plan = await generateFarmingPlan({
  cropType: 'Cassava',
  farmSize: 2.5,
  location: 'Niger State',
  soilType: 'Loamy',
  season: 'Rainy Season'
});
// Returns: weekly timeline, NPK recommendations, soil health tips, weather advisories
```

#### 3. Text — Market Intelligence
```typescript
// src/lib/gemini-market.ts
const insights = await getMarketInsights('Maize');
// Returns: demand forecast, price trends, trade recommendations, volatility alerts
```

### Google Cloud Services Used (Future Deployment)

While the current demo is deployed on static hosting, our production architecture targets Google Cloud:

| Service | Usage |
|---------|-------|
| **Firebase Authentication** | Phone OTP login for Nigerian farmers |
| **Cloud Firestore** | User profiles, scan history, farming plans |
| **Firebase Hosting** | Global CDN for the React frontend |
| **Cloud Run** | Node.js backend API for Gemini proxy + data aggregation |
| **Cloud Storage** | Crop image uploads and user-generated content |
| **Cloud Monitoring** | Application performance tracking |

### Performance Optimizations

- **Code splitting** — Three.js components lazy-loaded via React.lazy() + Suspense
- **Canvas 2D particles** — Hardware-accelerated, requestAnimationFrame-driven
- **GSAP ScrollTrigger** — Efficient scroll-linked animations with proper cleanup
- **Asset optimization** — Responsive images, minimal font loading

---

## 4. Source Code

**[GitHub Repository](https://github.com/YOUR_USERNAME/farmgenius-ai)** *(You will upload yourself)*

### Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/farmgenius-ai.git
cd farmgenius-ai

# Install
npm install

# Add your Gemini API key
echo "VITE_GEMINI_API_KEY=your_key_here" > .env

# Run
npm run dev

# Build
npm run build
```

### Get Your Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy and paste into your `.env` file

---

## Judging Criteria Alignment

### Best Use of Gemini API

| Criteria | How FarmGenius AI Delivers |
|----------|---------------------------|
| **Creativity** | Multimodal application: vision (crop diagnosis) + text (farming plans + market insights) + voice (accessibility) — not just a chatbot |
| **Effectiveness** | Structured prompts optimized for Nigerian agriculture; returns actionable JSON data, not generic responses |
| **Innovation** | First platform to combine crop diagnosis + farming plans + market intelligence in one unified experience for Nigerian farmers |
| **User Experience** | Animated scanning reticle, visual diagnosis reports, interactive timelines — makes AI feel tangible and trustworthy |

### Best App Deployed on Google Cloud

| Service | Implementation |
|---------|---------------|
| **Firebase Auth** | Phone OTP for rural farmers without email |
| **Cloud Firestore** | Real-time scan history, farming plans, user profiles |
| **Firebase Hosting** | Global CDN, SSL, custom domain |
| **Cloud Run** | Scalable backend for Gemini API proxy |
| **Cloud Storage** | Secure crop image storage |

---

## Screenshots

### Landing Page
![Landing Page](https://sfcu3h7pl6kh4.kimi.page)

### Crop Doctor
![Crop Doctor](https://sfcu3h7pl6kh4.kimi.page/#/crop-doctor)

### Market Intelligence
![Market Intelligence](https://sfcu3h7pl6kh4.kimi.page/#/market-intelligence)

---

## Future Roadmap

- [ ] Firebase Authentication with phone OTP
- [ ] Offline mode with service workers
- [ ] Hausa and Yoruba language support
- [ ] Community feature — farmer-to-farmer knowledge sharing
- [ ] Integration with Nigeria Meteorological Agency for real weather data
- [ ] SMS alerts for price changes and disease outbreaks
- [ ] Mobile app (React Native / Flutter)

---

*Built with passion for Nigerian agriculture. Powered by Gemini AI.*
