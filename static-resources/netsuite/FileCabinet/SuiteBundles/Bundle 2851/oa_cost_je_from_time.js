/* Create journal entries to reflect cost on G/L from time entries that originated in OpenAir */

function je_from_time(){

    // get the script parameters 
    var context = nlapiGetContext();
    var logEmailAddress = context.getPreference('custscript_oa_je_from_time_error_email');
    var logEmailFrom = context.getPreference('custscript_oa_je_from_time_error_from');
    var costLevelForJE = context.getPreference('custscript_oa_je_from_time_level');
    var isOneWorld = isTrueAsString(context.getPreference('custscript_oa_je_from_time_ow'));
    var useDepartment = context.getPreference('custscript_oa_je_from_time_dept');
    var useLocation = context.getPreference('custscript_oa_je_from_time_location');
    var useClass = context.getPreference('custscript_oa_je_from_time_class');
    var dateJE = context.getPreference('custscript_oa_je_from_time_use_date');
    var projectOnCreditLine = isTrueAsString(context.getPreference('custscript_oa_je_from_time_credit_proj'));
    
    // stop the script from running if we do not have a cost level defined
    if (costLevelForJE != '1' && costLevelForJE != '2' && costLevelForJE != '3') {
        var costLevelMsg = 'A loaded cost level to use for creating journal entries is undefined. Select one on the script deployment.';
        nlapiLogExecution('ERROR', 'Loaded cost level to use is not defined', costLevelMsg);
        nlapiSendEmail(logEmailFrom, logEmailAddress, 'Loaded cost level to use is not defined', costLevelMsg);
        return;
    }
    
    // stop the script from running if we have not picked a date to use to create JEs
    if (dateJE != '1' && dateJE != '2') {
        var dateJEMsg = 'A date type to use for creating journal entries is undefined. Select one on the script deployment.';
        nlapiLogExecution('ERROR', 'Missing a journal entry date type', dateJEMsg);
        nlapiSendEmail(logEmailFrom, logEmailAddress, 'Missing a journal entry date type', dateJEMsg);
        return;
    }
    
    // log activity
    var runLog = new Array();
    var jeCounter = 0;
    var timeEntryCounter = 0;
    
    // search for all currencies in the account 
    // this is a hash table of the currency precision; key = ID, value = precision
    var currencyDecimalPrecision = new Object();
    var currencyFilters = new Array();
    currencyFilters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F', null);
    
    // currency columns to return in search 
    var currencyColumns = new Array();
    currencyColumns[0] = new nlobjSearchColumn('internalId');
    var currencySearchResults = nlapiSearchRecord('currency', null, currencyFilters, currencyColumns);
    for (var i = 0; currencySearchResults != null && i < currencySearchResults.length; i++) {
        var currency = currencySearchResults[i];
        var currencyInternalId = currency.getValue('internalId');
        var currencyRecord = nlapiLoadRecord('currency', currencyInternalId);
        var currencySymbol = currencyRecord.getFieldValue('symbol');
        var currencyFormat = currencyRecord.getFieldValue('formatsample');		
	
        var currencyPrecision = 2;
        
		// look at the 3rd to the last character; if its numeric, assume decimal precision = 2
        if (currencyFormat.substr(-3, 1).match(/\d/)) {
            currencyPrecision = 0;
        }
        currencyDecimalPrecision[currencyInternalId] = currencyPrecision;
    }
    
    // look for time entries that do not have a journal created for them and that have an OpenAir ID
    var timeEntryFilters = new Array();
    timeEntryFilters[0] = new nlobjSearchFilter('custcol_oa_je_from_time_created', null, 'isempty', null);
    timeEntryFilters[1] = new nlobjSearchFilter('custcol_oa_je_from_time_error', null, 'is', 'F', null);
    timeEntryFilters[2] = new nlobjSearchFilter('custcol_oa_time_entry_id', null, 'isnotempty', null, null);
    
    // these are the columns we want 
    var timeEntryColumns = new Array();
    timeEntryColumns[0] = new nlobjSearchColumn('internalId');
    timeEntryColumns[1] = new nlobjSearchColumn('custcol_oa_je_from_time_error');
    timeEntryColumns[2] = new nlobjSearchColumn('durationdecimal');
    
    // Execute the search and iterate over the results to create JEs
    var searchResults = nlapiSearchRecord('timebill', null, timeEntryFilters, timeEntryColumns);
    var counter = 0;
    for (var i = 0; searchResults != null && i < searchResults.length; i++) {
        var result = searchResults[i];
        
        // this was already flagged with an error so do not create JE
        var timeEntryError = result.getValue('custcol_oa_je_from_time_error');
        if (timeEntryError == 'T') {
            continue;
        }
        
        // Check the units we have left / reschedule if we have less than 150 units left
        // one JE consumes 65 units as the script stands
        var timeEntryInternalId = result.getValue('internalId');
        var remainingUsage = context.getRemainingUsage();
        if (remainingUsage <= 150) {
            var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
            if (status != 'QUEUED') {
                nlapiLogExecution('ERROR', 'Unable to requeue journal entry from time entry script', 'Processed ' + counter + ' time entries and failed at time entry ' + timeEntryInternalId);
                nlapiSendEmail(logEmailFrom, logEmailAddress, 'Unable to requeue journal entry from time entry script', 'Processed ' + counter + ' time entries and failed at time entry ' + timeEntryInternalId);
            }
            break;
        }
        
        // load the time entry 	
        timeEntryCounter++;
        var timeEntry = nlapiLoadRecord('timebill', timeEntryInternalId, {
            recordmode: 'dynamic'
        });
        
        try {
            // determine the loaded cost rate to use 
            var JECostRate;
            var JECurrency;
            switch (costLevelForJE) {
                case '1':
                    JECostRate = timeEntry.getFieldValue('custcol_oa_lc_0');
                    JECurrency = timeEntry.getFieldValue('custcol_oa_lc_0_curr');
                    break;
                case '2':
                    JECostRate = timeEntry.getFieldValue('custcol_oa_lc_1');
                    JECurrency = timeEntry.getFieldValue('custcol_oa_lc_1_curr');
                    break;
                case '3':
                    JECostRate = timeEntry.getFieldValue('custcol_oa_lc_2');
                    JECurrency = timeEntry.getFieldValue('custcol_oa_lc_2_curr');
                    break;
            }
            
            // if this time entry does not have a rate or the rate is invalid, flag this as an error - just continue to next
            if (!JECostRate || JECostRate == null || isNaN(JECostRate)) {
                var errorMsg = 'The loaded cost rate for level ' + costLevelForJE + ' on this time entry is invalid.';
                nlapiLogExecution('ERROR', 'Loaded cost rate error', errorMsg + ' ' + JECostRate);
                throw (errorMsg);
            }
            
            // check the currency for this rate 
            if (!JECurrency || JECurrency == null || isNaN(JECurrency)) {
                var errorMsg = 'The loaded cost currency for level ' + costLevelForJE + ' on this time entry is invalid.'
                nlapiLogExecution('ERROR', 'Loaded cost currency error', errorMsg);
                throw (errorMsg);
            }
            
            // check for valid hours
            var JEHours = result.getValue('durationdecimal'); // get the hours from the search
            JEAmount = roundAmount(JECostRate * JEHours, currencyDecimalPrecision[JECurrency]);
            nlapiLogExecution('AUDIT', 'cost value', JEAmount);
            
            var JEDebitAccount = timeEntry.getFieldValue('custcol_oa_lc_debit_account');
            var JECreditAccount = timeEntry.getFieldValue('custcol_oa_lc_credit_account');
            var JEProject = timeEntry.getFieldValue('customer');
            var JETimeEntry = timeEntry.getFieldValue('internalId');
            var JEEmployee = timeEntry.getFieldValue('employee');
            
            var newJE = nlapiCreateRecord('journalentry', {
                recordmode: 'dynamic'
            });
            
            // we always need to set subsidiary for OW 
            if (isOneWorld == 'T') {
                var JESubsidiary = timeEntry.getFieldValue('custcol_oa_lc_subsidiary');
                if (!JESubsidiary || JESubsidiary == null || isNaN(JESubsidiary)) {
                    var errorMsg = 'The subsidiary on this time entry is invalid.'
                    nlapiLogExecution('ERROR', 'Subsidiary error', errorMsg);
                    throw (errorMsg);
                }
                else {
                    newJE.setFieldValue('subsidiary', JESubsidiary);
                }
            }
            
            // determine the date to use 
            var JEDateValue;
            if (dateJE == '1') {
                JEDateValue = timeEntry.getFieldValue('trandate');
            }
            else 
                if (dateJE == '2') {
                    JEDateValue = timeEntry.getFieldValue('custcol_oa_lc_timesheet_date');
                }
            if (!JEDateValue || JEDateValue == null) {
                var errorMsg = 'The date to create a journal entry is invalid.'
                nlapiLogExecution('ERROR', 'Journal entry date error', errorMsg);
                throw (errorMsg);
            }
            else {
                newJE.setFieldValue('trandate', JEDateValue);
            }
            
            newJE.setFieldValue('currency', JECurrency);
            newJE.setFieldValue('custbody_oa_je_from_time_id', timeEntryInternalId);
            newJE.setFieldValue('custbody_oa_je_from_time_employee', JEEmployee);
            
            // determine if we need dept, class, location
            var JEDepartment = timeEntry.getFieldValue('custcol_oa_lc_department');
            var JEClass = timeEntry.getFieldValue('custcol_oa_lc_class');
            var JELocation = timeEntry.getFieldValue('custcol_oa_lc_location');
            
            // do we need department in the header?
            if (useDepartment == '1' && JEDepartment && JEDepartment != null) {
                newJE.setFieldValue('department', JEDepartment);
            }
            
            // do we need class in header? 
            if (useClass == '1' && JEClass && JEClass != null) {
                newJE.setFieldValue('class', JEClass);
            }
            
            // do we need location in header? 
            if (useLocation == '1' && JELocation && JELocation != null) {
                newJE.setFieldValue('location', JELocation);
            }
            
            // set the lines on the JE
            // set the debit line
            newJE.selectNewLineItem('line');
            newJE.setCurrentLineItemValue('line', 'account', JEDebitAccount);
            newJE.setCurrentLineItemValue('line', 'debit', JEAmount);
            newJE.setCurrentLineItemValue('line', 'entity', JEProject);  

            // do we need location on the line? 
            if (useLocation == '2' && JELocation && JELocation != null) {
                newJE.setCurrentLineItemValue('line', 'location', JELocation);
            }
            
            // do we need class on the line? 
            if (useClass == '2' && JEClass && JEClass != null) {
                newJE.setCurrentLineItemValue('line', 'class', JEClass);
            }
            
            // do we need department on the line? 
            if (useDepartment == '2' && JEDepartment && JEDepartment != null) {
                newJE.setCurrentLineItemValue('line', 'department', JEDepartment);
            }
   
            newJE.commitLineItem('line');
            
            // set the credit line
            newJE.selectNewLineItem('line');
            newJE.setCurrentLineItemValue('line', 'account', JECreditAccount);
            newJE.setCurrentLineItemValue('line', 'credit', JEAmount);
            if (projectOnCreditLine == 'T') {
                newJE.setCurrentLineItemValue('line', 'entity', JEProject);
            }
            
            // do we need location on the line? 
            if (useLocation == '2' && JELocation && JELocation != null) {
                newJE.setCurrentLineItemValue('line', 'location', JELocation);
            }
            
            // do we need class on the line? 
            if (useClass == '2' && JEClass && JEClass != null) {
                newJE.setCurrentLineItemValue('line', 'class', JEClass);
            }
            
            // do we need department on the line? 
            if (useDepartment == '2' && JEDepartment && JEDepartment != null) {
                newJE.setCurrentLineItemValue('line', 'department', JEDepartment);
            }
            
            newJE.commitLineItem('line');
            
            // create the JE; get the internal ID of the new JE				
            var jeID = nlapiSubmitRecord(newJE, true, true);
            jeCounter++;
            
            // load the newly created JE to get the new tranid
            var createdJE = nlapiLoadRecord('journalentry', jeID);
            var jeTranID = createdJE.getFieldValue('tranid');
            timeEntry.setFieldValue('custcol_oa_je_from_time_tranid', jeTranID);
            
            // set the JE created date field
            var jeCreatedDate = nlapiDateToString(new Date());
            timeEntry.setFieldValue('custcol_oa_je_from_time_created', jeCreatedDate);
            
            // log the successful creation of the JE
            runLog[runLog.length] = 'SUCCESS: Journal entry ' + jeTranID + ' created from time entry internal ID ' + timeEntryInternalId;
        } 
        catch (error) {
            var errorMsg = 'ERROR: Time entry internal ID ' + timeEntryInternalId + ' - ';
            
            // get the error message
            if (error instanceof nlobjError) {
                errorMsg = errorMsg + error.getCode() + '\n' + error.getDetails();
                nlapiLogExecution('ERROR', 'System error', errorMsg);
            }
            else {
                errorMsg = errorMsg + error.toString();
                nlapiLogExecution('ERROR', 'Unexpected error', errorMsg);
            }
            
            // put the error on the time entry and flag it as an error
            timeEntry.setFieldValue('custcol_oa_je_from_time_error', 'T');
            timeEntry.setFieldValue('custcol_oa_je_from_time_error_msg', errorMsg);
            
            // log the error 
            runLog[runLog.length] = errorMsg;
        }
        finally {
            var timeEntryInternalId = nlapiSubmitRecord(timeEntry, true, true);
        }
    }
    
    // email a log of the JEs that were created and errors 
    logMsg = 'Total time entries processed: ' + timeEntryCounter + '\n' + 'Total journal entries created: ' + jeCounter + '\n' + runLog.join("\n");
    nlapiSendEmail(logEmailFrom, logEmailAddress, 'Journal Entry Creation From Time Entries', logMsg);
}


// rounding the amounts to the decimal precision of the currency
function roundAmount(amount, decimal){
    var multiple = Math.pow(10, decimal);
    var roundedAmount = Math.round(amount * multiple) / multiple;
    return roundedAmount;
}
