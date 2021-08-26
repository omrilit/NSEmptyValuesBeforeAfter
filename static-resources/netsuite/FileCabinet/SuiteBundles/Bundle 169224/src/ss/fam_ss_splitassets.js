/**
 * � 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

/**
 * Starter for Background Processing function for Asset Split
**/
function famAssetSplit() {
    var assetSplit = new FAM.Split_SS();

    try {
        assetSplit.run();
    }
    catch (e) {
        assetSplit.logObj.printLog();
        throw e;
    }
}

/**
 * Class for splitting records
**/
FAM.Split_SS = function () {
    this.currentRecord = null;
    this.currRecIsAcquired = false;
    
    this.totalRecords = 0;
    this.recsProcessed = 0;
    this.recsFailed = 0;

    this.recsToProcess = [];
    
    this.fprId = FAM.Context.getSetting('SCRIPT', 'custscript_split_procid');
    
    this.currStateValues = {};
    
    this.procRec = new FAM.ProcessRecord();
    this.logObj = new printLogObj('debug');
    this.perfTimer = new FAM.Timer();
    this.currCache = new FAM.FieldCache('currency');

    this.perfTimer.start();
};

FAM.Split_SS.prototype.execLimit = 500;
FAM.Split_SS.prototype.timeLimit = 30 * 60 * 1000; // 30 minutes

/**
 * Main function for this class
 *
 * Parameters:
 *     none
 * Returns:
 *     void
**/
FAM.Split_SS.prototype.run = function () {
    this.logObj.startMethod('FAM.Split_SS.run');

    this.procRec.loadRecord(this.fprId);
    this.procRec.setParams();
    this.procRec.setStateValues();
    if (this.procRec.stateValuesArray.length > 0) {
        this.currStateValues = this.procRec.stateValuesArray[this.procRec.stateValuesArray.length - 1];
    }
    else {
        this.procRec.stateValuesArray.push(this.currStateValues);  // should not happen because should not be empty from proc mgr
    }
    this.currStateValues.outputResult = this.currStateValues.outputResult || 0;
    this.currStateValues.errors = this.currStateValues.errors || [];

    this.procRec.startStage();
    this.logObj.logExecution(JSON.stringify(this.procRec.params));
    
    this.recsToProcess = this.procRec.params.recsToProcess || [];
    
    if (this.totalRecords === 0) {
        this.totalRecords = this.recsToProcess.length;
        if (this.totalRecords === 0) {
            return;
        }
    }

    this.iterateRecords();

    this.logObj.endMethod();
};

/**
 * Iterates through records to be split
 *
 * Parameters:
 *     none
 * Returns:
 *     void
**/
FAM.Split_SS.prototype.iterateRecords = function () {
    this.logObj.startMethod('FAM.Split_SS.iterateRecords');

    var i, updatedValues, lastTaxId = 0, scriptParams, blnToRequeue = false,
        timer = new FAM.Timer(),
        lastId = +FAM.Context.getSetting('SCRIPT', 'custscript_split_lastassetid') || 0;

    for (i = lastId; i < this.recsToProcess.length; i++) {
        // clear messages to prevent flooding of log data
        this.logObj.clearMsg();

        lastId = i;
        this.currentRecord = null;
        if (this.hasExceededLimit()) {
            blnToRequeue = true;
            break;
        }

        timer.start();
        updatedValues = this.splitAssetAndTax(this.recsToProcess[i]);
        
        if (updatedValues.requeue) {
            lastTaxId = updatedValues.lastTaxId;
            blnToRequeue = true;
            break;
        }
        
        this.recsProcessed++;
        this.logObj.logExecution('Successful splitting of ' + this.recsToProcess[i].asset +
            ', Elapsed Time: ' + timer.getReadableElapsedTime());
    }

    this.currStateValues.outputResult = this.currStateValues.outputResult + this.recsProcessed;
    if (blnToRequeue) {
        this.logObj.logExecution('Execution Limit | Remaining Usage: ' +
            FAM.Context.getRemainingUsage() + ' | Time Elapsed: ' +
            this.perfTimer.getReadableElapsedTime());
        
        this.procRec.updateStage({
            stateValues: JSON.stringify(this.procRec.stateValuesArray)
        });
        
        scriptParams = { custscript_split_lastassetid : lastId };
        if (lastTaxId) {
            scriptParams.custscript_split_lasttaxid = lastTaxId;
        }
        this.requeue(scriptParams);
    }
    else {
        this.procRec.params.done = 'T';
        this.currStateValues.status = this.currStateValues.errors.length > 0 ? FAM.ProcStageStatus.CompletedWithErrors: FAM.ProcStageStatus.Completed;
        this.currStateValues.end = new Date().getTime();
        this.procRec.updateStage({
            params : JSON.stringify(this.procRec.params),
            currStageStatus : FAM.ProcStageStatus.Completed,
            stateValues: JSON.stringify(this.procRec.stateValuesArray)
        });
        this.procRec.callProcessManager();
    }

    this.logObj.endMethod();
};

