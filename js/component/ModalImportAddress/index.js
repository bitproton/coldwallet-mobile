import React from 'react';
import Modal from '../Modal';
import bitcoinjs from 'bitcoincashjs-lib';
import sjcl from 'sjcl';

export default class ModalImportAddress extends Modal {
	constructor(props){
		super(props);

		this.state = {
			address: '',
			validationResult: {
				isValid: true,
				results: []
			}
		};

		this.ref_field_label = React.createRef();
		this.ref_field_privateKey = React.createRef();

		this.onKeyChange = this.onKeyChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.renderErrors = this.renderErrors.bind(this);
	}

	onKeyChange(event){
		let element = event.currentTarget;
		let privateKey = element.value;

		try{
			var keypair = bitcoinjs.ECPair.fromWIF(privateKey);
            var publickey = keypair.getPublicKeyBuffer();
            var address = keypair.getAddress();

			this.setState({ address: address });
		}catch(e){
			this.setState({ address: '' });
		}
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

		let field__label = element.querySelector('[name="wallet_new_address[label]"]');
		let field__privateKey = element.querySelector('[name="wallet_new_address[privatekey]"]');

		try{
			var keypair = bitcoinjs.ECPair.fromWIF(field__privateKey.value);
            var publickey = keypair.getPublicKeyBuffer();
            var address = keypair.getAddress();
		}catch(e){
			return;
		}

		let newAddress = {
			label: field__label.value,
			privateKey: sjcl.encrypt(Organizator.Wallet.password, field__privateKey.value),
			address: address
		};

		if(Organizator.pdb.getCollection('key').findOne({address: address}) == null){
			Organizator.pdb.getCollection('key').insert(newAddress);
			Organizator.pdb.saveDatabase();
			Organizator.AddressList.updateList();
			this.close();
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
		this.props.id = 'address_import';
		this.props.title = 'Import Address';
		this.props.isClosable = true;
		this.props.classes = ['modal__newAddress'];

		this.props.content = (
			<React.Fragment>
				<div class="modal__newAddress__content">
					<form name="wallet_new_address" class="modal__newAddress__form" autocomplete="off" spellcheck="false" novalidate="novalidate" onSubmit={this.onSubmit}>
						<div class="form-group" for="wallet_new_address_label">
							<div class="row">
								<div class="left">
									<label for="wallet_new_address_label" class="label">Label</label>
								</div>
								<div class="right">
									<input ref={this.ref_field_label}id="wallet_new_address_label" name="wallet_new_address[label]" type="text" class="input" org-validate="@notblank" />
								</div>
							</div>
							{!this.state.validationResult.isValid ?
							this.renderErrors(this.ref_field_label)
							: null}
						</div>
						<div class="form-group" for="wallet_new_address_privatekey">
							<div class="row">
								<div class="left">
									<label for="wallet_new_address_privatekey" class="label">Private Key (WIF)</label>
								</div>
								<div class="right">
									<input ref={this.ref_field_privateKey} id="wallet_new_address_privatekey" name="wallet_new_address[privatekey]" type="text" class="input" org-validate="@notblank && @bitcoinprivatekey" onChange={this.onKeyChange} />
								</div>
							</div>
							{!this.state.validationResult.isValid ?
							this.renderErrors(this.ref_field_privateKey)
							: null}
						</div>
						<div class="form-group" for="wallet_new_address_address">
							<div class="row">
								<div class="left">
									<label for="wallet_new_address_address" class="label">Bitcoin Address</label>
								</div>
								<div class="right">
									<input id="wallet_new_address_address" name="wallet_new_address[address]" type="text" class="input" value={this.state.address} disabled readonly />
								</div>
							</div>
						</div>
						<div class="form-group" for="wallet_new_address_submit">
							<div class="row">
								<div class="right">
									<button id="wallet_new_address_submit" name="wallet_new_address[submit]" type="submit" class="button button--block button--primary">Import</button>
								</div>
							</div>
						</div>
					</form>
				</div>
			</React.Fragment>
		);

		return <Modal { ...this.props }></Modal>
	}
}