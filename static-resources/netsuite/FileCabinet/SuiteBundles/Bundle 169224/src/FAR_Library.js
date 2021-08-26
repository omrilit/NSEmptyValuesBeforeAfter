/**
 * � 2015 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

 /**
  * DEPRECATED!
 **/
 var Library = {

    Objects: {
		isUndefinedNullOrEmpty: function( value ) {
            return ( !value || value == null || value == '');
        },
        /* IndexOfArray - Helper function: returns the first index position of a value in an Array.
         * Otherwise it returns -1. */
        IndexOfArray: function(array, val) {
        	for(var i=0; array != null && i < array.length; i++) {
        		if(val == array[i]) {
        			return i;
        		}
        	}
        	return -1;
        },
        SplitList: function(stList) {
            if (stList) {
                stList = stList.split(',');
            } else {
                stList = new Array();
            }
            return stList;
        }
    },

    Context: {
    	IsFeatureEnabled: function( name ) {
    		return nlapiGetContext().getFeature( name );
	    }
    },
    
    Records: {

    	GetChildrenOfSubsid: function (subid) {
    		var pSubsidName = nlapiLookupField('subsidiary', subid, 'name');
    		var childSubsids = [];

    		var sfNotElim = new nlobjSearchFilter('iselimination',null,'is','F',null);
    		var sfNotInactive = new nlobjSearchFilter('isinactive',null,'is','F',null);
    		var sfArray = [sfNotElim, sfNotInactive];

    		var srSubsids = nlapiSearchRecord('subsidiary',null,sfArray,[new nlobjSearchColumn('name')]);
    		for ( var i = 0; srSubsids != null && i < srSubsids.length; i++ )
    		{
    			var l_SubsidId = srSubsids[i].getId();
    			if( l_SubsidId == subid) continue;

    			var l_SubsidName = srSubsids[i].getValue('name');
    			if(l_SubsidName.indexOf(pSubsidName) != -1)
    				childSubsids[childSubsids.length] = l_SubsidId;

    		}
    		return childSubsids;
    	},
		GetSubsidiaryChildren: function (subId, subsidiary) {	
			var subsidiaryChildren = [];
			
			for (var key in subsidiary) {
				if ((key != subId) && (subsidiary[key].indexOf(subsidiary[subId]) != -1)) {
					subsidiaryChildren.push(key);
				}
			}
			
			return subsidiaryChildren;
		}
    }
    
};