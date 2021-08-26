/**
 * Copyright � 2006, 2018, Oracle and/or its affiliates. All rights reserved. 
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.SubsidiaryDAO = function _SubsidiaryDAO() {
    VAT.EU.DAO.RecordSearchDAO.call(this);
    this.daoName = 'SubsidiaryDAO';
    this.recordType = 'subsidiary';
    this.isMulticurrency = nlapiGetContext().getFeature('MULTICURRENCY');
    this.fields = {
        name: 'name',
        legalname: 'legalname',
        federalidnumber: 'federalidnumber',
        state1taxnumber: 'state1taxnumber', // vat field name for other netsuite edition
        ssnortin: 'ssnortin', // vat field name for other netsuite edition
        addr1: 'addr1',
        addr2: 'addr2',
        city: 'city',
        zip: 'zip',
        country: 'country',
        phone: 'phone',
        email: 'email',
        currency: 'currency',
        nexus: 'nexus'
    };
};
VAT.EU.DAO.SubsidiaryDAO.prototype = Object.create(VAT.EU.DAO.RecordSearchDAO.prototype);

VAT.EU.DAO.SubsidiaryDAO.prototype.prepareSearch = function prepareSearch(params) {
    //to be implemented later
};

VAT.EU.DAO.SubsidiaryDAO.prototype.ListObject = function _listObject(id) {
    return {
        id: id,
        name: '',
        legalName: '',
        vatNumber: '',
        addr1: '',
        addr2: '',
        city: '',
        zip: '',
        phone: '',
        email: '',
        country: '',
        countryCode: '',
        currency: '',
        nexusList: [],
    };
};

VAT.EU.DAO.SubsidiaryDAO.prototype.rowToObject = function rowToObject(row) {
    //to be implemented later
};

VAT.EU.DAO.SubsidiaryDAO.prototype.getByID = function _getByID(id) {
    try {
        var searchObject = nlapiLoadRecord('subsidiary', id);
        return this.recordToObject(searchObject);
    } catch (ex) {
        logException(ex, 'SubsidiaryDAO.getByID');
        throw nlapiCreateError('SEARCH_ERROR', 'SubsidiaryDAO.getByID: Error occurred in loading subsidiary');
    }
};

VAT.EU.DAO.SubsidiaryDAO.prototype.recordToObject = function recordToObject(searchObject) {    
    var subsidiary = new this.ListObject(searchObject.getId()); 
    subsidiary.name        = searchObject.getFieldValue(this.fields.name) || '';
    subsidiary.legalName   = searchObject.getFieldValue(this.fields.legalname) || '';
    subsidiary.vatNumber   = searchObject.getFieldValue(this.fields.federalidnumber) 
                            || searchObject.getFieldValue(this.fields.state1taxnumber) 
                            || searchObject.getFieldValue(this.fields.ssnortin)
                            || '';
    subsidiary.country     = searchObject.getFieldText(this.fields.country) || '';
    subsidiary.countryCode = searchObject.getFieldValue(this.fields.country) || '';
    subsidiary.email = searchObject.getFieldValue(this.fields.email) || '';
    subsidiary.addr1 = searchObject.getFieldValue(this.fields.addr1) || '';
    subsidiary.addr2 = searchObject.getFieldValue(this.fields.addr2) || '';
    subsidiary.city = searchObject.getFieldValue(this.fields.city) || '';
    subsidiary.zip = searchObject.getFieldValue(this.fields.zip) || '';
    subsidiary.phone = searchObject.getFieldValue(this.fields.phone) || '';
    subsidiary.email = searchObject.getFieldValue(this.fields.email) || '';

    if (this.isMulticurrency) {
        subsidiary.currency    = searchObject.getFieldValue(this.fields.currency) || '';
    }
    var nexuscount = searchObject.getLineItemCount(this.fields.nexus);
    for (var index = 1; index <= nexuscount; index++) {
        subsidiary.nexusList.push(searchObject.getLineItemValue(this.fields.nexus, 'country', index));
    }
    
    return subsidiary;
};

VAT.EU.DAO.SubsidiaryDAO.prototype.getSubsidiaryIdsByRole = function getSubsidiaryIdsByRole(roleId) {
    if (!roleId) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'roleId is a required parameter.');
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
        logException(ex, 'VAT.EU.DAO.SubsidiaryDAO.getSubsidiaryIdsByRole');
        throw nlapiCreateError('SEARCH_ERROR', 'VAT.EU.DAO.SubsidiaryDAO.getSubsidiaryIdsByRole');
    }

    return subsidiaryIds;
};
