/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 May 2013     pbtan
 * 2.00       30 Apr 2014     pbtan            remove old code
 *
 */

/*
 * skill category, level  
 * skills 
 * skill sets  
 *  
 * 10,000 units 
 */

/**
 * @param {Number} fromversion
 * @param {Number} toversion
 * @returns {Void}
 */
function beforeUninstall() {
    var MSG_TITLE = 'beforeUninstall';
    
    try {
        var backup = new psa_rss.bundleinstall();
        
        // TODO: prevent uninstall if this came from RA Feature. 
        
        backup.backupCustomRecord('category');
        backup.backupCustomRecord('skill');
        backup.backupCustomRecord('level');
        backup.backupCustomRecord('skillset');
    }
    catch(ex){
        var body_message = '';

        if (ex instanceof nlobjError){
            body_message = 'System Error: '+ex.getCode() + ': ' + ex.getDetails();
            nlapiLogExecution('ERROR', MSG_TITLE, body_message);
        }else {
            body_message = 'Unexpected Error: '+ex;
            nlapiLogExecution('ERROR', MSG_TITLE, body_message);
        }
    }
};
