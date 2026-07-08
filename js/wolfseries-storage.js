(function (global) {
  'use strict';

  var CONFIG_TABLE = 'wolfseries_config';
  var STORAGE_PREFIX = 'ws-champion-';

  function getEnv() {
    return global.WOLFSERIES_SUPABASE || {};
  }

  function isConfigured() {
    var env = getEnv();
    return Boolean(env.url && env.anonKey);
  }

  function getBucket() {
    return getEnv().bucket || 'athlete-documents';
  }

  function configKey(storageId, field) {
    return storageId + ':' + field;
  }

  function storageIdFromFile(fileName) {
    return fileName.replace(/\.jpg$/i, '');
  }

  function storagePath(fileName) {
    return 'wolfseries/' + fileName;
  }

  function localKey(category, field) {
    return STORAGE_PREFIX + category + '-' + field;
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

  function supabaseHeaders() {
    var env = getEnv();
    return {
      apikey: env.anonKey,
      Authorization: 'Bearer ' + env.anonKey,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    };
  }

  async function getRemoteValue(storageId, field) {
    if (!isConfigured()) return null;

    var env = getEnv();
    var url =
      env.url +
      '/rest/v1/' +
      CONFIG_TABLE +
      '?select=value&key=eq.' +
      encodeURIComponent(configKey(storageId, field)) +
      '&limit=1';

    var response = await fetch(url, {
      headers: {
        apikey: env.anonKey,
        Authorization: 'Bearer ' + env.anonKey
      }
    });

    if (!response.ok) return null;

    var rows = await response.json();
    if (!rows.length) return null;
    return rows[0].value;
  }

  async function setRemoteValue(storageId, field, value) {
    if (!isConfigured()) return false;

    var env = getEnv();
    var response = await fetch(env.url + '/rest/v1/' + CONFIG_TABLE, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({
        key: configKey(storageId, field),
        value: value,
        updated_at: new Date().toISOString()
      })
    });

    return response.ok;
  }

  function getPublicPhotoUrl(fileName) {
    if (!isConfigured()) return null;
    var env = getEnv();
    return (
      env.url +
      '/storage/v1/object/public/' +
      getBucket() +
      '/' +
      storagePath(fileName)
    );
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  }

  async function loadChampionData(category, fileName) {
    var storageId = storageIdFromFile(fileName);

    if (isConfigured()) {
      var results = await Promise.all([
        getRemoteValue(storageId, 'name'),
        getRemoteValue(storageId, 'points'),
        getRemoteValue(storageId, 'photo_url')
      ]);

      if (results[0] != null) setLocal(category, 'name', results[0]);
      if (results[1] != null) setLocal(category, 'points', results[1]);
      if (results[2] != null) setLocal(category, 'photo', results[2]);

      return {
        name: results[0],
        points: results[1],
        photoUrl: results[2]
      };
    }

    return {
      name: getLocal(category, 'name'),
      points: getLocal(category, 'points'),
      photoUrl: getLocal(category, 'photo')
    };
  }

  async function saveChampionName(category, fileName, name) {
    setLocal(category, 'name', name);
    if (isConfigured()) {
      await setRemoteValue(storageIdFromFile(fileName), 'name', name);
    }
  }

  async function saveChampionPoints(category, fileName, points) {
    setLocal(category, 'points', points);
    if (isConfigured()) {
      await setRemoteValue(storageIdFromFile(fileName), 'points', points);
    }
  }

  async function uploadLeaderPhoto(category, fileName, file) {
    if (!isConfigured()) {
      var dataUrl = await readFileAsDataUrl(file);
      setLocal(category, 'photo', dataUrl);
      return dataUrl;
    }

    var env = getEnv();
    var path = storagePath(fileName);
    var uploadUrl =
      env.url +
      '/storage/v1/object/' +
      getBucket() +
      '/' +
      path +
      '?upsert=true';

    var response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: env.anonKey,
        Authorization: 'Bearer ' + env.anonKey,
        'Content-Type': file.type || 'image/jpeg',
        'x-upsert': 'true'
      },
      body: file
    });

    if (!response.ok) {
      throw new Error('No se pudo subir la imagen a Supabase Storage.');
    }

    var publicUrl = getPublicPhotoUrl(fileName);
    var versionedUrl = publicUrl + '?v=' + Date.now();
    setLocal(category, 'photo', versionedUrl);
    await setRemoteValue(storageIdFromFile(fileName), 'photo_url', versionedUrl);
    return versionedUrl;
  }

  async function resolvePhotoSrc(category, fileName, savedPhotoUrl, fallbackPath) {
    if (savedPhotoUrl) return savedPhotoUrl;

    if (isConfigured()) {
      var publicUrl = getPublicPhotoUrl(fileName);
      if (publicUrl) {
        return publicUrl + '?v=' + Date.now();
      }
    }

    var localPhoto = getLocal(category, 'photo');
    if (localPhoto) return localPhoto;

    return fallbackPath;
  }

  global.WolfSeriesStorage = {
    isConfigured: isConfigured,
    loadChampionData: loadChampionData,
    saveChampionName: saveChampionName,
    saveChampionPoints: saveChampionPoints,
    uploadLeaderPhoto: uploadLeaderPhoto,
    resolvePhotoSrc: resolvePhotoSrc
  };
})(window);
