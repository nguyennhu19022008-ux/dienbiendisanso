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
    el.btnPrevTour = document.querySelector('.tour-stepper button[aria-label="Tour trước"]');
    el.btnNextTour = document.querySelector('.tour-stepper button[aria-label="Tour tiếp theo"]');
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
      el.btnPrevTour.addEventListener('click', () => {
        let prev = currentTourIdx;
        do {
          prev = (prev - 1 + window.TOURS_DATA.length) % window.TOURS_DATA.length;
        } while (currentFilter !== 'all' && window.TOURS_DATA[prev].catKey !== currentFilter && prev !== currentTourIdx);
        updateTourView(prev);
      });
    }

    if (el.btnNextTour) {
      el.btnNextTour.addEventListener('click', () => {
        let next = currentTourIdx;
        do {
          next = (next + 1) % window.TOURS_DATA.length;
        } while (currentFilter !== 'all' && window.TOURS_DATA[next].catKey !== currentFilter && next !== currentTourIdx);
        updateTourView(next);
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
    function activateLive3DTour() {
      if (window.SiteAudio) window.SiteAudio.playRadar();
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
      el.viewerCover.addEventListener('click', activateLive3DTour);
    }

    // Play tour 360 viewer button
    if (el.playTourBtn) {
      el.playTourBtn.addEventListener('click', (e) => {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        if (window.SiteAudio) window.SiteAudio.playRadar();
        openPanoramaModal(window.TOURS_DATA[currentTourIdx]);
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
                <td>+49 mét (ngang tầm mắt hầm chỉ huy)</td>
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
            <div class="sim-readouts">
              <div class="sim-readout"><span>Lực lượng dân công:</span><strong>261.453 người (hơn 12 triệu ngày công)</strong></div>
              <div class="sim-readout"><span>Gạo vận chuyển tới đích:</span><strong>25.056 tấn</strong></div>
              <div class="sim-readout"><span>Kỷ lục xe đạp thồ:</span><strong>352 kg / 1 xe (dân công Ma Văn Thắng)</strong></div>
              <div class="sim-readout"><span>Khối thuốc nổ hầm A1:</span><strong>960 kg TNT (sức nổ thổi bay 13m đất đá)</strong></div>
            </div>
            <div class="steam-box" style="margin-top:1rem;">
              <strong>MỐI LIÊN HỆ TOÁN HỌC:</strong>
              <p>Mỗi kg gạo đưa được vào lòng chảo đòi hỏi người tiếp tế phải ăn tiêu thụ trung bình 4kg gạo trên đường đi. Để giải bài toán vận tải này, ông cha ta đã sáng chế ra xe đạp thồ tăng năng suất gấp 10-15 lần gánh bộ.</p>
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
          const h = parseInt(e.target.value);
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

    // Global ESC key listener to close open modals and mobile menu
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
      }
    });
  }

  // --- 8. INITIALIZE EVERYTHING ON DOM READY ---
  function init() {
    cacheElements();
    initHeroSparks();
    init3DCardTilt();
    initCounterAnimation();
    initScrollReveal();
    initBackToTop();
    initTourViewer();
    initTacticalMap();
    initRouteModals();
    initPhaseModals();
    initGalleryLightbox();
    initSteamLab();
    initHeaderNav();

    // Set initial tour (Tri ân 02 - Him Lam, index 5)
    updateTourView(currentTourIdx, false);
    // Set initial hotspot (H01 Him Lam, index 0)
    updateHotspot(currentHotspotIdx, false);

    console.log('Điện Biên 3D Interactive Engine initialized successfully!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
