/**
 * DOMINIC DEBASHIS MONDAL - PORTFOLIO INTERACTION LOGIC
 * Theme: "Code Meets The Court"
 * Modules: Preloader, GSAP ScrollTrigger, 3D Basketball, Tilt, Typing Effect, 
 *          Cursor Lerp, HackerRank 4-Star Stagger, Magnetic Buttons, Form Validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. STATE & ENVIRONMENT CONFIG
  // =========================================================================
  const isTouchDevice = ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0) || 
                        window.matchMedia('(pointer: coarse)').matches;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Elements
  const preloader = document.getElementById('preloader');
  const preloaderProgress = document.getElementById('preloaderProgress');
  const navbarHeader = document.getElementById('navbarHeader');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const currentYearSpan = document.getElementById('currentYear');
  const customCursor = document.getElementById('customCursor');
  const cursorDot = document.getElementById('cursorDot');
  const cursorTrail = document.getElementById('cursorTrail');
  const cursorLabel = document.getElementById('cursorLabel');
  const contactForm = document.getElementById('contactForm');
  const srAnnouncer = document.getElementById('sr-announcer');

  // Set Current Year in Footer
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Accessible Screen Reader Announcer Helper
  function announceToSR(message) {
    if (srAnnouncer) {
      srAnnouncer.textContent = message;
    }
  }

  // =========================================================================
  // 2. THEME SWITCHER (DARK / LIGHT WITH LOCALSTORAGE)
  // =========================================================================
  function initTheme() {
    const savedTheme = localStorage.getItem('dominic_portfolio_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'dark'); // Dark mode is default hero visual
    
    document.documentElement.setAttribute('data-theme', initialTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('dominic_portfolio_theme', newTheme);
        announceToSR(`Theme switched to ${newTheme} mode`);
      });
    }
  }
  initTheme();

  // =========================================================================
  // 3. PAGE PRELOADER & INITIAL REVEAL
  // =========================================================================
  function initPreloader() {
    if (!preloader) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 15;
      if (progress > 100) progress = 100;
      
      if (preloaderProgress) {
        preloaderProgress.style.width = `${progress}%`;
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add('preloader-hidden');
          document.body.classList.add('page-loaded');
          // Trigger entry animations
          startHeroAnimations();
          announceToSR('Welcome to Dominic Debashis Mondal\'s portfolio website.');
        }, 350);
      }
    }, 90);
  }
  initPreloader();

  // =========================================================================
  // 4. CUSTOM CURSOR WITH SPRING/LERP PHYSICS (DESKTOP ONLY)
  // =========================================================================
  function initCustomCursor() {
    if (isTouchDevice || !customCursor || prefersReducedMotion) {
      if (customCursor) customCursor.style.display = 'none';
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = mouseX;
    let trailY = mouseY;
    const lerpFactor = 0.16;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
      }
      if (cursorLabel) {
        cursorLabel.style.left = `${mouseX}px`;
        cursorLabel.style.top = `${mouseY}px`;
      }
    }, { passive: true });

    // Smooth animation loop for the outer trailing ring
    function renderCursor() {
      trailX += (mouseX - trailX) * lerpFactor;
      trailY += (mouseY - trailY) * lerpFactor;

      if (cursorTrail) {
        cursorTrail.style.left = `${trailX}px`;
        cursorTrail.style.top = `${trailY}px`;
      }

      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover interactions over clickable/interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, .tilt-card, [role="button"], .hero-pill-badge, .interactive-bouncing-ball'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        const customText = el.getAttribute('data-cursor');
        if (customText && cursorLabel) {
          cursorLabel.textContent = customText;
          document.body.classList.add('cursor-has-label');
        }
      });

      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
        document.body.classList.remove('cursor-has-label');
      });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      customCursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      customCursor.style.opacity = '1';
    });
  }
  initCustomCursor();

  // =========================================================================
  // 5. STICKY NAVBAR & ACTIVE SECTION SCROLL SPY
  // =========================================================================
  function initNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    function handleScroll() {
      const scrollY = window.scrollY;

      // Navbar glass blur background on scroll
      if (navbarHeader) {
        if (scrollY > 40) {
          navbarHeader.classList.add('scrolled');
        } else {
          navbarHeader.classList.remove('scrolled');
        }
      }

      // Active Section Highlighter
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 140;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile Hamburger Overlay Toggle
    if (mobileMenuBtn && mobileOverlay && mobileCloseBtn) {
      function openMenu() {
        mobileOverlay.classList.add('overlay-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

      function closeMenu() {
        mobileOverlay.classList.remove('overlay-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      mobileMenuBtn.addEventListener('click', openMenu);
      mobileCloseBtn.addEventListener('click', closeMenu);

      // Close menu when clicking any mobile link
      document.querySelectorAll('.mobile-nav-link').forEach((link) => {
        link.addEventListener('click', closeMenu);
      });

      // Close with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileOverlay.classList.contains('overlay-open')) {
          closeMenu();
        }
      });
    }

    // Back to top button
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
  initNavigation();

  // =========================================================================
  // 6. HERO SECTION: LETTER-BY-LETTER REVEAL & STATS COUNTERS
  // =========================================================================
  function startHeroAnimations() {
    // Letter by letter split text on hero title lines
    const titleLines = document.querySelectorAll('.hero-name-line');
    titleLines.forEach((line) => {
      const text = line.getAttribute('data-reveal') || line.textContent.trim();
      line.innerHTML = '';
      
      const letters = text.split('');
      letters.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(40px) rotate(6deg)';
        span.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.04}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.04}s`;
        line.appendChild(span);

        // Trigger reveal on next tick
        setTimeout(() => {
          span.style.opacity = '1';
          span.style.transform = 'translateY(0) rotate(0deg)';
        }, 100);
      });
    });

    // Animated Count-Up Numbers in Hero Stats
    const statCounters = document.querySelectorAll('.hero-quick-stats .stat-num');
    statCounters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-count'), 10) || 0;
      let count = 0;
      const step = Math.max(1, Math.floor(target / 30));
      const counterInterval = setInterval(() => {
        count += step;
        if (count >= target) {
          count = target;
          clearInterval(counterInterval);
        }
        counter.textContent = count;
      }, 35);
    });
  }

  // =========================================================================
  // 7. DYNAMIC ROLE TYPING / SCROLLER
  // =========================================================================
  function initDynamicRoleTyping() {
    const roleElem = document.getElementById('roleDynamic');
    if (!roleElem) return;

    const roles = [
      'CS Student',
      'Programmer',
      'Basketball Player',
      'Artist',
      'Chef',
      'Team Leader'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const holdDelay = 1800;

    function typeCycle() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        charIndex--;
        roleElem.textContent = currentRole.substring(0, charIndex);
      } else {
        charIndex++;
        roleElem.textContent = currentRole.substring(0, charIndex);
      }

      let timeoutDuration = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentRole.length) {
        timeoutDuration = holdDelay;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        timeoutDuration = 400;
      }

      setTimeout(typeCycle, timeoutDuration);
    }

    typeCycle();
  }
  initDynamicRoleTyping();

  // =========================================================================
  // 8. 3D / CSS INTERACTIVE BASKETBALL PHYSICS
  // =========================================================================
  function initBasketballPhysics() {
    const basketball = document.getElementById('interactiveBasketball');
    const stage = document.getElementById('basketballStage');
    if (!basketball || !stage) return;

    // Click to trigger active bounce & soundwave impact
    basketball.addEventListener('click', () => {
      triggerBallBounce();
    });

    // Keyboard trigger (Enter or Space) for accessibility
    basketball.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerBallBounce();
      }
    });

    function triggerBallBounce() {
      if (basketball.classList.contains('bouncing')) return;
      basketball.classList.add('bouncing');
      announceToSR('Basketball bounced on the court floor!');
      setTimeout(() => {
        basketball.classList.remove('bouncing');
      }, 950);
    }

    // 3D Parallax Tilt on Basketball Stage
    if (!isTouchDevice) {
      stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const rotateY = (x / (rect.width / 2)) * 20;
        const rotateX = -(y / (rect.height / 2)) * 20;

        basketball.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      stage.addEventListener('mouseleave', () => {
        basketball.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      });
    }

    // Interactive Court Ball in Section 5
    const courtBall = document.getElementById('courtBouncingBall');
    if (courtBall) {
      courtBall.addEventListener('click', () => {
        courtBall.style.transform = 'scale(1.25) translateY(-30px)';
        setTimeout(() => {
          courtBall.style.transform = 'scale(0.9) translateY(10px)';
          setTimeout(() => {
            courtBall.style.transform = 'scale(1) translateY(0)';
          }, 150);
        }, 180);
      });
    }
  }
  initBasketballPhysics();

  // =========================================================================
  // 9. TILT CARDS & SPOTLIGHT MOUSE TRACKING
  // =========================================================================
  function initTiltAndSpotlight() {
    // Initialize Vanilla-Tilt on elements with data-tilt if library exists
    if (typeof VanillaTilt !== 'undefined' && !isTouchDevice && !prefersReducedMotion) {
      VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
        max: 8,
        speed: 400,
        glare: true,
        'max-glare': 0.15,
        scale: 1.02
      });
    }

    // Track mouse coordinates for CSS radial spotlight effect
    const tiltCards = document.querySelectorAll('.tilt-card, .glass-panel');
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }
  initTiltAndSpotlight();

  // =========================================================================
  // 10. MAGNETIC BUTTONS & RIPPLE CLICK SYSTEM
  // =========================================================================
  function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll('.magnetic-btn');

    if (!isTouchDevice && !prefersReducedMotion) {
      magneticBtns.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const btnCenterX = rect.left + rect.width / 2;
          const btnCenterY = rect.top + rect.height / 2;

          const deltaX = (e.clientX - btnCenterX) * 0.35;
          const deltaY = (e.clientY - btnCenterY) * 0.35;

          btn.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
        });

        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translate3d(0, 0, 0)';
          btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        btn.addEventListener('mouseenter', () => {
          btn.style.transition = 'none';
        });
      });
    }

    // Ripple click effect
    magneticBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-wave');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        btn.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }
  initMagneticButtons();

  // =========================================================================
  // 11. SCROLL-TRIGGERED ANIMATIONS (METERS, HACKERRANK 4-STAR, RINGS, TIMELINE)
  // =========================================================================
  function initScrollTriggers() {
    // Fallback Scroll Progress Bar for browsers without animation-timeline: scroll()
    if (!CSS.supports('animation-timeline', 'scroll()')) {
      const scrollProgress = document.getElementById('scrollProgress');
      if (scrollProgress) {
        window.addEventListener('scroll', () => {
          const scrollable = document.documentElement.scrollHeight - window.innerHeight;
          const scrolled = window.scrollY;
          const progressRatio = scrollable > 0 ? (scrolled / scrollable) : 0;
          scrollProgress.style.transform = `scaleX(${progressRatio})`;
        }, { passive: true });
      }
    }

    // Skill Bar Meters & Percentages
    const skillCards = document.querySelectorAll('.skill-meter-card');
    const skillObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const barFill = card.querySelector('.meter-bar-fill');
          const percentElem = card.querySelector('.skill-percentage');
          const targetPercent = parseInt(percentElem.getAttribute('data-target'), 10) || 0;

          if (barFill) {
            barFill.style.width = `${targetPercent}%`;
          }

          // Count up percentage
          let current = 0;
          const duration = 1200;
          const stepTime = Math.abs(Math.floor(duration / targetPercent));
          const timer = setInterval(() => {
            current += 1;
            if (percentElem) percentElem.textContent = `${current}%`;
            if (current >= targetPercent) clearInterval(timer);
          }, stepTime);

          observer.unobserve(card);
        }
      });
    }, { threshold: 0.25 });

    skillCards.forEach((card) => skillObserver.observe(card));

    // HackerRank 4-Star Sequential Lighting Animation
    const hrCard = document.querySelector('.hackerrank-card');
    if (hrCard) {
      const hrObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stars = entry.target.querySelectorAll('.star-item:not(.unlit-star)');
            stars.forEach((star, idx) => {
              setTimeout(() => {
                star.classList.add('lit');
              }, (idx + 1) * 220); // Consecutive star ignition
            });

            // Animate Circular Progress Rings
            const ringProgresses = entry.target.querySelectorAll('.ring-progress');
            ringProgresses.forEach((ring) => {
              const circ = parseFloat(ring.getAttribute('data-circumference')) || 251.2;
              const percent = parseFloat(ring.getAttribute('data-percentage')) || 0;
              const offset = circ - (percent / 100) * circ;
              setTimeout(() => {
                ring.style.strokeDashoffset = offset;
              }, 400);
            });

            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      hrObserver.observe(hrCard);
    }

    // Vertical Timeline Progress Fill
    const timelineProgress = document.querySelector('.timeline-progress-fill');
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    if (timelineProgress && timelineWrapper) {
      window.addEventListener('scroll', () => {
        const rect = timelineWrapper.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
          const totalDist = rect.height;
          const scrolledDist = windowHeight - rect.top;
          let percent = (scrolledDist / (totalDist + windowHeight * 0.3)) * 100;
          percent = Math.max(0, Math.min(100, percent));
          timelineProgress.style.height = `${percent}%`;
        }
      }, { passive: true });
    }

    // Scroll reveal for timeline nodes and general cards
    const revealItems = document.querySelectorAll('[data-scroll-reveal]');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    revealItems.forEach((item) => revealObserver.observe(item));
  }
  initScrollTriggers();

  // =========================================================================
  // 12. CONTACT FORM VALIDATION & CELEBRATORY SUBMISSION
  // =========================================================================
  function initContactForm() {
    if (!contactForm) return;

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');
    const submitBtn = document.getElementById('contactSubmitBtn');
    const successMsg = document.getElementById('formSuccessMessage');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateField(field, condition) {
      if (!condition) {
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
        return false;
      } else {
        field.classList.remove('invalid');
        field.setAttribute('aria-invalid', 'false');
        return true;
      }
    }

    // Real-time blur event validation
    if (nameInput) {
      nameInput.addEventListener('blur', () => {
        validateField(nameInput, nameInput.value.trim().length >= 2);
      });
    }
    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        validateField(emailInput, emailRegex.test(emailInput.value.trim()));
      });
    }
    if (subjectInput) {
      subjectInput.addEventListener('blur', () => {
        validateField(subjectInput, subjectInput.value.trim().length >= 3);
      });
    }
    if (messageInput) {
      messageInput.addEventListener('blur', () => {
        validateField(messageInput, messageInput.value.trim().length >= 10);
      });
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 2);
      const isEmailValid = validateField(emailInput, emailRegex.test(emailInput.value.trim()));
      const isSubjectValid = validateField(subjectInput, subjectInput.value.trim().length >= 3);
      const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 10);

      if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          contactForm.reset();

          if (successMsg) {
            successMsg.classList.add('active');
            announceToSR('Message transmitted successfully! Thank you for reaching out.');
            setTimeout(() => {
              successMsg.classList.remove('active');
            }, 6000);
          }
        }, 1200);
      } else {
        announceToSR('Please fix the errors in the contact form.');
      }
    });
  }
  initContactForm();

  // GSAP Smooth entrance if loaded
  if (typeof gsap !== 'undefined') {
    gsap.from('.marquee-strip', {
      opacity: 0,
      y: 20,
      duration: 1,
      scrollTrigger: {
        trigger: '.marquee-strip',
        start: 'top 90%'
      }
    });
  }
});
