import React from 'react';
import ReactDOM from 'react-dom';
import ActionButton from '../ActionButton';
import ModalAbout from '../ModalAbout';
import ModalImportAddress from '../ModalImportAddress';
import ModalSign from '../ModalSign';
import ModalChangePassword from '../ModalChangePassword';

export default class ActionBar extends React.Component {
	constructor(props){
		super(props);
		Organizator.ActionBar = this;

		this.onImportAddress = this.onImportAddress.bind(this);
		this.onSignTx = this.onSignTx.bind(this);
		this.onAbout = this.onAbout.bind(this);
	}

	onImportAddress(){
		Organizator.ModalManager.push(<ModalImportAddress />);
	}

	onSignTx(){
		Organizator.ModalManager.push(<ModalSign />);
	}

	onChangePassword(){
		Organizator.ModalManager.push(<ModalChangePassword />);
	}

	onAbout(){
		Organizator.ModalManager.push(<ModalAbout />);
	}

	render(){
		return (
			<ul class="actionbar">
				<ActionButton label="Import Address" icon="plus-square" onClick={this.onImportAddress} />
				<ActionButton label="Sign Tx" icon="pencil-square" onClick={this.onSignTx} />
				<ActionButton label="Change Password" icon="cog" onClick={this.onChangePassword} />
				<ActionButton label="About" icon="question" onClick={this.onAbout} />
			</ul>
		);
	}
}