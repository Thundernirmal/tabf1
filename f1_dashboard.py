import os
import json
import requests
from datetime import datetime, timedelta
from textual.app import App, ComposeResult
from textual.screen import ModalScreen
from textual.containers import Horizontal, Vertical
from textual.widgets import Footer, Header, DataTable
from textual.events import Resize
from textual.widgets import Static

CACHE_FILE = "f1_cache.json"
API_BASE = "http://api.jolpi.ca"

# Minimal, elegant banner for TabF1
ASCII_ART = (
    "┌─────── TabF1 ──────┐\n"
    "│  F1 Standings TUI  │\n"
    "└────────────────────┘"
)


def get_cache():
    """Load cache JSON safely; return empty dict on any issue."""
    try:
        if not os.path.exists(CACHE_FILE):
            return {}
        if os.path.getsize(CACHE_FILE) == 0:
            return {}
        with open(CACHE_FILE, "r") as f:
            return json.load(f) or {}
    except Exception:
        # Corrupt or unreadable cache; ignore and start fresh
        return {}


def set_cache(data):
    """Write cache atomically to avoid partial files."""
    try:
        tmp_path = f"{CACHE_FILE}.tmp"
        with open(tmp_path, "w") as f:
            json.dump(data, f)
        os.replace(tmp_path, CACHE_FILE)
    except Exception:
        # Best-effort; ignore write errors to avoid crashing UI
        pass


def fetch_with_cache(endpoint, key, expire_minutes=1440, force=False):
    cache = get_cache()
    now = datetime.utcnow().isoformat()
    if not force and key in cache:
        try:
            cached = cache[key]
            cached_time = datetime.fromisoformat(cached.get("time", now))
            if (datetime.fromisoformat(now) - cached_time) < timedelta(minutes=expire_minutes):
                return cached.get("data")
        except Exception:
            # Treat invalid timestamps/data as expired
            pass
    url = f"{API_BASE}{endpoint}"
    resp = requests.get(url, timeout=8)
    resp.raise_for_status()
    data = resp.json()
    cache[key] = {"time": now, "data": data}
    set_cache(cache)
    return data


def get_current_year():
    return datetime.now().year


def get_driver_standings(force=False):
    year = get_current_year()
    data = fetch_with_cache(f"/ergast/f1/{year}/driverstandings.json", f"drivers_{year}", force=force)
    lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
    if lists and "DriverStandings" in lists[0]:
        return lists[0]["DriverStandings"]
    return []


def get_constructor_standings(force=False):
    year = get_current_year()
    data = fetch_with_cache(f"/ergast/f1/{year}/constructorstandings.json", f"constructors_{year}", force=force)
    lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
    if lists and "ConstructorStandings" in lists[0]:
        return lists[0]["ConstructorStandings"]
    return []


def get_latest_race(force=False):
    """Get the latest race information."""
    year = get_current_year()
    data = fetch_with_cache(f"/ergast/f1/{year}/last/results.json", f"latest_race_{year}", force=force)
    races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
    if races:
        return races[0]
    return {}


def get_race_results(season, round_no, force=False):
    """Get detailed race results for a specific race."""
    data = fetch_with_cache(
        f"/ergast/f1/{season}/{round_no}/results.json", 
        f"race_results_{season}_{round_no}", 
        force=force
    )
    races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
    if races and "Results" in races[0]:
        return races[0]["Results"]
    return []


def get_season_driver_standings_progression(season, force=False):
    """Get driver standings progression throughout the season for visualization."""
    data = fetch_with_cache(
        f"/ergast/f1/{season}/driverStandings.json",
        f"season_progression_{season}",
        expire_minutes=1440,
        force=force
    )
    standings_lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
    return standings_lists


class StandingsPanel(Vertical):
    def __init__(self, panel_id, title):
        super().__init__(id=panel_id)
        self.title_text = title
        self.table = None

    def compose(self) -> ComposeResult:
        table = DataTable(id=f"{self.id}-table")
        self.table = table
        yield table


