/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.Record = function(_crtName, _fields) {

    this.record = null;
    this.recordId = null;
    this.triggerMap = {};
    this.triggerMap.disabletriggers = true;
    
    this.getRecordTypeId = function() {
        return _crtName;
    };

    this.getFieldId = function(name) {
        if (_fields) {
            return _fields[name] || name;
        } else {
            return name;
        }
    };

    this.getAllFields = function() {
        return _fields || null;
    };

    this.getRecordUrl = function(mode) {
        return nlapiResolveURL('RECORD', _crtName, this.recordId, mode);
    };

    this.copyRecord = function (id, fieldValues, initializeValues) {
        var f, fieldName;
        
        if (initializeValues) {
            for (f in initializeValues) {
                if (_fields && _fields[f]) {
                    initializeValues[_fields[f]] = initializeValues[f];
                    delete initializeValues[f];
                }
            }
        }
        
        this.record = nlapiCopyRecord(_crtName, id, initializeValues);
        
        if (fieldValues) {
            for (f in fieldValues) {
                fieldName = (_fields && _fields[f]) ? _fields[f] : f;
                
                if (typeof fieldValues[f] === 'object' && fieldValues[f].length) {
                    this.record.setFieldValues(fieldName, fieldValues[f]);
                }
                else {
                    this.record.setFieldValue(fieldName, fieldValues[f]);
                }
            }
        }
        
        this.recordId = null;
        return this.record;
    };
    
    this.createRecord = function(fieldValues, initializeValues, bypassUE) {
        if (initializeValues) {
            for (var f in initializeValues) {
                if (_fields && _fields[f]) {
                    initializeValues[_fields[f]] = initializeValues[f];
                    delete initializeValues[f];
                }
            }
        }

        if(bypassUE){
            if(!initializeValues){
                initializeValues = {};
            }
            for(var f in this.triggerMap){
                initializeValues[f] = this.triggerMap[f];
            }
        }
        var rec = nlapiCreateRecord(_crtName, initializeValues);

        if (fieldValues) {
            for (var f in fieldValues) {
                var fieldName = (_fields && _fields[f]) ? _fields[f] : f;
                if (typeof fieldValues[f] == 'object' && fieldValues[f].length) {
                    rec.setFieldValues(fieldName, fieldValues[f]);
                } else {
                    rec.setFieldValue(fieldName, fieldValues[f]);
                }
            }
        }
        
        this.recordId = null;
        this.record = rec;
        return this.record;
    };

    this.setFieldValue = function(name, value) {
        if (_fields && _fields[name]) {
            return this.record.setFieldValue(_fields[name], value);
        } else {
            return this.record.setFieldValue(name, value);
        }
    };

    this.setFieldValues = function(name, value) {
        if (_fields && _fields[name]) {
            return this.record.setFieldValues(_fields[name], value);
        } else {
            return this.record.setFieldValues(name, value);
        }
    };

    this.setFieldText = function(name, text) {
        if (_fields && _fields[name]) {
            return this.record.setFieldText(_fields[name], text);
        } else {
            return this.record.setFieldText(name, text);
        }
    };

    this.setFieldValues = function(name, values) {
        if (_fields && _fields[name]) {
            return this.record.setFieldValues(_fields[name], values);
        } else {
            return this.record.setFieldValues(name, values);
        }
    };

    this.setFieldTexts = function(name, texts) {
        if (_fields && _fields[name]) {
            return this.record.setFieldTexts(_fields[name], texts);
        } else {
            return this.record.setFieldTexts(name, texts);
        }
    };

    this.selectNewLineItem = function(group) {
        this.record.selectNewLineItem(group);
    };

    this.setCurrentLineItemValue = function(group, field, value) {
        this.record.setCurrentLineItemValue(group, field, value);
    };

    this.setLineItemValue = function(group, field, line, value) {
        this.record.setLineItemValue(group, field, line, value);
    };

    this.commitLineItem = function(group) {
        this.record.commitLineItem(group);
    };

    this.addLineItem = function(group, fieldValues) {
        this.selectNewLineItem(group);
        for (var f in fieldValues) {
            this.setCurrentLineItemValue(group, f, fieldValues[f]);
        }
        this.commitLineItem(group);
    };

    this.submitRecord = function(doSourcing, ignoreMandatoryFields, bypassUE) {
        if(bypassUE){
            var bypassParam = {};
            bypassParam.disabletriggers = true;
            if(ignoreMandatoryFields)
                bypassParam.ignoremandatoryfields = true;
            this.recordId = nlapiSubmitRecord(this.record, bypassParam);
        }else{
            this.recordId = nlapiSubmitRecord(this.record, doSourcing, ignoreMandatoryFields);
        }
        return this.recordId;
    };

    this.deleteRecord = function(bypassUE) {
        var bypassParam = null;
        if(bypassUE){
            bypassParam = this.triggerMap;
        }
        nlapiDeleteRecord(_crtName, this.recordId, bypassParam);
        this.record   = null;
        this.recordId = null;
    };

    this.submitField = function(fieldValues, doSourcing, bypassUE) {
        var names  = [];
        var values = [];
        for (var f in fieldValues) {
            if (_fields && _fields[f]) {
                names.push(_fields[f]);
            } else {
                names.push(f);
            }
            values.push(fieldValues[f]);
        }

        //unable to incorporate doSourcing in the object parameter.
        //if bypassUE is true, we will use the disabletriggers parameter regardless of doSourcing option.
        if(bypassUE){
            nlapiSubmitField(_crtName, this.recordId, names, values, this.triggerMap);
        }else{
            nlapiSubmitField(_crtName, this.recordId, names, values, doSourcing);
        }
    };

    this.loadRecord = function(recId, initializeValues, bypassUE) {
        if(recId != null || (!isNaN(recId))) {
            this.recordId = recId;
        }

        if (initializeValues) {
            for (var f in initializeValues) {
                if (_fields && _fields[f]) {
                    initializeValues[_fields[f]] = initializeValues[f];
                    delete initializeValues[f];
                }
            }
        }

        if(bypassUE){
            for(var f in this.triggerMap){
                initializeValues[f] = this.triggerMap[f];
            }
        }

        this.record = nlapiLoadRecord(_crtName, this.recordId, initializeValues);
        return this.record;
    };

    this.getFieldValue = function(name) {
        if (_fields && _fields[name]) {
            return this.record.getFieldValue(_fields[name]);
        } else {
            return this.record.getFieldValue(name);
        }
    };

    this.getFieldText = function(name) {
        if (_fields && _fields[name]) {
            return this.record.getFieldText(_fields[name]);
        } else {
            return this.record.getFieldText(name);
        }
    };

    this.getFieldValues = function(name) {
        if (_fields && _fields[name]) {
            return this.record.getFieldValues(_fields[name]);
        } else {
            return this.record.getFieldValues(name);
        }
    };

    this.getFieldTexts = function(name) {
        if (_fields && _fields[name]) {
            return this.record.getFieldTexts(_fields[name]);
        } else {
            return this.record.getFieldTexts(name);
        }
    };

    this.getRecordId = function () {
        if (!this.recordId) {
            this.recordId = this.record.getId();
        }

        return this.recordId;
    };

    this.lookupField = function(f, text) {
        var fields = null;
        if (typeof f == 'object') {
            fields = [];
            if (_fields) {
                for (var i = 0; i < f.length; i++) {
                    if (_fields[f[i]]) {
                        fields.push(_fields[f[i]]);
                    } else {
                        fields.push(f[i]);
                    }
                }
            } else {
                fields = f;
            }
        } else {
            fields = (_fields && _fields[f]) ? _fields[f] : f;
        }
        return nlapiLookupField(_crtName, this.recordId, fields, text);
    };
};

