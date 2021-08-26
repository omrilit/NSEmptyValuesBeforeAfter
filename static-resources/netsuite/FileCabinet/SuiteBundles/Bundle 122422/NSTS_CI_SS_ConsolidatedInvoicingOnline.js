/**
 * Copyright (c) 1998-2016 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
* A generic solution provided by NetSolution for Consolidating Invoices.
* this solution contains the creation of CI Record which tag to the Customer
* and associated Invoices. Each invoices will contain the CI Number field and
* Once it's being process and Included in the CI the CI number will be tag to
* the invoice
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Mar 2016     pdeleon   Initial version.
 * 
 */

/**
* This scheduled script process the creation of the PDF and updates both CI custom record and child invoices
* when the online CI consolidation from the suitelet gets submitted.
**/
function schedule_ProcessCIOnline()
{
    var blErrorEmailSent = false;
    var stCITaskId = null;
    var arrUniqCust = [];
    var arrUnprocessedCI = [];
    var ciConfig = null;
    var objLogs = {
            search      : [] ,
            cicreate    : [] ,
            pdf         : [] ,
            email       : [] ,
            fax         : [] ,
            inv         : [] ,
            ci          : [] ,
            err         : []
        };
    try{
        var context     = nlapiGetContext();    
        var stKeys      = context.getSetting("script", SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_KEYS_TO_GENERATE);
        var stFilters   = context.getSetting("script", SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_FILTERS_TO_GENERATE);
        stCITaskId  = context.getSetting("script", SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_TASK_ID);
        var stLogTitle  = "SCHEDULE_PROCESSCIONLINE";
        var USAGE_LIMIT = 1000;
        log("debug", stLogTitle, "Start");
        
        var objKeys         = JSON.parse(stKeys);
        var objCIFilters    = JSON.parse(stFilters);
        
        for (var i = 0; i < objKeys.length; i++) {
            var stCustomerId = objKeys[i].customer;
            var stCIId = objKeys[i].ciId;
            
            if (arrUniqCust.indexOf(stCustomerId) < 0) {
                arrUniqCust.push(stCustomerId);
            }
            if (arrUnprocessedCI.indexOf(stCIId) < 0) {
                arrUnprocessedCI.push(stCIId);
            }
            nlapiLogExecution('debug', 'cust:' + stCustomerId, 'ci:' + stCIId);
        }
        
        ciConfig        = getCISetup();
        log("debug", stLogTitle, "objCIFilters.customerscreen:" + objCIFilters.customerscreen + " ,stKeys:" + stKeys + " ,stFilters:" + stFilters);
        
        if (objCIFilters.customerscreen == "T")
        {
            log("debug",stLogTitle, "START OBJCIFILTERS.CUSTOMERSCREEN :" + objCIFilters.customerscreen);
            ciConfig = getLayout(objCIFilters.defaultlayout);
            ciConfig.customerscreen = "T";
            
            GLOBAL_CI_SETUP_CONFIG.emailSenderUserId = objCIFilters.userid; //18;//objFilters.userid;
            GLOBAL_CI_SETUP_CONFIG.faxSenderUserId = objCIFilters.userid;
            
            log("debug",stLogTitle, "END OBJCIFILTERS.CUSTOMERSCREEN :" + objCIFilters.customerscreen);
        }
        
        //update the CI Task to Inprocess
        nlapiSubmitField(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK,stCITaskId,FLD_CUSTRECORD_NSTS_CI_TASK_STATUS,IN_PROCESS);
        
        //v2.0 Send Email to AR Contacts
        var arrAREmails = [];
        if (!isEmpty(arrUniqCust)) {
            var arrContactCategory = ciConfig.contactCategory.split(',');
            if (!isEmpty(arrContactCategory)) {
                arrAREmails = getARContacts(arrUniqCust, arrContactCategory);
            }
        }
    
        try
        {
             
            var arrCINumber     = [];
            var arrCICustomers  = [];

            // ATLAS Enhancement - Use customer/preferred term to populate CI due date
            var objTerm = getPreferredTerm();
            
            for (var i = 0; i < objKeys.length; i++)
            {
                var intCurrentUsage = nlapiGetContext().getRemainingUsage();
                
                /*performance issue change
                if (intCurrentUsage <= USAGE_LIMIT)
                {           
                    nlapiYieldScript();
                }*/
                
                var arrSelectedInvoices = objKeys[i].arrSelectedInvoices;
                var stCustomerId        = objKeys[i].customer;
                var ciId                = objKeys[i].ciId;        
                var ciId = -1;
                
                try{
                    ciId = processMainCITransaction(objKeys[i],null,objLogs,ciConfig,objCIFilters,arrAREmails,objTerm);
                    delete arrUnprocessedCI[arrUnprocessedCI.indexOf(ciId)];
                }catch(e){
                }
                
                if(ciId> 0){
                    arrCINumber.push(ciId);
                }
    
                arrCICustomers.push(stCustomerId);
                /*performance issue change*/
                if (intCurrentUsage <= USAGE_LIMIT)
                {           
                    nlapiYieldScript();
                }
            }
            
            unmarkCustomerCIInProcess(arrUniqCust);
            
            createCIProcessLogs(stCITaskId,objLogs); 
            
            //update the CI Task about task completion
            var arrCITaskFields = [FLD_CUSTRECORD_NSTS_CI_TASK_ENDED, 
                                   FLD_CUSTRECORD_NSTS_CI_TASK_STATUS, 
                                   FLD_CUSTRECORD_NSTS_CI_RECORDS_CREATED,
                                   FLD_CUSTRECORD_NSTS_CI_ERROR_DETAILS,
                                   FLD_CUSTRECORD_NSTS_CI_CUSTOMERS,
                                   FLD_CUSTRECORD_NSTS_CI_NUMBERS];
                                   
            var stErrLog = '';
            if (!isEmpty(objLogs.err)) {
                for (var intLogEntry = 0; intLogEntry < objLogs.err.length; intLogEntry++) {
                    stErrLog += String(objLogs.err[intLogEntry]['msg'] + '\n');
                }
            }

            var arrCITaskValues = (objLogs.err.length==0) ? 
                                        [nlapiDateToString(new Date(),'datetimetz'),
                                        COMPLETED, 
                                        objLogs.ci.length,
                                        null,
                                        arrCICustomers,
                                        arrCINumber] 
                                    : 
                                        [nlapiDateToString(new Date(),'datetimetz'),
                                        COMPLETEWERR, 
                                        objLogs.ci.length,
                                        stErrLog,
                                        arrCICustomers,
                                        arrCINumber];
            
            nlapiSubmitField(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK,stCITaskId,arrCITaskFields,arrCITaskValues);
            
            nlapiLogExecution('debug', 'ci id:' + stCITaskId, 'uniq cust:' + arrUniqCust);
            
            //unmarkCustomerCIInProcess(arrUniqCust);
            
            createCILog(stCITaskId,'Online Consolidation - ********Completed********',arrCINumber);
        }
        catch(error)
        {
            //update the CI Task about task completion
            var arrCITaskFields = [FLD_CUSTRECORD_NSTS_CI_TASK_ENDED, FLD_CUSTRECORD_NSTS_CI_TASK_STATUS, FLD_CUSTRECORD_NSTS_CI_RECORDS_CREATED,FLD_CUSTRECORD_NSTS_CI_ERROR_DETAILS];
            var arrCITaskValues = [nlapiDateToString(new Date(),'datetimetz'), FAILED, objLogs.ci.length,error.toString()];     
            nlapiSubmitField(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK,stCITaskId,arrCITaskFields,arrCITaskValues);
            
            for (var i=0; i < arrUnprocessedCI.length; i++) {
                nlapiLogExecution('debug', 'unproc', arrUnprocessedCI[i]);
                if (!isEmpty(arrUnprocessedCI[i])) {
                    try {
                        nlapiSubmitField(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, arrUnprocessedCI[i], FLD_CUSTRECORD_NSTS_CI_STATUS_LIST, CI_STATUS_FAILED);
                    } catch (e) {}
                }
                var intCurrentUsage = nlapiGetContext().getRemainingUsage();
                if (intCurrentUsage <= USAGE_LIMIT)
                {           
                    nlapiYieldScript();
                }
            }
            
            createCILog(stCITaskId,'Online Consolidation - ********ERROR/FAILED********');
            
            if (arrUniqCust) {
                unmarkCustomerCIInProcess(arrUniqCust);
            }
            
            if (!isEmpty(ciConfig) && !isEmpty(ciConfig.adminEmail) && !isEmpty(ciConfig.emailSenderUserId)) {
                sendErrorEmail(ciConfig.emailSenderUserId, ciConfig.adminEmail, stCITaskId, error);
                blErrorEmailSent = true;
            }
            
           if (error.getDetails != undefined) 
            {
                log('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
                throw error;
            }
            else
            {
                log("ERROR", 'Unexpected Error',  error.toString());
                throw nlapiCreateError('99999', error.toString());
            }
        }
    } catch (error) {
        if (!isEmpty(stCITaskId)) {
            //update the CI Task about task completion
            var arrCITaskFields = [FLD_CUSTRECORD_NSTS_CI_TASK_ENDED, FLD_CUSTRECORD_NSTS_CI_TASK_STATUS, FLD_CUSTRECORD_NSTS_CI_RECORDS_CREATED,FLD_CUSTRECORD_NSTS_CI_ERROR_DETAILS];
            var arrCITaskValues = [nlapiDateToString(new Date(),'datetimetz'), FAILED, 0,error.toString()];     
            nlapiSubmitField(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK,stCITaskId,arrCITaskFields,arrCITaskValues);
            
            createCILog(stCITaskId,'Online Consolidation - ********ERROR/FAILED********');
        }
        
        if (!isEmpty(arrUniqCust)) {
            unmarkCustomerCIInProcess(arrUniqCust);
        }
        
        if (!isEmpty(ciConfig) && !isEmpty(ciConfig.adminEmail) && !isEmpty(ciConfig.emailSenderUserId) && !blErrorEmailSent) {
            sendErrorEmail(ciConfig.emailSenderUserId, ciConfig.adminEmail, stCITaskId, error);
        }

        for (var i=0; i < arrUnprocessedCI.length; i++) {
            if (!isEmpty(arrUnprocessedCI[i])) {
                try {
                    nlapiSubmitField(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, arrUnprocessedCI[i], FLD_CUSTRECORD_NSTS_CI_STATUS_LIST, CI_STATUS_FAILED);
                } catch (e) {}
            }
            var intCurrentUsage = nlapiGetContext().getRemainingUsage();
            if (intCurrentUsage <= USAGE_LIMIT)
            {           
                nlapiYieldScript();
            }
        }
        
       if (error.getDetails != undefined) 
        {
            log('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
            throw error;
        }
        else
        {
            log("ERROR", 'Unexpected Error',  error.toString());
            throw nlapiCreateError('99999', error.toString());
        }
    }
    log("debug", stLogTitle, "End");
}
