/**
 * © 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define([
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_search',
    '../util/fam_util_systemsetup',
],
        
function migratePostingTaxDict(record, search, utilSetup) {
    var module = {};
    
    module.validator = function(){
        return module.hasRecsToProcess(this.searchId);
    };
    module.getNextBatch = function (params, fprId) {
        var ret = {};
        if (fprId) {
            ret['custscript_migrate_postingtax_fprid'] = fprId;
            ret['custscript_migrate_postingtax_searchid'] = this.searchId;
        }
        
        return ret;
    };
    module.setMigrationFlag = function(){
        var setupId = utilSetup.getId();
        if (setupId){
            record.submitFields({
                type : 'customrecord_ncfar_systemsetup',
                id : setupId,
                values : {
                    custrecord_postingtaxmigrated : true
                }
            });
        }
    };
    module.hasRecsToProcess = function(searchId){
        var searchObj = search.load({id:searchId});
        var pagedData = searchObj.runPaged({ pageSize : 1000 });
        
        return pagedData.count > 0;
    };
    
    module.AltDepr = {
        desc            : 'Migrate Posting Alternate Depreciation',
        type            : 'MAP_REDUCE',
        scriptId        : 'customscript_fam_migrate_postingtax_mr',
        deploymentId    : 'customdeploy_fam_migrate_postingtax_mr',
        validator       : function(){
            module.setMigrationFlag();
            return module.hasRecsToProcess(this.searchId);
        },
        getNextBatch    : module.getNextBatch,
        displayId       : 'postingAltDeprMigration',
        searchId        : 'customsearch_fam_altdepr_withbook'
    };
    module.DefAltDepr = {
        desc            : 'Migrate Posting Default Alternate Depreciation',
        type            : 'MAP_REDUCE',
        scriptId        : 'customscript_fam_migrate_postingtax_mr',
        deploymentId    : 'customdeploy_fam_migrate_postingtax_mr',
        validator       : module.validator,
        getNextBatch    : module.getNextBatch,
        displayId       : 'postingDefAltDeprMigration',
        searchId        : 'customsearch_fam_defaltdepr_withbook'
    };
    module.PropAltDepr = {
        desc            : 'Migrate Posting Proposal Alternate Depreciation',
        type            : 'MAP_REDUCE',
        scriptId        : 'customscript_fam_migrate_postingtax_mr',
        deploymentId    : 'customdeploy_fam_migrate_postingtax_mr',
        validator       : module.validator,
        getNextBatch    : module.getNextBatch,
        displayId       : 'postingPropAltDeprMigration',
        searchId        : 'customsearch_fam_propaltdepr_withbook'
    }

    return module;
});