import React from "react";
import ReactDOM from "react-dom";

import DeckGLMap from "./deckgl-map.component";
import Menu from "./menu/menu.component";

import CatalogueService from "./services/catalogue.service";
import LayerService from "./services/layer.service";

import "./styles.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      catalogue: null,
      visibleLayers: []
    };
  }

  componentDidMount = () => {
    Promise.all([
      CatalogueService.getCatalogue(),
      LayerService.getLayers()
    ]).then(([catalogue, layers]) => {
      this.setState({
        catalogue: catalogue,
        visibleLayers: LayerService.getVisibleLayers()
      });
    });
  };

  handleOnCatalogueLayerClick = (event, catalogueLayer) => {
    const layer = LayerService.getLayerForId(catalogueLayer.layerBodId);
    if (!layer) {
      console.log(
        "Error, no layer found for bod ID " + catalogueLayer.layerBodId
      );
      return;
    }
    catalogueLayer.show = !catalogueLayer.show;
    if (catalogueLayer.show) {
      LayerService.addVisibleLayer(catalogueLayer.layerBodId);
    } else {
      LayerService.hideVisibleLayer(catalogueLayer.layerBodId);
    }
    this.setState({
      visibleLayers: LayerService.getVisibleLayers()
    });
  };

  handleLayerOpacityChanged = (layer, newOpacity) => {
    layer.opacity = newOpacity;
    this.forceUpdate();
  };

  handleRemoveLayerFromHighlight = (layer) => {
    LayerService.removeLayerIfVisible(layer);
    const catalogueItem = CatalogueService.getCatalogueItemForLayerId(layer.id);
    catalogueItem.show = false;
    this.setState({
      visibleLayers: LayerService.getVisibleLayers()
    })
  }

  handleRaiseVisibleLayerOrder = (layer) => {
    LayerService.raiseVisibleLayerOrder(layer);
    this.setState({
      visibleLayers: LayerService.getVisibleLayers()
    })
  }

  handleLowerVisibleLayerOrder = (layer) => {
    LayerService.lowerVisibleLayerOrder(layer);
    this.setState({
      visibleLayers: LayerService.getVisibleLayers()
    })
  }

  handleLayerToggleShow = (layer) => {
    const visibleLayer = LayerService.getVisibleLayer(layer.id);
    visibleLayer.show = !visibleLayer.show;
    const catalogueItem = CatalogueService.getCatalogueItemForLayerId(layer.id);
    catalogueItem.show = visibleLayer.show;
    this.setState({
      visibleLayers: LayerService.getVisibleLayers()
    })
  }

  render = () => {
    return (
      <div className="App">
        <Menu
          catalogue={this.state.catalogue}
          visibleCatalogueItems={this.state.visibleCatalogueItems}
          handleOnCatalogueLayerClick={this.handleOnCatalogueLayerClick}
          handleLayerOpacityChanged={this.handleLayerOpacityChanged}
          handleRemoveLayerFromHighlight={this.handleRemoveLayerFromHighlight}
          handleRaiseVisibleLayerOrder={this.handleRaiseVisibleLayerOrder}
          handleLowerVisibleLayerOrder={this.handleLowerVisibleLayerOrder}
          handleLayerToggleShow={this.handleLayerToggleShow}
        />
        <DeckGLMap visibleLayers={this.state.visibleLayers} />
      </div>
    );
  };
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