class RacePanel(Vertical):
    def __init__(self, panel_id, title):
        super().__init__(id=panel_id)
        self.title_text = title
        self.table = None

    def compose(self) -> ComposeResult:
        table = DataTable(id=f"{self.id}-table")
        self.table = table
        yield table


class F1DashboardApp(App):
    CSS_PATH = "f1_dashboard.tcss"
    BINDINGS = [
        ("q", "quit", "Quit"),
        ("f", "refresh", "Refresh"),
        ("left", "focus_left", "Focus Drivers"),
        ("right", "focus_right", "Focus Constructors"),
        ("r", "open_race_screen", "Race Results"),
        ("enter", "open_details", "Open Details"),
        ("o", "open_details", "Open Details"),
        ("escape", "dismiss", "Close Details"),
    ]

    def __init__(self):
        super().__init__()
        self._drivers_data = []
        self._constructors_data = []

    def compose(self) -> ComposeResult:
        # Title and season header (compact)
        yield Static(ASCII_ART, id="title")
        yield Static(f"Season {get_current_year()}", id="season")
        # Main standings panels
        yield Horizontal(
            StandingsPanel("drivers-panel", "Drivers Standings"),
            StandingsPanel("constructors-panel", "Constructors Standings"),
            id="main",
        )
        yield Footer()

    def on_ready(self) -> None:  # type: ignore[override]
        # Ensure initial sizing happens after the first real layout pass
        # so that panel sizes are non-zero even before a manual resize.
        self.call_after_refresh(self.render_tables)

    def on_mount(self) -> None:
        year = get_current_year()
        d_panel = self.query_one("#drivers-panel", StandingsPanel)
        c_panel = self.query_one("#constructors-panel", StandingsPanel)
        d_panel.styles.border_title = f"Drivers — {year}"
        c_panel.styles.border_title = f"Constructors — {year}"
        dtab = d_panel.table
        ctab = c_panel.table
        assert dtab and ctab
        dtab.cursor_type = "row"
        ctab.cursor_type = "row"
        dtab.add_columns("Pos", "Driver", "Team", "Pts", "Wins")
        ctab.add_columns("Pos", "Constructor", "Pts", "Wins")
        # Start loading data immediately without blocking UI
        self.load_data()
        # Also schedule a post-refresh sizing to handle first render.
        self.call_after_refresh(self.render_tables)

    def on_resize(self, event: Resize) -> None:  # type: ignore[override]
        try:
            main = self.query_one("#main", Horizontal)
            main.styles.layout = "vertical" if self.size.width < 110 else "horizontal"
        except Exception:
            pass
        self.render_tables()

    def action_refresh(self) -> None:
        self.load_data(force=True)

    def action_focus_left(self) -> None:
        self.query_one("#drivers-panel DataTable", DataTable).focus()

    def action_focus_right(self) -> None:
        self.query_one("#constructors-panel DataTable", DataTable).focus()

    def action_open_race_screen(self) -> None:
        """Open the dedicated race screen."""
        self.push_screen(RaceScreen())

    def action_open_details(self) -> None:
        """Open a modal with details for the selected row in the focused table."""
        try:
            dtab = self.query_one("#drivers-panel DataTable", DataTable)
            ctab = self.query_one("#constructors-panel DataTable", DataTable)
        except Exception:
            return

        if dtab.has_focus:
            idx = dtab.cursor_row if dtab.cursor_row is not None else 0
            if 0 <= idx < len(self._drivers_data):
                d = self._drivers_data[idx]
                self.push_screen(DriverDetailScreen(d))
                return
        if ctab.has_focus:
            idx = ctab.cursor_row if ctab.cursor_row is not None else 0
            if 0 <= idx < len(self._constructors_data):
                c = self._constructors_data[idx]
                self.push_screen(ConstructorDetailScreen(c))

    def action_dismiss(self) -> None:
        """Close the top-most modal if present."""
        try:
            self.pop_screen()
        except Exception:
            pass

    def on_data_table_row_selected(self, event) -> None:
        """Open details when a row is selected (mouse or Enter inside table)."""
        # Only handle events from main app tables, not modal screens
        try:
            table = event.sender  # type: ignore[attr-defined]
            if isinstance(table, DataTable):
                # Check if we're in the main app (not a modal screen)
                if hasattr(self, '_drivers_data') and hasattr(self, '_constructors_data'):
                    if table.id and table.id.startswith("drivers-panel"):
                        self.action_open_details()
                    elif table.id and table.id.startswith("constructors-panel"):
                        self.action_open_details()
        except Exception:
            # Ignore errors to prevent recursion
            pass

    @staticmethod
    def _truncate(text, width):
        if width <= 0:
            return ""
        if len(text) <= width:
            return text
        return text[: max(0, width - 1)] + "…"

    def load_data(self, force=False) -> None:
        # Fetch data synchronously with short timeout; small datasets
        d_panel = self.query_one("#drivers-panel", StandingsPanel)
        c_panel = self.query_one("#constructors-panel", StandingsPanel)
        d_panel.styles.border_subtitle = "Loading…"
        c_panel.styles.border_subtitle = "Loading…"
        self.refresh()
        try:
            self._drivers_data = get_driver_standings(force=force)
            self._constructors_data = get_constructor_standings(force=force)
            d_panel.styles.border_subtitle = f"Total {len(self._drivers_data)} drivers"
            c_panel.styles.border_subtitle = f"Total {len(self._constructors_data)} constructors"
        except Exception as e:
            msg = f"Error: {e}"
            d_panel.styles.border_subtitle = msg
            c_panel.styles.border_subtitle = msg
        finally:
            # Defer render to the next refresh so sizes are accurate.
            self.call_after_refresh(self.render_tables)
            self.refresh()

    def render_tables(self) -> None:
        d_panel = self.query_one("#drivers-panel", StandingsPanel)
        c_panel = self.query_one("#constructors-panel", StandingsPanel)
        dtab = d_panel.table
        ctab = c_panel.table
        assert dtab and ctab

        # Width budgets based on current panel sizes
        d_width = max(40, d_panel.size.width - 4)
        c_width = max(30, c_panel.size.width - 4)

        # Drivers table columns: Pos(3), Pts(5), Wins(4) are fixed; Driver/Team share remainder
        fixed_d = 3 + 5 + 4
        flex_d = max(0, d_width - fixed_d)
        # Favor more width for driver names so they are fully visible.
        driver_w = max(10, int(flex_d * 0.65))
        team_w = max(8, flex_d - driver_w)

        # Constructors table columns: Pos(3), Pts(5), Wins(4) are fixed; Name gets the rest
        fixed_c = 3 + 5 + 4
        name_w = max(10, c_width - fixed_c)

        try:
            # Drivers table: [0]=Pos, [1]=Driver, [2]=Team, [3]=Pts, [4]=Wins
            dtab.set_column_width(0, 3)
            dtab.set_column_width(1, driver_w)
            dtab.set_column_width(2, team_w)
            dtab.set_column_width(3, 5)
            dtab.set_column_width(4, 4)

            # Constructors table: [0]=Pos, [1]=Constructor, [2]=Pts, [3]=Wins
            ctab.set_column_width(0, 3)
            ctab.set_column_width(1, name_w)
            ctab.set_column_width(2, 5)
            ctab.set_column_width(3, 4)
        except Exception:
            pass

        # Populate data
        dtab.clear()
        for d in self._drivers_data:
            pos = str(d.get("position"))
            name = f"{d.get('Driver', {}).get('givenName', '')} {d.get('Driver', {}).get('familyName', '')}".strip()
            team = d.get("Constructors", [{}])[0].get("name", "") if d.get("Constructors") else ""
            pts = str(d.get("points"))
            wins = str(d.get("wins"))
            dtab.add_row(
                self._truncate(pos, 3),
                self._truncate(name, driver_w),
                self._truncate(team, team_w),
                self._truncate(pts, 5),
                self._truncate(wins, 4),
            )

        ctab.clear()
        for c in self._constructors_data:
            pos = str(c.get("position"))
            name = c.get("Constructor", {}).get("name", "")
            pts = str(c.get("points"))
            wins = str(c.get("wins"))
            ctab.add_row(
                self._truncate(pos, 3),
                self._truncate(name, name_w),
                self._truncate(pts, 5),
                self._truncate(wins, 4),
            )


