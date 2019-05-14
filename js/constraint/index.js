import Organizator_Validation_Constraint from 'organizator-validator/Component/Validation/Constraint';
import Organizator_Validation_ConstraintValidationResultBuilder from 'organizator-validator/Component/Validation/ConstraintValidationResultBuilder';
import bitcoinjs from 'bitcoincashjs-lib';
import sjcl from 'sjcl';

export class Organizator_Validation_Constraint_Checked extends Organizator_Validation_Constraint {
  constructor() {
      super();

      this.messages['ERROR_NOT_VALID'] = 'This field must be checked.';
      this.messages['SUCCESS_VALID'] = 'This field is valid.';
  }

  static getName(){
      return 'checked';
  }

  validate(value, element) {
      var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

      resultBuilder.setValue(value);

      if(!element.checked){
          resultBuilder.addError(this.messages['ERROR_NOT_VALID']);
      }else{
          resultBuilder.addSuccess(this.messages['SUCCESS_VALID']);
      }

      return resultBuilder.getResult();
  }
}

export class Organizator_Validation_Constraint_Email extends Organizator_Validation_Constraint {
    constructor(strict) {
        super();

        this.regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])+$/;
        this.strict = strict;

        this.messages['ERROR_NOT_VALID'] = 'This value is not a valid email address.';
        this.messages['SUCCESS_VALID'] = 'This value %value% is a valid email address.';
        this.messages['WARNING_MX_NOT_CHECKED'] = 'This value %string% is a valid url record checks are also needed.';
    }

    static getName(){
        return 'email';
    }

    validate(value) {
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        resultBuilder.setValue(value);

        if(!this.regex.test(value)){
            resultBuilder.addError(this.messages['ERROR_NOT_VALID']);
        }else{
            resultBuilder.addSuccess(this.messages['SUCCESS_VALID']);

            if(!this.strict){
                resultBuilder.addWarning(this.messages['WARNING_MX_NOT_CHECKED']);
            }
        }

        return resultBuilder.getResult();
    }
}

export class Organizator_Validation_Constraint_Length extends Organizator_Validation_Constraint {
    constructor(options) {
        super();

        Object.assign(this, options);

        this.messages['TOO_SHORT_ERROR'] = 'This value is too short. It must have ' + this.min + ' characters or more.';
        this.messages['TOO_SHORT_SUCCESS'] = 'This value is valid.';
        this.messages['TOO_LONG_ERROR'] = 'This value is too long. It must have ' + this.max + ' characters or less.';
        this.messages['TOO_LONG_SUCCESS'] = 'This value is valid.';
    }

    static getName(){
        return 'length';
    }

    validate(value) {
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        resultBuilder.setValue(value);

        if(this.trim){
            value = value.trim().replace(/\s+/, " ");
        }

        if(this.min !== undefined){
            if(value.length >= this.min){
                resultBuilder.addSuccess(this.messages['TOO_SHORT_SUCCESS']);
            }else{
                resultBuilder.addError(this.messages['TOO_SHORT_ERROR']);
            }
        }

        if(this.max !== undefined){
            if(value.length <= this.max){
                resultBuilder.addSuccess(this.messages['TOO_LONG_SUCCESS']);
            }else{
                resultBuilder.addError(this.messages['TOO_LONG_ERROR']);
            }
        }

        return resultBuilder.getResult();
    }
}

export class Organizator_Validation_Constraint_NotBlank extends Organizator_Validation_Constraint {
    constructor(options) {
        super();

        Object.assign(this, options);

        this.messages['ERROR_NOT_VALID'] = 'This value must not be empty.';
        this.messages['SUCCESS_VALID'] = 'This value %value% is a valid.';
    }

    static getName(){
        return 'notblank';
    }

    validate(value, element) {
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        value = value.trim();

        if(value == ''){
            resultBuilder.addError(this.messages['ERROR_NOT_VALID']);
        }else{
            resultBuilder.addSuccess(this.messages['SUCCESS_VALID']);
        }

        return resultBuilder.getResult();
    }
}

export class Organizator_Validation_Constraint_Numeric extends Organizator_Validation_Constraint {
    constructor() {
        super();

        this.regex = /^[0-9]+$/;

        this.messages['ERROR_NOT_VALID'] = 'This value must be numeric.';
        this.messages['SUCCESS_VALID'] = 'This value is numeric.';
    }

    static getName(){
        return 'numeric';
    }

    validate(value) {
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        resultBuilder.setValue(value);

        if(!this.regex.test(value)){
            resultBuilder.addError(this.messages['ERROR_NOT_VALID']);
        }else{
            resultBuilder.addSuccess(this.messages['SUCCESS_VALID']);
        }

        return resultBuilder.getResult();
    }
}

export class Organizator_Validation_Constraint_Select extends Organizator_Validation_Constraint {
    constructor(options) {
        super();

        Object.assign(this, options);

        this.messages['MIN_ERROR'] = 'At least ' + this.min + ' option must be selected.';
        this.messages['MIN_SUCCESS'] = '';
        this.messages['MAX_ERROR'] = 'Maximum ' + this.max + ' options can be selected';
        this.messages['MAX_SUCCESS'] = '';
    }

    static getName(){
        return 'select';
    }

    validate(value, element) {
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        resultBuilder.setValue(value);

        if(this.min !== undefined){
            if(element.querySelectorAll('option:checked').length < this.min){
                resultBuilder.addError(this.messages['MIN_ERROR']);
            }else{
                resultBuilder.addSuccess(this.messages['MIN_SUCCESS']);
            }
        }

        if(this.max !== undefined){
            if(element.querySelectorAll('option:checked').length > this.max){
                resultBuilder.addError(this.messages['MAX_ERROR']);
            }else{
                resultBuilder.addSuccess(this.messages['MAX_SUCCESS']);
            }
        }

        return resultBuilder.getResult();
    }
}

