/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 */

define(['../adapter/fam_adapter_search'],

function (search){
    var module = {};
    
    /**
     * options: {
     *  parentRec
     *  parentId
     *  altDepId
     *  acctBookId
     *  isPosting
     *  recId
     * }
     */
    module.hasDupAltDep = function(options) {
        var recFieldMap = {
            asset : {
                altDepRec : 'customrecord_ncfar_altdepreciation',
                parentFld : 'custrecord_altdeprasset',
                altDepFld : 'custrecord_altdepraltmethod',
                acctBookFld : 'custrecord_altdepr_accountingbook',
                isPostingFld : 'custrecord_altdepr_isposting'
            },
            assetType : {
                altDepRec : 'customrecord_ncfar_altdeprdef',
                parentFld : 'custrecord_altdeprdef_assettype',
                altDepFld : 'custrecord_altdeprdef_altmethod',
                acctBookFld : 'custrecord_altdeprdef_accountingbook',
                isPostingFld : 'custrecord_altdeprdef_isposting'
            },
            assetProposal : {
                altDepRec : 'customrecord_ncfar_altdepr_proposal',
                parentFld : 'custrecord_propaltdepr_propid',
                altDepFld : 'custrecord_propaltdepr_altmethod',
                acctBookFld : 'custrecord_propaltdepr_accountingbook',
                isPostingFld : 'custrecord_propaltdepr_isposting'
            }
        };
    
    
        var fieldMap = recFieldMap[options.parentRec];
        
        if (options.altDepId > 0) {
            var filters = [[fieldMap.parentFld, search.getOperator('ANYOF'), options.parentId], 'and',
                           [fieldMap.altDepFld, search.getOperator('ANYOF'), options.altDepId], 'and',
                           [fieldMap.acctBookFld, search.getOperator('ANYOF'), options.acctBookId ||'@NONE@'], 'and',
                           [fieldMap.isPostingFld, search.getOperator('ANYOF'), options.isPosting]];
            
            if (options.recId > 0) {
                filters.push('and');
                filters.push(['internalid', search.getOperator('NONEOF'), options.recId]);
            }
            
            var searchObj = search.create({
                type: fieldMap.altDepRec,
                filters: filters
            })
            var searchRes = searchObj.run().getRange({ start : 0, end : 1 })
            
            return (searchRes.length > 0);
        }
    }
    
    return module;
});