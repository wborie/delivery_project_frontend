import React, { Component } from 'react';

import styled from 'styled-components';

const GridContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, 350px);
	grid-column-gap: 30px;
	justify-content: center;
`;

const GridItem = styled.div`
	width: 350px;
	height: 350px;
	margin-bottom: 30px;
	border-radius: 10px;
	border-width: 2px;
	border-color: #18A2B8;
	border-style: solid;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
`

const GridItemText = styled.p`
	text-align: center;
	margin: auto 20px auto 20px;
	font-size: 24px;

`

class MapTypePage extends Component {

	render() {
		return (
			<GridContainer>
				<GridItem onClick={() => this.props.setComponent("createMapPage")}>
					<GridItemText>Create Map with Manual Input</GridItemText>
				</GridItem>
				<GridItem onClick={() => this.props.setComponent("createMapFromImagePage")}>
					<GridItemText>Create Map from Image (coming soon)</GridItemText>
				</GridItem>
				<GridItem onClick={() => this.props.setComponent("selectMapPage")}>
					<GridItemText>Select a Default Map</GridItemText>
				</GridItem>
			</GridContainer>
		)
	}

}

export default MapTypePage;

/* <div>
				<div>123</div>
				<svg>
					<circle cx="100" cy="100" r="30" stroke="green" stroke-width="1" fill="yellow" />
				</svg>
		</div> */