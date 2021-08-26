/**
 * Copyright � 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.DAO = TAF.ES.DAO || {};

TAF.ES.DAO.CashCollectionsDAO = function _CashCollectionsDAO(params) {
	TAF.DAO.SearchDAO.call(this, params);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_es_sii_cash_collections';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
};
TAF.ES.DAO.CashCollectionsDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.ES.DAO.CashCollectionsDAO.prototype.createSearchColumns = function _createSearchFilters(params) {
    this.columns.push(new nlobjSearchColumn('trandate', null, 'group').setFunction('year'));
    this.columns.push(new nlobjSearchColumn('grossamount', this.multiBookJoinColumn, 'sum'));
};

TAF.ES.DAO.CashCollectionsDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
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

    if (params.threshold !== undefined) {
        this.filters.push(new nlobjSearchFilter('grossamount', this.multiBookJoinColumn, 'greaterthan', params.threshold).setSummaryType('sum'));
    }
};

TAF.ES.DAO.CashCollectionsDAO.prototype.rowToObject = function _rowToObject(row) {
	if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    try {
        return {
            year: row.getValue(this.columns[0]),
            grossAmount: row.getValue(this.columns[1]),
            isCustomerPerson: row.getValue('isperson', 'customer', 'group'),
            customerCompanyName: row.getValue('companyname', 'customer', 'group'),
            customerFirstName: row.getValue('firstname', 'customer', 'group'),
            customerLastName: row.getValue('lastname', 'customer', 'group'),
            customerVatRegNo: row.getValue('vatregnumber', 'customer', 'group'),
            defaultBillingCountryCode: row.getValue('billcountrycode', 'customer', 'group'),
            customerIdType: row.getValue('custentity_sii_id_type', 'customer', 'group'),
            customerId: row.getValue('custentity_sii_id', 'customer', 'group')
        };
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in TAF.ES.DAO.CashCollectionsDAO.rowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in processing search results.');
    }
};