/**
 * Call the scheduled script
 * 
 * @returns {Integer} procId 
**/
FAM.Split_SS.prototype.requeue = function (params) {
    params.custscript_split_procid = this.fprId;
    
    return nlapiScheduleScript('customscript_fam_splitasset_ss',
        'customdeploy_fam_splitasset_ss', params);
};

/**
 * Determines if the Execution Limit or Time Limit has exceeded
 *
 * Returns:
 *     true {boolean} - Execution Limit or Time Limit has exceeded
 *     false {boolean} - Execution Limit or Time Limit has not exceeded
**/
FAM.Split_SS.prototype.hasExceededLimit = function () {
    this.logObj.startMethod('FAM.Split_SS.hasExceededLimit');

    var ret = FAM.Context.getRemainingUsage() < this.execLimit ||
        this.perfTimer.getElapsedTime() > this.timeLimit;

    this.logObj.endMethod();
    return ret;
};

/**
 * Iterates trough the asset's tax records and splits all the records
 *
 * Parameters:
 *     splitDetails {object} - split details from state values
 * Returns:
 *     {object} - updated values
**/
FAM.Split_SS.prototype.splitAssetAndTax = function (splitDetails) {
    this.logObj.startMethod('FAM.Split_SS.splitAssetAndTax');

    var ret = {}, lastTaxId, ratio;
    
    this.currentRecord = new FAM.Asset_Record();
    this.currentRecord.loadRecord(splitDetails.asset);
    this.currRecIsAcquired = this.hasAcquisitionHistory(splitDetails.asset);
    
    ratio = (+splitDetails.qty) / (+this.currentRecord.getFieldValue('quantity'));
    if (ratio >= 1) {
        throw FAM.resourceManager.GetString('splitquantity_help', 'assetsplit');
    }
    
    if (!splitDetails.newAsset) {
        splitDetails.newAsset = this.createNewAsset(splitDetails, ratio);
    }
    
    lastTaxId = this.splitTaxMethods(splitDetails.newAsset, ratio, splitDetails.qty,
        this.currentRecord.getFieldValue('quantity'));
    
    if (lastTaxId) {
        ret = { lastTaxId : lastTaxId, requeue : true };
    }
    else {
        this.updateAsset(splitDetails, ratio);
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Creates a new asset using the provided details
 *
 * Parameters:
 *     splitDetails {object} - split details from state values
 *     ratio {number} - target ratio for split
 * Returns:
 *     {number} - internal id of the newly created asset
**/
FAM.Split_SS.prototype.createNewAsset = function (splitDetails, ratio) {
    this.logObj.startMethod('FAM.Split_SS.createNewAsset');
    
    var ret, origPB, newPB, currId, currSym = null, histFields, assetVal, lastDeprDate,
        assetRec = new FAM.Asset_Record(),
        histRec = new FAM.DepreciationHistory_Record(),
        noDPCurr = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');
    
    assetRec.copyRecord(this.currentRecord.getRecordId());
    
    if (FAM.Context.blnMultiCurrency) {
        currId = this.currCache.getApplicableCurrency(assetRec.getFieldValue('subsidiary'));
        currSym = currId && this.currCache.fieldValue(currId, 'symbol');
    }
    
    assetVal = this.currentRecord.getFieldValue('assetValues');
    if (assetVal) {
        assetValRec = new FAM.AssetValues();
        assetValRec.loadRecord(assetVal);
        
        lastDeprDate = assetValRec.getFieldValue('lastDeprDate');
    }
    else {
        lastDeprDate = assetRec.getFieldValue('last_depr_date');
    }
    
    histFields = {
        asset_type : assetRec.getFieldValue('asset_type'),
        transaction_type : FAM.TransactionType.Acquisition,
        date : lastDeprDate,
        quantity : splitDetails.qty
    };
    if (assetRec.getFieldValue('subsidiary')) {
        histFields.subsidiary = assetRec.getFieldValue('subsidiary');
    }
    if (FAM.Context.blnMultiBook) {
        histFields.bookId = FAM.Util_Shared.getPrimaryBookId();
    }
    
    origPB = +assetRec.getFieldValue('prior_nbv');
    newPB = FAM.Util_Shared.Math.roundByCurrency(origPB * ratio, currSym, noDPCurr);
    
    assetRec.setFieldValue('altname', this.currentRecord.getFieldValue('altname'));
    assetRec.setFieldValue('initial_cost', splitDetails.oc);
    assetRec.setFieldValue('current_cost', splitDetails.cc);
    assetRec.setFieldValue('rv', splitDetails.rv);
    assetRec.setFieldValue('book_value', splitDetails.nbv);
    assetRec.setFieldValue('cummulative_depr', splitDetails.td);
    assetRec.setFieldValue('lastDeprAmount', splitDetails.ld);
    assetRec.setFieldValue('prior_nbv', newPB);
    assetRec.setFieldValue('quantity', splitDetails.qty);
    assetRec.setFieldValue('last_depr_date', lastDeprDate);
    assetRec.setFieldValue('createdFrom', 'split');
    
    ret = assetRec.submitRecord();
    
    histFields.asset = assetRec.getRecordId();
    
    if (this.currRecIsAcquired && +splitDetails.cc) {
        histFields.transaction_amount = splitDetails.cc;
        histFields.net_book_value = splitDetails.cc;
        histRec.createRecord(histFields);
        histRec.submitRecord();
    }
    
    if (+splitDetails.td) {
        histFields.transaction_type = FAM.TransactionType.Depreciation;
        histFields.transaction_amount = splitDetails.td;
        histFields.net_book_value = splitDetails.nbv;
        histRec.createRecord(histFields);
        histRec.submitRecord();
    }
    
    this.logObj.endMethod();
    return ret;
};

/**
 * Iterates trough the asset's tax records and splits all the records
 *
 * Parameters:
 *     newAsset {number} - internal id of the new asset
 *     ratio {number} - target ratio for split
 *     newQty {number} - target quantity of the split
 *     origQty {number} - original quantity of the asset
 * Returns:
 *     {number} - internal id of the last record processed; will return 0 when all records have been
 *         processed
**/
FAM.Split_SS.prototype.splitTaxMethods = function (newAsset, ratio, newQty, origQty) {
    this.logObj.startMethod('FAM.Split_SS.splitTaxMethods');
    
    var i, ret = 0, taxRecords = this.searchTaxRecords();
    
    if (taxRecords.results) {
        for (i = 0; i < taxRecords.results.length; i++) {
            this.splitTaxMethod(newAsset, taxRecords.getId(i), ratio, newQty, origQty);
            
            if (this.hasExceededLimit()) {
                ret = taxRecords.getId(i);
                break;
            }
        }
    }
    
    this.logObj.endMethod();
    return ret;
};

/**
 * Searches the tax methods of the current asset
 *
 * Parameters:
 *     none
 * Returns:
 *     {FAM.Search}
**/
FAM.Split_SS.prototype.searchTaxRecords = function () {
    this.logObj.startMethod('FAM.Split_SS.searchTaxRecords');
    
    var ret = new FAM.Search(new FAM.AltDeprMethod_Record()),
        lastTaxId = +FAM.Context.getSetting('SCRIPT', 'custscript_split_lasttaxid') || 0;
    
    ret.addFilter('parent_asset', null, 'is', this.currentRecord.getRecordId());
    ret.addFilter('isinactive', null, 'is', 'F');
    ret.addFilter('internalidnumber', null, 'greaterthan', lastTaxId);
    
    ret.addColumn('internalid', null, null, 'SORT_ASC');
    
    ret.run();
    
    this.logObj.endMethod();
    return ret;
};

/**
 * Splits the given tax method using the provided ratio
 *
 * Parameters:
 *     newAsset {number} - internal id of the new asset
 *     taxId {number} - internal id of the tax record to split
 *     ratio {number} - target ratio for split
 *     newQty {number} - target quantity of the split
 *     origQty {number} - original quantity of the asset
 * Returns:
 *     void
**/
FAM.Split_SS.prototype.splitTaxMethod = function (newAsset, taxId, ratio, newQty, origQty) {
    this.logObj.startMethod('FAM.Split_SS.splitTaxMethod');
    
    var origOC, origCC, origRV, origNB, origTD, origLD, origPB, newOC, newCC, newRV, newNB, newTD,
        newLD, newPB, currId = null, currSym = null, histFields, taxFields, origAsset, isAcquired,
        taxVal, taxValRec, lastDeprDate, deprStartDate, lastForecastDate, newOrigPB,
        taxRec = new FAM.AltDeprMethod_Record(),
        origTaxRec = new FAM.AltDeprMethod_Record(),
        histRec = new FAM.DepreciationHistory_Record(),
        noDPCurr = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');
    
    taxRec.copyRecord(taxId);
    
    if (FAM.Context.blnMultiCurrency) {
        currId = taxRec.getFieldValue('currency') ||
            this.currCache.getApplicableCurrency(taxRec.getFieldValue('subsidiary'),
            taxRec.getFieldValue('booking_id'));
        currSym = currId && this.currCache.fieldValue(currId, 'symbol');
    }
    
    origOC = +taxRec.getFieldValue('original_cost');
    origCC = +taxRec.getFieldValue('current_cost');
    origRV = +taxRec.getFieldValue('residual_value');
    origAsset = taxRec.getFieldValue('parent_asset');
    
    origTaxRec.loadRecord(taxId);
    taxVal = origTaxRec.getFieldValue('taxValues');
    if (taxVal) {
        taxValRec = new FAM.AssetValues();
        taxValRec.loadRecord(taxVal);
        
        lastDeprDate = nlapiStringToDate(taxValRec.getFieldValue('lastDeprDate'));
        deprStartDate = nlapiStringToDate(origTaxRec.getFieldValue('depr_start_date'));
        lastForecastDate = FAM.Util_Shared.Date.computeForecastDate(deprStartDate, lastDeprDate);
        lastDeprDate = nlapiDateToString(lastDeprDate);
        
        origNB = +taxValRec.getFieldValue('netBookValue');
        origTD = origCC - origNB;
        origLD = +taxValRec.getFieldValue('lastDeprAmount');
        origPB = +taxValRec.getFieldValue('priorYearNBV');
        newPB = FAM.Util_Shared.Math.roundByCurrency(origPB * ratio, currSym, noDPCurr);
        newNB = FAM.Util_Shared.Math.roundByCurrency(origNB * ratio, currSym, noDPCurr);
        newLD = FAM.Util_Shared.Math.roundByCurrency(origLD * ratio, currSym, noDPCurr);
        newOrigPB = FAM.Util_Shared.Math.roundByCurrency(origPB - newPB, currSym, noDPCurr);
        
        taxValRec.setFieldValue('netBookValue', FAM.Util_Shared.Math.roundByCurrency(origNB - newNB,
            currSym, noDPCurr));
        taxValRec.setFieldValue('lastDeprAmount', FAM.Util_Shared.Math.roundByCurrency(
            origLD - newLD, currSym, noDPCurr));
        taxValRec.setFieldValue('lastForecastDate', nlapiDateToString(lastForecastDate));
        taxValRec.setFieldValue('forecastStatus', '');
        taxValRec.setFieldValue('priorYearNBV', newOrigPB);
        
        taxValRec.submitRecord();
    }
    else {
        origNB = +taxRec.getFieldValue('book_value');
        origTD = +taxRec.getFieldValue('cumulative_depr');
        origLD = +taxRec.getFieldValue('last_depr_amount');
        origPB = +taxRec.getFieldValue('prior_year_nbv');
        newPB = FAM.Util_Shared.Math.roundByCurrency(origPB * ratio, currSym, noDPCurr);
        newNB = FAM.Util_Shared.Math.roundByCurrency(origNB * ratio, currSym, noDPCurr);
        newLD = FAM.Util_Shared.Math.roundByCurrency(origLD * ratio, currSym, noDPCurr);
        newOrigPB = FAM.Util_Shared.Math.roundByCurrency(origPB - newPB, currSym, noDPCurr);
    
        lastDeprDate = taxRec.getFieldValue('last_depr_date');
    }
    
    newOC = FAM.Util_Shared.Math.roundByCurrency(origOC * ratio, currSym, noDPCurr);
    newCC = FAM.Util_Shared.Math.roundByCurrency(origCC * ratio, currSym, noDPCurr);
    newRV = FAM.Util_Shared.Math.roundByCurrency(origRV * ratio, currSym, noDPCurr);
    newTD = FAM.Util_Shared.Math.roundByCurrency(origTD * ratio, currSym, noDPCurr);
    
    isAcquired = this.hasAcquisitionHistory(origAsset, taxId);
    
    histFields = {
        asset_type : taxRec.getFieldValue('asset_type'),
        alternate_method : taxRec.getFieldValue('alternate_method'),
        actual_depreciation_method : taxRec.getFieldValue('depr_method'),
        transaction_type : FAM.TransactionType.Acquisition,
        asset : newAsset,
        date : lastDeprDate,
        quantity : newQty
    };
    if (taxRec.getFieldValue('subsidiary')) {
        histFields.subsidiary = taxRec.getFieldValue('subsidiary');
    }
    if (FAM.Context.blnMultiBook && taxRec.getFieldValue('booking_id')) {
        histFields.bookId = taxRec.getFieldValue('booking_id');
    }
    
    taxRec.setFieldValue('parent_asset', newAsset);
    taxRec.setFieldValue('original_cost', newOC);
    taxRec.setFieldValue('current_cost', newCC);
    taxRec.setFieldValue('residual_value', newRV);
    taxRec.setFieldValue('book_value', newNB);
    taxRec.setFieldValue('cumulative_depr', newTD);
    taxRec.setFieldValue('last_depr_amount', newLD);
    taxRec.setFieldValue('prior_year_nbv', newPB);
    taxRec.setFieldValue('last_depr_date', lastDeprDate);
    taxRec.setFieldValue('createdFrom', 'split');
    if (FAM.Context.blnMultiCurrency) { taxRec.setFieldValue('currency', currId); }
    
    this.logObj.logExecution('Creating ' + taxRec.getFieldText('alternate_method') +
        ' for Asset: ' + newAsset);
    histFields.alternate_depreciation = taxRec.submitRecord();
    
    if (isAcquired && newCC) {
        histFields.transaction_amount = newCC;
        histFields.net_book_value = newCC;
        histRec.createRecord(histFields);
        histRec.submitRecord();
    }
    
    if (newTD) {
        histFields.transaction_type = FAM.TransactionType.Depreciation;
        histFields.transaction_amount = newTD;
        histFields.net_book_value = newNB;
        histRec.createRecord(histFields);
        histRec.submitRecord();
    }
    
    this.logObj.logExecution('Updating Tax Method Id: ' + taxId);
    taxFields = {
        original_cost : FAM.Util_Shared.Math.roundByCurrency(origOC - newOC, currSym, noDPCurr),
        current_cost : FAM.Util_Shared.Math.roundByCurrency(origCC - newCC, currSym, noDPCurr),
        residual_value : FAM.Util_Shared.Math.roundByCurrency(origRV - newRV, currSym, noDPCurr),
        book_value : FAM.Util_Shared.Math.roundByCurrency(origNB - newNB, currSym, noDPCurr),
        cumulative_depr : FAM.Util_Shared.Math.roundByCurrency(origTD - newTD, currSym, noDPCurr),
        last_depr_amount : FAM.Util_Shared.Math.roundByCurrency(origLD - newLD, currSym, noDPCurr),
        prior_year_nbv : newOrigPB
    };
    if (FAM.Context.blnMultiCurrency) { taxFields.currency = currId; }
    taxRec.recordId = taxId;
    taxRec.submitField(taxFields);
    
    histFields.alternate_depreciation = taxId;
    histFields.quantity = Math.round(origQty - newQty);
    histFields.asset = origAsset;
    
    if (isAcquired && newCC) {
        histFields.transaction_type = FAM.TransactionType.Acquisition;
        histFields.transaction_amount = FAM.Util_Shared.Math.roundByCurrency(newCC * -1,
            currSym, noDPCurr);
        histFields.net_book_value = FAM.Util_Shared.Math.roundByCurrency(origNB - newCC,
            currSym, noDPCurr);
        histRec.createRecord(histFields);
        histRec.submitRecord();
    }
    
    if (newTD) {
        histFields.transaction_type = FAM.TransactionType.Depreciation;
        histFields.transaction_amount = FAM.Util_Shared.Math.roundByCurrency(newTD * -1,
            currSym, noDPCurr);
        histFields.net_book_value = FAM.Util_Shared.Math.roundByCurrency(origNB - newNB, currSym,
            noDPCurr);
        histRec.createRecord(histFields);
        histRec.submitRecord();
    }
    
    this.logObj.endMethod();
};

/**
 * Updates the original asset using the provided details
 *
 * Parameters:
 *     splitDetails {object} - split details from state values
 *     ratio {number} - target ratio for split
 * Returns:
 *     void
**/
FAM.Split_SS.prototype.updateAsset = function (splitDetails, ratio) {
    this.logObj.startMethod('FAM.Split_SS.updateAsset');
    
    var origPB, newPB, currId, currSym = null, histFields, origNB, newQty, newNB, newLD, assetVal,
        assetValRec, lastDeprDate, cumDepr, deprStartDate, lastForecastDate, newOrigPB,
        histRec = new FAM.DepreciationHistory_Record(),
        noDPCurr = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');
    
    if (FAM.Context.blnMultiCurrency) {
        currId = this.currCache.getApplicableCurrency(this.currentRecord.getFieldValue('subsidiary'));
        currSym = currId && this.currCache.fieldValue(currId, 'symbol');
    }
    
    assetVal = this.currentRecord.getFieldValue('assetValues');
    newQty = Math.round((+this.currentRecord.getFieldValue('quantity')) - splitDetails.qty);
    
    if (assetVal) {
        assetValRec = new FAM.AssetValues();
        assetValRec.loadRecord(assetVal);
        
        lastDeprDate = nlapiStringToDate(assetValRec.getFieldValue('lastDeprDate'));
        deprStartDate = nlapiStringToDate(this.currentRecord.getFieldValue('depr_start_date'));
        lastForecastDate = FAM.Util_Shared.Date.computeForecastDate(deprStartDate, lastDeprDate);
        
        origNB = +assetValRec.getFieldValue('netBookValue');
        cumDepr = (+this.currentRecord.getFieldValue('current_cost')) - origNB;
        origPB = +assetValRec.getFieldValue('priorYearNBV');
        newPB = FAM.Util_Shared.Math.roundByCurrency(origPB * ratio, currSym, noDPCurr);
        newNB = FAM.Util_Shared.Math.roundByCurrency(origNB - splitDetails.nbv, currSym, noDPCurr);
        newLD = FAM.Util_Shared.Math.roundByCurrency(
            (+assetValRec.getFieldValue('lastDeprAmount')) - splitDetails.ld, currSym, noDPCurr);
        newOrigPB = FAM.Util_Shared.Math.roundByCurrency(origPB - newPB, currSym, noDPCurr);
        
        assetValRec.setFieldValue('netBookValue', newNB);
        assetValRec.setFieldValue('lastDeprAmount', newLD);
        assetValRec.setFieldValue('lastForecastDate', nlapiDateToString(lastForecastDate));
        assetValRec.setFieldValue('forecastStatus', '');
        assetValRec.setFieldValue('priorYearNBV', newOrigPB);
        
        assetValRec.submitRecord();
    }
    else {
        lastDeprDate = this.currentRecord.getFieldValue('last_depr_date');
        cumDepr = +this.currentRecord.getFieldValue('cummulative_depr');
        origNB = +this.currentRecord.getFieldValue('book_value');
        origPB = +this.currentRecord.getFieldValue('prior_nbv');
        newPB = FAM.Util_Shared.Math.roundByCurrency(origPB * ratio, currSym, noDPCurr);
        newNB = FAM.Util_Shared.Math.roundByCurrency(origNB - splitDetails.nbv, currSym, noDPCurr);
        newLD = FAM.Util_Shared.Math.roundByCurrency(
            (+this.currentRecord.getFieldValue('lastDeprAmount')) - splitDetails.ld, currSym, noDPCurr);
        newOrigPB = FAM.Util_Shared.Math.roundByCurrency(origPB - newPB, currSym, noDPCurr);
    }
    
    histFields = {
        asset_type : this.currentRecord.getFieldValue('asset_type'),
        transaction_type : FAM.TransactionType.Acquisition,
        date : nlapiDateToString(lastDeprDate),
        asset : this.currentRecord.getRecordId(),
        quantity : newQty
    };
    if (this.currentRecord.getFieldValue('subsidiary')) {
        histFields.subsidiary = this.currentRecord.getFieldValue('subsidiary');
    }
    if (FAM.Context.blnMultiBook) { histFields.bookId = FAM.Util_Shared.getPrimaryBookId(); }
    
    this.currentRecord.setFieldValue('initial_cost', FAM.Util_Shared.Math.roundByCurrency(
        (+this.currentRecord.getFieldValue('initial_cost')) - splitDetails.oc, currSym, noDPCurr));
    this.currentRecord.setFieldValue('current_cost', FAM.Util_Shared.Math.roundByCurrency(
        (+this.currentRecord.getFieldValue('current_cost')) - splitDetails.cc, currSym, noDPCurr));
    this.currentRecord.setFieldValue('rv', FAM.Util_Shared.Math.roundByCurrency(
        (+this.currentRecord.getFieldValue('rv')) - splitDetails.rv, currSym, noDPCurr));
    this.currentRecord.setFieldValue('book_value', newNB);
    this.currentRecord.setFieldValue('cummulative_depr', FAM.Util_Shared.Math.roundByCurrency(
        cumDepr - splitDetails.td, currSym, noDPCurr));
    this.currentRecord.setFieldValue('lastDeprAmount', newLD);
    this.currentRecord.setFieldValue('prior_nbv', newOrigPB);
    this.currentRecord.setFieldValue('quantity', newQty);
    
    this.currentRecord.submitRecord();
    
    if (this.currRecIsAcquired && +splitDetails.cc) {
        histFields.transaction_amount = FAM.Util_Shared.Math.roundByCurrency(splitDetails.cc * -1,
            currSym, noDPCurr);
        histFields.net_book_value = FAM.Util_Shared.Math.roundByCurrency(origNB - splitDetails.cc,
            currSym, noDPCurr);
        histRec.createRecord(histFields);
        histRec.submitRecord();
    }
    
    if (+splitDetails.td) {
        histFields.transaction_type = FAM.TransactionType.Depreciation;
        histFields.transaction_amount = FAM.Util_Shared.Math.roundByCurrency(splitDetails.td * -1,
            currSym, noDPCurr);
        histFields.net_book_value = newNB;
        histRec.createRecord(histFields);
        histRec.submitRecord();
    }
    
    this.logObj.endMethod();
};

/**
 * Checks if the given method already have an acquisition history
 *
 * Parameters:
 *     assetId {number} - Internal Id of the Asset
 *     taxMetId {number} - Internal Id of the Tax Method
 * Returns:
 *     true {boolean} - method already have an acquisition history
 *     false {boolean} - method does not have an acquisition history
**/
FAM.Split_SS.prototype.hasAcquisitionHistory = function (assetId, taxMetId) {
    this.logObj.startMethod('FAM.Split_SS.hasAcquisitionHistory');

    var ret = false, fSearch = new FAM.Search(new FAM.DepreciationHistory_Record());

    taxMetId = taxMetId || '@NONE@';

    fSearch.addFilter('asset', null, 'is', assetId);
    fSearch.addFilter('alternate_depreciation', null, 'is', taxMetId);
    fSearch.addFilter('transaction_type', null, 'is', FAM.TransactionType.Acquisition);
    fSearch.addFilter('schedule', null, 'is', 'F');

    if (fSearch.run()) {
        ret = true;
    }

    this.logObj.endMethod();
    return ret;
};
