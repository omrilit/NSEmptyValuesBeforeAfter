/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.AssetDepreciation = function () {
    this.getSuiteletScreenName = function () {
        return 'assetdepreciation';
    };


    this.getDeprStatusSuiteletId = function () {
        return 'customscript_fam_processstatus_su';
    };

    this.getDeprStatusDeploymentId = function () {
        return 'customdeploy_fam_processstatus_su';
    };

    this.getPageFieldIds = function () {
        return {
            asset_type           : 'custpage_filtermsassettype',
            subsidiary           : 'custpage_filtermssubsid',
            inc_children         : 'custpage_filtercbincchild',
            dep_period           : 'custpage_deprperiod',
            dep_postperiod       : 'custpage_postperiod',
            dep_postperiod_enddate: 'custpage_postperiod_enddate',
            dep_reference        : 'custpage_deprmemo',
            dep_reference_help   : 'custpage_deprmemo_help',
            dep_period_help      : 'custpage_deprperiod_help',
            dep_postperiod_help  : 'custpage_postperiod_help',
            assettypehelp        : 'assetrecord_assettypehelp',
            subshelp             : 'assetrecord_subshelp',
            includechildhelp     : 'assetrecord_includechildhelp',
            acctng_bookhelp      : 'custpage_accountingbook_help'
        };
    };

    this.getSubmitLabelIds = function () {
        return {
            depreciate : 'custrecord_assetdepreciation_depreciatebutton'
        };
    };

    this.getErrorIds = function () {
        return {
            setup_miss   : 'custpage_setupmissing',
            setting_miss : 'custpage_settingmissing',
            date_error   : 'custpage_futuredateerror'
        };
    };

    this.callDepreciateBGP = function (initValues, arrAssetTypes, arrSubsidiaries, arrBooks) {
        var procInsId,
            BGP = new FAM.BGProcess(),
            stateStr = '',
            responseStr = null,
            ProcessIds = {},
            primaryId = FAM.Util_Shared.getPrimaryBookId(),
            status = initValues.status,
            message = initValues.message || '',
            procToRun = 'AssetValueDepr',
            datePeriod = typeof initValues.dep_period === 'string' ?
                nlapiStringToDate(initValues.dep_period) : initValues.dep_period;

        arrBooks = arrBooks || [];

        stateStr = ((arrAssetTypes && arrAssetTypes.join(':')) || '') + ',' +
            ((arrSubsidiaries && arrSubsidiaries.join(':')) || '') + ',' +
            datePeriod.getTime() + ',' + initValues.dep_reference;

        if (FAM.Context.blnMultiBook && arrBooks.indexOf(primaryId) === -1) {
            status = FAM.BGProcessStatus.Completed;
            message = 'Primary Book is not selected, will not depreciate assets.';
            procToRun = 'TaxValueDepr';
        }

        // Create BGP for Asset Value Depreciation
        BGP.createRecord({
            status : status,
            activity_type : initValues.activity_type,
            func_name : 'famAssetValueDepreciation',
            proc_name : 'Asset Depreciation',
            user : initValues.user || FAM.Context.userId,
            rec_count : 0,
            message : message,
            state_defn : 'AssetTypes,Subsidiaries,DeprPeriod,DeprMemo',
            state : stateStr
        });
        ProcessIds.AssetValueDepr = BGP.submitRecord();

        arrBooks = arrBooks.filter(function (e) { return e != primaryId; });
        stateStr += ',' + (arrBooks.join(':') || '');

        // Create BGP for Tax Value Depreciation
        BGP.createRecord({
            status : initValues.status,
            activity_type : initValues.activity_type,
            func_name : 'famTaxValueDepreciation',
            proc_name : 'Tax Method Depreciation',
            user : initValues.user || FAM.Context.userId,
            rec_count : 0,
            message : initValues.message || '',
            state_defn : 'AssetTypes,Subsidiaries,DeprPeriod,DeprMemo,AcctngBooks',
            state : stateStr
        });
        ProcessIds.TaxValueDepr = BGP.submitRecord();

        // Create BGP for Journal Writing
        BGP.createRecord({
            status : initValues.status,
            activity_type : initValues.activity_type,
            func_name : 'famJournalWriting',
            proc_name : 'Journal Writing for Depreciation',
            user : initValues.user || FAM.Context.userId,
            rec_count : 0,
            message : initValues.message || '',
            state : JSON.stringify(
                    {JrnPermit :  FAM.Context.getPermission('TRAN_JOURNALAPPRV')})
        });
        ProcessIds.famJournalWriting = BGP.submitRecord();

        // Create BGP for Updating Compound Asset
        BGP.createRecord({
            status          : initValues.status,
            activity_type   : initValues.activity_type,
            func_name       : "customscript_fam_updatecompound_mr",
            proc_name       : "Update Compound Asset",
            user            : initValues.user || FAM.Context.userId,
            message         : initValues.message || '',
        });
        ProcessIds.updateCompoundAsset = BGP.submitRecord();
        
        responseStr = BGP.invoke(ProcessIds[procToRun]).getBody();
        if (responseStr == null) {
            for (procInsId in ProcessIds) {
                BGP.loadRecord(procInsId);
                BGP.submitField({
                    status  : FAM.BGProcessStatus.Failed,
                    message : BGP.getFieldValue('message') +
                        ' \nUnexpected error while scheduling script'
                });
            }
        }

        return ProcessIds;
    };
};

FAM.GroupMaster = {};

FAM.GroupMaster.findRecord = function (altMethodId, subsidiaryId) {
    var returnValue = {},
        altDeprRecord    = new FAM.AltDeprMethod_Record(),
        fSearch          = new FAM.Search(altDeprRecord);

    fSearch.addFilter('is_group_master',  null, 'is', 'T');
    fSearch.addFilter('is_group_depr',    null, 'is', 'T');
    fSearch.addFilter('alternate_method', null, 'is', altMethodId);
    fSearch.addFilter('isinactive',       null, 'is', 'F');
    if (subsidiaryId) {
        fSearch.addFilter('subsidiary', null, 'is', subsidiaryId);
    }

    fSearch.addColumn('parent_asset');

    fSearch.run();

    if (fSearch.results) {
        returnValue = {
            altDeprId      : fSearch.getId(0),
            altDeprAssetId : fSearch.getValue(0, 'parent_asset')
        };
    }

    return returnValue;
};

FAM.GroupMaster.updateRecord = function (groupMasterId, groupMasterRec) {
    var altDeprRecord = new FAM.AltDeprMethod_Record(),
    bypassUE = FAM.SystemSetup.getSetting('allowBypassUE')=='T'||false;

    altDeprRecord.recordId = groupMasterId;
    altDeprRecord.submitField({
        original_cost : groupMasterRec.OC,
        current_cost  : groupMasterRec.CC,
        asset_life    : groupMasterRec.AL
    }, null, bypassUE);
};

