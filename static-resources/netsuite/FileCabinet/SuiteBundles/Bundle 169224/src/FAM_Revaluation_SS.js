/**
 * � 2014 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

/**
 * Starter for Background Processing function for Asset Revaluation
 *
 * Parameters:
 *     BGP {FAM.BGProcess} - Process Instance Record for this background process
 * Returns:
 *     true {boolean} - processing should be requeued
**/
function famAssetRevaluation(BGP) {
    var assetRevaluation = new FAM.Revaluation_SS(BGP);

    try {
        return assetRevaluation.run();
    }
    catch (e) {
        assetRevaluation.logObj.printLog();
        throw e;
    }
}

/**
 * Class for revaluating records; Inherits FAM.DepreciationCommon
 *
 * Constructor Parameters:
 *     procInsRec {FAM.BGProcess} - Process Instance Record for this background process
**/
FAM.Revaluation_SS = function (procInsRec) {
    // Call Parent Constructor
    FAM.DepreciationCommon.apply(this, arguments);
    
    var rollbackDetails = this.procInsRec.getFieldValue('rollback_data');
    
    this.currentRecord = null;

    this.totalRecords = +this.procInsRec.getFieldValue('rec_total') || 0;
    this.recsProcessed = +this.procInsRec.getFieldValue('rec_count') || 0;
    this.recsFailed = +this.procInsRec.getFieldValue('rec_failed') || 0;
    this.recsSkipped = +this.procInsRec.getFieldValue('rec_skipped') || 0;

    this.recsToProcess = this.procInsRec.stateValues.Records || [];

    if (rollbackDetails) {
        this.rollbackData = JSON.parse(rollbackDetails);
    }
    else {
        this.rollbackData = {};
    }
    
    this.assetCache = new FAM.FieldCache('customrecord_ncfar_asset');
    this.journalObj = new FAM.JournalWriting();
};

// Prototypal Inheritance
FAM.Revaluation_SS.prototype = Object.create(FAM.DepreciationCommon.prototype);

/**
 * Main function for this class
 *
 * Parameters:
 *     none
 * Returns:
 *     void
**/
FAM.Revaluation_SS.prototype.run = function () {
    this.logObj.startMethod('FAM.Revaluation_SS.run');

    var ret;
    
    if (this.totalRecords === 0) {
        this.totalRecords = this.recsToProcess.length;
        if (this.totalRecords === 0) {
            this.updateProcIns({ status : FAM.BGProcessStatus.Completed });
            return;
        }
    }

    this.loadDeprMethodsFunctions();
    ret = this.iterateRecords();

    this.logObj.endMethod();
    return ret;
};

/**
 * Updates Process Instance Record
 *
 * Parameters:
 *     procFields {object} - container for Process Instance Changed Fields
 * Returns:
 *     void
**/
FAM.Revaluation_SS.prototype.updateProcIns = function (procFields) {
    this.logObj.startMethod('FAM.Revaluation_SS.updateProcIns');

    var totalPercent;

    procFields = procFields || {};

    totalPercent = FAM_Util.round(((this.recsProcessed + this.recsFailed + this.recsSkipped) /
        this.totalRecords) * 100);
    totalPercent = (isNaN(totalPercent) || totalPercent === Infinity) ?  0 : totalPercent;

    FAM.Context.setPercentComplete(totalPercent);

    procFields.rec_total = this.totalRecords;
    procFields.rec_count = this.recsProcessed;
    procFields.rec_failed = this.recsFailed;
    procFields.rec_skipped = this.recsSkipped;
    procFields.rollback_data = JSON.stringify(this.rollbackData);

    if (!procFields.message) {
        if (this.totalRecords === 0) {
            procFields.message = 'No records found.';
        }
        else {
            procFields.message = 'Revaluating Records | ' + totalPercent + '% Complete | ' +
                this.totalRecords + ' total | ' + this.recsProcessed + ' processed | ' +
                this.recsSkipped + ' skipped | ' + this.recsFailed + ' failed';
        }
    }

    if (procFields.status === FAM.BGProcessStatus.Completed && this.recsFailed > 0) {
        procFields.status = FAM.BGProcessStatus.CompletedError;
    }

    this.procInsRec.submitField(procFields);

    this.logObj.endMethod();
};

