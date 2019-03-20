import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

import CatalogueItemList from "./catalogue-item-list.component";

export default class CatalogueTopic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topic: props.topic,
      show: props.topic.show
    };
  }

  handleTopicClick = event => {
    this.setState({
      show: !this.state.show
    });
  };

  render = () => {
    const topic = this.state.topic;
    if (!topic) {
      return null;
    }
    const wrappedChildren = (
      <div className="catalogue-topic-children" key={"children_" + topic.label}>
        <CatalogueItemList
          items={topic.children}
          handleOnCatalogueLayerClick={this.props.handleOnCatalogueLayerClick}
        />
      </div>
    );
    return (
      <>
        <div
          className="catalogue-topic"
          key={"topic_" + topic.label}
          onClick={this.handleTopicClick}
        >
          <Typography>
            <i
              className={
                "fa " + (this.state.show ? "fa-angle-down" : "fa-angle-right")
              }
            />{" "}
            {topic.label}
          </Typography>
        </div>
        {this.state.show ? wrappedChildren : null}
      </>
    );
  };
}
