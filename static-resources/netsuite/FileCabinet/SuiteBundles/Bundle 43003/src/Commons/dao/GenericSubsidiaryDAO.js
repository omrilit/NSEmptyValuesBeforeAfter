/**
 * Copyright © 2015, 2018 Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.SubsidiaryDAO = function _SubsidiaryDAO() {
    Tax.DAO.RecordDAO.call(this);
    this.Name = 'SubsidiaryDAO';
    this.recordType = 'subsidiary';
    this.columns = [];
    this.filters = [];
    
    var context = nlapiGetContext();
    this.isMultibook = context.getFeature('MULTIBOOK');
    this.isForeignCurrencyMgmt = context.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.isMultiCalendar = context.getFeature('multiplecalendars');
    this.currencyColumn = 'currency';
};

Tax.DAO.SubsidiaryDAO.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

Tax.DAO.SubsidiaryDAO.prototype.prepareSearch = function prepareSearch(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A params object is required.');
    }
    
    
    if (params.id) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.id));
    }
    
    this.columns = [
        new nlobjSearchColumn('name'),
        new nlobjSearchColumn('taxidnum'),
        new nlobjSearchColumn('legalname'),
        new nlobjSearchColumn('namenohierarchy'),
        new nlobjSearchColumn('zip'),
        new nlobjSearchColumn('phone'),
        new nlobjSearchColumn('state'),
        new nlobjSearchColumn('city'),
        new nlobjSearchColumn('address1'),
        new nlobjSearchColumn('address2'),
        new nlobjSearchColumn('email'),
        new nlobjSearchColumn('country', 'address'),
        new nlobjSearchColumn('countrycode', 'address'),
        new nlobjSearchColumn('custrecord_subsidiary_branch_id'),
        new nlobjSearchColumn('isinactive'),
        new nlobjSearchColumn('iselimination')
    ];
    
    if (this.isMultiCalendar) {
        this.columns.push(new nlobjSearchColumn('taxfiscalcalendar'));
    }
    
    if (this.isMultibook && this.isForeignCurrencyMgmt && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', null, 'is', params.bookId));
        this.currencyColumn = 'accountingbookcurrency';
    }
    
    if (params.isInactive) {
    	this.filters.push(new nlobjSearchFilter('isinactive', null, 'is', params.isInactive));
    }
    
    if (params.isElimination) {
    	this.filters.push(new nlobjSearchFilter('iselimination', null, 'is', params.isElimination));
    }
    
    this.columns.push(new nlobjSearchColumn(this.currencyColumn));
};

Tax.DAO.SubsidiaryDAO.prototype.ListObject = function ListObject(id) {
	return {
	    id: id,
        name: '',
        nameNoHierarchy: '',
        vrn: '',
        legalName: '',
        zip: '',
        telephone: '',
        address1: '',
        address2: '',
        state: '',
        city: '',
        country: '',
        countryCode: '',
        email: '',
        currency:  '',
        currencyId: '',
        fiscalCalendar: '',
        isInactive: '',
        isElimination: ''
	};
};

Tax.DAO.SubsidiaryDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A search result row is required.');
    }

    var sub = new this.ListObject(row.getId());
    sub.name = row.getValue('name') || '';
    sub.nameNoHierarchy = row.getValue('namenohierarchy') || '';
    sub.vrn = row.getValue('taxidnum') || '';
    sub.legalName = row.getValue('legalname') || '';
    sub.zip = row.getValue('zip') || '';
    sub.telephone = row.getValue('phone') || '';
    sub.address1 = row.getValue('address1') || '';
    sub.address2 = row.getValue('address2') || '';
    sub.state = row.getValue('state') || '';
    sub.city = row.getValue('city') || '';
    sub.country = row.getText('country', 'address') || '';
    sub.countryCode = row.getValue('countrycode', 'address') || '';
    sub.email = row.getValue('email') || '';
    sub.currency = row.getText(this.currencyColumn) || '';
    sub.currencyId = row.getValue(this.currencyColumn) || '';
    sub.fiscalCalendar = this.isMultiCalendar ? row.getValue('taxfiscalcalendar') : '';
    sub.isInactive = row.getValue('isinactive');
    sub.isElimination = row.getValue('iselimination');
    
    return sub;
};

Tax.DAO.SubsidiaryDAO.prototype.getSubsidiaryIdsByRole = function getSubsidiaryIdsByRole(roleId) {
    if (!roleId) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A roleId is required.');
    }

    var subsidiaryIds = [];

    try {
        var filters = [ new nlobjSearchFilter('internalid', null, 'is', roleId) ];
        var columns = [ new nlobjSearchColumn('subsidiaries') ];
        var sr = nlapiSearchRecord('role', null, filters, columns);
        var subsidiary;

        for (var i = 0; sr && i < sr.length; i++) {
            subsidiary = sr[i].getValue('subsidiaries');
            if (subsidiary) {
                subsidiaryIds.push(subsidiary);
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Tax.DAO.SubsidiaryDAO.getSubsidiaryIdsByRole', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Tax.DAO.SubsidiaryDAO.getSubsidiaryIdsByRole');
    }

    return subsidiaryIds;
};
