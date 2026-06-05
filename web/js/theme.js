/**
 * TIC-TAC-TOE | Theme Management & Selection System
 * 
 * Implements prefers-color-scheme media query checks, theme switches,
 * localStorage persistence, and synchronizes the morphing SVG toggle button.
 * Uses an IIFE to set document attributes early, avoiding dark/light flash bugs.
 */

(function() {
  // 1. Immediately determine theme before paint to prevent flashing
  const savedTheme = localStorage.getItem('tictactoe_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const activeTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', activeTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
  const toggles = document.querySelectorAll('.theme-toggle-btn');
  const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';

  // 2. Synchronize initial state of toggles on page load
  syncThemeToggles(activeTheme);

  // 3. Setup click listeners on all toggles (start header & game header)
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      // Transition the theme
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('tictactoe_theme', newTheme);

      // Sync active state in UI
      syncThemeToggles(newTheme);

      // Subtle haptic response if api is available
      if (window.triggerHaptic) {
        window.triggerHaptic(8);
      }
    });
  });

  // 4. Listen to system preference changes dynamically (only follows if user hasn't overridden preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const hasOverride = localStorage.getItem('tictactoe_theme') !== null;
    if (!hasOverride) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      syncThemeToggles(newTheme);
    }
  });
});

/**
 * Synchronize aria labels and classes for screen readers and SVG transition styling
 * @param {string} theme - 'light' or 'dark'
 */
function syncThemeToggles(theme) {
  const toggles = document.querySelectorAll('.theme-toggle-btn');
  toggles.forEach(btn => {
    btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    
    // Animate visual state via CSS class toggle
    if (theme === 'light') {
      btn.classList.add('light');
      btn.classList.remove('dark');
    } else {
      btn.classList.add('dark');
      btn.classList.remove('light');
    }
  });
}
