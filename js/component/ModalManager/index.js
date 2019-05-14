import React from 'react';
import Modal from '../Modal';

export default class ModalManager extends React.Component {
	constructor(props){
		super(props);
		Organizator.ModalManager = this;

		this.state = {
			modals: []
		}
	}

	push(modal){
		this.setState({ modals: [...this.state.modals, modal] });
	}

	pop(modal){
		const newModals = this.state.modals.filter(function(item){
			return item.id !== modal.id;
		});

		this.setState({ modals: newModals });
	}

	render(){
		return (
			<React.Fragment>
	        	{this.state.modals.map(function(modal){
	        		return modal
	        	})}
				{this.props.children}
        	</React.Fragment>
		);
	}
}