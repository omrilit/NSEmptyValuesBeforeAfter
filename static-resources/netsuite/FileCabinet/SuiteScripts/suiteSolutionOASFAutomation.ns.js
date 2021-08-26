/**
 * Copyright NetSuite, Inc. 2015 All rights reserved.
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements
 * and may not be the best approach. Actual implementation should not reuse
 * this code without due verification.
 *
 * Automatically create a NetSuite project record when an opportunity reaches
 * a certain status. The script will also attach the project back to the
 * opportunity record at either the header level ONLY (this script will not
 * cater for "Consolidate projects on sales transactions" setting).
 *
 * If the opportunity being viewed is linked to a project that has the "Export
 * to OpenAir" flag set to TRUE, a subtab is automatically added to the
 * opportunity to easily view the related OpenAir project single sign-on
 * record.
 *
 * Version    Date            Author           Remarks
 * 1.00       02 Nov 2015     Ryan Morrissey
 * 1.01       05 Apr 2016     Ryan Morrissey   Updated for Dilley SRP account
 *
 */


{
    var FLD_OPP_CREATE_PRJ   = 'custbody_create_oa_project_from_opp',
        FLD_OPP_PRJ_NAME     = 'custbody_oa_project_name',
        FLD_OPP_PRJ_TEMPLATE = 'custbody_oa_project_template',
        FLD_OPP_PRJ_MANAGER  = 'custbody_oa_project_manager',
        FLD_OPP_START_DATE   = 'custbody_opp_prjstart',
        FLD_OPP_STATUS       = 'entitystatus',
        FLD_OPP_CLIENT       = 'entity',

        FLD_PRJ_START_DATE   = 'startdate',
        FLD_PRJ_CLIENT       = 'parent',
        FLD_PRJ_NAME         = 'companyname',
        FLD_PRJ_JCTYPE       = 'projectexpensetype',
        FLD_PRJ_ASSIGN       = 'limittimetoassignees',
        FLD_PRJ_MANAGER      = 'custentity_projectmanager',
        FLD_PRJ_EXPORT_OA    = 'custentity_oa_export_to_openair',
        FLD_PRJ_OPP_ID       = 'custentity_oa_opportunity_id',
        FLD_PRJ_TEMPLATE     = 'custentity_oa_project_template',
        FLD_PRJ_STAGE        = 'custentity_oa_project_stage',

        VAL_OPP_STATUS       = '20',  // Needs Scoping
        VAL_EXPORT_TRUE      = 'T',   // True
        VAL_ASSIGN_FALSE     = 'F',   // Do not limit time to assignees
        VAL_JCTYPE           = '-2',  // Client Billable
        VAL_PRJ_STAGE        = '1';   // Proposed
}


function createLinkedProjectAfterSave(type) {
    try {
        if (type == 'create' || type == 'edit') {
            var ctx              = nlapiGetContext(),
                advancedProjects = isTrueAsString(ctx.getFeature('ADVANCEDJOBS')),
                consolidateSales = isTrueAsString(ctx.getPreference('CONSOLINVOICES')),

                oppID            = nlapiGetRecordId(),
                oppRec           = nlapiLoadRecord('opportunity', oppID),
                oppStatus        = oppRec.getFieldValue(FLD_OPP_STATUS),
                oppPrjName       = oppRec.getFieldValue(FLD_OPP_PRJ_NAME),

                prjFldId         = null,
                prjFldName       = null;


            // Determine where to look for projects...
            if (consolidateSales == 'F') {
                // Do we have a separate "job" field?
                if (advancedProjects == 'T') {
                    prjFldId   = oppRec.getFieldValue('job');
                    prjFldName = 'job';
                } else {
                    prjFldId   = oppRec.getFieldValue('entity');
                    prjFldName = 'entity';
                }

                // Condition: Opportunity Status = Needs Scoping And Job (Main) Is Empty
                if (oppStatus == VAL_OPP_STATUS && !prjFldId && oppPrjName !== null) {
                    var prjID = utilityCreateProject(oppID, oppRec);
                    oppRec.setFieldValue(prjFldName, prjID);
                    nlapiSubmitRecord(oppRec, true, true);
                }
            }
        }
    } catch (err) {
        nlapiLogExecution('error', 'Unexpected error', err.message);
    }
}


