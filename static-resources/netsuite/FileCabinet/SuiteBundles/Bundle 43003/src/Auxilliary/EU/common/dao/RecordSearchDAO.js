/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.RecordSearchDAO = function RecordSearchDAO() {
    VAT.EU.DAO.BaseDAO.call(this);
    this.daoName = 'RecordSearchDAO';
    this.recordType = '';
    this.columns = [];
    this.filters = [];
};

VAT.EU.DAO.RecordSearchDAO.prototype = Object.create(VAT.EU.DAO.BaseDAO.prototype);

VAT.EU.DAO.RecordSearchDAO.prototype.search = function search(params) {
    if (!this.recordType) {
        throw nlapiCreateError('INVALID_RECORD_TYPE', 'Please provide the name of the record.');
    }
    
    try {
        return nlapiSearchRecord(this.recordType, null, this.filters, this.columns);
    } catch(e) {
        throw e;
    }
};
