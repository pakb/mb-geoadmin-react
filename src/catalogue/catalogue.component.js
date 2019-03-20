import React, { Component } from "react";

import CatalogueLayer from "./catalogue-layer.component";
import CatalogueTopic from "./catalogue-topic.component";

import "./catalogue.css";

export function createCategorieElement(child, handleOnCatalogueLayerClick) {
  if (child.category === "topic") {
    return (
      <CatalogueTopic
        topic={child}
        handleOnCatalogueLayerClick={handleOnCatalogueLayerClick}
      />
    );
  } else if (child.category === "layer") {
    return (
      <CatalogueLayer layer={child} handleClick={handleOnCatalogueLayerClick} />
    );
  } else {
    return null;
  }
}

export default class Catalogue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layers: []
    };
  }

  render = () => {
    if (this.props.catalogue) {
      let elements = this.props.catalogue.children.map(rootChild => {
        return createCategorieElement(
          rootChild,
          this.props.handleOnCatalogueLayerClick
        );
      });
      return <div className="catalogue">{elements}</div>;
    } else {
      return <div>Loading...</div>;
    }
  };
}
