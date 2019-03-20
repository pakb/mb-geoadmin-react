import React, { Component } from "react";
import { StaticMap } from "react-map-gl";
import DeckGL from "deck.gl";
import cloneDeep from "lodash/cloneDeep";

const MAPBOX_STYLE_URL =
  "https://vectortiles.geo.admin.ch/gl-styles/ch.swisstopo.leichte-basiskarte.vt/v006/style.json";

export default class DeckGLMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      baseStyleJson: undefined,
      styleWithVisibleLayers: undefined,
      styleJsonConfig: {
        lastLayerIdBeforeLabels: "boundary_"
      },
      viewport: {},
      visibleLayers: props.visibleLayers
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ visibleLayers: nextProps.visibleLayers });
  }

  componentDidMount = () => {
    fetch(MAPBOX_STYLE_URL)
      .then(res => res.json())
      .then(data => {
        this.setState({
          baseStyleJson: data,
          viewport: {
            latitude: data.center[1],
            longitude: data.center[0],
            zoom: data.zoom
          }
        });
      });
  };

  buildStyleWithVisibleLayers = styleJson => {
    if (styleJson) {
      let styleWithVisibleLayers = cloneDeep(styleJson);
      let indexWhereToInsert = styleWithVisibleLayers.layers.length - 1;
      styleWithVisibleLayers.layers.forEach((layer, index) => {
        if (layer.id === this.state.styleJsonConfig.lastLayerIdBeforeLabels) {
          indexWhereToInsert = index;
        }
      });
      this.state.visibleLayers.forEach(layer => {
        if (!layer.show) {
          return;
        }
        if (layer.type === "wmts") {
          let timestamp = "current";
          if (layer.timestamps && layer.timestamps.length > 0) {
            if (layer.timeEnabled || layer.timestamps.length === 1) {
              timestamp = layer.timestamps[0];
            }
          }
          styleWithVisibleLayers.sources[layer.id] = {
            type: "raster",
            tiles: [
              "https://wmts5.geo.admin.ch/1.0.0/" +
                layer.id +
                "/default/" +
                timestamp +
                "/3857/{z}/{x}/{y}." +
                layer.format
            ],
            tileSize: 256
          };
        } else if (layer.type === "wms") {
          styleWithVisibleLayers.sources[layer.id] = {
            type: "raster",
            tiles: [
              "https://wms4.geo.admin.ch/?service=WMS&version=1.3.0&request=GetMap&format=image/png&transparent=true&layers=" +
                layer.id +
                "&lang=en&width=256&height=256&crs=EPSG:3857&style=&bbox={bbox-epsg-3857}"
            ],
            tileSize: 256
          };
        } else if (layer.type === "geojson") {
          styleWithVisibleLayers.sources[layer.id] = {
            type: "geojson",
            data: layer.geojsonUrl
          };
          console.log("geojsonUrl", layer.geojsonUrl, layer);
        } else {
          console.log(
            "layer " + layer.id + " has an unsupported type " + layer.type
          );
        }
        if (layer.type === "wmts" || layer.type === "wms") {
          styleWithVisibleLayers.layers.splice(indexWhereToInsert, 0, {
            id: "layer_" + layer.id,
            type: "raster",
            source: layer.id,
            paint: {
              "raster-opacity": layer.opacity
            }
          });
        } else if (layer.type === "geojson") {
          styleWithVisibleLayers.layers.splice(indexWhereToInsert, 0, {
            id: "layer_" + layer.id,
            type: "fill",
            source: layer.id,
            paint: {
              "fill-color": "rgb(0, 255, 0)",
              "fill-opacity": layer.opacity
            }
          });
        }
      });
      return styleWithVisibleLayers;
    }
  };

  render() {
    const { viewState, controller = true } = this.props;
    if (this.state.baseStyleJson) {
      return (
        <DeckGL
          initialViewState={this.state.viewport}
          viewState={viewState}
          controller={controller}
        >
          <StaticMap
            reuseMaps
            mapStyle={this.buildStyleWithVisibleLayers(
              this.state.baseStyleJson
            )}
            preventStyleDiffing={false}
          />
        </DeckGL>
      );
    } else {
      return <div>Loading ...</div>;
    }
  }
}
