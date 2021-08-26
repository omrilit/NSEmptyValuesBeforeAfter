/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.x
 */

define(['../adapter/fam_adapter_error',
        '../adapter/fam_adapter_file',
        '../adapter/fam_adapter_format',
        '../adapter/fam_adapter_search',
        '../const/fam_const_customlist',
        '../util/fam_util_csv',
        '../util/fam_util_translator'],

function (error, file, format, search, list, utilCsv, translator){
    var MANDATORY_HEADERS = ['Disposal Type','Disposal Date','Asset','Quantity to Dispose'],
        DISPOSAL_HEADERS = ['Tax Code', 'Sale Item', 'Customer', 'Sales Amount', 'Location'];
    
    function generateDispStateValues(stateVal){
        var objFile, csvData, stateData = {};
        
        try {
            objFile = file.load(stateVal.fileid);
            csvData = utilCsv.parseText(objFile.getContents(), { header : true });
            stateData = processDispCSVData(csvData, stateVal);
        }
        catch(ex) {
            log.error('CSV Error', ex.toString());
            throw ex;
        }
        
        return stateData;
    }
    
    function processDispCSVData(csvData, stateVal) {
        var dispType = stateVal.dt, out = {};
        
        if (csvData) {
            //validate headers
            validateDisposalHeaders(csvData.meta.fields);
            
            //check lines if only header exists
            if (csvData.data.length === 0) {
                errParams = {
                    name: "CSV_HEADER_ONLY",
                    message: translator.getString(
                        'message_disposal_csv_only_headers','assetdisposal')
                };
                errObj = error.create(errParams);
                throw errObj;
            }
            
            //get unique data for conversion
            var uniqueMap = {
                    tax     : {},
                    item    : {},
                    loc     : {}
                };
            
            log.debug('csvData',JSON.stringify(csvData.data));
            
            var aObj = {}, dupAssets = [], blankLineCnt = 0, noAssetId = false;
            for(var i = 0; i<csvData.data.length; i++) {
                var csv = csvData.data[i],
                    assetId = csv["Asset"];

                //skip blank lines
                if (Object.keys(csv).length === 1) {
                    blankLineCnt++;
                    if (blankLineCnt === csvData.data.length) {
                        errParams = {
                            name: "CSV_HEADER_ONLY",
                            message: translator.getString(
                                'message_disposal_csv_only_headers','assetdisposal')
                        };
                        errObj = error.create(errParams);
                        throw errObj;
                    }
                    continue;
                }
                
                // missing asset id check
                if (!assetId){
                    noAssetId = true;
                    continue;
                }
                //duplicate line check
                if (aObj.hasOwnProperty(assetId)) {
                    if (dupAssets.indexOf(assetId) == -1) { 
                        dupAssets.push(assetId);
                    }
                    continue;
                }
                
                aObj[assetId] = {
                    type : +dispType[csv["Disposal Type"]],
                    qty : +csv["Quantity to Dispose"],
                }

                // Let date carry over until M/R for proper validation
                var dispDate = csv["Disposal Date"] ? format.parse({ value : csv["Disposal Date"], type : format.getType().DATE}) : '';
                aObj[assetId].date = dispDate instanceof Date ? dispDate.getTime() : dispDate;

                if (csv["Location"]) {
                    aObj[assetId].loc = csv["Location"];
                    uniqueMap.loc[csv["Location"]] = '';
                }
                
                if (aObj[assetId].type == list.DisposalType.Sale) {
                    if (csv["Customer"]) { 
                        aObj[assetId].cust = csv["Customer"];
                    }
                    if (csv["Tax Code"]) {
                        aObj[assetId].tax  = csv["Tax Code"]; 
                        uniqueMap.tax[csv["Tax Code"]] = '';
                    }
                    if (csv["Sale Item"]) { 
                        aObj[assetId].item = csv["Sale Item"];
                        uniqueMap.item[csv["Sale Item"]] = '';
                    }
                    if (csv["Sales Amount"] > 0) { aObj[assetId].amt = +csv["Sales Amount"]; }
                }
            }
            if (JSON.stringify(uniqueMap.tax) !== '{}') { uniqueMap.tax = getUniqueIds(search.getType().SALES_TAX_ITEM, uniqueMap.tax); }
            if (JSON.stringify(uniqueMap.item) !== '{}') { uniqueMap.item = getUniqueIds(search.getType().NON_INVENTORY_ITEM, uniqueMap.item); }
            if (JSON.stringify(uniqueMap.loc) !== '{}') { uniqueMap.loc = getUniqueIds(search.getType().LOCATION, uniqueMap.loc); }
            
            //apply unique id mapping
            for (var assetId in aObj) {
                if (aObj.hasOwnProperty(assetId)) {
                    var asset = aObj[assetId];
                    if (asset.loc) {
                        if (uniqueMap.loc[asset.loc]) { asset.loc = uniqueMap.loc[asset.loc]; }
                        else { asset.loc = 'N/A'; }
                    }
                    if (asset.type === list.DisposalType.Sale) {
                        if (asset.tax) {
                            if (uniqueMap.tax[asset.tax]) { asset.tax = uniqueMap.tax[asset.tax]; }
                            else { asset.tax = 'N/A'; }
                        }
                        if (asset.item) {
                            if (uniqueMap.item[asset.item]) { asset.item = uniqueMap.item[asset.item]; }
                            else { delete asset.item; }
                        }
                    }
                }
            }
            
            //delete duplicate lines for output to stateValues
            for (var i=0; i<dupAssets.length; i++) {
                var assetId = dupAssets[i];
                delete aObj[assetId];
            }
        }
        
        if (dupAssets.length > 0){
            aObj = appendErrorsToStateValues(aObj, 'DUP_ASSETS', dupAssets);
        }
        if (noAssetId){
            aObj = appendErrorsToStateValues(aObj, 'MISSING_ASSETID');
        }
        
        return aObj;       
    }
    
    function appendErrorsToStateValues (stateVal, errCode, assets) {
        stateVal[errCode] = {};
        switch(errCode){
            case 'DUP_ASSETS' : 
                stateVal[errCode]['assets'] = assets;
                stateVal[errCode]['callback'] = 'logDuplicateErrors';
                break;
            case 'MISSING_ASSETID' :
                stateVal[errCode]['callback'] = 'logMissingAssetIDs';
        }
        return stateVal;
    }
    
    function getUniqueIds(recId, objRec){
        var nameObj = {};
        nameObj[search.getType().SALES_TAX_ITEM] = 'itemid';
        nameObj[search.getType().NON_INVENTORY_ITEM] = 'itemid';
        nameObj[search.getType().LOCATION] = 'name';
        
        var filters = stackFilters(nameObj[recId], Object.keys(objRec));
        var columns = [nameObj[recId],
                       search.createColumn({ name: 'internalid', sort: search.getSort().ASC })];
        
        var searchObj = search.create({
            type    : recId,
            filters : filters,
            columns : columns
        });
        
        var searchResSet =  searchObj.run(),
            searchLimit = 1000,
            lowerLimit = 0,
            upperLimit = searchLimit,
            searchRes = [];
        
        while(true){
            var res = searchResSet.getRange({start:lowerLimit, end:upperLimit});
            if (0 === res.length){
                break;
            }
            lowerLimit = upperLimit;
            upperLimit += searchLimit;
            searchRes = searchRes.concat(res);
        }
        
        for (var i=0; i<searchRes.length; i++) {
            objRec[searchRes[i].getValue(nameObj[recId])] = searchRes[i].id;
        }
        return objRec;
    }
    
    function stackFilters(field, names) {
        var filters = [];
        for (var i=0; i<names.length; i++) {
            filters.push([field, 'is', names[i]]);
            filters.push('or');
        }
        filters.pop();
        filters.push('and',['isinactive', 'is', 'F']);
        return filters;
    }
    
    function validateDisposalHeaders(headers) {
        var errObj = {}, errParams = {}, allowedHeaders = MANDATORY_HEADERS.concat(DISPOSAL_HEADERS);
        
        if (findIntersection(headers, MANDATORY_HEADERS).length < MANDATORY_HEADERS.length) {
            errParams = {
                name: "CSV_MANDATORY_HEADERS",
                message: translator.getString(
                    'message_disposal_csv_mandatory_headers','assetdisposal')
            };
            log.error(errParams.name, errParams.message);
            errObj = error.create(errParams);
            throw errObj;
        }
        
        var dupHeaders = findDuplicates(headers);
        if (dupHeaders.length > 0) {
            errParams = {
                name: "CSV_DUPLICATE_HEADERS",
                message: translator.getString(
                    'message_disposal_csv_duplicate_headers','assetdisposal',
                    [dupHeaders.join('')])
            };
            log.error(errParams.name, errParams.message);
            errObj = error.create(errParams);
            throw errObj;
        }
        
        if (headers.length > findIntersection(headers, allowedHeaders).length) {
            errParams = {
                name: "CSV_EXTRA_HEADERS",
                message: translator.getString(
                    'message_disposal_csv_extra_headers','assetdisposal')
            };
            log.error(errParams.name, errParams.message);
            errObj = error.create(errParams);
            throw errObj;
        }
    }
    
    function findDuplicates(arrIn) {
        var arr = arrIn.slice().sort();
        var res = [];
        for (var i = 0; i < arrIn.length - 1; i++) {
            if (arr[i + 1] == arr[i] &&
                -1 === res.indexOf(arr[i])) {
                res.push(arr[i]);
            }
        }
        return res;
    }
    
    function findIntersection(arr1,arr2) {
        return arr1.filter(function(n) {
            return arr2.indexOf(n) != -1;
        });
    }
    
    return {
        generateDispStateValues : generateDispStateValues
    };
});