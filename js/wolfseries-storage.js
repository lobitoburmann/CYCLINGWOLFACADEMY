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

  async function uploadLeaderPhoto(category, file) {
    var dataUrl = await readFileAsDataUrl(file);
    setLocal(category, 'foto', dataUrl);
    return dataUrl;
  }

  global.WolfSeriesStorage = {
    loadChampionData: loadChampionData,
    saveChampionName: saveChampionName,
    saveChampionPoints: saveChampionPoints,
    uploadLeaderPhoto: uploadLeaderPhoto
  };
})(window);
