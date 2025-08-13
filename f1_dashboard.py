import os
import json
import requests
from datetime import datetime, timedelta
from textual.app import App, ComposeResult
from textual.containers import Horizontal, Vertical
from textual.widgets import Static, Footer

CACHE_FILE = "f1_cache.json"
API_BASE = "http://api.jolpi.ca"

# Simple cache mechanism
def get_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            return json.load(f)
    return {}

def set_cache(data):
    with open(CACHE_FILE, "w") as f:
        json.dump(data, f)

def fetch_with_cache(endpoint, key, expire_minutes=60):
    cache = get_cache()
    now = datetime.utcnow().isoformat()
    if key in cache:
        cached = cache[key]
        if (datetime.fromisoformat(now) - datetime.fromisoformat(cached["time"])) < timedelta(minutes=expire_minutes):
            return cached["data"]
    url = f"{API_BASE}{endpoint}"
    resp = requests.get(url)
    resp.raise_for_status()
    data = resp.json()
    cache[key] = {"time": now, "data": data}
    set_cache(cache)
    return data

def get_current_year():
    return datetime.now().year

def get_driver_standings():
    year = get_current_year()
    # Ergast-compatible endpoint
    data = fetch_with_cache(f"/ergast/f1/{year}/driverstandings.json", f"drivers_{year}")
    # Parse Ergast response
    standings_lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
    if standings_lists and "DriverStandings" in standings_lists[0]:
        return standings_lists[0]["DriverStandings"]
    return []

def get_constructor_standings():
    year = get_current_year()
    # Ergast-compatible endpoint
    data = fetch_with_cache(f"/ergast/f1/{year}/constructorstandings.json", f"constructors_{year}")
    # Parse Ergast response
    standings_lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
    if standings_lists and "ConstructorStandings" in standings_lists[0]:
        return standings_lists[0]["ConstructorStandings"]
    return []

class StandingsTable(Static):
    def __init__(self, title, headers, rows, **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.headers = headers
        self.rows = rows

    def render(self):
        table = f"[b]{self.title}[/b]\n"
        table += " | ".join(self.headers) + "\n"
        table += "-" * (len(table)) + "\n"
        for row in self.rows:
            table += " | ".join(str(x) for x in row) + "\n"
        return table

class F1DashboardApp(App):
    CSS_PATH = None
    BINDINGS = [ ("q", "quit", "Quit") ]

    def compose(self) -> ComposeResult:
        drivers = get_driver_standings()
        constructors = get_constructor_standings()
        driver_rows = [
            [d.get("position"),
             f"{d.get('Driver', {}).get('givenName', '')} {d.get('Driver', {}).get('familyName', '')}",
             d.get("points")
            ] for d in drivers
        ]
        constructor_rows = [
            [c.get("position"),
             c.get("Constructor", {}).get("name", ""),
             c.get("points")
            ] for c in constructors
        ]
        yield Horizontal(
            Vertical(
                StandingsTable("Drivers Standings", ["Pos", "Driver", "Points"], driver_rows),
                id="drivers-section"
            ),
            Vertical(
                StandingsTable("Constructors Standings", ["Pos", "Constructor", "Points"], constructor_rows),
                id="constructors-section"
            ),
        )
        yield Footer()

if __name__ == "__main__":
    F1DashboardApp().run()
