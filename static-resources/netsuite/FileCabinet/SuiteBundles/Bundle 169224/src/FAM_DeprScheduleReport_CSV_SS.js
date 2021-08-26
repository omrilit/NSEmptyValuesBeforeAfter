/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

/**
 * Starter for Background Processing function for Depreciation Schedule Report
 *
 * Parameters:
 *     BGP {FAM.BGProcess} - Process Instance Record for this background process
 * Returns:
 *     true {boolean} - processing should be requeued
 *     false {boolean} - processing should not be requeued; essentially setting the deployment to
 *                       standby
**/
function famDeprSchedReportCSV(BGP) {
    var assetSchedReport = new FAM.ScheduleReport_CSV_SS(BGP);

    try {
        return assetSchedReport.run();
    }
    catch (e) {
        assetSchedReport.logObj.printLog();
        throw e;
    }
}

/**
 * Class for generating schedule report; Inherits FAM.DepreciationCommon
 *
 * Constructor Parameters:
 *     procInsRec {FAM.BGProcess} - Process Instance Record for this background process
**/
FAM.ScheduleReport_CSV_SS = function (procInsRec) {
    // Call Parent Constructor
    FAM.DepreciationCommon.apply(this, arguments);

    // member variables
    this.grpMasterInfo = null;

    this.csvReportFileName = 'FAM_DeprSchedule_BGP' + this.procInsRec.getRecordId() + 'CSV';
    this.csvQueueFileName = this.csvReportFileName + '_queue';
    this.reportFileDescription = FAM.resourceManager.GetString('DSR_desc_DSR', 'DSR_template');
    this.instructionLimit = +FAM.SystemSetup.getSetting('deprSchedInsLimit');
    
    // user inputs
    this.arrAssetTypes = [];
    this.arrSubsidiaries = [];
    this.arrAcctBooks = [];
    this.arrClasses = [];
    this.arrDepartments = [];
    this.arrLocations = [];
    this.leaseOption = 'all_assets';
    this.startDate = null;
    this.endDate = null;

    // data for current queue execution
    this.csvStrings = [];
    this.assetValues = {};
};

// Prototypal Inheritance
FAM.ScheduleReport_CSV_SS.prototype = Object.create(FAM.DepreciationCommon.prototype);

FAM.ScheduleReport_CSV_SS.prototype.queueId = 0;
FAM.ScheduleReport_CSV_SS.prototype.instructions = 0;
FAM.ScheduleReport_CSV_SS.prototype.execLimit = 1000;

FAM.ScheduleReport_CSV_SS.prototype.csv = 0;
FAM.ScheduleReport_CSV_SS.prototype.stage = 1;

// user inputs
FAM.ScheduleReport_CSV_SS.prototype.isNBV = false;
FAM.ScheduleReport_CSV_SS.prototype.deprMethod = 0;

// script parameters
FAM.ScheduleReport_CSV_SS.prototype.lowerLimit = 0;
FAM.ScheduleReport_CSV_SS.prototype.upperLimit = 0;
FAM.ScheduleReport_CSV_SS.prototype.hasSpawned = false;

/**
 * Main function for this class
 *
 * Parameters:
 *     none
 * Returns:
 *     true {boolean} - processing should be requeued
 *     false {boolean} - processing should not be requeued; essentially setting the deployment to
 *                       standby
**/
FAM.ScheduleReport_CSV_SS.prototype.run = function () {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.run');

    var limitExceeded = false, procFields = {};
    
    this.getParameters();

    if (!limitExceeded && this.stage === 1) {
        limitExceeded = this.createActualAndForecasts();
    }

    if (!limitExceeded && this.stage === 2) {
        limitExceeded = this.mergeCSVFiles();
        
        if (!limitExceeded) {
            procFields.status = FAM.BGProcessStatus.Completed;
            
            if (this.csv) {
                this.procInsRec.stateValues.csv = this.csv; 
                procFields.state = JSON.stringify(this.procInsRec.stateValues);
            };
            limitExceeded = true;
        }
    }
    
    this.updateStatus(null, procFields);
    
    return limitExceeded;
};

