# NutriAI — Smartest AI Nutrition Assistant
### Powered by AI backend & watsonx.ai

<div align="center">
  <h3>🥗 AI-Powered | 🔬 Evidence-Based | 🌍 Culturally Aware</h3>
</div>

---

## 🚀 Project Overview

**NutriAI** is a next-generation AI nutrition assistant built for the IBM hackathon challenge.
It bridges the gap between generic diet apps and in-person nutritional counselling by leveraging
**AI backend**, **Watson Assistant**, and **watsonx.ai Studio**.

---

## ✨ Key Features

| Feature | Technology | Description |
|---------|-----------|-------------|
| 💬 AI Nutrition Coach | AI Model 13B | Multi-turn conversational nutrition expert |
| 📅 7-Day Meal Planner | watsonx.ai | Personalized adaptive meal plans |
| 📸 Food Image Analyzer | AI Vision | Upload photos for instant nutrition breakdown |
| 🔄 Smart Food Swaps | AI Reasoning | Contextual alternatives preserving macros |
| 📊 Macro Tracker | Client-side | Real-time calorie & macro logging with charts |
| 🩺 Health Condition Support | Clinical NLP | Diabetes, PCOS, hypertension, thyroid & more |
| 🌍 Cultural Cuisine Aware | Multilingual LLM | Indian, Mediterranean, Asian, Latin cuisines |
| 🎙️ Voice Input | Web Speech API | Hands-free nutrition queries |

---

## 🛠️ Tech Stack

```
Frontend:        HTML5 + Vanilla CSS + Vanilla JavaScript
AI Engine:       AI Model 13B Instruct v2 (via watsonx.ai)
Conversational:  Watson Assistant
Image Storage:   IBM Cloud Object Storage (COS)
Hosting:         IBM Cloud Foundry / IBM Cloud Static Sites
Data:            Custom nutrition DB + USDA FoodData Central API
```

---

## 📁 Project Structure

```
NutriAI/
├── index.html              # Main app (single-page, multi-section)
├── css/
│   └── style.css           # Complete design system (dark glassmorphism)
├── js/
│   ├── app.js              # Core application controller
│   ├── ai-engine.js        # AI engine + watsonx.ai integration
│   ├── nutrition-data.js   # Food database + BMR/TDEE calculations
│   └── chart.js            # Canvas-based macro donut chart
└── README.md
```

---

## ⚙️ IBM Cloud Setup

### Step 1: Create IBM Cloud Account
1. Go to [cloud.ibm.com](https://cloud.ibm.com) → Sign up for **Lite account** (free)
2. Verify your email

### Step 2: Provision watsonx.ai
1. Search **"watsonx.ai"** in IBM Cloud catalog
2. Select **Lite plan** → Create instance
3. Open watsonx.ai Studio → Create a new **Project**
4. Copy your **Project ID** from project settings

### Step 3: Get API Key
1. Go to **IBM Cloud Console** → Manage → Access (IAM) → API Keys
2. Click **"Create an IBM Cloud API key"**
3. Name it `nutri-ai-key` → Copy the key (shown only once!)

### Step 4: Configure Watson Assistant (Optional)
1. Search **"Watson Assistant"** in catalog → Lite plan → Create
2. Launch tool → Create assistant named `NutriAI`
3. Copy **Assistant ID** and **API Key** from credentials

### Step 5: Update Configuration
Open `js/ai-engine.js` and replace:

```javascript
config: {
  watsonxApiKey: 'YOUR_API_KEY_HERE',        // ← Your IBM Cloud API Key
  watsonxProjectId: 'YOUR_PROJECT_ID_HERE',  // ← watsonx.ai Project ID
  watsonAssistantId: 'YOUR_ASSISTANT_ID',    // ← Watson Assistant ID (optional)
  model: 'ai-model-13b-instruct-v2',         // ← AI model to use
}
```

### Step 6: Available AI Models
```
ai-model-13b-instruct-v2     ← Recommended (best balance)
ai-model-7b-lab              ← Faster, lighter
ai-model-20b-multilingual    ← Best for non-English queries
ai-model-34b-code-instruct   ← For structured nutrition data
```

---

## 🧠 AI Prompt Architecture

```
[SYSTEM]: Expert nutrition assistant with clinical knowledge
    ↓
[USER PROFILE CONTEXT]: Age, weight, goals, allergies, conditions
    ↓
[CONVERSATION HISTORY]: Last 6 turns for contextual memory
    ↓
[USER QUERY]: Natural language nutrition question
    ↓
[AI MODEL 13B]: Reasoning + generation
    ↓
[RESPONSE]: Personalized, evidence-based nutrition advice
```

---

## 🏃 Running Locally

```bash
# Option 1: Python (recommended)
python -m http.server 8080
# Open http://localhost:8080

# Option 2: Node.js
npx serve .
# Open http://localhost:3000

# Option 3: VS Code
# Install "Live Server" extension → Right-click index.html → Open with Live Server
```

> **Note:** The app runs fully in **demo mode** without API keys.
> AI responses are simulated locally for all topics.
> Add your API keys to unlock real-time AI inference.

---

## 🌐 Deploy to IBM Cloud

```bash
# Install IBM Cloud CLI
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh

# Login
ibmcloud login

# Deploy as static site using Cloud Foundry
ibmcloud cf push nutri-ai --buildpack staticfile_buildpack -m 64M
```

---

## 📊 Demo Mode Features (No API Key Required)

The app ships with a comprehensive **intelligent demo mode** that includes:
- ✅ 15+ nutrition topic responses (weight loss, muscle gain, diabetes, vegan, heart health, etc.)
- ✅ 15+ food items in the nutrition database with full macro data
- ✅ Complete 7-day meal plan generation (customized by profile)
- ✅ Food analysis with health scores, benefits, and smart swaps
- ✅ BMR/TDEE calculator with goal-based macro splits
- ✅ Real-time macro tracker with visual donut chart
- ✅ Food logging with local persistence (localStorage)

---

## 📝 Hackathon Deliverables

- [x] Problem Statement: Personalized AI nutrition guidance
- [x] AI backend integration (watsonx.ai)
- [x] Watson Assistant conversational framework
- [x] IBM Cloud Lite service integration
- [x] Multimodal input (text + image + voice)
- [x] Health condition-aware meal planning
- [x] Cultural cuisine preferences (Indian, Mediterranean)
- [x] Real-time adaptive feedback loop
- [x] Explainable AI responses ("Why is this food better?")
- [x] Food swap suggestions with nutritional equivalence

---

## 👥 Team

Built for **IBM Hackathon — Problem Statement #8: Nutrition Agent**

*"Bridging the gap between one-size-fits-all diet apps and in-person nutrition counselling."*

---

<div align="center">
  <strong>🥗 NutriAI — Powered by AI</strong><br/>
  <em>Eat smarter. Live better. Powered by AI.</em>
</div>
