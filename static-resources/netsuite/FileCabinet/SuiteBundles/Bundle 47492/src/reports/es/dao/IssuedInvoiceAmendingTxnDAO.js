/**
 * Copyright © 2017, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.DAO = TAF.ES.DAO || {};

TAF.ES.DAO.IssuedInvoiceAmendingTxnDAO = function _IssuedInvoiceAmendingTxnDAO(params) {
	TAF.DAO.SearchDAO.call(this, params);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_es_sii_rectify_invoices';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
};
TAF.ES.DAO.IssuedInvoiceAmendingTxnDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.ES.DAO.IssuedInvoiceAmendingTxnDAO.prototype.createSearchColumns = function _createSearchFilters(params) {
    if (params && params.bookId && this.hasForeignCurrencyManagement) {
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({taxamount} * {accountingtransaction.exchangerate}) / {exchangerate}'));
    } else {
        this.columns.push(new nlobjSearchColumn('taxamount'));
    }

    this.columns.push(new nlobjSearchColumn('signedAmount'));
    this.columns.push(new nlobjSearchColumn('account'));
    this.columns.push(new nlobjSearchColumn('recordtype'));
};

TAF.ES.DAO.IssuedInvoiceAmendingTxnDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'params is required.');
    }

    if (params.startDate) {
        this.filters.push(new nlobjSearchFilter('trandate', null, 'onorafter', params.startDate));
    }

    if (params.endDate) {
        this.filters.push(new nlobjSearchFilter('trandate', null, 'onorbefore', params.endDate));
    }

    if (params.subsidiary) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'is', params.subsidiary));
    }

    if (params.nexusId) {
        this.filters.push(new nlobjSearchFilter('nexus', null, 'is', params.nexusId));
    }

    if (params.bookId && this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
    
    if (params.registrationStatus) {
        this.filters.push(new nlobjSearchFilter('custbody_sii_registration_status', null, 'anyof', params.registrationStatus));
    } else {
    	this.filters.push(new nlobjSearchFilter('custbody_sii_registration_status', null, 'noneof', [TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED, 
                                                                                                     TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED_WITH_ERRORS]));
    }
};

TAF.ES.DAO.IssuedInvoiceAmendingTxnDAO.prototype.rowToObject = function _rowToObject(row) {
	if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    try {
        return {
            internalId: row.getId(),
            tranId: row.getValue('tranid'),
            tranDate: row.getValue('trandate'),
            taxCode: row.getValue('taxitem'),
            signedAmount: row.getValue(this.columns[1]),
            taxAmount: row.getValue(this.columns[0]),
            memo: row.getValue('memomain'),
            origTranId: row.getValue('createdfrom') || row.getValue('custbody_sii_orig_invoice'),
            invoiceType: row.getValue('custbody_sii_correction_type'),
            operationDate: row.getValue('custbody_sii_operation_date'),
            externalReference: row.getValue('custbody_sii_external_reference'),
            exemptionLineDetails: row.getValue('custcol_sii_exempt_line_details'),
            account: row.getValue('account'),
            type: row.getValue('recordtype'),
            origTransType: row.getValue('recordtype','createdfrom')  
        };
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in TAF.ES.DAO.IssuedInvoiceAmendingTxnDAO.rowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in processing search results.');
    }
};
