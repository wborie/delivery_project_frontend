import React, { Component } from 'react';

import MapTypePage from './components/MapTypePage';
import CreateMapPage from './components/CreateMapPage';
import CreateMapFromImagePage from './components/CreateMapFromImagePage';
import SelectMapPage from './components/SelectMapPage';

class App extends Component {

  constructor() {
    super();
    this.state = {component: "mapTypePage"};
  }

  setComponent(newComponent) {
    this.setState({component: newComponent});
  }

  render() {
    let MainContent = <div />;
    switch(this.state.component) {
      case "mapTypePage":
        MainContent = <MapTypePage setComponent={this.setComponent.bind(this)}/>;
        break;
      case "createMapPage":
        MainContent = <CreateMapPage />;
        break;
      case "createMapFromImagePage":
        MainContent = <CreateMapFromImagePage />;
        break;
      case "selectMapPage":
        MainContent = <SelectMapPage />;
        break;
      default:
        MainContent = <MapTypePage setComponent={this.setComponent.bind(this)}/>;
        break;
    }
    // TODO: remove, for development only
    MainContent = <CreateMapPage />;
    return (
      <div>
        <div className="DOP-Title-Container">
          <h1 className="DOP-Page-Title">Delivery Optimization Project</h1>
        </div>
        {MainContent}
      </div>
    );
  }
}

export default App;
