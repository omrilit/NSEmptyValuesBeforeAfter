/**
 * Copyright © 2019 Oracle and/or its affiliates. All rights reserved.
 * 
 * @NAPIVersion 2.1
 * @NModuleScope Public
 */ 
  
 
define(['../../adapter/taf_adapter_search',
        '../util/taf_util_environment',
        '../util/taf_util_savedsearch',], repGermany);

function repGermany(search, uEnvironment, uSavedSearch){
    /**
     * prefix - prefix for the resources to be used in the report job
     * baseSearch - report saved search where the sub searches will be based from
     * step - days range for each sub search
     */
    var _repGermanyConfig = {
                prefix: 'DEGL',
                baseSearch: 'customsearch_de_taf_glline',
                dateRange: {
                    step: 0, //0 - single day range, 1 - 2 day range, etc
                    groupAllOutOfPeriod: true,
                    prePeriod: 12, //0 - group all transaction BEFORE period, 1 - search for 1 month before period, 2 - search for 2 months before period, etc.
                    postPeriod: 3, //0 - group all transaction AFTER period, 1 - search for 1 month after period, 2 - search for 2 months after period, etc.
                }
            };
    
    var module = {};
    module.getReportConfig = function(){
        return _repGermanyConfig;
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
        
        var oldSearch = search.load({id: _repGermanyConfig.baseSearch});
        
        var newSearch = search.create({
                            type : oldSearch.searchType,
                            title : prefix,
                            id : 'customsearch_de_taf_gl',
                            isPublic : true});
        var arrSearchSets = [];
        
        newSearch.columns = oldSearch.columns.concat([]);
        this.addSearchColumns(newSearch.columns, params);
        
        var newFilters = this.createFilterExpression(params, false);        
        newSearch.filterExpression = newFilters;
                
        arrSearchSets = uSavedSearch.prepareSubSearches(newSearch, perioddata.startDate, perioddata.endDate, _repGermanyConfig.dateRange);
        
        //invoice search
        var invoiceSearch = search.create({
            type : oldSearch.searchType,
            title : prefix,
            id : 'customsearch_de_taf_gl_i',
            isPublic : true});
        
        var invArrSearchSets = [];
        
        invoiceSearch.columns = oldSearch.columns.concat([]);
        this.addSearchColumns(invoiceSearch.columns, params);
        
        var invoiceFilters = this.createFilterExpression(params, true);        
        invoiceSearch.filterExpression = invoiceFilters;
        
        var invArrSearchSets = uSavedSearch.prepareSubSearches(invoiceSearch, perioddata.startDate, perioddata.endDate, _repGermanyConfig.dateRange);
        
        return arrSearchSets.concat(invArrSearchSets);
    }
    
    module.createFilterExpression = function(params, isInvoice){
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
        filters.push(['accounttype', search.getOperator('NONEOF'), '@NONE@']);
        filters.push('and');
        filters.push('not',
    				[
    					['voided', search.getOperator('IS'), 'F'],
    					'and',
    					[(mbc + 'creditamount').toString(), search.getOperator('ISEMPTY'), ''],
    					'and',
    					[(mbc + 'debitamount').toString(), search.getOperator('ISEMPTY'), '']
    				]);
        
        filters.push('and');
        if (isInvoice){        	
        	filters.push([(mbc + 'type').toString(), search.getOperator('ANYOF'), 'CustInvc']);        	        	
        }
        else{        	
        	filters.push([(mbc + 'type').toString(), search.getOperator('NONEOF'), 'CustInvc']);
        }
        
        return filters;
    };
    
    module.addSearchColumns = function(oldCols, params){       
        
        oldCols.push(search.createColumn({name: 'debitamount', join: this.multiBookJoinColumn, label: 'debitAmount'}));
        oldCols.push(search.createColumn({name: 'creditamount', join: this.multiBookJoinColumn, label: 'creditAmount'}));
        oldCols.push(search.createColumn({name: 'internalid', join: "account", label : "accountId"}));
        oldCols.push(search.createColumn({name: 'internalid', label : "txnId"}));
    };
    
    return module; 
};
