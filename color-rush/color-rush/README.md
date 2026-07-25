# Color Rush — mini game (demo)

A small reflex game: bubbles float up in random colors, and you pop the one matching the target color before it drifts away. Wrong pops break your combo. Speed ramps up as your score climbs. High score is saved in the browser.

## Files

```
color-rush/
├── index.html      # start / game / end screens
├── css/style.css   # dark glassmorphic design + animations
└── js/script.js    # game loop, spawning, scoring, timer
```

## Open it in VS Code

1. Unzip this folder and open it in VS Code: `File → Open Folder…`
2. Install the **Live Server** extension (by Ritwick Dey) from the Extensions panel (`Ctrl/Cmd+Shift+X`, search "Live Server").
3. Right-click `index.html` and choose **"Open with Live Server."**
4. Play at `http://127.0.0.1:5500` — edits to CSS/JS reload automatically.

No Live Server? Just double-click `index.html` to open it directly in a browser — the game runs the same either way.

## How it works (for tweaking)

All the tunable numbers live at the top of `js/script.js`:

- `GAME_LENGTH` — round length in seconds (default 45).
- `BASE_SPAWN_MS` / `MIN_SPAWN_MS` — how often bubbles spawn at the start vs. the fastest it ramps to.
- `BASE_LIFETIME_MS` — how long a bubble stays on screen before it disappears unpopped.
- `COLORS` — the six colors in play; add or remove entries to change difficulty (more colors = harder).

Scoring: a correct pop is worth `10 × combo`, and combo increases by 1 each correct pop in a row. A wrong pop costs 5 points and resets combo to 1.

Colors, glow, and glass panel styling are CSS custom properties at the top of `css/style.css` under `:root` — change `--accent` and the `--c-*` variables to reskin the whole game.

## Notes

- Fully responsive; HUD reflows on narrow screens.
- No frameworks or build step — just open and edit.
- High score persists via `localStorage`, per browser.