# ----- Details helpers & screens -----

class RaceScreen(ModalScreen[None]):
    """Dedicated screen showing all races from current season."""
    BINDINGS = [
        ("q", "app.pop_screen", "Back to Main"),
        ("escape", "app.pop_screen", "Back to Main"),
        ("f", "refresh", "Refresh"),
        ("enter", "open_race_details", "Race Details"),
        ("o", "open_race_details", "Race Details"),
    ]

    def __init__(self):
        super().__init__()
        self._all_races = []

    def compose(self) -> ComposeResult:
        yield Static("┌─────── F1 Race Results ──────┐\n│     All Races This Season    │\n└──────────────────────────────┘", id="title")
        yield Static(f"Season {get_current_year()}", id="season")
        yield RacePanel("race-panel", "All Season Races")
        yield Footer()

    def on_mount(self) -> None:
        year = get_current_year()
        r_panel = self.query_one("#race-panel", RacePanel)
        r_panel.styles.border_title = f"All Races — {year}"
        rtab = r_panel.table
        assert rtab
        rtab.cursor_type = "row"
        rtab.add_columns("Grand Prix (Country)", "Date", "Winner", "Team", "Laps", "Race Time")
        self.load_race_data()
        self.call_after_refresh(self.render_race_table)

    def action_refresh(self) -> None:
        self.load_race_data(force=True)

    def action_open_race_details(self) -> None:
        """Open detailed race results for selected race."""
        rtab = self.query_one("#race-panel", RacePanel).table
        if rtab and rtab.cursor_row is not None:
            race_idx = rtab.cursor_row
            if 0 <= race_idx < len(self._all_races):
                selected_race = self._all_races[race_idx]
                status = selected_race.get("Status", "scheduled")
                
                # Check if race has results
                if selected_race.get("Results") and status == "completed":
                    self.app.push_screen(RaceDetailScreen(selected_race))
                elif status == "completed_no_results":
                    # Show a message for completed races without data
                    race_name = selected_race.get("raceName", "Race")
                    date = selected_race.get("date", "")
                    message = f"🏁 {race_name}\n\nRace completed on {date}\nResults data not available in API\n(This may be due to data source limitations)"
                    self.app.push_screen(MessageScreen(message))
                else:
                    # Show a message for future races
                    race_name = selected_race.get("raceName", "Race")
                    date = selected_race.get("date", "")
                    message = f"🏁 {race_name}\n\nRace scheduled for {date}\nResults not available yet"
                    self.app.push_screen(MessageScreen(message))

    def on_data_table_row_selected(self, event) -> None:
        """Open race details when a row is selected in the race table."""
        # Only handle events from race tables in this screen
        try:
            table = event.sender  # type: ignore[attr-defined]
            if isinstance(table, DataTable) and table.id and table.id.startswith("race-panel"):
                self.action_open_race_details()
                event.prevent_default()  # Prevent event bubbling
        except Exception:
            # Ignore errors to prevent issues
            pass

    def load_race_data(self, force=False) -> None:
        r_panel = self.query_one("#race-panel", RacePanel)
        r_panel.styles.border_subtitle = "Loading…"
        self.refresh()
        try:
            year = get_current_year()
            self._all_races = get_all_races_season(year, force=force)
            r_panel.styles.border_subtitle = f"{len(self._all_races)} races in {year}"
        except Exception as e:
            r_panel.styles.border_subtitle = f"Error: {e}"
        finally:
            self.call_after_refresh(self.render_race_table)
            self.refresh()

    def render_race_table(self) -> None:
        r_panel = self.query_one("#race-panel", RacePanel)
        rtab = r_panel.table
        assert rtab

        # Width budget based on panel size
        r_width = max(80, r_panel.size.width - 4)
        
        # Race table columns: Date(12), Laps(5), Race Time(12) are fixed; Grand Prix/Winner/Team share remainder
        fixed_r = 12 + 5 + 12
        flex_r = max(0, r_width - fixed_r)
        gp_w = max(25, int(flex_r * 0.4))
        winner_w = max(18, int(flex_r * 0.35))
        team_w = max(15, flex_r - gp_w - winner_w)

        try:
            # Race table: [0]=Grand Prix, [1]=Date, [2]=Winner, [3]=Team, [4]=Laps, [5]=Race Time
            rtab.set_column_width(0, gp_w)
            rtab.set_column_width(1, 12)
            rtab.set_column_width(2, winner_w)
            rtab.set_column_width(3, team_w)
            rtab.set_column_width(4, 5)
            rtab.set_column_width(5, 12)
        except Exception:
            pass

        # Populate race table with all season races
        rtab.clear()
        for race in self._all_races:
            # Grand Prix name and country
            race_name = race.get("raceName", "")
            circuit = race.get("Circuit", {})
            country = circuit.get("Location", {}).get("country", "")
            grand_prix = f"{race_name}"
            if country:
                grand_prix += f" ({country})"
            
            # Date - format as "Mar 16, 2025"
            date = race.get("date", "")
            formatted_date = ""
            if date:
                try:
                    date_obj = datetime.strptime(date, "%Y-%m-%d")
                    formatted_date = date_obj.strftime("%b %d, %Y")
                except:
                    formatted_date = date
            
            # Get race results and status
            results = race.get("Results", [])
            status = race.get("Status", "scheduled")
            winner_name = ""
            winner_team = ""
            total_laps = ""
            race_time = ""
            
            if results and status == "completed":
                # Race has been completed with results
                winner = results[0]  # First position is winner
                driver = winner.get("Driver", {})
                winner_name = f"{driver.get('givenName', '')} {driver.get('familyName', '')}".strip()
                winner_team = winner.get("Constructor", {}).get("name", "")
                total_laps = str(winner.get("laps", ""))
                
                # Race time
                time_info = winner.get("Time", {})
                if time_info:
                    race_time = time_info.get("time", "")
            elif status == "completed_no_results":
                # Race should be completed but no results available
                winner_name = "No Data"
                winner_team = "No Data"
                total_laps = "No Data"
                race_time = "No Data"
            else:
                # Race is scheduled but not completed yet
                winner_name = "TBD"
                winner_team = "TBD"
                total_laps = "TBD"
                race_time = "TBD"
            
            rtab.add_row(
                self._truncate(grand_prix, gp_w),
                self._truncate(formatted_date, 12),
                self._truncate(winner_name, winner_w),
                self._truncate(winner_team, team_w),
                self._truncate(total_laps, 5),
                self._truncate(race_time, 12),
            )

    @staticmethod
    def _truncate(text, width):
        if width <= 0:
            return ""
        if len(text) <= width:
            return text
        return text[: max(0, width - 1)] + "…"


