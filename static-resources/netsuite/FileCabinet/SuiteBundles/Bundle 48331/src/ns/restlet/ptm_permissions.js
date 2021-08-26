/**
 * Module Description
 * 
 * Version        Date          Author          Remarks
 * 1.00         2014 01 20      pbtan           Initial commit. get user's permission
 * 2.00         2014 01 24      pbtan           included values for advanced jobs feature
 * 3.00         2014 02 03      pbtan           added permission checking for tracktime
 * 4.00         2014 02 07      pbtan           updated implementation of permission checking.
 * 5.00         2014 02 18      pbtan           removed checking for project templates
 * 6.00         2014 06 19      pmiller         Added permission checking for file cabinet
 * 
 */

var onServerLog = true;
var MSG_TITLE = 'PTM Role Permissions';
var ptmServLib = psa_ptm.serverlibrary;
var logger = new psa_ptm.serverlibrary.logger(MSG_TITLE, false);

/**
 * @param {Object} dataIn Parameter object
 * @returns {Object} Output object
 */
function getRESTlet(dataIn) {
    
    try {
        var context = nlapiGetContext();
        var version = parseInt(context.getVersion().split('.')[0]);
        
        var viewChart = true;
        var editTask = true;
        
        MSG_TITLE = 'getRESTlet Start';
        if (onServerLog) {
            logger.enable();
        }
        
        /*
         * Variables
         */
        MSG_TITLE = 'getRESTlet Variables';
        
        var jsonInputData = ptmServLib.toJson(dataIn);
        var jsonReturnData = new Object();
        var isReplyInJSON;
        
        if (jsonInputData) {
            if (jsonInputData.is_json && jsonInputData.is_json == 'F') isReplyInJSON = jsonInputData.is_json;
            else isReplyInJSON = 'T';
        }
        
        var advancedProjects = ptmServLib.isFeatureEnabled('ADVANCEDJOBS');
        var customRecords = ptmServLib.isFeatureEnabled('customrecords');
        var clientScript = ptmServLib.isFeatureEnabled('customcode');
        var serverScript = ptmServLib.isFeatureEnabled('serversidescripting');
        
        var resourceAllocation = ptmServLib.isFeatureEnabled('resourceallocations');
        
        //  0 (none), 1 (view), 2 (create), 3 (edit), 4 (full).
        var customer = context.getSetting('PERMISSION', 'LIST_CUSTJOB') || 0;
        var project = context.getSetting('PERMISSION', 'LIST_JOB') || 0;
        var serviceItem = context.getSetting('PERMISSION', 'LIST_ITEM') || 0;
        var employees = context.getSetting('PERMISSION', 'LIST_EMPLOYEE') || 0;
        var vendor = context.getSetting('PERMISSION', 'LIST_VENDOR') || 0;
        
        var workCalendar = context.getSetting('PERMISSION', 'LIST_WORKCALENDAR') || 0;
        var projectTask = context.getSetting('PERMISSION', 'LIST_PROJECTTASK') || 0;
        var trackTime = context.getSetting('PERMISSION', 'TRAN_TIMEBILL') || 0;
        var fileCabinet = context.getSetting('PERMISSION', 'LIST_FILECABINET') || 0;
        
        var projectTemplate = context.getSetting('PERMISSION', 'LIST_PROJECTTEMPLATE') || 0;
        var genericResource = context.getSetting('PERMISSION', 'LIST_GENERICRESOURCE') || 0;
        var resourceAlloc = context.getSetting('PERMISSION', 'LIST_RSRCALLOCATION') || 0;
        
        viewChart = advancedProjects
                    && customRecords
                    && clientScript
                    && serverScript
                    && (customer > 0)
                    && (project > 0)
                    && (serviceItem > 0)
                    && (employees > 0)
                    && (vendor > 0)
                    && (workCalendar > 0)
                    && (projectTask > 0)
                    && (trackTime > 0)
                    && (fileCabinet > 0)
                    
                    && (version >= 2014 ? (genericResource > 0) : true)
                    && (resourceAllocation ? (resourceAlloc > 0) : true)
                    ;
            
        editTask = projectTask >= 3;
        
        logger.debug('getRESTlet Parameters', 
            'advancedProjects   : ' + advancedProjects + '\r\n' 
          + 'customRecords      : ' + customRecords + '\r\n'
          + 'clientScript       : ' + clientScript + '\r\n'
          + 'serverScript       : ' + serverScript + '\r\n'
          + 'customer           : ' + customer + '\r\n'
          + 'project            : ' + project + '\r\n'
          + 'serviceItem        : ' + serviceItem + '\r\n'
          + 'employees          : ' + employees + '\r\n'
          + 'vendor             : ' + vendor + '\r\n'
          + 'workCalendar       : ' + workCalendar + '\r\n'
          + 'projectTask        : ' + projectTask + '\r\n'
          + 'trackTime          : ' + trackTime + '\r\n'
          + 'fileCabinet        : ' + fileCabinet + '\r\n'
          + 'version            : ' + version + '\r\n'
          + 'projectTemplate    : ' + projectTemplate + '\r\n'
          + 'genericResource    : ' + genericResource + '\r\n'
          + 'resourceAllocation : ' + resourceAllocation + '\r\n'
          + 'resourceAllocRec   : ' + resourceAlloc + '\r\n'
          + '************************' + '\r\n'
          + 'roleId        : ' + context.getRole() + '\r\n'
          + 'role          : ' + context.getRoleId() + '\r\n'
          + 'jsonInputData : ' + JSON.stringify(jsonInputData) + '\r\n'
          + 'Usage         : ' + nlapiGetContext().getRemainingUsage() + '\r\n'
        );
        
        jsonReturnData.success = true;
        jsonReturnData.message = 'Permissions list loaded';
        
        jsonReturnData.data = [];
        jsonReturnData.data.push({'name': 'viewChart', 'allowed' : viewChart});
        jsonReturnData.data.push({'name': 'editTask',  'allowed' : editTask});
        jsonReturnData.data.push({'name': 'advancedProjects',  'allowed' : advancedProjects});
        jsonReturnData.data.push({'name': 'customRecords',  'allowed' : customRecords});
        jsonReturnData.data.push({'name': 'clientScript',  'allowed' : clientScript});
        jsonReturnData.data.push({'name': 'serverScript',  'allowed' : serverScript});
    } 
    catch (ex) {
        var body_message = '';
        if (ex instanceof nlobjError){
            body_message = 'System Error: '+ex.getCode() + ': ' + ex.getDetails();
            logger.error(MSG_TITLE, body_message);
        }else {
            body_message = 'Unexpected Error: '+ex;
            logger.error(MSG_TITLE, body_message);
        }
        jsonReturnData = ptmServLib.getFailMessage (body_message);
    }
    
    if (isReplyInJSON == 'T') return jsonReturnData;
    else return JSON.stringify(jsonReturnData);
    
}
