/**
 * Copyright NetSuite, Inc. 2014 All rights reserved.
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements
 * and may not be the best approach. Actual implementation should not reuse
 * this code without due verification.
 *
 * Show a timesheet status report
 *
 * Version    Date            Author           Remarks
 * 1.00       25 Apr 2014     Ryan Morrissey
 *
 */

{
    var SUBLIST_TIMESHEET_STATUS_REPORT = 'custpage_list_timesheet_status_report';

    var FLD_SL_EMPLOYEE = 'custpage_sl_employee';
    var FLD_SL_EMPLOYEE_EMAIL = 'custpage_sl_employee_email';
    var FLD_SL_EMPLOYEE_DEPT = 'custpage_sl_employee_dept';
    var FLD_SL_SUPERVISOR = 'custpage_sl_supervisor';
    var FLD_SL_FOUR_WEEKS_AGO = 'custpage_sl_four_weeks_ago';
    var FLD_SL_THREE_WEEKS_AGO = 'custpage_sl_three_weeks_ago';
    var FLD_SL_TWO_WEEKS_AGO = 'custpage_sl_two_weeks_ago';
    var FLD_SL_LAST_WEEK = 'custpage_sl_last_week';
    var FLD_SL_THIS_WEEK = 'custpage_sl_this_week';

    var _TODAY = new Date().toString();

    var IMG_ICON = {
        'Approved': '<i class="fa fa-lg fa-check-circle-o rm-green"></i>',
        'Pending Approval': '<i class="fa fa-lg fa-dot-circle-o rm-blue"></i>',
        'Open': '<i class="fa fa-lg fa-circle-o rm-gray"></i>',
        'Rejected': '<i class="fa fa-lg fa-times-circle-o rm-red"></i>',
        'Missing': '<i class="fa fa-lg fa-exclamation-circle rm-yellow"></i>'
    }
}

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @return {void} Any output is written via response object
 */
function timesheetStatusReportFormSuitelet(request, response) {
    var frm = nlapiCreateForm('Timesheet Status Report', false);

    var fontAwesomeUrl = '<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">';
    var fldFAStyles = frm.addField('custpage_fontawesome', 'inlinehtml', '');
    fldFAStyles.setDefaultValue(fontAwesomeUrl);

    var customColors = '<style>.rm-red{color:#cc6666}.rm-blue{color:#81a2be}.rm-green{color:#b5bd68}' +
        '.rm-yellow{color:#f0c674}.rm-gray{color:#969896}.panel{margin-bottom:20px;background-color:#fff;' +
        'border:1px solid transparent;border-radius:4px;-webkit-box-shadow:0 1px 1px rgba(0,0,0,.05);' +
        'box-shadow:0 1px 1px rgba(0,0,0,.05);border-color:#ddd;border-top-color:#ddd;border-bottom-color:#ddd}' +
        '.panel-body{padding:15px}.panel-heading{padding:10px 15px;border-bottom:1px solid transparent;border-top-left-radius:3px;' +
        'border-top-right-radius:3px;color:#333;background-color:#f5f5f5;border-color:#ddd;}' +
        '.panel-title {margin-top:0;margin-bottom:0;font-size:16px;color:inherit}' +
        '.list-inline{margin:0 !important;padding-left:0;list-style:none}.list-inline>li{display:inline-block;padding-right:5px;padding-left:5px}</style>';
    var fldCustStyles = frm.addField('custpage_customstyles', 'inlinehtml', '');
    fldCustStyles.setDefaultValue(customColors);

    var reportLegend = '<div class="panel"><div class="panel-heading"><ul class="list-inline">' +
        '<li><h3 class="panel-title">Timesheet Status Report</h3></li>' +
        '<li style="float:right"><i class="fa fa-external-link"></i> <a target="_blank" class="dottedlink" ' +
        'href="https://system.na1.netsuite.com/app/accounting/transactions/timesheetapproval.nl" title="Approve Timesheets">Approve Timesheets</a></li>' +
        '</div><div class="panel-body"><ul class="list-inline">' +
        '<li><h4>Legend:</h4></li>' +
        '<li>' + IMG_ICON['Open'] + ' Open</li>' +
        '<li>' + IMG_ICON['Pending Approval'] + ' Pending Approval</li>' +
        '<li>' + IMG_ICON['Approved'] + ' Approved</li>' +
        '<li>' + IMG_ICON['Rejected'] + ' Rejected</li>' +
        '<li>' + IMG_ICON['Missing'] + ' Missing</li>' +
        '</ul></div></div>';

    //create sublist
    var lst = frm.addSubList(SUBLIST_TIMESHEET_STATUS_REPORT,'list', 'Employees');

    lst.setHelpText(reportLegend);

    lst.addField(FLD_SL_EMPLOYEE, 'text', 'Employee');
    lst.addField(FLD_SL_EMPLOYEE_EMAIL, 'text', 'Email');
    lst.addField(FLD_SL_SUPERVISOR, 'text', 'Supervisor');
    lst.addField(FLD_SL_EMPLOYEE_DEPT, 'text', 'Department');

    lst.addField(FLD_SL_FOUR_WEEKS_AGO, 'text', 'Week of ' + getWeekStartString(_TODAY, 4));
    lst.addField(FLD_SL_THREE_WEEKS_AGO, 'text', 'Week of ' + getWeekStartString(_TODAY, 3));
    lst.addField(FLD_SL_TWO_WEEKS_AGO, 'text', 'Week of ' + getWeekStartString(_TODAY, 2));
    lst.addField(FLD_SL_LAST_WEEK, 'text', 'Week of ' + getWeekStartString(_TODAY, 1));
    lst.addField(FLD_SL_THIS_WEEK, 'text', 'Week of ' + getWeekStartString(_TODAY, 0));

    getTimesheetStatusData(lst);
    response.writePage(frm);
}

