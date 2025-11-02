// ======================================================================
// NBIM Quiz - Game Logic with ELO Ranking
// ======================================================================

// ELO Configuration
const ELO_CONFIG = {
  initialRating: 800,
  kFactor: 32,
  difficultyMultiplier: 0.5
};

// Game state
const gameState = {
  data: [],
  filteredData: [],
  currentQuestion: null,
  correctCount: 0,
  answeredCount: 0,
  totalCount: 0,
  currentCategory: 'all',
  selectedYears: [], // Array of selected years, empty = all years
  customFilters: {
    regions: [],
    countries: [],
    industries: [],
    years: []
  },
  eloHistory: [],
  elo: ELO_CONFIG.initialRating,
  availableData: [],
  // Cache for filter options
  filterOptions: {
    regions: [],
    countries: [],
    industries: [],
    years: []
  }
};

// Load ELO history from localStorage
function loadEloHistory() {
  const stored = localStorage.getItem('eloHistory');
  const storedElo = localStorage.getItem('elo');
  
  if (stored) {
    gameState.eloHistory = JSON.parse(stored);
  }
  
  if (storedElo) {
    gameState.elo = parseInt(storedElo);
  } else {
    gameState.elo = ELO_CONFIG.initialRating;
    gameState.eloHistory = [{ question: 0, elo: ELO_CONFIG.initialRating }];
  }
  
  updateEloDisplay();
}

// Save ELO history to localStorage
function saveEloHistory() {
  localStorage.setItem('eloHistory', JSON.stringify(gameState.eloHistory));
  localStorage.setItem('elo', gameState.elo.toString());
}

// Calculate ELO change
function calculateEloChange(isCorrect, difficultyLevel = 1) {
  const expectedScore = 1 / (1 + Math.pow(10, (difficultyLevel - (gameState.elo / 400))));
  const actualScore = isCorrect ? 1 : 0;
  const ratingChange = ELO_CONFIG.kFactor * (actualScore - expectedScore);
  return Math.round(ratingChange);
}

// Update ELO after answer
function updateElo(isCorrect) {
  const eloChange = calculateEloChange(isCorrect);
  gameState.elo += eloChange;
  gameState.eloHistory.push({
    question: gameState.totalCount,
    elo: gameState.elo
  });
  saveEloHistory();
  updateEloDisplay();
}

// Update ELO display
function updateEloDisplay() {
  const eloDisplay = document.getElementById('elo-display');
  if (eloDisplay) {
    eloDisplay.textContent = gameState.elo;
  }
  const eloDisplayHeader = document.getElementById('elo-display-header');
  if (eloDisplayHeader) {
    eloDisplayHeader.textContent = gameState.elo;
  }
}

// Theme management
function initTheme() {
  const theme = localStorage.getItem('theme') || 'system';
  setTheme(theme);
  
  // Theme toggle button
  document.getElementById('themeToggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleThemeMenu();
  });
  
  // Theme menu items
  document.querySelectorAll('.theme-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const theme = e.currentTarget.dataset.theme;
      setTheme(theme);
      closeThemeMenu();
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', () => closeThemeMenu());
}

function toggleThemeMenu() {
  const menu = document.getElementById('themeMenu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function closeThemeMenu() {
  const menu = document.getElementById('themeMenu');
  if (menu) {
    menu.classList.add('hidden');
  }
}

function setTheme(theme) {
  localStorage.setItem('theme', theme);
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    theme = systemTheme;
  }
  
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update active menu item
  document.querySelectorAll('.theme-menu-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.theme === localStorage.getItem('theme')) {
      item.classList.add('active');
    }
  });
  
  // Reinitialize icons
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
    gameState.availableData = [...gameState.data];
    
    // Precompute and cache filter options once
    gameState.filterOptions.regions = [...new Set(gameState.data.map(d => d.REGION))].sort();
    gameState.filterOptions.countries = [...new Set(gameState.data.map(d => d.COUNRTY || d.COUNTRY))].sort();
    gameState.filterOptions.industries = [...new Set(gameState.data.map(d => d.INDUSTRY))].sort();
    gameState.filterOptions.years = [...new Set(gameState.data.map(d => d.YEAR))].sort((a, b) => b - a);
    
    // Update stats
    const totalCompanies = document.getElementById('total-companies');
    if (totalCompanies) {
      totalCompanies.textContent = gameState.data.length.toLocaleString();
    }
    
    console.log(`Loaded ${gameState.data.length} companies`);
    
    // Hide loading screen
    hideLoadingScreen();
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Failed to load quiz data. Please refresh the page.');
    hideLoadingScreen();
  }
}

function showLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.remove('hidden');
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
}

// Initialize game
function initGame() {
  loadEloHistory();
  initTheme();
  setupEventListeners();
  loadData();
}

// Event listeners
function setupEventListeners() {
  // Start button
  document.getElementById('start-btn')?.addEventListener('click', startQuiz);
  
  // Apply settings button
  document.getElementById('apply-settings-btn')?.addEventListener('click', () => {
    applySettings();
  });
  
  // Year filter button
  document.getElementById('year-filter-btn')?.addEventListener('click', () => {
    showYearModal();
  });
  
  // Year modal
  document.getElementById('close-year-modal')?.addEventListener('click', () => {
    hideYearModal();
  });

  document.getElementById('apply-year-filter')?.addEventListener('click', () => {
    applyYearFilter();
  });

  document.getElementById('select-all-years')?.addEventListener('click', () => {
    selectAllYears();
  });

  document.getElementById('deselect-all-years')?.addEventListener('click', () => {
    deselectAllYears();
  });
  
  // Header title click
  document.getElementById('title-clickable')?.addEventListener('click', () => {
    window.location.reload();
  });
  
  // ELO modal
  document.getElementById('show-elo-btn')?.addEventListener('click', () => {
    showEloModal();
  });
  
  document.getElementById('close-elo-modal')?.addEventListener('click', () => {
    hideEloModal();
  });

  // Custom quiz modal
  document.getElementById('close-custom-quiz-modal')?.addEventListener('click', () => {
    // Don't capture filters here - let the Apply button do it
    hideCustomQuizModal();
  });

  document.getElementById('clear-all-custom-filters')?.addEventListener('click', () => {
    clearCustomFilters();
  });

  // Category selector change - open custom modal if custom selected
  const categorySelect = document.getElementById('category-select');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      checkForApplyChanges();
      if (e.target.value === 'custom') {
        showCustomQuizModal();
      } else {
        hideCustomQuizModal();
      }
    });
  }

  // Track filter changes using event delegation
  document.addEventListener('change', (e) => {
    if (e.target.closest('#year-checkboxes, #custom-quiz-modal')) {
      checkForApplyChanges();
    }
  });
}

// Show screens
function showWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcome-screen');
  const quizScreen = document.getElementById('quiz-screen');
  
  if (welcomeScreen) welcomeScreen.classList.remove('hidden');
  if (quizScreen) quizScreen.classList.add('hidden');
}

function showQuizScreen() {
  const welcomeScreen = document.getElementById('welcome-screen');
  const quizScreen = document.getElementById('quiz-screen');
  
  if (welcomeScreen) welcomeScreen.classList.add('hidden');
  if (quizScreen) quizScreen.classList.remove('hidden');
}

// Game functions
function resetGame() {
  gameState.correctCount = 0;
  gameState.answeredCount = 0;
  gameState.totalCount = 0;
  gameState.currentQuestion = null;
  
  // Apply filters based on current category
  if (gameState.currentCategory === 'custom') {
    gameState.availableData = applyCustomFilters([...gameState.data]);
  } else {
    gameState.availableData = filterByYears([...gameState.data]);
  }
  
  updateStatsDisplay();
  updateTotalCompaniesCount();
}

function updateTotalCompaniesCount() {
  const totalCompanies = document.getElementById('total-companies');
  if (totalCompanies) {
    totalCompanies.textContent = gameState.availableData.length.toLocaleString();
  }
}

function filterByYears(data) {
  if (gameState.selectedYears.length === 0) {
    return data;
  }
  return data.filter(company => gameState.selectedYears.includes(company.YEAR));
}

function applyCustomFilters(data) {
  let filtered = [...data];
  
  // Filter by regions
  if (gameState.customFilters.regions.length > 0) {
    filtered = filtered.filter(company => gameState.customFilters.regions.includes(company.REGION));
  }
  
  // Filter by countries
  if (gameState.customFilters.countries.length > 0) {
    filtered = filtered.filter(company => gameState.customFilters.countries.includes(company.COUNRTY || company.COUNTRY));
  }
  
  // Filter by industries
  if (gameState.customFilters.industries.length > 0) {
    filtered = filtered.filter(company => gameState.customFilters.industries.includes(company.INDUSTRY));
  }
  
  // Filter by years
  if (gameState.customFilters.years.length > 0) {
    filtered = filtered.filter(company => gameState.customFilters.years.includes(company.YEAR));
  }
  
  return filtered;
}

