// ======================================================================
// NBIM Quiz - Game Logic
// ======================================================================

// Game state
const gameState = {
  data: [],
  filteredData: [],
  currentQuestion: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  totalQuestions: 10,
  questions: [],
  currentCategory: 'all'
};

// Theme management
function initTheme() {
  const theme = localStorage.getItem('theme') || 'system';
  setTheme(theme);
  
  // Set active theme button
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`theme-${theme}`).classList.add('active');
  
  // Add event listeners
  document.getElementById('theme-light')?.addEventListener('click', () => setTheme('light'));
  document.getElementById('theme-dark')?.addEventListener('click', () => setTheme('dark'));
  document.getElementById('theme-system')?.addEventListener('click', () => setTheme('system'));
}

function setTheme(theme) {
  localStorage.setItem('theme', theme);
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    theme = systemTheme;
  }
  
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update active button
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const btn = document.getElementById(`theme-${localStorage.getItem('theme')}`);
  if (btn) btn.classList.add('active');
  
  // Reinitialize icons with new colors
  lucide.createIcons();
}

// Data loading
async function loadData() {
  try {
    const response = await fetch('data/equities.json');
    if (!response.ok) throw new Error('Failed to load data');
    
    const minimalData = await response.json();
    
    // Expand minimal data to full format for compatibility
    gameState.data = minimalData.map(d => ({
      NAME: d.n,
      COUNRTY: d.c,
      REGION: d.r,
      INDUSTRY: d.i,
      YEAR: d.y,
      OWNERSHIP: d.o,
      MVAL_NOK: d.m
    }));
    
    gameState.filteredData = gameState.data;
    
    // Update stats
    document.getElementById('total-companies').textContent = 
      gameState.data.length.toLocaleString();
    
    console.log(`Loaded ${gameState.data.length} companies`);
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Failed to load quiz data. Please refresh the page.');
  }
}

// Initialize game
function initGame() {
  initTheme();
  setupEventListeners();
  loadData();
}

// Event listeners
function setupEventListeners() {
  // Start button
  document.getElementById('start-btn')?.addEventListener('click', startQuiz);
  
  // Category selector
  document.getElementById('category-select')?.addEventListener('change', (e) => {
    gameState.currentCategory = e.target.value;
  });
  
  // Play again
  document.getElementById('play-again-btn')?.addEventListener('click', () => {
    startQuiz();
  });
  
  // Back home
  document.getElementById('back-home-btn')?.addEventListener('click', () => {
    showWelcomeScreen();
    resetGame();
  });
}

// Show screens
function showWelcomeScreen() {
  document.getElementById('welcome-screen').classList.remove('hidden');
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('results-screen').classList.add('hidden');
}

function showQuizScreen() {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('quiz-screen').classList.remove('hidden');
  document.getElementById('results-screen').classList.add('hidden');
}

function showResultsScreen() {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('results-screen').classList.remove('hidden');
}

// Game functions
function resetGame() {
  gameState.currentQuestion = 0;
  gameState.score = 0;
  gameState.streak = 0;
  gameState.maxStreak = 0;
  gameState.questions = [];
}

function startQuiz() {
  if (gameState.data.length === 0) {
    showError('Data not loaded yet. Please wait...');
    return;
  }
  
  resetGame();
  generateQuestions();
  showQuizScreen();
  displayQuestion();
}

function generateQuestions() {
  gameState.questions = [];
  const availableData = [...gameState.data];
  
  for (let i = 0; i < gameState.totalQuestions; i++) {
    if (availableData.length === 0) break;
    
    // Pick random company
    const randomIndex = Math.floor(Math.random() * availableData.length);
    const company = availableData.splice(randomIndex, 1)[0];
    
    // Determine question type
    let questionType = gameState.currentCategory;
    if (questionType === 'all') {
      const types = ['country', 'industry', 'region', 'year'];
      questionType = types[Math.floor(Math.random() * types.length)];
    }
    
    // Get correct answer
    const correctAnswer = getCorrectAnswer(company, questionType);
    
    // Generate options
    const options = generateOptions(company, questionType);
    
    gameState.questions.push({
      company,
      type: questionType,
      correctAnswer,
      options
    });
  }
}

function getCorrectAnswer(company, type) {
  switch (type) {
    case 'country':
      return company.COUNRTY || company.COUNTRY;
    case 'industry':
      return company.INDUSTRY;
    case 'region':
      return company.REGION;
    case 'year':
      return company.YEAR.toString();
    default:
      return company.COUNRTY || company.COUNTRY;
  }
}

