/**
 * Copyright NetSuite, Inc. 2014 All rights reserved.
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements
 * and may not be the best approach. Actual implementation should not reuse
 * this code without due verification.
 *
 * Set the charge description using the time entry notes if available.
 *
 * Version    Date            Author           Remarks
 * 1.00       18 Jul 2014     Ryan Morrissey
 *
 */

function setChargeDescription(type) {
    try {
        if (type == 'create') {
            var cId = nlapiGetRecordId();
            var cRec = nlapiLoadRecord('charge', cId);
            var cTimeId = cRec.getFieldValue('timerecord');

            if (!cTimeId || cTimeId.length < 1) {
                return;
            }

            var tFilArr = [],
                tColArr = [];
            tFilArr[0] = new nlobjSearchFilter('internalid', null, 'is', cTimeId);
            tColArr[0] = new nlobjSearchColumn('memo', null, null);

            var tResults = nlapiSearchRecord('timeentry', null, tFilArr, tColArr);

            if (!tResults || tResults.length == 0) {
                return;
            }

            var tMemo = tResults[0].getValue('memo');

            if (!tMemo || tMemo.length < 1) {
                return;
            }

            cRec.setFieldValue('description', tMemo);
            nlapiSubmitRecord(cRec, true, true);
        }
    } catch (e) {
        if (e instanceof nlobjError) {
            nlapiLogExecution('ERROR', 'System error', e.getCode() + ' - ' + e.getDetails());
        } else {
            nlapiLogExecution('ERROR', 'Unexpected error', e.toString());
        }
    }
 }