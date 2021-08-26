/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       21 Oct 2015     jmarimla         Roles access
 * 2.00       06 Nov 2015     jmarimla         Employees access
 * 3.00       11 Nov 2015     jmarimla         Changed help text; fix increment bug
 * 4.00       23 Sep 2016     jmarimla         Include SQM
 * 5.00       13 Jan 2017     jmarimla         Remove inactive employees
 * 6.00       31 Jan 2017     jmarimla         Fixed governance issue
 * 7.00       07 Jun 2017     jmarimla         Includee WSA and WSOD
 * 8.00       04 Aug 2017     jmarimla         Include SPA
 * 9.00       18 Aug 2017     jmarimla         Include SPD
 * 10.00      03 Nov 2017     jmarimla         Include SCPM
 * 11.00      05 Jan 2017     jmarimla         Include SPJD
 * 12.00      05 Jan 2017     jmarimla         Include CM
 * 13.00      15 Feb 2018     jmarimla         Include CD
 * 14.00      11 Jun 2018     jmarimla         Translation engine
 * 15.00      29 Jun 2018     jmarimla         Translation readiness
 * 16.00      28 Sep 2018     jmarimla         Include PRF
 * 17.00      28 Aug 2019     jmarimla         Include AH, rebuild setup
 * 18.00      05 Sep 2019     erepollo         Added success message for rebuild setup
 * 19.00      07 Jan 2020     earepollo        Translation readiness for new strings
 * 20.00      29 Apr 2020     earepollo        Changed suitelet for Page Time Details
 * 21.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 * 22.00      28 Apr 2021     lemarcelo        Fix alert icon bug
 *
 */

var translationStrings = psgp_apm.translation10.load();
var onServerLog = true;
var MSG_TITLE = 'APM SETUP SL MAIN';
var apmServLib = psgp_apm.serverlibrary;
var logger = new psgp_apm.serverlibrary.logger(MSG_TITLE, false);
logger.enable();

var SCRIPTID = {
        RPM : '_apm_rpm_sl_main'
      , PTD : '_apm_ptd_sl_main'
      , PTS : '_apm_pts_sl_main'
      , SSA : '_apm_ssa_sl_main'
      , SQM : '_apm_sqm_sl_main'
      , WSA : '_apm_wsa_sl_main'
      , WSOD : '_apm_wsod_sl_main'
      , SPA : '_apm_spa_sl_main'
      , SPD : '_apm_spd_sl_main'
      , SCPM : '_apm_scpm_sl_main'
      , SPJD : '_apm_spjd_sl_main'
      , CM : '_apm_cm_sl_main'
      , CD : '_apm_cd_sl_main'
      , PRF : '_apm_prf_sl_main'
      , AH : '_apm_ah_sl_main'
};

function entryPoint(request, response){

    switch (request.getMethod()) {
    case 'GET':
        getData(request, response);
        MSG_TITLE = 'getData Return';
        break;
    case 'POST':
        postData(request, response);
        MSG_TITLE = 'postData Return';
        break;
    }
}

