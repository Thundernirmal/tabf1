#!/usr/bin/env python3

# Test the main app to check for any import or startup issues
import sys
sys.path.append('.')

try:
    from f1_dashboard import F1DashboardApp, RaceScreen
    print("✅ Successfully imported F1DashboardApp and RaceScreen")
    
    # Test creating the app instance
    app = F1DashboardApp()
    print("✅ Successfully created F1DashboardApp instance")
    
    # Test creating a race screen instance
    race_screen = RaceScreen()
    print("✅ Successfully created RaceScreen instance")
    
    print("\n🎉 All imports and instantiation tests passed!")
    print("The application should now work without recursion errors.")
    
except Exception as e:
    print(f"❌ Error testing app components: {e}")
    import traceback
    traceback.print_exc()
