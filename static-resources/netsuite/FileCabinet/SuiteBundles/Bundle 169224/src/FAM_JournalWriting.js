/**
 * © 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

/**
 * Starter for Background Processing function for Writing Journals for Depreciation History Records
 *
 * Parameters:
 *     BGP {FAM.BGProcess} - Process Instance Record for this background process
 * Returns:
 *     true {boolean} - processing should be requeued
 *     false {boolean} - processing should not be requeued; essentially setting the deployment to
 *                       standby
**/
function famJournalWriting(BGP) {
    var journalWriting = new FAM.JournalWriting(BGP);

    try {
        return journalWriting.run();
    }
    catch (e) {
        journalWriting.logObj.printLog();
        throw e;
    }
}

/**
 * Class for writing journals for depreciation history records
 *
 * Constructor Parameters:
 *     procInsRec {FAM.BGProcess} - Process Instance Record for this background process
**/
FAM.JournalWriting = function (procInsRec) {
    this.logObj = new printLogObj('debug');
    this.procInsRec = procInsRec;
    this.perfTimer = new FAM.Timer();
    this.journals = {};
    this.periodInfo = null;
    this.periodCache = {};
    this.periodError = {};
    this.bookExRateCache = {};
    this.sessionVal = {};
    this.subCache = new FAM.FieldCache('subsidiary');
    this.currCache = new FAM.FieldCache('currency');
    this.classCache = new FAM.FieldCache('classification');
    this.deptCache = new FAM.FieldCache('department');
    this.locCache = new FAM.FieldCache('location');
    this.accCache = new FAM.FieldCache('account');
    this.prjCache = new FAM.FieldCache('job');
    
    this.bypassUE = FAM.SystemSetup.getSetting('allowBypassUE') === 'T' || false;
    this.approveJrn = false;
    
    this.perfTimer.start();
};

FAM.JournalWriting.prototype.totalRecords  = 0;
FAM.JournalWriting.prototype.recsProcessed = 0;
FAM.JournalWriting.prototype.recsFailed    = 0;
FAM.JournalWriting.prototype.saveRecUsage  = 20;
FAM.JournalWriting.prototype.execLimit     = 500;
FAM.JournalWriting.prototype.timeLimit     = 30 * 60 * 1000; // 30 minutes

FAM.JournalWriting.prototype.maxSValLen    = 1000000;
FAM.JournalWriting.prototype.stateValLimit = 500;
FAM.JournalWriting.prototype.exceedSVLimit = false;
FAM.JournalWriting.prototype.hashJLen      = 30;    //approximate length for journal hash

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
FAM.JournalWriting.prototype.run = function () {
    this.logObj.startMethod('FAM.JournalWriting.run');

    var blnToRequeue = false,
        reqApproval = nlapiLoadConfiguration("accountingpreferences").getFieldValue("JOURNALAPPROVALS") === 'T';
    
    this.sessionVal = this.procInsRec.stateValues;

    this.totalRecords = +this.procInsRec.getFieldValue('rec_total') || 0;
    this.recsProcessed = +this.procInsRec.getFieldValue('rec_count') || 0;
    this.recsFailed = +this.procInsRec.getFieldValue('rec_failed') || 0;
    
    this.sessionVal.hashJ = this.sessionVal.hashJ || {};
    this.sessionVal.hashJL = this.sessionVal.hashJL || {};
    this.sessionVal.JrnPermit = this.sessionVal.JrnPermit || 0;
    this.exceedSVLimit = this.sessionVal.exceedSVLimit || false;
    
    this.logObj.pushMsg('finished variable initialization');

    blnToRequeue = this.tallySummaryRecord();
    if (blnToRequeue) { return blnToRequeue; }

    if (this.totalRecords === 0 && this.retrieveTotalHistoryCount() === 0) { return true; }

    this.logObj.pushMsg('Get accounting period info');
    this.periodInfo = FAM.getAccountingPeriodInfo();
    if (!this.periodInfo) { throw 'Unable to retrieve accounting period information'; }

    this.approveJrn = !reqApproval || this.sessionVal.JrnPermit === FAM.Permissions.Edit ||
        this.sessionVal.JrnPermit === FAM.Permissions.Full;

    blnToRequeue = this.searchAndWriteHistories();

    this.logObj.endMethod();
    return blnToRequeue;
};

/**
 * Retrieves the number of History Record to be written in journal
 *
 * Parameters:
 *     none
 * Returns:
 *     {number} - total number of history record found
**/
FAM.JournalWriting.prototype.retrieveTotalHistoryCount = function () {
    this.logObj.startMethod('FAM.JournalWriting.retrieveTotalHistoryCount');

    var srchSumm, timer = new FAM.Timer();

    timer.start();
    srchSumm = this.searchSummaryToWrite(0, true);
    this.logObj.logExecution('Elapsed time for Total History Count Retreival: ' +
        timer.getReadableElapsedTime());

    if (srchSumm.results) {
        this.totalRecords = +srchSumm.getValue(0, 'histcount', null, 'sum');

        this.logObj.logExecution('Total depreciation history found: ' + this.totalRecords);
        this.procInsRec.submitField({ rec_total : this.totalRecords }, null, this.bypassUE);
    }

    if (this.totalRecords === 0) {
        this.logObj.logExecution('No History found!');
        this.procInsRec.submitField({
            message : 'No history record found!',
            status  : FAM.BGProcessStatus.Completed
        }, null, this.bypassUE);
    }

    this.logObj.endMethod();
    return this.totalRecords;
};

