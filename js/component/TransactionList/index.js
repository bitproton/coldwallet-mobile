import React from 'react';
import Transaction from '../Transaction';

export default class TransactionList extends React.Component {
	constructor(props){
		super(props);
		Organizator.TransactionList = this;

		this.state = {
			list: Organizator.pdb.getCollection('transaction').data
		}

		this.onClear = this.onClear.bind(this);
	}

	onClear(event){
		event.preventDefault();
		if(confirm("Are you sure you want to delete entire transaction history?")){
			Organizator.pdb.getCollection('transaction').clear();
			Organizator.pdb.saveDatabase();
			this.updateList();
		}
	}

	updateList(){
		this.setState({ list: Organizator.pdb.getCollection('transaction').data });
	}

	render(){
		return (
			<React.Fragment>
				<div class={'wallet__content__in ' + (this.props.isHidden ? 'hide' : '') }>
					{this.state.list.length ?
            		<div class="wallet__content__in__header wallet__tx__actionbar">
	            		<a class="cleartxhistorybutton" type="button" title="Clear transaction history" onClick={this.onClear}>clear</a>
		          	</div>
		          	: null}
					<div class="wallet__transactions">
						{
							this.state.list.length ?
			            	(
			            		<React.Fragment>
						            <div class="transactionCollection">
						            {this.state.list.map(transaction => (
					            		<Transaction { ...transaction } />
						            ))}
						            </div>
					            </React.Fragment>
				            )
				            :
				            <div class="transactionsSectionIfEmpty ">
				              There is no signed transactions yet
				            </div>
						}
		          </div>
	          </div>
          </React.Fragment>
		);
	}
}