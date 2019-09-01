import React, { Component } from 'react';

import styled from 'styled-components';

const PageContainer = styled.div`
	margin: 0 2vw 0 2vw;
`;

const DeliveryContainer = styled.div`
	margin-bottom: 20px;
	border-radius: 10px;
	border-width: 2px;
	border-color: #18A2B8;
	border-style: solid;
	padding: 10px;
`;

const MapContainer = styled.div`
	height: 50vh;
	border-radius: 10px;
	border: 2px solid #18A2B8;
	margin-bottom: 20px;
`;

class DeliveryPage extends Component {

  constructor(props) {
    super(props);
    console.log(this.props.current_graph_roadSectors, this.props.current_graph_intersections, this.props.current_graph_locations)
    let highlightedRoadSectors = new Map();
    this.props.current_graph_roadSectors.forEach(roadSector => {
      highlightedRoadSectors.set(roadSector.roadName + "-" + roadSector.roadSectorId, false)
    })

    let highlightedLocations = new Map();
    this.props.current_graph_locations.forEach(location => {
      highlightedLocations.set(location.roadName + "-" + location.name, false)
    })

    this.state = {
      roadSectors: this.props.current_graph_roadSectors,
      intersections: this.props.current_graph_intersections,
      locations: this.props.current_graph_locations,
      highlightedRoadSectors: highlightedRoadSectors,
      highlightedLocations: highlightedLocations,
      canvas: null,
      context: null,
      canvasScale: null
    };
    this.handleCanvasMouseMove = this.handleCanvasMouseMove.bind(this);
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
    this.setState({ canvas: canvas, context: context, canvasScale: scale }, () => {
      this.drawCanvas(this.state.canvas, this.state.context, this.state.roadSectors, this.state.locations, this.state.intersections);
    });
  }

  handleCanvasMouseMove(event) { // Display roadSector names and location names if the mouse is near those elements
    event.preventDefault();
    event.stopPropagation();
    const rect = this.state.canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left);
    const mouseY = (event.clientY - rect.top);

    let changeMade = false;
    this.state.roadSectors.forEach(roadSector => {
      const roadSectorId = roadSector.roadName + "-" + roadSector.roadSectorId;
      if (this.pointIsNearRoadSector(roadSector.startX, roadSector.startY, roadSector.endX, roadSector.endY, mouseX, mouseY, 5)) {
        if (this.state.highlightedRoadSectors.get(roadSectorId) === false) {
          this.state.highlightedRoadSectors.set(roadSectorId, true);
          changeMade = true;
        }
      } else if (this.state.highlightedRoadSectors.get(roadSectorId) === true) {
        this.state.highlightedRoadSectors.set(roadSectorId, false);
        changeMade = true;
      }
    })

    this.state.locations.forEach(location => {
      const locationId = location.roadName + "-" + location.name;
      if (mouseX >= location.x - 5 && mouseX <= location.x + 5 && mouseY >= location.y - 5 && mouseY <= location.y + 5) {
        if (this.state.highlightedLocations.get(locationId) === false) {
          this.state.highlightedLocations.set(locationId, true);
          changeMade = true;
        }

        // Also hide displaying of roadSectors if this location is being displayed
        this.state.roadSectors.forEach(roadSector => {
          this.state.highlightedRoadSectors.set(roadSector.roadName + "-" + roadSector.roadSectorId, false)
        })
      } else if (this.state.highlightedLocations.get(locationId) === true) {
        this.state.highlightedLocations.set(locationId, false);
        changeMade = true;
      }
    })

