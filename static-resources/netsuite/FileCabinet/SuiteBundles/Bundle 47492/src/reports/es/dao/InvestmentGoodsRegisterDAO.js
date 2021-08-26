/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.DAO = TAF.ES.DAO || {};

TAF.ES.DAO.InvestmentGoodsRegisterDAO = function _InvestmentGoodsRegisterDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_es_sii_investment_goods_reg';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
};
TAF.ES.DAO.InvestmentGoodsRegisterDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.ES.DAO.InvestmentGoodsRegisterDAO.prototype.createSearchColumns = function _createSearchFilters(params) {
    if (params && params.bookId && this.hasForeignCurrencyManagement) {
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({taxamount} * {accountingtransaction.exchangerate}) / {exchangerate}'));
    } else {
        this.columns.push(new nlobjSearchColumn('taxamount'));
    }

    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
};

TAF.ES.DAO.InvestmentGoodsRegisterDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
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
};

TAF.ES.DAO.InvestmentGoodsRegisterDAO.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    try {
        return {
            internalId: row.getId(),
            tranId: row.getValue('tranid'),
            tranDate: row.getValue('trandate'),
            taxCode: row.getValue('taxitem'),
            itemName: row.getText('item'),
            serviceDate: row.getValue('custcol_sii_service_date'),
            accountingDate: row.getValue('custbody_sii_accounting_date'),
            annualProrate: row.getValue('custcol_sii_annual_prorate'),
            netAmount: row.getValue(this.columns[1]),
            taxAmount: row.getValue(this.columns[0]),
            billingCountryCode: row.getValue('billcountrycode'),
            memo: row.getValue('memomain'),
            invoiceDate: row.getValue('custbody_sii_invoice_date'),
            isVendorPerson: row.getValue('isperson', 'vendor'),
            vendorCompanyName: row.getValue('companyname', 'vendor'),
            vendorFirstName: row.getValue('firstname', 'vendor'),
            vendorLastName: row.getValue('lastname', 'vendor'),
            vendorVatRegNo: row.getValue('vatregnumber', 'vendor'),
            defaultBillingCountryCode: row.getValue('billcountrycode', 'vendor'),
            vendorIdType: row.getValue('custentity_sii_id_type', 'vendor'),
            vendorId: row.getValue('custentity_sii_id', 'vendor'),
            externalReference: row.getValue('custbody_sii_external_reference')
        };
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in TAF.ES.DAO.InvestmentGoodsRegisterDAO.rowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in processing search results.');
    }
};