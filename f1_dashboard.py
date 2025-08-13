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


class StandingsPanel(Vertical):
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
        ("r", "refresh", "Refresh"),
        ("left", "focus_left", "Focus Drivers"),
        ("right", "focus_right", "Focus Constructors"),
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
        # Determine which table triggered the event and open the right details
        try:
            table = event.sender  # type: ignore[attr-defined]
            if isinstance(table, DataTable):
                if table.id and table.id.startswith("drivers-panel") or table is self.query_one("#drivers-panel DataTable", DataTable):
                    self.action_open_details()
                elif table.id and table.id.startswith("constructors-panel") or table is self.query_one("#constructors-panel DataTable", DataTable):
                    self.action_open_details()
        except Exception:
            # Fallback to open based on current focus
            self.action_open_details()

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
