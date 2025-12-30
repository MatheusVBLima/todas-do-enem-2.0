/**
 * Script to apply appearance settings before React hydration.
 * This prevents the flash of incorrect theme.
 */
export const appearanceScript = `
(function() {
  try {
    const STORAGE_KEY = 'appearance-settings';
    const DEFAULT_SETTINGS = {
      theme: 'default',
      mode: 'light',
      font: 'sans'
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    let settings = DEFAULT_SETTINGS;

    if (stored) {
      try {
        settings = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing appearance settings:', e);
      }
    } else {
      // Check system preference for initial mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      settings = {
        ...DEFAULT_SETTINGS,
        mode: prefersDark ? 'dark' : 'light'
      };
    }

    const root = document.documentElement;

    // Apply mode (light/dark)
    if (settings.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply theme
    root.setAttribute('data-theme', settings.theme || 'default');

    // Apply font
    root.setAttribute('data-font', settings.font || 'sans');
  } catch (e) {
    console.error('Error applying appearance settings:', e);
  }
})();
`

