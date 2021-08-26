/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

FAM.AssetDepreciation_CS = new function () {
    this.messages = {};
    this.messageIds = {
        ALERT_SUBBOOK_MISMATCH : 'client_depr_subsbooksmismatch'
    };
    
    /**
     * pageInit event type of client scripts
    **/
    this.pageInit = function (type) {
        this.messages = FAM.Util_CS.fetchMessageObj(this.messageIds, 'assetdepreciation');
    };
    
    /**
     * saveRecord event type of client scripts
    **/
    this.saveRecord = function () {
        var subIds = nlapiGetFieldValues('custpage_filtermssubsid') || [],
            bookIds = nlapiGetFieldValues('custpage_accountingbook') || [];

        if (!this.compatibleSubsAndBooks(subIds, bookIds)) {
            alert(this.messages.ALERT_SUBBOOK_MISMATCH);
            return false;
        }
        
        return true;
    };
    
    /**
     * Checks compatibility of subsidiaries and  accounting books selected
     *
     * Parameters:
     *     subIds {number[]} - internal ids of the selected subsidiaries
     *     bookIds {number[]} - internal ids of the selected accounting books
     * Returns:
     *     true {boolean} - at least 1 accounting book is associated to 1 subsidiary
     *     false {boolean} - no accounting books are associated to the subsidiaries
    **/
    this.compatibleSubsAndBooks = function (subIds, bookIds) {
        if (!FAM.Context.blnOneWorld || !FAM.Context.blnMultiBook || subIds.length === 0 ||
            bookIds.length === 0 || bookIds.indexOf(FAM.Util_Shared.getPrimaryBookId()) !== -1) {
        		return true;
        }
        
        var filters = [
           	    new nlobjSearchFilter('subsidiary', null, 'anyof', subIds),
	            new nlobjSearchFilter('internalid', null, 'anyof', bookIds)
	        ];
        if (nlapiSearchRecord('accountingbook', null, filters)) {
            return true;
        }
        return false;
    };
    
    /**
     * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
     * @appliedtorecord recordType
     * 
     * @param {String} type Sublist internal id
     * @param {String} name Field internal id
     * @param {Number} linenum Optional line item number, starts from 1
     * @returns {Void}
     */
    this.fieldChanged = function (type, name, linenum) {
    	
        var isFollowAcctngPeriod = FAM.SystemSetup.getSetting('isFollowAcctngPeriod');
        
    	if(name=='custpage_deprperiod' && isFollowAcctngPeriod=='T') {
    		
    		var deprDate = nlapiGetFieldValue(name);
    		var res = FAM.Util_Shared.getAccountingPeriodByDate(deprDate);
			var periodName = '';
			// In case no valid period encloses the date selected,
			// BGP will still continue up to the date selected. 
			var periodEndDate = deprDate;
			
    		if(res) {
    			periodName = res.periodname;
    			periodEndDate = res.enddate;
    		}
    		
    		// Posting Period
    		// can be blank if no valid accounting period is found
        	nlapiSetFieldValue('custpage_postperiod', periodName);
        	
        	// Hidden field for end date to be passed to BGP
        	nlapiSetFieldValue('custpage_postperiod_enddate', periodEndDate);	
    	}
        
    };
};