def get_driver_last_results(driver_id: str, limit: int = 10):
    """Fetch most recent race results for a driver (newest 10)."""
    # Step 1: get total results
    meta = fetch_with_cache(
        f"/ergast/f1/drivers/{driver_id}/results.json?limit=1",
        f"driver_last_meta_{driver_id}",
        expire_minutes=1440,
    )
    total_str = meta.get("MRData", {}).get("total", "0")
    try:
        total = int(total_str)
    except Exception:
        total = 0
    start = max(0, total - limit)
    # Step 2: fetch the last window
    endpoint = f"/ergast/f1/drivers/{driver_id}/results.json?limit={limit}&offset={start}"
    data = fetch_with_cache(endpoint, f"driver_last_{driver_id}_{limit}_{start}", expire_minutes=1440)
    return data.get("MRData", {}).get("RaceTable", {}).get("Races", [])


def get_constructor_last_results(constructor_id: str, limit: int = 10):
    """Fetch most recent race results for a constructor (newest 10)."""
    meta = fetch_with_cache(
        f"/ergast/f1/constructors/{constructor_id}/results.json?limit=1",
        f"constructor_last_meta_{constructor_id}",
        expire_minutes=1440,
    )
    total_str = meta.get("MRData", {}).get("total", "0")
    try:
        total = int(total_str)
    except Exception:
        total = 0
    start = max(0, total - limit)
    endpoint = f"/ergast/f1/constructors/{constructor_id}/results.json?limit={limit}&offset={start}"
    data = fetch_with_cache(endpoint, f"constructor_last_{constructor_id}_{limit}_{start}", expire_minutes=1440)
    return data.get("MRData", {}).get("RaceTable", {}).get("Races", [])


