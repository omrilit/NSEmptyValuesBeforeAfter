/**
 * © 2015 NetSuite Inc.
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
function famDeprScheduleReport(BGP) {
    var assetSchedReport = new FAM.AssetScheduleReport_SS(BGP);

    assetSchedReport.run();

    return true;
}

/**
 * Class for generating schedule report; Inherits FAM.DepreciationCommon
 *
 * Constructor Parameters:
 *     procInsRec {FAM.BGProcess} - Process Instance Record for this background process
**/
FAM.AssetScheduleReport_SS = function (procInsRec) {
    // Call Parent Constructor
    FAM.DepreciationCommon.apply(this, arguments);

    // member variables
    this.grpMasterInfo = null;
    this.startDate = null;
    this.endDate = null;

    this.deprInfo = {};

    this.arrAssetTypes = [];
    this.arrSubsidiaries = [];
    this.arrAcctBooks = [];

    this.leaseOption = 'all_assets';
    this.reportStyle = 'period_rows';
    this.screenName = 'depreciationschedule2';
    this.cacheFileDescription = 'Depreciation Schedule Report Cache File';
    this.reportFileName = 'FAM_DeprSchedule_BGP' + this.procInsRec.getRecordId();
    this.reportFileDescription = FAM.resourceManager.GetString('DSR_desc_DSR', 'DSR_template');
};

// Prototypal Inheritance
FAM.AssetScheduleReport_SS.prototype = Object.create(FAM.DepreciationCommon.prototype);

// member variables
FAM.AssetScheduleReport_SS.prototype.fileId = 0;
FAM.AssetScheduleReport_SS.prototype.actualLastId = 0;
FAM.AssetScheduleReport_SS.prototype.isNBV = false;
FAM.AssetScheduleReport_SS.prototype.deprMethod = 0;
FAM.AssetScheduleReport_SS.prototype.classOption = 0;
FAM.AssetScheduleReport_SS.prototype.department = 0;
FAM.AssetScheduleReport_SS.prototype.location = 0;
FAM.AssetScheduleReport_SS.prototype.saveResults = false;
FAM.AssetScheduleReport_SS.prototype.deprCurrId = 0;
FAM.AssetScheduleReport_SS.prototype.deprForDelete = false;
FAM.AssetScheduleReport_SS.prototype.deprLastPeriod = 0;
FAM.AssetScheduleReport_SS.prototype.reportId = 0;
FAM.AssetScheduleReport_SS.prototype.uniqueRecsProcessed = [];
FAM.AssetScheduleReport_SS.prototype.uniqueRecsFailed = [];

/**
 * Main function for this class
 *
 * Parameters:
 *     none
 * Returns:
 *     void
**/
FAM.AssetScheduleReport_SS.prototype.run = function () {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.run');

    var htmlReport, limitExceeded = false, timer = new FAM.Timer(), procFields,
        statusComplete = FAM.BGProcessStatus.Completed;

    this.getParameters();
    
    if (this.fileId) {
        this.deprInfo = FAM_Util.loadJSONFileContents();
    }

    limitExceeded = this.loadActualDepreciations();

    if (!limitExceeded) {
        this.logObj.pushMsg('loading depreciation methods and functions...');
        this.loadDeprMethodsFunctions();

        if (this.deprMethod) {
            this.logObj.pushMsg('Get group master info');
            timer.start();
            this.grpMasterInfo = FAM.GroupMaster.getInfo('alternate_method', this.arrSubsidiaries,
                true);
            this.logObj.logExecution('Elapsed time loading Group Info: ' +
                timer.getReadableElapsedTime());
        }

        limitExceeded = this.forecastDepreciations();
    }
    
    if (limitExceeded) {
        this.logObj.logExecution('Execution Limit | Remaining Usage: ' +
            FAM.Context.getRemainingUsage() + ' | Time Elapsed: ' +
            this.perfTimer.getReadableElapsedTime());
            this.fileId = FAM_Util.saveJSONReportContents(JSON.stringify(this.deprInfo), this.cacheFileDescription);
            this.updateProcIns(this.constructStateValues(), true);
    }

    if (!limitExceeded) {
        this.logObj.logExecution('Generating Report...');
        htmlReport = this.generateReport();
        this.reportId = this.saveReportFile(htmlReport);
        procFields = this.constructStateValues();
        procFields.status = statusComplete;

        this.tallyRecords();
        this.updateProcIns(procFields, true);
    }

    this.logObj.endMethod();
};