FAM.Search = function(_recordType, savedSearchId) {

    var _crtName    = _recordType.getRecordTypeId();
    var _fields     = _recordType.getAllFields();    

    this.joinfields  = {};
    this.filters     = [];
    this.columns     = [];
    this.savedSearch = savedSearchId;
    this.limit       = 1000;
    this.results     = null;
    this.length      = 0;
    
    this.start = 0;
    this.end = 0;
    this.origFilter = null;
    this.batchSize = 1000;
    this.timeout = 180;
    this.timeoutInSched = 300;
    this.countSearch = false;
    this.groupSearch = false;
    this.execLimit = 100;
    this.execLimitInSched = 1000;
    this.timer = new FAM.Timer();
    this.timeLimit = 30 * 60 * 1000;
    this.searchBatchEnd = 0;
    
    try {
        this.batchSize = FAM.SystemSetup.getSetting('batchSearchLimit');
    }
    catch (e) {
        nlapiLogExecution('debug', 'search batch limit', 'could not retreive limit from setup');
    }

    this.setJoinRecord = function(fld, recordType) {
        var field = _fields && _fields[fld] ? _fields[fld] : fld;

        this.joinfields[field] = recordType.getAllFields();
    };

    this.addFilter = function(fld, joinId, oper, val1, val2) {
        var filter, field, join;

        join  = _fields && _fields[joinId] ? _fields[joinId] : joinId;
        if (join) {
            // search this.joinfields first then record fields
            field = (this.joinfields[join] && this.joinfields[join][fld]) || fld;
        }
        else {
            field = (_fields && _fields[fld]) || fld;
        }

        filter = new nlobjSearchFilter(field, join, oper, val1, val2);
        if (fld === 'internalidnumber' && joinId === null) {
            if (oper === 'greaterthan') {
                this.origFilter = filter;
                this.start = +val1;
            }
            else if (oper === 'between') {
                this.origFilter = filter;
                this.start = +val1;
                this.end = +val2;
            }
            else {
                this.filters.push(filter);
            }
        }
        else {
            this.filters.push(filter);
        }
        return filter;
    };

    this.addColumn = function(fld, joinId, summary, sortOrder) {
        var column, field, join;

        join  = _fields && _fields[joinId] ? _fields[joinId] : joinId;

        if (join) {
            // search this.joinfields first then record fields
            field = (this.joinfields[join] && this.joinfields[join][fld]) || fld;
        }
        else {
            field = (_fields && _fields[fld]) || fld;
        }

        if (!this.groupSearch && field === 'internalid' && !join && summary === 'count') {
            this.countSearch = true;
        }
        else if (summary) {
            this.groupSearch = true;
            this.countSearch = false;
        }
        
        column = new nlobjSearchColumn(field, join, summary);

        if (sortOrder === 'SORT_ASC') {
            column.setSort();
        }
        else if (sortOrder === 'SORT_DESC') {
            column.setSort(true);
        }

        this.columns.push(column);
        return column;
    };

    this.addAllColumns = function (sortColumn, sortOrder) {
        var column = null;

        for (var fld in _fields) {
            column = new nlobjSearchColumn(_fields[fld]);

            if (fld === sortColumn || _fields[fld] === sortColumn) {
                column.setSort(sortOrder === 'SORT_DSC');
            }
            this.columns.push(column);
        }
    };

    this.run = function(start, end) {
        var i = 0, res, batchStart = 0, batchEnd = 0, filters, startTime, duration, error,
            indexStart = 0,
            limitSearch = false,
            tmpLimit = this.limit,
            logTitle = 'FAM.Search.run.' + _crtName,
            timeout = this.getTimeoutScheme(),
            columns = (this.columns.length == 0) ? null : this.columns;
        
        this.results = [];
        start = start || 0;
        end = end || this.limit;
        this.timer.start();
        do {
            error = false;
            filters = this.compileFilters(batchStart, batchEnd);
            startTime = new Date().getTime();
            
            try {
                res = [];
                res = this.runSearch(filters, columns, start, end);
                this.results = this.results.concat(res);
            }
            catch (e) { error = e; }
            
            duration = this.getDurationInSeconds(startTime);
            this.logDuration(logTitle + '.' + i + '.' + res.length, duration, timeout);
            
           
            if (error) {
                if (duration < timeout) {
                    throw error;
                }
                else if (limitSearch) {
                    throw this.getTimeoutErrorMessage(duration);
                }
                
                if (this.end === 0) {
                    this.end = this.getMaxId();
                }
            
                if (!this.groupSearch) {
                    limitSearch = true;
                    this.limit = end;
                    indexStart = start;
                    start = 0;
                    end = tmpLimit;
                    logTitle += '.batch';
                }
            }
            
            if (limitSearch) {
                i++;
                batchStart = this.getNextBatchStart(batchEnd);
                batchEnd = this.getNextBatchEnd(batchStart);
            }
        } while (limitSearch && !this.limitExceeded(batchEnd) && 
                 this.results.length < this.limit && batchStart < batchEnd);
        
        return this.getResults(indexStart);
    };

    this.getDurationInSeconds = function (startTime) {
        return (new Date().getTime() - startTime) / 1000;
    };
    
    this.getTimeoutErrorMessage = function (duration) {
        var ret, postfix = ' | ' + (new Date()).getTime();
        
        if (FAM.resourceManager && typeof FAM.resourceManager.GetString === 'function') {
            ret = FAM.resourceManager.GetString('custpage_error_searchtimeout', null, null,
                [duration]) + postfix;
        }
        else {
            ret = 'Processing cannot continue due to a timeout error. Duration: ' + duration +
                ' seconds' + postfix;
        }
        
        return ret;
    };
    
    this.limitExceeded = function (batchEnd) {
        if (this.timer.getElapsedTime() > this.timeLimit && 
            this.end > batchEnd){
            this.searchBatchEnd = batchEnd;
            return true;
        }
        
        var limit, context = nlapiGetContext();
        limit = context.getExecutionContext() === 'scheduled' ?
            this.execLimitInSched : this.execLimit;
        return context.getRemainingUsage() < limit;
    };
    
    this.compileFilters = function (start, end) {
        var filters = [].concat(this.filters);
        
        if (+start >= 0 && +end > 0) {
            filters.push(new nlobjSearchFilter('internalidnumber', null, 'between', start, end));
        }
        else if (this.origFilter) {
            filters.push(this.origFilter);
        }
        else if (filters.length === 0) {
            filters = null;
        }
        
        return filters;
    };
    
    this.getNextBatchEnd = function (start) {
        var ret = start + this.batchSize - 1;
        
        if (ret > this.end) {
            ret = this.end;
        }
        
        return ret;
    };
    
    this.getNextBatchStart = function (prevEnd) {
        var ret = this.start || 1;
        
        if (prevEnd > 0) {
            ret = prevEnd + 1;
        }
        
        return ret;
    };
    
    this.logDuration = function (title, duration, timeout) {
        var logType = 'debug';
        
        if (duration >= timeout) {
            logType = 'error';
        }
        else if (duration >= timeout / 2) {
            logType = 'audit';
        }
        
        nlapiLogExecution(logType, title, duration);
    };
    
    this.getResults = function (start) {
        this.length = this.results.length;
        
        if (this.length === 0) {
            this.results = null;
        }
        else if (this.length > this.limit) {
            this.results = this.results.slice(0, this.limit);
            this.length = this.limit;
        }
        
        if (this.countSearch) {
            var i, total = 0;
            
            for (i = 0; i < this.length; i++) {
                total += +this.results[i].getValue('internalid', null, 'count');
            }
            
            this.results = [{ getValue : function () { return total; }}];
            this.length = this.results.length;
        }
        
        if (start > 0) {
            this.results = this.results.slice(start);
            this.length = this.results.length;
        }
        
        return this.results;
    };
    
    this.getTimeoutScheme = function () {
        var ret = this.timeout;
        
        if (nlapiGetContext().getExecutionContext() === 'scheduled') {
            ret = this.timeoutInSched;
        }
        
        return ret;
    };
    
    this.runSearch = function (filters, columns, start, end) {
        var searchObj, searchRes;
        
        if (this.savedSearch) {
            searchObj = nlapiLoadSearch(_crtName, this.savedSearch);
            if (filters) { searchObj.addFilters(filters); }
            if (columns) { searchObj.addColumns(columns); }
        }
        else {
            searchObj = nlapiCreateSearch(_crtName, filters, columns);
        }
        
        searchRes = searchObj.runSearch();
        return searchRes.getResults(start, end) || [];
    };
    
    this.getMaxId = function () {
        var ret, result, column = new nlobjSearchColumn('internalid', null, 'max');
        
        result = nlapiSearchRecord(_crtName, null, null, column);
        
        if (result) {
            ret = +result[0].getValue('internalid', null, 'max');
        }
        else {
            ret = 0;
            nlapiLogExecution('debug', 'FAM.Search.getMaxId',
                'Could not find max ID, could not do batch searching.');
        }
        
        return ret;
    };

    this.getId = function(i) {
        return this.results[i].getId();
    };

    this.getValue = function(i, columnOrName, joinId, summary) {
        var field, join;

        if (columnOrName instanceof nlobjSearchColumn) {
            return this.results[i].getValue(columnOrName);
        }
        else {
            joinId = joinId || null;
            summary = summary || null;

            join  = _fields && _fields[joinId] ? _fields[joinId] : joinId;

            if (join) {
                // search this.this.joinfields first then record fields
                field = (this.joinfields[join] && this.joinfields[join][columnOrName]) || columnOrName;
            }
            else {
                field = (_fields && _fields[columnOrName]) || columnOrName;
            }

            return this.results[i].getValue(field, join, summary);
        }
    };

    this.getText = function(i, columnOrName, joinId, summary) {
        var field, join;

        if (columnOrName instanceof nlobjSearchColumn) {
            return this.results[i].getText(columnOrName);
        }
        else {
            joinId = joinId || null;
            summary = summary || null;

            join  = _fields && _fields[joinId] ? _fields[joinId] : joinId;

            if (join) {
                // search this.joinfields first then record fields
                field = (this.joinfields[join] && this.joinfields[join][columnOrName]) || columnOrName;
            }
            else {
                field = (_fields && _fields[columnOrName]) || columnOrName;
            }

            return this.results[i].getText(field, join, summary);
        }
    };

    this.getResult = function (i) {
        return new FAM.SearchResult(this.results[i], _fields, this.joinfields);
    };
};

