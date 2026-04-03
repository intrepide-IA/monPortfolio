// main.js - Orchestration principale du portfolio

document.addEventListener('DOMContentLoaded', async function () {

    // 0. Contenu éditable (JSON) — avant les traductions pour le premier rendu
    if (typeof window.loadSiteContent === 'function') {
        try {
            await window.loadSiteContent();
            if (typeof window.renderSiteContent === 'function') {
                window.renderSiteContent();
            }
        } catch (e) {
            console.error('Chargement site-content:', e);
        }
    }

    // 1. Initialiser le gestionnaire de traductions
    if (typeof translationManager !== 'undefined') {
        translationManager.init();
    }
    
    // 2. Charger et afficher les projets
    if (typeof projectsManager !== 'undefined') {
        window.projectsManager = projectsManager;
        await projectsManager.loadProjects();
        projectsManager.setLanguage(translationManager.getCurrentLanguage());
        projectsManager.updateProjects();
    }
    
    // 3. Gestion du menu mobile
    initMobileMenu();
    
    // 4. Initialiser les animations Three.js
    if (typeof initThreeAnimations === 'function') {
        initThreeAnimations();
    }
    
    // 5. Initialiser le gestionnaire de formulaire
    if (typeof initFormHandler === 'function') {
        initFormHandler();
    }
    
    // 6. Initialiser l'Intersection Observer pour les animations
    initScrollAnimations();
    
    console.log('✅ Portfolio initialisé avec succès');
});

// Gestion du menu mobile
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = menuToggle?.querySelector('i');
    const mobileLinks = mobileMenu?.querySelectorAll('a');
    
    if (!menuToggle || !mobileMenu) return;
    
    // Toggle menu
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        
        if (menuIcon) {
            if (menuIcon.classList.contains('fa-bars')) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            } else {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        }
    });
    
    // Fermer le menu au clic sur un lien
    mobileLinks?.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            if (menuIcon) {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        });
    });
}

// Animations au scroll
function initScrollAnimations() {
  const panels = document.querySelectorAll('.feature-panel');

  if (!panels.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  panels.forEach(panel => observer.observe(panel));
}

// rendre accessible globalement
window.initScrollAnimations = initScrollAnimations;


// Gestion du smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});