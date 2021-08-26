/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define([
    '../adapter/fam_adapter_error',
    '../adapter/fam_adapter_search',
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_format',
    '../adapter/fam_adapter_config',
    '../adapter/fam_adapter_runtime',
    './fam_util_systemsetup'
],

function (error, search, record, formatter, config, runtime, fSystemSetup){
    var periodCache = {};
    var periodError = {};
    
    return {
        getPeriodCache : function (){
            return periodCache;
        },        
        setPeriodCache : function(key, value, isRefresh){
            if (isRefresh){
                periodCache = {};
                return;
            }
            periodCache[key] = value;
        },        
        getPeriodError : function (){
            return periodError;
        },        
        setPeriodError : function(key, value, isRefresh){
            if (isRefresh){
                periodError = {};
                return;
            }
            periodError[key] = value;
        },
        
        primaryBookId : null,
        getPrimaryBookId : function () {
            if (!this.primaryBookId) {  // cache in library scope
                this.primaryBookId = '1';
                
                if (runtime.isFeatureInEffect({feature :"MULTIBOOK"})) {
                    var searchObj = search.create({
                        type : record.getType().ACCOUNTING_BOOK,
                        filters : [['isprimary', 'is', 'T']]
                    });
                    var searchResultSet = searchObj.run();
                    var res = searchResultSet.getRange(0,1);
                    if (res && res.length > 0) {
                        this.primaryBookId = res[0].id; 
                    }
                }
            }
            return this.primaryBookId; 
        },
        
        accntngPeriodInfo : null,
        getAccountingPeriodInfo : function () {
            var i, recList = null,
                filters = [['isQuarter', 'is', 'F'], 'and', ['isYear', 'is', 'F']],
                columns = [
                    { name: 'startDate', sort: search.getSort().ASC },
                    'endDate', 'periodname', 'closed', 'aplocked', 'arlocked', 'alllocked',
                    'isAdjust'
                ];
                
            if (this.accntngPeriodInfo)
                return this.accntngPeriodInfo;
            
            var searchObj = search.create({
                type : 'accountingperiod',
                filters : filters,
                columns : columns
            });

            var searchResultSet = searchObj.run();
            
            var res,
                searchLimit = 1000,
                lowerLimit = 0,
                upperLimit = searchLimit,
                searchRes = [],
                formatDateType = formatter.getType().DATE;
            
            do {
                res = searchResultSet.getRange(lowerLimit,upperLimit);
                lowerLimit = upperLimit;
                upperLimit += searchLimit;
                searchRes = searchRes.concat(res);
            } while (res.length === searchLimit)
                
            if (searchRes.length > 0) {
                recList = [];
                for (i = 0; i < searchRes.length; i++) {
                    var rec = searchRes[i];
                    recList.push({
                        internalId : rec.id,
                        startDate  : formatter.parse({ value : rec.getValue('startDate'),
                            type : formatDateType }),
                        endDate    : formatter.parse({ value : rec.getValue('endDate'),
                            type : formatDateType }),
                        periodName : rec.getValue('periodname'),
                        allClosed  : rec.getValue('closed'),
                        apLocked   : rec.getValue('aplocked' ),
                        arLocked   : rec.getValue('arlocked' ),
                        allLocked  : rec.getValue('alllocked'),
                        isAdjust   : rec.getValue('isAdjust')
                    });
                }
                this.accntngPeriodInfo = recList;
            }
            else {
                throw error.create({
                    name : 'NO_PERIOD_INFO',
                    message : 'Unable to retrieve accounting period information'
                });
            }
            return this.accntngPeriodInfo;
        },
        
        getOpenPeriod : function (date) {
            var i = 0, ret, msg, checkAdjust = true,
                periodInfo = this.getAccountingPeriodInfo();
            
            // to clear time element
            date.setHours(0, 0, 0, 0);
    
            if (periodCache[date.getTime()]) {
                ret = periodCache[date.getTime()];
            }
            else if (periodError[date.getTime()]) {
                throw periodError[date.getTime()];
            }
            else {
                ret = new Date(date.getTime());
                
                do {
                    var periodInfoItem = periodInfo[i];
                    var startDate = periodInfoItem.startDate;
                    var endDate = periodInfoItem.endDate;
                    var allClosed = periodInfoItem.allClosed;
                    var allLocked = periodInfoItem.allLocked;
                    var apLocked = periodInfoItem.apLocked;
                    var arLocked = periodInfoItem.arLocked;
                    var isAdjust = periodInfoItem.isAdjust;
                    
                    if (ret.getTime() < startDate.getTime()) {
                        var dateStr = formatter.format({value: ret, type: formatter.getType().DATE});
                        msg = "No accounting period found for " + dateStr;
                        periodError[date.getTime()] = msg;
                        throw msg;
                    }
                    
                    if (ret.getTime() > endDate.getTime()) {
                        i++;
                    }
                    else if (allClosed || allLocked ||
                        (fSystemSetup.getSetting("isCheckApLock") && apLocked) ||
                        (fSystemSetup.getSetting("isCheckArLock") && arLocked) ||
                        (!checkAdjust && isAdjust)) {

                        ret = new Date(endDate.getFullYear(),
                            endDate.getMonth(),
                            endDate.getDate() + 1);
                    }
                    else if (checkAdjust && isAdjust) {
                        checkAdjust = false;
                        ret = new Date(startDate.getFullYear(),
                            startDate.getMonth(),
                            startDate.getDate() - 1);
                        i = i > 0 ? i - 1 : 0;
                    }
                    else {
                        if (ret.getTime() !== date.getTime()) {
                            ret = endDate;
                        }
                        periodCache[date.getTime()] = ret;

                    }
                } while (i < periodInfo.length && !periodCache[date.getTime()]);
                
                if (!periodCache[date.getTime()]) {
                    var dateStr = formatter.format({value: date, type: formatter.getType().DATE});
                    msg = "No open future accounting period for " + dateStr;
                    periodError[date.getTime()] = msg;
                    throw msg;
                }
            }
            
            return ret;
        },
        
        getLastPeriodEndDate : function () {
            var endDate, i, periodInfo = this.getAccountingPeriodInfo();
            
            for (i = periodInfo.length - 1; i >= 0; i--) {
                if (periodInfo[i].isAdjust)
                    continue;
                
                endDate = periodInfo[i].endDate;
                break;
            }
            
            return endDate;
        },
        
        getApplicableCurrency : function (subId, bookId) {
            var subRec, subLineNum;
            bookId = bookId && bookId + '';
            
            if (!runtime.isFeatureInEffect({feature :"MULTICURRENCY"})) {
                return null;
            }
            
            if (runtime.isFeatureInEffect({feature :"MULTIBOOK"}) && bookId && 
                bookId != this.getPrimaryBookId() && runtime.isFeatureInEffect({feature :"SUBSIDIARIES"})) {
                    if (subId) {
                        if (runtime.isFeatureInEffect({feature :'FOREIGNCURRENCYMANAGEMENT'})){
                            subRec = record.load({
                                type:'subsidiary', 
                                id:subId
                            });
                            subLineNum = subRec.findSublistLineWithValue(
                                    'accountingbookdetail', 'accountingbook', bookId);
                            return -1 != subLineNum ? +subRec.getSublistValue('accountingbookdetail',
                                'currency', subLineNum) : null;
                        }
                        else{
                            var currObj = search.lookupFields({type: 'subsidiary', id: subId, columns: 'currency'});
                            return currObj && currObj.currency ? +currObj.currency[0].value : null;
                        }
                    }
                    else {
                        return null;
                    }
            }
            else if (runtime.isFeatureInEffect({feature :"SUBSIDIARIES"})) {
                var currObj = subId ? search.lookupFields({type: 'subsidiary', id: subId, columns: 'currency'}) : null;
                return currObj && currObj.currency ? +currObj.currency[0].value : null;
            }
            else {
              subRec = config.load('companyinformation');
              return +subRec.getValue('basecurrency');
            }
        },
        
        getCurrencySymbol : function (subId, bookId){
            var currId = this.getApplicableCurrency(subId, bookId),
                currSym = {};
        
            if (runtime.isFeatureInEffect({feature :"MULTICURRENCY"}) && currId) {
                currSym = search.lookupFields(
                    { type: 'currency', id: currId, columns: 'symbol' }) || '';
            }
            
            return currSym.symbol || '';
        }
    };
});
