/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define(['../adapter/fam_adapter_record',
        '../adapter/fam_adapter_format',
        '../adapter/fam_adapter_https',
        '../adapter/fam_adapter_search',
        '../adapter/fam_adapter_url',
        '../const/fam_const_customlist',
        '../util/fam_util_assetvalues',
        '../util/fam_util_process',
        '../util/fam_util_search',
        '../util/fam_util_systemsetup'], 
function(record, format, https, search, url, customList, 
         utilAssetVals, utilProcess, utilSearch, utilSetup) {
    var module = {};

    module.processForecast = function(newRec, oldRec){
        var isAsset = newRec.type === 'customrecord_ncfar_asset';
        if (!this.validateForecastProcess(isAsset, newRec, oldRec)){
            return;
        }
        
        var slaveField = isAsset ? 'custrecord_assetvals' : 'custrecord_altdepr_assetvals';
        var slaveId = +newRec.getValue(slaveField) || +oldRec.getValue(slaveField),
            slaveValues = utilAssetVals.getFieldValues(slaveId);
        if (!slaveValues){
            var message = ['Slave values for ',
                          isAsset ? 'Asset ID=' : 'Tax Method ID=',
                          newRec.id,
                          ' not found.'].join('')
            log.audit(message, 'Slave ID=' + slaveId + '. Will not process forecast');
            return;
        }
        
        var lastDepreciationDate = slaveValues['custrecord_slavelastdeprdate'];
        slaveValues['custrecord_slavelastdeprdate'] = lastDepreciationDate && format.parse({
            value: lastDepreciationDate,
            type: format.getType('DATE')
        });
        
        var forecastStart = this.getInitialForecastStart(newRec, oldRec);
        var cascadeRes = isAsset ? this.cascadeForecastReset(newRec, oldRec, forecastStart) : {};
        
        forecastStart = Object.keys(cascadeRes).length > 0 ? cascadeRes.forecastStart : forecastStart;
        if (!cascadeRes.isChangeCascade && !forecastStart){
            forecastStart =  this.getNewForecastStart(newRec, oldRec, slaveValues);
        }
        
        var slaveObj = utilAssetVals.buildNewValuesObjFromRecord(newRec, oldRec, slaveValues);
        
        if (forecastStart) {
            this.schedMassForecastReset(null, slaveId);
        }
        else if (slaveObj && Object.keys(slaveObj).length > 0) {
            record.submitFields({
                type : 'customrecord_fam_assetvalues',
                id : slaveId,
                values: slaveObj
            });
        }
    };
    
    module.validateForecastProcess = function(isAsset, newRec, oldRec) {
        // Newly created asset slave
        if (isAsset && (!oldRec.getValue('custrecord_assetvals') && newRec.getValue('custrecord_assetvals')) ||
                !isAsset && (!oldRec.getValue('custrecord_altdepr_assetvals') && newRec.getValue('custrecord_altdepr_assetvals'))) {
            return false;
        }
        
        var newRecJSONFields = newRec.toJSON().fields;
        var isInactive = oldRec.getValue('isinactive'), 
            isInactiveChanged = false;
        if (newRecJSONFields.hasOwnProperty('isinactive') && 
            newRec.getValue('isinactive') != isInactive){
                isInactiveChanged = true;
        }
        if (!isInactiveChanged && isInactive){
            return false;
        }
        
        return true;
    };
    
    module.getInitialForecastStart = function(newRec, oldRec) {
        var forecastStart = null;
        var fields;
        
        if(newRec.type === 'customrecord_ncfar_asset'){
            fields = {
                isCompound : 'custrecord_is_compound',
                deprStartDate : 'custrecord_assetdeprstartdate'
            }
        }
        else if(newRec.type === 'customrecord_ncfar_altdepreciation'){
            fields = {
                deprStartDate : 'custrecord_altdeprstartdeprdate'
            }
        }
        
        var newRecJSON = newRec.toJSON();
        if (!newRecJSON.fields.hasOwnProperty(fields.deprStartDate)){
            log.debug('No change in start date');
            return null;
        }
        
        if ((!fields.isCompound || !newRec.getValue(fields.isCompound))) {
            var nStartDate = newRec.getValue(fields.deprStartDate),
                oStartDate = oldRec ? oldRec.getValue(fields.deprStartDate) : null;
                
            if (nStartDate){
                if (!oStartDate){
                    forecastStart = nStartDate;
                }
                else if (oStartDate.toString() != nStartDate.toString()){
                    forecastStart = nStartDate < oStartDate ? nStartDate : oStartDate;
                }
            }
            else if (oStartDate){
                forecastStart = new Date(1980, 0, 2);
            }
        }
        return forecastStart;
    };
    
    module.getNewForecastStart = function(newRec, oldRec, slaveValues){
        log.debug('getNewForecastStart', 'Getting new forecast start date from regular fields');
        var isAsset = newRec.type === 'customrecord_ncfar_asset' ? true : false;
        var forecastStart = null;
        
        var fieldsForCompare = this.getFieldsForCompare(isAsset);
        var slaveFieldMap = fieldsForCompare.slaveFieldMap, 
            recFields = fieldsForCompare.fieldFormulaMap,
            fieldIdMap = fieldsForCompare.fieldIdMap;
        
        var newRecJSONFields = newRec.toJSON().fields;
        var deprMethodID = +oldRec.getValue(fieldIdMap.deprMethodFieldID),
            toCheckFormula = true;
        
        if (newRecJSONFields.hasOwnProperty(fieldIdMap.deprMethodFieldID)){
            deprMethodID = +newRec.getValue(fieldIdMap.deprMethodFieldID);
            toCheckFormula = deprMethodID == +oldRec.getValue(fieldIdMap.deprMethodFieldID);
        }
        var formulaRes = search.lookupFields({
                type: 'customrecord_ncfar_deprmethod',
                id: deprMethodID,
                columns: ['custrecord_deprmethodformula']
            }),
            formula = formulaRes ? formulaRes.custrecord_deprmethodformula || '' : '';
        
        for (var i in recFields){
            var slvFld = slaveFieldMap[i];
            if (newRecJSONFields.hasOwnProperty(i) && 
                ((slvFld && +newRec.getValue(i) != +slaveValues[slvFld]) || 
                 +newRec.getValue(i) != +oldRec.getValue(i))){
                if (!recFields[i] || 
                    (toCheckFormula && formula.toUpperCase().indexOf(recFields[i]) !== -1)){
                    log.debug('Change triggered by', 'Field: ' + i);
                    forecastStart = oldRec.getValue(fieldIdMap.startDateFieldID);
                    break;
                }
            }
        }
        
        // Depreciation Active Field
        if (!forecastStart && newRecJSONFields.hasOwnProperty(fieldIdMap.deprActvFieldID) &&
            +newRec.getValue(fieldIdMap.deprActvFieldID) != +oldRec.getValue(fieldIdMap.deprActvFieldID) && 
            +oldRec.getValue(fieldIdMap.deprActvFieldID) == customList.DeprActive['True']){
            log.debug('Change triggered by', 'Field: ' + fieldIdMap.deprActvFieldID);
            forecastStart = oldRec.getValue(fieldIdMap.startDateFieldID);
        }
        
        // Annual Method and Financial Year
        var deprPeriod = +newRec.getValue(fieldIdMap.deprPeriodFieldID) || +oldRec.getValue(fieldIdMap.deprPeriodFieldID);
        if (deprPeriod == customList.DeprPeriod['Annually']){
            var annualPeriodFields = [fieldIdMap.financialYearFieldID, fieldIdMap.annualEntryFieldID];
            for (var i=0; i<annualPeriodFields.length; i++){
                if (newRecJSONFields.hasOwnProperty(annualPeriodFields[i]) && 
                    +newRec.getValue(annualPeriodFields[i]) != +oldRec.getValue(annualPeriodFields[i])){
                    log.debug('Change triggered by', 'Field: ' + annualPeriodFields[i]);
                    forecastStart = oldRec.getValue(fieldIdMap.startDateFieldID);
                    break;
                }
            }
        }
        
        if (!forecastStart && !isAsset && this.isBookChanged(newRec, oldRec)){
            forecastStart = oldRec.getValue(fieldIdMap.startDateFieldID);
        }
     
        return forecastStart;
    };
    
    module.isBookChanged = function(newRec, oldRec){
        var isPostingField = 'custrecord_altdepr_isposting', 
            bookField = 'custrecord_altdepr_accountingbook';
        
        var newRecJSONFields = newRec.toJSON().fields;
        if (newRecJSONFields.hasOwnProperty(bookField) && newRec.getValue(bookField) && !oldRec.getValue(bookField) &&
            newRecJSONFields.hasOwnProperty(isPostingField) && newRec.getValue(isPostingField)){
            log.debug('Change triggered by', 'Field: ' + isPostingField + ' and ' + bookField);
            return true;
        }
        return false;
    };
    
    module.cascadeForecastReset = function(newRec, oldRec, forecastStart){
        log.debug('cascadeForecastReset', 'Validating changes in fields with effect on child records');
        var isChangeCascade = false,
            assetIDs = [],
            summaryGrouping = utilSetup.getSetting('isSummarizeJe');
        var newRecJSONFields = newRec.toJSON().fields;

        if (summaryGrouping == customList.SummarizeBy['Parent'] && 
            newRecJSONFields.hasOwnProperty('custrecord_assetparent') && 
            +newRec.getValue('custrecord_assetparent') != +oldRec.getValue('custrecord_assetparent')){
            var newParentAsset = +newRec.getValue('custrecord_assetparent'),
                oldParentAsset = +oldRec.getValue('custrecord_assetparent');
            log.debug('Change triggered by', 'Parent Asset');
            assetIDs.push(+newRec.id);
            
            var children = this.searchChildren([+newRec.id]);
            if (children.length > 1){
                children.shift();
                assetIDs = assetIDs.concat(children);
            }
            if (newParentAsset && this.countChildAssets(newParentAsset, +newRec.id) == 0 && !this.isChild(newParentAsset)) {
                assetIDs.push(newParentAsset);
            }
            if (oldParentAsset && this.countChildAssets(oldParentAsset, +newRec.id) == 0 && !this.isChild(oldParentAsset)){
                assetIDs.push(oldParentAsset);
            }
        }
        else if ((summaryGrouping == customList.SummarizeBy['Sub-Category'] && 
                  newRecJSONFields.hasOwnProperty('custrecord_assetrepairmaintsubcategory') && 
                  +newRec.getValue('custrecord_assetrepairmaintsubcategory') != +oldRec.getValue('custrecord_assetrepairmaintsubcategory')) ||
                 (newRecJSONFields.hasOwnProperty('custrecord_assetproject') && 
                  +newRec.getValue('custrecord_assetproject') != +oldRec.getValue('custrecord_assetproject'))){
            log.debug('Change triggered by', 'Category or Project');
            forecastStart =  forecastStart || oldRec.getValue('custrecord_assetdeprstartdate');
            if (this.countAltDepr(+newRec.id) > 0){
                assetIDs.push(+newRec.id);
            }
        }
        else if (newRecJSONFields.hasOwnProperty('isinactive') && newRec.getValue('isinactive') &&
            !oldRec.getValue('isinactive')) {
            
            log.debug('Change triggered by', 'Inactive');
            assetIDs.push(+newRec.id);
        }
        
        if (assetIDs.length > 0){
            this.schedMassForecastReset(assetIDs);
            isChangeCascade =  true;
        }
        
        return {
            isChangeCascade : isChangeCascade,
            forecastStart : isChangeCascade ? null : forecastStart
        }
    };
    
    module.getFieldsForCompare = function(isAsset){
        var slaveFieldMap, 
            fieldFormulaMap, 
            fieldIdMap = {
                deprMethodFieldID : 'custrecord_assetaccmethod',
                startDateFieldID : 'custrecord_assetdeprstartdate',
                deprActvFieldID : 'custrecord_assetdepractive',
                deprPeriodFieldID : 'custrecord_assetdeprperiod',
                financialYearFieldID : 'custrecord_assetfinancialyear',
                annualEntryFieldID : 'custrecord_assetannualentry'
            };
        
        if (isAsset){
            slaveFieldMap = utilAssetVals.getAssetSlaveFieldMap();
            fieldFormulaMap = {
                custrecord_assetlifetime      : '',
                custrecord_assetdepracc       : '',
                custrecord_assetdeprchargeacc : '',
                custrecord_assetdeprrules     : '',
                custrecord_assetaccmethod     : '',
                custrecord_assetdeprperiod    : '',
                custrecord_assetcost          : 'OC',
                custrecord_assetcurrentcost   : 'CC',
                custrecord_assetbookvalue     : 'NB',
                custrecord_assetresidualvalue : 'RV',
                custrecord_assetcurrentage    : 'CP',
                custrecord_assetlifeunits     : 'LU',
                custrecord_assetlastdepramt   : 'LD',
                custrecord_assetpriornbv      : 'PB',
                custrecord_assetfinancialyear : 'FY',
                custrecord_assetannualentry   : 'FY'
            };
        } 
        else{
            slaveFieldMap = utilAssetVals.getTaxmSlaveFieldMap();
            fieldFormulaMap = {
                custrecord_altdeprlifetime       : '',
                custrecord_altdepr_depraccount   : '',
                custrecord_altdepr_chargeaccount : '',
                custrecord_altdepr_deprrules     : '',
                custrecord_altdeprmethod         : '',
                custrecord_altdeprconvention     : '',
                custrecord_altdeprperiodconvention : '',
                custrecord_altdepr_originalcost  : 'OC',
                custrecord_altdepr_currentcost   : 'CC',
                custrecord_altdeprnbv            : 'NB',
                custrecord_altdeprrv             : 'RV',
                custrecord_altdeprcurrentage     : 'CP',
                custrecord_altdeprld             : 'LD',
                custrecord_altdeprpriornbv       : 'PB',
                custrecord_altdeprfinancialyear  : 'FY',
                custrecord_altdeprannualentry    : 'FY'
            };
            fieldIdMap.deprMethodFieldID = 'custrecord_altdeprmethod';
            fieldIdMap.startDateFieldID = 'custrecord_altdeprstartdeprdate';
            fieldIdMap.deprActvFieldID = 'custrecord_altdepr_depractive';
            fieldIdMap.deprPeriodFieldID = 'custrecord_altdepr_depreciationperiod';
            fieldIdMap.financialYearFieldID = 'custrecord_altdeprfinancialyear';
            fieldIdMap.annualEntryFieldID = 'custrecord_altdeprannualentry';
        }
        
        return {
            slaveFieldMap : slaveFieldMap, 
            fieldFormulaMap : fieldFormulaMap, 
            fieldIdMap : fieldIdMap
        }
    };    
    
    /**
     * TODO: move to util
     */
    module.searchChildren = function(parentIDs){
        var filters = [['custrecord_assetparent', 'anyof', parentIDs], 'and',
                       ['internalid', 'noneof', parentIDs], 'and',
                       ['isinactive', 'is', 'F']];
        
        var searchRes = utilSearch.searchRecord('customrecord_ncfar_asset', null, filters);        
        if (searchRes.length > 0){
            parentIDs = parentIDs.concat(searchRes.map(function(row) {
                return row.id;
            }))
            parentIDs = this.searchChildren(parentIDs);
        }
        
        return parentIDs;
    };
    
    module.isChild = function(assetID){
        var isChild = false;
        if (assetID) {
            var assetInfo = search.lookupFields({
                type: 'customrecord_ncfar_asset',
                id: assetID,
                columns: ['custrecord_assetparent']
            });

            if (assetInfo.custrecord_assetparent && assetInfo.custrecord_assetparent.length > 0) {
                isChild = true;
            }
        }
        return isChild;
    };

    module.countChildAssets = function(parentAsset, assetID){
        var assetIdFilter = assetID ? [parentAsset,assetID] : [parentAsset];
        var filters = [['custrecord_assetparent', 'is', parentAsset], 'and',
                       ['internalid', 'noneof', assetIdFilter], 'and',
                       ['isinactive', 'is', 'F']],
            searchObj = search.create({
                type: 'customrecord_ncfar_asset',
                filters : filters
            });
        return utilSearch.getTotalRows(searchObj);
    };
    
    module.countAltDepr = function(assetID){
        var filters = [['custrecord_altdeprasset', 'is', assetID], 'and',
                       ['isinactive', 'is', 'F']],
            searchObj = search.create({
                           type: 'customrecord_ncfar_altdepreciation',
                           filters : filters
                       });
        return utilSearch.getTotalRows(searchObj);
    };

    /**
     * @function schedMassForecastReset
     * @description Creates and triggers forecast reset process (via PM)
     */
    module.schedMassForecastReset = function(assetIDs, slaveID) {
        var objSV = {};
        
        if (assetIDs && assetIDs.length)
            objSV.assetIds = assetIDs;
        if (slaveID)
            objSV.slaveIds = [slaveID];
        
        var procId = utilProcess.Record.create({
            procId: 'assetValsReset',
            params: JSON.stringify(objSV)
        });
        this.triggerProcessManager();
    };
    
    module.triggerProcessManager = function(){
        var suiteletURL = url.resolveScript({
            scriptId    : 'customscript_fam_triggerprocess_su',
            deploymentId: 'customdeploy_fam_triggerprocess_su',
            returnExternalUrl : true
        });
        https.request({
            url : suiteletURL,
            method: https.getMethod('GET')
        });
    };
    
    return module;
});