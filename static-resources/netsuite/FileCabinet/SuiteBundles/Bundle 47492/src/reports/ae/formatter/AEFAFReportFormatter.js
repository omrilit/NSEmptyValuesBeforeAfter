/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Formatter = TAF.AE.Formatter || {};

TAF.AE.Formatter.FieldDefinitions = function _FieldDefinitions() {};
TAF.AE.Formatter.FieldDefinitions.prototype.getFields = function _getFields() {
    var fields = {
        companyName: {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        trn : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 15
        },
        periodStart : {
            type: TAF.Formatter.FieldTypes.DATE,
            width: 10
        },
        periodEnd : {
            type: TAF.Formatter.FieldTypes.DATE,
            width: 10
        },
        fafCreationDate : {
            type: TAF.Formatter.FieldTypes.DATE,
            width: 10
        },
        productVersion : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        fafVersion : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 20
        },
        supplierName : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 100
        },
        supplierCountry : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 50
        },
        supplierTRN : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 15
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
        glNumber : {
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
        purchaseValueAED : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        vatValueAED : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        taxCode : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 2
        },
        fcyCode : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 3
        },
        purchaseFCY : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        vatFCY : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        purchaseTotalAED : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        vatTotalAED : {
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
        cutomerCountry : {
            type: TAF.Formatter.FieldTypes.TEXT,
            width: 50
        },
        supplyValueAED : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        supplyFCY : {
            type: TAF.Formatter.FieldTypes.DECIMAL,
            width: 17
        },
        supplyTotalAED : {
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

TAF.AE.Formatter.FAF = function _FAF() {
    TAF.Formatter.ReportFormatter.call(this);
    this.dateFormat = 'dd-MM-yyyy';
    this.fields = new TAF.AE.Formatter.FieldDefinitions().getFields();
    
    this.TEMPLATE = {};
    this.TEMPLATE.FAF_HEADER = '';
    this.TEMPLATE.FAF_FOOTER = '';
    this.TEMPLATE.COMPANY_INFO_HEADER = '';
    this.TEMPLATE.COMPANY_INFO_BODY = '';

    this.TEMPLATE.PURCHASE_HEADER = '';
    this.TEMPLATE.PURCHASE_BODY = '';
    this.TEMPLATE.PURCHASE_TOTAL_HEADER = '';
    this.TEMPLATE.PURCHASE_TOTAL = '';

    this.TEMPLATE.SUPPLY_HEADER = '';
    this.TEMPLATE.SUPPLY_BODY = '';
    this.TEMPLATE.SUPPLY_TOTAL_HEADER = '';
    this.TEMPLATE.SUPPLY_TOTAL = '';
};

TAF.AE.Formatter.FAF.prototype = Object.create(TAF.Formatter.ReportFormatter.prototype);

TAF.AE.Formatter.FAF.prototype.formatAEFAFHeader = function _formatAEFAFHeader() {
    return this.TEMPLATE.FAF_HEADER;
};

TAF.AE.Formatter.FAF.prototype.formatAEFAFFooter = function _formatAEFAFFooter() {
    return this.TEMPLATE.FAF_FOOTER;
};

TAF.AE.Formatter.FAF.prototype.formatCompanyInfoHeader = function _formatCompanyInfoHeader(){
    return this.TEMPLATE.COMPANY_INFO_HEADER;
};

TAF.AE.Formatter.FAF.prototype.formatCompanyInfoBody = function _formatCompanyInfoBody(data){
    return this.formatElement(data, this.TEMPLATE.COMPANY_INFO_BODY);
};

TAF.AE.Formatter.FAF.prototype.formatCompanyInfoFooter = function _formatCompanyInfoFooter() {
    return this.TEMPLATE.COMPANY_INFO_FOOTER;
};

TAF.AE.Formatter.FAF.prototype.formatPurchaseHeader = function _formatPurchaseHeader(data){
    return this.formatElement(data, this.TEMPLATE.PURCHASE_HEADER);
};

TAF.AE.Formatter.FAF.prototype.formatPurchaseBody = function _formatPurchaseBody(data){
    return this.formatElement(data, this.TEMPLATE.PURCHASE_BODY);
};

TAF.AE.Formatter.FAF.prototype.formatPurchaseTotal = function _formatPurchaseTotal(data) {
	var content = this.formatElement(data, this.TEMPLATE.PURCHASE_TOTAL_HEADER);
	content += this.formatElement(data, this.TEMPLATE.PURCHASE_TOTAL);
	
    return content;
};

TAF.AE.Formatter.FAF.prototype.formatSupplyHeader = function _formatSupplyHeader(data){
    return this.formatElement(data, this.TEMPLATE.SUPPLY_HEADER);
};

TAF.AE.Formatter.FAF.prototype.formatSupplyBody = function _formatSupplyBody(data){
    return this.formatElement(data, this.TEMPLATE.SUPPLY_BODY);
};

TAF.AE.Formatter.FAF.prototype.formatSupplyTotal = function _formatSupplyTotal(data) {
	var content = this.formatElement(data, this.TEMPLATE.SUPPLY_TOTAL_HEADER);
	content += this.formatElement(data, this.TEMPLATE.SUPPLY_TOTAL);
	
    return content;
};

TAF.AE.Formatter.FAF.prototype.formatGeneralLedgerHeader = function _formatGeneralLedgerHeader(data){
    return this.formatElement(data, this.TEMPLATE.GL_HEADER);
};

TAF.AE.Formatter.FAF.prototype.formatGeneralLedgerBody = function _formatGeneralLedgerBody(data){
    return this.formatElement(data, this.TEMPLATE.GL_BODY);
};

TAF.AE.Formatter.FAF.prototype.formatGeneralLedgerTotal = function _formatGeneralLedgerTotal(data) {
	var content = this.formatElement(data, this.TEMPLATE.GL_TOTAL_HEADER);
	content += this.formatElement(data, this.TEMPLATE.GL_TOTAL);
	
    return content;
};
