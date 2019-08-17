import React, { Component } from 'react';

import styled from 'styled-components';

const PageContainer = styled.div`
	margin: 0 2vw 0 2vw;
`;

const InsertionContainer = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	margin-bottom: 20px;
`;

const InsertRoadContainer = styled.div`
	border-radius: 10px;
	border-width: 2px;
	border-color: #18A2B8;
	border-style: solid;
	padding: 10px;
	width: 45vw;
`;

const InsertLocationContainer = styled.div`
	border-radius: 10px;
	border-width: 2px;
	border-color: #18A2B8;
	border-style: solid;
	padding: 10px;
	width: 45vw;
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

const FormTitle = styled.h3`
	font-size: 30px;
	margin: 0 0 10px 0;
`;

const FormItem = styled.div`
	display: ${props => (props.display === `none`)? `none` : `flex`};
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
			canvas: null,
			context: null,
			canvasScale: null,
			roads: new Map(),
			locations: new Map()
		};
		this.handleInsertRoadSubmit = this.handleInsertRoadSubmit.bind(this);
		this.handleRoadInputChange = this.handleRoadInputChange.bind(this);
		this.handleDeleteRoad = this.handleDeleteRoad.bind(this);
		this.handleLocationInputChange = this.handleLocationInputChange.bind(this);
		this.increaseLocationCoordinate = this.increaseLocationCoordinate.bind(this);
		this.decreaseLocationCoordinate = this.decreaseLocationCoordinate.bind(this);
		this.handleInsertLocationSubmit = this.handleInsertLocationSubmit.bind(this);
		this.handleDeleteLocation = this.handleDeleteLocation.bind(this);
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
		this.setState({canvas: canvas, context: context, canvasScale: scale});
	}

	inputsContainNull(inputs) {
		inputs.forEach(input => {
			if (input === null) {
				return true;
			}
		})
		return false;
	}

	coordinateInputsAreValid(inputX, inputY, maximumX, maximumY) {
		if (isNaN(inputX) || isNaN(inputY) || inputX > maximumX || inputY > maximumY || inputX <= 0 || inputY <= 0) {
			return false;
		} else {
			return true;
		}
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
		this.setState({currentRoadStartX: null, currentRoadStartY: null, currentRoadEndX: null, currentRoadEndY: null, 
			currentRoadName: null, currentRoadWeight: null}, () => {
			this.drawCanvas(canvas, context, this.state.roads, this.state.locations)
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
			roadName: this.state.currentLocationRoadName
		};

		this.state.locations.set(this.state.currentLocationRoadName + "-" + this.state.currentLocationName, newLocation)
		this.setState({currentLocationX: -1, currentLocationY: -1, currentLocationName: null, currentLocationRoadName: null,
			currentLocationRoadNameValid: false}, () => {
			this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations)
		});

		// Clear the currently displayed inputs
		this.clearLocationForm();

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

	drawCanvas(canvas, context, roads, locations) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		this.drawRoads(canvas, context, roads);
		this.drawLocations(canvas, context, locations)
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

	drawLocations(canvas, context, locations) { // locations is [{x, y, name}]
		locations.forEach(location => {
			context.beginPath();
			context.arc(location.x, location.y, 3, 0, 2 * Math.PI);
			context.fill();
			context.stroke();
		})
	}

	handleDeleteRoad(event) {
		event.preventDefault();
		this.state.roads.delete(this.state.currentRoadName);
		this.state.locations.forEach((location, key) => {
			if (location.roadName === this.state.currentRoadName) {
				this.state.locations.delete(key);
			}
		})
		this.setState({currentRoadStartX: null, currentRoadStartY: null, currentRoadEndX: null, currentRoadEndY: null, 
			currentRoadName: null, currentRoadWeight: null}, () => {
			this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations);
		});
		// Clear the currently displayed inputs
		this.clearRoadForm(false);
	}

	handleDeleteLocation(event) {
		event.preventDefault();
		this.state.locations.delete(this.state.currentLocationRoadName + "-" + this.state.currentLocationName);
		this.setState({currentLocationX: -1, currentLocationY: -1, currentLocationName: null, currentLocationRoadName: null,
			currentLocationRoadNameValid: false}, () => {
			this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations);
		});
		// Clear the currently displayed inputs
		this.clearLocationForm();
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
		const newX = this.state.currentLocationX + (dx / 100); // change the 1 to dx/100
		const newY = (dx !== 0) ? this.state.currentLocationY + ((dx / 100) * (dy / dx)) : this.state.currentLocationY + (dy / 100);

		// let newLocation = {
		// 	x: Number(newX),
		// 	y: Number(newY),
		// 	name: this.state.currentLocationRoadName
		// };

		// this.state.locations.set(this.state.currentLocationRoadName + "-" + this.state.currentLocationName, newLocation)
		if ((currentRoad.endX - newX) >= Math.min(0, dx) && (currentRoad.endX - newX) <= Math.max(0, dx) && 
			(currentRoad.endY - newY) >= Math.min(0, dy) && (currentRoad.endY - newY) <= Math.max(0, dy)) {
			this.setState({currentLocationX: newX, currentLocationY: newY}, () => {
				this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations)
			});
		}
	}

	decreaseLocationCoordinate(event) {
		const currentRoad = this.state.roads.get(this.state.currentLocationRoadName);
		const dx = currentRoad.endX - currentRoad.startX;
		const dy = currentRoad.endY - currentRoad.startY;
		const newX = this.state.currentLocationX - (dx / 100); // change the 1 to dx/100
		const newY = (dx !== 0) ? this.state.currentLocationY - ((dx / 100) * (dy / dx)) : this.state.currentLocationY - (dy / 100);

		// let newLocation = {
		// 	x: Number(newX),
		// 	y: Number(newY),
		// 	name: this.state.currentLocationRoadName
		// };

		// this.state.locations.set(this.state.currentLocationRoadName + "-" + this.state.currentLocationName, newLocation)
		if ((currentRoad.endX - newX) >= Math.min(0, dx) && (currentRoad.endX - newX) <= Math.max(0, dx) && 
			(currentRoad.endY - newY) >= Math.min(0, dy) && (currentRoad.endY - newY) <= Math.max(0, dy)) {
			this.setState({currentLocationX: newX, currentLocationY: newY}, () => {
				this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations)
			});
		}
	}

	render() {
		const roadBeingEdited = this.state.roads.has(this.state.currentRoadName);
		const RoadFormButtons = roadBeingEdited ? 
		(<FormItem>
			<Button onClick={this.handleInsertRoadSubmit} style={{marginRight:"10px"}}>
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
			<Button onClick={this.handleInsertLocationSubmit} style={{marginRight:"10px"}}>Edit Location</Button>
			<Button onClick={this.handleDeleteLocation}>Delete Location</Button>
		</FormItem>) :
		(<FormItem display={this.state.currentLocationRoadNameValid ? "" : "none"}>
			<Button onClick={this.handleInsertLocationSubmit}>Insert Location</Button>
		</FormItem>);

		return (
			<PageContainer>
				<InsertionContainer>
					<InsertRoadContainer>
						<InsertRoadForm>
							<FormTitle>Insert/Edit Road</FormTitle>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>Road Name:</InputDescription>
								<FormInput type="text" boxWidth="200px" name="currentRoadName" onChange={this.handleRoadInputChange}></FormInput>
							</FormItem>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>Start Coordinate (X,Y):</InputDescription>
								<InputText>(</InputText>
								<FormInput type="text" name="currentRoadStartX" onChange={this.handleRoadInputChange}></FormInput>
								<InputText> , </InputText>
								<FormInput type="text" name="currentRoadStartY" onChange={this.handleRoadInputChange}></FormInput>
								<InputText>)</InputText>
							</FormItem>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>End Coordinate (X,Y):</InputDescription>
								<InputText>(</InputText>
								<FormInput type="text" name="currentRoadEndX" onChange={this.handleRoadInputChange}></FormInput>
								<InputText> , </InputText>
								<FormInput type="text" name="currentRoadEndY" onChange={this.handleRoadInputChange}></FormInput>
								<InputText>)</InputText>
							</FormItem>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>Time to Travel:</InputDescription>
								<FormInput type="text" name="currentRoadWeight" onChange={this.handleRoadInputChange}></FormInput>
								<InputText> minutes</InputText>
							</FormItem>
							{RoadFormButtons}
						</InsertRoadForm>
					</InsertRoadContainer>
					<InsertLocationContainer>
						<InsertLocationForm>
						<FormTitle>Insert Location</FormTitle>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>Road Name:</InputDescription>
								<FormInput type="text" boxWidth="200px" name="currentLocationRoadName" onChange={this.handleLocationInputChange}></FormInput>
							</FormItem>
							<FormItem style={{marginBottom:"10px"}} display={this.state.currentLocationRoadNameValid ? "" : "none"}>
								<InputDescription>Location Name:</InputDescription>
								<FormInput type="text" boxWidth="200px" name="currentLocationName" onChange={this.handleLocationInputChange}></FormInput>
							</FormItem>
							<FormItem style={{marginBottom:"10px"}} display={this.state.currentLocationRoadNameValid ? "" : "none"}>
								<InputDescription>Coordinates (X,Y):</InputDescription>
								<InputText>(</InputText>
								<InputText id="currentLocationX" color="orange">{this.state.currentLocationX.toFixed(2)}</InputText>
								<InputText> , </InputText>
								<InputText id="currentLocationY" color="orange">{this.state.currentLocationY.toFixed(2)}</InputText>
								<InputText style={{marginRight:"10px"}}>)</InputText>
								<svg height="34" width="14">
									<polygon points="0,14 14,14 7,0" style={{fill:"orange"}} onClick={this.increaseLocationCoordinate} />
									<polygon points="0,20 14,20 7,34" style={{fill:"orange"}} onClick={this.decreaseLocationCoordinate}/>
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
						style={{marginTop:"6px", marginLeft:"6px"}}
					/>
				</MapContainer>
			</PageContainer>
		);
	}
}

export default CreateMapPage;