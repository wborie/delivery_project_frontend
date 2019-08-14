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
	display: flex;
	flex-wrap: wrap;
`;

const InputDescription = styled.p`
	margin: auto 10px auto 0;
`;

const InputText = styled.p`
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
			currentLocationX: null,
			currentLocationY: null,
			currentLocationRoadName: null,
			currentLocationName: null,
			canvas: null,
			context: null,
			canvasScale: null,
			roads: new Map(),
			locations: new Map()
		};
		this.handleInsertRoadSubmit = this.handleInsertRoadSubmit.bind(this);
		this.handleInsertLocationSubmit = this.handleInsertLocationSubmit.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleDeleteRoad = this.handleDeleteRoad.bind(this);
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
	}

	handleInputChange(event) {
		const updatedStateObject = {};
		updatedStateObject[event.target.name] = event.target.value;

		if (event.target.name === "currentRoadName" && this.state.roads.has(event.target.value)) {
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
		//this.drawLocations(canvas, context, locations)
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

	handleDeleteRoad(event) {
		event.preventDefault();
		this.state.roads.delete(this.state.currentRoadName);
		this.setState({currentRoadStartX: null, currentRoadStartY: null, currentRoadEndX: null, currentRoadEndY: null, 
			currentRoadName: null, currentRoadWeight: null}, () => {
			this.drawCanvas(this.state.canvas, this.state.context, this.state.roads, this.state.locations)
		});
		// Clear the currently displayed inputs
		this.clearRoadForm(false);
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

		return (
			<PageContainer>
				<InsertionContainer>
					<InsertRoadContainer>
						<InsertRoadForm>
							<FormTitle>Insert/Edit Road</FormTitle>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>Road Name:</InputDescription>
								<FormInput type="text" boxWidth="200px" name="currentRoadName" onChange={this.handleInputChange}></FormInput>
							</FormItem>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>Start Coordinate (X,Y):</InputDescription>
								<InputText>(</InputText>
								<FormInput type="text" name="currentRoadStartX" onChange={this.handleInputChange}></FormInput>
								<InputText>) , </InputText>
								<InputText>(</InputText>
								<FormInput type="text" name="currentRoadStartY" onChange={this.handleInputChange}></FormInput>
								<InputText>)</InputText>
							</FormItem>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>End Coordinate (X,Y):</InputDescription>
								<InputText>(</InputText>
								<FormInput type="text" name="currentRoadEndX" onChange={this.handleInputChange}></FormInput>
								<InputText>) , </InputText>
								<InputText>(</InputText>
								<FormInput type="text" name="currentRoadEndY" onChange={this.handleInputChange}></FormInput>
								<InputText>)</InputText>
							</FormItem>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>Time to Travel:</InputDescription>
								<FormInput type="text" name="currentRoadWeight" onChange={this.handleInputChange}></FormInput>
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
								<FormInput type="text" boxWidth="200px" name="currentLocationRoadName" onChange={this.handleInputChange}></FormInput>
							</FormItem>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>Location Name:</InputDescription>
								<FormInput type="text" boxWidth="200px" name="currentLocationName" onChange={this.handleInputChange}></FormInput>
							</FormItem>
							<FormItem style={{marginBottom:"10px"}}>
								<InputDescription>Coordinates (X,Y):</InputDescription>
								<InputText>(</InputText>
								<FormInput type="text" name="currentLocationX" onChange={this.handleInputChange}></FormInput>
								<InputText>) , </InputText>
								<InputText>(</InputText>
								<FormInput type="text" name="currentLocationY" onChange={this.handleInputChange}></FormInput>
								<InputText>)</InputText>
							</FormItem>
							<FormItem>
								<Button onClick={this.handleInsertLocationSubmit}>Insert Location</Button>
							</FormItem>
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