import React from 'react';
import Modal from '../Modal';
import sjcl from 'sjcl';

export default class ModalAuth extends Modal {
	constructor(props){
		super(props);

		this.state = {
			error: false
		}

		this.onSubmit = this.onSubmit.bind(this);
	}

	onSubmit(event){
		event.preventDefault();
		let element = event.currentTarget;
		let field__password = element.querySelector('[name="auth_unlock[password]"]');

		try{
			this.setState({ error: false });

			if(sjcl.decrypt(field__password.value, Organizator.pdb.getCollection('auth').get(1).challenge) == Organizator.Wallet.message){
				Organizator.Wallet.unlock(field__password.value);
			}else{
				this.setState({ error: true });
			}
		}catch(e){
			this.setState({ error: true });
		}
	}

	render(){
		this.props.id = 'auth';
		this.props.title = 'Unlock Wallet';
		this.props.isClosable = false;
		this.props.classes = ['modal__auth'];
		this.props.content = (
			<React.Fragment>
				<form name="auth_unlock" class="modal__unlockForm__form" autocomplete="off" spellcheck="false" novalidate="novalidate" onSubmit={this.onSubmit}>
					{!this.state.error ?
					<div class="notice notice--yellow">
						Enter your password to unlock your wallet
					</div>
					:
					<div class="notice notice--red">
						Incorrect password
					</div>
					}
					<div class="form-group" for="auth_unlock_password">
						<div class="row">
							<div class="left">
								<label for="auth_unlock_password" class="label">Password</label>
							</div>
							<div class="right">
								<input id="auth_unlock_password" name="auth_unlock[password]" type="password" class="input" />
							</div>
						</div>
					</div>
					<div class="form-group" for="auth_unlock_submit">
						<div class="row">
							<div class="right">
								<button id="auth_unlock_submit" name="auth_unlock[submit]" type="submit" class="button button--block button--primary">Unlock</button>
							</div>
						</div>
					</div>
				</form>
			</React.Fragment>
		);

		return <Modal { ...this.props }></Modal>
	}
}