/**
 * Retrieves or counts all summary records that should be written on journal
 *
 * Parameters:
 *     lastId {number} - internal id of the record last processed
 *     blnCount {boolean} - flag if the function should count all assets or retrieve
 *     excludeIds {Array} - array of ids to exclude from search
 * Returns:
 *     object {FAM.Search} which contains the results
**/
FAM.JournalWriting.prototype.searchSummaryToWrite = function(lastId, blnCount, excludeIds) {
    this.logObj.startMethod('FAM.JournalWriting.searchSummaryToWrite');

    var summarySearch = new FAM.Search(new FAM.SummaryRecord(), 'customsearch_fam_summarytowrite');

    summarySearch.addFilter('internalidnumber', null, 'greaterthan', lastId);
    
    if (excludeIds && excludeIds.length > 0) {
        summarySearch.addFilter('internalid', null, 'noneof', excludeIds);
    }

    if (blnCount) {
        summarySearch.addColumn('histcount', null, 'sum');
    }
    else {
        summarySearch.addColumn('internalid');
        summarySearch.addColumn('summaryValue');
        summarySearch.addColumn('assetType');
        summarySearch.addColumn('groupInfo');
        summarySearch.addColumn('deprDate');
        summarySearch.addColumn('deprAcc');
        summarySearch.addColumn('chargeAcc');
        summarySearch.addColumn('subsidiary');
        summarySearch.addColumn('department');
        summarySearch.addColumn('classid');
        summarySearch.addColumn('location');
        summarySearch.addColumn('histcount');
        summarySearch.addColumn('journalMemo');
        summarySearch.addColumn('acctBook');
        summarySearch.addColumn('project');
    }

    summarySearch.run();
    this.logObj.endMethod();
    return summarySearch;
};

/**
 * Sums up Summary Record of related to the same work queue
 *
 * Parameters: none
 * Returns:
 *     true {boolean}  - processing should be re-queued
 *     false {boolean} - processing should not be re-queued; essentially setting the deployment to
 *                       standby
**/
FAM.JournalWriting.prototype.tallySummaryRecord = function () {
    this.logObj.startMethod('FAM.JournalWriting.tallySummaryRecord');

    var histSearch, transactionSum = 0, histCount = 0, blnToRequeue = false, histResult = null,
        summaryRec = new FAM.SummaryRecord();

    // Tally the sum
    histSearch = new FAM.Search(new FAM.DepreciationHistory_Record(),
        'customsearch_fam_historytotally');
    
    do{
        histResult = histSearch.run() || [];

        for (var i = 0; i < histResult.length; i++) {

            histCount      = histSearch.getValue(i,'internalid',null,'count');
            transactionSum = histSearch.getValue(i,'transaction_amount',null,'sum') || 0; //Default to 0 to avoid infinite loop

            //Write the sum to summary record
            summaryRec.recordId = histSearch.getValue(i, 'internalid', 'summaryRecord', 'group');
            this.logObj.logExecution('summing for Summary Record Id: ' + summaryRec.recordId);
            summaryRec.submitField({ summaryValue : transactionSum, histcount : histCount}, null, this.bypassUE);

            if (this.hasExceededLimit()) {
                blnToRequeue = true;
                break;
            }
        }
    } while(!blnToRequeue && histResult.length > 0);

    this.logObj.endMethod();

    return blnToRequeue;
};

