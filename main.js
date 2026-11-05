const root = document.documentElement;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function store(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Failed to persist ${key}:`, error);
    }
}

/* ---------- Theme: dock toggle + settings switch, persisted in localStorage('theme') ---------- */
const themeToggle = $('#themeToggle');

function setTheme(theme) {
    root.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    $$('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === theme)));
    store('theme', theme);
}

themeToggle.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
$$('[data-theme-set]').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.themeSet)));
setTheme(root.dataset.theme || 'light');

/* ---------- Motion: settings switch, persisted in localStorage('motion') ---------- */
const motionToggle = $('#motionToggle');
motionToggle.checked = root.dataset.motion === 'reduced';
motionToggle.addEventListener('change', () => {
    root.dataset.motion = motionToggle.checked ? 'reduced' : 'full';
    store('motion', root.dataset.motion);
});

/* ---------- Dropdowns: native [popover] handles outside-click + Esc; we position + sync aria ---------- */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function placePopover(pop, trigger) {
    const t = trigger.getBoundingClientRect();
    const p = pop.getBoundingClientRect();
    const gap = 12;
    let top, left;

    if (trigger.closest('.dock') && innerWidth > 768) {
        // Vertical dock: open to the right
        left = t.right + gap;
        top = t.top + t.height / 2 - p.height / 2;
    } else if (t.top > innerHeight / 2) {
        // Bottom bar on mobile: open upward
        top = t.top - p.height - gap;
        left = t.left + t.width / 2 - p.width / 2;
    } else {
        // Top bar: open below
        top = t.bottom + gap;
        left = t.left + t.width / 2 - p.width / 2;
    }
    pop.style.top = `${clamp(top, gap, innerHeight - p.height - gap)}px`;
    pop.style.left = `${clamp(left, gap, innerWidth - p.width - gap)}px`;
}

$$('[popover]').forEach(pop => {
    const trigger = $(`[popovertarget="${pop.id}"]`);
    pop.addEventListener('toggle', e => {
        const open = e.newState === 'open';
        trigger.setAttribute('aria-expanded', String(open));
        if (open) placePopover(pop, trigger);
    });
    // Picking a link inside a dropdown closes it
    pop.addEventListener('click', e => {
        if (e.target.closest('a')) pop.hidePopover();
    });
});
addEventListener('resize', () => {
    $$('[popover]:popover-open').forEach(pop => placePopover(pop, $(`[popovertarget="${pop.id}"]`)));
});

/* ---------- Scroll-spy: dock + section dropdown + "Section" value ---------- */
const spyLinks = $$('[data-spy]');
const spyTargets = [...new Set(spyLinks.map(l => l.hash))]
    .map(hash => $(hash))
    .filter(Boolean)
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)); // parents before children
const sectionValue = $('#sectionValue');

function updateSpy() {
    const mid = innerHeight * 0.45;
    // Innermost target crossing the middle of the screen (e.g. #pigi inside #projects)
    const current = spyTargets
        .filter(el => {
            const r = el.getBoundingClientRect();
            return r.top <= mid && r.bottom > mid;
        })
        .pop();
    if (!current) return;

    spyLinks.forEach(link => {
        const active = link.hash === `#${current.id}`;
        link.classList.toggle('is-active', active);
        active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current');
    });

    const section = current.closest('main > [id]') || current;
    sectionValue.textContent = $(`#pop-section a[href="#${section.id}"]`)?.textContent ?? sectionValue.textContent;
}

addEventListener('scroll', updateSpy, { passive: true });  // cheap: a handful of rect reads
updateSpy();

/* ---------- Project filter: stack dropdown + dock search ---------- */
const projectCards = $$('#projects article');
const tagsOf = card => $$('.tags li', card).map(li => li.textContent.trim());
const filter = { tag: '', query: '' };
const stackOptions = $('#stackOptions');
const searchInput = $('#searchInput');

function applyFilter() {
    let shown = 0;
    projectCards.forEach(card => {
        const match = (!filter.tag || tagsOf(card).includes(filter.tag))
            && card.textContent.toLowerCase().includes(filter.query);
        card.hidden = !match;
        shown += match;
    });

    $$('.chip', stackOptions).forEach(c => c.setAttribute('aria-pressed', String(c.dataset.tag === filter.tag)));
    $('#stackValue').textContent = filter.tag || 'Laravel · Vue';

    const active = filter.tag || filter.query;
    $('#filterBar').hidden = !active;
    if (active) {
        const parts = [filter.tag, filter.query && `"${filter.query}"`].filter(Boolean).join(' · ');
        $('#filterText').textContent = shown
            ? `Showing ${shown} of ${projectCards.length} projects · ${parts}`
            : `No projects match ${parts}`;
    }
}

function showProjects() {
    $('#projects').scrollIntoView();
}

// Build stack chips from the tags actually on the project cards
['', ...new Set(projectCards.flatMap(tagsOf))].forEach(tag => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.tag = tag;
    chip.textContent = tag || 'All projects';
    stackOptions.append(chip);
});

stackOptions.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    filter.tag = chip.dataset.tag;
    applyFilter();
    $('#pop-stack').hidePopover();
    showProjects();
});

searchInput.addEventListener('input', () => {
    filter.query = searchInput.value.trim().toLowerCase();
    applyFilter();
});

$('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    $('#pop-search').hidePopover();
    showProjects();
});

function clearFilters() {
    filter.tag = '';
    filter.query = '';
    searchInput.value = '';
    applyFilter();
}

$('#clearFilters').addEventListener('click', clearFilters);

// A link to a card the filter is hiding (e.g. "View Details" → #pigi) clears the filter first
document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    const target = link && link.hash && $(link.hash);
    if (target?.closest('[hidden]')) clearFilters();
});

applyFilter();

/* ---------- Scroll reveal: one-time fade-up ---------- */
const revealer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
    });
}, { threshold: 0.15 });

$$('.reveal').forEach(el => revealer.observe(el));
