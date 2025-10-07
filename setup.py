#!/usr/bin/env python3
"""
Setup script for NBIM Quiz
Automates the data processing and verification workflow
"""

import sys
import subprocess
from pathlib import Path

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def check_dependencies():
    """Check if required Python packages are installed"""
    print("📦 Checking dependencies...")
    
    try:
        import pandas
        import openpyxl
        print("✅ All dependencies installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e.name}")
        print("\n💡 To install dependencies, run:")
        print("   pip install -r requirements.txt")
        return False

def check_excel_file():
    """Check if the Excel data file exists"""
    print("\n📄 Checking for Excel data file...")
    
    excel_file = Path('data/equities.xlsx')
    if not excel_file.exists():
        print(f"❌ Error: {excel_file} not found!")
        print("\n💡 Please ensure the Excel file is in the correct location:")
        print("   data/equities.xlsx")
        return False
    
    print(f"✅ Excel file found: {excel_file}")
    return True

def process_data():
    """Run the data processing script"""
    print("\n🔄 Processing data...")
    
    result = subprocess.run([sys.executable, 'process_data.py'], 
                          capture_output=True, text=True, encoding='utf-8', errors='replace')
    
    if result.returncode == 0:
        print("✅ Data processing completed successfully")
        print(result.stdout)
        return True
    else:
        print("❌ Error during data processing")
        print(result.stderr)
        return False

def verify_data():
    """Run the data verification script"""
    print("\n🔍 Verifying data...")
    
    result = subprocess.run([sys.executable, 'verify_data.py'], 
                          capture_output=True, text=True, encoding='utf-8', errors='replace')
    
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    
    return result.returncode == 0

def start_server():
    """Provide instructions for starting the web server"""
    print("\n" + "="*60)
    print("🎉 Setup completed successfully!")
    print("="*60)
    print("\n🚀 To start the quiz application, run one of these commands:\n")
    print("   Option 1 (Python):")
    print("   python -m http.server 8000")
    print("\n   Option 2 (Node.js):")
    print("   npx http-server")
    print("\n   Option 3 (VS Code):")
    print("   Install 'Live Server' extension and right-click index.html")
    print("\n📱 Then open in your browser:")
    print("   http://localhost:8000")
    print("\n" + "="*60)

def main():
    """Main setup workflow"""
    print("="*60)
    print("🎮 NBIM Quiz Setup")
    print("="*60)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check Excel file
    if not check_excel_file():
        sys.exit(1)
    
    # Process data
    if not process_data():
        sys.exit(1)
    
    # Verify data
    if not verify_data():
        sys.exit(1)
    
    # Provide server instructions
    start_server()

if __name__ == '__main__':
    main()

