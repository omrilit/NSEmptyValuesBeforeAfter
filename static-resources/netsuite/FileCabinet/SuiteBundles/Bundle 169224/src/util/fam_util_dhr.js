/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 */ 

define([
    '../adapter/fam_adapter_format',
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_search',
    '../const/fam_const_customlist',
    '../util/fam_util_accounting',
    '../util/fam_util_search',
],

function(formatter, record, search,
         fCustomList, utilAcctg, utilSearch) {
    var module = {};
    const DHR_DEFAULT_NAME = 'dhr-default-name';
    const RECTYPE_DHR = 'customrecord_ncfar_deprhistory';
    
    module.createAssetAcquisitionHistoryFromAssetId = function(assetId) {
        var acqHistId = null;
        if (assetId) {
            var newRec = record.load({type: 'customrecord_ncfar_asset', id: assetId});
            acqHistId = this.createAssetAcquisitionHistoryFromRecord(newRec);
        }
        
        return acqHistId;
    };

    /**
     * TODO: revert to lookupFields when its return value type is consistent
     */
    module.getAssetFieldValues = function(id, fields) {
        var searchRes = null;
        var columns = [];
        
        if (id) {
            for (var i = 0; i < fields.length; i++) {
                columns.push(search.createColumn({name: fields[i]}));
            }
            
            var searchObj = search.create({
                type: 'customrecord_ncfar_asset',
                filters: [search.createFilter({ name: 'internalid', operator: 'anyof', values: [id] })],
                columns: columns
            });        
            
            searchRes = searchObj.run().getRange(0, 1);  // only 1 record
            searchRes = searchRes && searchRes[0];            
        }
        
        return searchRes;
    };
    
    module.createAssetAcquisitionHistoryFromRecord = function(newRec) {
        var acqDhr = record.create({type: RECTYPE_DHR}),
            parentAsset, parentTax, bookId, sub, aType, 
            histDate, histOrigCost, histQty;
        
        if(newRec.type === 'customrecord_ncfar_asset'){
            parentAsset = newRec.id;
            bookId = utilAcctg.getPrimaryBookId();
            sub = newRec.getValue('custrecord_assetsubsidiary');
            aType = newRec.getValue('custrecord_assettype');
            histDate = newRec.getValue('custrecord_assetpurchasedate') || 
                       newRec.getValue('custrecord_assetdeprstartdate');            
            histDate = histDate && 
                       formatter.stringToDate(histDate);            
            histOrigCost = newRec.getValue('custrecord_assetcost');
            histQty = newRec.getValue('custrecord_ncfar_quantity');
        }
        else if(newRec.type === 'customrecord_ncfar_altdepreciation'){
            parentAsset = newRec.getValue('custrecord_altdeprasset');
            parentTax = newRec.id;
            bookId = newRec.getValue('custrecord_altdepr_accountingbook');
            sub = newRec.getValue('custrecord_altdepr_subsidiary');
            aType = newRec.getValue('custrecord_altdepr_assettype');
            histOrigCost = newRec.getValue('custrecord_altdepr_originalcost');
            
            var res = this.getAssetFieldValues(parentAsset, ['custrecord_ncfar_quantity',
                                                             'custrecord_assetpurchasedate']);
            histQty = res && res.getValue('custrecord_ncfar_quantity');
            histDate = res && res.getValue('custrecord_assetpurchasedate') ||
                       newRec.getValue('custrecord_altdeprstartdeprdate');
            histDate = histDate && 
                       formatter.stringToDate(histDate);
        }
        
        acqDhr.setValue('name', DHR_DEFAULT_NAME);
        acqDhr.setValue('custrecord_deprhistasset', parentAsset);
        if(parentTax){
            acqDhr.setValue('custrecord_deprhistaltdepr', parentTax);
            acqDhr.setValue('custrecord_deprhistaltmethod', 
                    newRec.getValue('custrecord_altdepraltmethod'));
            acqDhr.setValue('custrecord_deprhistdeprmethod', 
                    newRec.getValue('custrecord_altdeprmethod'));
        }
        acqDhr.setValue('custrecord_deprhistaccountingbook', bookId);
        acqDhr.setValue('custrecord_deprhistsubsidiary', sub);
        acqDhr.setValue('custrecord_deprhistassettype', aType);
        acqDhr.setValue('custrecord_deprhisttype', fCustomList.TransactionType.Acquisition);
        acqDhr.setValue('custrecord_deprhistdate', histDate);
        acqDhr.setValue('custrecord_deprhistamount', histOrigCost);
        acqDhr.setValue('custrecord_deprhistbookvalue', histOrigCost); //use origcost
        acqDhr.setValue('custrecord_deprhistquantity', histQty); 
        
        return acqDhr.save();
    };
    
    module.searchAcquisitionHistory = function(newRec){
        var filters = [
                search.createFilter({
                    name: 'custrecord_deprhisttype',
                    operator: 'anyof',
                    values: fCustomList.TransactionType['Acquisition']
                })
            ];
        return this.searchHistory(newRec, filters);
    };
    
    module.searchHistory = function(newRec, filters){
        var parentAsset, parentTax;
        if(newRec.type === 'customrecord_ncfar_asset'){
            parentAsset = newRec.id;
            parentTax = '@NONE@'
        }
        else if(newRec.type === 'customrecord_ncfar_altdepreciation'){
            parentAsset = newRec.getValue('custrecord_altdeprasset');
            parentTax = newRec.id;
        }
        filters.push(search.createFilter({
            name: 'custrecord_deprhistasset',
            operator: 'anyof',
            values: parentAsset
        }));
        filters.push(search.createFilter({
            name: 'custrecord_deprhistaltdepr',
            operator: 'anyof',
            values: parentTax
        }));
        
        var startTime = (new Date()).getTime();
        var searchRes = utilSearch.searchRecord(RECTYPE_DHR, null, filters);
        log.debug('Elapsed time (search history) in ms: ' + ((new Date()).getTime() - startTime), 
                  'History records found: ' + searchRes && searchRes.length);
        
        
        return searchRes;
    };
    
    module.deleteAcquisitionHistory = function(newRec){
        var histories = this.searchAcquisitionHistory(newRec);
        if (histories){
            for (var i = 0; i < histories.length; i++){
                record.delete({
                    type: RECTYPE_DHR,
                    id : histories[i].id
                })
            }
            log.audit('Deleted ' + i + ' Acquisition history');
        }
    };
    
    module.recreateAcquisitionHistoryFromRecord = function(newRec) {
        this.deleteAcquisitionHistory(newRec);
        
        return this.createAssetAcquisitionHistoryFromRecord(newRec);
    };

    /**
     * @function processAcquisitionHistoryFromRecord
     * @description Create, recreate, or delete acquisition history based on Asset or Alternate Depreciation values
     * 
     * @param {record.Record} newRec - Latest record values
     * @param {record.Record | null } oldRec - Previous record values
     * @returns {none}
     *              
     */
    module.processAcquisitionHistoryFromRecord = function(newRec, oldRec) {
        var fields, purchaseDate;  
        
        if (newRec.type === 'customrecord_ncfar_asset') {
            fields = {
                isCompound : 'custrecord_is_compound',
                createdFrom : 'custrecord_assetcreatedfrom',
                deprStartDate : 'custrecord_assetdeprstartdate',
                purchaseDate: 'custrecord_assetpurchasedate'
            }
            purchaseDate = newRec.getValue(fields.purchaseDate);
        }
        else if (newRec.type === 'customrecord_ncfar_altdepreciation') {
            fields = {
                createdFrom : 'custrecord_altdepr_createdfrom',
                deprStartDate : 'custrecord_altdeprstartdeprdate'
            }
            
            if (newRec.getValue('custrecord_altdeprasset')) {
                var res = this.getAssetFieldValues(newRec.getValue('custrecord_altdeprasset'), 
                        ['custrecord_assetpurchasedate']);
                purchaseDate = res && res.getValue('custrecord_assetpurchasedate');            
            } 
        }
        
        var newRecJSON = newRec.toJSON();
        if (!purchaseDate && !newRecJSON.fields.hasOwnProperty(fields.deprStartDate)) {
            log.debug('No change in start date', 'Will not process acquisition history');
            return null;
        }
        
        if ((!fields.isCompound || !newRec.getValue(fields.isCompound)) &&
            newRec.getValue(fields.createdFrom) !== 'split') {
            var nStartDate = newRec.getValue(fields.deprStartDate),
                oStartDate = oldRec ? oldRec.getValue(fields.deprStartDate) : null,
                acqHistId  = 0;
                               
            if (oldRec) { // edit record
                var dhrCount = this.searchAcquisitionHistory(newRec).length;                
                
                // create DHR only if there is no existing record
                // no need to recreate if depreciation start date changed
                if (!dhrCount &&
                    (purchaseDate || nStartDate)) {
                    acqHistId = this.createAssetAcquisitionHistoryFromRecord(newRec);
                }                
            }
            else if (purchaseDate || nStartDate) {                    
                acqHistId = this.createAssetAcquisitionHistoryFromRecord(newRec);
            }

            // Logging only
            if (acqHistId) {
                log.audit('Acquisition History Record created', 'ID: ' + acqHistId);
            }
        }
    };
    
    module.searchAndDeleteHistories = function (options) {
        var i, results,
            filters = [];
        
        if (!options || (!options.taxMetId && !options.assetValueId)) {
            // not meant to be seen by customers!
            throw 'Disastrous call, will delete ALL histories!';
        }
        
        if (options.taxMetId) {
            filters.push(['custrecord_deprhistaltdepr', search.getOperator('ANYOF'), options.taxMetId]);
        }
        if (options.assetValueId) {
            filters.push(['custrecord_deprhistassetslave', search.getOperator('ANYOF'), options.assetValueId]);
        }
        
        results = utilSearch.searchRecord(RECTYPE_DHR, null, filters);
        
        for (i = 0; i < results.length; i++) {
            record['delete']({ type : RECTYPE_DHR, id : results[i].id });
        }
    };
    
    return module;
});