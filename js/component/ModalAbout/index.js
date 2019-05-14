import React from 'react';
import Modal from '../Modal';

export default class ModalAbout extends Modal {
	constructor(props){
		super(props);

		this.props.id = 'about';
		this.props.title = 'About';
		this.props.isClosable = true;
		this.props.classes = ['modal__about'];
		this.props.content = (
			<React.Fragment>
				<p>BitProton Cold Wallet is an open-source Bitcoin wallet which helps you to manage your private keys and sign your transactions offline.</p>
				<p>Use this software on an OFFLINE device for maximum security.</p>
				<p>Source code: <a target="_blank" href="https://github.com/bitproton/coldwallet-mobile">https://github.com/bitproton/coldwallet-mobile</a></p>
				<p><a target="_blank" href="https://bitproton.com">BitProton.com</a> © 2019</p>
			</React.Fragment>
		);
	}

	render(){
		return <Modal { ...this.props }></Modal>
	}
}