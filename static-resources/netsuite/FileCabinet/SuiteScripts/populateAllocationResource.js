/**
 * Copyright NetSuite, Inc. 2013 All rights reserved.
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements
 * and may not be the best approach. Actual implementation should not reuse
 * this code without due verification.
 *
 * Look for an "allocationresource" parameter in the "New resource
 * allocation" URL, and if found, set the allocationresource field.
 *
 * Version    Date            Author           Remarks
 * 1.00       19 Dec 2013     Ryan Morrissey
 *
 */


function populateAllocationResource(type) {
    try {
        if (type && type == 'create') {
            var resourceid = document.URL.match(/(?=allocationresource=([-\d]*))/)[1];
            if (!resourceid || resourceid.length == 0) {
                nlapiLogExecution('DEBUG', 'Unable to find a resourceid.');
                return;
            } else {
                nlapiSetFieldValue('allocationresource', resourceid);
            }
        }
    } catch(err) {
        nlapiLogExecution('ERROR', 'An unexpected error occurred: ' + err);
    }
}