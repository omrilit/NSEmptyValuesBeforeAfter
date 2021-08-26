/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.Formatter = TAF.MY.Formatter || {};

TAF.MY.Formatter.TXT = function _TXT() {
    TAF.MY.Formatter.GAF.call(this);

    this.isXML = false;
    this.dateFormat = 'dd/MM/yyyy';
    this.INVALID_CHARACTERS = /\n|\|/g;

    this.TEMPLATE.COMPANY_LINE = 'C|{companyName}|{companyBRN}|{companyGSTNumber}|{periodStart}|{periodEnd}|{fileCreationDate}|{productVersion}|{gafVersion}|';
    this.TEMPLATE.PURCHASE_LINE = 'P|{supplierName}|{supplierBRN}|{invoiceDate}|{invoiceNo}|{importDeclarationNo}|{lineNo}|{productDescription}|{purchaseValueMYR}|{gstValueMYR}|{taxCode}|{fcyCode}|{purchaseFCY}|{gstFCY}|';
    this.TEMPLATE.SUPPLY_LINE = 'S|{customerName}|{customerBrn}|{invoiceDate}|{invoiceNo}|{lineNo}|{productDescription}|{amount}|{gstAmount}|{taxCode}|{country}|{currencyCode}|{foreignAmount}|{foreignGstAmount}|';
    this.TEMPLATE.GL_LINE = 'L|{transactionDate}|{accountID}|{accountName}|{transactionDescription}|{name}|{transactionID}|{sourceDocumentID}|{sourceType}|{debit}|{credit}|{balance}|';
    this.TEMPLATE.FOOTER_LINE = 'F|{purchaseLines}|{purchaseTotalAmount}|{purchaseGstTotalAmount}|{supplyLines}|{supplyTotalAmount}|{supplyGstTotalAmount}|{ledgerLines}|{ledgerDebit}|{ledgerCredit}|{ledgerBalance}|';
};

TAF.MY.Formatter.TXT.prototype = Object.create(TAF.MY.Formatter.GAF.prototype);
