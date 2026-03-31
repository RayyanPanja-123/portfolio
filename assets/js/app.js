/**
 * Application bootstrap & global state
 */

const html = document.documentElement;

const Theme = {
    LIGHT: 'light',
    DARK: 'dark',
};

let CURRENT_THEME = localStorage.getItem('theme') || Theme.LIGHT;

window.addEventListener('DOMContentLoaded', () => {
    /**
     * Initialize theme
     */
    html.dataset.theme = CURRENT_THEME;
    syncThemeIcon();

    /**
     * Navbar active link (click-based fallback)
     * IntersectionObserver will override this on scroll
     */
    document.querySelectorAll('.cs-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            setActiveNavLink(link);
            document.querySelector('.cs-nav-links')?.classList.add('collapsed');
        });
    });
});

/**
 * Sets the active navbar link
 */
function setActiveNavLink(activeLink) {
    document.querySelectorAll('.cs-nav-link.active').forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

function syncThemeIcon() {
    const icon = document.querySelector('#themeIcon');
    if (!icon) return;

    icon.classList.toggle('bi-moon', CURRENT_THEME === Theme.LIGHT);
    icon.classList.toggle('bi-brightness-high-fill', CURRENT_THEME === Theme.DARK);
}
