/**
 * � 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

/**
 * Starter for Background Processing function for Asset Value (or Accounting Method) Depreciation
 *
 * Parameters:
 *     BGP {FAM.BGProcess} - Process Instance Record for this background process
 * Returns:
 *     true {boolean} - processing should be requeued
 *     false {boolean} - processing should not be requeued; essentially setting the deployment to
 *                       standby
**/
function famAssetValueDepreciation(BGP) {
    var assetDepreciation = new FAM.AssetValueDepreciation(BGP);

    try {
        return assetDepreciation.run();
    }
    catch (e) {
        assetDepreciation.logObj.printLog();
        throw e;
    }
}

/**
 * Class for depreciating accounting methods; Inherits FAM.DepreciationCommon
 *
 * Constructor Parameters:
 *     procInsRec {FAM.BGProcess} - Process Instance Record for this background process
**/
FAM.AssetValueDepreciation = function (procInsRec) {
    // Call Parent Constructor
    FAM.DepreciationCommon.apply(this, arguments);
};

// Prototypal Inheritance
FAM.AssetValueDepreciation.prototype = Object.create(FAM.DepreciationCommon.prototype);

/**
 * Main function for this class
 *
 * Parameters:
 *     none
 * Returns:
 *     true {boolean}  - processing should be requeued
 *     false {boolean} - processing should not be requeued; essentially setting the deployment to
 *                       standby
**/
FAM.AssetValueDepreciation.prototype.run = function () {
    this.logObj.startMethod('FAM.AssetValueDepreciation.run');
    this.perfTimer.start();

    var hashFilters, queueDetails,
        blnToRequeue    = false,
        arrAssetTypes   = this.procInsRec.stateValues.AssetTypes,
        arrSubsidiaries = this.procInsRec.stateValues.Subsidiaries,
        deprPeriod      = new Date(+this.procInsRec.stateValues.DeprPeriod),
        lowerLimit      = this.procInsRec.stateValues.SearchBatchEnd || 0,
        partialCount    = this.procInsRec.stateValues.PartialCount || 0;

    this.totalRecords = +this.procInsRec.stateValues.TotalAssets || 0;

    arrAssetTypes   = arrAssetTypes ? arrAssetTypes.split(':') : [];
    arrSubsidiaries = arrSubsidiaries ? arrSubsidiaries.split(':') : [];
     
    this.logObj.pushMsg('finished variable initialization');

    hashFilters = {
        arrAssetTypes   : arrAssetTypes,
        arrSubsidiaries : arrSubsidiaries,
        deprPeriod      : deprPeriod,
        lowerLimit      : lowerLimit
    };
    
    if (this.totalRecords === 0) {
        this.retrieveTotalAssetCount(hashFilters, partialCount);
        if (this.totalRecords === 0){
            return true;
        }
    }

    this.logObj.pushMsg('retrieving queue details...');
    queueDetails = this.procInsRec.getQueueDetails();
    this.queueId       = queueDetails.queueId;
    this.recsProcessed = queueDetails.recsProcessed;
    this.recsFailed    = queueDetails.recsFailed;

    if (queueDetails.stateValues) {
        this.sumRecId = queueDetails.stateValues.SummaryData || {};
        this.hasSpawned = queueDetails.stateValues.hasSpawned === 'T';
        this.lowerLimit = +queueDetails.stateValues.lowerLimit || 0;
        this.upperLimit = +queueDetails.stateValues.upperLimit || 0;
    }
    
    this.logObj.pushMsg('loading depreciation methods and functions...');
    this.loadDeprMethodsFunctions();    
    blnToRequeue = this.searchAndDepreciateAssets(hashFilters);
    this.logObj.endMethod();
    return blnToRequeue;
};