def get_all_races_season(season, force=False):
    """Get all races for a season, fetching individual race results for accurate data."""
    from datetime import datetime, date
    
    # First get all scheduled races
    schedule_data = fetch_with_cache(
        f"/ergast/f1/{season}.json?limit=100",
        f"race_schedule_{season}",
        expire_minutes=1440,
        force=force
    )
    scheduled_races = schedule_data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
    
    # Get today's date for comparison
    today = date.today()
    
    # For each race, fetch individual results if race should be completed
    all_races = []
    for race in scheduled_races:
        round_num = race.get("round")
        race_date_str = race.get("date", "")
        
        # Parse race date
        race_date = None
        if race_date_str:
            try:
                race_date = datetime.strptime(race_date_str, "%Y-%m-%d").date()
            except:
                pass
        
        race_copy = race.copy()
        
        # Check if race should be completed and fetch individual results
        if race_date and race_date <= today:
            # Try to fetch individual race results
            try:
                individual_race_data = fetch_with_cache(
                    f"/ergast/f1/{season}/{round_num}/results.json",
                    f"race_results_{season}_{round_num}",
                    expire_minutes=60,  # Shorter cache for results
                    force=force
                )
                individual_races = individual_race_data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
                
                if individual_races and individual_races[0].get("Results"):
                    # Race has results available
                    race_copy["Results"] = individual_races[0]["Results"]
                    race_copy["Status"] = "completed"
                else:
                    # Race should be completed but no results available
                    race_copy["Results"] = []
                    race_copy["Status"] = "completed_no_results"
            except Exception:
                # Error fetching results, treat as no results available
                race_copy["Results"] = []
                race_copy["Status"] = "completed_no_results"
        else:
            # Future race
            race_copy["Results"] = []
            race_copy["Status"] = "scheduled"
        
        all_races.append(race_copy)
    
    return all_races


