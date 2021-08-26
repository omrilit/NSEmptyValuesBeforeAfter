/**
 * Copyright 2020 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF = TAF || {};
TAF.CS = TAF.CS || {};

TAF.CS.OnFieldChanged = function _OnFieldChanged(type, name, line) {
    if (name === 'custrecord_income_stat_1167_grouping_cod') {
        var standardAccountId = nlapiGetFieldValue('custrecord_income_stat_1167_grouping_cod');
       

        var letters = /^[0-9a-zA-Z]+$/;
        if  (standardAccountId && !standardAccountId.match(letters)) {
            alert('Please enter a valid Grouping Code value. Special characters are not allowed.');
        }
    }
};

TAF.CS.SaveRecord = function _SaveRecord(){
    var standardAccountId = nlapiGetFieldValue('custrecord_income_stat_1167_grouping_cod');
    var standardAccountDes = nlapiGetFieldValue('custrecord_income_stat_1167_grouping_des');
  
    var letters = /^[0-9a-zA-Z]+$/;
    if  (standardAccountId && !standardAccountId.match(letters)) {
        alert('Please enter a valid Grouping Code value. Special characters are not allowed.');
        return false;
    }
    if(standardAccountId && standardAccountDes){
        showAlertBox("message", "Confirmation", "Income Statement Grouping Code successfully Saved.", 0);
    }
    return true;
};