/**
 * Retrieves parameters passed for this operation
 *
 * Parameters:
 *     none
 * Returns:
 *     void
**/
FAM.AssetScheduleReport_SS.prototype.getParameters = function () {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.getParameters');

    this.totalRecords = +this.procInsRec.getFieldValue('rec_total') || 0;
    this.recsProcessed = +this.procInsRec.getFieldValue('rec_count') || 0;
    this.recsFailed = +this.procInsRec.getFieldValue('rec_failed') || 0;

    this.fileId = this.procInsRec.stateValues.FileId || 0;
    this.arrAssetTypes = this.procInsRec.stateValues.type || [];
    this.arrSubsidiaries = this.procInsRec.stateValues.subs || [];
    this.arrAcctBooks = this.procInsRec.stateValues.book || [];
    this.actualLastId = +this.procInsRec.stateValues.ActualLastId || 0;
    this.isNBV = this.procInsRec.stateValues.nbv === 'T';
    this.leaseOption = this.procInsRec.stateValues.sel || 'all_assets';
    this.deprMethod = +this.procInsRec.stateValues.depr || 0;
    this.classOption = +this.procInsRec.stateValues['class'] || 0;
    this.department = +this.procInsRec.stateValues.dept || 0;
    this.location = +this.procInsRec.stateValues.loc || 0;
    this.reportStyle = this.procInsRec.stateValues.Style || 'period_rows';
    this.saveResults = this.procInsRec.stateValues.save === 'T';
    this.deprCurrId = +this.procInsRec.stateValues.DeprCurrId || 0;
    this.deprForDelete = this.procInsRec.stateValues.DeprForDelete === 'T';
    this.deprLastPeriod = +this.procInsRec.stateValues.DeprLastPeriod || 0;
    this.reportId = +this.procInsRec.stateValues.xml || 0;

    this.startDate = new Date(+this.procInsRec.stateValues.start);
    this.endDate = new Date(+this.procInsRec.stateValues.end);

    this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1);
    this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth() + 1, 0);

    this.logObj.endMethod();
};

