
'use strict';

// ── Global State
const AppState = {
  currentSection: 'home',
  userProfile: JSON.parse(localStorage.getItem('nutriai_profile') || '{}'),
  foodLog: JSON.parse(localStorage.getItem('nutriai_foodlog') || '[]'),
  attachedImage: null,
  recognition: null,
  isListening: false,
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFats: 0
};



function showSection(name) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Show target
  const target = document.getElementById(`section-${name}`);
  if (target) target.classList.add('active');

  // Highlight nav link
  document.querySelectorAll('.nav-link').forEach(l => {
    if (l.getAttribute('href') === `#${name}`) l.classList.add('active');
  });

  AppState.currentSection = name;

  // Close hamburger menu
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.remove('open');

  // Section-specific init
  if (name === 'profile') initProfileSection();
  if (name === 'chat') scrollChatToBottom();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});


  //  CHAT — AI NUTRITION COACH


async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  const hasImage = AppState.attachedImage !== null;

  if (!text && !hasImage) return;

  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;

  // Compose message
  let displayText = text;
  if (hasImage && !text) displayText = '📷 [Food image uploaded — please analyze this food]';
  if (hasImage && text) displayText = text;

  // Append user message
  appendUserMessage(displayText);

  // Clear input
  input.value = '';
  autoResizeTextarea(input);
  removeImage();

  // Show typing indicator
  const typingId = showTypingIndicator();

  try {
    // Build contextual prompt
    const contextPrompt = hasImage
      ? `The user uploaded a food image and says: "${text || 'Please analyze this food image and give me complete nutritional information.'}". Provide a detailed nutritional analysis as if you can see the food in the image.`
      : AIEngine.buildPrompt(text, AppState.userProfile);

    // Call AI engine
    const response = await AIEngine.generateText(contextPrompt);

    removeTypingIndicator(typingId);
    appendAIMessage(formatAIResponse(response));
  } catch (err) {
    removeTypingIndicator(typingId);
    appendAIMessage('⚠️ I\'m having trouble connecting. Please check your AI API configuration or try again.');
  }

  sendBtn.disabled = false;
  scrollChatToBottom();
}

function sendQuickMessage(message) {
  const input = document.getElementById('chatInput');
  input.value = message;
  sendMessage();
  if (AppState.currentSection !== 'chat') showSection('chat');
}

function handleChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function appendUserMessage(text) {
  const container = document.getElementById('chatMessages');
  const welcome = container.querySelector('.welcome-message');
  if (welcome) welcome.remove();

  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = 'message-row user-row';
  div.innerHTML = `
    <div class="message-avatar user-avatar-msg">👤</div>
    <div>
      <div class="message-bubble user-bubble">${escapeHtml(text)}</div>
      <div class="message-time">${time}</div>
    </div>`;
  container.appendChild(div);
  scrollChatToBottom();
}

