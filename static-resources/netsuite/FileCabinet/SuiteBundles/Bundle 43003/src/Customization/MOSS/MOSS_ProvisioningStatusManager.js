/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.MOSS = VAT.MOSS || {};


VAT.MOSS.ProvisioningStatusManager = function ProvisioningStatusManager(queueManager) {
    this.queueManager = queueManager;
};


VAT.MOSS.ProvisioningStatusManager.prototype.provision = function provision(nexusObj) {
    var status = this.getProvisioningStatus(nexusObj) || '';
    
    switch (status) {
        case VAT.DAO.MossProvisioningStatusDAO.STATUS.NEVER:
            this.queueManager.addJobToQueue(nexusObj);
            this.queueManager.startProvisioning();
            break;
        case VAT.DAO.MossProvisioningStatusDAO.STATUS.PENDING:
            nlapiLogExecution('DEBUG', 'VAT.MOSS.ProvisioningStatusManager.provision', 'Provisioning is in progress. MOSS tax codes for [' + nexusObj.country + '] will be available shortly.');
            break;
        case VAT.DAO.MossProvisioningStatusDAO.STATUS.FAILED:
            nlapiLogExecution('ERROR', 'VAT.MOSS.ProvisioningStatusManager.provision', 'Provisioning MOSS tax codes for [' + nexusObj.country + '] previously failed. Kindly check the related MOSS Provisioning Status for the error details.');
            break;
        case VAT.DAO.MossProvisioningStatusDAO.STATUS.DONE:
            nlapiLogExecution('DEBUG', 'VAT.MOSS.ProvisioningStatusManager.provision', 'MOSS tax codes for [' + nexusObj.country + '] have already been provisioned previously.');
            break;
        default:
            nlapiLogExecution('DEBUG', 'VAT.MOSS.ProvisioningStatusManager.provision', 'Unrecognized provisioning status for [' + nexusObj.country + ']: [' + status + '].');
    }
};


VAT.MOSS.ProvisioningStatusManager.prototype.getProvisioningStatus = function getProvisioningStatus(nexusObj) {
    if (!nexusObj || !nexusObj.country) {
        nlapiLogExecution('DEBUG', 'VAT.MOSS.ProvisioningStatusManager.getProvisioningStatus', 'Nexus is a required parameter.');
        return '';
    }
    
    var job = new VAT.DAO.MossProvisioningStatusDAO().getJobByNexus(nexusObj.country);
    return job ? job.status : VAT.DAO.MossProvisioningStatusDAO.STATUS.NEVER;
};
