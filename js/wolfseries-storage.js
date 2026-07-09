(function (global) {
  'use strict';

  var SUPABASE_URL = 'https://kkgujlnkrazsqwsjlvon.supabase.co';
  var SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ3VqbG5rcmF6c3F3c2psdm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2ODAwNTEsImV4cCI6MjA5ODI1NjA1MX0.8sO3kUC29_Hn3zS6BDatM3S0z4QC0-FQFX62XwWofVQ';
  var BUCKET = 'athlete-documents';

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

  function leaderPhotoPath(category) {
    return 'wolfseries/lider-' + category + '.jpg';
  }

  function publicLeaderPhotoUrl(category) {
    return (
      SUPABASE_URL +
      '/storage/v1/object/public/' +
      BUCKET +
      '/' +
      leaderPhotoPath(category)
    );
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

  async function remotePhotoExists(url) {
    try {
      var response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      return response.ok;
    } catch (_) {
      return false;
    }
  }

  async function fetchLeaderPhotoUrl(category) {
    var url = publicLeaderPhotoUrl(category);
    var exists = await remotePhotoExists(url);
    return exists ? url : null;
  }

  async function uploadLeaderPhoto(category, file) {
    var path = leaderPhotoPath(category);
    var endpoint =
      SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + path;

    var response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
        apikey: SUPABASE_ANON_KEY,
        'x-upsert': 'true',
        'Content-Type': file.type || 'image/jpeg'
      },
      body: file
    });

    if (!response.ok) {
      var message = 'No se pudo subir la foto';
      try {
        var payload = await response.json();
        if (payload && (payload.error || payload.message)) {
          message = payload.error || payload.message;
        }
      } catch (_) {}
      throw new Error(message);
    }

    var url = publicLeaderPhotoUrl(category) + '?t=' + Date.now();
    saveChampionPhotoUrl(category, url);
    return url;
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
