import React, { Component } from 'react';
import styled from 'styled-components';

const GridContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	justify-content: center;
	@media (max-width: 500px) {
		grid-template-columns: 1fr;
	}
`;

const GridItem = styled.div`
	margin: 0 30px 30px 30px;
	border-radius: 10px;
	border-width: 2px;
	border-color: #18A2B8;
	border-style: solid;
	display: flex;
	align-items: center;
	justify-content: center;
`

const MapOptionsContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 80%;
	padding-bottom: 30px;
`;

const ScrollableList = styled.div`
	max-height: 300px;
	width: 100%;
	overflow: scroll;
`;

const MapOption = styled.p`
	font-size: 20px;
	cursor: pointer;
	text-align: center;
	margin: 10px;
`;

const Divider = styled.div`
	height: 1px;
	width: 100%;
	background-color: white;
`;

const CenterContainer = styled.div`
	display: flex;
	justify-content: center;
`;

const Description = styled.p`
	font-size: 16px;
	text-align: center;
	margin: 10px;
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

class SelectMapPage extends Component {

	constructor(props) {
    super(props);

		const availableMaps = [
			{
				name: "Basic Small Map",
				id: "basic_small_map",
				imageLink: "https://www.w3schools.com/images/w3schools_green.jpg",
				description: "A simple map created for testing purposes",
				roadSectors: [
					{roadName: "Breezy Street", roadSectorId: "1", startX: 100, startY: 100, endX: 140, endY: 140, roadSectorLength: 3},
					{roadName: "Breezy Street", roadSectorId: "2", startX: 140, startY: 140, endX: 150, endY: 150, roadSectorLength: 1},
					{roadName: "Breezy Street", roadSectorId: "3", startX: 150, startY: 150, endX: 160, endY: 160, roadSectorLength: 1},
					{roadName: "Breezy Street", roadSectorId: "4", startX: 160, startY: 160, endX: 200, endY: 200, roadSectorLength: 3}
				],
				intersections: [
					{x: 100, y: 100, isEndpoint: true, locationId: "NOT_A_LOCATION", roadSectors: [
						{roadName: "Breezy Street", roadSectorId: "1", startX: 100, startY: 100, endX: 140, endY: 140, roadSectorLength: 3}
					]},
					{x: 140, y: 140, isEndpoint: false, locationId: "Breezy Street-Restaurant1", roadSectors: [
						{roadName: "Breezy Street", roadSectorId: "1", startX: 100, startY: 100, endX: 140, endY: 140, roadSectorLength: 3},
						{roadName: "Breezy Street", roadSectorId: "2", startX: 140, startY: 140, endX: 150, endY: 150, roadSectorLength: 1}
					]},
					{x: 150, y: 150, isEndpoint: false, locationId: "NOT_A_LOCATION", roadSectors: [
						{roadName: "Breezy Street", roadSectorId: "2", startX: 140, startY: 140, endX: 150, endY: 150, roadSectorLength: 1},
						{roadName: "Breezy Street", roadSectorId: "3", startX: 150, startY: 150, endX: 160, endY: 160, roadSectorLength: 1}
					]},
					{x: 160, y: 160, isEndpoint: false, locationId: "Breezy Street-Home1", roadSectors: [
						{roadName: "Breezy Street", roadSectorId: "3", startX: 150, startY: 150, endX: 160, endY: 160, roadSectorLength: 1},
						{roadName: "Breezy Street", roadSectorId: "4", startX: 160, startY: 160, endX: 200, endY: 200, roadSectorLength: 3}
					]},
					{x: 200, y: 200, isEndpoint: true, locationId: "NOT_A_LOCATION", roadSectors: [
						{roadName: "Breezy Street", roadSectorId: "4", startX: 160, startY: 160, endX: 200, endY: 200, roadSectorLength: 3}
					]},
				],
				locations: [
					{x: 140, y: 140, name:"Restaurant1", roadName: "Breezy Street", locationId: "Breezy Street-Restaurant1"},
					{x: 160, y: 160, name:"Home1", roadName: "Breezy Street", locationId: "Breezy Street-Home1"}
				]

			},
			{
				name: "Basic Medium Map",
				id: "basic_medium_map",
				imageLink: "https://www.w3schools.com/images/w3schools_green.jpg",
				description: "A medium sized map created for testing purposes"
			},
			{
				name: "Basic Large Map",
				id: "basic_large_map",
				imageLink: "https://www.w3schools.com/images/w3schools_green.jpg",
				description: "A large sized map created for testing purposes"
			}
		]

    this.state = {
			selectedMap: null,
			maps: availableMaps
    };
		this.handleClick = this.handleClick.bind(this);
		this.handleMapChoice = this.handleMapChoice.bind(this);
	}

	handleClick(event) {
		event.preventDefault();
		
		const clickedMap = this.state.maps.filter(map => {
			if (map.id === event.target.id) {
				return true;
			} else {
				return false;
			}
		})[0];

		const newMap = (this.state.selectedMap !== null && this.state.selectedMap === clickedMap) ? null : clickedMap;
		this.setState({selectedMap: newMap});
	}

	handleMapChoice(event) {
		event.preventDefault();

		this.props.updateCurrentGraph(this.state.selectedMap.roadSectors, this.state.selectedMap.intersections, 
			this.state.selectedMap.locations);
    this.props.setComponent("deliveryPage");
	}
	
	render() {
		const mapOptions = 
		(<ScrollableList>
			<MapOption id="basic_small_map" onClick={this.handleClick}>Basic Small Map</MapOption>
				<Divider />
				<MapOption id="basic_medium_map" onClick={this.handleClick}>Basic Medium Map</MapOption>
				<Divider />
			<MapOption id="basic_large_map" onClick={this.handleClick}>Basic Large Map</MapOption>
		</ScrollableList>);

		const currentMapInformation = (this.state.selectedMap === null) ? 
		(<div>
			Please select a map to see more information.
		</div>)
		: 
		(<div>
			<h1 style={{margin: "30px 0 10px 0", textAlign: "center"}}>{this.state.selectedMap.name}</h1>
			<CenterContainer>
				<img src={this.state.selectedMap.imageLink} alt="" style={{width: "300px", height: "auto"}}></img>
			</CenterContainer>
			<CenterContainer>
				<Description>{this.state.selectedMap.description}</Description>
			</CenterContainer>
			<CenterContainer>
				<Button style={{marginBottom: "10px"}} onClick={this.handleMapChoice}>Choose map!</Button>
			</CenterContainer>
		</div>);

		return (
			<GridContainer>
				<GridItem>
					<MapOptionsContainer>
						<h1 style={{margin: "30px 0 0 0", textAlign: "center"}}>Available Maps</h1>
						{mapOptions}
					</MapOptionsContainer>
				</GridItem>
				<GridItem>
					{currentMapInformation}
				</GridItem>
			</GridContainer>
		);
	}

}

export default SelectMapPage;