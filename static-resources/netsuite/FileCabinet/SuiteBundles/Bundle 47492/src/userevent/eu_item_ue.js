/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
var TAF = TAF || {};
TAF.UE = TAF.UE || {};
TAF.UE.Item = TAF.UE.Item || {};

TAF.UE.Item.BeforeLoad = function _BeforeLoad(type, form){
    if (nlapiGetContext().getExecutionContext() !== 'userinterface') {
        return;
    }

    var nsField = nlapiGetField('custitem_un_number');
    var referenceFieldId = 'custitem_commodity_code';

    if (!nlapiGetField(referenceFieldId)) {
        return;
    }
    
    if (nsField) {
        form.insertField(nsField, referenceFieldId);
    }
};