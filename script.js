document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navUL = document.querySelector('nav ul');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navUL.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navUL.classList.contains('active')) {
                hamburger.classList.remove('active');
                navUL.classList.remove('active');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add shadow to header on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
                .then(function() {
                    alert('Merci pour votre message ! Je vous répondrai dès que possible.');
                    contactForm.reset();
                }, function(error) {
                    alert('Oups ! Quelque chose s\'est mal passé. Veuillez réessayer plus tard.');
                    console.error('EmailJS error:', error);
                });
        });
    }
    
    // Platform filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const appCards = document.querySelectorAll('.app-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Active le bouton cliqué
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            // Filtre les applications
            appCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    const hasPlatform = card.querySelector(`.app-link.${filter}`);
                    card.style.display = hasPlatform ? 'block' : 'none';
                }
            });
        });
    });
    
    // Animation des statistiques
    function animateStats() {
        const statCards = document.querySelectorAll('.stat-card h3');
        
        statCards.forEach(stat => {
            const target = parseFloat(stat.dataset.count);
            const suffix = stat.textContent.replace(/[0-9.]/g, '');
            const duration = 2000; // 2 secondes
            const steps = 50;
            const increment = target / steps;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    current = target;
                }
                
                // Gère les nombres décimaux différemment des entiers
                if (target % 1 !== 0) {
                    stat.textContent = current.toFixed(1) + suffix;
                } else {
                    stat.textContent = Math.floor(current) + suffix;
                }
            }, duration / steps);
        });
    }
    
    // Animation d'apparition des éléments au défilement
    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Anime les stats si c'est la section stats
                    if (entry.target.id === 'stats') {
                        animateStats();
                    }
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.app-card, .platform-card, .stat-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Initialise toutes les animations
    setupScrollAnimations();
    
    // Ajoute un délai pour l'animation des cartes d'applications
    const appCards = document.querySelectorAll('.app-card');
    appCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
});
