import React, { Component } from "react";

import { createCategorieElement } from "./catalogue.component";

export default class CatalogueItemList extends Component {
  render = () => {
    let items = [];
    this.props.items.forEach(child => {
      items.push(
        createCategorieElement(child, this.props.handleOnCatalogueLayerClick)
      );
    });
    return <div className="catalogue-list">{items}</div>;
  };
}
