/**
 * Copyright NetSuite, Inc. 2014 All rights reserved.
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements
 * and may not be the best approach. Actual implementation should not reuse
 * this code without due verification.
 *
 * Programatically reset the start and end dates of resource allocations to
 * the start and end dates of the project. This is helpful when copying a
 * template that includes generic resource allocations.
 *
 * Version    Date            Author           Remarks
 * 1.00       31 Jan 2014     Ryan Morrissey
 *
 */


function reassignGenericsUsingEmployee(type) {
    try {
        var custRecID = nlapiGetFieldValue('id');
        var custRec = nlapiLoadRecord('customrecord_reassign_generic', custRecID);
        var custRecPrjID = custRec.getFieldValue('custrecord_reassign_project');
        var custRecGenID = custRec.getFieldValue('custrecord_reassign_generic');
        var custRecEmpID = custRec.getFieldValue('custrecord_reassign_emp');

        nlapiLogExecution('DEBUG', 'Generic resource reassignment', 'Reassignment started for generic id ' + custRecGenID);

        var prjTaskFilters = [];
        prjTaskFilters[0] = new nlobjSearchFilter('company', null, 'is', custRecPrjID);
        prjTaskFilters[1] = new nlobjSearchFilter('ismilestone', null, 'is', 'F');
        prjTaskFilters[2] = new nlobjSearchFilter('issummarytask', null, 'is', 'F');

        var prjTaskColumns = [];
        prjTaskColumns[0] = new nlobjSearchColumn('internalid');

        var prjTaskResults = nlapiSearchRecord('projecttask', null, prjTaskFilters, prjTaskColumns);

        if (prjTaskResults && prjTaskResults.length > 0) {
            var i = 0,
                count = 0,
                len = prjTaskResults.length;

            for (i; i < len; i++) {
                var prjTaskID = prjTaskResults[i].getValue('internalid');
                var prjTaskRec = nlapiLoadRecord('projecttask', prjTaskID);
                var assignCnt = prjTaskRec.getLineItemCount('assignee');

                if (assignCnt && assignCnt > 0) {
                    for (var j = 0; j < assignCnt; j++) {
                        var lineID = j + 1;
                        var assignRes = prjTaskRec.getLineItemValue('assignee', 'resource', lineID);

                        if (assignRes && assignRes == custRecGenID) {
                            prjTaskRec.selectLineItem('assignee', lineID);
                            prjTaskRec.setCurrentLineItemValue('assignee', 'resource', custRecEmpID);
                            prjTaskRec.commitLineItem('assignee');

                            count++;
                        }

                    }

                    prjTaskRec.setFieldValue('custentity_realign_generics', 'F');
                    nlapiSubmitRecord(prjTaskRec, true, true);
                }
            }

            nlapiDeleteRecord('customrecord_reassign_generic', custRecID);
            nlapiLogExecution('DEBUG', 'Generic resource assignment', count + ' project task assignment(s) were updated');
        } else {
            nlapiLogExecution('DEBUG', 'No project tasks', 'Unable to find project tasks for project ID ' + custRecPrjID);
                return;
        }

    } catch (e) {
        nlapiLogExecution('ERROR', 'Error reassigning generics', e);
        return;
    }
}