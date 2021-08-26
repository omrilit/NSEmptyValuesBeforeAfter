/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved..
 * 
 */
define(['../../adapter/taf_adapter_format',
        '../../adapter/taf_adapter_search'], utilSavedSearch);

function utilSavedSearch(format, search){
    return {
        
        prepareSubSearches : function (baseSearchObj, startDate, endDate, dateRange) {
            var currStartDate, currEndDate,subSearchId, 
                arrSearchSets = [];            
            
            if (dateRange.groupAllOutOfPeriod == true){
            	currStartDate = new Date(startDate);
                currEndDate = new Date(endDate);
                subSearchId = '_b0';                
                arrSearchSets.push(this.modifySavedSearch(baseSearchObj, subSearchId,  currStartDate, currEndDate, true));
            }
            else if(!dateRange.prePeriod){
                currStartDate = new Date(startDate);
                currEndDate = new Date(startDate);
                subSearchId = '_b0';
                currStartDate.setFullYear(currStartDate.getFullYear() -1);
                currEndDate.setDate(currEndDate.getDate() - 1);
                arrSearchSets.push(this.modifySavedSearch(baseSearchObj, subSearchId,  currStartDate, currEndDate));
            }
            else{
                currStartDate = new Date(startDate);
                currStartDate.setMonth(currStartDate.getMonth()-dateRange.prePeriod);
                
                for(var i = dateRange.prePeriod; i>=1; i--){
                    currEndDate = new Date(currStartDate);
                    currEndDate.setMonth(currEndDate.getMonth()+1);
                    currEndDate.setDate(currEndDate.getDate()-1);
                    subSearchId = '_b' + i;
                    arrSearchSets.push(this.modifySavedSearch(baseSearchObj, subSearchId,  currStartDate, currEndDate));
                    currStartDate.setMonth(currStartDate.getMonth()+1);
                }
            }
            
            currStartDate = new Date(startDate);
            currEndDate = new Date(startDate);
            currEndDate.setDate(currStartDate.getDate() + dateRange.step);
            
            if(currEndDate > endDate){
                currEndDate = new Date(endDate);
            }
            
            while(currStartDate <= endDate){
                subSearchId = '_d' + currStartDate.getDate();
                arrSearchSets.push(this.modifySavedSearch(baseSearchObj, subSearchId, currStartDate, currEndDate));
                
                currStartDate.setDate(currEndDate.getDate() + 1);
                currEndDate.setDate(currStartDate.getDate() + dateRange.step);
                
                if(currEndDate > endDate){
                    currEndDate = new Date(endDate);
                }
            }
            
            if (dateRange.groupAllOutOfPeriod != true){
	            if(!dateRange.postPeriod){
	                currStartDate = new Date(endDate);
	                currEndDate = new Date(endDate);
	                subSearchId = '_a0';
	                currStartDate.setDate(currStartDate.getDate()+1);
	                currEndDate.setFullYear(currStartDate.getFullYear() + 1);
	                arrSearchSets.push(this.modifySavedSearch(baseSearchObj, subSearchId,  currStartDate, currEndDate));
	            }
	            else{
	                currEndDate = new Date(endDate);
	                for(var i = 1; i <= dateRange.postPeriod; i++){
	                    currStartDate = new Date(currEndDate);
	                    currStartDate.setDate(currStartDate.getDate()+1);
	                    currEndDate.setMonth(currEndDate.getMonth()+1);
	                    subSearchId = '_a' + i;
	                    arrSearchSets.push(this.modifySavedSearch(baseSearchObj, subSearchId,  currStartDate, currEndDate));
	                }
	            }
            }
            return arrSearchSets;
        },

        modifySavedSearch : function (baseSearchObj, subSearchId, startDate, endDate, notWithin){
            var arrFx;
            var newSearch = search.load({id: baseSearchObj.id + subSearchId});
            newSearch.columns = baseSearchObj.columns.concat([]);
            var operator = notWithin ? 'NOTWITHIN' : 'WITHIN'

            arrFx = baseSearchObj.filterExpression.concat([]);
            arrFx.push('and');
            arrFx.push(['trandate', 
                search.getOperator(operator),
                [format.format({value:startDate, type: format.getType('DATE')}),
                 format.format({value:endDate, type: format.getType('DATE')})]]);
            
            newSearch.filterExpression = arrFx;
            
            return newSearch.save();
        }
    };
};
