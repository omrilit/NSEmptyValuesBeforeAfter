/**
 *  © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) FAM = {};

FAM.Context = new function() {

    this.object = nlapiGetContext();

    this.userRole           = this.object.getRole() + '';
    this.userId             = this.object.getUser();
    this.userName           = this.object.getName();
    this.blnAdmin           = this.userRole == '3' || this.userRole == '31';
    this.blnOneWorld        = this.object.getFeature('SUBSIDIARIES');
    this.blnClass           = this.object.getFeature('CLASSES');
    this.blnDepartment      = this.object.getFeature('DEPARTMENTS');
    this.blnLocation        = this.object.getFeature('LOCATIONS');
    this.blnMultiCurrency   = this.object.getFeature('MULTICURRENCY');
    this.blnMultiBook       = this.object.getFeature('MULTIBOOK');
    this.blnMultiLocInvt    = this.object.getFeature('MULTILOCINVT');
    this.blnCustTransaction = this.object.getFeature('CUSTOMTRANSACTIONS');
    this.blnAdvPrinting     = this.object.getFeature('ADVANCEDPRINTING');
    this.blnForeignCurrMgmt = this.object.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.blnLocMandatory    = this.object.getPreference('LOCMANDATORY') === 'T';

    this.isFeatureEnabled = function(name) {
        return this.object.getFeature(name);
    };

    this.getSetting = function(type, name) {
        return this.object.getSetting(type, name);
    };

    this.getExecutionContext = function() {
        return this.object.getExecutionContext();
    };

    this.getRemainingUsage = function() {
        return this.object.getRemainingUsage();
    };

    this.getScriptId = function() {
        return this.object.getScriptId();
    };

    this.getDeploymentId = function() {
        return this.object.getDeploymentId();
    };

    this.getVersion = function() {
        return this.object.getVersion();
    };

    this.getPreference = function(name) {
        return this.object.getPreference(name);
    };

    this.setPercentComplete = function(value) {
        if (this.getExecutionContext() === 'scheduled') {
            return this.object.setPercentComplete(value);
        }
    };

    this.getPermission = function(name) {
        return this.object.getPermission(name);
    };

    this.getQueueCount = function() {
        return +(this.object.getQueueCount());
    };
    
    this.getSessionObject = function(name){
        return this.object.getSessionObject(name);
    };
    
    this.setSessionObject = function(name, value){
        return this.object.setSessionObject(name, value);
    };
};

FAM.Permissions = {
    None   : 0,
    View   : 1,
    Create : 2,
    Edit   : 3,
    Full   : 4
};

/**
 * Entity for System Setup Record
**/
FAM.SystemSetup = new function () {
    this.recordId = null;
    this.crtName = 'customrecord_ncfar_systemsetup';
    this.values = {};
    this.multiSelectFields = ['selectedUserRoles'];
    this.fields = {
        disposalForm              : 'custrecord_far_disposalform',
        reportFolder              : 'custrecord_far_reportfolder',
        isPostLocation            : 'custrecord_postlocation',
        isPostDepartment          : 'custrecord_postdepartment',
        isPostClass               : 'custrecord_postclass',
        isAutoPropose             : 'custrecord_autopropose',
        isAutoCreate              : 'custrecord_autocreate',
        isRestrictRejectProposal  : 'custrecord_restrictrejectassetprop',
        isConstrainAssetLifetime  : 'custrecord_constrainal',
        nonDecimalCurrencySymbols : 'custrecord_intcurrsymbols',
        isRunCsvImport            : 'custrecord_run_script_on_csv_import',
        isSummarizeJe             : 'custrecord_fam_summarisejournalsby',
        isAllowFutureDepreciate   : 'custrecord_allowfuturedepr',
        isAllowValueEdit          : 'custrecord_allowvalueedit',
        isAllowNegativeCost       : 'custrecord_allownegativecost',
        selectedUserRoles         : 'custrecord_userrole',
        isWriteDown               : 'custrecord_wdusedepraccount',
        isCheckApLock             : 'custrecord_farsetupcheckaplock',
        isCheckArLock             : 'custrecord_farsetupcheckarlock',
        isPropApprovedOnly        : 'custrecord_propapprovedonly',
        queueLimit                : 'custrecord_bgqueuelimit',
        queuePollingInterval      : 'custrecord_queuepollinginterval',
        allowBypassUE             : 'custrecord_allowbypass_ue',
        isFollowAcctngPeriod      : 'custrecord_followacctperiod',
        reportsStorageDays        : 'custrecord_daysstorereports',
        allowAdminAllReports      : 'custrecord_adminallreports',
        allowCustomTransaction    : 'custrecord_allowcustomtransaction',
        reportFileSizeLimit       : 'custrecord_reportfilesizelimit',
        batchSearchLimit          : 'custrecord_batchsearchlimit',
        deprSchedInsLimit         : 'custrecord_deprschedinslimit',
        jeLineLimit               : 'custrecord_journallinelimit',
        templateAssetRegister     : 'custrecord_assetreg_template',
        templateAssetSummary      : 'custrecord_assetsumm_template',
        templateDeprSchedNbv      : 'custrecord_depschednbv_template',
        templateDeprSchedPd       : 'custrecord_depschedpd_template',
        precompute                : 'custrecord_precompute'
    };
    

    this.getSetting = function (fld) {
        if (this.recordId === null) {
            this.searchValues();
        }
        if (this.recordId === 0) {
            return null;
        }
        
        // Throw an error if no template is  found for any of the reports (esp. default)
        if (!this.values[fld] && 
            (fld === "templateAssetRegister" || fld === "templateAssetSummary" ||
            fld === "templateDeprSchedNbv" || fld === "templateDeprSchedPd")) {
            throw nlapiCreateError("NO_DEF_TEMPLATE",
                FAM.resourceManager.GetString("err_no_def_template", "systemsetup"));
        }
        return this.values[fld];
    };

    this.searchValues = function () {
        var i, j, columns = [], results;

        for (j in this.fields) {
            if (this.fields[j]) {
                columns.push(new nlobjSearchColumn(this.fields[j]));
            }
        }

        results = nlapiSearchRecord(this.crtName, null, null, columns);

        if (results) {
            this.recordId = results[0].getId();

            for (i in this.fields) {
                this.values[i] = results[0].getValue(this.fields[i]);

                if (this.multiSelectFields.indexOf(i) !== -1) {
                    this.values[i] = this.values[i].split(',');
                }
            }
            
            this.setDefaults();
        }
        else {
            this.recordId = 0;
        }
    };
    
    
    this.setDefaults = function () {
        var templates = this.searchDefaultReportTemplates();
        var defaults = {
            reportsStorageDays : 30,
            reportFileSizeLimit : 5,
            batchSearchLimit : 1000,
            deprSchedInsLimit : 1000000,
            jeLineLimit : 1000,
            templateAssetRegister : templates.assetRegister,
            templateAssetSummary : templates.assetSummary,
            templateDeprSchedNbv : templates.deprSched,
            templateDeprSchedPd : templates.deprSched
        };
        
        for (var i in defaults) {
            if (!this.values[i]) {
                this.values[i] = defaults[i]; 
            }
        }
        // multiply value to 1,000,000 for MB
        this.values['reportFileSizeLimit'] *= 1000000;

        //override FAM Settings if Custom Transactions is disabled
        if (FAM.Context.blnMultiBook || !FAM.Context.blnCustTransaction) {
            this.values['allowCustomTransaction'] = 'F';
        };
    };
    
    this.searchDefaultReportTemplates = function() {
        var EXPECTED_LENGTH = 3;
        var ASSET_REGISTER_DOC_NAME = "FAM_RegisterReport_Template.xml";
        var ASSET_SUMMARY_DOC_NAME = "FAM_SummaryReport_Template.xml";
        var DEPR_SCHEDULE_DOC_NAME = "FAM_ScheduleReport_Template.xml";

        var templates = {};
        var reportTemplates = nlapiSearchRecord("file", "customsearch_fam_default_rep_templates");
        if (reportTemplates) {
            for (var i = 0; i<EXPECTED_LENGTH; i++) {
                var template = reportTemplates[i];
                var templateName = template.getValue("name");
                switch (templateName){
                    case ASSET_REGISTER_DOC_NAME: templates.assetRegister = template.getId(); break;
                    case ASSET_SUMMARY_DOC_NAME: templates.assetSummary = template.getId(); break;
                    case DEPR_SCHEDULE_DOC_NAME: templates.deprSched = template.getId(); break;
                }
            }
        };
        
        return templates;
    }
};

