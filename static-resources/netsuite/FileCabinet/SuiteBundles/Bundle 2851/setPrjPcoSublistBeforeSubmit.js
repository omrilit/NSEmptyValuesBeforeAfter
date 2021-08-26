/**
 * Script to update the Rev Rec Percent Complete Override entries based on a project header custom fields.
 * This allows the Project Manager, Finance Manager, or an integration to provide percent of completion updates without manually editing the sublist directly.
 *
 * Used custom fields:
 *      custentity_oa_pco_value     Percent complete value to override. This custom field should be mapped in OA integration form.
 *      custentity_oa_pco_date      Hidden custom field containing Date to recognize accounting period automatically. By default is used current date. Can be used for testing.
 */

/**
 * Prepare current OA date. NS current date and OA current date are different because of time shift.
 * This function transforms NS current date to OA current date which means change UTC -8 to UTC -5
 *
 * @return {string}     String representing current OA date (UTC -5)
 */
function getCurrentOADate() {

    // Get NS current timestamp (UTC -8)
    var nsDate = new Date();

    // Convert NS timestamp to UTC
    var utcDate = nsDate.getTime() + nsDate.getTimezoneOffset() * 60000;

    // Change timezone of current timestamp to OA timezone (UTC -5)
    var oaDate = new Date(utcDate + (-5 * 3600000));

    nlapiLogExecution('DEBUG', 'Current date result', 'NS current timestamp: ' + nsDate + ' transformed to OA current timestamp: ' + oaDate);

    // Return only date part
    return nlapiDateToString(oaDate, 'date');
}

/**
 * Attempts to find the correct accounting period based on a date string.
 * Uses first found period if more periods corresponds to passed accountingDate.
 *
 * @param {string} accountingDate       A date string.
 * @return {number}                     The internal ID of a valid accounting period otherwise undef.
 */
function getAccountingPeriodFromDate(accountingDate) {
    var _date = nlapiStringToDate(accountingDate),
        periodID = null;

    // Prepare all required filters
    var sFilters = [];
    sFilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    sFilters.push(new nlobjSearchFilter('isadjust', null, 'is', 'F'));
    sFilters.push(new nlobjSearchFilter('isyear', null, 'is', 'F'));
    sFilters.push(new nlobjSearchFilter('isquarter', null, 'is', 'F'));
    sFilters.push(new nlobjSearchFilter('startdate', null, 'onorbefore', _date));
    sFilters.push(new nlobjSearchFilter('enddate', null, 'onorafter', _date));

    // Prepare all required columns
    var sColumns = [];
    sColumns.push(new nlobjSearchColumn('internalid'));
    sColumns.push(new nlobjSearchColumn('periodname'));

    var sResults = nlapiSearchRecord('accountingperiod', null, sFilters, sColumns);

    var numPeriods = sResults.length;
    nlapiLogExecution('DEBUG', 'Num periods for date: ' + _date, numPeriods);

    // Use first found period
    if (numPeriods >= 1) {
        periodID = sResults[0].getValue('internalid');
        nlapiLogExecution('DEBUG', 'Period ID for date: ' + _date, periodID);
    }

    return periodID;
}

/**
 * Update the Rev Rec Percent Complete Override sublist using inputs from project header custom fields.
 * Use custentity_oa_pco_date to identify period and custentity_oa_pco_value to set appropriate sublist line.
 * Change is cumulative = 'Cumulative percent complete' row value is overriden if it's already defined for identified period.
 * Applies only to accounts with enabled "ADVANCED REVENUE MANAGEMENT" feature.
 * This script is set to trigger beforeSubmit in any context.
 *
 * @param {string} type One of create, edit, delete, xedit.
 */
function setPrjPcoSublistBeforeSubmit(type) {

    // Applies only to accounts with enabled "ADVANCED REVENUE MANAGEMENT" feature
    if (nlapiGetContext().getFeature('advancedrevenuerecognition') === false) {
        return;
    }

    try {

        // Define used project fields
        var FLD = {

            // Project header custom fields
            date: 'custentity_oa_pco_date',
            complete: 'custentity_oa_pco_value',

            // Project standard fields/sublists
            override: 'percentcompleteoverride'
        };

        // Load project record and get field values
        var recPrj = nlapiGetNewRecord(),
            prjDate = recPrj.getFieldValue(FLD.date),
            prjComplete = recPrj.getFieldValue(FLD.complete),
            prjLines = recPrj.getLineItemCount(FLD.override),
            updLine, prjPeriod;

        // If no percentage value, skip update
        if (!prjComplete || prjComplete === '') {
            nlapiLogExecution('DEBUG', 'No update', '% complete update skipped!');
            return;
        }

        // If no date, use current date (by default is prjDate hidden and its purpose is just for testing)
        if (!prjDate || prjDate === '') {
            prjDate = getCurrentOADate();
        }

        // Identify period according to date
        prjPeriod = getAccountingPeriodFromDate(prjDate);

        // If no period was found, skip
        if (prjPeriod === null) {
            nlapiLogExecution('DEBUG', 'No update', 'Couldn\'t find period!');
            return;
        }

        // Check for existing sublist entries
        if (prjLines > 0) {

            // Loop through existing sublist lines
            var _i = 1;
            for (_i; _i <= prjLines; _i++) {

                // Get line period value
                var lnPeriod = recPrj.getLineItemValue(FLD.override, 'period', _i);

                if (lnPeriod === prjPeriod) {

                    // Periods match - update this line and break
                    updLine = _i;
                    break;
                }

                // Period is new - create new line
                updLine = prjLines + 1;
            }
        } else {

            // No sublist lines exist - set the first line
            updLine = 1;
            recPrj.insertLineItem(FLD.override, updLine);
        }

        // Update project sublist and clear project header fields
        recPrj.setLineItemValue(FLD.override, 'period', updLine, prjPeriod);
        recPrj.setLineItemValue(FLD.override, 'percent', updLine, prjComplete);
        recPrj.setLineItemValue(FLD.override, 'comments', updLine, 'Last updated: ' + prjDate);

        recPrj.setFieldValue(FLD.date, null);
        recPrj.setFieldValue(FLD.complete, null);

        return;
    } catch (err) {
        nlapiLogExecution('ERROR', 'Unexpected script error', err.message);
        return;
    }
}
