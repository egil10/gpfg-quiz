#!/usr/bin/env python3
"""
Data processing script for NBIM Quiz
Converts Excel data to JSON format for the web application
"""

import pandas as pd
import json
import os
from pathlib import Path

def process_nbim_data():
    """Process the NBIM holdings data from Excel to JSON"""
    
    # Read the Excel file
    excel_file = Path('data/equities.xlsx')
    if not excel_file.exists():
        print(f"Error: {excel_file} not found!")
        return False
    
    try:
        # Read Excel file
        df = pd.read_excel(excel_file)
        print(f"Loaded {len(df)} rows from Excel file")
        
        # Clean column names (fix typo in COUNRTY)
        df.columns = df.columns.str.replace('COUNRTY', 'COUNTRY')
        
        # Convert to list of dictionaries
        data = df.to_dict('records')
        
        # Clean up data
        for item in data:
            # Ensure numeric fields are properly formatted
            if 'MVAL_NOK' in item and pd.notna(item['MVAL_NOK']):
                item['MVAL_NOK'] = int(item['MVAL_NOK'])
            if 'MVAL_USD' in item and pd.notna(item['MVAL_USD']):
                item['MVAL_USD'] = int(item['MVAL_USD'])
            if 'VOTING' in item and pd.notna(item['VOTING']):
                item['VOTING'] = float(item['VOTING'])
            if 'OWNERSHIP' in item and pd.notna(item['OWNERSHIP']):
                item['OWNERSHIP'] = float(item['OWNERSHIP'])
            if 'YEAR' in item and pd.notna(item['YEAR']):
                item['YEAR'] = int(item['YEAR'])
        
        # Create output directory
        output_dir = Path('data/processed')
        output_dir.mkdir(exist_ok=True)
        
        # Save as JSON
        output_file = output_dir / 'nbim_holdings.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully processed {len(data)} companies")
        print(f"Output saved to: {output_file}")
        
        # Generate statistics
        generate_statistics(data)
        
        return True
        
    except Exception as e:
        print(f"Error processing data: {e}")
        return False

def generate_statistics(data):
    """Generate statistics about the data"""
    
    stats = {
        'total_companies': len(data),
        'regions': {},
        'countries': {},
        'industries': {},
        'years': {},
        'total_value_nok': 0,
        'total_value_usd': 0
    }
    
    for item in data:
        # Count regions
        region = item.get('REGION', 'Unknown')
        stats['regions'][region] = stats['regions'].get(region, 0) + 1
        
        # Count countries
        country = item.get('COUNTRY', 'Unknown')
        stats['countries'][country] = stats['countries'].get(country, 0) + 1
        
        # Count industries
        industry = item.get('INDUSTRY', 'Unknown')
        stats['industries'][industry] = stats['industries'].get(industry, 0) + 1
        
        # Count years
        year = item.get('YEAR', 'Unknown')
        stats['years'][year] = stats['years'].get(year, 0) + 1
        
        # Sum values
        if 'MVAL_NOK' in item and item['MVAL_NOK']:
            stats['total_value_nok'] += item['MVAL_NOK']
        if 'MVAL_USD' in item and item['MVAL_USD']:
            stats['total_value_usd'] += item['MVAL_USD']
    
    # Sort by count
    stats['regions'] = dict(sorted(stats['regions'].items(), key=lambda x: x[1], reverse=True))
    stats['countries'] = dict(sorted(stats['countries'].items(), key=lambda x: x[1], reverse=True))
    stats['industries'] = dict(sorted(stats['industries'].items(), key=lambda x: x[1], reverse=True))
    stats['years'] = dict(sorted(stats['years'].items(), key=lambda x: x[1], reverse=True))
    
    # Save statistics
    output_dir = Path('data/processed')
    stats_file = output_dir / 'statistics.json'
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    print(f"Statistics saved to: {stats_file}")
    print(f"Total companies: {stats['total_companies']}")
    print(f"Total regions: {len(stats['regions'])}")
    print(f"Total countries: {len(stats['countries'])}")
    print(f"Total industries: {len(stats['industries'])}")
    print(f"Total value (NOK): {stats['total_value_nok']:,.0f}")
    print(f"Total value (USD): {stats['total_value_usd']:,.0f}")

if __name__ == '__main__':
    print("Processing NBIM data...")
    success = process_nbim_data()
    if success:
        print("Data processing completed successfully!")
    else:
        print("Data processing failed!")
