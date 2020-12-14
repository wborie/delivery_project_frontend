import React, { Component } from 'react';

import MapTypePage from './components/MapTypePage';
import CreateMapPage from './components/CreateMapPage';
import CreateMapFromImagePage from './components/CreateMapFromImagePage';
import SelectMapPage from './components/SelectMapPage';
import DeliveryPage from './components/DeliveryPage';

class App extends Component {

  constructor() {
    super();
    this.state = {
      component: "mapTypePage",
      current_graph_roadSectors: [],
      current_graph_intersections: [],
      current_graph_locations: []
    };
  }

  updateCurrentGraph(newGraphRoadSectors, newGraphIntersections, newGraphLocations) {
    this.setState({
      current_graph_roadSectors: newGraphRoadSectors,
      current_graph_intersections: newGraphIntersections,
      current_graph_locations: newGraphLocations
    });
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
        MainContent = <CreateMapPage
          updateCurrentGraph={this.updateCurrentGraph.bind(this)} 
          setComponent={this.setComponent.bind(this)}
        />;
        break;
      case "createMapFromImagePage":
        MainContent = <CreateMapFromImagePage />;
        break;
      case "selectMapPage":
        MainContent = <SelectMapPage 
          updateCurrentGraph={this.updateCurrentGraph.bind(this)} 
          setComponent={this.setComponent.bind(this)}
        />;
        break;
      case "deliveryPage":
        MainContent = <DeliveryPage 
          current_graph_roadSectors={this.state.current_graph_roadSectors}
          current_graph_intersections={this.state.current_graph_intersections}
          current_graph_locations={this.state.current_graph_locations}
        />;
        break;
      default:
        MainContent = <MapTypePage setComponent={this.setComponent.bind(this)}/>;
        break;
    }

    // TODO: remove, this is for development only
    // MainContent = <DeliveryPage 
    //       current_graph_roadSectors={this.state.current_graph_roadSectors}
    //       current_graph_intersections={this.state.current_graph_intersections}
    //       current_graph_locations={this.state.current_graph_locations}
    //     />;
    
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
