import os
import json
import requests
from datetime import datetime, timedelta
from textual.app import App, ComposeResult
from textual.containers import Horizontal, Vertical
from textual.widgets import Footer, Header, DataTable
from textual.events import Resize

CACHE_FILE = "f1_cache.json"
API_BASE = "http://api.jolpi.ca"


def get_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            return json.load(f)
    return {}


def set_cache(data):
    with open(CACHE_FILE, "w") as f:
        json.dump(data, f)


def fetch_with_cache(endpoint, key, expire_minutes=60, force=False):
    cache = get_cache()
    now = datetime.utcnow().isoformat()
    if not force and key in cache:
        cached = cache[key]
        if (datetime.fromisoformat(now) - datetime.fromisoformat(cached["time"])) < timedelta(minutes=expire_minutes):
            return cached["data"]
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
    ]

    def __init__(self):
        super().__init__()
        self._drivers_data = []
        self._constructors_data = []

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        yield Horizontal(
            StandingsPanel("drivers-panel", "Drivers Standings"),
            StandingsPanel("constructors-panel", "Constructors Standings"),
            id="main",
        )
        yield Footer()

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
            self.render_tables()
            self.refresh()

    def render_tables(self) -> None:
        d_panel = self.query_one("#drivers-panel", StandingsPanel)
        c_panel = self.query_one("#constructors-panel", StandingsPanel)
        dtab = d_panel.table
        ctab = c_panel.table
        assert dtab and ctab

        # Width budgets
        d_width = max(40, d_panel.size.width - 4)
        c_width = max(30, c_panel.size.width - 4)

        fixed_d = 3 + 4 * 4 + 5 + 4
        flex_d = max(0, d_width - fixed_d)
        driver_w = max(10, int(flex_d * 0.55))
        team_w = max(8, flex_d - driver_w)

        fixed_c = 3 + 3 * 3 + 5 + 4
        name_w = max(10, c_width - fixed_c)

        try:
            dtab.set_column_width(0, 3)
            dtab.set_column_width(3, 5)
            dtab.set_column_width(4, 4)
            ctab.set_column_width(0, 3)
            ctab.set_column_width(2, 5)
            ctab.set_column_width(3, 4)
            dtab.set_column_width(1, driver_w)
            dtab.set_column_width(2, team_w)
            ctab.set_column_width(1, name_w)
        except Exception:
            pass

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


if __name__ == "__main__":
    F1DashboardApp().run()