/**
 * Retrieves the number of assets to be depreciated on this run
 *
 * Parameters:
 *     hashFilters {object} - container of all the filters that will be used for searching
 *         deprPeriod {Date} - depreciation date input from the user
 *         arrAssetTypes {string[]} - internal ids of asset types
 *         arrSubsidiaries {string[]} - internal ids of subsidiaries
 *     partialCount {number} - partial count from previous queue
 * Returns:
 *      {number} - total number of assets found
**/
FAM.AssetValueDepreciation.prototype.retrieveTotalAssetCount = function (hashFilters, partialCount) {
    this.logObj.startMethod('FAM.AssetValueDepreciation.retrieveTotalAssetCount');

    var srchAssets,
        timer    = new FAM.Timer(),
        deprMemo = this.procInsRec.stateValues.DeprMemo, 
        blnToRequeue = false;
    hashFilters.lowerLimit = hashFilters.lowerLimit ? Number(hashFilters.lowerLimit)+1 : 0;
    
    timer.start();
    srchAssets = this.searchAssetsToDepreciate(hashFilters, true);
    this.logObj.logExecution('Elapsed time for Total Asset Count Retreival: ' +
        timer.getReadableElapsedTime());

    if (srchAssets.results) {
        var totalRecords =  Number(partialCount) + Number(srchAssets.getValue(0, 'internalid', null, 'count'));
        
        var procInsRec = {
             state_defn : 'AssetTypes,Subsidiaries,DeprPeriod,DeprMemo',
             state      : hashFilters.arrAssetTypes.join(':') + ',' +
                          hashFilters.arrSubsidiaries.join(':') + ',' +
                          hashFilters.deprPeriod.getTime() + ',' + 
                          deprMemo
        }
        
        if (srchAssets.searchBatchEnd){
            this.logObj.logExecution('Partial assets found: ' + totalRecords);
            procInsRec.state_defn = procInsRec.state_defn + ',PartialCount,SearchBatchEnd';
            procInsRec.state      = procInsRec.state + ',' + 
                                    totalRecords + ',' + 
                                    srchAssets.searchBatchEnd;
            blnToRequeue = true;
        }
        else{
            this.logObj.logExecution('Total assets found: ' + totalRecords);
            this.totalRecords = totalRecords;
            procInsRec.state_defn = procInsRec.state_defn + ',TotalAssets';
            procInsRec.state      = procInsRec.state + ',' + this.totalRecords;
        }
        this.procInsRec.submitField(procInsRec, null, this.bypassUE);
    }

    if (this.totalRecords === 0  && !blnToRequeue) {
        this.logObj.logExecution('No assets found!');
        this.procInsRec.submitField({
            message : 'No assets found!',
            status  : FAM.BGProcessStatus.Completed
        }, null, this.bypassUE);
    }

    this.logObj.endMethod();
    return totalRecords;
};