/**
 * Retrieves histories and writes to journal
 *
 * Parameters:
 *     none
 * Returns:
 *     true {boolean}  - processing should be re-queued
 *     false {boolean} - processing should not be re-queued; essentially setting the deployment to
 *                       standby
**/
FAM.JournalWriting.prototype.searchAndWriteHistories = function () {
    this.logObj.startMethod('FAM.JournalWriting.searchAndWriteHistories');

    var i, srchSumm, errorStr, recObj, procFields = null,
        blnToRequeue = false,
        excludeIds = [],
        timer = new FAM.Timer(),
        lastId = +this.procInsRec.getScriptParam('lowerLimit') || 0;
    
    this.logObj.pushMsg('Searching for Summary Record');
    
    do {    
        timer.start();
        
        srchSumm = this.searchSummaryToWrite(lastId, false, excludeIds);

        this.logObj.logExecution('Elapsed time for Summary Search: ' + timer.getReadableElapsedTime());

        if (srchSumm.results) {
            for (i = 0; i < srchSumm.results.length; i++) {
                // Re-initialize logObj for each summary to prevent flooding of log data
                this.logObj = new printLogObj('debug');
                this.logObj.startMethod('FAM.JournalWriting.searchAndWriteHistories');

                if (this.hasExceededLimit()) {
                    blnToRequeue = true;
                    break;
                }

                this.logObj.logExecution('Writing Journal for Summary Record Id: ' +
                    srchSumm.getId(i));
                timer.start();
                recObj = {
                    id            : srchSumm.getId(i),
                    date          : nlapiStringToDate(srchSumm.getValue(i, 'deprDate')),
                    deprAmnt      : +srchSumm.getValue(i, 'summaryValue'),
                    assetType     : srchSumm.getValue(i, 'assetType'),
                    assetTypeName : srchSumm.getText(i, 'assetType'),
                    subsidiary    : srchSumm.getValue(i, 'subsidiary'),
                    classId       : srchSumm.getValue(i, 'classid'),
                    departmentId  : srchSumm.getValue(i, 'department'),
                    locationId    : srchSumm.getValue(i, 'location'),
                    chargeAcct    : srchSumm.getValue(i, 'chargeAcc'),
                    deprAcct      : srchSumm.getValue(i, 'deprAcc'),
                    groupInfo     : srchSumm.getValue(i, 'groupInfo'),
                    deprMemo      : srchSumm.getValue(i, 'journalMemo'),
                    bookId        : srchSumm.getValue(i, 'acctBook'),
                    project       : srchSumm.getValue(i, 'project')
                };
                
                errorStr = this.processHistory(recObj);
                this.checkResults(errorStr, srchSumm.getId(i),
                    srchSumm.getValue(i,'histcount'),timer.getReadableElapsedTime());
                lastId = srchSumm.getId(i);

            }
        }
        else if (this.exceedSVLimit) {
            lastId = 0;
            excludeIds = this.getIdWithErrors();
            this.sessionVal.hashJ = {};
            this.sessionVal.hashJL = {};
            this.exceedSVLimit = false;
        }
        else {
            break;
        }

    } while (!blnToRequeue);
    
    if (blnToRequeue) {
        this.logObj.logExecution('Execution Limit | Remaining Usage: ' +
            FAM.Context.getRemainingUsage() + ' | Time Elapsed: ' +
            this.perfTimer.getReadableElapsedTime());
        this.procInsRec.setScriptParams({ lowerLimit : lastId });
    }
    else {
        // Process Completed
        procFields = { status : FAM.BGProcessStatus.Completed };
        blnToRequeue = true;
    }
    
    this.updateProcIns(procFields);

    this.logObj.endMethod();
    return blnToRequeue;
};

/**
 * Retrieves Ids of Summary Records that encountered an error
 *
 * Parameters:
 *     none
 * Returns:
 *     void
**/
FAM.JournalWriting.prototype.getIdWithErrors = function () {
    this.logObj.startMethod('FAM.JournalWriting.getIdWithErrors');
    
    var i, summId, ret = [], searchRes, lastId = 0;
    
    do {
        searchRes = this.searchSummaryErrors(lastId);
        
        if (searchRes.results) {
            for (i = 0; i < searchRes.results.length; i++) {
                summId = searchRes.getValue(i, 'related_record');
                summId = +(summId.replace('Summary Id: ', '')) || 0;
                
                if (summId) { ret.push(summId); }
                lastId = searchRes.getId(i);
            }
        }
    } while (searchRes.results)
    
    this.logObj.endMethod();
    return ret;
};

/**
 * Searches Process Logs for Summary Record Errors
 *
 * Parameters:
 *     lastId {number} - starting id to search from, exclusive
 * Returns:
 *     {FAM.Search}
**/
FAM.JournalWriting.prototype.searchSummaryErrors = function (lastId) {
    this.logObj.startMethod('FAM.JournalWriting.searchSummaryErrors');
    
    var fSearch = new FAM.Search(new FAM.BGProcessLog());
    
    fSearch.addFilter('process_instance', null, 'is', this.procInsRec.getRecordId());
    fSearch.addFilter('message_type', null, 'is', FAM.BGProcessLogType.Error);
    fSearch.addFilter('internalidnumber', null, 'greaterthan', lastId);
    
    fSearch.addColumn('internalid', null, null, 'SORT_ASC');
    
    fSearch.run();
    this.logObj.endMethod();
    return fSearch;
};

