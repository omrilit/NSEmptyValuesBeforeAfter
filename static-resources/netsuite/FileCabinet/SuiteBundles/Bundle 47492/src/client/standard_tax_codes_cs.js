/**
 * Copyright 2020 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF = TAF || {};
TAF.CS = TAF.CS || {};

TAF.CS.OnFieldChanged = function _OnFieldChanged(type, name, line) {
    if (name === 'custrecord_no_standard_tax_codes_id') {
        var standardAccountId = nlapiGetFieldValue('custrecord_no_standard_tax_codes_id');
       

        var letters = /^[0-9a-zA-Z]+$/;
        if  (standardAccountId && !standardAccountId.match(letters)) {
            alert('Please enter a valid Standard Tax Code ID value. Special characters are not allowed.');
        }
    }
};

TAF.CS.SaveRecord = function _SaveRecord(){
    var standardAccountId = nlapiGetFieldValue('custrecord_no_standard_tax_codes_id');  
    var standardAccountDes = nlapiGetFieldValue('custrecord_no_standard_tax_codes_desc');
    var letters = /^[0-9a-zA-Z]+$/;
    if  (standardAccountId && !standardAccountId.match(letters)) {
        alert('Please enter a valid Standard Tax Code ID value. Special characters are not allowed.');
        return false;
    }
   
    if(standardAccountId && standardAccountDes){
        showAlertBox("message", "Confirmation", "Standard Tax Code successfully Saved.", 0); 
    }
    return true;
};
