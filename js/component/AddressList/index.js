import React from 'react';
import Address from '../Address';
import ModalAddress from '../ModalAddress';

export default class AddressList extends React.Component {
	constructor(props){
		super(props);
		Organizator.AddressList = this;

		this.state = {
			list: Organizator.pdb.getCollection('key').data
		}

		this.onAddressClicked = this.onAddressClicked.bind(this);
		this.onDeleteItem = this.onDeleteItem.bind(this);
	}

	updateList(){
		this.setState({ list: Organizator.pdb.getCollection('key').data });
	}

	push(address){
		if(!this.state.list.find(item => item.address == address.address)){
			this.setState({ list: Organizator.pdb.getCollection('key').data });
		}
	}

	onAddressClicked(address){
		const addressObject = this.state.list.find(item => item.address == address);
		Organizator.ModalManager.push(<ModalAddress address={addressObject} />);
	}

	onDeleteItem(address){
		if(confirm('Are you sure you want to delete this address from your wallet?')){
			let addressObject = Organizator.pdb.getCollection('key').findOne({ address: address});

			if(addressObject !== null){
				Organizator.pdb.getCollection('key').remove(addressObject);
				Organizator.pdb.saveDatabase();
				this.updateList();
			}
		}
	}

	render(){
		return (
			<div class={'wallet__content__in ' + (this.props.isHidden ? 'hide' : '') }>
				<div class="wallet__addresses">
					{
						this.state.list.length ?
			            <div class="addressCollection">
			            	{this.state.list.map(address => (
			            		<Address  { ...address } onAddressClicked={this.onAddressClicked} onDeleteItem={this.onDeleteItem} />
					        ))}
			            </div>
			            :
			            <div class="addressCollectionSectionIfEmpty">
			              You have no address · <a onClick={() => Organizator.ActionBar.onImportAddress()}>Add one?</a>
			            </div>
					}
	          	</div>
          	</div>
		);
	}
}