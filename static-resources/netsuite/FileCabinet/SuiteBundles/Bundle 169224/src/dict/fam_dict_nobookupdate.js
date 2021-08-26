/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */
define([
    '../adapter/fam_adapter_format',
    '../adapter/fam_adapter_search',
    '../const/fam_const_customlist',
    '../util/fam_util_fprparams',
    '../util/fam_util_search'
], function (format, search, constList, utilFprParams, utilSearch) {
    const PAGE_SIZE = 1000;
    
    var module = {
        desc            : 'No Book - Update',
        type            : 'MAP_REDUCE',
        scriptId        : 'customscript_fam_postdepr_nobook_mr',
        deploymentId    : 'customdeploy_fam_postdepr_nobook_mr',
        displayId       : 'nobookupdate'
    };
    
    module.validator = function(params) {
        params.assetList = utilFprParams.getAssetList(params);
        if (params.recsToProcess && 
            (Object.keys(params.recsToProcess).length == 0 || params.assetList.length == 0)){
            return false;
        }
        
        if (!this.validateParams(params)){
            return false;
        }
        
        var dateInput = format.format({
            value : new Date(+params.date),
            type : format.getType('DATE')
        });
        
        var filterObj = {
            assetTypes : params.assetTypes,
            subs       : params.subs,
            assets     : params.assetList,
            date       : dateInput,
            lastNonPosting : params.lastNonPosting
        };
        var maxId = this.getMaxId(filterObj);
        params.maxTaxId = maxId;

        var ret = maxId > 0;
        if (!ret){
            delete params.assetList;
            delete params.maxTaxId
        }
        return ret;
    };
    
    module.getNextBatch = function(params, fprId) {
        var isRecoveryMode = (params.recoveryMode === 'T');

        var retVal = {
            custscript_postdepr_nobook_fprid: fprId
        };
        if (params.date !== undefined) {
            retVal['custscript_postdepr_nobook_period'] = format.format({
                value : new Date(+params.date),
                type : format.getType('DATE')
            });
        }
        if (params.assetTypes) {
            retVal['custscript_postdepr_nobook_assettype'] = params.assetTypes.join(',');
        }
        if (params.subs) {
            retVal['custscript_postdepr_nobook_subsidiary'] = params.subs.join(',');
        }
        if (params.assetList && params.assetList.length > 0) {
            retVal['custscript_postdepr_nobook_asset'] = params.assetList.join(',');
        }
        if (params.lastNonPosting) {
            retVal['custscript_postdepr_nobook_lastslave'] = params.lastNonPosting;
        }
        if (params.maxTaxId) {
            retVal['custscript_postdepr_nobook_maxslave'] = params.maxTaxId;
        }
        
        return retVal;
    };
    
    module.validateParams = function(params){
        var isValid = true;
        // Depreciation Period
        if (params.date === undefined) {
            isValid = false;
            log.error('MISSING_PARAM', 'Missing required parameter: Date');
        }
        // Asset Type and Subsidiary
        if (!utilSearch.isValidInternalIdFilter(params.assetTypes)) {
            isValid = false;
            log.error('INVALID_FILTER', 'Invalid filter value: Asset Type');
        }
        if (!utilSearch.isValidInternalIdFilter(params.subs)) {
            isValid = false;
            log.error('INVALID_FILTER', 'Invalid filter value: Subsidiary');
        }
        if (!utilSearch.isValidInternalIdFilter(params.assetList)) {
            isValid = false;
            log.error('INVALID_FILTER', 'Invalid filter value: Asset');
        }
        
        return isValid;
    };
    
    module.buildHashDate = function (date){
       if (!date){ return; }
       var dateObj = format.parse({
            value: date,  
            type: format.getType('DATE')
       });            
       var year  = dateObj.getFullYear(),
           month = ('00' + (dateObj.getMonth() + 1)).substr(-2),
           day   = ('00' + dateObj.getDate()).substr(-2);
       return '' + year +  month + day;
    };
   
    module.buildSearchObj = function(filterObj) {
        var assetType = utilSearch.parseCsvToInternalIdArray(filterObj.assetTypes),
            subs = utilSearch.parseCsvToInternalIdArray(filterObj.subs),
            assets = utilSearch.parseCsvToInternalIdArray(filterObj.assets);
        
        /**
         * TODO: In saved search (customsearch_fam_history_search_nobook), if asset / tax status is already covered,
         *          instead of validating slave age < Max DHR (period), use asset/tax status to check if record is already fully depreciated
         *       - This is used to filter out fully depreciated tax (without book) slave
         */
        var searchObj = search.load({ id: 'customsearch_fam_history_search_nobook' });
        
        searchObj.filterExpression = searchObj.filterExpression.concat([
            'and',
            ['custrecord_deprhistassetslave.custrecord_slavelastdeprdate',
                search.getOperator('BEFORE'), filterObj.date]
        ]);
        
        searchObj.filterExpression = searchObj.filterExpression.concat([
            'and',
            ['custrecord_deprhistdate',
                search.getOperator('ONORBEFORE'), filterObj.date]
        ]);
        
        if (assetType && assetType.length > 0) {
            searchObj.filterExpression = searchObj.filterExpression.concat([
                'and',
                ['custrecord_deprhistassettype', search.getOperator('ANYOF'), assetType]
            ]);
        }
        
        if (subs && subs.length > 0) {
            searchObj.filterExpression = searchObj.filterExpression.concat([
                'and',
                ['custrecord_deprhistsubsidiary', search.getOperator('ANYOF'), subs]
            ]);
        }
        
        if (assets && assets.length > 0) {
            searchObj.filterExpression = searchObj.filterExpression.concat([
                'and',
                ['custrecord_deprhistasset', search.getOperator('ANYOF'), assets]
            ]);
        }
        
        if (+filterObj.maxId > 0) {
            searchObj.filterExpression = searchObj.filterExpression.concat([
                'and',
                ['custrecord_deprhistaltdepr.internalidnumber',
                    search.getOperator('BETWEEN'), +filterObj.lastNonPosting + 1 || 0, +filterObj.maxId]
            ]);
        }
        else if (+filterObj.lastNonPosting > 0) {
            searchObj.filterExpression = searchObj.filterExpression.concat([
                'and',
                ['custrecord_deprhistaltdepr.internalidnumber',
                    search.getOperator('GREATERTHAN'), +filterObj.lastNonPosting]
            ]);
        }
        
        return searchObj;
    };
    
    module.getMaxId = function (filterObj) {
        var startTime, searchObj, pagedData, result, maxId = 0;
        
        searchObj = module.buildSearchObj(filterObj);
        startTime = (new Date()).getTime();
        pagedData = searchObj.runPaged({ pageSize : PAGE_SIZE });
        
        result = utilSearch.getResultAtIndex(pagedData, constList.BatchSize.UpdateNoBook - 1);
        if (result) {
            maxId = result.getValue({
                name : 'custrecord_deprhistaltdepr',
                summary : search.getSummary('GROUP')
            });
        }
        
        log.debug('Elapsed time (search history) in ms', ((new Date()).getTime() - startTime));
        return maxId;
    };
    
    return module;
});