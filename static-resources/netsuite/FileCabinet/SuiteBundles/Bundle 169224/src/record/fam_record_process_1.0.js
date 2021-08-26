var FAM;
if (!FAM) { FAM = {}; }

FAM.ProcessRecord = function () {
    var crtName = 'customrecord_fam_process',
        fields = {
            procId: 'custrecord_fam_procid',
            status: 'custrecord_fam_procstatus',
            params: 'custrecord_fam_procparams',
            currStage: 'custrecord_fam_proccurrstage',
            totStages: 'custrecord_fam_proctotstages',
            currStageStatus: 'custrecord_fam_proccurrstagestatus',
            postProcessData: 'custrecord_fam_procpostdata',
            stateValues: 'custrecord_fam_procstateval'
        };
    
    FAM.Record.apply(this, [crtName, fields]);
    
    this.params = {};
    this.stateValuesArray = [];
    
    this.setParams = function() {        
        var result = this.getFieldValue(fields.params);
        if (result) {
            this.params = JSON.parse(result);
        }
    };
    
    this.setStateValues = function() {
        var result = this.getFieldValue(fields.stateValues);
        if (result) {
            this.stateValuesArray = JSON.parse(result);
        }
    };
    
    this.startStage = function() {
        try {
            var fieldValues = {};
            fieldValues[fields.currStageStatus] = FAM.ProcStageStatus.InProgress;
            if (this.stateValuesArray.length > 0) {
                var currStateValues = this.stateValuesArray[this.stateValuesArray.length - 1];
                currStateValues.start = new Date().getTime();
                fieldValues[fields.stateValues] = JSON.stringify(this.stateValuesArray);
            }
            this.submitField(fieldValues);
            nlapiLogExecution('DEBUG', 'startStage', this.getRecordId());
        }
        catch(ex) {
            nlapiLogExecution('ERROR', 'startStage', 'error occurred: ' + JSON.stringify(ex));
        }
    };
    
    this.updateStage = function(options) {
        if (options) {
            try {                
                this.submitField(options);
                nlapiLogExecution('DEBUG', 'updateStage', this.getRecordId());
            }
            catch(ex) {
                nlapiLogExecution('ERROR', 'updateStage', 'error occurred: ' + JSON.stringify(ex));
            }
        }
    };
    
    this.callProcessManager = function() {
        var procId = null;
        try {
            procId = nlapiScheduleScript('customscript_fam_processmanager_ss', 'customdeploy_fam_processmanager_ss');
        }
        catch(ex) {
            nlapiLogExecution('ERROR', 'callProcessManager', 'error occurred: ' + JSON.stringify(ex));
        }
        return procId;
    };    
};