/**
 * Retrieves or counts all assets that should be depreciated based on the criteria
 *
 * Parameters:
 *     hashFilters {object} - container of all the filters that will be used for searching
 *         deprPeriod {Date} - depreciation date input from the user
 *         arrAssetTypes {string[]} - internal ids of the asset types
 *         arrSubsidiaries {string[]} - internal ids of the subsidiaries
 *         lowerLimit {number} - 0 (number) or internal id of the asset record from where the
 *             search should start
 *         upperLimit {number} - null or internal id of the asset record from where the search
 *             should end
 *     blnCount {boolean} - flag if the function should count all assets or retrieve
 * Returns:
 *     object {FAM.Search} which contains the results
**/
FAM.AssetValueDepreciation.prototype.searchAssetsToDepreciate = function (hashFilters, blnCount) {
    this.logObj.startMethod('FAM.AssetValueDepreciation.searchAssetsToDepreciate');

    blnCount = blnCount || false;

    var formula = [],
        fSearch = new FAM.Search(new FAM.Asset_Record(), 'customsearch_fam_depreciateassets'),
        lastDay = (this.followAcctPer) ? hashFilters.deprPeriod :
            new Date(hashFilters.deprPeriod.getFullYear(), hashFilters.deprPeriod.getMonth() + 1, 0);

    if (hashFilters.arrAssetTypes.length > 0) {
        fSearch.addFilter('asset_type', null, 'anyof', hashFilters.arrAssetTypes);
    }
    if (FAM.Context.blnOneWorld) {
        fSearch.addFilter('isinactive', 'subsidiary', 'is', 'F');
        if (hashFilters.arrSubsidiaries.length > 0) {
            fSearch.addFilter('subsidiary', null, 'anyof', hashFilters.arrSubsidiaries);
        }
        else {
            fSearch.addFilter('subsidiary', null, 'noneof', '@NONE@');
        }
    }

    if (hashFilters.upperLimit) {
        fSearch.addFilter('internalidnumber', null, 'between', hashFilters.lowerLimit + 1,
            hashFilters.upperLimit);
    }
    else if (hashFilters.lowerLimit) {
        fSearch.addFilter('internalidnumber', null, 'greaterthan', hashFilters.lowerLimit);
    }

    if (FAM.Context.getPreference('deptmandatory') === 'T') {
        fSearch.addFilter('department', null, 'noneof', '@NONE@');
        fSearch.addFilter('isinactive', 'department', 'is', 'F');
    }
    else {
        formula.push('({custrecord_assetdepartment} is null or ' +
            '{custrecord_assetdepartment.isinactive} = \'F\')');
    }

    if (FAM.Context.getPreference('classmandatory') === 'T') {
        fSearch.addFilter('classfld', null, 'noneof', '@NONE@');
        fSearch.addFilter('isinactive', 'classfld', 'is', 'F');
    }
    else {
        formula.push('({custrecord_assetclass} is null or ' +
            '{custrecord_assetclass.isinactive} = \'F\')');
    }

    if (FAM.Context.getPreference('locmandatory') === 'T') {
        fSearch.addFilter('location', null, 'noneof', '@NONE@');
        fSearch.addFilter('isinactive', 'location', 'is', 'F');
    }
    else {
        formula.push('({custrecord_assetlocation} is null or ' +
            '{custrecord_assetlocation.isinactive} = \'F\')');
    }

    if (formula.length > 0) {
        fSearch.addFilter('formulanumeric', null, 'equalto', 1).setFormula('case when ' +
            formula.join(' and ') + ' then 1 else 0 end');
    }

    fSearch.addFilter('depr_start_date', null, 'onorbefore', lastDay);
    fSearch.addFilter('last_depr_date', null, 'before', lastDay);
    
    if (blnCount) {
        fSearch.addColumn('internalid', null, 'count');
    }
    else {
        fSearch.limit = this.queueLimit;

        fSearch.addColumn('internalid');
        fSearch.addColumn('initial_cost');
        fSearch.addColumn('current_cost');
        fSearch.addColumn('rv');
        fSearch.addColumn('lifetime');
        fSearch.addColumn('depr_start_date');
        fSearch.addColumn('annual_entry');
        fSearch.addColumn('fyscal_year_start');
        fSearch.addColumn('last_depr_period');
        fSearch.addColumn('book_value');
        fSearch.addColumn('lastDeprAmount');
        fSearch.addColumn('prior_nbv');
        fSearch.addColumn('lifetime_usage');
        fSearch.addColumn('subsidiary');
        fSearch.addColumn('currency','subsidiary');
        fSearch.addColumn('depr_charge_account');
        fSearch.addColumn('depr_account');
        fSearch.addColumn('cummulative_depr');
        fSearch.addColumn('asset_type');
        fSearch.addColumn('quantity');
        fSearch.addColumn('depr_rules');
        fSearch.addColumn('last_depr_date');
        fSearch.addColumn('depr_method');
        fSearch.addColumn('status');
        fSearch.addColumn('classfld');
        fSearch.addColumn('department');
        fSearch.addColumn('location');
        fSearch.addColumn('repair_main_sub_a');
        fSearch.addColumn('repair_main_cat');
        fSearch.addColumn('project');
    }
    
    fSearch.run();
    this.logObj.endMethod();
    return fSearch;
};

