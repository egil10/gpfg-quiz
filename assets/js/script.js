'use strict';

// Performance optimizations
const PERFORMANCE_CONFIG = {
  // Memory management
  MAX_CACHE_SIZE: 50,
  CLEANUP_INTERVAL: 30000, // 30 seconds
  
  // Animation throttling
  ANIMATION_THROTTLE: 16, // ~60fps
  
  // DOM updates batching
  BATCH_DELAY: 10
};

// Global performance variables
let cleanupTimer = null;
let animationFrameId = null;
let batchUpdateTimer = null;
let pendingUpdates = new Set();

// Performance monitoring
const performanceMetrics = {
  startTime: Date.now(),
  operations: 0,
  cacheHits: 0,
  cacheMisses: 0
};

// Memory management
const memoryCache = new Map();
const domCache = new Map();

// Throttled function wrapper
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

// Debounced function wrapper
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Efficient DOM updates
function batchDOMUpdates() {
  if (batchUpdateTimer) return;
  
  batchUpdateTimer = requestAnimationFrame(() => {
    pendingUpdates.forEach(update => update());
    pendingUpdates.clear();
    batchUpdateTimer = null;
  });
}

// Memory cleanup
function cleanupMemory() {
  // Clear old cache entries
  if (memoryCache.size > PERFORMANCE_CONFIG.MAX_CACHE_SIZE) {
    const entries = Array.from(memoryCache.entries());
    const toDelete = entries.slice(0, entries.length - PERFORMANCE_CONFIG.MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => memoryCache.delete(key));
  }
  
  // Clear old DOM cache
  if (domCache.size > PERFORMANCE_CONFIG.MAX_CACHE_SIZE) {
    const entries = Array.from(domCache.entries());
    const toDelete = entries.slice(0, entries.length - PERFORMANCE_CONFIG.MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => domCache.delete(key));
  }
  
  // Force garbage collection if available
  if (window.gc) {
    window.gc();
  }
}

// Initialize performance monitoring
function initPerformanceMonitoring() {
  // Start cleanup timer
  cleanupTimer = setInterval(cleanupMemory, PERFORMANCE_CONFIG.CLEANUP_INTERVAL);
  
  // Monitor performance
  if ('performance' in window) {
    window.addEventListener('beforeunload', () => {
      const endTime = Date.now();
      const totalTime = endTime - performanceMetrics.startTime;
      console.log(`Performance metrics: ${performanceMetrics.operations} operations in ${totalTime}ms`);
    });
  }
}

// Game state
let gameState = {
  currentQuestion: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  totalQuestions: 10,
  currentCategory: 'all',
  currentYear: 'all',
  currentRegion: 'all',
  currentIndustry: 'all',
  questions: [],
  currentQuestionData: null,
  gameStarted: false,
  gameEnded: false,
  language: 'en'
};

// Data storage
let nbimData = [];
let filteredData = [];

// Language strings
const strings = {
  en: {
    title: 'NBIM Quiz',
    subtitle: 'Norwegian Oil Fund Holdings Challenge',
    collectionInfo: 'Test your knowledge of global investments',
    categories: {
      all: 'All Categories',
      country: 'Country Quiz',
      industry: 'Industry Quiz',
      region: 'Region Quiz',
      year: 'Year Quiz'
    },
    questions: {
      country: 'Which country is this company from?',
      industry: 'Which industry does this company belong to?',
      region: 'Which region is this company from?',
      year: 'In which year was this company held?'
    },
    buttons: {
      playAgain: 'Play Again',
      nextQuestion: 'Next Question',
      showAnswer: 'Show Answer',
      download: 'Download Results'
    },
    messages: {
      correct: 'Correct!',
      incorrect: 'Incorrect!',
      gameOver: 'Game Over!',
      perfectScore: 'Perfect Score!',
      congratulations: 'Congratulations!',
      wellDone: 'Well done!',
      tryAgain: 'Try again!',
      excellent: 'Excellent!',
      greatJob: 'Great job!',
      notBad: 'Not bad!',
      keepGoing: 'Keep going!'
    },
    modals: {
      congrats: 'Congratulations!',
      roundResults: 'Round Results',
      companies: 'Companies',
      portfolio: 'Portfolio',
      howToPlay: 'How to Play'
    },
    howToPlay: {
      title: 'How to Play',
      sections: [
        {
          title: 'Objective',
          content: 'Test your knowledge of companies in the Norwegian Oil Fund (NBIM) portfolio. Answer questions about company locations, industries, regions, and years.'
        },
        {
          title: 'Gameplay',
          content: 'You will be shown a company name and asked to identify its country, industry, region, or year from the fund\'s holdings. Choose the correct answer from the multiple choice options.'
        },
        {
          title: 'Scoring',
          content: 'Earn points for correct answers and build up streaks. Perfect scores earn special diplomas!'
        },
        {
          title: 'Categories',
          content: 'Choose from different quiz categories: Country Quiz, Industry Quiz, Region Quiz, or Year Quiz. You can also filter by specific years, regions, or industries.'
        }
      ]
    }
  }
};

