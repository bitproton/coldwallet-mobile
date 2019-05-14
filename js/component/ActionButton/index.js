import React from 'react';

export default class ActionButton extends React.Component {
	constructor(props){
		super(props);
	}

	render(){
		return (
			<li onClick={this.props.onClick}>
				<div class="icon"><i class={"fa fa-" + this.props.icon}></i></div>
				<div class="label">{this.props.label}</div>
			</li>
		);
	}
}