/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */
if (!VAT) { var VAT = {}; }

VAT.DAO.MossProvisioningStatus = function MossProvisioningStatus(id) {

VAT.DAO.MossProvisioningStatusDAO = function MossProvisioningStatusDAO() {

VAT.DAO.MossProvisioningStatusDAO.FIELDS = {

VAT.DAO.MossProvisioningStatusDAO.STATUS = {

VAT.DAO.MossProvisioningStatusDAO.prototype.getJobByNexus = function getJobByNexus(nexus) {
    if (!nexus) {
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

VAT.DAO.MossProvisioningStatusDAO.prototype.getSearchColumns = function getSearchColumns() {
        columns.push(new nlobjSearchColumn(VAT.DAO.MossProvisioningStatusDAO.FIELDS[column]));
    }
    return columns;
};

VAT.DAO.MossProvisioningStatusDAO.prototype.create = function create(job) {
    var record = nlapiCreateRecord(this.recordType, {recordmode: 'dynamic'});
    job.id = id;
    
};

VAT.DAO.MossProvisioningStatusDAO.prototype.update = function update(job) {
    if (!job || !job.id) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAM', 'A Job is required.');
    }
    
    var record = nlapiLoadRecord(this.recordType, job.id, {recordmode: 'dynamic'});
        if (['id', 'nexus'].indexOf(field) == -1) {
            record.setFieldValue(VAT.DAO.MossProvisioningStatusDAO.FIELDS[field.toUpperCase()], job[field]);
        }
    }
};

VAT.DAO.MossProvisioningStatusDAO.prototype.objectify = function objectify(row) {
};