(function () {
  'use strict';

  const EXPORT_W = 1080;
  const EXPORT_H = 1350;
  const IMAGE_BASE = 'images/wolfseries/';
  const STORAGE_PREFIX = 'ws-champion-';

  const CATEGORIES = {
    general: {
      color: '#DAA520',
      label: 'Líder General',
      icon: 'wolf',
      file: 'lider-general.jpg',
      defaultName: 'Matías Medel',
      defaultPoints: '53'
    },
    montana: {
      color: '#E24B4A',
      label: 'Rey de la Montaña',
      icon: 'mountain',
      file: 'lider-montana.jpg',
      defaultName: 'Matías Medel',
      defaultPoints: '41'
    },
    volantes: {
      color: '#1D9E75',
      label: 'Metas Volantes',
      icon: 'bolt',
      file: 'lider-volantes.jpg',
      defaultName: 'Matías Medel',
      defaultPoints: '10'
    },
    combativo: {
      color: '#D85A30',
      label: 'Más Combativo',
      icon: 'claw',
      file: 'mas-combativo.jpg',
      defaultName: 'Sergio Vargas',
      defaultPoints: ''
    },
    corredor: {
      color: '#C0C0C0',
      label: 'Corredor de la Fecha',
      icon: 'wolf',
      file: 'corredor-fecha.jpg',
      defaultName: 'Pato Otarola',
      defaultPoints: ''
    }
  };

  function storageKey(category, field) {
    return `${STORAGE_PREFIX}${category}-${field}`;
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  function drawImageCover(ctx, img, x, y, w, h) {
    const ir = img.width / img.height;
    const r = w / h;
    let sw, sh, sx, sy;
    if (ir > r) {
      sh = img.height;
      sw = sh * r;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / r;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function drawIcon(ctx, icon, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    const scale = size / 24;
    ctx.scale(scale, scale);
    ctx.translate(-12, -12);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';

    if (icon === 'wolf') {
      ctx.beginPath();
      ctx.moveTo(3, 3);
      ctx.lineTo(9, 7);
      ctx.lineTo(12, 5);
      ctx.lineTo(15, 7);
      ctx.lineTo(21, 3);
      ctx.lineTo(19, 10);
      ctx.bezierCurveTo(19, 16, 16, 21, 12, 21);
      ctx.bezierCurveTo(8, 21, 5, 16, 5, 10);
      ctx.closePath();
      ctx.fill();
    } else if (icon === 'mountain') {
      ctx.beginPath();
      ctx.moveTo(2, 20);
      ctx.lineTo(8, 9);
      ctx.lineTo(12, 15);
      ctx.lineTo(15, 10);
      ctx.lineTo(22, 20);
      ctx.closePath();
      ctx.fill();
    } else if (icon === 'bolt') {
      ctx.beginPath();
      ctx.moveTo(13, 2);
      ctx.lineTo(5, 13);
      ctx.lineTo(10, 13);
      ctx.lineTo(9, 22);
      ctx.lineTo(19, 9);
      ctx.lineTo(13, 9);
      ctx.closePath();
      ctx.fill();
    } else {
      [7, 12, 17].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 3);
        ctx.bezierCurveTo(x + 1, 8, x + 1, 15, x, 21);
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    words.forEach(word => {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function parsePoints(value) {
    if (value === '' || value == null) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  function renderChampionFrame(ctx, w, h, photo, category, name, points) {
    const cfg = CATEGORIES[category] || CATEGORIES.general;

    ctx.fillStyle = '#0B0B0D';
    ctx.fillRect(0, 0, w, h);

    if (photo) {
      drawImageCover(ctx, photo, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#141416';
      ctx.fillRect(0, 0, w, h);
    }

    const shade = ctx.createLinearGradient(0, h, 0, h * 0.42);
    shade.addColorStop(0, 'rgba(0,0,0,0.94)');
    shade.addColorStop(0.55, 'rgba(0,0,0,0.5)');
    shade.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = cfg.color;
    ctx.fillRect(0, 0, w, 6);

    const badgePadX = 18;
    const badgePadY = 10;
    const badgeIconSize = 16;
    const badgeFontSize = 22;
    const badgeGap = 8;
    ctx.font = `700 ${badgeFontSize}px Inter, sans-serif`;
    const badgeTextW = ctx.measureText(cfg.label).width;
    const badgeW = badgePadX * 2 + badgeIconSize + badgeGap + badgeTextW;
    const badgeH = badgePadY * 2 + badgeFontSize;
    const badgeX = 28;
    const badgeY = 24;

    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
    ctx.fillStyle = cfg.color;
    ctx.fill();
    drawIcon(ctx, cfg.icon, badgeX + badgePadX + badgeIconSize / 2, badgeY + badgeH / 2, badgeIconSize);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(cfg.label, badgeX + badgePadX + badgeIconSize + badgeGap, badgeY + badgeH / 2);

    const posLabel = '1°';
    const posFontSize = 24;
    const posPadX = 16;
    const posPadY = 8;
    ctx.font = `700 ${posFontSize}px Inter, sans-serif`;
    const posW = ctx.measureText(posLabel).width + posPadX * 2;
    const posH = posFontSize + posPadY * 2;
    const posX = w - 28 - posW;
    const posY = 24;

    roundRect(ctx, posX, posY, posW, posH, posH / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(posLabel, posX + posW / 2, posY + posH / 2);

    const bottomPad = 44;
    const nameSize = 26;
    const displayName = (name || '').trim() || 'Ciclista';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${nameSize}px Inter, sans-serif`;
    const nameLines = wrapText(ctx, displayName, w - bottomPad * 2);
    const nameBlockH = nameLines.length * nameSize * 1.2;
    const nameY = h - bottomPad - 36 - nameBlockH + nameSize;
    nameLines.forEach((line, i) => {
      ctx.fillText(line, bottomPad, nameY + i * nameSize * 1.2);
    });

    const metaY = h - bottomPad;
    const pointsSize = 20;
    const parsed = parsePoints(points);

    if (parsed !== null) {
      const ptsText = `${parsed} pts`;
      ctx.font = `600 ${pointsSize}px Inter, sans-serif`;
      ctx.fillStyle = cfg.color;
      ctx.fillText(ptsText, bottomPad, metaY);
      const ptsW = ctx.measureText(ptsText).width;
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `500 ${pointsSize}px Inter, sans-serif`;
      ctx.fillText(' · CyclingWolf Series 2026', bottomPad + ptsW, metaY);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `500 ${pointsSize}px Inter, sans-serif`;
      ctx.fillText('CyclingWolf Series 2026', bottomPad, metaY);
    }

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 52px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('CW', w - 36, h - 32);
    ctx.restore();
  }

  function renderToCanvas(canvas, photo, category, name, points) {
    canvas.width = EXPORT_W;
    canvas.height = EXPORT_H;
    renderChampionFrame(canvas.getContext('2d'), EXPORT_W, EXPORT_H, photo, category, name, points);
  }

  function photoUrl(category) {
    return `${IMAGE_BASE}${CATEGORIES[category].file}`;
  }

  function loadPhoto(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function getStored(category, field, fallback) {
    try {
      const value = localStorage.getItem(storageKey(category, field));
      return value != null ? value : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function setStored(category, field, value) {
    try {
      localStorage.setItem(storageKey(category, field), value);
    } catch (_) {}
  }

  function syncMeta(card, name, points) {
    const nameEl = card.querySelector('.ws-champion-name');
    const roleEl = card.querySelector('.ws-champion-role');
    if (nameEl) nameEl.textContent = name.trim() || 'Ciclista';
    if (roleEl && points !== '' && points != null) {
      const cfg = CATEGORIES[card.dataset.championCategory];
      roleEl.textContent = `${cfg.label} · ${points} pts`;
    }
  }

  async function refreshCard(card) {
    const category = card.dataset.championCategory;
    const cfg = CATEGORIES[category];
    const canvas = card.querySelector('.ws-champion-canvas');
    const downloadBtn = card.querySelector('.ws-download-btn');
    const nameInput = card.querySelector('.ws-name-input');
    const pointsInput = card.querySelector('.ws-points-input');

    const name = nameInput ? nameInput.value : getStored(category, 'name', cfg.defaultName);
    const points = pointsInput ? pointsInput.value : getStored(category, 'points', cfg.defaultPoints);
    const customPhoto = getStored(category, 'photo', '');

    renderToCanvas(canvas, null, category, name, points);

    let photo = null;
    if (customPhoto) {
      photo = await loadPhoto(customPhoto);
    }
    if (!photo) {
      photo = await loadPhoto(photoUrl(category));
    }

    renderToCanvas(canvas, photo, category, name, points);
    if (downloadBtn) downloadBtn.hidden = false;
    syncMeta(card, name, points);
  }

  function bindCard(card) {
    const category = card.dataset.championCategory;
    const cfg = CATEGORIES[category];
    const nameInput = card.querySelector('.ws-name-input');
    const pointsInput = card.querySelector('.ws-points-input');
    const uploadInput = card.querySelector('.ws-upload-input');
    const downloadBtn = card.querySelector('.ws-download-btn');

    if (nameInput) {
      nameInput.value = getStored(category, 'name', cfg.defaultName);
      nameInput.addEventListener('input', () => {
        setStored(category, 'name', nameInput.value);
        refreshCard(card);
      });
    }

    if (pointsInput) {
      pointsInput.value = getStored(category, 'points', cfg.defaultPoints);
      pointsInput.addEventListener('input', () => {
        setStored(category, 'points', pointsInput.value);
        refreshCard(card);
      });
    }

    if (uploadInput) {
      uploadInput.addEventListener('change', () => {
        const file = uploadInput.files && uploadInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          setStored(category, 'photo', reader.result);
          refreshCard(card);
        };
        reader.readAsDataURL(file);
        uploadInput.value = '';
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const canvas = card.querySelector('.ws-champion-canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = cfg.file.replace(/\.jpg$/i, '.png');
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  }

  async function init() {
    const cards = document.querySelectorAll('.ws-champion-card');
    cards.forEach(bindCard);
    await Promise.all(Array.from(cards).map(refreshCard));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
