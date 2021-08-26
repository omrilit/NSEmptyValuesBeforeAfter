/**
 * Copyright © 2017, 2018 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.DAO = TAF.ES.DAO || {};

TAF.ES.DAO.ReceivedInvoiceAmendingTxnDAO = function _ReceivedInvoiceAmendingTxnDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_es_sii_rectify_bills';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.hasCustomGLlines = this.context.getFeature('CUSTOMGLLINES');
};
TAF.ES.DAO.ReceivedInvoiceAmendingTxnDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.ES.DAO.ReceivedInvoiceAmendingTxnDAO.prototype.createSearchColumns = function _createSearchFilters(params) {
    if (params && params.bookId && this.hasForeignCurrencyManagement) {
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({taxamount} * {accountingtransaction.exchangerate}) / {exchangerate}'));
    } else {
        this.columns.push(new nlobjSearchColumn('taxamount'));
    }

    this.columns.push(new nlobjSearchColumn('signedAmount'));
    this.columns.push(new nlobjSearchColumn('custbody_itr_doc_number')); // ITR field
    this.columns.push(new nlobjSearchColumn('recordtype','createdfrom'));
};

TAF.ES.DAO.ReceivedInvoiceAmendingTxnDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
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

TAF.ES.DAO.ReceivedInvoiceAmendingTxnDAO.prototype.rowToObject = function _rowToObject(row) {
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
            memoLine: row.getValue('memo'),
            createdFrom: row.getValue('createdfrom'),
            origBill: row.getValue('custbody_sii_orig_bill'),
            invoiceType: row.getValue('custbody_sii_correction_type'),
            referenceNo: row.getValue('custbody_sii_ref_no'),
            recordType: row.getValue('recordtype'),
            invoiceDate: row.getValue('custbody_sii_invoice_date'),
            operationDate: row.getValue('custbody_sii_operation_date'),
            accountingDate: row.getValue('custbody_sii_accounting_date'),
            externalReference: row.getValue('custbody_sii_external_reference'),
            isCustomGL: this.hasCustomGLlines ? row.getValue('customgl') : '',
            type: row.getValue('recordtype'),
            origTransType: row.getValue('recordtype','createdfrom') 
        };
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in TAF.ES.DAO.ReceivedInvoiceAmendingTxnDAO.rowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in processing search results.');
    }
};