/**
 * Iterates through records to be revaluated
 *
 * Parameters:
 *     none
 * Returns:
 *     void
**/
FAM.Revaluation_SS.prototype.iterateRecords = function () {
    this.logObj.startMethod('FAM.Revaluation_SS.iterateRecords');

    var i, updatedValues, procFields = null, ret = true, isRollback = false,
        blnToRequeue = false, timer = new FAM.Timer(),
        lastId = +this.procInsRec.getScriptParam('lowerLimit') || 0;

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
        updatedValues = this.revalueRecord(this.recsToProcess[i]);
        this.checkResults(updatedValues, timer.getReadableElapsedTime());
    }

    if (blnToRequeue) {
        this.logObj.logExecution('Execution Limit | Remaining Usage: ' +
            FAM.Context.getRemainingUsage() + ' | Time Elapsed: ' +
            this.perfTimer.getReadableElapsedTime());
        this.procInsRec.setScriptParams({ lowerLimit : lastId });
    }
    else {
        delete this.rollbackData.pending;
        delete this.rollbackData.failed;
        
        isRollback = JSON.stringify(this.rollbackData) !== JSON.stringify({});
        
        if (!isRollback) {
            procFields = { status : FAM.BGProcessStatus.Completed };
        }
    }

    this.updateProcIns(procFields);

    if (isRollback) {
        ret = this.triggerRollback();
    }
    
    this.logObj.endMethod();
    return ret;
};

