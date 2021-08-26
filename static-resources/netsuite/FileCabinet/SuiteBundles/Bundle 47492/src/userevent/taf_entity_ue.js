/**
 * Copyright 2017 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF = TAF || {};
TAF.UE = TAF.UE || {};

TAF.UE.BeforeLoad = function _BeforeLoad(type, form) {
    var recordType = nlapiGetRecordType();
    var isOneWorld = nlapiGetContext().getFeature('SUBSIDIARIES');
    var nexuses;

    if (isOneWorld) {
        nexuses = TAF.UE.getNexus();
    } else {
        nexuses = [nlapiGetFieldValue('billcountry')];
    }

    var properties = [
        { id: 'nexus', value: nexuses },
        { id: 'recordType', value: [recordType] }
    ];
    var fieldView = new TAF.FieldView();
    var referenceFieldId = recordType === 'vendor' ? 'taxfractionunit' : 'taxitem';

    if (type == 'view') {
        fieldView.displayFields(TAF.CONSTANTS.FIELD_MAP.ENTITY, properties);
    }
    fieldView.moveFieldsToTaxReportingTab(form, TAF.CONSTANTS.FIELD_MAP.ENTITY, referenceFieldId);
};

TAF.UE.getNexus = function _getNexus() {
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
        nlapiLogExecution('AUDIT', 'TAF.UE.getNexus', errorMsg);
    }

    return nexuses;
};
