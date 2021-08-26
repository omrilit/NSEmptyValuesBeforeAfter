/**
 * Copyright © 2017, 2018 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.DAO = TAF.ES.DAO || {};

TAF.ES.DAO.ReceivedInvoiceDAO = function _ReceivedInvoiceDAO(params) {
	TAF.DAO.SearchDAO.call(this, params);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_es_sii_received_invoices';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.hasCustomGLlines = this.context.getFeature('CUSTOMGLLINES');
};
TAF.ES.DAO.ReceivedInvoiceDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.ES.DAO.ReceivedInvoiceDAO.prototype.createSearchColumns = function _createSearchFilters(params) {
    if (params && params.bookId && this.hasForeignCurrencyManagement) {
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({taxamount} * {accountingtransaction.exchangerate}) / {exchangerate}'));
    } else {
        this.columns.push(new nlobjSearchColumn('taxamount'));
    }

    this.columns.push(new nlobjSearchColumn('signedamount'));

    if(this.isOneWorld){
    this.columns.push(new nlobjSearchColumn('subsidiary'));
    }
};

TAF.ES.DAO.ReceivedInvoiceDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'params is required.');
    }

    if (params.internalId) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.internalId));
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
        this.filters.push(new nlobjSearchFilter('custbody_sii_registration_status', null, 'noneof',
            [TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED, TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED_WITH_ERRORS]));
    }
};

TAF.ES.DAO.ReceivedInvoiceDAO.prototype.rowToObject = function _rowToObject(row) {
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
            billingCountryCode: row.getValue('billcountrycode'),
            memo: row.getValue('memomain'),
            memoLine: row.getValue('memo'),
            specialSchemeCode: row.getValue('custbody_sii_spcl_scheme_code_purchase'),
            invoiceDate: row.getValue('custbody_sii_invoice_date'),
            operationDate: row.getValue('custbody_sii_operation_date'),
            accountingDate: row.getValue('custbody_sii_accounting_date'),
            isVendorPerson: row.getValue('isperson', 'vendor'),
            vendorCompanyName: row.getValue('companyname', 'vendor'),
            vendorFirstName: row.getValue('firstname', 'vendor'),
            vendorLastName: row.getValue('lastname', 'vendor'),
            vendorVatRegNo: row.getValue('vatregnumber', 'vendor'),
            defaultBillingCountryCode: row.getValue('billcountrycode', 'vendor'),
            vendorIdType: row.getValue('custentity_sii_id_type', 'vendor'),
            vendorId: row.getValue('custentity_sii_id', 'vendor'),
            invoiceType: row.getValue('custbody_sii_received_inv_type'),
            isCustomGL: this.hasCustomGLlines ? row.getValue('customgl') : '',
            externalReference: row.getValue('custbody_sii_external_reference'),
            isArticle72_73: row.getValue('custbody_sii_article_72_73'),
            isNotReportedInTime: row.getValue('custbody_sii_not_reported_in_time'),
            subsidiaryId: this.isOneWorld ? row.getValue('subsidiary') : '',
            isOneWorld: this.isOneWorld
        };
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in TAF.ES.DAO.ReceivedInvoiceDAO.rowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in processing search results.');
    }
};
