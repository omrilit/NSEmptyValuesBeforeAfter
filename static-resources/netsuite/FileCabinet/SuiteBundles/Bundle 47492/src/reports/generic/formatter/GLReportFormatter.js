/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.Generic = TAF.Generic || {};
TAF.Generic.Formatter = TAF.Generic.Formatter || {};

TAF.Generic.Formatter.FieldDefinitions = function _FieldDefinitions() {
};
TAF.Generic.Formatter.FieldDefinitions.prototype.getFields = function _getFields() {
    var fields = {
        companyCode             : { type: TAF.Formatter.FieldTypes.TEXT },
        internalId              : { type: TAF.Formatter.FieldTypes.INTEGER },
        subTranId               : { type: TAF.Formatter.FieldTypes.TEXT },
        documentNo              : { type: TAF.Formatter.FieldTypes.TEXT },
        year                    : { type: TAF.Formatter.FieldTypes.DATE, dateFormat:'yyyy' },
        lineItem                : { type: TAF.Formatter.FieldTypes.INTEGER },
        period                  : { type: TAF.Formatter.FieldTypes.DATE, dateFormat:'MM' },
        postingPeriod           : { type: TAF.Formatter.FieldTypes.TEXT },
        documentDate            : { type: TAF.Formatter.FieldTypes.TEXT },
        localCurrencyCode       : { type: TAF.Formatter.FieldTypes.TEXT },
        localAmountDebit        : { type: TAF.Formatter.FieldTypes.DECIMAL },
        localAmountCredit       : { type: TAF.Formatter.FieldTypes.DECIMAL },
        documentCurrencyCode    : { type: TAF.Formatter.FieldTypes.TEXT },
        documentAmountDebit     : { type: TAF.Formatter.FieldTypes.DECIMAL },
        documentAmountCredit    : { type: TAF.Formatter.FieldTypes.DECIMAL },
        glAccountNumber         : { type: TAF.Formatter.FieldTypes.TEXT },
        glAccountName           : { type: TAF.Formatter.FieldTypes.TEXT },
        entityName              : { type: TAF.Formatter.FieldTypes.TEXT },
        taxRegistrationNumber   : { type: TAF.Formatter.FieldTypes.TEXT },
        department              : { type: TAF.Formatter.FieldTypes.TEXT },
        classes                 : { type: TAF.Formatter.FieldTypes.TEXT },
        location                : { type: TAF.Formatter.FieldTypes.TEXT },
        journalDescription      : { type: TAF.Formatter.FieldTypes.TEXT },
        transactionType         : { type: TAF.Formatter.FieldTypes.TEXT },
        creator                 : { type: TAF.Formatter.FieldTypes.TEXT }
    };
    
    return fields;
};

TAF.Generic.Formatter.GeneralLedger = function _GeneralLedger(glCustomFields) {
    TAF.Formatter.ReportFormatter.call(this);
    this.fields = new TAF.Generic.Formatter.FieldDefinitions().getFields();
    this.isXML = false;
    this.INVALID_CHARACTERS = /\r\n|\n|\r|,|\t|\|/g;
    
    this.TEMPLATE = {};
    
    this.TEMPLATE.HEADER = [
        'Company Code',
        'Internal ID',
        'SubTran ID',
        'Document No.',
        'Year',
        'Line Item',
        'Period',
        'Posting Period',
        'Document Date',
        'Local Currency Code',
        'Local Amount (Debit)',
        'Local Amount (Credit)',
        'Document Currency Code',
        'Document Amount (Debit)',
        'Document Amount (Credit)',
        'GL Account Number',
        'GL Account Name',
        'Entity Name',
        'Tax Registration Number',
        'Department',
        'Class',
        'Location',
        'Journal Description',
        'Transaction Type',
        'Creator'].join(',');
    this.TEMPLATE.LINE = [
        '{companyCode}',
        '{internalId}',
        '{subTranId}',
        '{documentNo}',
        '{year}',
        '{lineItem}',
        '{period}',
        '{postingPeriod}',
        '{documentDate}',
        '{localCurrencyCode}',
        '{localAmountDebit}',
        '{localAmountCredit}',
        '{documentCurrencyCode}',
        '{documentAmountDebit}',
        '{documentAmountCredit}',
        '{glAccountNumber}',
        '{glAccountName}',
        '{entityName}',
        '{taxRegistrationNumber}',
        '{department}',
        '{classes}',
        '{location}',
        '{journalDescription}',
        '{transactionType}',
        '{creator}'].join(',');
    
    this.setFieldData(glCustomFields);
};
TAF.Generic.Formatter.GeneralLedger.prototype = Object.create(TAF.Formatter.ReportFormatter.prototype);

TAF.Generic.Formatter.GeneralLedger.prototype.setFieldData = function _setFieldData(glCustomFields) {
    var labels = [];
    var lines = [];

    for (var i = 0; i < glCustomFields.length; i++) {
        var field = glCustomFields[i];
        
        var fieldLabel = field.label;
        fieldLabel = fieldLabel.replace(this.INVALID_CHARACTERS, ' ');
        labels.push(fieldLabel);
        
        var line = ['{', field.customFieldId, '}'].join('');
        lines.push(line);
    }
    
    var labelString = (labels.length > 0) ? (',' + labels.join(',')) : '';
    this.TEMPLATE.HEADER += labelString;
    
    var lineString = (lines.length > 0) ? (',' + lines.join(',')) : ''; 
    this.TEMPLATE.LINE += lineString; 
};

TAF.Generic.Formatter.GeneralLedger.prototype.formatHeader = function _formatHeader() {
    return this.TEMPLATE.HEADER;
};

TAF.Generic.Formatter.GeneralLedger.prototype.formatLine = function _formatLine(data) {
    return this.formatElement(data, this.TEMPLATE.LINE);
};