function buildOAProjectSubTab(type) {
    try {
        if (type != 'create') {
            var ctx              = nlapiGetContext()
                ,advancedProjects = isTrueAsString(ctx.getFeature('ADVANCEDJOBS'))
                ,consolidateSales = isTrueAsString(ctx.getPreference('CONSOLINVOICES'))
                ,ssoRecord        = ctx.getPreference('custscript_oa_suitesignon_record')

                ,oppID            = nlapiGetRecordId()
                ,oppRec           = nlapiLoadRecord('opportunity', oppID)

                ,prjFldId         = null
                ,prjFldName       = null
                ,url              = null
            ;

            // Determine where to look for projects...
            if (consolidateSales == 'F') {

                // Do we have a separate "job" field?
                if (advancedProjects == 'T') {
                    prjFldId   = oppRec.getFieldValue('job');
                    prjFldName = 'job';
                } else {
                    prjFldId   = oppRec.getFieldValue('entity');
                    prjFldName = 'entity';
                }

                try {
                    // Get SuiteSignOn generic link
                    url = nlapiOutboundSSO(ssoRecord);
                } catch (err) {
                    nlapiLogExecution('ERROR', 'System could not find a valid SSO record', err.message);
                }

                // Only execute if valid SSO Is found
                if (url !== null) {

                    // make sure we have a project ID
                    if (prjFldId !== null) {

                        var prjFlds = nlapiLookupField('job', prjID, [FLD_PRJ_EXPORT_OA, FLD_PRJ_OPP_ID]);

                        if (prjFlds[FLD_PRJ_EXPORT_OA] == 'T' && prjFlds[FLD_PRJ_OPP_ID] !== null) {
                            // Access projects module
                            var url_pm     = url + '&app=pm;netsuite_project_id=' + prjFldId,
                                content_pm = '<iframe src="' + url_pm +
                                             '" align="center" style="width: 1350px; height: 600px; margin:0; border:0; padding:0"></iframe>',
                                subTabName = ctx.getPreference('custscript_oa_opp_subtab_name') || 'View Project',
                                form       = nlapiCreateForm('Opportunity');

                            form.addTab('custpage_view_oa_project', subTabName);
                            // Add iFrame and projects tab
                            var iFramePM = form.addField('custpage_new_sso_tab', 'inlinehtml', null, null, 'custpage_view_oa_project');
                            iFramePM.setDefaultValue(content_pm);
                            iFramePM.setLayoutType('outsidebelow', 'startcol');
                        }

                    }
                }
            }
        }
    } catch (err) {
        nlapiLogExecution('error', 'Unexpected error!', err.message);
    }
}


/**
 * Return a Boolean string based on an input.
 * @param   {Any} value A boolean-like value.
 * @returns {String}    Boolean string value.
 */
function isTrueAsString(value) {
    if (value == 'T' || value == 'TRUE' || value == 't' || value == 'true' || value === true) {
        return 'T';
    } else {
        return 'F';
    }
}


/**
 * Utility to create a new project record.
 * @param  {Int}    oppID  Opportunity internal id.
 * @param  {Object} oppRec Opportunity record object.
 * @return {Int}           NetSuite project record id.
 */
function utilityCreateProject(oppID, oppRec) {
    var recProj = nlapiCreateRecord('job');
    recProj.setFieldValue(FLD_PRJ_CLIENT, oppRec.getFieldValue(FLD_OPP_CLIENT));
    recProj.setFieldValue(FLD_PRJ_NAME, oppRec.getFieldValue(FLD_OPP_PRJ_NAME));
    recProj.setFieldValue(FLD_PRJ_TEMPLATE, oppRec.getFieldValue(FLD_OPP_PRJ_TEMPLATE));
    recProj.setFieldValue(FLD_PRJ_START_DATE, oppRec.getFieldValue(FLD_OPP_START_DATE));
    recProj.setFieldValue(FLD_PRJ_MANAGER, oppRec.getFieldValue(FLD_OPP_PRJ_MANAGER));
    recProj.setFieldValue(FLD_PRJ_STAGE, VAL_PRJ_STAGE);
    recProj.setFieldValue(FLD_PRJ_EXPORT_OA, VAL_EXPORT_TRUE);
    recProj.setFieldValue(FLD_PRJ_OPP_ID, oppID);
    recProj.setFieldValue(FLD_PRJ_JCTYPE, VAL_JCTYPE);
    recProj.setFieldValue(FLD_PRJ_ASSIGN, VAL_ASSIGN_FALSE);

    var prjID = nlapiSubmitRecord(recProj, true, true);
    return prjID;
}