function applySettings() {
  // Show loading animation
  showLoadingScreen();
  
  // Get category from dropdown
  const categorySelect = document.getElementById('category-select');
  if (categorySelect) {
    gameState.currentCategory = categorySelect.value;
    
    // If custom quiz, capture custom filter selections
    if (gameState.currentCategory === 'custom') {
      captureCustomFilters();
    }
  }
  
  // Reset progress and go back to welcome screen
  setTimeout(() => {
    resetGame();
    showWelcomeScreen();
    hideLoadingScreen();
    clearApplyChangesIndicator();
  }, 300);
  
  // Close modals
  hideYearModal();
  hideCustomQuizModal();
}

function clearApplyChangesIndicator() {
  const applyBtn = document.getElementById('apply-settings-btn');
  if (applyBtn) {
    applyBtn.classList.remove('has-changes');
  }
}

function checkForApplyChanges() {
  const applyBtn = document.getElementById('apply-settings-btn');
  if (applyBtn) {
    applyBtn.classList.add('has-changes');
  }
}

function startQuiz() {
  if (gameState.data.length === 0) {
    showError('Data not loaded yet. Please wait...');
    return;
  }
  
  resetGame();
  generateNextQuestion();
  showQuizScreen();
  displayQuestion();
}

function generateNextQuestion() {
  if (gameState.availableData.length === 0) {
    gameState.availableData = filterByYears([...gameState.data]);
  }
  
  // Pick random company
  const randomIndex = Math.floor(Math.random() * gameState.availableData.length);
  const company = gameState.availableData[randomIndex];
  
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
  
  gameState.currentQuestion = {
    company,
    type: questionType,
    correctAnswer,
    options
  };
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
  const question = gameState.currentQuestion;
  if (!question) return;
  
  // Update company info
  const companyName = document.getElementById('company-name');
  if (companyName) companyName.textContent = question.company.NAME;
  
  // Generate details based on question type (hide the answer field)
  const companyDetails = document.getElementById('company-details');
  if (companyDetails) {
    const details = [];
    const type = question.type;
    
    // Always show market value
    details.push(`
      <div class="detail-item">
        <span class="detail-label">
          <i data-lucide="dollar-sign"></i> Market Value (NOK)
        </span>
        <span class="detail-value">${formatNumber(question.company.MVAL_NOK)}</span>
      </div>
    `);
    
    // Always show ownership
    details.push(`
      <div class="detail-item">
        <span class="detail-label">
          <i data-lucide="percent"></i> Ownership
        </span>
        <span class="detail-value">${question.company.OWNERSHIP}%</span>
      </div>
    `);
    
    // Show industry if NOT asking about industry
    if (type !== 'industry') {
      details.push(`
        <div class="detail-item">
          <span class="detail-label">
            <i data-lucide="building-2"></i> Industry
          </span>
          <span class="detail-value">${question.company.INDUSTRY}</span>
        </div>
      `);
    }
    
    // Show country if NOT asking about country
    if (type !== 'country') {
      details.push(`
        <div class="detail-item">
          <span class="detail-label">
            <i data-lucide="map-pin"></i> Country
          </span>
          <span class="detail-value">${question.company.COUNRTY || question.company.COUNTRY}</span>
        </div>
      `);
    }
    
    // Show region if NOT asking about region
    if (type !== 'region') {
      details.push(`
        <div class="detail-item">
          <span class="detail-label">
            <i data-lucide="globe"></i> Region
          </span>
          <span class="detail-value">${question.company.REGION}</span>
        </div>
      `);
    }
    
    // Show year if NOT asking about year
    if (type !== 'year') {
      details.push(`
        <div class="detail-item">
          <span class="detail-label">
            <i data-lucide="calendar"></i> Year
          </span>
          <span class="detail-value">${question.company.YEAR}</span>
        </div>
      `);
    }
    
    companyDetails.innerHTML = details.join('');
  }
  
  // Reinitialize icons
  lucide.createIcons();
  
  // Update question
  const questionText = document.getElementById('question-text');
  if (questionText) questionText.textContent = getQuestionText(question.type);
  
  // Display options
  const container = document.getElementById('options-container');
  if (container) {
    container.innerHTML = '';
    
    question.options.forEach((option) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = option;
      btn.onclick = () => selectAnswer(option, question);
      container.appendChild(btn);
    });
  }
  
  // Clear feedback
  const feedback = document.getElementById('feedback');
  if (feedback) {
    feedback.textContent = '';
    feedback.className = 'feedback';
  }
}

