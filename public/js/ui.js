// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Mobile nav toggle
document.querySelector('.nav-toggle')?.addEventListener('click', function () {
    const links = document.querySelector('.nav-links');
    if (links) {
        const isOpen = links.style.display === 'flex';
        links.style.display = isOpen ? 'none' : 'flex';
        links.style.flexDirection = 'column';
        links.style.position = 'absolute';
        links.style.top = '64px';
        links.style.left = '0';
        links.style.width = '100%';
        links.style.background = 'var(--background)';
        links.style.padding = '20px var(--margin-edge)';
        links.style.borderBottom = '1px solid var(--border-low-contrast)';
        links.style.gap = '16px';
    }
});