# GPFG Quiz - Norwegian Oil Fund Holdings Quiz

A modern, interactive quiz game testing your knowledge of companies in the Norwegian Government Pension Fund Global (GPFG) portfolio. Built with vanilla HTML, CSS, and JavaScript for GitHub Pages.

## Features

- **Multiple Quiz Categories**: Country, Industry, Region, Year, Custom, and more
- **Custom Quiz Builder**: Create your own quiz by selecting any combination of regions, countries, industries, and years
- **Year Filtering**: Choose specific years or all years for quiz questions
- **Real NBIM Data**: 187,000+ companies from actual holdings
- **Endless Quiz**: Keep playing and improving your knowledge
- **ELO Ranking**: Track your performance with ELO ranking system
- **Progress Graph**: Visualize your ELO progress over time
- **Modern Design**: Clean UI with theme support (light/dark/system)
- **Grotesk Font**: Beautiful typography using Space Grotesk
- **Lucide Icons**: Sleek, modern iconography
- **Responsive**: Works beautifully on all devices
- **Fast**: Optimized for quick loading and smooth gameplay
- **GitHub Pages Ready**: Deploy directly to GitHub Pages

## Quick Start

Just open `index.html` in your browser! No build process, no dependencies.

For production deployment, serve via GitHub Pages or any static host.

## Data

The quiz uses real data from the Norwegian Government Pension Fund Global (GPFG) holdings, managed by Norges Bank Investment Management (NBIM):
- **187,118 companies** across 108 countries
- **16 industries**
- **10 global regions**
- **Market values** in NOK
- **Ownership percentages**
- **Optimized data format** - 60% smaller file size

Data source: `data/equities.json` (optimized JSON, 20MB)

## Quiz Categories

1. **Country Quiz** - Guess which country a company is from
2. **Industry Quiz** - Identify the company's industry sector
3. **Region Quiz** - Match companies to their global regions
4. **Year Quiz** - Identify when companies were in the portfolio
5. **All Categories** - Random mix of all question types
6. **Custom Quiz** - Build your own quiz by selecting any combination of filters

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, Grid, Flexbox
- **Vanilla JavaScript** - No frameworks, pure performance
- **Lucide Icons** - Modern icon library
- **Space Grotesk** - Google Fonts

## Project Structure

```
├── index.html              # Main quiz page
├── assets/
│   ├── css/
│   │   └── style.css       # All styles (themes, responsive)
│   └── js/
│       └── script.js       # Game logic
├── data/
│   ├── equities.json       # Company data (187k+ companies)
│   └── equities.xlsx       # Source Excel (gitignored)
└── README.md               # This file
```

## Deployment

### GitHub Pages

1. Push to GitHub
2. Go to Settings → Pages
3. Select main branch
4. Deploy!

The quiz works perfectly on GitHub Pages with no configuration needed.

## Themes

The app supports three themes:
- **Light** - Bright, clean interface
- **Dark** - Eye-friendly dark mode
- **System** - Follows your OS preference

Toggle via the theme selector in the top bar.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use and modify!

## About the GPFG

The Government Pension Fund Global (GPFG) is Norway's sovereign wealth fund, managed by Norges Bank Investment Management (NBIM). It's one of the world's largest investment funds, created to invest the surplus wealth generated from Norway's petroleum sector for future generations.

## Acknowledgments

- Data from Norges Bank Investment Management (NBIM)
- Inspired by popular quiz applications
- Built with modern web technologies
