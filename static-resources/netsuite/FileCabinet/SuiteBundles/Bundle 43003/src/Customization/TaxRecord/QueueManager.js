/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.TaxRecord = VAT.TaxRecord || {};

VAT.TaxRecord.QueueManager = function QueueManager(scheduler, queue, processor) {
    this.scheduler = scheduler;
    this.processor = processor;
    this.queue = queue;
};


VAT.TaxRecord.QueueManager.prototype.startProvisioning = function startProvisioning() {
    if (!this.scheduler) {
        nlapiLogExecution('ERROR', 'VAT.TaxRecord.QueueManager.startProvisioning', 'Scheduler is missing.');
        return;
    }
    
    this.scheduler.run();
};


VAT.TaxRecord.QueueManager.prototype.processQueue = function processQueue() {
    if (!this.processor) {
        nlapiLogExecution('ERROR', 'VAT.TaxRecord.QueueManager.processQueue', 'Processor is missing.');
        return;
    }
    
    var jobs = this.getPendingJobs();
    
    if (jobs.length > 0) {
        var result = {};
        
        try {
            var nexus = new VAT.DAO.NexusDAO().getByCountryCode(jobs[0].nexus);
            result = this.processor.provisionTaxRecords(nexus);
            result.id = jobs[0].id;
        } catch(e) {
            result = {
                id: jobs[0].id,
                status: VAT.DAO.MossProvisioningStatusDAO.STATUS.FAILED,
                error: e instanceof nlobjError ? e.getCode() + ': ' + e.getDetails() : e.toString()
            };
        }
        
        this.updateJob(result);
        
        if (this.getPendingJobs().length > 0) {
            this.scheduler.run();
        }
    }
};


VAT.TaxRecord.QueueManager.prototype.getPendingJobs = function getPendingJobs() {
    if (!this.queue) {
        nlapiLogExecution('ERROR', 'VAT.TaxRecord.QueueManager.getPendingJobs', 'Queue is missing.');
        return;
    }
    
    return this.queue.getPendingJobs();
};


VAT.TaxRecord.QueueManager.prototype.addJobToQueue = function addJobToQueue(nexus) {
    var job = null;
    
    try {
        job = new VAT.DAO.MossProvisioningStatus();
        job.nexus = nexus.country;
        job.status = VAT.DAO.MossProvisioningStatusDAO.STATUS.PENDING;
        
        job = this.queue.create(job);
    } catch(e) {
        var message = e instanceof nlobjError ? e.getCode() + ': ' + e.getDetails() : e.toString();
        nlapiLogExecution('ERROR', 'VAT.TaxRecord.QueueManager.addJobToQueue', message);
    }
    
    return job;
};


VAT.TaxRecord.QueueManager.prototype.updateJob = function updateJob(job) {
    var newJob = null;
    
    try {
        newJob = new VAT.DAO.MossProvisioningStatus(job.id);
        newJob.status = job.status;
        newJob.error = job.error;
        
        newJob = this.queue.update(newJob);
    } catch(e) {
        var message = e instanceof nlobjError ? e.getCode() + ': ' + e.getDetails() : e.toString();
        nlapiLogExecution('ERROR', 'VAT.TaxRecord.QueueManager.updateJob', message);
    }
    
    return newJob;
};
