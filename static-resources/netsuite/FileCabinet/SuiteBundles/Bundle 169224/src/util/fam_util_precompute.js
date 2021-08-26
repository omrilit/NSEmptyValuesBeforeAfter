/**
 * © 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
*/
define([
    '../adapter/fam_adapter_format',
    '../adapter/fam_adapter_search',
    '../util/fam_util_accounting'
], function (format, search, utilAccntng) {
    
    function createSearchForRecs(params) {
        params = params || {};
        
        var primaryBookId, bookfilter, dateFilter, lastSlaveId = +params.lastSlaveId || 0,
            searchObj = search.load({ id: 'customsearch_fam_assetslave_precalc' });
        
        if (params.maxSlaveId) {
            searchObj.filterExpression = searchObj.filterExpression.concat(['and',
                ['internalidnumber', 'between', lastSlaveId + 1, params.maxSlaveId]]);
        }
        else if (lastSlaveId > 0) {            
            searchObj.filterExpression = searchObj.filterExpression.concat(['and',
                ['internalidnumber', 'greaterthan', lastSlaveId]]);
        }
        
        if (params.assetTypes && params.assetTypes.length > 0) {
            searchObj.filterExpression = searchObj.filterExpression.concat(['and',
                ['custrecord_slaveparentasset.custrecord_assettype', 'anyof', params.assetTypes]]);
        }
        
        if (params.subs && params.subs.length > 0) {
            searchObj.filterExpression = searchObj.filterExpression.concat(['and',
                ['custrecord_slaveparentasset.custrecord_assetsubsidiary', 'anyof', params.subs]]);
        }
        
        if (params.books && params.books.length > 0) {
            bookfilter = [['custrecord_slaveparenttax.custrecord_altdepr_accountingbook', 'anyof',
                params.books.concat(['@NONE@'])]];
            
            primaryBookId = utilAccntng.getPrimaryBookId() + '';
            if (params.books.indexOf(primaryBookId) === -1) {
                bookfilter.push('and', ['custrecord_slaveparenttax', 'noneof', ['@NONE@']]);
            }
            
            searchObj.filterExpression = searchObj.filterExpression.concat(['and', bookfilter]);
        }
        
        if (params.date !== undefined) {
            dateFilter = format.format({
                value : new Date(+params.date),
                type : format.getType('DATE')
            });
            searchObj.filterExpression = searchObj.filterExpression.concat([
                'and', 
                ['custrecord_slaveparentasset.custrecord_assetdeprstartdate', 'onorbefore', 
                    dateFilter],
                'and',
                [
                    ['custrecord_slavelastforecastdate', 'isempty', ''],
                    'or',
                    ['custrecord_slavelastforecastdate', 'before', dateFilter]
                ]
            ]);
        }
        
        return searchObj;
    }
    
    function createSearchForSpecificRecs(params) {
        var lastSlaveId = +params.lastSlaveId || 0,
            searchObj = search.load({ id: 'customsearch_fam_assetslave_catchup' });
    
        if (params.maxSlaveId) {
            searchObj.filterExpression = searchObj.filterExpression.concat([
                 'and',
                 ['internalidnumber', search.getOperator('BETWEEN'), lastSlaveId + 1, params.maxSlaveId]
             ]);
        }
        else if (lastSlaveId > 0) {            
            searchObj.filterExpression = searchObj.filterExpression.concat([
                'and',
                ['internalidnumber', search.getOperator('GREATERTHAN'), lastSlaveId]
            ]);
        }
        
        if (params.date !== '') {
            var dateInput = format.stringToDate(params.date);
            var dateToSQL = 'TO_DATE(\'' + dateInput.getFullYear() + 
                                     '/' + (dateInput.getMonth() + 1) +
                                     '/' + dateInput.getDate() + '\', \'yyyy/mm/dd\')';
            
            // Can't seem to make concatenation (using +) work 
            var dateFormula = "formulanumeric : CASE WHEN {custrecord_slaveparenttax} IS NULL THEN ";
            dateFormula = dateFormula.concat(dateToSQL);
            dateFormula = dateFormula.concat(" - {custrecord_slaveparentasset.custrecord_assetdeprstartdate} ELSE ");
            dateFormula = dateFormula.concat(dateToSQL);
            dateFormula = dateFormula.concat(" - {custrecord_slaveparenttax.custrecord_altdeprstartdeprdate} END");
            
            searchObj.filterExpression = searchObj.filterExpression.concat([
                'and',
                ['custrecord_slavelastdeprdate', search.getOperator('BEFORE'), params.date],
                'and',
                [dateFormula, search.getOperator('GREATERTHANOREQUALTO'), 0]
            ]);
        }
        
        searchObj.filterExpression = searchObj.filterExpression.concat(['and',
                ['custrecord_slaveparentasset', search.getOperator('ANYOF'), params.recsToProcess]]);
        
        return searchObj;
    }
        
    return {
        createSearchForRecs : createSearchForRecs,
        createSearchForSpecificRecs : createSearchForSpecificRecs
    };
});
