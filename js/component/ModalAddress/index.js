import React from 'react';
import Modal from '../Modal';
import QRious from 'qrious';
import sjcl from 'sjcl';

export default class ModalAddress extends Modal {
	constructor(props){
		super(props);

		this.state = {
			isSecretKeyVisible: false
		};

		this.toggleSecretKey = this.toggleSecretKey.bind(this);
	}

	toggleSecretKey(){
		this.setState({ isSecretKeyVisible: !this.state.isSecretKeyVisible });
	}

	render(){
		this.props.id = 'address_detail';
		this.props.title = 'Address Details';
		this.props.isClosable = true;
		this.props.classes = ['modal__addressDetails'];

		const qrcode = new QRious({
          value: 'bitcoin:' + this.props.address.address,
          size: 200
        });

		this.props.content = (
			<React.Fragment>
				<div class="addressDetailsForm">
					<div class="form-group">
						<div class="row">
							<div class="left">
								<label class="label">Private Key (WIF)</label>
							</div>
							<div class="right">
								<div class="inputContainer">
									{!this.state.isSecretKeyVisible ?
									<React.Fragment>
										<input type="password" class="input" value={this.props.address.privateKey} readonly />
										<a class="inputAppendixButton" onClick={this.toggleSecretKey}>
											<i class="fa fa-eye"></i>
										</a>
									</React.Fragment>
									:
									<React.Fragment>
										<input type="text" class="input" value={Organizator.Wallet.state.isLocked ? 'locked' : sjcl.decrypt(Organizator.Wallet.password, this.props.address.privateKey)} readonly />
										<a class="inputAppendixButton" onClick={this.toggleSecretKey}>
											<i class="fa fa-eye-slash"></i>
										</a>
									</React.Fragment>
									}
								</div>
							</div>
						</div>
					</div>
					<div class="form-group ">
						<div class="row">
							<div class="left">
								<label class="label">Bitcoin Address</label>
							</div>
							<div class="right">
								<input type="text" class="input" value={this.props.address.address} readonly />
							</div>
						</div>
					</div>
					<div class="form-group">
						<div class="row">
							<div class="left">
								<label class="label">QR Code</label>
							</div>
							<div class="right">
								<div class="input qrCodeWrapper">
									<a href={'bitcoin:' + this.props.address.address}>
										<img class="qrCode" height="200" width="200" src={qrcode.toDataURL()} />
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);

		return <Modal { ...this.props }></Modal>
	}
}