/**
 * Utility for Search Result Object
 *
 * Constructor Parameters:
 *     searchResult {nlobjSearchResult} - a result of a search
 *     fields {string{}} - hashmap of the record's fields and respective ids
 *     joinFields {string{}{}} - hashmap of the fields and ids of records joined by the search
**/
FAM.SearchResult = function (searchResult, fields, joinFields) {
    this.object     = searchResult;
    this.fields     = fields;
    this.joinFields = joinFields;
};

/**
 * Returns the internal Id of the searched record
 *
 * Returns:
 *     {string} - the internal Id of the record
**/
FAM.SearchResult.prototype.getId = function () {
    return this.object.getId();
};

/**
 * Returns the value for the column
 *
 * Parameters:
 *     columnOrName {nlobjSearchColumn|string} - column object used in search or the name of column
 *     joinId {string} - join Id used for this search column
 *     summary {string} - summary type used
 * Returns:
 *     {string} - value of the search column
 *     null - no columns match the criteria
**/
FAM.SearchResult.prototype.getValue = function (columnOrName, joinId, summary) {
    var field, join;

    if (columnOrName instanceof nlobjSearchColumn) {
        return this.object.getValue(columnOrName);
    }

    joinId = joinId || null;
    summary = summary || null;

    join  = this.fields && this.fields[joinId] ? this.fields[joinId] : joinId;

    if (join) {
        // search joinfields first then record fields
        field = (this.joinfields[join] && this.joinfields[join][columnOrName]) || columnOrName;
    }
    else {
        field = (this.fields && this.fields[columnOrName]) || columnOrName;
    }

    return this.object.getValue(field, join, summary);
};

