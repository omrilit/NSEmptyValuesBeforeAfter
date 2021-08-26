/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define(['../adapter/fam_adapter_email',
        '../adapter/fam_adapter_search',
        '../adapter/fam_adapter_url',
        '../const/fam_const_customlist',
        '../util/fam_util_nsaccount',
        '../util/fam_util_search',
        '../util/fam_util_translator'],
        
function getMigrationDictionary(email, search, url, constList, 
        utilNsAccount, utilSearch, utilTranslator) {
    var module = {
        NewDepreciating: {},
        FullyDepreciated: {},
        Disposed: {},
        DeleteScheduleDhr: {}
    };	
    
    module.defaultLastIds = '0,0,0,0,0,0,0';
    
    module.interruptingProcessList = [
        'assetCreation',
        'assetGeneration', 
        'assetSplit',
        'depreciation',
        'precalc',
    	'revaluation',
    	'proposal',
    	'proposalSplit',
    	'transfer',
    	'compoundAssetCreation',
    	'assetValsReset',
    	'compoundAssetUpdate',
    	'deprSummaryCheck',
    	'assetUpdateRecovery'];
    
    module.reportProcessList = [
		'registerReport',
		'summaryReport',
		'schedReportNBV',
		'schedReportPD'  
    ];
    
    module.recMap = {
        asset: {
        	savedSearch: 'customsearch_fam_asset_migrateprecompute',
        	statusField: 'custrecord_assetstatus',
        },
        tax: {
        	savedSearch: 'customsearch_fam_tax_migrateprecompute',
        	statusField: 'custrecord_altdeprstatus',
        },
        dhr: {
        	savedSearch: 'customsearch_fam_scheduledhrdelete'
        },
        summary: {
        	savedSearch: 'customsearch_fam_summary_nojournal'
        },
        bgp: {
        	savedSearch: 'customsearch_fam_bgp_ongoing'
        }
    };
        
    module.paramsMap = {
        1: {type: 'asset', 
        	status: [constList.AssetStatus['New'], 
                     constList.AssetStatus['Depreciating'],
                     constList.AssetStatus['Part Disposed']].join()},
        2: {type: 'tax', 
        	status: [constList.TaxMethodStatus['New'], 
                     constList.TaxMethodStatus['Depreciating'],
                     constList.TaxMethodStatus['Part Disposed']].join()},
        3: {type: 'dhr',
        	status: ''},
        4: {type: 'asset', 
        	status: constList.AssetStatus['Fully Depreciated'].toString()},
        5: {type: 'tax', 
        	status: constList.TaxMethodStatus['Fully Depreciated'].toString()},
        6: {type: 'asset', 
        	status: constList.AssetStatus['Disposed'].toString()},
        7: {type: 'tax', 
        	status: constList.TaxMethodStatus['Disposed'].toString()}
    };
    
    module.buildSearchObject = function(params) {
    	var searchObj = null,
    	    recType = params.type,
    	    statusFilter = params.status,
    	    lastId = params.lastId,
    	    maxId = params.maxId;
    	    	
    	if (recType) {
            if ((['asset', 'tax'].indexOf(recType) > -1) &&
            	(!statusFilter || 
            	 !utilSearch.isValidInternalIdFilter(statusFilter.trim()))) {
            	return searchObj;
            }
    		
    		searchObj = search.load({
	            id: module.recMap[recType].savedSearch
	        });
	        
    		if (statusFilter) {
    			searchObj.filterExpression = searchObj.filterExpression.concat(
    		        ['and',
    		        [module.recMap[recType].statusField, 
    		         search.getOperator('ANYOF'), 
    		         utilSearch.parseCsvToInternalIdArray(statusFilter)]]);    			
    		}
	        
    		if (maxId) {
                searchObj.filterExpression = searchObj.filterExpression.concat(
                    ['and',
                    ['internalidnumber', search.getOperator('BETWEEN'), +lastId + 1, maxId]]);
    		}
    		else if (lastId) {
	            searchObj.filterExpression = searchObj.filterExpression.concat(
	                ['and',
	                ['internalidnumber', search.getOperator('GREATERTHAN'), +lastId]]);
	        }
    	}
    	
        return searchObj;
    };    

    module.hasRecordsToProcess = function(params) {
    	var hasRecordsToProcess = false,
    	    searchObj = module.buildSearchObject(params);
    	
    	if (searchObj && utilSearch.getTotalRows(searchObj)) {
    		hasRecordsToProcess = true;
    	}
    	
    	return hasRecordsToProcess;
    };
    
    module.getMaxId = function(searchObj) {
    	var maxId = 0;
    	var lastRecord;
    	
    	if (searchObj) {
    		var batchSize = constList.BatchSize.Migrate;
	        var pagedData = searchObj.runPaged({ pageSize : 1000 });
	        var count = pagedData.count;
	        log.debug('result count: ' + count);
	        
	        if (count > batchSize) {
	        	lastRecord = utilSearch.getResultAtIndex(pagedData, batchSize - 1);
	        }
	        else {
	        	lastRecord = utilSearch.getResultAtIndex(pagedData, count - 1);
	        }
	        
        	maxId = lastRecord.id;

	        log.debug('maxId: ' + maxId);
    	}
    	
    	return maxId;
    };
    
    module.getNextBatch = function(params, id, index) {
        var ret = null;
        
        if (params && id) {
            var lastId = module.getLastId(params.lastIds, index);
        	if (params.type === 'dhr') {
        		ret = {
        		    custscript_deleteschedule_fprid: id,
        		    custscript_deleteschedule_lastdhrid: lastId,
                    custscript_deleteschedule_lastids: params.lastIds};
        	}
        	else {
                ret = {
                    custscript_migratetoprec_fprid: id,
                    custscript_migratetoprec_status: params.status,
                    custscript_migratetoprec_type: params.type,
                    custscript_migratetoprec_lastid: lastId,
                    custscript_migratetoprec_lastids: params.lastIds};
        	}
        }
        log.debug('ret', JSON.stringify(ret));
        return ret;
    };
	
    module.getLastId = function(lastIds, index) {
        var lastId = 0;
        var lastIdArr = (lastIds || module.defaultLastIds).split(',');
		
        lastId = lastIdArr[index || 0];
		
        return lastId;
	};	    
    
    module.rebuildLastIds = function(mapKeys, currentStage, lastIds) {
    	var newLastIds = '';
    	
    	if (mapKeys && currentStage) {
        	var lastId = mapKeys[mapKeys.length - 1] || 0;
        	var lastIdArr = (lastIds || module.defaultLastIds).split(',');
            
        	lastIdArr[currentStage - 1] = lastId;
        	newLastIds = lastIdArr.join(',');
        }

    	log.debug('newLastIds', newLastIds);
    	
    	return newLastIds;
    };    
    
    module.buildSummaryLink = function(id) {
        var summaryLink = '';
        
        if (id) {
            try {
                var href = url.resolveScript({
                    scriptId: 'customscript_fam_fprstatus_su',
                    deploymentId: 'customdeploy_fam_fprstatus_su',
                    returnExternalUrl: false,
                    params: {procid: id}
                });
                summaryLink = '<a class="dottedlink" target="_blank" href="' + href + '">Summary Page</a>';
            } catch(ex) {
                log.error('dictMigrate - buildSummaryLink', ex);
            }
        }
        return summaryLink;
    };
    
    module.sendEmailNotif = function(options){
        var accountAdmins = utilNsAccount.getAccountAdminsEmail(),
            summaryLink = module.buildSummaryLink(options.id);
        
        accountAdmins = accountAdmins.slice(0,10);
        log.debug('recipients', accountAdmins);
        
        var recipients = accountAdmins.map(function(value){return value.id;});
        try{
            email.send({
                author: -5,
                recipients: recipients,
                subject: utilTranslator.getString(options.subjectId, 'precomputemigration'),
                body: utilTranslator.getString(options.bodyId, 'precomputemigration', [summaryLink])
            });   
        }
        catch(e){
            log.error('Unable to send email: ' + options.subjectId, e);
        }
    };
    
    module.scriptMap = {
        migrate: {
            scriptId: 'customscript_fam_migratetoprecompute_mr',
            deploymentId: 'customdeploy_fam_migratetoprecompute_mr'
        },
        deleteDhr: {
            scriptId: 'customscript_fam_deletescheduledhr_mr',
            deploymentId: 'customdeploy_fam_deletescheduledhr_mr'
        }
    }; 
		
    module.NewDepreciating.asset = {
        desc : 'Migrate New & Depreciating Assets',
        type : 'MAP_REDUCE',
        scriptId : module.scriptMap.migrate.scriptId,
        deploymentId : module.scriptMap.migrate.deploymentId,
        displayId : 'migrateprecnewdeprasset',
        validator : function(params, id) {
                        if (params.startEmailSent !== 'T'){
                            module.sendEmailNotif({
                                id: id,
                                subjectId: 'precomputemigration_email_start_subject',
                                bodyId: 'precomputemigration_email_start_body'
                            });
                            params.startEmailSent = 'T';
                        }
            
        	            var paramObj = module.paramsMap['1'];        	            
        	            paramObj.lastId = module.getLastId(params.lastIds, 0);
        	            return module.hasRecordsToProcess(paramObj);
			    	},
        getNextBatch : function(params, id) {
				           var paramObj = module.paramsMap['1'];			            
				           paramObj.lastIds = params.lastIds;
				    	   return module.getNextBatch(paramObj, id, 0);
				       }
    };
    
    module.NewDepreciating.taxMethod = {
        desc : 'Migrate New & Depreciating Tax Methods',
        type : 'MAP_REDUCE',
        scriptId : module.scriptMap.migrate.scriptId,
        deploymentId : module.scriptMap.migrate.deploymentId,
        displayId : 'migrateprecnewdeprtaxm',
        validator : function(params) {
			        	var paramObj = module.paramsMap['2'];			            
			            paramObj.lastId = module.getLastId(params.lastIds, 1);			            
			            return module.hasRecordsToProcess(paramObj);
					},
        getNextBatch : function(params, id) {
				           var paramObj = module.paramsMap['2'];			            
				           paramObj.lastIds = params.lastIds;
				    	   return module.getNextBatch(paramObj, id, 1);
                       }
    };
    
    module.FullyDepreciated.asset = {
        desc : 'Migrate Fully Depreciated Assets',
        type : 'MAP_REDUCE',
        scriptId : module.scriptMap.migrate.scriptId,
        deploymentId : module.scriptMap.migrate.deploymentId,
        interruptibleBy: module.interruptingProcessList.concat(module.reportProcessList),
        displayId : 'migrateprecfullydeprasset',
        validator : function(params) {
			            var paramObj = module.paramsMap['4'];        	            
			            paramObj.lastId = module.getLastId(params.lastIds, 3);        	            
			    		return module.hasRecordsToProcess(paramObj);
			    	},
		getNextBatch : function(params, id) {
				           var paramObj = module.paramsMap['4'];			            
				           paramObj.lastIds = params.lastIds;
				    	   return module.getNextBatch(paramObj, id, 3);
				       }
    };
    
    module.FullyDepreciated.taxMethod = {
        desc : 'Migrate Fully Depreciated Tax Methods',
        type : 'MAP_REDUCE',
        scriptId : module.scriptMap.migrate.scriptId,
        deploymentId : module.scriptMap.migrate.deploymentId,
        interruptibleBy: module.interruptingProcessList.concat(module.reportProcessList),
        displayId : 'migrateprecfullydeprtaxm',
        validator : function(params) {
			        	var paramObj = module.paramsMap['5'];			            
			            paramObj.lastId = module.getLastId(params.lastIds, 4);			            
			    		return module.hasRecordsToProcess(paramObj);
					},
		getNextBatch : function(params, id) {
				           var paramObj = module.paramsMap['5'];			            
				           paramObj.lastIds = params.lastIds;
				    	   return module.getNextBatch(paramObj, id, 4);
			           }
    };
        
    module.Disposed.asset = {
        desc : 'Migrate Disposed Assets',
        type : 'MAP_REDUCE',
        scriptId : module.scriptMap.migrate.scriptId,
        deploymentId : module.scriptMap.migrate.deploymentId,
        interruptibleBy : 'all',
        displayId : 'migrateprecdisposedasset',
        validator : function(params) {
			            var paramObj = module.paramsMap['6'];        	            
			            paramObj.lastId = module.getLastId(params.lastIds, 5);        	            
			    		return module.hasRecordsToProcess(paramObj);
			    	},
		getNextBatch : function(params, id) {
				           var paramObj = module.paramsMap['6'];			            
				           paramObj.lastIds = params.lastIds;
				    	   return module.getNextBatch(paramObj, id, 5);
				       }
    };
    
    module.Disposed.taxMethod = {
        desc : 'Migrate Disposed Tax Methods',
        type : 'MAP_REDUCE',
        scriptId : module.scriptMap.migrate.scriptId,
        deploymentId : module.scriptMap.migrate.deploymentId,
        interruptibleBy : 'all',
        displayId : 'migrateprecdisposedtaxm',
        validator : function(params, id) {
			        	var paramObj = module.paramsMap['7'];			            
			            paramObj.lastId = module.getLastId(params.lastIds, 6);
			            var callMigrate = module.hasRecordsToProcess(paramObj);
			            
			            if (!callMigrate) {
			                module.sendEmailNotif({
			                    id: id,
			                    subjectId: 'precomputemigration_email_end_subject',
			                    bodyId: 'precomputemigration_email_end_body'
		                    });
			            }
			            
			    		return callMigrate;
					},
		getNextBatch : function(params, id) {
				           var paramObj = module.paramsMap['7'];			            
				           paramObj.lastIds = params.lastIds;
				    	   return module.getNextBatch(paramObj, id, 6);
			           }
    };
    
    module.DeleteScheduleDhr = {
        desc : 'Delete Schedule DHR',
        type : 'MAP_REDUCE',
        scriptId : module.scriptMap.deleteDhr.scriptId,
        deploymentId : module.scriptMap.deleteDhr.deploymentId,
        interruptibleBy: module.interruptingProcessList,
        displayId : 'deletescheduledhr',
        validator : function(params) {
			        	var paramObj = module.paramsMap['3'];			            
			            paramObj.lastId = module.getLastId(params.lastIds, 2);			            
			    		return module.hasRecordsToProcess(paramObj);
			    	},
        getNextBatch : function(params, id) {
				           var paramObj = module.paramsMap['3'];			            
				           paramObj.lastIds = params.lastIds;
				    	   return module.getNextBatch(paramObj, id, 2);
			           }
    };

    return module;
});