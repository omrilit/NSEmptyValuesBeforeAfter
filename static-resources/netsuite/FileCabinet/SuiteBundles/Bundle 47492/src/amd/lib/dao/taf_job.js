/**
 * Copyright 2017 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(['N/error', '../../adapter/taf_adapter_record', '../../adapter/taf_adapter_search','./taf_base'], function(error, record, search, baseDao) {
    function TAFJobDAO() {
        baseDao.call(this);
        this.name = 'TAFJobDAO';
        this.recordType = 'customrecord_taf_job';
        this.filters = [];
        this.columns = [];
        this.searchObject = null;
    }

    util.extend(TAFJobDAO.prototype, baseDao.prototype);
    
    TAFJobDAO.prototype = {
        initialize: function(options) {
            this.columns = [
                {name: 'custrecord_taf_job_data'},
                {name: 'custrecord_taf_job_status'}
            ];
            
            if (options) {
                if (options.internalId) {
                    this.filters.push({name: 'internalid', operator: search.getOperator('IS'), values: options.internalId});
                }
                
                if (options.isInactive) {
                    this.filters.push({name: 'isinactive', operator: search.getOperator('IS'), values: options.isInactive});
                }
            }
        },
        rowToObject: function(row) {
            if (!row) {
                throw error.create({ name: 'MISSING_PARAMETER', message: 'row parameter is required', notifyOff: true });
            }

            return {
                id: row.id,
                transactions: row.getValue({name: 'custrecord_taf_job_data'}),
                status: row.getValue({name: 'custrecord_taf_job_status'})
            };
        },
        create: function(job) {
            if (!job) {
                throw error.create({ name: 'MISSING_PARAMETER', message: 'job parameter is required', notifyOff: true });
            }
            var rec = record.create({
                type: this.recordType
            });
            return this.save(rec, job);
        },
        update: function(job) {
            if (!job) {
                throw error.create({ name: 'MISSING_PARAMETER', message: 'job parameter is required', notifyOff: true });
            }
            var rec = record.load({
                type: this.recordType,
                id: job.id
            });
            return this.save(rec, job);
        },
        save: function(jobRecord, job) {
            if (!jobRecord) {
                throw error.create({ name: 'MISSING_PARAMETER', message: 'jobRecord parameter is required', notifyOff: true });
            }
            if (!job) {
                throw error.create({ name: 'MISSING_PARAMETER', message: 'job parameter is required', notifyOff: true });
            }
            if (job.data) {
                jobRecord.setValue({
                    fieldId: 'custrecord_taf_job_data',
                    value: job.data
                });
            }
            
            if (job.status) {
                jobRecord.setValue({
                    fieldId: 'custrecord_taf_job_status',
                    value: job.status
                });
            }
            
            return jobRecord.save();
        }
    };
    
    return TAFJobDAO;
});