/**
 * Acquires actual data values to be used in reports
 *
 * Parameters:
 *     none
 * Returns:
 *     {boolean} - flag that determines if the execution and time limit has been reached
**/
FAM.AssetScheduleReport_SS.prototype.loadActualDepreciations = function () {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.loadActualDepreciations');

    var i, ret, histSearch, currData, sub, book, date, year, month, type, amount, asset, met, life,
        timer = new FAM.Timer();

    ret = this.hasExceededLimit();
    while (!ret) {
        timer.start();
        histSearch = this.searchActualDepreciations();
        this.logObj.logExecution('Elapsed time for Actual Depreciations Search: ' +
            timer.getReadableElapsedTime());

        if (histSearch.results) {
            for (i = 0; i < histSearch.results.length; i++) {
                ret = this.hasExceededLimit();
                if (ret) { break; }

                this.actualLastId = histSearch.getId(i);
                
                date = nlapiStringToDate(histSearch.getValue(i, 'date'));
                year = date.getFullYear();
                month = date.getMonth() + 1;
                asset = histSearch.getText(i, 'asset') || 0;
                type = histSearch.getText(i, 'asset_type') || 0;
                metId = +histSearch.getValue(i, 'alternate_depreciation') || 0;
                
                if (!FAM.Context.blnMultiBook) { book = 0; }
                else { book = histSearch.getText(i, 'bookId') || 'No Accounting Book'; }
                
                sub = FAM.Context.blnOneWorld ? histSearch.getText(i, 'subsidiary') : 0;
                
                if (this.isNBV) {
                    amount = +histSearch.getValue(i, 'net_book_value');
                }
                else {
                    amount = +histSearch.getValue(i, 'transaction_amount');
                }
                if (this.deprMethod) {
                    met = histSearch.getText(i, 'depr_method', 'alternate_depreciation') || 0;
                    life = histSearch.getValue(i, 'asset_life', 'alternate_depreciation') || 0;
                }
                else {
                    met = histSearch.getText(i, 'depr_method', 'asset') || 0;
                    life = histSearch.getValue(i, 'lifetime', 'asset') || 0;
                }

                if (this.deprInfo[sub] === undefined) {
                    this.deprInfo[sub] = {};
                }
                if (this.deprInfo[sub][book] === undefined) {
                    currData = this.currCache.subCurrData(histSearch.getValue(i, 'subsidiary'),
                        histSearch.getValue(i, 'bookId'));
                    this.deprInfo[sub][book] = { currency : currData.currSym || '' };
                }
                if (this.deprInfo[sub][book][year] === undefined) {
                    this.deprInfo[sub][book][year] = {};
                }
                if (this.deprInfo[sub][book][year][type] === undefined) {
                    this.deprInfo[sub][book][year][type] = {};
                }
                if (this.deprInfo[sub][book][year][type][asset] === undefined) {
                    this.deprInfo[sub][book][year][type][asset] = {
                        name : histSearch.getValue(i, 'altname', 'asset'),
                        id : +histSearch.getValue(i, 'asset')};
                }
                if (this.deprInfo[sub][book][year][type][asset][met] === undefined) {
                    this.deprInfo[sub][book][year][type][asset][met] = {
                        life : life,
                        metId : metId };
                }
                if (this.deprInfo[sub][book][year][type][asset][met][month] === undefined) {
                    this.deprInfo[sub][book][year][type][asset][met][month] = amount;
                }
                else {
                    if (this.isNBV) {
                        this.deprInfo[sub][book][year][type][asset][met][month] = amount;
                    }
                    else {
                        this.deprInfo[sub][book][year][type][asset][met][month] += amount;
                    }
                }
            }
        }
        else {
            break;
        }
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Searches Depreciation History Records for actual data to be used in reports
 *
 * Parameters:
 *     none
 * Returns:
 *     object {FAM.Search} which contains the results
**/
FAM.AssetScheduleReport_SS.prototype.searchActualDepreciations = function () {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.searchActualDepreciations');

    var fSearch = new FAM.Search(new FAM.DepreciationHistory_Record(), 'customsearch_fam_history_search');

    fSearch.setJoinRecord('asset', new FAM.Asset_Record());

    fSearch.addFilter('isinactive', null, 'is', 'F');
    fSearch.addFilter('transaction_type', null, 'is', FAM.TransactionType.Depreciation);
    fSearch.addFilter('date', null, 'within', this.startDate, this.endDate);
    fSearch.addFilter('include_report', 'asset', 'is', 'T');
    fSearch.addFilter('isinactive', 'asset', 'is', 'F');
    fSearch.addFilter('depr_active', 'asset', 'is', FAM.DeprActive.True);

    if (this.arrAssetTypes.length > 0) {
        fSearch.addFilter('asset_type', null, 'anyof', this.arrAssetTypes);
    }
    if (this.arrSubsidiaries.length > 0) {
        fSearch.addFilter('subsidiary', null, 'anyof', this.arrSubsidiaries);
    }
    if (this.arrAcctBooks.length > 0) {
        fSearch.addFilter('bookId', null, 'anyof', this.arrAcctBooks);
    }
    if (this.actualLastId) {
        fSearch.addFilter('internalidnumber', null, 'greaterthan', this.actualLastId);
    }
    if (this.leaseOption === 'except_leased') {
        fSearch.addFilter('isleased', 'asset', 'is', 'F');
    }
    else if (this.leaseOption === 'leased_only') {
        fSearch.addFilter('isleased', 'asset', 'is', 'T');
    }
    if (this.deprMethod) {
        fSearch.setJoinRecord('alternate_depreciation', new FAM.AltDeprMethod_Record());

        fSearch.addFilter('alternate_method', null, 'is', this.deprMethod);
        fSearch.addFilter('isinactive', 'alternate_depreciation', 'is', 'F');
        fSearch.addFilter('status', 'alternate_depreciation', 'anyof', [FAM.TaxMethodStatus.New,
            FAM.TaxMethodStatus.Depreciating, FAM.TaxMethodStatus['Part Disposed']]);
        
        fSearch.addColumn('asset_life', 'alternate_depreciation');
        fSearch.addColumn('depr_method', 'alternate_depreciation');
    }
    else {
        fSearch.addFilter('alternate_method', null, 'is', '@NONE@');
        fSearch.addFilter('status', 'asset', 'anyof', [FAM.AssetStatus.New,
            FAM.AssetStatus.Depreciating, FAM.AssetStatus['Part Disposed']]);
        
        fSearch.addColumn('lifetime', 'asset');
        fSearch.addColumn('depr_method', 'asset');
    }
    if (FAM.Context.blnLocation && this.location) {
        fSearch.addFilter('location', 'asset', 'is', this.location);
    }
    if (FAM.Context.blnDepartment && this.department) {
        fSearch.addFilter('department', 'asset', 'is', this.department);
    }
    if (FAM.Context.blnClass && this.classOption) {
        fSearch.addFilter('classfld', 'asset', 'is', this.classOption);
    }

    fSearch.addColumn('internalid', null, null, 'SORT_ASC');
    fSearch.addColumn('date');
    fSearch.addColumn('asset_type');
    fSearch.addColumn('asset');
    fSearch.addColumn('altname', 'asset');
    fSearch.addColumn('alternate_depreciation');
    
    if (FAM.Context.blnOneWorld) {
        fSearch.addColumn('subsidiary');
    }
    if (FAM.Context.blnMultiBook) {
        fSearch.addColumn('bookId');
    }
    if (this.isNBV) {
        fSearch.addColumn('net_book_value');
    }
    else {
        fSearch.addColumn('transaction_amount');
    }

    fSearch.run();
    this.logObj.endMethod();
    return fSearch;
};

/**
 * Retrieves and forecasts depreciation amounts for records based on user selection
 *
 * Parameters:
 *     none
 * Returns:
 *     {boolean} - flag that determines if the execution and time limit has been reached
**/
FAM.AssetScheduleReport_SS.prototype.forecastDepreciations = function () {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.forecastDepreciations');

    var i, ret, recObj, srchRecDepr, updatedValues, bookId, timer = new FAM.Timer(),
        recordName = this.deprMethod ? 'tax method' : 'asset';

    ret = this.hasExceededLimit();
    while (!ret) {
        timer.start();
        srchRecDepr = this.searchRecordsToDepreciate();
        this.logObj.logExecution('Elapsed time for ' + recordName + ' search: ' +
            timer.getReadableElapsedTime());

        if (srchRecDepr.results) {
            for (i = 0; i < srchRecDepr.results.length; i++) {
                if (this.deprCurrId !== +srchRecDepr.getId(i)) {
                    this.deprCurrId = +srchRecDepr.getId(i);
                    this.deprForDelete = true;
                    this.deprLastPeriod = 0;
                }

                ret = this.hasExceededLimit();
                if (ret) { break; }

                if (this.deprForDelete) {
                    this.logObj.logExecution('deleting histories for ' + recordName + ': ' +
                        this.deprCurrId);

                    ret = this.deletePreviousSchedData(this.deprCurrId);
                    if (ret) { break; }
                    this.deprForDelete = false;
                }

                if (srchRecDepr.getValue(i, 'is_group_master') !== 'T' &&
                    srchRecDepr.getValue(i, 'is_group_depr') === 'T') {

                    this.deprCurrId++;
                    this.deprForDelete = true;
                    this.deprLastPeriod = 0;
                    this.logObj.logExecution('Skip depreciation for tax method: ' +
                        srchRecDepr.getId(i) + ', Part of Group Depreciation');
                    continue;
                }

                // Re-initialze logObj for each asset to prevent flooding of log data
                this.logObj = new printLogObj('debug');
                this.logObj.startMethod('FAM.AssetScheduleReport_SS.forecastDepreciations');
                this.logObj.logExecution('depreciate ' + recordName + ': ' + this.deprCurrId);

                timer.start();
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
                    recObj.taxMetId = this.deprCurrId;
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
                    recObj.assetId = this.deprCurrId;
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

                updatedValues = this.depreciateRecord(recObj, this.endDate);
                ret = this.checkResults(updatedValues, this.deprCurrId,
                    timer.getReadableElapsedTime(), recObj.assetTextId+'|'+recObj.methodName);
                if (ret) { break; }

                this.deprCurrId++;
                this.deprForDelete = true;
                this.deprLastPeriod = 0;
            }
        }
        else {
            break;
        }
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Retrieves or counts all tax methods that should be depreciated based on the criteria
 *
 * Parameters:
 *     countRecords {boolean} - determines whether count or return results
 * Returns:
 *     object {FAM.Search} which contains the results
**/
FAM.AssetScheduleReport_SS.prototype.searchRecordsToDepreciate = function (countRecords) {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.searchRecordsToDepreciate');

    var fSearch, joinId = null;

    if (this.deprMethod) {
        fSearch = new FAM.Search(new FAM.AltDeprMethod_Record());
        joinId  = 'parent_asset';
        fSearch.setJoinRecord(joinId, new FAM.Asset_Record());

        fSearch.addFilter('alternate_method', null, 'is', this.deprMethod);
        fSearch.addFilter('isinactive', null, 'is', 'F');
        fSearch.addFilter('status', null, 'anyof', [FAM.TaxMethodStatus.New,
            FAM.TaxMethodStatus.Depreciating, FAM.TaxMethodStatus['Part Disposed']]);
        
        if (this.arrAcctBooks.length > 0) {
            fSearch.addFilter('booking_id', null, 'anyof', this.arrAcctBooks);
        }

        if (!countRecords) {
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
    }
    else {
        fSearch = new FAM.Search(new FAM.Asset_Record());

        fSearch.addFilter('status', null, 'anyof', [FAM.AssetStatus.New,
            FAM.AssetStatus.Depreciating, FAM.AssetStatus['Part Disposed']]);

        if (!countRecords) {
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
    }

    fSearch.addFilter('internalidnumber', null, 'greaterthanorequalto', this.deprCurrId);

    fSearch.addFilter('include_report', joinId, 'is', 'T');
    fSearch.addFilter('isinactive', joinId, 'is', 'F');
    fSearch.addFilter('depr_active', joinId, 'is', FAM.DeprActive.True);
    fSearch.addFilter('depr_start_date', null, 'onorbefore', this.endDate);
    fSearch.addFilter('last_depr_date', null, 'before', this.endDate);

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
        fSearch.addFilter('subsidiary', null, 'is', this.arrSubsidiaries);
    }
    
    if (FAM.Context.blnLocation && this.location) {
        fSearch.addFilter('location', joinId, 'is', this.location);
    }
    if (FAM.Context.blnDepartment && this.department) {
        fSearch.addFilter('department', joinId, 'is', this.department);
    }
    if (FAM.Context.blnClass && this.classOption) {
        fSearch.addFilter('classfld', joinId, 'is', this.classOption);
    }

    if (countRecords) {
        fSearch.addColumn('internalid', null, 'count');
    }
    else {
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
    }

    fSearch.run();
    this.logObj.endMethod();
    return fSearch;
};

/**
 * Deletes previous scheduled data from previous run
 *
 * Parameters:
 *     recId {number} - internal id of the asset/tax method from which old data will be deleted
 * Returns:
 *     {boolean} - flag that determines if the execution and time limit has been reached
**/
FAM.AssetScheduleReport_SS.prototype.deletePreviousSchedData = function (recId) {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.deletePreviousSchedData');

    var i, ret, srchHist, timer = new FAM.Timer(), histRec = new FAM.DepreciationHistory_Record();

    ret = this.hasExceededLimit();
    while (!ret) {
        timer.start();
        srchHist = this.searchHistoriesToDelete(recId);
        this.logObj.logExecution('Elapsed time for history search: ' +
            timer.getReadableElapsedTime());

        if (srchHist.results) {
            for (i = 0; i < srchHist.results.length; i++) {
                ret = this.hasExceededLimit();
                if (ret) { break; }

                nlapiDeleteRecord(histRec.getRecordTypeId(), srchHist.getId(i));
            }
        }
        else {
            break;
        }
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Searches Depreciation History Records for deletion
 *
 * Parameters:
 *     recId {number} - internal id of the asset/tax method from which old data will be deleted
 * Returns:
 *     object {FAM.Search} which contains the results
**/
FAM.AssetScheduleReport_SS.prototype.searchHistoriesToDelete = function (recId) {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.searchHistoriesToDelete');

    var fSearch = new FAM.Search(new FAM.DepreciationHistory_Record());

    fSearch.addFilter('schedule', null, 'is', 'T');

    if (this.deprMethod) {
        fSearch.addFilter('alternate_depreciation', null, 'is', recId);
    }
    else {
        fSearch.addFilter('asset', null, 'is', recId);
        fSearch.addFilter('alternate_method', null, 'is', '@NONE@');
    }

    fSearch.run();
    this.logObj.endMethod();
    return fSearch;
};

/**
 * Checks result object of depreciateRecord, updates success/fail count, and writes to Process Log
 *
 * Parameters:
 *     resultObj {object} - return object of depreciateRecord
 *     recId {number} - internal id of the asset/tax method that was depreciated
 *     elapsedTime {string} - elapsed time depreciating the asset, for logging purposes
 * Returns:
 *     true {boolean} - governance limit reached, requeue script first
 *     false {boolean} - proceed depreciating next asset
**/
FAM.AssetScheduleReport_SS.prototype.checkResults = function (resultObj, recId, elapsedTime, recInfo) {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.checkResults');

    var ret = false, recordName = this.deprMethod ? 'Tax Method' : 'Asset';

    if (resultObj && resultObj.error) {
        
        if(this.uniqueRecsFailed.indexOf(recInfo)===-1){
            this.uniqueRecsFailed.push(recInfo);
        }
        
        this.procInsRec.writeToProcessLog('Processing Failed: ' + resultObj.error,
            'Error', recordName + ' Id: ' + recId);
        this.logObj.pushMsg('Failed depreciating ' + recordName + ': ' + recId + ', Elapsed Time: '
            + elapsedTime + ', Failed: ' + this.uniqueRecsFailed.length, 'error');
        this.logObj.printLog();
    }
    else if (resultObj && resultObj.isAborted) {
        this.logObj.logExecution(recordName + ' (Id: ' + recId +
            ') depreciation requeued, Elapsed Time: ' + elapsedTime);
        ret = true;
    }
    else {
        this.logObj.logExecution('Successful depreciation for ' + recordName + ': ' + recId +
            ', Elapsed Time: ' + elapsedTime + ', Success');
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Re-creates state values for saving in BG - Process Instance
 *
 * Parameters:
 *     none
 * Returns:
 *     object - contains state definition and state values fields
**/
FAM.AssetScheduleReport_SS.prototype.constructStateValues = function () {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.constructStateValues');

    var ret, stateValues = this.procInsRec.stateValues || {};

    stateValues.FileId = this.fileId;
    stateValues.ActualLastId = this.actualLastId;
    stateValues.DeprCurrId = this.deprCurrId;
    stateValues.DeprForDelete = this.deprForDelete ? 'T' : 'F';
    stateValues.DeprLastPeriod = this.deprLastPeriod;
    stateValues.xml = this.reportId;

    ret = { state : JSON.stringify(stateValues) };

    this.logObj.endMethod();
    return ret;
};

/**
 * [OVERRIDE] Substitutes blank fields with default values
 *
 * Parameters:
 *     recObj {object} - record object to be depreciated
 *     deprDate {Date} - date up to which the record will be depreciated
 * Returns:
 *     void
**/
FAM.AssetScheduleReport_SS.prototype.setDefaults = function (recordObj, deprDate) {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.setDefaults');

    recordObj.isGrpDepr = recordObj.isGrpDepr === 'T';
    recordObj.isGrpMaster = recordObj.isGrpMaster === 'T';

    if (recordObj.isGrpDepr && recordObj.isGrpMaster) {
        recordObj.origCost = 0; // for PB defaulting; should not default to OC!
    }

    FAM.DepreciationCommon.prototype.setDefaults.apply(this, arguments);

    recordObj.status = +recordObj.status;
    if (!recordObj.status) {
        if (this.deprMethod) {
            recordObj.status = FAM.TaxMethodStatus.New;
        }
        else {
            recordObj.status = FAM.AssetStatus.New;
        }
    }

    recordObj.classfld = recordObj.classfld || 0;
    recordObj.department = recordObj.department || 0;
    recordObj.location = recordObj.location || 0;

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
 * [OVERRIDE] Writes depreciation history record for the next depreciation period
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 *     nextDeprAmt {number} - depreciation amount for the next period
 *     nextDeprDate {Date} - date of the next depreciation
 * Returns:
 *     void
**/
FAM.AssetScheduleReport_SS.prototype.writeHistory = function (recordObj, nextDeprAmt,
    nextDeprDate) {

    this.logObj.startMethod('FAM.AssetScheduleReport_SS.writeHistory');

    var fields, currNBV, recordName, recordId, year, month, sub, type, amount, currData, asset, met,
        histRec = new FAM.DepreciationHistory_Record(),
        noDPCurr = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');

    currNBV = ncRoundCurr(recordObj.currNBV - nextDeprAmt, recordObj.currSym, noDPCurr);

    if (this.startDate.getTime() <= nextDeprDate.getTime() &&
        recordObj.lastPeriod + 1 > this.deprLastPeriod) {

        if (this.deprMethod) {
            recordName = 'Tax Method';
            recordId = recordObj.taxMetId;
        }
        else {
            recordName = 'Asset';
            recordId = recordObj.assetId;
        }

        if (this.saveResults) {
            fields = {
                asset_type : recordObj.assetType,
                transaction_type : FAM.TransactionType.Depreciation,
                asset : recordObj.assetId,
                date : nlapiDateToString(nextDeprDate),
                transaction_amount : 0,
                net_book_value : 0,
                schedule : 'T',
                scheduled_amount : nextDeprAmt,
                scheduled_nbv : currNBV,
                quantity : recordObj.quantity
            };

            if (this.deprMethod) {
                fields.alternate_depreciation = recordObj.taxMetId;
                fields.alternate_method = recordObj.altMethod;
                fields.actual_depreciation_method = recordObj.deprMethod;
            }

            if (recordObj.subsidiary) { fields.subsidiary = recordObj.subsidiary; }

            histRec.createRecord(fields);
            if (isNaN(histRec.submitRecord(false))) {
                this.logObj.logExecution('Depreciation History creation failed for ' + recordName +
                    ' id: ' + recordId, 'ERROR');
            }
        }

        year = nextDeprDate.getFullYear();
        month = nextDeprDate.getMonth() + 1;
        sub = FAM.Context.blnOneWorld ? recordObj.subsidiaryName : 0;
        
        if (!FAM.Context.blnMultiBook) { book = 0; }
        else { book = recordObj.bookName || 'No Accounting Book'; }
        
        type = recordObj.assetTypeName || 0;
        asset = recordObj.assetTextId || 0;
        met = recordObj.methodName || 0;
        metId = +recordObj.taxMetId || 0;
        amount = this.isNBV ? currNBV : nextDeprAmt;

        if (this.deprInfo[sub] === undefined) {
            this.deprInfo[sub] = {};
        }
        if (this.deprInfo[sub][book] === undefined) {
            currData = this.currCache.subCurrData(recordObj.subsidiary, recordObj.book);
            this.deprInfo[sub][book] = { currency : currData.currSym || '' };
        }
        if (this.deprInfo[sub][book][year] === undefined) {
            this.deprInfo[sub][book][year] = {};
        }
        if (this.deprInfo[sub][book][year][type] === undefined) {
            this.deprInfo[sub][book][year][type] = {};
        }
        if (this.deprInfo[sub][book][year][type][asset] === undefined) {
            this.deprInfo[sub][book][year][type][asset] = {
                name : recordObj.assetName,
                id : +recordObj.assetId };
        }
        if (this.deprInfo[sub][book][year][type][asset][met] === undefined) {
            this.deprInfo[sub][book][year][type][asset][met] = {
                life : recordObj.lifetime,
                metId : metId };
        }
        if (this.deprInfo[sub][book][year][type][asset][met][month] === undefined) {
            this.deprInfo[sub][book][year][type][asset][met][month] = amount;
        }
        else {
            if (this.isNBV) {
                this.deprInfo[sub][book][year][type][asset][met][month] = amount;
            }
            else {
                this.deprInfo[sub][book][year][type][asset][met][month] += amount;
            }
        }
        
        this.deprLastPeriod = recordObj.lastPeriod + 1;
    }
    
    this.logObj.endMethod();
};

/**
 * Builds the XML Report based on the data gathered and processed
 *
 * Parameters:
 *     none
 * Returns:
 *     {string} - XML formatted report
**/
FAM.AssetScheduleReport_SS.prototype.generateReport = function () {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.generateReport');
    
    var xmlReport, reportRec,
        templateRenderer = nlapiCreateTemplateRenderer(),
        templateId = FAM.SystemSetup.getSetting(
            this.isNBV ? 'templateDeprSchedNbv' : 'templateDeprSchedPd');
        template = nlapiLoadFile(templateId).getValue();

    template = FAM.Util_Shared.String.translateStrings(template, /DSR_.+?_DSR/g, 'DSR_template');
    template = FAM.Util_Shared.String.translateStrings(template, /AFL_.+?_AFL/g, 'templateassetfieldlabel');
    template = FAM.Util_Shared.String.translateStrings(template, /TFL_.+?_TFL/g, 'templatetaxfieldlabel');
    
    reportRec = this.createReportRecord();
    
    templateRenderer.setTemplate(template);
    templateRenderer.addRecord('report', reportRec);
    
    xmlReport = templateRenderer.renderToString();
    
    this.logObj.endMethod();
    return xmlReport;
};

/**
 * Creates the report record to be passed to freemarker
 *
 * Parameters:
 *     none
 * Returns:
 *     {FAM.DeprSchedReport_Record} - record object
**/
FAM.AssetScheduleReport_SS.prototype.createReportRecord = function () {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.createReportRecord');
    
    var rec = new FAM.DeprSchedReport_Record();
    
    rec.createRecord({
        startDate : nlapiDateToString(this.startDate),
        endDate : nlapiDateToString(this.endDate),
        assetInc : FAM_Util.getAssetSelection(this.leaseOption),
        repType : this.isNBV ?
            FAM.resourceManager.GetString('custpage_netbookvalue', 'depreciationschedule2') :
            FAM.resourceManager.GetString('custpage_perioddepr', 'depreciationschedule2'),
        deprMet : this.deprMethod ?
            nlapiLookupField('customrecord_ncfar_altmethods', this.deprMethod, 'name') :
            FAM.resourceManager.GetString('custpage_dropdown_accountingmethod', 'famreports')
    }, {recordmode: 'dynamic'});
    
    this.addReportLines(rec);

    this.logObj.endMethod();
    return rec.record;
};

/**
 * Adds the report data to the report record
 *
 * Parameters:
 *     {FAM.DeprSchedReport_Record} - report record object
 * Returns:
 *     void
**/
FAM.AssetScheduleReport_SS.prototype.addReportLines = function (rec) {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.addReportLines');
    
    var subCtr, subObj, bookCtr, books, bookObj, yearCtr, years, yearObj, typeCtr, types, typeObj,
        assetCtr, assets, assetObj, methodCtr, methods, methodObj, monthCtr, months,
        group = 'recmachcustrecord_fam_schedrepline_parent',
        subs = Object.keys(this.deprInfo);
    
    subs.sort();
    for (subCtr = 0; subCtr < subs.length; subCtr++) {
        subObj = this.deprInfo[subs[subCtr]];
        books = Object.keys(subObj);
        books.sort();
        for (bookCtr = 0; bookCtr < books.length; bookCtr++) {
            bookObj = subObj[books[bookCtr]];
            years = Object.keys(bookObj);
            years.shift();
            years.sort();
            for (yearCtr = 0; yearCtr < years.length; yearCtr++) {
                yearObj = bookObj[years[yearCtr]];
                types = Object.keys(yearObj);
                types.sort();
                for (typeCtr = 0; typeCtr < types.length; typeCtr++) {
                    typeObj = yearObj[types[typeCtr]];
                    assets = Object.keys(typeObj);
                    assets.sort();
                    this.uniqueRecsProcessed = this.uniqueRecsProcessed.concat(assets);
                    for (assetCtr = 0; assetCtr < assets.length; assetCtr++) {
                        assetObj = typeObj[assets[assetCtr]];
                        methods = Object.keys(assetObj);
                        methods = methods.slice(methods.length-1);
                        methods.sort();
                        for (methodCtr = 0; methodCtr < methods.length; methodCtr++) {
                            methodObj = assetObj[methods[methodCtr]];
                            months = Object.keys(methodObj);
                            months.splice(0, 2);
                            months.sort();
                        
                            rec.selectNewLineItem(group);
                            rec.setCurrentLineItemValue(group,
                                'custrecord_fam_schedrepline_subsidiary', subs[subCtr]);
                            rec.setCurrentLineItemValue(group,
                                'custrecord_fam_schedrepline_book', books[bookCtr]);
                            rec.setCurrentLineItemValue(group,
                                'custrecord_fam_schedrepline_year', years[yearCtr]);
                            rec.setCurrentLineItemValue(group,
                                'custrecord_fam_schedrepline_type', types[typeCtr]);
                            rec.setCurrentLineItemValue(group,
                                'custrecord_fam_schedrepline_assetid', assets[assetCtr]);
                            rec.setCurrentLineItemValue(group,
                                'custrecord_fam_schedrepline_method', methods[methodCtr]);
                            rec.setCurrentLineItemValue(group,
                                'custrecord_fam_schedrepline_currency', bookObj.currency);
                            rec.setCurrentLineItemValue(group,
                                'custrecord_fam_schedrepline_assetname', assetObj.name);
                            rec.setCurrentLineItemValue(group,
                                'custrecord_fam_schedrepline_assetlife', methodObj.life);
                            if (assetObj.id) {
                                rec.setCurrentLineItemValue(group,
                                    'custrecord_fam_schedrepline_src_asset', assetObj.id);
                            }
                            if (methodObj.metId) {
                                rec.setCurrentLineItemValue(group,
                                    'custrecord_fam_schedrepline_src_altdepr', methodObj.metId);
                            }
                            
                            for (monthCtr = 0; monthCtr < months.length; monthCtr++) {
                                rec.setCurrentLineItemValue(group, 'custrecord_fam_schedrepline_p' +
                                    months[monthCtr], methodObj[months[monthCtr]]);
                            }
                            rec.commitLineItem(group);
                        }
                    }
                }
            }
        }
    }
    
    this.logObj.endMethod();
};

/**
 * Retrieves subsidiary information
 *
 * Parameters:
 *     none
 * Returns:
 *     {object} - contains subsidiary information
**/
FAM.AssetScheduleReport_SS.prototype.getSubsidiaryInfo = function () {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.getSubsidiaryInfo');

    var i, ret = {}, fSearch;

    if (FAM.Context.blnOneWorld) {
        fSearch = new FAM.Search(new FAM.Subsidiary());

        fSearch.addFilter('internalid', null, 'anyof', this.arrSubsidiaries);

        fSearch.addColumn('name');

        if (FAM.Context.blnMultiCurrency) {
            fSearch.addColumn('currency');
        }

        fSearch.run();

        if (fSearch.results) {
            for (i = 0; i < fSearch.results.length; i++) {
                ret[+fSearch.getId(i)] = { name : fSearch.getValue(i, 'name'),
                    currId : fSearch.getValue(i, 'currency') || 0 };
            }
        }
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Retrieves asset type information
 *
 * Parameters:
 *     none
 * Returns:
 *     {object} - contains asset type information
**/
FAM.AssetScheduleReport_SS.prototype.getAssetTypeInfo = function () {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.getAssetTypeInfo');

    var i, ret = {}, fSearch = new FAM.Search(new FAM.AssetType_Record());

    fSearch.addFilter('internalid', null, 'anyof', this.arrAssetTypes);

    fSearch.addColumn('name');

    fSearch.run();

    if (fSearch.results) {
        for (i = 0; i < fSearch.results.length; i++) {
            ret[+fSearch.getId(i)] = { name : fSearch.getValue(i, 'name') };
        }
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Saves report as a html file in the file cabinet
 *
 * Parameters:
 *     contents {string} - html formatted report
 * Returns:
 *     {number} - internal id of the file saved
**/
FAM.AssetScheduleReport_SS.prototype.saveReportFile = function (contents) {
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.saveReportFile');
    var fileExt = '.xml';
    var fileType = 'XMLDOC';
    this.logObj.endMethod();
    return FAM_Util.saveFileContents(contents, this.reportFileName, fileExt, fileType, this.reportFileDescription);
};

FAM.AssetScheduleReport_SS.prototype.filterCommonRecords = function(arrFailed){
    return function(item) {
        return arrFailed.indexOf(item) === -1;
    };
};

FAM.AssetScheduleReport_SS.prototype.filterUniqueValues = function(item, i, ar){
    return item && ar.indexOf(item) === i;
};

FAM.AssetScheduleReport_SS.prototype.tallyRecords = function(){
    this.logObj.startMethod('FAM.AssetScheduleReport_SS.tallyRecords');
    try{
        this.uniqueRecsProcessed = this.uniqueRecsProcessed.filter(this.filterUniqueValues);        
        this.uniqueRecsProcessed = this.uniqueRecsProcessed.filter(this.filterCommonRecords(this.uniqueRecsFailed));
        this.recsProcessed = this.uniqueRecsProcessed.length;
        this.recsFailed = this.uniqueRecsFailed.length;
    }
    catch (e){
        this.procInsRec.writeToProcessLog('Tally Record Failed: ' + e.toString(), 'Error', '');
        this.logObj.logExecution('Tally Record Failed. Error: ' + e.toString(), 'DEBUG');
        this.logObj.printLog();
    }
    this.logObj.endMethod();
};
