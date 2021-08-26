/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF = TAF || {};
TAF.CS = TAF.CS || {};
TAF.CS.FR_NEXUS = 'FR';

TAF.CS.OnPageInit = function _OnPageInit() {
    TAF.CS.executionContext = TAF.CS.executionContext || nlapiGetContext().getExecutionContext();
	TAF.CS.OnPageInit.isOneWorld = nlapiGetContext().getFeature('SUBSIDIARIES');
    if (TAF.CS.executionContext !== 'userinterface') {
        return;
    }
    var fieldView = TAF.CS.getFieldView();
    var invoiceTypeId = TAF.CONSTANTS.FIELD_MAP.TRANSACTION.receivedInvoiceType.id;

    fieldView.displayFields(TAF.CONSTANTS.FIELD_MAP.TRANSACTION, TAF.CS.getProperties(), true);
    if (nlapiGetField(invoiceTypeId) && !nlapiGetFieldValue(invoiceTypeId)) {
        TAF.CS.setInvoiceTypeValueToInvoice();
    }
    nexuses = TAF.CS.getNexus();
    for(var i = 0; i < nexuses.length; i++){
        if(nexuses[i] === TAF.CS.FR_NEXUS){
          var field = nlapiGetLineItemField('item','custcol_establishment_code');
          nlapiGetField('custbody_establishment_code').setDisplayType('normal');
          nlapiSetLineItemDisabled ( 'item' , 'custcol_establishment_code' , false , -1 );
        }
    }
};

TAF.CS.OnFieldChanged = function _OnFieldChanged(type, name, line) {
    TAF.CS.executionContext = TAF.CS.executionContext || nlapiGetContext().getExecutionContext();
    if (TAF.CS.executionContext !== 'userinterface') {
        return;
    }
    if (name === 'nexus' || name === 'trantype') {
        var fieldView = TAF.CS.getFieldView();
        fieldView.displayFields(TAF.CONSTANTS.FIELD_MAP.TRANSACTION, TAF.CS.getProperties(), true);
    }
};

TAF.CS.OnValidateField = function _OnValidateField(type, name, line) {
    TAF.CS.executionContext = TAF.CS.executionContext || nlapiGetContext().getExecutionContext();
    if (TAF.CS.executionContext !== 'userinterface') {
        return true;
    }
    if(name === 'subsidiary'){
       nexuses = TAF.CS.getNexus();
       for(var i = 0; i < nexuses.length; i++){
          if(nexuses[i] === TAF.CS.FR_NEXUS){
             var field = nlapiGetField('custbody_establishment_code');
             nlapiGetField('custbody_establishment_code').setDisplayType('normal');
             nlapiSetLineItemDisabled ( 'item' , 'custcol_establishment_code' , false , -1 );
          }
       }
    }
    TAF.CS.ValidateEstablishmentCode(name);
    return true;
};

TAF.CS.SaveRecord = function _SaveRecord(){
    return TAF.CS.ValidateEstablishmentCode(null);
};

TAF.CS.ValidateEstablishmentCode = function _ValidateEstablishmentCode(name) {
   var letters = /^[0-9a-zA-Z]+$/;
   if (name === 'custbody_establishment_code'){
        var estCode = nlapiGetFieldValue("custbody_establishment_code");
        if(estCode && !estCode.match(letters))
        {
            alert('Establishment Code should be Alphanumeric');
            return false;
        }
    }
    if(name === 'custcol_establishment_code') {
        var lineEstCode = nlapiGetCurrentLineItemValue('item','custcol_establishment_code');
        if(lineEstCode && !lineEstCode.match(letters))
        { 
            alert('Establishment Code should be Alphanumeric');
            return false;
        }
    }
    if(name === null){
        var estCode = nlapiGetFieldValue("custbody_establishment_code")
        if(estCode && !estCode.match(letters))
        {
            alert('Establishment Code should be Alphanumeric at header level');
            return false;
        }
        var count = nlapiGetLineItemCount('item');
        for ( var i = 1; i <= count; i++) {
           var lineEstCode = nlapiGetLineItemValue('item','custcol_establishment_code', i);
           if(lineEstCode && !lineEstCode.match(letters))
           { 
              alert('Establishment Code should be Alphanumeric at line: ' + JSON.stringify(i));
              return false;
           }
        }
    }
    return true;
};

TAF.CS.getFieldView = function _getFieldView() {
    if (!TAF.CS.fieldView) {
        TAF.CS.fieldView = new TAF.FieldView();
    }
    return TAF.CS.fieldView;
};

TAF.CS.getProperties = function _getProperties() {
    return [
        { id: 'nexus', value: [nlapiGetFieldValue('nexus_country')] },
        { id: 'recordType', value: [TAF.CS.getRecordType()] }
    ];
};

TAF.CS.getRecordType = function _getRecordType() {
    var recordType = nlapiGetRecordType();

    if (recordType === 'creditcardcharge') {
        recordType += '_' + nlapiGetFieldValue('trantype');
    }
    return recordType;
};

TAF.CS.setInvoiceTypeValueToInvoice = function _setInvoiceTypeValueToInvoice() {
    var defaltInvoiceTypeValue = nlapiGetFieldValue('custpage_sii_temp_received_inv_type');
    nlapiSetFieldValue(TAF.CONSTANTS.FIELD_MAP.TRANSACTION.receivedInvoiceType.id, defaltInvoiceTypeValue);
};

TAF.CS.getNexus = function _getNexus() {
    var nexuses = [];
    if (TAF.CS.OnPageInit.isOneWorld) {
      try {
         var subsidiaryId = nlapiGetFieldValue('subsidiary');
         if (subsidiaryId) {
            var record = nlapiLoadRecord('subsidiary', subsidiaryId);
            var nexusCount = record.getLineItemCount('nexus') + 1;

            for (var i = 1; i < nexusCount; i++) {
                nexuses.push(record.getLineItemValue('nexus', 'country', i));
            }
        }
    } catch (ex) {
        var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
        nlapiLogExecution('AUDIT', 'TAF.CS.getNexus', errorMsg);
    }
    }
    else {
        nexuses = [nlapiGetFieldValue('billcountry')];
    }
    return nexuses;
};