// Asset depreciation processes multiple methods for a single subsidiary
//     group by custrecord_altdepraltmethod and filter by custrecord_altdepr_subsidiary
// Depreciation schedule processes a single method for multiple subsidiaries
//     group by custrecord_altdepr_subsidiary and filter by custrecord_altdepraltmethod
FAM.GroupMaster.getInfo = function (groupType, arrfilters, depreciateAssets) {
    var i, j, parentKey, key, altMethodId, groupMasterId, subsidiaryId,
        filterType       = depreciateAssets ? 'subsidiary' : 'alternate_method',
        hashGroupMasters = {},
        altDeprRec       = new FAM.AltDeprMethod_Record(),
        assetRec         = new FAM.Asset_Record(),
        fSearch          = new FAM.Search(altDeprRec);

    fSearch.addFilter('is_group_master', null, 'is', 'F');
    fSearch.addFilter('is_group_depr',   null, 'is', 'T');
    fSearch.addFilter('isinactive', null, 'is', 'F');
    fSearch.addFilter('isinactive', 'parent_asset', 'is', 'F');

    if (arrfilters && arrfilters.length) {
        fSearch.addFilter(filterType, null, 'anyof', arrfilters);

        for (j = 0; j < arrfilters.length; j++) {
            hashGroupMasters[arrfilters[j]] = {};
        }
    }

    fSearch.addColumn(filterType,         null, 'group');
    fSearch.addColumn(groupType,          null, 'group');
    fSearch.addColumn('current_cost',     null, 'sum');
    fSearch.addColumn('original_cost',    null, 'sum');
    fSearch.addColumn('residual_value',   null, 'sum');
    fSearch.addColumn('book_value',       null, 'sum');
    fSearch.addColumn('prior_year_nbv',   null, 'sum');
    fSearch.addColumn('last_depr_amount', null, 'sum');
    fSearch.addColumn('cumulative_depr',  null, 'sum');
    fSearch.addColumn('asset_life',       null, 'max');

    fSearch.run();

    if (fSearch.results) {
        nlapiLogExecution('DEBUG', 'FAM.GroupMaster.getInfo',
            'Alternate Method Group Master Count: ' + fSearch.results.length);

        for (i = 0; i < fSearch.results.length; i++) {
            if (depreciateAssets) {
                altMethodId  = fSearch.getValue(i, groupType, null, 'group');
                subsidiaryId = fSearch.getValue(i, filterType, null, 'group');
            } else {
                altMethodId  = fSearch.getValue(i, filterType, null, 'group');
                subsidiaryId = fSearch.getValue(i, groupType, null, 'group');
            }

            groupMasterId = FAM.GroupMaster.findRecord(altMethodId, subsidiaryId);
            key = depreciateAssets ? altMethodId : groupMasterId.altDeprAssetId;

            if (depreciateAssets && !FAM.Context.blnOneWorld) {
                parentKey = 0;
            }
            else {
                parentKey = +fSearch.getValue(i, filterType, null, 'group');
            }

            if (!hashGroupMasters[parentKey]) hashGroupMasters[parentKey] = {};

            hashGroupMasters[parentKey][key] = {
                OC : fSearch.getValue(i, 'original_cost',    null, 'sum'),
                CC : fSearch.getValue(i, 'current_cost',     null, 'sum'),
                NB : fSearch.getValue(i, 'book_value',       null, 'sum'),
                RV : fSearch.getValue(i, 'residual_value',   null, 'sum'),
                PB : fSearch.getValue(i, 'prior_year_nbv',   null, 'sum'),
                LD : fSearch.getValue(i, 'last_depr_amount', null, 'sum'),
                CD : fSearch.getValue(i, 'cumulative_depr',  null, 'sum'),
                AL : fSearch.getValue(i, 'asset_life',       null, 'max')
            };

            if (depreciateAssets && groupMasterId.altDeprId) {
                FAM.GroupMaster.updateRecord(groupMasterId.altDeprId,
                    hashGroupMasters[parentKey][key]);
            }
        }
    }

    return hashGroupMasters;
};

/**
 * Parent Class for Depreciating Methods
 *
 * Constructor Parameters:
 *     procInsRec {FAM.BGProcess} - Process Instance Record for this background process
**/
FAM.DepreciationCommon = function (procInsRec) {
    this.deprMethods = [];
    this.deprFunctions = [];
    this.sumRecId = {};
    this.procInsRec = procInsRec;
    this.logObj = new printLogObj('debug');
    this.perfTimer = new FAM.Timer();
    this.currCache = new FAM.FieldCache('currency');
    this.queueLimit = FAM.SystemSetup.getSetting('queueLimit') || 1000;
    this.bypassUE = FAM.SystemSetup.getSetting('allowBypassUE') === 'T' || false;

    if(FAM.Context.getQueueCount() > 1) { //MultiQueue enabled
        this.pollingIndex = +FAM.SystemSetup.getSetting('queuePollingInterval') || 50;
    }
    else {
        this.pollingIndex = 1000;
    }
    this.followAcctPer = FAM.SystemSetup.getSetting('isFollowAcctngPeriod') === 'T' || false;
    this.periodInfo    = FAM.getAccountingPeriodInfo();
    this.periodCache   = {};
    this.periodError   = {};
    this.acctSubCache  = new FAM.FieldCache();

    this.perfTimer.start();
};

FAM.DepreciationCommon.prototype.totalRecords  = 0;
FAM.DepreciationCommon.prototype.recsProcessed = 0;
FAM.DepreciationCommon.prototype.recsFailed    = 0;
FAM.DepreciationCommon.prototype.queueId       = 0;
FAM.DepreciationCommon.prototype.execLimit     = 500;
FAM.DepreciationCommon.prototype.timeLimit     = 30 * 60 * 1000; // 30 minutes

FAM.DepreciationCommon.prototype.hasSpawned = false;
FAM.DepreciationCommon.prototype.lowerLimit = 0;
FAM.DepreciationCommon.prototype.upperLimit = 0;

/**
 * Load Depreciation Methods and Formulas
 *
 * Result:
 *     this.deprMethods {FAM.SearchResult[]} - Depreciation Methods loaded
 *     this.deprFunctions {FAM.FunctionToken[]} - Depreciation Formulas loaded
 * Throws:
 *     Invalid formula expression
**/
FAM.DepreciationCommon.prototype.loadDeprMethodsFunctions = function () {
    this.logObj.startMethod('FAM.DepreciationCommon.loadDeprMethodsFunctions');

    var i, deprFormula, deprMethodId,
        srchDeprMethods = this.searchDepreciationMethods();

    if (srchDeprMethods.results) {
        for (i = 0; i < srchDeprMethods.results.length; i++) {
            deprMethodId = +srchDeprMethods.getId(i);
            this.deprMethods[deprMethodId] = srchDeprMethods.getResult(i);

            this.deprFunctions[deprMethodId] = new FAM.FunctionToken();
            deprFormula = srchDeprMethods.getValue(i, 'formula');

            if (!FAM.DeprFormula.parseFormula(deprFormula, this.deprFunctions[deprMethodId])) {
                throw nlapiCreateError('INVALID_DATA', 'Invalid Formula expression: ' +
                    deprFormula);
            }
        }
    }

    this.logObj.endMethod();
};

/**
 * Search Depreciation Methods
 *
 * Parameters:
 *     none
 * Returns:
 *     object {FAM.Search}
**/
FAM.DepreciationCommon.prototype.searchDepreciationMethods = function () {
    this.logObj.startMethod('FAM.DepreciationCommon.searchDepreciationMethods');

    var deprMethodRec = new FAM.DeprMethod_Record(),
        fSearch       = new FAM.Search(deprMethodRec);

    fSearch.addColumn('formula');
    fSearch.addColumn('end_period');
    fSearch.addColumn('next_method');
    fSearch.addColumn('depr_period');
    fSearch.addColumn('accrual_convention');
    fSearch.addColumn('final_convention');

    fSearch.run();
    this.logObj.endMethod();
    return fSearch;
};