/**
 * Retrieves and depreciates assets based on user selection
 *
 * Parameters:
 *     hashFilters {object} - container of all the filters that will be used for searching
 *         deprPeriod {Date} - depreciation date input from the user
 *         arrAssetTypes {string[]} - internal ids of asset types
 *         arrSubsidiaries {string[]} - internal ids of subsidiaries
 * Returns:
 *     true {boolean}  - processing should be re-queued
 *     false {boolean} - processing should not be re-queued; essentially setting the deployment to
 *                       standby
**/
FAM.AssetValueDepreciation.prototype.searchAndDepreciateAssets = function (hashFilters) {
    this.logObj.startMethod('FAM.AssetValueDepreciation.searchAndDepreciateAssets');

    var i = 0, srchAssets, updatedValues, recObj, parentInfo,
        blnToRequeue = false,
        timer = new FAM.Timer(),
        lastDayInput = (this.followAcctPer) ? hashFilters.deprPeriod :
            new Date(hashFilters.deprPeriod.getFullYear(),hashFilters.deprPeriod.getMonth() + 1, 0);

    hashFilters.lowerLimit = this.lowerLimit;
    hashFilters.upperLimit = this.upperLimit;

    this.logObj.pushMsg('Searching for assets');
    timer.start();
    srchAssets = this.searchAssetsToDepreciate(hashFilters);
    this.logObj.logExecution('Elapsed time for Asset Search: ' +
        timer.getReadableElapsedTime());

    if (srchAssets.results) {
        if (this.upperLimit === 0) {
            this.upperLimit = srchAssets.getId(srchAssets.results.length - 1);
            this.updateStatus({ state : JSON.stringify({
                SummaryData : this.sumRecId,
                lowerLimit : srchAssets.getId(0) - 1,
                upperLimit : this.upperLimit,
                hasSpawned : this.hasSpawned ? 'T' : 'F'
            }) });
        }

        for (i = 0; i < srchAssets.results.length; i++) {
            if (!this.hasSpawned && (i % this.pollingIndex) === 0) {
                this.hasSpawned = this.procInsRec.scheduleNextQueue(this.upperLimit);
                if (this.hasSpawned) {
                    this.updateStatus({ state : JSON.stringify({
                        SummaryData : this.sumRecId,
                        lowerLimit : srchAssets.getId(i) - 1,
                        upperLimit : this.upperLimit,
                        hasSpawned : this.hasSpawned ? 'T' : 'F'
                    }) });
                }
            }

            if (this.hasExceededLimit()) {
                blnToRequeue = true;
                break;
            }

            // Re-initialze logObj for each asset to prevent flooding of log data
            this.logObj = new printLogObj('debug');
            this.logObj.startMethod('FAM.AssetValueDepreciation.searchAndDepreciateAssets');
            this.logObj.logExecution('depreciate asset: ' + srchAssets.getId(i));

            timer.start();
            recObj = {
                assetId : srchAssets.getId(i),
                origCost : srchAssets.getValue(i, 'initial_cost'),
                currCost : srchAssets.getValue(i, 'current_cost'),
                resValue : srchAssets.getValue(i, 'rv'),
                lifetime : srchAssets.getValue(i, 'lifetime'),
                deprStart : srchAssets.getValue(i, 'depr_start_date'),
                annualMet : srchAssets.getValue(i, 'annual_entry'),
                fiscalYr : srchAssets.getValue(i, 'fyscal_year_start'),
                lastPeriod : srchAssets.getValue(i, 'last_depr_period'),
                currNBV : srchAssets.getValue(i, 'book_value'),
                lastDepAmt : srchAssets.getValue(i, 'lastDeprAmount'),
                priorNBV : srchAssets.getValue(i, 'prior_nbv'),
                lifeUsage : srchAssets.getValue(i, 'lifetime_usage'),
                subsidiary : srchAssets.getValue(i, 'subsidiary'),
                chargeAcc : srchAssets.getValue(i, 'depr_charge_account'),
                deprAcc : srchAssets.getValue(i, 'depr_account'),
                currId : srchAssets.getValue(i, 'currency','subsidiary'),
                cumDepr : srchAssets.getValue(i, 'cummulative_depr'),
                assetType : srchAssets.getValue(i, 'asset_type'),
                assetTypeName : srchAssets.getText(i, 'asset_type'),
                quantity : srchAssets.getValue(i, 'quantity'),
                deprRule : srchAssets.getValue(i, 'depr_rules'),
                lastDate : srchAssets.getValue(i, 'last_depr_date'),
                deprMethod : srchAssets.getValue(i, 'depr_method'),
                status : srchAssets.getValue(i, 'status'),
                classfld : srchAssets.getValue(i, 'classfld'),
                department : srchAssets.getValue(i, 'department'),
                location : srchAssets.getValue(i, 'location'),
                repSubA : srchAssets.getText(i, 'repair_main_sub_a'),
                repMainCat : srchAssets.getText(i, 'repair_main_cat'),
                repSubAId : srchAssets.getValue(i, 'repair_main_sub_a'),
                repMainCatId : srchAssets.getValue(i, 'repair_main_cat'),
                project : srchAssets.getValue(i, 'project')
            };

            if(+FAM.SystemSetup.getSetting('isSummarizeJe') === FAM.SummarizeBy['Parent']) {
                parentInfo = this.findAncestorAsset(recObj.assetId);
                recObj.parentAssetId = parentInfo.id;
                recObj.parentAssetName = parentInfo.name;
            }

            updatedValues = this.depreciateRecord(recObj, lastDayInput);
            blnToRequeue = this.checkResults(updatedValues, srchAssets.getId(i),
                timer.getReadableElapsedTime());

            if (blnToRequeue) {
                break;
            }
        }

        i = i && i -1;
        this.updateStatus({ state : JSON.stringify({
            SummaryData : this.sumRecId,
            lowerLimit : srchAssets.getId(i),
            upperLimit : this.upperLimit,
            hasSpawned : this.hasSpawned ? 'T' : 'F'
        }) });
    }

    if (blnToRequeue) {
        this.logObj.logExecution('Execution Limit | Remaining Usage: ' +
            FAM.Context.getRemainingUsage() + ' | Time Elapsed: ' +
            this.perfTimer.getReadableElapsedTime());
    }
    else { // no results or processing completed
        blnToRequeue = this.checkCompleteness(this.lowerLimit, this.upperLimit, this.hasSpawned);
    }


    this.logObj.endMethod();
    return blnToRequeue;
};

