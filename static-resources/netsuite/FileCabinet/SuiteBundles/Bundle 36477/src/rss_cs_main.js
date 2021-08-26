/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Mar 2013     rwong            Initial version.
 * 2.00       13 Mar 2013     pbtan            Updated parameter name
 * 3.00       26 Mar 2013     pbtan            Added validate field function, added cs library, moved upload and validate field function to library
 * 4.00       02 Apr 2013     pbtan            Added save record function check for years of experience field.
 * 5.00       05 Apr 2013     pbtan            Fix for upload button not working in employee view mode.
 * 6.00       30 Apr 2013     rwong            Change resume tab to portfolio tab.
 * 7.00		  15 May 2013	  pbtan			   Added handling for Vendor implementation
 * 8.00		  01 Jun 2013	  pbtan			   Refresh portfolio sublist only instead of whole page.
 * 9.00       06 May 2014     pbtan            Translated the window title.
 * 10.00      26 Jun 2014     pbtan            Used library method to remove redundant code.
 * 
 */

var isServerLog = false;

function upload(resourceId, recordType) {
    try {
        psa_rss.clientlibrary.upload(resourceId, recordType); 
    }
    catch(ex){
        var subject_message = 'upload';
        var body_message = '';

        if (ex instanceof nlobjError){
            body_message = 'System Error: '+ex.getCode() + ': ' + ex.getDetails();
            nlapiLogExecution('ERROR', subject_message, body_message);
        }else {
            body_message = 'Unexpected Error: '+ex;
            nlapiLogExecution('ERROR', subject_message, body_message);
        }
    }
    
};

/**
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function rssEmployeeValidateField(type, name, linenum){
    return psa_rss.clientlibrary.rssEmployeeValidateField(type, name, linenum);
};


/**
 * @returns {Boolean} True to continue save, false to abort save
 */
function rssEmployeeSaveRecord(){
    var name = 'custpage_rss_yoe';
    return psa_rss.clientlibrary.rssEmployeeValidateField(null, name);
}

function refreshPortfolio(){
	nlapiRefreshLineItems('custpage_portfolio_sublist');
}