const CATALOGUE_CONFIG_JSON_URL =
  "https://api3.geo.admin.ch/1902061519/rest/services/ech/CatalogServer?lang=en";

let catalogue = null;
let catalogueFetchInProgress = null;
let catalogueLayerItems = [];

function fetchCatalogue() {
  if (!catalogueFetchInProgress) {
    catalogueFetchInProgress = fetch(CATALOGUE_CONFIG_JSON_URL)
      .then(res => res.json())
      .then(catalogueConfig => {
        return catalogueConfig.results;
      });
  }
  return catalogueFetchInProgress;
}

function findLayerItems(catalogueItem) {
  let layerItems = [];
  if (catalogueItem.category === "layer") {
    layerItems.push(catalogueItem);
  } else if (catalogueItem.children.length > 0) {
    catalogueItem.children.forEach(child => {
      layerItems = layerItems.concat(findLayerItems(child));
    });
  }
  return layerItems;
}

function getCatalogue() {
  return new Promise((resolve, reject) => {
    if (!catalogue) {
      fetchCatalogue().then(fetchedCatalogue => {
        catalogue = fetchedCatalogue.root;
        catalogueLayerItems = findLayerItems(catalogue);
        console.log("catalogue", catalogue);
        resolve(catalogue);
      });
    } else {
      resolve(catalogue);
    }
  });
}

function getCatalogueItemForLayerId(layerId) {
  let catalogueItem = null;
  catalogueLayerItems.forEach(catalogueLayerItem => {
    if (catalogueLayerItem.layerBodId === layerId) {
      catalogueItem = catalogueLayerItem;
    }
  });
  return catalogueItem;
}

function getCatalogueLayerItems() {
  return catalogueLayerItems;
}

export default {
  getCatalogue: getCatalogue,
  getCatalogueLayerItems: getCatalogueLayerItems,
  getCatalogueItemForLayerId: getCatalogueItemForLayerId
};
