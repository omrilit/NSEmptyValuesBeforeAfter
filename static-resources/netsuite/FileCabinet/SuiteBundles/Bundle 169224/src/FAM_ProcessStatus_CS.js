/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

FAM.ProcessStatus_CS = new function () {
    this.intervalId = 0;
    this.screenName = 'processstatus';
    this.execLimit = 50;
    this.intervalRate = 5000;
    this.pId;
    this.procMsg;
    this.title={};
    this.statusMsg={};
    this.urlCache={};
    this.currList = [];
    this.prevList = [];

    /**
     * Init function of client script
     *
     * Parameters:
     *     {String} type
    **/
    this.pageInit = function (type) {
        var statusList = {};
            statusList[FAM.BGProcessStatus.InProgress]     = 'list_bgprocess_inprogress';
            statusList[FAM.BGProcessStatus.Completed]      = 'list_bgprocess_completed';
            statusList[FAM.BGProcessStatus.CompletedError] = 'list_bgprocess_completedwitherrors';
            statusList[FAM.BGProcessStatus.Failed]         = 'list_bgprocess_failed';
            statusList[FAM.BGProcessStatus.Queued]         = 'list_bgprocess_queue';
            statusList[FAM.BGProcessStatus.Reverting]      = 'list_bgprocess_revert';
        
        this.statusMessage  = FAM.Util_CS.fetchMessageObj(statusList, 'bgprocess');
        this.screenMessage  = FAM.Util_CS.fetchMessageObj({NOPENDING : 'custpage_nopending'} , this.screenName);
        this.alertMessage   = FAM.Util_CS.fetchMessageObj({
                                    DONE          : 'extjs_done',
                                    INITIALIZING  : 'extjs_initializing',
                                    RELOADING     : 'extjs_reloading'});
        
        nlapiSetFieldValue('custpage_progressbar','<div id="pbardiv"></div>'); //Clear Display Text
        this.pbar = new Ext.ProgressBar({
                    id       : 'pbar',
                    text     : this.alertMessage.INITIALIZING,
                    renderTo : 'pbardiv' //match progress_bar pageField from suitelet
                });
        
        this.pId = nlapiGetFieldValue('custpage_processid'); //get the process Id
        this.procMsg = nlapiGetFieldValue('custpage_html_process');
        
        if(this.pId) {
            this.refresh();
            this.intervalId = setInterval(this.refresh.bind(this), this.intervalRate);
        }
        else {
            this.pbar.updateProgress(0, this.screenMessage.NOPENDING, true);
        }
    };
    
    /**
     * Generates the messages for use in creating the list
     *
     * Parameters: {Object} message registry in the library file
     * Returns: {Object} messages taken from the resource file
     */
    this.generateMessages = function (obj) {
        return FAM.Util_CS.fetchMessageObj(obj, this.screenName);
    };

    /**
     * Function to refresh the process status bar
     *
     * Parameters:
     *     none
     * Returns:
     *     none
    **/
    this.refresh = function () {
        try {
            //if execution points are reached, reload the page
            if (nlapiGetContext().getRemainingUsage() < this.execLimit) {
                this.pbar.updateProgress(1, this.alertMessage.RELOADING, true);
                nlapiSetFieldValue('custpage_processid', this.pId);
                reloadPage();
            }
            // if not, update the screen
            else {
                var procStatus = new FAM.ProcessStatus();
                
                //generate messages
                if (Object.keys(this.title).length === 0 && Object.keys(this.statusMsg).length === 0) {
                    procStatus.title = this.generateMessages(procStatus.titleRegistry);
                    procStatus.statusMsg = this.generateMessages(procStatus.msgRegistry);
                    this.title = procStatus.title;
                    this.statusMsg = procStatus.statusMsg;
                } 
                else {
                    procStatus.title = this.title;
                    procStatus.statusMsg = this.statusMsg;
                }
                
                //generate url cache
                if (Object.keys(this.urlCache).length != 0) {
                    procStatus.urls = this.urlCache;
                } 
                
                //refresh process list
                var pObj = procStatus.searchProcessInstance();
                var htmlObj = procStatus.listProcess(pObj);
                this.currList = htmlObj.currObjList;
                this.prevList = htmlObj.prevObjList;
                var percent = htmlObj.percent;
                
                nlapiSetFieldValue('custpage_html_processlist', htmlObj['currHtml']);
                nlapiSetFieldValue('custpage_html_prev_process', htmlObj['prevMsg']);
                nlapiSetFieldValue('custpage_html_prev_processlist', htmlObj['prevHtml']);
                nlapiSetFieldValue('custpage_processid', htmlObj['currId']);

                if (this.currList.length > 0) {
                	var currObj = this.currList[0];
                	text = currObj.statusname;
                }
                else {
                	var prevObj = this.prevList[0];
                	text = prevObj.statusname;
                	
                	// Stop refreshing when there are no more current processes
                	clearInterval(this.intervalId);
                }
                
                this.pbar.updateProgress(percent, text, true);
                
                //merge url cache (for reuse next refresh)
                for (var prop in procStatus.urls) {
                    if (!this.urlCache.hasOwnProperty(prop)) {
                        this.urlCache[prop] = procStatus.urls[prop];
                    }
                }
            }
        }
        catch(e) {
            clearInterval(this.intervalId);
            throw e;
        }
    };

};