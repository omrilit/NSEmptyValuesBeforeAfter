/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 *
 */
define(['../adapter/fam_adapter_format',
        '../adapter/fam_adapter_url',
        '../const/fam_const_customlist',
        '../dict/fam_dict',
        '../util/fam_util_translator'], 

function(formatter, url, constList, dict, utilTranslator) {
    var module = {
        screenName: 'famprocess'
    };
    
    var REC_INDEX = {
        'customrecord_fam_assetvalues': 'Asset Values',
        'customrecord_ncfar_asset': 'Asset',
        'customrecord_ncfar_assettype': 'Asset Type',
        'customrecord_ncfar_deprhistory': 'Depreciation History Record',
        'customrecord_bg_summaryrecord': 'BG Summary',
        'customrecord_ncfar_altdepreciation': 'Alternate Depreciation',
        'journalentry': 'Journal Entry',
        'customtransaction_fam_depr_jrn': 'Custom Transaction (Depreciation)',
        'transaction': 'Transaction ID',
        'customrecord_ncfar_proposaldates': 'Last Proposal Dates'
    };
    
    module.getPropertyLabel = function(propertyName, type) {
        var label = '';
        if (propertyName) {
            try {
                if (type) {
                    propertyName = propertyName + '_' + type;
                }
                if (utilTranslator.getXmlData(propertyName, this.screenName) && utilTranslator.getXmlData(propertyName, this.screenName).length > 0) {
                    label = utilTranslator.getString(propertyName, this.screenName);
                }
            } catch(ex) {
                log.error('status util - getPropertyLabel', ex);
            }
        }
        return label;
    };

    module.getProcessStage = function(options) {
        var processStage = null;
        if (options && options.name && options.stage) {
            var process = dict[options.name];
            if (process && options.stage <= process.length) {
                processStage = process[options.stage - 1];
            }
        }
        return processStage;
    };
    
    module.buildProcessId = function(options) {
        var processId = '';
        if (options && options.id) {
            try {
                var href = url.resolveRecord({
                    recordType: 'customrecord_fam_process',
                    recordId: options.id,
                    isEditMode: false,
                    params: null
                });
                var label = options.label || options.id; 
                processId = '<a class="dottedlink" target="_blank" href="' + href + '">' + label + '</a>';
            } catch(ex) {
                log.error('status util - buildProcessId', ex);
            }
        }
        return processId;
    };
    
    module.buildProcessName = function(options) {
        var processName = '';
        if (options && options.name) {
            processName = options.name;
            var process = dict[options.name];
            if (process) {
                if (this.getPropertyLabel(options.name)) {
                    processName = this.getPropertyLabel(options.name);
                }
            }
        }
        return processName;
    };
    
    module.buildStageNumber = function(options) {
        var stageNumber = '';
        if (options && options.name) {
            options.stage = options.stage || 0;
            var process = dict[options.name];
            stageNumber = options.stage + '/' + process.length;
        }
        return stageNumber;
    };
    
    module.buildStageName = function(options) {
        var stageName = '';
        var currStageObj = this.getProcessStage(options);
        if (currStageObj) {
            if (currStageObj.displayId) {
                stageName = this.getPropertyLabel(currStageObj.displayId, 'name');
            }
            
            if (!stageName) {
                stageName = utilTranslator.getString(currStageObj.desc, this.screenName);
            }
            
            var stageNumber = '';
            if (!!options.includeNumber) {
                stageNumber = this.buildStageNumber(options) + ': ';
            }
            stageName = stageNumber + stageName;
        }
        return stageName;
    };
    
    module.buildProcessStageName = function(options) {
        var processStageName = '';
        var processName = this.buildProcessName(options);
        var stageName = this.buildStageName(options);
        
        if (processName) {
            processStageName = processName;
        }
        
        if (stageName) {
            var process = dict[options.name];
            processStageName = processStageName + ' (' + options.stage + '/' + process.length + '): ' + stageName;
        }
        return processStageName;
    };
    
    module.buildProcessStatus = function(options) {
        var processStatus = '';
        try {
            processStatus = utilTranslator.getString('proc_unknown', this.screenName);
            if (options && options.status) {
                var procStatusNames = [
                    utilTranslator.getString('proc_queued', this.screenName),
                    utilTranslator.getString('proc_inprogress', this.screenName),
                    utilTranslator.getString('proc_completed', this.screenName),
                    utilTranslator.getString('proc_failed', this.screenName),
                    utilTranslator.getString('proc_interrupted', this.screenName),
                    utilTranslator.getString('proc_completedwitherrors', this.screenName),
                ];
                if (procStatusNames[options.status - 1]) {
                    processStatus = procStatusNames[options.status - 1];
                }
            }
        } catch(ex) {
            log.error('status util - buildProcessStatus', ex);
        }
        return processStatus;
    };
    
    module.buildStageStatus = function(options) {
        var stageStatus = '';
        try {
            stageStatus = utilTranslator.getString('proc_unknown', this.screenName);
            if (options && options.status) {
                var stageStatusNames = [
                    utilTranslator.getString('stage_initiated', this.screenName),
                    utilTranslator.getString('stage_inprogress', this.screenName),
                    utilTranslator.getString('stage_completed', this.screenName),
                    utilTranslator.getString('stage_failed', this.screenName),
                    utilTranslator.getString('stage_errors', this.screenName),
                    utilTranslator.getString('stage_notrequired', this.screenName)
                ];
                if (stageStatusNames[options.status - 1]) {
                    stageStatus = stageStatusNames[options.status - 1];                    
                }
            }
        } catch(ex) {
            log.error('status util - stageStatus', ex);
        }
        return stageStatus;
    };
    
    module.buildProcessMessage = function(options) {
        var processMessage = '';
        if (options && options.status) {
            var statusToDisplayMsg = [
                constList.ProcStageStatus.Completed,
                constList.ProcStageStatus.CompletedWithErrors,
                constList.ProcStageStatus.Failed
            ];
            var currStageObj = this.getProcessStage(options);
            if (currStageObj && currStageObj.displayId && statusToDisplayMsg.indexOf(options.status) !== -1) {
                var msgString = [];
                if (this.getPropertyLabel(currStageObj.displayId, 'map')) {
                    msgString.push(this.getPropertyLabel(currStageObj.displayId, 'map') + ': ' + (options.mapResult || 0));
                }
                if (this.getPropertyLabel(currStageObj.displayId, 'reduce')) {
                    msgString.push(this.getPropertyLabel(currStageObj.displayId, 'reduce') + ': ' + (options.reduceResult || 0));
                }
                if (this.getPropertyLabel(currStageObj.displayId, 'output')) {
                    msgString.push(this.getPropertyLabel(currStageObj.displayId, 'output') + ': ' + (options.outputResult || 0));
                }
                processMessage = msgString.join('<br>');
            }
        }
        return processMessage;
    };
    
    module.buildProcessDateValue = function(dateNumVal) {
        var processTime = '';
        if (dateNumVal) {
            processTime = formatter.format({
                value: new Date(dateNumVal),
                type : formatter.getType().DATETIMETZ
            });
        }
        return processTime;
    };
    
    module.buildProcessErrors = function(options) {
        var processErrors = '';
        if (options && options.errors && options.errors.length > 0) {
            try {
                var href = url.resolveScript({
                    scriptId: 'customscript_fam_fprerrors_su',
                    deploymentId: 'customdeploy_fam_fprerrors_su',
                    returnExternalUrl: false,
                    params: {procid: options.id}
                });
                var errorsLabel = utilTranslator.getString('custpage_processerrors', this.screenName);
                processErrors = '<a class="dottedlink" target="_blank" href="' + href + '">' + errorsLabel + ': ' + options.errors.length + '</a>';
            } catch(ex) {
                log.error('status util - buildProcessErrors', ex);
            }
        }
        return processErrors;
    };
    
    module.buildProcessDetails = function(options) {
        var processErrors = '';
        if (options && options.id) {
            try {
                var href = url.resolveScript({
                    scriptId: 'customscript_fam_fprstatus_su',
                    deploymentId: 'customdeploy_fam_fprstatus_su',
                    returnExternalUrl: false,
                    params: {procid: options.id}
                });
                var detailsLabel = utilTranslator.getString('custpage_processdetails', this.screenName);
                processErrors = '<a class="dottedlink" target="_blank" href="' + href + '">' + detailsLabel + '</a>';
            } catch(ex) {
                log.error('status util - buildProcessDetails', ex);
            }
        }
        return processErrors;
    };
    
    module.buildErrorLog = function(options) {
        var errorLog = 'Unexpected Error';
        if (options && options.error) {
            errorLog = (options.error.name ? options.error.name + ': ' : '') + options.error.message;
        }
        return errorLog;
    };
    
    module.buildErrorRelatedRecords = function(options) {
        var errorRelRec = '';
        if (options && options.records && options.records.length > 0) {
            var msgString = [];
            for (var i = 0; i < options.records.length; i++) {
                var splitVal = options.records[i].split('-');
                if (splitVal && splitVal.length === 2) {
                    var recTypeId = splitVal[0];
                    var recTypeName = REC_INDEX[recTypeId] || recTypeId;
                    var recId = splitVal[1];
                    msgString.push(recTypeName + ': ' + recId);
                }
            }
            errorRelRec = msgString.join('<br>');
        }
        return errorRelRec;
    };
    
    module.getProcessStatusFormatting = function(status) {
        var formatting = '';
        switch(status) {
            case constList.ProcessStatus.InProgress: {
                formatting = 'font-weight:bold';
                break;
            }
            case constList.ProcessStatus.CompletedWithErrors: 
            case constList.ProcessStatus.Failed: {
                formatting = 'color:crimson';
                break;
            }
            default: {
                break;
            }
        }
        return formatting;
    };

    module.getStageStatusFormatting = function(status) {
        var formatting = '';
        switch(status) {
            case constList.ProcStageStatus.InProgress: {
                formatting = 'font-weight:bold';
                break;
            }
            case constList.ProcStageStatus.CompletedWithErrors:
            case constList.ProcStageStatus.Failed: {
                formatting = 'color:crimson';
                break;
            }
            default: {
                break;
            }
        }
        return formatting;
    };
    
    module.applyFormatting = function(rowObj, formatting) {
        if (rowObj && formatting) {
            for (var i in rowObj) {
                rowObj[i] = '<span style="' + formatting + '">' + rowObj[i] + '</span>';
            }
        }
        return rowObj;
    };
    
    return module;
    
});