class MessageScreen(ModalScreen[None]):
    """Simple message screen for displaying information."""
    def __init__(self, message: str):
        super().__init__()
        self.message = message

    def compose(self) -> ComposeResult:
        yield Vertical(
            Static(self.message, id="message-content"),
            Static("\nPress ESC or Enter to close", id="message-help"),
            id="message-wrapper"
        )

    def on_key(self, event):
        if getattr(event, "key", None) in ("escape", "enter"):
            self.app.pop_screen()


class RaceDetailScreen(ModalScreen[None]):
    def __init__(self, race_data: dict):
        super().__init__()
        self.race = race_data
        self.table: DataTable | None = None
        self._spinner_idx = 0
        self._spinner_timer = None

    def compose(self) -> ComposeResult:
        race_name = self.race.get("raceName", "Race")
        circuit = self.race.get("Circuit", {})
        circuit_name = circuit.get("circuitName", "")
        country = circuit.get("Location", {}).get("country", "")
        date = self.race.get("date", "")
        
        title = f"🏁 {race_name}"
        if circuit_name:
            title += f" — {circuit_name}"
        if country:
            title += f" ({country})"
        if date:
            title += f" • {date}"
        
        header = Static(title, id="detail-title")
        table = DataTable(id="detail-table")
        self.table = table
        table.add_columns("Pos", "Driver", "Team", "Grid", "Time/Status", "Pts")
        yield Vertical(header, table, id="detail-wrapper")

    def on_mount(self) -> None:
        # Show the race results immediately since we already have the data
        if self.table:
            race_results = self.race.get("Results", [])
            for result in race_results:
                pos = str(result.get("position", ""))
                driver = result.get("Driver", {})
                name = f"{driver.get('givenName', '')} {driver.get('familyName', '')}".strip()
                team = result.get("Constructor", {}).get("name", "")
                grid = str(result.get("grid", ""))
                
                # Handle time or status
                time_info = result.get("Time", {})
                if time_info:
                    time_str = time_info.get("time", "")
                else:
                    time_str = result.get("status", "")
                
                pts = str(result.get("points", ""))
                self.table.add_row(pos, name, team, grid, time_str, pts)
            
            try:
                # Set column widths for race results
                self.table.set_column_width(0, 3)   # Pos
                self.table.set_column_width(1, 20)  # Driver
                self.table.set_column_width(2, 15)  # Team
                self.table.set_column_width(3, 4)   # Grid
                self.table.set_column_width(4, 15)  # Time/Status
                self.table.set_column_width(5, 4)   # Pts
            except Exception:
                pass

    def on_key(self, event):  # close on ESC/Enter
        if getattr(event, "key", None) in ("escape", "enter"):
            self.app.pop_screen()