/**
 * Checks result object of depreciateRecord, updates success/fail count, and writes to Process Log
 *
 * Parameters:
 *     resultObj {object} - return object of depreciateRecord
 *     assetId {number} - internal id of the asset that was depreciated
 *     elapsedTime {string} - elapsed time depreciating the asset, for logging purposes
 * Returns:
 *     true {boolean} - governance limit reached, requeue script first
 *     false {boolean} - proceed depreciating next asset
**/
FAM.AssetValueDepreciation.prototype.checkResults = function (resultObj, assetId, elapsedTime) {
    this.logObj.startMethod('FAM.AssetValueDepreciation.checkResults');

    var ret = false;

    if (resultObj && resultObj.error) {
        this.recsFailed++;
        this.procInsRec.writeToProcessLog('Processing Failed: ' + resultObj.error,
            'Error', 'Asset Id: ' + assetId);
        this.logObj.pushMsg('Failed depreciating asset: ' + assetId + ', Elapsed Time: '
            + elapsedTime + ', Failed: ' + this.recsFailed, 'error');
        this.logObj.printLog();
    }
    else if (resultObj && resultObj.isAborted) {
        this.logObj.logExecution('Asset (Id: ' + assetId +
            ') depreciation requeued, Elapsed Time: ' + elapsedTime);
        ret = true;
    }
    else {
        this.recsProcessed++;
        this.logObj.logExecution('Successful depreciation for asset: ' + assetId +
            ', Elapsed Time: ' + elapsedTime + ', Success: ' +
            this.recsProcessed);
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Checks if depreciation of asset values is completed
 *
 * Parameters:
 *     lowerLimit {number} - lower limit of the current queue
 *     upperLimit {number} - upper limit of the current queue
 *     hasSpawned {boolean} - tells if the current queue has already spawned another queue or not
 * Returns:
 *     true {boolean} - either of: 1) complete, 2) polling, or 3) hasn't called another queue
 *     false {boolean} - only the current queue is complete
