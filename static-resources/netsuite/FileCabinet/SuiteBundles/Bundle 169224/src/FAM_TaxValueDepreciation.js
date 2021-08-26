/**
 * � 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

/**
 * Starter for Background Processing function for Tax Value (or Tax Method) Depreciation
 *
 * Parameters:
 *     BGP {FAM.BGProcess} - Process Instance Record for this background process
 * Returns:
 *     true {boolean} - processing should be requeued
 *     false {boolean} - processing should not be requeued; essentially setting the deployment to
 *                       standby
**/
function famTaxValueDepreciation(BGP) {
    var taxDepreciation = new FAM.TaxValueDepreciation(BGP);

    try {
        return taxDepreciation.run();
    }
    catch (e) {
        taxDepreciation.logObj.printLog();
        throw e;
    }
}

/**
 * Class for depreciating tax methods; Inherits FAM.DepreciationCommon
 *
 * Constructor Parameters:
 *     procInsRec {FAM.BGProcess} - Process Instance Record for this background process
**/
FAM.TaxValueDepreciation = function (procInsRec) {
    // Call Parent Constructor
    FAM.DepreciationCommon.apply(this, arguments);

    this.grpMasterInfo = null;
    this.classCache = new FAM.FieldCache('classification');
    this.deptCache = new FAM.FieldCache('department');
    this.locCache = new FAM.FieldCache('location');
};

