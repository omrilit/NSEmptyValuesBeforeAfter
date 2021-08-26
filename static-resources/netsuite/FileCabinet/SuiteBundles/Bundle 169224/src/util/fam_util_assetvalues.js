/** 
 * © 2015 NetSuite Inc. 
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code. 
 *
 */ 

define([
    '../adapter/fam_adapter_format',
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_runtime',
    '../adapter/fam_adapter_search',
    '../const/fam_const_customlist',
    '../record/fam_record_assetvalues',
    '../util/fam_util_dhr',
    '../util/fam_util_search'
],

function(format, record, runtime, search, constList, recSlave, utilDhr, utilSearch) {
    var module = {};
    
    const assetSlaveFieldMap = {
        custrecord_assetbookvalue    : 'custrecord_slavebookvalue',
        custrecord_assetlastdepramt  : 'custrecord_slavelastdepramt',
        custrecord_assetpriornbv     : 'custrecord_slavepriornbv',
        custrecord_assetcurrentage   : 'custrecord_slavecurrentage',
        custrecord_assetlastdeprdate : 'custrecord_slavelastdeprdate'
    };
    module.getAssetSlaveFieldMap = function() {
        return assetSlaveFieldMap;
    };
    
    const taxmSlaveFieldMap = {
        custrecord_altdeprnbv          : 'custrecord_slavebookvalue',
        custrecord_altdeprld           : 'custrecord_slavelastdepramt',
        custrecord_altdeprpriornbv     : 'custrecord_slavepriornbv',
        custrecord_altdeprcurrentage   : 'custrecord_slavecurrentage',
        custrecord_altdeprlastdeprdate : 'custrecord_slavelastdeprdate'
    };
    module.getTaxmSlaveFieldMap = function() {
        return taxmSlaveFieldMap;
    };
    
    const assetMap = {
        recType: 'customrecord_ncfar_asset',
        fields: {
            status: 'custrecord_assetstatus',
            startDate: 'custrecord_assetdeprstartdate',
            lastDeprDate: 'custrecord_assetlastdeprdate',
            bookValue: 'custrecord_assetbookvalue',
            lastDeprAmt: 'custrecord_assetlastdepramt',
            priorNbv: 'custrecord_assetpriornbv',
            currentAge: 'custrecord_assetcurrentage'
        }
    };
    
    module.getAssetMap = function() {
        return assetMap;
    };
    
    const taxMap = {
        recType: 'customrecord_ncfar_altdepreciation',
        fields: {
            status: 'custrecord_altdeprstatus',
            startDate: 'custrecord_altdeprstartdeprdate',
            lastDeprDate: 'custrecord_altdeprlastdeprdate',
            bookValue: 'custrecord_altdeprnbv',
            lastDeprAmt: 'custrecord_altdeprld',
            priorNbv: 'custrecord_altdeprpriornbv',
            currentAge: 'custrecord_altdeprcurrentage',
            parentAsset: 'custrecord_altdeprasset',
            groupDepr: 'custrecord_altdepr_groupdepreciation',
            groupMaster: 'custrecord_altdepr_groupmaster'
        }
    };
    
    module.getTaxMap = function() {
        return taxMap;
    };
    
    module.getMapValues = function(param) {
    	var arrValues = [];

    	for (var key in param) {
    	    arrValues.push(param[key]);
    	}
    	
    	return arrValues;
    };

    module.createInitAssetValuesFromId = function(type, id) {
        var assetValuesId = null;
        
        if (type && id) {
            var recMap = type === 'asset' ? this.getAssetMap() : this.getTaxMap();            
            var assetValsObj = search.lookupFields({
            	type: recMap.recType,
                id: id,
                columns: this.getMapValues(recMap.fields)});
            
            log.debug('assetValsObj', assetValsObj);
            
            var deprStartDate = assetValsObj[recMap.fields.startDate],
                lastDeprDate = assetValsObj[recMap.fields.lastDeprDate],
                lastForecastDate, forecastStatus, bookValue,
                lastDeprAmt, priorBookValue, lastPeriod, 
                parentAsset, parentTax, status;
            
            var assetValues = record.create({type: 'customrecord_fam_assetvalues'});                
                
            deprStartDate = deprStartDate && format.stringToDate(deprStartDate);
            lastDeprDate = lastDeprDate && format.stringToDate(lastDeprDate);
            lastForecastDate = deprStartDate > lastDeprDate ?
                new Date(deprStartDate.getFullYear(), deprStartDate.getMonth(), deprStartDate.getDate()-1) :
                lastDeprDate;
                
            bookValue = assetValsObj[recMap.fields.bookValue];
            lastDeprAmt = assetValsObj[recMap.fields.lastDeprAmt];
            priorBookValue = assetValsObj[recMap.fields.priorNbv];
            lastPeriod = assetValsObj[recMap.fields.currentAge];
            status = parseInt(assetValsObj[recMap.fields.status][0].value, 10);
            
            if(type === 'asset'){
            	parentAsset = id;
            } else {
            	var parentAssetFld = assetValsObj[recMap.fields.parentAsset][0];
            	
            	if(parentAssetFld){
            		parentAsset = parentAssetFld.value;
            		
                    assetValues.setValue('custrecord_slaveparenttax', id);
                    
                    if (assetValsObj[recMap.fields.groupDepr] &&
                        !assetValsObj[recMap.fields.groupMaster]) { // group depreciation member                
                        forecastStatus = constList.ForecastStatus.Completed; 
                    }
            	} else {
            		// set tax method without parent to inactive
            		log.debug('parentAsset not found', 'Setting tax method record to inactive.');
            		record.submitFields({
            			type : recMap.recType,
            			id : id,
            			values : {
            				isinactive : 'T'
            			}
            		});
            		
            		return;
            	}
            }
            
            assetValues.setValue('custrecord_slaveparentasset', parentAsset);    
            assetValues.setValue('custrecord_slavelastforecastdate', lastForecastDate);
            assetValues.setValue('custrecord_slavebookvalue', bookValue);
            assetValues.setValue('custrecord_slavelastdepramt', lastDeprAmt);
            assetValues.setValue('custrecord_slavelastdeprdate', lastDeprDate);
            assetValues.setValue('custrecord_slavecurrentage', lastPeriod);
            assetValues.setValue('custrecord_slavepriornbv', priorBookValue);

            if ([constList.AssetStatus['Fully Depreciated'], 
                 constList.AssetStatus['Disposed']].indexOf(status) > -1) {
                forecastStatus = constList.ForecastStatus.Completed;
            }                               
            
            if (forecastStatus) {
                assetValues.setValue('custrecord_slaveforecaststatus', forecastStatus);
            }
            
            assetValuesId = assetValues.save();
        }
        
        log.debug('assetValuesId', assetValuesId);
        return assetValuesId;
    };
    
    module.createInitAssetValuesFromRecord = function(newRec) {
        var assetValues = record.create({type: 'customrecord_fam_assetvalues'}),
            deprStartDate, lastDeprDate, lastForecastDate, forecastStatus,
            bookValue, lastDeprAmt, priorBookValue, lastPeriod, 
            parentAsset, parentTax;
        
        if (newRec.type === 'customrecord_ncfar_asset') {
            parentAsset = newRec.id;
            deprStartDate = newRec.getValue('custrecord_assetdeprstartdate');
            lastDeprDate = newRec.getValue('custrecord_assetlastdeprdate');
            lastForecastDate = deprStartDate > lastDeprDate ?
                    new Date(deprStartDate.getFullYear(), deprStartDate.getMonth(), deprStartDate.getDate()-1)
                        : lastDeprDate;
            bookValue = newRec.getValue('custrecord_assetbookvalue');
            lastDeprAmt = newRec.getValue('custrecord_assetlastdepramt');
            priorBookValue = newRec.getValue('custrecord_assetpriornbv');
            lastPeriod = newRec.getValue('custrecord_assetcurrentage');
        }
        else if (newRec.type === 'customrecord_ncfar_altdepreciation') {
            parentAsset = newRec.getValue('custrecord_altdeprasset');
            parentTax = newRec.id;
            deprStartDate = newRec.getValue('custrecord_altdeprstartdeprdate');
            lastDeprDate = newRec.getValue('custrecord_altdeprlastdeprdate');
            lastForecastDate = deprStartDate > lastDeprDate ?
                    new Date(deprStartDate.getFullYear(), deprStartDate.getMonth(), deprStartDate.getDate()-1)
                        : lastDeprDate;
            bookValue = newRec.getValue('custrecord_altdeprnbv');
            lastDeprAmt = newRec.getValue('custrecord_altdeprld');
            priorBookValue = newRec.getValue('custrecord_altdeprpriornbv');
            lastPeriod = newRec.getValue('custrecord_altdeprcurrentage');
            
            // skip pre-compute for group depreciation members
            if (newRec.getValue('custrecord_altdepr_groupdepreciation') &&
                !newRec.getValue('custrecord_altdepr_groupmaster')) {
                forecastStatus = constList.ForecastStatus.Completed; 
            }
        }
        
        assetValues.setValue('custrecord_slaveparentasset', parentAsset);
        if (parentTax) {
            assetValues.setValue('custrecord_slaveparenttax', parentTax);
        }
        assetValues.setValue('custrecord_slavelastforecastdate',
            format.parse({ value: lastForecastDate, type: format.getType().DATE }));
        assetValues.setValue('custrecord_slavebookvalue', bookValue);
        assetValues.setValue('custrecord_slavelastdepramt', lastDeprAmt);
        assetValues.setValue('custrecord_slavelastdeprdate', 
            format.parse({ value: lastDeprDate, type: format.getType().DATE }));
        assetValues.setValue('custrecord_slavecurrentage', lastPeriod);
        assetValues.setValue('custrecord_slavepriornbv', priorBookValue);
        
        if (forecastStatus) {
            assetValues.setValue('custrecord_slaveforecaststatus', forecastStatus);
        }
        
        return assetValues.save();
    };
    
    /**
     * @function buildNewValuesObjFromRecord
     * @description Compares parent record latest values with slave current values.
     *              Supports Asset, and Alternate Depreciation record.
     * @param {record.Record} newRec - Parent record
     * @param {record.Record} oldRec - Parent record
     * @param {Object} currentSlaveValues - Slave values
     *                                      Note that value for date field(s) should be in Date object format.
     */
    module.buildNewValuesObjFromRecord = function(newRec, oldRec, currentSlaveValues){
        var slaveFieldMap = newRec.type === 'customrecord_ncfar_asset' ?
                this.getAssetSlaveFieldMap() : this.getTaxmSlaveFieldMap(); 
        var objSlaveValues = {};
        var isUI = runtime.getExecutionContext() == runtime.getContextType('USER_INTERFACE');
        var newRecJSONFields = newRec.toJSON().fields;
        
        for (var i in slaveFieldMap){
            if (newRecJSONFields.hasOwnProperty(i)){
                    var fld = slaveFieldMap[i],
                    toCheckSlave = isUI,
                    newVal, oldVal;
                
                if (!isUI){
                    var assetNewVal, assetOVal;
                    assetNewVal = newRec.getValue(i);
                    assetOVal = oldRec.getValue(i);
                    
                    if (assetNewVal instanceof Date){
                        assetNewVal = assetNewVal.getTime();
                    }
                    if (assetOVal instanceof Date){
                        assetOVal = assetOVal.getTime();
                    }
                    if (+assetNewVal != +assetOVal){
                        toCheckSlave = true;
                    }
                }
                if (toCheckSlave){
                    newVal = newRec.getValue(i);
                    oldVal = currentSlaveValues[fld];
                    // Last depreciation date should be Date object
                    if (newVal instanceof Date){
                        newVal = newVal.getTime();
                    }
                    if (oldVal instanceof Date){
                        oldVal = oldVal.getTime();
                    }
                    if (+newVal != +oldVal){
                        var value = newRec.getValue(i);
                        objSlaveValues[fld] = value instanceof Date ? format.format({
                            value : value, type: format.getType('DATE') }) : value;
                    }
                }
            }
        }
        return objSlaveValues;
    };
    
    /**
     * @function getFieldValues
     * @description Returns values for all fields of no column is set
     * @param {Number} id - Slave ID
     * @param {Object} fieldMap - Parent record fields to slave fields mapping,
     *                            with parent record field as key and corresponding slave field as value.
     * @returns {Object} lookup result
     */
    module.getFieldValues = function(id, isAsset){
        var slaveFieldMap = isAsset ?
                this.getAssetSlaveFieldMap() : this.getTaxmSlaveFieldMap(); 
        
        if (!id){
            return null;
        }
        
        var rec = new recSlave(),
            columns;
        columns = Object.keys(slaveFieldMap).map(function(key) {
            return slaveFieldMap[key];
        });
        
        return search.lookupFields({
            type: rec.getRecordTypeId(),
            id: id,
            columns: columns
        });
    };
    
    module.createUpdatedAssetValuesSearch = function(filters){
        var searchObj = search.load({ id: 'customsearch_fam_updated_assetvals' });
        if (filters){
            if (+filters.updCompLastID > 0) {
                searchObj.filterExpression = searchObj.filterExpression.concat(
                        utilSearch.getFilterExpressionForConcat(
                                searchObj.filterExpression, [
                                    'internalidnumber',
                                     search.getOperator('GREATERTHAN'), 
                                     +filters.updCompLastID
                         ]));
            }
            if (+filters.maxSlaveID > 0) {
                searchObj.filterExpression = searchObj.filterExpression.concat(
                        utilSearch.getFilterExpressionForConcat(
                                searchObj.filterExpression, [
                                    'internalidnumber',
                                     search.getOperator('LESSTHANOREQUALTO'), 
                                     +filters.maxSlaveID
                         ]));
            }
        }
        
        return searchObj;
    }
    
    module.deleteAssetValue = function(id) {
        if (id) {
            utilDhr.searchAndDeleteHistories({assetValueId: id});
            record['delete']({type: 'customrecord_fam_assetvalues', id: id}); // let caller handle if an error is thrown
        }
    };
    
    return module;
});