FAM.Timer = function() {
    var _time = null;

    this.start = function() {
        _time = (new Date()).getTime();
    };

    this.getElapsedTime = function() {
        return (new Date()).getTime() - _time;
    };

    this.getReadableElapsedTime = function() {
        var timeInMS = this.getElapsedTime(),
            res = '',
            rem = 0;

        if (timeInMS > 1000) {
            rem = timeInMS % 1000;
            timeInMS = (timeInMS - rem) / 1000; //secs
            res = rem + 'ms' + res;
            if (timeInMS > 60) {
                rem = timeInMS % 60;
                timeInMS = (timeInMS - rem) / 60; // minutes
                res = rem + 's ' + res;
                if (timeInMS > 60) {
                    rem = timeInMS % 60;
                    timeInMS = (timeInMS - rem) / 60; // hours
                    res = rem + 'm ' + res;
                    if (timeInMS > 24) {
                        rem = timeInMS % 24;
                        timeInMS = (timeInMS - rem) / 24; // days
                        res = timeInMS + 'd ' + rem + 'h ' + res;
                    }
                    else {
                        res = timeInMS + 'h ' + res;
                    }
                }
                else {
                    res = timeInMS + 'm ' + res;
                }
            }
            else {
                res = timeInMS + 's ' + res;
            }
        }
        else {
            res = timeInMS + 'ms';
        }

        return res;
    };
};