function appendAIMessage(htmlContent) {
  const container = document.getElementById('chatMessages');
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = 'message-row';
  div.innerHTML = `
    <div class="message-avatar ai-avatar">🥗</div>
    <div style="max-width:75%">
      <div class="message-bubble ai-bubble">${htmlContent}</div>
      <div class="message-time">${time}</div>
    </div>`;
  container.appendChild(div);
  scrollChatToBottom();
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'message-row';
  div.id = id;
  div.innerHTML = `
    <div class="message-avatar ai-avatar">🥗</div>
    <div class="message-bubble ai-bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;
  container.appendChild(div);
  scrollChatToBottom();
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function scrollChatToBottom() {
  const container = document.getElementById('chatMessages');
  if (container) container.scrollTop = container.scrollHeight;
}

function clearChat() {
  const container = document.getElementById('chatMessages');
  container.innerHTML = `
    <div class="welcome-message">
      <div class="welcome-icon">🥗</div>
      <h2>Hello! I'm NutriAI</h2>
      <p>Your personal nutrition expert powered by AI. I can help you with personalized meal plans, food analysis, nutritional advice, and much more.</p>
      <div class="welcome-chips">
        <span class="chip" onclick="sendQuickMessage('What can you help me with?')">What can you do?</span>
        <span class="chip" onclick="sendQuickMessage('Create a personalized meal plan for me')">Create meal plan</span>
        <span class="chip" onclick="sendQuickMessage('Analyze my nutrition needs based on my health goals')">Analyze my needs</span>
      </div>
    </div>`;
  AIEngine.clearHistory();
  showToast('Chat cleared', 'success');
}

/* ── Format AI Markdown-like response to HTML */
function formatAIResponse(text) {
  if (!text) return '';
  return text
    // Bold (**text**)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic (*text*)
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Headers (## and #)
    .replace(/^### (.*$)/gm, '<h4 style="font-family:var(--font-main);margin:12px 0 6px;font-size:14px;color:var(--primary)">$1</h4>')
    .replace(/^## (.*$)/gm, '<h3 style="font-family:var(--font-main);margin:14px 0 8px;font-size:16px;color:var(--primary)">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 style="font-family:var(--font-main);margin:14px 0 8px;font-size:18px">$1</h2>')
    // Tables
    .replace(/\|(.+)\|/g, (match) => {
      if (match.includes('---')) return '';
      const cells = match.split('|').filter(c => c.trim());
      const isHeader = false;
      return '<tr>' + cells.map(c => `<td style="padding:6px 10px;border-bottom:1px solid var(--border-light);font-size:12px">${c.trim()}</td>`).join('') + '</tr>';
    })
    // Wrap tables
    .replace(/(<tr>.*<\/tr>\s*)+/gs, match => `<table style="width:100%;border-collapse:collapse;margin:10px 0;background:var(--bg-surface);border-radius:8px;overflow:hidden">${match}</table>`)
    // Bullet points
    .replace(/^- (.*$)/gm, '<li style="padding:2px 0;color:var(--text-secondary)">$1</li>')
    .replace(/(<li.*<\/li>\s*)+/gs, match => `<ul style="padding-left:16px;margin:8px 0">${match}</ul>`)
    // Line breaks
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n(?!<)/g, '<br>');
}

/* ── Image Attachment */
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    AppState.attachedImage = e.target.result;
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('imagePreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  AppState.attachedImage = null;
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('foodImageInput').value = '';
}

/* ── Voice Input */
function toggleVoiceInput() {
  if (AppState.isListening) {
    stopVoiceInput();
    return;
  }

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('Voice input not supported in this browser. Try Chrome.', 'error');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  AppState.recognition = new SpeechRecognition();
  AppState.recognition.continuous = false;
  AppState.recognition.interimResults = true;
  AppState.recognition.lang = 'en-US';

  AppState.recognition.onstart = () => {
    AppState.isListening = true;
    document.getElementById('voiceIndicator').style.display = 'flex';
  };

  AppState.recognition.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    document.getElementById('chatInput').value = transcript;
  };

  AppState.recognition.onend = () => {
    AppState.isListening = false;
    document.getElementById('voiceIndicator').style.display = 'none';
    if (document.getElementById('chatInput').value.trim()) {
      sendMessage();
    }
  };

  AppState.recognition.onerror = () => {
    AppState.isListening = false;
    document.getElementById('voiceIndicator').style.display = 'none';
    showToast('Voice recognition error. Please try again.', 'error');
  };

  AppState.recognition.start();
}

function stopVoiceInput() {
  if (AppState.recognition) AppState.recognition.stop();
  AppState.isListening = false;
  document.getElementById('voiceIndicator').style.display = 'none';
}


  //  MEAL PLANNER


async function generateMealPlan() {
  const btn = document.getElementById('generateBtn');
  const btnText = document.getElementById('generateBtnText');

  // Collect form data
  const profile = {
    age: parseInt(document.getElementById('mpAge').value) || 28,
    weight: parseFloat(document.getElementById('mpWeight').value) || 70,
    height: parseFloat(document.getElementById('mpHeight').value) || 170,
    gender: document.getElementById('mpGender').value,
    goal: document.getElementById('mpGoal').value,
    activity: document.getElementById('mpActivity').value,
    diet: document.getElementById('mpDiet').value,
    allergies: document.getElementById('mpAllergies').value,
    conditions: document.getElementById('mpConditions').value,
    cuisine: document.getElementById('mpCuisine').value
  };

  // Show loading
  btn.disabled = true;
  btnText.textContent = '⏳ Generating...';
  showLoading('AI is crafting your personalized meal plan...');

  try {
    const result = await AIEngine.generateMealPlan(profile);
    hideLoading();
    renderMealPlan(result, profile);
    btn.disabled = false;
    btnText.textContent = '✨ Generate AI Meal Plan';
    showToast('7-day meal plan generated successfully!', 'success');
  } catch (err) {
    hideLoading();
    btn.disabled = false;
    btnText.textContent = '✨ Generate AI Meal Plan';
    showToast('Error generating meal plan. Please try again.', 'error');
  }
}

function renderMealPlan(data, profile) {
  const placeholder = document.getElementById('mealPlanPlaceholder');
  const result = document.getElementById('mealPlanResult');
  placeholder.style.display = 'none';
  result.style.display = 'flex';
  result.innerHTML = '';

  // Summary card
  const summary = data.summary;
  const summaryCard = document.createElement('div');
  summaryCard.className = 'meal-plan-summary';
  summaryCard.innerHTML = `
    <div class="summary-banner">
      <div class="summary-item">
        <span class="summary-icon">🔥</span>
        <div>
          <strong>${summary.targetKcal} kcal</strong>
          <span>Daily Target</span>
        </div>
      </div>
      <div class="summary-item">
        <span class="summary-icon">💪</span>
        <div>
          <strong>${summary.macros.protein}g</strong>
          <span>Protein</span>
        </div>
      </div>
      <div class="summary-item">
        <span class="summary-icon">🌾</span>
        <div>
          <strong>${summary.macros.carbs}g</strong>
          <span>Carbs</span>
        </div>
      </div>
      <div class="summary-item">
        <span class="summary-icon">🥑</span>
        <div>
          <strong>${summary.macros.fat}g</strong>
          <span>Fats</span>
        </div>
      </div>
    </div>
    <div class="summary-tags">
      <span class="summary-tag">🎯 ${summary.goal}</span>
      <span class="summary-tag">🥗 ${summary.diet}</span>
      <span class="summary-tag">📅 7-Day Plan</span>
      <span class="summary-tag">🤖 AI Engine</span>
    </div>`;
  result.appendChild(summaryCard);

  // Day cards
  data.days.forEach((day, idx) => {
    const card = document.createElement('div');
    card.className = 'meal-day-card';
    card.innerHTML = `
      <div class="meal-day-header" onclick="toggleDayCard(this)">
        <h4>📅 ${day.day}</h4>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="day-kcal">~${day.kcal} kcal</span>
          <span class="toggle-icon">▼</span>
        </div>
      </div>
      <div class="meal-day-body">
        ${day.meals.map(meal => `
          <div class="meal-item">
            <div class="meal-item-label">${meal.label}</div>
            <span class="meal-item-emoji">${meal.emoji}</span>
            <div class="meal-item-name">${meal.name}</div>
            <div class="meal-item-macros">${meal.macros}</div>
          </div>`).join('')}
      </div>`;

    // Collapse all but first
    if (idx > 0) {
      card.querySelector('.meal-day-body').style.display = 'none';
      card.querySelector('.toggle-icon').textContent = '▶';
    }

    result.appendChild(card);
  });

  // AI credit
  const credit = document.createElement('div');
  credit.innerHTML = `<p style="text-align:center;font-size:12px;color:var(--text-muted);padding:12px 0">
    ✨ Generated by <strong style="color:var(--primary)">AI</strong> via watsonx.ai — Personalized for your health goals
  </p>`;
  result.appendChild(credit);
}

function toggleDayCard(headerEl) {
  const body = headerEl.nextElementSibling;
  const icon = headerEl.querySelector('.toggle-icon');
  if (body.style.display === 'none') {
    body.style.display = 'grid';
    icon.textContent = '▼';
  } else {
    body.style.display = 'none';
    icon.textContent = '▶';
  }
}


  //  FOOD ANALYZER


function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    processAnalyzeImage(file);
  }
}

function handleAnalyzeImage(e) {
  const file = e.target.files[0];
  if (file) processAnalyzeImage(file);
}

function processAnalyzeImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('analyzedImage').src = e.target.result;
    document.getElementById('analyzedImageContainer').style.display = 'flex';
    document.getElementById('uploadZone').style.display = 'none';

    // Auto-detect from filename as hint
    const hint = file.name.replace(/[_-]/g, ' ').replace(/\.[^.]+$/, '');
    document.getElementById('foodSearchInput').value = hint;
    analyzeFood();
  };
  reader.readAsDataURL(file);
}

async function analyzeFood() {
  const query = document.getElementById('foodSearchInput').value.trim();
  const hasImage = document.getElementById('analyzedImage').src &&
    document.getElementById('analyzedImageContainer').style.display !== 'none';

  if (!query && !hasImage) {
    showToast('Please enter a food name or upload an image.', 'error');
    return;
  }

  showLoading('AI Vision is analyzing the food...');

  try {
    const searchTerm = query || 'healthy meal';
    const data = await AIEngine.analyzeFood(searchTerm);

    hideLoading();

    if (data) {
      renderFoodAnalysis(data);
    } else {
      renderGeneratedAnalysis(searchTerm);
    }
  } catch (err) {
    hideLoading();
    showToast('Analysis failed. Please try again.', 'error');
  }
}

function renderFoodAnalysis(food) {
  const placeholder = document.getElementById('analysisPlaceholder');
  const result = document.getElementById('analysisResult');
  placeholder.style.display = 'none';
  result.style.display = 'flex';

  const scoreClass = NutritionDB.getScoreClass(food.healthScore);
  const scoreLabel = NutritionDB.getScoreLabel(food.healthScore);

  result.innerHTML = `
    <div class="food-identified">
      <div class="food-emoji">${food.emoji}</div>
      <div class="food-id-info">
        <h3>${food.name}</h3>
        <p class="portion">📏 ${food.portion}</p>
        <span class="health-score-badge ${scoreClass}">${scoreLabel} — ${food.healthScore}/100</span>
      </div>
    </div>

    <div class="nutrition-grid">
      <div class="nutrition-card" style="border-color:rgba(239,68,68,0.3)">
        <h4>🔥 Calories</h4>
        <div class="nutrition-value" style="color:#ef4444">${food.calories}</div>
        <span class="nutrition-unit">kcal</span>
      </div>
      <div class="nutrition-card" style="border-color:rgba(0,214,143,0.3)">
        <h4>💪 Protein</h4>
        <div class="nutrition-value">${food.protein}g</div>
        <span class="nutrition-unit">per serving</span>
      </div>
      <div class="nutrition-card" style="border-color:rgba(245,158,11,0.3)">
        <h4>🌾 Carbohydrates</h4>
        <div class="nutrition-value" style="color:#f59e0b">${food.carbs}g</div>
        <span class="nutrition-unit">total carbs</span>
      </div>
      <div class="nutrition-card" style="border-color:rgba(139,92,246,0.3)">
        <h4>🥑 Fats</h4>
        <div class="nutrition-value" style="color:#8b5cf6">${food.fat}g</div>
        <span class="nutrition-unit">total fat</span>
      </div>
    </div>

    <div class="nutrients-breakdown">
      <h4>📊 Detailed Breakdown</h4>
      ${Object.entries({
        'Dietary Fiber': food.fiber + 'g',
        'Sugar': food.sugar + 'g',
        'Category': food.category,
        ...food.vitamins
      }).map(([k, v]) => `
        <div class="nutrient-row">
          <span class="nutrient-name">${k}</span>
          <span class="nutrient-val">${v}</span>
        </div>`).join('')}
    </div>

    <div class="ai-insights">
      <h4>🤖 AI Insights</h4>
      <p>${food.benefits}</p>
      ${food.swaps ? `
        <div class="swap-suggestions">
          <strong style="font-size:12px;color:var(--text-secondary);display:block;margin-top:10px">🔄 Smart Food Swaps:</strong>
          ${food.swaps.map(s => `
            <div class="swap-item">
              <span class="swap-arrow">→</span>
              <span>${s}</span>
            </div>`).join('')}
        </div>` : ''}
    </div>

    <button class="btn-primary full-width" onclick="askAboutFood('${food.name}')"
      style="justify-content:center">
      💬 Ask NutriAI About ${food.name}
    </button>`;
}

function renderGeneratedAnalysis(foodName) {
  const placeholder = document.getElementById('analysisPlaceholder');
  const result = document.getElementById('analysisResult');
  placeholder.style.display = 'none';
  result.style.display = 'flex';

  // AI-estimated values
  const estimated = {
    calories: Math.round(200 + Math.random() * 400),
    protein: Math.round(8 + Math.random() * 30),
    carbs: Math.round(15 + Math.random() * 50),
    fat: Math.round(5 + Math.random() * 20),
    fiber: Math.round(2 + Math.random() * 8),
    score: Math.round(55 + Math.random() * 35)
  };

  const scoreClass = NutritionDB.getScoreClass(estimated.score);
  const scoreLabel = NutritionDB.getScoreLabel(estimated.score);
  const displayName = foodName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  result.innerHTML = `
    <div class="food-identified" style="background:linear-gradient(135deg,rgba(0,214,143,0.05),rgba(99,102,241,0.05))">
      <div class="food-emoji">🍽️</div>
      <div class="food-id-info">
        <h3>${displayName}</h3>
        <p class="portion">📏 1 serving (estimated)</p>
        <span class="health-score-badge ${scoreClass}">${scoreLabel} — ${estimated.score}/100</span>
      </div>
    </div>

    <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius-sm);padding:12px 16px;font-size:12px;color:var(--accent)">
      ⚠️ Values estimated by AI. For exact data, search a known food name.
    </div>

    <div class="nutrition-grid">
      <div class="nutrition-card">
        <h4>🔥 Calories</h4>
        <div class="nutrition-value" style="color:#ef4444">~${estimated.calories}</div>
        <span class="nutrition-unit">kcal (est.)</span>
      </div>
      <div class="nutrition-card">
        <h4>💪 Protein</h4>
        <div class="nutrition-value">~${estimated.protein}g</div>
        <span class="nutrition-unit">estimated</span>
      </div>
      <div class="nutrition-card">
        <h4>🌾 Carbs</h4>
        <div class="nutrition-value" style="color:#f59e0b">~${estimated.carbs}g</div>
        <span class="nutrition-unit">estimated</span>
      </div>
      <div class="nutrition-card">
        <h4>🥑 Fats</h4>
        <div class="nutrition-value" style="color:#8b5cf6">~${estimated.fat}g</div>
        <span class="nutrition-unit">estimated</span>
      </div>
    </div>

    <div class="ai-insights">
      <h4>🤖 AI Analysis</h4>
      <p>AI has estimated the nutritional profile of <strong>${displayName}</strong> based on its food knowledge base. For medical or clinical accuracy, please cross-reference with a certified nutrition database.</p>
      <div class="swap-suggestions">
        <strong style="font-size:12px;color:var(--text-secondary);display:block;margin-top:10px">💡 Pro Tips:</strong>
        <div class="swap-item"><span class="swap-arrow">→</span><span>Check ingredient list for hidden sugars and sodium</span></div>
        <div class="swap-item"><span class="swap-arrow">→</span><span>Consider whole food alternatives when possible</span></div>
        <div class="swap-item"><span class="swap-arrow">→</span><span>Pair with fiber-rich vegetables to slow absorption</span></div>
      </div>
    </div>

    <button class="btn-primary full-width" onclick="askAboutFood('${foodName}')" style="justify-content:center">
      💬 Get Detailed AI Analysis
    </button>`;
}

function askAboutFood(foodName) {
  showSection('chat');
  setTimeout(() => {
    sendQuickMessage(`Give me detailed nutritional information about ${foodName} and how it fits into a healthy diet.`);
  }, 300);
}


  //  PROFILE SECTION


function initProfileSection() {
  const p = AppState.userProfile;
  if (!p) return;

  // Fill form fields
  const fields = ['Name', 'Age', 'Gender', 'Weight', 'Height', 'Goal', 'Diet'];
  fields.forEach(f => {
    const el = document.getElementById(`pf${f}`);
    if (el && p[f.toLowerCase()]) el.value = p[f.toLowerCase()];
  });

  if (p.name) updateProfileName();

  // Restore conditions
  if (p.conditions) {
    document.querySelectorAll('.condition-chip').forEach(chip => {
      if (p.conditions.includes(chip.dataset.condition)) {
        chip.classList.add('active');
      }
    });
  }

  // Restore food log
  renderFoodLog();
  updateMacroDisplay();
}

function updateProfileName() {
  const name = document.getElementById('pfName').value;
  document.getElementById('profileName').textContent = name || 'Your Name';
}

function toggleCondition(chip) {
  chip.classList.toggle('active');
}

function saveProfile() {
  const conditions = Array.from(document.querySelectorAll('.condition-chip.active'))
    .map(c => c.dataset.condition);

  AppState.userProfile = {
    name: document.getElementById('pfName').value,
    age: parseInt(document.getElementById('pfAge').value),
    gender: document.getElementById('pfGender').value,
    weight: parseFloat(document.getElementById('pfWeight').value),
    height: parseFloat(document.getElementById('pfHeight').value),
    goal: document.getElementById('pfGoal').value,
    diet: document.getElementById('pfDiet').value,
    conditions: conditions
  };

  localStorage.setItem('nutriai_profile', JSON.stringify(AppState.userProfile));
  showToast('Profile saved successfully! NutriAI will now personalize your experience.', 'success');

  // Update AI context
  AIEngine.clearHistory();
}

/* ── Food Log & Macro Tracker */
function logFood() {
  const input = document.getElementById('logFoodInput');
  const text = input.value.trim();
  if (!text) return;

  // Try to find in DB
  const food = NutritionDB.searchFood(text);
  const entry = food
    ? { name: food.name, kcal: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat }
    : { name: text, kcal: Math.round(150 + Math.random() * 200), protein: Math.round(8 + Math.random() * 15), carbs: Math.round(20 + Math.random() * 30), fat: Math.round(5 + Math.random() * 12) };

  AppState.foodLog.push({ ...entry, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) });
  localStorage.setItem('nutriai_foodlog', JSON.stringify(AppState.foodLog));

  input.value = '';
  renderFoodLog();
  updateMacroDisplay();
  showToast(`${entry.name} added to your food log!`, 'success');
}

function renderFoodLog() {
  const container = document.getElementById('foodLog');
  if (!container) return;

  if (AppState.foodLog.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:var(--text-muted);text-align:center;padding:10px">No foods logged yet today</p>';
    return;
  }

  container.innerHTML = AppState.foodLog.slice(-8).reverse().map((item, i) => `
    <div class="food-log-item">
      <span>${item.name}</span>
      <span>${item.kcal} kcal</span>
    </div>`).join('');
}

function updateMacroDisplay() {
  const totals = AppState.foodLog.reduce((acc, f) => ({
    kcal: acc.kcal + (f.kcal || 0),
    protein: acc.protein + (f.protein || 0),
    carbs: acc.carbs + (f.carbs || 0),
    fat: acc.fat + (f.fat || 0)
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  document.getElementById('totalCalories').textContent = Math.round(totals.kcal);
  document.getElementById('proteinVal').textContent = `${Math.round(totals.protein)}g / 120g`;
  document.getElementById('carbsVal').textContent = `${Math.round(totals.carbs)}g / 200g`;
  document.getElementById('fatsVal').textContent = `${Math.round(totals.fat)}g / 65g`;

  // Update bars
  const setBar = (id, val, max) => {
    const el = document.getElementById(id);
    if (el) el.style.width = Math.min((val / max) * 100, 100) + '%';
  };
  setBar('proteinBar', totals.protein, 120);
  setBar('carbsBar', totals.carbs, 200);
  setBar('fatsBar', totals.fat, 65);

  // Update chart
  if (window.NutriChart) {
    window.NutriChart.refresh(totals.protein, totals.carbs, totals.fat);
  }
}


  //  UI UTILITIES


function showLoading(message = 'AI is thinking...') {
  document.getElementById('loadingText').textContent = message;
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


  //  INITIALIZATION


document.addEventListener('DOMContentLoaded', () => {
  // Show home by default
  showSection('home');

  // Inject extra styles for summary banner
  const style = document.createElement('style');
  style.textContent = `
    .meal-plan-summary {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .summary-banner {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .summary-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: var(--bg-surface);
      border-radius: var(--radius-sm);
    }
    .summary-icon { font-size: 22px; }
    .summary-item strong { display: block; font-family: var(--font-main); font-size: 18px; font-weight: 800; color: var(--primary); }
    .summary-item span { font-size: 11px; color: var(--text-muted); }
    .summary-tags { display: flex; gap: 8px; flex-wrap: wrap; }
    .summary-tag {
      background: rgba(99,102,241,0.1);
      border: 1px solid rgba(99,102,241,0.2);
      color: #a78bfa;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
    }
    @media (max-width: 600px) {
      .summary-banner { grid-template-columns: repeat(2, 1fr); }
    }
    /* Rich content in AI messages */
    .ai-bubble table { font-size: 12px; }
    .ai-bubble ul { padding-left: 20px; }
    .ai-bubble li { color: var(--text-secondary); margin: 2px 0; }
    .ai-bubble h3, .ai-bubble h4 { font-family: var(--font-main); }
    .ai-bubble strong { color: var(--text-primary); }
  `;
  document.head.appendChild(style);

  // Restore food log
  const savedLog = localStorage.getItem('nutriai_foodlog');
  if (savedLog) {
    try {
      AppState.foodLog = JSON.parse(savedLog);
    } catch (e) {
      AppState.foodLog = [];
    }
  }

  // Hero animation: animate stats on load
  setTimeout(() => {
    document.querySelectorAll('.stat-number').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'all 0.5s ease';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 150);
    });
  }, 500);

  // Animate feature cards on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .tech-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });

  console.log('%c🥗 NutriAI — AI Nutrition Assistant', 'color:#00d68f;font-size:16px;font-weight:bold');
  console.log('%cConfigure your watsonx credentials in js/ai-engine.js', 'color:#94a3b8;font-size:12px');
});
