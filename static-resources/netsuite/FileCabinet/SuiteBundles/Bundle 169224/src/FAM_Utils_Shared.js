/**
 * � 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }
/* Depreciation Period */
var DEPR_PERIOD_MONTHLY = '1';
var DEPR_PERIOD_ANNUALLY = '2';
// implemented as an object as member functions should have no dependency of each other
FAM.Util_Shared = {
    /**
     * Checks duplicate Alternate Methods from the same Parent Rec and Accounting Book
     *
     * Parameters:
     *     parentRec: asset/assetType/assetProposal
     *     parentId: parent field id
     *     altDepId: alternate method id
     *     acctBookId: accounting book id
     *     recId: record Id
     * Returns:
     *     boolean
    **/
    Date: {
        computeEndDate: function(sDate, life, period) {
            var endDate,            
                startDate = (sDate instanceof Date) ? sDate : nlapiStringToDate(sDate),
                lifetime = parseInt(life, 10);

            if (lifetime <= 0) { return startDate; }
            
            if (period == DEPR_PERIOD_ANNUALLY) {
                endDate = new Date(startDate.getFullYear() + lifetime, startDate.getMonth(), startDate.getDate() - 1);
            }
            else {
                endDate = new Date(startDate.getFullYear(), startDate.getMonth() + lifetime, startDate.getDate() - 1);
            }
            
            return endDate;
        },
        
        computeAl: function(sDate, eDate, depPeriod) {
            var startDate = (sDate instanceof Date) ? sDate : nlapiStringToDate(sDate),
                endDate   = (eDate instanceof Date) ? eDate : nlapiStringToDate(eDate);

            var al = (endDate.getMonth() - startDate.getMonth()) +
                    ((endDate.getFullYear() - startDate.getFullYear()) * 12);
            if((startDate.getDate() - endDate.getDate() > 1)
                    && al > 0){
                // subtract al since enddate did not reach a full 30 date difference
                al--;
            }
            else if(startDate.getDate() == 1 &&
                    (endDate.getDate() == this.getEndOfMonth(endDate).getDate())){
                // additional al if the date coverage covers an entire month
                al++;
            }
            if(depPeriod == DEPR_PERIOD_ANNUALLY){
                al = Math.floor(al/12);
            }
            return (al >= 0) ? al : 0;
        },
        
        getEndOfMonth : function (sourceDate) {
            var dateObj = typeof sourceDate === 'string' ?
                nlapiStringToDate(sourceDate) : sourceDate;
            
            return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
        },

        /**
         * Check value is valid date object
         * @param s value to check
         * @returns {boolean} Returns true when value is an instance of date object, otherwise returns false.
         */
        isDate: function(s) {
            var isdate=false;try{var t=s.getTime();if(t){isdate=true;}}catch(e){}return isdate;
        },

        /**
         * Check value is valid string date
         * @param s value to check
         * @returns {boolean} Returns true when value is an instance of date object, otherwise returns false.
         */
        isDateString: function(s) {
            var isdatestring=false;try{var t=(nlapiStringToDate(s)).getTime();if(t){isdatestring=true;}}catch(e){}return isdatestring;
        },
        
        computeForecastDate : function (startDate, lastDeprDate) {
            var lastForecastDate;
            
            if (startDate > lastDeprDate) {
                lastForecastDate = new Date(startDate.getFullYear(), startDate.getMonth(),
                    startDate.getDate() - 1);
            }
            else {
                lastForecastDate = lastDeprDate;
            }
            
            return lastForecastDate;
        }
    },

    Math: {
        roundByCurrency: function(N,Curr,IntCurr){
            if( Curr && IntCurr && (IntCurr.indexOf(Curr) != -1) )
                return Math.round(N);
            else
                return this.roundToDec(N);
        },

        roundToDec: function(num){
            return Math.round(num*100.00) / 100.00;
        },

        parseInt: function(stringValue, defaultValue) {
            var retVal = parseInt(stringValue, 10);
            return  isNaN(retVal) ? defaultValue : retVal;
        },
        
        roundByPrecision: function(num, prcn) {
            var prcn = prcn || 0;
            var roundedNum = +(Math.round(num + 'e+' + prcn) + 'e-' + prcn);
            return roundedNum;
        },

    },

    String: {
        injectMessageParameter: function(strVar, param){
            var returnValue = strVar;

            // search pattern to find string to replace
            var paramPattern = /[(]\d[)]/g;


            //Return index of number inserted on string, also contains other non-numeric values
            var paramList = returnValue.match(paramPattern);

            //Replace the original string
            for(i in paramList){
                if (!isNaN(i) && param[i] != null){
                    returnValue = returnValue.replace(paramList[i],param[i]);
                }
            }
            return returnValue;
        },
        
        translateStrings: function(value, pattern, screenName){
            var matches = value.match(pattern);
            if(matches){
                matches = matches.filter(function(item, i, ar){ return ar.indexOf(item) === i; }); //filter unique values
                for(var i = 0;i<matches.length; i++){
                    value = value.replace(new RegExp(matches[i], 'g'), FAM.resourceManager.GetString(matches[i], screenName));
                }
            }
            return value;
        }
    },

    callProcessManager: function(options) {
        var processId = 0, url;
        
        if (options && options.procId) {
            var processRecord = new FAM.ProcessRecord();
            var params = options.params ? JSON.stringify(options.params) : '{}';
            
            try {
                processRecord.createRecord({
                    procId: options.procId,
                    status: FAM.ProcessStatus.Queued,
                    params: params,
                    stateValues: JSON.stringify([])
                });
                processId = processRecord.submitRecord();
                
                url = nlapiResolveURL('SUITELET', 'customscript_fam_triggerprocess_su',
                    'customdeploy_fam_triggerprocess_su', true);
                nlapiRequestURL(url);
            }
            catch (ex) {
                nlapiLogExecution('ERROR', 'FAM_Utils_Shared.callProcessManager', JSON.stringify(ex));
                throw ex;
            }
        }
        
        return processId;
    },
    
    computeNbv: function(amounts, isZeroDp) {
        var nbv = (amounts.acquisition || 0) -
        ((amounts.sale || 0) +
         (amounts.disposals || 0) +
         (amounts.depreciation || 0) +
         (amounts.transfer || 0) +
         (amounts.revaluation || 0) +
         (amounts.writeDown || 0));
        
        return isZeroDp ? Math.round(nbv) : this.Math.roundToDec(nbv);
    },
    
    checkDupAltDep: function (parentRec, parentId, altDepId, acctBookId, isPosting, recId) {
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
        
        var fieldMap = recFieldMap[parentRec];

        //check duplicate Alternate Method using the fieldmap
        if (altDepId > 0) {
            var filters = [
                new nlobjSearchFilter(fieldMap.parentFld, null, 'anyof', parentId),
                new nlobjSearchFilter(fieldMap.altDepFld, null, 'anyof', altDepId),
                new nlobjSearchFilter(fieldMap.acctBookFld, null, 'anyof', acctBookId ||'@NONE@'),
                new nlobjSearchFilter(fieldMap.isPostingFld, null, 'anyof', isPosting),
            ];

            if (recId > 0) {
                filters.push(new nlobjSearchFilter('internalid', null, 'noneof', recId));
            }

            if (nlapiSearchRecord(fieldMap.altDepRec, null, filters) != null) {
                return true;
            }
        }
        return false;
    },

    /**
     * Retrieve Exchange rate for the given currencies
     *
     * Parameters:
     *      oldCurr {integer} - internal id of the previous currency record
     *      newCurr {integer} - internal id of the target currency record
     *      exDate {Date|string} - date transaction for retrieving exchange rate
     * Returns:
     *      {number} - exchange rate between the two currencies
     **/
    getExchangeRate : function (oldCurr, newCurr, exDate) {
        var exRate, dateParam = null;

        if (exDate) {
            dateParam = (exDate instanceof Date) ? nlapiDateToString(exDate) : exDate;
        }

        if (newCurr && oldCurr != newCurr) {
            exRate = nlapiExchangeRate(oldCurr, newCurr, dateParam);
        }

        return exRate || 1;
    },

    /**
     * Retrieves the internal id of the primary accounting book
     *
     * Parameters:
     *     none
     * Returns:
     *     {number} - internal id of the primary accounting book
     *     null - feature disabled / no search results
    **/
    getPrimaryBookId : function () {
        var searchRes;

        if (!FAM.Context.blnMultiBook) {
            return null;
        }

        searchRes = nlapiSearchRecord('accountingbook', null,
            new nlobjSearchFilter('isprimary', null, 'is', 'T'));

        if (searchRes) {
            return searchRes[0].getId();
        }
        return null;
    },

    /**
     * Invoke SuiteletService Request to get currency from Company Information
     *
     * Parameters:
     *     subId {number} - internal id of the subsidiary record
     *     bookId {number} - internal id of the accounting book record
     * Returns:
     *     {number} - internal id of the currency record
     *     null - could not retrieve currency
    **/
    getApplicableCurrencyService : function (subId, bookId) {
        var url = nlapiResolveURL('SUITELET', 'customscript_fam_suiteletservice',
                'customdeploy_fam_suiteletservice'),
            param = {
                func_name : 'FAM.Util_Shared.getApplicableCurrency',
                param : [subId, bookId].join('|')
            },
            response = nlapiRequestURL(url, param);
        return +response.getBody() || null;
    },

    /**
     * Retrieves the currency for the given subsidiary - accounting book combination
     * For Case scenarios, refer to AssetCurrencyMatrix.xls at Issue 286820
     *
     * Parameters:
     *     subId {number} - internal id of the subsidiary record
     *     bookId {number} - internal id of the accounting book record
     * Returns:
     *     {number} - internal id of the currency record
     *     null - could not retrieve currency
    **/
    getApplicableCurrency : function (subId, bookId) {
        var subRec, subLineNum;

        bookId = bookId && bookId + '';
        if (!FAM.Context.blnMultiCurrency) {
            //TODO: Implement Case 1 & 3 SI and OW
            return null;
        }
        else if (FAM.Context.blnMultiBook && bookId && bookId != this.getPrimaryBookId()) {
            if (FAM.Context.blnOneWorld) {
                //Case 8 OW
                //TODO: Add Foreign Currency Management Support (Case 4)
                if (subId) {
                    if (FAM.Context.blnForeignCurrMgmt){
                        subRec = nlapiLoadRecord('subsidiary', subId);
                        subLineNum = subRec.findLineItemValue('accountingbookdetail', 'accountingbook',
                                bookId);
                            return subLineNum > 0 ? subRec.getLineItemValue('accountingbookdetail',
                                'currency', subLineNum) : null;
                    }
                    else{
                        return nlapiLookupField('subsidiary', subId, 'currency');
                    }
                }
                else {
                    return null;
                }
            }
            else {
                //Case 8 SI
                //TODO: Add Foreign Currency Management Support (Case 4)
                if(typeof nlapiLoadConfiguration === 'function') { //getExecutionContext cannot distinguish client script or UE triggered from UI
                    subRec = nlapiLoadConfiguration('companyinformation');
                    subLineNum = subRec.findLineItemValue('accountingbookdetail', 'accountingbook',
                        bookId);
                    return subLineNum > 0 ? subRec.getLineItemValue('accountingbookdetail',
                        'currency', subLineNum) : null;
                }
                else {
                    return this.getApplicableCurrencyService(subId, bookId) || null;
                }
            }
        }
        else if (FAM.Context.blnOneWorld) {
            //CASE 2 OW
            return subId ? nlapiLookupField('subsidiary', subId, 'currency') : null;
        }
        else {
            //CASE 2 SI
            if(typeof nlapiLoadConfiguration === 'function') {
                subRec = nlapiLoadConfiguration('companyinformation');
                return subRec.getFieldValue('basecurrency');
            }
            else {
                return this.getApplicableCurrencyService(subId, bookId) || null;
            }
        }
    },
    
    getPrecision : function(currencyId) {
        try {
            // avoid exception if currency id is still undefined
            if (currencyId) {
                var currency = nlapiLoadRecord('currency',currencyId);
                return currency.getFieldValue('currencyprecision');
            }
            else {
                nlapiLogExecution('DEBUG','FAM_Utils_Shared.getPrecision','Currency Id not specified. Defaulting to precision 2.');
                return 2;
            }
        } catch (e) {
            nlapiLogExecution('DEBUG','FAM_Utils_Shared.getPrecision','Defaulting to precision 2. Exception: ' +  e);
            return 2; // Default to 2 decimal places
        }
    },
    
    /**
     * Validates if the Subsidiary and Book ID is a valid combination
     * Parameters:
     *     subId {number} - internal id of the subsidiary record
     *     bookId {number} - internal id of the accounting book record
     * Returns:
     *     boolean - TRUE if valid, FALSE if not
     */
    isValidSubsidiaryBookId : function (subId, bookId){
        if(FAM.Context.blnOneWorld) {
            // Selected accounting book subsidiary
            // Could not fetch this value via nlapiLookupField or via search hence we used load record.
            var recBook = nlapiLoadRecord('accountingBook', bookId);
            if(recBook) {
                var filters = [new nlobjSearchFilter('internalid', null, 'is', bookId),
                               new nlobjSearchFilter('subsidiary', null, 'anyof', [subId])],
                    columns = [new nlobjSearchColumn('subsidiary')];
                var results  = nlapiSearchRecord('accountingbook', null, filters, columns);
                
                if (!results){
                    return false;
                }
            }
            
        }
        return true;
    },
    
    /**
     * Validates if the Subsidiary and record is a valid combination
     * Parameters:
     *     subId {number} - internal ID of the subsidiary record
     *     recordType {string} - record type of the record to check the subsidiary of
     *     recordId {number} - internal ID of the record
     *     
     * Returns:
     *     boolean - TRUE if valid, FALSE if not
     */
    isValidSubsidiaryRecCombination : function (subId, recordType, recordId){
        if(FAM.Context.blnOneWorld) {
            // Check if record is existing before search to prevent fake false
            if(FAM.Util_Shared.isRecordExisting(recordType, recordId)) {
                var filters = [new nlobjSearchFilter('internalid', null, 'is', recordId),
                               new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                               new nlobjSearchFilter('subsidiary', null, 'anyof', [subId])],
                    columns = [new nlobjSearchColumn('subsidiary')];
                var results  = nlapiSearchRecord(recordType, null, filters, columns);
                
                if (!results){
                    return false;
                }
            }
        }
        return true;
    },
    
    /**
     * Validates if the record is existing
     * Parameters:
     *     recType {string} - record type of the record to check the subsidiary of
     *     recId {number} - internal ID of the record
     *     
     * Returns:
     *     boolean - TRUE if valid, FALSE if not
     */
    isRecordExisting : function (recType, recId) {
        try {
            return Boolean(nlapiLoadRecord(recType, recId))
        } catch (e) {
            nlapiLogExecution("DEBUG", "FAM_Utils_Shared.isRecordExisting",
                "type: " + recType + " recId: " + recId
                + " is not existing.");
            return false;
        }
    },
    
    /**
     * Retrieves the Accounting Books used in all of the asset's FAM-Alternate Depreciation records.
     *
     * Parameters:
     *     assetId {number} - internal id of the asset record
     * Returns:
     *     {number[]} - array of unique accounting book record internal ids
     */
    getTaxMethodBookIds : function (assetId) {
        var i, col, fil, results, bookIds = [];

        if (!assetId || !FAM.Context.blnMultiBook) {
            return bookIds;
        }

        fil = [
            new nlobjSearchFilter('custrecord_altdeprasset', null, 'is', assetId),
            new nlobjSearchFilter('custrecord_altdepr_accountingbook', null, 'noneof', '@NONE@'),
            new nlobjSearchFilter('isinactive', null, 'is', 'F')
        ];

        col = new nlobjSearchColumn('custrecord_altdepr_accountingbook', null, 'group');

        results = nlapiSearchRecord('customrecord_ncfar_altdepreciation', null, fil, col);

        if (results) {
            for (i = 0; i < results.length; i++) {
                bookIds.push(results[i].getValue('custrecord_altdepr_accountingbook', null, 'group'));
            }
        }

        return bookIds;
    },

    /**
     * Checks if the Accounting Books are associated with the Subsidiary. This is used in Asset Transfer validation.
     * Looks up Subsidiary > accountingbookdetail sublist if available. Otherwise, it looks up
     * Accounting Book > Subsidiary multiselect field through FAM.Util_Shared.isValidSubsidiaryBookId
     *
     * Parameters:
     *     bookIds {number[]} - internal ids of the accountingbook record
     *     subsidiaryId {number} - internal id of the subsidiary record
     * Returns:
     *     {boolean} - true: if all the accounting books in the parameter are associated with the subsidiary
     *                       if the bookid array parameter contains nothing
     *                       if the account doesn't have Multibook feature
     *                       if account is single instance
     *                 false: if at least one accounting book is not associated with the subsidiary
     *                        if either parameter is null
     */
    isValidSubsidiaryBooks : function(subsidiaryId, bookIds) {
        if (!(bookIds instanceof Array) || !subsidiaryId){
            return false;
        }

        if(!FAM.Context.blnMultiBook || !FAM.Context.blnOneWorld || bookIds.length == 0){
            return true;
        }

        var subsidiaryRec = nlapiLoadRecord('subsidiary', subsidiaryId);
        var isBookSublistExists = (subsidiaryRec.getAllLineItemFields('accountingbookdetail') != null);
        // accountingbookdetail exists on subsidiary record
        if (isBookSublistExists) {
            var bookSublistCount = subsidiaryRec.getLineItemCount('accountingbookdetail');
            
            if (bookSublistCount < bookIds.length){
                return false;
            }
            else {
                for (var i = 0; i < bookIds.length; i++) {
                    if(subsidiaryRec.findLineItemValue('accountingbookdetail', 'accountingbook', bookIds[i]) == -1) {
                        return false;
                    }
                }
                return true;
            }
        }
        // no accountingbookdetail sublist on subsidiary record, use accounting book record
        else {
            for (var i = 0; i < bookIds.length; i++) {
                if(!FAM.Util_Shared.isValidSubsidiaryBookId(subsidiaryId, bookIds[i])) {
                    return false;
                }
            }
            return true;
        }
    },

    /**
     * Validates subsidiary and alternate method compatibility
     *
     * Parameters:
     *     assetId {number} - internal id of the asset to check
     *     subId {number} - internal id of the subsidiary to check
     * Returns:
     *     {boolean} - compatible or not
    **/
    compatibleSubAndMethods : function (assetId, subId) {
        var filters = [
            new nlobjSearchFilter('custrecord_altdeprasset', null, 'is', assetId),
            new nlobjSearchFilter('custrecord_altmethodsubsidiary', 'custrecord_altdepraltmethod',
                'noneof', subId),
            new nlobjSearchFilter('isinactive', null, 'is', 'F')
        ];

        if (nlapiSearchRecord('customrecord_ncfar_altdepreciation', null, filters)) {
            return false;
        }

        return true;
    },

    /**
     * Validates if the Subsidiary and Alternate Method is a valid combination
     * Parameters:
     *     subId {number} - internal id of the subsidiary record
     *     altMethId {number} - internal id of the Alternate Method
     * Returns:
     *     boolean - TRUE if valid, FALSE if not
     */
    isValidSubsidiaryAltMethod: function (subId, altMethId){
        var altMethodSub = nlapiLookupField('customrecord_ncfar_altmethods', altMethId, 'custrecord_altmethodsubsidiary');
        if(altMethodSub.indexOf(subId) == -1) {
            return false;
        }
        return true;
    },

    /**
     * Retrieves the FAM - Asset Transfer Accounts for the Origin and Destination Subsidiary
     * combination. The origin and destination accounts must have values.
     *
     * Parameters:
     *     origSub {number} - internal id of the original subsidiary
     *     destSub {number} - internal id of the new/destination subsidiary
     * Returns:
     *     null - inputs missing; SI account; no accounts found
     *     Object = {
     *         origAcc - origin account
     *         destAcc - destination account
     *     }
    **/
    getTransferAccounts : function (origSub, destSub) {
        if (!origSub || !destSub || !FAM.Context.blnOneWorld) {
            return null;
        }

        var results,
            col = [
                new nlobjSearchColumn('custrecord_xferoriginacc'),
                new nlobjSearchColumn('custrecord_xferdestacc')
            ],
            fil = [
                new nlobjSearchFilter('custrecord_xferoriginsub', null, 'is', origSub),
                new nlobjSearchFilter('custrecord_xferdestsub', null, 'is', destSub),
                new nlobjSearchFilter('custrecord_xferoriginacc', null, 'noneof', '@NONE@'),
                new nlobjSearchFilter('custrecord_xferdestacc', null, 'noneof', '@NONE@'),
                new nlobjSearchFilter('isinactive', null, 'is', 'F')
            ];

        results = nlapiSearchRecord('customrecord_ncfar_transferaccounts', null, fil, col);

        if (results) {
            return {
                origAcc : results[0].getValue('custrecord_xferoriginacc'),
                destAcc : results[0].getValue('custrecord_xferdestacc')
            };
        }

        return null;
    },

    getAssetTypeDefAltDeprAccounts: function(assetTypeId, depMethId, bookId, subId) {
        var accounts = null;

        if(!assetTypeId || !depMethId) return accounts;

        var result,
            filters = [
                new nlobjSearchFilter('custrecord_altdeprdef_assettype', null, 'is', assetTypeId),
                new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                new nlobjSearchFilter('custrecord_altdeprdef_accountingbook', null, 'anyof', bookId || '@NONE@'),
                new nlobjSearchFilter('custrecord_altdeprdef_altmethod', null, 'is', depMethId)
            ],
            columns = [
                    new nlobjSearchColumn('custrecord_altdeprdef_assetaccount'),
                    new nlobjSearchColumn('custrecord_altdeprdef_depraccount'),
                    new nlobjSearchColumn('custrecord_altdeprdef_chargeaccount'),
                    new nlobjSearchColumn('custrecord_altdeprdef_writeoffaccount'),
                    new nlobjSearchColumn('custrecord_altdeprdef_writedownaccount'),
                    new nlobjSearchColumn('custrecord_altdeprdef_disposalaccount'),
            ];

        if(FAM.Context.blnOneWorld) {
            filters.push(new nlobjSearchFilter('custrecord_altdeprdef_subsidiary', null,
                'anyof', subId));
        }

        result = nlapiSearchRecord('customrecord_ncfar_altdeprdef', null, filters, columns);

        if(result) {

            accounts = {
                assetAcct     : result[0].getValue('custrecord_altdeprdef_assetaccount'),
                deprAcct      : result[0].getValue('custrecord_altdeprdef_depraccount'),
                chargeAcct    : result[0].getValue('custrecord_altdeprdef_chargeaccount'),
                writeoffAcct  : result[0].getValue('custrecord_altdeprdef_writeoffaccount'),
                writedownAcct : result[0].getValue('custrecord_altdeprdef_writedownaccount'),
                disposalAcct  : result[0].getValue('custrecord_altdeprdef_disposalaccount')
            };

        }

        return accounts;
    },

    /**
     * Retrieve accounting period details of the date specified.
     *
     * @param {String} sdate The date within any accounting period.
     * @returns {Object} accountingperioddata Return the accounting period details or null.
     */
    getAccountingPeriodByDate: function(sdate) {

        var ret = null;

        if(FAM.Util_Shared.isNullUndefinedOrEmpty(sdate)) return ret;
          // not a date object && not a valid date string
        if(!(FAM.Util_Shared.Date.isDate(sdate) || FAM.Util_Shared.Date.isDateString(sdate))) return ret;

        if(FAM.Util_Shared.Date.isDate(sdate)) {
            sdate = nlapiDateToString(sdate);
        }

        var filters = [];
        filters.push(new nlobjSearchFilter('isyear', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('isquarter', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('startdate', null, 'onorbefore', sdate));
        filters.push(new nlobjSearchFilter('enddate', null, 'onorafter', sdate));

        // add more as needed
        var columns = [];
        columns.push(new nlobjSearchColumn('periodname'));
        columns.push(new nlobjSearchColumn('enddate'));

        var res = nlapiSearchRecord('accountingperiod', null, filters, columns);

        if(res) {
            ret = {
                periodname: res[0].getValue('periodname'),
                enddate   : res[0].getValue('enddate'),
                id		  : res[0].getId()
                // add more as needed
                };
        }

        return ret;
    },

    /**
     * Check value is null, undefined, or empty
     * @param s value to check
     * @returns {boolean} Returns true when value is null, undefined or empty. Otherwise, returns false.
     */
    isNullUndefinedOrEmpty: function(s) {
        return (s=='' || s==null || !s || s==undefined);
    },

    /**
     * Search file
     * @param filename name to search
     * @returns {nlobjFile} Searched result
     */
    searchFile: function(filename) {
        var fil = [new nlobjSearchFilter('name', null, 'is', filename)],
            col = [new nlobjSearchColumn('internalid')],
            res = nlapiSearchRecord('file', null, fil, col),
            fId = null,fileObj = null;

        if(res) {
            fId = res[0].getValue('internalid');
            fileObj = nlapiLoadFile(fId);
        }

        return fileObj;
    },
    /**
     * Parameters:
     *  @assetIds (array)      : assets ids to be searched
     *  @assetFields (array)   : asset column ids to be included in the result [("column"/"join.column")]
     *  @assetFilters (array)  : nlobjFilters
     *  @excludeCompound (bool) : true/false on whether to exclude the compound assets in the result
     *  @taxParam (object)     : parameters in call to getAssetsTaxMethods
     *  @recursion (bool)      : flag to indicate if the current call is a recusion
     */
    getDescendants: function(assetIds, assetFields, assetFilters, 
                             excludeCompound, taxParam, recursion){
        var filters = [], columns = [], 
            compDesc = [], descAssets = {},
            objAsset = {}, objTax = {};

        //construct search
        
        filters = assetFilters?filters.concat(assetFilters):filters;
        filters.push(new nlobjSearchFilter('custrecord_componentof', null, 'anyof', assetIds));
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        
        columns = assetFields.map(function(fld){
                            var col = fld.split('.');
                            if(col.length>1){
                                return new nlobjSearchColumn(col[1],col[0]);
                            }else{
                                return new nlobjSearchColumn(col[0]);
                            }
                        });
        if(assetFields.indexOf('custrecord_is_compound')===-1)
            columns.push(new nlobjSearchColumn('custrecord_is_compound'));

        //process results if any
        var res = nlapiSearchRecord('customrecord_ncfar_asset', null, filters, columns);
        if(res && res.length>0){
            for(var i=0; i<res.length; i++){
                
                if(res[i].getValue('custrecord_is_compound')==='T'){
                    compDesc.push(res[i].getId());
                    if(excludeCompound)
                        continue;
                }
                
                var objVals = {};
                for(var j = 0; j < assetFields.length; j++){
                    objVals[assetFields[j]] = res[i].getValue(columns[j]);
                }
                objAsset[res[i].getId()] = objVals;
            }
        }

        if(compDesc.length>0){
            descAssets = 
                    FAM.Util_Shared.getDescendants(
                                        compDesc, 
                                        assetFields, 
                                        assetFilters, 
                                        excludeCompound, 
                                        taxParam,
                                        true);
            for(var assetId in descAssets){objAsset[assetId] = descAssets[assetId];}
        }
        
        if(!recursion && taxParam){
            var parentAssets = [];
            for(var assetId in objAsset){
                parentAssets.push(assetId);
                objAsset[assetId]['altMethods'] = {};
            }
            
            objTax = 
                FAM.Util_Shared.getAssetsTaxMethods(
                                        parentAssets, 
                                        taxParam.taxFields, 
                                        taxParam.taxFilters,
                                        taxParam.textCol);

            for(var assetId in objTax){
                objAsset[assetId]['altMethods'] = objTax[assetId];
            }
        }

        return objAsset;
    },
    
    getAssetsTaxMethods: function(assetIds, taxFields, taxFilters, textColumns){
        var filters = [], columns = [],
            assetId, taxId, objAssetTax = {};
        
        filters = taxFilters?filters.concat(taxFilters):filters;
        filters.push(new nlobjSearchFilter('custrecord_altdeprasset', null, 'anyof', assetIds));
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        
        columns = taxFields.map(function(fld){
            var col = fld.split('.');
            if(col.length>1){
                return new nlobjSearchColumn(col[1],col[0]);
            }else{
                return new nlobjSearchColumn(col[0]);
            }
        });
        
        if(taxFields.indexOf('custrecord_altdeprasset') === -1)
            columns.push(new nlobjSearchColumn('custrecord_altdeprasset'));
        
        var res = nlapiSearchRecord('customrecord_ncfar_altdepreciation', null, filters, columns);

        if(res && res.length>0){
            for(var i=0; i < res.length; i++){
                assetId = res[i].getValue('custrecord_altdeprasset');
                if(!objAssetTax[assetId]){
                    objAssetTax[assetId] = {};
                }
                
                taxId = res[i].getId();
                objAssetTax[assetId][taxId] = {}; 
                
                for(var j = 0; j < taxFields.length; j++){
                    if(textColumns && textColumns.indexOf(taxFields[j]) !== -1){
                        objAssetTax[assetId][taxId][taxFields[j]] = res[i].getText(columns[j]);
                    }
                    else{
                        objAssetTax[assetId][taxId][taxFields[j]] = res[i].getValue(columns[j]);
                    }
                }
            }
        }
        return objAssetTax;
    },
    
    isAssetCompound : function(id){
        return nlapiLookupField("customrecord_ncfar_asset", 
                id, "custrecord_is_compound") === 'T';
    },
    
    sortObject : function (o, lowerLimit) {
        var sorted = {},
        key, a = [];

        for (key in o) {
            if (+key > +lowerLimit){
                a.push(key);
            }
        }
        a.sort(function(a, b){return a-b});
        for (key = 0; key < a.length; key++) {
            sorted[a[key]] = o[a[key]];
        }
        return sorted;
    },
    
    mergeObject : function (obj1, obj2){
    	for (var p in obj2) {
    	    try {
    	      // Property in destination object set; update its value.
    	      if ( obj2[p].constructor==Object ) {
    	        obj1[p] = this.mergeObject(obj1[p], obj2[p]);

    	      } else {
    	        obj1[p] = obj2[p];

    	      }

    	    } catch(e) {
    	      // Property in destination object not set; create it and set its value.
    	      obj1[p] = obj2[p];

    	    }
    	  }
    	  return obj1;
    }
};

/*TODO: Evaluate migrating FAM.FieldCache.prototype.fieldValue to accept another parameter (recordid)
 *      and do away with recordId parameter in instantiating FAM.FieldCache
* 
 */

/**
 * Class for Caching frequently used fields from common records
 *
 * Parameters:
 *     null || recordId {string} - record internal id of the record type to be cached
**/
FAM.FieldCache = function (recordId) {
    this.recordId = recordId;
    this.values = {};
};

/**
 * [DEPRECATED] Use "fieldValue" Function instead
 * Determines if the record is inactive
 *
 * Parameters:
 *     id {number} - internal id of the record to be checked
 * Returns:
 *     true {boolean} - record is inactive
 *     false {boolean} - record is active
**/
FAM.FieldCache.prototype.isInactive = function (id) {
    if (this.values[id] === undefined) {
        this.values[id] = nlapiLookupField(this.recordId, id, 'isinactive') === 'T';
    }

    return this.values[id];
};

/**
 * Caches the currency for the given subsidiary - accounting book combination
 *
 * Parameters:
 *     subId {number} - internal id of the subsidiary record
 *     bookId {number} - internal id of the accounting book record
 * Returns:
 *     {number} - internal id of the currency record
 *     null - could not retrieve currency
**/
FAM.FieldCache.prototype.getApplicableCurrency = function (subId, bookId) {
    var hashId = ['getApplicableCurrency', subId, bookId].join('-');

    if (this.values[hashId] === undefined) {
        this.values[hashId] = FAM.Util_Shared.getApplicableCurrency(subId, bookId);
    }

    return this.values[hashId];
};

/**
 * Caches the Currency Info. If BookId is supplied, attempts first to retrieve from
 * Accounting Book then from Subsidiary.
 *
 * Parameters:
 *     subId {number} - internal id of the subsidiary to be cached
 *     bookId {number} - (Optional; For tax methods) internal id of accounting book
 * Returns:
 *     currData {object} - currency data object {id:currency id, symbol: ISO symbol}
**/
FAM.FieldCache.prototype.subCurrData = function (subId, bookId) {
    var hashId, currId, currSym;
    
    subId = subId || 1;
    bookId = bookId || null;
    hashId = ['subCurrData', subId, bookId].join('-');
    
    if (this.values[hashId] === undefined) {
        currId = this.getApplicableCurrency(subId, bookId);
        currSym = currId && nlapiLoadRecord('currency', currId).getFieldValue('symbol');

        this.values[hashId] = { currId: currId, currSym: currSym };
    }

    return this.values[hashId];
};

/**
 * Caches the field values
 *
 * Parameters:
 *     id {number} - internal id of the record to be cached
 *     field {String} - id of the field to be cached
 * Returns:
 *     {string} - value of the field
**/
FAM.FieldCache.prototype.fieldValue = function (id, field) {
    if (!id || !field) {
        return null;
    }

    var hashId = id + '-' + field;

    if (this.values[hashId] === undefined) {
        this.values[hashId] = nlapiLookupField(this.recordId, id, field);
    }

    return this.values[hashId];
};

/**
 * Caches Exchange rate for the given currencies
 * Parameters:
 *      oldCurr {integer} - internal id of the previous currency record
 *      newCurr {integer} - internal id of the target currency record
 *      exDate {Date|string} - date transaction for retrieving exchange rate
 * Returns:
 *      {number} - exchange rate between the two currencies
**/
FAM.FieldCache.prototype.getExchangeRate = function (oldCurr, newCurr, exDate) {
    var hashId = ['getExchangeRate', oldCurr, newCurr, exDate].join('-');

    if (this.values[hashId] === undefined) {
        this.values[hashId] = FAM.Util_Shared.getExchangeRate(oldCurr, newCurr, exDate);
    }

    return this.values[hashId];
};

/**
 * Caches and retrieves Exchange rate for cases when subsidiary of accounting books have different
 * currency
 *
 * Parameters:
 *     oldCurr {number} - internal id of the previous currency record
 *     subId {number} - internal id of the target subsidiary record
 *     bookId {number} - internal id of the target accounting book record
 *     exDate {Date} - date to be used in query
 * Returns:
 */
FAM.FieldCache.prototype.exchangeRate = function (oldCurr, subId, bookId, exDate) {
    var hashId, exRate, newCurr;

    if (!oldCurr) {
        nlapiLogExecution('error', 'FAM.FieldCache.prototype.exchangeRate',
            'Missing old currency parameter');
        return null;
    }

    subId = subId || null;
    bookId = bookId || null;
    exDate = exDate || null;
    hashId = ['exchangeRate', oldCurr, subId, bookId, exDate && exDate.toString()].join('-');
    if (this.values[hashId] === undefined) {
        newCurr = this.getApplicableCurrency(subId, bookId);
        exRate = this.getExchangeRate(oldCurr, newCurr, exDate);
        this.values[hashId] = { exRate : exRate, newCurr : newCurr };
    }

    return this.values[hashId];
};

/**
 * Generic function that caches return values from functions.

 * Parameters:
 *      funcname {Arguments} - Argument object. First argument is function to be called. The rest are parameters to Arg[0]
 */

FAM.FieldCache.prototype.funcValCache = function(funcName){
    var ret;
    if(this.values[Array.prototype.slice.call(arguments).join('-')] === undefined){
        ret = eval(funcName).apply(this, Array.prototype.slice.call(arguments,1));
        this.values[Array.prototype.slice.call(arguments).join('-')] = ret;
    }
    return this.values[Array.prototype.slice.call(arguments).join('-')];
};


//ensure compatability in all browsers
if (!Object.keys) Object.keys = function(o) {
    if (o !== Object(o))
      throw new TypeError('Object.keys called on a non-object');
    var k=[],p;
    for (var p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
    return k;
};
