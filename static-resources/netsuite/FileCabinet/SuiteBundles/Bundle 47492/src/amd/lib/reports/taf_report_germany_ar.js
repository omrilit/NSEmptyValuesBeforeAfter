/**
 * Copyright © 2019 Oracle and/or its affiliates. All rights reserved.
 * 
 * @NAPIVersion 2.1
 * @NModuleScope Public
 */ 
  
 
define(['../../adapter/taf_adapter_search',
        '../util/taf_util_environment',
        '../util/taf_util_savedsearch',], repGermanyAr);

function repGermanyAr(search, uEnvironment, uSavedSearch){
    /**
     * prefix - prefix for the resources to be used in the report job
     * baseSearch - report saved search where the sub searches will be based from
     * step - days range for each sub search
     */
    var _repGermanyArConfig = {
                prefix: 'DEAR',
                baseSearch: 'customsearch_taf_de_acctrec_line',
                dateRange: {
                    step: 0, //0 - single day range, 1 - 2 day range, etc
                    groupAllOutOfPeriod: true,
                    prePeriod: 12, //0 - group all transaction BEFORE period, 1 - search for 1 month before period, 2 - search for 2 months before period, etc.
                    postPeriod: 3, //0 - group all transaction AFTER period, 1 - search for 1 month after period, 2 - search for 2 months after period, etc.
                }
            };
    
    
    var module = {};
    module.getReportConfig = function(){
        return _repGermanyArConfig;
    };
    
    module.prepareSavedSearches = function(objRec, perioddata, prefix) {
    	var params = {
    			subIds : objRec.subsidiary,
    			bookId : objRec.bookId,
    			periodIds : perioddata.coveredPeriods
    			};
    	
    	this.multiBookJoinColumn = null;
        if (uEnvironment.isMultiBook() && params.bookId) {
            this.multiBookJoinColumn = 'accountingtransaction';
        }
        
        var oldSearch = search.load({id: _repGermanyArConfig.baseSearch});
        
        var newSearch = search.create({
                            type : oldSearch.searchType,
                            title : prefix,
                            id : 'customsearch_de_taf_ar',
                            isPublic : true});
        var arrSearchSets = [];
        
        newSearch.columns = oldSearch.columns.concat([]);
        
        newSearch.columns[4].label = 'custFirstName';
        newSearch.columns[5].label = 'custLastName';
        newSearch.columns[6].label = 'custId';
        newSearch.columns[7].label = 'custIsIndvidual';
        newSearch.columns[8].label = 'custCoName';
        
        this.addSearchColumns(newSearch.columns, params);
        
        var newFilters = this.createFilterExpression(params);        
        newSearch.filterExpression = newFilters;
                
        arrSearchSets = uSavedSearch.prepareSubSearches(newSearch, perioddata.startDate, perioddata.endDate, _repGermanyArConfig.dateRange);
        
        return arrSearchSets;
    }
    
    module.createFilterExpression = function(params){
        var filters = [], mbc = this.multiBookJoinColumn + '.';
        if (uEnvironment.isOneWorld() && params.subIds) {
            filters.push(['subsidiary', search.getOperator('ANYOF'), params.subIds]);
            filters.push('and');
        }
        if (uEnvironment.isMultiBook() && params.bookId) {
            filters.push([(mbc + 'accountingbook').toString(), search.getOperator('IS'), params.bookId]);
            filters.push('and');
        }
        
        filters.push(['postingperiod', search.getOperator('IS'), params.periodIds]);
        filters.push('and');
        filters.push([(mbc + 'accounttype').toString(), search.getOperator('IS'), 'AcctRec']);
        filters.push('and');
        filters.push('not',
    				[
    					['voided', search.getOperator('IS'), 'F'],
    					'and',
    					[(mbc + 'creditamount').toString(), search.getOperator('ISEMPTY'), ''],
    					'and',
    					[(mbc + 'debitamount').toString(), search.getOperator('ISEMPTY'), '']
    				]);  
        return filters;
    };
    
    module.addSearchColumns = function(oldCols, params){    	
    	oldCols.push(search.createColumn({name: 'debitamount', join: this.multiBookJoinColumn, label: 'debitAmount'}));
        oldCols.push(search.createColumn({name: 'creditamount', join: this.multiBookJoinColumn, label: 'creditAmount'}));
       
        oldCols.push(search.createColumn({name: 'internalid', label : "txnId"}));
        oldCols.push(search.createColumn({name: 'memo', label : "memo"}));
    };
    
    return module; 
};