/**
 * Depreciates a Record (asset or tax method) based on the date passed
 *
 * Parameters:
 *     recordObj {object} - record to be depreciated, with the following fields:
 *         assetId {number} - Asset Id
 *         taxMetId {number} - Tax Method Id
 *         origCost {number} - Original Cost
 *         currCost {number} - Current Cost
 *         resValue {number} - Residual Value
 *         lifetime {number} - record Lifetime
 *         periodCon {number} - Id of the Period Convention selected
 *         deprStart {string} - Depreciation Start Date
 *         annualMet {number} - Id of the Annual Method Entry selected
 *         fiscalYr {number} - Id of the Month Name selected
 *         lastPeriod {number} - Last Depreciation Period
 *         currNBV {number} - Current Net Book Value
 *         lastDepAmt {number} - Last Depreciation Amount
 *         priorNBV {number} - Prior Year Net Book Value
 *         lifeUsage {number} - Asset Lifetime Usage
 *         subsidiary {number} - Subsidiary
 *         currId {number} - Currency Id
 *         cumDepr {number} - Cumulative Depreciation
 *         assetType {number} - Asset Type
 *         quantity {number} - Quantity
 *         deprRule {number} - Depreciation Rule
 *         lastDate {string} - Last Depreciation Date
 *         deprMethod {number} - Depreciation Method
 *         convention {number} - Convention
 *         deprPeriod {number} - Depreciation Period
 *     deprDate {Date} - date up to which the record will be depreciated
 * Returns:
 *     {object} - contains the field values for depreciation of the record
**/
FAM.DepreciationCommon.prototype.depreciateRecord = function (recordObj, deprDate) {
    this.logObj.startMethod('FAM.DepreciationCommon.depreciateRecord');

    var ret = {}, nextDate, deprAmount,
        noDPCurr = FAM.SystemSetup.getSetting(['nonDecimalCurrencySymbols']);

    try {
        this.setDefaults(recordObj);
        this.validateFields(recordObj);

        recordObj.realLifetime = this.getActualLifetime(recordObj);

        while (recordObj.lastDate.getTime() < deprDate.getTime() &&
            recordObj.lastPeriod < recordObj.realLifetime) {

            nextDate = this.getNextDeprDate(recordObj);
            if (nextDate.getTime() > deprDate.getTime()) {
                break;
            }

            if (this.hasExceededLimit()) {
                recordObj.isAborted = true;
                break;
            }

            // Re-initialize logObj for each period to prevent flooding of log data
            this.logObj = new printLogObj('debug');
            this.logObj.startMethod('FAM.DepreciationCommon.depreciateRecord');
            this.logObj.pushMsg('depreciating for ' + nlapiDateToString(nextDate));

            deprAmount = this.computeNextDepreciation(recordObj, nextDate);
            this.writeHistory(recordObj, deprAmount, nextDate);

            recordObj.lastPeriod++;
            recordObj.lastDate = nextDate;
            recordObj.lastDepAmt = deprAmount;
            recordObj.cumDepr = ncRoundCurr(recordObj.cumDepr + deprAmount, recordObj.currSym,
                noDPCurr);
            recordObj.currNBV = ncRoundCurr(recordObj.currNBV - deprAmount, recordObj.currSym,
                noDPCurr);

            if (ncFAR_GetRelativeMonth(nextDate, recordObj.fiscalYr) === 11) {
                recordObj.priorNBV = recordObj.currNBV;
            }
        }

        ret = recordObj;
    }
    catch (e) {
        this.logObj.pushMsg('Unhandled Exception: ' + FAM_Util.printStackTrace(e), 'ERROR');
        this.logObj.printLog();

        ret.error = e;
    }

    try {
        this.updateStatusAndSave(recordObj);
    }
    catch (e) { // should not happen!!!
        this.logObj.logExecution('Unhandled Exception while saving record', 'ERROR');
        ret.error = e;
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Substitutes blank fields with default values
 *
 * Parameters:
 *     recObj {object} - record object to be depreciated
 * Returns:
 *     void
**/
FAM.DepreciationCommon.prototype.setDefaults = function (recordObj) {
    this.logObj.startMethod('FAM.DepreciationCommon.setDefaults');
    
    var firstDeprMet;

    recordObj.assetId = +recordObj.assetId || 0;
    recordObj.taxMetId = +recordObj.taxMetId || 0;
    recordObj.altMethod = +recordObj.altMethod || 0;
    recordObj.origCost = +recordObj.origCost || 0;
    recordObj.currCost = +recordObj.currCost || recordObj.origCost;
    recordObj.resValue = +recordObj.resValue || 0;
    recordObj.lifetime = +recordObj.lifetime || 0;
    recordObj.periodCon = +recordObj.periodCon || FAM.PeriodConvention['12m of 30d'];
    recordObj.deprStart = nlapiStringToDate(recordObj.deprStart);
    recordObj.annualMet = +recordObj.annualMet || FAM.AnnualMethodEntry['Fiscal Year'];
    recordObj.lastPeriod = +recordObj.lastPeriod || 0;
    recordObj.currNBV = +recordObj.currNBV || 0;
    recordObj.lastDepAmt = +recordObj.lastDepAmt || 0;
    recordObj.priorNBV = +recordObj.priorNBV || recordObj.origCost;
    recordObj.currUsage = 0;
    recordObj.lifeUsage = +recordObj.lifeUsage || 0;
    recordObj.cumDepr = +recordObj.cumDepr || 0;
    recordObj.assetType = +recordObj.assetType || 0;
    recordObj.quantity = +recordObj.quantity || 0;
    recordObj.deprRule = +recordObj.deprRule || FAM.DepreciationRules.Acquisition;
    recordObj.lastDate = nlapiStringToDate(recordObj.lastDate) || new Date(1980, 0, 1);
    recordObj.deprMethod = +recordObj.deprMethod || 0;
    recordObj.convention = +recordObj.convention || FAM.Conventions.None;
    recordObj.deprPeriod = +recordObj.deprPeriod || FAM.DeprPeriod.Monthly;
    recordObj.bookingId = +recordObj.bookingId || 0;
    recordObj.deprEnd = null;

    if(recordObj.deprStart){
	    if (recordObj.deprPeriod === FAM.DeprPeriod.Annually) {
	        recordObj.deprEnd = new Date(recordObj.deprStart.getFullYear() + recordObj.lifetime,
	            recordObj.deprStart.getMonth(), recordObj.deprStart.getDate() - 1);
	    }
	    else {
	        recordObj.deprEnd = new Date(recordObj.deprStart.getFullYear(),
	            recordObj.deprStart.getMonth() + recordObj.lifetime, recordObj.deprStart.getDate() - 1);
	    }
    }

    if (recordObj.annualMet === FAM.AnnualMethodEntry['Anniversary']) {
        recordObj.fiscalYr = recordObj.deprStart.getMonth() + 1;
    }
    else { // Fiscal Year and the default value
        recordObj.fiscalYr = +recordObj.fiscalYr || FAM.MonthNames.January;
    }

    if (FAM.Context.blnOneWorld) {
        recordObj.subsidiary = +recordObj.subsidiary || 0;
    }
    else {
        recordObj.subsidiary = 0;
    }

    if (!recordObj.currId) {
        var currData = this.currCache.subCurrData(recordObj.subsidiary, recordObj.bookingId);
        recordObj.currId = currData.currId;
        recordObj.currSym = currData.currSym;
    }
    else if (FAM.Context.blnMultiCurrency && !recordObj.currSym) {
        recordObj.currSym = this.currCache.fieldValue(recordObj.currId, 'symbol');
    }

    recordObj.fixedRate = 1;

    // check for DH variable in the depreciation formula
    firstDeprMet = this.getDeprMethod(recordObj.deprMethod, 1);
    recordObj.hasDH = firstDeprMet.getValue('formula').toUpperCase().indexOf('DH') !== -1;

    this.logObj.endMethod();
};

/**
 * Validates record fields to prevent depreciation errors
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 * Returns:
 *     void
 * Throws:
 *     Invalid Data Errors
**/
FAM.DepreciationCommon.prototype.validateFields = function (recordObj) {
    this.logObj.startMethod('FAM.DepreciationCommon.validateFields');

    var arrNegative = [];

    if (FAM.SystemSetup.getSetting('isAllowNegativeCost') !== 'T') {
        if (recordObj.origCost < 0) {
            arrNegative.push(FAM.resourceManager.GetString('custpage_assetcost', 'assetsplit'));
        }
        if (recordObj.currCost < 0) {
            arrNegative.push(FAM.resourceManager.GetString('custpage_assetcurrentcost',
                'assetsplit'));
        }
        if (recordObj.resValue < 0) {
            arrNegative.push(FAM.resourceManager.GetString('custpage_assetresidualvalue',
                'assetsplit'));
        }

        if (arrNegative.length > 0) {
            throw nlapiCreateError('INVALID_DATA', FAM.resourceManager.GetString(
                'client_assetrecord_notnegative', 'clientpage', null, [arrNegative.join(', ')]));
        }
    }
    
    //validate accounts if valid for rec subsidiary. 
    if(recordObj.subsidiary && !(recordObj.taxMetId && !recordObj.bookingId)){//do not validate for tax methods without accounting books
        if(recordObj.chargeAcc && !this.acctSubCache.funcValCache('FAM.compareCDLSubsidiary',
                                        'account', 
                                        recordObj.chargeAcc, 
                                        recordObj.subsidiary)){
            throw nlapiCreateError('INVALID_DATA', 
                    FAM.resourceManager.GetString('custpage_invalid_acctsub_combo', null, null, 
                    ['Charge', recordObj.assetId + (recordObj.taxMetId?', Tax Method Id: ' + recordObj.taxMetId:'')]));
        }
        
        if(recordObj.deprAcc && !this.acctSubCache.funcValCache('FAM.compareCDLSubsidiary',
                                        'account', 
                                        recordObj.deprAcc, 
                                        recordObj.subsidiary)){
            throw nlapiCreateError('INVALID_DATA', 
                    FAM.resourceManager.GetString('custpage_invalid_acctsub_combo', null, null, 
                    ['Depreciation', recordObj.assetId + (recordObj.taxMetId?', Tax Method Id: ' + recordObj.taxMetId:'')]));
        }
    }
    
    this.logObj.endMethod();
};

/**
 * Acquires the actual lifetime of the given record
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 * Returns:
 *     {number} - actual lifetime of the record
**/
FAM.DepreciationCommon.prototype.getActualLifetime = function (recordObj) {
    this.logObj.startMethod('FAM.DepreciationCommon.getActualLifetime');

    var ret = recordObj.lifetime;

    if (ret === 0) {
        // do nothing
        // this condition is in place simply to stop any processing when condition is met
        // future conditions that will adjust the lifetime should provide another else-if block
    }
    else if (recordObj.hasDH) {
        if (recordObj.deprPeriod === FAM.DeprPeriod.Monthly && recordObj.deprStart.getDate() > 1) {
            ret++;
        }
        else if (recordObj.deprPeriod === FAM.DeprPeriod.Annually &&
            (recordObj.deprStart.getDate() > 1 ||
            recordObj.deprStart.getMonth() + 1 !== recordObj.fiscalYr)) {

            ret++;
        }
    }
    else if (recordObj.convention !== FAM.Conventions.None) {
        ret++;
    }
    else if (recordObj.deprPeriod === FAM.DeprPeriod.Monthly) {
        if (recordObj.deprRule === FAM.DepreciationRules['Pro-rata']) {
            var firstDayOfMonth = 1;
            if(this.followAcctPer) { //Override first day if 4-4-5
                var currPeriodInfo = this.getInclusivePeriod(recordObj.deprStart);
                firstDayOfMonth = currPeriodInfo.startDate.getDate()
            }
            if(recordObj.deprStart.getDate() !== firstDayOfMonth) {
                ret++;
            }
        }
    }
    else if (recordObj.deprPeriod === FAM.DeprPeriod.Annually) {
        if (recordObj.deprRule === FAM.DepreciationRules.Acquisition &&
            recordObj.deprStart.getMonth() + 1 !== recordObj.fiscalYr) {

            ret++;
        }
        else if (recordObj.deprRule === FAM.DepreciationRules.Disposal &&
            recordObj.deprStart.getMonth() + 2 !== recordObj.fiscalYr) {

            ret++;
        }
        else if (recordObj.deprRule === FAM.DepreciationRules['Pro-rata'] &&
            (recordObj.deprStart.getDate() > 1 ||
            recordObj.deprStart.getMonth() + 1 !== recordObj.fiscalYr)) {

            ret++;
        }
        else if (recordObj.deprRule === FAM.DepreciationRules['Mid-month']) {
            if (recordObj.deprStart.getDate() < 16 &&
                recordObj.deprStart.getMonth() + 1 !== recordObj.fiscalYr) {

                ret++;
            }
            else if (recordObj.deprStart.getDate() > 15 &&
                recordObj.deprStart.getMonth() + 2 !== recordObj.fiscalYr) {

                ret++;
            }
        }
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Acquires the next depreciation date for the given record
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 * Returns:
 *     {Date} - date when the record will be depreciated next
**/
FAM.DepreciationCommon.prototype.getNextDeprDate = function (recordObj) {
    this.logObj.startMethod('FAM.DepreciationCommon.getNextDeprDate');

    var ret;
    if(!this.followAcctPer || recordObj.deprPeriod === FAM.DeprPeriod.Annually){
        if (recordObj.lastPeriod === 0) {
            ret = recordObj.deprStart;

            if (recordObj.deprPeriod === FAM.DeprPeriod.Annually) {
                if (recordObj.convention === FAM.Conventions.None && !recordObj.hasDH &&
                    (recordObj.deprRule === FAM.DepreciationRules['Disposal'] ||
                    (recordObj.deprRule === FAM.DepreciationRules['Mid-month'] &&
                    recordObj.deprStart.getDate() > 15))) {

                    // depreciation will start on the next month
                    ret = new Date(ret.getFullYear(), ret.getMonth() + 2, 0);
                }

                // depreciation date will be the last day of the last month of the current fiscal year
                if (ret.getMonth() + 1 >= recordObj.fiscalYr) {
                    ret = new Date(ret.getFullYear() + 1, recordObj.fiscalYr - 1, 0);
                }
                else {
                    ret = new Date(ret.getFullYear(), recordObj.fiscalYr - 1, 0);
                }
            }
            else {
                if (recordObj.convention === FAM.Conventions.None && !recordObj.hasDH &&
                    (recordObj.deprRule === FAM.DepreciationRules['Disposal'] ||
                    (recordObj.deprRule === FAM.DepreciationRules['Mid-month'] &&
                    recordObj.deprStart.getDate() > 15))) {

                    // next depreciation date will be the last day of the next month
                    ret = new Date(ret.getFullYear(), ret.getMonth() + 2, 0);
                }
                else {
                    // next depreciation date will be the last day of the month
                    ret = new Date(ret.getFullYear(), ret.getMonth() + 1, 0);
                }
            }
        }
        else {
            ret = recordObj.lastDate;

            if (recordObj.deprPeriod === FAM.DeprPeriod.Annually) {
                // next depreciation date will be the last day of the last month of the next fiscal year
                ret = new Date(ret.getFullYear() + 1, ret.getMonth() + 1, 0);
            }
            else {
                // next depreciation date will be the last day of the next month
                ret = new Date(ret.getFullYear(), ret.getMonth() + 2, 0);
            }
        }
    }
    else{ //follow accounting period scheme
        var currPeriodInfo;
        if (recordObj.lastPeriod === 0) {
            ret = recordObj.deprStart;
            currPeriodInfo = this.getInclusivePeriod(ret);
            //check if deprStart is on 2nd half of period (startdate + 15 days)
            if (!recordObj.hasDH &&
                (recordObj.deprRule === FAM.DepreciationRules['Disposal'] ||
                (recordObj.deprRule === FAM.DepreciationRules['Mid-month'] &&
                     new Date(ret.getFullYear(),
                              ret.getMonth(),
                              ret.getDate()).getTime() >=
                     new Date(currPeriodInfo.startDate.getFullYear(),
                              currPeriodInfo.startDate.getMonth(),
                              currPeriodInfo.startDate.getDate()+15).getTime()))) {

                    //get next period info
                currPeriodInfo = this.getInclusivePeriod(new Date(currPeriodInfo.endDate.getFullYear(),
                                                                  currPeriodInfo.endDate.getMonth(),
                                                                  currPeriodInfo.endDate.getDate() + 1));
            }
        }
        else {
            ret = recordObj.lastDate;
            //get next period info
            currPeriodInfo = this.getInclusivePeriod(new Date(ret.getFullYear(),
                                                              ret.getMonth(),
                                                              ret.getDate() + 1));
        }
        ret = currPeriodInfo.endDate;
    }


    this.logObj.endMethod();
    return ret;
};

/**
 * Retrieves the depreciation method to be used on the given period
 *
 * Parameters:
 *     metId {number} - Internal Id of the depreciation method of the record to be depreciated
 *     period {number} - period wherein the record will be depreciated
 * Returns:
 *     {FAM.SearchResult[]} - Depreciation Method to be used
**/
FAM.DepreciationCommon.prototype.getDeprMethod = function (metId, period) {
    this.logObj.startMethod('FAM.DepreciationCommon.getDeprMethod');

    var ret = this.deprMethods[metId], endPeriod = +ret.getValue('end_period') || 0;

    if (endPeriod !== 0 && period > endPeriod) {
        ret = this.getDeprMethod(ret.getValue('next_method'), period - endPeriod);
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Retrieves the current usage of the asset
 *
 * Parameters:
 *     assetId {number} - Internal Id of the Asset to be depreciated
 *     startDate {Date} - start date of the period to check
 *     endDate {Date} - end date of the period to check
 * Returns:
 *     {number} - current usage of the asset for the given period
**/
FAM.DepreciationCommon.prototype.getCurrentUsage = function (assetId, startDate, endDate) {
    this.logObj.startMethod('FAM.DepreciationCommon.getCurrentUsage');

    var ret = 0,
        usageRec = new FAM.AssetUsage_Record(),
        fSearch = new FAM.Search(usageRec);

    fSearch.addFilter('asset', null, 'is', assetId);
    fSearch.addFilter('date', null, 'within', startDate, endDate);

    fSearch.addColumn('units_used', null, 'sum');

    if (fSearch.run()) {
        ret = +fSearch.getValue(0, 'units_used', null, 'sum') || 0;
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Determines if the Execution Limit or Time Limit has exceeded
 *
 * Returns:
 *     true {boolean} - Execution Limit or Time Limit has exceeded
 *     false {boolean} - Execution Limit or Time Limit has not exceeded
**/
FAM.DepreciationCommon.prototype.hasExceededLimit = function () {
    this.logObj.startMethod('FAM.DepreciationCommon.hasExceededLimit');

    var ret = FAM.Context.getRemainingUsage() < this.execLimit ||
        this.perfTimer.getElapsedTime() > this.timeLimit;

    this.logObj.endMethod();
    return ret;
};

/**
 * Calculates the next depreciation amount for the given record
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 *     nextDate {Date} - date when the record will be depreciated next
 * Returns:
 *     {number} - next depreciation amount
**/
FAM.DepreciationCommon.prototype.computeNextDepreciation = function (recordObj, nextDate) {
    this.logObj.startMethod('FAM.DepreciationCommon.computeNextDepreciation');

    var ret, checkSign, recordValues, prFactor = 1, startPeriod, endPeriod, cpFactor = 1,
        nextDeprMet = this.getDeprMethod(recordObj.deprMethod, recordObj.lastPeriod + 1),
        noDPCurr = FAM.SystemSetup.getSetting(['nonDecimalCurrencySymbols']),
        finPeriodCon = +nextDeprMet.getValue('final_convention') ||
            FAM.FinalPeriodCon['Fully Depreciate'];

    if (recordObj.currNBV === recordObj.resValue) {
        ret = 0;
    }
    else if (recordObj.lastPeriod + 1 === recordObj.realLifetime &&
        finPeriodCon === FAM.FinalPeriodCon['Fully Depreciate']) {
        ret = recordObj.currNBV - recordObj.resValue;
    }
    else {
        //lastdate and startdate is equal if set to last day of the month
        if (recordObj.lastDate.getTime() >= recordObj.deprStart.getTime()) {
            startPeriod = new Date(recordObj.lastDate.getFullYear(), recordObj.lastDate.getMonth(),
                recordObj.lastDate.getDate() + 1);
        }
        else {
            startPeriod = recordObj.deprStart;
        }
        endPeriod = new Date(Math.min(nextDate.getTime(), recordObj.deprEnd.getTime()));

        if (recordObj.lifeUsage > 0 &&
            nextDeprMet.getValue('formula').toUpperCase().indexOf('CU') !== -1) {

            recordObj.currUsage = this.getCurrentUsage(recordObj.assetId, startPeriod, endPeriod);
        }

        if (nextDeprMet.getValue('formula').toUpperCase().indexOf('DH') === -1 &&
            (recordObj.convention !== FAM.Conventions.None ||
            recordObj.deprRule === FAM.DepreciationRules['Pro-rata'])) {

            prFactor = this.getProRataFactor(recordObj);

            if (recordObj.lastPeriod > 0) {
                cpFactor = prFactor;
                if(recordObj.lastPeriod + 1 < recordObj.realLifetime) {
                    prFactor = 1;
                }
                else if (recordObj.lastPeriod + 1 === recordObj.realLifetime && prFactor !== 1) {
                    prFactor = 1 - prFactor; // last period so reverse
                }
            }
        }

        // will be used to check depreciation amount against residual value
        checkSign = (recordObj.origCost / Math.abs(recordObj.origCost)) || 1;

        recordValues = {
            OC : recordObj.origCost,
            NB : recordObj.currNBV,
            RV : recordObj.resValue,
            AL : recordObj.lifetime,
            CP : recordObj.lastPeriod + cpFactor,
            TD : recordObj.origCost - recordObj.resValue,
            CU : recordObj.currUsage,
            LU : recordObj.lifeUsage,
            LD : recordObj.lastDepAmt,
            CC : recordObj.currCost,
            DH : this.getDaysHeld(startPeriod, endPeriod),
            PB : recordObj.priorNBV,
            DP : this.getDaysInPeriod(nextDate),
            FY : this.getDaysInFiscalYear(nextDate, recordObj.fiscalYr, true)
        };
        ret = FAM.DeprFormula.ExecFormula(this.deprFunctions[+nextDeprMet.getId()], recordValues);
        ret *= prFactor;

        if (isNaN(ret)) {
            this.logObj.logExecution('Error Computing Depreciation Amount. Asset values: ' +
                JSON.stringify(recordValues), 'error');
            throw 'Error computing depreciation amount.';
        }


        if ((recordObj.currNBV - ret) * checkSign < recordObj.resValue * checkSign) {
            ret = ncRoundCurr(recordObj.currNBV - recordObj.resValue, recordObj.currSym, noDPCurr);
        }
    }
    
    ret = ncRoundCurr(ret, recordObj.currSym, noDPCurr);
    this.logObj.endMethod();
    return ret;
};

/**
 * Calculates the pro-rata factor for the specific period
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 * Returns:
 *     {number} - pro-rata factor
**/
FAM.DepreciationCommon.prototype.getProRataFactor = function (recordObj) {
    this.logObj.startMethod('FAM.DepreciationCommon.getProRataFactor');

    var ret = 1;

    if (recordObj.convention === FAM.Conventions['Half-Year'] ||
        recordObj.convention === FAM.Conventions['Mid-Month']) {

        ret = 0.5;
    }
    else if (recordObj.convention === FAM.Conventions['Mid-Quarter']) {
        switch (this.getRelativeMonth(recordObj.deprStart, recordObj.fiscalYr)) {
            case 0:
            case 1:
            case 2:
                ret = 10.5;
                break;
            case 3:
            case 4:
            case 5:
                ret = 7.5;
                break;
            case 6:
            case 7:
            case 8:
                ret = 4.5;
                break;
            case 9:
            case 10:
            case 11:
                ret = 1.5
                break;
        }
        ret /= 12;
    }
    else if (recordObj.deprPeriod === FAM.DeprPeriod.Annually &&
        recordObj.deprRule === FAM.DepreciationRules['Pro-rata']) {

        if (recordObj.periodCon === FAM.PeriodConvention['Exact 365d']) {
            // get number of days in starting fiscal year
            ret = this.getDaysInFiscalYear(recordObj.deprStart, recordObj.fiscalYr);

            // get factor over the total number of days in the starting fiscal year
            ret /= this.getDaysInFiscalYear(recordObj.deprStart, recordObj.fiscalYr, true);
        }
        else {
            ret = 30 - (recordObj.deprStart.getDate() - 1); // get number of days in starting month
            if (ret < 1) {
                ret = 1; // 31 is also considered as 1 day!
            }

            // add 30 per succeeding month
            ret += (12 - (this.getRelativeMonth(recordObj.deprStart, recordObj.fiscalYr) + 1)) * 30;

            ret /= 360; // get factor over a standard year with 12 months of 30 days each
        }
    }
    else if (recordObj.deprPeriod === FAM.DeprPeriod.Monthly &&
        recordObj.deprRule === FAM.DepreciationRules['Pro-rata']) {
        if (recordObj.periodCon === FAM.PeriodConvention['Exact 365d']) {
            // get number of days in starting month
            ret = this.getDaysInMonth(recordObj.deprStart);

            // get factor over the total number of days in the starting month
            ret /= this.getDaysInMonth(recordObj.deprStart, true);
        }
        else {
            var dateOfMonth = recordObj.deprStart.getDate();
            if(this.followAcctPer){
                var msInDay        = 86400000,
                    currPeriodInfo = this.getInclusivePeriod(recordObj.deprStart);
                //Adjust date part relative to current period info
                dateOfMonth = ((recordObj.deprStart.getTime() - currPeriodInfo.startDate.getTime())/msInDay) + 1;
            }

            ret = 30 - (dateOfMonth - 1); // get number of days in starting period
            if (ret < 1) {
                ret = 1; // 31 is also considered as 1 day!
            }
            ret /= 30; // get factor over a standard 30-day month
        }
    }


    this.logObj.endMethod();
    return ret;
};

/**
 * [DUMMY] Writes depreciation history record for the next depreciation period
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 *     nextDeprAmt {number} - depreciation amount for the next period
 *     nextDeprDate {Date} - date of the next depreciation
 * Returns:
 *     void
**/
FAM.DepreciationCommon.prototype.writeHistory = function (recordObj, nextDeprAmt, nextDeprDate) {
    this.logObj.startMethod('FAM.DepreciationCommon.writeHistory');

    // this is a dummy function and should be overridden if needed

    this.logObj.endMethod();
};

/**
 * [DUMMY] Updates the Status of the record and saves the changes
 *
 * Parameters:
 *     recordObj {object} - record object to be depreciated
 * Returns:
 *     void
**/
FAM.DepreciationCommon.prototype.updateStatusAndSave = function (recordObj) {
    this.logObj.startMethod('FAM.DepreciationCommon.updateStatusAndSave');

    // this is a dummy function and should be overridden if needed

    this.logObj.endMethod();
};

/**
 * Updates Process Instance and Queue Record
 *
 * Parameters:
 *     queueFields {object} - container for Queue Instance Changed Fields
 *     procFields {object} - container for Process Instance Changed Fields
 * Returns:
 *     void
**/
FAM.DepreciationCommon.prototype.updateStatus = function (queueFields, procFields) {
    this.logObj.startMethod('FAM.DepreciationCommon.updateStatus');

    var queueRec;

    queueFields = queueFields || {};

    if (this.queueId) {
        queueFields.recsProcessed = this.recsProcessed;
        queueFields.recsFailed = this.recsFailed;

        queueRec = new FAM.Queue();
        queueRec.recordId = this.queueId;
        queueRec.submitField(queueFields, null, this.bypassUE);
    }

    this.updateProcIns(procFields, true);

    this.logObj.endMethod();
};

/**
 * Updates Process Instance Record
 *
 * Parameters:
 *     procFields {object} - container for Process Instance Changed Fields
 *     includeCount {boolean} - flag to determine if count should be updated
 * Returns:
 *     void
**/
FAM.DepreciationCommon.prototype.updateProcIns = function (procFields, includeCount) {
    this.logObj.startMethod('FAM.DepreciationCommon.updateProcIns');

    var srchQueues, totalPercent, totalProcessed = this.recsProcessed,
        totalFailed = this.recsFailed;

    procFields = procFields || {};

    if (procFields.status === FAM.BGProcessStatus.Completed) {
        includeCount = true;
    }

    if (includeCount) {
        if (this.queueId) {
            srchQueues = this.procInsRec.searchQueues(true);
            if (srchQueues.results) {
                totalProcessed = +srchQueues.getValue(0, 'recsProcessed', null, 'sum');
                totalFailed    = +srchQueues.getValue(0, 'recsFailed', null, 'sum');
            }
        }

        totalPercent = FAM_Util.round(((totalProcessed + totalFailed) / this.totalRecords) * 100);
        totalPercent = isNaN(totalPercent) ?  0 : totalPercent;

        FAM.Context.setPercentComplete(totalPercent);

        procFields.rec_count = totalProcessed;
        procFields.rec_failed = totalFailed;
        
        if (this.totalRecords === 0) {
            procFields.message = 'No records found.';
        }
        else {
            procFields.message = 'Depreciating records | ' + totalPercent + '% Complete | ' +
                this.totalRecords + ' total | ' + totalProcessed + ' depreciated | ' + totalFailed
                + ' failed';
        }
    }

    if (procFields.status === FAM.BGProcessStatus.Completed && totalFailed > 0) {
        procFields.status = FAM.BGProcessStatus.CompletedError;
    }

    try {
        this.procInsRec.submitField(procFields, null, this.bypassUE);
    }
    catch (e) {
        this.logObj.logExecution('Posible deadlock error encountered while updating count ' +
            'statistics, simply continue processing. ' + e.toString(), 'error');
    }

    this.logObj.endMethod();
};

/**
 * Computes the number of days in the given period
 *
 * Parameters:
 *     startDate {Date} - start date of the period to check
 *     endDate {Date} - end date of the period to check
 * Returns:
 *     {number} - days in period, inclusive
**/
FAM.DepreciationCommon.prototype.getDaysHeld = function (startPeriod, endPeriod) {
    this.logObj.startMethod('FAM.DepreciationCommon.getDaysHeld');

    var ret = ((endPeriod.getTime() - startPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    ret = Math.round(ret);

    this.logObj.endMethod();
    return ret;
};

/**
 * Determines the actual month based on fiscal year
 *
 * Parameters:
 *     date {Date} - date to check
 *     fiscalStart {number} - starting month (from 1-12) of the fiscal year
 * Returns:
 *     {number} - actual month (from 0-11) number based on fiscal year
**/
FAM.DepreciationCommon.prototype.getRelativeMonth = function (date, fiscalStart) {
    this.logObj.startMethod('FAM.DepreciationCommon.getRelativeMonth');

    var ret = fiscalStart === 1 ? date.getMonth() : (date.getMonth() + 1 - fiscalStart + 12) % 12;

    this.logObj.endMethod();
    return ret;
};

/**
 * Retrieves the number of days in the given fiscal year
 *
 * Parameters:
 *     checkDate {Date} - date value to check
 *     fiscalStart {number} - starting month (from 1-12) of the fiscal year
 *     isAll {boolean} - flag to determine if total number of days is expected
 * Returns:
 *     {number} - number of days in fiscal year
**/
FAM.DepreciationCommon.prototype.getDaysInFiscalYear = function (checkDate, fiscalStart, isAll) {
    this.logObj.startMethod('FAM.DepreciationCommon.getDaysInFiscalYear');

    var ret, startDate,
        relativeMonth = this.getRelativeMonth(checkDate, fiscalStart),
        endDate = new Date(checkDate.getFullYear(), checkDate.getMonth() - relativeMonth + 12, 0);

    if (isAll) {
        startDate = new Date(checkDate.getFullYear(), checkDate.getMonth() - relativeMonth, 1);
    }
    else {
        startDate = checkDate;
    }

    ret = this.getDaysHeld(startDate, endDate);

    this.logObj.endMethod();
    return ret;
};

/**
 * Retrieves the number of days in the given month
 *
 * Parameters:
 *     checkDate {Date} - date value to check
 *     isAll {boolean} - flag to determine if total number of days is expected
 * Returns:
 *     {number} - number of days in month
**/
FAM.DepreciationCommon.prototype.getDaysInMonth = function (checkDate, isAll) {
    this.logObj.startMethod('FAM.DepreciationCommon.getDaysInMonth');

    var ret, endDate = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0);

    if (isAll) {
        ret = endDate.getDate();
    }
    else {
        ret = endDate.getDate() - checkDate.getDate() + 1;
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Retrieves the accounting period a date belongs to
 *
 * Parameters:
 *      checkDate {Date} date value to check
 * Returns:
 *      periodInfo {object} period information containing all relevant properties
**/
FAM.DepreciationCommon.prototype.getInclusivePeriod = function(checkDate){
    this.logObj.startMethod('FAM.DepreciationCommon.getInclusivePeriod');
    var i = 0, ret, msg, checkAdjust = true;

    if (this.periodCache[checkDate.getTime()]) {
        ret = this.periodCache[checkDate.getTime()];
    }
    else if (this.periodError[checkDate.getTime()]) {
        throw this.periodError[checkDate.getTime()];
    }
    else {
        do {
            if (checkAdjust && checkDate.getTime() < this.periodInfo[i].startDate.getTime()) {
                msg = 'No accounting period found for ' + nlapiDateToString(checkDate);
                this.periodError[checkDate.getTime()] = msg;
                throw msg;
            }

            if (checkDate.getTime() > this.periodInfo[i].endDate.getTime()) {
                i++;
            }
            else if (checkAdjust && this.periodInfo[i].isAdjust) {
                checkAdjust = false;
                i++;
            }
            else {
                ret = this.periodInfo[i];
                this.periodCache[checkDate.getTime()] = this.periodInfo[i];
            }
        } while (i < this.periodInfo.length && !this.periodCache[checkDate.getTime()]);

        if (!this.periodCache[checkDate.getTime()]) {
            msg = 'No open future accounting period for ' + nlapiDateToString(checkDate);
            this.periodError[checkDate.getTime()] = msg;
            throw msg;
        }

    }
    this.logObj.endMethod();
    return ret;
};

/**
 * Finds the ancestor of the given asset wherein an ancestor is an asset with no parent
 *
 * Parameters:
 *     assetId {number} - internal id of the asset to lookup
 * Returns:
 *     {object}
 *         > id {number} - internal id of the ancestor asset
 *         > name {name} - display name of the ancestor asset
**/
FAM.DepreciationCommon.prototype.findAncestorAsset = function (assetId) {
    this.logObj.startMethod('FAM.DepreciationCommon.findAncestorAsset');

    var ret = {}, assetInfo, assetRec = new FAM.Asset_Record();

    if (assetId) {
        assetRec.recordId = assetId;
        assetInfo = assetRec.lookupField(['parent_id', 'name', 'altname']);

        if (assetInfo.custrecord_assetparent) {
            ret = this.findAncestorAsset(assetInfo.custrecord_assetparent);
        }
        else {
            ret = { id : assetId, name : assetInfo.name + ' ' + assetInfo.altname };
        }
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Retrieves the number of days in the given period
 *
 * Parameters:
 *     checkDate {Date} - date value to check
 * Returns:
 *     {number} - number of days in period
**/
FAM.DepreciationCommon.prototype.getDaysInPeriod = function (checkDate) {
    this.logObj.startMethod('FAM.DepreciationCommon.getDaysInPeriod');

    var ret, periodInfo;

    if (this.followAcctPer) {
        periodInfo = this.getInclusivePeriod(checkDate);
        ret = this.getDaysHeld(periodInfo.startDate, periodInfo.endDate)
    }
    else {
        ret = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0).getDate();
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Returns the existing summary record based on given asset info
 *
 * Parameters:
 *     {Object} recordObj - Asset record
 *     {Date}   nextDeprDate - Depreciation Period
 *     {Object} groupInfo -
 *                  groupBy - Summary grouping set in FAM Setup
 *                  groupId - Record ID of the selected grouping 
 * Returns:
 *     Summary record ID - null
**/
FAM.DepreciationCommon.prototype.getExistingSummary = function(recordObj, nextDeprDate, groupInfo) {
    this.logObj.startMethod('FAM.DepreciationCommon.getExistingSummary');
    var period       = '' + nextDeprDate.getFullYear() + (nextDeprDate.getMonth() + 1) + nextDeprDate.getDate(),
        subsidiary   = recordObj.subsidiary || 0,
        book         = recordObj.bookingId || 0,
        accounts     = [recordObj.deprAcc, recordObj.chargeAcc].join('|'),
        groupBy      = groupInfo.groupBy, 
        groupingId   = groupInfo.groupId,
        arrCDL       = [],
        cdl;
    
    arrCDL.push(recordObj.classfld || 0);
    arrCDL.push(recordObj.department || 0);
    arrCDL.push(recordObj.location || 0);
    cdl = arrCDL.join('|');
    
    if (!this.sumRecId[period]){
        this.sumRecId[period] = {};
    }
    if (!this.sumRecId[period][subsidiary]){
        this.sumRecId[period][subsidiary] = {};
    }
    if (!this.sumRecId[period][subsidiary][book]){
        this.sumRecId[period][subsidiary][book] = {};
    }
    if (!this.sumRecId[period][subsidiary][book][cdl]){
        this.sumRecId[period][subsidiary][book][cdl] = {};
    }
    if (!this.sumRecId[period][subsidiary][book][cdl][groupBy]){
        this.sumRecId[period][subsidiary][book][cdl][groupBy] = {};
    }
    if (!this.sumRecId[period][subsidiary][book][cdl][groupBy][groupingId]){
        this.sumRecId[period][subsidiary][book][cdl][groupBy][groupingId] = {};
    }
    if (!this.sumRecId[period][subsidiary][book][cdl][groupBy][groupingId][accounts]){
        this.sumRecId[period][subsidiary][book][cdl][groupBy][groupingId][accounts] = {};
    }
    if (!this.sumRecId[period][subsidiary][book][cdl][groupBy][groupingId][accounts][recordObj.project]){
        this.sumRecId[period][subsidiary][book][cdl][groupBy][groupingId][accounts][recordObj.project] = null;
        blnCreateSummary = true;
    }
    
    this.logObj.endMethod();    
    return this.sumRecId[period][subsidiary][book][cdl][groupBy][groupingId][accounts];
};


/**
 * Generates memo field for Journal Line
 *
 * Parameters:
 *     recordObj - Asset record
 *     groupInfo {text} - Group Info used in Sub-Category
 * Returns:
 *     Journal Memo {Text}
**/
FAM.DepreciationCommon.prototype.constructJournalMemo = function (recordObj, groupInfo) {
    this.logObj.startMethod('FAM.DepreciationCommon.constructJournalMemo');

    var jrnSummary = +FAM.SystemSetup.getSetting('isSummarizeJe'), 
        ret = null,
        strMemoFam = ' (FAM)';

    if (this.procInsRec.stateValues.DeprMemo) {
        ret = this.procInsRec.stateValues.DeprMemo + strMemoFam;
    }
    else if (jrnSummary === FAM.SummarizeBy['Parent']) {
        if (groupInfo.groupBy == 'PAS') {
            ret = FAM.resourceManager.GetString('custpage_assetdepreciation', 'assetdepreciation')
                + strMemoFam;
        }
        else {
            ret = recordObj.parentAssetName + strMemoFam;
        }
    }
    else if (jrnSummary === FAM.SummarizeBy['Sub-Category']) {
        if (groupInfo.groupBy == 'SCS') {
            ret = FAM.resourceManager.GetString('custpage_assetdepreciation', 'assetdepreciation')
                + strMemoFam;
        }
        else {
            var repMainSubCatA = recordObj.repSubA;
            repMainSubCatA = repMainSubCatA.replace(/,/g, ' ');
            ret = recordObj.assetTypeName + '-' + 
                  recordObj.repMainCat + '-' +
                  repMainSubCatA + strMemoFam;
        }
    }
    else {
        // Default Option: Asset Type
        ret = recordObj.assetTypeName + strMemoFam;
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Acquires group information for summarizing journals
 *
 * Parameters:
 *     recObj {object} - record object to be written
 * Returns:
 *     void
**/
FAM.DepreciationCommon.prototype.getJournalGrouping = function (recObj) {
    this.logObj.startMethod('FAM.DepreciationCommon.getJournalGrouping');

    var jrnSummary      = +FAM.SystemSetup.getSetting('isSummarizeJe'),
        retData         = {
            groupBy : '',
            groupId : 0
        }; 
        
    if (jrnSummary === FAM.SummarizeBy['Parent']) {
        if (+recObj.parentAssetId !== +recObj.assetId || this.hasChildrenAsset(recObj.assetId)) {
            //Group together all assets with associates
            retData.groupBy = 'PA';
            retData.groupId = recObj.parentAssetId;
        }
        else {
            retData.groupBy = 'PAS';
        }
    }
    else if (jrnSummary === FAM.SummarizeBy['Sub-Category']) {
        if (recObj.repSubAId) {
            retData.groupBy = 'SC';
            retData.groupId = [recObj.assetType, 
                               recObj.repMainCatId,
                               recObj.repSubAId];
        }
        else {
            retData.groupBy = 'SCS';
        }
    }
    else {
        //Default Asset-Type
        retData.groupBy = 'AT';
        retData.groupId = recObj.assetType;
    }

    this.logObj.endMethod();
    return retData;
};

/**
 * Finds if an asset has children asset
 *
 * Parameters:
 *     assetId {number} - internal id of the asset to lookup
 * Returns:
 *     true {boolean} - Children Asset found
 *     false {boolean} - when asset id is not defined
**/
FAM.DepreciationCommon.prototype.hasChildrenAsset = function (assetId) {
    this.logObj.startMethod('FAM.DepreciationCommon.hasChildrenAsset');

    var ret         = false,
        assetRec    = new FAM.Asset_Record(),
        fSearch     = new FAM.Search(assetRec);

    if (assetId) {
        fSearch.addFilter('parent_id', null, 'anyof', assetId);
        fSearch.addFilter('isinactive', null, 'is', 'F');
        if(fSearch.run()){
            ret = true;
        }
    }

    this.logObj.endMethod();
    return ret;
};