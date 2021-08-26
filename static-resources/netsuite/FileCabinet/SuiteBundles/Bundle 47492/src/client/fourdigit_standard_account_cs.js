/**
 * Copyright 2020 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF = TAF || {};
TAF.CS = TAF.CS || {};

TAF.CS.OnFieldChanged = function _OnFieldChanged(type, name, line) {
    if (name === 'custrecord_4d_standard_account_id') {
        var standardAccountId = nlapiGetFieldValue('custrecord_4d_standard_account_id');
        if(standardAccountId.length != 4) {
            alert('Please enter a valid four-digit Standard Account ID. Special characters are not allowed.');
        }

        var letters = /^[0-9a-zA-Z]+$/;
        if  (standardAccountId && !standardAccountId.match(letters)) {
            alert('Please enter a valid four-digit Standard Account ID. Special characters are not allowed.');
        }
    }
};

TAF.CS.SaveRecord = function _SaveRecord(){
    var standardAccountId = nlapiGetFieldValue('custrecord_4d_standard_account_id');
    var standardAccountDes = nlapiGetFieldValue('custrecord_4d_account_description');
  
    if(standardAccountId && standardAccountId.length != 4) {
        alert('Please enter a valid four-digit Standard Account ID. Special characters are not allowed.');
        return false;
    }
    var letters = /^[0-9a-zA-Z]+$/;
    if  (standardAccountId && !standardAccountId.match(letters)) {
        alert('Please enter a valid four-digit Standard Account ID. Special characters are not allowed.');
        return false;
    }
    if(standardAccountId && standardAccountDes){
        showAlertBox("message", "Confirmation", "4 Digit Standard Account successfully Saved.", 0);
    }
    return true;
};