FAM.ScheduleReport_CSV_SS.prototype.createActualAndForecasts = function () {
    var srchRecDepr, limitExceeded = false, timer = new FAM.Timer(),
        recordName = this.deprMethod ? 'tax method' : 'asset';

    this.loadDeprMethodsFunctions();
    
    if (this.deprMethod) {
        this.logObj.pushMsg('Get group master info');
        timer.start();
        this.grpMasterInfo = FAM.GroupMaster.getInfo('alternate_method', this.arrSubsidiaries,
            true);
        this.logObj.logExecution('Elapsed time loading Group Info: ' +
            timer.getReadableElapsedTime());
    }
    
    while (!limitExceeded) {
        this.logObj.logExecution('low: ' + this.lowerLimit + ' | high: ' + this.upperLimit);
        timer.start();
        srchRecDepr = this.searchRecordsToDepreciate(this.lowerLimit, this.upperLimit);
        this.logObj.logExecution('Elapsed time for ' + recordName + ' search: ' +
            timer.getReadableElapsedTime());
        
        if (srchRecDepr.results) {
            this.logObj.logExecution('start: ' + srchRecDepr.getId(0) + ' | end: ' +
                srchRecDepr.getId(srchRecDepr.results.length - 1));
            
            this.upperLimit = +srchRecDepr.getId(srchRecDepr.results.length - 1);
            if (!this.hasSpawned) {
                this.hasSpawned = this.procInsRec.scheduleNextQueue(this.upperLimit);
            }
            
            var recToDepList = srchRecDepr.results.map(function(i) {
                return i.getId();
            });
            this.loadActualDepreciations(recToDepList);
            limitExceeded = this.depreciateRecords(srchRecDepr);
        }
        else if (this.upperLimit === 0) {
            if (this.waitForQueues()) {
                limitExceeded = true;
            }
            else {
                this.stage++;
                this.initScriptParams();
            }
            break;
        }
        else if (!this.hasSpawned) {
            this.lowerLimit = this.upperLimit;
            this.upperLimit = 0;
        }
        else {
            break;
        }
    }
    
    if (this.csvStrings.length > 0) {
        this.csv = FAM_Util.saveFileContents(
            [this.csvStrings.join('\n'), ('\n')].join(''),
            [this.csvQueueFileName, this.queueId, '_', new Date().getTime()].join(''),
            '.csv',
            'CSV',
            this.reportFileDescription
        );
    }
    if (limitExceeded) { this.setScriptParams(); }
    
    this.logObj.endMethod();
    return limitExceeded;
};

FAM.ScheduleReport_CSV_SS.prototype.getParameters = function () {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.getParameters');

    this.csv = this.procInsRec.stateValues.csv || 0;
    this.stage = +this.procInsRec.stateValues.Stage || 1;
    
    // user inputs
    this.arrAssetTypes = this.procInsRec.stateValues.type || [];
    this.arrSubsidiaries = this.procInsRec.stateValues.subs || [];
    this.arrAcctBooks = this.procInsRec.stateValues.book || [];
    this.arrClasses = this.procInsRec.stateValues['class'] || [];
    this.arrDepartments = this.procInsRec.stateValues.dept || [];
    this.arrLocations = this.procInsRec.stateValues.loc || [];
    this.isNBV = this.procInsRec.stateValues.nbv === 'T';
    this.deprMethod = +this.procInsRec.stateValues.depr || 0;

    this.leaseOption = this.procInsRec.stateValues.sel || 'all_assets';
    this.startDate = new Date(+this.procInsRec.stateValues.start);
    this.endDate = new Date(+this.procInsRec.stateValues.end);
    this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1);
    this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth() + 1, 0);
    
    // script parameters
    this.hasSpawned = this.procInsRec.getScriptParam('hasSpawned') === 'T';
    this.lowerLimit = +this.procInsRec.getScriptParam('lowerLimit') || 0;
    this.upperLimit = +this.procInsRec.getScriptParam('upperLimit') || 0;

    queueDetails = this.procInsRec.getQueueDetails();
    this.queueId       = queueDetails.queueId;
    this.recsProcessed = queueDetails.recsProcessed;
    this.recsFailed    = queueDetails.recsFailed;
    this.totalRecords = +this.procInsRec.getFieldValue('rec_total') || 0;
    
    this.logObj.endMethod();
};