export class Organizator_Validation_Constraint_Url extends Organizator_Validation_Constraint {
    constructor() {
        super();

        this.messages['ERROR_NOT_VALID'] = 'This value is not a valid url.';
        this.messages['SUCCESS_VALID'] = 'This value %value% is a valid url.';
        this.messages['WARNING_MX_NOT_CHECKED'] = 'This value %string% is a valid email address but MX record checks are also needed.';

        this.regex = /(([\w\.\-\+]+:)\/{2}(([\w\d\.]+):([\w\d\.]+))?@?(([a-zA-Z0-9\.\-_]+)(?::(\d{1,5}))?))?(\/(?:[a-zA-Z0-9\.\-\/\+\%]+)?)(?:\?([a-zA-Z0-9=%\-_\.\*&;]+))?(?:#([a-zA-Z0-9\-=,&%;\/\\"'\?]+)?)?/;
        this.isStrict = false;
    }

    static getName(){
        return 'url';
    }

    validate(value) {
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        resultBuilder.setValue(value);

        if(!this.regex.test(value)){
            resultBuilder.addError(this.messages['ERROR_NOT_VALID']);
        }else{
            resultBuilder.addSuccess(this.messages['SUCCESS_VALID']);
        }

        return resultBuilder.getResult();
    }
}

export class Organizator_src_Constraint_BitcoinAddress extends Organizator_Validation_Constraint {
    constructor(){
        super();

        this.messages['NOT_BITCOIN_ADDRESS_ERROR'] = 'This value is not a valid bitcoin address.';
        this.messages['BECH32_ERROR'] = 'Bech32 addresses are not supported yet.';
        this.messages['BITCOIN_ADDRESS_SUCCESS'] = 'This value is a valid bitcoin address.';
    }

    static getName(){
        return 'bitcoinaddress';
    }

    validate(value){
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        resultBuilder.setValue(value);

        try{
            bitcoinjs.address.fromBase58Check(value);
            resultBuilder.addSuccess(this.messages['BITCOIN_ADDRESS_SUCCESS']);
        }catch($e){
            try{
                bitcoinjs.address.fromBech32(value);
                resultBuilder.addError(this.messages['BECH32_ERROR']);
            }catch($e){
                resultBuilder.addError(this.messages['NOT_BITCOIN_ADDRESS_ERROR']);
            }
        }

        return resultBuilder.getResult();
    }
}

export class Organizator_src_Constraint_BitcoinPrivateKey extends Organizator_Validation_Constraint {
    constructor(){
        super();

        this.messages['NOT_BITCOIN_PRIVATEKEY_ERROR'] = 'This is not a bitcoin private key.';
        this.messages['BITCOIN_PRIVATEKEY_SUCCESS'] = 'This is a valid bitcoin private key.';
    }

    static getName(){
        return 'bitcoinprivatekey';
    }

    validate(value){
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        resultBuilder.setValue(value);

        try{
            bitcoinjs.ECPair.fromWIF(value);
            resultBuilder.addSuccess(this.messages['BITCOIN_PRIVATEKEY_SUCCESS']);
        }catch($e){
            resultBuilder.addError(this.messages['NOT_BITCOIN_PRIVATEKEY_ERROR']);
        }

        return resultBuilder.getResult();
    }
}

export class Organizator_src_Constraint_Password extends Organizator_Validation_Constraint {
    constructor() {        
        super();

        this.messages['INVALID'] = 'Password is invalid.';
        this.messages['VALID'] = 'Password is valid.';
    }

    static getName(){
        return 'password';
    }

    validate(value) {
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        resultBuilder.setValue(value);

        try{
            if(sjcl.decrypt(value, Organizator.pdb.getCollection('auth').get(1).challenge) === Organizator.Wallet.message){
                resultBuilder.addSuccess(this.messages['VALID']);
            }else{
                resultBuilder.addError(this.messages['INVALID']);
            }
        }catch($e){
            resultBuilder.addError(this.messages['INVALID']);
        }

        return resultBuilder.getResult();
    }
}

export class Organizator_src_Constraint_RawTransactionHex extends Organizator_Validation_Constraint {
    constructor() {        
        super();

        this.messages['NOT_VALID'] = 'Bad formatted transaction.';
        this.messages['VALID'] = 'This value is a valid raw transaction hex.';
    }

    static getName(){
        return 'rawtransactionhex';
    }

    validate(value) {
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        resultBuilder.setValue(value);

        try{
            let tx = bitcoinjs.Transaction.fromHex(value);
            resultBuilder.addSuccess(this.messages['VALID']);
        }catch(e){
            resultBuilder.addError(this.messages['NOT_VALID']);
        }

        return resultBuilder.getResult();
    }
}

export class Organizator_Validation_Constraint_Same extends Organizator_Validation_Constraint {
    constructor(options) {
        super();
        Object.assign(this, options);

        this.targetElement = document.querySelector(this.with);

        this.messages['NOT_SAME_ERROR'] = 'Passwords doesn\'t match.';
        this.messages['SAME_SUCCESS'] = 'This value is valid.';
    }

    static getName(){
        return 'same';
    }

    validate(value) {
        var resultBuilder = new Organizator_Validation_ConstraintValidationResultBuilder();

        resultBuilder.setValue(value);

        if(this.base=='true'){
            this.targetElement.dispatchEvent(new Event('input'));
        }else{  
            if(value == this.targetElement.value){
                resultBuilder.addSuccess(this.messages['SAME_SUCCESS']);
            }else{
                resultBuilder.addError(this.messages['NOT_SAME_ERROR']);
            }
        }

        return resultBuilder.getResult();
    }
}