/**
 * Returns the UI display name or text value of the column
 *
 * Parameters:
 *     columnOrName {nlobjSearchColumn|string} - column object used in search or the name of column
 *     joinId {string} - join Id used for this search column
 *     summary {string} - summary type used
 * Returns:
 *     {string} - UI display name or text value of the search column
 *     null - no columns match the criteria
**/
FAM.SearchResult.prototype.getText = function(columnOrName, joinId, summary) {
    var field, join;

    if (columnOrName instanceof nlobjSearchColumn) {
        return this.object.getText(columnOrName);
    }

    joinId = joinId || null;
    summary = summary || null;

    join  = this.fields && this.fields[joinId] ? this.fields[joinId] : joinId;

    if (join) {
        // search joinfields first then record fields
        field = (this.joinfields[join] && this.joinfields[join][columnOrName]) || columnOrName;
    }
    else {
        field = (this.fields && this.fields[columnOrName]) || columnOrName;
    }

    return this.object.getText(field, join, summary);
};

//---Standard Records---//
FAM.Subsidiary = function () {
    FAM.Record.apply(this, ['subsidiary']);
};

FAM.Account = function() {
    FAM.Record.apply(this, ['account']);
};

FAM.Vendor = function() {
    FAM.Record.apply(this, ['vendor']);
};