/**
 * Revalues records based on parameters
 *
 * Parameters:
 *     revalueObj {object} - includes record id to be revaluated and its parameters
 * Returns:
 *     {string} - error message, if any
**/
FAM.Revaluation_SS.prototype.revalueRecord = function (revalueObj) {
    this.logObj.startMethod('FAM.Revaluation_SS.revalueRecord');

    var recObj = {}, lastDate;

    try {
        recObj = this.getInformation(revalueObj);
        FAM.DepreciationCommon.prototype.setDefaults.apply(this, [recObj]);
        this.isValidForRevalue(recObj);
        if (this.isFailedGroup(recObj.bookingId, recObj.compound)) {
            return { skipped : true };
        }
        recObj = this.applyRevaluePrams(recObj, revalueObj);

        if (recObj.revRule === FAM.RevisionRules.CurrentPeriod) {
            lastDate = recObj.lastDate;
            recObj.oldCumDepr = recObj.cumDepr;
            recObj.lastPeriod = 0;
            recObj.cumDepr = 0;
            recObj.lastDepAmt = 0;
            recObj.currNBV = recObj.currCost;
            recObj.priorNBV = recObj.origCost;
            recObj.lastDate = new Date(1980, 0, 1);

            recObj = this.depreciateRecord(recObj, lastDate);

            if (recObj.error || recObj.isAborted) {
                return recObj;
            }

            recObj.deprAdj = ncRoundCurr(recObj.cumDepr - recObj.oldCumDepr, recObj.currSym,
                FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols'));
        }
        
        this.writeHistories(recObj, revalueObj.writeDown);
        this.updateRecord(recObj);
    }
    catch (e) {
        this.logObj.pushMsg('Unhandled Exception: ' + FAM_Util.printStackTrace(e), 'ERROR');
        this.logObj.printLog();

        this.failRollbackGroup(recObj.bookingId, recObj.compound);

        recObj.error = e;
    }

    this.logObj.endMethod();
    return recObj;
};

/**
 * Acquires values needed for revaluation
 *
 * Parameters:
 *     revalueObj {object} - includes record id to be revaluated and its parameters
 * Returns:
 *     {object} - record object to be revaluated
**/
FAM.Revaluation_SS.prototype.getInformation = function (revalueObj) {
    this.logObj.startMethod('FAM.Revaluation_SS.getInformation');

    var ret = {}, nsAssetRec,
        assetRec = new FAM.Asset_Record(),
        assetRecTypeId = assetRec.getRecordTypeId();

    if (revalueObj.asset) {
        nsAssetRec = this.assetCache.funcValCache('nlapiLoadRecord', assetRecTypeId,
            revalueObj.asset);
        this.currentRecord = new FAM.Asset_Record();
        this.currentRecord.record = nsAssetRec;

        ret.assetId = revalueObj.asset;
        ret.origCost = this.currentRecord.getFieldValue('initial_cost');
        ret.resValue = this.currentRecord.getFieldValue('rv');
        ret.lifetime = this.currentRecord.getFieldValue('lifetime');
        ret.fiscalYr = this.currentRecord.getFieldValue('fyscal_year_start');
        ret.lastDepAmt = this.currentRecord.getFieldValue('lastDeprAmount');
        ret.priorNBV = this.currentRecord.getFieldValue('prior_nbv');
        ret.lifeUsage = this.currentRecord.getFieldValue('lifetime_usage');
        ret.cumDepr = this.currentRecord.getFieldValue('cummulative_depr');
        ret.rvPercent = this.currentRecord.getFieldValue('rv_percent');
        ret.quantity = this.currentRecord.getFieldValue('quantity');
        ret.classfld = this.currentRecord.getFieldValue('classfld');
        ret.department = this.currentRecord.getFieldValue('department');
        ret.location = this.currentRecord.getFieldValue('location');
        ret.writeDownAcc = this.currentRecord.getFieldValue('writedown_account');
        ret.deprChargeAcc = this.currentRecord.getFieldValue('depr_charge_account');
        ret.compound = this.currentRecord.getFieldValue('component_of') || ret.assetId;
        ret.assetName = this.currentRecord.getFieldValue('name') + ' ' +
            this.currentRecord.getFieldValue('altname');
        ret.bookingId = FAM.Util_Shared.getPrimaryBookId() || 0;
    }
    else if (revalueObj.tax) {
        this.currentRecord = new FAM.AltDeprMethod_Record();
        this.currentRecord.loadRecord(revalueObj.tax);

        ret.taxMetId = revalueObj.tax;
        ret.assetId = this.currentRecord.getFieldValue('parent_asset');
        
        nsAssetRec = this.assetCache.funcValCache('nlapiLoadRecord', assetRecTypeId,
            ret.assetId);
        assetRec.record = nsAssetRec;
        
        ret.altMethod = this.currentRecord.getFieldValue('alternate_method');
        ret.currId = this.currentRecord.getFieldValue('currency');
        ret.convention = this.currentRecord.getFieldValue('convention');
        ret.periodCon = this.currentRecord.getFieldValue('period_convention');
        ret.deprPeriod = this.currentRecord.getFieldValue('depr_period');
        ret.isGrpMaster = this.currentRecord.getFieldValue('is_group_master') === 'T';
        ret.isGrpDepr = this.currentRecord.getFieldValue('is_group_depr') === 'T';
        ret.bookingId = this.currentRecord.getFieldValue('booking_id');
        ret.origCost = this.currentRecord.getFieldValue('original_cost');
        ret.resValue = this.currentRecord.getFieldValue('residual_value');
        ret.lifetime = this.currentRecord.getFieldValue('asset_life');
        ret.fiscalYr = this.currentRecord.getFieldValue('financial_year_start');
        ret.lastDepAmt = this.currentRecord.getFieldValue('last_depr_amount');
        ret.priorNBV = this.currentRecord.getFieldValue('prior_year_nbv');
        ret.cumDepr = this.currentRecord.getFieldValue('cumulative_depr');
        ret.rvPercent = this.currentRecord.getFieldValue('rv_percentage');
        ret.quantity = assetRec.getFieldValue('quantity');
        ret.classfld = assetRec.getFieldValue('classfld');
        ret.department = assetRec.getFieldValue('department');
        ret.location = assetRec.getFieldValue('location');
        ret.writeDownAcc = this.currentRecord.getFieldValue('write_down_account');
        ret.deprChargeAcc = this.currentRecord.getFieldValue('charge_account');
        ret.compound = assetRec.getFieldValue('component_of') || ret.assetId;
        ret.assetName = assetRec.getFieldValue('name') + ' ' + assetRec.getFieldValue('altname');
    }

    ret.currCost = this.currentRecord.getFieldValue('current_cost');
    ret.deprStart = this.currentRecord.getFieldValue('depr_start_date');
    ret.annualMet = this.currentRecord.getFieldValue('annual_entry');
    ret.lastPeriod = this.currentRecord.getFieldValue('last_depr_period');
    ret.currNBV = this.currentRecord.getFieldValue('book_value');
    ret.subsidiary = this.currentRecord.getFieldValue('subsidiary');
    ret.deprRule = this.currentRecord.getFieldValue('depr_rules');
    ret.lastDate = this.currentRecord.getFieldValue('last_depr_date');
    ret.deprMethod = this.currentRecord.getFieldValue('depr_method');
    ret.revRule = +this.currentRecord.getFieldValue('revision_rules');
    ret.assetType = this.currentRecord.getFieldValue('asset_type');
    ret.assetAcc = this.currentRecord.getFieldValue('asset_account');
    ret.deprAcc = this.currentRecord.getFieldValue('depr_account');
    ret.status = this.currentRecord.getFieldValue('status');
    
    this.logObj.endMethod();
    return ret;
};

/**
 * [INACTIVATE] Substitutes blank fields with default values
 *
 * Parameters:
 *     recObj {object} - record object to be depreciated
 * Returns:
 *     void
**/
FAM.Revaluation_SS.prototype.setDefaults = function (recObj) {};

/**
 * Verifies that the record object is valid for revaluation
 *
 * Parameters:
 *     recObj {object} - record object to be revaluated
 * Returns:
 *     none
**/
FAM.Revaluation_SS.prototype.isValidForRevalue = function (recObj) {
    this.logObj.startMethod('FAM.Revaluation_SS.isValidForRevalue');

    if (recObj.isGrpDepr || recObj.isGrpMaster) {
        throw nlapiCreateError('INVALID_DATA', FAM.resourceManager.GetString(
            'custpage_groupdeprerror', 'assetrevaluation'));
    }

    // Checks revaluation date (reval date should not be earlier than the last depreciation date)
    var revalDate = this.procInsRec.stateValues.Date ? new Date(this.procInsRec.stateValues.Date)
        : new Date();
    var lastDate = recObj.lastDate;

    if (revalDate < lastDate) {
        throw nlapiCreateError('INVALID_DATA', FAM.resourceManager.GetString(
            'custpage_reval_date_error', 'assetrevaluation'));
    }

    this.logObj.endMethod();
};

/**
 * Applies revaluations parameters to the record
 *
 * Parameters:
 *     recObj {object} - record object to be revaluated
 *     revalueObj {object} - includes record id to be revaluated and its parameters
 * Returns:
 *     {object} - record object to be revaluated
**/
FAM.Revaluation_SS.prototype.applyRevaluePrams = function (recObj, revalueObj) {
    this.logObj.startMethod('FAM.Revaluation_SS.applyRevaluePrams');

    var noDPCurr = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');

    if (revalueObj.writeDown !== undefined) {
        revalueObj.writeDown = ncRoundCurr(revalueObj.writeDown, recObj.currSym, noDPCurr);
        recObj.currCost = ncRoundCurr(recObj.currCost - revalueObj.writeDown, recObj.currSym,
            noDPCurr);
        recObj.currNBV = ncRoundCurr(recObj.currNBV - revalueObj.writeDown, recObj.currSym,
            noDPCurr);
    }
    if (revalueObj.life !== undefined) {
        recObj.lifetime = revalueObj.life;

        if (recObj.deprPeriod === FAM.DeprPeriod.Annually) {
            recObj.deprEnd = new Date(recObj.deprStart.getFullYear() + recObj.lifetime,
                recObj.deprStart.getMonth(), recObj.deprStart.getDate() - 1);
        }
        else {
            recObj.deprEnd = new Date(recObj.deprStart.getFullYear(),
                recObj.deprStart.getMonth() + recObj.lifetime, recObj.deprStart.getDate() - 1);
        }
        if (recObj.lifetime == recObj.lastPeriod) {
            recObj.status = FAM.AssetStatus['Fully Depreciated'];
        }
        
    }
    if (revalueObj.method !== undefined) {
        recObj.deprMethod = revalueObj.method;
    }
    if (revalueObj.rv !== undefined) {
        recObj.resValue = revalueObj.rv;
        recObj.rvPercent = FAM.Util_Shared.Math.roundToDec(recObj.resValue / recObj.currCost * 100);
    }

    this.logObj.endMethod();
    return recObj;
};

/**
 * Records revaluation via history records
 *
 * Parameters:
 *     recObj {object} - record object to be revaluated
 *     writeDown {number} - write down amount
 * Returns:
 *     none
**/
FAM.Revaluation_SS.prototype.writeHistories = function (recObj, writeDown) {
    this.logObj.startMethod('FAM.Revaluation_SS.writeHistories');

    var fields, journalId, histId,
        tranDate = +this.procInsRec.stateValues.Date,
        histRec = new FAM.DepreciationHistory_Record();

    if (tranDate) {
        tranDate = new Date(tranDate);
    }
    else {
        tranDate = new Date();
    }

    journalId = this.writeJournal(recObj, writeDown, tranDate);

    fields = {
        asset : recObj.assetId,
        asset_type : recObj.assetType,
        date : nlapiDateToString(tranDate),
        net_book_value : recObj.currNBV,
        quantity : recObj.quantity
    };

    if (recObj.subsidiary) { fields.subsidiary = recObj.subsidiary; }
    if (recObj.bookingId) { fields.bookId = recObj.bookingId; }
    if (journalId) { fields.posting_reference = journalId; }


    if (recObj.taxMetId) {
        fields.alternate_depreciation = recObj.taxMetId;
        fields.alternate_method = recObj.altMethod;
        fields.actual_depreciation_method = recObj.deprMethod;
    }

    if (writeDown !== undefined) {
        fields.transaction_type = FAM.TransactionType['Write-Down'];
        fields.transaction_amount = writeDown;

        histRec.createRecord(fields);
        histId = histRec.submitRecord();
        this.addToPending(recObj.bookingId, recObj.compound, 'h', histId);
    }

    if (recObj.revRule === FAM.RevisionRules.CurrentPeriod && recObj.deprAdj !== 0) {
        fields.transaction_type = FAM.TransactionType.Revaluation;
        fields.transaction_amount = recObj.deprAdj;

        histRec.createRecord(fields);
        histId = histRec.submitRecord();
        this.addToPending(recObj.bookingId, recObj.compound, 'h', histId);
    }

    this.logObj.endMethod();
};

/**
 * Writes the transaction amounts to journal entries
 *
 * Parameters:
 *     recObj {object} - record object to be revaluated
 *     writeDown {number} - write down amount
 *     tranDate {Date} - date of transaction
 * Returns:
 *     {number} - internal id of journal entry saved
**/
FAM.Revaluation_SS.prototype.writeJournal = function (recObj, writeDown, tranDate) {
    this.logObj.startMethod('FAM.Revaluation_SS.writeJournal');

    var ret = null, journalDate, journalType, accForWD, accounts = [],
        debits = [], credits = [], journalMemo, memoValues = [], acctErrMsg = {},
        memo = this.procInsRec.stateValues.Memo;

    if (writeDown === undefined && (recObj.revRule === FAM.RevisionRules.RemainingLife ||
        recObj.deprAdj === 0)) {

        return ret;
    }

    if (writeDown !== undefined) {
        if (FAM.SystemSetup.getSetting('isWriteDown') === 'T') {
            if (!recObj.deprAcc) {
                throw (FAM.resourceManager.GetString('custpage_depracct_missing', 'assetrevaluation'));
            }
            acctErrMsg['key-'+recObj.deprAcc] = 'custpage_depracct_missing';
            accForWD = recObj.deprAcc;
        }
        else {
            if (!recObj.assetAcc) {
                throw (FAM.resourceManager.GetString('custpage_assetacct_missing', 'assetrevaluation'));
            }
            acctErrMsg['key-'+recObj.assetAcc] = 'custpage_assetacct_missing';
            accForWD = recObj.assetAcc;
        }

        if (memo) {
            journalMemo = memo + ' (FAM)';
        }
        else {
            journalMemo = 'Asset write-down for ' + recObj.assetName + ' (FAM)';
        }

        if (!recObj.writeDownAcc) {
            throw (FAM.resourceManager.GetString('custpage_wdacct_missing', 'assetrevaluation'));
        }

        acctErrMsg['key-'+recObj.writeDownAcc] = 'custpage_wdacct_missing';
        accounts.push(recObj.writeDownAcc);
        debits.push(writeDown);
        credits.push(0);
        memoValues.push(journalMemo);

        accounts.push(accForWD);
        debits.push(0);
        credits.push(writeDown);
        memoValues.push(journalMemo);
    }

    if (recObj.revRule === FAM.RevisionRules.CurrentPeriod && recObj.cumDepr != 0) {
        if (!recObj.deprChargeAcc) {
            throw (FAM.resourceManager.GetString('custpage_deprchargeacct_missing', 'assetrevaluation'));
        }

        if (!recObj.deprAcc) {
            throw (FAM.resourceManager.GetString('custpage_depracct_missing', 'assetrevaluation'));
        }

        if (memo) {
            journalMemo = memo + ' (FAM)';
        }
        else {
            journalMemo = 'Asset revaluation for ' + recObj.assetName + ' (FAM)';
        }

        acctErrMsg['key-'+recObj.deprChargeAcc] = 'custpage_deprchargeacct_missing';
        acctErrMsg['key-'+recObj.deprAcc] = 'custpage_depracct_missing';

        accounts.push(recObj.deprChargeAcc);
        debits.push(recObj.deprAdj);
        credits.push(0);
        memoValues.push(journalMemo);

        accounts.push(recObj.deprAcc);
        debits.push(0);
        credits.push(recObj.deprAdj);
        memoValues.push(journalMemo);
    }

    if (!this.journalObj.periodInfo) {
        this.journalObj.periodInfo = FAM.getAccountingPeriodInfo();

        if (!this.journalObj.periodInfo) {
            throw 'Unable to retrieve accounting period information';
        }
    }

    journalDate = this.journalObj.getOpenPeriod(tranDate);
    journalType = FAM.SystemSetup.getSetting("allowCustomTransaction") == 'T' ? 
        'customtransaction_fam_revaluation_jrn' : '';
    try {
        ret = FAM_Util.createJournalEntry({
            "type"       : journalType,
            "trnDate"    : journalDate, 
            "currId"     : recObj.currId,
            "accts"      : accounts,
            "debitAmts"  : debits,
            "creditAmts" : credits,
            "ref"        : memoValues,
            "subId"      : recObj.subsidiary,
            "classId"    : recObj.classfld,
            "deptId"     : recObj.department,
            "locId"      : recObj.location,
            "bookId"     : recObj.bookingId,
            "entities"   : [],
            "permit"     : this.procInsRec.stateValues.JrnPermit
        });
        this.addToPending(recObj.bookingId, recObj.compound, journalType || 'journalentry', ret);
    } catch (ex) {
        if (ex.getCode && ex.getCode() === 'INVALID_KEY_OR_REF' && accounts.length > 0) {
            var ret = nlapiSearchRecord('account', null,
                        [new nlobjSearchFilter('isinactive', null, 'is', 'T'),
                         new nlobjSearchFilter('internalid', null, 'anyof', accounts)],
                         new nlobjSearchColumn('name'));

            if (ret) {
                var key = 'key-' + ret[0].getId();

                if (acctErrMsg[key]) {
                    var msg = FAM.resourceManager.GetString(acctErrMsg[key], 'assetrevaluation');
                    msg += ': ' + ret[0].getValue('name');
                    throw (msg);
                }
            }
        }
        throw(ex);
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Updates the record based on revaluation
 *
 * Parameters:
 *     recObj {object} - record object to be revaluated
 * Returns:
 *     none
**/
FAM.Revaluation_SS.prototype.updateRecord = function (recObj) {
    this.logObj.startMethod('FAM.Revaluation_SS.updateRecord');

    var currVals, recType, oldVals = {}, rec = this.currentRecord;
    var deprEndDate = recObj.deprEnd ? nlapiDateToString(recObj.deprEnd) : null;
    
    oldVals[rec.getRecordId()] = {};
    currVals = oldVals[rec.getRecordId()];
    
    if (recObj.taxMetId) {
        recType = 't';
        currVals[rec.getFieldId('rv_percentage')] = rec.getFieldValue('rv_percentage');
        currVals[rec.getFieldId('residual_value')] = rec.getFieldValue('residual_value');
        currVals[rec.getFieldId('cumulative_depr')] = rec.getFieldValue('cumulative_depr');
        currVals[rec.getFieldId('asset_life')] = rec.getFieldValue('asset_life');
        currVals[rec.getFieldId('enddate')] = rec.getFieldValue('enddate');
        
        this.currentRecord.setFieldValue('rv_percentage', recObj.rvPercent);
        this.currentRecord.setFieldValue('residual_value', recObj.resValue);
        this.currentRecord.setFieldValue('cumulative_depr', recObj.cumDepr);
        this.currentRecord.setFieldValue('asset_life', recObj.lifetime);
        this.currentRecord.setFieldValue('enddate', deprEndDate);
    }
    else {
        recType = 'a';
        currVals[rec.getFieldId('rv_percent')] = rec.getFieldValue('rv_percent');
        currVals[rec.getFieldId('rv')] = rec.getFieldValue('rv');
        currVals[rec.getFieldId('cummulative_depr')] = rec.getFieldValue('cummulative_depr');
        currVals[rec.getFieldId('lifetime')] = rec.getFieldValue('lifetime');
        currVals[rec.getFieldId('depr_end_date')] = rec.getFieldValue('depr_end_date');
        
        this.currentRecord.setFieldValue('rv_percent', recObj.rvPercent);
        this.currentRecord.setFieldValue('rv', recObj.resValue);
        this.currentRecord.setFieldValue('cummulative_depr', recObj.cumDepr);
        this.currentRecord.setFieldValue('lifetime', recObj.lifetime);
        this.currentRecord.setFieldValue('depr_end_date', deprEndDate);
    }

    currVals[rec.getFieldId('current_cost')] = rec.getFieldValue('current_cost');
    currVals[rec.getFieldId('book_value')] = rec.getFieldValue('book_value');
    currVals[rec.getFieldId('depr_method')] = rec.getFieldValue('depr_method');
    currVals[rec.getFieldId('status')] = rec.getFieldValue('status');
        
    this.currentRecord.setFieldValue('current_cost', recObj.currCost);
    this.currentRecord.setFieldValue('book_value', recObj.currNBV);
    this.currentRecord.setFieldValue('depr_method', recObj.deprMethod);
    this.currentRecord.setFieldValue('status', recObj.status);
    
    this.currentRecord.submitRecord();
    this.addToPending(recObj.bookingId, recObj.compound, recType, oldVals);
    
    this.logObj.endMethod();
};

/**
 * Checks result object, updates success/fail count, and writes to Process Log
 *
 * Parameters:
 *     resultObj {object} - return object
 *     elapsedTime {string} - elapsed time revaluating the asset, for logging purposes
 * Returns:
 *     none
**/
FAM.Revaluation_SS.prototype.checkResults = function (recObj, elapsedTime) {
    this.logObj.startMethod('FAM.Revaluation_SS.checkResults');

    var recId;

    if (recObj.taxMetId) {
        recId = 'Tax Method Id: ' + recObj.taxMetId;
    }
    else {
        recId = 'Asset Id: ' + recObj.assetId;
    }

    if (recObj.error) {
        this.recsFailed++;
        this.procInsRec.writeToProcessLog('Processing Failed: ' + recObj.error, 'Error', recId);
        this.logObj.pushMsg('Failed revaluating ' + recId + ', Elapsed Time: ' + elapsedTime +
            ', Failed: ' + this.recsFailed, 'error');
        this.logObj.printLog();
    }
    else if (recObj.isAborted) {
        this.logObj.logExecution('Asset Revaluation (' + recId + ') requeued, Elapsed Time: ' +
            elapsedTime);
    }
    else if (recObj.skipped) {
        this.recsSkipped++;
        this.logObj.logExecution('Skipping revaluation for ' + recId + ', Elapsed Time: ' +
            elapsedTime + ', Skipped: ' + this.recsSkipped);
    }
    else {
        this.recsProcessed++;
        this.logObj.logExecution('Successful revaluation for ' + recId + ', Elapsed Time: ' +
            elapsedTime + ', Success: ' + this.recsProcessed);
    }

    this.logObj.endMethod();
};

/**
 * Adds rollback data to pending values
 *
 * Parameters:
 *     bookId {number} - internal id of accounting book the record is associated with
 *     compoundId {number} - internal id of asset the record is associated with
 *     type {string} - type of rollback data
 *     data {number|object} - rollback data
**/
FAM.Revaluation_SS.prototype.addToPending = function (bookId, compoundId, type, data) {
    var i = 0, pendingObj;
    
    if (!this.rollbackData.pending) {
        this.rollbackData.pending = {};
    }
    if (!this.rollbackData.pending[bookId]) {
        this.rollbackData.pending[bookId] = {};
    }
    if (!this.rollbackData.pending[bookId][compoundId]) {
        this.rollbackData.pending[bookId][compoundId] = {};
    }
    pendingObj = this.rollbackData.pending[bookId][compoundId];
    
    switch (type) {
        case 'a':
        case 't':
            if (!pendingObj[type]) {
                pendingObj[type] = data;
            }
            else {
                for (i in data) {
                    pendingObj[type][i] = data[i];
                }
            }
            break;
        default:
            if (!pendingObj[type]) {
                pendingObj[type] = [data];
            }
            else {
                pendingObj[type].push(data);
            }
            break;
    }
};

/**
 * Registers rollback group as failed and constructs data to rollback
 *
 * Parameters:
 *     bookId {number} - internal id of accounting book
 *     compoundId {number} - internal id of asset
**/
FAM.Revaluation_SS.prototype.failRollbackGroup = function (bookId, compoundId) {
    if (!compoundId) {
        return;
    }
    this.registerFailedGroup(bookId, compoundId);
    if (!this.rollbackData.pending || !this.rollbackData.pending[bookId] ||
        !this.rollbackData.pending[bookId][compoundId]) {
        
        return;
    }
    
    var rbType = '', recId = 0, recsToFail = 0, obj = this.rollbackData.pending[bookId][compoundId];
    
    for (rbType in obj) {
        if (!this.rollbackData[rbType]) {
            this.rollbackData[rbType] = obj[rbType];
            
            if (rbType === 'a' || rbType === 't') {
                recsToFail += Object.keys(obj[rbType]).length;
            }
        }
        else if (rbType === 'a' || rbType === 't') {
            for (recId in obj[rbType]) {
                recsToFail++;
                this.rollbackData[rbType][recId] = obj[rbType][recId];
            }
        }
        else {
            this.rollbackData[rbType] = this.rollbackData[rbType].concat(obj[rbType]);
        }
    }
    
    this.logObj.logExecution('Failed revaluating group (bookId: ' + bookId + ' | compoundId: ' +
        compoundId + '), Number of processed to failed: ' + recsToFail, 'error');
    this.recsProcessed -= recsToFail;
    this.recsFailed += recsToFail;
    
    delete this.rollbackData.pending[bookId][compoundId];
};

/**
 * collates failed groups for tracking
 *
 * Parameters:
 *     bookId {number} - internal id of accounting book
 *     compoundId {number} - internal id of asset
**/
FAM.Revaluation_SS.prototype.registerFailedGroup = function (bookId, compoundId) {
    if (!this.rollbackData.failed) {
        this.rollbackData.failed = {};
    }
    if (!this.rollbackData.failed[bookId]) {
        this.rollbackData.failed[bookId] = [compoundId];
    }
    else if (this.rollbackData.failed[bookId].indexOf(compoundId) === -1) {
        this.rollbackData.failed[bookId].push(compoundId);
    }
};

/**
 * checks if the given group already failed revaluation process
 *
 * Parameters:
 *     bookId {number} - internal id of accounting book
 *     compoundId {number} - internal id of asset
 * Returns:
 *     {boolean} - true if group already failed revaluation process
**/
FAM.Revaluation_SS.prototype.isFailedGroup = function (bookId, compoundId) {
    var ret = false;
    
    if (this.rollbackData.failed && this.rollbackData.failed[bookId] &&
        this.rollbackData.failed[bookId].indexOf(compoundId) !== -1) {
            
        ret = true;
    };
    
    return ret;
};

FAM.Revaluation_SS.prototype.triggerRollback = function () {
    var ret,
        funcName = 'customscript_fam_mr_rollbackrecords',
        processId = this.procInsRec.recordId,
        mrTriggerURL = nlapiResolveURL('suitelet', 'customscript_fam_triggermr_su',
            'customdeploy_fam_triggermr_su', true);
    
    var otherScript = nlapiRequestURL(mrTriggerURL,
        { custscript_fam_mapreducescriptid : funcName,
          custscript_fam_bgpid : processId });
        
    if (otherScript.getBody() == 'T') {
        this.logObj.logExecution('Rollback MR Script Triggered | funcname: ' + funcName +
            ' | bgpId : ' + processId);
        ret = false;
    }
    else {
        this.procInsRec.setFieldValue('status', FAM.BGProcessStatus.Failed);
        this.procInsRec.setFieldValue('message', otherScript.getBody().substring(0, 300));
        this.procInsRec.submitRecord();
        ret = true;
    }
    return ret;
};
