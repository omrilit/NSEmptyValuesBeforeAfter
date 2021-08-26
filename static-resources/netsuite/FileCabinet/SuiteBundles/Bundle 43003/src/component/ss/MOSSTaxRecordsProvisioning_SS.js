/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

function provisionMossTaxCodes() {
    try {
        
        var taxCodeExtractor = new VAT.MOSS.TaxCodesExtractor();        
        var params = {
            taxCodeExtractor : taxCodeExtractor,
            taxRecordAdaptor : new VAT.MOSS.TaxRecordAdaptor()
        };
        var taxRecordManager = new VAT.TaxRecord.TaxRecordManager(params); 
        var scheduler = new VAT.MOSS.Scheduler();
        var queue = new VAT.DAO.MossProvisioningStatusDAO();

        var queueManager = new VAT.TaxRecord.QueueManager(scheduler, queue, taxRecordManager);
        queueManager.processQueue();
        
    } catch (ex) {
        logException(ex, 'provisionMossTaxCodes');
    };
};