class DriverDetailScreen(ModalScreen[None]):
    def __init__(self, driver_standing: dict):
        super().__init__()
        self.driver = driver_standing
        self.table: DataTable | None = None
        self._spinner_idx = 0
        self._spinner_timer = None

    def compose(self) -> ComposeResult:
        drv = self.driver.get('Driver', {})
        name = f"{drv.get('givenName','')} {drv.get('familyName','')}".strip()
        code = drv.get('code', '')
        team = self.driver.get("Constructors", [{}])[0].get("name", "") if self.driver.get("Constructors") else ""
        title = f"Driver: {name}"
        if code:
            title += f" ({code})"
        if team:
            title += f" — {team}"
        header = Static(title, id="detail-title")
        table = DataTable(id="detail-table")
        self.table = table
        table.add_columns("Rnd", "Grand Prix", "Grid", "Finish", "Status", "Pts")
        yield Vertical(header, table, id="detail-wrapper")

    def on_mount(self) -> None:
        # Show loading state, then fetch in a background task
        title = self.query_one("#detail-title", Static)
        title.update(title.renderable + " — Loading…")

        # Simple spinner animation on the title while loading
        def spin():
            frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
            self._spinner_idx = (self._spinner_idx + 1) % len(frames)
            try:
                t = self.query_one("#detail-title", Static)
                base = str(t.renderable).split(" — Loading…", 1)[0]
                t.update(f"{base} — Loading… {frames[self._spinner_idx]}")
            except Exception:
                pass

        self._spinner_timer = self.set_interval(0.1, spin)

        async def load():
            try:
                driver_id = self.driver.get("Driver", {}).get("driverId", "")
                races = get_driver_last_results(driver_id, limit=10)
                rows = []
                for r in reversed(races):
                    round_no = r.get("round", "")
                    gp = r.get("raceName", "")
                    results = r.get("Results", [])
                    result = results[0] if results else {}
                    grid = result.get("grid", "")
                    finish = result.get("positionText", result.get("position", ""))
                    status = result.get("status", "")
                    pts = result.get("points", "")
                    rows.append((round_no, gp, grid, finish, status, pts))
                if self.table:
                    self.table.clear()
                    for row in rows:
                        self.table.add_row(*[str(x) for x in row])
                    try:
                        self.table.set_column_width(0, 4)
                        self.table.set_column_width(2, 4)
                        self.table.set_column_width(3, 6)
                        self.table.set_column_width(5, 4)
                    except Exception:
                        pass
                if self._spinner_timer:
                    # Textual Timer doesn't have cancel(); use stop()
                    try:
                        self._spinner_timer.stop()
                    except Exception:
                        pass
                title.update(str(title.renderable).split(" — Loading…", 1)[0])
            except Exception as e:
                if self._spinner_timer:
                    try:
                        self._spinner_timer.stop()
                    except Exception:
                        pass
                title.update(f"{title.renderable} — Error: {e}")

        self.run_worker(load())

    def on_key(self, event):  # close on ESC/Enter
        if getattr(event, "key", None) in ("escape", "enter"):
            self.app.pop_screen()


