/**
 * THE DOME RESTAURANT – BIZERTE, TUNISIE
 * Script principal (JavaScript Vanilla)
 * - Header dynamique (transparent sur Hero -> beige/ivoire au scroll)
 * - Menu mobile plein écran accessible
 * - Onglets interactifs des 14 catégories du Menu avec support clavier
 * - Révélation fluide au défilement via IntersectionObserver
 * - Lightbox plein écran avec navigation clavier, compteur et swipe tactile
 */

(function () {
  'use strict';

  /* ========================================================================
     1. HEADER DYNAMIQUE & NAVIGATION MOBILE
     ======================================================================== */
  const header = document.getElementById('top');
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link, .nav-mobile-cta a');
  const sectionElements = document.querySelectorAll('main section[id]');

  function updateHeaderOnScroll() {
    if (!header) return;
    if (window.scrollY > 36) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  function closeMobileMenu() {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
    mainNav.classList.remove('is-open');
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !lightbox.classList.contains('is-open')) {
      document.body.classList.remove('no-scroll');
    }
  }

  function toggleMobileMenu() {
    if (!menuToggle || !mainNav) return;
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMobileMenu();
    } else {
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Fermer le menu de navigation');
      mainNav.classList.add('is-open');
      document.body.classList.add('no-scroll');
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && mainNav && mainNav.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });

  /* Mise en évidence du lien actif pendant le défilement */
  function highlightActiveSection() {
    const scrollPosition = window.scrollY + 180;
    sectionElements.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach((navLink) => {
          navLink.classList.toggle(
            'is-active',
            navLink.getAttribute('href') === '#' + sectionId
          );
        });
      }
    });
  }

  window.addEventListener(
    'scroll',
    () => {
      updateHeaderOnScroll();
      highlightActiveSection();
    },
    { passive: true }
  );

  updateHeaderOnScroll();
  highlightActiveSection();

  /* ========================================================================
     2. ONGLETS DU MENU (14 CATÉGORIES + NAVIGATION CLAVIER)
     ======================================================================== */
  const menuTabs = Array.from(document.querySelectorAll('.menu-tab'));
  const menuPanels = Array.from(document.querySelectorAll('.menu-category-panel'));
  const menuPanelsContainer = document.getElementById('menu-panels-container');

  function activateMenuTab(selectedTab, shouldFocus = false) {
    const targetId = selectedTab.getAttribute('data-target');

    if (menuPanelsContainer) {
      menuPanelsContainer.classList.toggle('is-single-category', targetId !== 'all');
    }

    menuTabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle('is-active', isSelected);
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    menuPanels.forEach((panel) => {
      if (targetId === 'all' || panel.id === targetId) {
        panel.hidden = false;
        panel.classList.add('is-visible');
      } else {
        panel.hidden = true;
        panel.classList.remove('is-visible');
      }
    });

    if (shouldFocus) {
      selectedTab.focus();
    }
  }

  menuTabs.forEach((tab, index) => {
    tab.setAttribute('tabindex', index === 0 ? '0' : '-1');

    tab.addEventListener('click', () => {
      activateMenuTab(tab, false);
    });

    tab.addEventListener('keydown', (event) => {
      let nextIndex = null;
      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % menuTabs.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + menuTabs.length) % menuTabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = menuTabs.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        activateMenuTab(menuTabs[nextIndex], true);
      }
    });
  });

  /* ========================================================================
     3. RÉVÉLATION AU SCROLL (INTERSECTION OBSERVER)
     ======================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* ========================================================================
     4. LIGHTBOX GALERIE PLEIN ÉCRAN
     ======================================================================== */
  const lightbox = document.getElementById('lightbox');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxCloseBtn = document.getElementById('lightbox-close');
  const lightboxPrevBtn = document.getElementById('lightbox-prev');
  const lightboxNextBtn = document.getElementById('lightbox-next');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const galleryTriggers = Array.from(document.querySelectorAll('.gallery-trigger'));

  let currentIndex = 0;
  let lastFocusedTrigger = null;
  let touchStartX = 0;
  let touchEndX = 0;

  function formatTwoDigits(num) {
    return num < 10 ? '0' + num : String(num);
  }

  function updateLightboxSlide(index) {
    if (!galleryTriggers.length) return;
    currentIndex = (index + galleryTriggers.length) % galleryTriggers.length;

    const trigger = galleryTriggers[currentIndex];
    const fullSrc = trigger.getAttribute('data-src');
    const captionText = trigger.getAttribute('data-caption') || '';
    const imgElement = trigger.querySelector('img');
    const altText = imgElement ? imgElement.getAttribute('alt') : captionText;

    if (lightboxImage && fullSrc) {
      lightboxImage.setAttribute('src', fullSrc);
      lightboxImage.setAttribute('alt', altText || '');
    }

    if (lightboxCaption) {
      lightboxCaption.textContent = captionText;
    }

    if (lightboxCounter) {
      lightboxCounter.textContent =
        formatTwoDigits(currentIndex + 1) + ' / ' + formatTwoDigits(galleryTriggers.length);
    }
  }

  function openLightbox(index, triggerElement) {
    if (!lightbox) return;
    lastFocusedTrigger = triggerElement || document.activeElement;
    updateLightboxSlide(index);

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    if (lightboxCloseBtn) {
      lightboxCloseBtn.focus();
    }
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (!mainNav || !mainNav.classList.contains('is-open')) {
      document.body.classList.remove('no-scroll');
    }

    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
      lastFocusedTrigger.focus();
    }
  }

  function showPrevImage() {
    updateLightboxSlide(currentIndex - 1);
  }

  function showNextImage() {
    updateLightboxSlide(currentIndex + 1);
  }

  galleryTriggers.forEach((trigger, index) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openLightbox(index, trigger);
    });
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeLightbox);
  }

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      showPrevImage();
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      showNextImage();
    });
  }

  /* Gestion clavier (Escape, Flèches, Focus Trap) */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (lightbox && lightbox.classList.contains('is-open')) {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (mainNav && mainNav.classList.contains('is-open')) {
        closeMobileMenu();
      }
    }

    if (!lightbox || !lightbox.classList.contains('is-open')) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPrevImage();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNextImage();
    } else if (event.key === 'Tab') {
      const focusableControls = [lightboxCloseBtn, lightboxPrevBtn, lightboxNextBtn].filter(Boolean);
      if (!focusableControls.length) return;

      const firstControl = focusableControls[0];
      const lastControl = focusableControls[focusableControls.length - 1];

      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl.focus();
      }
    }
  });

  /* Swipe tactile dans la lightbox sur mobile */
  if (lightbox) {
    lightbox.addEventListener(
      'touchstart',
      (event) => {
        if (!event.changedTouches || !event.changedTouches.length) return;
        touchStartX = event.changedTouches[0].screenX;
      },
      { passive: true }
    );

    lightbox.addEventListener(
      'touchend',
      (event) => {
        if (!event.changedTouches || !event.changedTouches.length) return;
        touchEndX = event.changedTouches[0].screenX;
        const deltaX = touchEndX - touchStartX;
        if (Math.abs(deltaX) > 48) {
          if (deltaX < 0) {
            showNextImage();
          } else {
            showPrevImage();
          }
        }
      },
      { passive: true }
    );
  }
})();
