/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */
if (!VAT) { var VAT = {}; }VAT.DAO = VAT.DAO || {};

VAT.DAO.MossProvisioningStatus = function MossProvisioningStatus(id) {    return {        id: id,        nexus: '',        status: '',        error: ''    };};

VAT.DAO.MossProvisioningStatusDAO = function MossProvisioningStatusDAO() {    this.recordType = 'customrecord_moss_provisioning_status';};

VAT.DAO.MossProvisioningStatusDAO.FIELDS = {    NEXUS: 'custrecord_moss_nexus',    STATUS: 'custrecord_moss_provisioning_status',    ERROR: 'custrecord_moss_provisioning_error'};

VAT.DAO.MossProvisioningStatusDAO.STATUS = {    NEVER: 'never',    PENDING: 'pending',    FAILED: 'failed',    DONE: 'done'};

VAT.DAO.MossProvisioningStatusDAO.prototype.getJobByNexus = function getJobByNexus(nexus) {
    if (!nexus) {   		throw nlapiCreateError('MISSING_REQUIRED_PARAM', 'A nexus is required.');
    }    
    var filter = [new nlobjSearchFilter(VAT.DAO.MossProvisioningStatusDAO.FIELDS.NEXUS, null, 'is', nexus)];
    var columns = this.getSearchColumns();
    var result = nlapiSearchRecord(this.recordType, null, filter, columns);
    return result ? this.objectify(result[0]) : result;
};

VAT.DAO.MossProvisioningStatusDAO.prototype.getPendingJobs = function getPendingJobs() {
    var jobs = [];
    var filter = [new nlobjSearchFilter(VAT.DAO.MossProvisioningStatusDAO.FIELDS.STATUS, null, 'is', VAT.DAO.MossProvisioningStatusDAO.STATUS.PENDING)];
    var columns = this.getSearchColumns();
    var result = nlapiSearchRecord(this.recordType, null, filter, columns);
    
    if (result) {
        for (var i = 0; i < result.length; i++) {
            jobs.push(this.objectify(result[i]));
        }
    }
    
    return jobs;
};

VAT.DAO.MossProvisioningStatusDAO.prototype.getSearchColumns = function getSearchColumns() {    var columns = [];    for (column in VAT.DAO.MossProvisioningStatusDAO.FIELDS) {
        columns.push(new nlobjSearchColumn(VAT.DAO.MossProvisioningStatusDAO.FIELDS[column]));
    }    
    return columns;
};

VAT.DAO.MossProvisioningStatusDAO.prototype.create = function create(job) {	if(!job) {		throw nlapiCreateError('MISSING_REQUIRED_PARAM', 'A Job is required.');	}		
    var record = nlapiCreateRecord(this.recordType, {recordmode: 'dynamic'});    for (var field in job) {        if (field != 'id') {            record.setFieldValue(VAT.DAO.MossProvisioningStatusDAO.FIELDS[field.toUpperCase()], job[field]);        }    }        var id = nlapiSubmitRecord(record);
    job.id = id;
        return job;
};

VAT.DAO.MossProvisioningStatusDAO.prototype.update = function update(job) {
    if (!job || !job.id) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAM', 'A Job is required.');
    }
    
    var record = nlapiLoadRecord(this.recordType, job.id, {recordmode: 'dynamic'});    for (var field in job) {
        if (['id', 'nexus'].indexOf(field) == -1) {
            record.setFieldValue(VAT.DAO.MossProvisioningStatusDAO.FIELDS[field.toUpperCase()], job[field]);
        }
    }        nlapiSubmitRecord(record);    return job;
};

VAT.DAO.MossProvisioningStatusDAO.prototype.objectify = function objectify(row) {    var job = new VAT.DAO.MossProvisioningStatus(row.getId());    job.nexus = row.getValue(VAT.DAO.MossProvisioningStatusDAO.FIELDS.NEXUS);    job.status = row.getValue(VAT.DAO.MossProvisioningStatusDAO.FIELDS.STATUS);    job.error = row.getValue(VAT.DAO.MossProvisioningStatusDAO.FIELDS.ERROR);    return job;
};