FAM.Transaction = function() {
    var approvalStatusList = {
        pending  : 1,
        approved : 2,
        rejected : 3
    };

    FAM.Record.apply(this, ['transaction']);

    this.getApprovalStatusId = function(name) {
        return approvalStatusList[name] || null;
    };
    this.getJournalApprovalValue = function() {
        return 'approved';
    };
    this.getExpReptApprovalValues = function() {
        return ['approvedByAcct', 'approvedByAcctOverride', 'paidInFull'];
    };
};

FAM.VendorBill = function() {
    FAM.Record.apply(this, ['vendorbill']);
};

FAM.Script = function() {
    FAM.Record.apply(this, ['script']);
};

FAM.ScriptDeployment = function() {
    FAM.Record.apply(this, ['scriptdeployment']);
};

FAM.JournalEntry = function() {
    FAM.Record.apply(this, ['journalentry']);

    this.getJournalHash = function () {
        var transDate  = nlapiStringToDate(this.getFieldValue('trandate'));

        return FAM.getJournalHash(transDate, this.getFieldValue('subsidiary'),
            this.getFieldValue('currency'), this.getFieldValue('accountingbook'),
            this.getFieldValue('department'),
            this.getFieldValue('class'), this.getFieldValue('location'));
    };
};

FAM.Employee = function () {
    this.getAdminRoleId = function getAdminRoleId() {
        return 3;
    };

    FAM.Record.apply(this, ['employee']);
};

