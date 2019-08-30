import React, { Component } from 'react';

import styled from 'styled-components';

const PageContainer = styled.div`
	margin: 0 2vw 0 2vw;
`;

const InsertionContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, 500px);
	grid-column-gap: 30px;
	justify-content: center;
`;

const InsertRoadContainer = styled.div`
	width: 476px;
	margin-bottom: 20px;
	border-radius: 10px;
	border-width: 2px;
	border-color: #18A2B8;
	border-style: solid;
	padding: 10px;
`;

const InsertLocationContainer = styled.div`
	width: 476px;
	margin-bottom: 20px;
	border-radius: 10px;
	border-width: 2px;
	border-color: #18A2B8;
	border-style: solid;
	padding: 10px;
`;

const InsertIntersectionContainer = styled.div`
	width: 476px;
	margin-bottom: 20px;
	border-radius: 10px;
	border-width: 2px;
	border-color: #18A2B8;
	border-style: solid;
	padding: 10px;
`;

const InsertRoadForm = styled.form`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const InsertLocationForm = styled.form`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const InsertIntersectionForm = styled.form`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const FormTitle = styled.h3`
	font-size: 30px;
	margin: 0 0 10px 0;
`;

const FormItem = styled.div`
	display: ${props => (props.display === `none`) ? `none` : `flex`};
	flex-wrap: wrap;
`;

const InputDescription = styled.p`
	margin: auto 10px auto 0;
`;

const InputText = styled.p`
	color: ${props => props.color ? props.color : `white`};
	margin: auto 5px auto 5px;
`;

const FormInput = styled.input`
	width: ${props => props.boxWidth ? props.boxWidth : `50px`};
	text-align: center;
	color: #18A2B8;
	font-weight: bold;
	background-color: #071729;
	border-color: orange;
	border-radius: 10px;
	border-style: dashed;
	padding: 8px;
	height: 14px;
	:focus {
		outline: none;
		border-color: yellow;
	}
`;

const Button = styled.div`
	background-color: transparent;
	color: purple;
	padding: 5px;
	border: 2px solid purple;
	border-radius: 10px;
	cursor: pointer;
	:hover {
		background-color: purple;
		color: #071729;
		border-color:	indigo;
	}
`;

const MapContainer = styled.div`
	height: 50vh;
	border-radius: 10px;
	border: 2px solid #18A2B8;
	margin-bottom: 20px;
`;

const AddRoadButton = styled.div`
	background-color: transparent;
	color: orange;
	cursor: pointer;
	:hover {
		color: lime;
	}
`;

class CreateMapPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentRoadStartX: null,
      currentRoadStartY: null,
      currentRoadEndX: null,
      currentRoadEndY: null,
      currentRoadName: null,
      currentRoadWeight: null,
      currentLocationX: -1,
      currentLocationY: -1,
      currentLocationRoadName: null,
      currentLocationRoadNameValid: false,
      currentLocationName: null,
      currentIntersectionX: null,
      currentIntersectionY: null,
      currentIntersectionCoordinatesValid: false,
      currentIntersectionRoads: [""],
      canvas: null,
      context: null,
      canvasScale: null,
      roads: new Map(),
      locations: new Map(),
      intersections: new Map(),
      graph_roadSectors: [],
      graph_intersections: [],
      graph_locations: [],
      graph_roadSectorCounters: new Map(),
    };
    this.handleInsertRoadSubmit = this.handleInsertRoadSubmit.bind(this);
    this.handleRoadInputChange = this.handleRoadInputChange.bind(this);
    this.handleDeleteRoad = this.handleDeleteRoad.bind(this);
    this.handleLocationInputChange = this.handleLocationInputChange.bind(this);
    this.increaseLocationCoordinate = this.increaseLocationCoordinate.bind(this);
    this.decreaseLocationCoordinate = this.decreaseLocationCoordinate.bind(this);
    this.handleInsertLocationSubmit = this.handleInsertLocationSubmit.bind(this);
    this.handleDeleteLocation = this.handleDeleteLocation.bind(this);
    this.handleIntersectionInputChange = this.handleIntersectionInputChange.bind(this);
    this.handleIntersectionRoadsInputChange = this.handleIntersectionRoadsInputChange.bind(this);
    this.handleDeleteIntersectionRoad = this.handleDeleteIntersectionRoad.bind(this);
    this.addIntersectionRoad = this.addIntersectionRoad.bind(this);
    this.handleInsertIntersectionSubmit = this.handleInsertIntersectionSubmit.bind(this);
    this.handleDeleteIntersection = this.handleDeleteIntersection.bind(this);
    this.handleMapSubmit = this.handleMapSubmit.bind(this);
  }

  componentDidMount() {
    this.initializeCanvas();
  }

  initializeCanvas() {
    const canvas = this.refs.canvas;
    const context = canvas.getContext('2d');

    // Adjust canvas scale for high resolutions
    let width = canvas.width;
    let height = canvas.height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const scale = window.devicePixelRatio ? window.devicePixelRatio : 1;
    canvas.width = width * scale;
    canvas.height = height * scale;

    context.scale(scale, scale);
    this.setState({ canvas: canvas, context: context, canvasScale: scale });
  }

  handleInsertRoadSubmit(event) {
    event.preventDefault();
    const { currentRoadStartX, currentRoadStartY, currentRoadEndX, currentRoadEndY, currentRoadName, currentRoadWeight,
      canvas, context, canvasScale } = this.state;
    if (!this.coordinateInputsAreValid(currentRoadStartX, currentRoadStartY, canvas.width / canvasScale, canvas.height / canvasScale) ||
      !this.coordinateInputsAreValid(currentRoadEndX, currentRoadEndY, canvas.width / canvasScale, canvas.height / canvasScale) ||
      this.inputsContainNull([currentRoadStartX, currentRoadStartY, currentRoadEndX,
        currentRoadEndY, currentRoadName, currentRoadWeight]) || isNaN(currentRoadWeight)) {
      return;
    }
    let newRoad = {
      startX: Number(currentRoadStartX),
      startY: Number(currentRoadStartY),
      endX: Number(currentRoadEndX),
      endY: Number(currentRoadEndY),
      name: currentRoadName,
      weight: Number(currentRoadWeight)
    };
    this.state.roads.set(currentRoadName, newRoad);
    this.setState({
      currentRoadStartX: null, currentRoadStartY: null, currentRoadEndX: null, currentRoadEndY: null,
      currentRoadName: null, currentRoadWeight: null
    }, () => {
      this.drawCanvas(canvas, context, this.state.roads, this.state.locations, this.state.intersections);
    });

    // Clear the currently displayed inputs
    this.clearRoadForm(false);
  }

  handleInsertLocationSubmit(event) {
    event.preventDefault();
    if (this.inputsContainNull([this.state.currentLocationRoadName, this.state.currentLocationName])) {
      return;
    }
    let newLocation = {
      x: Number(this.state.currentLocationX),
      y: Number(this.state.currentLocationY),
      name: this.state.currentLocationName,
      roadName: this.state.currentLocationRoadName,
      locationId: this.state.currentLocationRoadName + "-" + this.state.currentLocationName
    };

    this.state.locations.set(this.state.currentLocationRoadName + "-" + this.state.currentLocationName, newLocation)
    this.setState({
      currentLocationX: -1, currentLocationY: -1, currentLocationName: null, currentLocationRoadName: null,
      currentLocationRoadNameValid: false
    }, () => {
      this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations, this.state.intersections);
    });

    // Clear the currently displayed inputs
    this.clearLocationForm();
  }

  handleInsertIntersectionSubmit(event) {
    event.preventDefault();
    // Check if all of the provided roads exist
    let roadsExist = true;
    this.state.currentIntersectionRoads.forEach(road => {
      if (!this.state.roads.has(road)) {
        roadsExist = false;
      }
    })
    if (!roadsExist) return;

    const newIntersection = {
      x: this.state.currentIntersectionX,
      y: this.state.currentIntersectionY,
      roads: this.state.currentIntersectionRoads,
      isEndpoint: false,
      locationId: "NOT_A_LOCATION"
    }

    this.state.intersections.set(newIntersection.x + "-" + newIntersection.y, newIntersection);
    this.setState({
      currentIntersectionX: null, currentIntersectionY: null, currentIntersectionCoordinatesValid: false,
      currentIntersectionRoads: [""]
    }, () => {
      this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations, this.state.intersections);
    });
    document.getElementsByName("currentIntersectionX")[0].value = "";
    document.getElementsByName("currentIntersectionY")[0].value = "";
  }
  
  handleMapSubmit(event) {
    event.preventDefault();

    // Add every roadSector to graph_roadSectors and corresponding endpoint intersections to graph_intersections
    this.state.roads.forEach(road => {
      this.addRoadSectorToGraph(road);
    })

    // Add every intersection to graph_intersections
    this.state.intersections.forEach(intersection => {
      this.addIntersectionToGraph(intersection);
    })

    // Add every location to graph_locations and as an intersection to graph_intersections
    this.state.locations.forEach(location => {
      this.addLocationToGraph(location);
    })
    console.log(this.state.graph_roadSectors)
    console.log(this.state.graph_intersections)
    console.log(this.state.graph_locations)
  }

  handleRoadInputChange(event) {
    const updatedStateObject = {};
    updatedStateObject[event.target.name] = event.target.value;

    if (event.target.name === "currentRoadName" && this.state.roads.has(event.target.value)) {
      // An existing road is being edited
      const roadObject = this.state.roads.get(event.target.value);
      this.setRoadForm(roadObject.startX, roadObject.startY, roadObject.endX, roadObject.endY, roadObject.name, roadObject.weight);
      updatedStateObject["currentRoadStartX"] = roadObject.startX;
      updatedStateObject["currentRoadStartY"] = roadObject.startY;
      updatedStateObject["currentRoadEndX"] = roadObject.endX;
      updatedStateObject["currentRoadEndY"] = roadObject.endY;
      updatedStateObject["currentRoadWeight"] = roadObject.weight;
    } else if (event.target.name === "currentRoadName" && this.state.roads.has(this.state.currentRoadName)) {
      // Previous name entry was an edit <-- clear the form and state
      this.clearRoadForm(true);
      updatedStateObject["currentRoadStartX"] = null;
      updatedStateObject["currentRoadStartY"] = null;
      updatedStateObject["currentRoadEndX"] = null;
      updatedStateObject["currentRoadEndY"] = null;
      updatedStateObject["currentRoadWeight"] = null;
    }
    this.setState(updatedStateObject);
  }

  handleIntersectionInputChange(event) {
    const updatedStateObject = {};
    updatedStateObject[event.target.name] = event.target.value;
    this.setState(updatedStateObject, () => {
      const { currentIntersectionX, currentIntersectionY, canvas, canvasScale } = this.state;
      if (this.coordinateInputsAreValid(currentIntersectionX, currentIntersectionY, canvas.width / canvasScale,
        canvas.height / canvasScale) && !this.inputsContainNull([currentIntersectionX, currentIntersectionY])) {
        this.setState({ currentIntersectionCoordinatesValid: true });

        const nearbyRoads = this.getNearbyRoads(this.state.currentIntersectionX, this.state.currentIntersectionY, 10);
        const newIntersectionRoads = (nearbyRoads.length === 0) ? [""] : nearbyRoads;
        this.setState({ currentIntersectionRoads: newIntersectionRoads });
      } else {
        this.setState({ currentIntersectionCoordinatesValid: false });
      }
    });
  }

  handleIntersectionRoadsInputChange(event) {
    event.preventDefault();
    const currentIntersectionRoads = this.state.currentIntersectionRoads.slice();
    currentIntersectionRoads[Number.parseInt(event.target.name[event.target.name.length - 1])] = event.target.value;
    this.setState({ currentIntersectionRoads: currentIntersectionRoads });
  }

  handleDeleteRoad(event) {
    event.preventDefault();
    this.state.roads.delete(this.state.currentRoadName);
    this.state.locations.forEach((location, key) => {
      if (location.roadName === this.state.currentRoadName) {
        this.state.locations.delete(key);
      }
    })
    this.state.intersections.forEach(intersection => {
      if (intersection.roads.includes(this.state.currentRoadName)) {
        intersection.roads.splice(intersection.roads.indexOf(this.state.currentRoadName), 1);
      }
    })
    this.setState({
      currentRoadStartX: null, currentRoadStartY: null, currentRoadEndX: null, currentRoadEndY: null,
      currentRoadName: null, currentRoadWeight: null
    }, () => {
      this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations, this.state.intersections);
    });
    // Clear the currently displayed inputs
    this.clearRoadForm(false);
  }

  handleDeleteLocation(event) {
    event.preventDefault();
    this.state.locations.delete(this.state.currentLocationRoadName + "-" + this.state.currentLocationName);
    this.setState({
      currentLocationX: -1, currentLocationY: -1, currentLocationName: null, currentLocationRoadName: null,
      currentLocationRoadNameValid: false
    }, () => {
      this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations, this.state.intersections);
    });
    // Clear the currently displayed inputs
    this.clearLocationForm();
  }

  handleDeleteIntersectionRoad(event) {
    event.preventDefault(); // ID is the only target identifier that works for some reason (name doesn't work)
    const currentIntersectionRoadIndex = Number.parseInt(event.target.id[event.target.id.length - 1]);
    const currentIntersectionRoads = this.state.currentIntersectionRoads.slice();
    currentIntersectionRoads.splice(currentIntersectionRoadIndex, 1);
    this.setState({ currentIntersectionRoads: currentIntersectionRoads });
  }

  handleDeleteIntersection(event) {
    event.preventDefault();
    this.state.intersections.delete(this.state.currentIntersectionX + "-" + this.state.currentIntersectionY);
    this.setState({
      currentIntersectionX: null, currentIntersectionY: null, currentIntersectionCoordinatesValid: false,
      currentIntersectionRoads: [""]
    }, () => {
      this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations, this.state.intersections);
    });
    document.getElementsByName("currentIntersectionX")[0].value = "";
    document.getElementsByName("currentIntersectionY")[0].value = "";
  }

  addIntersectionRoad(event) {
    const currentIntersectionRoads = this.state.currentIntersectionRoads.concat([""]);
    this.setState({ currentIntersectionRoads: currentIntersectionRoads });
  }

  handleLocationInputChange(event) {
    const updatedStateObject = {};
    updatedStateObject[event.target.name] = event.target.value;

    // If location is being inserted
    if (event.target.name === "currentLocationRoadName" && this.state.roads.has(event.target.value)) {
      updatedStateObject["currentLocationRoadNameValid"] = true;
      const locationRoad = this.state.roads.get(event.target.value);
      updatedStateObject["currentLocationX"] = locationRoad.startX + ((locationRoad.endX - locationRoad.startX) / 2);
      updatedStateObject["currentLocationY"] = locationRoad.startY + ((locationRoad.endY - locationRoad.startY) / 2);
    } else if (event.target.name === "currentLocationRoadName" && !this.state.roads.has(event.target.value)) {
      updatedStateObject["currentLocationRoadNameValid"] = false;
    }

    // If location is being edited
    if (event.target.name === "currentLocationRoadName" && this.state.currentLocationName !== null) {
      const locationID = event.target.value + "-" + this.state.currentLocationName;
      if (this.state.locations.has(locationID)) {
        updatedStateObject["currentLocationX"] = this.state.locations.get(locationID).x;
        updatedStateObject["currentLocationY"] = this.state.locations.get(locationID).y;
      }
    } else if (event.target.name === "currentLocationName" && this.state.currentLocationRoadName !== null) {
      const locationID = this.state.currentLocationRoadName + "-" + event.target.value;
      if (this.state.locations.has(locationID)) {
        updatedStateObject["currentLocationX"] = this.state.locations.get(locationID).x;
        updatedStateObject["currentLocationY"] = this.state.locations.get(locationID).y;
      }
    }

    // If location was just being edited
    if ((event.target.name === "currentLocationName" || event.target.name === "currentLocationRoadName") &&
      this.state.locations.has(this.state.currentLocationRoadName + "-" + this.state.currentLocationName)) {
      const locationRoad = this.state.roads.get((event.target.name === "currentLocationRoadName") ? event.target.value :
        this.state.currentLocationRoadName);
      updatedStateObject["currentLocationX"] = locationRoad.startX + ((locationRoad.endX - locationRoad.startX) / 2);
      updatedStateObject["currentLocationY"] = locationRoad.startY + ((locationRoad.endY - locationRoad.startY) / 2);
    }

    this.setState(updatedStateObject);
  }

  increaseLocationCoordinate(event) {
    const currentRoad = this.state.roads.get(this.state.currentLocationRoadName);
    const dx = currentRoad.endX - currentRoad.startX;
    const dy = currentRoad.endY - currentRoad.startY;
    const newX = this.state.currentLocationX + (dx / 100);
    const newY = (dx !== 0) ? this.state.currentLocationY + ((dx / 100) * (dy / dx)) : this.state.currentLocationY + (dy / 100);

    if ((currentRoad.endX - newX) >= Math.min(0, dx) && (currentRoad.endX - newX) <= Math.max(0, dx) &&
      (currentRoad.endY - newY) >= Math.min(0, dy) && (currentRoad.endY - newY) <= Math.max(0, dy)) {
      this.setState({ currentLocationX: newX, currentLocationY: newY }, () => {
        this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations, this.state.intersections)
      });
    }
  }

  decreaseLocationCoordinate(event) {
    const currentRoad = this.state.roads.get(this.state.currentLocationRoadName);
    const dx = currentRoad.endX - currentRoad.startX;
    const dy = currentRoad.endY - currentRoad.startY;
    const newX = this.state.currentLocationX - (dx / 100);
    const newY = (dx !== 0) ? this.state.currentLocationY - ((dx / 100) * (dy / dx)) : this.state.currentLocationY - (dy / 100);

    if ((currentRoad.endX - newX) >= Math.min(0, dx) && (currentRoad.endX - newX) <= Math.max(0, dx) &&
      (currentRoad.endY - newY) >= Math.min(0, dy) && (currentRoad.endY - newY) <= Math.max(0, dy)) {
      this.setState({ currentLocationX: newX, currentLocationY: newY }, () => {
        this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations, this.state.intersections)
      });
    }
  }

  drawCanvas(canvas, context, roads, locations, intersections) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawRoads(canvas, context, roads);
    this.drawLocations(canvas, context, locations);
    this.drawIntersections(canvas, context, intersections);
  }

  drawRoads(canvas, context, roads) { // roads is [{startX: x, startY: y, endX: x, endY: y, name: z, weight: w, editing: true/false}]
    roads.forEach(road => {
      // Draw the road
      context.lineWidth = 2;
      context.strokeStyle = "white";
      context.beginPath(); // Must have this line so previous paths are not redrawn
      context.moveTo(road.startX, road.startY);
      context.lineTo(road.endX, road.endY);
      context.stroke();
      // Draw the road label
      context.textAlign = "center";
      context.fillStyle = "white";
      context.font = "20px Avenir";
      const dx = road.endX - road.startX;
      const dy = road.endY - road.startY;
      context.save();
      context.translate(road.startX + (dx * 0.5), road.startY + (dy * 0.5));
      context.rotate(Math.atan2(dy, dx));
      context.fillText(road.name + " (" + road.weight + ")", 0, 0);
      context.restore();
    })
  }

  drawLocations(canvas, context, locations) { // locations is [{x, y, name, roadname}]
    locations.forEach(location => {
      context.beginPath();
      context.arc(location.x, location.y, 3, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
    })
  }

  drawIntersections(canvas, context, intersections) { // intersections is [{x, y, roads, isEndpoint}]
    intersections.forEach(intersection => {
      if (!intersection.isEndpoint) {
        intersection.roads.forEach(road => {
          const INTERSECTION_LENGTH = 5; // amount of pixels for half of intersection line
          const currentRoad = this.state.roads.get(road);
          const leftX = (Math.min(currentRoad.startX, currentRoad.endX) === currentRoad.startX) ?
            currentRoad.startX : currentRoad.endX;
          const leftY = (leftX === currentRoad.startX) ? currentRoad.startY : currentRoad.endY;

          const rightX = (leftX === currentRoad.startX) ? currentRoad.endX : currentRoad.startX;
          const rightY = (leftX === currentRoad.startX) ? currentRoad.endY : currentRoad.startY;

          const dxLeft = Number(intersection.x) - leftX;
          const dyLeft = Number(intersection.y) - leftY;
          const dxRight = rightX - Number(intersection.x);
          const dyRight = rightY - Number(intersection.y);

          const roadLengthLeft = Math.sqrt(Math.pow(dxLeft, 2) + Math.pow(dyLeft, 2));
          const intersectionLengthLeft = roadLengthLeft < INTERSECTION_LENGTH ? roadLengthLeft : INTERSECTION_LENGTH;
          const distanceRatioLeft = (roadLengthLeft === 0) ? 0 : intersectionLengthLeft / roadLengthLeft;
          const newLineLeftX = Number(intersection.x) - (distanceRatioLeft * dxLeft);
          const newLineLeftY = Number(intersection.y) - (distanceRatioLeft * dyLeft);

          const roadLengthRight = Math.sqrt(Math.pow(dxRight, 2) + Math.pow(dyRight, 2));
          const intersectionLengthRight = roadLengthRight < INTERSECTION_LENGTH ? roadLengthRight : INTERSECTION_LENGTH;
          const distanceRatioRight = (roadLengthRight === 0) ? 0 : intersectionLengthRight / roadLengthRight;
          const newLineRightX = Number(intersection.x) + (distanceRatioRight * dxRight);
          const newLineRightY = Number(intersection.y) + (distanceRatioRight * dyRight);
          // console.log(leftX, leftY, rightX, rightY);
          // console.log(dxLeft, dyLeft, dxRight, dyRight);
          // console.log(newLineLeftX, newLineLeftY, newLineRightX, newLineRightY);
          context.lineWidth = 2;
          context.strokeStyle = "lime";
          context.beginPath();
          context.moveTo(newLineLeftX, newLineLeftY);
          context.lineTo(newLineRightX, newLineRightY);
          context.stroke();
        })
      }
    })
  }

  render() {
    const roadBeingEdited = this.state.roads.has(this.state.currentRoadName);
    const RoadFormButtons = roadBeingEdited ?
      (<FormItem>
        <Button onClick={this.handleInsertRoadSubmit} style={{ marginRight: "10px" }}>
          Edit Road
			</Button>
        <Button onClick={this.handleDeleteRoad}>
          Delete Road
			</Button>
      </FormItem>) :
      (<FormItem>
        <Button onClick={this.handleInsertRoadSubmit}>
          Insert Road
			</Button>
      </FormItem>);

    const locationBeingEdited = this.state.locations.has(this.state.currentLocationRoadName + "-" + this.state.currentLocationName);
    const LocationFormButtons = locationBeingEdited ?
      (<FormItem display={this.state.currentLocationRoadNameValid ? "" : "none"}>
        <Button onClick={this.handleInsertLocationSubmit} style={{ marginRight: "10px" }}>Edit Location</Button>
        <Button onClick={this.handleDeleteLocation}>Delete Location</Button>
      </FormItem>) :
      (<FormItem display={this.state.currentLocationRoadNameValid ? "" : "none"}>
        <Button onClick={this.handleInsertLocationSubmit}>Insert Location</Button>
      </FormItem>);

    const IntersectionRoadInputs =
      (<div>
        {this.state.currentIntersectionRoads.map((road, index) => {
          const roadName = `currentIntersectionRoadName${index}`;
          return (
            <FormItem key={roadName} style={{ marginBottom: "10px" }} display={this.state.currentIntersectionCoordinatesValid ? "" : "none"}>
              <div style={(this.state.currentIntersectionRoads.length > 1) ? { width: "34px", height: "34px" } : {}}></div>
              <FormInput
                type="text"
                boxWidth="200px"
                name={roadName}
                onChange={this.handleIntersectionRoadsInputChange}
                value={road}>
              </FormInput>
              {index !== 0 ?
                <svg height="34" width="34" id={`deleteButton1-${index}`} onClick={this.handleDeleteIntersectionRoad}>
                  <line x1="10" y1="10" x2="24" y2="24" id={`deleteButton2-${index}`} style={{ stroke: "red", strokeWidth: 2 }}></line>
                  <line x1="24" y1="10" x2="10" y2="24" id={`deleteButton3-${index}`} style={{ stroke: "red", strokeWidth: 2 }}></line>
                </svg> : <div style={{ display: "none" }} />
              }
            </FormItem>);
        })}
      </div>);

    const intersectionBeingEdited = this.state.intersections.has(this.state.currentIntersectionX + "-" + this.state.currentIntersectionY);
    const IntersectionFormButtons = intersectionBeingEdited ?
      (<FormItem display={this.state.currentIntersectionCoordinatesValid ? "" : "none"}>
        <Button onClick={this.handleInsertIntersectionSubmit} style={{ marginRight: "10px" }}>
          Edit Intersection
		</Button>
        <Button onClick={this.handleDeleteIntersection}>
          Delete Intersection
		</Button>
      </FormItem>) :
      (<FormItem display={this.state.currentIntersectionCoordinatesValid ? "" : "none"}>
        <Button onClick={this.handleInsertIntersectionSubmit}>
          Insert Intersection
		</Button>
      </FormItem>);

    return (
      <PageContainer>
        <InsertionContainer>
          <InsertRoadContainer>
            <InsertRoadForm>
              <FormTitle>Insert/Edit Road</FormTitle>
              <FormItem style={{ marginBottom: "10px" }}>
                <InputDescription>Road Name:</InputDescription>
                <FormInput type="text" boxWidth="200px" name="currentRoadName" onChange={this.handleRoadInputChange}></FormInput>
              </FormItem>
              <FormItem style={{ marginBottom: "10px" }}>
                <InputDescription>Start Coordinate (X,Y):</InputDescription>
                <InputText>(</InputText>
                <FormInput type="text" name="currentRoadStartX" onChange={this.handleRoadInputChange}></FormInput>
                <InputText> , </InputText>
                <FormInput type="text" name="currentRoadStartY" onChange={this.handleRoadInputChange}></FormInput>
                <InputText>)</InputText>
              </FormItem>
              <FormItem style={{ marginBottom: "10px" }}>
                <InputDescription>End Coordinate (X,Y):</InputDescription>
                <InputText>(</InputText>
                <FormInput type="text" name="currentRoadEndX" onChange={this.handleRoadInputChange}></FormInput>
                <InputText> , </InputText>
                <FormInput type="text" name="currentRoadEndY" onChange={this.handleRoadInputChange}></FormInput>
                <InputText>)</InputText>
              </FormItem>
              <FormItem style={{ marginBottom: "10px" }}>
                <InputDescription>Time to Travel:</InputDescription>
                <FormInput type="text" name="currentRoadWeight" onChange={this.handleRoadInputChange}></FormInput>
                <InputText> minutes</InputText>
              </FormItem>
              {RoadFormButtons}
            </InsertRoadForm>
          </InsertRoadContainer>
          <InsertLocationContainer>
            <InsertLocationForm>
              <FormTitle>Insert/Edit Location</FormTitle>
              <FormItem style={{ marginBottom: "10px" }}>
                <InputDescription>Road Name:</InputDescription>
                <FormInput type="text" boxWidth="200px" name="currentLocationRoadName" onChange={this.handleLocationInputChange}></FormInput>
              </FormItem>
              <FormItem style={{ marginBottom: "10px" }} display={this.state.currentLocationRoadNameValid ? "" : "none"}>
                <InputDescription>Location Name:</InputDescription>
                <FormInput type="text" boxWidth="200px" name="currentLocationName" onChange={this.handleLocationInputChange}></FormInput>
              </FormItem>
              <FormItem style={{ marginBottom: "10px" }} display={this.state.currentLocationRoadNameValid ? "" : "none"}>
                <InputDescription>Coordinates (X,Y):</InputDescription>
                <InputText>(</InputText>
                <InputText id="currentLocationX" color="orange">{this.state.currentLocationX.toFixed(2)}</InputText>
                <InputText> , </InputText>
                <InputText id="currentLocationY" color="orange">{this.state.currentLocationY.toFixed(2)}</InputText>
                <InputText style={{ marginRight: "10px" }}>)</InputText>
                <svg height="34" width="14">
                  <polygon points="0,14 14,14 7,0" style={{ fill: "orange" }} onClick={this.increaseLocationCoordinate} />
                  <polygon points="0,20 14,20 7,34" style={{ fill: "orange" }} onClick={this.decreaseLocationCoordinate} />
                </svg>
              </FormItem>
              {LocationFormButtons}
            </InsertLocationForm>
          </InsertLocationContainer>
        </InsertionContainer>
        <MapContainer>
          <canvas
            ref="canvas"
            id="canvas"
            width={((window.innerWidth / 100) * 96) - 15}
            height={((window.innerHeight / 100) * 50) - 15}
            style={{ marginTop: "6px", marginLeft: "6px" }}
          />
        </MapContainer>
        <InsertionContainer>
          <InsertIntersectionContainer>
            <InsertIntersectionForm>
              <FormTitle>Insert/Edit Intersection</FormTitle>
              <FormItem style={{ marginBottom: "10px" }}>
                <InputDescription>Coordinates (X,Y):</InputDescription>
                <InputText>(</InputText>
                <FormInput type="text" name="currentIntersectionX" onChange={this.handleIntersectionInputChange}></FormInput>
                <InputText> , </InputText>
                <FormInput type="text" name="currentIntersectionY" onChange={this.handleIntersectionInputChange}></FormInput>
                <InputText>)</InputText>
              </FormItem>
              <FormItem style={{ marginBottom: "10px" }} display={this.state.currentIntersectionCoordinatesValid ? "" : "none"}>
                <InputDescription>Included Roads:</InputDescription>
              </FormItem>
              {IntersectionRoadInputs}
              <FormItem style={{ marginBottom: "10px" }} display={this.state.currentIntersectionCoordinatesValid ? "" : "none"}>
                <AddRoadButton onClick={this.addIntersectionRoad}>Add a road +</AddRoadButton>
              </FormItem>
              {IntersectionFormButtons}
            </InsertIntersectionForm>
          </InsertIntersectionContainer>
          <InsertIntersectionContainer>
            <InsertIntersectionForm>
              <FormTitle>Submit Map</FormTitle>
              <FormItem>
                <Button onClick={this.handleMapSubmit}>
                  Submit
                </Button>
              </FormItem>
            </InsertIntersectionForm>
          </InsertIntersectionContainer>
        </InsertionContainer>
      </PageContainer>
    );
  }

  setRoadForm(startX, startY, endX, endY, name, weight) {
    document.getElementsByName("currentRoadStartX")[0].value = startX;
    document.getElementsByName("currentRoadStartY")[0].value = startY;
    document.getElementsByName("currentRoadEndX")[0].value = endX;
    document.getElementsByName("currentRoadEndY")[0].value = endY;
    document.getElementsByName("currentRoadName")[0].value = name;
    document.getElementsByName("currentRoadWeight")[0].value = weight;
  }

  clearRoadForm(skipName) {
    document.getElementsByName("currentRoadStartX")[0].value = "";
    document.getElementsByName("currentRoadStartY")[0].value = "";
    document.getElementsByName("currentRoadEndX")[0].value = "";
    document.getElementsByName("currentRoadEndY")[0].value = "";
    if (!skipName) document.getElementsByName("currentRoadName")[0].value = "";
    document.getElementsByName("currentRoadWeight")[0].value = "";
  }

  clearLocationForm() {
    document.getElementsByName("currentLocationName")[0].value = "";
    document.getElementsByName("currentLocationRoadName")[0].value = "";
  }

  inputsContainNull(inputs) {
    inputs.forEach(input => {
      if (input === null) {
        return true;
      }
    })
    return false;
  }

  pointBetweenRoadSector(pointX, pointY, roadStartX, roadStartY, roadEndX, roadEndY) {
    const minX = Math.min(roadStartX, roadEndX);
    const maxX = Math.max(roadStartX, roadEndX);

    const minY = Math.min(roadStartY, roadEndY);
    const maxY = Math.max(roadStartY, roadEndY);
    return (pointX >= minX && pointX <= maxX && pointY >= minY && pointY <= maxY);
  }

  coordinateInputsAreValid(inputX, inputY, maximumX, maximumY) {
    if (isNaN(inputX) || isNaN(inputY) || inputX > maximumX || inputY > maximumY || inputX <= 0 || inputY <= 0) {
      return false;
    } else {
      return true;
    }
  }

  getPointDistanceFromLine(lineStartX, lineStartY, lineEndX, lineEndY, pointX, pointY) {
    const numerator = Math.abs(((lineEndX - lineStartX) * (lineStartY - pointY)) - ((lineStartX - pointX) * (lineEndY - lineStartY)));
    const denominator = Math.sqrt(Math.pow((lineEndX - lineStartX), 2) + Math.pow((lineEndY - lineStartY), 2));
    return (denominator === 0 ? 0 : numerator / denominator);
  }

  getNearbyRoads(x, y, maxDistance) {
    let nearbyRoads = [];
    this.state.roads.forEach(road => {
      const topLeftX = Math.min(road.startX, road.endX);
      const topLeftY = Math.min(road.startY, road.endY);
      const bottomRightX = Math.max(road.startX, road.endX)
      const bottomRightY = Math.max(road.startY, road.endY);
      if (x >= (topLeftX - maxDistance) && x <= (bottomRightX + maxDistance)
        && y >= (topLeftY - maxDistance) && y <= bottomRightY + maxDistance) {
        if (this.getPointDistanceFromLine(road.startX, road.startY, road.endX, road.endY, x, y) <= maxDistance) {
          nearbyRoads.push(road.name);
        }
      }
    })
    return nearbyRoads;
  }

  splitRoadSector(newIntersection, oldRoadSector) { // leftRoadSector returned as arr[0], rightRoadSector as arr[1]
		const newLeftRoadSectorStartX = Math.min(oldRoadSector.startX, oldRoadSector.endX);
		const newLeftRoadSectorStartY = (newLeftRoadSectorStartX === oldRoadSector.startX) ? oldRoadSector.startY : oldRoadSector.endY;

		const newLeftRoadSectorEndX = Number(newIntersection.x);
		const newLeftRoadSectorEndY = Number(newIntersection.y);

		const newRightRoadSectorStartY = Number(newIntersection.y);
		const newRightRoadSectorStartX = Number(newIntersection.x);

		const newRightRoadSectorEndX = Math.max(oldRoadSector.startX, oldRoadSector.endX);
		const newRightRoadSectorEndY = (newRightRoadSectorEndX === oldRoadSector.startX) ? oldRoadSector.startY : oldRoadSector.endY;

    const oldRoadSectorPixelLength = Math.sqrt(Math.pow(oldRoadSector.endX - oldRoadSector.startX, 2) + 
      Math.pow(oldRoadSector.endY - oldRoadSector.startY, 2)); // Pixel length, not weight
		const newLeftRoadSectorPixelLength = Math.sqrt(Math.pow(newLeftRoadSectorEndX - newLeftRoadSectorStartX, 2) + 
			Math.pow(newLeftRoadSectorEndY - newLeftRoadSectorStartY, 2));
		const newRightRoadSectorPixelLength = Math.sqrt(Math.pow(newRightRoadSectorEndX - newRightRoadSectorStartX, 2) + 
      Math.pow(newRightRoadSectorEndY - newRightRoadSectorStartY, 2));
    const newLeftRoadSectorLength = oldRoadSectorPixelLength === 0 ? 0 : 
      (newLeftRoadSectorPixelLength / oldRoadSectorPixelLength) * oldRoadSector.roadSectorLength;
    const newRightRoadSectorLength = oldRoadSectorPixelLength === 0 ? 0 : 
      (newRightRoadSectorPixelLength / oldRoadSectorPixelLength) * oldRoadSector.roadSectorLength;

		const newLeftRoadSector = {roadName: oldRoadSector.roadName, 
			roadSectorId: String(parseInt(oldRoadSector.roadSectorId, 10) + 1), startX: newLeftRoadSectorStartX, 
			startY: newLeftRoadSectorStartY, endX: newLeftRoadSectorEndX, endY: newLeftRoadSectorEndY, 
			roadSectorLength: newLeftRoadSectorLength};

		const newRightRoadSector = {roadName: oldRoadSector.roadName, 
			roadSectorId: String(parseInt(oldRoadSector.roadSectorId, 10) + 2), startX: newRightRoadSectorStartX, 
			startY: newRightRoadSectorStartY, endX: newRightRoadSectorEndX, endY: newRightRoadSectorEndY,
			roadSectorLength: newRightRoadSectorLength};

		return [newLeftRoadSector, newRightRoadSector];
  }
  
  addRoadSectorToGraph(newRoad) {
    // Insert new information into graph output
    const roadSector = {
      roadName: newRoad.name, roadSectorId: "1", roadSectorLength: newRoad.weight, startX: newRoad.startX,
      startY: newRoad.startY, endX: newRoad.endX, endY: newRoad.endY
    };
    this.state.graph_roadSectors.push(roadSector);
    this.state.graph_roadSectorCounters.set(roadSector.roadName, 1);
    const startIntersection = { x: newRoad.startX, y: newRoad.startY, isEndpoint: true, locationId: "NOT_A_LOCATION",
      roadSectors: [roadSector] };
    const endIntersection = { x: newRoad.endX, y: newRoad.endY, isEndpoint: true, locationId: "NOT_A_LOCATION", 
      roadSectors: [roadSector] };
    this.state.graph_intersections.push(startIntersection, endIntersection);
  }

  /*********************
  * 
  * Submit Map Functions 
  *
  *********************/

  addIntersectionToGraph(newIntersection) {
    // For each road part of the intersection, identify the roadSector of that road which is impacted (roadSectorIndex)
    // Then split that roadSector in half (unless the intersection is an endpoint of the roadSector).
    const newIntersectionRoadSectors = [];
    newIntersection.roads.forEach(road => {
      let roadSectorIndex = -1;
      this.state.graph_roadSectors.forEach((roadSector, index) => {
        if (roadSector.roadName === road && this.pointBetweenRoadSector(Number(newIntersection.x), Number(newIntersection.y), 
          roadSector.startX, roadSector.startY, roadSector.endX, roadSector.endY)) {
          roadSectorIndex = index; // This is the index of the impacted roadSector on the current road.
        }
      })

      // Check whether or not the roadSector should be split (yes by default, no if the intersection is an endpoint of
      // the roadSector)
      let roadSectorShouldBeSplit = true;
      const currentRoadSector = this.state.graph_roadSectors[roadSectorIndex];
      if ((Number(newIntersection.x) === currentRoadSector.startX && Number(newIntersection.y) === currentRoadSector.startY) ||
        (Number(newIntersection.x) === currentRoadSector.endX && Number(newIntersection.y) === currentRoadSector.endY)) {
        // The intersection is an endpoint of this roadSector
        roadSectorShouldBeSplit = false;
        newIntersectionRoadSectors.push(currentRoadSector);
      }
      
      if (roadSectorShouldBeSplit) {
        // Remove the impacted roadSector and replace it with a left half and a right half
        const oldRoadSector = this.state.graph_roadSectors.splice(roadSectorIndex, 1)[0]; // Removes this roadSector and returns it
        const splitRoadSectors = this.splitRoadSector(newIntersection, oldRoadSector);
        const newLeftRoadSector = splitRoadSectors[0];
        const newRightRoadSector = splitRoadSectors[1];
        this.state.graph_roadSectorCounters.set(oldRoadSector.roadName, String(parseInt(oldRoadSector.roadSectorId, 10) + 2));
        this.state.graph_roadSectors.push(newLeftRoadSector, newRightRoadSector);
        newIntersectionRoadSectors.push(newLeftRoadSector, newRightRoadSector);

        // Update each intersection in graph_intersections to replace the impacted roadSector with the new left and right halves
        this.state.graph_intersections.forEach(intersection => {
          intersection.roadSectors.forEach((intersectionRoadSector, index) => {
            if (intersectionRoadSector.roadName === oldRoadSector.roadName && 
              intersectionRoadSector.roadSectorId === oldRoadSector.roadSectorId) {
              if (intersection.x <= Number(newIntersection.x)) { // This roadSector is to the left of the new intersection
                intersection.roadSectors.splice(index, 1, newLeftRoadSector);
              } else {  // This roadSector is to the right of the new intersection
                intersection.roadSectors.splice(index, 1, newRightRoadSector);
              }
            }
          })
        })
      }
    })

    // If this intersection already exists, remove it before replacing it.
    let intersectionIndices = [];
    for(let i = 0; i < this.state.graph_intersections.length; i++) {
      const intersection = this.state.graph_intersections[i];
      if (intersection.x === Number(newIntersection.x) && intersection.y === Number(newIntersection.y)) {
        intersectionIndices.push(i);
      }
    }
    
    for(let i = intersectionIndices.length - 1; i >= 0; i--) {
      this.state.graph_intersections.splice(intersectionIndices[i], 1);
    }

    // Add this intersection to graph_intersections
    this.state.graph_intersections.push( {x: Number(newIntersection.x), y: Number(newIntersection.y), 
      isEndpoint: false, locationId: newIntersection.locationId, roadSectors: newIntersectionRoadSectors});
  }

  addLocationToGraph(location) {
    // Add this location as an intersection to graph_intersections
    const locationAsIntersection = {
      x: location.x.toString(),
      y: location.y.toString(),
      roads: [location.roadName],
      isEndpoint: false,
      locationId: location.roadName + "-" + location.name
    }
    this.addIntersectionToGraph(locationAsIntersection);

    // Add this location to graph_locations
    this.state.graph_locations.push(location);
  }
}
export default CreateMapPage;