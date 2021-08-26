/**
 * Copyright NetSuite, Inc. 2015 All rights reserved.
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements
 * and may not be the best approach. Actual implementation should not reuse
 * this code without due verification.
 *
 * Programmatically reset the start and end dates of resource allocations to
 * the start and end dates of the project. This is helpful when copying a
 * template that includes generic resource allocations.
 *
 * This script also saves all project tasks on a project to get around a bug
 * with project budgeting in the 15.2 dataset. No fields should be
 * adjusted - this should mimic opening a task and immediately saving it.
 *
 * Version    Date            Author           Remarks
 * 1.00       30 Oct 2015     Ryan Morrissey
 *
 */

function resetProjectDemoInfoAfterSave(type) {
    try {
        // only run this on existing projects
        if (type == 'edit') {
            var newRec          = nlapiGetNewRecord(),
                prjID           = newRec.getId(),
                realignGenerics = newRec.getFieldValue('custentity_realign_generics');

            if (realignGenerics && realignGenerics == 'T') {

                /**
                 * Start the Resource Allocation date re-align script here...
                 */

                var prjStart    = newRec.getFieldValue('startdate'),
                    prjEnd      = newRec.getFieldValue('calculatedenddate');

                var resAllocFilters = [];
                resAllocFilters.push(
                    new nlobjSearchFilter('project', null, 'is', prjID)
                );

                var resAllocColumns = [];
                resAllocColumns.push(
                    new nlobjSearchColumn('id'),
                    new nlobjSearchColumn('startdate'),
                    new nlobjSearchColumn('enddate')
                );

                var resAllocResults = nlapiSearchRecord('resourceallocation', null, resAllocFilters, resAllocColumns);

                if (resAllocResults && resAllocResults.length > 0) {
                    var k     = 0,
                        count = 0,
                        ken   = resAllocResults.length;

                    for (k; k < ken; k++) {
                        var resAllocID    = resAllocResults[k].getValue('id'),
                            resAllocStart = resAllocResults[k].getValue('startdate'),
                            resAllocEnd   = resAllocResults[k].getValue('enddate'),
                            resAllocRec   = nlapiLoadRecord('resourceallocation', resAllocID);

                        resAllocRec.setFieldValue('startdate', prjStart);
                        resAllocRec.setFieldValue('enddate', prjEnd);
                        nlapiSubmitRecord(resAllocRec);

                        count++;
                    }
                }

                /**
                 * Start the Project Task quick save script here...
                 */

                var prjTaskFilters = [];
                prjTaskFilters.push(
                    new nlobjSearchFilter('company', null, 'is', prjID),
                    new nlobjSearchFilter('ismilestone', null, 'is', 'F'),
                    new nlobjSearchFilter('issummarytask', null, 'is', 'F')
                );

                var prjTaskColumns = [];
                prjTaskColumns.push(
                    new nlobjSearchColumn('internalid')
                );

                var prjTaskResults = nlapiSearchRecord('projecttask', null, prjTaskFilters, prjTaskColumns);

                if (prjTaskResults && prjTaskResults.length > 0) {
                    var i   = 0,
                        len = prjTaskResults.length;

                    for (i; i < len; i++) {
                        var prjTaskID  = prjTaskResults[i].getValue('internalid'),
                            prjTaskRec = nlapiLoadRecord('projecttask', prjTaskID),
                            assignCnt  = prjTaskRec.getLineItemCount('assignee'),
                            j          = 0;

                        if (assignCnt && assignCnt > 0) {
                            for (j; j < assignCnt; j++) {
                                var lineID    = j + 1,
                                    assignRes = prjTaskRec.getLineItemValue('assignee', 'resource', lineID);
                                    prjTaskRec.selectLineItem('assignee', lineID);
                                    prjTaskRec.commitLineItem('assignee');
                            }
                        }

                        nlapiSubmitRecord(prjTaskRec);
                    }
                }

                var prjRec = nlapiLoadRecord('job', prjID);
                prjRec.setFieldValue('custentity_realign_generics', 'F');
                nlapiSubmitRecord(prjRec);
            }
        }
    } catch (err) {
        nlapiLogExecution('ERROR', 'Try/catch error', err.message);
    }
}