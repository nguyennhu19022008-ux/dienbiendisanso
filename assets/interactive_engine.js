// Interactive Engine for Dien Bien 3D - STEAM Heritage Lab
(function() {
  'use strict';

  // State Management
  let currentTourIdx = 5; // Default: Tri ân 02 (Him Lam - index 5) as in original
  let currentFilter = 'all';
  let currentHotspotIdx = 0; // Default: H01 Him Lam
  let visitedHotspots = new Set(['H01']);
  let isMapJourneyMode = true;

  // DOM Elements cache
  const el = {};

  function cacheElements() {
    // Slide 0 removed - Site starts directly
    
    // Viewer elements
    el.viewerCover = document.querySelector('.viewer-cover');
    el.viewerCoverImg = document.querySelector('.viewer-cover img');
    el.viewerCoverShade = document.querySelector('.viewer-cover-shade');
    el.coverLocation = document.querySelector('.cover-location');
    el.viewerStatus = document.querySelector('.viewer-status');
    el.tourGuide = document.querySelector('.tour-guide');
    el.tourGuideHead = document.querySelector('.tour-guide-head');
    el.tourGuideTitle = el.tourGuide ? el.tourGuide.querySelector('h3') : null;
    el.tourGuideDesc = el.tourGuide ? el.tourGuide.querySelector('p') : null;
    el.missionCard = document.querySelector('.mission-card strong');
    el.viewpointList = document.querySelector('.viewpoint-list ul');
    el.stepperProgress = document.querySelector('.tour-stepper div i');
    el.btnPrevTour = document.getElementById('btn-prev-tour') || document.querySelector('.tour-stepper button[aria-label="Tour trước"]') || document.querySelector('.tour-stepper button:first-child');
    el.btnNextTour = document.getElementById('btn-next-tour') || document.querySelector('.tour-stepper button[aria-label="Tour tiếp theo"]') || document.querySelector('.tour-stepper button:last-child');
    el.btnOpenTourDossier = document.getElementById('btnOpenTourDossier');
    el.playTourBtn = document.querySelector('.play-tour');
    el.btnReloadTour = document.getElementById('btn-reload-tour') || document.querySelector('.viewer-actions button:first-child');
    el.btnFullscreenTour = document.getElementById('btn-fullscreen-tour') || document.querySelector('.viewer-actions button:last-child');
    el.viewerLiveIframe = document.getElementById('viewerLiveIframe');
    el.btnToggleCover = document.getElementById('btn-toggle-cover');
    el.viewerExternalLink = document.getElementById('viewerExternalLink');
    el.tourFilterBtns = document.querySelectorAll('.tour-filter button');
    el.tourCards = document.querySelectorAll('.tour-rail .tour-card');

    // Map elements
    el.mapPins = document.querySelectorAll('.strategy-map .map-pin');
    el.hotspotStripBtns = document.querySelectorAll('.hotspot-strip button');
    el.hotspotPanel = document.querySelector('.hotspot-panel');
    el.mapModeBtns = document.querySelectorAll('.mode-switch button');
    el.hotspotImg = el.hotspotPanel ? el.hotspotPanel.querySelector('.hotspot-image img') : null;
    el.hotspotLayer = el.hotspotPanel ? el.hotspotPanel.querySelector('.hotspot-image span') : null;
    el.hotspotCode = el.hotspotPanel ? el.hotspotPanel.querySelector('.hotspot-meta span') : null;
    el.hotspotTime = el.hotspotPanel ? el.hotspotPanel.querySelector('.hotspot-meta time') : null;
    el.hotspotTitle = el.hotspotPanel ? el.hotspotPanel.querySelector('h3') : null;
    el.hotspotDesc = el.hotspotPanel ? el.hotspotPanel.querySelector('p') : null;
    el.hotspotQuestion = el.hotspotPanel ? el.hotspotPanel.querySelector('.inquiry-card strong') : null;
    el.hotspotProgressText = el.hotspotPanel ? el.hotspotPanel.querySelector('.progress-row strong') : null;
    el.hotspotProgressBar = el.hotspotPanel ? el.hotspotPanel.querySelector('.progress-track i') : null;

    // Header & Nav
    el.menuToggle = document.querySelector('.menu-toggle');
    el.mainNav = document.querySelector('.main-nav');
    el.headerCta = document.querySelector('.header-cta');
  }

  // --- 1. VISUAL EFFECTS & ANIMATIONS CONTROLLERS ---

  // A. Hero Amber Sparks & Embers Canvas
  function initHeroSparks() {
    const canvas = document.getElementById('hero-sparks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      height = canvas.height = parent ? parent.offsetHeight : 600;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Embers particle pool (35 particles for silky 60fps performance)
    const particleCount = 35;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.8,
        speedY: Math.random() * 0.45 + 0.2,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        angle: Math.random() * Math.PI * 2
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += Math.sin(p.angle) * 0.35 + p.speedX;
        p.angle += p.pulseSpeed;

        const currentOpacity = Math.max(0.05, p.opacity * (0.8 + 0.2 * Math.sin(p.angle * 2)));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 201, 133, ${currentOpacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(229, 201, 133, 0.6)';
        ctx.fill();

        if (p.y < -10 || p.x < -10 || p.x > width + 10) {
          p.x = Math.random() * width;
          p.y = height + 10;
          p.opacity = Math.random() * 0.7 + 0.2;
        }
      }

      requestAnimationFrame(render);
    }
    render();
  }

  // B. 3D Card Tilt & Interactive Cursor Spotlight
  function init3DCardTilt() {
    const targets = document.querySelectorAll('.tour-card, .route-chapters article, .lab-card, .phase-card, .steam-cards article, .gallery-grid figure, .inquiry-card');
    
    targets.forEach(card => {
      card.classList.add('tilt-card');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Dynamic Spotlight coordinates
        card.style.setProperty('--spotlight-x', `${x}px`);
        card.style.setProperty('--spotlight-y', `${y}px`);

        // 3D Perspective Rotation
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // C. Animated Number Counters
  function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-counter-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-counter-target'), 10) || 0;
          const format2Digit = el.getAttribute('data-counter-format') === '2digit';
          const duration = 1400;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOut * target);

            el.textContent = format2Digit && currentVal < 10 ? `0${currentVal}` : `${currentVal}`;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = format2Digit && target < 10 ? `0${target}` : `${target}`;
            }
          }

          requestAnimationFrame(updateCounter);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => observer.observe(c));
  }

  // D. Scroll-Driven Stagger Reveal
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.split-heading, .tour-stage, .route-chapters, .map-workspace, .lab-grid, .phase-grid, .gallery-grid, .steam-cards, .timeline-milestone'
    );

    revealElements.forEach(item => {
      item.classList.add('reveal-on-scroll');
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => observer.observe(el));
  }

  // E. Back To Top HUD with Circular Scroll Progress
  function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    const circle = document.getElementById('scrollProgressCircle');
    const bar = document.getElementById('scrollProgressBar');
    const perimeter = 119.38;

    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

      if (circle) {
        circle.style.strokeDashoffset = (perimeter - perimeter * progress).toString();
      }

      if (bar) {
        bar.style.width = `${progress * 100}%`;
      }

      if (btn) {
        if (scrollTop > 350) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (btn) {
      btn.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }


  // --- 2. TOUR 3D VIEWER CONTROLLER ---
  function updateTourView(index, playSound = true) {
    if (!window.TOURS_DATA || !window.TOURS_DATA[index]) return;
    currentTourIdx = index;
    const data = window.TOURS_DATA[index];

    if (playSound && window.SiteAudio) {
      window.SiteAudio.playWhoosh();
    }

    // Update Cover
    if (el.viewerCoverImg) {
      el.viewerCoverImg.style.opacity = '0.3';
      setTimeout(() => {
        el.viewerCoverImg.src = data.image;
        el.viewerCoverImg.alt = data.title;
        el.viewerCoverImg.style.opacity = '1';
      }, 150);
    }

    if (el.coverLocation) {
      el.coverLocation.innerHTML = `
        <span>${data.sequence}</span>
        <strong>${data.title.replace(/^[^·]*·\s*/, '')}</strong>
        <small>${data.latLng}</small>
      `;
    }

    if (el.viewerStatus) {
      el.viewerStatus.innerHTML = `<i></i> TOUR TRỰC TUYẾN · ${data.title.toUpperCase()}`;
    }

    // Update Guide Sidebar (Info Telemetry Panel)
    if (el.tourGuide) {
      el.tourGuide.classList.remove('accent-red', 'accent-gold', 'accent-blue', 'accent-green');
      if (data.catKey === 'battle') el.tourGuide.classList.add('accent-red');
      else if (data.catKey === 'command') el.tourGuide.classList.add('accent-gold');
      else if (data.catKey === 'heritage') el.tourGuide.classList.add('accent-blue');
      else el.tourGuide.classList.add('accent-green');
    }

    if (el.tourGuideHead) {
      el.tourGuideHead.innerHTML = `
        <div><span>${data.sequence}</span><small>${data.category}</small></div>
        <strong>0${data.id} / 08</strong>
      `;
    }

    if (el.tourGuideTitle) el.tourGuideTitle.textContent = data.title;
    if (el.tourGuideDesc) el.tourGuideDesc.textContent = data.desc;
    if (el.missionCard) el.missionCard.textContent = data.mission;

    if (el.viewpointList) {
      el.viewpointList.innerHTML = data.viewpoints.map(vp => `<li>${vp}</li>`).join('');
    }

    // Stepper progress bar
    if (el.stepperProgress) {
      el.stepperProgress.style.width = `${((index + 1) / 8) * 100}%`;
    }

    // Update Tour Rail active cards
    if (el.tourCards) {
      el.tourCards.forEach((card, idx) => {
        if (idx === index) {
          card.classList.add('active');
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          card.classList.remove('active');
        }
      });
    }

    // Update external tour link
    if (el.viewerExternalLink) el.viewerExternalLink.href = data.externalUrl;
    const extLink = document.querySelector('.viewer-help a');
    if (extLink) extLink.href = data.externalUrl;

    // Update live iframe if currently active
    if (el.viewerLiveIframe && el.viewerLiveIframe.style.display !== 'none') {
      el.viewerLiveIframe.src = data.externalUrl;
    }
  }

  function initTourViewer() {
    // Arrow stepper buttons
    if (el.btnPrevTour) {
      el.btnPrevTour.addEventListener('click', (e) => {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        if (window.SiteAudio) window.SiteAudio.playClick();
        let prev = currentTourIdx;
        do {
          prev = (prev - 1 + window.TOURS_DATA.length) % window.TOURS_DATA.length;
        } while (currentFilter !== 'all' && window.TOURS_DATA[prev].catKey !== currentFilter && prev !== currentTourIdx);
        updateTourView(prev);
        if (el.tourGuide) {
          el.tourGuide.classList.remove('pulse-feedback');
          void el.tourGuide.offsetWidth;
          el.tourGuide.classList.add('pulse-feedback');
        }
      });
    }

    if (el.btnNextTour) {
      el.btnNextTour.addEventListener('click', (e) => {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        if (window.SiteAudio) window.SiteAudio.playClick();
        let next = currentTourIdx;
        do {
          next = (next + 1) % window.TOURS_DATA.length;
        } while (currentFilter !== 'all' && window.TOURS_DATA[next].catKey !== currentFilter && next !== currentTourIdx);
        updateTourView(next);
        if (el.tourGuide) {
          el.tourGuide.classList.remove('pulse-feedback');
          void el.tourGuide.offsetWidth;
          el.tourGuide.classList.add('pulse-feedback');
        }
      });
    }

    // Direct Dossier Button in Guide Panel
    if (el.btnOpenTourDossier) {
      el.btnOpenTourDossier.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        openPanoramaModal(window.TOURS_DATA[currentTourIdx]);
      });
    }

    // Tour Rail Cards
    if (el.tourCards) {
      el.tourCards.forEach((card, idx) => {
        card.addEventListener('click', () => {
          updateTourView(idx);
        });
      });
    }

    // Filter tabs
    if (el.tourFilterBtns) {
      el.tourFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.SiteAudio) window.SiteAudio.playClick();
          el.tourFilterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const text = btn.textContent.toLowerCase();
          let filterKey = 'all';
          if (text.includes('chiến trường')) filterKey = 'battle';
          else if (text.includes('chỉ huy')) filterKey = 'command';
          else if (text.includes('di sản')) filterKey = 'heritage';
          else if (text.includes('tưởng niệm')) filterKey = 'memorial';

          currentFilter = filterKey;

          // Filter cards in rail
          let firstMatch = -1;
          el.tourCards.forEach((card, idx) => {
            const data = window.TOURS_DATA[idx];
            if (filterKey === 'all' || data.catKey === filterKey) {
              card.style.display = '';
              if (firstMatch === -1) firstMatch = idx;
            } else {
              card.style.display = 'none';
            }
          });

          // Switch to first matching tour if current doesn't match
          if (firstMatch !== -1 && (filterKey !== 'all' && window.TOURS_DATA[currentTourIdx].catKey !== filterKey)) {
            updateTourView(firstMatch);
          }
        });
      });
    }

    // Function to activate live 3D tour in main stage frame
    function activateLive3DTour(playSound = true) {
      if (playSound && window.SiteAudio) window.SiteAudio.playRadar();
      const data = window.TOURS_DATA[currentTourIdx];
      if (!data) return;
      if (el.viewerLiveIframe) {
        if (!el.viewerLiveIframe.src || el.viewerLiveIframe.src === '' || el.viewerLiveIframe.src === 'about:blank' || !el.viewerLiveIframe.src.includes(data.externalUrl)) {
          el.viewerLiveIframe.src = data.externalUrl;
        }
        el.viewerLiveIframe.style.display = 'block';
        if (el.viewerCover) el.viewerCover.style.display = 'none';
        if (el.btnToggleCover) {
          el.btnToggleCover.style.display = 'inline-block';
          el.btnToggleCover.textContent = 'Ảnh bìa';
        }
      }
    }

    // Clicking anywhere on viewer cover activates the 3D tour
    if (el.viewerCover) {
      el.viewerCover.addEventListener('click', () => activateLive3DTour(true));
    }

    // Play tour 360 viewer button
    if (el.playTourBtn) {
      el.playTourBtn.addEventListener('click', (e) => {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        if (window.SiteAudio) window.SiteAudio.playRadar();
        openPanoramaModal(window.TOURS_DATA[currentTourIdx]);
        activateLive3DTour(false);
      });
    }

    // Toggle between Cover and Live 3D Tour
    if (el.btnToggleCover) {
      el.btnToggleCover.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        if (el.viewerCover && el.viewerCover.style.display === 'none') {
          el.viewerCover.style.display = 'block';
          if (el.viewerLiveIframe) el.viewerLiveIframe.style.display = 'none';
          el.btnToggleCover.textContent = 'Mở 3D';
        } else {
          activateLive3DTour();
        }
      });
    }

    // Reload button
    if (el.btnReloadTour) {
      el.btnReloadTour.disabled = false;
      el.btnReloadTour.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playRadar();
        if (el.viewerCover) {
          el.viewerCover.classList.add('scanning-flash');
          setTimeout(() => el.viewerCover.classList.remove('scanning-flash'), 600);
        }
        if (el.viewerLiveIframe && el.viewerLiveIframe.style.display !== 'none' && window.TOURS_DATA[currentTourIdx]) {
          el.viewerLiveIframe.src = window.TOURS_DATA[currentTourIdx].externalUrl;
        }
        updateTourView(currentTourIdx, false);
      });
    }

    // Fullscreen button
    if (el.btnFullscreenTour) {
      el.btnFullscreenTour.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const frame = document.querySelector('.viewer-frame');
        if (!frame) return;
        if (!document.fullscreenElement) {
          if (typeof frame.requestFullscreen === 'function') {
            frame.requestFullscreen();
          } else if (typeof frame.webkitRequestFullscreen === 'function') {
            frame.webkitRequestFullscreen();
          }
        } else {
          if (typeof document.exitFullscreen === 'function') {
            document.exitFullscreen();
          } else if (typeof document.webkitExitFullscreen === 'function') {
            document.webkitExitFullscreen();
          }
        }
      });
    }
  }

  // --- 3. PANORAMA 360° INTERACTIVE MODAL ---
  let startX = 0, currentPanX = 0;
  let currentZoom = 1;

  function openPanoramaModal(tour) {
    let modal = document.getElementById('modal-panorama-360');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-panorama-360';
      modal.className = 'custom-modal';
      modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-window pano-window">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-badge">GIẢ LẬP KHÔNG GIAN 360°</span>
              <h3 id="pano-modal-title"></h3>
            </div>
            <button class="modal-close" id="close-pano-modal"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="pano-viewport" id="pano-viewport">
            <img id="pano-image" src="" alt="Panorama" draggable="false" />
            <div class="pano-hud-overlay">
              <div class="pano-reticle"></div>
              <div class="pano-coords" id="pano-coords">21°24'11" N · 103°02'00" E</div>
              <div class="pano-instructions">↔ Nhấp & kéo chuột để xoay 360° · Cuộn chuột để phóng to/thu nhỏ</div>
              <a id="pano-external-btn" href="#" target="_blank" rel="noreferrer" class="button button-primary pano-direct-link">
                Mở trực tuyến qua eGAL 3D ↗
              </a>
            </div>
          </div>
          <div class="pano-footer">
            <div class="pano-info-left" id="pano-steam-info"></div>
            <div class="pano-controls">
              <button type="button" id="pano-zoom-in">＋</button>
              <button type="button" id="pano-zoom-out">－</button>
              <button type="button" id="pano-reset">↺ Đặt lại</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Pan & Zoom logic
      const viewport = modal.querySelector('#pano-viewport');
      const img = modal.querySelector('#pano-image');
      let isDragging = false;
      startX = 0;
      currentPanX = 0;
      currentZoom = 1;

      viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - currentPanX;
        viewport.style.cursor = 'grabbing';
      });

      viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        isDragging = true;
        startX = e.touches[0].clientX - currentPanX;
        viewport.style.cursor = 'grabbing';
      }, { passive: true });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentPanX = e.clientX - startX;
        img.style.transform = `scale(${currentZoom}) translateX(${currentPanX * 0.4}px)`;
      });

      window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        currentPanX = e.touches[0].clientX - startX;
        img.style.transform = `scale(${currentZoom}) translateX(${currentPanX * 0.4}px)`;
      }, { passive: true });

      window.addEventListener('mouseup', () => {
        isDragging = false;
        viewport.style.cursor = 'grab';
      });

      window.addEventListener('touchend', () => {
        isDragging = false;
        viewport.style.cursor = 'grab';
      });

      viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        currentZoom = Math.min(2.5, Math.max(1, currentZoom - e.deltaY * 0.002));
        img.style.transform = `scale(${currentZoom}) translateX(${currentPanX * 0.4}px)`;
      }, { passive: false });

      // Zoom controls
      modal.querySelector('#pano-zoom-in').addEventListener('click', () => {
        currentZoom = Math.min(2.5, currentZoom + 0.25);
        img.style.transform = `scale(${currentZoom}) translateX(${currentPanX * 0.4}px)`;
      });
      modal.querySelector('#pano-zoom-out').addEventListener('click', () => {
        currentZoom = Math.max(1, currentZoom - 0.25);
        img.style.transform = `scale(${currentZoom}) translateX(${currentPanX * 0.4}px)`;
      });
      modal.querySelector('#pano-reset').addEventListener('click', () => {
        currentZoom = 1;
        currentPanX = 0;
        startX = 0;
        img.style.transform = `scale(1) translateX(0px)`;
      });

      modal.querySelector('#close-pano-modal').addEventListener('click', () => {
        modal.classList.remove('modal-open');
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length === 0) {
          document.body.style.overflow = '';
        }
      });
      modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        modal.classList.remove('modal-open');
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length === 0) {
          document.body.style.overflow = '';
        }
      });
    }

    modal.querySelector('#pano-modal-title').textContent = tour.title;
    modal.querySelector('#pano-image').src = tour.image;
    modal.querySelector('#pano-coords').textContent = tour.coords;
    modal.querySelector('#pano-steam-info').innerHTML = `<strong>LIÊN HỆ STEAM:</strong> ${tour.steamLink}`;
    modal.querySelector('#pano-external-btn').href = tour.externalUrl;

    // Reset zoom and pan on opening a new tour
    currentZoom = 1;
    currentPanX = 0;
    startX = 0;
    const panoImg = modal.querySelector('#pano-image');
    if (panoImg) panoImg.style.transform = 'scale(1) translateX(0px)';

    document.body.style.overflow = 'hidden';
    modal.classList.add('modal-open');
  }

  // --- 4. TACTICAL MAP & HOTSPOTS CONTROLLER (#map) ---
  let hasPlayedVictoryFanfare = false;

  function updateHotspot(index, playSound = true) {
    if (!window.HOTSPOTS_DATA || !window.HOTSPOTS_DATA[index]) return;
    currentHotspotIdx = index;
    const data = window.HOTSPOTS_DATA[index];
    visitedHotspots.add(data.id);

    if (playSound && window.SiteAudio) {
      window.SiteAudio.playRadar();
    }

    // Update pins
    if (el.mapPins) {
      el.mapPins.forEach((pin, idx) => {
        const pinData = window.HOTSPOTS_DATA[idx];
        const isCurrent = idx === index;
        pin.classList.toggle('active', isCurrent);
        pin.classList.toggle('visited', !isCurrent && visitedHotspots.has(pinData.id));
        if (isCurrent) pin.setAttribute('aria-selected', 'true');
        else pin.removeAttribute('aria-selected');
      });
    }

    // Update strip buttons
    if (el.hotspotStripBtns) {
      el.hotspotStripBtns.forEach((btn, idx) => {
        if (idx === index) {
          btn.classList.add('active');
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Update side panel
    if (el.hotspotImg) {
      el.hotspotImg.style.opacity = '0.3';
      setTimeout(() => {
        el.hotspotImg.src = data.image;
        el.hotspotImg.alt = data.name;
        el.hotspotImg.style.opacity = '1';
      }, 150);
    }
    if (el.hotspotLayer) el.hotspotLayer.textContent = data.layer;
    if (el.hotspotCode) el.hotspotCode.textContent = data.id;
    if (el.hotspotTime) el.hotspotTime.textContent = data.time;
    if (el.hotspotTitle) el.hotspotTitle.textContent = data.name;
    if (el.hotspotDesc) el.hotspotDesc.textContent = data.desc;
    if (el.hotspotQuestion) el.hotspotQuestion.textContent = data.steamQuestion;

    // Progress counter
    const count = visitedHotspots.size;
    if (el.hotspotProgressText) {
      el.hotspotProgressText.textContent = `${count} / 10`;
    }
    if (el.hotspotProgressBar) {
      el.hotspotProgressBar.style.width = `${(count / 10) * 100}%`;
    }

    if (count === 10 && !hasPlayedVictoryFanfare && window.SiteAudio && typeof window.SiteAudio.playSuccess === 'function') {
      hasPlayedVictoryFanfare = true;
      window.SiteAudio.playSuccess();
    }
  }

  function initTacticalMap() {
    const initialMap = document.querySelector('.strategy-map');
    if (initialMap && !initialMap.classList.contains('mode-journey') && !initialMap.classList.contains('mode-system')) {
      initialMap.classList.add('mode-journey');
    }
    // Pin clicks
    if (el.mapPins) {
      el.mapPins.forEach((pin, idx) => {
        pin.addEventListener('click', () => {
          updateHotspot(idx);
        });
      });
    }

    // Strip button clicks
    if (el.hotspotStripBtns) {
      el.hotspotStripBtns.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          updateHotspot(idx);
        });
      });
    }

    // Map mode switches ("Theo hành trình" vs "Theo hệ thống")
    if (el.mapModeBtns) {
      el.mapModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.SiteAudio) window.SiteAudio.playClick();
          el.mapModeBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const isJourney = btn.textContent.includes('hành trình');
          isMapJourneyMode = isJourney;

          const strategyMap = document.querySelector('.strategy-map');
          if (strategyMap) {
            if (isJourney) {
              strategyMap.classList.remove('mode-system');
              strategyMap.classList.add('mode-journey');
            } else {
              strategyMap.classList.remove('mode-journey');
              strategyMap.classList.add('mode-system');
            }
          }
        });
      });
    }
  }

  // --- 5. INTERACTIVE ROUTE MODALS (#route) ---
  function initRouteModals() {
    const routeArticles = document.querySelectorAll('.route-chapters article');
    const routeHandlers = [
      openGeneralDossierModal,
      openCompareA1D1Modal,
      openBanPhuHeritageModal,
      openMemorialRouteModal
    ];

    routeArticles.forEach((article, idx) => {
      article.style.cursor = 'pointer';
      article.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        if (routeHandlers[idx]) routeHandlers[idx]();
      });
      const btn = article.querySelector('button');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.SiteAudio) window.SiteAudio.playClick();
          if (routeHandlers[idx]) routeHandlers[idx]();
        });
      }
    });
  }

  function createBaseModal(id, title, badge, contentHtml) {
    let modal = document.getElementById(id);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = id;
      modal.className = 'custom-modal';
      modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-window">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-badge">${badge}</span>
              <h3>${title}</h3>
            </div>
            <button class="modal-close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="modal-body">${contentHtml}</div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('modal-open');
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length === 0) {
          document.body.style.overflow = '';
        }
      });
      modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        modal.classList.remove('modal-open');
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length === 0) {
          document.body.style.overflow = '';
        }
      });
    } else {
      const badgeEl = modal.querySelector('.modal-badge');
      if (badgeEl) badgeEl.textContent = badge;
      const titleEl = modal.querySelector('h3');
      if (titleEl) titleEl.textContent = title;
      modal.querySelector('.modal-body').innerHTML = contentHtml;
    }
    document.body.style.overflow = 'hidden';
    modal.classList.add('modal-open');
  }

  // Modal 1: Mường Phăng
  function openGeneralDossierModal() {
    createBaseModal(
      'modal-muong-phang',
      'Sở Chỉ Huy Chiến Dịch Mường Phăng · Hồ Sơ Cơ Mật',
      'CHẶNG 01 · CHỈ HUY',
      `
      <div class="dossier-grid">
        <img src="images/muong-phang.webp" alt="Mường Phăng" class="modal-banner-img" />
        <div class="dossier-content">
          <h4>Quyết Định Lịch Sử Ngày 26/01/1954</h4>
          <p>Tại căn lán dã chiến đơn sơ dưới chân núi Pú Đồn, Đại tướng Võ Nguyên Giáp đã đưa ra quyết định khó khăn nhất trong cuộc đời cầm quân: <strong>hoãn giờ nổ súng, kéo pháo ra, chuyển từ "Đánh nhanh, thắng nhanh" sang "Đánh chắc, tiến chắc"</strong>.</p>
          <div class="spec-table">
            <div class="spec-row"><span>Thời gian hoạt động:</span><strong>31/01/1954 – 15/05/1954 (105 ngày)</strong></div>
            <div class="spec-row"><span>Đường hầm xuyên núi:</span><strong>Dài 320m, nối liền hầm Đại tướng với hầm Tham mưu trưởng</strong></div>
            <div class="spec-row"><span>Độ che phủ tán rừng:</span><strong>Rừng nguyên sinh rậm rạp, cách trận địa Mường Thanh 15km đường chim bay</strong></div>
            <div class="spec-row"><span>Hệ thống thông tin:</span><strong>Mạng dây hữu tuyến bọc cao su kéo ngầm dưới hào lá mục</strong></div>
          </div>
          <div class="steam-box">
            <strong>KHOA HỌC & ĐỊA LÝ QUÂN SỰ (STEAM):</strong>
            <p>Vị trí Mường Phăng được chọn vì nằm sau dãy núi Pú Huốt cao hơn 1.000m, che chắn hoàn toàn hỏa lực pháo binh và sóng radar của máy bay địch. Âm thanh kéo pháo và đào hào bị các dãy thung lũng sâu phân tán và tiêu âm tự nhiên.</p>
          </div>
        </div>
      </div>
      `
    );
  }

  // Modal 2: So sánh A1 vs D1
  function openCompareA1D1Modal() {
    createBaseModal(
      'modal-compare-a1-d1',
      'Đối Chiếu Quân Sự & Tầm Nhìn Chiến Thuật: Đồi A1 vs Đồi D1',
      'CHIẾN TRƯỜNG PHÍA ĐÔNG',
      `
      <div class="compare-container">
        <p class="compare-lead">Hai điểm cao khống chế sinh tử phía Đông phân khu trung tâm, quyết định số phận tập đoàn cứ điểm Điện Biên Phủ.</p>
        <div class="compare-table-wrapper">
          <table class="compare-table">
            <thead>
              <tr>
                <th>Tiêu chí đánh giá</th>
                <th class="th-a1">Cứ điểm Đồi A1 (Eliane 2)</th>
                <th class="th-d1">Cứ điểm Đồi D1 (Dominique 2)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Độ cao so với lòng chảo</strong></td>
                <td>+32 mét (khống chế trực tiếp phân khu trung tâm)</td>
                <td><strong>+50 mét (cao nhất dãy đồi phía Đông)</strong></td>
              </tr>
              <tr>
                <td><strong>Cấu trúc công sự Pháp</strong></td>
                <td>Hầm ngầm bê tông cốt thép kiên cố, lô cốt "cây rơm" ngầm đa tầng</td>
                <td>Chiến hào vòng tròn, 3 tầng dây thép gai, lô cốt tiền tiêu</td>
              </tr>
              <tr>
                <td><strong>Thời gian giằng co ác liệt</strong></td>
                <td><strong>39 ngày đêm</strong> (30/03 – 07/05/1954)</td>
                <td>2 ngày đêm tiến công dứt điểm (30/03 – 01/04/1954)</td>
              </tr>
              <tr>
                <td><strong>Phương thức đột phá</strong></td>
                <td>Đào hầm ngầm chữ chi 47m, nổ khối bộc phá 960kg TNT</td>
                <td>Pháo binh bắn chế áp, bộ binh thọc sâu xung kích</td>
              </tr>
              <tr>
                <td><strong>Biểu tượng lịch sử ngày nay</strong></td>
                <td>Hố bộc phá 960kg & Xác xe tăng Bazeilles</td>
                <td><strong>Tượng đài Chiến thắng Điện Biên Phủ</strong> (đồng cao 16,6m)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="steam-box" style="margin-top:1rem;">
          <strong>BÀI TOÁN TOÁN HỌC & TẦM NHÌN (STEAM):</strong>
          <p>Từ đỉnh D1, góc tà quan sát xuống tim đường băng sân bay Mường Thanh đạt xấp xỉ -4°12' ở cự ly 1.200m, cho phép pháo cao xạ 37mm ngắm bắn trực tiếp đường bay cất/hạ cánh của vận tải cơ C-47 Dakota.</p>
        </div>
      </div>
      `
    );
  }

  // Modal 3: Thành Bản Phủ
  function openBanPhuHeritageModal() {
    createBaseModal(
      'modal-ban-phu',
      'Di Tích Thành Bản Phủ · Dấu Ấn Thủ Lĩnh Hoàng Công Chất Thế Kỷ XVIII',
      'MỞ RỘNG · DI SẢN LỊCH SỬ',
      `
      <div class="dossier-grid">
        <img src="images/muong-phang.webp" alt="Thành Bản Phủ" class="modal-banner-img" />
        <div class="dossier-content">
          <h4>Chiều Sâu Văn Hóa 200 Năm Trước Chiến Dịch 1954</h4>
          <p>Thành Bản Phủ (xã Noong Hẹt, huyện Điện Biên) được xây dựng từ năm 1758 đến 1762 bởi người anh hùng nông dân Hoàng Công Chất. Đây là căn cứ địa vững chắc đánh tan giặc Phẻ ngoại xâm, mang lại cuộc sống thanh bình, đoàn kết cho đồng bào các dân tộc Thái, Mường, Kinh vùng Mường Thanh.</p>
          <div class="spec-table">
            <div class="spec-row"><span>Diện tích thành lũy:</span><strong>Hơn 80 mẫu, hình chữ nhật đắp đất cao 5m</strong></div>
            <div class="spec-row"><span>Hệ thống bảo vệ:</span><strong>Hào sâu 4m bao quanh cắm chông tre, trồng lũy tre gai dầy đặc</strong></div>
            <div class="spec-row"><span>Di sản phi vật thể:</span><strong>Lễ hội Đền Hoàng Công Chất (mùng 8 tháng 4 âm lịch hàng năm)</strong></div>
          </div>
          <div class="steam-box">
            <strong>KỸ THUẬT CÔNG SỰ TRUYỀN THỐNG (STEAM):</strong>
            <p>Phương pháp gia cố đất đắp bằng rễ tre gai của tổ tiên là tiền đề cho tư duy sử dụng tre bện, bao đất và cọc gỗ tự nhiên trong xây dựng 500km hào công sự Điện Biên Phủ năm 1954.</p>
          </div>
        </div>
      </div>
      `
    );
  }

  // Modal 4: Tuyến Tri Ân
  function openMemorialRouteModal() {
    createBaseModal(
      'modal-memorial-route',
      'Hành Trình Ký Ức · 4 Nghĩa Trang Liệt Sĩ Mặt Trận Điện Biên Phủ',
      'TRI ÂN · TƯỞNG NIỆM',
      `
      <div class="memorial-cards-grid">
        <div class="mem-card">
          <img src="images/a1-cemetery.webp" alt="Nghĩa trang A1" />
          <div class="mem-card-body">
            <h5>1. Nghĩa trang Liệt sĩ Đồi A1</h5>
            <p>644 phần mộ liệt sĩ kiên trung. Nơi yên nghỉ của các Anh hùng Tô Vĩnh Diện, Bế Văn Đàn, Phan Đình Giót, Trần Can.</p>
          </div>
        </div>
        <div class="mem-card">
          <img src="images/him-lam-memorial.webp" alt="Nghĩa trang Him Lam" />
          <div class="mem-card-body">
            <h5>2. Nghĩa trang Liệt sĩ Him Lam</h5>
            <p>Tưởng niệm 89 cán bộ chiến sĩ ngã xuống trong trận mở màn vang dội chiều ngày 13/3/1954.</p>
          </div>
        </div>
        <div class="mem-card">
          <img src="images/a1-cemetery.webp" alt="Nghĩa trang Độc Lập" />
          <div class="mem-card-body">
            <h5>3. Nghĩa trang Liệt sĩ Độc Lập</h5>
            <p>Tưởng niệm các anh hùng Trung đoàn 102 & 88 trong trận đánh tiêu diệt cứ điểm Độc Lập rạng sáng 15/3/1954.</p>
          </div>
        </div>
        <div class="mem-card">
          <img src="images/him-lam-memorial.webp" alt="Nghĩa trang Tông Khao" />
          <div class="mem-card-body">
            <h5>4. Nghĩa trang TNXP Tông Khao</h5>
            <p>Nơi an nghỉ của các chiến sĩ Thanh niên xung phong, dân công hỏa tuyến thông đường phá bom nổ chậm đèo Pha Đín.</p>
          </div>
        </div>
      </div>
      `
    );
  }

  // --- 6. INTERACTIVE STEAM LAB DRAWERS (#steam) ---
  function initSteamLab() {
    const steamCards = document.querySelectorAll('.lab-grid .lab-card');
    steamCards.forEach((card, idx) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        openSteamLabDrawer(idx);
      });
    });
  }

  function openSteamLabDrawer(index) {
    const labs = [
      {
        code: "S · SCIENCE (KHOA HỌC)",
        title: "Thí Nghiệm Địa Hình & Tầm Nhìn Chiến Lược (Line of Sight)",
        badge: "VẬT LÝ & ĐỊA LÝ QUÂN SỰ",
        html: `
          <div class="lab-simulation">
            <p>Kéo thanh trượt để thay đổi độ cao của đài quan sát chỉ huy và tính toán bán kính tầm nhìn bao quát xuống lòng chảo Mường Thanh:</p>
            <div class="sim-control-group">
              <label>Độ cao điểm quan sát: <strong id="sim-height-val">50 mét (Đỉnh Đồi D1)</strong></label>
              <input type="range" id="sim-height-slider" min="10" max="80" value="50" step="5" style="width:100%; margin: 0.5rem 0;" />
            </div>
            <div class="sim-readouts">
              <div class="sim-readout"><span>Tầm nhìn xa tới đường chân trời:</span><strong id="sim-los-km">25.3 km</strong></div>
              <div class="sim-readout"><span>Góc tà xạ giới xuống sân bay:</span><strong id="sim-los-deg">-4.2°</strong></div>
              <div class="sim-readout"><span>Vùng che khuất chết (Dead Zone):</span><strong id="sim-dead-zone">Chỉ 8% lòng chảo</strong></div>
            </div>
            <div class="steam-box" style="margin-top:1rem;">
              <strong>KẾT LUẬN KHOA HỌC:</strong>
              <p>Công thức tính tầm nhìn xa hình học: <em>d ≈ 3.57 × √h (km)</em>. Khi ta làm chủ đồi D1 ở độ cao 50m, toàn bộ 100% đường băng sân bay Mường Thanh nằm trong tầm bắn ngắm trực tiếp của súng máy phòng không 12.7mm và pháo cao xạ 37mm.</p>
            </div>
          </div>
        `
      },
      {
        code: "T · TECHNOLOGY (CÔNG NGHỆ)",
        title: "Tối Ưu Hóa Tuyến Đường Tour 3D & Bản Đồ Số GIS",
        badge: "CÔNG NGHỆ THÔNG TIN & TRẮC ĐỊA",
        html: `
          <div class="lab-simulation">
            <p>Thuật toán Dijkstra tìm đường đi ngắn nhất kết nối 4 lớp di sản (Chỉ huy → Chiến trường → Di sản → Tri ân):</p>
            <div class="sim-readouts">
              <div class="sim-readout"><span>Tuyến tối ưu nhất:</span><strong>Mường Phăng → Him Lam → Đồi A1 → D1 → Nghĩa trang A1</strong></div>
              <div class="sim-readout"><span>Tổng quãng đường số:</span><strong>28.4 km</strong></div>
              <div class="sim-readout"><span>Độ phủ thông tin tour:</span><strong>98.5% dữ liệu cốt lõi</strong></div>
            </div>
            <div class="steam-box" style="margin-top:1rem;">
              <strong>ỨNG DỤNG CÔNG NGHỆ:</strong>
              <p>Hệ thống số hóa 8 tour 360 độ sử dụng ảnh chụp Gigapixel và cảm biến định vị không gian để đồng bộ tọa độ GPS thực tế với mô hình bình đồ 3D tương tác.</p>
            </div>
          </div>
        `
      },
      {
        code: "E · ENGINEERING (KỸ THUẬT)",
        title: "Kỹ Thuật Chiến Hào Vây Lấn Chữ Chi & Hầm Ngầm A1",
        badge: "KỸ THUẬT XÂY DỰNG & ĐỘNG LỰC HỌC",
        html: `
          <div class="lab-simulation">
            <p>Mô phỏng mặt cắt chiến hào chữ chi chống sóng xung kích bom nổ:</p>
            <div class="sim-readouts">
              <div class="sim-readout"><span>Góc bẻ khúc hào:</span><strong>120° (hình chữ chi)</strong></div>
              <div class="sim-readout"><span>Giảm chấn sóng nổ bom:</span><strong>Giảm 75% năng lượng sóng xung kích</strong></div>
              <div class="sim-readout"><span>Độ dốc đáy hào thoát nước:</span><strong>2% hướng ra suối Nậm Rốm</strong></div>
            </div>
            <div class="steam-box" style="margin-top:1rem;">
              <strong>NGUYÊN LÝ KỸ THUẬT:</strong>
              <p>Sóng xung kích do bom đạn phát tán theo đường thẳng. Khi chạm vào các khúc bẻ góc 120° của chiến hào chữ chi, sóng nổ bị tán xạ và triệt tiêu năng lượng, bảo vệ tính mạng bộ đội trong các đoạn hào tiếp theo.</p>
            </div>
          </div>
        `
      },
      {
        code: "M · MATHEMATICS (TOÁN HỌC)",
        title: "Toán Học Chiến Dịch: Thống Kê & Bài Toán Hậu Cần Vĩ Đại",
        badge: "TOÁN THỐNG KÊ & TÍNH TOÁN NĂNG LƯỢNG",
        html: `
          <div class="lab-simulation">
            <p>Kéo thanh trượt để kiểm chứng bài toán hậu cần giữa <strong>Xe đạp thồ cải tiến</strong> và <strong>Gánh bộ truyền thống</strong>:</p>
            <div class="sim-control-group">
              <label>Tải trọng 1 xe đạp thồ: <strong id="modal-bike-load-val">250 kg</strong></label>
              <input type="range" id="modal-bike-load-slider" min="80" max="352" value="250" step="10" style="width:100%; margin: 0.4rem 0 0.8rem;" />
              <label>Mục tiêu gạo đưa tới đích: <strong id="modal-bike-tons-val">20 tấn</strong></label>
              <input type="range" id="modal-bike-tons-slider" min="5" max="100" value="20" step="5" style="width:100%; margin: 0.4rem 0;" />
            </div>
            <div class="sim-readouts" id="modal-bike-readouts">
              <div class="sim-readout"><span>Số lượt Xe đạp thồ:</span><strong id="modal-bike-trips">80 chuyến</strong></div>
              <div class="sim-readout"><span>Số lượt Dân công gánh bộ (25kg):</span><strong id="modal-foot-trips">800 lượt</strong></div>
              <div class="sim-readout"><span>Kỷ lục dân công Ma Văn Thắng:</span><strong>352 kg / 1 xe</strong></div>
              <div class="sim-readout"><span>Hiệu suất tăng so với gánh bộ:</span><strong id="modal-bike-gain">Gấp 10.0 lần</strong></div>
            </div>
            <div class="steam-box" style="margin-top:1rem;">
              <strong>MỐI LIÊN HỆ TOÁN HỌC &amp; HẬU CẦN:</strong>
              <p>Với cung đường 250 km đi về mất ~16 ngày, mỗi người gánh bộ tự ăn hết gần 19 kg dọc đường, chỉ giao được ~6 kg thực tế. Xe đạp thồ cải tiến giúp giảm 90% nhân lực tiêu hao dọc tuyến.</p>
            </div>
          </div>
        `
      }
    ];

    const currentLab = labs[index];
    createBaseModal('modal-steam-lab', currentLab.title, currentLab.badge, currentLab.html);

    // If Science tab, wire up interactive slider
    if (index === 0) {
      const slider = document.getElementById('sim-height-slider');
      if (slider) {
        slider.addEventListener('input', (e) => {
          const h = parseInt(e.target.value, 10);
          const los = (3.57 * Math.sqrt(h)).toFixed(1);
          const deg = (-0.084 * h).toFixed(1);
          const dead = Math.max(3, 20 - Math.floor(h / 4));

          document.getElementById('sim-height-val').textContent = `${h} mét`;
          document.getElementById('sim-los-km').textContent = `${los} km`;
          document.getElementById('sim-los-deg').textContent = `${deg}°`;
          document.getElementById('sim-dead-zone').textContent = `Chỉ ${dead}% lòng chảo`;
        });
      }
    }

    // If Mathematics tab, wire up bicycle logistics sliders
    if (index === 3) {
      const loadSlider = document.getElementById('modal-bike-load-slider');
      const tonsSlider = document.getElementById('modal-bike-tons-slider');
      const syncModalBike = () => {
        if (!loadSlider || !tonsSlider) return;
        const stats = computeBikeLogistics(
          parseInt(loadSlider.value, 10),
          parseInt(tonsSlider.value, 10),
          15,
          200
        );
        document.getElementById('modal-bike-load-val').textContent = `${stats.loadKg} kg`;
        document.getElementById('modal-bike-tons-val').textContent = `${stats.tons} tấn`;
        document.getElementById('modal-bike-trips').textContent = `${stats.bikeTrips} chuyến`;
        document.getElementById('modal-foot-trips').textContent = `${stats.footTrips} lượt`;
        document.getElementById('modal-bike-gain').textContent = `Gấp ${stats.multiplier} lần`;
      };
      if (loadSlider) loadSlider.addEventListener('input', syncModalBike);
      if (tonsSlider) tonsSlider.addEventListener('input', syncModalBike);
      syncModalBike();
    }
  }

  // --- 6B. 56 DAYS TIMELINE PHASE MODALS ---
  const PHASES_DATA = [
    {
      index: "01",
      period: "15/01 – 12/03/1954",
      title: "Giai Đoạn Chuẩn Bị & Mở Đường Kéo Pháo",
      objective: "Chuyển phương châm tác chiến, chuẩn bị toàn diện lực lượng, mở đường xuyên rừng kéo pháo vào trận địa.",
      details: [
        { label: "Quyết định lịch sử", val: "Ngày 26/01/1954, Đại tướng Võ Nguyên Giáp ra quyết định thay đổi phương châm từ 'Đánh nhanh, thắng nhanh' sang 'Đánh chắc, tiến chắc'." },
        { label: "Kỳ tích kéo pháo", val: "Hàng ngàn chiến sĩ dùng sức người kéo các khẩu lựu pháo 105mm nặng hơn 2 tấn vượt qua dốc cao đèo thẳm lên đỉnh núi bao quanh thung lũng Mường Thanh." },
        { label: "Xây dựng công sự", val: "Bố trí trận địa pháo ngụy trang kiên cố khoét sâu trong lòng núi, bảo toàn lực lượng trước không quân Pháp." }
      ],
      lesson: "Bài học về sự thận trọng, tinh thần quả cảm và tư duy quân sự khoa học đặt tính mạng chiến sĩ và thắng lợi chiến dịch lên trên hết."
    },
    {
      index: "02",
      period: "13/03 – 17/03/1954",
      title: "Đợt Tiến Công Thứ Nhất: Đập Tan Cánh Cửa Thép Phía Bắc",
      objective: "Tiêu diệt trung tâm đề kháng Him Lam và Độc Lập, bức hàng Bản Kéo, khai thông cửa ngõ vào phân khu trung tâm.",
      details: [
        { label: "Mở màn Him Lam (13/03)", val: "Pháo binh phát hỏa lúc 17h05. Anh hùng Phan Đình Giót lấy thân mình lấp lỗ châu mai. Ta tiêu diệt hoàn toàn cứ điểm trong 5 giờ." },
        { label: "Tiêu diệt Độc Lập (15/03)", val: "Trận đánh hiệp đồng pháo - bộ binh mẫu mực san phẳng cứ điểm kiên cố nhất của địch sau đêm bão lửa." },
        { label: "Bức hàng Bản Kéo (17/03)", val: "Dùng chiến thuật địch vận làm tan rã phân khu Bản Kéo, làm chủ hoàn toàn cửa ngõ phía Bắc thung lũng." }
      ],
      lesson: "Chiến thuật đánh điểm diệt viện, khai hỏa pháo binh bất ngờ áp đảo và đòn tâm lý làm lung lay ý chí đối phương."
    },
    {
      index: "03",
      period: "30/03 – 30/04/1954",
      title: "Đợt Tiến Công Thứ Hai: Siết Chặt Vòng Vây & Đồi Phía Đông",
      objective: "Tiến công các cứ điểm cao điểm phía Đông (A1, C1, D1, E1), đào chiến hào siết chặt sân bay Mường Thanh, cắt đứt tiếp tế đường không.",
      details: [
        { label: "Giằng co ác liệt tại A1", val: "Trận chiến dài ngày và cam go nhất chiến dịch. Ta và địch giành giật từng tấc đất, hầm hào trên đỉnh đồi A1." },
        { label: "Chiến thuật vây lấn (Hào giao thông)", val: "Đào hàng trăm km giao thông hào chằng chịt như mạng nhện siết chặt lòng chảo, cắt đôi sân bay Mường Thanh." },
        { label: "Bắn tỉa & Bóp nghẹt tiếp tế", val: "Khống chế toàn bộ không phận thả dù, biến nguồn dù tiếp tế của Pháp thành nguồn chi viện cho quân ta." }
      ],
      lesson: "Sáng tạo nghệ thuật vây lấn độc đáo trong lịch sử quân sự thế giới: dùng xẻng và chiến hào bóp nghẹt pháo đài bất khả xâm phạm."
    },
    {
      index: "04",
      period: "01/05 – 07/05/1954",
      title: "Đợt Tiến Công Thứ Ba: Bộc Phá A1 & Tổng Công Kích Toàn Mặt Trận",
      objective: "Tiêu diệt các điểm cao còn lại, cho nổ bộc phá A1, tổng công kích bắt sống tướng De Castries và toàn bộ Bộ chỉ huy tập đoàn cứ điểm.",
      details: [
        { label: "Khối bộc phá 960kg Đồi A1", val: "Đúng 20h30 ngày 06/05, tiếng nổ rung chuyển thung lũng báo hiệu giờ tổng công kích, xóa sổ cứ điểm kháng cự cuối cùng của địch." },
        { label: "Chiều ngày 07/05/1954 lịch sử", val: "15h ngày 07/05, lệnh tổng công kích phát ra. Đại đội 360 (Trung đoàn 209) xông thẳng vào sở chỉ huy phân khu trung tâm." },
        { label: "Lá cờ Quyết chiến Quyết thắng", val: "17h30 ngày 07/05, lá cờ đỏ sao vàng tung bay kiêu hãnh trên nóc hầm De Castries. Toàn bộ hơn 16.000 quân địch ra hàng." }
      ],
      lesson: "Đỉnh cao của ý chí dân tộc, sự kiên định đến cùng và thắng lợi 'lừng lẫy năm châu, chấn động địa cầu'."
    }
  ];

  function openPhaseModal(phaseIndex) {
    const data = PHASES_DATA[phaseIndex];
    if (!data) return;
    if (window.SiteAudio) window.SiteAudio.playRadar();

    let modal = document.getElementById('modal-phase-dossier');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-phase-dossier';
      modal.className = 'custom-modal';
      modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-window dossier-window">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-badge" id="phase-badge">TRỤC THỜI GIAN 56 NGÀY ĐÊM</span>
              <h3 id="phase-title"></h3>
            </div>
            <button class="modal-close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="modal-body" id="phase-body"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('modal-open');
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length === 0) document.body.style.overflow = '';
      });
      modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        modal.classList.remove('modal-open');
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length === 0) document.body.style.overflow = '';
      });
    }

    modal.querySelector('#phase-badge').textContent = `GIAI ĐOẠN ${data.index} · ${data.period}`;
    modal.querySelector('#phase-title').textContent = data.title;
    modal.querySelector('#phase-body').innerHTML = `
      <div class="dossier-grid">
        <div class="dossier-col main-intel">
          <div class="intel-block">
            <h4>MỤC TIÊU CHIẾN LƯỢC</h4>
            <p>${data.objective}</p>
          </div>
          <div class="intel-block">
            <h4>DIỄN BIẾN & SỰ KIỆN THEN CHỐT</h4>
            <div class="intel-facts">
              ${data.details.map(d => `
                <div class="fact-item">
                  <strong>${d.label}:</strong>
                  <span>${d.val}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="dossier-col side-intel">
          <div class="inquiry-highlight">
            <span class="tag">BÀI HỌC LỊCH SỬ</span>
            <p>${data.lesson}</p>
          </div>
          <div class="hotspot-action" style="margin-top:1.25rem;">
            <button type="button" class="button button-primary" style="width:100%; text-align:center;" onclick="document.getElementById('modal-phase-dossier').classList.remove('modal-open'); const m = document.getElementById('map'); if(m) m.scrollIntoView({behavior:'smooth'});">
              Xem vị trí trên bản đồ quân sự ↓
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.style.overflow = 'hidden';
    modal.classList.add('modal-open');
  }

  function initPhaseModals() {
    const phaseCards = document.querySelectorAll('.phase-grid .phase-card');
    phaseCards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        openPhaseModal(idx);
      });
    });
  }

  // --- 6C. GALLERY PHOTO LIGHTBOX MODAL ---
  const GALLERY_DATA = [
    {
      title: "Đài Tưởng Niệm Cứ Điểm Him Lam",
      sub: "Di tích lịch sử Quốc gia đặc biệt",
      image: "images/him-lam-memorial.webp",
      desc: "Nơi ghi danh các anh hùng liệt sĩ đã ngã xuống trong trận đánh mở màn ngày 13/03/1954, đập tan cứ điểm kiên cố nhất của tập đoàn cứ điểm trong vòng chưa đầy 6 giờ.",
      tourIdx: 5
    },
    {
      title: "Sở Chỉ Huy Chiến Dịch Mường Phăng",
      sub: "Hệ thống hầm chỉ huy trong rừng nguyên sinh",
      image: "images/muong-phang.webp",
      desc: "Nơi Đại tướng Võ Nguyên Giáp cùng Bộ chỉ huy chiến dịch làm việc, đưa ra những quyết sách mang tính bước ngoặt đưa chiến dịch đến thắng lợi hoàn toàn.",
      tourIdx: 0
    },
    {
      title: "Đồi D1 — Quần Thể Tượng Đài Chiến Thắng",
      sub: "Cao điểm khống chế toàn bộ lòng chảo Mường Thanh",
      image: "images/d1.webp",
      desc: "Cao điểm phòng ngự kiên cố của dãy đồi phía Đông, cao hơn mặt thung lũng 50 mét, nay là nơi sừng sững tượng đài chiến thắng bằng đồng lớn nhất Việt Nam.",
      tourIdx: 2
    },
    {
      title: "Đồi A1 — Cứ Điểm Quyết Chiến 39 Ngày Đêm",
      sub: "Hố bộc phá 960kg TNT & xác xe tăng Bazeilles",
      image: "images/a1.webp",
      desc: "Chiến trường ác liệt và giằng co nhất giữa ta và địch, nơi từng tấc chiến hào thấm đẫm máu xương của các chiến sĩ trước giờ tổng công kích.",
      tourIdx: 1
    }
  ];

  function openGalleryLightbox(index) {
    const data = GALLERY_DATA[index];
    if (!data) return;
    if (window.SiteAudio) window.SiteAudio.playClick();

    let modal = document.getElementById('modal-gallery-lightbox');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-gallery-lightbox';
      modal.className = 'custom-modal';
      modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-window pano-window">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-badge" id="lightbox-sub">TƯ LIỆU HÌNH ẢNH LỊCH SỬ</span>
              <h3 id="lightbox-title"></h3>
            </div>
            <button class="modal-close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div class="pano-viewport" style="background:#000; display:flex; align-items:center; justify-content:center;">
            <img id="lightbox-img" src="" alt="Photo" style="max-height:65vh; max-width:100%; object-fit:contain;" />
          </div>
          <div class="pano-footer" style="padding:1rem 1.5rem; justify-content:space-between; align-items:center;">
            <p id="lightbox-desc" style="color:var(--ink-soft); margin:0; font-size:0.88rem; max-width:70%; line-height:1.5;"></p>
            <button type="button" class="button button-primary" id="lightbox-tour-btn">
              Khám phá 3D địa điểm này ↗
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('modal-open');
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length === 0) document.body.style.overflow = '';
      });
      modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        modal.classList.remove('modal-open');
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length === 0) document.body.style.overflow = '';
      });
    }

    modal.querySelector('#lightbox-sub').textContent = data.sub;
    modal.querySelector('#lightbox-title').textContent = data.title;
    modal.querySelector('#lightbox-img').src = data.image;
    modal.querySelector('#lightbox-desc').textContent = data.desc;
    
    const tourBtn = modal.querySelector('#lightbox-tour-btn');
    tourBtn.onclick = () => {
      modal.classList.remove('modal-open');
      document.body.style.overflow = '';
      updateTourView(data.tourIdx);
      const v = document.getElementById('viewer');
      if (v) v.scrollIntoView({ behavior: 'smooth' });
    };

    document.body.style.overflow = 'hidden';
    modal.classList.add('modal-open');
  }

  function initGalleryLightbox() {
    const figures = document.querySelectorAll('.gallery-grid figure');
    figures.forEach((fig, idx) => {
      fig.addEventListener('click', () => {
        openGalleryLightbox(idx);
      });
    });
  }

  // --- 7. HEADER & NAVIGATION CONTROLLER ---
  function initHeaderNav() {
    if (el.menuToggle && el.mainNav) {
      el.menuToggle.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const expanded = el.menuToggle.getAttribute('aria-expanded') === 'true';
        el.menuToggle.setAttribute('aria-expanded', !expanded);
        el.mainNav.classList.toggle('is-open');
        el.mainNav.classList.toggle('nav-open');
      });

      // Close menu on link click
      el.mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          el.mainNav.classList.remove('is-open', 'nav-open');
          el.menuToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    if (el.headerCta) {
      el.headerCta.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playRadar();
        const mapSection = document.getElementById('map');
        if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Hero buttons
    const btnHeroPrimary = document.querySelector('.hero-actions .button-primary');
    if (btnHeroPrimary) {
      btnHeroPrimary.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const viewerSection = document.getElementById('viewer');
        if (viewerSection) viewerSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const btnHeroRoute = document.querySelector('.hero-actions .text-link');
    if (btnHeroRoute) {
      btnHeroRoute.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const routeSection = document.getElementById('route');
        if (routeSection) routeSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Hero scroll link
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
      heroScroll.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const viewerSection = document.getElementById('viewer');
        if (viewerSection) viewerSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Hero route poster nodes
    document.querySelectorAll('.route-node').forEach(node => {
      node.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const targetTour = parseInt(node.getAttribute('data-target-tour'), 10);
        if (!isNaN(targetTour)) updateTourView(targetTour);
        const viewerSection = document.getElementById('viewer');
        if (viewerSection) viewerSection.scrollIntoView({ behavior: 'smooth' });
      });
    });

    const routeBadge = document.querySelector('.route-badge');
    if (routeBadge) {
      routeBadge.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const viewerSection = document.getElementById('viewer');
        if (viewerSection) viewerSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Audio mute toggle button
    const audioToggle = document.getElementById('audio-toggle-btn');
    if (audioToggle) {
      // Sync initial mute state
      if (window.SiteAudio && window.SiteAudio.isMuted) {
        audioToggle.classList.add('muted');
        audioToggle.setAttribute('title', 'Bật âm thanh hiệu ứng');
      }
      audioToggle.addEventListener('click', () => {
        if (window.SiteAudio) {
          const muted = window.SiteAudio.toggleMute();
          audioToggle.setAttribute('title', muted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng');
          audioToggle.classList.toggle('muted', muted);
        }
      });
    }

    // Global keyboard listener (ESC to close modals/menu, ArrowLeft/ArrowRight to step tours)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length > 0) {
          openModals.forEach(m => m.classList.remove('modal-open'));
          document.body.style.overflow = '';
        }
        if (el.mainNav && (el.mainNav.classList.contains('is-open') || el.mainNav.classList.contains('nav-open'))) {
          el.mainNav.classList.remove('is-open', 'nav-open');
          if (el.menuToggle) el.menuToggle.setAttribute('aria-expanded', 'false');
        }
      } else if (e.key === 'ArrowLeft') {
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length === 0 && (!e.target || (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA'))) {
          if (el.btnPrevTour) el.btnPrevTour.click();
        }
      } else if (e.key === 'ArrowRight') {
        const openModals = document.querySelectorAll('.custom-modal.modal-open, #modal-panorama-360.modal-open');
        if (openModals.length === 0 && (!e.target || (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA'))) {
          if (el.btnNextTour) el.btnNextTour.click();
        }
      }
    });
  }

  // --- 7B. CLASSROOM EXPERIENCE KIT (45-60 MIN WORKBENCH) ---
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showToastNotice(message) {
    let toast = document.getElementById('db3dToastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'db3dToastNotice';
      toast.style.cssText = [
        'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
        'background:#0a1418', 'color:#e5c985', 'border:1px solid #c69a47',
        'padding:11px 20px', 'font-size:13px', 'font-weight:700', 'z-index:10050',
        'box-shadow:0 10px 30px rgba(0,0,0,0.45)', 'opacity:0', 'transition:opacity 0.2s ease',
        'max-width:90vw', 'text-align:center'
      ].join(';');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 3200);
  }

  // Shared logistics calculation helper (used by Modal M & Tab 02 Bike Simulator)
  function computeBikeLogistics(loadKg, tons, slopePct, distKm) {
    const targetKg = tons * 1000;
    // Steep slopes reduce safe load effectiveness slightly above 15%
    const slopePenalty = slopePct > 15 ? 1 - ((slopePct - 15) * 0.012) : 1;
    const effectiveLoad = Math.max(80, Math.round(loadKg * slopePenalty));
    const bikeTrips = Math.ceil(targetKg / effectiveLoad);
    const footLoad = 25;
    const footTrips = Math.ceil(targetKg / footLoad);

    // Round-trip days at ~32km/day avg (slower on steep slopes)
    const speedKmPerDay = Math.max(18, 34 - slopePct * 0.5);
    const tripDays = Math.max(2, Math.round((distKm * 2) / speedKmPerDay));
    const selfConsumeKg = +(tripDays * 1.2).toFixed(1);

    const netBikePerTrip = Math.max(0, +(effectiveLoad - selfConsumeKg).toFixed(1));
    const netFootPerTrip = Math.max(0, +(footLoad - selfConsumeKg).toFixed(1));
    const multiplier = (effectiveLoad / footLoad).toFixed(1);

    return {
      loadKg,
      effectiveLoad,
      tons,
      slopePct,
      distKm,
      bikeTrips,
      footTrips,
      tripDays,
      selfConsumeKg,
      netBikePerTrip,
      netFootPerTrip,
      multiplier
    };
  }

  function initClassroomKit() {
    const kit = window.CLASSROOM_KIT_DATA;
    if (!kit) return;

    // 1. Class Timer Widget
    const timerDisplay = document.getElementById('classTimerDisplay');
    const timerToggle = document.getElementById('classTimerToggle');
    const timerReset = document.getElementById('classTimerReset');
    const presetBtns = document.querySelectorAll('[data-timer-min]');

    let timerPresetSeconds = 15 * 60;
    let timerRemaining = timerPresetSeconds;
    let timerInterval = null;

    function formatTimer(sec) {
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      return `${m}:${s}`;
    }

    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (timerToggle) {
        timerToggle.classList.remove('is-running');
        const span = timerToggle.querySelector('span');
        if (span) span.textContent = 'Chạy giờ';
      }
    }

    function setTimerMinutes(minutes) {
      stopTimer();
      timerPresetSeconds = minutes * 60;
      timerRemaining = timerPresetSeconds;
      if (timerDisplay) timerDisplay.textContent = formatTimer(timerRemaining);
      presetBtns.forEach(b => {
        b.classList.toggle('active', parseInt(b.getAttribute('data-timer-min'), 10) === minutes);
      });
    }

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const mins = parseInt(btn.getAttribute('data-timer-min'), 10);
        if (!isNaN(mins)) setTimerMinutes(mins);
      });
    });

    if (timerToggle) {
      timerToggle.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        if (timerInterval) {
          stopTimer();
          return;
        }
        if (timerRemaining <= 0) timerRemaining = timerPresetSeconds;
        timerToggle.classList.add('is-running');
        const span = timerToggle.querySelector('span');
        if (span) span.textContent = 'Tạm dừng';
        timerInterval = setInterval(() => {
          timerRemaining--;
          if (timerDisplay) timerDisplay.textContent = formatTimer(Math.max(0, timerRemaining));
          if (timerRemaining <= 0) {
            stopTimer();
            showToastNotice('Hết thời gian bước thực hành! Đã đến lúc chuyển bước tiếp theo.');
          }
        }, 1000);
      });
    }

    if (timerReset) {
      timerReset.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        stopTimer();
        timerRemaining = timerPresetSeconds;
        if (timerDisplay) timerDisplay.textContent = formatTimer(timerRemaining);
      });
    }

    // 2. Workbench Tab Switching & Workflow 5-Step Strip
    const wbTabs = document.querySelectorAll('[data-wb-tab]');
    const wbPanels = document.querySelectorAll('.wb-panel');
    const workflowStrip = document.getElementById('classroomWorkflowStrip');

    function activateWbTab(tabKey) {
      wbTabs.forEach(t => {
        const isActive = t.getAttribute('data-wb-tab') === tabKey;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      wbPanels.forEach(p => {
        p.classList.toggle('active', p.id === `wb-panel-${tabKey}`);
      });
    }

    wbTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        activateWbTab(tab.getAttribute('data-wb-tab'));
      });
    });

    if (workflowStrip) {
      workflowStrip.innerHTML = kit.workflowSteps.map((s, idx) => `
        <button type="button" class="wf-step ${idx === 0 ? 'active' : ''}" data-wf-idx="${idx}">
          <div class="wf-step-top">
            <span class="wf-step-num">${s.step}</span>
            <span class="wf-step-time">${s.duration}</span>
          </div>
          <strong>${s.title}</strong>
          <p>${s.activity}</p>
        </button>
      `).join('');

      workflowStrip.querySelectorAll('.wf-step').forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.SiteAudio) window.SiteAudio.playClick();
          const idx = parseInt(btn.getAttribute('data-wf-idx'), 10);
          const stepObj = kit.workflowSteps[idx];
          if (!stepObj) return;
          workflowStrip.querySelectorAll('.wf-step').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activateWbTab(stepObj.tabTarget);
          if (!timerInterval) setTimerMinutes(stepObj.minutes);
        });
      });
    }

    // 3. Tab 01: Focus Missions (Mường Phăng, Đồi A1, Đồi D1)
    const missionsGrid = document.getElementById('focusMissionsGrid');
    if (missionsGrid) {
      missionsGrid.innerHTML = kit.focusMissions.map((m, i) => `
        <article class="mission-dossier-col">
          <div class="mission-col-media">
            <img src="${m.image}" alt="${m.title}" />
            <span class="mission-col-badge">${m.badge} · ${m.duration}</span>
          </div>
          <h4>${m.title}</h4>
          <ul class="mission-q-list">
            ${m.questions.map(q => `<li>${q}</li>`).join('')}
          </ul>
          <div class="mission-hint-box" id="missionHint-${i}">
            <strong>Dữ kiện đối chiếu chuẩn:</strong> ${m.hintAnswer}
          </div>
          <div class="mission-col-actions">
            <button type="button" class="btn-mission-tour" data-launch-tour="${m.tourIndex}">Vào không gian 3D ↗</button>
            <button type="button" class="btn-mission-hint" data-toggle-hint="${i}">Đáp án gợi ý</button>
          </div>
        </article>
      `).join('');

      missionsGrid.querySelectorAll('[data-launch-tour]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.SiteAudio) window.SiteAudio.playClick();
          const tIdx = parseInt(btn.getAttribute('data-launch-tour'), 10);
          if (!isNaN(tIdx)) {
            updateTourView(tIdx, true);
            const viewer = document.getElementById('viewer');
            if (viewer) viewer.scrollIntoView({ behavior: 'smooth' });
            // Automatically activate live iframe after scroll starts
            setTimeout(() => {
              const data = window.TOURS_DATA && window.TOURS_DATA[tIdx];
              if (el.viewerCover && el.viewerLiveIframe && data) {
                el.viewerCover.style.display = 'none';
                el.viewerLiveIframe.src = data.externalUrl;
                el.viewerLiveIframe.style.display = 'block';
              }
            }, 350);
          }
        });
      });

      missionsGrid.querySelectorAll('[data-toggle-hint]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.SiteAudio) window.SiteAudio.playClick();
          const hIdx = btn.getAttribute('data-toggle-hint');
          const box = document.getElementById(`missionHint-${hIdx}`);
          if (box) {
            const isOpen = box.classList.toggle('open');
            btn.textContent = isOpen ? 'Ẩn gợi ý' : 'Đáp án gợi ý';
          }
        });
      });
    }

    // 4. Tab 02: Situation Cards + Bike Logistics Calculator + Interactive Route SVG Map
    let activeSitIdx = 0;
    const sitPills = document.getElementById('situationPills');
    const sitStage = document.getElementById('situationStage');

    function renderSituationCard(idx) {
      activeSitIdx = idx;
      const card = kit.situationCards[idx];
      if (!card || !sitStage) return;

      if (sitPills) {
        sitPills.querySelectorAll('.situation-pill').forEach((p, i) => {
          p.classList.toggle('active', i === idx);
        });
      }

      sitStage.innerHTML = `
        <span class="sit-tag">${card.tag}</span>
        <h4>${card.title}</h4>
        <p>${card.context}</p>
        <ul class="sit-data-list">
          ${card.dataPoints.map(dp => `<li>• ${dp}</li>`).join('')}
        </ul>
        <div class="sit-task-box">
          <strong>YÊU CẦU GIẢI QUYẾT CỦA NHÓM:</strong> ${card.task}
        </div>
      `;
    }

    if (sitPills) {
      sitPills.innerHTML = kit.situationCards.map((c, idx) => `
        <button type="button" class="situation-pill ${idx === 0 ? 'active' : ''}" data-sit-idx="${idx}">${c.id}</button>
      `).join('');
      sitPills.querySelectorAll('.situation-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.SiteAudio) window.SiteAudio.playClick();
          renderSituationCard(parseInt(btn.getAttribute('data-sit-idx'), 10));
        });
      });
    }
    renderSituationCard(0);

    // Bike Calculator Sliders in Tab 02
    const kitBikeLoad = document.getElementById('kitBikeLoad');
    const kitRiceTarget = document.getElementById('kitRiceTarget');
    const kitSlope = document.getElementById('kitSlope');
    const kitDist = document.getElementById('kitDist');
    const kitBikeResults = document.getElementById('kitBikeResults');

    let latestBikeStats = computeBikeLogistics(220, 12, 15, 200);

    function syncKitBikeSimulator() {
      if (!kitBikeLoad || !kitRiceTarget || !kitSlope || !kitDist || !kitBikeResults) return;
      const stats = computeBikeLogistics(
        parseInt(kitBikeLoad.value, 10),
        parseInt(kitRiceTarget.value, 10),
        parseInt(kitSlope.value, 10),
        parseInt(kitDist.value, 10)
      );
      latestBikeStats = stats;

      document.getElementById('kitBikeLoadVal').textContent = `${stats.loadKg} kg` + (stats.effectiveLoad < stats.loadKg ? ` (hiệu dụng ${stats.effectiveLoad} kg)` : '');
      document.getElementById('kitRiceTargetVal').textContent = `${stats.tons} tấn`;
      document.getElementById('kitSlopeVal').textContent = `${stats.slopePct}%`;
      document.getElementById('kitDistVal').textContent = `${stats.distKm} km`;

      kitBikeResults.innerHTML = `
        <div class="bike-res-cell">
          <span>Số chuyến xe đạp thồ</span>
          <strong>${stats.bikeTrips} lượt xe</strong>
          <small>Thay thế ${stats.footTrips} dân công gánh bộ</small>
        </div>
        <div class="bike-res-cell">
          <span>Lương thực thực nhận/chuyến</span>
          <strong>${stats.netBikePerTrip} kg</strong>
          <small>Ăn dọc đường ~${stats.selfConsumeKg} kg (${stats.tripDays} ngày đi về)</small>
        </div>
        <div class="bike-res-cell">
          <span>Gánh bộ thực nhận/chuyến</span>
          <strong>${stats.netFootPerTrip} kg</strong>
          <small>Xe thồ vượt trội gấp ${stats.multiplier}× sức mang</small>
        </div>
      `;
    }

    [kitBikeLoad, kitRiceTarget, kitSlope, kitDist].forEach(inp => {
      if (inp) inp.addEventListener('input', syncKitBikeSimulator);
    });
    syncKitBikeSimulator();

    // Interactive SVG Route Map (Tab 02 Right)
    const svgBoard = document.getElementById('logisticsSvgBoard');
    const telemetryBar = document.getElementById('routeTelemetryBar');
    let selectedRoute = ['N1'];

    function findEdge(idA, idB) {
      return kit.logisticsEdges.find(
        e => (e.from === idA && e.to === idB) || (e.to === idA && e.from === idB)
      );
    }

    function getReachableNext(currentId) {
      const nextIds = new Set();
      kit.logisticsEdges.forEach(e => {
        if (e.from === currentId && !selectedRoute.includes(e.to)) nextIds.add(e.to);
        if (e.to === currentId && !selectedRoute.includes(e.from)) nextIds.add(e.from);
      });
      return nextIds;
    }

    function computeRouteTelemetry(routeIds) {
      let totalDist = 0;
      let riskPenalty = 0;
      let unsafeCount = 0;
      const nodeMap = {};
      kit.logisticsNodes.forEach(n => { nodeMap[n.id] = n; });

      for (let i = 0; i < routeIds.length - 1; i++) {
        const edge = findEdge(routeIds[i], routeIds[i + 1]);
        if (edge) totalDist += edge.dist;
      }

      routeIds.forEach(id => {
        const n = nodeMap[id];
        if (n) {
          riskPenalty += n.risk * 0.45;
          if (n.risk >= 40) unsafeCount++;
        }
      });

      const finished = routeIds[routeIds.length - 1] === 'N8';
      const safetyScore = Math.max(15, Math.min(98, Math.round(100 - riskPenalty)));

      let diagnosis = 'Bắt đầu từ Kho Pha Đin (N1). Nhấp vào trạm tiếp theo có vòng tròn viền vàng để nối tuyến.';
      if (routeIds.length > 1) {
        if (unsafeCount > 0) {
          diagnosis = `CẢNH BÁO HỎA LỰC: Tuyến đi qua ${unsafeCount} vùng trống trải (Quốc lộ 41 hoặc Cánh đồng Mường Thanh). Từ đỉnh Đồi D1 (+50m), pháo địch bắn thẳng trực tiếp vào khu vực này.`;
        } else if (finished) {
          diagnosis = `TUYẾN TỐI ƯU: Hành lang rừng kín Mường Phăng kết hợp giao thông hào chữ chi giúp đạt độ an toàn ${safetyScore}%, bảo toàn lương thực vào Trận địa A1.`;
        } else {
          diagnosis = 'Đang hành quân qua vùng rừng che phủ & chiến hào. Tiếp tục nối đến Trận địa Đồi A1 (N8) để hoàn tất.';
        }
      }

      return { totalDist, safetyScore, finished, unsafeCount, diagnosis, nodeMap };
    }

    function renderLogisticsBoard() {
      if (!svgBoard || !telemetryBar) return;
      const tel = computeRouteTelemetry(selectedRoute);
      const currentTipId = selectedRoute[selectedRoute.length - 1];
      const reachableNext = tel.finished ? new Set() : getReachableNext(currentTipId);

      // Build background terrain + firing zone from D1
      let svgHtml = `
        <defs>
          <pattern id="milGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10252b1a" stroke-width="1" />
          </pattern>
          <marker id="routeArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#9c3b32" />
          </marker>
        </defs>
        <rect width="640" height="450" fill="#e7e3d5" />
        <rect width="640" height="450" fill="url(#milGrid)" />
        <!-- Terrain Contours & River Nam Rom -->
        <path d="M 480,0 Q 430,150 380,260 T 340,450" fill="none" stroke="#476a7b66" stroke-width="8" />
        <text x="362" y="428" fill="#476a7b" font-size="10" font-weight="700" font-family="sans-serif">Sông Nậm Rốm</text>
        <!-- Enemy Fire Cone from D1/Him Lam -->
        <ellipse cx="320" cy="300" rx="130" ry="88" fill="#9c3b3214" stroke="#9c3b3244" stroke-dasharray="5,5" />
        <text x="242" y="272" fill="#9c3b3299" font-size="9" font-weight="800" letter-spacing="1">VÙNG QUAN SÁT &amp; PHÁO KÍCH TỪ ĐỒI D1</text>
        <text x="16" y="24" fill="#10252b" font-size="10" font-weight="800" letter-spacing="1.4">BÌNH ĐỒ HÀNH LANG HẬU CẦN ĐIỆN BIÊN (TỶ LỆ MÔ PHỎNG)</text>
      `;

      // Base dashed network edges
      kit.logisticsEdges.forEach(e => {
        const a = tel.nodeMap[e.from];
        const b = tel.nodeMap[e.to];
        if (!a || !b) return;
        const isHighlighted = (e.from === currentTipId && reachableNext.has(e.to)) || (e.to === currentTipId && reachableNext.has(e.from));
        svgHtml += `
          <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
            stroke="${isHighlighted ? '#c69a47' : '#10252b38'}"
            stroke-width="${isHighlighted ? '2.5' : '1.5'}"
            stroke-dasharray="${e.safe ? 'none' : '5,4'}" />
          <text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 5}" text-anchor="middle" fill="#47585d" font-size="9" font-weight="700">${e.dist}km</text>
        `;
      });

      // Active Drawn Route Polyline
      if (selectedRoute.length > 1) {
        for (let i = 0; i < selectedRoute.length - 1; i++) {
          const a = tel.nodeMap[selectedRoute[i]];
          const b = tel.nodeMap[selectedRoute[i + 1]];
          if (a && b) {
            svgHtml += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#9c3b32" stroke-width="4" marker-end="url(#routeArrow)" />`;
          }
        }
      }

      // 8 Nodes
      kit.logisticsNodes.forEach(n => {
        const stepPos = selectedRoute.indexOf(n.id);
        const isVisited = stepPos !== -1;
        const isCurrent = n.id === currentTipId;
        const isReachable = reachableNext.has(n.id);
        const isDanger = n.risk >= 40;

        let fill = '#faf8f1';
        let stroke = '#10252b';
        let textFill = '#0a1418';

        if (isCurrent) {
          fill = '#9c3b32';
          stroke = '#0a1418';
          textFill = '#ffffff';
        } else if (isVisited) {
          fill = '#486d5d';
          stroke = '#0a1418';
          textFill = '#ffffff';
        } else if (isReachable) {
          fill = '#e5c985';
          stroke = '#9c3b32';
        } else if (isDanger) {
          fill = '#fbeae8';
          stroke = '#9c3b32';
        }

        svgHtml += `
          <g class="lg-node-group" data-lg-node="${n.id}">
            ${isReachable ? `<circle cx="${n.x}" cy="${n.y}" r="22" fill="none" stroke="#9c3b32" stroke-width="1.5" stroke-dasharray="3,3" />` : ''}
            <circle class="lg-node-circle" cx="${n.x}" cy="${n.y}" r="15" fill="${fill}" stroke="${stroke}" stroke-width="2" />
            <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" fill="${textFill}" font-size="10" font-weight="800">${n.code}</text>
            <rect x="${n.x - 52}" y="${n.y + 18}" width="104" height="17" rx="2" fill="#faf8f1ee" stroke="#10252b30" stroke-width="0.7" />
            <text x="${n.x}" y="${n.y + 30}" text-anchor="middle" fill="#0a1418" font-size="9.5" font-weight="700">${n.short}</text>
          </g>
        `;
      });

      svgBoard.innerHTML = svgHtml;

      svgBoard.querySelectorAll('[data-lg-node]').forEach(g => {
        g.addEventListener('click', () => {
          const clickedId = g.getAttribute('data-lg-node');
          const tip = selectedRoute[selectedRoute.length - 1];
          if (clickedId === tip) return;
          if (selectedRoute.includes(clickedId)) {
            showToastNotice('Trạm này đã có trong lộ trình. Bấm "Hoàn tác" nếu muốn đổi hướng.');
            return;
          }
          if (!findEdge(tip, clickedId)) {
            showToastNotice(`Không có đường nối trực tiếp từ ${tip} sang ${clickedId}. Hãy chọn trạm có viền nối!`);
            return;
          }
          if (window.SiteAudio) window.SiteAudio.playClick();
          selectedRoute.push(clickedId);
          renderLogisticsBoard();
        });
      });

      const routeStr = selectedRoute.join(' → ');
      telemetryBar.innerHTML = `
        <div class="rt-stat">
          <span>Lộ trình đã vạch (${selectedRoute.length} trạm)</span>
          <strong>${routeStr}</strong>
        </div>
        <div class="rt-stat">
          <span>Tổng quãng đường</span>
          <strong>${tel.totalDist} km</strong>
        </div>
        <div class="rt-stat">
          <span>An toàn chiến thuật</span>
          <strong style="color:${tel.safetyScore >= 75 ? '#486d5d' : '#9c3b32'}">${tel.safetyScore}%</strong>
        </div>
        <div class="rt-diagnosis">${tel.diagnosis}</div>
      `;
    }

    const btnUndo = document.getElementById('btnRouteUndo');
    const btnClear = document.getElementById('btnRouteClear');
    const btnOptimal = document.getElementById('btnRouteOptimal');
    const btnApplyRoute = document.getElementById('btnApplyRouteToForm');

    if (btnUndo) {
      btnUndo.addEventListener('click', () => {
        if (selectedRoute.length > 1) {
          if (window.SiteAudio) window.SiteAudio.playClick();
          selectedRoute.pop();
          renderLogisticsBoard();
        }
      });
    }
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        selectedRoute = ['N1'];
        renderLogisticsBoard();
      });
    }
    if (btnOptimal) {
      btnOptimal.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        selectedRoute = ['N1', 'N2', 'N3', 'N5', 'N7', 'N8'];
        renderLogisticsBoard();
        showToastNotice('Đã hiển thị tuyến mẫu tối ưu qua rừng Mường Phăng & giao thông hào!');
      });
    }
    if (btnApplyRoute) {
      btnApplyRoute.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const tel = computeRouteTelemetry(selectedRoute);
        const routeTextarea = document.getElementById('subRouteSummary');
        const sitSelect = document.getElementById('subSituation');
        if (sitSelect && kit.situationCards[activeSitIdx]) {
          sitSelect.selectedIndex = activeSitIdx;
        }
        if (routeTextarea) {
          routeTextarea.value = `Tuyến vạch: ${selectedRoute.join(' → ')} (${tel.totalDist} km, An toàn ${tel.safetyScore}%). ` +
            `Tính toán Xe thồ: tải ${latestBikeStats.effectiveLoad} kg/xe → cần ${latestBikeStats.bikeTrips} chuyến cho ${latestBikeStats.tons} tấn gạo (gấp ${latestBikeStats.multiplier}× gánh bộ).`;
        }
        activateWbTab('submit');
        showToastNotice('Đã chép thông số tuyến & xe đạp thồ sang Phiếu nộp bài!');
      });
    }
    renderLogisticsBoard();

    // 5. Tab 03: Quick Group Submission & Google Form Integration
    const STORAGE_SUBS = 'db3d_classroom_submissions_v1';
    const STORAGE_GFORM = 'db3d_classroom_gform_url_v1';

    let paramGform = null;
    if (typeof URLSearchParams !== 'undefined' && window.location && window.location.search) {
      paramGform = new URLSearchParams(window.location.search).get('gform');
    }
    if (paramGform && /^https?:\/\//i.test(paramGform)) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_GFORM, paramGform);
      } catch (e) {}
    }

    const gformInput = document.getElementById('googleFormUrlInput');
    const btnSaveGform = document.getElementById('btnSaveGoogleFormUrl');
    const btnOpenGform = document.getElementById('btnOpenGoogleForm');

    function getSavedGformUrl() {
      try {
        return typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_GFORM) || '') : '';
      } catch (e) { return ''; }
    }

    if (gformInput) {
      gformInput.value = getSavedGformUrl();
    }
    if (btnSaveGform && gformInput) {
      btnSaveGform.addEventListener('click', () => {
        const val = gformInput.value.trim();
        if (val && !/^https?:\/\//i.test(val)) {
          showToastNotice('Link Google Form cần bắt đầu bằng https://');
          return;
        }
        try { localStorage.setItem(STORAGE_GFORM, val); } catch (e) {}
        showToastNotice(val ? 'Đã lưu link Google Form của lớp học!' : 'Đã xóa link Google Form.');
      });
    }
    if (btnOpenGform) {
      btnOpenGform.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const url = (gformInput && gformInput.value.trim()) || getSavedGformUrl();
        if (url && /^https?:\/\//i.test(url)) {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          showToastNotice('Hãy dán đường link Google Form của lớp vào ô cấu hình ngay bên dưới trước khi mở.');
          if (gformInput) gformInput.focus();
        }
      });
    }

    function loadSubmissions() {
      try {
        const raw = localStorage.getItem(STORAGE_SUBS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    function saveSubmissions(list) {
      try { localStorage.setItem(STORAGE_SUBS, JSON.stringify(list)); } catch (e) {}
    }

    function renderSubmissions() {
      const listEl = document.getElementById('submittedList');
      const countEl = document.getElementById('submittedCountBadge');
      const subs = loadSubmissions();
      if (countEl) countEl.textContent = `${subs.length} bài nộp`;
      if (!listEl) return;

      if (subs.length === 0) {
        listEl.innerHTML = `<div class="submitted-empty">Chưa có bài nộp nhóm nào được lưu trên trình duyệt này.<br/>Các nhóm nhập phiếu bên trái rồi bấm <strong>Lưu bài lên bảng trình chiếu lớp</strong> để trình bày ở Bước 4.</div>`;
        return;
      }

      listEl.innerHTML = subs.map((item, idx) => `
        <div class="submitted-item">
          <div class="submitted-item-head">
            <strong>${escapeHtml(item.groupName)}</strong>
            <small>${escapeHtml(item.timestamp)}</small>
          </div>
          <p><strong>${escapeHtml(item.situation)}</strong><br/>${escapeHtml(item.routeSummary || item.dataCollected)}</p>
          <div class="submitted-item-actions">
            <button type="button" data-proj-sub="${idx}">Chiếu lên bảng</button>
            <button type="button" data-score-sub="${idx}">Chấm Rubric</button>
            <button type="button" data-del-sub="${idx}">Xóa</button>
          </div>
        </div>
      `).join('');

      listEl.querySelectorAll('[data-proj-sub]').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = loadSubmissions()[parseInt(btn.getAttribute('data-proj-sub'), 10)];
          if (!item) return;
          createBaseModal(
            'modal-group-presentation',
            `Báo Cáo Nhóm: ${escapeHtml(item.groupName)}`,
            escapeHtml(item.situation),
            `
            <div class="spec-table">
              <div class="spec-row"><span>Thời gian nộp:</span><strong>${escapeHtml(item.timestamp)}</strong></div>
              <div class="spec-row"><span>Tình huống:</span><strong>${escapeHtml(item.situation)}</strong></div>
            </div>
            <div class="steam-box">
              <strong>1. DỮ KIỆN THU THẬP TỪ WEB 3D:</strong>
              <p>${escapeHtml(item.dataCollected || 'Chưa ghi')}</p>
            </div>
            <div class="steam-box" style="margin-top:0.85rem;">
              <strong>2. KẾT QUẢ TÍNH TOÁN &amp; TUYẾN HẬU CẦN:</strong>
              <p>${escapeHtml(item.routeSummary || 'Chưa ghi')}</p>
            </div>
            <div class="steam-box" style="margin-top:0.85rem;">
              <strong>3. LẬP LUẬN &amp; PHẢN TƯ GIỚI HẠN MÔ HÌNH:</strong>
              <p>${escapeHtml(item.justification || 'Nhóm trình bày trực tiếp khi báo cáo')}</p>
            </div>
            `
          );
        });
      });

      listEl.querySelectorAll('[data-score-sub]').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = loadSubmissions()[parseInt(btn.getAttribute('data-score-sub'), 10)];
          if (!item) return;
          const rInput = document.getElementById('rubricGroupName');
          if (rInput) rInput.value = item.groupName;
          activateWbTab('rubric');
          showToastNotice(`Đã chuyển sang chấm Rubric cho ${item.groupName}`);
        });
      });

      listEl.querySelectorAll('[data-del-sub]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-del-sub'), 10);
          const cur = loadSubmissions();
          cur.splice(idx, 1);
          saveSubmissions(cur);
          renderSubmissions();
        });
      });
    }

    const submitForm = document.getElementById('groupSubmitForm');
    if (submitForm) {
      submitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (window.SiteAudio) window.SiteAudio.playClick();
        const groupName = document.getElementById('subGroupName').value.trim();
        const situation = document.getElementById('subSituation').value;
        const dataCollected = document.getElementById('subDataCollected').value.trim();
        const routeSummary = document.getElementById('subRouteSummary').value.trim();
        const justification = document.getElementById('subJustification').value.trim();

        if (!groupName) {
          showToastNotice('Vui lòng nhập Tên nhóm / Lớp.');
          return;
        }
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} · ${now.getDate()}/${now.getMonth() + 1}`;
        const subs = loadSubmissions();
        subs.unshift({ groupName, situation, dataCollected, routeSummary, justification, timestamp: ts });
        saveSubmissions(subs);
        renderSubmissions();
        showToastNotice(`Đã lưu báo cáo của "${groupName}" lên bảng trình chiếu!`);
      });
    }

    const btnCopyReport = document.getElementById('btnCopyReport');
    if (btnCopyReport) {
      btnCopyReport.addEventListener('click', () => {
        const g = document.getElementById('subGroupName').value.trim() || 'Nhóm thực hành';
        const s = document.getElementById('subSituation').value;
        const d = document.getElementById('subDataCollected').value.trim();
        const r = document.getElementById('subRouteSummary').value.trim();
        const j = document.getElementById('subJustification').value.trim();
        const txt = `BÁO CÁO TRẢI NGHIỆM ĐIỆN BIÊN 3D & STEAM\n- Nhóm: ${g}\n- Tình huống: ${s}\n- Dữ kiện 3D: ${d}\n- Tuyến & Tính toán: ${r}\n- Lập luận & Phản tư: ${j}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(txt).then(() => showToastNotice('Đã sao chép toàn bộ báo cáo nhóm!')).catch(() => {});
        }
      });
    }
    renderSubmissions();

    // 6. Tab 04: Interactive Rubric Scorer (Bước 5 - 5 Phút)
    const rubricMatrix = document.getElementById('rubricMatrix');
    const selectedRubricScores = {}; // criterionId -> levelIndex (0..3)

    function updateRubricTotals() {
      const totalEl = document.getElementById('rubricTotalScore');
      const rankEl = document.getElementById('rubricRankLabel');
      const bdEl = document.getElementById('rubricBreakdown');
      const fbEl = document.getElementById('rubricAutoFeedback');

      let total = 0;
      let chosenCount = 0;
      const weakAreas = [];

      if (bdEl) {
        bdEl.innerHTML = kit.rubricCriteria.map(c => {
          const lvlIdx = selectedRubricScores[c.id];
          const chosen = lvlIdx !== undefined ? c.levels[lvlIdx] : null;
          if (chosen) {
            total += chosen.score;
            chosenCount++;
            if (chosen.score <= c.weight * 0.5) weakAreas.push(c.name.replace(/^\d+\.\s*/, ''));
          }
          return `<div class="score-bd-row"><span>${c.name.split(':')[0]}</span><strong>${chosen ? `${chosen.score} / ${c.weight}đ` : '—'}</strong></div>`;
        }).join('');
      }

      if (totalEl) totalEl.textContent = total.toFixed(total % 1 === 0 ? 1 : 2);

      if (rankEl) {
        if (chosenCount < kit.rubricCriteria.length) {
          rankEl.textContent = `ĐÃ CHẤM ${chosenCount}/${kit.rubricCriteria.length} TIÊU CHÍ`;
        } else if (total >= 8.5) {
          rankEl.textContent = 'XUẤT SẮC · MÔ HÌNH CHUẨN MỰC';
        } else if (total >= 7.0) {
          rankEl.textContent = 'KHÁ TỐT · LẬP LUẬN CHẶT CHẼ';
        } else if (total >= 5.0) {
          rankEl.textContent = 'ĐẠT YÊU CẦU · CẦN BỔ SUNG DỮ LIỆU';
        } else {
          rankEl.textContent = 'CẦN LÀM LẠI · CHƯA KHỚP BẢN ĐỒ';
        }
      }

      if (fbEl) {
        if (chosenCount === 0) {
          fbEl.textContent = 'Nhấp chọn mức độ ở từng tiêu chí bên trái để tự động tổng hợp điểm và nhận xét cho nhóm báo cáo.';
        } else if (chosenCount < kit.rubricCriteria.length) {
          fbEl.textContent = `Còn ${kit.rubricCriteria.length - chosenCount} tiêu chí chưa chấm. Nhấp vào các ô bên trái để hoàn tất.`;
        } else if (weakAreas.length === 0) {
          fbEl.textContent = 'Nhóm khai thác chính xác thông số từ Tour 360°, tính toán đúng bài toán hậu cần và chọn hành lang an toàn tránh hỏa lực Đồi D1.';
        } else {
          fbEl.textContent = `Điểm mạnh: Hoàn thành đúng tiến độ 5 bước. Điểm cần cải thiện thêm: ${weakAreas.join('; ')}.`;
        }
      }
    }

    function renderRubricMatrix() {
      if (!rubricMatrix) return;
      rubricMatrix.innerHTML = kit.rubricCriteria.map(c => `
        <div class="rubric-row-block">
          <div class="rubric-row-title">
            <span>${c.name}</span>
            <span>Tối đa ${c.weight} điểm</span>
          </div>
          <div class="rubric-levels-grid">
            ${c.levels.map((lvl, lIdx) => `
              <button type="button" class="rubric-level-btn ${selectedRubricScores[c.id] === lIdx ? 'selected' : ''}" data-rcid="${c.id}" data-rlvl="${lIdx}">
                <strong>${lvl.label}</strong>
                <span>${lvl.desc}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `).join('');

      rubricMatrix.querySelectorAll('.rubric-level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.SiteAudio) window.SiteAudio.playClick();
          const cid = btn.getAttribute('data-rcid');
          const lIdx = parseInt(btn.getAttribute('data-rlvl'), 10);
          selectedRubricScores[cid] = lIdx;
          renderRubricMatrix();
          updateRubricTotals();
        });
      });
    }

    renderRubricMatrix();
    updateRubricTotals();

    const btnResetRubric = document.getElementById('btnResetRubric');
    const btnCopyRubric = document.getElementById('btnCopyRubric');
    if (btnResetRubric) {
      btnResetRubric.addEventListener('click', () => {
        Object.keys(selectedRubricScores).forEach(k => delete selectedRubricScores[k]);
        const rInput = document.getElementById('rubricGroupName');
        if (rInput) rInput.value = '';
        renderRubricMatrix();
        updateRubricTotals();
      });
    }
    if (btnCopyRubric) {
      btnCopyRubric.addEventListener('click', () => {
        const gName = (document.getElementById('rubricGroupName') && document.getElementById('rubricGroupName').value.trim()) || 'Nhóm thực hành';
        const score = document.getElementById('rubricTotalScore').textContent;
        const rank = document.getElementById('rubricRankLabel').textContent;
        const fb = document.getElementById('rubricAutoFeedback').textContent;
        const txt = `PHIẾU ĐÁNH GIÁ RUBRIC - ĐIỆN BIÊN 3D STEAM\n- Nhóm: ${gName}\n- Tổng điểm: ${score}/10 (${rank})\n- Nhận xét: ${fb}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(txt).then(() => showToastNotice('Đã sao chép kết quả chấm Rubric!')).catch(() => {});
        }
      });
    }

    // 7. Print A3 Map & Student Worksheet Kit Generator
    const btnPrintKit = document.getElementById('btnPrintClassroomKit');
    if (btnPrintKit) {
      btnPrintKit.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const printWin = window.open('', '_blank', 'width=1100,height=800');
        if (!printWin) {
          showToastNotice('Trình duyệt đang chặn cửa sổ bật lên. Vui lòng cho phép pop-up để in Bộ học cụ A3.');
          return;
        }

        const svgCopy = document.getElementById('logisticsSvgBoard') ? document.getElementById('logisticsSvgBoard').outerHTML : '';
        printWin.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Bộ Học Cụ In Giấy A3 &amp; Phiếu Học Tập — Điện Biên 3D STEAM</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: "Times New Roman", Georgia, serif; color: #0a1418; margin: 0; padding: 0; line-height: 1.45; }
    .print-page { page-break-after: always; border: 1.5px solid #0a1418; padding: 14px 18px; }
    .print-page:last-child { page-break-after: auto; }
    .p-head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0a1418; padding-bottom: 8px; margin-bottom: 12px; }
    .p-head h1 { font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 0.04em; }
    .p-head small { font-size: 11px; color: #364549; }
    .p-map-grid { display: grid; grid-template-columns: 1.4fr 0.6fr; gap: 16px; align-items: start; }
    .p-map-box { border: 1px solid #0a1418; }
    .p-map-box svg { width: 100%; height: auto; display: block; }
    .p-notes h3 { margin: 0 0 8px; font-size: 14px; border-bottom: 1px solid #0a1418; padding-bottom: 4px; }
    .p-notes ul { margin: 0; padding-left: 16px; font-size: 12px; }
    .p-notes li { margin-bottom: 6px; }
    .p-fill-line { border-bottom: 1px dotted #0a1418; height: 22px; margin-bottom: 6px; }
    .p-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .p-card { border: 1px solid #0a1418; padding: 10px 12px; font-size: 11.5px; }
    .p-card strong { display: block; font-size: 13px; margin-bottom: 4px; color: #9c3b32; }
    .p-worksheet { margin-top: 12px; border: 1px solid #0a1418; padding: 12px; font-size: 12px; }
    .p-ws-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 8px; }
    @media print {
      .no-print { display: none !important; }
    }
    .no-print-bar { background: #0a1418; color: #e5c985; padding: 10px 18px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 13px; margin-bottom: 12px; }
    .no-print-bar button { background: #e5c985; color: #0a1418; border: 0; padding: 7px 14px; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print no-print-bar">
    <span><strong>CHẾ ĐỘ IN HỌC CỤ A3 / A4:</strong> Chọn khổ giấy <strong>A3 Ngang</strong> (Landscape) trong hộp thoại in để bản đồ nét chuẩn nhất.</span>
    <button onclick="window.print()">In Ngay / Lưu PDF</button>
  </div>

  <!-- Trang 1: Bản đồ Tuyến hậu cần A3 -->
  <section class="print-page">
    <div class="p-head">
      <div>
        <h1>Bản Đồ Tuyến Hậu Cần Mô Phỏng · Chiến Dịch Điện Biên Phủ</h1>
        <small>Gói trải nghiệm "Điện Biên 3D – Di Sản Số &amp; STEAM" · Truy cập tư liệu 3D tại dienbiendisanso.vercel.app</small>
      </div>
      <div style="text-align:right; font-size:12px;">
        <strong>NHÓM: ............................</strong><br/>
        <span>Lớp: .............. (THPT Nguyễn Du)</span>
      </div>
    </div>
    <div class="p-map-grid">
      <div class="p-map-box">${svgCopy}</div>
      <div class="p-notes">
        <h3>HƯỚNG DẪN THỰC HÀNH TRÊN GIẤY</h3>
        <ul>
          <li><strong>Bước 1 (Khám phá 3D):</strong> Truy cập Tour 360° tại <em>Mường Phăng</em> (tìm chiều dài hầm) và <em>Đồi A1</em> (tìm khối thuốc nổ &amp; hầm chữ chi).</li>
          <li><strong>Bước 2 (Vạch tuyến):</strong> Dùng bút màu đỏ vạch tuyến đường vận chuyển gạo từ <strong>N1 (Kho Pha Đin)</strong> tới <strong>N8 (Trận địa A1)</strong> tránh vùng pháo kích Đồi D1.</li>
          <li><strong>Bước 3 (Ghi thông số tuyến chọn):</strong></li>
        </ul>
        <div style="margin-top:8px; font-size:12px;">
          Lộ trình (VD: N1 → ...): <div class="p-fill-line"></div>
          Tổng quãng đường (km): <div class="p-fill-line"></div>
          Tổng số lượt xe đạp thồ: <div class="p-fill-line"></div>
          Lượng gạo thực nhận (kg): <div class="p-fill-line"></div>
          Lý do chọn đường này: <div class="p-fill-line"></div><div class="p-fill-line"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Trang 2: Bộ 4 Thẻ Tình Huống & Phiếu học tập nhóm -->
  <section class="print-page">
    <div class="p-head">
      <h1>Bộ 4 Thẻ Tình Huống Hậu Cần &amp; Phiếu Thu Hoạch Nhóm</h1>
      <small>Cắt rời 4 thẻ phát cho các nhóm hoặc thảo luận theo phân công (15–20 phút)</small>
    </div>
    <div class="p-cards-grid">
      ${kit.situationCards.map(c => `
        <div class="p-card">
          <strong>${c.id} · ${c.title}</strong>
          <p style="margin:3px 0;">${c.context}</p>
          <ul style="margin:4px 0; padding-left:15px;">
            ${c.dataPoints.map(dp => `<li>${dp}</li>`).join('')}
          </ul>
          <p style="margin:4px 0 0;"><em>Nhiệm vụ:</em> ${c.task}</p>
        </div>
      `).join('')}
    </div>
    <div class="p-worksheet">
      <strong>PHIẾU GHI DỮ LIỆU THU THẬP TỪ WEB 3D (MƯỜNG PHĂNG – ĐỒI A1 – ĐỒI D1):</strong>
      <div class="p-ws-grid">
        <div>
          • Đường hầm xuyên núi Mường Phăng dài: .................... m<br/>
          • Đường hầm chữ chi Đồi A1 dài: .................... m · Thuốc nổ: .................... kg TNT
        </div>
        <div>
          • Độ cao Đồi D1 so với lòng chảo: .................... m · Kỷ lục xe thồ: .................... kg/xe<br/>
          • Giới hạn mô hình khi áp dụng thực tế: <div class="p-fill-line"></div>
        </div>
      </div>
    </div>
  </section>
</body>
</html>`);
        printWin.document.close();
      });
    }
  }

  // --- 8. INITIALIZE EVERYTHING ON DOM READY ---
  function init() {
    try { cacheElements(); } catch (err) { console.error('cacheElements error:', err); }
    try { initHeroSparks(); } catch (err) { console.error('initHeroSparks error:', err); }
    try { init3DCardTilt(); } catch (err) { console.error('init3DCardTilt error:', err); }
    try { initCounterAnimation(); } catch (err) { console.error('initCounterAnimation error:', err); }
    try { initScrollReveal(); } catch (err) { console.error('initScrollReveal error:', err); }
    try { initBackToTop(); } catch (err) { console.error('initBackToTop error:', err); }
    try { initTourViewer(); } catch (err) { console.error('initTourViewer error:', err); }
    try { initTacticalMap(); } catch (err) { console.error('initTacticalMap error:', err); }
    try { initRouteModals(); } catch (err) { console.error('initRouteModals error:', err); }
    try { initPhaseModals(); } catch (err) { console.error('initPhaseModals error:', err); }
    try { initGalleryLightbox(); } catch (err) { console.error('initGalleryLightbox error:', err); }
    try { initSteamLab(); } catch (err) { console.error('initSteamLab error:', err); }
    try { initClassroomKit(); } catch (err) { console.error('initClassroomKit error:', err); }
    try { initHeaderNav(); } catch (err) { console.error('initHeaderNav error:', err); }

    try { updateTourView(currentTourIdx, false); } catch (err) { console.error('updateTourView error:', err); }
    try { updateHotspot(currentHotspotIdx, false); } catch (err) { console.error('updateHotspot error:', err); }

    console.log('Điện Biên 3D Interactive Engine initialized successfully!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
