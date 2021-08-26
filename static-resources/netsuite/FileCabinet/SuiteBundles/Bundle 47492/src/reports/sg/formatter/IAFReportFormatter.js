/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.Formatter = TAF.SG.Formatter || {};

TAF.SG.Formatter.FieldDefinitions = function _FieldDefinitions() {};
TAF.SG.Formatter.FieldDefinitions.prototype.getFields = function _getFields() {
    var fields = {
        companyName: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        companyUEN : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 16
        },
        gstNo : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 16
        },
        periodStart : {
            type: TAF.Formatter.FieldTypes.DATE,
            width: 10
        },
        periodEnd : {
            type: TAF.Formatter.FieldTypes.DATE,
            width: 10
        },
        iafCreationDate : {
            type: TAF.Formatter.FieldTypes.DATE,
            width: 10
        },
        productVersion : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        iafVersion : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        supplierName : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        supplierUEN : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 16
        },
        invoiceDate : {
            type: TAF.Formatter.FieldTypes.DATE,
            width: 10
        },
        invoiceNo : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 50
        },
        permitNo : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 20
        },
        lineNo : {
            type: TAF.Formatter.FieldTypes.INTEGER,
            width: 10
        },
        productDescription : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 250
        },
        purchaseValueSGD : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        gstValueSGD : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        taxCode : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 20
        },
        fcyCode : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 3
        },
        purchaseFCY : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        gstFCY : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        purchaseTotalSGD : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        gstTotalSGD : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        transactionCountTotal : {
            type: TAF.Formatter.FieldTypes.INTEGER,
            width: 10
        },
        customerName : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        customerUEN : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 16
        },
        supplyValueSGD : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        supplyFCY : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        supplyTotalSGD : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        country : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 50
        },
        transactionDate : {
            type: TAF.Formatter.FieldTypes.DATE,
            width: 10
        },
        accountID : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 20
        },
        accountName : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        transactionDescription : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 250
        },
        name : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        transactionID : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 20
        },
        sourceDocumentID : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 50
        },
        sourceType : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 20
        },
        debit : {
            type: TAF.Formatter.FieldTypes.UNSIGNED_DECIMAL,
            width: 17
        },
        credit : {
            type: TAF.Formatter.FieldTypes.UNSIGNED_DECIMAL,
            width: 17
        },
        balance : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        totalDebit : {
            type: TAF.Formatter.FieldTypes.UNSIGNED_DECIMAL,
            width: 17
        },
        totalCredit : {
            type: TAF.Formatter.FieldTypes.UNSIGNED_DECIMAL,
            width: 17
        },
        gltCurrency : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 3
        }
    };
    return fields;
};

TAF.SG.Formatter.IAF = function _IAF() {
    TAF.Formatter.ReportFormatter.call(this);
    this.dateFormat = 'yyyy-MM-dd';
    this.fields = new TAF.SG.Formatter.FieldDefinitions().getFields();
    
    this.TEMPLATE = {};
    this.TEMPLATE.IAF_HEADER = '';
    this.TEMPLATE.IAF_FOOTER = '';
    this.TEMPLATE.COMPANY_INFO_HEADER = '';
    this.TEMPLATE.COMPANY_INFO_BODY = '';
    this.TEMPLATE.COMPANY_INFO_FOOTER = '';

    this.TEMPLATE.PURCHASE_HEADER = '';
    this.TEMPLATE.PURCHASE_BODY = '';
    this.TEMPLATE.PURCHASE_FOOTER = '';

    this.TEMPLATE.SUPPLY_HEADER = '';
    this.TEMPLATE.SUPPLY_BODY = '';
    this.TEMPLATE.SUPPLY_FOOTER = '';

    this.TEMPLATE.GL_HEADER = '';
    this.TEMPLATE.GL_BODY = '';
    this.TEMPLATE.GL_FOOTER = '';
};

TAF.SG.Formatter.IAF.prototype = Object.create(TAF.Formatter.ReportFormatter.prototype);

TAF.SG.Formatter.IAF.prototype.formatSGIAFHeader = function _formatSGIAFHeader() {
    return this.TEMPLATE.IAF_HEADER;
};

TAF.SG.Formatter.IAF.prototype.formatSGIAFFooter = function _formatSGIAFFooter() {
    return this.TEMPLATE.IAF_FOOTER;
};

TAF.SG.Formatter.IAF.prototype.formatCompanyInfoHeader = function _formatCompanyInfoHeader(){
    return this.TEMPLATE.COMPANY_INFO_HEADER;
};

TAF.SG.Formatter.IAF.prototype.formatCompanyInfoBody = function _formatCompanyInfoBody(data){
    return this.formatElement(data, this.TEMPLATE.COMPANY_INFO_BODY);
};

TAF.SG.Formatter.IAF.prototype.formatCompanyInfoFooter = function _formatCompanyInfoFooter() {
    return this.TEMPLATE.COMPANY_INFO_FOOTER;
};

TAF.SG.Formatter.IAF.prototype.formatPurchaseHeader = function _formatPurchaseHeader(data){
    return this.formatElement(data, this.TEMPLATE.PURCHASE_HEADER);
};

TAF.SG.Formatter.IAF.prototype.formatPurchaseBody = function _formatPurchaseBody(data){
    return this.formatElement(data, this.TEMPLATE.PURCHASE_BODY);
};

TAF.SG.Formatter.IAF.prototype.formatPurchaseFooter = function _formatPurchaseFooter(data) {
    return this.formatElement(data, this.TEMPLATE.PURCHASE_FOOTER);
};

TAF.SG.Formatter.IAF.prototype.formatSupplyHeader = function _formatSupplyHeader(data){
    return this.formatElement(data, this.TEMPLATE.SUPPLY_HEADER);
};

TAF.SG.Formatter.IAF.prototype.formatSupplyBody = function _formatSupplyBody(data){
    return this.formatElement(data, this.TEMPLATE.SUPPLY_BODY);
};

TAF.SG.Formatter.IAF.prototype.formatSupplyFooter = function _formatSupplyFooter(data) {
    return this.formatElement(data, this.TEMPLATE.SUPPLY_FOOTER);
};

TAF.SG.Formatter.IAF.prototype.formatGeneralLedgerHeader = function _formatGeneralLedgerHeader(data){
    return this.formatElement(data, this.TEMPLATE.GL_HEADER);
};

TAF.SG.Formatter.IAF.prototype.formatGeneralLedgerBody = function _formatGeneralLedgerBody(data){
    return this.formatElement(data, this.TEMPLATE.GL_BODY);
};

TAF.SG.Formatter.IAF.prototype.formatGeneralLedgerFooter = function _formatGeneralLedgerFooter(data) {
    return this.formatElement(data, this.TEMPLATE.GL_FOOTER);
};
