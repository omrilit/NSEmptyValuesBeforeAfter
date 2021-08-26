/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.Formatter = TAF.MY.Formatter || {};

TAF.MY.Formatter.FieldDefinitions = function _FieldDefinitions() {
};
TAF.MY.Formatter.FieldDefinitions.prototype.getFields = function _getFields() {
    var fields = {
        transactionDate: { type: TAF.Formatter.FieldTypes.DATE },
        accountID: { type: TAF.Formatter.FieldTypes.TEXT },
        accountName: { type: TAF.Formatter.FieldTypes.TEXT },
        transactionDescription: { type: TAF.Formatter.FieldTypes.TEXT },
        name: { type: TAF.Formatter.FieldTypes.TEXT },
        transactionID: { type: TAF.Formatter.FieldTypes.TEXT },
        sourceDocumentID: { type: TAF.Formatter.FieldTypes.TEXT },
        sourceType: { type: TAF.Formatter.FieldTypes.TEXT },
        debit: { type: TAF.Formatter.FieldTypes.UNSIGNED_DECIMAL },
        credit: { type: TAF.Formatter.FieldTypes.UNSIGNED_DECIMAL },
        balance: { type: TAF.Formatter.FieldTypes.DECIMAL },
        purchaseLines: { type: TAF.Formatter.FieldTypes.INTEGER },
        purchaseTotalAmount: { type: TAF.Formatter.FieldTypes.DECIMAL },
        purchaseGstTotalAmount: { type: TAF.Formatter.FieldTypes.DECIMAL },
        supplyLines: { type: TAF.Formatter.FieldTypes.INTEGER },
        supplyTotalAmount: { type: TAF.Formatter.FieldTypes.DECIMAL },
        supplyGstTotalAmount: { type: TAF.Formatter.FieldTypes.DECIMAL },
        ledgerLines: { type: TAF.Formatter.FieldTypes.INTEGER },
        ledgerDebit: { type: TAF.Formatter.FieldTypes.UNSIGNED_DECIMAL },
        ledgerCredit: { type: TAF.Formatter.FieldTypes.UNSIGNED_DECIMAL },
        ledgerBalance: { type: TAF.Formatter.FieldTypes.DECIMAL },
        customerName: { type: TAF.Formatter.FieldTypes.TEXT },
        customerBrn: { type: TAF.Formatter.FieldTypes.TEXT },
        invoiceDate: { type: TAF.Formatter.FieldTypes.DATE },
        invoiceNo: { type: TAF.Formatter.FieldTypes.TEXT },
        productDescription: { type: TAF.Formatter.FieldTypes.TEXT },
        amount: { type: TAF.Formatter.FieldTypes.DECIMAL },
        gstAmount: { type: TAF.Formatter.FieldTypes.DECIMAL },
        taxCode: { type: TAF.Formatter.FieldTypes.TEXT },
        country: { type: TAF.Formatter.FieldTypes.TEXT },
        currencyCode: { type: TAF.Formatter.FieldTypes.TEXT },
        foreignAmount: { type: TAF.Formatter.FieldTypes.DECIMAL },
        foreignGstAmount: { type: TAF.Formatter.FieldTypes.DECIMAL },
        supplierName: { type: TAF.Formatter.FieldTypes.TEXT },
        supplierBRN: { type: TAF.Formatter.FieldTypes.TEXT },
        importDeclarationNo: { type: TAF.Formatter.FieldTypes.TEXT },
        lineNo: { type: TAF.Formatter.FieldTypes.INTEGER },
        purchaseValueMYR: { type: TAF.Formatter.FieldTypes.DECIMAL },
        gstValueMYR: { type: TAF.Formatter.FieldTypes.DECIMAL },
        fcyCode: { type: TAF.Formatter.FieldTypes.TEXT },
        purchaseFCY: { type: TAF.Formatter.FieldTypes.DECIMAL },
        gstFCY: { type: TAF.Formatter.FieldTypes.DECIMAL },
        companyName: { type: TAF.Formatter.FieldTypes.TEXT },
        companyBRN: { type: TAF.Formatter.FieldTypes.TEXT },
        companyGSTNumber: { type: TAF.Formatter.FieldTypes.TEXT },
        periodStart: { type: TAF.Formatter.FieldTypes.DATE },
        periodEnd: { type: TAF.Formatter.FieldTypes.DATE },
        fileCreationDate: { type: TAF.Formatter.FieldTypes.DATE },
        productVersion: { type: TAF.Formatter.FieldTypes.TEXT },
        gafVersion: { type: TAF.Formatter.FieldTypes.TEXT },        
    };
    
    return fields;
};