FAM.ScheduleReport_CSV_SS.prototype.searchRecordsToDepreciate = function (lowLimit, upLimit) {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.searchRecordsToDepreciate');

    var fSearch, joinId = null;
    
    if (this.deprMethod) {
        fSearch = new FAM.Search(new FAM.AltDeprMethod_Record());
        joinId = 'parent_asset';
        fSearch.setJoinRecord(joinId, new FAM.Asset_Record());

        fSearch.addFilter('alternate_method', null, 'is', this.deprMethod);
        fSearch.addFilter('isinactive', null, 'is', 'F');
        fSearch.addFilter('status', null, 'anyof', [FAM.TaxMethodStatus.New,
            FAM.TaxMethodStatus.Depreciating, FAM.TaxMethodStatus['Part Disposed']]);
        fSearch.addFilter('enddate', null, 'onorafter', this.startDate);
        
        if (this.arrAcctBooks.length > 0) {
            fSearch.addFilter('booking_id', null, 'anyof', this.arrAcctBooks);
        }

        fSearch.addColumn('altname', 'parent_asset');
        fSearch.addColumn('alternate_method');
        fSearch.addColumn('original_cost');
        fSearch.addColumn('residual_value');
        fSearch.addColumn('asset_life');
        fSearch.addColumn('financial_year_start');
        fSearch.addColumn('last_depr_amount');
        fSearch.addColumn('prior_year_nbv');
        fSearch.addColumn('parent_asset');
        fSearch.addColumn('cumulative_depr');
        fSearch.addColumn('convention');
        fSearch.addColumn('period_convention');
        fSearch.addColumn('is_group_master');
        fSearch.addColumn('is_group_depr');
        fSearch.addColumn('booking_id');
    }
    else {
        fSearch = new FAM.Search(new FAM.Asset_Record());

        fSearch.addFilter('depr_end_date', null, 'onorafter', this.startDate);
        
        fSearch.addFilter('status', null, 'anyof', [FAM.AssetStatus.New,
            FAM.AssetStatus.Depreciating, FAM.AssetStatus['Part Disposed']]);

        fSearch.addColumn('name');
        fSearch.addColumn('altname');
        fSearch.addColumn('initial_cost');
        fSearch.addColumn('rv');
        fSearch.addColumn('lifetime');
        fSearch.addColumn('fyscal_year_start');
        fSearch.addColumn('lastDeprAmount');
        fSearch.addColumn('prior_nbv');
        fSearch.addColumn('cummulative_depr');
    }

    if (upLimit > 0) {
        fSearch.addFilter('internalidnumber', null, 'between', lowLimit + 1, upLimit);
    }
    else {
        fSearch.addFilter('internalidnumber', null, 'greaterthan', lowLimit);
    }

    fSearch.addFilter('include_report', joinId, 'is', 'T');
    fSearch.addFilter('isinactive', joinId, 'is', 'F');
    fSearch.addFilter('depr_active', joinId, 'is', FAM.DeprActive.True);
    fSearch.addFilter('depr_start_date', null, 'onorbefore', this.endDate);

    if (this.leaseOption === 'except_leased') {
        fSearch.addFilter('isleased', joinId, 'is', 'F');
    }
    else if (this.leaseOption === 'leased_only') {
        fSearch.addFilter('isleased', joinId, 'is', 'T');
    }
    if (this.arrAssetTypes.length > 0) {
        fSearch.addFilter('asset_type', joinId, 'anyof', this.arrAssetTypes);
    }
    if (this.arrSubsidiaries.length > 0) {
        fSearch.addFilter('subsidiary', null, 'anyof', this.arrSubsidiaries);
    }
    
    if (FAM.Context.blnLocation && this.arrLocations.length > 0) {
        fSearch.addFilter('location', joinId, 'anyof', this.arrLocations);
    }
    if (FAM.Context.blnDepartment && this.arrDepartments.length > 0) {
        fSearch.addFilter('department', joinId, 'anyof', this.arrDepartments);
    }
    if (FAM.Context.blnClass && this.arrClasses.length > 0) {
        fSearch.addFilter('classfld', joinId, 'anyof', this.arrClasses);
    }

    fSearch.addColumn('internalid', null, null, 'SORT_ASC');
    fSearch.addColumn('current_cost');
    fSearch.addColumn('depr_start_date');
    fSearch.addColumn('annual_entry');
    fSearch.addColumn('last_depr_period');
    fSearch.addColumn('book_value');
    fSearch.addColumn('subsidiary');
    fSearch.addColumn('last_depr_date');
    fSearch.addColumn('depr_method');
    fSearch.addColumn('status');
    fSearch.addColumn('depr_period');

    fSearch.addColumn('asset_type', joinId);
    fSearch.addColumn('quantity', joinId);
    fSearch.addColumn('depr_rules', joinId);
    
    fSearch.run();
    this.logObj.endMethod();
    return fSearch;
};

