/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.Formatter = TAF.SG.Formatter || {};

TAF.SG.Formatter.PSV = function _PSV() {
    TAF.SG.Formatter.IAF.call(this);
	
    this.TEMPLATE.IAF_HEADER = 'CompInfoStart|';
    this.TEMPLATE.IAF_FOOTER = '';
    this.TEMPLATE.COMPANY_INFO_HEADER = 'CompanyName|CompanyUEN|GSTNo|PeriodStart|PeriodEnd|IAFCreationDate|ProductVersion|IAFVersion|';
    this.TEMPLATE.COMPANY_INFO_BODY = '{companyName}|{companyUEN}|{gstNo}|{periodStart}|{periodEnd}|{iafCreationDate}|{productVersion}|{iafVersion}|';
    this.TEMPLATE.COMPANY_INFO_FOOTER = 'CompInfoEnd|';
    
    this.TEMPLATE.PURCHASE_HEADER = 'PurcDataStart|\nSupplierName|SupplierUEN|InvoiceDate|InvoiceNo|PermitNo|LineNo|ProductDescription|PurchaseValueSGD|GSTValueSGD|TaxCode|FCYCode|PurchaseFCY|GSTFCY|';
    this.TEMPLATE.PURCHASE_BODY = '{supplierName}|{supplierUEN}|{invoiceDate}|{invoiceNo}|{permitNo}|{lineNo}|{productDescription}|{purchaseValueSGD}|{gstValueSGD}|{taxCode}|{fcyCode}|{purchaseFCY}|{gstFCY}|';
    this.TEMPLATE.PURCHASE_FOOTER = 'PurcDataEnd|{purchaseTotalSGD}|{gstTotalSGD}|{transactionCountTotal}|';
    
    this.TEMPLATE.SUPPLY_HEADER = 'SuppDataStart|\nCustomerName|CustomerUEN|InvoiceDate|InvoiceNo|LineNo|ProductDescription|SupplyValueSGD|GSTValueSGD|TaxCode|Country|FCYCode|SupplyFCY|GSTFCY|';
    this.TEMPLATE.SUPPLY_BODY = '{customerName}|{customerUEN}|{invoiceDate}|{invoiceNo}|{lineNo}|{productDescription}|{supplyValueSGD}|{gstValueSGD}|{taxCode}|{country}|{fcyCode}|{supplyFCY}|{gstFCY}|';
    this.TEMPLATE.SUPPLY_FOOTER = 'SuppDataEnd|{supplyTotalSGD}|{gstTotalSGD}|{transactionCountTotal}|';
    
    this.TEMPLATE.GL_HEADER = 'GLDataStart|\nTransactionDate|AccountID|AccountName|TransactionDescription|Name|TransactionID|SourceDocumentID|SourceType|Debit|Credit|Balance|';
    this.TEMPLATE.GL_BODY = '{transactionDate}|{accountID}|{accountName}|{transactionDescription}|{name}|{transactionID}|{sourceDocumentID}|{sourceType}|{debit}|{credit}|{balance}|';
    this.TEMPLATE.GL_FOOTER = 'GLDataEnd|{totalDebit}|{totalCredit}|{transactionCountTotal}|{gltCurrency}|';
};

TAF.SG.Formatter.PSV.prototype = Object.create(TAF.SG.Formatter.IAF.prototype);

TAF.SG.Formatter.PSV.prototype.formatString = function _formatString(data, width) {
    var formatted = TAF.SG.Formatter.IAF.prototype.formatString.call(this, data, width);

    if (formatted && formatted.indexOf('|') > -1) {
        formatted = formatted.replace(/\|/g, ' ');
    }

    return formatted;
};