TAF.MY.Formatter.GAF = function _SAT() {
    TAF.Formatter.ReportFormatter.call(this);
    this.fields = new TAF.MY.Formatter.FieldDefinitions().getFields();
    
    this.TEMPLATE = {};
    
    this.TEMPLATE.REPORT_HEADER = '';
    this.TEMPLATE.REPORT_FOOTER = '';
    
    this.TEMPLATE.COMPANY_LINE = '';
    
    this.TEMPLATE.PURCHASE_HEADER = '';
    this.TEMPLATE.PURCHASE_FOOTER = '';
    this.TEMPLATE.PURCHASE_LINE = '';
    
    this.TEMPLATE.SUPPLY_HEADER = '';
    this.TEMPLATE.SUPPLY_LINE = '';
    this.TEMPLATE.SUPPLY_FOOTER = '';
    
    this.TEMPLATE.GL_HEADER = '';
    this.TEMPLATE.GL_FOOTER = '';
    this.TEMPLATE.GL_LINE = '';
    
    this.TEMPLATE.FOOTER_HEADER = '';
    this.TEMPLATE.FOOTER_FOOTER = '';
    this.TEMPLATE.FOOTER_LINE = '';
};
TAF.MY.Formatter.GAF.prototype = Object.create(TAF.Formatter.ReportFormatter.prototype);

TAF.MY.Formatter.GAF.prototype.formatReportHeader = function _formatReportHeader() {
    return this.TEMPLATE.REPORT_HEADER;
};

TAF.MY.Formatter.GAF.prototype.formatReportFooter = function _formatReportFooter() {
    return this.TEMPLATE.REPORT_FOOTER;
};

TAF.MY.Formatter.GAF.prototype.formatCompanyLine = function _formatCompanyLine(data) {
    return this.formatElement(data, this.TEMPLATE.COMPANY_LINE);
};

TAF.MY.Formatter.GAF.prototype.formatPurchaseHeader = function _formatPurchaseHeader() {
    return this.TEMPLATE.PURCHASE_HEADER;
};

TAF.MY.Formatter.GAF.prototype.formatPurchaseFooter = function _formatPurchaseFooter() {
    return this.TEMPLATE.PURCHASE_FOOTER;
};

TAF.MY.Formatter.GAF.prototype.formatPurchaseLine = function _formatPurchaseLine(data) {
    return this.formatElement(data, this.TEMPLATE.PURCHASE_LINE);
};

TAF.MY.Formatter.GAF.prototype.formatSupplyHeader = function _formatSupplyHeader() {
    return this.TEMPLATE.SUPPLY_HEADER;
};

TAF.MY.Formatter.GAF.prototype.formatSupplyLine = function _formatSupplyLine(data) {
    return this.formatElement(data, this.TEMPLATE.SUPPLY_LINE);
};

TAF.MY.Formatter.GAF.prototype.formatSupplyFooter = function _formatSupplyFooter() {
    return this.TEMPLATE.SUPPLY_FOOTER;
};

TAF.MY.Formatter.GAF.prototype.formatGLHeader = function _formatGLHeader() {
    return this.TEMPLATE.GL_HEADER;
};

TAF.MY.Formatter.GAF.prototype.formatGLFooter = function _formatGLFooter() {
    return this.TEMPLATE.GL_FOOTER;
};

TAF.MY.Formatter.GAF.prototype.formatGLLine = function _formatGLLine(data) {
    return this.formatElement(data, this.TEMPLATE.GL_LINE);
};

TAF.MY.Formatter.GAF.prototype.formatFooterHeader = function _formatFooterHeader() {
    return this.TEMPLATE.FOOTER_HEADER;
};

TAF.MY.Formatter.GAF.prototype.formatFooterFooter = function _formatFooterFooter() {
    return this.TEMPLATE.FOOTER_FOOTER;
};

TAF.MY.Formatter.GAF.prototype.formatFooterLine = function _formatFooterLine(data) {
    return this.formatElement(data, this.TEMPLATE.FOOTER_LINE);
};

