import React, { Component } from "react";

import Catalogue from "../catalogue/catalogue.component";
import VisibleLayer from "./visiblelayers.component";
import LayerService from "../services/layer.service";

import "./menu.css";

export default class Menu extends Component {
  render = () => {
    let visibleLayersComponents = [];
    const visibleLayers = LayerService.getVisibleLayers();
    if (visibleLayers) {
      visibleLayers.forEach(layer => {
        visibleLayersComponents.push(
          <VisibleLayer
            layer={layer}
            key={layer.id}
            handleLayerOpacityChanged={this.props.handleLayerOpacityChanged}
            handleRemoveLayerFromHighlight={this.props.handleRemoveLayerFromHighlight}
            handleRaiseVisibleLayerOrder={this.props.handleRaiseVisibleLayerOrder}
            handleLowerVisibleLayerOrder={this.props.handleLowerVisibleLayerOrder}
            handleLayerToggleShow={this.props.handleLayerToggleShow}
          />
        );
      });
    }

    return (
      <div className="menu">
        <Catalogue
          catalogue={this.props.catalogue}
          handleOnCatalogueLayerClick={this.props.handleOnCatalogueLayerClick}
        />
        {visibleLayersComponents.length > 0 ? (
          <>
            <h4>Visible layers</h4>
            {visibleLayersComponents}
          </>
        ) : null}
      </div>
    );
  };
}