FAM.ScheduleReport_CSV_SS.prototype.depreciateRecords = function (srchRecDepr) {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.depreciateRecords');
    
    var i, recObj, updatedValues, limitExceeded = false, timer = new FAM.Timer(),
        recordName = this.deprMethod ? 'tax method' : 'asset';
    
    for (i = 0; i < srchRecDepr.results.length; i++) {
        if (srchRecDepr.getValue(i, 'is_group_master') !== 'T' &&
            srchRecDepr.getValue(i, 'is_group_depr') === 'T') {

            this.logObj.logExecution('Skip depreciation for tax method: ' + srchRecDepr.getId(i) +
                ', Part of Group Depreciation');
            continue;
        }
        
        limitExceeded = this.hasExceededLimit();
        if (limitExceeded) { break; }

        // Re-initialize logObj for each asset to prevent flooding of log data
        this.logObj = new printLogObj('debug');
        this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.forecastDepreciations');
        this.logObj.logExecution('depreciate ' + recordName + ': ' + srchRecDepr.getId(i));
        
        recObj = {
            currCost : srchRecDepr.getValue(i, 'current_cost'),
            deprStart : srchRecDepr.getValue(i, 'depr_start_date'),
            annualMet : srchRecDepr.getValue(i, 'annual_entry'),
            lastPeriod : srchRecDepr.getValue(i, 'last_depr_period'),
            currNBV : srchRecDepr.getValue(i, 'book_value'),
            subsidiary : srchRecDepr.getValue(i, 'subsidiary'),
            subsidiaryName : srchRecDepr.getText(i, 'subsidiary'),
            isAcquired : 'T',
            lastDate : srchRecDepr.getValue(i, 'last_depr_date'),
            deprMethod : srchRecDepr.getValue(i, 'depr_method'),
            methodName : srchRecDepr.getText(i, 'depr_method'),
            status : srchRecDepr.getValue(i, 'status'),
            deprPeriod : srchRecDepr.getValue(i, 'depr_period')
        };

        if (this.deprMethod) {
            recObj.assetId = srchRecDepr.getValue(i, 'parent_asset');
            recObj.assetTextId = srchRecDepr.getText(i, 'parent_asset');
            recObj.assetName = srchRecDepr.getValue(i, 'altname', 'parent_asset');
            recObj.taxMetId = srchRecDepr.getId(i);
            recObj.altMethod = srchRecDepr.getValue(i, 'alternate_method');
            recObj.origCost = srchRecDepr.getValue(i, 'original_cost');
            recObj.resValue = srchRecDepr.getValue(i, 'residual_value');
            recObj.lifetime = srchRecDepr.getValue(i, 'asset_life');
            recObj.fiscalYr = srchRecDepr.getValue(i, 'financial_year_start');
            recObj.lastDepAmt = srchRecDepr.getValue(i, 'last_depr_amount');
            recObj.priorNBV = srchRecDepr.getValue(i, 'prior_year_nbv');
            recObj.cumDepr = srchRecDepr.getValue(i, 'cumulative_depr');
            recObj.assetType = srchRecDepr.getValue(i, 'asset_type', 'parent_asset');
            recObj.assetTypeName = srchRecDepr.getText(i, 'asset_type', 'parent_asset');
            recObj.quantity = srchRecDepr.getValue(i, 'quantity', 'parent_asset');
            recObj.deprRule = srchRecDepr.getValue(i, 'depr_rules', 'parent_asset');
            recObj.convention = srchRecDepr.getValue(i, 'convention');
            recObj.periodCon = srchRecDepr.getValue(i, 'period_convention');
            recObj.isGrpMaster = srchRecDepr.getValue(i, 'is_group_master');
            recObj.isGrpDepr = srchRecDepr.getValue(i, 'is_group_depr');
            recObj.book = srchRecDepr.getValue(i, 'booking_id');
            recObj.bookName = srchRecDepr.getText(i, 'booking_id');
        }
        else {
            recObj.assetId = srchRecDepr.getId(i);
            recObj.assetTextId = srchRecDepr.getValue(i, 'name');
            recObj.assetName = srchRecDepr.getValue(i, 'altname');
            recObj.origCost = srchRecDepr.getValue(i, 'initial_cost');
            recObj.resValue = srchRecDepr.getValue(i, 'rv');
            recObj.lifetime = srchRecDepr.getValue(i, 'lifetime');
            recObj.fiscalYr = srchRecDepr.getValue(i, 'fyscal_year_start');
            recObj.lastDepAmt = srchRecDepr.getValue(i, 'lastDeprAmount');
            recObj.priorNBV = srchRecDepr.getValue(i, 'prior_nbv');
            recObj.cumDepr = srchRecDepr.getValue(i, 'cummulative_depr');
            recObj.assetType = srchRecDepr.getValue(i, 'asset_type');
            recObj.assetTypeName = srchRecDepr.getText(i, 'asset_type');
            recObj.quantity = srchRecDepr.getValue(i, 'quantity');
            recObj.deprRule = srchRecDepr.getValue(i, 'depr_rules');
            
            recObj.book = this.currCache.funcValCache('FAM.Util_Shared.getPrimaryBookId');
            
            recObj.bookName = recObj.book && this.currCache.funcValCache('nlapiLookupField',
                'accountingbook', recObj.book, 'name');
        }
        
        timer.start();
        updatedValues = this.depreciateRecord(recObj, this.endDate);
        limitExceeded = this.checkResults(updatedValues, srchRecDepr.getId(i),
            timer.getReadableElapsedTime());
        
        if (limitExceeded) { break; }
        else {
            this.lowerLimit = +srchRecDepr.getId(i);
            
            if (updatedValues.error) {
                // To dynamically count records failed as well.
                this.recsFailed++;
            }
            else {
                this.generateCSVStrings(recObj, this.assetValues[+srchRecDepr.getId(i)]);
                this.recsProcessed++;
            }
        }
    }
    
    this.logObj.endMethod();
    return limitExceeded;
};

