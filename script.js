// ===== AUTO THEME DETECTION =====
function setupAutoTheme() {
  // Écouter les changements de thème système en temps réel
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const theme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    });
  }
}

// ===== PIXEL ART BACKGROUND =====
class PixelArtBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Pixel art style
    this.animationId = null;
    this.stars = [];
    this.clouds = [];
    this.time = 0;

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.createStars();
    this.createClouds();
    this.animate();
    this.setupEventListeners();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createStars() {
    this.stars = [];
    const starCount = 50;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() > 0.5 ? 2 : 3,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  createClouds() {
    this.clouds = [];
    const cloudCount = 5;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * (this.canvas.height * 0.4),
        speed: 0.2 + Math.random() * 0.3,
        size: 30 + Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.3
      });
    }
  }

  drawPixelRect(x, y, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
  }

  drawStar(star) {
    const theme = document.documentElement.getAttribute('data-theme');
    const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset);
    const opacity = 0.5 + (twinkle * 0.5);

    const starColor = theme === 'dark'
      ? `rgba(74, 158, 255, ${opacity})`
      : `rgba(0, 68, 119, ${opacity})`;

    // Étoile en forme de croix pixel art
    this.drawPixelRect(star.x, star.y, star.size, starColor);
    this.drawPixelRect(star.x - star.size, star.y, star.size, starColor);
    this.drawPixelRect(star.x + star.size, star.y, star.size, starColor);
    this.drawPixelRect(star.x, star.y - star.size, star.size, starColor);
    this.drawPixelRect(star.x, star.y + star.size, star.size, starColor);
  }

  drawCloud(cloud) {
    const theme = document.documentElement.getAttribute('data-theme');
    const cloudColor = theme === 'dark'
      ? `rgba(74, 158, 255, ${cloud.opacity})`
      : `rgba(0, 68, 119, ${cloud.opacity})`;

    const pixelSize = 4;
    const cloudPattern = [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0]
    ];

    cloudPattern.forEach((row, rowIndex) => {
      row.forEach((pixel, colIndex) => {
        if (pixel === 1) {
          this.drawPixelRect(
            cloud.x + colIndex * pixelSize,
            cloud.y + rowIndex * pixelSize,
            pixelSize,
            cloudColor
          );
        }
      });
    });

    // Déplacement du nuage
    cloud.x -= cloud.speed;
    if (cloud.x < -cloud.size * 2) {
      cloud.x = this.canvas.width + cloud.size;
      cloud.y = Math.random() * (this.canvas.height * 0.4);
    }
  }

  drawPixelGrid() {
    const theme = document.documentElement.getAttribute('data-theme');
    const gridColor = theme === 'dark'
      ? 'rgba(74, 158, 255, 0.03)'
      : 'rgba(0, 68, 119, 0.03)';

    const gridSize = 20;
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;

    // Lignes verticales
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Lignes horizontales
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dessiner la grille pixel en arrière-plan
    this.drawPixelGrid();

    // Dessiner les étoiles
    this.stars.forEach(star => this.drawStar(star));

    // Dessiner les nuages
    this.clouds.forEach(cloud => this.drawCloud(cloud));

    this.time += 1;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  setupEventListeners() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resizeCanvas();
        this.createStars();
        this.createClouds();
      }, 250);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
      } else {
        if (!this.animationId) {
          this.animate();
        }
      }
    });
  }
}

// ===== SCROLL ANIMATION MANAGER =====
class ScrollAnimationManager {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    this.init();
  }

  init() {
    this.setupObserver();
    this.markElementsForAnimation();
  }

  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, this.observerOptions);
  }

  markElementsForAnimation() {
    const elements = document.querySelectorAll('.project, .event, .contact, .presentation, .img-pp');

    elements.forEach((el, index) => {
      el.classList.add('animate-on-scroll');
      el.style.transitionDelay = `${index * 0.1}s`;
      this.observer.observe(el);
    });
  }
}

// ===== 3D TILT EFFECT MANAGER =====
class TiltEffectManager {
  constructor() {
    this.elements = document.querySelectorAll('.project .header');
    this.init();
  }

  init() {
    this.elements.forEach(el => {
      el.addEventListener('mousemove', (e) => this.handleTilt(e, el));
      el.addEventListener('mouseleave', () => this.resetTilt(el));
    });
  }

  handleTilt(e, el) {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  }

  resetTilt(el) {
    el.style.transform = '';
  }
}

// ===== PAGE TRANSITION MANAGER =====
class PageTransitionManager {
  constructor() {
    this.overlay = document.querySelector('.page-transition-overlay');
    this.duration = 400;
    this.init();
  }

  init() {
    this.animateIn();
    this.setupNavigationLinks();
  }

  animateIn() {
    this.overlay.classList.add('active');

    window.addEventListener('load', () => {
      setTimeout(() => {
        this.overlay.classList.remove('active');
      }, 100);
    });
  }

  animateOut(url) {
    document.body.classList.add('transitioning');
    this.overlay.classList.add('active');

    setTimeout(() => {
      window.location.href = url;
    }, this.duration);
  }

  setupNavigationLinks() {
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.classList.contains('active')) {
          e.preventDefault();
          return;
        }

        e.preventDefault();
        const url = link.getAttribute('href');
        this.animateOut(url);
      });
    });
  }
}

// ===== UTILITY FUNCTIONS =====
function isTouchDevice() {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
}

function setupHeaderScrollEffect() {
  const header = document.querySelector('header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let scrollTimer;

  window.addEventListener('scroll', () => {
    if (!scrollTimer) {
      scrollTimer = setTimeout(() => {
        if (Math.abs(window.scrollY - lastScrollY) > 5) {
          if (window.scrollY > 50) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          lastScrollY = window.scrollY;
        }
        scrollTimer = null;
      }, 16);
    }
  }, { passive: true });
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Détecter les touch devices
  if (isTouchDevice()) {
    document.body.classList.add('touch-device');
  }

  // 1. Setup auto theme detection
  setupAutoTheme();

  // 2. Initialiser le fond pixel art (sauf si prefers-reduced-motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const pixelArt = new PixelArtBackground('particle-canvas');
  }

  // 3. Initialiser les animations au scroll
  if (!prefersReducedMotion) {
    const scrollAnimations = new ScrollAnimationManager();
  }

  // 4. Initialiser les effets 3D (desktop uniquement)
  if (!isTouchDevice() && window.innerWidth > 768 && !prefersReducedMotion) {
    const tiltEffects = new TiltEffectManager();
  }

  // 5. Initialiser les transitions de page
  const pageTransitions = new PageTransitionManager();

  // 6. Setup header scroll effect
  setupHeaderScrollEffect();

  console.log('Portfolio moderne initialisé ✨');
});
