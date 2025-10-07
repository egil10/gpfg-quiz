#!/usr/bin/env python3
"""
Data verification script for NBIM Quiz
Checks that the JSON data is valid and accessible
"""

import json
import sys
from pathlib import Path

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def verify_data():
    """Verify that the processed JSON files are valid"""
    
    # Check if files exist
    holdings_file = Path('data/processed/nbim_holdings.json')
    stats_file = Path('data/processed/statistics.json')
    
    if not holdings_file.exists():
        print("❌ Error: nbim_holdings.json not found!")
        print("   Run 'python process_data.py' to generate the data files.")
        return False
    
    if not stats_file.exists():
        print("❌ Error: statistics.json not found!")
        print("   Run 'python process_data.py' to generate the data files.")
        return False
    
    # Load and verify holdings data
    try:
        with open(holdings_file, 'r', encoding='utf-8') as f:
            holdings = json.load(f)
        
        print(f"✅ Holdings data loaded successfully")
        print(f"   Total companies: {len(holdings):,}")
        
        # Verify data structure
        if len(holdings) > 0:
            sample = holdings[0]
            required_fields = ['REGION', 'COUNTRY', 'NAME', 'INDUSTRY', 'MVAL_NOK', 
                             'MVAL_USD', 'VOTING', 'OWNERSHIP', 'COUNTRY_INC', 'YEAR']
            
            missing_fields = [field for field in required_fields if field not in sample]
            if missing_fields:
                print(f"⚠️  Warning: Missing fields in data: {', '.join(missing_fields)}")
            else:
                print(f"✅ All required fields present")
            
            # Show sample company
            print(f"\n📊 Sample company:")
            print(f"   Name: {sample.get('NAME')}")
            print(f"   Country: {sample.get('COUNTRY')}")
            print(f"   Industry: {sample.get('INDUSTRY')}")
            print(f"   Region: {sample.get('REGION')}")
            print(f"   Year: {sample.get('YEAR')}")
            print(f"   Value (USD): ${sample.get('MVAL_USD', 0):,}")
        
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in holdings file: {e}")
        return False
    except Exception as e:
        print(f"❌ Error loading holdings data: {e}")
        return False
    
    # Load and verify statistics
    try:
        with open(stats_file, 'r', encoding='utf-8') as f:
            stats = json.load(f)
        
        print(f"\n✅ Statistics data loaded successfully")
        print(f"\n📈 Statistics Summary:")
        print(f"   Total companies: {stats.get('total_companies', 0):,}")
        print(f"   Total regions: {len(stats.get('regions', {}))}")
        print(f"   Total countries: {len(stats.get('countries', {}))}")
        print(f"   Total industries: {len(stats.get('industries', {}))}")
        print(f"   Total value (USD): ${stats.get('total_value_usd', 0):,}")
        
        # Show top 5 countries
        countries = stats.get('countries', {})
        if countries:
            print(f"\n🌍 Top 5 Countries:")
            for i, (country, count) in enumerate(list(countries.items())[:5], 1):
                print(f"   {i}. {country}: {count:,} companies")
        
        # Show top 5 industries
        industries = stats.get('industries', {})
        if industries:
            print(f"\n🏭 Top 5 Industries:")
            for i, (industry, count) in enumerate(list(industries.items())[:5], 1):
                print(f"   {i}. {industry}: {count:,} companies")
        
        # Show available years
        years = stats.get('years', {})
        if years:
            year_list = sorted([int(y) for y in years.keys()])
            print(f"\n📅 Available Years: {year_list[0]} - {year_list[-1]}")
            print(f"   Total years: {len(year_list)}")
        
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in statistics file: {e}")
        return False
    except Exception as e:
        print(f"❌ Error loading statistics data: {e}")
        return False
    
    print("\n✅ All data files verified successfully!")
    print("\n🚀 Ready to start the quiz!")
    print("   Run: python -m http.server 8000")
    print("   Then open: http://localhost:8000")
    
    return True

if __name__ == '__main__':
    verify_data()

