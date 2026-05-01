/**
 * Intersection Observers
 */

/**
 * Navbar section observer
 */
const navLinkObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const { id } = entry.target;
            if (!id) return;

            const activeLink = document.querySelector(
                `.cs-nav-link[href="#${id}"]`
            );

            if (activeLink) {
                document
                    .querySelectorAll('.cs-nav-link.active')
                    .forEach(link => link.classList.remove('active'));

                activeLink.classList.add('active');
            }
        });
    },
    {
        threshold: 0.3,
    }
);

/**
 * Animation observer (one-time)
 */
const animationObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const animation = entry.target.dataset.animation;
            if (animation) {
                entry.target.classList.add(animation);
            }

            animationObserver.unobserve(entry.target);
        });
    },
    {
        threshold: 0.2,
    }
);

window.addEventListener('DOMContentLoaded', () => {
    /**
     * Observe sections for navbar highlighting
     */
    document
        .querySelectorAll('header[id], section[id]')
        .forEach(section => navLinkObserver.observe(section));

    /**
     * Observe animated elements
     */
    document
        .querySelectorAll('.animate[data-animation]')
        .forEach(el => animationObserver.observe(el));
});
