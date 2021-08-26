/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NScriptType ClientScript
 * @NApiVersion 2.x
 */

define(['../adapter/fam_adapter_runtime',
        '../adapter/fam_adapter_search',
        '../adapter/fam_adapter_ui_dialog',
        '../const/fam_const_customlist',
        '../util/fam_util_altdepr',
        '../util/fam_util_cs',
        '../util/fam_util_deprperiod',
        '../util/fam_util_systemsetup',
        '../util/fam_util_subsidiary'
        ],
    function(runtime, search, uiDialog, constList,
             utilAltDepr, utilCS, utilDeprPeriod, utilSetup, utilSub) {
        var module = {}; 
        
        this.messageIds = {
                ALERT_ALREADY_USED              : 'client_proposalaltdepr_selectbeingused',
                ALERT_ASSET_AL_WARNING          : 'client_altdepr_assetlifetimewarning',
                ALERT_ASSET_AL_ERROR            : 'client_altdepr_assetlifetimeerror',
                ALERT_IMPROPER_CONVENTION       : 'client_altmethod_improperconvention',
                ALERT_MULTIBOOK_DISABLED        : 'client_multibookdisabled',
                ALERT_PRIMARY_BOOK              : 'client_primarybook',
                ALERT_PENDING_BOOK              : 'client_pendingbook',
                ALERT_BOOK_SUBSIDIARY_MISMATCH  : 'client_booksubsidiary_mismatch'
            };
        
        module.messages = {};
        module.acctgBookCache = {};
        module.subsByBook;
        
        module.pageInit = function(context){
            var rec = context.currentRecord;
            module.disableFields(rec);
            
            this.isMB = runtime.isFeatureInEffect({feature :'MULTIBOOK'});
            this.isOW = runtime.isFeatureInEffect({feature :'SUBSIDIARIES'});

            this.messages = utilCS.fetchMessageObj(this.messageIds);
        };
        
        module.saveRecord = function (context) {
            var rec = context.currentRecord;

            //check duplicate Alternate Method
            var hasDupAltMeth = utilAltDepr.hasDupAltDep({
                parentRec: 'assetProposal',
                parentId: rec.getValue({fieldId: 'custrecord_propaltdepr_propid'}),
                altDepId: rec.getValue({fieldId: 'custrecord_propaltdepr_altmethod'}),
                acctBookId: rec.getValue({fieldId: 'custrecord_propaltdepr_accountingbook'}),
                isPosting: rec.getValue({fieldId: 'custrecord_propaltdepr_isposting'}),
                recId: rec.id
            });
            
            if(hasDupAltMeth){
                var printMessage = utilCS.injectMessageParameter(
                        this.messages.ALERT_ALREADY_USED, 
                        [rec.getField('custrecord_propaltdepr_altmethod').label]);
                
                uiDialog.alert({message : printMessage});
                return false;
            }
            
            //Check Alternate Depreciation Method AL against Asset Proposal AL
            var alternateLifeTime = +rec.getValue({fieldId: 'custrecord_propaltdepr_lifetime'}) || 0,
                searchFilter = [['internalid', 'anyof', rec.getValue({fieldId: 'custrecord_propaltdepr_propid'})]],
                searchColumn = ['custrecord_propassetlifetime'];
            
            var searchObj = search.create({
                type: 'customrecord_ncfar_assetproposal',
                filters: searchFilter,
                columns: searchColumn
            });
            
            var searchRes = searchObj.run().getRange({ start : 0, end : 1000 })
            for (var i = 0; i<searchRes.length; i++) {
                var assetTypeLifeTime = +searchRes[0].getValue({name:'custrecord_propassetlifetime'}) || 0;
                
                if (+rec.getValue({fieldId: 'custrecord_propaltdepr_deprperiod'}) === 
                    constList.DeprPeriod.Annually) {

                    //Convert lifetime to monthly units
                    alternateLifeTime *= 12;
                }
                
                if (alternateLifeTime > assetTypeLifeTime) {
                    if (utilSetup.getSetting('isConstrainAssetLifetime') == false) {
                        //notify only as warning since user perference allows it
                        
                        var confirmRes = uiDialog.confirm({message : this.messages.ALERT_ASSET_AL_WARNING, sync: true})
                            .then(function(res) {return res});
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
        
        module.postSourcing = function (context) {
            module.setDefaults(context.currentRecord);
            module.disableFields(context.currentRecord);
        };
        
        module.validateField = function (context) {
            var rec = context.currentRecord,
                name = context.fieldId;
            
            if (name === 'custrecord_propaltdepr_deprmethod' ||
                name === 'custrecord_propaltdepr_convention') {
                if (!utilDeprPeriod.validateConventionToDeprPeriod({
                    deprMethodId : rec.getValue({fieldId: 'custrecord_propaltdepr_deprmethod'}),
                    convention : rec.getValue({fieldId: 'custrecord_propaltdepr_convention'})
                })) {
                    uiDialog.alert({message : this.messages.ALERT_IMPROPER_CONVENTION});
                    return false;
                }
            }
            else if(name === 'custrecord_propaltdepr_accountingbook') {
                var aBookId = rec.getValue({fieldId: 'custrecord_propaltdepr_accountingbook'});
                if(aBookId) {
                    if (!this.isMB) {
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
                    else {
                        subId = rec.getValue({fieldId: 'custrecord_propaltdepr_subsidiary'})
                        if (!this.subsByBook) { this.subsByBook = utilSub.getSubsByBook(); }
                        var subsInBook = this.subsByBook[aBookId] || [];
                        if (subsInBook.indexOf(subId) === -1) {
                            uiDialog.alert({message : this.messages.ALERT_BOOK_SUBSIDIARY_MISMATCH});
                            return false;
                        }
                    }
                }
            }
            return true;
        };
        
        module.fieldChanged = function (context) {
            var rec = context.currentRecord,
                name = context.fieldId;
            
            // Enable/disable Posting checkbox if accounting book has / no value
            if (name === 'custrecord_propaltdepr_accountingbook') {
                rec.getField({fieldId: 'custrecord_propaltdepr_isposting'}).isDisabled = 
                    !rec.getValue({fieldId: 'custrecord_propaltdepr_accountingbook'});
            }
            
            if ((name === 'custrecord_propaltdepr_accountingbook' ||
                 name === 'custrecord_propaltdepr_altmethod') &&
                 rec.getValue({fieldId: 'custrecord_propaltdepr_altmethod'})) {
                
                var propId = rec.getValue({fieldId: 'custrecord_propaltdepr_propid'});
                var assetTypeId  = search.lookupFields({type: 'customrecord_ncfar_assetproposal',
                    id: propId,
                    columns: ['custrecord_propassettype']})['custrecord_propassettype'][0].value;
                
                var filters = [['custrecord_altdeprdef_assettype', search.getOperator('IS'), assetTypeId], 'and',
                               ['isinactive', search.getOperator('IS'), false], 'and',
                               ['custrecord_altdeprdef_accountingbook', search.getOperator('ANYOF'),
                                    rec.getValue({fieldId: 'custrecord_propaltdepr_accountingbook'}) || '@NONE@'], 'and',
                               ['custrecord_altdeprdef_altmethod', search.getOperator('IS'),
                                    rec.getValue({fieldId: 'custrecord_propaltdepr_altmethod'})]];
                if (this.isOW) {
                    var subId = rec.getValue({fieldId: 'custrecord_propaltdepr_subsidiary'});
                    filters.push('and');
                    filters.push(['custrecord_altdeprdef_subsidiary', search.getOperator('ANYOF'), subId]);
                }

                var columns = ['custrecord_altdeprdef_assetaccount',
                               'custrecord_altdeprdef_depraccount',
                               'custrecord_altdeprdef_chargeaccount',
                               'custrecord_altdeprdef_writeoffaccount',
                               'custrecord_altdeprdef_writedownaccount',
                               'custrecord_altdeprdef_disposalaccount',
                               'custrecord_altdeprdef_deprmethod',
                               'custrecord_altdeprdef_convention',
                               'custrecord_altdeprdef_lifetime',
                               'custrecord_altdeprdef_financialyear',
                               'custrecord_altdeprdef_periodconvention',
                               'custrecord_altdeprdef_rv_perc',
                               'custrecord_altdeprdef_depreciationperiod'];
                
                var searchObj = search.create({
                    type: 'customrecord_ncfar_altdeprdef',
                    filters: filters,
                    columns: columns
                });
                
                var searchRes = searchObj.run().getRange({ start : 0, end : 1 });
                if (searchRes.length>0) {
                    rec.setValue({fieldId: 'custrecord_propaltdepr_assetaccount',
                        value: searchRes[0].getValue({name:'custrecord_altdeprdef_assetaccount'})});
                    rec.setValue({fieldId: 'custrecord_propaltdepr_depraccount',
                        value: searchRes[0].getValue({name:'custrecord_altdeprdef_depraccount'})});
                    rec.setValue({fieldId: 'custrecord_propaltdepr_chargeaccount',
                        value: searchRes[0].getValue({name:'custrecord_altdeprdef_chargeaccount'})});
                    rec.setValue({fieldId: 'custrecord_propaltdepr_writeoffaccount',
                        value: searchRes[0].getValue({name:'custrecord_altdeprdef_writeoffaccount'})});
                    rec.setValue({fieldId: 'custrecord_propaltdepr_writedownaccount',
                        value: searchRes[0].getValue({name:'custrecord_altdeprdef_writedownaccount'})});
                    rec.setValue({fieldId: 'custrecord_propaltdepr_disposalaccount',
                        value: searchRes[0].getValue({name:'custrecord_altdeprdef_disposalaccount'})});
                }
                else {
                    log.debug('fam_cs_proposalaltdepr.js',
                        'No Default Values per Book defined with the selected Accounting Book ID: ' +
                        rec.getValue({fieldId: 'custrecord_propaltdepr_accountingbook'}) || null +
                        ' and Alternate Method ID: ' +
                        rec.getValue({fieldId: 'custrecord_propaltdepr_altmethod'}));
                }
            }
        };

        module.setDefaults = function (rec) {
            if (!rec.getValue({fieldId: 'custrecord_propaltdepr_financialyear'})){
                rec.setValue({fieldId: 'custrecord_propaltdepr_financialyear', value: constList.MonthNames.January})
            }

            if (!rec.getValue({fieldId: 'custrecord_propaltdepr_periodconvention'})){
                rec.setValue({fieldId: 'custrecord_propaltdepr_periodconvention', value: constList.Conventions.None})
            }
        };
        
        module.disableFields = function(rec) {
            var disableFlag = !rec.getValue({fieldId: 'custrecord_propaltdepr_override'});
            
            rec.getField({fieldId: 'custrecord_propaltdepr_deprmethod'}).isDisabled = disableFlag;
            rec.getField({fieldId: 'custrecord_propaltdepr_convention'}).isDisabled = disableFlag;
            rec.getField({fieldId: 'custrecord_propaltdepr_lifetime'}).isDisabled = disableFlag;
            rec.getField({fieldId: 'custrecord_propaltdepr_financialyear'}).isDisabled = disableFlag;
            rec.getField({fieldId: 'custrecord_propaltdepr_periodconvention'}).isDisabled = disableFlag;
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
        }

        return module;
});