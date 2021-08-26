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
* This script gets triggered on scheduled execution as specified in the deployment configuration
**/
function schedule_ProcessCIScheduled()
{
    var ciConfig = null;
    var stCITaskId = null;
    // initialize array logs
    var objLogs = {
        search : [] ,
        cicreate : [] ,
        pdf : [] ,
        email : [] ,
        fax : [] ,
        inv : [] ,
        ci : [] ,
        err : []
    };

    try {
        var stLogTitle = "***SCHEDULED CONSOLIDATION***";
        log("debug", stLogTitle, "STARTING");
    
        ciConfig = getCISetup();
        var USAGE_LIMIT = 1000;
    
        // get the scheduled context
        var context             = nlapiGetContext();
        var stCustomer          = context.getSetting("script", CUSTSCRIPT_NSTS_CI_CUSTOMER_CI_PARAM);
        var stSubSidiary        = context.getSetting("script", CUSTSCRIPT_NSTS_SUBSIDIARY_CI_PARAM);
        var stEnableFor         = context.getSetting("script", CUSTSCRIPTNSTS_CI_ENABLE_FOR);
        var stBilling           = context.getSetting("script", CUSTSCRIPTNSTS_CI_BILLING);
        var cutoffDate          = context.getSetting("script", CUSTSCRIPT_NSTS_INV_CUTOFF_DT_CI_PARAM);
        var cutoffDateOffsetDay = context.getSetting("script", CUSTSCRIPT_NSTS_CI_OFFSET_DAYS);
        var ciDateOption        = context.getSetting("script", CUSTSCRIPT_NSTS_CI_DATE_OPT_CI_PARAM);
        var stSchedCIDate       = context.getSetting("script", CUSTSCRIPT_NSTS_SPEC_DATE_CI_PARAM);
        
        // create CI Task record
        stCITaskId = createCITask(SCHEDULED, null);
    
        if (ciConfig.enable_Consolidated_Invoicing == "F" || ciConfig.enable_Scheduled_Consolidation == "F")
        {
            var stLogMessage = "";
            if(ciConfig.enable_Consolidated_Invoicing == "F"){ 
                stLogMessage = 'Consolidate Invoice Process Exit. ***Consolidate Invoicing is DISABLED***';
            }
            if(ciConfig.enable_Scheduled_Consolidation == "F"){ 
                stLogMessage = 'Consolidate Invoice Process Exit. ***Scheduled Consolidation is DISABLED***';
            }
            createCILog(stCITaskId, stLogMessage);
            
            log("DEBUG", "SCHEDULED CI", "CONSOLIDATED INVOICE IS DISABLE");
            var arrCITaskFields = [
                    FLD_CUSTRECORD_NSTS_CI_TASK_ENDED ,
                    FLD_CUSTRECORD_NSTS_CI_TASK_STATUS , 
            ];
            var arrCITaskValues = [
                    nlapiDateToString(new Date(), 'datetimetz') , 
                    COMPLETED
            ];
    
            nlapiSubmitField(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK, stCITaskId, arrCITaskFields, arrCITaskValues);
            log("debug", stLogTitle, "ciConfig.enableFo:" + ciConfig.enableFo);
            createCILog(stCITaskId, 'Scheduled Consolidation - ********Completed********');
            return;
        }
    
        createCILog(stCITaskId, 'Scheduled Consolidation - ********Started********');
    
        var objCIFilters = {
            customer : stCustomer ,
            location : "" ,
            contract : "" ,
            subsidiary : stSubSidiary ,
            currency : "" ,
            customFilters : "{}"
        };
        
        var objFile = nlapiLoadFile(ciConfig.templateid);
        ciConfig.objTemplatePDFFile = objFile;
    
        if (!isEmpty(cutoffDate))
        {
            var td = cutoffDate;
            if (!isEmpty(cutoffDateOffsetDay))
            {
                cutoffDateOffsetDay     = isEmpty(cutoffDateOffsetDay) ? 0 : parseInt(cutoffDateOffsetDay);
                td = nlapiAddDays(new Date(cutoffDate), cutoffDateOffsetDay);
                td = nlapiDateToString(td);
                //objCIFilters.asofdate = td;
            }
            objCIFilters.asofdate = td;
        }
        else
        {
            if (!isEmpty(cutoffDateOffsetDay))
            {
                cutoffDateOffsetDay     = isEmpty(cutoffDateOffsetDay) ? 0 : parseInt(cutoffDateOffsetDay);
                var td = nlapiAddDays(new Date, cutoffDateOffsetDay);
                td = nlapiDateToString(td);
                objCIFilters.asofdate = td;
            }
        }
        
        var arrInvoicesFilters = [];
        var arrInvoicesColumns = [];
        //v2.0 enhancement - Process CI per Customer
        //var arrSelectedInv = getConsolidatedInvoices();
        if(ciConfig.includeSubCustomers == "T") {
            var arrCustFilter = getCustomerCIsInProcess();
            
            if (!isEmpty(arrCustFilter)) {
                if (arrCustFilter.indexOf(objCIFilters.customer) >= 0) {
                    arrInvoicesFilters.push(new nlobjSearchFilter('parent', 'customer', 'noneof', arrCustFilter));
                }
            }
        }
        
        arrInvoicesFilters = setFilters(ciConfig, objCIFilters, arrInvoicesFilters);
        arrInvoicesColumns = setColumns(ciConfig, objCIFilters, arrInvoicesColumns);
        
        arrInvoicesFilters.push(new nlobjSearchFilter("tranid", null, "greaterthanorequalto", ciConfig.minimumNumberChildInvoices).setSummaryType("count"));
        arrInvoicesFilters.push(new nlobjSearchFilter("tranid", null, "lessthanorequalto", ciConfig.maximumNumberChildInvoices).setSummaryType("count"));
        
        var resSummaryList = getAllResults(null, ciConfig.sourceSavedSearch, arrInvoicesFilters, arrInvoicesColumns);
    
        log("debug", stLogTitle, 'Customer Count for Consolidation: ' + resSummaryList.length);
        createCILog(stCITaskId, 'Customer Count for Consolidation: ' + resSummaryList.length);
        
        bIsAnyProcessCommited = false;
        
        var customerFieldId = "entity";
        var customerFieldIdJoin = null;
        
        if(ciConfig.includeSubCustomers == "T")
        {
            customerFieldId = "parent";
            customerFieldIdJoin = "customer";
        }
        
        var arrCINumber     = [];
        var arrCICustomers  = [];
        
        var stCIDateFlag    = 4; //this is equal to current Date
        var stCIDate        = null;
        
        if (ciDateOption == 1)
        {
            stCIDateFlag    = 1;
        }
        if (ciDateOption == 2)
        {
            stCIDateFlag    = 2;
            stCIDate        = stSchedCIDate;
        }
        else if (ciDateOption == 3){
            stCIDateFlag    = 3;
        }
        
        //v2.0 Send Email to AR Contacts
        var arrUniqCust = [];
        for (var i = 0; i < resSummaryList.length; i++) {
            var rec = resSummaryList.results[i];
            var stCustomerId = rec.getValue(customerFieldId, customerFieldIdJoin, "group");
            
            if (arrUniqCust.indexOf(stCustomerId) < 0) {
                arrUniqCust.push(stCustomerId);
            }
        }
        var arrAREmails = [];
        if (!isEmpty(arrUniqCust)) {
            var arrContactCategory = ciConfig.contactCategory.split(',');
            if (!isEmpty(arrContactCategory)) {
                arrAREmails = getARContacts(arrUniqCust,arrContactCategory);
            }
        }
        var stEmailTest = '';
        for (var em in arrAREmails) {
            stEmailTest += em + arrAREmails[em];
        }
        
        // ATLAS Enhancement - Use customer/preferred term to populate CI due date
        var objTerm = getPreferredTerm();
        
        for (var ciIndex = 0; ciIndex < resSummaryList.length; ciIndex++)
        {
            var objData = {};
            var stCIPreference = "";
            var rec = resSummaryList.results[ciIndex];
            var arrColumns = resSummaryList.saveSearch.getColumns();
            var intCurrentUsage = nlapiGetContext().getRemainingUsage();
            var stCustomerId = rec.getValue(customerFieldId, customerFieldIdJoin, "group");
    
            /*performance issue change
            if (intCurrentUsage <= USAGE_LIMIT)
            {
                nlapiYieldScript();
            }*/
    
            for (var iGrp = 0; iGrp < arrColumns.length; iGrp++)
            {
                var stColName = arrColumns[iGrp].getName();
                var objJoin = arrColumns[iGrp].getJoin();
                var objSummary = arrColumns[iGrp].getSummary();
                var stColType = arrColumns[iGrp].getType();
    
                var _stColName = stColName;
    
                var stColLabel = arrColumns[iGrp].getLabel();
                stColLabel = stColLabel.toLocaleLowerCase();
    
                if (arrColumns[iGrp].getSummary().toLowerCase() == "group")
                {
                    if (stColLabel == "project")
                    {
                        _stColName = "internalid";
                    }
                    objData[_stColName] = {
                        id : stColName ,
                        value : rec.getValue(stColName, objJoin, objSummary) ,
                        type : stColType ,
                        text : rec.getText(stColName, objJoin, objSummary) ,
                        join : objJoin
                    };
                    var prefName = _stColName;
                    switch (prefName)
                    {
                        case "jobMain":
                            prefName = "Project";
                            break;
                    }
    
                    if (_stColName != "date") stCIPreference += (isEmpty(stCIPreference) ? "" : ",") + "{0}:{1}".format(prefName.toUpperCase(), objData[_stColName].text);
                }
            }
    
            bIsAnyProcessCommited = true;
            objCIFilters.customer = stCustomerId;
    
            var arrSelectedInvoices = getInvoiceIdwithFilter(objCIFilters, objData);
            arrSelectedInvoices = isEmpty(arrSelectedInvoices)? [] : arrSelectedInvoices;
            //objLogs.search.push('Invoices Count: ' + arrSelectedInvoices.length + ' Child Invoices for Customer ID: ' + stCustomerId);
            var objLog = {
                    msg:'Invoices Count: ' + arrSelectedInvoices.length + ' Child Invoices for Customer ID: ' + stCustomerId
            };
            objLogs.search.push(objLog);
    
            var newCIRecord = nlapiCreateRecord(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE);
            newCIRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PREFERENCES, stCIPreference);
            
            if (!isEmpty(arrSelectedInvoices))
            {
                var objCIKeys = {
                    arrSelectedInvoices : arrSelectedInvoices ,
                    customer : stCustomerId ,
                    data : objData ,
                    ciId : 0 ,
                    stCIDateFlag : stCIDateFlag ,
                    stCIDate : stCIDate,
                    stAsOfDate : objCIFilters.asofdate,
                    updateDueDate : ciConfig.updateDueDate
                };
                
                var objLog = {
                        msg:"CI Preference:" + stCIPreference
                };
                objLogs.cicreate.push(objLog);
                var ciid = 0;
                try{
                    ciid = processMainCITransaction(objCIKeys,newCIRecord,objLogs,ciConfig,objCIFilters,arrAREmails,objTerm);
                }catch(e){
                    ciid = -1;
                }
                
                arrCICustomers.push(stCustomerId);
                if(ciid>0){
                    arrCINumber.push(ciid);
                }
            }
            
            /*performance issue change*/
            if (intCurrentUsage <= USAGE_LIMIT)
            {
                nlapiYieldScript();
            }
        }
    
        // create a CI Log record for each process: email, fax, pdf, child invoices, ci record
        createCIProcessLogs(stCITaskId, objLogs);
    
        var arrCITaskFields = [
                FLD_CUSTRECORD_NSTS_CI_TASK_ENDED ,
                FLD_CUSTRECORD_NSTS_CI_TASK_STATUS ,
                FLD_CUSTRECORD_NSTS_CI_RECORDS_CREATED , 
                FLD_CUSTRECORD_NSTS_CI_RECORDS ,
                FLD_CUSTRECORD_NSTS_CI_ERROR_DETAILS,
                FLD_CUSTRECORD_NSTS_CI_CUSTOMERS,
                FLD_CUSTRECORD_NSTS_CI_NUMBERS
        ];
        var arrCITaskValues = (objLogs.err.length == 0) ? [
                nlapiDateToString(new Date(), 'datetimetz') , COMPLETED , arrCINumber.length , resSummaryList.length , null , arrCICustomers , arrCINumber
        ] : [
                nlapiDateToString(new Date(), 'datetimetz') , COMPLETEWERR , arrCINumber.length , resSummaryList.length , objLogs.err.join('\n') , arrCICustomers , arrCINumber
        ];
        
        nlapiSubmitField(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK, stCITaskId, arrCITaskFields, arrCITaskValues);
        log("debug", stLogTitle, "ciConfig.enableFo:" + ciConfig.enableFo);
        createCILog(stCITaskId, 'Scheduled Consolidation - ********Completed********',arrCINumber);
    } catch (error) {
        if (!isEmpty(stCITaskId)) {
            //update the CI Task about task completion
            var arrCITaskFields = [FLD_CUSTRECORD_NSTS_CI_TASK_ENDED, FLD_CUSTRECORD_NSTS_CI_TASK_STATUS, FLD_CUSTRECORD_NSTS_CI_RECORDS_CREATED,FLD_CUSTRECORD_NSTS_CI_ERROR_DETAILS];
            var arrCITaskValues = [nlapiDateToString(new Date(),'datetimetz'), FAILED, objLogs.ci.length,error.toString()];     
            nlapiSubmitField(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK,stCITaskId,arrCITaskFields,arrCITaskValues);
            
            createCILog(stCITaskId,'Scheduled Consolidation - ********ERROR/FAILED********');
        }
        
        if (!isEmpty(ciConfig) && !isEmpty(ciConfig.adminEmail) && !isEmpty(ciConfig.emailSenderUserId)) {
            sendErrorEmail(ciConfig.emailSenderUserId, ciConfig.adminEmail, stCITaskId, error);
        }
    }
}
