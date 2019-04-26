import React from "react";
import ReactDOM from "react-dom";

import DeckGLMap from "./deckgl-map.component";

import "./styles.css";

class App extends React.Component {

  render = () => {
    return (
      <div className="App">
        <DeckGLMap />
      </div>
    );
  };
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
