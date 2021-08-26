/**
 * Copyright NetSuite, Inc. 2014 All rights reserved.
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements
 * and may not be the best approach. Actual implementation should not reuse
 * this code without due verification.
 *
 * Set a project custom field to the client internal id.
 *
 * Version    Date            Author           Remarks
 * 1.00       19 Sep 2014     Ryan Morrissey
 *
 */

function setProjectCustomerID(type) {
    try {
        var projID = nlapiGetRecordId();
        var custID = nlapiLookupField('job', projID, 'customer', false);
        nlapiLogExecution('DEBUG', 'Project field lookup', 'Customer ID = ' + custID);
        nlapiSubmitField('job', projID, 'custentity_project_customerid', custID, false);
    } catch(e) {
        nlapiLogExecution('ERROR', 'Try/catch error', e);
    }
}