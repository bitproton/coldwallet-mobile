import React from 'react';
import ModalSign from '../ModalSign';

export default class Transaction extends React.Component {
	constructor(props){
		super(props);

		this.onClick = this.onClick.bind(this);
	}

	onClick(txid){
		let tx = Organizator.pdb.getCollection('transaction').findOne({ txid: txid });

		if(tx !== null){
			Organizator.ModalManager.push(<ModalSign { ...tx } stepFirst={true} stepSecond={true} />);
		}

		return;
	}

	render(){
		return (
			<div class="transactionCard" data-object="transaction" onClick={() => this.onClick(this.props.txid)}>
				<div class="transactionCard__date">
					{new Date(this.props.time * 1000).format('Y-m-d H:i')} 
				</div>
				<div class="transactionCard__details">
					<div class="heading">
						<i class="fa fa-arrow-right"></i> Sent
					</div>
				</div>
				<div class="transactionCard__valueDetails negative">
					<div class="base">
						<span class="value">{(this.props.totalSpent / 100000000).toFixed(8)}</span> <span class="abbr"></span>
					</div>
				</div>
			</div>
		);
	}
}