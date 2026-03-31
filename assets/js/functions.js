/**
 * UI Utility Functions
 */

/**
 * Responsive navbar toggle
 */
function toggleNavbar() {
    document
        .querySelector('.cs-nav-links')
        ?.classList.toggle('collapsed');
}

/**
 * Toggle application theme
 */
function changeTheme() {
    const nextTheme =
        CURRENT_THEME === Theme.DARK ? Theme.LIGHT : Theme.DARK;

    if (CURRENT_THEME === nextTheme) return;

    html.dataset.theme = nextTheme;
    CURRENT_THEME = nextTheme;
    syncThemeIcon();

    try {
        localStorage.setItem('theme', nextTheme);
    } catch (error) {
        console.error('Failed to persist theme:', error);
    }
}
