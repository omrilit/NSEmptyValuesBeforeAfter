/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.Formatter = TAF.SG.Formatter || {};

TAF.SG.Formatter.XML = function _XML() {
    TAF.SG.Formatter.IAF.call(this);
    
    this.isXML = true;

    this.TEMPLATE.IAF_HEADER = '<Company>';
    this.TEMPLATE.IAF_FOOTER = '</Company>';
    this.TEMPLATE.COMPANY_INFO_HEADER = '<CompanyInfo>';
    this.TEMPLATE.COMPANY_INFO_BODY = [
        '<CompanyName>{companyName}</CompanyName>',
        '<CompanyUEN>{companyUEN}</CompanyUEN>',
        '<GSTNo>{gstNo}</GSTNo>',
        '<PeriodStart>{periodStart}</PeriodStart>',
        '<PeriodEnd>{periodEnd}</PeriodEnd>',
        '<IAFCreationDate>{iafCreationDate}</IAFCreationDate>',
        '<ProductVersion>{productVersion}</ProductVersion>',
        '<IAFVersion>{iafVersion}</IAFVersion>'
    ].join('\n');
    this.TEMPLATE.COMPANY_INFO_FOOTER = '</CompanyInfo>';

    this.TEMPLATE.PURCHASE_HEADER = '<Purchase PurchaseTotalSGD="{purchaseTotalSGD}" GSTTotalSGD="{gstTotalSGD}" TransactionCountTotal="{transactionCountTotal}">';
    this.TEMPLATE.PURCHASE_BODY = [
        '<PurchaseLines>',
        '<SupplierName>{supplierName}</SupplierName>',
        '<SupplierUEN>{supplierUEN}</SupplierUEN>',
        '<InvoiceDate>{invoiceDate}</InvoiceDate>',
        '<InvoiceNo>{invoiceNo}</InvoiceNo>',
        '<PermitNo>{permitNo}</PermitNo>',
        '<LineNo>{lineNo}</LineNo>',
        '<ProductDescription>{productDescription}</ProductDescription>',
        '<PurchaseValueSGD>{purchaseValueSGD}</PurchaseValueSGD>',
        '<GSTValueSGD>{gstValueSGD}</GSTValueSGD>',
        '<TaxCode>{taxCode}</TaxCode>',
        '<FCYCode>{fcyCode}</FCYCode>',
        '<PurchaseFCY>{purchaseFCY}</PurchaseFCY>',
        '<GSTFCY>{gstFCY}</GSTFCY>',
        '</PurchaseLines>'].join('\n');
    this.TEMPLATE.PURCHASE_FOOTER = '</Purchase>';

    this.TEMPLATE.SUPPLY_HEADER = '<Supply SupplyTotalSGD="{supplyTotalSGD}" GSTTotalSGD="{gstTotalSGD}" TransactionCountTotal="{transactionCountTotal}">';
    this.TEMPLATE.SUPPLY_BODY = [
        '<SupplyLines>',
        '<CustomerName>{customerName}</CustomerName>',
        '<CustomerUEN>{customerUEN}</CustomerUEN>',
        '<InvoiceDate>{invoiceDate}</InvoiceDate>',
        '<InvoiceNo>{invoiceNo}</InvoiceNo>',
        '<LineNo>{lineNo}</LineNo>',
        '<ProductDescription>{productDescription}</ProductDescription>',
        '<SupplyValueSGD>{supplyValueSGD}</SupplyValueSGD>',
        '<GSTValueSGD>{gstValueSGD}</GSTValueSGD>',
        '<TaxCode>{taxCode}</TaxCode>',
        '<Country>{country}</Country>',
        '<FCYCode>{fcyCode}</FCYCode>',
        '<SupplyFCY>{supplyFCY}</SupplyFCY>',
        '<GSTFCY>{gstFCY}</GSTFCY>',
        '</SupplyLines>'].join('\n');
    this.TEMPLATE.SUPPLY_FOOTER = '</Supply>';

    this.TEMPLATE.GL_HEADER = '<GLData TotalDebit="{totalDebit}" TotalCredit="{totalCredit}" TransactionCountTotal="{transactionCountTotal}" GLTCurrency="{gltCurrency}">';
    this.TEMPLATE.GL_BODY = [
        '<GLDataLines>',
        '<TransactionDate>{transactionDate}</TransactionDate>',
        '<AccountID>{accountID}</AccountID>',
        '<AccountName>{accountName}</AccountName>',
        '<TransactionDescription>{transactionDescription}</TransactionDescription>',
        '<Name>{name}</Name>',
        '<TransactionID>{transactionID}</TransactionID>',
        '<SourceDocumentID>{sourceDocumentID}</SourceDocumentID>',
        '<SourceType>{sourceType}</SourceType>',
        '<Debit>{debit}</Debit>',
        '<Credit>{credit}</Credit>',
        '<Balance>{balance}</Balance>',
        '</GLDataLines>'].join('\n');
    this.TEMPLATE.GL_FOOTER = '</GLData>';
};

TAF.SG.Formatter.XML.prototype = Object.create(TAF.SG.Formatter.IAF.prototype);
