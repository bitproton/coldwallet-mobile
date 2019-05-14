import React from 'react';
import bitcoinjs from 'bitcoincashjs-lib';
import Modal from '../Modal';
import TxView from '../TxView';
import sjcl from 'sjcl';
import jsQR from 'jsqr';
import QRious from 'qrious';

export default class ModalSign extends Modal {
	constructor(props){
		super(props);

		this.state = {
			stepFirst: this.props.stepFirst || false,
			stepSecond: this.props.stepSecond || false,
			stepThree: false,
			txBodyUnsigned: '',
			txMeta: '',
			txBodySigned: '',
			validationResult: {
				isValid: true
			}
		};

		this.ref_field_txbodyunsigned = React.createRef();
		this.ref_field_txmeta = React.createRef();
		this.ref_field_checkbox = React.createRef();

		this.checkboxChanged = this.checkboxChanged.bind(this);
		this.onTxChange = this.onTxChange.bind(this);
		this.onSignFormSubmit = this.onSignFormSubmit.bind(this);
		this.onDoneFormSubmit = this.onDoneFormSubmit.bind(this);
		this.textareaActionButtonClicked = this.textareaActionButtonClicked.bind(this);
		this.renderErrors = this.renderErrors.bind(this);
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

	checkboxChanged(n){
		if(n == 1){
			this.setState({ stepFirst : !this.state.stepFirst });
		}
		if(n == 2){
			this.setState({ stepSecond : !this.state.stepSecond });
		}
		if(n == 3){
			this.setState({ stepThree : !this.state.stepThree });
		}
	}

	onTxChange(event){
		let element = event.currentTarget;
		let form = element.parents('form')[0];
		let txbodyunsigned = form.querySelector('[name="tx_sign[txbodyunsigned]"').value;
		let txmeta = form.querySelector('[name="tx_sign[txmeta]"').value;

		if((txbodyunsigned == '' || txbodyunsigned == null) || (txmeta == '' || txmeta == null)){
            this.setState({ txView: '' });
            return;
        }

		try{
            var tx = new bitcoinjs.Transaction.fromHex(txbodyunsigned);
            txmeta = JSON.parse(txmeta);
        }catch(e){
            this.setState({ txView: '' });
        }

        let txb = new bitcoinjs.TransactionBuilder.fromTransaction(tx);

     	let i = 0;
        for(let input of txb.tx.ins){
            let txid = input.hash.reverse().toString('hex');
            input.hash.reverse();
            let index = input.index;
            let inputMeta = txmeta.filter(function(item){
                return item.txid == txid && item.vout == index;
            })[0];

            txb.tx.setInputScript(i, bitcoinjs.script.fromASM(inputMeta.scriptPubKey));
            i++;
        }

        let txView = this.txToJson(txb.tx, txmeta);
        txView = this.hydrateToView(txView);
        this.setState({ txView: txView });
	}

	onSignFormSubmit(event){
		event.preventDefault();
		let element = event.currentTarget;

		// validate
		let validationResult = Organizator.Validator.validateForm(element);
		this.setState({ validationResult: validationResult });
		if(!validationResult.isValid){
			return false;
		}

		let field__txBody = element.querySelector('[name="tx_sign[txbodyunsigned]"');
		let field__txMeta = element.querySelector('[name="tx_sign[txmeta]"');
		let txmeta = JSON.parse(field__txMeta.value);
		let tx = new bitcoinjs.Transaction.fromHex(field__txBody.value);
        let txb = new bitcoinjs.TransactionBuilder.fromTransaction(tx);
        var hashType = bitcoinjs.Transaction.SIGHASH_ALL | bitcoinjs.Transaction.SIGHASH_BITCOINCASHBIP143;

        let i = 0;
        for(let input of txb.tx.ins){
    		var txid = input.hash.reverse().toString('hex');
            /* 
             * [NOTEID:1]
             * No good solution is found to reverse a typed array without modifying the original one.
             * input.hash.slice().reverse() seems not working as expected on Chrome.
             * So rereverse is needed.
             */
            input.hash.reverse(); 
            let index = input.index;
            let inputMeta = txmeta.filter(function(item){
                return item.txid == txid && item.vout == index;
            })[0];

            let type = bitcoinjs.script.classifyOutput(bitcoinjs.script.fromASM(inputMeta.scriptPubKey));
                    
            txb.tx.setInputScript(i, bitcoinjs.script.fromASM(inputMeta.scriptPubKey));

            switch(type){
                case 'pubkey':
                    var pubKey = bitcoinjs.ECPair.fromPublicKeyBuffer(bitcoinjs.script.decompile(bitcoinjs.script.fromASM(inputMeta.scriptPubKey))[0]);
                    var address = pubKey.getAddress();
                    break;
                case 'pubkeyhash':
                case 'scripthash':
                    var address = bitcoinjs.address.fromOutputScript(bitcoinjs.script.fromASM(inputMeta.scriptPubKey)).toString();
                    break;
            }

            let _keyPair = Organizator.pdb.getCollection('key').findOne({
                address: address
            });

            if(_keyPair !== undefined && _keyPair !== null){
                var keyPair = bitcoinjs.ECPair.fromWIF(sjcl.decrypt(Organizator.Wallet.password, _keyPair.privateKey));
                txb.sign(i, keyPair, null, hashType, parseInt(inputMeta.amount));
	            
            }else{
                alert('No key pair was found to sign this transaction.');
                return false; // No key pair
            }

            i++;
        }

        let txbb = txb.build();

        // view
        let txview = this.hydrateToView(this.txToJson(txb.tx, txmeta));
        txview.time = Math.round((new Date().getTime()) / 1000);
        txview.txid = txb.tx.getId();

        let txObject = {};
        txObject.time = txview.time;
        txObject.txid = txview.txid;
        txObject.txbodyunsigned = field__txBody.value;
        txObject.txmeta = txmeta;
        txObject.totalSpent = txview.totalSpent;

        this.setState({
        	stepFirst: true,
        	stepSecond: true,
        	tx: txObject,
        	txView: txview,
        	txBodyUnsigned: field__txBody.value,
        	txMeta: txmeta,
        	txBodySigned: txbb.toHex()
        });
	}

	onDoneFormSubmit(event){
		event.preventDefault();

		if(Organizator.pdb.getCollection('transaction').findOne({ txid: this.state.tx.txid }) == null){
			Organizator.pdb.getCollection('transaction').insert(this.state.tx);
			Organizator.pdb.saveDatabase();
			Organizator.TransactionList.updateList();
		}

		Organizator.Wallet.setState({ tab: 'transactions' });
		this.close();
	}

	textareaActionButtonClicked(event){
	    let element = event.currentTarget;
	    let command = element.getAttribute('data-cmd');
	    let actionButtons = element.parents('.actionButtons')[0];
	    let input = document.querySelector('#' + actionButtons.getAttribute('for'));
	    let formGroup = input.parents('.form-group')[0];
	    let label = formGroup.querySelector('label').innerHTML;

	    switch(command){
	        case 'copy':
	            input.select();
	            document.execCommand('copy');

	            element.innerHTML = 'copied!';

	            setTimeout(function(){
	                element.innerHTML = 'copy';
	            }, 2000);
	            break;
	        case 'toqrcode':
	        	var props = {};
	            var qrcode = new QRious({
	              value: input.value,
	              size: 400
	            });

	            props.id = 'modal__qr';
	            props.title = 'QR Code';
	            props.isClosable = true;
	            props.content = (
					<div class="jsonForm formStd">
						<div class="form-group">
							<div class="row">
								<div class="left">
									<label class="label">{label}</label>
								</div>
								<div class="right">
									<img style={{maxWidth: '100%', display:'block', margin:'0 auto'}} src={qrcode.toDataURL()} />
								</div>
							</div>
						</div>
					</div>
				);

				Organizator.ModalManager.push(<Modal { ...props } />);
	            break;
	        case 'importtxt':
	            var fileinputElement = document.createElement('input');
	            fileinputElement.setAttribute('type', 'file');

	            var reader = new FileReader();

	            reader.onload = function(e) {
	                reader.result;
	                input.dispatchEvent(new Event('input'));
	            }
	            
	            fileinputElement.addEventListener('change', function(event){
	                var file = fileinputElement.files[0];

	                reader.readAsText(file);
	            });

	            fileinputElement.click();
	            break;
	        case 'importqrcode':
	            var fileinputElement = document.createElement('input');
	            fileinputElement.setAttribute('type', 'file');

	            var reader = new FileReader();

	            reader.onload = function(e) {
	                var image = new Image;
	                image.src = e.target.result;
	                const canvas = document.createElement('canvas');
	                const ctx = canvas.getContext("2d");

	                image.onload = function(){
	                    ctx.canvas.width = image.width;
	                    ctx.canvas.height = image.height;
	                    ctx.drawImage(image, 0, 0, image.width, image.height);

	                    var imageData = ctx.getImageData(0, 0, image.width, image.height);
	                    var result = jsQR(imageData.data, image.width, image.height);

	                    if(result){
	                        input.value = result.data;
	                    }else{
	                        input.value = 'Decode failed.';
	                    }

	                    input.dispatchEvent(new Event('input'));
	                }
	            }
	            
	            fileinputElement.addEventListener('change', function(event){
	                var file = fileinputElement.files[0];
	                reader.readAsDataURL(file);
	            });

	            fileinputElement.click();
	            break;
	        case 'scanqrcode':
	            var content = Organizator.Nunjucks.renderString(tpl_qrCodeScannerModal, {
	                label: label
	            });

	            var modal = Organizator.applications.ModalManager.new({
	                content: content,
	                closeOnOverlayClick: true,
	            });

	            var qrCodeScannerCanvas = modal.element.querySelector('canvas.qrCodeScanner');
	            var qrCodeWebcamScanner = new QRCodeWebcamScanner({
	                canvas: qrCodeScannerCanvas,
	                threshold: 3
	            });

	            modal.onbeforeclose = function(){
	                qrCodeWebcamScanner.stop.call(qrCodeWebcamScanner);

	                return true;
	            };

	            qrCodeWebcamScanner.onsuccess = (function(data){
	                input.value = data;
	                Organizator.applications.ModalManager.remove(modal);
	                input.dispatchEvent(new Event('input'));
	            }).bind(this);

	            modal.show();
	            qrCodeWebcamScanner.request();
	            break;
	        case 'txbodytotxt':
	            var blob = new Blob([input.value], {type:'text/plain'});
	            var filename = 'tx-body_' + Math.round((new Date().getTime()) / 1000);
	            var a = document.createElement('a');

	            a.href = window.URL.createObjectURL(blob);
	            a.setAttribute('download', filename);
	            a.style.display = 'none';
	            a.click();

	            break;
	        case 'txmetatotxt':
	            var blob = new Blob([input.value], {type:'text/plain'});
	            var filename = 'tx-meta_' + Math.round((new Date().getTime()) / 1000);
	            var a = document.createElement('a');

	            a.href = window.URL.createObjectURL(blob);
	            a.setAttribute('download', filename);
	            a.style.display = 'none';
	            a.click();

	            break;
	        case 'txbodytojson':
	        	var props = {};
	            var tx = new bitcoinjs.Transaction.fromHex(input.value);

	            props.id = 'modal__json';
	            props.title = 'JSON';
	            props.isClosable = true;
	            props.content = (
					<div class="jsonForm formStd">
						<div class="form-group">
							<div class="row">
								<div class="left">
									<label class="label">{label}</label>
								</div>
								<div class="right">
									<textarea class="input" readonly>{JSON.stringify(this.decodeToBitcoindAwareFormat(tx), null, '  ')}</textarea>
								</div>
							</div>
						</div>
					</div>
				);

				Organizator.ModalManager.push(<Modal { ...props } />);
	            break;
	        case 'txmetatojson':
	        	var props = {};
	            props.id = 'modal__json';
	            props.title = 'JSON';
	            props.isClosable = true;
	            props.content = (
					<div class="jsonForm formStd">
						<div class="form-group">
							<div class="row">
								<div class="left">
									<label class="label">{label}</label>
								</div>
								<div class="right">
									<textarea class="input" readonly>{JSON.stringify(JSON.parse(this.hexToString(input.value)), null, '  ')}</textarea>
								</div>
							</div>
						</div>
					</div>
				);

				Organizator.ModalManager.push(<Modal { ...props } />);
	            break;
	    }
	}


	render(){
		this.props.id = 'address_sign';
		this.props.title = 'Sign a Transaction';
		this.props.isClosable = true;
		this.props.classes = ['modal__txSignForm'];

		this.props.content = (
			<React.Fragment>
				<div class="stepsbar">
			      <ul class="breadcrumbs">
			        <li data-step="sign" class={!this.state.txBodySigned ? 'active' : ''}><a>1. Sign</a></li>
			        <li data-step="complete" class={this.state.txBodySigned ? 'active' : ''}><a>2. Broadcast</a></li>
			      </ul>
			    </div>
			    <div class="steps__content">
			      <div class={this.state.txBodySigned ? 'steps__slider signed' : 'steps__slider'}>
			        <div class={!this.state.txBodySigned ? 'step__content active' : 'step__content discard'} data-step="sign">

			          <form name="tx_sign" class="signTransactionForm" novalidate="novalidate" onSubmit={this.onSignFormSubmit}>
			            <div class="form-group">
			              <div class="row">
			                <div class="left">
			                  <div class="label">Complete these steps</div>
			                </div>
			                <div class="right">
			                  <ul class="userCheckList">
			                    <li class={this.state.stepFirst ? 'completed' : ''}>
			                      <label class="header">
			                        <span class="id">1.</span>
			                        <span class="title">Prepare Unsigned Transaction</span>
			                        <span class="checkbox"><input type="checkbox" onClick={() => this.checkboxChanged(1)} checked={this.state.stepFirst ? true : false} /></span>
			                      </label>
			                      <div class="content">
			                        <p>Prepare your unsigned transaction on an online device by using <a href="https://bitproton.com">BitProton.com</a> or another third party service.</p>
			                        <p>After preparing your transaction, fill the corresponding fields (<kbd>Transaction Body (Unsigned)</kbd> and <kbd>Transaction Meta</kbd>).</p> 
			                        <p class="note">You can use USB drives or QR codes for transferring the data.</p>
			                    </div></li>

			                    <li class={this.state.stepSecond ? 'completed' : ''}>
			                      <label class="header">
			                        <span class="id">2.</span>
			                        <span class="title">Fill the fields</span>
			                        <span class="checkbox"><input type="checkbox" onClick={() => this.checkboxChanged(2)}  checked={this.state.stepSecond ? true : false} /></span>
			                      </label>
			                      <div class="content">
			                        <p>Fill the corresponding fields (<kbd>Transaction Body (Unsigned)</kbd> and <kbd>Transaction Meta</kbd>).</p> 
			                        <p class="note">You can use USB drives or QR codes for transferring the data.</p>
			                      </div>
			                    </li>

			                  </ul>
			                </div>
			              </div>
			            </div>

			            <div class="form-group" for="tx_sign_txbodyunsigned">
			              <div class="row">
			                <div class="left">
			                  <label class="label" for="tx_sign_txbodyunsigned">Transaction Body (Unsigned)</label>
			                </div>
			                <div class="right">
			                  <div class="textareaContainer">
			                    <textarea ref={this.ref_field_txbodyunsigned} id="tx_sign_txbodyunsigned" name="tx_sign[txbodyunsigned]" class="input" rows="12" org-validate="@notblank && @rawtransactionhex" onClick={this.onTxChange} value={this.props.txbodyunsigned}></textarea>
			                    <ul class="actionButtons" for="tx_sign_txbodyunsigned">
			                      <li><a data-cmd="importtxt" onClick={this.textareaActionButtonClicked}>import txt</a></li>
			                      <li><a data-cmd="importqrcode" onClick={this.textareaActionButtonClicked}>import qr-code</a></li>
			                      {/*<li><a data-cmd="scanqrcode" onClick={this.textareaActionButtonClicked}>scan qr-code</a></li>*/}
			                    </ul>
			                  </div>
			                </div>
			              </div>
							{!this.state.validationResult.isValid ?
							this.renderErrors(this.ref_field_txbodyunsigned)
							: null}
			            </div>

			            <div class="form-group" for="tx_sign_txmeta">
			              <div class="row">
			                <div class="left">
			                  <label class="label" for="tx_sign_txmeta">Transaction Meta</label>
			                </div>
			                <div class="right">
			                  <div class="textareaContainer">
			                    <textarea ref={this.ref_field_txmeta} id="tx_sign_txmeta" name="tx_sign[txmeta]" class="input" rows="12" org-validate="@notblank" onClick={this.onTxChange} value={JSON.stringify(this.props.txmeta)} placeholder={JSON.stringify(JSON.parse('[{"txid":"","vout":0,"amount":0.1,"scriptPubKey":""}]'), null, '  ')}></textarea>
			                    <ul class="actionButtons" for="tx_sign_txmeta">
			                      <li><a data-cmd="importtxt" onClick={this.textareaActionButtonClicked}>import txt</a></li>
			                      <li><a data-cmd="importqrcode" onClick={this.textareaActionButtonClicked}>import qr-code</a></li>
			                      {/*<li><a data-cmd="scanqrcode" onClick={this.textareaActionButtonClicked}>scan qr-code</a></li>*/}
			                    </ul>
			                  </div>
			                </div>
			              </div>
							{!this.state.validationResult.isValid ?
							this.renderErrors(this.ref_field_txmeta)
							: null}
			            </div>

			            {this.state.txView ?
		            	<TxView { ...this.state.txView } />
		            	: null
			            }

			            <div class="form-group" for="confirm">
			              <div class="row">
			                <div class="left">
			                  <label class="label">Confirm</label>
			                </div>
			                <div class="right">
			                  <label class="input">
			                    <input type="checkbox" org-validate="@checked" name="confirm" required="" /> I confirm to sign the transaction above
			                  </label>
			                </div>  
			              </div>
							{!this.state.validationResult.isValid ?
							this.renderErrors(this.ref_field_checkbox)
							: null}
			            </div>

			            <div class="form-group actionbar">
			              <div class="row">
			                <div class="right">
			                  <button type="submit" class="button button--block button--primary">Sign Transaction</button>
			                </div>
			              </div>
			            </div>

			          </form>

			        </div>

			        <div class={this.state.txBodySigned ? 'step__content active' : 'step__content discard'} data-step="complete">
			          <form name="tx_complete" class="signTransactionForm" novalidate="novalidate" onSubmit={this.onDoneFormSubmit}>

			            <div class="notice notice--green">
			              Transaction has been signed successfully
			            </div>

			            {this.state.txView ?
		            	<TxView { ...this.state.txView } />
		            	: null
			            }

			             <div class="form-group" for="tx_complete_txbodysigned">
			              <div class="row">
			                <div class="left">
			                  <label class="label" for="tx_complete_txbodysigned">Transaction Body (Signed)</label>
			                </div>
			                <div class="right">
			                  <div class="textareaContainer">
			                    <textarea id="tx_complete_txbodysigned" name="tx_complete[txbodysigned]" class="input" rows="12" org-validate="@notblank && @rawtransactionhex" value={this.state.txBodySigned} readonly></textarea>
			                    <ul class="actionButtons" for="tx_complete_txbodysigned">
			                      <li><a data-cmd="copy" onClick={this.textareaActionButtonClicked}>copy</a></li>
			                      <li><a data-cmd="txbodytotxt" onClick={this.textareaActionButtonClicked}>txt</a></li>
			                      <li><a data-cmd="toqrcode" onClick={this.textareaActionButtonClicked}>qr-code</a></li>
			                      <li><a data-cmd="txbodytojson" onClick={this.textareaActionButtonClicked}>json</a></li>
			                    </ul>
			                  </div>
			                </div>
			              </div>
			            </div>

			            <div class="form-group">
			              <div class="row">
			                <div class="left">
			                  <div class="label">Complete these steps</div>
			                </div>
			                <div class="right">
			                  <ul class="userCheckList">

			                    <li class={this.state.stepThree ? 'completed' : ''}>
			                      <label class="header">
			                        <span class="id">1.</span>
			                        <span class="title">Broadcast</span>
			                        <span class="checkbox"><input type="checkbox" onChange={() => this.checkboxChanged(3)} /></span>
			                      </label>
			                      <div class="content">
			                        <p>Fill the corresponding field (<kbd>Transaction Body (Signed)</kbd>) on the form you have prepared on <a href="#">BitProton.com</a> or another transaction broadcasting service; and broadcast it.</p> 
			                        <p class="note">You can use USB drives or QR codes while transferring the data to an online device.</p>
			                      </div>
			                    </li>

			                  </ul>
			                </div>
			              </div>
			            </div>
			            <div class="form-group actionbar">
			              <div class="row">
			                <div class="right">
			                  <button type="submit" class="button button--block button--primary">Done</button>
			                </div>
			              </div>
			            </div>
			          </form>
			        </div>
			      </div>
			    </div>
			</React.Fragment>
		);

		return <Modal { ...this.props }></Modal>
	}

    decodeFormat(tx){
        var result = {
            txid: tx.getId(),
            version: tx.version,
            locktime: tx.locktime,
        };

        return result;
    }

    decodeInput(tx, txmeta){
        var result = [];

        tx.ins.forEach(function(input, n){
            var vin = {
                txid: input.hash.reverse().toString('hex'),
                n : input.index,
                script: bitcoinjs.script.toASM(input.script),
                sequence: input.sequence,
                scriptPubKey: {
                    asm: bitcoinjs.script.toASM(input.script),
                    hex: input.script.toString('hex'),
                    type: bitcoinjs.script.classifyOutput(input.script),
                    addresses: [],
                }
            }

            input.hash.reverse(); // Find NOTEID:1 on this file 

            switch(vin.scriptPubKey.type){
                case 'pubkey':
                    let pubKey = bitcoinjs.ECPair.fromPublicKeyBuffer(bitcoinjs.script.decompile(bitcoinjs.script.fromASM(vin.scriptPubKey.asm))[0]);
                    
                    vin.scriptPubKey.addresses.push(pubKey.getAddress());
                    break;
                case 'pubkeyhash':
                case 'scripthash':
                    vin.scriptPubKey.addresses.push(bitcoinjs.address.fromOutputScript(input.script));
                    break;
            }

            if(typeof txmeta !== 'undefined'){
                vin.value = txmeta.filter(function(item){
                    return item.txid == vin.txid && item.vout == vin.n
                })[0].amount;
            }

            result.push(vin);
        });

        return result
    }

    decodeOutput(tx, network){
        var format = function(out, n, network){
            var vout = {
                value: out.value,
                n: n,
                scriptPubKey: {
                    asm: bitcoinjs.script.toASM(out.script),
                    hex: out.script.toString('hex'),
                    type: bitcoinjs.script.classifyOutput(out.script),
                    addresses: [],
                },
            };

            switch(vout.scriptPubKey.type){
                case 'pubkey':
                    let pubKey = bitcoinjs.ECPair.fromPublicKeyBuffer(bitcoinjs.script.decompile(bitcoinjs.script.fromASM(out.scriptPubKey.asm))[0]);
                    
                    out.scriptPubKey.addresses.push(pubKey.getAddress());
                    break;
                case 'pubkeyhash':
                case 'scripthash':
                    vout.scriptPubKey.addresses.push(bitcoinjs.address.fromOutputScript(out.script, network));
                    break;
            }
            return vout
        }

        var result = [];

        tx.outs.forEach(function(out, n){
            result.push(format(out, n, network));
        })

        return result
    }

    txHexToJson(hex, txmetaHex){
        let tx = bitcoinjs.Transaction.fromHex(hex);
        
        if(typeof txmetaHex !== 'undefined'){
            var txmeta = JSON.parse(this.hexToString(txmetaHex));
        } 

        return this.txToJson(tx, txmeta);
    }

    txToJson(tx, txmeta){
        return {
            format: this.decodeFormat(tx),
            vin: this.decodeInput(tx, txmeta),
            vout: this.decodeOutput(tx)
        }
    }

    hexToString(hex){
        var string = '';

        for (var i = 0; i < hex.length; i += 2) {
          string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }

        return string;
    }

    hydrateToView(transaction){
        transaction.fee = 0;
        transaction.totalSpent = 0;
        
        for(let input of transaction.vin){
            transaction.fee += input.value;
            transaction.totalSpent -= input.value;

            let addressSuccessCount = 0;
            for(let address of input.scriptPubKey.addresses){
                let keyPair = Organizator.pdb.getCollection('key').findOne({
                    address: address
                });

                if(keyPair !== undefined && keyPair !== null){
                    addressSuccessCount++;
                }
            }
            input.flags = (addressSuccessCount === input.scriptPubKey.addresses.length) ? ['canSign'] : ['cantSign'];
        }

        transaction.signable = transaction.vin.filter(function(input){return input.flags.indexOf('cantSign') !== -1}).length == 0 ? true : false;

        for(let output of transaction.vout){
            transaction.fee -= output.value;

            for(let address of output.scriptPubKey.addresses){
                for(let input of transaction.vin){
                    if(input.scriptPubKey.addresses.indexOf(address) !== -1){
                        output.flags = ['change'];
                        transaction.totalSpent += output.value;
                    }
                }
            }
        }

        return transaction;
    }

    decodeToBitcoindAwareFormat(tx){
        var result = {};

        result.txid = tx.getId();
        result.version = tx.version;
        result.locktime = tx.locktime;
        result.size = tx.byteLength();
        result.vsize = tx.virtualSize();
        result.vin = [];
        result.vout = this.decodeOutput(tx);

        tx.ins.forEach(function(input, n){
            var vin = {
                txid: input.hash.reverse().toString('hex'),
                n : input.index,
                script: bitcoinjs.script.toASM(input.script),
                sequence: input.sequence,
                scriptPubKey: {
                    asm: '',
                    hex: ''
                }
            }

            input.hash.reverse(); // Find NOTEID:1 on this file 

            result.vin.push(vin);
        });

        return result;
    }
}