
window.NutritionDB = {

  // ── Food data table (per 100g unless noted)
  foods: {
    "oatmeal": {
      name: "Oatmeal", emoji: "🥣", portion: "1 cup cooked (240g)",
      calories: 154, protein: 5.4, carbs: 27, fat: 2.5, fiber: 4, sugar: 1,
      vitamins: { "B1": "26% DV", "Manganese": "65% DV", "Phosphorus": "18% DV" },
      healthScore: 91, category: "Grains",
      benefits: "Excellent source of beta-glucan fiber. Reduces LDL cholesterol and improves blood sugar control.",
      swaps: ["Quinoa porridge", "Chia pudding", "Buckwheat porridge"]
    },
    "avocado toast": {
      name: "Avocado Toast", emoji: "🥑", portion: "1 serving (200g)",
      calories: 320, protein: 9, carbs: 34, fat: 18, fiber: 10, sugar: 2,
      vitamins: { "Folate": "30% DV", "Vitamin K": "35% DV", "Vitamin E": "20% DV" },
      healthScore: 87, category: "Breakfast",
      benefits: "Rich in monounsaturated fats that support heart health. High fiber aids satiety and digestion.",
      swaps: ["Hummus toast", "Nut butter toast", "Cottage cheese toast"]
    },
    "grilled chicken": {
      name: "Grilled Chicken Breast", emoji: "🍗", portion: "1 medium breast (180g)",
      calories: 275, protein: 55, carbs: 0, fat: 5, fiber: 0, sugar: 0,
      vitamins: { "B6": "86% DV", "Niacin": "85% DV", "Selenium": "60% DV" },
      healthScore: 94, category: "Protein",
      benefits: "Lean protein source essential for muscle repair. Very low in saturated fat.",
      swaps: ["Tofu steak", "Salmon fillet", "Chickpea patty (vegan)"]
    },
    "dal": {
      name: "Masoor Dal", emoji: "🫘", portion: "1 cup cooked (200g)",
      calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 16, sugar: 3.6,
      vitamins: { "Folate": "90% DV", "Iron": "37% DV", "Potassium": "21% DV" },
      healthScore: 95, category: "Legumes",
      benefits: "Exceptional plant-based protein. High iron content ideal for vegetarians. Supports blood sugar balance.",
      swaps: ["Moong dal", "Chana dal", "Kidney beans"]
    },
    "salad": {
      name: "Greek Salad", emoji: "🥗", portion: "1 large bowl (300g)",
      calories: 185, protein: 6, carbs: 12, fat: 14, fiber: 3, sugar: 7,
      vitamins: { "Vitamin C": "45% DV", "Vitamin A": "52% DV", "Calcium": "18% DV" },
      healthScore: 90, category: "Salad",
      benefits: "Rich in antioxidants and anti-inflammatory compounds. Mediterranean diet staple for longevity.",
      swaps: ["Quinoa salad", "Kale Caesar", "Brown rice bowl"]
    },
    "idli": {
      name: "Idli (2 pieces)", emoji: "🫓", portion: "2 idlis (120g)",
      calories: 130, protein: 4.5, carbs: 26, fat: 0.5, fiber: 1.2, sugar: 0.5,
      vitamins: { "B1": "8% DV", "Iron": "5% DV", "Calcium": "6% DV" },
      healthScore: 82, category: "Indian Breakfast",
      benefits: "Fermented food rich in probiotics. Low calorie, easy to digest, ideal for weight management.",
      swaps: ["Dosa", "Uttapam", "Poha"]
    },
    "dosa": {
      name: "Masala Dosa", emoji: "🫓", portion: "1 dosa (180g)",
      calories: 215, protein: 5, carbs: 35, fat: 7, fiber: 2.5, sugar: 1,
      vitamins: { "B1": "12% DV", "Iron": "8% DV" },
      healthScore: 79, category: "Indian Breakfast",
      benefits: "Good source of carbohydrates with fermented batter providing probiotic benefits.",
      swaps: ["Idli", "Oats dosa", "Ragi dosa"]
    },
    "banana": {
      name: "Banana", emoji: "🍌", portion: "1 medium (118g)",
      calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1, sugar: 14,
      vitamins: { "B6": "22% DV", "Potassium": "12% DV", "Vitamin C": "15% DV" },
      healthScore: 85, category: "Fruit",
      benefits: "Rich in potassium for muscle function. Natural energy source. Prebiotic fiber feeds gut bacteria.",
      swaps: ["Apple", "Pear", "Mango"]
    },
    "pizza": {
      name: "Pizza Margherita", emoji: "🍕", portion: "2 slices (200g)",
      calories: 495, protein: 20, carbs: 62, fat: 19, fiber: 3, sugar: 6,
      vitamins: { "Calcium": "28% DV", "B12": "20% DV" },
      healthScore: 48, category: "Fast Food",
      benefits: "Contains lycopene from tomatoes. Cheese provides calcium. However, high in sodium and refined carbs.",
      swaps: ["Whole wheat pizza", "Cauliflower crust pizza", "Veggie flatbread"]
    },
    "burger": {
      name: "Beef Burger", emoji: "🍔", portion: "1 burger (220g)",
      calories: 540, protein: 28, carbs: 45, fat: 27, fiber: 2, sugar: 8,
      vitamins: { "B12": "55% DV", "Iron": "25% DV", "Zinc": "35% DV" },
      healthScore: 45, category: "Fast Food",
      benefits: "High protein content. Rich in B12 and zinc. However, very high in saturated fat and sodium.",
      swaps: ["Turkey burger", "Black bean burger", "Portobello mushroom burger"]
    },
    "salmon": {
      name: "Grilled Salmon", emoji: "🐟", portion: "1 fillet (180g)",
      calories: 354, protein: 39, carbs: 0, fat: 21, fiber: 0, sugar: 0,
      vitamins: { "B12": "127% DV", "D": "100% DV", "Omega-3": "4g" },
      healthScore: 97, category: "Seafood",
      benefits: "Outstanding source of omega-3 fatty acids. Reduces inflammation, supports brain health and heart function.",
      swaps: ["Tuna steak", "Mackerel", "Sardines"]
    },
    "brown rice": {
      name: "Brown Rice", emoji: "🍚", portion: "1 cup cooked (195g)",
      calories: 215, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sugar: 0.7,
      vitamins: { "Magnesium": "21% DV", "Phosphorus": "17% DV", "Niacin": "15% DV" },
      healthScore: 83, category: "Grains",
      benefits: "Whole grain with higher fiber than white rice. Supports blood sugar control and gut health.",
      swaps: ["Quinoa", "Cauliflower rice", "Millet"]
    },
    "egg": {
      name: "Boiled Egg", emoji: "🥚", portion: "2 large eggs (120g)",
      calories: 156, protein: 13, carbs: 1.4, fat: 11, fiber: 0, sugar: 1.4,
      vitamins: { "B12": "31% DV", "Selenium": "55% DV", "Choline": "54% DV" },
      healthScore: 90, category: "Protein",
      benefits: "Complete protein with all essential amino acids. Rich in choline for brain health.",
      swaps: ["Tofu scramble", "Greek yogurt", "Chickpea flour omelet"]
    },
    "milk": {
      name: "Cow's Milk", emoji: "🥛", portion: "1 glass (240ml)",
      calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0, sugar: 12,
      vitamins: { "Calcium": "28% DV", "D": "15% DV", "B12": "18% DV" },
      healthScore: 80, category: "Dairy",
      benefits: "Excellent calcium source for bone health. Complete protein. Fortified with Vitamin D.",
      swaps: ["Almond milk", "Oat milk", "Soy milk"]
    },
    "apple": {
      name: "Apple", emoji: "🍎", portion: "1 medium (182g)",
      calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19,
      vitamins: { "C": "14% DV", "K": "5% DV" },
      healthScore: 88, category: "Fruit",
      benefits: "Rich in quercetin and catechins, powerful antioxidants. Pectin fiber is a prebiotic.",
      swaps: ["Pear", "Peach", "Berries"]
    }
  },

  // ── Search food in database
  searchFood(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    // Exact match
    if (this.foods[q]) return this.foods[q];
    // Partial match
    for (const [key, data] of Object.entries(this.foods)) {
      if (q.includes(key) || key.includes(q) || data.name.toLowerCase().includes(q)) {
        return data;
      }
    }
    return null;
  },

  // ── Health score color
  getScoreClass(score) {
    if (score >= 80) return 'score-good';
    if (score >= 55) return 'score-medium';
    return 'score-poor';
  },

  getScoreLabel(score) {
    if (score >= 85) return '⭐ Excellent';
    if (score >= 70) return '✅ Good';
    if (score >= 55) return '⚠️ Moderate';
    return '❌ Poor';
  },

  // ── Estimate BMR (Mifflin-St Jeor)
  calculateBMR(weight, height, age, gender) {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'Female' ? base - 161 : base + 5;
  },

  // ── TDEE multiplier
  activityMultipliers: {
    'Sedentary (desk job)': 1.2,
    'Lightly Active (1-3 days/week)': 1.375,
    'Moderately Active (3-5 days/week)': 1.55,
    'Very Active (6-7 days/week)': 1.725,
    'Extremely Active (athlete)': 1.9
  },

  calculateTDEE(bmr, activity) {
    return Math.round(bmr * (this.activityMultipliers[activity] || 1.55));
  },

  // ── Macro splits by goal
  macroSplits: {
    'Weight Loss':         { protein: 0.35, carbs: 0.35, fat: 0.30 },
    'Muscle Gain':         { protein: 0.35, carbs: 0.45, fat: 0.20 },
    'Maintain Weight':     { protein: 0.25, carbs: 0.50, fat: 0.25 },
    'Improve Energy':      { protein: 0.25, carbs: 0.55, fat: 0.20 },
    'Manage Diabetes':     { protein: 0.30, carbs: 0.35, fat: 0.35 },
    'Heart Health':        { protein: 0.25, carbs: 0.50, fat: 0.25 },
    'PCOS Management':     { protein: 0.35, carbs: 0.35, fat: 0.30 }
  },

  getMacros(kcal, goal) {
    const split = this.macroSplits[goal] || this.macroSplits['Maintain Weight'];
    return {
      protein: Math.round((kcal * split.protein) / 4),
      carbs: Math.round((kcal * split.carbs) / 4),
      fat: Math.round((kcal * split.fat) / 9)
    };
  }
};
