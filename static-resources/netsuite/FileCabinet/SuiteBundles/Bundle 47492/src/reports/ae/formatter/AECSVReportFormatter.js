/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Formatter = TAF.AE.Formatter || {};

TAF.AE.Formatter.CSV = function _CSV() {
    TAF.AE.Formatter.FAF.call(this);
    this.FILE_EXTENSION = 'csv'
	
    this.TEMPLATE.FAF_HEADER = '';
    this.TEMPLATE.FAF_FOOTER = '';
    this.TEMPLATE.COMPANY_INFO_HEADER = 'Company Information Table\nTaxablePersonNameEn,TaxablePersonNameAr,TRN,TaxAgencyName,TAN,TaxAgentName,TAAN,PeriodStart,PeriodEnd,FAFCreationDate,ProductVersion,FAFVersion';
    this.TEMPLATE.COMPANY_INFO_BODY = '{companyName},,{trn},,,,,{periodStart},{periodEnd},{fafCreationDate},{productVersion},{fafVersion}';
    
    this.TEMPLATE.PURCHASE_HEADER = 'Supplier Purchase Listing Table\nSupplierName,SupplierCountry,SupplierTRN,InvoiceDate,InvoiceNo,PermitNo,TransactionID,LineNo,ProductDescription,PurchaseValueAED,VATValueAED,TaxCode,FCYCode,PurchaseFCY,VATFCY';
    this.TEMPLATE.PURCHASE_BODY = '{supplierName},{supplierCountry},{supplierTRN},{invoiceDate},{invoiceNo},{permitNo},{glNumber},{lineNo},{productDescription},{purchaseValueAED},{vatValueAED},{taxCode},{fcyCode},{purchaseFCY},{vatFCY}';
    this.TEMPLATE.PURCHASE_TOTAL_HEADER = 'Supplier Purchase Listing Total\nPurchaseTotalAED,VATTotalAED,TransactionCountTotal\n';
    this.TEMPLATE.PURCHASE_TOTAL = '{purchaseTotalAED},{vatTotalAED},{transactionCountTotal}';
    
    this.TEMPLATE.SUPPLY_HEADER = 'Customer Supply Listing Table\nCustomerName,CustomerCountry,CustomerTRN,InvoiceDate,InvoiceNo,TransactionID,LineNo,ProductDescription,SupplyValueAED,VATValueAED,TaxCode,Country,FCYCode,SupplyFCY,VATFCY';
    this.TEMPLATE.SUPPLY_BODY = '{customerName},{customerCountry},{customerTRN},{invoiceDate},{invoiceNo},{glNumber},{lineNo},{productDescription},{supplyValueAED},{vatValueAED},{taxCode},{country},{fcyCode},{supplyFCY},{vatFCY}';
    this.TEMPLATE.SUPPLY_TOTAL_HEADER = 'Customer Supply Listing Total\nSupplyTotalAED,VATTotalAED,TransactionCountTotal\n';
    this.TEMPLATE.SUPPLY_TOTAL = '{supplyTotalAED},{vatTotalAED},{transactionCountTotal}';
    
    this.TEMPLATE.GL_HEADER = 'General Ledger Table\nTransactionDate,AccountID,AccountName,TransactionDescription,Name,TransactionID,SourceDocumentID,SourceType,Debit,Credit,Balance';
    this.TEMPLATE.GL_BODY = '{transactionDate},{accountID},{accountName},{transactionDescription},{name},{transactionID},{sourceDocumentID},{sourceType},{debit},{credit},{balance}';
    this.TEMPLATE.GL_TOTAL_HEADER = 'General Ledger Table Total\nTotalDebit,TotalCredit,TransactionCountTotal,GLTCurrency\n';
    this.TEMPLATE.GL_TOTAL = '{totalDebit},{totalCredit},{transactionCountTotal},{gltCurrency}';
};

TAF.AE.Formatter.CSV.prototype = Object.create(TAF.AE.Formatter.FAF.prototype);

TAF.AE.Formatter.CSV.prototype.formatString = function _formatString(data, width) {
    var formatted = TAF.AE.Formatter.FAF.prototype.formatString.call(this, data, width);

    formatted = formatted.replace(/\"/g, '');
    
    if (formatted && formatted.indexOf(',') > -1) {
        formatted = '"' + formatted + '"';
    }

    return formatted;
};

TAF.AE.Formatter.CSV.prototype.formatFileName = function _formatFileName(startDate, endDate) {
	if (!startDate) {
		throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.formatFileName: startDate is a required parameter');
	}
	if (!endDate) {
		throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.formatFileName: endDate is a required parameter');
	}

    var startDateStr = this.formatDate(nlapiDateToString(startDate), 'MMMyyyy');
    var endDateStr = this.formatDate(nlapiDateToString(endDate), 'MMMyyyy');
    var fileName = '';

    if (startDateStr === endDateStr) {
        fileName += startDateStr;
    } else {
        fileName += startDateStr + '-' + endDateStr;
    }

	return fileName + '.' + this.FILE_EXTENSION;
};