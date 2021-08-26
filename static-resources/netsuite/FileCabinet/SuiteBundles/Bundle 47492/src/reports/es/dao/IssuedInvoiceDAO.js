/**
 * Copyright 2017, 2019 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.DAO = TAF.ES.DAO || {};

TAF.ES.DAO.IssuedInvoiceDAO = function _IssuedInvoiceDAO(params) {
	TAF.DAO.SearchDAO.call(this, params);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_es_sii_issued_invoices';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.hasprojectManagement = this.context.getFeature('JOBS');
};
TAF.ES.DAO.IssuedInvoiceDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.ES.DAO.IssuedInvoiceDAO.prototype.createSearchColumns = function _createSearchFilters(params) {
    if (params && params.bookId && this.hasForeignCurrencyManagement) {
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({taxamount} * {accountingtransaction.exchangerate}) / {exchangerate}'));
    } else {
        this.columns.push(new nlobjSearchColumn('taxamount'));
    }
	
    this.columns.push(new nlobjSearchColumn('signedAmount'));
    this.columns.push(new nlobjSearchColumn('account'));
    if(this.hasprojectManagement)
    {
        this.columns.push(new nlobjSearchColumn('companyname','customermain'));
        this.columns.push(new nlobjSearchColumn('firstname','customermain'));
        this.columns.push(new nlobjSearchColumn('lastname','customermain'));
        this.columns.push(new nlobjSearchColumn('isperson','customermain'));
        this.columns.push(new nlobjSearchColumn('vatregnumber','customermain'));
        this.columns.push(new nlobjSearchColumn('billcountrycode','customermain'));
        this.columns.push(new nlobjSearchColumn('custentity_sii_id_type','customermain'));
        this.columns.push(new nlobjSearchColumn('custentity_sii_id','customermain'));
    }
};

TAF.ES.DAO.IssuedInvoiceDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
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

    if (params.internalid) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.internalid));
    }

    if (params.registrationStatus) {
        this.filters.push(new nlobjSearchFilter('custbody_sii_registration_status', null, 'anyof', params.registrationStatus));
    } else {
        this.filters.push(new nlobjSearchFilter('custbody_sii_registration_status', null, 'noneof',
            [TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED, TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED_WITH_ERRORS]));
    }
};

TAF.ES.DAO.IssuedInvoiceDAO.prototype.rowToObject = function _rowToObject(row) {
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
            specialSchemeCode: row.getValue('custbody_sii_spcl_scheme_code_sales'),
            propertyLocation: row.getValue('custbody_sii_property_location'),
            landRegisterRef: row.getValue('custbody_sii_land_register'),
            isIssuedByThirdParty: row.getValue('custbody_sii_is_third_party'),
            exemptionDetails: row.getValue('custbody_sii_exempt_details'),
            exemptionLineDetails: row.getValue('custcol_sii_exempt_line_details'),
            operationDate: row.getValue('custbody_sii_operation_date'),
            isCustomerPerson: this.hasprojectManagement? row.getValue('isperson', 'customermain'): row.getValue('isperson', 'customer'),
            customerCompanyName: this.hasprojectManagement? row.getValue('companyname', 'customermain'): row.getValue('companyname', 'customer'),
            customerFirstName: this.hasprojectManagement? row.getValue('firstname', 'customermain'): row.getValue('firstname', 'customer'),
            customerLastName: this.hasprojectManagement? row.getValue('lastname', 'customermain'): row.getValue('lastname', 'customer'),
            customerVatRegNo: this.hasprojectManagement? row.getValue('vatregnumber', 'customermain'): row.getValue('vatregnumber', 'customer'),
            defaultBillingCountryCode: this.hasprojectManagement? row.getValue('billcountrycode', 'customermain'): row.getValue('billcountrycode', 'customer'),
            customerIdType: this.hasprojectManagement? row.getValue('custentity_sii_id_type', 'customermain'): row.getValue('custentity_sii_id_type', 'customer'),
            customerId: this.hasprojectManagement? row.getValue('custentity_sii_id', 'customermain'): row.getValue('custentity_sii_id', 'customer'),
            invoiceType: row.getValue('custbody_sii_issued_inv_type'),
            externalReference: row.getValue('custbody_sii_external_reference'),
            isArticle72_73: row.getValue('custbody_sii_article_72_73'),
            isNotReportedInTime: row.getValue('custbody_sii_not_reported_in_time'),
            isArticle61d: row.getValue('custbody_sii_article_61d'),
            account: row.getValue('account'),
        };
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in TAF.ES.DAO.IssuedInvoiceDAO.rowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in processing search results.');
    }
};