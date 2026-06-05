

window.AIEngine = {

  // ── Configuration (replace with your IBM Cloud credentials)
  config: {
    // IBM watsonx.ai endpoint
    watsonxApiKey: 'YOUR_WATSONX_API_KEY',
    watsonxProjectId: 'YOUR_PROJECT_ID',
    watsonxEndpoint: 'https://us-south.ml.cloud.ibm.com/ml/v1/text/generation',

    // IBM Watson Assistant
    watsonAssistantId: 'YOUR_ASSISTANT_ID',
    watsonAssistantKey: 'YOUR_WATSON_ASSISTANT_KEY',
    watsonRegion: 'us-south',

    // IBM Cloud Object Storage (for image uploads)
    cosEndpoint: 'https://s3.us-south.cloud-object-storage.appdomain.cloud',
    cosBucketName: 'nutri-ai-images',
    cosApiKey: 'YOUR_COS_API_KEY',

    // Granite model to use
    model: 'ibm/granite-13b-instruct-v2',
    maxTokens: 1500,
    temperature: 0.4
  },

  // ── System prompt for nutrition context
  systemPrompt: `You are NutriAI, an expert AI nutritionist powered by AI.
You have deep knowledge of:
- Clinical nutrition and dietetics
- Macro and micronutrient science
- Cultural cuisines worldwide (Indian, Mediterranean, Asian, Latin American, etc.)
- Medical nutrition therapy (diabetes, hypertension, PCOS, thyroid, kidney disease, etc.)
- Sports nutrition and fitness
- Food allergies and intolerances
- Ayurvedic and integrative nutrition approaches

Guidelines:
- Always personalize advice based on user's profile, goals, allergies, and medical conditions
- Provide specific food quantities, not vague suggestions
- Explain WHY a food is good or bad (mechanism of action)
- Suggest culturally appropriate alternatives
- Format responses clearly with emoji where helpful
- Include macronutrient data when relevant
- Flag any advice that requires professional medical consultation
- Be warm, encouraging, and empathetic

Always end responses with a relevant tip or motivational nudge.`,

  // ── Conversation history for multi-turn context
  conversationHistory: [],

  // ── Build contextualized prompt with user profile
  buildPrompt(userMessage, userProfile) {
    const profile = userProfile || {};
    let context = '';
    if (profile.name) context += `User: ${profile.name}, `;
    if (profile.age) context += `Age ${profile.age}, `;
    if (profile.gender) context += `${profile.gender}, `;
    if (profile.weight && profile.height) context += `${profile.weight}kg/${profile.height}cm, `;
    if (profile.goal) context += `Goal: ${profile.goal}, `;
    if (profile.diet) context += `Diet: ${profile.diet}, `;
    if (profile.conditions && profile.conditions.length) context += `Conditions: ${profile.conditions.join(', ')}, `;
    if (profile.allergies && profile.allergies.length) context += `Allergies: ${profile.allergies.join(', ')}, `;

    return context ? `[User Profile: ${context.slice(0, -2)}]\n\n${userMessage}` : userMessage;
  },

  // ── Main text generation API call to IBM watsonx.ai
  async generateText(prompt, systemCtx) {
    // Build full conversation prompt
    const messages = [
      { role: 'system', content: systemCtx || this.systemPrompt },
      ...this.conversationHistory.slice(-6), // Keep last 6 turns for context
      { role: 'user', content: prompt }
    ];

    const requestBody = {
      model_id: this.config.model,
      input: messages.map(m => `${m.role === 'system' ? '[SYSTEM]' : m.role === 'user' ? '[USER]' : '[AI]'}: ${m.content}`).join('\n\n') + '\n\n[AI]:',
      parameters: {
        decoding_method: 'greedy',
        max_new_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        repetition_penalty: 1.1,
        stop_sequences: ['[USER]', '[SYSTEM]']
      },
      project_id: this.config.projectId
    };

    try {
      // In demo mode, use intelligent local response generation
      if (this.config.watsonxApiKey === 'YOUR_WATSONX_API_KEY') {
        return await this._demoResponse(prompt);
      }

      const tokenResp = await this._getAIToken();
      const response = await fetch(this.config.watsonxEndpoint, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenResp}`,
          'ML-Instance-ID': this.config.watsonxProjectId
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`IBM API Error: ${response.status}`);
      const data = await response.json();
      const text = data.results?.[0]?.generated_text || 'I encountered an issue. Please try again.';

      // Update conversation history
      this.conversationHistory.push({ role: 'user', content: prompt });
      this.conversationHistory.push({ role: 'assistant', content: text });

      return text;
    } catch (err) {
      console.error('AI Engine API Error:', err);
      return await this._demoResponse(prompt);
    }
  },

  // ── Get IAM token
  async _getAIToken() {
    const resp = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${this.config.watsonxApiKey}`
    });
    const data = await resp.json();
    return data.access_token;
  },

  // ── Intelligent demo responses (when API key not configured)
  async _demoResponse(prompt) {
    // Simulate API latency
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const q = prompt.toLowerCase();
    const responses = this._getTopicResponse(q);
    return responses;
  },

  _getTopicResponse(q) {
    // Protein / muscle gain
    if (q.includes('protein') || q.includes('muscle') || q.includes('gym') || q.includes('workout')) {
      return `💪 **High-Protein Strategy for Muscle Gain**

Your muscle-building nutrition starts here! Here's what the AI recommends:

**Target:** 1.6–2.2g protein per kg of body weight daily

**Top Protein Sources:**
| Food | Protein | Calories |
|------|---------|----------|
| 🍗 Chicken breast (180g) | 55g | 275 kcal |
| 🐟 Salmon fillet (180g) | 39g | 354 kcal |
| 🥚 Eggs (3 large) | 19g | 234 kcal |
| 🫘 Dal (1 cup) | 18g | 230 kcal |
| 🧀 Paneer (100g) | 18g | 265 kcal |

**Post-Workout Meal (within 30 min):**
- Grilled chicken + quinoa + roasted vegetables
- Protein smoothie: banana + Greek yogurt + protein powder + milk

**Timing Matters:**
- Pre-workout: Complex carbs + moderate protein
- Post-workout: High protein + moderate carbs
- Before bed: Casein-rich foods (cottage cheese, paneer)

*Tip: Spread protein intake across 4-5 meals for optimal muscle protein synthesis. Consistency beats perfection! 🌟*`;
    }

    // Weight loss
    if (q.includes('weight loss') || q.includes('lose weight') || q.includes('fat loss') || q.includes('diet')) {
      return `🥗 **Personalized Weight Loss Nutrition Plan**

Our evidence-based approach to sustainable fat loss:

**The Science:** Create a 300-500 kcal deficit daily — steady loss without muscle breakdown.

**Your Daily Targets (estimated):**
- 🔥 Calories: 1,600-1,800 kcal
- 💪 Protein: 120-140g (preserves muscle)
- 🌾 Carbs: 140-160g (complex sources only)
- 🥑 Fats: 50-60g (healthy fats)

**Meal Blueprint:**

🌅 **Breakfast** (400 kcal)
Overnight oats with chia seeds, berries, and Greek yogurt

☀️ **Lunch** (450 kcal)
Large salad with grilled chicken/paneer, avocado, olive oil dressing

🌇 **Dinner** (400 kcal)
Steamed vegetables + dal + 1 small roti or brown rice

🍎 **Snacks** (150-200 kcal)
Apple with almond butter, or a handful of mixed nuts

**Foods to Minimize:**
- ❌ Refined carbs (white bread, maida)
- ❌ Sugary drinks and juices
- ❌ Fried foods and ultra-processed snacks
- ❌ Alcohol

*Tip: Drink 500ml water before each meal — studies show this reduces calorie intake by 13%! 💧*`;
    }

    // Diabetes
    if (q.includes('diabetes') || q.includes('blood sugar') || q.includes('insulin') || q.includes('glucose')) {
      return `🩺 **Diabetes-Friendly Nutrition Guide**

Managing blood sugar through food — our clinical nutrition protocol:

**Key Principles:**
1. **Glycemic Load Management** — Choose low-GI foods
2. **Carb Distribution** — Spread carbs evenly across meals
3. **Fiber First** — 25-35g daily to slow glucose absorption
4. **Protein Balance** — Reduces post-meal glucose spikes

**Best Foods for Diabetes:**
| Food | GI | Why It's Great |
|------|----|----------------|
| 🫘 Legumes (dal, rajma) | Low (28-40) | High fiber, slow absorption |
| 🥦 Non-starchy vegetables | Very Low | Vitamins without glucose spike |
| 🐟 Fatty fish | N/A | Omega-3 improves insulin sensitivity |
| 🌰 Nuts & seeds | Low | Healthy fats slow digestion |
| 🥣 Oats | Medium (55) | Beta-glucan regulates blood sugar |

**Foods to Strictly Avoid:**
- ❌ White rice (high GI: 72)
- ❌ Fruit juices (rapid glucose spike)
- ❌ Refined flour (maida)
- ❌ Processed sweets and mithai

**Sample Day Menu:**
- Breakfast: Oats + nuts + seeds (no sugar)
- Lunch: 1 roti + dal + salad + sabzi
- Dinner: Dal + vegetables + small portion whole grain

⚠️ *Always monitor blood sugar 2 hours after meals. This guidance supplements — never replaces — your doctor's advice.*

*Tip: Taking a 10-minute walk after meals reduces post-meal glucose by up to 22%! 🚶*`;
    }

    // Vegan
    if (q.includes('vegan') || q.includes('plant-based') || q.includes('plant based')) {
      return `🌱 **Complete Vegan Nutrition Guide**

Our evidence-based plant-based nutrition protocol:

**Critical Nutrients to Monitor:**

| Nutrient | Risk | Top Plant Sources |
|----------|------|-------------------|
| B12 | High risk | Fortified foods, supplements |
| Iron | Medium | Lentils, tofu, pumpkin seeds |
| Calcium | Medium | Kale, tofu, fortified plant milk |
| Omega-3 | Medium | Flaxseed, chia, walnuts |
| Zinc | Medium | Pumpkin seeds, hemp, oats |
| Vitamin D | High | Sunlight + supplement |
| Protein | Low-Medium | See below |

**Protein Powerhouses (vegan):**
- 🫘 Lentils: 18g protein/cup
- 🧆 Tempeh: 31g protein/100g
- 🫛 Edamame: 17g protein/cup
- 🌰 Hemp seeds: 9g protein/3 tbsp
- 🟤 Quinoa: 8g protein/cup (complete!)

**7-Day Vegan Meal Plan Preview:**

**Day 1:**
- 🌅 Breakfast: Chia pudding with mango + walnuts
- ☀️ Lunch: Chickpea salad wrap + tahini
- 🌇 Dinner: Tofu curry + brown rice + steamed broccoli

**Tip:** Pair iron-rich foods with Vitamin C (lemon, tomato) to boost iron absorption by 3x! 🍋*`;
    }

    // Meal plan
    if (q.includes('meal plan') || q.includes('weekly') || q.includes('7 day')) {
      return `📅 **AI-Generated Personalized Meal Plan**

This adaptive meal plan was generated based on your profile:

**Nutritional Targets:**
- 🔥 1,800 kcal/day
- 💪 135g Protein | 🌾 180g Carbs | 🥑 60g Fat

---

**DAY 1 — Monday**

🌅 **Breakfast (450 kcal)**
- Masala oats with vegetables + 2 boiled eggs
- 1 glass turmeric milk

☀️ **Lunch (500 kcal)**
- 2 whole wheat rotis + palak dal + cucumber raita
- Mixed salad with lemon dressing

🍎 **Snack (150 kcal)**
- Apple + 10 almonds

🌇 **Dinner (450 kcal)**
- Grilled chicken/paneer + roasted vegetables
- 1/2 cup brown rice

💧 **Hydration:** 2.5-3L water throughout the day

---

**DAY 2 — Tuesday**

🌅 **Breakfast (400 kcal)**
- Vegetable poha + 1 banana
- Green tea

☀️ **Lunch (520 kcal)**
- Dal khichdi (moong dal + brown rice) + vegetable curry
- Lassi (without sugar)

🌇 **Dinner (430 kcal)**
- Egg bhurji + 2 rotis + salad

*Use the Meal Planner section to generate a complete customized 7-day plan for your specific goals! ✨*`;
    }

    // Heart health
    if (q.includes('heart') || q.includes('cholesterol') || q.includes('cardiovascular') || q.includes('blood pressure')) {
      return `❤️ **Heart-Healthy Nutrition Protocol**

Our cardioprotective nutrition strategy:

**The DASH-Mediterranean Hybrid Approach:**

**Foods That PROTECT Your Heart:**
- 🐟 Fatty fish (salmon, mackerel): Omega-3 reduces triglycerides by 25%
- 🫒 Extra virgin olive oil: Reduces LDL oxidation
- 🫘 Legumes: Beta-glucan fiber lowers cholesterol
- 🥦 Dark leafy greens: Nitrates lower blood pressure
- 🫐 Berries: Anthocyanins improve arterial flexibility
- 🌰 Walnuts: ALA omega-3 and antioxidants
- 🧄 Garlic: Allicin naturally reduces blood pressure

**Foods That HARM Your Heart:**
- ❌ Trans fats (vanaspati, processed snacks)
- ❌ Excess sodium (>1,500mg/day)
- ❌ Saturated fat (>7% of calories)
- ❌ Refined carbohydrates and sugars
- ❌ Red meat (limit to 1-2x/week)

**Heart-Protective Daily Menu:**
- Morning: Oats + walnuts + flaxseed + berries
- Lunch: Grilled fish + olive oil salad + legume soup
- Dinner: Vegetables stir-fry + brown rice + dal

*Tip: The Mediterranean diet reduces heart disease risk by up to 30% — it's one of the most evidence-backed diets in clinical research! 🫒*`;
    }

    // Calorie calculator / general
    if (q.includes('calorie') || q.includes('how many') || q.includes('calculate')) {
      return `⚡ **Calorie & Macronutrient Calculator**

Our precision nutrition calculation:

**Basal Metabolic Rate (BMR) — Mifflin-St Jeor Formula:**
- Men: (10 × weight kg) + (6.25 × height cm) − (5 × age) + 5
- Women: (10 × weight kg) + (6.25 × height cm) − (5 × age) − 161

**Activity Multipliers for TDEE:**
| Activity Level | Multiplier | Example |
|----------------|------------|---------|
| Sedentary | × 1.2 | Desk job, minimal exercise |
| Lightly Active | × 1.375 | Walk 30 min, light gym 1-3x |
| Moderately Active | × 1.55 | Gym 3-5x/week |
| Very Active | × 1.725 | Daily intense training |
| Athletic | × 1.9 | Twice-daily training |

**Goal-Based Adjustments:**
- 🔻 Weight Loss: TDEE − 400 kcal
- ⚖️ Maintain: TDEE
- 📈 Muscle Gain: TDEE + 250-300 kcal

**Example (70kg, 170cm, 28yr female, moderate activity):**
- BMR: 1,454 kcal
- TDEE: 1,454 × 1.55 = **2,254 kcal**
- For weight loss: **1,854 kcal/day**

*Use the Meal Planner section to auto-calculate your exact targets and generate a custom meal plan! 🎯*`;
    }

    // Anti-inflammatory
    if (q.includes('anti-inflammatory') || q.includes('inflammation') || q.includes('autoimmune')) {
      return `🔥 **Anti-Inflammatory Nutrition Guide**

Our evidence-based approach to reducing systemic inflammation:

**Most Powerful Anti-Inflammatory Foods:**

🥇 **Tier 1 — Eat Daily:**
- 🫐 Blueberries — Anthocyanins inhibit inflammatory pathways
- 🐟 Fatty fish — EPA/DHA block pro-inflammatory eicosanoids
- 🥦 Broccoli — Sulforaphane activates Nrf2 antioxidant pathway
- 🌿 Turmeric + black pepper — Curcumin bioavailability ↑ 2000%
- 🍃 Green tea — EGCG suppresses NF-κB (key inflammation trigger)

🥈 **Tier 2 — Eat 4-5x/week:**
- 🫒 Extra virgin olive oil — Oleocanthal = natural ibuprofen
- 🧄 Garlic — Organosulfur compounds reduce CRP
- 🌰 Walnuts — Highest ALA omega-3 of any nut
- 🥬 Spinach & kale — Vitamin K2 reduces arterial inflammation
- 🍅 Tomatoes — Lycopene is heat-activated (cook them!)

**Foods That CAUSE Inflammation:**
- ❌ Sugar and refined carbs (spike AGEs)
- ❌ Vegetable oils high in omega-6
- ❌ Ultra-processed foods
- ❌ Alcohol (elevates CRP and IL-6)

**Anti-Inflammatory Day Plan:**
- 🌅 Golden milk oats + walnuts + blueberries
- ☀️ Salmon + turmeric roasted vegetables
- 🌇 Lentil soup + kale salad + olive oil

*Tip: Chronic inflammation is linked to 7 of the 10 leading causes of death. Food is your most powerful medicine! 🌿*`;
    }

    // Indian food specific
    if (q.includes('indian') || q.includes('desi') || q.includes('roti') || q.includes('sabzi') || q.includes('curry')) {
      return `🇮🇳 **Indian Nutrition Excellence Guide**

We celebrate the nutritional wisdom of Indian cuisine:

**Healthiest Traditional Indian Foods:**

| Food | Superpower | Calories |
|------|-----------|----------|
| 🫘 Masoor Dal | 18g protein, 90% DV folate | 230/cup |
| 🌿 Methi (Fenugreek) | Controls blood sugar | 49/100g |
| 🥬 Sarson (Mustard greens) | Vitamin K, calcium | 27/100g |
| 🎋 Bitter gourd (Karela) | Best anti-diabetic food | 17/100g |
| 🫓 Idli/Dosa (fermented) | Probiotics, B vitamins | 130/2 pcs |
| 🍛 Haldi (Turmeric) | Curcumin — anti-inflammatory | 24/tsp |
| 🌰 Til (Sesame) | Calcium, healthy fats | 573/100g |

**Ayurvedic Superfoods:**
- Ashwagandha in warm milk — adaptogenic, stress-reducing
- Amla (Indian gooseberry) — highest natural Vitamin C
- Triphala — digestive health tonic
- Ghee — small amounts, contains butyrate for gut health

**Smart Indian Cooking Tips:**
1. Replace maida with ragi/jowar flour — 3x more fiber
2. Add dal to every meal — complete protein with rice
3. Use mustard oil or coconut oil sparingly
4. Cook tomatoes to unlock lycopene
5. Pair dal with lemon — iron absorption ↑ 3x

**Balanced Indian Plate (thali model):**
- 2 small rotis (whole wheat) | 1 cup dal | 2 cups sabzi | Salad | Raita

*Tip: India's traditional "Dal-Roti-Sabzi" is nutritionally one of the most balanced meals in the world! 🌟*`;
    }

    // Default greeting / general
    return `👋 **Welcome to NutriAI — Powered by AI**

I'm your personal AI nutritionist with access to:
- 📚 50,000+ food items database
- 🔬 Evidence-based clinical nutrition research
- 🌍 Global cuisine knowledge (Indian, Mediterranean, Asian, Latin)
- 🩺 Medical nutrition therapy protocols

**Here's what I can help you with:**

🥗 **Personalized Meal Plans**
"Create a 7-day vegan meal plan for weight loss"

🔬 **Nutritional Analysis**
"What's the nutritional value of chicken biryani?"

💊 **Health-Specific Guidance**
"What should I eat for PCOS management?"

🔄 **Smart Food Swaps**
"Give me healthy alternatives to white rice"

📊 **Macro Calculations**
"Calculate my daily calorie and protein needs"

🍳 **Recipe Optimization**
"How can I make my dal more nutritious?"

**Try asking me anything about nutrition!** I'll provide you with personalized, evidence-based guidance powered by advanced AI. 🌱

*What's your nutrition goal today? I'm here to help! ✨*`;
  },

  // ── Meal Plan Generation
  async generateMealPlan(profile) {
    const prompt = this._buildMealPlanPrompt(profile);

    if (this.config.watsonxApiKey === 'YOUR_WATSONX_API_KEY') {
      await new Promise(r => setTimeout(r, 1500));
      return this._buildLocalMealPlan(profile);
    }

    const response = await this.generateText(prompt);
    return response;
  },

  _buildMealPlanPrompt(p) {
    return `Generate a detailed 7-day personalized meal plan for:
- Age: ${p.age}, Gender: ${p.gender}
- Weight: ${p.weight}kg, Height: ${p.height}cm
- Goal: ${p.goal}
- Activity: ${p.activity}
- Diet: ${p.diet}
- Allergies: ${p.allergies || 'None'}
- Medical conditions: ${p.conditions || 'None'}
- Cuisine preferences: ${p.cuisine || 'Indian, Mediterranean'}

Include for each day: breakfast, lunch, snack, dinner with calories and main macros.
Be specific with portion sizes. Include cultural preferences. Consider allergies strictly.`;
  },

  _buildLocalMealPlan(p) {
    const bmr = NutritionDB.calculateBMR(p.weight, p.height, p.age, p.gender);
    const tdee = NutritionDB.calculateTDEE(bmr, p.activity);

    let targetKcal = tdee;
    if (p.goal === 'Weight Loss') targetKcal = tdee - 400;
    else if (p.goal === 'Muscle Gain') targetKcal = tdee + 300;

    const macros = NutritionDB.getMacros(targetKcal, p.goal);
    const isVeg = ['Vegetarian', 'Vegan', 'Indian Vegetarian'].includes(p.diet);
    const isVegan = p.diet === 'Vegan';

    const mealPlans = [
      {
        day: 'Day 1 — Monday',
        kcal: targetKcal,
        meals: [
          { label: 'Breakfast', emoji: '🌅', name: isVegan ? 'Chia Pudding with Mango & Walnuts' : 'Masala Oats with Vegetables & Boiled Eggs', macros: '~430 kcal • 18g P • 52g C • 14g F' },
          { label: 'Lunch', emoji: '☀️', name: isVeg ? 'Dal Makhani + Brown Rice + Salad' : 'Grilled Chicken + Brown Rice + Raita', macros: '~520 kcal • 32g P • 58g C • 12g F' },
          { label: 'Snack', emoji: '🍎', name: 'Apple + Almonds (10)', macros: '~180 kcal • 4g P • 22g C • 9g F' },
          { label: 'Dinner', emoji: '🌇', name: isVeg ? 'Palak Paneer + 2 Rotis + Salad' : 'Baked Salmon + Steamed Broccoli + Quinoa', macros: '~450 kcal • 28g P • 35g C • 16g F' }
        ]
      },
      {
        day: 'Day 2 — Tuesday',
        kcal: targetKcal,
        meals: [
          { label: 'Breakfast', emoji: '🌅', name: isVegan ? 'Tofu Scramble + Whole Wheat Toast' : 'Greek Yogurt Parfait + Granola + Berries', macros: '~380 kcal • 22g P • 44g C • 11g F' },
          { label: 'Lunch', emoji: '☀️', name: isVeg ? 'Vegetable Khichdi + Lassi' : 'Turkey Wrap + Avocado + Hummus', macros: '~490 kcal • 26g P • 55g C • 14g F' },
          { label: 'Snack', emoji: '🥜', name: 'Roasted Chana + Green Tea', macros: '~160 kcal • 9g P • 18g C • 3g F' },
          { label: 'Dinner', emoji: '🌇', name: isVeg ? 'Rajma + Brown Rice + Cucumber Salad' : 'Stir-fried Chicken + Vegetables + Brown Rice', macros: '~480 kcal • 30g P • 48g C • 12g F' }
        ]
      },
      {
        day: 'Day 3 — Wednesday',
        kcal: targetKcal,
        meals: [
          { label: 'Breakfast', emoji: '🌅', name: isVegan ? 'Smoothie Bowl (banana, spinach, almond butter)' : 'Egg White Omelet + Vegetables + Rye Toast', macros: '~400 kcal • 20g P • 46g C • 13g F' },
          { label: 'Lunch', emoji: '☀️', name: 'Mediterranean Bowl (hummus, falafel, tabouleh)', macros: '~510 kcal • 24g P • 58g C • 16g F' },
          { label: 'Snack', emoji: '🫐', name: 'Mixed Berries + Protein Shake', macros: '~200 kcal • 20g P • 22g C • 3g F' },
          { label: 'Dinner', emoji: '🌇', name: isVeg ? 'Lentil Soup + Garlic Bread + Salad' : 'Grilled Fish Curry + Steamed Rice + Salad', macros: '~440 kcal • 28g P • 40g C • 14g F' }
        ]
      },
      {
        day: 'Day 4 — Thursday',
        kcal: targetKcal,
        meals: [
          { label: 'Breakfast', emoji: '🌅', name: isVegan ? 'Ragi Porridge + Fruits' : 'Upma + Boiled Eggs + Fruit', macros: '~360 kcal • 15g P • 48g C • 9g F' },
          { label: 'Lunch', emoji: '☀️', name: isVeg ? 'Chole + 2 Whole Wheat Rotis + Onion Salad' : 'Chicken Biryani (brown rice) + Raita', macros: '~530 kcal • 28g P • 62g C • 13g F' },
          { label: 'Snack', emoji: '🌰', name: 'Trail Mix (nuts, seeds, dried fruit)', macros: '~190 kcal • 6g P • 18g C • 12g F' },
          { label: 'Dinner', emoji: '🌇', name: 'Dal Tadka + Brown Rice + Stir-fried Vegetables', macros: '~460 kcal • 22g P • 52g C • 11g F' }
        ]
      },
      {
        day: 'Day 5 — Friday',
        kcal: targetKcal,
        meals: [
          { label: 'Breakfast', emoji: '🌅', name: isVegan ? 'Overnight Oats + Chia + Berries' : 'Poha + Peanuts + Lemon + Green Tea', macros: '~390 kcal • 14g P • 54g C • 11g F' },
          { label: 'Lunch', emoji: '☀️', name: isVeg ? 'Paneer Tikka Salad + Whole Wheat Roti' : 'Tuna Salad + Avocado + Quinoa', macros: '~500 kcal • 30g P • 44g C • 18g F' },
          { label: 'Snack', emoji: '🍌', name: 'Banana Smoothie + Flaxseed', macros: '~170 kcal • 6g P • 30g C • 4g F' },
          { label: 'Dinner', emoji: '🌇', name: isVeg ? 'Vegetable Daliya + Dal + Salad' : 'Baked Chicken + Sweet Potato + Green Beans', macros: '~450 kcal • 30g P • 42g C • 12g F' }
        ]
      },
      {
        day: 'Day 6 — Saturday',
        kcal: targetKcal,
        meals: [
          { label: 'Breakfast', emoji: '🌅', name: isVegan ? 'Avocado Toast (whole grain) + Fruit Salad' : 'Vegetable Dosa + Sambar + Coconut Chutney', macros: '~420 kcal • 12g P • 58g C • 14g F' },
          { label: 'Lunch', emoji: '☀️', name: isVeg ? 'Moong Dal Khichdi + Ghee + Pickle' : 'Shrimp Stir-fry + Brown Rice + Bok Choy', macros: '~510 kcal • 28g P • 56g C • 14g F' },
          { label: 'Snack', emoji: '☕', name: 'Protein Bars / Roasted Nuts + Coffee', macros: '~210 kcal • 12g P • 20g C • 8g F' },
          { label: 'Dinner', emoji: '🌇', name: 'Vegetable Curry + Brown Rice + Dahi', macros: '~430 kcal • 18g P • 50g C • 12g F' }
        ]
      },
      {
        day: 'Day 7 — Sunday',
        kcal: targetKcal,
        meals: [
          { label: 'Breakfast', emoji: '🌅', name: isVegan ? 'Pancakes (oat flour, flax egg) + Maple Syrup + Berries' : 'French Toast (whole wheat) + Eggs + Berries', macros: '~450 kcal • 18g P • 56g C • 14g F' },
          { label: 'Lunch', emoji: '☀️', name: 'Special Meal (maintain portions, choose wisely)', macros: '~550 kcal • 28g P • 60g C • 16g F' },
          { label: 'Snack', emoji: '🫐', name: 'Fruit Bowl + Yogurt', macros: '~180 kcal • 8g P • 28g C • 4g F' },
          { label: 'Dinner', emoji: '🌇', name: isVeg ? 'Dal + 2 Rotis + Roasted Vegetables' : 'Grilled Steak/Chicken + Salad + Brown Rice', macros: '~480 kcal • 32g P • 42g C • 14g F' }
        ]
      }
    ];

    return {
      summary: { targetKcal, macros, goal: p.goal, diet: p.diet },
      days: mealPlans
    };
  },

  // ── Food Analysis
  async analyzeFood(foodName) {
    await new Promise(r => setTimeout(r, 800));
    const data = NutritionDB.searchFood(foodName);
    return data;
  },

  clearHistory() {
    this.conversationHistory = [];
  }
};
