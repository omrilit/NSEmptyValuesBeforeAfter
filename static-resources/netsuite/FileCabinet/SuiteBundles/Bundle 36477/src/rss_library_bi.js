/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 May 2013     pbtan
 * 2.00       30 May 2013     pbtan             fix headers of file contents.
 *
 */

/*
 * NETSUITE CSV IMPORT is limited to 25000 lines per file including the header.
 * currently set the backup to 10,000 lines.
 */

var psa_rss;
if (!psa_rss) { psa_rss = {}; }
if (!psa_rss.bundleinstall) { psa_rss.bundleinstall = {}; }

psa_rss.bundleinstall = function() {
    var parentFolderName    = 'ResourceSkillSets';
    var folderName          = 'Data Backup';
//  var folderDelimiter     = '/';
    
    this.incrementsPerSearch = 1000;
    this.recordsPerFile      = 10000;
    
    this.checkFeatureEnabled = function(featureId, featureDisplayName) {
        nlapiLogExecution('DEBUG','Checking Feature',featureId);
        var objContext = nlapiGetContext();
        var feature = objContext.getFeature(featureId);

        if ( feature )
        {
            nlapiLogExecution('DEBUG','Feature',featureId+' enabled');
        }
        else
        {
            throw new nlobjError('INSTALLATION_ERROR','Feature '+featureDisplayName+' must be enabled. Please enable the feature and re-try.');
        }
    };
    
    this.backupCustomRecord = function (recordname) {
        var MSG_TITLE   = 'backupCustomRecord';
        var fileName    = this.getFilename(recordname);
//      var recordList  = this.getRecordList(recordname);

        var resultsList = this.getRecordList(recordname);
        var isContinue  = true;
        var start       = 0;
        var end         = this.incrementsPerSearch;
        var strOutput   = 'Internal ID,';
        
        nlapiLogExecution('DEBUG', MSG_TITLE, 
                'START : \n' +  
                'nlapiGetContext().getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n' +
                '******************\r\n' + 
                'recordname  : ' + recordname + '\r\n' + 
                'resultsList : ' + resultsList + '\r\n');
        
        nlapiLogExecution('DEBUG', 'backupCustomRecord', recordname);
        
        // delete contents of folder.
        this.deleteContents(recordname);
        
        while (isContinue) {
            var recordList = resultsList.getResults(start, end);
        
            nlapiLogExecution('DEBUG', 'recordname', recordList.length);
            
            if (recordList !== null && recordList.length == 0) {
                isContinue = false;
                break;
            }
            
            if (start == 0) {
                if (recordname == 'category') {
                    strOutput = strOutput + 'Name\n';
                }
                else if (recordname == 'skill' || recordname == 'level') {
                    strOutput = strOutput + 'Name,Category,Line Number\n';
                }
                else if (recordname == 'skillset') {
                    strOutput = strOutput + 'Resource,Skill,Skill Level\n';
                }
            }
            
            if (recordname == 'category') {
                for (var i in recordList) {
                    strOutput = strOutput + recordList[i].getId()+','+ this.convertStringToCSVCompatibleString(recordList[i].getValue('name'))+'\n';
                }
            } 
            else if (recordname == 'skill') {
                for (var i in recordList) {
                    strOutput = strOutput + recordList[i].getId()+','+ this.convertStringToCSVCompatibleString(recordList[i].getValue('name'))+','+
                        this.convertStringToCSVCompatibleString(recordList[i].getText('custrecord_rss_skill_category'))+','+
                        this.convertStringToCSVCompatibleString(recordList[i].getValue('custrecord_rss_skill_linenumber'))+'\n';
                }
            }
            else if (recordname == 'level') {
                for (var i in recordList) {
                    strOutput = strOutput + recordList[i].getId()+','+ this.convertStringToCSVCompatibleString(recordList[i].getValue('name'))+','+
                        this.convertStringToCSVCompatibleString(recordList[i].getText('custrecord_rss_skill_level_category'))+','+
                        this.convertStringToCSVCompatibleString(recordList[i].getValue('custrecord_rss_skill_level_linenumber'))+'\n';
                }
            }
            else if (recordname == 'skillset') {
                for (var i in recordList) {
                    strOutput = strOutput + recordList[i].getId()+','+ this.convertStringToCSVCompatibleString(recordList[i].getText('custrecord_rss_skillset_resource'))+','+
                        this.convertStringToCSVCompatibleString(recordList[i].getText('custrecord_rss_skillset_skill'))+','+
                        this.convertStringToCSVCompatibleString(recordList[i].getText('custrecord_rss_skillset_level'))+'\n';
                }
            }
            
            if (recordList !== null && recordList.length < this.incrementsPerSearch) {
                nlapiLogExecution('DEBUG', recordname+ ' saving 1', (end / this.recordsPerFile));
                
                this.saveCsv(strOutput, fileName, Math.ceil((end / this.recordsPerFile)));
                
                isContinue = false;
                break;
            }
            else if (end % this.recordsPerFile == 0) {
                nlapiLogExecution('DEBUG', recordname+ ' saving 2', (end / this.recordsPerFile));
                
                this.saveCsv(strOutput, fileName, (end / this.recordsPerFile));
                
                strOutput = 'Internal ID,';
                
                if (recordname == 'category') {
                    strOutput = strOutput + 'Name\n';
                }
                
                if (recordname == 'skill' || recordname == 'level') {
                    strOutput = strOutput + 'Name,Category,Line Number\n';
                }
                
                if (recordname == 'skillset') {
                    strOutput = strOutput + 'Resource,Skill,Skill Level\n';
                }
            }
            
            start   = start + this.incrementsPerSearch;
            end     = end + this.incrementsPerSearch;
        }
        
        nlapiLogExecution('DEBUG', MSG_TITLE, 
                'END : \n' +  
                'nlapiGetContext().getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n' +
                '******************\r\n' + 
                'recordname  : ' + recordname + '\r\n' + 
                'resultsList : ' + resultsList + '\r\n');
    };
    
    /*
    this.restoreCustomRecord = function (recordname, suffix) {
        var savedImport = 'CUSTIMPORT_rss_' + recordname + suffix;
        var fileName    = this.getFilename(recordname);
        var fullpath    = parentFolderName + folderDelimiter + folderName + folderDelimiter + fileName;
        var file        = nlapiLoadFile(fullpath);
        
//      nlapiLogExecution('DEBUG', 'recordname', recordname);
//      nlapiLogExecution('DEBUG', 'savedImport', savedImport);
//      nlapiLogExecution('DEBUG', 'fileName', fileName);
//      nlapiLogExecution('DEBUG', 'fullpath', fullpath);
//      nlapiLogExecution('DEBUG', 'file', file);
        
        if (file) {
//          nlapiLogExecution('DEBUG', 'file', file.getName());
//          nlapiLogExecution('DEBUG', 'file', file.getFolder());
//          nlapiLogExecution('DEBUG', 'file', file.getType());
//          nlapiLogExecution('DEBUG', 'file', file.getURL());
//          nlapiLogExecution('DEBUG', 'file', file.getValue());
            
            var importObj = nlapiCreateCSVImport();
            
            nlapiLogExecution('DEBUG', 'importObj1', importObj);
            
            importObj.setMapping(savedImport);
            nlapiLogExecution('DEBUG', 'importObj2', importObj);
            
            importObj.setPrimaryFile(file.getValue());
            nlapiLogExecution('DEBUG', 'importObj3', importObj);
            
            jobId = nlapiSubmitCSVImport(importObj); // 100 units
        }
    };*/
    
    this.deleteContents = function (recordname) {
        var foldername  = this.getFilename(recordname);
        var folderId    = this.getFolderId(foldername);
        
        var columns     = new Array();
//      columns[0]  = new nlobjSearchColumn('internalid');
//      columns[0]  = new nlobjSearchColumn('numfiles');
        columns[0]  = new nlobjSearchColumn('internalid', 'file');
        columns[1]  = new nlobjSearchColumn('name', 'file');
        
        var results = nlapiSearchRecord('folder', null, new nlobjSearchFilter('internalid', null, 'anyof', folderId), columns);
        
        for (var i = 0; i < results.length; i++) {
            var fileid      = results[i].getValue('internalid', 'file');
            var filename    = results[i].getValue('name', 'file');
            
            if (filename.indexOf(foldername) == 0) {
                nlapiDeleteFile(fileid);
            }
        }
        
    }
    
    /*function generateOutputString (recordname, recordList) {
        var strOutput = 'Internal ID,';
        
        if (recordname == 'category') {
            strOutput = strOutput + 'Name\n';
            
            for (var i in recordList) {
                strOutput = strOutput + recordList[i].getId()+','+ this.convertStringToCSVCompatibleString(recordList[i].getValue('name'))+'\n';
            }
        }
        
        if (recordname == 'skill') {
            strOutput = strOutput + 'Name,Category,Line Number\n';
            
            for (var i in recordList) {
                strOutput = strOutput + recordList[i].getId()+','+ this.convertStringToCSVCompatibleString(recordList[i].getValue('name'))+','+
                    this.convertStringToCSVCompatibleString(recordList[i].getText('custrecord_rss_skill_category'))+','+
                    this.convertStringToCSVCompatibleString(recordList[i].getValue('custrecord_rss_skill_linenumber'))+'\n';
            }
        }
        
        if (recordname == 'level') {
            strOutput = strOutput + 'Name,Category,Line Number\n';
            
            for (var i in recordList) {
                strOutput = strOutput + recordList[i].getId()+','+ this.convertStringToCSVCompatibleString(recordList[i].getValue('name'))+','+
                    this.convertStringToCSVCompatibleString(recordList[i].getText('custrecord_rss_skill_level_category'))+','+
                    this.convertStringToCSVCompatibleString(recordList[i].getValue('custrecord_rss_skill_level_linenumber'))+'\n';
            }
        }
        
        if (recordname == 'skillset') {
            strOutput = strOutput + 'Resource,Skill,Skill Level\n';
            
            for (var i in recordList) {
                strOutput = strOutput + recordList[i].getId()+','+ this.convertStringToCSVCompatibleString(recordList[i].getText('custrecord_rss_skillset_resource'))+','+
                    this.convertStringToCSVCompatibleString(recordList[i].getText('custrecord_rss_skillset_skill'))+','+
                    this.convertStringToCSVCompatibleString(recordList[i].getText('custrecord_rss_skillset_level'))+'\n';
            }
        }
        
        return strOutput;
    };*/
    
    this.getFilename = function (recordname) {
        var fileName;
        
        if (recordname == 'category') {
            fileName = 'rss_categories';
        }
        
        if (recordname == 'skill') {
            fileName = 'rss_skills';
        }
        
        if (recordname == 'level') {
            fileName = 'rss_skill_levels';
        }
        
        if (recordname == 'skillset') {
            fileName = 'rss_skill_sets';                
        }
        
        return fileName;
    };
    
    this.saveCsv = function (outputString, fileName, suffix) {
        var fileId;
        var file        = nlapiCreateFile(fileName + suffix + '.csv', 'CSV', outputString);
        var folderId    = this.getFolderId(fileName);
        
        file.setFolder(folderId);
        
        fileId = nlapiSubmitFile(file);
        
        return fileId;
    };
    
    this.getRecordList = function (recordname) {
        var recordType;
        var columns     = new Array();
        columns[0]      = new nlobjSearchColumn('internalid');
        
        if (recordname == 'category') {
            columns[1]  = new nlobjSearchColumn('name');
            recordType  = 'customrecord_rss_category';
        }
        
        if (recordname == 'skill') {
            columns[1]  = new nlobjSearchColumn('name');
            columns[2] = new nlobjSearchColumn('custrecord_rss_skill_category');
            columns[3] = new nlobjSearchColumn('custrecord_rss_skill_linenumber');
            recordType = 'customrecord_rss_skill';
        }
        
        if (recordname == 'level') {
            columns[1] = new nlobjSearchColumn('name');
            columns[2] = new nlobjSearchColumn('custrecord_rss_skill_level_category');
            columns[3] = new nlobjSearchColumn('custrecord_rss_skill_level_linenumber');
            recordType = 'customrecord_rss_skill_level';
        }
        
        if (recordname == 'skillset') {
            columns[1] = new nlobjSearchColumn('custrecord_rss_skillset_resource');
            columns[2] = new nlobjSearchColumn('custrecord_rss_skillset_skill');
            columns[3] = new nlobjSearchColumn('custrecord_rss_skillset_level');
            recordType = 'customrecord_rss_skillset';
        }

//      return nlapiSearchRecord(recordType, null, null, columns);  
        
        var search      = nlapiCreateSearch(recordType, null, columns);
        var resultsList = search.runSearch();
        
        return resultsList;
        
    };
    
    this.convertStringToCSVCompatibleString = function (stringToConvert) {
        if ( (stringToConvert.indexOf(',') >= 0) || 
                (stringToConvert.indexOf('\n') >= 0) || 
                (stringToConvert.indexOf('\r') >= 0) ){
            
            return ('"' + stringToConvert + '"');
        }
        
        return stringToConvert;
    }; 
    
    this.getFolderId = function (recordFolderName) {
        var folderId;
        var parentFolderId;
        var recordFolderId;
        
        var searchResults = this.getFoldersByName(parentFolderName);
        if (searchResults) {
            for (var i = 0; i < searchResults.length; i++) {
                var searchResult = searchResults[i];
                if (!this.isValidObject(searchResult.getValue('parent'))) {
                    parentFolderId = searchResult.getValue('internalid');
                    break;
                }
            }
        }
        else {
            parentFolderId = this.createFolder(parentFolderName);
        }
        
        searchResults = this.getFoldersByName(folderName, parentFolderId);
        if (searchResults) {
            for (var i = 0; i < searchResults.length; i++) {
                folderId =  searchResults[i].getValue('internalid');
            }
        }
        else {
            folderId = this.createFolder(folderName, parentFolderId);
        }
        
        searchResults = this.getFoldersByName(recordFolderName, folderId);
        if (searchResults) {
            for (var i = 0; i < searchResults.length; i++) {
                recordFolderId =  searchResults[i].getValue('internalid');
            }
        }
        else {
            recordFolderId = this.createFolder(recordFolderName, folderId);
        }

        return recordFolderId;
    };
    
    this.getFoldersByName = function (folderName, parentFolderId) {
        var filters = new Array();
        filters[0]  = new nlobjSearchFilter('name', null, 'startswith', folderName);
        
        if (this.isValidObject(parentFolderId)) {
            filters[1] = new nlobjSearchFilter('parent', null, 'is', parentFolderId);
        } 
        
        var columns = new Array();
        columns[0]  = new nlobjSearchColumn('internalid');
        columns[1]  = new nlobjSearchColumn('name');
        columns[2]  = new nlobjSearchColumn('parent');
        
        return nlapiSearchRecord('folder', null, filters, columns); 
    };

    this.createFolder = function (folderName, parentFolderId) {
        var folderRecord = nlapiCreateRecord('folder');
        folderRecord.setFieldValue('name', folderName);
        
        if (this.isValidObject(parentFolderId)) {
            folderRecord.setFieldValue('parent', parentFolderId);
        } 
        
        return nlapiSubmitRecord(folderRecord);
    };
    
    this.isValidObject = function (objectToTest) {
        var isValidObject = false;
        isValidObject = (objectToTest!=null && objectToTest!='' && objectToTest!=undefined) ? true : false;
        return isValidObject;   
    }; 
};