FAM.Invoice = function() {
    FAM.Record.apply(this, ['invoice']);
};

FAM.AccountingBook = function () {
    FAM.Record.apply(this, ['accountingbook']);
};

FAM.File = function() {
    FAM.Record.apply(this, ['file']);
};

/**
 * [DEPRECATED] Please use the same class at FAM_Utils_Shared.js
 * Class for Caching frequently used fields from common records
**/
FAM.FieldCache = function (recordId) {
    this.recordId = recordId;
    this.values = {};
};

/**
 * [DEPRECATED] Please use "fieldValue" function at FAM_Utils_Shared.js
 * Determines if the record is inactive
 *
 * Parameters:
 *     id {number} - internal id of the record to be checked
 * Returns:
 *     true {boolean} - record is inactive
 *     false {boolean} - record is active
**/
FAM.FieldCache.prototype.isInactive = function (id) {
    if (this.values[id] === undefined) {
        this.values[id] = nlapiLookupField(this.recordId, id, 'isinactive') === 'T';
    }

    return this.values[id];
};

/**
 * [DEPRECATED] Please use the same function at FAM_Utils_Shared.js
 * Caches the Currency Info. If BookId is supplied, attempts first to retrieve from
 * Accounting Book then from Subsidiary.
 *
 * Parameters:
 *     id {number} - internal id of the subsidiary to be cached
 *     bookId {number} - (Optional; For tax methods) internal id of booking id
 * Returns:
 *     currData {objec} - currency data object {id:currency id, symbol: ISO symbol}
**/
FAM.FieldCache.prototype.subCurrData = function (id, bookId) {
    if(!id){
        id = 1;
    }
    var hashId = (bookId) ? id + '-' + bookId : id;
    if (this.values[hashId] === undefined) {
        var currId = 0;
        if (bookId) {
            //Look for Currency from Accounting Book
            subRec    = nlapiLoadRecord('subsidiary', id),
            totalBook = subRec.getLineItemCount('accountingbookdetail');
            for (var bCtr=1; bCtr <= totalBook; bCtr++) {
                if (bookId == subRec.getLineItemValue('accountingbookdetail','accountingbook',bCtr)) {
                    currId = subRec.getLineItemValue('accountingbookdetail','currency',bCtr);
                    break;
                }
            }
        }
        if(!currId) {
            //Look for Currency from Subsidiary
            currId = 1;
            if(nlapiGetContext().getFeature('SUBSIDIARIES')){
                currId = nlapiLookupField(this.recordId,id, 'currency') || 1;
            }
        }
        this.values[hashId] = {currId: currId,
                           currSym: nlapiLoadRecord('currency', currId).getFieldValue('symbol')};
    }
    return this.values[hashId];
};

//---Common Functions---//

FAM.getJournalHash = function (postDate, subId, currId, bookId, depId, classId, locId) {
    var period    = '' + postDate.getFullYear() + (postDate.getMonth() + 1) + postDate.getDate(),
        arrJEHash = [period, subId || '', currId || 1, bookId || ''];

    if (FAM.Context.getPreference('deptsperline') !== 'T') {
        arrJEHash.push(depId || '');
    }
    if (FAM.Context.getPreference('classesperline') !== 'T') {
        arrJEHash.push(classId || '');
    }
    if (FAM.Context.getPreference('locsperline') !== 'T') {
        arrJEHash.push(locId || '');
    }

    return arrJEHash.join('|');
};

FAM.getSubsidiaryHierarchy = function() {
    var i, id, name, arrNames, parentName, parentId, res, nameIds = {}, children = { 0 : [] };

    res = nlapiSearchRecord('subsidiary', null,
        new nlobjSearchFilter('isinactive', null, 'is', 'F'),
        new nlobjSearchColumn('name').setSort());

    for (i = 0; i < res.length; i++) {
        id = res[i].getId();
        name = res[i].getValue('name');

        nameIds[name] = id;
        arrNames = name.split(' : ');

        if (arrNames.length > 1) {
            arrNames.splice(arrNames.length - 1, 1);
            parentName = arrNames.join(' : ');
            parentId = nameIds[parentName];

            if (typeof children[parentId] === 'undefined') {
                children[parentId] = [];
            }

            children[parentId].push(id);
        }
        else {
            children[0].push(id);
        }
    }

    return { children : children };
};