// Prototypal Inheritance
FAM.TaxValueDepreciation.prototype = Object.create(FAM.DepreciationCommon.prototype);

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
FAM.TaxValueDepreciation.prototype.run = function () {
    this.logObj.startMethod('FAM.TaxValueDepreciation.run');
    this.perfTimer.start();

    var hashFilters, queueDetails,
        blnToRequeue    = false,
        arrAssetTypes   = this.procInsRec.stateValues.AssetTypes,
        arrSubsidiaries = this.procInsRec.stateValues.Subsidiaries,
        deprPeriod      = new Date(+this.procInsRec.stateValues.DeprPeriod),
        arrAcctBooks    = this.procInsRec.stateValues.AcctngBooks,
        lowerLimit      = this.procInsRec.stateValues.SearchBatchEnd || 0,
        partialCount    = this.procInsRec.stateValues.PartialCount || 0,
        timer           = new FAM.Timer();

    this.totalRecords = +this.procInsRec.stateValues.TotalMethods || 0;

    arrAssetTypes   = arrAssetTypes ? arrAssetTypes.split(':') : [];
    arrSubsidiaries = arrSubsidiaries ? arrSubsidiaries.split(':') : [];
    arrAcctBooks    = arrAcctBooks ? arrAcctBooks.split(':') : [];

    this.logObj.pushMsg('finished variable initialization');

    hashFilters = {
        arrAssetTypes   : arrAssetTypes,
        arrSubsidiaries : arrSubsidiaries,
        deprPeriod      : deprPeriod,
        arrAcctBooks    : arrAcctBooks,
        lowerLimit      : lowerLimit
    };    
    
    if (this.totalRecords === 0) {
        this.retrieveTotalTaxCount(hashFilters, partialCount);
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

    this.logObj.pushMsg('Get group master info');
    timer.start();
    this.grpMasterInfo = FAM.GroupMaster.getInfo('alternate_method', arrSubsidiaries, true);
    this.logObj.logExecution('Elapsed time loading Group Info: ' +
        timer.getReadableElapsedTime());

    blnToRequeue = this.searchAndDepreciateTaxMethods(hashFilters);

    this.logObj.endMethod();
    return blnToRequeue;
};

/**
 * Retrieves the number of tax methods to be depreciated on this run
 *
 * Parameters:
 *     hashFilters {object} - container of all the filters that will be used for searching
 *         deprPeriod {Date} - depreciation date input from the user
 *         arrAssetTypes {string[]} - internal ids of asset types
 *         arrSubsidiaries {string[]} - internal ids of subsidiaries
 *     partialCount {number} - partial count from previous queue
 * Returns:
 *     {number} - total number of tax methods found
**/
FAM.TaxValueDepreciation.prototype.retrieveTotalTaxCount = function (hashFilters, partialCount) {
    this.logObj.startMethod('FAM.TaxValueDepreciation.retrieveTotalTaxCount');

    var srchTax,
        timer    = new FAM.Timer(),
        deprMemo = this.procInsRec.stateValues.DeprMemo,
        blnToRequeue = false;
    hashFilters.lowerLimit = hashFilters.lowerLimit ? Number(hashFilters.lowerLimit)+1 : 0;
    
    timer.start();
    srchTax = this.searchTaxMethodsToDepreciate(hashFilters, true);
    this.logObj.logExecution('Elapsed time for Total Tax Method Count Retreival: ' +
        timer.getReadableElapsedTime());

    if (srchTax.results) {
        var totalRecords = Number(partialCount) + Number(srchTax.getValue(0, 'internalid', null, 'count'));
        
        var procInsRec = {
            state_defn : 'AssetTypes,Subsidiaries,DeprPeriod,DeprMemo,AcctngBooks',
            state      : hashFilters.arrAssetTypes.join(':') + ',' +
                         hashFilters.arrSubsidiaries.join(':') + ',' +
                         hashFilters.deprPeriod.getTime() + ',' + 
                         deprMemo + ',' +
                         hashFilters.arrAcctBooks.join(':')
        }
        
        if (srchTax.searchBatchEnd){
            this.logObj.logExecution('Partial tax methods found: ' + totalRecords);
            procInsRec.state_defn = procInsRec.state_defn + ',PartialCount,SearchBatchEnd';
            procInsRec.state      = procInsRec.state + ',' + 
                                    totalRecords + ',' + 
                                    srchTax.searchBatchEnd;
            blnToRequeue = true;
        }
        else{
            this.logObj.logExecution('Total tax methods found: ' + totalRecords);
            this.totalRecords = totalRecords;            
            procInsRec.state_defn = procInsRec.state_defn + ',TotalMethods';
            procInsRec.state      = procInsRec.state + ',' + this.totalRecords;
        }
        this.procInsRec.submitField(procInsRec, null, this.bypassUE);  
    }

    if (this.totalRecords === 0 && !blnToRequeue) {
        this.logObj.logExecution('No tax methods found!');
        this.procInsRec.submitField({
            message : 'No tax methods found!',
            status  : FAM.BGProcessStatus.Completed
        }, null, this.bypassUE);
    }

    this.logObj.endMethod();
    return totalRecords;
};

/**
 * Retrieves or counts all tax methods that should be depreciated based on the criteria
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
FAM.TaxValueDepreciation.prototype.searchTaxMethodsToDepreciate = function (hashFilters, blnCount) {
    this.logObj.startMethod('FAM.TaxValueDepreciation.searchTaxMethodsToDepreciate');
    blnCount = blnCount || false;

    var fSearch = new FAM.Search(new FAM.AltDeprMethod_Record(),
            'customsearch_fam_depreciatetaxmethods'),
        lastDay = (this.followAcctPer) ? hashFilters.deprPeriod :
            new Date(hashFilters.deprPeriod.getFullYear(), hashFilters.deprPeriod.getMonth() + 1, 0),
        arrAcctBooks = ['@NONE@']; // search for blanks acct books regardless of user input

    fSearch.setJoinRecord('parent_asset', new FAM.Asset_Record());

    if (hashFilters.arrAssetTypes.length > 0) {
        fSearch.addFilter('asset_type', 'parent_asset', 'anyof', hashFilters.arrAssetTypes);
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
    if (hashFilters.arrAcctBooks.length > 0) {
        arrAcctBooks = arrAcctBooks.concat(hashFilters.arrAcctBooks);
    }

    if (hashFilters.upperLimit) {
        fSearch.addFilter('internalidnumber', null, 'between', hashFilters.lowerLimit + 1,
            hashFilters.upperLimit);
    }
    else if (hashFilters.lowerLimit) {
        fSearch.addFilter('internalidnumber', null, 'greaterthan', hashFilters.lowerLimit);
    }

    fSearch.addFilter('booking_id', null, 'anyof', arrAcctBooks);
    fSearch.addFilter('depr_start_date', null, 'onorbefore', lastDay);
    fSearch.addFilter('last_depr_date', null, 'before', lastDay);
    
    if (blnCount) {
        fSearch.addColumn('internalid', null, 'count');
    }
    else {
        fSearch.limit = this.queueLimit;

        fSearch.addColumn('internalid');
        fSearch.addColumn('alternate_method');
        fSearch.addColumn('original_cost');
        fSearch.addColumn('current_cost');
        fSearch.addColumn('residual_value');
        fSearch.addColumn('asset_life');
        fSearch.addColumn('depr_start_date');
        fSearch.addColumn('annual_entry');
        fSearch.addColumn('financial_year_start');
        fSearch.addColumn('last_depr_period');
        fSearch.addColumn('book_value');
        fSearch.addColumn('last_depr_amount');
        fSearch.addColumn('prior_year_nbv');
        fSearch.addColumn('subsidiary');
        fSearch.addColumn('charge_account');
        fSearch.addColumn('depr_account');
        fSearch.addColumn('parent_asset');
        fSearch.addColumn('cumulative_depr');
        fSearch.addColumn('asset_type', 'parent_asset');
        fSearch.addColumn('quantity', 'parent_asset');
        fSearch.addColumn('depr_rules', 'parent_asset');
        fSearch.addColumn('last_depr_date');
        fSearch.addColumn('depr_method');
        fSearch.addColumn('status');
        fSearch.addColumn('classfld', 'parent_asset');
        fSearch.addColumn('department', 'parent_asset');
        fSearch.addColumn('location', 'parent_asset');
        fSearch.addColumn('convention');
        fSearch.addColumn('period_convention');
        fSearch.addColumn('depr_period');
        fSearch.addColumn('is_group_master');
        fSearch.addColumn('is_group_depr');
        fSearch.addColumn('booking_id');
        fSearch.addColumn('currency');
        fSearch.addColumn('symbol', 'currency');
        fSearch.addColumn('created');
        fSearch.addColumn('depr_active');
        fSearch.addColumn('depr_active', 'parent_asset');
        fSearch.addColumn('lifetime_usage', 'parent_asset');
        fSearch.addColumn('project', 'parent_asset');
        fSearch.addColumn('repair_main_sub_a', 'parent_asset');
        fSearch.addColumn('repair_main_cat', 'parent_asset');
    }

    fSearch.run();
    this.logObj.endMethod();
    return fSearch;
};

/**
 * Retrieves and depreciates tax methods based on user selection
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
FAM.TaxValueDepreciation.prototype.searchAndDepreciateTaxMethods = function (hashFilters) {
    this.logObj.startMethod('FAM.TaxValueDepreciation.searchAndDepreciateTaxMethods');

    var i = 0, srchTax, updatedValues, recObj, parentInfo, taxRec,
        blnToRequeue = false,
        timer        = new FAM.Timer(),
        lastDayInput = (this.followAcctPer) ? hashFilters.deprPeriod :
                            new Date(hashFilters.deprPeriod.getFullYear(),hashFilters.deprPeriod.getMonth() + 1, 0);
        datev4 = new Date(2014,5,25).getTime(); //date of FAM version 4.0 bundle release

    hashFilters.lowerLimit = this.lowerLimit;
    hashFilters.upperLimit = this.upperLimit;

    this.logObj.pushMsg('Searching for assets');
    timer.start();
    srchTax = this.searchTaxMethodsToDepreciate(hashFilters);
    this.logObj.logExecution('Elapsed time for Tax Method Search: ' +
        timer.getReadableElapsedTime());

    if (srchTax.results) {
        if (this.upperLimit === 0) {
            this.upperLimit = srchTax.getId(srchTax.results.length - 1);
            this.updateStatus({ state : JSON.stringify({ 
                SummaryData : this.sumRecId,
                lowerLimit : srchTax.getId(0) - 1,
                upperLimit : this.upperLimit,
                hasSpawned : this.hasSpawned ? 'T' : 'F'
            }) });
        }

        for (i = 0; i < srchTax.results.length; i++) {
            if (!this.hasSpawned && (i % this.pollingIndex) === 0) {
                this.hasSpawned = this.procInsRec.scheduleNextQueue(this.upperLimit);
                if (this.hasSpawned) {
                    this.updateStatus({ state : JSON.stringify({ 
                        SummaryData : this.sumRecId,
                        lowerLimit : srchTax.getId(i) - 1,
                        upperLimit : this.upperLimit,
                        hasSpawned : this.hasSpawned ? 'T' : 'F'
                    }) });
                }
            }

            if (this.hasExceededLimit()) {
                blnToRequeue = true;
                break;
            }

            if (srchTax.getValue(i, 'is_group_master') !== 'T' &&
                srchTax.getValue(i, 'is_group_depr') === 'T') {

                this.recsProcessed++;
                this.logObj.logExecution('Skip depreciation for tax method: ' + srchTax.getId(i) +
                    ', Part of Group Depreciation, Success: ' + this.recsProcessed);
                continue;
            }

            // Re-initialze logObj for each asset to prevent flooding of log data
            this.logObj = new printLogObj('debug');
            this.logObj.startMethod('FAM.TaxValueDepreciation.searchAndDepreciateTaxMethods');
            this.logObj.logExecution('depreciate tax method: ' + srchTax.getId(i));

            timer.start();
            recObj = {
                assetId         : srchTax.getValue(i, 'parent_asset'),
                taxMetId        : srchTax.getId(i),
                altMethod       : srchTax.getValue(i, 'alternate_method'),
                origCost        : srchTax.getValue(i, 'original_cost'),
                currCost        : srchTax.getValue(i, 'current_cost'),
                resValue        : srchTax.getValue(i, 'residual_value'),
                lifetime        : srchTax.getValue(i, 'asset_life'),
                deprStart       : srchTax.getValue(i, 'depr_start_date'),
                annualMet       : srchTax.getValue(i, 'annual_entry'),
                fiscalYr        : srchTax.getValue(i, 'financial_year_start'),
                lastPeriod      : srchTax.getValue(i, 'last_depr_period'),
                currNBV         : srchTax.getValue(i, 'book_value'),
                lastDepAmt      : srchTax.getValue(i, 'last_depr_amount'),
                priorNBV        : srchTax.getValue(i, 'prior_year_nbv'),
                subsidiary      : srchTax.getValue(i, 'subsidiary'),
                chargeAcc       : srchTax.getValue(i, 'charge_account'),
                deprAcc         : srchTax.getValue(i, 'depr_account'),
                currId          : srchTax.getValue(i, 'currency'),
                currSym         : srchTax.getValue(i, 'symbol', 'currency'),
                cumDepr         : srchTax.getValue(i, 'cumulative_depr'),
                assetType       : srchTax.getValue(i, 'asset_type', 'parent_asset'),
                assetTypeName   : srchTax.getText(i, 'asset_type', 'parent_asset'),
                quantity        : srchTax.getValue(i, 'quantity', 'parent_asset'),
                deprRule        : srchTax.getValue(i, 'depr_rules', 'parent_asset'),
                lastDate        : srchTax.getValue(i, 'last_depr_date'),
                deprMethod      : srchTax.getValue(i, 'depr_method'),
                status          : srchTax.getValue(i, 'status'),
                classfld        : srchTax.getValue(i, 'classfld', 'parent_asset'),
                department      : srchTax.getValue(i, 'department', 'parent_asset'),
                location        : srchTax.getValue(i, 'location', 'parent_asset'),
                repSubA         : srchTax.getText(i, 'repair_main_sub_a', 'parent_asset'),
                repMainCat      : srchTax.getText(i, 'repair_main_cat', 'parent_asset'),
                repSubAId       : srchTax.getValue(i, 'repair_main_sub_a', 'parent_asset'),
                repMainCatId    : srchTax.getValue(i, 'repair_main_cat', 'parent_asset'),
                convention      : srchTax.getValue(i, 'convention'),
                periodCon       : srchTax.getValue(i, 'period_convention'),
                deprPeriod      : srchTax.getValue(i, 'depr_period'),
                isGrpMaster     : srchTax.getValue(i, 'is_group_master'),
                isGrpDepr       : srchTax.getValue(i, 'is_group_depr'),
                bookingId       : srchTax.getValue(i, 'booking_id'),
                created         : srchTax.getValue(i, 'created'),
                isDeprActive    : srchTax.getValue(i, 'depr_active'),
                isAstDeprActive : srchTax.getValue(i, 'depr_active', 'parent_asset'),
                lifeUsage       : srchTax.getValue(i, 'lifetime_usage', 'parent_asset'),
                project         : srchTax.getValue(i, 'project', 'parent_asset')
            };

            if(+FAM.SystemSetup.getSetting('isSummarizeJe') === FAM.SummarizeBy['Parent']) {
                parentInfo = this.findAncestorAsset(recObj.assetId);
                recObj.parentAssetId = parentInfo.id;
                recObj.parentAssetName = parentInfo.name;
            }
            
            //update pre-v4 null depr active values into parent asset depr active values
            if (nlapiStringToDate(recObj.created).getTime() <= datev4 && !recObj.isDeprActive) {
                this.logObj.logExecution('Set depreciation active for tax method: ' + srchTax.getId(i));
                recObj.isDeprActive = recObj.isAstDeprActive;
            } 
            
            //skips tax methods with depreciation active not equal to true
            if (recObj.isDeprActive != FAM.DeprActive.True) {
                this.recsProcessed++;
                this.logObj.logExecution('Skip depreciation for tax method: ' + srchTax.getId(i));

                if(nlapiStringToDate(recObj.created).getTime() <= datev4){
                    this.logObj.logExecution('Pre-V4 Tax Method, setting Depreciation Active value to False');

                    taxRec = new FAM.AltDeprMethod_Record();
                    taxRec.recordId = recObj.taxMetId;
                    taxRec.submitField({depr_active: FAM.DeprActive.False}, false, this.bypassUE);
                }
                
                continue;
            }

            updatedValues = this.depreciateRecord(recObj, lastDayInput);
            blnToRequeue = this.checkResults(updatedValues, srchTax.getId(i),
                timer.getReadableElapsedTime());

            if (blnToRequeue) {
                break;
            }

            //this.updateStatus(); // Update Status Real-time disabled. Issue 298483
        }

        i = i && i -1;
        this.updateStatus({ state : JSON.stringify({ 
            SummaryData : this.sumRecId,
            lowerLimit : srchTax.getId(i),
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
 *     taxMetId {number} - internal id of the asset that was depreciated
 *     elapsedTime {string} - elapsed time depreciating the asset, for logging purposes
 * Returns:
 *     true {boolean} - governance limit reached, requeue script first
 *     false {boolean} - proceed depreciating next asset
**/
FAM.TaxValueDepreciation.prototype.checkResults = function (resultObj, taxMetId, elapsedTime) {
    this.logObj.startMethod('FAM.TaxValueDepreciation.checkResults');

    var ret = false;

    if (resultObj && resultObj.error) {
        this.recsFailed++;
        this.procInsRec.writeToProcessLog('Processing Failed: ' + resultObj.error,
            'Error', 'Tax Method Id: ' + taxMetId);
        this.logObj.pushMsg('Failed depreciating tax method: ' + taxMetId + ', Elapsed Time: '
            + elapsedTime + ', Failed: ' + this.recsFailed, 'error');
        this.logObj.printLog();
    }
    else if (resultObj && resultObj.isAborted) {
        this.logObj.logExecution('Tax Method (Id: ' + taxMetId +
            ') depreciation requeued, Elapsed Time: ' + elapsedTime);
        ret = true;
    }
    else {
        this.recsProcessed++;
        this.logObj.logExecution('Successful depreciation for tax method: ' + taxMetId +
            ', Elapsed Time: ' + elapsedTime + ', Success: ' +
            this.recsProcessed);
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Checks if depreciation of tax method values is completed
 *
 * Parameters:
 *     lowerLimit {number} - lower limit of the current queue
 *     upperLimit {number} - upper limit of the current queue
 *     hasSpawned {boolean} - tells if the current queue has already spawned another queue or not
 * Returns:
 *     true {boolean} - either of: 1) complete, 2) polling, or 3) hasn't called another queue
 *     false {boolean} - only the current queue is complete
