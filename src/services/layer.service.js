const LAYERS_CONFIG_JSON_URL =
  "https://api3.geo.admin.ch/1902061519/rest/services/all/MapServer/layersConfig";

let layerInfos = [];
let visibleLayers = [];
let fetchingInProgress = undefined;

function fetchLayers() {
  if (!fetchingInProgress) {
    fetchingInProgress = fetch(LAYERS_CONFIG_JSON_URL)
      .then(res => res.json())
      .then(layersConfig => {
        let fetchedLayers = Object.keys(layersConfig).map(layerId => {
          let layer = layersConfig[layerId];
          layer.id = layerId;
          layer.show = false;
          layer.highlight = false;
          layer.opacity = 0.66;
          return layer;
        });
        return fetchedLayers;
      });
  }
  return fetchingInProgress;
}

function getLayers() {
  return new Promise((resolve, reject) => {
    if (layerInfos.length === 0) {
      fetchLayers().then(fetchedLayers => {
        layerInfos = fetchedLayers;
        resolve(layerInfos);
      });
    } else {
      resolve(layerInfos);
    }
  });
}

function getLayerForId(layerId) {
  let layer = layerInfos.filter(layer => layer.id === layerId);
  return layer ? layer[0] : null;
}

function getVisibleLayers() {
  if (visibleLayers.length === 0) {
    visibleLayers = layerInfos.filter(l => l.highlight);
  }
  return visibleLayers;
}

function getVisibleLayer(layerId) {
  let layer = visibleLayers.filter(aLayer => aLayer.id === layerId);
  if (layer.length === 1) {
    return layer[0];
  } else {
    return null;
  }
}

function addVisibleLayer(layerOrLayerId) {
  let layerId;
  if (typeof layerOrLayerId === "string") {
    layerId = layerOrLayerId;
  } else if (typeof layerOrLayerId === "object") {
    layerId = layerOrLayerId.layerBodId;
  }
  const layer = layerInfos.filter(layer => layer.id === layerId);
  if (layer.length === 1) {
    layer[0].highlight = true;
    visibleLayers.push(layer[0]);
    return layer;
  } else {
    console.log("no layer found with ", layerOrLayerId, " in ", layerInfos);
    return undefined;
  }
}

function removeLayerIfVisible(layerOrLayerId) {
  let layerId;
  if (typeof layerOrLayerId === "string") {
    layerId = layerOrLayerId;
  } else if (typeof layerOrLayerId === "object") {
    layerId = layerOrLayerId.layerBodId;
  }
  let visibleLayer = getVisibleLayer(layerId);
  if (visibleLayer) {
    let indexOf = visibleLayers.indexOf(visibleLayer);
    visibleLayers.splice(indexOf, 1);
  }
}

export default {
  getLayers: getLayers,
  getLayerForId: getLayerForId,
  getVisibleLayers: getVisibleLayers,
  getVisibleLayer: getVisibleLayer,
  addVisibleLayer: addVisibleLayer,
  removeLayerIfVisible: removeLayerIfVisible
};