FAM.getSubsidiaryChildren = function(subsidiaryId, arrChildren) {
    if (!FAM.subsidiaryHierarchy) {
        FAM.subsidiaryHierarchy = FAM.getSubsidiaryHierarchy();
    }
    var arrHierarchy = FAM.subsidiaryHierarchy.children[subsidiaryId];
    if (arrHierarchy) {
        for (var i=0; i<arrHierarchy.length; i++) {
            var childId = arrHierarchy[i];
            if (FAM.subsidiaryHierarchy.children[childId]) {
                FAM.getSubsidiaryChildren(childId, arrChildren);
            }
            arrChildren.push(childId);
        }
    }
};

/**
 * Includes child subsidiaries from the list of subsidiaries given
 *
 * Parameters:
 *     subIds {number[]} - internal ids of subsidiaries to search on
 * Returns:
 *     {number[]} - internal ids of subsidiaries with their children
**/
FAM.includeSubsidiaryChildren = function (subIds) {
    var i, j, arrChildren, subsidiaries = [].concat(subIds);

    for (i = 0; i < subIds.length; i++) {
        arrChildren = [];
        FAM.getSubsidiaryChildren(subIds[i], arrChildren);

        for (j = 0; j < arrChildren.length; j++) {
            if (subsidiaries.indexOf(arrChildren[j]) === -1) {
                subsidiaries.push(arrChildren[j]);
            }
        }
    }

    return subsidiaries;
};

FAM.getAccountingPeriodInfo = function () {
    var i, recList = null;
        fSearch = new FAM.Search(new FAM.AccountingPeriod());

    fSearch.addFilter('is_quarter', null, 'is', 'F');
    fSearch.addFilter('is_year', null, 'is', 'F');

    fSearch.addAllColumns('start_date');

    fSearch.run();

    if (fSearch.results) {
        recList = [];
        for (i = 0; i < fSearch.results.length; i++) {
            recList.push({
                internalId : fSearch.getId(i),
                startDate  : nlapiStringToDate(fSearch.getValue(i, 'start_date')),
                endDate    : nlapiStringToDate(fSearch.getValue(i, 'end_date'  )),
                periodName : fSearch.getValue(i, 'periodname'),
                allClosed  : fSearch.getValue(i, 'all_closed') === 'T',
                apLocked   : fSearch.getValue(i, 'ap_locked' ) === 'T',
                arLocked   : fSearch.getValue(i, 'ar_locked' ) === 'T',
                allLocked  : fSearch.getValue(i, 'all_locked') === 'T',
                isAdjust   : fSearch.getValue(i, 'is_adjust') === 'T'
            });
        }
    }
    return recList;
};

/*TODO:
 * Rename compareCDLSubsidiary to a more generic function name, this is now being used to check Account/Subsidiary relationship
 */

/**
 * Checks whether or not the Class/Department/Location is available for the specific Subsidiary
 *
 * Parameters:
 *     cdlName {string} - which CDL to check, valid values are:
 *         'classification', 'department', and 'location'
 *     cdlId {integer/string} - internal id of the CDL record
 *     subsidiary {integer/string} - internal id of the Subsidiary record
 * Return:
 *     {boolean} true - CDL is available for Subsidiary
 *     {boolean} false - CDL is not available for Subsidiary
**/
FAM.compareCDLSubsidiary = function (cdlName, cdlId, subsidiary) {
    var cdlRec, arrParent, includeChildren, cdlSubsidiary;

    subsidiary += '';

    if (subsidiary === '') {
        return true;
    }

    cdlRec = nlapiLoadRecord(cdlName, cdlId);
    cdlSubsidiary = cdlRec.getFieldValues('subsidiary') === null ?
        cdlRec.getFieldValue('subsidiary') : cdlRec.getFieldValues('subsidiary');
    arrParent = [].concat(cdlSubsidiary);
    includeChildren = cdlRec.getFieldValue('includechildren') === 'T';

    if (arrParent.indexOf(subsidiary) === -1 && (!includeChildren || (includeChildren &&
        !FAM.isSubChildOf(arrParent, subsidiary)))) {

        return false;
    }

    return true;
};

