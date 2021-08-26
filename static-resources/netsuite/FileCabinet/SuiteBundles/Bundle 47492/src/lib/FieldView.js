/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};

TAF.FieldView = function _FieldView(fieldMap) {
    this.context = nlapiGetContext();
};

TAF.FieldView.prototype.displayFields = function _displayFields(fieldMap, properties, isClientScript) {
    var field;
    var property;
    var isDisplayed;
    var nsField;
    var nsLineItemField;
    var intersection;

    for (var fieldId in fieldMap) {
        isDisplayed = true;
        field = fieldMap[fieldId];
        nsField = nlapiGetField(field.id);
        nsLineItemField = nlapiGetLineItemField('item',field.id);

        if (!nsField && !nsLineItemField) {
            continue;
        }

        for (var i = 0; properties && i < properties.length; i++) {
            property = properties[i];
            if (property.value === null || property.value === undefined || !field.hasOwnProperty(property.id)) {
                continue;
            }

            intersection = this.getInterSection(field[property.id], property.value);
            if (intersection.length == 0) {
                isDisplayed = false;
                break;
            }
        }

        if (isDisplayed) {
            if (isClientScript) {
                nlapiSetFieldDisplay(field.id, true);
            } else if (nsField) {
                nsField.setDisplayType('normal');
                if (field.displayType) {
                    nsField.setDisplayType(field.displayType);
                }
            } else {
                nsLineItemField.setDisplayType(field.displayType || 'normal');
            }
        } else {
            isClientScript ? nlapiSetFieldDisplay(field.id, false) : nsField ? nsField.setDisplayType('hidden') : nsLineItemField.setDisplayType(field.displayType || 'hidden');
            nlapiSetFieldValue(field.id, '');
        }
    }
};

TAF.FieldView.prototype.getInterSection = function _getInterSection(array1, array2) {
    return array1.filter(function (n) {
        return array2.indexOf(n) !== -1;
    });
};

TAF.FieldView.prototype.moveFieldsToTaxReportingTab = function _moveFieldsToTaxReportingTab(form, fieldMap, referenceFieldId) {
    if (this.context.getExecutionContext() !== 'userinterface') {
        return;
    }

    if (!form) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.FieldView.displayFields: form is required');
    }

    var field;
    var nsField;

    if (!nlapiGetField(referenceFieldId)) {
        return;
    }

    for (var fieldId in fieldMap) {
        field = fieldMap[fieldId];
        nsField = nlapiGetField(field.id);
        if (nsField) {
            form.insertField(nsField, referenceFieldId);
        }
    }
};

TAF.FieldView.prototype.arrangeFieldOrder = function _arrangeFieldOrder(form, fieldMap) {
    if (this.context.getExecutionContext() !== 'userinterface') {
        return;
    }

    if (!form) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.FieldView.arrangeFieldOrder: form is required');
    }

    if (!fieldMap) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.FieldView.arrangeFieldOrder: fieldMap is required');
    }

    var field;
    var nsField;
    var fieldIds = Object.keys(fieldMap);
    var referenceField = fieldMap[fieldIds[fieldIds.length - 1]];

    for (var i = fieldIds.length - 2; i > 0; i--) {
        field = fieldMap[fieldIds[i]];
        nsField = nlapiGetField(field.id);
        if (nsField) {
            form.insertField(nsField, referenceField.id);
            referenceField = field;
        }
    }
};
