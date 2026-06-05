# 🌐 Tic-Tac-Toe Web UI Documentation

This subdirectory houses the premium, responsive static web frontend for the **Q-Learning Tic-Tac-Toe AI**. The interface is built using vanilla HTML5, CSS3, and modern modular ES6 JavaScript, resulting in zero build tool dependencies and extremely fast load times.

---

## 📂 Web File Structure

```
web/
├── css/
│   ├── design-system.css   # Global design tokens (HSL colors, animation times, typography)
│   ├── index.css           # App shell layout, headers, body accents, and theme toggle buttons
│   ├── menu.css            # Start screen styling, mode cards, and symbol picker layouts
│   ├── board.css           # 3x3 grid layout, cell rendering, indicators, and line sweeps
│   ├── stats.css           # Dashboard stats grid, win rates, and progress indicators
│   ├── dashboard.css       # AI Brain state values, Q-table exploration dashboard, and drawer
│   └── game-over.css       # Game-over modal popup styling
├── js/
│   ├── theme.js            # Initial theme checks, prefers-color-scheme listener, and sync
│   ├── particles.js        # Canvas-based ambient particle field background animation
│   └── app.js              # Game loop manager, AI JSON loader, UI renderer, and gestures
├── screenshots/            # UI preview media for main documentation
│   ├── desktop_gameplay.png
│   ├── mobile_landing.png
│   ├── mobile_gameplay.png
│   └── mobile_stats.png
├── index.html              # Main application entry point
└── README.md               # Dedicated Web UI documentation (This file)
```

---

## 🎨 Premium Design Decisions

### 1. Modular CSS & Design System
We avoid nested utilities and framework lock-in by utilizing custom CSS custom properties (variables) defined inside [design-system.css](css/design-system.css). 
- **Palette Control:** Shift between deep navy (`#0a0e1a`) and light slate (`#f8fafc`) seamlessly by overriding primary color properties on the `[data-theme="light"]` attribute selector.
- **Micro-Animations:** Fluid timing constants (`--transition-base: 0.25s`, `--ease-bounce`) are applied sitewide to keep hovers, selections, and drawers feeling organic and alive.

### 2. Synchronous Pre-Paint Theme Load
To resolve the common **"flash of dark mode"** layout shift issue in client-rendered pages, we isolate the theme initialization script in the `<head>` of [index.html](index.html):
```html
<script src="js/theme.js"></script>
```
The script runs immediately as a blocking IIFE, checking local preference overrides or system media queries before the document body is parsed or painted:
```javascript
(function() {
  const savedTheme = localStorage.getItem('tictactoe_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const activeTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', activeTheme);
})();
```

### 3. Responsive Drawer-Based Shell Layout
- **Large Viewports (>=1024px):** Layout spaces the interactive grid, stats sidebar, and live Q-table brain panel side-by-side to take full advantage of wider screens.
- **Mobile Viewports (<=767px):** All auxiliary panels (Stats and AI Brain) are converted into overlay drawers. Users swipe up on the screen or tap the bottom navigation bar to slide up the drawers.
- **Touch Targets:** Interactive components (cells, mode cards, symbols, buttons) scale fluidly via `clamp()` and have a minimum bounding size of `48px` to guarantee comfortable tapping.

### 4. Ambient Canvas Particles
The background uses a lightweight HTML5 `<canvas>` managed by [particles.js](js/particles.js). It renders subtle floating nodes that drift slowly. The speed is automatically optimized and listens to system settings (`prefers-reduced-motion`) to respect battery and user accessibility options.

---

## 🛠️ How to Extend & Customize

### A. Add Custom Theme Palettes
You can add third-party themes (e.g. *Cyberpunk* or *Nord*) by appending custom attribute styles to [design-system.css](css/design-system.css):
```css
[data-theme="cyberpunk"] {
  --bg-primary: #120136;
  --bg-secondary: #03001e;
  --text-primary: #00f0ff;
  --text-muted: #ff007f;
  --accent-x: #00f0ff;
  --accent-o: #ff007f;
  /* Add custom glow overrides */
}
```

### B. Adjust Particle Densities & Colors
To change the look of the background particle swarm, open [js/particles.js](js/particles.js) and adjust the configuration parameters:
```javascript
this.baseParticleCount = 45;       // Total number of particles
this.maxVelocity = 0.4;            // Max drift speed (px/frame)
this.particleColor = '#00d4ff';    // Base particle hex code
```

### C. Hook Up Game Sounds
To add sound effects on grid moves:
1. Copy audio files (e.g. `tap.mp3`, `win.mp3`) into a `web/assets/` folder.
2. Inside [js/app.js](js/app.js), locate the move handler and play your sounds:
   ```javascript
   function playMoveSound() {
     const audio = new Audio('assets/tap.mp3');
     audio.volume = 0.2;
     audio.play().catch(err => console.log('Audio blocked', err));
   }
   ```
