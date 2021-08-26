/**
 * Copyright 2020 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF = TAF || {};
TAF.UE = TAF.UE || {};

TAF.UE.BeforeSubmit = function _BeforeSubmit(type) {
    var context = nlapiGetContext();
    if (context.getExecutionContext() == 'csvimport') {
        var record = nlapiGetNewRecord();
        var groupingCode = record.getFieldValue("custrecord_mapper_keyvalue_grouping_code");
        var mappingValue = record.getFieldValue("custrecord_mapper_keyvalue_value");
        if(groupingCode && !mappingValue) {
            throw nlapiCreateError('MISSING_PARAMETER', 'Grouping Category should have a value.', true);
        }
        var letters = /^[0-9a-zA-Z]+$/;
        if  (groupingCode && !groupingCode.match(letters)) {
            throw nlapiCreateError('INVALID_PARAMETER', 'Grouping Code contains invalid special character.', true);
        }
    }
    return;
}