FAM.ScheduleReport_CSV_SS.prototype.checkResults = function (resultObj, recId, elapsedTime) {
    
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.checkResults');

    var ret = false, recordName = this.deprMethod ? 'Tax Method' : 'Asset';

    if (resultObj && resultObj.error) {
        this.procInsRec.writeToProcessLog('Processing Failed: ' + resultObj.error,
            'Error', recordName + ' Id: ' + recId);
        this.logObj.pushMsg('Failed depreciating ' + recordName + ': ' + recId + ', Elapsed Time: '
            + elapsedTime, 'error');
        this.logObj.printLog();
    }
    else if (resultObj && resultObj.isAborted) {
        this.logObj.logExecution(recordName + ' (Id: ' + recId +
            ') depreciation requeued, Elapsed Time: ' + elapsedTime);
        ret = true;
    }
    else {
        this.logObj.logExecution('Successful depreciation for ' + recordName + ': ' + recId +
            ', Elapsed Time: ' + elapsedTime);
    }

    this.logObj.endMethod();
    return ret;
};

FAM.ScheduleReport_CSV_SS.prototype.waitForQueues = function () {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.waitForQueues');

    var limitExceeded = false;

    while (this.procInsRec.hasOnGoingQueue()) {
        if (this.hasExceededLimit()) {
            limitExceeded = true;
            this.procInsRec.setScriptParams({ lowerLimit : this.lowerLimit });
            break;
        }
    }
        
    this.logObj.endMethod();
    return limitExceeded;
};

