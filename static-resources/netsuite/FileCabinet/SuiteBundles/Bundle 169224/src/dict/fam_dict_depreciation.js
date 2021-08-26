/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define([
    '../adapter/fam_adapter_file',
    '../adapter/fam_adapter_format',
    '../util/fam_util_fprparams',
    './fam_dict_precalc'
], function getDepreciationDictionary(file, format, utilFprParams, dictPrecalc) {
    var module = {
        Precompute      : {
            desc            : 'On-demand pre-computation',
            type            : 'MAP_REDUCE',
            scriptId        : 'customscript_fam_precalc_mr',
            deploymentId    : 'customdeploy_fam_precalc_mr',
            validator       : dictPrecalc.validator,
            getNextBatch    : dictPrecalc.getNextBatch,
            displayId       : 'ondemandprecompute'
        },
        CreateJournal   : {
            desc            : 'Journal Creation',
            type            : 'MAP_REDUCE',
            scriptId        : 'customscript_fam_createjournal_mr',
            deploymentId    : 'customdeploy_fam_createjournal_mr',
            validator       : this.validator,
            getNextBatch    : this.getNextBatch,
            displayId       : 'journalcreation'
        },
        Batching        : {
            desc            : 'DHR to Asset Slave Mapping',
            type            : 'MAP_REDUCE',
            scriptId        : 'customscript_fam_postdepr_mapdhr_mr',
            deploymentId    : 'customdeploy_fam_postdepr_mapdhr_mr',
            validator       : this.validator,
            getNextBatch    : this.getNextBatch,
            displayId       : 'dhrmapping'
        }
    };
    
    module.CreateJournal.validator = function(params) {
        return params &&
            (!params.recsToProcess || Object.keys(params.recsToProcess).length > 0) &&
            !params.jrnDone;
    };    
    module.CreateJournal.getNextBatch = function (params, fprId) {
        var assetIDs, retVal = {
            custscript_journal_fpr: fprId
        };
        
        assetIDs = utilFprParams.getAssetList(params);
        if (assetIDs.length > 0)
            retVal.custscript_journal_asset = assetIDs.join(',');
        
        if (params.date !== undefined) {
            retVal.custscript_journal_period = format.format({
                value : new Date(+params.date),
                type : format.getType('DATE')
            });
        }
        if (params.assetTypes)
            retVal.custscript_journal_assettype = params.assetTypes.join(',');
        if (params.subs)
            retVal.custscript_journal_subsidiary = params.subs.join(',');
        if (params.books)
            retVal.custscript_journal_book = params.books.join(',');
        if (params.ref)
            retVal.custscript_journal_memo = params.ref;
        if (params.jrnPermit)
            retVal.custscript_journal_prmt = params.jrnPermit;
        
        return retVal;
    };
    
    module.Batching.validator = function (params) {
        return (!params.fileIds && (params.journals && params.journals.length > 0) &&
                params.dhrMappingDone != 'T');
    };    
    module.Batching.getNextBatch = function (params, fprId) {
        var scriptParams = { 
                custscript_postdepr_jrnids : params.journals,
                custscript_postdepr_fprid  : fprId
            };
         
         if (params.recsToProcess && Object.keys(params.recsToProcess).length > 0) {
             var recsToProcess = utilFprParams.getAssetList(params);
             scriptParams.custscript_postdepr_asset = recsToProcess.join(',');
         }

         return scriptParams;
    };

    return module;
});