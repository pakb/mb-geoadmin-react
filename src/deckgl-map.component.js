import React, { Component } from "react";
import { StaticMap } from "react-map-gl";
import DeckGL, { HexagonLayer } from "deck.gl";
import * as d3 from "d3"

import "mapbox-gl/dist/mapbox-gl.css"

const MAPBOX_STYLE_URL_WITH_BUILDINGS =
  "https://tileserver.int.bgdi.ch/gl-styles/ch.swisstopo.leichte-basiskarte.vt/v006_3d/style.json";

  const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

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
      showBuildings: false,
      showHeatmap: false,
      baseStyleJson: undefined,
      styleJsonWithBuildings: undefined,
      viewport: {},
      layerData: undefined,
      elevationScale: 5,
      radius: 1000,
      coverage: 0.9,
      maxElevation: 1000,
      lastZoomLevel: 0
    };
  }

  componentDidMount = () => {
    fetch(MAPBOX_STYLE_URL_WITH_BUILDINGS)
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

  onClick = (event) => {
    console.log('click at', event.lngLat)
  };

  getLayers = () => {
    if (this.state.showHeatmap && this.state.layerData) {
      const {radius = 1000, upperPercentile = 100, coverage = 1} = this.state;
      const data = this.state.layerData;
      console.log('radius :', radius)
      return [new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data,
        elevationRange: [10, this.state.maxElevation],
        elevationScale: this.state.elevationScale,
        extruded: true,
        getPosition: d => d,
        opacity: 0.3,
        radius,
        upperPercentile
      })]
    } else {
      return [];
    }
  };

  _onMapLoad = () => {
    const mapbox = this.staticMap.getMap();
    mapbox.setLight({color: "#fff", intensity: 0.8, position: [1.15, 135, 45]});
  };

  render() {
    const { viewState, controller = true } = this.props;
    if (this.state.baseStyleJson) {
      let heatmapControls = null;
      if (this.state.showHeatmap) {
        heatmapControls = (<>
          <br/>
          <div className="heatmap-controls">
            Radius ({this.state.radius}) : <input type="range" min="10" max="2000" step="10" value={this.state.radius} onChange={(e) => { this.setState({ radius: e.target.value }) }}></input><br/>
            Max elevation ({this.state.maxElevation}) : <input type="range" min="10" max="3000" step="10" value={this.state.maxElevation} onChange={(e) => { this.setState({ maxElevation: e.target.value }) }}></input><br/>
            Coverage ({this.state.coverage}) : <input type="range" min="0.1" max="1" step="0.1" value={this.state.coverage} onChange={(e) => { this.setState({ coverage: e.target.value }) }}></input><br/>
          </div>
        </>);
      }
      return (
        <div>
          <div className="colloquium-menu">
            With UK car accidents : <input type="checkbox" value={this.state.showHeatmap} onClick={(e) => this.setState({ showHeatmap: !this.state.showHeatmap })}></input>
            { heatmapControls }
          </div>
          <DeckGL
            initialViewState={this.state.viewport}
            viewState={viewState}
            controller={controller}
            onClick={ (info, allInfos, event) => this.onClick(info, allInfos, event) }
            layers={this.getLayers()}
          >
            <StaticMap
              ref={staticMap => this.staticMap = staticMap}
              reuseMaps
              mapStyle={ this.state.baseStyleJson }
              preventStyleDiffing={true}
              onLoad={this._onMapLoad}
            />
          </DeckGL>
        </div>
      );
    } else {
      return <div>Loading ...</div>;
    }
  }
}