FAM.ScheduleReport_CSV_SS.prototype.initScriptParams = function () {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.initScriptParams');
    
    this.hasSpawned = false;
    this.lowerLimit = 0;
    this.upperLimit = 0;
    
    this.logObj.endMethod();
};

FAM.ScheduleReport_CSV_SS.prototype.setScriptParams = function () {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.setScriptParams');
    
    this.logObj.logExecution('Execution Limit | Remaining Usage: ' +
        FAM.Context.getRemainingUsage() + ' | Time Elapsed: ' +
        this.perfTimer.getReadableElapsedTime() + ' | Instructions: ' + this.instructions);
    this.procInsRec.setScriptParams({
        lowerLimit : this.lowerLimit,
        upperLimit : this.upperLimit,
        hasSpawned : this.hasSpawned ? 'T' : 'F'
    });
    
    this.logObj.endMethod();
};

/**
 * [OVERRIDE] Writes depreciation history amounts for the next depreciation period
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 *     nextDeprAmt {number} - depreciation amount for the next period
 *     nextDeprDate {Date} - date of the next depreciation
 * Returns:
 *     void
**/
FAM.ScheduleReport_CSV_SS.prototype.writeHistory = function (recordObj, nextDeprAmt,
    nextDeprDate) {

    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.writeHistory');

    var currNBV, year, month, valToSave, recordId,
        noDPCurr = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');

    currNBV = ncRoundCurr(recordObj.currNBV - nextDeprAmt, recordObj.currSym, noDPCurr);

    if (this.startDate.getTime() <= nextDeprDate.getTime()) {
        year = nextDeprDate.getFullYear();
        month = nextDeprDate.getMonth() + 1;
        valToSave = this.isNBV ? currNBV : nextDeprAmt;
        recordId = this.deprMethod ? +recordObj.taxMetId : +recordObj.assetId;
        
        if (this.assetValues[recordId] === undefined) {
            this.assetValues[recordId] = {};
        }
        if (this.assetValues[recordId][year] === undefined) {
            this.assetValues[recordId][year] = {};
        }
        if (this.assetValues[recordId][year][month] === undefined || this.isNBV) {
            this.assetValues[recordId][year][month] = valToSave;
        }
        else {
            this.assetValues[recordId][year][month] += valToSave;
        }
    }
    
    this.instructions++;
    this.logObj.endMethod();
};

