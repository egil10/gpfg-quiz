# NBIM Quiz - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- `pandas` - For reading and processing Excel files
- `openpyxl` - Excel file support for pandas

### 2. Process the Data

**Automated (Recommended):**
```bash
python setup.py
```

**Manual:**
```bash
python process_data.py
```

### 3. Verify the Data (Optional)
```bash
python verify_data.py
```

### 4. Start the Web Server

Choose one of these options:

**Option A - Python:**
```bash
python -m http.server 8000
```

**Option B - Node.js:**
```bash
npx http-server
```

**Option C - VS Code Live Server:**
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### 5. Open in Browser
Navigate to: `http://localhost:8000`

---

## Data Flow

```
📁 data/equities.xlsx (Source Excel file)
     ↓
🔄 process_data.py (Python script)
     ↓
📁 data/processed/
   ├── nbim_holdings.json (187,118 companies) ← Used by web app
   └── statistics.json (Dataset statistics)
```

---

## Updating Data

When you receive a new Excel file:

1. Replace the old file:
   ```bash
   # Windows
   copy new_equities.xlsx data\equities.xlsx
   
   # Linux/Mac
   cp new_equities.xlsx data/equities.xlsx
   ```

2. Regenerate JSON files:
   ```bash
   python process_data.py
   ```

3. Refresh your browser - the app will load the new data!

---

## Troubleshooting

### Issue: "Module not found: pandas"
**Solution:** Install dependencies
```bash
pip install -r requirements.txt
```

### Issue: "File not found: equities.xlsx"
**Solution:** Ensure the Excel file is in the correct location:
```
data/equities.xlsx
```

### Issue: Web app shows "Failed to load data"
**Solution:** 
1. Make sure you're running a web server (not opening index.html directly)
2. Verify JSON files exist: `data/processed/nbim_holdings.json`
3. Check browser console for errors (F12)

### Issue: Changes not appearing
**Solution:** Hard refresh your browser:
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

---

## Dataset Information

The processed dataset includes:

- **187,118 companies** from the NBIM portfolio
- **108 countries** across all continents
- **10 regions** (Asia, North America, Europe, etc.)
- **16 industries** (Technology, Healthcare, Financials, etc.)
- **Years:** 1998 - 2025 (28 years of data)
- **Total Portfolio Value:** ~$12.9 trillion USD

### Top Countries (by company count):
1. United States - 44,216 companies
2. Japan - 31,950 companies
3. China - 11,810 companies
4. United Kingdom - 9,847 companies
5. Taiwan - 8,927 companies

### Top Industries (by company count):
1. Industrials - 38,403 companies
2. Financials - 33,294 companies
3. Consumer Services - 18,929 companies
4. Technology - 17,944 companies
5. Consumer Goods - 17,794 companies

---

## Scripts Overview

### `process_data.py`
- Reads `data/equities.xlsx`
- Cleans data (fixes column names, validates types)
- Generates `nbim_holdings.json`
- Generates `statistics.json`

### `verify_data.py`
- Validates JSON files
- Checks data structure
- Displays statistics
- Shows sample data

### `setup.py`
- Automated setup workflow
- Checks all dependencies
- Runs data processing
- Runs verification
- Provides server instructions

---

## Browser Compatibility

✅ **Supported Browsers:**
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

---

## File Structure

```
gpfg-quiz/
├── index.html                    # Main web page
├── assets/
│   ├── css/
│   │   └── style.css            # Styles
│   └── js/
│       └── script.js            # Game logic
├── data/
│   ├── equities.xlsx            # Source data (Excel)
│   └── processed/
│       ├── nbim_holdings.json   # Processed data (JSON)
│       └── statistics.json      # Dataset statistics
├── process_data.py              # Data processing script
├── verify_data.py               # Data verification script
├── setup.py                     # Automated setup script
├── requirements.txt             # Python dependencies
├── README.md                    # Project overview
└── SETUP_GUIDE.md              # This file
```

---

## Development Tips

### Testing Changes
After modifying the code:
1. Hard refresh browser: `Ctrl + Shift + R`
2. Check browser console (F12) for errors
3. Verify JSON files are valid

### Performance
The app is optimized for large datasets:
- Memory caching
- Batch DOM updates
- Efficient data filtering
- Throttled animations

### Adding Features
Some ideas for enhancements:
- [ ] New quiz categories (market cap ranges, etc.)
- [ ] Difficulty levels
- [ ] Time challenges
- [ ] Multiplayer mode
- [ ] Export/share results
- [ ] Dark mode
- [ ] Additional languages

---

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify all files are in correct locations
3. Check browser console for errors (F12)
4. Ensure you're running from a web server

---

## Summary

✅ Excel data successfully converted to JSON
✅ 187,118 companies ready for quizzing
✅ Web app can load and use the data
✅ All scripts working correctly

**You're all set! Start the server and enjoy the quiz!** 🎉

