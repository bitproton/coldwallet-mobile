import React from 'react';
import ReactDOM from 'react-dom';
import Wallet from './component/Wallet';
import Validator from 'organizator-validator/Component/Validation/Validator';
import * as Constraint from './constraint/';

// for global component access and organize other things
window.Organizator = {};
Organizator.Validator = new Validator();

// add validation constraints
Organizator.Validator.addConstraint(Constraint.Organizator_Validation_Constraint_Checked);
Organizator.Validator.addConstraint(Constraint.Organizator_Validation_Constraint_Email);
Organizator.Validator.addConstraint(Constraint.Organizator_Validation_Constraint_Length);
Organizator.Validator.addConstraint(Constraint.Organizator_Validation_Constraint_NotBlank);
Organizator.Validator.addConstraint(Constraint.Organizator_Validation_Constraint_Numeric);
Organizator.Validator.addConstraint(Constraint.Organizator_Validation_Constraint_Select);
Organizator.Validator.addConstraint(Constraint.Organizator_Validation_Constraint_Url);
Organizator.Validator.addConstraint(Constraint.Organizator_Validation_Constraint_Same);
Organizator.Validator.addConstraint(Constraint.Organizator_src_Constraint_BitcoinAddress);
Organizator.Validator.addConstraint(Constraint.Organizator_src_Constraint_BitcoinPrivateKey);
Organizator.Validator.addConstraint(Constraint.Organizator_src_Constraint_Password);
Organizator.Validator.addConstraint(Constraint.Organizator_src_Constraint_RawTransactionHex);

// create persistent storage
Organizator.pdb = new loki("bitproton_bsv_coldwallet_mobile_persistent.db", { 
  autoload: true,
  autosave: false,
  autoloadCallback : initReactApp
});

Organizator.pdb.addCollection('auth');
Organizator.pdb.addCollection('key');
Organizator.pdb.addCollection('transaction');

// react init
function initReactApp(){
	ReactDOM.render(<Wallet />, document.querySelector('#root'));
}