/**
 * Copyright � 2017, 2018, 2020, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.DAO = TAF.ES.DAO || {};

TAF.ES.DAO.IntraCommunityTransactionDAO = function _IntraCommunityTransactionDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_es_sii_intra_community_txn';
};
TAF.ES.DAO.IntraCommunityTransactionDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.ES.DAO.IntraCommunityTransactionDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
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
};

TAF.ES.DAO.IntraCommunityTransactionDAO.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    try {
        return {
            internalId: row.getId(),
            type: row.getValue('type'),
            tranId: row.getValue('tranid'),
            tranDate: row.getValue('trandate'),
            taxCode: row.getValue('taxitem'),
            billingCountryCode: row.getValue('billcountrycode'),
            memo: row.getValue('memomain'),
            intraCommunityTxnType: row.getValue('custbody_sii_intra_txn_type'),
            invoiceDate: row.getValue('custbody_sii_invoice_date'),
            accountingDate: row.getValue('custbody_sii_accounting_date'),
            isCustomerPerson: row.getValue('isperson', 'customer'),
            customerCompanyName: row.getValue('companyname', 'customer'),
            customerFirstName: row.getValue('firstname', 'customer'),
            customerLastName: row.getValue('lastname', 'customer'),
            customerVatRegNo: row.getValue('vatregnumber', 'customer'),
            customerDefaultBillingCountryCode: row.getValue('billcountrycode', 'customer'),
            customerIdType: row.getValue('custentity_sii_id_type', 'customer'),
            customerId: row.getValue('custentity_sii_id', 'customer'),
            customerInternalId: row.getValue('internalid', 'customer'),
            isVendorPerson: row.getValue('isperson', 'vendor'),
            vendorCompanyName: row.getValue('companyname', 'vendor'),
            vendorFirstName: row.getValue('firstname', 'vendor'),
            vendorLastName: row.getValue('lastname', 'vendor'),
            vendorVatRegNo: row.getValue('vatregnumber', 'vendor'),
            vendorDefaultBillingCountryCode: row.getValue('billcountrycode', 'vendor'),
            vendorIdType: row.getValue('custentity_sii_id_type', 'vendor'),
            vendorId: row.getValue('custentity_sii_id', 'vendor'),
            vendorInternalId: row.getValue('internalid', 'vendor'),
            externalReference: row.getValue('custbody_sii_external_reference'),
            isNotReportedInTime: row.getValue('custbody_sii_not_reported_in_time')
        };
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in TAF.ES.DAO.IntraCommunityTransactionDAO.rowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in processing search results.');
    }
};