function getData(request, response) {
    var bundlePath = apmServLib.getBundlePath(request);
    var noteTitle = translationStrings.apm_r2021a_newapmsuiteappversionavailableinmarketplace();
    var noteDetails = translationStrings.apm_r2021a_theapmsuiteappismovingtothesuiteappmarketplace();
    var linkText = translationStrings.apm_r2021a_installingfromthesuiteappmarketplace();
    var linkUrl = '/app/help/helpcenter.nl?fid=section_1539799323.html';

    //Preserve markup indention
    //prettier-ignore
    var markUp =
        '<link type="text/css" rel="stylesheet" href="' + bundlePath + '/apm/ui/css/apm-jq.css" />'+
        '<style>.uir-page-title {display: inline} </style>' +
        '<div style="margin:10px 0px;">' +
            '<div class="apm-new-suiteapp-note">' +
                '<div class="apm-new-suiteapp-note-title">' + noteTitle + '</div> ' +
                '<div class="apm-new-suiteapp-note-details">' + noteDetails +
                    ' ' + '<a style="color:#0000CC" target="_blank" href="'+ linkUrl +'">' + linkText + '</a>' + '</div> ' +
            '</div>' +
        '</div> <br>';

    var form = nlapiCreateForm(translationStrings.apm.setup.label.apmsetup());

    //define components
    form.addField('custpage_newsuiteapp_note', 'inlinehtml').setLayoutType('outsideabove','startrow')
        .setDefaultValue(markUp);

    var fHelp = form.addField('custpage_f_help', 'help', translationStrings.apm.r2020a.allowaccesstotheapm());

    var permissionsTab = form.addTab('custpage_tab_permissions', 'Permissions');

    var slRolesAccess = form.addSubList('custpage_sl_access_roles', 'inlineeditor', translationStrings.apm.common.label.roles(), 'custpage_tab_permissions');
    var slRolesAccess_fRole = slRolesAccess.addField('custpage_sl_access_role', 'select', translationStrings.apm.common.label.role(), '-118');
    slRolesAccess_fRole.setMandatory(true);
    var slRolesAccess_ftop10 = slRolesAccess.addField('custpage_sl_access_role_top10', 'checkbox', translationStrings.apm.setup.top10mostutilized());
    slRolesAccess_ftop10.setDefaultValue('T');

    var slEmployeesAccess = form.addSubList('custpage_sl_access_employees', 'inlineeditor', translationStrings.apm.setup.label.employees(), 'custpage_tab_permissions');
    var slEmployeesAccess_fEmployee = slEmployeesAccess.addField('custpage_sl_access_employee', 'select', translationStrings.apm.setup.label.employee(), 'employee');
    slEmployeesAccess_fEmployee.setMandatory(true);
    var slEmployeesAccess_ftop10 = slEmployeesAccess.addField('custpage_sl_access_employee_top10', 'checkbox', translationStrings.apm.setup.top10mostutilized());
    slEmployeesAccess_ftop10.setDefaultValue('T');

    var bSubmit = form.addSubmitButton(translationStrings.apm.common.label.save());
    var apmAhLink = nlapiResolveURL('SUITELET', 'customscript'+SCRIPTID.AH, 'customdeploy'+SCRIPTID.AH);
    var cancelScript = "window.location = '"+apmAhLink+"'";
    var bCancel = form.addButton('custpage_b_cancel', translationStrings.apm.common.button.cancel(), cancelScript );

    var apmSetupLink = nlapiResolveURL('SUITELET', 'customscript_apm_setup_sl_main', 'customdeploy_apm_setup_sl_main');
    var rebuildScript = "window.location = '"+apmSetupLink+"&rebuildsetup=T"+"'";
    var bRebuild = form.addButton('custpage_b_retrieve', translationStrings.apm.r2020a.rebuildsetup(), rebuildScript );

    var isRebuildSetup = (request.getParameter('rebuildsetup') == 'T') ? true : false;

    if (isRebuildSetup) {
        form.addField('custpage_success_message', 'inlinehtml')
            .setLayoutType('outsidebelow','startrow')
            .setDefaultValue("<br><p style='font-size:8pt;font-style:Open Sans,Helvetica,sans-serif;color:#800000'>" + translationStrings.apm.r2020a.yourprevioussetupwasretrieved() + "</p>");

        var deployIds = getDeploymentIds();
        logger.debug('deploy ids', deployIds);

        var allRolesArr = [];
        var allEmployeesArr = [];

        if (deployIds && (deployIds.length <= Object.keys(SCRIPTID).length)) {
            for (var i in deployIds) {
                var sdRec = nlapiLoadRecord('scriptdeployment', deployIds[i]);

                var roleAccess = sdRec.getFieldValues('audslctrole');
                if (roleAccess && roleAccess.length > 0) {
                    logger.debug('role access: '+deployIds[i], roleAccess.join());
                    allRolesArr = allRolesArr.concat(roleAccess);
                }

                var employeeAccess = sdRec.getFieldValues('audemployee');
                if (employeeAccess && employeeAccess.length > 0) {
                    logger.debug('employee access: '+deployIds[i], employeeAccess.join());
                    allEmployeesArr = allEmployeesArr.concat(employeeAccess);
                }
            }
        }

        var roleAccessUnique = allRolesArr.filter(function(item, index){
            return allRolesArr.indexOf(item) >= index;
        });
        logger.debug('all role access', roleAccessUnique.join());
        var slRow = 1;
        for (var i in roleAccessUnique) {
            slRolesAccess.setLineItemValue('custpage_sl_access_role', slRow, roleAccessUnique[i]);
            slRolesAccess.setLineItemValue('custpage_sl_access_role_top10', slRow, 'T');
            slRow++;
        }

        var employeeAccessUnique = allEmployeesArr.filter(function(item, index){
            return allEmployeesArr.indexOf(item) >= index;
        });
        logger.debug('all employee access', employeeAccessUnique.join());
        slRow = 1;
        for (var i in employeeAccessUnique) {
            slEmployeesAccess.setLineItemValue('custpage_sl_access_employee', slRow, employeeAccessUnique[i]);
            slEmployeesAccess.setLineItemValue('custpage_sl_access_employee_top10', slRow, 'T');
            slRow++;
        }

    } else {

        //enter current settings
        var sc = new Array();
        sc.push(new nlobjSearchColumn('custrecord_apm_setup_ra_role'));
        sc.push(new nlobjSearchColumn('custrecord_apm_setup_ra_top10'));
        var searchResults = nlapiSearchRecord('customrecord_apm_setup_roles_access', null, null, sc);
        var slRow = 1;
        for (var i in searchResults) {
            var role = searchResults[i].getValue('custrecord_apm_setup_ra_role');
            var top10 = searchResults[i].getValue('custrecord_apm_setup_ra_top10');
            if (!role) continue;
            slRolesAccess.setLineItemValue('custpage_sl_access_role', slRow, role);
            slRolesAccess.setLineItemValue('custpage_sl_access_role_top10', slRow, top10);
            slRow++;
        }

        sc = new Array();
        sc.push(new nlobjSearchColumn('custrecord_apm_setup_ea_employee'));
        sc.push(new nlobjSearchColumn('custrecord_apm_setup_ea_top10'));
        searchResults = nlapiSearchRecord('customrecord_apm_setup_employees_access', null, null, sc);
        slRow = 1;
        var employees = new Array();
        for (var i in searchResults) {
            var employee = searchResults[i].getValue('custrecord_apm_setup_ea_employee');
            employees.push(employee);
        }
        employees = (employees && employees.length > 0) ? filterEmployeesWithAccess(employees) : new Array();
        logger.debug('filtered employees ids', employees);

        for (var i in searchResults) {
            var employee = searchResults[i].getValue('custrecord_apm_setup_ea_employee');
            var top10 = searchResults[i].getValue('custrecord_apm_setup_ea_top10');
            if (!employee || (employees.indexOf(employee) == -1)) continue;
            slEmployeesAccess.setLineItemValue('custpage_sl_access_employee', slRow, employee);
            slEmployeesAccess.setLineItemValue('custpage_sl_access_employee_top10', slRow, top10);
            slRow++;
        }

    }

    response.writePage(form);

};