FAM.ScheduleReport_CSV_SS.prototype.generateCSVStrings = function (recObj, assetValues) {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.generateCSVStrings');

    assetValues = assetValues || {}; 
    
    var csvData, year = '', month, hasValue = false,
        currencyData = this.currCache.subCurrData(recObj.subsidiary, recObj.book),
        sub = FAM.Context.blnOneWorld ? recObj.subsidiaryName : 0,
        book = FAM.Context.blnMultiBook ? (recObj.bookName || 'No Accounting Book') : 0,
        currency = currencyData.currSym || '',
        type = recObj.assetTypeName || 0,
        assetId = recObj.assetTextId || 0,
        assetName = recObj.assetName,
        method = recObj.methodName || 0,
        life = recObj.lifetime || 0;
    
    for (year in assetValues) {
        hasValue = false;
        csvData = [
            sub,
            book,
            currency,
            year,
            type,
            assetId,
            assetName,
            method,
            life
        ];
        for (month = 1; month <= 12; month++) {
            if (assetValues[year][month] !== undefined) { hasValue = true; }
            csvData.push(assetValues[year][month] || 0);
        }
        if (hasValue) {
            csvData = csvData.map(function (val) {
                if (typeof val.indexOf === 'function' && val.indexOf(',') !== -1)
                    val = '"' + val + '"';
                return val;
            });
            this.csvStrings.push(csvData.join(','));
        }
    }
    this.logObj.endMethod();
};

/**
 * Searches Actual Depreciation History Records
 *
 * Parameters:
 *     array {Asset / Tax ID} - to search
 * Returns:
 *     object {FAM.Search} which contains the results
**/
FAM.ScheduleReport_CSV_SS.prototype.searchActualDepreciations = function (arrIDs, lastId) {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.searchActualDepreciations');

    var fSearch = new FAM.Search(new FAM.DepreciationHistory_Record(),
        'customsearch_fam_history_search');

    fSearch.addFilter('schedule', null, 'is', 'F');
    fSearch.addFilter('isinactive', null, 'is', 'F');
    fSearch.addFilter('transaction_type', null, 'is', FAM.TransactionType.Depreciation);
    fSearch.addFilter('date', null, 'within', this.startDate, this.endDate);
    fSearch.addFilter('internalidnumber', null, 'greaterthan', lastId);


    if (this.deprMethod > 0){
        fSearch.addFilter('alternate_depreciation', null, 'anyof', arrIDs);
    }
    else{
        fSearch.addFilter('asset', null, 'anyof', arrIDs);
        fSearch.addFilter('alternate_depreciation', null, 'is', '@NONE@');
    }   
    
    fSearch.addColumn('internalid', null, null, 'SORT_ASC');
    fSearch.addColumn('date');
    fSearch.addColumn('asset');

    fSearch.addColumn('alternate_depreciation');
    fSearch.addColumn('net_book_value');
    fSearch.addColumn('transaction_amount');
    
    fSearch.run();
    this.logObj.endMethod();
    return fSearch;
};

/**
 * Construct Asset/Tax actual depreciation values JSON from Search
 *
 * Parameters:
 *     array {Asset / Tax ID} - to search  *
 * Returns:
 *     object
**/
FAM.ScheduleReport_CSV_SS.prototype.loadActualDepreciations = function (arrIDs) {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.getActualDepreciations');

    var histSearch, lastId = 0, timer = new FAM.Timer();
    
    while (true) {
        timer.start();
        histSearch = this.searchActualDepreciations(arrIDs, lastId);
        this.logObj.logExecution('Elapsed time for Actual Values Search: ' +
            timer.getReadableElapsedTime());
        
        if (histSearch.results) {
            this.logObj.logExecution('start: ' + histSearch.getId(0) + ' | end: ' +
                histSearch.getId(histSearch.results.length - 1));
            
            var valToSave, date, id, i;
            
            timer.start();
            for (i = 0; i < histSearch.results.length; i++) {
                date = nlapiStringToDate(histSearch.getValue(i, 'date'));
                var year = date.getFullYear(),
                    month = date.getMonth() + 1;
                valToSave = this.isNBV ? +histSearch.getValue(i, 'net_book_value') :
                    +histSearch.getValue(i, 'transaction_amount');
                
                if (this.deprMethod > 0) {
                    id = +histSearch.getValue(i, 'alternate_depreciation') || 0;
                }
                else{
                    id = +histSearch.getValue(i, 'asset') || 0;
                }
                
                if (this.assetValues[id] === undefined) {
                    this.assetValues[id] = {};
                }                 
                if (this.assetValues[id][year] === undefined) {
                    this.assetValues[id][year] = {};
                }                
                if (this.assetValues[id][year][month] === undefined || this.isNBV) {
                    this.assetValues[id][year][month] = valToSave;
                }
                else {
                    this.assetValues[id][year][month] += valToSave;
                }
                this.instructions++;
                lastId = histSearch.getId(i);
            }
            this.logObj.logExecution('Elapsed time constructing ' + i + ' Actual Values JSON: ' +
                timer.getReadableElapsedTime());
        }
        else { break; }
    }
    
    this.logObj.endMethod();
};