function generateOptions(correctCompany, type) {
  const correctAnswer = getCorrectAnswer(correctCompany, type);
  const options = [correctAnswer];
  
  // Get unique values for this type
  const uniqueValues = new Set();
  gameState.data.forEach(company => {
    const value = getCorrectAnswer(company, type);
    if (value && value !== correctAnswer) {
      uniqueValues.add(value);
    }
  });
  
  const uniqueArray = Array.from(uniqueValues);
  
  // Add 3 more random options
  while (options.length < 4 && uniqueArray.length > 0) {
    const randomIndex = Math.floor(Math.random() * uniqueArray.length);
    const randomValue = uniqueArray.splice(randomIndex, 1)[0];
    if (!options.includes(randomValue)) {
      options.push(randomValue);
    }
  }
  
  // Shuffle options
  return shuffleArray(options);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getQuestionText(type) {
  const texts = {
    country: 'Which country is this company from?',
    industry: 'Which industry does this company belong to?',
    region: 'Which region is this company from?',
    year: 'In which year was this company in the portfolio?'
  };
  return texts[type] || 'Which country is this company from?';
}

function displayQuestion() {
  if (gameState.currentQuestion >= gameState.questions.length) {
    endGame();
    return;
  }
  
  const question = gameState.questions[gameState.currentQuestion];
  
  // Update header
  document.getElementById('current-question').textContent = gameState.currentQuestion + 1;
  document.getElementById('total-questions').textContent = gameState.totalQuestions;
  document.getElementById('current-score').textContent = gameState.score;
  document.getElementById('current-streak').textContent = gameState.streak;
  
  // Update company info
  document.getElementById('company-name').textContent = question.company.NAME;
  document.getElementById('company-details').innerHTML = `
    <div class="detail-item">
      <span class="detail-label">
        <i data-lucide="dollar-sign"></i> Market Value (NOK)
      </span>
      <span class="detail-value">${formatNumber(question.company.MVAL_NOK)}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">
        <i data-lucide="percent"></i> Ownership
      </span>
      <span class="detail-value">${question.company.OWNERSHIP}%</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">
        <i data-lucide="building-2"></i> Industry
      </span>
      <span class="detail-value">${question.company.INDUSTRY}</span>
    </div>
  `;
  
  // Reinitialize icons
  lucide.createIcons();
  
  // Update question
  document.getElementById('question-text').textContent = getQuestionText(question.type);
  
  // Display options
  const container = document.getElementById('options-container');
  container.innerHTML = '';
  
  question.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.onclick = () => selectAnswer(option, question);
    container.appendChild(btn);
  });
  
  // Clear feedback
  const feedback = document.getElementById('feedback');
  feedback.textContent = '';
  feedback.className = 'feedback';
}

function selectAnswer(selectedAnswer, question) {
  const options = document.querySelectorAll('.option-btn');
  options.forEach(btn => {
    btn.disabled = true;
    btn.onclick = null;
  });
  
  const isCorrect = selectedAnswer === question.correctAnswer;
  
  // Update score and streak
  if (isCorrect) {
    gameState.score++;
    gameState.streak++;
    if (gameState.streak > gameState.maxStreak) {
      gameState.maxStreak = gameState.streak;
    }
  } else {
    gameState.streak = 0;
  }
  
  // Show feedback
  const feedback = document.getElementById('feedback');
  if (isCorrect) {
    feedback.textContent = '✓ Correct!';
    feedback.className = 'feedback success';
  } else {
    feedback.textContent = `✗ Incorrect. The correct answer is: ${question.correctAnswer}`;
    feedback.className = 'feedback error';
  }
  
  // Mark buttons
  options.forEach(btn => {
    if (btn.textContent === question.correctAnswer) {
      btn.classList.add('correct');
    } else if (btn.textContent === selectedAnswer && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });
  
  // Update score display
  document.getElementById('current-score').textContent = gameState.score;
  document.getElementById('current-streak').textContent = gameState.streak;
  
  // Move to next question
  setTimeout(() => {
    gameState.currentQuestion++;
    displayQuestion();
  }, 2000);
}

function endGame() {
  showResultsScreen();
  
  const percentage = Math.round((gameState.score / gameState.totalQuestions) * 100);
  
  // Update results
  document.getElementById('final-score').textContent = `${gameState.score}/${gameState.totalQuestions}`;
  document.getElementById('final-percentage').textContent = `${percentage}%`;
  document.getElementById('final-streak').textContent = gameState.maxStreak;
  
  // Show message
  const message = document.getElementById('results-message');
  if (percentage === 100) {
    message.textContent = 'Perfect score! You\'re a NBIM expert! 🎉';
    message.style.background = 'var(--success-light)';
    message.style.color = 'var(--success)';
  } else if (percentage >= 80) {
    message.textContent = 'Excellent work! You know your stuff! 🎯';
    message.style.background = 'var(--success-light)';
    message.style.color = 'var(--success)';
  } else if (percentage >= 60) {
    message.textContent = 'Good job! Keep learning! 💪';
    message.style.background = 'var(--accent-light)';
    message.style.color = 'var(--accent-primary)';
  } else {
    message.textContent = 'Not bad! Try again to improve! 📚';
    message.style.background = 'var(--bg-secondary)';
    message.style.color = 'var(--text-secondary)';
  }
  
  // Reinitialize icons
  lucide.createIcons();
}

function formatNumber(num) {
  return num ? num.toLocaleString('en-US') : 'N/A';
}

function showError(message) {
  alert(message);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (localStorage.getItem('theme') === 'system') {
    setTheme('system');
  }
});