function selectAnswer(selectedAnswer, question) {
  const options = document.querySelectorAll('.option-btn');
  options.forEach(btn => {
    btn.disabled = true;
    btn.onclick = null;
  });
  
  const isCorrect = selectedAnswer === question.correctAnswer;
  
  // Update counts
  gameState.answeredCount++;
  gameState.totalCount++;
  if (isCorrect) {
    gameState.correctCount++;
  }
  
  // Update ELO
  updateElo(isCorrect);
  
  // Update displays
  updateStatsDisplay();
  
  // Show feedback
  const feedback = document.getElementById('feedback');
  if (feedback) {
    if (isCorrect) {
      feedback.textContent = 'Correct!';
      feedback.className = 'feedback success';
    } else {
      feedback.textContent = `Incorrect. The correct answer is: ${question.correctAnswer}`;
      feedback.className = 'feedback error';
    }
  }
  
  // Mark buttons
  options.forEach(btn => {
    if (btn.textContent === question.correctAnswer) {
      btn.classList.add('correct');
    } else if (btn.textContent === selectedAnswer && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });
  
  // Move to next question
  setTimeout(() => {
    generateNextQuestion();
    displayQuestion();
  }, 2000);
}

function updateStatsDisplay() {
  const correctCount = document.getElementById('correct-count');
  const answeredCount = document.getElementById('answered-count');
  const totalCount = document.getElementById('total-count');
  
  if (correctCount) correctCount.textContent = gameState.correctCount;
  if (answeredCount) answeredCount.textContent = gameState.answeredCount;
  if (totalCount) totalCount.textContent = gameState.availableData.length.toLocaleString();
}

function formatNumber(num) {
  return num ? num.toLocaleString('en-US') : 'N/A';
}

function showError(message) {
  alert(message);
}

// ELO Modal
function showEloModal() {
  const modal = document.getElementById('elo-modal');
  if (modal) {
    modal.classList.remove('hidden');
    drawEloChart();
  }
}

function hideEloModal() {
  const modal = document.getElementById('elo-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function drawEloChart() {
  const canvas = document.getElementById('elo-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width = 800;
  const height = canvas.height = 400;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Set styles based on theme
  const isDark = window.getComputedStyle(document.documentElement).getPropertyValue('--text-primary') !== '#0f172a';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const lineColor = isDark ? '#60a5fa' : '#3b82f6';
  const textColor = isDark ? '#cbd5e1' : '#64748b';
  
  // Find min/max for scaling
  let minElo = Infinity, maxElo = Infinity;
  if (gameState.eloHistory.length > 0) {
    minElo = Math.min(...gameState.eloHistory.map(h => h.elo));
    maxElo = Math.max(...gameState.eloHistory.map(h => h.elo));
    const range = maxElo - minElo;
    minElo = minElo - range * 0.1;
    maxElo = maxElo + range * 0.1;
  }
  
  // Draw grid
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = 50 + (height - 100) * (i / 5);
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(width - 20, y);
    ctx.stroke();
    
    // Y-axis labels
    if (gameState.eloHistory.length > 0) {
      const value = maxElo - (maxElo - minElo) * (i / 5);
      ctx.fillStyle = textColor;
      ctx.font = '12px Space Grotesk';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toString(), 55, y + 4);
    }
  }
  
  // Draw axes
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 2;
  
  // Y-axis
  ctx.beginPath();
  ctx.moveTo(60, 50);
  ctx.lineTo(60, height - 50);
  ctx.stroke();
  
  // X-axis
  ctx.beginPath();
  ctx.moveTo(60, height - 50);
  ctx.lineTo(width - 20, height - 50);
  ctx.stroke();
  
  // Draw line
  if (gameState.eloHistory.length > 1) {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    gameState.eloHistory.forEach((point, index) => {
      const x = 60 + ((width - 80) / (gameState.eloHistory.length - 1)) * index;
      const y = height - 50 - ((height - 100) * ((point.elo - minElo) / (maxElo - minElo)));
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw points
    gameState.eloHistory.forEach((point, index) => {
      const x = 60 + ((width - 80) / (gameState.eloHistory.length - 1)) * index;
      const y = height - 50 - ((height - 100) * ((point.elo - minElo) / (maxElo - minElo)));
      
      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  // Labels
  ctx.fillStyle = textColor;
  ctx.font = 'bold 14px Space Grotesk';
  ctx.textAlign = 'center';
  ctx.fillText('Questions Answered', width / 2, height - 10);
  
  ctx.save();
  ctx.translate(20, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('ELO Rating', 0, 0);
  ctx.restore();
  
  // Reset for lucide icons
  lucide.createIcons();
}

// Year Filter Functions
function showYearModal() {
  const modal = document.getElementById('year-modal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Use cached years
    const years = gameState.filterOptions.years;
    
    // Create checkboxes
    const checkboxes = document.getElementById('year-checkboxes');
    if (checkboxes) {
      checkboxes.innerHTML = '';
      years.forEach(year => {
        const item = document.createElement('div');
        item.className = 'year-checkbox-item';
        const isChecked = gameState.selectedYears.length === 0 || gameState.selectedYears.includes(year);
        item.innerHTML = `
          <input type="checkbox" id="year-${year}" value="${year}" ${isChecked ? 'checked' : ''}>
          <label for="year-${year}">${year}</label>
        `;
        checkboxes.appendChild(item);
      });
    }
  }
}

function hideYearModal() {
  const modal = document.getElementById('year-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function selectAllYears() {
  document.querySelectorAll('#year-checkboxes input[type="checkbox"]').forEach(cb => {
    cb.checked = true;
  });
}

function deselectAllYears() {
  document.querySelectorAll('#year-checkboxes input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
}

function applyYearFilter() {
  const checkboxes = document.querySelectorAll('#year-checkboxes input[type="checkbox"]:checked');
  gameState.selectedYears = Array.from(checkboxes).map(cb => parseInt(cb.value));
  
  // Update button text
  const filterText = document.getElementById('year-filter-text');
  if (filterText) {
    if (gameState.selectedYears.length === 0) {
      filterText.textContent = 'All Years';
    } else if (gameState.selectedYears.length === 1) {
      filterText.textContent = gameState.selectedYears[0];
    } else {
      filterText.textContent = `${gameState.selectedYears.length} Years`;
    }
  }
  
  hideYearModal();
}

// Custom Quiz Functions
function showCustomQuizModal() {
  const modal = document.getElementById('custom-quiz-modal');
  if (modal && gameState.data.length > 0) {
    modal.classList.remove('hidden');
    
    // Use cached filter options
    populateCustomFilter('region-checkboxes', gameState.filterOptions.regions, 'region', gameState.customFilters.regions);
    populateCustomFilter('country-checkboxes', gameState.filterOptions.countries, 'country', gameState.customFilters.countries);
    populateCustomFilter('industry-checkboxes', gameState.filterOptions.industries, 'industry', gameState.customFilters.industries);
    populateCustomFilter('year-checkboxes-custom', gameState.filterOptions.years, 'year', gameState.customFilters.years);
  }
}

function populateCustomFilter(containerId, values, prefix, selectedValues) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
    values.forEach(value => {
      const item = document.createElement('div');
      item.className = 'filter-checkbox-item';
      const isChecked = selectedValues.length === 0 || selectedValues.includes(value);
      item.innerHTML = `
        <input type="checkbox" id="${prefix}-${value}" value="${value}" ${isChecked ? 'checked' : ''}>
        <label for="${prefix}-${value}">${value}</label>
      `;
      container.appendChild(item);
    });
  }
}

function hideCustomQuizModal() {
  const modal = document.getElementById('custom-quiz-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function clearCustomFilters() {
  // Clear all checkboxes
  document.querySelectorAll('#custom-quiz-modal input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
}

function captureCustomFilters() {
  // Capture selected regions
  const regionCheckboxes = document.querySelectorAll('#region-checkboxes input[type="checkbox"]:checked');
  gameState.customFilters.regions = Array.from(regionCheckboxes).map(cb => cb.value);
  
  // Capture selected countries
  const countryCheckboxes = document.querySelectorAll('#country-checkboxes input[type="checkbox"]:checked');
  gameState.customFilters.countries = Array.from(countryCheckboxes).map(cb => cb.value);
  
  // Capture selected industries
  const industryCheckboxes = document.querySelectorAll('#industry-checkboxes input[type="checkbox"]:checked');
  gameState.customFilters.industries = Array.from(industryCheckboxes).map(cb => cb.value);
  
  // Capture selected years
  const yearCheckboxes = document.querySelectorAll('#year-checkboxes-custom input[type="checkbox"]:checked');
  gameState.customFilters.years = Array.from(yearCheckboxes).map(cb => parseInt(cb.value));
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (localStorage.getItem('theme') === 'system') {
    setTheme('system');
  }
});

// Redraw chart when theme changes
const observer = new MutationObserver(() => {
  const modal = document.getElementById('elo-modal');
  if (modal && !modal.classList.contains('hidden')) {
    drawEloChart();
  }
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme']
});
