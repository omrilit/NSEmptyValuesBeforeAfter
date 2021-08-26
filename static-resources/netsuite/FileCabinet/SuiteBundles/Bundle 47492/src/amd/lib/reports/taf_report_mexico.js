/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NAPIVersion 2.1
 * 
 */ 
  
 
define(['../../adapter/taf_adapter_search',
        '../util/taf_util_environment',
        '../util/taf_util_savedsearch',], repMex);

function repMex(search, uEnvironment, uSavedSearch){
    /**
     * prefix - prefix for the resources to be used in the report job
     * baseSearch - report saved search where the sub searches will be based from
     * step - days range for each sub search
     */
    var _repMexConfig = {
                prefix: 'MXJ',
                baseSearch: 'customsearch_taf_mx_journal_lines',
                dateRange: {
                    step: 0, //0 - single day range, 1 - 2 day range, etc
                    prePeriod: 12, //0 - group all transaction BEFORE period, 1 - search for 1 month before period, 2 - search for 2 months before period, etc.
                    postPeriod: 3, //0 - group all transaction AFTER period, 1 - search for 1 month after period, 2 - search for 2 months after period, etc.
                }
            };
    
    
    var module = {};
    module.getReportConfig = function(){
        return _repMexConfig;
    };
    
    module.prepareSavedSearches = function(objRec, perioddata, prefix) {
        var oldSearch = search.load({id: _repMexConfig.baseSearch});
        var newSearch = search.create({
                            type : oldSearch.searchType,
                            title : prefix,
                            id : 'customsearch_taf_mx_journal',
                            isPublic : true});
        var arrSearchSets = [];

        var params = {
                subIds : objRec.subsidiary,
                bookId : objRec.bookId,
                periodIds : perioddata.coveredPeriods
            }
        
        this.multiBookJoinColumn = null;
        if (uEnvironment.isMultiBook() && params.bookId) {
            this.multiBookJoinColumn = 'accountingtransaction';
        }
        
        newSearch.columns = oldSearch.columns.concat([]);
        this.addSearchColumns(newSearch.columns, params);
        
        var newFilters = this.createFilterExpression(params);
        newSearch.filterExpression = newFilters;
        
        arrSearchSets = uSavedSearch.prepareSubSearches(newSearch, perioddata.startDate, perioddata.endDate, _repMexConfig.dateRange);
        
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

        filters.push(['accountingperiod.internalid', search.getOperator('ANYOF'), params.periodIds]);
        filters.push('and');
        filters.push([(mbc + 'posting').toString(), search.getOperator('IS'), 'T']);
        filters.push('and');
        filters.push([(mbc + 'account').toString(), search.getOperator('NONEOF'), '@NONE@']);
        filters.push('and');
        filters.push([[(mbc + 'creditamount').toString(), search.getOperator('GREATERTHAN'), 0],
                     'or',
                      [(mbc + 'debitamount').toString(), search.getOperator('GREATERTHAN'), 0]]);
        return filters;
    };
    
    module.addSearchColumns = function(oldCols, params){
        oldCols.push(search.createColumn({name: 'internalid'}));
        oldCols.push(search.createColumn({name: 'account', join : this.multiBookJoinColumn}));
        oldCols.push(search.createColumn({name: 'accounttype', join : this.multiBookJoinColumn}));
        oldCols.push(search.createColumn({name: 'amount', join : this.multiBookJoinColumn}));
        oldCols.push(search.createColumn({name: 'debitamount', join : this.multiBookJoinColumn}));
        oldCols.push(search.createColumn({name: 'creditamount', join : this.multiBookJoinColumn}));

        if (uEnvironment.isOneWorld()) {
            oldCols.push(search.createColumn({name: 'country', join : 'subsidiary'}));
        }

        if (uEnvironment.hasMXCompliance() || uEnvironment.hasMXLocalization()) {
            oldCols.push(search.createColumn({name: 'custentity_mx_rfc', join : 'vendor', label: 'MX Vendor'}));
            oldCols.push(search.createColumn({name: 'custentity_mx_rfc', join : 'customer', label: 'MX Customer'}));
            oldCols.push(search.createColumn({name: 'custentity_mx_rfc', join : 'employee', label: 'MX Employee'}));
            oldCols.push(search.createColumn({name: 'custbody_mx_payment_method'}));
            oldCols.push(search.createColumn({name: 'custbody_mx_bank_name'}));
            oldCols.push(search.createColumn({name: 'custbody_mx_bank_acct_num'}));
        }

        if (uEnvironment.isGLAuditNumbering()) {
            oldCols.push(search.createColumn({name: 'glnumber', join : this.multiBookJoinColumn}));
        }

        if (uEnvironment.isMultiCurrency()) {
            oldCols.push(search.createColumn({name: 'currency'}));
            oldCols.push(search.createColumn({name: 'exchangerate', join : this.multiBookJoinColumn}));
        }
    };
    return module; 
};
