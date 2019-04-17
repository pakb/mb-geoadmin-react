import React, { Component } from "react";
import { StaticMap } from "react-map-gl";
import DeckGL, { HexagonLayer } from "deck.gl";

import cloneDeep from "lodash/cloneDeep";
import * as d3 from "d3"
import { Slide } from "@material-ui/core";

const MAPBOX_STYLE_URL =
  "http://tileserver.int.bgdi.ch/gl-styles/ch.swisstopo.leichte-basiskarte.vt/v006_3d/style.json";

  const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

  const LIGHT_SETTINGS = {
    lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
    ambientRatio: 0.4,
    diffuseRatio: 0.6,
    specularRatio: 0.2,
    lightsStrength: [0.8, 0.0, 0.8, 0.0],
    numberOfLights: 2
  };
  const colorRange = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78]
  ];

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
      visibleLayers: props.visibleLayers,
      layerData: undefined,
      elevationScale: 5,
      radius: 10,
      coverage: 0.9,
      maxElevation: 1000,
      lastZoomLevel: 0
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
    fetch(DATA_URL)
    .then(res => res.text())
    .then(text => d3.csvParse(text))
    .then(csv => {
      console.log('response', csv);
      this.setState({
        layerData: csv.map(d => [Number(d.lng), Number(d.lat)])
      })
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

  onClick = (info, allInfos, event) => {
    const lonlat = this.staticMap.getMap().unproject([event.offsetX, event.offsetY]);
    console.log('click at', lonlat)
  };

  getLayers = () => {
    if (this.state.layerData) {
      const {radius = 10, upperPercentile = 100, coverage = 0.9} = this.state;
      console.log('radius', radius);
      const data = this.state.layerData;
      return [new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data,
        elevationRange: [10, this.state.maxElevation],
        elevationScale: this.state.elevationScale,
        extruded: true,
        getPosition: d => d,
        //lightSettings: LIGHT_SETTINGS,
        onHover: this.props.onHover,
        opacity: 0.1,
        pickable: Boolean(this.props.onHover),
        radius,
        upperPercentile
      })]
    } else {
      return [];
    }
  };

  _onMapLoad = () => {
    const mapbox = this.staticMap.getMap();
    mapbox.setLight({color: "#fff", intensity: 1, position: [1.15, 135, 45]});
    this.setState({lastZoomLevel: mapbox.getZoom()});
    mapbox.on('zoom', () => {
      const zoomLevel = mapbox.getZoom();
      this.setState({lastZoomLevel: zoomLevel});
      setTimeout(() => {
        if (this.state.lastZoomLevel === zoomLevel) {
          const newRadius = (zoomLevel * 1000.0) / Math.pow(2, zoomLevel - 5);
          this.setState({
            radius: newRadius,
            maxElevation: Math.min(newRadius * (33.0 / zoomLevel), 20000),
            coverage: zoomLevel > 12 ? 0.5 : 0.9
          })
        }
      }, 400)
    })
  };

  render() {
    const { viewState, controller = true } = this.props;
    // const directionalLight= new SunLight({
    //   timestamp: Date.now(), 
    //   color: [255, 0, 0],
    //   intensity: 1
    // });
    if (this.state.baseStyleJson) {
      return (
        <div>
          <DeckGL
            initialViewState={this.state.viewport}
            viewState={viewState}
            // effects={[directionalLight]}
            controller={controller}
            onLayerClick={ (info, allInfos, event) => this.onClick(info, allInfos, event) }
            layers={this.getLayers()}
          >
            <StaticMap
              ref={staticMap => this.staticMap = staticMap}
              reuseMaps
              mapStyle={this.buildStyleWithVisibleLayers(
                this.state.baseStyleJson
              )}
              preventStyleDiffing={false}
              onLoad={this._onMapLoad}
            />
          </DeckGL>
          <div id="heatmap-controls">
            max elev. ({this.state.maxElevation}) <input type="range" min="1" max="20000" step="10" value={this.state.maxElevation} onChange={(event) => this.setState({maxElevation: event.target.value})}></input>
            elev. scale ({this.state.elevationScale}) <input type="range" min="0.1" max="10" step="0.1" value={this.state.elevationScale} onChange={(event) => this.setState({elevationScale: event.target.value})}></input>
          </div>
        </div>
      );
    } else {
      return <div>Loading ...</div>;
    }
  }
}
