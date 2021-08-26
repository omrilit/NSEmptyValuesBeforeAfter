/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define([
    '../adapter/fam_adapter_file',
    '../adapter/fam_adapter_format',
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_render',
    '../adapter/fam_adapter_search',
    '../record/fam_record_deprschedreport',
    '../const/fam_const_customlist',
    '../util/fam_util_csv',
    '../util/fam_util_log',
    '../util/fam_util_systemsetup',
    '../util/fam_util_translator'
],

function(file, formatter, record, render, search, deprSchedReportRec, fConst, utilCsv, fLog, utilSetup, utilTranslator) {
    var module = {
        reportFolder: null,
        DeprSched: {}
    };
    
    /**
     * Writes CSV file/s based on fpr id and contents
     * 
     * @param {Object} options - file process id, contents array
     * @returns {Array} Array of id/s for created file/s
     */
    module.writeCSVFile = function(options) {
        var fileIds = [];
        if (options && options.fprId && options.contents && options.contents.join) {
            options.type = 'csv';
            options.idx = -1;
            
            var splitFiles = this.splitCSVContents(options.contents);
            for (var i = 0; i < splitFiles.length; i++) {
                if (splitFiles.length > 1) {
                    options.idx = i;
                }
                var filename = this.getFilename(options);
                var contents = splitFiles[i].join('\n') + '\n';
                var fileId = this.writeFile({
                    filename: filename,
                    fileType: file.getType().CSV,
                    contents: contents,
                    description: utilTranslator.getString('DSR_desc_DSR', 'DSR_template')
                });
                if (fileId) {
                    fileIds.push(fileId);
                }
            } 
        }
        
        fLog.debug('util_reports.writeCSVFile', 'file ids: ' + JSON.stringify(fileIds));
        return fileIds;
    };
    
    /**
     * Splits CSV contents array based on max number of lines per file
     * 
     * @param {Array} contents - comma-separated lines
     * @returns {Array} Groups of comma-separated lines
     */
    module.splitCSVContents = function(contents) {
        var splitFiles = [];
        
        if (contents && contents.join && contents.length > 0) {
            fLog.debug('splitCSVContents: content lines', contents.length);
            var startIdx = 0;
            while (startIdx < contents.length) {
                var endIdx = startIdx + fConst.FileLimit.CSVLines;
                if (endIdx > contents.length) {
                    endIdx = contents.length;
                }
                splitFiles.push(contents.slice(startIdx, endIdx));
                startIdx = endIdx;
            }
        }
        
        return splitFiles;
    };
    
    /**
     * Write XML file considering the report file size limit
     * 
     * @param {Object} options - contents, fpr id
     * @returns {Array} Array of id/s for created file/s
     */
    module.writeXMLFile = function(options) {
        var fileIds = [];
        
        if (options && options.contents && options.fprId) {
            var fileSizeLimit = utilSetup.getSetting('reportFileSizeLimit');
            
            // Check content size in bytes
            var encodedContents = encodeURIComponent(options.contents);
            var multibyte_match = encodedContents.match(/%[89ABab]/g);
            var bytecount = options.contents.length + (multibyte_match ? multibyte_match.length : 0);
            
            var start = 0;
            var end = fileSizeLimit;
            var fileCount = 1;
            
            while (bytecount > start){
                var blnSaveFile = false;
                var contentPortion = '';
                try {  
                    var encodedContentPortion = unescape(encodedContents).substring(start,end);
                    contentPortion = decodeURIComponent(escape(encodedContentPortion));

                    // if decode error did not occur (due to multi-byte char truncation)
                    start = end;
                    end = (bytecount > end + fileSizeLimit) ? end + fileSizeLimit : bytecount;
                    blnSaveFile = true;
                }
                catch(e){
                    end--;
                }
                if (blnSaveFile){
                    options.type = 'xml';
                    if (bytecount > fileSizeLimit) {
                        options.idx = fileCount < 100 ? ('00' + fileCount).slice(-3) : fileCount;
                    }
                    var fileNameToSave = this.getFilename(options);
                    var fileId = this.writeFile({
                        filename: fileNameToSave,
                        fileType: file.getType().XMLDOC,
                        contents: contentPortion,
                        description: utilTranslator.getString('DSR_desc_DSR', 'DSR_template')
                    });
                    fileCount++;
                    fileIds.push(fileId);
                }
            }
        }
        
        return fileIds;
    };
    
    /**
     * Builds filename based on file type, fpr id, idx, and part id
     * 
     * @param {Object} options - file process id, file type, idx
     * @returns {String} Filename
     */
    module.getFilename = function(options) {
        var filename = '';
        
        if (options && options.fprId && options.type) {
            // get file type suffix and extension
            var prefix = options.prefix || 'FAM_FPR';
            var suffix = '';
            var ext = '';
            switch(options.type) {
                case 'csv': {
                    suffix = 'CSV';
                    ext = 'csv';
                    break;
                }
                case 'xml' : {
                    ext = 'xml';
                    break;
                }
            }
            
            // get FPR part
            var fprPart = options.fprId;
            if (options.partId) {
                fprPart = [options.fprId, options.partId, ''].join('_');
            }
            
            // build name
            filename = [prefix, fprPart, suffix].join('');
            
            // append file count if idx is given
            if (options.idx > -1) {
                var fileCount = ('00' + options.idx).substr(-3);
                filename = [filename, fileCount].join('_');
            }
            
            // append extension
            filename = [filename, ext].join('.');
        }
        
        return filename;
    };
    
    /**
     * Writes file on FAM reports folder
     * 
     * @param {Object} options - filename, file type, contents
     * @returns {String} File id
     */
    module.writeFile = function(options) {
        var fileId = null;
        
        if (options && options.filename && options.fileType && options.contents) {
            try {
                var startTime = new Date().getTime();
                var fileObj = file.create({
                    name: options.filename,
                    fileType: options.fileType,
                    contents: options.contents
                });
                var folder = utilSetup.getSetting('reportFolder');
                if (options.description) {
                    fileObj.description = options.description;
                } 
                if (folder) {
                    fileObj.folder = folder;
                    fileId = fileObj.save();
                    fLog.audit('File creation in ms', new Date().getTime() - startTime);
                }
            }
            catch (ex) {
                fLog.error('Error saving file', JSON.stringify(ex));
            }
        }
        
        return fileId;
    };
    
    /**
     * Loads file contents and converts it to array
     * Optionally delete file if flag is specified
     * 
     * @param {Object}  fileId - file id to load
     * @param {Boolean} deleteFlag - optional flag to specify whether file should be deleted
     * @returns {Array} File contents
     */
    module.getCSVFileContents = function(fileId, deleteFlag) {
        var csvData = null;
        if (fileId) {
            deleteFlag = deleteFlag || false;
            try {
                // load file 
                var fileObj = file.load(fileId);
                // get contents
                var csvDataStr = fileObj.getContents();
                csvData = csvDataStr.split('\n');
                if (deleteFlag) {
                    try {
                        file['delete']({id: fileId});
                    }
                    catch(ex1) {
                        fLog.error('Error deleting file', JSON.stringify(ex1));
                    }
                }
            }
            catch(ex) {
                fLog.error('Error loading file', JSON.stringify(ex));
            }
        }
        return csvData;
    };

    /**
     * Merge the files based on sorted keys.
     * 
     * @param {Object}  options.batches - Batches object with key = batch hash, value = file id's for partial files, 
     *                  options.refSortArray - Sorted keys of batches object
     * @returns {Array} merged contents as array
     */
    module.stitchCSVFiles = function(options) {
        var mergedContents = [];
        
        if (options.batches) {
            var startTime = new Date().getTime();
            options.refSortArray = options.refSortArray || Object.keys(options.batches);
            for (var i = 0; i < options.refSortArray.length; i++) {
                var batchStr = options.refSortArray[i];
                var batchFiles = options.batches[batchStr];
                if (batchFiles && batchFiles.length > 0) {
                    for (var j = 0; j < batchFiles.length; j++) {
                        // get contents
                        var csvData = this.getCSVFileContents(batchFiles[j], true);
                        csvData.splice(-1);  // removes new line
                        // append to mergedContents
                        if (csvData) {
                            mergedContents = mergedContents.concat(csvData);
                        }
                    }
                }
            }
            fLog.audit('CSV file stitch in ms', new Date().getTime() - startTime);
        }
        
        return mergedContents;
    };
    
    /**
     * Returns translated value of a string
     * 
     * @param {String} value
     * @param {String} pattern
     * @param {String} screenName
     * 
     * @returns {String} Translated value
     */
    module.translateStrings = function(value, pattern, screenName){
        var matches = value.match(pattern);
        if(matches){
            matches = matches.filter(function(item, i, ar){ return ar.indexOf(item) === i; }); //filter unique values
            if (matches) {
                for (var i = 0; i < matches.length; i++){
                    value = value.replace(new RegExp(matches[i], 'g'), utilTranslator.getString(matches[i], screenName));
                }
            }
        }
        return value;
    };
    
    /**
     * Creates date part string based on date object
     * 
     * @param {Date} dateObj
     * @returns {String} datePart
     */
    module.DeprSched.buildDatePart = function(dateObj) {
        var datePart = '';
        if (dateObj && dateObj.getFullYear) {
            datePart = [ 
                dateObj.getFullYear(), 
                ('00' + (dateObj.getMonth() + 1)).substr(-2), 
                ('00' + dateObj.getDate()).substr(-2)
            ].join('');
        }
        return datePart;
    };
    
    /**
     * Creates year filter string based on start and end dates
     * Only creates filter if dates are in same year
     * - Start is not 1/1: yyyymmdd-
     * - End is not 12/31: -yyyymmdd
     * - Start is not 1/1 and end is not 12/31: yyyymmdd-yyyymmdd
     * - Start is 1/1 and end is 12/31: yyyy
     * 
     * @param {Date} currStart
     * @param {Date} currEnd
     * @returns {String} yearFilter
     */
    module.DeprSched.buildYearFilter = function(currStart, currEnd) {
        var yearFilter = null;
        if (currStart && currEnd && currStart.getFullYear && currEnd.getFullYear && currStart.getFullYear() === currEnd.getFullYear()) {
            var startDatePart = this.buildDatePart(currStart);
            var endDatePart = this.buildDatePart(currEnd);
            if (currStart.getMonth() === 0 && currStart.getDate() === 1 &&
                currEnd.getMonth() === 11 && currEnd.getDate() === 31) {
                yearFilter = currStart.getFullYear();
            }
            else if (currEnd.getMonth() === 11 && currEnd.getDate() === 31) {
                yearFilter = [ startDatePart, '' ].join('-');
            }
            else if (currStart.getMonth() === 0 && currStart.getDate() === 1) {
                yearFilter = [ '', endDatePart ].join('-');
            }
            else {
                yearFilter = [ startDatePart, endDatePart ].join('-');
            }
        }
        return yearFilter;
    };
    
    /**
     * Creates batch hash: subs|book|year|assetType
     * 
     * @param {Object} options - subs, book, assetType
     * @returns {String} batchHash
     */
    module.DeprSched.buildBatchHash = function(options) {
        var batchHash = null;
        if (options && options.year && options.subs && options.book && options.assetType) {
            batchHash = [
                options.subs, 
                options.book, 
                options.year, 
                options.assetType].join('|');
        }
        return batchHash;
    };
    
    /**
     * Parses date from yyyymmdd string
     * 
     * @param {String} datePart
     * @returns {Date} dateObj
     */
    module.DeprSched.parseDatePart = function(datePart) {
        var dateObj = null;
        if (datePart && datePart.length === 8 && !isNaN(datePart)) {
            var year = datePart.substr(0, 4);
            var month = parseInt(datePart.substr(4, 2), 10) - 1;
            var date = parseInt(datePart.substr(6, 2), 10);
            dateObj = new Date(year, month, date);
        }
        return dateObj;
    };
    
    /**
     * Parses year based on date filter string
     * - yyyymmdd- : start: mm/dd/yyyy, end: 12/31/yyyy
     * - -yyyymmdd : start: 01/01/yyyy, end: mm/dd/yyyy
     * - yyyy : start: 01/01/yyyy, end: 12/31/yyyy
     * - yyyymmdd-yyyymmdd : start: mm/dd/yyyy, end: mm/dd/yyyy
     * 
     * @param {String} dateFilter
     * @returns {String} retObj - start, end
     */
    module.DeprSched.parseDateFilter = function(dateFilter) {
        var retObj = {};
        
        if (dateFilter && dateFilter.split) {
            var dateFilterPart = dateFilter.split('-');
            if (dateFilterPart.length === 2) {
                if (dateFilterPart[0] && dateFilterPart[1]) {
                    retObj.start = this.parseDatePart(dateFilterPart[0]);
                    retObj.end = this.parseDatePart(dateFilterPart[1]);
                }
                else if (dateFilterPart[0] && !dateFilterPart[1]) {
                    retObj.start = this.parseDatePart(dateFilterPart[0]);
                    retObj.end = new Date(retObj.start.getFullYear(), 11, 31);
                }
                else if (!dateFilterPart[0] && dateFilterPart[1]) {
                    retObj.end = this.parseDatePart(dateFilterPart[1]);
                    retObj.start = new Date(retObj.end.getFullYear(), 0, 1);
                }
            }
            else if (dateFilterPart.length === 1) {
                retObj.start = new Date(dateFilterPart[0], 0, 1);
                retObj.end = new Date(dateFilterPart[0], 11, 31);
            }
        }

        return retObj;
    };
    
    /**
     * Parse batch hash to object:
     * - subs
     * - book
     * - start (string format)
     * - end (string format)
     * - assetTypes
     * 
     * @param {String} batchHash
     * @returns {Object} 0, +, -
     */
    module.DeprSched.parseBatchHash = function(batchHash) {
        var retObj = {};
        
        if (batchHash && batchHash.split) {
            var batchHashArr = batchHash.split('|');
            var filterIdx = [ 'subs', 'book', 'year', 'assetTypes' ];
            if (batchHashArr.length === filterIdx.length) {
                for (var i = 0; i < filterIdx.length; i++) {
                    if (filterIdx[i] === 'year') {
                        var dateFilterPart = this.parseDateFilter(batchHashArr[i]);
                        retObj.start = formatter.format({
                            value: dateFilterPart.start,  
                            type: formatter.getType().DATE
                        });
                        retObj.end = formatter.format({
                            value: dateFilterPart.end,  
                            type: formatter.getType().DATE
                        });
                    }
                    else {
                        retObj[filterIdx[i]] = batchHashArr[i];
                    }
                }
            }
        }
        
        return retObj;
    };
    
    /**
     * Sorting function for batch hash. Sort by:
     * - subs
     * - book (@NONE@ takes precedence)
     * - start date
     * - asset type
     * 
     * @param {String} batchHash1
     * @param {String} batchHash2
     * @returns {Integer} 0, +, -
     */
    module.DeprSched.sortBatchHash = function(batchHash1, batchHash2) {
        var ret = 0;
        
        if (batchHash1 !== batchHash2) {
            var obj1 = module.DeprSched.parseBatchHash(batchHash1);
            var obj2 = module.DeprSched.parseBatchHash(batchHash2);
            
            if (obj1 && obj2 &&
                obj1.subs && obj2.subs && 
                obj1.book && obj2.book &&
                obj1.start && obj2.start &&
                obj1.assetTypes && obj2.assetTypes) {
                if (obj1.subs === obj2.subs) {
                    if (obj1.book === obj2.book) {
                       var date1 = formatter.parse({
                           value: obj1.start,  
                           type: formatter.getType().DATE
                       });
                       var date2 = formatter.parse({
                           value: obj2.start,  
                           type: formatter.getType().DATE
                       });
                       if (date1.getTime() === date2.getTime()) {
                           ret = parseInt(obj1.assetTypes, 10) - parseInt(obj2.assetTypes, 10); 
                       } 
                       else {
                           ret = date1.getTime() - date2.getTime();
                       }
                    }
                    else {
                        if (obj1.book === '@NONE@') {
                            ret = -1;
                        }
                        else if (obj2.book === '@NONE@') {
                            ret = 1;
                        }
                        else {
                            ret = parseInt(obj1.book, 10) - parseInt(obj2.book, 10); 
                        }
                    }
                }
                else {
                    ret = parseInt(obj1.subs, 10) - parseInt(obj2.subs, 10); 
                }
            }
        }
        
        return ret;
    };
    
    /**
     * Write report file for Depreciation Schedule Report
     * 
     * @param {Object} options - params, sorted array
     * @returns {Array} Array of id/s for created file/s 
     */
    module.DeprSched.writeReportFile = function(options) {
        var fileIds = null;
        
        if (options) {
            options.contents = module.stitchCSVFiles({
                batches: options.params.batches,
                refSortArray: options.refSortArray
            });
            if (options.contents && options.contents.length > 0) {
                options.fprId = options.params.fpr;
                options.prefix = 'FAM_DeprSchedule_FPR';
                if (options.params.csv === 'T') {
                    fileIds = module.writeCSVFile(options);
                }
                else {
                    options.contents = this.renderXML(options);
                    if (options.contents) {
                        fileIds = module.writeXMLFile(options);
                    }
                }
            }
        }
        
        return fileIds;
    };
    
    /**
     * Render report contents as XML
     * 
     * @param {Object} options - params, contents
     * @returns {String} XML as string
     */
    module.DeprSched.renderXML = function(options) {
        var xmlReport = null;
        
        if (options && options.params && options.contents) {
            var templateId = utilSetup.getSetting('templateDeprSchedPd');
            if (options.params.reportType === 'nbv') {
                templateId = utilSetup.getSetting('templateDeprSchedNbv');
            }
            if (templateId) {
                var fileObj = file.load(templateId);
                // get contents
                var template = fileObj.getContents();
                template = module.translateStrings(template, /DSR_.+?_DSR/g, 'DSR_template');
                template = module.translateStrings(template, /AFL_.+?_AFL/g, 'templateassetfieldlabel');
                template = module.translateStrings(template, /TFL_.+?_TFL/g, 'templatetaxfieldlabel');
                
                var startTime = new Date().getTime();
                var reportRec = this.createReportRecord(options);
                fLog.audit('create report record in ms', new Date().getTime() - startTime);
                if (reportRec) {
                    var templateRenderer = render.create();
                    templateRenderer.templateContent = template;
                    templateRenderer.addRecord({
                        templateName: 'report', 
                        record: reportRec
                    });
                    
                    startTime = new Date().getTime();
                    xmlReport = templateRenderer.renderAsString();
                    fLog.audit('render XML in ms', new Date().getTime() - startTime);
                }
            }
        }
        
        return xmlReport;
    };
    
    /**
     * Creates report record based on params and contents
     * 
     * @param {Object} options - params, contents
     * @returns {record.Record} Record object  
     */
    module.DeprSched.createReportRecord = function(options) {
        var rec = null;
        
        if (options && options.params && options.contents) {
            try {
                var recordObj = new deprSchedReportRec();
                
                recordObj.rec = record.create({
                    type: recordObj.type,
                    isDynamic : true
                });
                
                recordObj.setValue('startDate', new Date(options.params.start));
                recordObj.setValue('endDate', new Date(options.params.end));
                recordObj.setValue('assetInc', this.getAssetSelectionString(options.params.leased));
                recordObj.setValue('repType', this.getReportTypeString(options.params.reportType));
                recordObj.setValue('deprMet', this.getMethodName(options.params.depr));
                
                this.addReportLines({
                    rec: recordObj.rec, 
                    contents: options.contents
                });
                
                rec = recordObj.rec;
            } catch(ex) {
                fLog.error('Error creating depreciation report record', JSON.stringify(ex));
            }
        }
        
        return rec;
    };
    
    /**
     * Gets string for Asset Selection (Leased/Except Leased/All Assets)
     * 
     * @params {String} leased - Leased setting
     * @returns {String} Resource string for asset selection
     */
    module.DeprSched.getAssetSelectionString = function(leased) {
        var assetSelection = '';

        if (!leased) {
            assetSelection = utilTranslator.getString('custpage_constant_allassets');
        }
        else if (leased === 'F') {
            assetSelection = utilTranslator.getString('custpage_constant_exceptleased');
        }
        else if (leased === 'T') {
            assetSelection = utilTranslator.getString('custpage_constant_onlyaassets');
        }

        return assetSelection;
    };
    
    /**
     * Gets string for Report Type
     * 
     * @params {String} reportType - report type from params
     * @returns {String} Resource string for report type
     */
    module.DeprSched.getReportTypeString = function(reportType) {
        var reportTypeString = utilTranslator.getString('custpage_perioddepr', 'depreciationschedule2');
        if (reportType === 'nbv') {
            reportTypeString = utilTranslator.getString('custpage_netbookvalue', 'depreciationschedule2'); 
        }
        return reportTypeString;
    };
    
    /**
     * Gets string for method name
     * 
     * @params {String} depr - alt depr id
     * @returns {String} Method name for alt method or default accounting method
     */
    module.DeprSched.getMethodName = function(depr) {
        var altMethodName = null;
        
        if (depr) {
            altMethodName = search.lookupFields({
                type: 'customrecord_ncfar_altmethods',
                id: depr,
                columns: ['name']
            }).name;
        }
                
        return altMethodName || utilTranslator.getString('custpage_dropdown_accountingmethod', 'famreports');
    };

    /**
     * Adds report lines to record
     * 
     * @param {Object} options - params, contents
     */
    module.DeprSched.addReportLines = function(options) {
        if (options && options.rec && options.contents) {
            var col = {
                sub         : 0,
                book        : 1,
                currency    : 2,
                year        : 3,
                type        : 4,
                assetIdText : 5,
                assetName   : 6,
                method      : 7,
                life        : 8,
                assetId     : 9,
                altDeprId   : 10,
                monthsStart : 11
            };
            
            var group = 'recmachcustrecord_fam_schedrepline_parent';
            for (var i = 0; i < options.contents.length; i++) {
                var line = utilCsv.parseText(options.contents[i]).data[0];
                options.rec.selectNewLine({
                    sublistId: group
                });
                
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_subsidiary',
                    value: line[col.sub]
                });
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_book',
                    value: line[col.book]
                });
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_year',
                    value: line[col.year]
                });
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_type',
                    value: line[col.type]
                });
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_assetid',
                    value: line[col.assetIdText]
                });
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_method',
                    value: line[col.method]
                });
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_currency',
                    value: line[col.currency]
                });
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_assetname',
                    value: line[col.assetName]
                });
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_assetlife',
                    value: line[col.life]
                });
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_src_asset',
                    value: line[col.assetId]
                });
                options.rec.setCurrentSublistValue({
                    sublistId: group,
                    fieldId: 'custrecord_fam_schedrepline_src_altdepr',
                    value: line[col.altDeprId]
                });
                
                for (var monthCtr = 0; monthCtr < 12 ; monthCtr++) {
                    options.rec.setCurrentSublistValue({
                        sublistId: group,
                        fieldId: 'custrecord_fam_schedrepline_p' + (monthCtr + 1),
                        value: line[col.monthsStart + monthCtr]
                    });
                }
                
                options.rec.commitLine({
                    sublistId: group
                });
            }
        }
    };
    
    return module;
});
