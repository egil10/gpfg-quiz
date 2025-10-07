# NBIM Quiz - Norwegian Oil Fund Holdings Challenge

A fun and educational quiz game that tests your knowledge of companies in the Norwegian Oil Fund (NBIM) portfolio. Based on the popular art quiz format, this application challenges players to identify companies by their country, industry, region, or year of investment.

## Features

- **Multiple Quiz Categories**: Test your knowledge with Country Quiz, Industry Quiz, Region Quiz, or Year Quiz
- **Real NBIM Data**: Uses actual holdings data from the Norwegian Oil Fund (187,000+ companies)
- **Interactive Gameplay**: Multiple choice questions with immediate feedback
- **Streak Tracking**: Build up streaks for consecutive correct answers
- **Achievement System**: Earn diplomas for perfect scores
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface inspired by popular quiz applications

## Data

The quiz uses real data from the Norwegian Oil Fund (NBIM) holdings, including:
- 187,118 companies across 108 countries
- 16 different industries
- 10 global regions
- Market values in both NOK and USD
- Ownership percentages and voting rights

## Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Install dependencies
pip install -r requirements.txt

# Run the automated setup script
python setup.py
```

This will:
- ✅ Check all dependencies
- ✅ Verify the Excel data file exists
- ✅ Process data from Excel to JSON
- ✅ Verify the generated JSON files
- ✅ Provide instructions for starting the server

### Option 2: Manual Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Process the Data**:
   ```bash
   python process_data.py
   ```
   This converts the Excel data (`data/equities.xlsx`) to JSON format for the web application.

3. **Verify the Data** (optional):
   ```bash
   python verify_data.py
   ```
   This checks that the JSON files are valid and displays statistics about the dataset.

4. **Serve the Application**:
   Since the application loads JSON data via fetch, you'll need to serve it from a web server:
   
   **Option A: Python HTTP Server**
   ```bash
   python -m http.server 8000
   ```
   
   **Option B: Node.js HTTP Server**
   ```bash
   npx http-server
   ```
   
   **Option C: Live Server (VS Code Extension)**
   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"

5. **Open in Browser**:
   Navigate to `http://localhost:8000` (or the port shown by your server)

## How to Play

1. **Choose a Category**: Select from All Categories, Country Quiz, Industry Quiz, Region Quiz, or Year Quiz
2. **Start the Quiz**: Click "Start Quiz" to begin
3. **Answer Questions**: You'll see a company name and be asked to identify its country, industry, region, or year
4. **Build Streaks**: Consecutive correct answers build up your streak
5. **Earn Achievements**: Perfect scores earn special diplomas!

## Quiz Categories

- **Country Quiz**: Identify which country a company is from
- **Industry Quiz**: Determine the industry sector of a company
- **Region Quiz**: Match companies to their global regions
- **Year Quiz**: Identify when companies were held in the portfolio
- **All Categories**: Mix of all question types

## Technical Details

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data Processing**: Python with pandas
- **Data Format**: JSON (converted from Excel)
- **Performance**: Optimized for large datasets with caching and memory management
- **Responsive**: Mobile-first design with breakpoints for different screen sizes

## File Structure

```
├── index.html                   # Main HTML file
├── assets/
│   ├── css/
│   │   └── style.css           # Main stylesheet
│   └── js/
│       └── script.js           # Game logic and data handling
├── data/
│   ├── equities.xlsx           # Source Excel data
│   └── processed/
│       ├── nbim_holdings.json  # Processed JSON data (used by app)
│       └── statistics.json     # Data statistics
├── process_data.py             # Data processing script
├── verify_data.py              # Data verification script
├── setup.py                    # Automated setup script
├── requirements.txt            # Python dependencies
├── run_quiz.bat                # Windows: Quick start (just run server)
├── setup_and_run.bat           # Windows: Full setup + run
├── logo.svg                    # Application logo
├── README.md                   # This file
└── SETUP_GUIDE.md              # Detailed setup guide
```

## Data Processing

### Scripts

1. **`setup.py`** - Automated setup and verification
   - Checks dependencies
   - Verifies Excel file exists
   - Processes data
   - Verifies output
   - Provides server instructions

2. **`process_data.py`** - Data processing
   - Reads the Excel file with NBIM holdings data
   - Cleans and validates the data (e.g., fixes "COUNRTY" typo to "COUNTRY")
   - Converts to JSON format for web consumption
   - Generates statistics about the dataset
   - Handles data type conversions and formatting

3. **`verify_data.py`** - Data verification
   - Validates JSON files
   - Checks data structure
   - Displays statistics
   - Shows sample data

### Data Flow

```
data/equities.xlsx
        ↓ (process_data.py)
data/processed/
    ├── nbim_holdings.json    ← Main data file (used by web app)
    └── statistics.json       ← Dataset statistics
```

### Updating Data

When you get a new Excel file:
```bash
# 1. Replace the Excel file
cp new_equities.xlsx data/equities.xlsx

# 2. Run the automated setup
python setup.py

# Or just process the data
python process_data.py
```

The JSON files will be regenerated automatically.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

Feel free to contribute improvements, bug fixes, or new features! Some ideas:
- Additional quiz categories
- More detailed company information
- Social sharing features
- Leaderboards
- More languages

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by the Norwegian art quiz format
- Data from the Norwegian Oil Fund (NBIM)
- Built with modern web technologies