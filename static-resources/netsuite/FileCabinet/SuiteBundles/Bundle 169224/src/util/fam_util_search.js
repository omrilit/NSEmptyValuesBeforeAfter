/**
 * � 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * @NModuleScope Public
 */

define(['../adapter/fam_adapter_search',
        ],
    searchUtil);

function searchUtil(search) {
    return {
        /**
         * Search record using runPaged + fetch
         * @param {String} recordType - record type id
         * @param {String} savedSearchId - saved search id
         * @param {Array} filters - array of filter objects
         * @param {Array} columns - array of columns objects
         * 
         * @returns search result
         * 
         */
        searchRecord : function (recordType, savedSearchId, filters, columns){
             var searchRes = [];
            
            var searchObj = null;
            if (savedSearchId){
                searchObj = search.load({ id: savedSearchId });
                
                if (filters && filters.length > 0){
                    searchObj.filters = searchObj.filters ? searchObj.filters.concat(filters) : filters;
                }
                if (columns && columns.length > 0){
                    searchObj.columns = searchObj.columns ? searchObj.columns.concat(columns) : columns;
                }
            }
            else if (recordType) {
                searchObj = search.create({
                    type: recordType,
                    filters : filters,
                    columns : columns
                });
            }
            
            if (searchObj) {
                var pagedData = searchObj.runPaged({pageSize : 1000});
                
                pagedData.pageRanges.forEach(function (pageRange) {
                    var page = pagedData.fetch({ index : pageRange.index });
                    searchRes = searchRes.concat(page.data);
                });
            }
            
            return searchRes;
        },
        
        /**
         * Validates input should have numeric values only
         * 
         * @param input {csv string|Array} - values to check
         * 
         * @returns {Boolean} true if valid, otherwise false
         */
        isValidInternalIdFilter: function(input) {
            var checkVal;
            
            if (!input) return true;
            
            checkVal = typeof input == 'string' ? input : input.join(',');
            checkVal = checkVal.trim();
            
            return (/^[0-9,]*$/.test(checkVal));
        },
        
        /**
         * Splits a csv string to an array
         * 
         * @param csvString - string to convert to array; will return itself if not a string
         * 
         * @returns {Array} internal id array 
         */
        parseCsvToInternalIdArray: function(csvString) {
            var values;
            
            if (!csvString)
                values = [];
            else if (typeof csvString === 'string')
                values = csvString.trim().split(',');
            else
                values = csvString;
            
            return values;
        },
        
        /**
         * Get the array to concatenate to the original filter expression by using either and/or.
         * 
         * @param origFilterExpression - searchObj filter expression
         * @param newFilter - filter to add
         * @param andOr - append via and / or (default: and) 
         * 
         * @returns {Array} exprForConcat - filter expression array to concatenate
         */
        getFilterExpressionForConcat: function(origFilterExpression, newFilter, andOr) {
            var exprForConcat = [];
            
            if (origFilterExpression && newFilter) {
                // defaults to and
                andOr = andOr || 'and';
                
                // adding just 'and' does not work when building filter expression
                if (origFilterExpression.length !== 0) {
                    exprForConcat = exprForConcat.concat([andOr, newFilter]);
                }
                else {
                    exprForConcat = exprForConcat.concat([newFilter]);
                }
            }

            return exprForConcat;
        },
        
        /*
         * Get total number of search results
         * NOTE: This function *replaces* the columns property of the search object.
         *
         * @param {Object} objSearch - search object
         * @returns {integer} the total number of search results
         */
        getTotalRows: function(objSearch) {
            var totalRows = 0;
            
            if (objSearch) {
                // replace columns with internal id count
                objSearch.columns = [
                    search.createColumn({
                        name: 'internalid',
                        summary: search.getSummary().COUNT
                    })
                ];

                var objResult = objSearch.run().getRange(0, 1)[0];
                var rows = objResult.getValue({
                    name: 'internalid',
                    summary: search.getSummary().COUNT}) || 0;

                totalRows = parseInt(rows, 10);
            }
            
            return totalRows;
        },
        
        /**
         * Retrieves the search result specified by index
         * @param pagedData {search.PagedData} - search results
         * @param index {integer} - index of result to retrieve; starts with 0
         * @returns {search.Result} - result at the specified index or last result
         */
        getResultAtIndex : function (pagedData, index) {
            var rangeIndex, retIndex, page, results;
            
            if (pagedData.count === 0) {
                return null;
            }
            else if (pagedData.count > index + 1) {
                rangeIndex = Math.floor(index / pagedData.pageSize);
                retIndex = index % pagedData.pageSize;
            }
            else {
                rangeIndex = pagedData.pageRanges.length - 1;
                retIndex = (pagedData.count - 1) % pagedData.pageSize;
            }
            
            page = pagedData.fetch({ index : pagedData.pageRanges[rangeIndex].index });
            results = page.data;
            
            return results[retIndex];
        }
    };
};
