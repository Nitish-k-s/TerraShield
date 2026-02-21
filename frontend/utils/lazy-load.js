// Lazy Load – native lazy loading with fallback
export function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.onload = () => img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });

        images.forEach(img => observer.observe(img));
    } else {
        // Fallback: load all
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}