    if (changeMade) {
      this.drawCanvas(this.state.canvas, this.state.context, this.state.roadSectors, this.state.locations, this.state.intersections);
    }
  }

  drawCanvas(canvas, context, roadSectors, locations, intersections) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawRoadSectors(canvas, context, roadSectors);
    this.drawLocations(canvas, context, locations);
    this.drawIntersections(canvas, context, intersections);
  }

  drawRoadSectors(canvas, context, roadSectors) {
    roadSectors.forEach(roadSector => {
      // Draw the road
      context.lineWidth = 2;
      context.strokeStyle = "white";
      context.beginPath(); // Must have this line so previous paths are not redrawn
      context.moveTo(roadSector.startX, roadSector.startY);
      context.lineTo(roadSector.endX, roadSector.endY);
      context.stroke();
      // Draw the roadSector label
      context.textAlign = "center";
      context.fillStyle = "white";
      context.font = "20px Avenir";
      const dx = roadSector.endX - roadSector.startX;
      const dy = roadSector.endY - roadSector.startY;
      context.save();
      context.translate(roadSector.startX + (dx * 0.5), roadSector.startY + (dy * 0.5));
      context.rotate(Math.atan2(dy, dx));
      if (this.state.highlightedRoadSectors.get(roadSector.roadName + "-" + roadSector.roadSectorId) === true) {
        context.fillText(roadSector.roadName + " (" + roadSector.roadSectorLength + ")", 0, 0);
      }
      context.restore();
    })
  }

  drawLocations(canvas, context, locations) {
    locations.forEach(location => {
      context.beginPath();
      context.arc(location.x, location.y, 3, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
      if (this.state.highlightedLocations.get(location.roadName + "-" + location.name) === true) {
        context.fillText(location.name, location.x, Math.max(0, location.y - 10));
      }
    })
  }

  drawIntersections(canvas, context, intersections) { // intersections is [{x, y, roads, isEndpoint}]
    intersections.forEach(intersection => {
      if (!intersection.isEndpoint && intersection.locationId === "NOT_A_LOCATION") {
        intersection.roadSectors.forEach(roadSector => {
          const INTERSECTION_LENGTH = 5; // amount of pixels for half of intersection line
          const leftX = (Math.min(roadSector.startX, roadSector.endX) === roadSector.startX) ?
            roadSector.startX : roadSector.endX;
          const leftY = (leftX === roadSector.startX) ? roadSector.startY : roadSector.endY;

          const rightX = (leftX === roadSector.startX) ? roadSector.endX : roadSector.startX;
          const rightY = (leftX === roadSector.startX) ? roadSector.endY : roadSector.startY;

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
		return (
      <PageContainer>
        <DeliveryContainer />
			  <MapContainer>
          <canvas
            ref="canvas"
            id="canvas"
            width={((window.innerWidth / 100) * 96) - 15}
            height={((window.innerHeight / 100) * 50) - 15}
            style={{ marginTop: "6px", marginLeft: "6px" }}
            onMouseMove={this.handleCanvasMouseMove}
          />
        </MapContainer>
      </PageContainer>
		)
  }
  
  getPointDistanceFromLine(lineStartX, lineStartY, lineEndX, lineEndY, pointX, pointY) {
    const numerator = Math.abs(((lineEndX - lineStartX) * (lineStartY - pointY)) - ((lineStartX - pointX) * (lineEndY - lineStartY)));
    const denominator = Math.sqrt(Math.pow((lineEndX - lineStartX), 2) + Math.pow((lineEndY - lineStartY), 2));
    return (denominator === 0 ? 0 : numerator / denominator);
  }
  
  pointIsNearRoadSector(lineStartX, lineStartY, lineEndX, lineEndY, pointX, pointY, maxDistance) {
    const topLeftX = Math.min(lineStartX, lineEndX);
    const topLeftY = Math.min(lineStartY, lineEndY);
    const bottomRightX = Math.max(lineStartX, lineEndX);
    const bottomRightY = Math.max(lineStartY, lineEndY);

    if (pointX >= (topLeftX - maxDistance) && pointX <= (bottomRightX + maxDistance)
      && pointY >= (topLeftY - maxDistance) && pointY <= (bottomRightY + maxDistance)) {
      if (this.getPointDistanceFromLine(lineStartX, lineStartY, lineEndX, lineEndY, pointX, pointY) <= maxDistance) {
        return true;
      }
    }
    return false;
  }
}

export default DeliveryPage;