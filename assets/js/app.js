const html = document.documentElement;

const Theme = {
    LIGHT: 'light',
    DARK: 'dark',
};

let CURRENT_THEME = localStorage.getItem('theme') || Theme.LIGHT;

function toggleNavbar() {
    const links = document.querySelector('.cs-nav-links');
    const btn = document.getElementById('navToggleBtn');
    if (!links || !btn) return;

    links.classList.toggle('collapsed');
    btn.setAttribute('aria-expanded', String(!links.classList.contains('collapsed')));
}

function changeTheme() {
    const nextTheme = CURRENT_THEME === Theme.DARK ? Theme.LIGHT : Theme.DARK;

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

window.addEventListener('DOMContentLoaded', () => {
    html.dataset.theme = CURRENT_THEME;
    syncThemeIcon();

    document.getElementById('navToggleBtn')?.addEventListener('click', toggleNavbar);
    document.getElementById('themeChangeBtn')?.addEventListener('click', changeTheme);

    document.querySelectorAll('.cs-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            setActiveNavLink(link);
            document.querySelector('.cs-nav-links')?.classList.add('collapsed');
            document.getElementById('navToggleBtn')?.setAttribute('aria-expanded', 'false');
        });
    });
});
