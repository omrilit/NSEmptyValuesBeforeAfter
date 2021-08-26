/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.Formatter = TAF.MY.Formatter || {};

TAF.MY.Formatter.XML = function _XML() {
    TAF.MY.Formatter.GAF.call(this);

    this.isXML = true;
    this.dateFormat = 'yyyy-MM-dd';
    
    this.TEMPLATE.REPORT_HEADER = ['<?xml version="1.0" encoding="UTF-8"?>',
                                   '<GSTAuditFile>'].join('\n');
    this.TEMPLATE.REPORT_FOOTER = '</GSTAuditFile>';
    
    this.TEMPLATE.COMPANY_LINE = ['<Companies>',
                            '<Company>',
                            '<BusinessName>{companyName}</BusinessName>',
                            '<BusinessRN>{companyBRN}</BusinessRN>',
                            '<GSTNumber>{companyGSTNumber}</GSTNumber>',
                            '<PeriodStart>{periodStart}</PeriodStart>',
                            '<PeriodEnd>{periodEnd}</PeriodEnd>',
                            '<GAFCreationDate>{fileCreationDate}</GAFCreationDate>',
                            '<ProductVersion>{productVersion}</ProductVersion>',
                            '<GAFVersion>{gafVersion}</GAFVersion>',
                            '</Company>',
                            '</Companies>'].join('\n');
    
    this.TEMPLATE.PURCHASE_HEADER = '<Purchases>';
    this.TEMPLATE.PURCHASE_FOOTER = '</Purchases>';
    this.TEMPLATE.PURCHASE_LINE = ['<Purchase>',
                             '<SupplierName>{supplierName}</SupplierName>',
                             '<SupplierBRN>{supplierBRN}</SupplierBRN>',
                             '<InvoiceDate>{invoiceDate}</InvoiceDate>',
                             '<InvoiceNumber>{invoiceNo}</InvoiceNumber>',
                             '<ImportDeclarationNo>{importDeclarationNo}</ImportDeclarationNo>',
                             '<LineNumber>{lineNo}</LineNumber>',
                             '<ProductDescription>{productDescription}</ProductDescription>',
                             '<PurchaseValueMYR>{purchaseValueMYR}</PurchaseValueMYR>',
                             '<GSTValueMYR>{gstValueMYR}</GSTValueMYR>',
                             '<TaxCode>{taxCode}</TaxCode>',
                             '<FCYCode>{fcyCode}</FCYCode>',
                             '<PurchaseFCY>{purchaseFCY}</PurchaseFCY>',
                             '<GSTFCY>{gstFCY}</GSTFCY>',
                             '</Purchase>'].join('\n');
    
    this.TEMPLATE.SUPPLY_HEADER = '<Supplies>';
    this.TEMPLATE.SUPPLY_LINE = ['<Supply>',
                                 '<CustomerName>{customerName}</CustomerName>',
                                 '<CustomerBRN>{customerBrn}</CustomerBRN>',
                                 '<InvoiceDate>{invoiceDate}</InvoiceDate>',
                                 '<InvoiceNumber>{invoiceNo}</InvoiceNumber>',
                                 '<LineNumber>{lineNo}</LineNumber>',
                                 '<ProductDescription>{productDescription}</ProductDescription>',
                                 '<SupplyValueMYR>{amount}</SupplyValueMYR>',
                                 '<GSTValueMYR>{gstAmount}</GSTValueMYR>',
                                 '<TaxCode>{taxCode}</TaxCode>',
                                 '<Country>{country}</Country>',
                                 '<FCYCode>{currencyCode}</FCYCode>',
                                 '<SupplyFCY>{foreignAmount}</SupplyFCY>',
                                 '<GSTFCY>{foreignGstAmount}</GSTFCY>',
                                 '</Supply>'].join('\n');
    this.TEMPLATE.SUPPLY_FOOTER = '</Supplies>';
    
    this.TEMPLATE.GL_HEADER = '<Ledger>';
    this.TEMPLATE.GL_FOOTER = '</Ledger>';
    this.TEMPLATE.GL_LINE = ['<LedgerEntry>',
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
                             '</LedgerEntry>'].join('\n');
    
    this.TEMPLATE.FOOTER_HEADER = '<Footer>';
    this.TEMPLATE.FOOTER_FOOTER = '</Footer>';
    this.TEMPLATE.FOOTER_LINE = ['<TotalPurchaseCount>{purchaseLines}</TotalPurchaseCount>',
                                 '<TotalPurchaseAmount>{purchaseTotalAmount}</TotalPurchaseAmount>',
                                 '<TotalPurchaseAmountGST>{purchaseGstTotalAmount}</TotalPurchaseAmountGST>',
                                 '<TotalSupplyCount>{supplyLines}</TotalSupplyCount>',
                                 '<TotalSupplyAmount>{supplyTotalAmount}</TotalSupplyAmount>',
                                 '<TotalSupplyAmountGST>{supplyGstTotalAmount}</TotalSupplyAmountGST>',
                                 '<TotalLedgerCount>{ledgerLines}</TotalLedgerCount>',
                                 '<TotalLedgerDebit>{ledgerDebit}</TotalLedgerDebit>',
                                 '<TotalLedgerCredit>{ledgerCredit}</TotalLedgerCredit>',
                                 '<TotalLedgerBalance>{ledgerBalance}</TotalLedgerBalance>'].join('\n');
};

TAF.MY.Formatter.XML.prototype = Object.create(TAF.MY.Formatter.GAF.prototype);
