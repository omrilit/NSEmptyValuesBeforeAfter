/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NScriptType ClientScript
 * @NApiVersion 2.x
 */

define([
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_runtime',
    '../adapter/fam_adapter_search',
    '../adapter/fam_adapter_ui_dialog',
    '../const/fam_const_customlist',
    '../util/fam_util_altdepr',
    '../util/fam_util_cs',
    '../util/fam_util_deprperiod',
    '../util/fam_util_systemsetup'
], function (record, runtime, search, uiDialog, constList, utilAltDepr, utilCS, utilDeprPeriod,
    utilSetup) {
        
    var module = {}; 
    
    var isMB = false;
    var isOW = false;
    module.messages = {};
    module.acctgBookCache = {};
    
    module.pageInit = function(context){
        isMB = runtime.isFeatureInEffect({feature :'MULTIBOOK'});
        isOW = runtime.isFeatureInEffect({feature :'SUBSIDIARIES'});
        
        this.messages = utilCS.fetchMessageObj({
            ALERT_ALREADY_USED          : 'client_defaultaltdepr_alreadyused',
            ALERT_ASSET_AL_WARNING      : 'client_altdepr_assetlifetimewarning',
            ALERT_ASSET_AL_ERROR        : 'client_altdepr_assetlifetimeerror',
            ALERT_IMPROPER_CONVENTION   : 'client_altmethod_improperconvention',
            ALERT_ADD_NOT_ALLOWED       : 'client_defaultaltdepr_addnotallowed',
            ALERT_MULTIBOOK_DISABLED    : 'client_multibookdisabled',
            ALERT_PRIMARY_BOOK          : 'client_primarybook',
            ALERT_PENDING_BOOK          : 'client_pendingbook'});
        
        var rec = context.currentRecord;
        module.disableFields(rec);
        module.displaySubsidiary(rec);
    };
    
    module.saveRecord = function(context) {
        var rec = context.currentRecord;
        
        if (!rec.getValue({fieldId: 'custrecord_altdeprdef_assettype'})) {
            uiDialog.alert({message : this.messages.ALERT_ADD_NOT_ALLOWED});
            return false;
        }
        
        // Check duplicate Alternate Method
        var hasDupAltMeth = utilAltDepr.hasDupAltDep({
            parentRec: 'assetType',
            parentId: rec.getValue({fieldId: 'custrecord_altdeprdef_assettype'}),
            altDepId: rec.getValue({fieldId: 'custrecord_altdeprdef_altmethod'}),
            acctBookId: rec.getValue({fieldId: 'custrecord_altdeprdef_accountingbook'}),
            isPosting: rec.getValue({fieldId: 'custrecord_altdeprdef_isposting'}),
            recId: rec.id
        });
        
        if(hasDupAltMeth){
            var printMessage = utilCS.injectMessageParameter(
                    this.messages.ALERT_ALREADY_USED, 
                    [rec.getField('custrecord_altdeprdef_altmethod').label]);
            
            uiDialog.alert({message : printMessage});
            return false;
        }
        
        // Check DefaultAlternate Method AL against AssetType AL
        var alternateLifeTime = +rec.getValue({fieldId: 'custrecord_altdeprdef_lifetime'}) || 0,
            searchFilter = [['internalid', 'anyof', rec.getValue({fieldId: 'custrecord_altdeprdef_assettype'})]],
            searchColumn = ['custrecord_assettypelifetime'];
        
        var searchObj = search.create({
            type: 'customrecord_ncfar_assettype',
            filters: searchFilter,
            columns: searchColumn
        });
        
        var searchRes = searchObj.run().getRange({ start : 0, end : 1 });
        if (searchRes.length>0) {
            var assetTypeLifeTime = +searchRes[0].getValue({name:'custrecord_assettypelifetime'}) || 0;
            
            if (+rec.getValue({fieldId: 'custrecord_altdeprdef_depreciationperiod'}) === 
                constList.DeprPeriod.Annually) {

                //Convert lifetime to monthly units
                alternateLifeTime *= 12;
            }
            
            if (alternateLifeTime > assetTypeLifeTime) {
                if (utilSetup.getSetting('isConstrainAssetLifetime') == false) {
                    //notify only as warning since user perference allows it
                    var confirmRes = uiDialog.confirm({message : this.messages.ALERT_ASSET_AL_WARNING, sync: true})
                        .then(function(res) {return res;});
                    return confirmRes;
                } else {
                    //validation error
                    uiDialog.alert({message : this.messages.ALERT_ASSET_AL_ERROR});
                    return false;
                }
            }
        }
        
        module.setDefaults(rec);
        return true;
    };
    
    module.fieldChanged = function (context) {
        var rec = context.currentRecord,
            name = context.fieldId;
        
        // Enable/disable Posting checkbox if accounting book has / no value
        if (name === 'custrecord_altdeprdef_accountingbook') {
            rec.getField({fieldId: 'custrecord_altdeprdef_isposting'}).isDisabled = 
                !rec.getValue({fieldId: 'custrecord_altdeprdef_accountingbook'});
        }
    };
    
    module.validateField = function(context) {
        var rec = context.currentRecord,
            name = context.fieldId;
        
        if (name === 'custrecord_altdeprdef_deprmethod' || name === 'custrecord_altdeprdef_convention') {
            if (!utilDeprPeriod.validateConventionToDeprPeriod({
                deprMethodId : rec.getValue({fieldId: 'custrecord_altdeprdef_deprmethod'}),
                convention : rec.getValue({fieldId: 'custrecord_altdeprdef_convention'}) })) {
                uiDialog.alert({message : this.messages.ALERT_IMPROPER_CONVENTION});
                return false;
            }
        }
        else if (name === 'custrecord_altdeprdef_accountingbook') {
            var aBookId = rec.getValue({fieldId: 'custrecord_altdeprdef_accountingbook'});
            if(aBookId) {
                if (!isMB) {
                    uiDialog.alert({message : this.messages.ALERT_MULTIBOOK_DISABLED});
                    return false;
                }
                
                var acctgBookInfo = module.getAcctgBookInfo(aBookId);
                if(acctgBookInfo.isprimary == true) {
                    uiDialog.alert({message : this.messages.ALERT_PRIMARY_BOOK});
                    return false;
                }
                else if(acctgBookInfo.status[0].value != 'ACTIVE') {
                    uiDialog.alert({message : this.messages.ALERT_PENDING_BOOK});
                    return false;
                }
            }
        }
        
        return true;
    };
    
    module.postSourcing = function(context){
        module.setDefaults(context.currentRecord, context.fieldId);
        module.disableFields(context.currentRecord);
    };
    
    module.disableFields = function(rec) {
        var disableFlag = !rec.getValue({fieldId: 'custrecord_altdeprdef_override'});
        
        rec.getField({fieldId: 'custrecord_altdeprdef_deprmethod'}).isDisabled = disableFlag;
        rec.getField({fieldId: 'custrecord_altdeprdef_convention'}).isDisabled = disableFlag;
        rec.getField({fieldId: 'custrecord_altdeprdef_lifetime'}).isDisabled = disableFlag;
        rec.getField({fieldId: 'custrecord_altdeprdef_financialyear'}).isDisabled = disableFlag;
        rec.getField({fieldId: 'custrecord_altdeprdef_periodconvention'}).isDisabled = disableFlag;
    };
    
    module.displaySubsidiary = function(rec) {
        if (isOW) {
            var subList = [];
            var altMethod = rec.getValue({fieldId: 'custrecord_altdeprdef_altmethod'});
            
            if (altMethod) {
                var altMetRec = record.load({ type : 'customrecord_ncfar_altmethods', id : altMethod});
                subList = altMetRec.getValue({ fieldId : 'custrecord_altmethodsubsidiary' });
            }
            rec.setValue({fieldId: 'custrecord_altdeprdef_subsidiary', value: subList});
        }
    };
    
    module.setDefaults = function (rec, name) {
        if (!rec.getValue({fieldId: 'custrecord_altdeprdef_financialyear'})){
            rec.setValue({fieldId: 'custrecord_altdeprdef_financialyear', value: constList.MonthNames.January})
        }

        if (!rec.getValue({fieldId: 'custrecord_altdeprdef_periodconvention'})){
            rec.setValue({fieldId: 'custrecord_altdeprdef_periodconvention', value: constList.Conventions.None})
        }

        if (name == 'custrecord_altdeprdef_altmethod') {
            module.displaySubsidiary(rec);
        }
    };
    
    module.getAcctgBookInfo = function(aBookId){
        var acctgBookInfo = {};
        if (this.acctgBookCache[aBookId]) {
            acctgBookInfo = this.acctgBookCache[aBookId];
        }
        else {
            acctgBookInfo = search.lookupFields({
                type: 'accountingbook',
                id: aBookId,
                columns: ['isprimary', 'status']
            });
            
            this.acctgBookCache[aBookId] = acctgBookInfo;
        }
        
        return acctgBookInfo;
    };
    
    return module;
});