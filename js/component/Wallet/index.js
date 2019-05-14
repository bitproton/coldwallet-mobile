import React from 'react';
import ActionBar from '../ActionBar';
import AddressList from '../AddressList';
import TransactionList from '../TransactionList';
import ModalManager from '../ModalManager';
import ModalAuth from '../ModalAuth';
import ModalSetPassword from '../ModalSetPassword';

export default class Wallet extends React.Component {
	constructor(props){
		super(props);
		Organizator.Wallet = this;
        
        // auth related
		this.message = '0BA45D3A9A324FCC60EC405CE777D82C399389B8550B22A4FE2747AAFD95D134';
		this.password = '';
		this.intervalId;
		this.idleTime = 100 * 60 * 10 * 2.5; // wallet will be locked in the case of 2.5 minute of inactivity

		// is password set before?
		var auth = Organizator.pdb.getCollection('auth').get(1);
		if(auth !== null){
			this.state = {
				tab: 'addresses',
				isLocked: true,
				challenge: auth.challenge
			};
        }else{
			this.state = {
				tab: 'addresses',
				isLocked: true,
				challenge: null
			};
        }

		this.lock = this.lock.bind(this);
		this.unlock = this.unlock.bind(this);
		this.resetInterval = this.resetInterval.bind(this);
		this.tabButtonClicked = this.tabButtonClicked.bind(this);
		this.bindEvents();
	}

	bindEvents(){
		window.addEventListener("click", this.resetInterval.bind(this));
		window.addEventListener("mousemove", this.resetInterval.bind(this));
        window.addEventListener("mousedown", this.resetInterval.bind(this));
        window.addEventListener("keypress", this.resetInterval.bind(this));
        window.addEventListener("DOMMouseScroll", this.resetInterval.bind(this));
        window.addEventListener("mousewheel", this.resetInterval.bind(this));
        window.addEventListener("touchmove", this.resetInterval.bind(this));
        window.addEventListener("MSPointerMove", this.resetInterval.bind(this));
    }

    lock(){
        this.setState({ isLocked: true });
        clearInterval(this.intervalId);
        this.intervalId = undefined;
        this.password = '';
    }

    unlock(password){
    	this.password = password;
    	this.setState({ isLocked: false });
    	this.intervalId = setInterval(this.lock, this.idleTime);
    }

    resetInterval(){
        if(typeof this.intervalId !== 'undefined'){ 
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            this.intervalId = setInterval(this.lock, this.idleTime);
        }
    }

	tabButtonClicked(tab){
		this.setState({ tab: tab });
	}

	render(){
		return (
			<React.Fragment>
				<div class="wallet">
					<div class="wallet__header">
						<div class="logo" >
							<img src="assets/bitproton-coldwallet-logo-cust2.svg" alt="Bitproton ColdWallet" />
						</div>
					</div>
					<div class="wallet__tabselector">
						<a class={ this.state.tab == 'addresses' ? 'active' : '' } onClick={() => this.tabButtonClicked('addresses')}>Addresses</a>
						<a class={ this.state.tab == 'transactions' ? 'active' : '' } onClick={() => this.tabButtonClicked('transactions')}>Transactions</a>
					</div>
					<div class="wallet__content">
						<AddressList isHidden={ this.state.tab != 'addresses' ? true : false } />
						<TransactionList isHidden={ this.state.tab != 'transactions' ? true : false } />
					</div>
					<div class="wallet__footer">
						<ActionBar />
					</div>
				</div>
				<div id="modals">
					{this.state.isLocked ?
						this.state.challenge ?
						<ModalManager><ModalAuth /></ModalManager>
						:
						<ModalManager><ModalSetPassword /></ModalManager>
					:
					<ModalManager />
					}
					
				</div>
			</React.Fragment>
		);
	}
}