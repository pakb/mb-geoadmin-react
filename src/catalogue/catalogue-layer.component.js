import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

import "./catalogue.css";

export default class CatalogueLayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      catalogueLayer: props.layer
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      catalogueLayer: nextProps.layer
    });
  }

  render = () => {
    const layer = this.state.catalogueLayer;
    return (
      <div
        key={layer.id}
        className="catalogue-layer"
        onClick={e => this.props.handleClick(e, layer)}
      >
        <Typography>
          <i
            className={"far " + (layer.show ? "fa-check-square" : "fa-square")}
          />
          &nbsp;
          {layer.label}
        </Typography>
      </div>
    );
  };
}