function postData(request, response) {


    //delete records with parent
    var parentSearchResults = nlapiSearchRecord('customrecord_apm_setup_parent', null, null, null);
    var deletedParents = new Array();
    for (var i in parentSearchResults) {
        var id = parentSearchResults[i].getId();
        var parent = nlapiLoadRecord('customrecord_apm_setup_parent', id);
        while (parent.getLineItemCount('recmachcustrecord_apm_setup_ea_parent') > 0) {
            parent.removeLineItem('recmachcustrecord_apm_setup_ea_parent', 1);
        }
        nlapiSubmitRecord(parent);
        deletedParents.push(nlapiDeleteRecord('customrecord_apm_setup_parent', id));
    }

    //delete existing
    var rolesSearchResults = nlapiSearchRecord('customrecord_apm_setup_roles_access', null, null, null);
    for (var i in rolesSearchResults) {
        var id = rolesSearchResults[i].getId();
        nlapiDeleteRecord('customrecord_apm_setup_roles_access', id);
    }

    var employeesSearchResults = nlapiSearchRecord('customrecord_apm_setup_employees_access', null, null, null);
    for (var i in employeesSearchResults) {
        var id = employeesSearchResults[i].getId();
        nlapiDeleteRecord('customrecord_apm_setup_employees_access', id);
    }

    //save new settings
    var rolesAccessCount = request.getLineItemCount('custpage_sl_access_roles');
    var rolesRecIds = new Array();
    var roles = new Array();
    for (var i = 1; i < rolesAccessCount + 1; i++) {
        var role = request.getLineItemValue('custpage_sl_access_roles', 'custpage_sl_access_role', i);
        var top10 = request.getLineItemValue('custpage_sl_access_roles', 'custpage_sl_access_role_top10', i);
        var record = nlapiCreateRecord('customrecord_apm_setup_roles_access');
        record.setFieldValue('custrecord_apm_setup_ra_role', role);
        record.setFieldValue('custrecord_apm_setup_ra_top10', top10);
        rolesRecIds.push(nlapiSubmitRecord(record));
        roles.push(role);
    }
    logger.debug('setup roles ids', rolesRecIds);

    var employeesAccessCount = request.getLineItemCount('custpage_sl_access_employees');
    var employees = new Array();
    for (var i = 1; i < employeesAccessCount + 1; i++) {
        var employee = request.getLineItemValue('custpage_sl_access_employees', 'custpage_sl_access_employee', i);
        employees.push(employee);
    }
    employees = (employees && employees.length > 0) ? filterEmployeesWithAccess(employees) : new Array();
    logger.debug('filtered employees ids', employees);

    var newParentRec = nlapiCreateRecord('customrecord_apm_setup_parent');
    //newParentRec.setFieldValue('name', 'pseudo parent record');
    for (var i = 1; i < employeesAccessCount + 1; i++) {
        var employee = request.getLineItemValue('custpage_sl_access_employees', 'custpage_sl_access_employee', i);
        var top10 = request.getLineItemValue('custpage_sl_access_employees', 'custpage_sl_access_employee_top10', i);
        newParentRec.selectNewLineItem('recmachcustrecord_apm_setup_ea_parent');
        newParentRec.setCurrentLineItemValue('recmachcustrecord_apm_setup_ea_parent', 'custrecord_apm_setup_ea_employee', employee);
        newParentRec.setCurrentLineItemValue('recmachcustrecord_apm_setup_ea_parent', 'custrecord_apm_setup_ea_top10', top10);
        newParentRec.commitLineItem('recmachcustrecord_apm_setup_ea_parent');
    }
    var parentId = nlapiSubmitRecord(newParentRec);

    logger.debug('parent id', parentId);

    //set deployment settings
    var deployIds = getDeploymentIds();
    logger.debug('deploy ids', deployIds);

    if (deployIds && (deployIds.length <= Object.keys(SCRIPTID).length)) {
        var submitDeploy = new Array();
        for (var i in deployIds) {
            var sdRec = nlapiLoadRecord('scriptdeployment', deployIds[i]);

            sdRec.setFieldValue('allemployees', 'F');
            sdRec.setFieldValue('allpartners', 'F');
            sdRec.setFieldValue('allroles', 'F');

            sdRec.setFieldValues('audslctrole', roles);
            sdRec.setFieldValues('audemployee', employees);
            submitDeploy.push(nlapiSubmitRecord(sdRec));
        }
        logger.debug('submit deploy', submitDeploy);
    }

    nlapiSetRedirectURL('SUITELET', 'customscript'+SCRIPTID.AH, 'customdeploy'+SCRIPTID.AH, null, null);
};

function getDeploymentIds() {
    var sf = new Array();
    var sc = new Array();

    sf = [
        ['scriptid', 'is', 'customdeploy'+SCRIPTID.RPM]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.PTD]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.PTS]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.SSA]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.SQM]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.WSA]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.WSOD]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.SPA]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.SPD]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.SCPM]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.SPJD]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.CM]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.CD]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.PRF]
      , 'or'
      , ['scriptid', 'is', 'customdeploy'+SCRIPTID.AH]
    ];

    var searchResults = nlapiSearchRecord('scriptdeployment', null, sf, sc);

    var ids = new Array();
    for (var i in searchResults) {
        ids.push(searchResults[i].getId());
    }

    return ids;
};

function filterEmployeesWithAccess( employees ) {
    var sf = new Array();
    var sc = new Array();

    sf.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    sf.push(new nlobjSearchFilter('giveaccess', null, 'is', 'T'));
    sf.push(new nlobjSearchFilter('internalid', null, 'anyof', employees));

    var searchResults = nlapiSearchRecord('employee', null, sf, sc);

    var ids =  new Array();
    for (var i in searchResults) {
        ids.push(searchResults[i].getId());
    }

    return ids;
};
