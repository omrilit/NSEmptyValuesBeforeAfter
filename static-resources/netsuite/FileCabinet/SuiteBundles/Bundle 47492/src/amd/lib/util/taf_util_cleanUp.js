/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved..
 * 
 */
define(['../../adapter/taf_adapter_file',
        '../../adapter/taf_adapter_record',
        '../../adapter/taf_adapter_search',
        '../../lib/mapping/taf_map_records.js'], 
        utilCleanUp);

function utilCleanUp(file, record, search, recMap){
    
    
    var module = {};
    
    module.deleteRecord = function (targetRecord, bypassDependents) {
        var recType = targetRecord.type;
        if(recMap[recType]){
            var targetMap = recMap[recType]; 
            var recId = targetRecord.id;
            
            if(targetMap.childRecords){
                var arrChildRecords = targetMap.childRecords; 
                for(var i = 0; i < arrChildRecords.length; i++){
                    this.deleteChildRecords(arrChildRecords[i], recId);
                }
            }
            
            if(targetMap.dependents && !bypassDependents){
                var targetRec = record.load({type : recType,
                                             id : recId});
                for(var depType in objDependents){
                    module.deleteDependent(depType, targetRec.getValue(objDependents[depType]));
                }
            }
            
            log.debug(targetMap.title + ' Id: ' + recId + ' deleted');
            record.delete({type: recType, id: recId});
            
        }
    };
    
    module.deleteChildRecords = function(childRecordData, parentId){
        var childSearch = search.create({type : childRecordData.type,
                                         filters : {name : childRecordData.parentField, 
                                                    operator : search.getOperator('IS'), 
                                                    values : parentId}});
        var columns = [], targetMap = recMap[childRecordData.type],
            objDependents = targetMap.dependents || {};
        
        for(var depId in objDependents){
            columns.push(objDependents[depId]);
        }
    
        childSearch.columns = columns;
        
        var res = childSearch.run();
        childSearch.run().each(function(result) {
            var recData = {type : childRecordData.type, id : result.id};
            for(var depType in objDependents){
                module.deleteDependent(depType, result.getValue(objDependents[depType]));
            }
            
            module.deleteRecord({type: childRecordData.type,
                                 id: result.id}, true);
            log.debug(targetMap.title + ' Id: ' + result.id + ' deleted');
            return true;
        });
    };
    
    module.deleteDependent = function(depType, depId){
        switch(depType){
            case 'FILE' : file.delete({id: depId}); break;
            case 'SEARCH' : search.delete({id: depId}); break;
        }
        log.debug(depType + ' Id: ' + depId + ' deleted');
    };
    
    return module;
};
