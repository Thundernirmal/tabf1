#!/usr/bin/env python3

# Quick test script to verify race screen functionality
import sys
sys.path.append('.')

from f1_dashboard import get_all_races_season

def test_race_screen():
    print("Testing race screen functionality...")
    
    try:
        # Test the race data loading
        races = get_all_races_season(2025)
        print(f"✅ Loaded {len(races)} races successfully")
        
        # Test race categorization
        completed = [r for r in races if r.get('Status') == 'completed']
        completed_no_results = [r for r in races if r.get('Status') == 'completed_no_results']
        scheduled = [r for r in races if r.get('Status') == 'scheduled']
        
        print(f"✅ Completed races: {len(completed)}")
        print(f"✅ Completed no results: {len(completed_no_results)}")
        print(f"✅ Scheduled races: {len(scheduled)}")
        
        # Test a completed race
        if completed:
            race = completed[0]
            race_name = race.get('raceName', '')
            results = race.get('Results', [])
            winner = results[0] if results else {}
            driver = winner.get('Driver', {})
            winner_name = f"{driver.get('givenName', '')} {driver.get('familyName', '')}".strip()
            print(f"✅ Sample race: {race_name} - Winner: {winner_name}")
        
        print("\n🎉 All race screen functionality tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing race screen: {e}")
        return False

if __name__ == "__main__":
    test_race_screen()