**/
FAM.AssetValueDepreciation.prototype.checkCompleteness = function (lowerLimit, upperLimit,
    hasSpawned) {

    this.logObj.startMethod('FAM.AssetValueDepreciation.checkCompleteness');

    var ret = false, procStatus = +this.procInsRec.lookupField('status') || 0;

    if (upperLimit === 0) {
        // processing about to be completed, poll until all queues are finished
        while (this.procInsRec.hasOnGoingQueue()) {
            procStatus = +this.procInsRec.lookupField('status') || 0;
            if (procStatus !== FAM.BGProcessStatus.InProgress &&
                procStatus !== FAM.BGProcessStatus.Queued) {

                this.logObj.logExecution('Processing has already finished | Status: ' +
                    this.procInsRec.getStatusName(procStatus));
                break;
            }
            if (this.hasExceededLimit()) {
                ret = true;
                this.logObj.logExecution('Execution Limit | Remaining Usage: ' +
                    FAM.Context.getRemainingUsage() + ' | Time Elapsed: ' +
                    this.perfTimer.getReadableElapsedTime());
                break;
            }
        }

        if (!ret) {
            ret = true;

            if (procStatus === FAM.BGProcessStatus.InProgress ||
                procStatus === FAM.BGProcessStatus.Queued) {

                this.updateProcIns({ status : FAM.BGProcessStatus.Completed });
            }
        }
    }
    else {
        // current batch complete
        if (!hasSpawned) {
            ret = true;
            this.updateStatus({ state : JSON.stringify({
                SummaryData : this.sumRecId,
                lowerLimit : upperLimit,
                upperLimit : 0,
                hasSpawned : 'F'
            }) });
        }
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * [OVERRIDE] Substitutes blank fields with default values
 *
 * Parameters:
 *     recObj {object} - record object to be depreciated
 * Returns:
 *     void
**/
FAM.AssetValueDepreciation.prototype.setDefaults = function (recordObj) {
    this.logObj.startMethod('FAM.AssetValueDepreciation.setDefaults');

    FAM.DepreciationCommon.prototype.setDefaults.apply(this, arguments);

    recordObj.status = +recordObj.status || FAM.AssetStatus.New;
    recordObj.classfld = recordObj.classfld || 0;
    recordObj.department = recordObj.department || 0;
    recordObj.location = recordObj.location || 0;
    var primaryId = FAM.Util_Shared.getPrimaryBookId();
    if (FAM.Context.blnMultiBook && primaryId){
        recordObj.bookingId = primaryId;
    }else{
        recordObj.bookingId = '';
    }

    this.logObj.endMethod();
};

/**
 * [OVERRIDE] Validates record fields to prevent depreciation errors
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 * Returns:
 *     void
 * Throws:
 *     Invalid Data Errors
**/
FAM.AssetValueDepreciation.prototype.validateFields = function (recordObj) {
    this.logObj.startMethod('FAM.AssetValueDepreciation.validateFields');

    FAM.DepreciationCommon.prototype.validateFields.apply(this, arguments);

    if (FAM.Context.blnMultiCurrency) {
        if (!recordObj.currId) {
            throw nlapiCreateError('USER_ERROR', FAM.resourceManager.GetString(
                'custpage_fields_missing', null, null, ['Currency']));
        }
        if (this.currCache.isInactive(recordObj.currId)) {
            throw nlapiCreateError('USER_ERROR', FAM.resourceManager.GetString(
                'custpage_fields_inactive', null, null, ['Currency']));
        }
    }

    this.logObj.endMethod();
};

/**
 * [OVERRIDE] Writes depreciation history record for the next depreciation period
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 *     nextDeprAmt {number} - depreciation amount for the next period
 *     nextDeprDate {Date} - date of the next depreciation
 * Returns:
 *     void
**/
FAM.AssetValueDepreciation.prototype.writeHistory = function (recordObj, nextDeprAmt,
    nextDeprDate) {
    this.logObj.startMethod('FAM.AssetValueDepreciation.writeHistory');

    var fields, currNBV, histRec = new FAM.DepreciationHistory_Record(),
        noDPCurr = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');

    currNBV = ncRoundCurr(recordObj.currNBV - nextDeprAmt, recordObj.currSym, noDPCurr);

    fields = {
        asset_type         : recordObj.assetType,
        transaction_type   : FAM.TransactionType.Depreciation,
        asset              : recordObj.assetId,
        date               : nlapiDateToString(nextDeprDate),
        transaction_amount : nextDeprAmt,
        net_book_value     : currNBV,
        quantity           : recordObj.quantity,
        name               : 'dhr-default-name'
    };

    if (recordObj.subsidiary) { fields.subsidiary = recordObj.subsidiary; }
    if (recordObj.bookingId) { fields.bookId = recordObj.bookingId;}

    if (nextDeprAmt !== 0) {
        fields.summaryRecord  = this.writeSummary(recordObj, nextDeprDate);
    }

    histRec.createRecord(fields, null, this.bypassUE);
    if (isNaN(histRec.submitRecord(false, null, this.bypassUE))) {
        this.logObj.logExecution('Depreciation History creation failed for asset id: ' +
            recordObj.assetId, 'ERROR');
    }

    this.logObj.endMethod();
};

/**
 * Writes Summary Record which will be used as placed holder for total depreciation ammounts
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 *     nextDeprDate {Date} - date of the next depreciation
 * Returns:
 *     Record Id {Integer} - Created Record Id
**/
FAM.AssetValueDepreciation.prototype.writeSummary = function(recordObj, nextDeprDate) {
    this.logObj.startMethod('FAM.AssetValueDepreciation.writeSummary');
    
    recordObj.project = recordObj.project || 0;
    var groupInfo    = this.getJournalGrouping(recordObj),
        journalMemo  = this.constructJournalMemo(recordObj, groupInfo),
        summary;
    
    if (groupInfo.groupId instanceof Array){
        groupInfo.groupId = groupInfo.groupId.join('|');
    }
    summary = this.getExistingSummary(recordObj, nextDeprDate, groupInfo);

    if (!summary[recordObj.project]) {
        // Make new Summary Record Entry
        var bookId = recordObj.bookingId || '',
            grp = groupInfo.groupBy + (
                    groupInfo.groupId ? '-' + groupInfo.groupId : '');
        var srRec = new FAM.SummaryRecord(),
            fieldValue = {
                assetType        : recordObj.assetType,
                groupInfo        : grp,
                deprDate         : nlapiDateToString(nextDeprDate),
                deprAcc          : recordObj.deprAcc,
                chargeAcc        : recordObj.chargeAcc,
                histcount        : 0,
                journalMemo      : journalMemo,
                acctBook         : bookId,
                name             : 'summary-default-name'
            };

        if(recordObj.subsidiary) {
            fieldValue.subsidiary = recordObj.subsidiary;
        }
        if(recordObj.department) {
            fieldValue.department = recordObj.department;
        }
        if(recordObj.classfld) {
            fieldValue.classid = recordObj.classfld;
        }
        if(recordObj.location) {
            fieldValue.location = recordObj.location;
        }
        if(recordObj.project) {
            fieldValue.project = recordObj.project;
        }

        srRec.createRecord(fieldValue, null, this.bypassUE);
        try {
            summary[recordObj.project] = srRec.submitRecord(null, null, this.bypassUE);
        }
        catch(e) {
            this.logObj.logExecution('Error while creating summary record: ' + e.toString(),
                'error');
            throw e;
        }
    }

    this.logObj.endMethod();
    return summary[recordObj.project];
};

/**
 * [OVERRIDE] Updates the Status of the record and saves the changes
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 * Returns:
 *     void
**/
FAM.AssetValueDepreciation.prototype.updateStatusAndSave = function (recordObj) {
    this.logObj.startMethod('FAM.AssetValueDepreciation.updateStatusAndSave');

    var assetRec, fields;
    if (recordObj.assetId) {
        fields = {
            book_value : recordObj.currNBV,
            last_depr_period : recordObj.lastPeriod,
            lastDeprAmount : recordObj.lastDepAmt,
            prior_nbv : recordObj.priorNBV,
            last_depr_date : nlapiDateToString(recordObj.lastDate),
            cummulative_depr : recordObj.cumDepr,            
            depr_end_date : nlapiDateToString(recordObj.deprEnd)
        };

        if (recordObj.lastPeriod === recordObj.realLifetime) {
            fields.status = FAM.AssetStatus['Fully Depreciated'];
        }
        else {
            fields.status = FAM.AssetStatus.Depreciating;
        }

        assetRec = new FAM.Asset_Record();
        assetRec.recordId = recordObj.assetId;
        //assetRec.submitField(fields, false);
        assetRec.submitField(fields, false, this.bypassUE); //3rd param bypasses user event when set to true;

    }

    this.logObj.endMethod();
};