**/
FAM.TaxValueDepreciation.prototype.checkCompleteness = function (lowerLimit, upperLimit,
    hasSpawned) {

    this.logObj.startMethod('FAM.TaxValueDepreciation.checkCompleteness');

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
FAM.TaxValueDepreciation.prototype.setDefaults = function (recordObj) {
    this.logObj.startMethod('FAM.TaxValueDepreciation.setDefaults');

    recordObj.isGrpDepr = recordObj.isGrpDepr === 'T';
    recordObj.isGrpMaster = recordObj.isGrpMaster === 'T';

    if (recordObj.isGrpDepr && recordObj.isGrpMaster) {
        recordObj.origCost = 0; // for PB defaulting; should not default to OC!
    }

    FAM.DepreciationCommon.prototype.setDefaults.apply(this, arguments);

    recordObj.status = +recordObj.status || FAM.TaxMethodStatus.New;

    if (recordObj.isGrpDepr && recordObj.isGrpMaster) {
        if (this.grpMasterInfo[recordObj.subsidiary] &&
            this.grpMasterInfo[recordObj.subsidiary][recordObj.altMethod]) {

            recordObj.groupInfo = this.grpMasterInfo[recordObj.subsidiary][recordObj.altMethod];
        }
        else {
            throw 'No Data for Group Depreciation';
        }

        if (recordObj.currNBV === 0) {
            recordObj.currNBV = +recordObj.groupInfo.NB || 0;
        }
        if (recordObj.priorNBV === 0) {
            recordObj.priorNBV = +recordObj.groupInfo.PB || +recordObj.groupInfo.OC || 0;
        }

        recordObj.origCost = +recordObj.groupInfo.OC || 0;
        recordObj.currCost = +recordObj.groupInfo.CC || 0;
        recordObj.lifetime = +recordObj.groupInfo.AL;
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
FAM.TaxValueDepreciation.prototype.validateFields = function (recordObj) {
    this.logObj.startMethod('FAM.TaxValueDepreciation.validateFields');

    FAM.DepreciationCommon.prototype.validateFields.apply(this, arguments);

    var noValues = [], inactive = [];

    if (!recordObj.currId && FAM.Context.blnMultiCurrency) {
        noValues.push('Currency');
    }
    if (!recordObj.department && FAM.Context.getPreference('deptmandatory') === 'T') {
        noValues.push('Department');
    }
    if (!recordObj.classfld && FAM.Context.getPreference('classmandatory') === 'T') {
        noValues.push('Class');
    }
    if (!recordObj.location && FAM.Context.getPreference('locmandatory') === 'T') {
        noValues.push('Location');
    }
    if (noValues.length > 0) {
        throw nlapiCreateError('USER_ERROR', FAM.resourceManager.GetString(
            'custpage_fields_missing', null, null, [noValues.join(', ')]));
    }

    //check for accounts if book specific
    if (FAM.Context.blnMultiBook && recordObj.bookingId && (!recordObj.chargeAcc ||
        !recordObj.deprAcc)) {

        throw nlapiCreateError('USER_ERROR',
            FAM.resourceManager.GetString('custpage_accounts_missing'));
    }

    if (FAM.Context.blnMultiCurrency && this.currCache.isInactive(recordObj.currId)) {
        inactive.push('Currency');
    }
    if (recordObj.classfld && this.classCache.isInactive(recordObj.classfld)) {
        inactive.push('Class');
    }
    if (recordObj.department && this.deptCache.isInactive(recordObj.department)) {
        inactive.push('Department');
    }
    if (recordObj.location && this.locCache.isInactive(recordObj.location)) {
        inactive.push('Location');
    }
    if (inactive.length > 0) {
        throw nlapiCreateError('USER_ERROR', FAM.resourceManager.GetString(
            'custpage_fields_inactive', null, null, [inactive.join(', ')]));
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
FAM.TaxValueDepreciation.prototype.writeHistory = function (recordObj, nextDeprAmt,
    nextDeprDate) {

    this.logObj.startMethod('FAM.TaxValueDepreciation.writeHistory');

    var fields, currNBV, histRec = new FAM.DepreciationHistory_Record(),
        noDPCurr = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');

    currNBV = ncRoundCurr(recordObj.currNBV - nextDeprAmt, recordObj.currSym, noDPCurr);

    fields = {
        asset_type                 : recordObj.assetType,
        alternate_depreciation     : recordObj.taxMetId,
        alternate_method           : recordObj.altMethod,
        actual_depreciation_method : recordObj.deprMethod,
        transaction_type           : FAM.TransactionType.Depreciation,
        asset                      : recordObj.assetId,
        date                       : nlapiDateToString(nextDeprDate),
        transaction_amount         : nextDeprAmt,
        net_book_value             : currNBV,
        quantity                   : recordObj.quantity,
        name                       : 'dhr-default-name'
    };

    if (recordObj.subsidiary) { fields.subsidiary = recordObj.subsidiary;}
    if (recordObj.bookingId) { fields.bookId = recordObj.bookingId;}

    if (nextDeprAmt !== 0 && recordObj.bookingId) {
        fields.summaryRecord  = this.writeSummary(recordObj, nextDeprDate);
    }

    histRec.createRecord(fields, null, this.bypassUE);
    if (isNaN(histRec.submitRecord(false, null, this.bypassUE))) {
        this.logObj.logExecution('Depreciation History creation failed for tax method id: ' +
            recordObj.taxMetId, 'ERROR');
    }

    this.logObj.endMethod();
};

FAM.TaxValueDepreciation.prototype.writeSummary = function(recordObj, nextDeprDate) {
    this.logObj.startMethod('FAM.TaxValueDepreciation.writeSummary');
    
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
        if(recordObj.deprAcc) {
            fieldValue.deprAcc = recordObj.deprAcc;
        }
        if(recordObj.chargeAcc) {
            fieldValue.chargeAcc = recordObj.chargeAcc;
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
FAM.TaxValueDepreciation.prototype.updateStatusAndSave = function (recordObj) {
    this.logObj.startMethod('FAM.TaxValueDepreciation.updateStatusAndSave');

    var taxRec, fields;
    if (recordObj.taxMetId) {
        fields = {
            book_value : recordObj.currNBV,
            last_depr_period : recordObj.lastPeriod,
            last_depr_amount : recordObj.lastDepAmt,
            prior_year_nbv : recordObj.priorNBV,
            last_depr_date : nlapiDateToString(recordObj.lastDate),
            cumulative_depr : recordObj.cumDepr,
            convention : recordObj.convention,
            currency : recordObj.currId,
            depr_active : recordObj.isDeprActive
        };

        if (recordObj.lastPeriod === recordObj.realLifetime) {
            fields.status = FAM.TaxMethodStatus['Fully Depreciated'];
        }
        else {
            fields.status = FAM.TaxMethodStatus.Depreciating;
        }

        taxRec = new FAM.AltDeprMethod_Record();
        taxRec.recordId = recordObj.taxMetId;
        taxRec.submitField(fields, false, this.bypassUE);
    }

    this.logObj.endMethod();
};
