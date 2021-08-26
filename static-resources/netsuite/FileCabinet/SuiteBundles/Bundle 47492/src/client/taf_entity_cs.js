/**
 * Copyright 2017 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF = TAF || {};
TAF.CS = TAF.CS || {};

TAF.CS.OnPageInit = function _OnPageInit() {
    TAF.CS.OnPageInit.isOneWorld = nlapiGetContext().getFeature('SUBSIDIARIES');
    var fieldView = TAF.CS.getFieldView();
    fieldView.displayFields(TAF.CONSTANTS.FIELD_MAP.ENTITY, TAF.CS.getProperties());
};

TAF.CS.OnFieldChanged = function _OnFieldChanged(type, name, line) {
    var fieldView = TAF.CS.getFieldView();
    if (TAF.CS.OnPageInit.isOneWorld) {
        if (name === 'subsidiary') {
            fieldView.displayFields(TAF.CONSTANTS.FIELD_MAP.ENTITY, TAF.CS.getProperties());
        }
    } else if (name === 'defaultaddress' || name === 'defaultbilling') {
        fieldView.displayFields(TAF.CONSTANTS.FIELD_MAP.ENTITY, TAF.CS.getProperties());
    }
};

TAF.CS.getFieldView = function _getFieldView() {
    if (!TAF.CS.fieldView) {
        TAF.CS.fieldView = new TAF.FieldView();
    }

    return TAF.CS.fieldView;
};

TAF.CS.getProperties = function _getProperties() {
    TAF.CS.recordType = TAF.CS.recordType || nlapiGetRecordType();
    var nexuses;
    
    if (TAF.CS.OnPageInit.isOneWorld) {
        nexuses = TAF.CS.getNexus();
    } else {
        nexuses = [nlapiGetFieldValue('billcountry')];
    }
    
    return [
        { id: 'nexus', value: nexuses },
        { id: 'recordType', value: [TAF.CS.recordType] }
    ];
};

TAF.CS.getNexus = function _getNexus() {
    var nexuses = [];
    
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

    return nexuses;
};
