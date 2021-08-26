/**
 * Copyright 2020 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF = TAF || {};
TAF.CS = TAF.CS || {};

TAF.CS.OnFieldChanged = function _OnFieldChanged(type, name, line) {
    if (name === 'custrecord_2d_standard_account_id') {
        var standardAccountId = nlapiGetFieldValue('custrecord_2d_standard_account_id');
        if(standardAccountId.length != 2) {
            alert('Please enter a valid two-digit Standard Account ID. Special characters are not allowed. ');
        }

        var letters = /^[0-9a-zA-Z]+$/;
        if  (standardAccountId && !standardAccountId.match(letters)) {
            alert('Please enter a valid two-digit Standard Account ID. Special characters are not allowed. ');
        }
    }
};

TAF.CS.SaveRecord = function _SaveRecord(){
    var standardAccountId = nlapiGetFieldValue('custrecord_2d_standard_account_id');
    var standardAccountDes = nlapiGetFieldValue('custrecord_2d_account_description');
    
    if(standardAccountId && standardAccountId.length != 2) {
        alert('Please enter a valid two-digit Standard Account ID. Special characters are not allowed.');
        return false;
    }
    var letters = /^[0-9a-zA-Z]+$/;
    if  (standardAccountId && !standardAccountId.match(letters)) {
        alert('Please enter a valid two-digit Standard Account ID. Special characters are not allowed.');
        return false;
    }
    if(standardAccountId && standardAccountDes){
        showAlertBox("message", "Confirmation", "2 Digit Standard Account successfully Saved.", 0);
    }
    return true;
};
