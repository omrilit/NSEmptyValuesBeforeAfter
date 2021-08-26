/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

FAM.SystemSetup_CS = new function () {
    this.hasOngoingMigration = false;
    
    this.messages = {
        WARNING_NEGATIVE_ASSET_COST : 'client_systemsetup_negativecheck',
        CONFIRM_ENABLE_BYPASS : 'client_enable_bypass',
        CONFIRM_TRIGGER_RESET : 'client_trigger_reset',
        ALERT_ONGOING_MIGRATION : 'client_ongoing_migration'
    };
    
    /**
     * pageInit event type of client scripts
    **/
    this.pageInit = function (type) {
        this.messages = FAM.Util_CS.fetchMessageObj(this.messages);
        
        var bDisable = nlapiGetFieldValue('custpage_allowvalueedit') !== 'T';
        nlapiDisableField('custpage_userrole', bDisable);
        nlapiDisableField('custpage_allownegativecost', bDisable);
    };
    
    /**
     * validateField event type of client scripts
    **/
    this.validateField = function (type, name, linenum) {
        if (name === 'custpage_allowvalueedit') {
            var bDisable = nlapiGetFieldValue('custpage_allowvalueedit') !== 'T';
            if(bDisable){
                nlapiSetFieldValue('custpage_allownegativecost', 'F');
                if(nlapiGetFieldValue('custpage_allownegativecost') === 'T') {
                    return false;
                }
            }
        } else if (name === 'custpage_allownegativecost') {
            if(nlapiGetFieldValue('custpage_allownegativecost') ==='F' && this.hasNegativeAsset()) {
                alert(this.messages.WARNING_NEGATIVE_ASSET_COST);
                return false;
            }
        } else if (name === 'custpage_allowbypassue' && nlapiGetFieldValue('custpage_allowbypassue') ==='T') {
            return confirm(this.messages.CONFIRM_ENABLE_BYPASS);
        } else if ((name === 'custpage_farsetupsummary' || name === 'custpage_followacctperiod') && nlapiGetFieldValue('custpage_precompute') === 'T') {
            return confirm(this.messages.CONFIRM_TRIGGER_RESET);
        }
        return true;
    };
    
    /**
     * fieldChange event type of client scripts
    **/
    this.fieldChanged = function (type, name) {
        if (name === 'custpage_allowvalueedit') {
            var bDisable = !(nlapiGetFieldValue('custpage_allowvalueedit') === 'T');
            nlapiDisableField('custpage_allownegativecost', bDisable);
            nlapiDisableField('custpage_userrole', bDisable);
        }
    };
    
    /**
     * query function for assets that have negative values
     */
    this.hasNegativeAsset = function(){
        var returnValue = false;
       
        var fil = [];
        fil[0] = new nlobjSearchFilter('formulatext', null, 'is', 'TRUE');
        fil[0].setFormula("CASE WHEN {custrecord_assetcost} < 0 THEN 'TRUE'"
                + " WHEN {custrecord_assetcurrentcost} < 0 THEN 'TRUE'" 
                + " WHEN {custrecord_assetresidualvalue} < 0 THEN 'TRUE'"
                + "ELSE 'FALSE'" + "END");

        var col = new nlobjSearchColumn('internalid', null, 'count');
        var rs = nlapiSearchRecord('customrecord_ncfar_asset', null, fil, col);
        var count = rs[0].getValue('internalid', null, 'count');
        if(count > 0) {
            returnValue = true;
        }
        return returnValue;
    };
    
    this.doMigrate = function() {
        if (this.hasOngoingMigration || this.checkOngoingMigration()) {
            alert(this.messages.ALERT_ONGOING_MIGRATION);
        }
        else {
            var redirectUrl = nlapiResolveURL('SUITELET',
                    'customscript_ncfar_systemsetup_sl',
                    'customdeploy1');
            
            window.location = redirectUrl + '&custpage_migrate=T';
        }
    }
    
    this.checkOngoingMigration = function() {
        var col = new nlobjSearchColumn('internalid', null, 'count');
        var fil = [ new nlobjSearchFilter('custrecord_fam_procid', null, 'is', 'precomputeMigration'),
                    new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                    new nlobjSearchFilter('custrecord_fam_procstatus', null, 'anyof', [FAM.ProcessStatus.Queued, FAM.ProcessStatus.InProgress]) ];

        var rs = nlapiSearchRecord('customrecord_fam_process', null, fil, col);
        var count = rs[0].getValue('internalid', null, 'count');
        if(count > 0) {
            this.hasOngoingMigration = true;
        }
        
        return this.hasOngoingMigration;
    }
};