class ConstructorDetailScreen(ModalScreen[None]):
    def __init__(self, constructor_standing: dict):
        super().__init__()
        self.constructor = constructor_standing
        self.table: DataTable | None = None
        self._spinner_idx = 0
        self._spinner_timer = None

    def compose(self) -> ComposeResult:
        name = self.constructor.get("Constructor", {}).get("name", "")
        header = Static(f"Constructor: {name}", id="detail-title")
        table = DataTable(id="detail-table")
        self.table = table
        table.add_columns("Rnd", "Grand Prix", "Car #", "Driver", "Finish", "Pts")
        yield Vertical(header, table, id="detail-wrapper")

    def on_mount(self) -> None:
        # Show loading state, then fetch in a background task
        title = self.query_one("#detail-title", Static)
        title.update(title.renderable + " — Loading…")

        def spin():
            frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
            self._spinner_idx = (self._spinner_idx + 1) % len(frames)
            try:
                t = self.query_one("#detail-title", Static)
                base = str(t.renderable).split(" — Loading…", 1)[0]
                t.update(f"{base} — Loading… {frames[self._spinner_idx]}")
            except Exception:
                pass

        self._spinner_timer = self.set_interval(0.1, spin)

        async def load():
            try:
                const_id = self.constructor.get("Constructor", {}).get("constructorId", "")
                races = get_constructor_last_results(const_id, limit=10)
                rows = []
                for r in reversed(races):
                    round_no = r.get("round", "")
                    gp = r.get("raceName", "")
                    results = r.get("Results", [])
                    if results:
                        result = results[0]
                        car_no = result.get("number", "")
                        drv = result.get("Driver", {})
                        drv_name = f"{drv.get('givenName','')} {drv.get('familyName','')}".strip()
                        finish = result.get("positionText", result.get("position", ""))
                        pts = result.get("points", "")
                        rows.append((round_no, gp, car_no, drv_name, finish, pts))
                if self.table:
                    self.table.clear()
                    for row in rows:
                        self.table.add_row(*[str(x) for x in row])
                    try:
                        self.table.set_column_width(0, 4)
                        self.table.set_column_width(2, 6)
                        self.table.set_column_width(4, 6)
                        self.table.set_column_width(5, 4)
                    except Exception:
                        pass
                if self._spinner_timer:
                    # Textual Timer doesn't have cancel(); use stop()
                    try:
                        self._spinner_timer.stop()
                    except Exception:
                        pass
                title.update(str(title.renderable).split(" — Loading…", 1)[0])
            except Exception as e:
                if self._spinner_timer:
                    try:
                        self._spinner_timer.stop()
                    except Exception:
                        pass
                title.update(f"{title.renderable} — Error: {e}")

        self.run_worker(load())
    # end on_mount

    def on_key(self, event):
        if getattr(event, "key", None) in ("escape", "enter"):
            self.app.pop_screen()


if __name__ == "__main__":
    F1DashboardApp().run()
