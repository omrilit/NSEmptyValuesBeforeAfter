/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */
define([
    '../../adapter/taf_adapter_format',
    '../../adapter/taf_adapter_search',
], utilAccounting);

function utilAccounting(format, search){
    return {
        getAccountingPeriodInfo : function (periodId) {
            var filters = [['internalid', 'is', periodId]],
                columns = ['startdate', 'enddate', 'periodname', 'closed', 
                           'aplocked', 'arlocked', 'alllocked','isadjust',
                           'isquarter', 'isyear'];
                
            var searchObj = search.create({
                type : 'accountingperiod',
                filters : filters,
                columns : columns
            });

            var searchResultSet = searchObj.run();
            
            var searchRes,
                formatDateType = format.getType().DATE;
            
            searchRes = searchResultSet.getRange(0,1);
                
                
            if (searchRes.length > 0) {
                var rec, periodInfo;
                rec = searchRes[0];
                periodInfo = {
                    internalId : rec.id,
                    startDate  : format.parse({ value : rec.getValue('startDate'),
                        type : formatDateType }),
                    endDate    : format.parse({ value : rec.getValue('endDate'),
                        type : formatDateType }),
                    periodName : rec.getValue('periodname'),
                    allClosed  : rec.getValue('closed'),
                    apLocked   : rec.getValue('aplocked' ),
                    arLocked   : rec.getValue('arlocked' ),
                    allLocked  : rec.getValue('alllocked'),
                    isAdjust   : rec.getValue('isadjust'),
                    isQuarter  : rec.getValue('isquarter'),
                    isYear     : rec.getValue('isyear')
                };
            }
            return periodInfo;
        },
        
        getPeriodDates : function (periodFrom, periodTo) {
           var filters = [['internalid', 'anyof', [periodFrom, periodTo]],
                          'and', 
                          ['isinactive', 'is', 'false']],
               columns = [search.createColumn({
                   name: 'startdate',
                   sort: search.getSort().ASC
               }),'enddate'];
           
           var searchObj = search.create({
                   type : 'accountingperiod',
                   filters : filters,
                   columns : columns
               });
                
           var searchRes = searchObj.run().getRange(0,2),
               formatDateType = format.getType().DATE;
           
           if(searchRes.length){
               
               return {
                       startDate : format.parse({ 
                                       value : searchRes[0].getValue(columns[0]),
                                       type : format.getType().DATE }),
                       endDate   : format.parse({ 
                                       value : searchRes[searchRes.length-1].getValue(columns[1]),
                                       type : format.getType().DATE })}
           }
        },
        
        getCoveredPeriods : function(startDate, endDate){
            var formatDateType = format.getType().DATE,
                filters = [['startdate', 'onorafter', 
                                    format.format({
                                            value: startDate, 
                                            type: format.getType().DATE})],
                           'and',
                           ['enddate', 'onorbefore', 
                                    format.format({
                                           value: endDate, 
                                           type: format.getType().DATE})],
                           'and', 
                           ['isinactive', 'is', 'false']],
                columns = [search.createColumn({
                                name: 'startdate',
                                sort: search.getSort().ASC}),
                           'enddate'];
            
            var searchObj = search.create({
                type : 'accountingperiod',
                filters : filters,
                columns : columns
            });
             
            var arrCoveredPeriods = [],
                searchRes = searchObj.run().getRange(0,1000);
            if(searchRes.length){
                for(var i = 0; i < searchRes.length; i++){
                    arrCoveredPeriods.push(searchRes[i].id);
                }
                    
            }
            
            return arrCoveredPeriods;
        },
        
        getReportPeriodData : function(periodFrom, periodTo){
            var reportPeriodData, coveredPeriods;
                
            reportPeriodData = this.getPeriodDates(periodFrom, periodTo);
            reportPeriodData.coveredPeriods = this.getCoveredPeriods(reportPeriodData.startDate, reportPeriodData.endDate);
            
            return reportPeriodData;
        }
    };
};
