// Interactive Engine for Dien Bien 3D - STEAM Heritage Lab
(function() {
  'use strict';

  // State Management
  let currentTourIdx = 5; // Default: Tri ân 02 (Him Lam - index 5) as in original
  let currentFilter = 'all';
  let currentHotspotIdx = 0; // Default: H01 Him Lam
  let visitedHotspots = new Set(['H01']);
  let isMapJourneyMode = true;
  let isPage0Active = true;

  // DOM Elements cache
  const el = {};

  function cacheElements() {
    el.slide0 = document.getElementById('slide0-overlay');
    el.copyrightCard = document.getElementById('copyrightCard');
    el.floatingReopen = document.getElementById('floatingReopen');
    el.closeBtn = document.getElementById('closeBtn');
    el.reopenBtn = document.getElementById('reopenBtn');
    el.startBtn = document.getElementById('startBtn');
    el.quickEnterBtn = document.getElementById('quickEnterBtn');
    
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
    el.btnReloadTour = document.querySelector('.viewer-actions button:first-child');
    el.btnFullscreenTour = document.querySelector('.viewer-actions button:last-child');
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

  // --- 1. SLIDE 0 / PAGE 0 CONTROLLER ---
  function initSlide0() {
    if (!el.slide0) return;

    function enterMainSite() {
      if (window.SiteAudio) window.SiteAudio.playSuccess();
      el.slide0.classList.add('slide0-exit');
      setTimeout(() => {
        el.slide0.style.display = 'none';
        isPage0Active = false;
        document.body.classList.remove('lock-scroll');
      }, 500);
    }

    if (el.closeBtn) {
      el.closeBtn.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        if (el.copyrightCard) el.copyrightCard.style.display = 'none';
        if (el.floatingReopen) el.floatingReopen.style.display = 'flex';
      });
    }

    if (el.reopenBtn) {
      el.reopenBtn.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        if (el.copyrightCard) el.copyrightCard.style.display = 'block';
        if (el.floatingReopen) el.floatingReopen.style.display = 'none';
      });
    }

    if (el.startBtn) el.startBtn.addEventListener('click', enterMainSite);
    if (el.quickEnterBtn) el.quickEnterBtn.addEventListener('click', enterMainSite);

    // Keyboard support: Enter / Space / ArrowRight
    window.addEventListener('keydown', (e) => {
      if (!isPage0Active) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        enterMainSite();
      }
    });

    // Copy buttons
    document.querySelectorAll('.copy-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-copy');
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            if (window.SiteAudio) window.SiteAudio.playClick();
            const originalText = btn.textContent;
            btn.textContent = 'ĐÃ CHÉP';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.textContent = originalText;
              btn.classList.remove('copied');
            }, 2000);
          });
        }
      });
    });
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
    const extLink = document.querySelector('.viewer-help a');
    if (extLink) extLink.href = data.externalUrl;
  }

  function initTourViewer() {
    // Arrow stepper buttons
    if (el.btnPrevTour) {
      el.btnPrevTour.addEventListener('click', () => {
        let prev = currentTourIdx - 1;
        if (prev < 0) prev = window.TOURS_DATA.length - 1;
        updateTourView(prev);
      });
    }

    if (el.btnNextTour) {
      el.btnNextTour.addEventListener('click', () => {
        let next = (currentTourIdx + 1) % window.TOURS_DATA.length;
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
              card.style.display = 'inline-flex';
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

    // Reload button
    if (el.btnReloadTour) {
      el.btnReloadTour.disabled = false;
      el.btnReloadTour.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playRadar();
        if (el.viewerCover) {
          el.viewerCover.classList.add('scanning-flash');
          setTimeout(() => el.viewerCover.classList.remove('scanning-flash'), 600);
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
          frame.requestFullscreen ? frame.requestFullscreen() : frame.webkitRequestFullscreen();
        } else {
          document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
        }
      });
    }

    // Play tour 360 viewer button
    if (el.playTourBtn) {
      el.playTourBtn.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playRadar();
        openPanoramaModal(window.TOURS_DATA[currentTourIdx]);
      });
    }
  }

  // --- 3. PANORAMA 360° INTERACTIVE MODAL ---
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
      let startX = 0, currentPanX = 0;
      let currentZoom = 1;

      viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - currentPanX;
        viewport.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentPanX = e.clientX - startX;
        img.style.transform = `scale(${currentZoom}) translateX(${currentPanX * 0.4}px)`;
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
        viewport.style.cursor = 'grab';
      });

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
        img.style.transform = `scale(1) translateX(0px)`;
      });

      modal.querySelector('#close-pano-modal').addEventListener('click', () => {
        modal.classList.remove('modal-open');
      });
      modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        modal.classList.remove('modal-open');
      });
    }

    modal.querySelector('#pano-modal-title').textContent = tour.title;
    modal.querySelector('#pano-image').src = tour.image;
    modal.querySelector('#pano-coords').textContent = tour.coords;
    modal.querySelector('#pano-steam-info').innerHTML = `<strong>LIÊN HỆ STEAM:</strong> ${tour.steamLink}`;
    modal.querySelector('#pano-external-btn').href = tour.externalUrl;
    modal.classList.add('modal-open');
  }

  // --- 4. TACTICAL MAP & HOTSPOTS CONTROLLER (#map) ---
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
        if (idx === index) {
          pin.classList.add('active');
          pin.setAttribute('aria-selected', 'true');
        } else {
          pin.classList.remove('active');
          pin.removeAttribute('aria-selected');
        }
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
  }

  function initTacticalMap() {
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
    const routeBtns = document.querySelectorAll('.route-chapters button');
    if (routeBtns.length >= 4) {
      // 0: Mở Mường Phăng
      routeBtns[0].addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        openGeneralDossierModal();
      });

      // 1: So sánh A1 – D1
      routeBtns[1].addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        openCompareA1D1Modal();
      });

      // 2: Đến Thành Bản Phủ
      routeBtns[2].addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        openBanPhuHeritageModal();
      });

      // 3: Bắt đầu tuyến tri ân
      routeBtns[3].addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        openMemorialRouteModal();
      });
    }
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
      });
      modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        modal.classList.remove('modal-open');
      });
    } else {
      modal.querySelector('.modal-body').innerHTML = contentHtml;
    }
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

  // --- 7. HEADER & NAVIGATION CONTROLLER ---
  function initHeaderNav() {
    if (el.menuToggle && el.mainNav) {
      el.menuToggle.addEventListener('click', () => {
        if (window.SiteAudio) window.SiteAudio.playClick();
        const expanded = el.menuToggle.getAttribute('aria-expanded') === 'true';
        el.menuToggle.setAttribute('aria-expanded', !expanded);
        el.mainNav.classList.toggle('nav-open');
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

    // Audio mute toggle button
    const audioToggle = document.getElementById('audio-toggle-btn');
    if (audioToggle) {
      audioToggle.addEventListener('click', () => {
        if (window.SiteAudio) {
          const muted = window.SiteAudio.toggleMute();
          audioToggle.setAttribute('title', muted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng');
          audioToggle.classList.toggle('muted', muted);
        }
      });
    }
  }

  // --- 8. INITIALIZE EVERYTHING ON DOM READY ---
  function init() {
    cacheElements();
    initSlide0();
    initTourViewer();
    initTacticalMap();
    initRouteModals();
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
