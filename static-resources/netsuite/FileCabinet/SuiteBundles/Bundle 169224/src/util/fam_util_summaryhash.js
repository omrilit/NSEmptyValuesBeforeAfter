/**
 * © 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 *
 * @NApiVersion 2.x
*/

define([
    '../adapter/fam_adapter_error',
    '../adapter/fam_adapter_format',
    '../adapter/fam_adapter_runtime',
    '../adapter/fam_adapter_search',
    '../const/fam_const_customlist',
    '../util/fam_util_record',
    '../util/fam_util_systemsetup',
    '../util/fam_util_translator'
], 

function (error, formatter, runtime, search, constList, utilRec, utilSetup, utilTranslator) {
    
    return {
        summaryCache: {},
        
        /**
         * Creates a hash string for journal-related values
         * 
         * @param {Object} options - values to set for subsidiary, currency, book, department,
         *                           class, location, and project
         * @returns {String} journalhash  = subsidiary|currency|book|d|c|l|project
         */
        buildJournalHash: function(options) {
            var arrJournalHash = [options.subId || '', options.currId || 1, options.bookId || ''];

            if (!runtime.getPreference('DEPTSPERLINE')) {
                arrJournalHash.push(options.depId || '');
            }
            else {
                arrJournalHash.push('');
            }

            if (!runtime.getPreference('CLASSESPERLINE')) {
                arrJournalHash.push(options.classId || '');
            }
            else {
                arrJournalHash.push('');
            }

            if (!runtime.getPreference('LOCSPERLINE')) {
                arrJournalHash.push(options.locId || '');
            }
            else {
                arrJournalHash.push('');
            }
            
            return arrJournalHash.join('|');
        },
        
        /**
         * Creates the filter to be used to search for existing summary records
         * with a value on its journal field
         * 
         * @param {Object} options - values to set for subsidiary, currency, book, department,
         *                           class, location, project, asset type, category, sub-category,
         *                           parent asset, depreciation account, charge account
         * @returns {String} hashfilter = journalhash|summarization|depreciation acct|charge acct
         */
        buildHashFilter: function (options) {
            var arrHashFilter = [
                  options.subId || '', 
                  options.currId || 1, 
                  options.bookId || '',
                  options.depId || '',
                  options.classId || '',
                  options.locId || '',
                  options.projectId || ''];
              
            var summarizeBy = +utilSetup.getSetting('isSummarizeJe');
            
            switch(summarizeBy) {
                case constList.SummarizeBy['Asset Type']: {
                    arrHashFilter.push(options.assetType || '');
                    break;
                }
                case constList.SummarizeBy['Parent']: {
                    var parent = [];
                    parent.push(options.assetType || '');
                    parent.push(options.parentId || '');
                    arrHashFilter.push(parent.join('-'));
                    break;
                }
                case constList.SummarizeBy['Sub-Category']: {
                    var subCategory = [];
                    subCategory.push(options.assetType || '');
                    if (options.repSubA) {
                        subCategory.push(options.repMainCat || '');
                        subCategory.push(options.repSubA || '');
                    }
                    arrHashFilter.push(subCategory.join('-'));
                    break;
                }
            }
            arrHashFilter.push(options.depAcct || '');
            arrHashFilter.push(options.chargeAcct || '');
            
            return arrHashFilter.join('|');
        },
        
        /**
         * Creates the string used as grouping part of hash value. The date is represented
         * as YYYYMMDD.
         * 
         * @param {Object} options - values to set for hashFilter (grouping) and date
         * @returns {String} hashvalue = date|hashfilter
         */
        buildHashIndexKey: function (options) {
            var arrHashValue = [];
            
            if (options.postDate) {
                var postDate = options.postDate;
                var year = postDate.getFullYear() + '';
                var month = ('00' + (postDate.getMonth() + 1)).substr(-2);
                var date = ('00' + (postDate.getDate())).substr(-2);
                var period = [year, month, date].join('');
                arrHashValue.push(period);
            }
            else {
                arrHashValue.push('');
            }
            arrHashValue.push(options.hashFilter);
            
            return arrHashValue.join('|');
        },
        
        /**
         * Creates the final hash value string with count/identifier for each grouping.
         * 
         * @param {Object} options - values to set for subsidiary, currency, book, department,
         *                           class, location, project, and date
         * @returns {String} hashvaluewithcount = hashvalue|count
         */
        buildHashValue: function(options, isConsolidated) {
            var hashIndexKey = this.buildHashIndexKey(options);
            if (this.summaryCache[hashIndexKey] === undefined){
                this.summaryCache[hashIndexKey] = {
                        wje : 0,
                        woje : 0,
                        inac : 0
                }
                this.updateSummaryCache(options);
            }
            var hashIndexValue = 0;
            if (isConsolidated){
                hashIndexValue = this.summaryCache[hashIndexKey]['woje'];
                if (0 === hashIndexValue){
                    hashIndexValue = Math.max(
                        this.summaryCache[hashIndexKey]['wje'],
                        this.summaryCache[hashIndexKey]['inac']);
                    hashIndexValue += 1;
                }
            }
            else{
                hashIndexValue = Math.max(
                    this.summaryCache[hashIndexKey]['woje'], 
                    this.summaryCache[hashIndexKey]['wje'],
                    this.summaryCache[hashIndexKey]['inac']);
                hashIndexValue += 1;
            }            
            // return with incremented value of count in index
            return [hashIndexKey, hashIndexValue].join('|');
        },
        
        /**
         * Parses hashvalue to an object
         * 
         * @param {String} hashString
         * @returns {Object} object with properties that represent the hash values
         */
        parseHashValue: function(hashString) {
            var returnObj = null;
            var hashFields = [ 
                'periodDate',
                'subId',
                'currId',
                'bookId',
                'depId',
                'classId',
                'locId',
                'projectId',
                'summarizeBy',
                'depAcct',
                'chargeAcct',
                'count'];
            var hashObj = hashString.split('|');
            if (hashObj.length <= hashFields.length) {
                returnObj = {};
                for (var i = 0; i < hashFields.length; i++) {
                    var field = hashFields[i]; 
                    if (field === 'periodDate') {
                        var periodYear = parseInt(hashObj[i].substr(0, 4), 10);
                        var periodMonth = parseInt(hashObj[i].substr(4, 2), 10);
                        var periodDate = parseInt(hashObj[i].substr(6, 2), 10);
                        returnObj[field] = new Date(periodYear, periodMonth - 1, periodDate);
                    }
                    else if (field === 'summarizeBy') {
                        var summarizeBy = +utilSetup.getSetting('isSummarizeJe');
                        
                        switch(summarizeBy) {
                            case constList.SummarizeBy['Asset Type']: {
                                returnObj.assetType = hashObj[i];
                                break;
                            }
                            case constList.SummarizeBy['Parent']: {
                                if (hashObj[i]) {
                                    var parent = hashObj[i].split('-');
                                    if (parent && parent.length === 2) {
                                        returnObj.assetType = parent[0] || '';
                                        returnObj.parentId = parent[1] || '';
                                    }
                                }
                                break;
                            }
                            case constList.SummarizeBy['Sub-Category']: {
                                if (hashObj[i]) {
                                    var subCategory = hashObj[i].split('-');
                                    if (subCategory) {
                                        if (subCategory.length === 3) {
                                            returnObj.assetType = subCategory[0];
                                            returnObj.repMainCat = subCategory[1];
                                            returnObj.repSubA = subCategory[2];
                                        }
                                        else if (subCategory.length === 1) {
                                            returnObj.assetType = subCategory[0];
                                            returnObj.repMainCat = '';
                                            returnObj.repSubA = '';
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }
                    else {
                        returnObj[field] = hashObj[i];
                    }
                }
            }
            return returnObj;
        },
        
        /**
         * Updates the summaryCache index with values from the search. This serves as the
         * "cache" for concurrent processes running on the same queue. This will be replaced by the
         * cache module once available.
         * 
         * @param options - hashFilter and date to be used as filter for summary records with journal
         */
        updateSummaryCache: function(options){
            if (options && options.hashFilter) {
                options.hashFilter = '|' + options.hashFilter + '|';
                var filters = [
                       search.createFilter({ name: 'name', operator: 'contains', values: options.hashFilter })
                   ];
                if (options.postDate) {
                    var dateStr = formatter.format({ // to string
                        value: options.postDate,
                        type: formatter.getType().DATE
                    });
                    filters.push(search.createFilter({ name: 'custrecord_summary_deprdate', operator: 'onorafter', values: dateStr }));
                }
                var searchObj = search.create({
                    type: 'customrecord_bg_summaryrecord',
                    filters: filters,
                    columns: [search.createColumn({ name: 'name' }),
                              search.createColumn({ name: 'isinactive' }),
                              search.createColumn({ name: 'custrecord_summary_jlid'})]
                });
                
                var propSummaryCache = this.summaryCache;
                var myPagedData = searchObj.runPaged();
                myPagedData.pageRanges.forEach(function(pageRange){
                    var myPage = myPagedData.fetch({index: pageRange.index});
                    myPage.data.forEach(function(result){
                        var hash = result.getValue({ name: 'name' }),
                            journal = result.getValue({ name: 'custrecord_summary_jlid' }),
                            seperatorIdx = hash.lastIndexOf('|'),
                            hashKey = hash.substring(0, seperatorIdx),
                            hashBatch = +hash.substring(seperatorIdx + 1),
                            isInactive = result.getValue({ name: 'isinactive' });
                        
                        propSummaryCache[hashKey] = propSummaryCache[hashKey] || {};
                        propSummaryCache[hashKey]['wje'] = propSummaryCache[hashKey]['wje'] || 0;
                        propSummaryCache[hashKey]['woje'] = propSummaryCache[hashKey]['woje'] || 0;
                        propSummaryCache[hashKey]['inac'] = propSummaryCache[hashKey]['inac'] || 0;
                        
                        if (isInactive) {
                            propSummaryCache[hashKey]['inac'] = hashBatch;
                        }
                        else if (journal && hashBatch > propSummaryCache[hashKey]['wje']){
                            propSummaryCache[hashKey]['wje'] = hashBatch;
                        }
                        else if (!journal && hashBatch > propSummaryCache[hashKey]['woje']){
                            propSummaryCache[hashKey]['woje'] = hashBatch;
                        }
                    });
                });
            }
        },
        
        getMissingFields: function (fieldObj, fromPrecompute) {
            var missingString = '',
                errors = [],
                fieldsToCheck = [],   
                errorMessages = {
                    subsidiary: 'precompute_subs',
                    assetType: 'precompute_assettype',
                    depAcct: 'precompute_depacct',
                    chargeAcct: 'precompute_chargeacct',
                    depId: 'precompute_dep',
                    classId: 'precompute_class',
                    locId: 'precompute_loc' 
                };
            
            if (fromPrecompute) {
                fieldsToCheck.push('assetType');
                
                if (runtime.isFeatureInEffect({feature:'SUBSIDIARIES'})) {
                    fieldsToCheck.push('subsidiary');
                }
            }            
            if (!fieldObj.taxId || (fieldObj.bookId && fieldObj.isPosting)) {
                fieldsToCheck.push('depAcct');
                fieldsToCheck.push('chargeAcct');
                
                if (runtime.getPreference('CLASSMANDATORY')) {
                    fieldsToCheck.push('classId');
                }
                if (runtime.getPreference('DEPTMANDATORY')) {
                    fieldsToCheck.push('depId');
                }
                if (runtime.getPreference('LOCMANDATORY')) {
                    fieldsToCheck.push('locId');
                }
            }
             
            for (var i = 0; i < fieldsToCheck.length; i++) {
                var fld = fieldsToCheck[i];
                if ( !fieldObj[fld] ) {
                    errors.push(utilTranslator.getString(errorMessages[fld]));
                }
            }
            
            if (errors.length > 0) {
                missingString = utilTranslator.getString('custpage_fields_missing', null,
                        [errors.join(', ')]);            
            }
            
            return missingString;
        },
        
        getInactiveFields: function(fieldObj, fromPrecompute) {
            var inactiveString = '',
                errors = [],
                fieldsToCheck = [],
                errorMessages = {},
                recordTypes = {};
            
            if (fromPrecompute) {
                errorMessages = {
                    subsInactive: 'precompute_subs',
                    bookInactive: 'precompute_book',
                    currInactive: 'precompute_curr',
                    classInactive: 'precompute_class',
                    depInactive: 'precompute_dep',
                    locInactive: 'precompute_loc',
                    projectInactive: 'precompute_proj',
                    assetTypeInactive: 'precompute_assettype'
                };
                
                if (!fieldObj.taxId || fieldObj.bookId) {  // if asset or tax has book
                    errorMessages['depAcctInactive'] = 'precompute_depacct';
                    errorMessages['chargeAcctInactive'] = 'precompute_chargeacct';
                }
                
                switch(+utilSetup.getSetting('isSummarizeJe')) {
                    case constList.SummarizeBy['Parent']: {
                        errorMessages['parentInactive'] = 'precompute_parent';
                        break;
                    }
                    case constList.SummarizeBy['Sub-Category']: {
                        errorMessages['repMainCatInactive'] = 'precompute_cat';
                        errorMessages['repSubAInactive'] = 'precompute_subcat';
                        break;
                    }
                }
            }
            else {                    
                if (runtime.getPreference('CLASSESPERLINE')) {
                    errorMessages['classId'] = 'precompute_class';
                    recordTypes.classId = 'classification'; 
                }
                if (runtime.getPreference('DEPTSPERLINE')) {
                    errorMessages['depId'] = 'precompute_dep';
                    recordTypes.depId = 'department';
                }
                if (runtime.getPreference('LOCSPERLINE')) {
                    errorMessages['locId'] = 'precompute_loc';
                    recordTypes.locId = 'location';
                }
                errorMessages['projectId'] = 'precompute_proj';
                recordTypes.projectId = 'job';
                errorMessages['depAcct'] = 'precompute_depacct';
                recordTypes.depAcct = 'account';
                errorMessages['chargeAcct'] = 'precompute_chargeacct';
                recordTypes.chargeAcct = 'account';
            }

            var errors = [];
            var fieldsToCheck = Object.keys(errorMessages);
            
            for (var i = 0; i < fieldsToCheck.length; i++) {
                var fld = fieldsToCheck[i];
                if (fromPrecompute) {
                    if ((fld !== 'bookInactive' && !!fieldObj[fld]) ||
                        (fld === 'bookInactive' && fieldObj[fld] && fieldObj[fld] !== 'ACTIVE')) {  // book uses status instead of inactive flag
                           errors.push(utilTranslator.getString(errorMessages[fld]));
                       }
                }
                else if (fieldObj[fld] && !utilRec.isRecordExisting(recordTypes[fld], fieldObj[fld])) {
                    errors.push(utilTranslator.getString(errorMessages[fld]));                    
                }    
            }
            
            if (errors.length > 0) {
                inactiveString = utilTranslator.getString('custpage_fields_inactive', null,
                        [errors.join(', ')]);
            }
            
            return inactiveString;
        },
                
        /**
         * Checks missing and inactive fields
         * 
         * @param {Object} hashValues - object with properties that represent the hash values
         */
        validateHashValues: function(hashValues) {
            var missingString = this.getMissingFields(hashValues);            
                
            if (missingString) {
                throw error.create({
                    name : 'MISSING_FIELDS',
                    message : missingString
                });                    
            }
            
            var inactiveString = this.getInactiveFields(hashValues);
            
            if (inactiveString) {
                throw error.create({
                    name : 'INACTIVE_FIELDS',
                    message : inactiveString
                });
            }
        }       
    };
});