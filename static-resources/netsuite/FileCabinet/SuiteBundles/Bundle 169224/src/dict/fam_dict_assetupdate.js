/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
**/
define(['../adapter/fam_adapter_file',
        '../const/fam_const_customlist',
        '../const/fam_const_names',
        '../util/fam_util_file',
        '../util/fam_util_log',
        ],

    function (file, utilConst, utilNames, utilFile, utilLog) {
    var module = {
        desc            : 'Asset Update',
        type            : 'MAP_REDUCE',
        scriptId        : 'customscript_fam_postdepr_updateasset_mr',
        deploymentId    : 'customdeploy_fam_postdepr_updateasset_mr',
        displayId       : 'assetupdate'
    };
    
    module.validator = function (params, fprId) {
        var isRecoveryMode = (params.recoveryMode === 'T');
        
        var fileIdLength = 0;
        if (!isRecoveryMode) {
            fileIdLength = params.fileIds?params.fileIds.split(',').length:0;
        }
        else {
            fileIdLength = utilFile.getFileId(utilNames.ASSET_UPDATE_RECOVERY_FILE_NAME) ? 1 : 0;
        }
        
        return (fileIdLength && 
                parseInt(params.startIdx||0, 10) < fileIdLength);
    };
    
    module.getNextBatch = function (params, fprId) {
        var isRecoveryMode = (params.recoveryMode === 'T');
        
        // get file list from previous stage
        var fileIds = params.fileIds ? params.fileIds.split(',') : [];
        var fileIdLength = fileIds.length; 
        
        if (isRecoveryMode) {
            params.startIdx = parseInt(params.startIdx||0, 10);
            
            var recoveryFileId = utilFile.getFileId(utilNames.ASSET_UPDATE_RECOVERY_FILE_NAME);
            
            // prevent from re-running
            params.startIdx++;
            var slaveIds = [];
            if (recoveryFileId) {
                var fileObj = file.load({id: recoveryFileId});
                var iterator = fileObj.lines.iterator();
                iterator.each(function (line) {
                    if (line.value) {
                        slaveIds.push(line.value)
                        return true;
                    }
                    
                    // Stop at the end of the recovery file. Extra blank line created by file API appendLine
                    return false;
                });
                
                return {
                    custscript_postdepr_slaveids: slaveIds.join(','),
                    custscript_postdepr_upd_fprid: fprId
                };
            }
            else {
                return null;
            }
        }
        // initialize values
        else if (fileIdLength) {
            params.startIdx = parseInt(params.startIdx||0, 10);
            
            var fileId = fileIds[params.startIdx],
                contents = file.load({id: fileId}).getContents(),
                numFiles = 1,
                slaveLength = contents.length,
                slaveIds = ''; // assign value inside the loop later
            
            do { 
                utilLog.debug('Including File ID ' + fileId);
                slaveIds = slaveIds ? [slaveIds, contents].join(',') : contents;
                
                // next file
                params.startIdx++;
                
                if (params.startIdx < fileIdLength) {
                    fileId = fileIds[params.startIdx];  
                    contents = file.load({id: fileId}).getContents();
                    numFiles++;
                    slaveLength += contents.length + 1; // + 1 for the comma separator
                }
                else {
                    break;
                }
            } while ((numFiles <= utilConst.BatchSize.AssetUpdateFiles) && // limit file loads
                     (slaveLength <= utilConst.BatchSize.AssetUpdateSlaves));
                
            return {
                custscript_postdepr_slaveids: slaveIds,
                custscript_postdepr_upd_fprid: fprId
            };
        }
        else {
            return null;
        }
    };
        
    return module;
});