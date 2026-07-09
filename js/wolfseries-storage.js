(function (global) {
  'use strict';

  function localKey(category, field) {
    return 'wolfseries-' + field + '-' + category;
  }

  function getLocal(category, field) {
    try {
      return localStorage.getItem(localKey(category, field));
    } catch (_) {
      return null;
    }
  }

  function setLocal(category, field, value) {
    try {
      localStorage.setItem(localKey(category, field), value);
    } catch (_) {}
  }

  function loadChampionData(category) {
    return {
      name: getLocal(category, 'nombre'),
      points: getLocal(category, 'puntos'),
      photoUrl: getLocal(category, 'foto')
    };
  }

  function saveChampionName(category, name) {
    setLocal(category, 'nombre', name);
  }

  function saveChampionPoints(category, points) {
    setLocal(category, 'puntos', points);
  }

  function saveChampionPhotoUrl(category, url) {
    setLocal(category, 'foto', url);
  }

  async function fetchLeaderPhotoUrl(category) {
    var response = await fetch(
      '/api/upload-leader-photo?classification=' + encodeURIComponent(category)
    );

    if (!response.ok) {
      throw new Error('No se pudo obtener la foto del líder');
    }

    var data = await response.json();
    return data.url || null;
  }

  async function uploadLeaderPhoto(category, file) {
    var formData = new FormData();
    formData.append('file', file);
    formData.append('classification', category);

    var response = await fetch('/api/upload-leader-photo', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      var payload = null;
      try {
        payload = await response.json();
      } catch (_) {}
      throw new Error((payload && payload.error) || 'No se pudo subir la foto');
    }

    var data = await response.json();
    if (!data.url) {
      throw new Error('La API no devolvió una URL');
    }

    saveChampionPhotoUrl(category, data.url);
    return data.url;
  }

  global.WolfSeriesStorage = {
    loadChampionData: loadChampionData,
    saveChampionName: saveChampionName,
    saveChampionPoints: saveChampionPoints,
    saveChampionPhotoUrl: saveChampionPhotoUrl,
    fetchLeaderPhotoUrl: fetchLeaderPhotoUrl,
    uploadLeaderPhoto: uploadLeaderPhoto
  };
})(window);