/**
 * [OVERRIDE] Determines if the Execution Limit or Time Limit has exceeded
 *
 * Returns:
 *     {boolean} - determines whether Execution, Time, or Instruction Limit has been exceeded
**/
FAM.ScheduleReport_CSV_SS.prototype.hasExceededLimit = function () {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.hasExceededLimit');

    var ret = FAM.DepreciationCommon.prototype.hasExceededLimit.apply(this, arguments) ||
        this.instructions > this.instructionLimit;

    this.logObj.endMethod();
    return ret;
};

/**
 * Merges CSV Files created by this process to minimize the number of files
 *
 * Returns:
 *     {boolean} - determines whether Execution, Time, or Instruction Limit has been exceeded
**/
FAM.ScheduleReport_CSV_SS.prototype.mergeCSVFiles = function () {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.mergeCSVFiles');

    var i, limitExceeded = false, files, csvString = '', timer = new FAM.Timer(),
        folder = FAM.SystemSetup.getSetting('reportFolder');
    
    timer.start();
    if (this.csv) {
        csvString = this.loadCSVFiles(this.csvReportFileName);
    }
    
    files = FAM_Util.searchFiles(this.csvQueueFileName, folder, 'CSV');
    
    for (i = 0; i < files.length; i++) {
        fileObj = nlapiLoadFile(files[i].getId());
        csvString += fileObj.getValue();
        nlapiDeleteFile(files[i].getId());
        
        limitExceeded = this.hasExceededLimit();
        if (limitExceeded) { break; }
    }
    
    if (csvString) {
        FAM_Util.deleteFiles(this.csvReportFileName, folder);
        this.csv = FAM_Util.saveFileContents(csvString, this.csvReportFileName, '.csv', 'CSV',
            this.reportFileDescription);
    }
    
    this.logObj.logExecution('Elapsed time merging the CSV files: ' +
        timer.getReadableElapsedTime());

    this.logObj.endMethod();
    return limitExceeded;
};

/**
 * Loads CSV Files
 * 
 * Parameters:
 *     filename {string} - name of the file to load
 * Returns:
 *     {string} - csv contents
 */
 FAM.ScheduleReport_CSV_SS.prototype.loadCSVFiles = function(fileName) {
    this.logObj.startMethod('FAM.ScheduleReport_CSV_SS.loadCSVFiles');
    
    var i, files, fileObj, contents = '', folder = FAM.SystemSetup.getSetting('reportFolder');
    
    files = FAM_Util.searchFiles(fileName, folder, 'CSV');

    for (i = 0; i < files.length; i++) {
        if (!FAM_Util.checkTailString(fileName, files[i].getValue('name'))) continue;
        fileObj = nlapiLoadFile(files[i].getId());
        contents += fileObj.getValue();
    }
    
    this.logObj.endMethod();
    return contents;
 };