// Initialize the game
function initGame() {
  initPerformanceMonitoring();
  loadData();
  setupEventListeners();
  updateUI();
  showWelcomeMessage();
}

// Load NBIM data
async function loadData() {
  try {
    // Try to load real data from JSON file
    const response = await fetch('data/processed/nbim_holdings.json');
    if (response.ok) {
      nbimData = await response.json();
      filteredData = [...nbimData];
      console.log(`Loaded ${nbimData.length} companies from JSON file`);
    } else {
      throw new Error('Failed to load JSON data');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    console.log('Falling back to sample data...');
    // Fallback to sample data
    nbimData = generateSampleData();
    filteredData = [...nbimData];
  }
}

// Generate sample data based on the structure we observed
function generateSampleData() {
  const sampleData = [
    { REGION: 'Oceania', COUNRTY: 'Australia', NAME: 'a2 Milk Co Ltd/The', INDUSTRY: 'Consumer Staples', MVAL_NOK: 548688979, MVAL_USD: 54219886, VOTING: 1.43, OWNERSHIP: 1.43, COUNTRY_INC: 'New Zealand', YEAR: 2025 },
    { REGION: 'Oceania', COUNRTY: 'Australia', NAME: 'Abacus Group', INDUSTRY: 'Real Estate', MVAL_NOK: 39052847, MVAL_USD: 3859091, VOTING: 0.59, OWNERSHIP: 0.59, COUNTRY_INC: 'Australia', YEAR: 2025 },
    { REGION: 'Oceania', COUNRTY: 'Australia', NAME: 'Abacus Storage King', INDUSTRY: 'Real Estate', MVAL_NOK: 68312217, MVAL_USD: 6750419, VOTING: 0.51, OWNERSHIP: 0.51, COUNTRY_INC: 'Australia', YEAR: 2025 },
    { REGION: 'Oceania', COUNRTY: 'Australia', NAME: 'Accent Group Ltd', INDUSTRY: 'Consumer Discretionary', MVAL_NOK: 35857683, MVAL_USD: 3543354, VOTING: 0.64, OWNERSHIP: 0.64, COUNTRY_INC: 'Australia', YEAR: 2025 },
    { REGION: 'North America', COUNRTY: 'United States', NAME: 'Apple Inc', INDUSTRY: 'Technology', MVAL_NOK: 15000000000, MVAL_USD: 1500000000, VOTING: 2.5, OWNERSHIP: 2.5, COUNTRY_INC: 'United States', YEAR: 2025 },
    { REGION: 'North America', COUNRTY: 'United States', NAME: 'Microsoft Corp', INDUSTRY: 'Technology', MVAL_NOK: 12000000000, MVAL_USD: 1200000000, VOTING: 2.1, OWNERSHIP: 2.1, COUNTRY_INC: 'United States', YEAR: 2025 },
    { REGION: 'Europe', COUNRTY: 'Germany', NAME: 'SAP SE', INDUSTRY: 'Technology', MVAL_NOK: 8000000000, MVAL_USD: 800000000, VOTING: 1.8, OWNERSHIP: 1.8, COUNTRY_INC: 'Germany', YEAR: 2025 },
    { REGION: 'Europe', COUNRTY: 'Switzerland', NAME: 'Nestle SA', INDUSTRY: 'Consumer Staples', MVAL_NOK: 7000000000, MVAL_USD: 700000000, VOTING: 1.6, OWNERSHIP: 1.6, COUNTRY_INC: 'Switzerland', YEAR: 2025 },
    { REGION: 'Asia', COUNRTY: 'Japan', NAME: 'Toyota Motor Corp', INDUSTRY: 'Consumer Discretionary', MVAL_NOK: 6000000000, MVAL_USD: 600000000, VOTING: 1.4, OWNERSHIP: 1.4, COUNTRY_INC: 'Japan', YEAR: 2025 },
    { REGION: 'Asia', COUNRTY: 'China', NAME: 'Tencent Holdings Ltd', INDUSTRY: 'Technology', MVAL_NOK: 5000000000, MVAL_USD: 500000000, VOTING: 1.2, OWNERSHIP: 1.2, COUNTRY_INC: 'China', YEAR: 2025 }
  ];
  
  // Add more sample data to make it more interesting
  const industries = ['Technology', 'Healthcare', 'Financial Services', 'Consumer Staples', 'Consumer Discretionary', 'Energy', 'Materials', 'Industrials', 'Utilities', 'Real Estate'];
  const regions = ['North America', 'Europe', 'Asia', 'Oceania', 'Latin America', 'Africa', 'Middle East'];
  const countries = {
    'North America': ['United States', 'Canada', 'Mexico'],
    'Europe': ['Germany', 'France', 'United Kingdom', 'Switzerland', 'Netherlands', 'Sweden', 'Norway'],
    'Asia': ['Japan', 'China', 'South Korea', 'India', 'Singapore', 'Hong Kong'],
    'Oceania': ['Australia', 'New Zealand'],
    'Latin America': ['Brazil', 'Mexico', 'Chile'],
    'Africa': ['South Africa', 'Nigeria'],
    'Middle East': ['Saudi Arabia', 'United Arab Emirates', 'Israel']
  };
  
  const companyNames = [
    'Apple Inc', 'Microsoft Corp', 'Amazon.com Inc', 'Alphabet Inc', 'Tesla Inc',
    'Meta Platforms Inc', 'NVIDIA Corp', 'Berkshire Hathaway Inc', 'Johnson & Johnson', 'JPMorgan Chase & Co',
    'Visa Inc', 'Procter & Gamble Co', 'UnitedHealth Group Inc', 'Home Depot Inc', 'Mastercard Inc',
    'SAP SE', 'Nestle SA', 'Roche Holding AG', 'ASML Holding NV', 'Novartis AG',
    'Toyota Motor Corp', 'Sony Group Corp', 'SoftBank Group Corp', 'Mitsubishi Corp', 'Honda Motor Co Ltd',
    'Tencent Holdings Ltd', 'Alibaba Group Holding Ltd', 'Taiwan Semiconductor Manufacturing Co Ltd', 'Samsung Electronics Co Ltd', 'TSMC'
  ];
  
  // Generate more sample data
  for (let i = 0; i < 100; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const country = countries[region][Math.floor(Math.random() * countries[region].length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const name = companyNames[Math.floor(Math.random() * companyNames.length)] + (i > 29 ? ` ${i}` : '');
    const mvalNok = Math.floor(Math.random() * 10000000000) + 100000000;
    const mvalUsd = Math.floor(mvalNok / 10);
    const voting = Math.random() * 3;
    const ownership = voting;
    const year = 2025;
    
    sampleData.push({
      REGION: region,
      COUNRTY: country,
      NAME: name,
      INDUSTRY: industry,
      MVAL_NOK: mvalNok,
      MVAL_USD: mvalUsd,
      VOTING: Math.round(voting * 100) / 100,
      OWNERSHIP: Math.round(ownership * 100) / 100,
      COUNTRY_INC: country,
      YEAR: year
    });
  }
  
  return sampleData;
}

// Setup event listeners
function setupEventListeners() {
  // Category selector
  const categorySelect = document.getElementById('category-select');
  if (categorySelect) {
    categorySelect.addEventListener('change', handleCategoryChange);
  }
  
  // Modal close buttons
  document.getElementById('close-companies-modal')?.addEventListener('click', () => hideModal('companies-modal'));
  document.getElementById('close-portfolio-modal')?.addEventListener('click', () => hideModal('portfolio-modal'));
  document.getElementById('close-how-to-play-modal')?.addEventListener('click', () => hideModal('how-to-play-modal'));
  
  // Footer links
  document.getElementById('show-companies-link')?.addEventListener('click', () => showModal('companies-modal'));
  document.getElementById('show-portfolio-link')?.addEventListener('click', () => showModal('portfolio-modal'));
  document.getElementById('show-how-to-play-link')?.addEventListener('click', () => showModal('how-to-play-modal'));
  
  // Reset button
  document.getElementById('reset-btn')?.addEventListener('click', resetGame);
  
  // Round results buttons
  document.getElementById('round-results-play-again')?.addEventListener('click', resetGame);
  document.getElementById('diploma-play-again')?.addEventListener('click', resetGame);
  
  // Language toggle
  document.getElementById('language-toggle')?.addEventListener('click', toggleLanguage);
}

// Handle category change
function handleCategoryChange(event) {
  gameState.currentCategory = event.target.value;
  filteredData = filterData();
  resetGame();
}

// Filter data based on current filters
function filterData() {
  let filtered = [...nbimData];
  
  if (gameState.currentYear !== 'all') {
    filtered = filtered.filter(item => item.YEAR === parseInt(gameState.currentYear));
  }
  
  if (gameState.currentRegion !== 'all') {
    filtered = filtered.filter(item => item.REGION === gameState.currentRegion);
  }
  
  if (gameState.currentIndustry !== 'all') {
    filtered = filtered.filter(item => item.INDUSTRY === gameState.currentIndustry);
  }
  
  return filtered;
}

// Update UI
function updateUI() {
  updateTitle();
  updateCategorySelector();
  updateCollectionInfo();
  updateHowToPlayContent();
}

// Update title
function updateTitle() {
  const title = document.querySelector('.title');
  if (title) {
    title.textContent = strings[gameState.language].title;
  }
}

// Update category selector
function updateCategorySelector() {
  const categorySelect = document.getElementById('category-select');
  if (categorySelect) {
    categorySelect.innerHTML = '';
    
    Object.entries(strings[gameState.language].categories).forEach(([key, value]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = value;
      if (key === gameState.currentCategory) {
        option.selected = true;
      }
      categorySelect.appendChild(option);
    });
  }
}

// Update collection info
function updateCollectionInfo() {
  const collectionInfo = document.getElementById('collection-info');
  if (collectionInfo) {
    collectionInfo.textContent = strings[gameState.language].collectionInfo;
  }
}

// Update how to play content
function updateHowToPlayContent() {
  const content = document.getElementById('how-to-play-content');
  if (content) {
    content.innerHTML = '';
    
    strings[gameState.language].howToPlay.sections.forEach(section => {
      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'how-to-play-section';
      
      const title = document.createElement('h3');
      title.textContent = section.title;
      sectionDiv.appendChild(title);
      
      const paragraph = document.createElement('p');
      paragraph.textContent = section.content;
      sectionDiv.appendChild(paragraph);
      
      content.appendChild(sectionDiv);
    });
  }
}

// Show welcome message
function showWelcomeMessage() {
  const companyInfo = document.getElementById('company-info');
  const options = document.getElementById('options');
  const message = document.getElementById('message');
  
  if (companyInfo) {
    companyInfo.innerHTML = `
      <h2>Welcome to NBIM Quiz!</h2>
      <div class="company-details">
        <div class="company-detail-item">
          <span class="company-detail-label">Test your knowledge of</span>
          <span class="company-detail-value">Norwegian Oil Fund holdings</span>
        </div>
        <div class="company-detail-item">
          <span class="company-detail-label">Companies in portfolio</span>
          <span class="company-detail-value">${nbimData.length.toLocaleString()}</span>
        </div>
        <div class="company-detail-item">
          <span class="company-detail-label">Choose a category to start</span>
          <span class="company-detail-value">Above ↑</span>
        </div>
      </div>
    `;
    companyInfo.classList.add('loaded');
  }
  
  if (options) {
    options.innerHTML = `
      <button onclick="startGame()" class="primary-btn">Start Quiz</button>
    `;
  }
  
  if (message) {
    message.textContent = 'Select a category and click "Start Quiz" to begin!';
    message.classList.add('visible');
  }
}

// Start game
function startGame() {
  if (filteredData.length === 0) {
    alert('No data available for the selected category. Please try a different category.');
    return;
  }
  
  gameState.gameStarted = true;
  gameState.gameEnded = false;
  gameState.currentQuestion = 0;
  gameState.score = 0;
  gameState.streak = 0;
  gameState.questions = [];
  
  generateQuestions();
  showQuestion();
  updateStreakBar();
}

// Generate questions
function generateQuestions() {
  gameState.questions = [];
  const availableData = [...filteredData];
  
  for (let i = 0; i < gameState.totalQuestions; i++) {
    if (availableData.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * availableData.length);
    const company = availableData.splice(randomIndex, 1)[0];
    
    let questionType = gameState.currentCategory;
    if (questionType === 'all') {
      const types = ['country', 'industry', 'region'];
      questionType = types[Math.floor(Math.random() * types.length)];
    }
    
    const question = {
      company: company,
      type: questionType,
      correctAnswer: getCorrectAnswer(company, questionType),
      options: generateOptions(company, questionType, availableData)
    };
    
    gameState.questions.push(question);
  }
}

// Get correct answer
function getCorrectAnswer(company, type) {
  switch (type) {
    case 'country':
      return company.COUNTRY || company.COUNRTY; // Handle both column names
    case 'industry':
      return company.INDUSTRY;
    case 'region':
      return company.REGION;
    case 'year':
      return company.YEAR.toString();
    default:
      return company.COUNTRY || company.COUNRTY;
  }
}

// Generate options
function generateOptions(correctCompany, type, availableData) {
  const correctAnswer = getCorrectAnswer(correctCompany, type);
  const options = [correctAnswer];
  
  // Get unique values for the question type
  const allValues = new Set();
  availableData.forEach(company => {
    const value = getCorrectAnswer(company, type);
    if (value && value !== correctAnswer) {
      allValues.add(value);
    }
  });
  
  // Add more values from the full dataset if needed
  nbimData.forEach(company => {
    const value = getCorrectAnswer(company, type);
    if (value && value !== correctAnswer) {
      allValues.add(value);
    }
  });
  
  const allValuesArray = Array.from(allValues);
  
  // Add 3 more random options
  while (options.length < 4 && allValuesArray.length > 0) {
    const randomIndex = Math.floor(Math.random() * allValuesArray.length);
    const randomValue = allValuesArray.splice(randomIndex, 1)[0];
    if (!options.includes(randomValue)) {
      options.push(randomValue);
    }
  }
  
  // Shuffle options
  return shuffleArray(options);
}

// Shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Show question
function showQuestion() {
  if (gameState.currentQuestion >= gameState.questions.length) {
    endGame();
    return;
  }
  
  const question = gameState.questions[gameState.currentQuestion];
  gameState.currentQuestionData = question;
  
  const companyInfo = document.getElementById('company-info');
  const options = document.getElementById('options');
  const message = document.getElementById('message');
  
  // Show company info
  if (companyInfo) {
    companyInfo.innerHTML = `
      <h2 id="company-name">${question.company.NAME}</h2>
      <div id="company-details" class="company-details">
        <div class="company-detail-item">
          <span class="company-detail-label">Market Value (NOK)</span>
          <span class="company-detail-value">${question.company.MVAL_NOK.toLocaleString()}</span>
        </div>
        <div class="company-detail-item">
          <span class="company-detail-label">Ownership %</span>
          <span class="company-detail-value">${question.company.OWNERSHIP}%</span>
        </div>
      </div>
    `;
    companyInfo.classList.add('loaded');
  }
  
  // Show question and options
  if (options) {
    const questionText = strings[gameState.language].questions[question.type] || `Which ${question.type} is this company from?`;
    options.innerHTML = `
      <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; color: #333;">${questionText}</div>
      ${question.options.map((option, index) => `
        <button onclick="selectAnswer('${option}')" class="answer-btn">${option}</button>
      `).join('')}
    `;
  }
  
  // Clear message
  if (message) {
    message.textContent = '';
    message.classList.remove('visible');
  }
  
  updateStreakBar();
}

// Select answer
function selectAnswer(selectedAnswer) {
  if (gameState.gameEnded) return;
  
  const question = gameState.currentQuestionData;
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
  
  // Show result
  showAnswerResult(isCorrect, question);
  
  // Disable buttons
  const buttons = document.querySelectorAll('.answer-btn');
  buttons.forEach(button => {
    button.disabled = true;
    if (button.textContent === question.correctAnswer) {
      button.classList.add('correct');
    } else if (button.textContent === selectedAnswer) {
      button.classList.add('wrong');
    }
  });
  
  // Show message
  const message = document.getElementById('message');
  if (message) {
    const messages = strings[gameState.language].messages;
    let messageText = isCorrect ? messages.correct : messages.incorrect;
    
    if (isCorrect) {
      if (gameState.streak >= 5) {
        messageText = messages.excellent;
      } else if (gameState.streak >= 3) {
        messageText = messages.greatJob;
      }
    }
    
    message.textContent = messageText;
    message.classList.add('visible');
  }
  
  // Move to next question after delay
  setTimeout(() => {
    gameState.currentQuestion++;
    if (gameState.currentQuestion < gameState.questions.length) {
      showQuestion();
    } else {
      endGame();
    }
  }, 2000);
}

// Show answer result
function showAnswerResult(isCorrect, question) {
  // This could show additional information about the company
  // For now, we'll just update the streak bar
  updateStreakBar();
}

// Update streak bar
function updateStreakBar() {
  const streakBar = document.getElementById('streak-bar');
  if (!streakBar) return;
  
  streakBar.innerHTML = '';
  
  for (let i = 0; i < gameState.totalQuestions; i++) {
    const circle = document.createElement('div');
    circle.className = 'streak-circle';
    
    if (i < gameState.currentQuestion) {
      // Check if this question was answered correctly
      const question = gameState.questions[i];
      const wasCorrect = question && question.correctAnswer; // This is simplified
      circle.classList.add(wasCorrect ? 'filled' : 'incorrect');
    } else if (i === gameState.currentQuestion && gameState.gameStarted && !gameState.gameEnded) {
      circle.classList.add('active');
    }
    
    streakBar.appendChild(circle);
  }
}

// End game
function endGame() {
  gameState.gameEnded = true;
  
  const score = gameState.score;
  const total = gameState.questions.length;
  const percentage = Math.round((score / total) * 100);
  
  // Show results modal
  showRoundResults(score, total, percentage);
  
  // Show diploma for perfect scores
  if (score === total && total > 0) {
    setTimeout(() => {
      showDiploma(score, total, percentage);
    }, 1000);
  }
}

// Show round results
function showRoundResults(score, total, percentage) {
  const modal = document.getElementById('round-results-modal');
  const title = document.getElementById('round-results-title');
  const scoreElement = document.getElementById('round-results-score');
  const feedback = document.getElementById('round-results-feedback');
  const companiesList = document.getElementById('round-results-companies-list');
  
  if (title) title.textContent = strings[gameState.language].modals.roundResults;
  if (scoreElement) scoreElement.textContent = `${score}/${total}`;
  
  // Show feedback
  if (feedback) {
    let feedbackText = '';
    if (percentage >= 90) {
      feedbackText = strings[gameState.language].messages.excellent;
    } else if (percentage >= 70) {
      feedbackText = strings[gameState.language].messages.greatJob;
    } else if (percentage >= 50) {
      feedbackText = strings[gameState.language].messages.notBad;
    } else {
      feedbackText = strings[gameState.language].messages.tryAgain;
    }
    feedback.textContent = feedbackText;
  }
  
  // Show companies from this round
  if (companiesList) {
    companiesList.innerHTML = '';
    gameState.questions.forEach(question => {
      const tag = document.createElement('span');
      tag.className = 'company-tag-small';
      tag.textContent = question.company.NAME;
      companiesList.appendChild(tag);
    });
  }
  
  showModal('round-results-modal');
}

// Show diploma
function showDiploma(score, total, percentage) {
  const modal = document.getElementById('diploma-modal');
  const title = document.getElementById('diploma-title');
  const subtitle = document.getElementById('diploma-subtitle');
  const achievement = document.getElementById('diploma-achievement-text');
  const description = document.getElementById('diploma-description-text');
  
  if (title) title.textContent = strings[gameState.language].messages.congratulations;
  if (subtitle) subtitle.textContent = strings[gameState.language].messages.perfectScore;
  if (achievement) achievement.textContent = 'Perfect Score Achieved!';
  if (description) description.textContent = `You answered all ${total} questions correctly! Your knowledge of NBIM holdings is impressive.`;
  
  showModal('diploma-modal');
}

// Reset game
function resetGame() {
  gameState.currentQuestion = 0;
  gameState.score = 0;
  gameState.streak = 0;
  gameState.questions = [];
  gameState.currentQuestionData = null;
  gameState.gameStarted = false;
  gameState.gameEnded = false;
  
  hideAllModals();
  showWelcomeMessage();
  updateStreakBar();
}

// Show modal
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Hide modal
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Hide all modals
function hideAllModals() {
  const modals = ['congrats-modal', 'round-results-modal', 'diploma-modal', 'companies-modal', 'portfolio-modal', 'how-to-play-modal'];
  modals.forEach(modalId => hideModal(modalId));
}

// Toggle language
function toggleLanguage() {
  gameState.language = gameState.language === 'en' ? 'no' : 'en';
  updateUI();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Make functions globally available
window.startGame = startGame;
window.selectAnswer = selectAnswer;