FAM.isSubChildOf = function (arrParent, child) {
    var i, arrChildren;

    for (i = 0; i < arrParent.length; i++) {
        arrChildren = [];
        FAM.getSubsidiaryChildren(arrParent[i], arrChildren);

        if (arrChildren.indexOf(child) !== -1) {
            return true;
        }
    }

    return false;
};

/**
 * Determines if the specific transaction is approved or not
 *
 * Parameter:
 *     transac {nlobjSearchResult} - transaction record to be checked
 * Returns:
 *     true {boolean} - transaction is approved
 *     false {boolean} - transaction is not approved
**/
FAM.isTransactionApproved = function (transac) {
    var ret = false,
        transRec = new FAM.Transaction();

    switch (transac.getValue('type')) {
    case 'VendBill':
        ret = transac.getValue('approvalstatus') == transRec.getApprovalStatusId('approved');
    break;
    case 'Journal':
        ret = transac.getValue('status') == transRec.getJournalApprovalValue();
    break;
    case 'ExpRept':
        ret = transRec.getExpReptApprovalValues().indexOf(transac.getValue('status')) >= 0;
    break;
    case 'Build':
    case 'CardChrg':
    case 'InvAdjst':
    case 'InvTrnfr':
    case 'ItemRcpt':
    default:
        ret = true;
    }

    return ret;
};

FAM.searchAssetTypeNames = function (arrAssetTypes) {
    var retData      = [],
        assetTypeRec = new FAM.AssetType_Record(),
        fSearch      = new FAM.Search(assetTypeRec),
        getName = function (record) { return record.getValue('name'); };

    fSearch.addFilter('internalid',  null, 'anyof', arrAssetTypes);

    fSearch.addColumn('name');

    fSearch.run();
    if(fSearch.results) {
        retData = fSearch.results.map(getName);
    }
    return retData;
};

FAM.searchSSInstance = function (depRecId){
    var arrColSI = new Array();
    var arrFilSI = new Array();
    arrColSI.push((new nlobjSearchColumn('datecreated')).setSort(true));
    arrColSI.push(new nlobjSearchColumn('status'));
    arrFilSI.push(new nlobjSearchFilter('internalid', 'scriptdeployment', 'is' , depRecId));
    var siRes =  nlapiSearchRecord('scheduledscriptinstance', null, arrFilSI, arrColSI);
    var siStat = siRes?siRes[0].getValue('status'):'NONE';

    return siStat;
};

FAM.searchAccountingBooks = function (status) {
    var fSearch = new FAM.Search(new FAM.AccountingBook());

    if (status) {
        fSearch.addFilter('status', null, 'is', status);
    }

    fSearch.addColumn('internalid', null, null, 'SORT_ASC');
    fSearch.addColumn('name');

    fSearch.run();
    return fSearch;
};
/**
 * TODO: Use FAM.Timer in FAM_Settings.js
 *       Update script record - include FAM_Settings.js in libraries
 */
FAM.Timer = function() {
    var _time = null;

    this.start = function() {
        _time = (new Date()).getTime();
    };

    this.getElapsedTime = function() {
        return (new Date()).getTime() - _time;
    };

    this.getReadableElapsedTime = function() {
        var timeInMS = this.getElapsedTime(),
            res = '',
            rem = 0;

        if (timeInMS > 1000) {
            rem = timeInMS % 1000;
            timeInMS = (timeInMS - rem) / 1000; //secs
            res = rem + 'ms' + res;
            if (timeInMS > 60) {
                rem = timeInMS % 60;
                timeInMS = (timeInMS - rem) / 60; // minutes
                res = rem + 's ' + res;
                if (timeInMS > 60) {
                    rem = timeInMS % 60;
                    timeInMS = (timeInMS - rem) / 60; // hours
                    res = rem + 'm ' + res;
                    if (timeInMS > 24) {
                        rem = timeInMS % 24;
                        timeInMS = (timeInMS - rem) / 24; // days
                        res = timeInMS + 'd ' + rem + 'h ' + res;
                    }
                    else {
                        res = timeInMS + 'h ' + res;
                    }
                }
                else {
                    res = timeInMS + 'm ' + res;
                }
            }
            else {
                res = timeInMS + 's ' + res;
            }
        }
        else {
            res = timeInMS + 'ms';
        }

        return res;
    };
};
