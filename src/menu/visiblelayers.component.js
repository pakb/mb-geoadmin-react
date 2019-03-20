import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
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

  handleSliderChange = (e, value) => {
    this.props.handleLayerOpacityChanged(this.state.layer, value);
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
            onChange={this.handleSliderChange}
          />
        </div>
      );
    }
    return (
      <div className="visible-layer">
        <i
          className={
            "far " + (catalogueItem.show ? "fa-check-square" : "fa-square")
          }
        />
        &nbsp;
        {catalogueItem ? catalogueItem.label : null}
        <span onClick={e => this.toggleLayerProperties(e, layer)}>
          &nbsp;
          <i className="fas fa-cog" />
        </span>
        <span onClick={e => this.removeLayerFromHighlight(e, layer)}>
          &nbsp;
          <i className="fas fa-trash" />
        </span>
        {layerProperties}
      </div>
    );
  };
}
