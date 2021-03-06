import React from 'react';
import Modal from '../Modal';
import sjcl from 'sjcl';

export default class ModalSetPassword extends Modal {
	constructor(props){
		super(props);

		this.ref_field_first = React.createRef();
		this.ref_field_second = React.createRef();

		this.state = {
			validationResult: {
				isValid: true
			}
		};

		this.renderErrors = this.renderErrors.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}

	onSubmit(event){
		event.preventDefault();
		let element = event.currentTarget;

		// validate
		let validationResult = Organizator.Validator.validateForm(element);
		this.setState({ validationResult: validationResult });
		if(!validationResult.isValid){
			return false;
		}

		let field__password = element.querySelector('[name="auth_setpassword[first]"]');
		let challenge = sjcl.encrypt(field__password.value, Organizator.Wallet.message);

		Organizator.pdb.getCollection('auth').clear();
		Organizator.pdb.getCollection('auth').insert({
			challenge: challenge
		});
    	Organizator.Wallet.setState({
			challenge: challenge
		});
		Organizator.Wallet.unlock(field__password.value);
		Organizator.pdb.saveDatabase();
	}

	renderErrors(ref){
		let itemValidationResult = this.state.validationResult.results.find(function(result){
			return result.item == ref.current;
		});

		if(!itemValidationResult || itemValidationResult.isValid){
			return null;
		}

		return (
			<div class="row adviceRow">
				<div class="right advice advice--red">
					<ul class="adviceList">
						{Object.keys(itemValidationResult.constraints).map(key => itemValidationResult.constraints[key].errors.map(e => <li>{e}</li>))}
					</ul>
				</div>
			</div>
		);
	}

	render(){
		this.props.id = 'set_password';
		this.props.title = 'Encrypt Your Wallet';
		this.props.isClosable = false;
		this.props.classes = ['modal__setPasswordForm'];
		this.props.content = (
			<React.Fragment>
				<form name="auth_setpassword" class="modal__setPasswordForm__form" autocomplete="off" spellcheck="false" novalidate="novalidate" onSubmit={this.onSubmit}>
					<div class="notice notice--yellow">
						Enter a password to protect your wallet
					</div>
					<div class="form-group" for="auth_setpassword_first">
						<div class="row">
							<div class="left">
								<label for="auth_setpassword_first" class="label">Password</label>
							</div>
							<div class="right">
								<input ref={this.ref_field_first} id="auth_setpassword_first" name="auth_setpassword[first]" type="password" class="input" org-validate="@length(min=8, max=4096) && @same(with='#auth_setpassword_second', base=true)" />
							</div>
						</div>
						{!this.state.validationResult.isValid ?
						this.renderErrors(this.ref_field_first)
						: null}
					</div>
					<div class="form-group" for="auth_setpassword_second">
						<div class="row">
							<div class="left">
								<label for="auth_setpassword_second" class="label">Password (again)</label>
							</div>
							<div class="right">
								<input ref={this.ref_field_second} id="auth_setpassword_second" name="auth_setpassword[second]" type="password" class="input" org-validate="@notblank && @same(with='#auth_setpassword_first')" />
							</div>
						</div>
						{!this.state.validationResult.isValid ?
						this.renderErrors(this.ref_field_second)
						: null}
					</div>
					<div class="form-group" for="auth_setpassword_submit">
						<div class="row">
							<div class="right">
								<button id="auth_setpassword_submit" name="auth_setpassword[submit]" type="submit" class="button button--block button--primary">Save</button>
							</div>
						</div>
					</div>

				</form>
			</React.Fragment>
		);

		return <Modal { ...this.props }></Modal>
	}
}