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
    }
    this.setState({
      visibleLayers: LayerService.getVisibleLayers()
    });
  };

  handleLayerOpacityChanged = (layer, newOpacity) => {
    layer.opacity = newOpacity;
    this.forceUpdate();
  };

  render = () => {
    return (
      <div className="App">
        <Menu
          catalogue={this.state.catalogue}
          visibleCatalogueItems={this.state.visibleCatalogueItems}
          handleOnCatalogueLayerClick={this.handleOnCatalogueLayerClick}
          handleLayerOpacityChanged={this.handleLayerOpacityChanged}
        />
        <DeckGLMap visibleLayers={this.state.visibleLayers} />
      </div>
    );
  };
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