/**
 * Loads journal pre-requisites and writes history data to journal
 *
 * Parameters:
 *     recObj {Object} - container for history values
 *         id - internal id of the history record
 *         date - date of depreciation
 *         assetType - internal if of the asset type
 *         assetTypeName - display name of the asset type
 *         assetId - internal id of the asset
 *         repSubA - repair & maint subcategory a field of asset
 *         repMainCat - repair & maintenance category field of asset
 *         currId - currency id of the asset
 *         subsidiary - internal id of subsidiary
 *         deprAmnt - depreciation amount
 *         classId - internal id of the class
 *         departmentId - internal id of the department
 *         locationId - internal id of the location
 *         assetName - name of the asset
 *         chargeAcct - depreciation charge account of asset
 *         deprAcct - depreciation account of asset
 * Returns:
 *     {string} - error encountered while processing
**/
FAM.JournalWriting.prototype.processHistory = function (recObj) {
    this.logObj.startMethod('FAM.JournalWriting.processHistory');

    var journalId = '', ret = '',
        summRec = new FAM.SummaryRecord();
    
    try {
        recObj.date = this.getOpenPeriod(recObj.date);

        if (!FAM.Context.blnOneWorld) {
            recObj.subsidiary = 0;
        }
        
        var currData = this.subCache.subCurrData(recObj.subsidiary, recObj.bookId);
        
        recObj.currId = currData.currId;
        recObj.currSym = currData.currSym;
        
        this.validateFields(recObj);
        
        if (isNumber(recObj.deprAmnt)) {
            journalId = this.writeToJournal(recObj);
        }

        if(journalId){
            summRec.recordId = recObj.id;
            summRec.submitField({
                posting_reference : journalId
                }, null, this.bypassUE);
        }else{
            ret = 'Exceeded SV Limit';
        }
        
    }
    catch (e) {
        this.logObj.pushMsg('Unhandled Exception: ' + FAM_Util.printStackTrace(e), 'ERROR');
        this.logObj.printLog();

        ret = e;
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Acquires the open period or the next open period for the specified date
 *
 * Parameters:
 *     date {Date} - date to check
 * Returns:
 *     {Date} - found open period
 * Throws:
 *     No open accounting period found
**/
FAM.JournalWriting.prototype.getOpenPeriod = function (date) {
    this.logObj.startMethod('FAM.JournalWriting.getOpenPeriod');

    var i = 0, ret, msg, checkAdjust = true;

    // to clear time element
    date.setHours(0, 0, 0, 0);
    
    if (this.periodCache[date.getTime()]) {
        ret = this.periodCache[date.getTime()];
    }
    else if (this.periodError[date.getTime()]) {
        throw this.periodError[date.getTime()];
    }
    else {
        ret = new Date(date.getTime());
        do {
            if (ret.getTime() < this.periodInfo[i].startDate.getTime()) {
                msg = 'No accounting period found for ' + nlapiDateToString(ret);
                this.periodError[date.getTime()] = msg;
                throw msg;
            }
            if (ret.getTime() > this.periodInfo[i].endDate.getTime()) {
                i++;
            }
            else if (this.periodInfo[i].allClosed || this.periodInfo[i].allLocked ||
                (FAM.SystemSetup.getSetting('isCheckApLock') === 'T' &&
                    this.periodInfo[i].apLocked) ||
                (FAM.SystemSetup.getSetting('isCheckArLock') === 'T' &&
                    this.periodInfo[i].arLocked) ||
                (!checkAdjust && this.periodInfo[i].isAdjust)) {

                ret = new Date(this.periodInfo[i].endDate.getFullYear(),
                    this.periodInfo[i].endDate.getMonth(),
                    this.periodInfo[i].endDate.getDate() + 1);
            }
            else if (checkAdjust && this.periodInfo[i].isAdjust) {
                checkAdjust = false;
                ret = new Date(this.periodInfo[i].startDate.getFullYear(),
                    this.periodInfo[i].startDate.getMonth(),
                    this.periodInfo[i].startDate.getDate() - 1);
                i = i > 0 ? i - 1 : 0;
            }
            else {
                if (ret.getTime() !== date.getTime()) {
                    ret = this.periodInfo[i].endDate;
                }
                this.periodCache[date.getTime()] = ret;
            }
        } while (i < this.periodInfo.length && !this.periodCache[date.getTime()]);

        if (!this.periodCache[date.getTime()]) {
            msg = 'No open future accounting period for ' + nlapiDateToString(date);
            this.periodError[date.getTime()] = msg;
            throw msg;
        }
    }

    this.logObj.endMethod();
    return ret;
};

/**
 * Validates record fields to prevent depreciation errors
 *
 * Parameters:
 *     recordObj {object} - record object to be written
 * Returns:
 *     void
 * Throws:
 *     Invalid Data Errors
**/
FAM.JournalWriting.prototype.validateFields = function (recordObj) {
    this.logObj.startMethod('FAM.JournalWriting.validateFields');

    var noValues = [], inactive = [];

    if (!recordObj.subsidiary && FAM.Context.blnOneWorld) {
        noValues.push('Subsidiary');
    }
    if (!recordObj.currId && FAM.Context.blnMultiCurrency) {
        noValues.push('Currency');
    }
    if (!recordObj.departmentId && FAM.Context.getPreference('deptmandatory') === 'T') {
        noValues.push('Department');
    }
    if (!recordObj.classId && FAM.Context.getPreference('classmandatory') === 'T') {
        noValues.push('Class');
    }
    if (!recordObj.locationId && FAM.Context.getPreference('locmandatory') === 'T') {
        noValues.push('Location');
    }
    if (noValues.length > 0) {
        throw nlapiCreateError('USER_ERROR', FAM.resourceManager.GetString(
            'custpage_fields_missing', null, null, [noValues.join(', ')]));
    }

    if (!recordObj.chargeAcct || !recordObj.deprAcct) {
        throw nlapiCreateError('USER_ERROR',
            FAM.resourceManager.GetString('custpage_accounts_missing'));
    }

    if (FAM.Context.blnOneWorld && this.subCache.isInactive(recordObj.subsidiary)) {
        inactive.push('Subsidiary');
    }
    if (FAM.Context.blnMultiCurrency && this.currCache.isInactive(recordObj.currId)) {
        inactive.push('Currency');
    }
    if (recordObj.classId && this.classCache.isInactive(recordObj.classId)) {
        inactive.push('Class');
    }
    if (recordObj.departmentId && this.deptCache.isInactive(recordObj.departmentId)) {
        inactive.push('Department');
    }
    if (recordObj.locationId && this.locCache.isInactive(recordObj.locationId)) {
        inactive.push('Location');
    }
    if (this.accCache.isInactive(recordObj.chargeAcct)) {
        inactive.push('Depreciation Charge Account');
    }
    if (this.accCache.isInactive(recordObj.deprAcct)) {
        inactive.push('Depreciation Account');
    }
    if (inactive.length > 0) {
        throw nlapiCreateError('USER_ERROR', FAM.resourceManager.GetString(
            'custpage_fields_inactive', null, null, [inactive.join(', ')]));
    }

    this.logObj.endMethod();
};

/**
 * Writes history data to journal
 *
 * Parameters:
 *     recordObj {object} - record object to be written
 * Returns:
 *     {number} - internal id of the journal wherein the history data is written
**/
FAM.JournalWriting.prototype.writeToJournal = function (recObj) {
    this.logObj.startMethod('FAM.JournalWriting.writeToJournal');

    var i, j, ret, jeHash, saveRec, jlHash, lineOffset, lineNum, lineHash = {}, tempJL = {}, 
        noDPCurr, accounts = [recObj.chargeAcct, recObj.deprAcct];
    var debits = [recObj.deprAmnt, 0], credits = [0, recObj.deprAmnt];

    jeHash = FAM.getJournalHash(recObj.date, recObj.subsidiary, recObj.currId, recObj.bookId, 
        recObj.departmentId, recObj.classId, recObj.locationId);
    
    if (!this.exceedSVLimit) {
        this.exceedSVLimit = this.hasExceededStateValLimit();
    }
    
    saveRec = this.createJournal(jeHash, recObj); 
    
    if (saveRec) {
        if(this.exceedSVLimit){
            return null;
        }
        
        lineOffset = 1;
    }
    else {
        ret = this.journals[jeHash].getId();
        lineOffset = (+this.journals[jeHash].getLineItemCount('line')) + 1;
    }

    for (i = 0; i < accounts.length; i++) {
        var grpInfo = recObj.groupInfo, project = recObj.project || '0', account = accounts[i],
            dclTxt = (recObj.departmentId||'')+'-'+(recObj.classId||'')+'-'+(recObj.locationId||'');
        
        lineNum = lineOffset;

        if (ret) {
            lineHash = this.sanitizeJLHash(this.sessionVal.hashJL, ret, grpInfo, project, account);
            if (lineHash[ret][grpInfo][project][account][dclTxt]) {
                lineNum = +lineHash[ret][grpInfo][project][account][dclTxt];
            }
            else {
                //don't create new journal line
                if(this.exceedSVLimit){
                    return null;
                }
                lineHash[ret][grpInfo][project][account][dclTxt] = lineNum;
                this.sessionVal.hashJL = lineHash;
            }
        }
        if (lineNum === lineOffset) { // new line
            this.journals[jeHash].insertLineItem('line', lineNum);
            this.journals[jeHash].setLineItemValue('line', 'account', lineNum, accounts[i]);
            this.journals[jeHash].setLineItemValue('line', 'memo', lineNum, recObj.deprMemo);

            if (recObj.currId) {
                this.journals[jeHash].setLineItemValue('line', 'account_cur', lineNum,
                    recObj.currId);
                this.journals[jeHash].setLineItemValue('line', 'account_cur_isbase', lineNum, 'T');
                this.journals[jeHash].setLineItemValue('line','account_cur_fx', lineNum, 'F');
            }

            if (isNumber(debits[i])) {
                this.journals[jeHash].setLineItemValue('line', 'debit', lineNum, debits[i]);
                this.journals[jeHash].setLineItemValue('line', 'origdebit', lineNum, debits[i]);
            }

            if (isNumber(credits[i])) {
                this.journals[jeHash].setLineItemValue('line', 'credit', lineNum, credits[i]);
                this.journals[jeHash].setLineItemValue('line', 'origcredit', lineNum, credits[i]);
            }

            if (recObj.classId) {
                this.journals[jeHash].setLineItemValue('line', 'class', lineNum, recObj.classId);
            }
            if (recObj.departmentId) {
                this.journals[jeHash].setLineItemValue('line', 'department', lineNum,
                    recObj.departmentId);
            }
            if (recObj.locationId) {
                this.journals[jeHash].setLineItemValue('line', 'location', lineNum,
                    recObj.locationId);
            }
            
            if (recObj.project && this.validateSubPrjCurr(recObj.subsidiary, recObj.bookId, recObj.project)) {
                this.journals[jeHash].setLineItemValue('line', 'entity', lineNum,
                    recObj.project);
            }

            if (!ret) {
                tempJL = this.setLineNumInJLHash(tempJL, '0', grpInfo, project, account, dclTxt, lineNum);
            }

            lineOffset++;
        }
        else { // add to existing line
            noDPCurr = FAM.SystemSetup.getSetting(['nonDecimalCurrencySymbols']);
            debit = +this.journals[jeHash].getLineItemValue('line', 'debit', lineNum) || 0;
            credit = +this.journals[jeHash].getLineItemValue('line', 'credit', lineNum) || 0;
            
            debit  = ncRoundCurr(debits[i] + debit, recObj.currSym, noDPCurr);
            credit = ncRoundCurr(credits[i] + credit, recObj.currSym, noDPCurr);;

            this.journals[jeHash].setLineItemValue('line', 'origdebit', lineNum, debit);
            this.journals[jeHash].setLineItemValue('line', 'origcredit', lineNum, credit);

            if (debit > credit) {
                this.journals[jeHash].setLineItemValue('line', 'debit', lineNum,
                    ncRoundCurr(debit - credit, recObj.currSym, noDPCurr));
                this.journals[jeHash].setLineItemValue('line', 'credit', lineNum, 0);
            }
            else {
                this.journals[jeHash].setLineItemValue('line', 'debit', lineNum, 0);
                this.journals[jeHash].setLineItemValue('line', 'credit', lineNum,
                    ncRoundCurr(credit - debit, recObj.currSym, noDPCurr));
            }
        }
    }

    if (saveRec) {
        var journalRecordId = FAM.SystemSetup.getSetting("allowCustomTransaction") == 'T' ? "customtransaction_fam_depr_jrn" : "journalentry";
        try {
            if (this.journals[jeHash].getLineItemCount('line') > 0 ) {
                ret = nlapiSubmitRecord(this.journals[jeHash], true, true);
                this.journals[jeHash] = nlapiLoadRecord(journalRecordId, ret);
                this.sessionVal.hashJ[jeHash] = ret; //retain journalId for saving in stateval

                this.sessionVal.hashJL[ret] = tempJL['0'];
            }
        }
        catch (e) {
            if (!this.journals[jeHash].getId()) {
                this.journals[jeHash] = null;
            }

            throw e;
        }
    }
    this.logObj.endMethod();
    return ret;
};

/**
 * Sets line number in JLHash.
 *
 * Parameters:
 *     inHash {object} - current hash if existing
 *     journal id {num}
 *     groupInfo {text} - summarization type
 *     project id {num}
 *     account id {num}
 *     dclTxt {text} - dept, class, location hash
 *     line number {num} - line number in journal
 * Returns:
 *     {object} - generated hash
**/
FAM.JournalWriting.prototype.setLineNumInJLHash = function (inHash, jId, groupInfo, projId, acctId, dclTxt, lineNum) {
    var outHash = this.sanitizeJLHash(inHash, jId, groupInfo, projId, acctId);
    outHash[jId][groupInfo][projId][acctId][dclTxt] = lineNum;
    
    return outHash;
};

/**
 * Sanitize journal line hash. Creates sub-objects if needed.
 *
 * Parameters:
 *     inHash {object} - current hash if existing
 *     journal id {num}
 *     groupInfo {text} - summarization type
 *     project id {num}
 *     account id {num}
 * Returns:
 *     {object} - sanitized hash
**/
FAM.JournalWriting.prototype.sanitizeJLHash = function (inHash, jId, groupInfo, projId, acctId) {
    var outHash = inHash || {};
    
    var jrn = jId || '0';
    if (outHash[jrn] === undefined) { 
        outHash[jrn] = {}; 
    }
    if (outHash[jrn][groupInfo] === undefined) {
        outHash[jrn][groupInfo] = {};
    }
    var proj = projId || '0';
    if (outHash[jrn][groupInfo][proj] === undefined) {
        outHash[jrn][groupInfo][proj] = {};
    }
    if (outHash[jrn][groupInfo][proj][acctId] === undefined) {
        outHash[jrn][groupInfo][proj][acctId] = {};
    }
    
    return outHash;
};


/**
 * Validate Subsidiary/Book base currency and Project currency's compatability
 * 
 * Parameters:
 *      sub {num} - subsidiary id
 *      prj {num} - project id
 * Returns:
 *      {boolean} - indicates whether subsidiary and project currencies are compatible
 * 
 * @returns {Boolean}
 */
FAM.JournalWriting.prototype.validateSubPrjCurr = function (sub, book, prj) {
    if(!FAM.Context.blnMultiCurrency){
        return true;
    }
    else {
        var subCurr = this.subCache.getApplicableCurrency(sub, book),
            prjCurr = this.prjCache.fieldValue(prj, 'currency');
        
        return ( subCurr === prjCurr);
    };
};

/**
 * Check journal hash against list. Reuse created journals if exist.
 *
 * Parameters:
 *     hash {string} - hash code to identify which journal to check
 *     recordObj {object} - record object to be written
 * Returns:
 *     {boolean} - flag to determine if journal record needs to be saved
**/
FAM.JournalWriting.prototype.createJournal = function (hash, recObj) {
    this.logObj.startMethod('FAM.JournalWriting.createJournal');

    var journalRecordId, journalStatusId, statusApproved, statusPending, jeId, lineCount,
        shouldSave = false,
        jeLineLimit = +FAM.SystemSetup.getSetting('jeLineLimit');
    
    if (FAM.SystemSetup.getSetting('allowCustomTransaction') === 'T') {
        journalRecordId = 'customtransaction_fam_depr_jrn';
        journalStatusId = 'transtatus';
        statusApproved = FAM.CustomTransactionStatus['Approved'];
        statusPending = FAM.CustomTransactionStatus['Pending Approval'];
    }
    else {
        journalRecordId = 'journalentry';
        journalStatusId = 'approved';
        statusApproved = 'T';
        statusPending = 'F';
    }
    
    if (!this.journals[hash] && this.sessionVal.hashJ[hash]) {
        this.journals[hash] = nlapiLoadRecord(journalRecordId, this.sessionVal.hashJ[hash]);
    }
    
    if (this.journals[hash]) {
        jeId = this.journals[hash].getId();
        lineCount = +this.journals[hash].getLineItemCount('line');
        
        if (lineCount + 2 > jeLineLimit) {
            nlapiSubmitRecord(this.journals[hash], true, true);
            delete this.journals[hash];
            delete this.sessionVal.hashJ[hash];
            delete this.sessionVal.hashJL[jeId];
            
            this.logObj.logExecution('Journal Line Limit Reached. Create new journal entry. ' +
                'Previous Journal Entry Id: ' + jeId, 'AUDIT');
        }
    }
    
    if (!this.journals[hash] && !this.exceedSVLimit) {
        this.journals[hash] = nlapiCreateRecord(journalRecordId);
        this.journals[hash].setFieldValue('trandate', nlapiDateToString(recObj.date));
        this.journals[hash].setFieldValue('department', recObj.departmentId);
        this.journals[hash].setFieldValue('class', recObj.classId);
        this.journals[hash].setFieldValue('location', recObj.locationId);
        this.journals[hash].setFieldValue('accountingbook', recObj.bookId || 1);
        this.journals[hash].setFieldValue('generatetranidonsave', 'T');
        this.journals[hash].setFieldValue('bookje', 'T');
        
        if (FAM.Context.blnOneWorld && recObj.subsidiary) {
            this.journals[hash].setFieldValue('subsidiary', recObj.subsidiary);
        }
        if (recObj.currId && FAM.Context.blnMultiCurrency) {
            this.journals[hash].setFieldValue('currency', recObj.currId);
            this.journals[hash].setFieldValue('exchangerate', 1);
        }
        if(this.approveJrn){
            this.journals[hash].setFieldValue(journalStatusId, statusApproved);
        }
        else{
            this.journals[hash].setFieldValue(journalStatusId, statusPending);
        }
        
        shouldSave = true;
    }

    this.logObj.endMethod();
    return shouldSave;
};

/**
 * Checks result string of depreciateRecord, updates success/fail count, and writes to Process Log
 *
 * Parameters:
 *     errorStr {string} - return object of depreciateRecord
 *     histId {number} - internal id of the history that was written to journal
 *     elapsedTime {string} - elapsed time writing the history, for logging purposes
 * Returns:
 *     void
**/
FAM.JournalWriting.prototype.checkResults = function (errorStr, summId, histcount, elapsedTime) {
    this.logObj.startMethod('FAM.JournalWriting.checkResults');
    
    if (errorStr === 'Exceeded SV Limit') {
        var numHashJ = Object.keys(this.sessionVal.hashJ).length,
            numHashJL = JSON.stringify(this.sessionVal.hashJL).length;
            
        this.logObj.logExecution('StateValue Limit Exceeded. Journal Hash Total: ' + numHashJ + 
            ', Journal Lines Hash Total: ' + numHashJL);
                
        this.logObj.logExecution('Unable to process Summary Record: ' + summId +
            ', State Value Limit Reached, Will queue processing', 'audit');
    }
    else if (errorStr) {
        this.recsFailed += (histcount * 1);
        
        this.procInsRec.writeToProcessLog('Writing Failed: ' + errorStr, 'Error',
            'Summary Id: ' + summId);
        this.logObj.pushMsg('Failed processing of Summary Record: ' + summId + ', Elapsed Time: '
            + elapsedTime + ', Failed: ' + this.recsFailed, 'error');
            this.logObj.printLog();
    }
    else {
        // this.recsProcessed++;
        this.recsProcessed += (histcount * 1);
        this.logObj.logExecution('Successful processing of Summary Record: ' + summId +
            ', Elapsed Time: ' + elapsedTime + ', Success: ' + this.recsProcessed);
    }

    this.logObj.endMethod();
};

/**
 * Updates Process Instance Record
 *
 * Parameters:
 *     procFields {object} - container for Process Instance Changed Fields
 * Returns:
 *     void
**/
FAM.JournalWriting.prototype.updateProcIns = function (procFields) {
    this.logObj.startMethod('FAM.JournalWriting.updateProcIns');

    var totalPercent;

    procFields = procFields || {};

    if (Object.keys(this.journals).length > 0) {
        this.saveJournals();
    }
    
    totalPercent = FAM_Util.round(((this.recsProcessed + this.recsFailed) / this.totalRecords) *
        100);
    totalPercent = (isNaN(totalPercent) || totalPercent === Infinity) ?  0 : totalPercent;

    FAM.Context.setPercentComplete(totalPercent);

    procFields.rec_count = this.recsProcessed;
    procFields.rec_total = this.totalRecords;
    procFields.rec_failed = this.recsFailed;
    
    this.sessionVal.exceedSVLimit = this.exceedSVLimit;
    
    procFields.state_defn = 'SessionVal';
    procFields.state = JSON.stringify(this.sessionVal);
    
    if (this.totalRecords === 0) {
        procFields.message = 'No records found.';
    }
    else {
        procFields.message = 'Writing Histories to Journals | ' + totalPercent +
            '% Complete | ' + this.totalRecords + ' total | ' + this.recsProcessed +
            ' written | ' + this.recsFailed + ' failed';
    }
    
    if (procFields.status === FAM.BGProcessStatus.Completed && this.recsFailed > 0) {
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
 * Saves an array of Journals
 *
 * Parameters:
 *     none
 * Returns:
 *     {number[]} - internal ids of the journals saved
**/
FAM.JournalWriting.prototype.saveJournals = function () {
    this.logObj.startMethod('FAM.JournalWriting.saveJournals');

    var i = null, jcount=0, timer = new FAM.Timer();
    this.logObj.logExecution('Saving ' + Object.keys(this.journals).length + ' journals. Remaining Usage: '
        + FAM.Context.getRemainingUsage());
    timer.start();

    for (i in this.journals) {
        if (this.journals[i]) {
            nlapiSubmitRecord(this.journals[i], true, true); 
            jcount++;
        }
    }

    this.logObj.logExecution('Elapsed time for saving ' + jcount + ' journals: '
        + timer.getReadableElapsedTime());

    this.logObj.endMethod();
};

/**
 * Determines if the Execution Limit or Time Limit has exceeded
 *
 * Returns:
 *     true {boolean} - Execution Limit or Time Limit has exceeded
 *     false {boolean} - Execution Limit or Time Limit has not exceeded
**/
FAM.JournalWriting.prototype.hasExceededLimit = function () {
    this.logObj.startMethod('FAM.JournalWriting.hasExceededLimit');

    var ret = FAM.Context.getRemainingUsage() < this.execLimit + Object.keys(this.journals).length *
        this.saveRecUsage || this.perfTimer.getElapsedTime() > this.timeLimit;

    this.logObj.endMethod();
    return ret;
};

/**
 * Determines if the state values are about to reach limit
 *
 * Returns:
 *     true {boolean} - exceeded limit, no new journals will be created
 *     false {boolean} - let the fun continue
**/
FAM.JournalWriting.prototype.hasExceededStateValLimit = function () {
    this.logObj.startMethod('FAM.JournalWriting.hasExceededStateValLimit');
    var ret, svLen;
    
    svLen = this.maxSValLen - ((Object.keys(this.sessionVal.hashJ).length * this.hashJLen) + 
        JSON.stringify(this.sessionVal.hashJL).length);

    ret = this.stateValLimit > svLen;
    
    if (ret) {
        this.logObj.pushMsg('StateValue Limit Exceeded. Journal Hash Total: ' +
            Object.keys(this.sessionVal.hashJ).length + ', Journal Lines Hash Total: ' +
            JSON.stringify(this.sessionVal.hashJL).length + ', Approximate State Value Length: ' +
            svLen);
        this.logObj.printLog();
    }
    
    this.logObj.endMethod();
    return ret;
};
