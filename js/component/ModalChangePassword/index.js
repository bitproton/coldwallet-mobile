import React from 'react';
import Modal from '../Modal';
import sjcl from 'sjcl';

export default class ModalChangePassword extends Modal {
	constructor(props){
		super(props);

		this.state = {
			error: false,
			validationResult: {
				isValid: true
			}
		};

		this.ref_field_current = React.createRef();
		this.ref_field_first = React.createRef();
		this.ref_field_second = React.createRef();

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

		let field__currentPassword = element.querySelector('[name="auth_changepassword[current]"');
		let field__newPassword = element.querySelector('[name="auth_changepassword[first]"');

		try{
			if(sjcl.decrypt(field__currentPassword.value, Organizator.pdb.getCollection('auth').get(1).challenge) == Organizator.Wallet.message){
				this.setState({ error: false });
				let challenge = sjcl.encrypt(field__newPassword.value, Organizator.Wallet.message);

				Organizator.pdb.getCollection('auth').clear();
				Organizator.pdb.getCollection('auth').insert({
					challenge: challenge
				});
		    	Organizator.Wallet.setState({
					challenge: challenge
				});
				Organizator.Wallet.unlock(field__newPassword.value);

				// reencrypt privatekeys with new password
				for(let key of Organizator.pdb.getCollection('key').data){
					key.privateKey = sjcl.encrypt(field__newPassword.value, sjcl.decrypt(field__currentPassword.value, key.privateKey));
				}

				Organizator.pdb.saveDatabase();
				this.close();
			}else{
				this.setState({ error: true });
			}
		}catch(e){
			this.setState({ error: true });
		}
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
		this.props.id = 'change_password';
		this.props.title = 'Change password';
		this.props.isClosable = true;
		this.props.classes = ['modal__changePassword'];

		this.props.content = (
			<React.Fragment>
				<form name="auth_changepassword" class="modal__changePasswordForm__form" autocomplete="off" spellcheck="false" novalidate="novalidate" onSubmit={this.onSubmit}>
					{this.state.error ?
					<div class="notice notice--red">
						Something went wrong
					</div>
					: null
					}
					<div class="form-group" for="auth_changepassword_current">
						<div class="row">
							<div class="left">
								<label for="auth_changepassword_current" class="label">Current Password</label>
							</div>
							<div class="right">
								<input ref={this.ref_field_current} id="auth_changepassword_current" name="auth_changepassword[current]" type="password" class="input" org-validate="@password" />
							</div>
						</div>
						{!this.state.validationResult.isValid ?
						this.renderErrors(this.ref_field_current)
						: null}
					</div>
					<div class="form-group" for="auth_changepassword_first">
						<div class="row">
							<div class="left">
								<label for="auth_changepassword_first" class="label">New Password</label>
							</div>
							<div class="right">
								<input ref={this.ref_field_first} id="auth_changepassword_first" name="auth_changepassword[first]" type="password" class="input" org-validate="@length(min=8, max=4096) && @same(with='#auth_changepassword_second', base=true)" />
							</div>
						</div>
						{!this.state.validationResult.isValid ?
						this.renderErrors(this.ref_field_first)
						: null}
					</div>
					<div class="form-group" for="auth_changepassword_second">
						<div class="row">
							<div class="left">
								<label for="auth_changepassword_second" class="label">New Password (again)</label>
							</div>
							<div class="right">
								<input ref={this.ref_field_second} id="auth_changepassword_second" name="auth_changepassword[second]" type="password" class="input" org-validate="@notblank && @same(with='#auth_changepassword_first')" />
							</div>
						</div>
						{!this.state.validationResult.isValid ?
						this.renderErrors(this.ref_field_second)
						: null}
					</div>
					<div class="form-group" for="auth_changepassword_submit">
						<div class="row">
							<div class="right">
								<button id="auth_changepassword_submit" name="auth_changepassword[submit]" type="submit" class="button button--block button--primary">Save</button>
							</div>
						</div>
					</div>
				</form>
			</React.Fragment>
		);

		return <Modal { ...this.props }></Modal>
	}
}