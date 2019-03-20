const LAYERS_CONFIG_JSON_URL =
  "https://api3.geo.admin.ch/1902061519/rest/services/all/MapServer/layersConfig";

let layers = [];
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
    if (layers.length === 0) {
      fetchLayers().then(fetchedLayers => {
        layers = fetchedLayers;
        resolve(layers);
      });
    } else {
      resolve(layers);
    }
  });
}

function getLayerForId(layerId) {
  let layer = layers.filter(layer => layer.id === layerId);
  return layer ? layer[0] : null;
}

function getVisibleLayers() {
  if (visibleLayers.length === 0) {
    visibleLayers = layers.filter(l => l.highlight);
  }
  return visibleLayers;
}

function getVisibleLayer(layerOrLayerId) {
  let layerId;
  if (typeof layerOrLayerId === "string") {
    layerId = layerOrLayerId;
  } else if (typeof layerOrLayerId === "object") {
    layerId = layerOrLayerId.id;
  }
  if (!layerId) {
    return null;
  }
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
    layerId = layerOrLayerId.id;
  }
  const layer = layers.filter(layer => layer.id === layerId);
  const visibleLayerWithThisId = getVisibleLayer(layerId);
  if (visibleLayerWithThisId) {
    visibleLayerWithThisId.show = true;
  } else if (layer.length === 1) {
    const newVisibleLayer = layer[0];
    newVisibleLayer.show = true;
    newVisibleLayer.highlight = true;
    visibleLayers.push(newVisibleLayer);
    return newVisibleLayer;
  } else {
    console.log("no layer found with ", layerOrLayerId, " in ", layers);
    return undefined;
  }
}

function hideVisibleLayer(layerOrLayerId) {
  let visibleLayer = getVisibleLayer(layerOrLayerId);
  if (visibleLayer) {
    visibleLayer.show = false;
  }
}

function removeLayerIfVisible(layerOrLayerId) {
  let visibleLayer = getVisibleLayer(layerOrLayerId);
  if (visibleLayer) {
    visibleLayer.highlight = false;
    let indexOf = visibleLayers.indexOf(visibleLayer);
    visibleLayers.splice(indexOf, 1);
  }
}

function raiseVisibleLayerOrder(layer) {
  
}

function lowerVisibleLayerOrder(layer) {

}

export default {
  getLayers: getLayers,
  getLayerForId: getLayerForId,
  getVisibleLayers: getVisibleLayers,
  getVisibleLayer: getVisibleLayer,
  addVisibleLayer: addVisibleLayer,
  hideVisibleLayer: hideVisibleLayer,
  removeLayerIfVisible: removeLayerIfVisible,
  raiseVisibleLayerOrder: raiseVisibleLayerOrder,
  lowerVisibleLayerOrder: lowerVisibleLayerOrder
};
