/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 */
define([
    '../adapter/fam_adapter_format',
    '../adapter/fam_adapter_search',
    '../const/fam_const_customlist',
    '../util/fam_util_accounting',
    '../util/fam_util_precompute',
    '../util/fam_util_systemsetup'
], function (format, search, constList, utilAcct, utilPreCompute, utilSetup) {
    
    var searchPage = 1000,
        periodsPerBatch = 600000,
        recPerSearchBatch = 100;
    
    /**
     * Checks whether pre-computation process is needed, max id will be retrieved which will be
     * used in batching
     * 
     * @param {Object} params - optional parameters of this process
     * @returns {Boolean} - if pre-computation is still needed or not
    **/
    function validator (params) {
        log.debug('pre-computation validator params', JSON.stringify(params));
        
        params = params || {};
        
        if (!params.date && utilSetup.getSetting('isFollowAcctngPeriod'))
            params.date = utilAcct.getLastPeriodEndDate().getTime();
        
        var maxSlaveId = getMaxIdForNextBatch(params);
        
        if (maxSlaveId) {
            params.maxSlaveId = maxSlaveId;
            return true;
        }
        
        return false;
    }
    
    /**
     * Retrieves the max id of the record that can be included in the batch
     *
     * @param {Object} params - optional parameters of this process
     * @returns {number} - max internal id of the record that can be included in the batch
    **/
    function getMaxIdForNextBatch(params) {
        var i, results, numPeriods, maxSlaveId = 0, start = 0, end = 0, totalPeriods = 0,
            resultSet = searchRecsForPreCalc(params);
        
        do {
            start = end;
            end = start + searchPage;
            
            results = resultSet.getRange({ start : start, end : end }) || [];
            
            for (i = 0; i < results.length; i++) {
                numPeriods = +results[i].getValue(resultSet.columns[1]);
                if (totalPeriods + numPeriods > periodsPerBatch) {
                    break;
                }
                totalPeriods += numPeriods;
                maxSlaveId = results[i].getValue(resultSet.columns[0]);
            }
            
        } while(results.length > 0 && totalPeriods < periodsPerBatch);
            
        return maxSlaveId;
    }
    
    /**
     * Searches for records that needs to be pre-computed
     *
     * @param {Object} params - optional parameters of this process
     * @returns {search.ResultSet} - search results
    **/
    function searchRecsForPreCalc(params) {
        var dateInput, dateToSQL, periodCountOptions, periodCountColumn,
            searchSummary = search.getSummary(),
            searchObj = utilPreCompute.createSearchForRecs(params);
            
        periodCountOptions = [
            constList.BatchSize.PreCalcPeriod,
            'MONTHS_BETWEEN(' +
                'NVL(' +
                    '{custrecord_slaveparentasset.custrecord_assetdeprenddate},' + 
                    'ADD_MONTHS(' +
                        '{custrecord_slaveparentasset.custrecord_assetdeprstartdate},' +
                        '{custrecord_slaveparentasset.custrecord_assetlifetime}' +
                    ')' +
                '),' +
                'NVL(' +
                    '{custrecord_slavelastforecastdate},' +
                    '{custrecord_slaveparentasset.custrecord_assetdeprstartdate}' +
                ')' +
            ') + 1',
            'MONTHS_BETWEEN(' +
                'NVL(' +
                    '{custrecord_slaveparentasset.custrecord_assetdeprenddate},' + 
                    'ADD_MONTHS(' +
                        '{custrecord_slaveparentasset.custrecord_assetdeprstartdate},' +
                        '{custrecord_slaveparentasset.custrecord_assetlifetime}' +
                    ')' +
                '),' +
                '{custrecord_slaveparentasset.custrecord_assetdeprstartdate}' +
            ') + 1'
        ];

        if (params.date !== undefined) {
            dateInput = new Date(+params.date);
            dateToSQL = 'TO_DATE(\'' + dateInput.getFullYear() + '/' + (dateInput.getMonth() + 1) +
                '/' + dateInput.getDate() + '\', \'yyyy/mm/dd\')';
            
            periodCountOptions.push('MONTHS_BETWEEN(' + dateToSQL +
                ',{custrecord_slaveparentasset.custrecord_assetdeprstartdate}) + 1');
            periodCountOptions.push('MONTHS_BETWEEN(' + dateToSQL +
                ',NVL({custrecord_slavelastforecastdate},' +
                '{custrecord_slaveparentasset.custrecord_assetdeprstartdate})) + 1');
        }
        
        periodCountColumn = 'LEAST(' + periodCountOptions.join(',') + ')';
        
        searchObj.columns = [
            { name : 'internalid', summary : searchSummary.MAX, sort : search.getSort().ASC },
            { name : 'formulanumeric', summary : searchSummary.SUM, formula : periodCountColumn },
            { name : 'formulanumeric', summary : searchSummary.GROUP,
                formula : 'CEIL({internalid} / ' + recPerSearchBatch + ')' }
        ];
        
        return searchObj.run();
    }
    
    /**
     * Retrieves the script parameters that will define the next batch
     * 
     * @param {Object} params - optional parameters of this process
     * @param {number} id - FAM Process Record ID
     * @returns {Object} Script parameters
    **/
    function getNextBatch(params, id) {
        log.debug('pre-calc getNextBatch params', JSON.stringify(params));
        
        var dateFilter, lastSlaveId, maxSlaveId = 0, assetTypes = '', subs = '', books = '', 
            scriptParams = null;
        
        if (params && id) {
            if (params.assetTypes && params.assetTypes.length > 0) {
                assetTypes = params.assetTypes.join(',');
            }
            if (params.subs && params.subs.length > 0) {
                subs = params.subs.join(',');
            }
            if (params.books && params.books.length > 0) {
                books = params.books.join(',');
            }
            if (params.maxSlaveId) {
                maxSlaveId = params.maxSlaveId;
                delete params.maxSlaveId; // added value, so delete upon use
            }
            lastSlaveId = +params.lastSlaveId || 0;
            if (params.date === undefined) {
                dateFilter = '';
            }
            else {
                dateFilter = format.format({
                    value : new Date(+params.date),
                    type : format.getType('DATE')
                });
            }

            scriptParams = {
                custscript_precalc_maxdate : dateFilter, // string; should be date but doesn't work
                custscript_precalc_assettype : assetTypes,
                custscript_precalc_subsidiary : subs,
                custscript_precalc_book : books,
                custscript_precalc_is_ondemand : params.ondemand,
                custscript_precalc_slaveid : lastSlaveId,
                custscript_precalc_maxslaveid : maxSlaveId,
                custscript_precalc_fprid : id
            };
        }
        
        return scriptParams;
    }
    
    return {
        desc : 'Pre-calc Map/Reduce',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_precalc_mr',
        deploymentId : 'customdeploy_fam_precalc_mr',
        interruptibleBy : 'all',
        displayId : 'precompute',
        validator : validator,
        getNextBatch : getNextBatch
    };
});
