// ===== AUTO THEME DETECTION =====
function setupAutoTheme() {
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
    this.ctx.imageSmoothingEnabled = false;
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
      ? `rgba(96, 165, 250, ${opacity})`
      : `rgba(0, 102, 255, ${opacity})`;

    this.drawPixelRect(star.x, star.y, star.size, starColor);
    this.drawPixelRect(star.x - star.size, star.y, star.size, starColor);
    this.drawPixelRect(star.x + star.size, star.y, star.size, starColor);
    this.drawPixelRect(star.x, star.y - star.size, star.size, starColor);
    this.drawPixelRect(star.x, star.y + star.size, star.size, starColor);
  }

  drawCloud(cloud) {
    const theme = document.documentElement.getAttribute('data-theme');
    const cloudColor = theme === 'dark'
      ? `rgba(96, 165, 250, ${cloud.opacity})`
      : `rgba(0, 102, 255, ${cloud.opacity})`;

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

    cloud.x -= cloud.speed;
    if (cloud.x < -cloud.size * 2) {
      cloud.x = this.canvas.width + cloud.size;
      cloud.y = Math.random() * (this.canvas.height * 0.4);
    }
  }

  drawPixelGrid() {
    const theme = document.documentElement.getAttribute('data-theme');
    const gridColor = theme === 'dark'
      ? 'rgba(96, 165, 250, 0.03)'
      : 'rgba(0, 102, 255, 0.03)';

    const gridSize = 20;
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPixelGrid();
    this.stars.forEach(star => this.drawStar(star));
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

// ===== SCROLL SPY NAVIGATION =====
class ScrollSpyNavigation {
  constructor() {
    this.navHeader = document.querySelector('.nav-header');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('.section, .hero-section');
    this.init();
  }

  init() {
    this.setupScrollSpy();
    this.setupSmoothScroll();
    this.setupScrollHeader();
  }

  setupScrollSpy() {
    // Utiliser scroll event pour plus de précision
    let scrollTimer;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.updateActiveSection();
      }, 50);
    }, { passive: true });

    // Mise à jour initiale
    this.updateActiveSection();
  }

  updateActiveSection() {
    const scrollPosition = window.scrollY + 200; // Offset pour la navigation

    let currentSection = 'hero';

    this.sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.id;
      }
    });

    this.updateActiveLink(currentSection);
  }

  updateActiveLink(sectionId) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${sectionId}`) {
        link.classList.add('active');
      }
    });
  }

  setupSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupScrollHeader() {
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        this.navHeader.classList.add('scrolled');
      } else {
        this.navHeader.classList.remove('scrolled');
      }
      lastScrollY = window.scrollY;
    }, { passive: true });
  }
}

// ===== MOBILE MENU =====
class MobileMenu {
  constructor() {
    this.toggle = document.querySelector('.mobile-menu-toggle');
    this.overlay = document.querySelector('.mobile-menu-overlay');
    this.closeBtn = document.querySelector('.mobile-menu-close');
    this.navLinks = document.querySelectorAll('.mobile-nav-link');
    this.init();
  }

  init() {
    if (!this.toggle || !this.overlay) return;

    this.toggle.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        this.close();

        setTimeout(() => {
          const target = document.querySelector(targetId);
          if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        }, 300);
      });
    });
  }

  open() {
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ===== TYPED TEXT EFFECT =====
class TypedText {
  constructor(element, texts, speed = 100) {
    this.element = element;
    this.texts = texts;
    this.speed = speed;
    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.init();
  }

  init() {
    setTimeout(() => this.type(), 1000);
  }

  type() {
    const currentText = this.texts[this.currentTextIndex];

    if (this.isDeleting) {
      this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
      this.currentCharIndex--;
    } else {
      this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
      this.currentCharIndex++;
    }

    let typeSpeed = this.isDeleting ? this.speed / 2 : this.speed;

    if (!this.isDeleting && this.currentCharIndex === currentText.length) {
      typeSpeed = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// ===== PROJECT MODAL =====
class ProjectModal {
  constructor() {
    this.modal = document.getElementById('projectModal');
    this.modalBody = document.getElementById('modalBody');
    this.closeBtn = document.querySelector('.modal-close');
    this.overlay = document.querySelector('.modal-overlay');
    this.projectData = this.getProjectData();
    this.init();
  }

  init() {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.project-expand-btn')) return;
        const projectId = card.dataset.projectId;
        this.open(projectId);
      });
    });

    this.closeBtn?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }

  open(projectId) {
    const project = this.projectData[projectId];
    if (!project) return;

    this.modalBody.innerHTML = this.generateModalContent(project);
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  generateModalContent(project) {
    let content = `
      <h2>${project.title}</h2>
      <p><strong>Date:</strong> ${project.date}</p>
      <p><strong>Type:</strong> ${project.type}</p>
      ${project.content}
    `;

    if (project.github) {
      content += `
        <p style="margin-top: 2rem;">
          Plus d'infos sur
          <a href="${project.github}" target="_blank" rel="noopener noreferrer">
            <img class="logo" src="img/logo/logo github.svg" alt="Logo GitHub">
          </a>
        </p>
      `;
    }

    if (project.links) {
      content += `<div style="margin-top: 2rem;"><strong>Liens:</strong><ul>`;
      project.links.forEach(link => {
        content += `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a></li>`;
      });
      content += `</ul></div>`;
    }

    if (project.tech) {
      content += `
        <div style="margin-top: 2rem;">
          <strong>Technologies:</strong>
          <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
            ${project.tech.map(t => `<img src="${t}" alt="Tech logo" style="width: 32px; height: 32px;">`).join('')}
          </div>
        </div>
      `;
    }

    return content;
  }

  getProjectData() {
    return {
      'ndi': {
        title: 'Nuit de l\'Info - 2 éditions',
        date: '2024 & 2025',
        type: 'Projet personnel',
        content: `
          <p>J'ai participé à deux reprises à la <strong>Nuit de l'Info</strong>, un événement national où des équipes d'étudiants doivent concevoir un site web complet en une seule nuit, sur un thème imposé, tout en relevant de nombreux défis.</p>

          <h4>Édition 2024 - Première participation</h4>
          <p>Ma première participation m'a permis de découvrir cet événement intense. J'ai appris à travailler sous contrainte de temps, à collaborer efficacement en équipe et à développer rapidement des solutions fonctionnelles. Cette expérience a renforcé mes compétences en développement web, en gestion de projet et en résolution de problèmes, tout en apprenant à gérer la fatigue.</p>

          <h4>Édition 2025 - Deuxième participation</h4>
          <p>Pour cette deuxième participation, j'ai constaté une nette progression tant sur le plan technique — avec une plus grande rapidité dans les phases de conception, développement et déploiement — que sur le plan humain.</p>

          <p>La gestion de notre équipe s'est déroulée de manière exemplaire : coordination efficace, répartition claire des tâches et communication fluide. Résultat : un projet finalisé en avance, sans le stress de la dernière minute.</p>

          <p>Durant cette édition, nous avons développé le site principal, une extension navigateur pour bloquer les éléments indésirables, et un site d'information sur les <a href="https://fr.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures" target="_blank" rel="noopener noreferrer">CVE</a>.</p>
        `,
        links: [
          { text: 'Site NDI 2025', url: 'https://ndi.0v41n.fr/' },
          { text: 'Site CVE', url: 'https://cve.0v41n.fr/' }
        ],
        github: 'https://github.com/Les-3-singes',
        tech: ['img/logo/logo html.png', 'img/logo/logo css.svg', 'img/logo/logo js.png']
      },
      'encheres': {
        title: 'Plateforme de vente aux enchères communicantes et sécurisées',
        date: 'En cours',
        type: 'Projet académique',
        content: `
          <p>Dans le cadre de ma deuxième année de BUT Informatique, je développe un logiciel d'enchères basé sur le principe de Vickrey (enchères à plis fermés). Ce projet comprend une interface graphique en JavaFX, la communication en temps réel entre un vendeur et plusieurs enchérisseurs, ainsi qu'une interface d'administration permettant de gérer les utilisateurs et de suivre l'évolution des enchères.</p>

          <p>L'ensemble des informations échangées entre le serveur et les différents clients est chiffré par le biais de sécurités cryptographiques.</p>

          <p>Le développement de ce projet, actuellement en cours, se poursuivra jusqu'à la fin de l'année 2025.</p>

          <p><strong>Technologies utilisées:</strong> Java / JavaFX</p>
        `,
        tech: ['img/logo/logo java.svg']
      },
      'meuh': {
        title: 'meuh encoding',
        date: 'Mars 2025',
        type: 'Projet personnel',
        content: `
          <p>MEUH encoding est une application Java qui explore la cryptographie appliquée au texte de manière originale. Le projet propose un système de chiffrement personnalisé basé sur le mot « MEUH », permettant de transformer un texte en une séquence codée et réversible.</p>

          <p>Il illustre la création d'un algorithme de cryptage simple mais unique, démontrant comment des principes de cryptographie peuvent être appliqués pour générer des codes lisibles et sécurisables à petite échelle. L'interface en ligne de commande facilite l'encodage et le décodage, rendant l'expérience interactive afin de conserver un aspect pratique pour tester différentes entrées textuelles. 🐄</p>
        `,
        github: 'https://github.com/flothival/meuh-encoding',
        tech: ['img/logo/logo java.svg']
      },
      'pokemon': {
        title: 'Jeu de cartes Pokémon TCG',
        date: 'Avril 2025',
        type: 'Projet académique',
        content: `
          <p>Lors de ma première année de BUT Informatique, j'ai réalisé une reproduction complète du jeu de cartes « Pokémon TCG ». Le projet comprenait le développement de l'intégralité du fonctionnement interne, incluant la gestion des règles du jeu, la logique des combats, et le suivi des cartes.</p>

          <p>J'ai également conçu l'interface utilisateur (IHM) en Java, offrant une expérience interactive et visuelle fidèle au jeu original. Ce projet m'a permis de mettre en pratique la programmation orientée objet, la gestion des événements et l'interaction avec l'utilisateur via une interface graphique.</p>
        `,
        tech: ['img/logo/logo java.svg']
      },
      'cesar': {
        title: 'Chiffrement Jules César',
        date: 'Octobre 2024',
        type: 'Projet personnel',
        content: `
          <p>Un de mes projets en Java a été de réaliser le chiffrement de Jules César. Ce projet explore l'un des plus anciens principes de la cryptographie, popularisé par Jules César lui-même. Développé en Java, ce programme met en œuvre un algorithme de substitution permettant de chiffrer et déchiffrer un texte en décalant les lettres de l'alphabet selon une clé numérique.</p>

          <p>Ce projet m'a permis de consolider mes connaissances en manipulation de chaînes de caractères, en gestion des entrées utilisateur et en logique algorithmique tout en découvrant les bases de la cryptographie. Son approche simple mais rigoureuse illustre parfaitement comment un concept historique peut être transposé dans un contexte informatique moderne et pédagogique.</p>
        `,
        github: 'https://github.com/flothival/chiffrement-jules-cesar',
        tech: ['img/logo/logo java.svg']
      }
    };
  }
}

// ===== SCROLL ANIMATIONS =====
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
    const elements = document.querySelectorAll('.project-card, .about-grid, .contact-card');

    elements.forEach((el, index) => {
      el.classList.add('animate-on-scroll');
      el.style.transitionDelay = `${index * 0.1}s`;
      this.observer.observe(el);
    });
  }
}

// ===== INFINITE SKILLS CAROUSEL =====
class InfiniteCarousel {
  constructor(trackSelector) {
    this.track = document.querySelector(trackSelector);
    if (!this.track) return;

    this.speed = 1; // vitesse défilement pc
    this.position = 0;
    this.isPaused = false;

    this.init();
  }

  init() {
    // Dupliquer les éléments pour créer l'effet infini
    const items = this.track.innerHTML;
    this.track.innerHTML = items + items;

    // Calculer la largeur d'un set complet
    this.track.style.animation = 'none';
    const children = this.track.children;
    const halfCount = children.length / 2;

    let totalWidth = 0;
    for (let i = 0; i < halfCount; i++) {
      totalWidth += children[i].offsetWidth;
      const style = window.getComputedStyle(children[i]);
      totalWidth += parseFloat(style.marginRight) || 0;
    }

    // Ajouter le gap
    const trackStyle = window.getComputedStyle(this.track);
    const gap = parseFloat(trackStyle.gap) || 0;
    this.resetPoint = totalWidth + (gap * halfCount);

    // Démarrer l'animation
    this.animate();

    // Ajuster la vitesse sur mobile
    if (window.innerWidth <= 768) {
      this.speed = 1.5; //vitesse défilement mobile
    }
  }

  animate() {
    if (!this.isPaused) {
      this.position -= this.speed;

      if (Math.abs(this.position) >= this.resetPoint) {
        this.position = 0;
      }

      this.track.style.transform = `translateX(${this.position}px)`;
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ===== UTILITY FUNCTIONS =====
function isTouchDevice() {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  if (isTouchDevice()) {
    document.body.classList.add('touch-device');
  }

  setupAutoTheme();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    new PixelArtBackground('particle-canvas');
    new ScrollAnimationManager();
    new InfiniteCarousel('.skills-track');
  }

  new ScrollSpyNavigation();
  new MobileMenu();
  new ProjectModal();

  const typedTextElement = document.getElementById('typed-text');
  if (typedTextElement) {
    new TypedText(typedTextElement, [
      'Étudiant en deuxième année de BUT Informatique',
      'Spécialisé en Réseaux & Cybersécurité',
    ], 50);
  }
});

// ===== CONTACT MODALS =====
function openContactModal(type) {
  const modalId = type + 'Modal';
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeContactModal(type) {
  const modalId = type + 'Modal';
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Copié !';
    button.style.background = 'var(--color-primary)';
    button.style.color = 'var(--text-inverse)';

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.color = '';
    }, 2000);
  }).catch(err => {
    console.error('Erreur lors de la copie:', err);
  });
}

// Fermer les modales contact avec Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ['email', 'location', 'linkedin'].forEach(type => {
      closeContactModal(type);
    });
  }
});
