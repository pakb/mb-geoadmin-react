import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";

import CatalogueService from "../services/catalogue.service";

export default class VisibleLayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layer: props.layer,
      showLayerProperties: false
    };
  }

  toggleLayerProperties = e => {
    this.setState({
      showLayerProperties: !this.state.showLayerProperties
    });
    e.preventDefault();
    e.stopPropagation();
  };

  render = () => {
    const layer = this.state.layer;
    const catalogueItem = CatalogueService.getCatalogueItemForLayerId(layer.id);
    let layerProperties = null;
    if (this.state.showLayerProperties) {
      layerProperties = (
        <div className="layer-properties">
          <Typography>Opacity</Typography>
          <Slider
            aria-labelledby="label"
            min={0}
            max={1}
            step={0.05}
            value={layer.opacity}
            onChange={(_, value) => this.props.handleLayerOpacityChanged(this.state.layer, value)}
          />
          <Typography>
            Position
            &nbsp;
            <i className="fas fa-angle-up" onClick={_ => this.props.handleRaiseVisibleLayerOrder(layer)}></i>
            &nbsp;
            <i className="fas fa-angle-down" onClick={_ => this.props.handleLowerVisibleLayerOrder(layer)}></i>
          </Typography>
        </div>
      );
    }
    return (
      <div className="visible-layer">
        <Typography>
          <i className="fas fa-times-circle" onClick={_ => this.props.handleRemoveLayerFromHighlight(layer)} />
          &nbsp;
          <i className={"far " + (layer.show ? "fa-check-square" : "fa-square")} onClick={_ => this.props.handleLayerToggleShow(layer)} />
          &nbsp;
          {catalogueItem ? catalogueItem.label : null}
          <span onClick={e => this.toggleLayerProperties(e, layer)}>
            &nbsp;
            <i className="fas fa-cog" />
          </span>
        </Typography>
        {layerProperties}
      </div>
    );
  };
}
