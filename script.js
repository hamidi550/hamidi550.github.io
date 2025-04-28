// Animation lors du défilement
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observer les sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Animation spécifique pour les cartes d'applications
    const appCards = document.querySelectorAll('.app-card');
    appCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
});

// Fonctionnalité supplémentaire: Filtre par plateforme
function filterApps(platform) {
    const apps = document.querySelectorAll('.app-card');
    
    apps.forEach(app => {
        if (platform === 'all') {
            app.style.display = 'block';
        } else {
            const hasPlatform = app.querySelector(`.download-badges a[href*="${platform}"]`);
            app.style.display = hasPlatform ? 'block' : 'none';
        }
    });
}
