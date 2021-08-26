/**  
 * Copyright © 2016, 2017 Oracle and/or its affiliates. All rights reserved.  
 *    
 * @NAPIVersion 2.x
 */  
  
define([
    '../adapter/fam_adapter_search',
    '../adapter/fam_adapter_runtime'
], 
 
function (search, runtime){
    var recordId = null; 
    var crtName = 'customrecord_ncfar_systemsetup'; 
    var values = {}; 
    var multiSelectFields = ['selectedUserRoles']; 
    var fields = { 
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
        maxSummaryPerJournal      : 'custrecord_maxsummaryperjournal',
        precompute                : 'custrecord_precompute',
        famFilesFolder            : 'custrecord_fam_files_folder',
        deprSchedInsLimit         : 'custrecord_deprschedinslimit',
        templateAssetRegister     : 'custrecord_assetreg_template',
        templateAssetSummary      : 'custrecord_assetsumm_template',
        templateDeprSchedNbv      : 'custrecord_depschednbv_template',
        templateDeprSchedPd       : 'custrecord_depschedpd_template',
        isPostingTaxMigrated      : 'custrecord_postingtaxmigrated'
    }; 
 
    var searchValues = function () { 
        var columns = []; 
        for (j in fields) { 
            if (fields[j]) { 
                columns.push(fields[j]); 
            } 
        } 
 
        var settingsSearch = search.create({ 
            type : crtName, 
            columns : columns 
        }); 
         
        results = settingsSearch.run().getRange({start : 0, end : 1});
        settingsRec = results[0]; 
         
        if (settingsRec) { 
            recordId = settingsRec.id; 
 
            for (i in fields) { 
                values[i] = settingsRec.getValue(fields[i]); 
 
                if (multiSelectFields.indexOf(i) !== -1) { 
                    values[i] = values[i].split(','); 
                } 
            } 
             
            setDefaults(); 
        } 
        else {
            recordId = 0; 
        } 
    }; 
     
    var setDefaults = function () {
        var templates = searchDefaultReportTemplates();
        var defaults = { 
            reportsStorageDays   : 30, 
            reportFileSizeLimit  : 5,
            maxSummaryPerJournal : 250,
            deprSchedInsLimit : 1000000,
            templateAssetRegister : templates.assetRegister,
            templateAssetSummary : templates.assetSummary,
            templateDeprSchedNbv : templates.deprSched,
            templateDeprSchedPd : templates.deprSched
        }; 
         
        for (var i in defaults) { 
            if (!values[i]) { 
                values[i] = defaults[i];  
            } 
        } 
        // multiply value to 1,000,000 for MB 
        values['reportFileSizeLimit'] *= 1000000;
 
        //override FAM Settings if Custom Transactions is disabled 
        if (runtime.isFeatureInEffect({feature :'MULTIBOOK'}) || 
            !runtime.isFeatureInEffect({feature :'CUSTOMTRANSACTIONS'})) { 
            values['allowCustomTransaction'] = false ; 
        }
        
        if (!values['famFilesFolder']) {
            values['famFilesFolder'] = values['reportFolder'];
        }
    };
    
    var searchDefaultReportTemplates = function() {
        var EXPECTED_LENGTH = 3;
        var ASSET_REGISTER_DOC_NAME = 'FAM_RegisterReport_Template.xml';
        var ASSET_SUMMARY_DOC_NAME = 'FAM_SummaryReport_Template.xml';
        var DEPR_SCHEDULE_DOC_NAME = 'FAM_ScheduleReport_Template.xml';

        var templates = {};
        var searchObj = search.load({
            id: 'customsearch_fam_default_rep_templates'
        });
        var reportTemplates = searchObj.run().getRange({start : 0, end : 3});
        if (reportTemplates) {
            for (var i = 0; i<EXPECTED_LENGTH; i++) {
                var template = reportTemplates[i];
                var templateName = template.getValue('name');
                switch (templateName){
                    case ASSET_REGISTER_DOC_NAME: templates.assetRegister = template.id; break;
                    case ASSET_SUMMARY_DOC_NAME: templates.assetSummary = template.id; break;
                    case DEPR_SCHEDULE_DOC_NAME: templates.deprSched = template.id; break;
                }
            }
        };
        
        return templates;
    };
      
    return {
        // Forces the next call of getSetting to call searchValues again, thus, 'clears' the 'cache'
        clearCache: function () {
            recordId = null;
            return recordId;
        },
        getId: function(){
            if (recordId === null) { 
                searchValues(); 
            }
            return recordId; 
        },
        getSetting: function (fld) { 
            if (recordId === null) { 
                searchValues(); 
            } 
            if (recordId === 0) { 
                return null; 
            } 
 
            return values[fld]; 
        },
        
        isRoleAllowed : function() {
            const currentUser = runtime.getCurrentUser();
            const currentUserRole = currentUser.role;
            const isAdmin = currentUserRole == '3' || currentUserRole == '31';
            
            var selectedRoles = this.getSetting('selectedUserRoles');
            var isRoleAllowed = (selectedRoles.indexOf(currentUserRole.toString()) !== -1) || isAdmin;
            
            return isRoleAllowed;
        }
    } 
}); 
