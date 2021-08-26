/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 */

Ext4.define('PRM.App.Constants', {
    singleton : true,
    DAY_IN_MILLI : 86400000,
    LIST_URL : nlapiResolveURL('SUITELET', 'customscript_prm_sl_list_data', 'customdeploy_prm_sl_list_data'),
    MAX_LIST_SIZE : 4000,
    PENDING_APPROVAL : 4,
    REJECTED_APPROVAL : 6,
    SEPARATOR_ID : '~',
    SEPARATOR_NAME : ' : ',
    TIMEBILL_TYPE : {
    	ACTUAL : 'A',
    	ALLOCATED : 'B',
    	PLANNED : 'P'
    }
});