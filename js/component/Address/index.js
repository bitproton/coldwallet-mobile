import React from 'react';

export default class Address extends React.Component {
	constructor(props){
		super(props);
	}

	render(){
		return (
			<div class="addressCard" data-object="address" data-object-address={this.props.address}>
				<div class="addressCard__left">
					<div class="addressLabel">
						{this.props.label}
					</div>
					<div class="addressAddress">
						{this.props.address}
					</div>
				</div>
				<div class="addressCard__right">
					<div class="actionbar">
						<button class="button button--blue" onClick={() => this.props.onAddressClicked(this.props.address)}><i class="fa fa-info-circle"></i> Details</button>
						&nbsp;
						<button class="button button--red" onClick={() => this.props.onDeleteItem(this.props.address)}><i class="fa fa-trash"></i></button>
					</div>
				</div>
			</div>
		);
	}
}