/**
 *
 * @param {nlobjSubList} lst
 */
function getTimesheetStatusData(lst) {
    var results = nlapiSearchRecord('Timesheet', 'customsearch_timesheet_status', null, null);

    if (results) {
        var result = {}, employee_rows = {};
        var idEmployee, idSupervior, idTimesheet, sEmployee, sEmail, sDepartment, sStartDate, sApprovalStatus,
            sFourWeeks, sThreeWeeks, sTwoWeeks, sLastWeek, sThisWeek,
            _i = 0, _len = results.length;
        for (_i; _i < _len; _i++) {
            result = results[_i];

            idEmployee = result.getValue('employee');
            sEmployee = result.getText('employee');
            sEmail = result.getValue('email', 'employee');
            sSupervisor = result.getText('supervisor', 'employee');
            sStartDate = result.getValue('startdate');
            sApprovalStatus = result.getText('approvalstatus');
            idTimesheet = result.getValue('internalid');
            sDepartment = result.getText('departmentnohierarchy', 'employee');

            if (!hasKey(employee_rows, idEmployee)) {
                employee_rows[idEmployee] = new Employee(idEmployee);
            }

            employee_rows[idEmployee]['sEmail'] = (sEmail) ? '<i class="fa fa-envelope-o rm-gray"></i> <a href="mailto:' + sEmail +
                '" class="dottedlink" target="_blank">' + sEmail + '</a>' : '';
            employee_rows[idEmployee]['sSupervisor'] = sSupervisor;
            employee_rows[idEmployee]['sDepartment'] = sDepartment;
            employee_rows[idEmployee]['sEmployee'] = sEmployee;

            var offset = getWeekNumberDiff(_TODAY, sStartDate);

            switch (offset) {
                case 0:
                    employee_rows[idEmployee][0] = createTimesheetUrl(idTimesheet, sApprovalStatus);
                    break;
                case 1:
                    employee_rows[idEmployee][1] = createTimesheetUrl(idTimesheet, sApprovalStatus);
                    break;
                case 2:
                    employee_rows[idEmployee][2] = createTimesheetUrl(idTimesheet, sApprovalStatus);
                    break;
                case 3:
                    employee_rows[idEmployee][3] = createTimesheetUrl(idTimesheet, sApprovalStatus);
                    break;
                case 4:
                    employee_rows[idEmployee][4] = createTimesheetUrl(idTimesheet, sApprovalStatus);
                    break;
                default:
                    break;
            }
        }
    }

    if (employee_rows) {
        var index = 0, sEmployeeUrl;

        for (var employee in employee_rows) {
            index++;

            sEmployeeUrl = nlapiResolveURL('RECORD', 'employee', employee_rows[employee]['idEmployee']);

            lst.setLineItemValue(FLD_SL_EMPLOYEE, index, createEmployeeUrl(employee_rows[employee]['sEmployee'], sEmployeeUrl));
            lst.setLineItemValue(FLD_SL_EMPLOYEE_EMAIL, index, employee_rows[employee]['sEmail']);
            lst.setLineItemValue(FLD_SL_SUPERVISOR, index, employee_rows[employee]['sSupervisor']);
            lst.setLineItemValue(FLD_SL_EMPLOYEE_DEPT, index, employee_rows[employee]['sDepartment']);

            lst.setLineItemValue(FLD_SL_FOUR_WEEKS_AGO, index, (employee_rows[employee]['4']) ? employee_rows[employee]['4'] : createTimesheetUrlEmpty());
            lst.setLineItemValue(FLD_SL_THREE_WEEKS_AGO, index, (employee_rows[employee]['3']) ? employee_rows[employee]['3'] : createTimesheetUrlEmpty());
            lst.setLineItemValue(FLD_SL_TWO_WEEKS_AGO, index, (employee_rows[employee]['2']) ? employee_rows[employee]['2'] : createTimesheetUrlEmpty());
            lst.setLineItemValue(FLD_SL_LAST_WEEK, index, (employee_rows[employee]['1']) ? employee_rows[employee]['1'] : createTimesheetUrlEmpty());
            lst.setLineItemValue(FLD_SL_THIS_WEEK, index, (employee_rows[employee]['0']) ? employee_rows[employee]['0'] : createTimesheetUrlEmpty());
        }
    }
}


function getWeekNumber(date) {
    // treats Sunday as the start of the week which is how 14.1 works today
    var d = new Date(date);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||1));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
}

function getWeekNumberDiff(today, date) {
    var t = getWeekNumber(today),
        d = getWeekNumber(date);

    return t - d;
}

function getWeekStartString(today, offset) {
    var _OFFSET = offset * 7;
    var curr = new Date();
    var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay() - _OFFSET)).toString();
    var m = firstday.match(/^(?:[A-Za-z]{3}\s)([A-Za-z]{3}\s\d{1,2}\s\d{4})/);
    return m[1];
}

function createTimesheetUrl(internalid, status) {
    var url = IMG_ICON[status] + ' ' +
        '<a title="' + status + '" href="https://system.na1.netsuite.com/app/accounting/transactions/timesheet.nl?id=' +
        internalid + '" target="_blank" class="dottedlink">' + status + '</a>';
    return url;
}

function createEmployeeUrl(employee, url) {
    var url = '<a href="' + url + '" class="dottedlink" target="_blank">' +
        employee + '</a>';
    return url;
}

function createTimesheetUrlEmpty() {
    return IMG_ICON['Missing'] + ' Missing';
}

function hasKey(obj, key) {
    return obj.hasOwnProperty(key);
}

function Employee(idEmployee) {
    this.idEmployee = idEmployee;
}