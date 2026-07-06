(function () {
  'use strict';

  const EXPORT_W = 1080;
  const EXPORT_H = 1350;
  const IMAGE_BASE = 'images/wolfseries/';

  const CATEGORY_FILES = {
    general: 'lider-general-2026.png',
    montana: 'rey-montana-2026.png',
    volantes: 'metas-volantes-2026.png',
    combativo: 'mas-combativo-2026.png',
    corredor: 'corredor-fecha-2026.png'
  };

  const FRAME_CONFIG = {
    general: { border: '#FFD700', title: 'Líder General 2026', pattern: 'gold' },
    montana: { border: '#D42B2B', title: 'Rey de la Montaña 2026', pattern: 'polka' },
    volantes: { border: '#2EBD6B', title: 'Campeón Metas Volantes 2026', pattern: 'green' },
    combativo: { border: '#FF5722', title: 'Más Combativo', pattern: 'fire' },
    corredor: { border: '#C0C0C0', title: 'Corredor de la Fecha', pattern: 'silver' }
  };

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

  function drawPolkaDots(ctx, w, h, border, color) {
    ctx.save();
    const step = border * 1.1;
    for (let x = step / 2; x < w; x += step) {
      ctx.beginPath();
      ctx.arc(x, border / 2, border * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, h - border / 2, border * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let y = step; y < h - step; y += step) {
      ctx.beginPath();
      ctx.arc(border / 2, y, border * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w - border / 2, y, border * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFireGlow(ctx, w, h, border, color) {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(255,87,34,0.5)');
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, 'rgba(255,152,0,0.5)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = border;
    roundRect(ctx, border / 2, border / 2, w - border, h - border, border * 0.6);
    ctx.stroke();
  }

  function drawCWLogo(ctx, x, y, size) {
    roundRect(ctx, x, y, size, size, size * 0.22);
    ctx.fillStyle = '#D42B2B';
    ctx.fill();
    ctx.font = `${size * 0.52}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐺', x + size / 2, y + size / 2 + size * 0.04);
  }

  function renderChampionFrame(ctx, w, h, photo, category, name) {
    const cfg = FRAME_CONFIG[category] || FRAME_CONFIG.general;
    const border = Math.round(Math.min(w, h) * 0.028);
    const pad = border * 1.2;
    const photoTop = pad + border;
    const bottomBar = Math.round(h * 0.22);
    const photoH = h - photoTop - bottomBar - pad;
    const photoW = w - pad * 2 - border;
    const photoX = pad + border / 2;
    const innerR = border * 0.5;

    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    roundRect(ctx, photoX, photoTop, photoW, photoH, innerR);
    ctx.clip();
    if (photo) {
      drawImageCover(ctx, photo, photoX, photoTop, photoW, photoH);
    } else {
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(photoX, photoTop, photoW, photoH);
      ctx.fillStyle = 'rgba(242,242,240,0.08)';
      ctx.font = `600 ${Math.round(w * 0.12)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷', w / 2, photoTop + photoH / 2 - w * 0.02);
    }
    const shade = ctx.createLinearGradient(0, photoTop, 0, photoTop + photoH);
    shade.addColorStop(0, 'rgba(0,0,0,0.55)');
    shade.addColorStop(0.25, 'rgba(0,0,0,0.05)');
    shade.addColorStop(0.65, 'rgba(0,0,0,0.1)');
    shade.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = shade;
    ctx.fillRect(photoX, photoTop, photoW, photoH);
    ctx.restore();

    const barY = h - bottomBar - pad;
    const barGrad = ctx.createLinearGradient(0, barY, 0, h);
    barGrad.addColorStop(0, '#1c1c1c');
    barGrad.addColorStop(1, '#0e0e0e');
    ctx.fillStyle = barGrad;
    ctx.fillRect(pad, barY, w - pad * 2, bottomBar + pad);

    ctx.strokeStyle = cfg.border;
    ctx.lineWidth = border;
    if (cfg.pattern === 'fire') {
      drawFireGlow(ctx, w, h, border, cfg.border);
    } else {
      roundRect(ctx, border / 2, border / 2, w - border, h - border, border * 0.6);
      ctx.stroke();
    }
    if (cfg.pattern === 'polka') drawPolkaDots(ctx, w, h, border, cfg.border);
    if (cfg.pattern === 'gold') {
      ctx.strokeStyle = 'rgba(255,215,0,0.25)';
      ctx.lineWidth = border * 0.4;
      roundRect(ctx, border * 1.2, border * 1.2, w - border * 2.4, h - border * 2.4, border * 0.5);
      ctx.stroke();
    }

    const logoSize = Math.round(w * 0.1);
    drawCWLogo(ctx, w - logoSize - pad - border, photoTop + pad, logoSize);

    const titleSize = Math.round(w * 0.028);
    ctx.textAlign = 'left';
    ctx.fillStyle = cfg.border;
    ctx.font = `600 ${titleSize}px Inter, sans-serif`;
    wrapText(ctx, cfg.title, w - pad * 4 - logoSize).forEach((line, i) => {
      ctx.fillText(line, pad + border, photoTop + pad + titleSize + i * (titleSize * 1.35));
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#F2F2F0';
    const nameSize = Math.round(w * 0.065);
    ctx.font = `700 ${nameSize}px Inter, sans-serif`;
    const displayName = name || 'Ciclista';
    const nameLines = wrapText(ctx, displayName, w - pad * 4);
    const nameBlockH = nameLines.length * nameSize * 1.15;
    const nameStartY = barY + (bottomBar - nameBlockH) / 2 + nameSize * 0.85;
    nameLines.forEach((line, i) => {
      ctx.fillText(line, w / 2, nameStartY + i * nameSize * 1.15);
    });

    ctx.font = `500 ${Math.round(w * 0.022)}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(242,242,240,0.45)';
    ctx.fillText('CyclingWolf Series 2026', w / 2, h - pad - border * 0.5);
  }

  function renderToCanvas(canvas, photo, category, name) {
    canvas.width = EXPORT_W;
    canvas.height = EXPORT_H;
    renderChampionFrame(canvas.getContext('2d'), EXPORT_W, EXPORT_H, photo, category, name);
  }

  function exportPng(photo, category, name) {
    const off = document.createElement('canvas');
    renderToCanvas(off, photo, category, name);
    return off.toDataURL('image/png');
  }

  async function loadManifest() {
    try {
      const res = await fetch(`${IMAGE_BASE}manifest.json?t=${Date.now()}`);
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  }

  function imageUrl(filename, version) {
    const v = version ? `?v=${encodeURIComponent(version)}` : `?t=${Date.now()}`;
    return `${IMAGE_BASE}${filename}${v}`;
  }

  function setStatus(card, message, isError) {
    const el = card.querySelector('.ws-upload-status');
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = message;
    el.classList.toggle('error', !!isError);
  }

  function showSavedImage(card, src) {
    const img = card.querySelector('.ws-champion-img');
    const canvas = card.querySelector('.ws-champion-canvas');
    img.src = src;
    img.hidden = false;
    canvas.hidden = true;
    const dl = card.querySelector('.ws-download-btn');
    if (dl) dl.hidden = false;
  }

  function showPlaceholder(card, category, name) {
    const img = card.querySelector('.ws-champion-img');
    const canvas = card.querySelector('.ws-champion-canvas');
    img.hidden = true;
    canvas.hidden = false;
    renderToCanvas(canvas, null, category, name);
    const dl = card.querySelector('.ws-download-btn');
    if (dl) dl.hidden = true;
  }

  async function tryLoadSavedImage(card, category, manifest) {
    const name = card.dataset.leaderName;
    const filename = CATEGORY_FILES[category];
    const entry = manifest[category];
    const version = entry?.updated;
    const src = imageUrl(filename, version);

    return new Promise(resolve => {
      const probe = new Image();
      probe.onload = () => {
        showSavedImage(card, src);
        resolve(true);
      };
      probe.onerror = () => {
        showPlaceholder(card, category, name);
        resolve(false);
      };
      probe.src = src;
    });
  }

  async function saveToHosting(category, dataUrl, leaderName) {
    const res = await fetch('/api/wolfseries-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, image: dataUrl, leaderName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo guardar la imagen');
    return data;
  }

  function bindCard(card) {
    const category = card.dataset.championCategory;
    const name = card.dataset.leaderName;
    const fileInput = card.querySelector('.ws-champion-file');
    const uploadBtn = card.querySelector('.ws-upload-btn');
    const downloadBtn = card.querySelector('.ws-download-btn');
    let lastPhoto = null;
    let lastDataUrl = null;

    uploadBtn.addEventListener('click', () => fileInput.click());

    downloadBtn.addEventListener('click', () => {
      const src = card.querySelector('.ws-champion-img').src;
      if (src && !card.querySelector('.ws-champion-img').hidden) {
        const link = document.createElement('a');
        link.download = CATEGORY_FILES[category];
        link.href = src;
        link.click();
        return;
      }
      if (lastDataUrl) {
        const link = document.createElement('a');
        link.download = CATEGORY_FILES[category];
        link.href = lastDataUrl;
        link.click();
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file || !file.type.startsWith('image/')) return;

      setStatus(card, 'Procesando foto…');
      uploadBtn.disabled = true;

      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = async () => {
          lastPhoto = img;
          lastDataUrl = exportPng(img, category, name);
          showSavedImage(card, lastDataUrl);

          try {
            setStatus(card, 'Guardando en el sitio…');
            const result = await saveToHosting(category, lastDataUrl, name);
            showSavedImage(card, imageUrl(CATEGORY_FILES[category], result.updated));
            setStatus(card, 'Foto publicada correctamente.');
          } catch (err) {
            setStatus(card, 'Vista previa lista. Para publicar en el sitio configura GITHUB_TOKEN en Vercel.', true);
          } finally {
            uploadBtn.disabled = false;
            fileInput.value = '';
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function init() {
    const cards = document.querySelectorAll('.ws-champion-card');
    cards.forEach(card => {
      showPlaceholder(card, card.dataset.championCategory, card.dataset.leaderName);
      bindCard(card);
    });
    const manifest = await loadManifest();
    await Promise.all(Array.from(cards).map(card =>
      tryLoadSavedImage(card, card.dataset.championCategory, manifest)
    ));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
