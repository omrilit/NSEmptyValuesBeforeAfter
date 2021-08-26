/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

/**
 * Constructor of ExtJsUtil class
 * @returns none
 */
FAM.ExtJsUtil = function () {
    this.pbar   = null;
    this.task   = null;
    this.EXEC_LIMIT = 30; //usage point limit before reloading for Progress Bar
};

/**
 * Insert Progress Bar on the screen
 *
 * @param procId - the process instance Id to Load
 * @param fldMsg (Optional)- hashmap containing field id and field value from screen
 * @param pbarDiv (Optional)- <div> tag id to serve as place holder of the progress bar
 * @return {Object} - The created Ext.ProgressBar class
 */
FAM.ExtJsUtil.prototype.createProgressBar = function(procId, fldMsg, pbarDiv) {
    var barParam = {
            id:'pbar'
        };
    if(fldMsg && fldMsg.fldInit) {
        barParam.text = fldMsg.fldInit;
    }
    if(pbarDiv) {
        barParam.renderTo = pbarDiv; //Should match the DIV id of html)
    }

    this.pbar = new Ext.ProgressBar(barParam);
    this.pbar.setWidth(EXTJS_PROGRESSBAR_WIDTH);

    // Start a simple clock task that updates a div once per second
    this.task = {
        run  : this.queuePoller,
        args : [procId, fldMsg],
        scope: this,
        interval: PROGRESSS_BAR_REFRESHRATE * 1000 //Interval defined in FAM_Constants
    };
    return this.pbar;
};

/**
 * Polling function responsible for updating screen information
 *
 * @param procId - the process instance Id to Load
 * @param fldMsg - hashmap containing field id and field value from screen
 */
FAM.ExtJsUtil.prototype.queuePoller = function(procId, fldMsg) {
    var instObj     = this.getProcessInstance(procId, fldMsg);

    //Set Progress Text
    if(!instObj || this.pbar == null) {
        //Status Unknown
        nlapiLogExecution('ERROR','FAM.ExtJsUtil.queuePoller',
            'instObj/pbar not initialized');
        Ext.TaskMgr.stop(this.task);
        return;
    }

    //Update field data
    this.pbar.updateProgress(instObj.percent,
        instObj.progText, true);

    //Check exec points
    if( (!(instObj.statusId == FAM.BGProcessStatus.Queued
            || instObj.statusId == FAM.BGProcessStatus.InProgress))
                || nlapiGetContext().getRemainingUsage() < this.EXEC_LIMIT) {
        //Reload Page Upon Exec Limit or Completion
        Ext.TaskMgr.stop(this.task);
        reloadPage();
    }
};

/**
 * [DUMMY] Get Process Instance information
 *  (To be overwritten with getProcessInstanceImpl)
 *
 * @param instId - instance record Id
 * @param fldMsg - fldMsg Id and Value
 * @returns none
 */
FAM.ExtJsUtil.prototype.getProcessInstance = function(instId, fldMsg) {

    if(typeof this.getProcessInstanceImpl == 'function') {
        return this.getProcessInstanceImpl.apply(this, arguments);
    }
    else {
        // Dummy or put in default implementation
        nlapiLogExecution('DEBUG','FAM.ExtJsUtil.getProcessInstance',
            'Override getProcessInstanceImpl function not found.');

        return null;
    }
};