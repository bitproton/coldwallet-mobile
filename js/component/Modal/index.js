import React from 'react';

export default class Modal extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			isClosable: this.props.isClosable
		};
		this.props.classes = this.props.classes || []; 

		this.close = this.close.bind(this);
	}

	close(){
		Organizator.ModalManager.pop(this);
	}

	render(){
		return (
			<div id={'mmModal_' + this.props.id} class="mmModal__wrapper active" ref={this.ref_wrapper}>
				<div class="mmModal">
					<div class={['mmModal__content', 'modal--std', this.props.classes].join(' ')}>
						<div class="modal--std__header">
							{this.props.title}
							{
								this.state.isClosable ? 
								<span class="modalCloseButton" onClick={this.close}><i class="fa fa-times"></i></span>
								: null
							}
						</div>
						<div class="modal--std__content">
							{this.props.content}
						</div>
					</div>
				</div>
				<div class="mmModal__overlay" onClick={ this.state.isClosable ? this.close : null}></div>
			</div>
		);
	}
}