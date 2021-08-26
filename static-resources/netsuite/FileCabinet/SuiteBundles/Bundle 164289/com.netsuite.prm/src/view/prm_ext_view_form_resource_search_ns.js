/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 */

Ext4.define('PRM.Cmp.ResourceSearchNSForm', {
    extend : 'PRM.Cmp.NSForm',
    
    config : {
        urlType    : 'suitelet',
        identifier : { scriptId : 'customscript_prm_sl_resource_search_form', deployId : 'customdeploy_prm_sl_resource_search_form' },
        formName   : 'filterPopup',
        returnData : 'filter'
    },

    callbackFunction : function(me, eventType, recordId) {
        // no additional data needed from NetSuite
        me.applyToGrid(eventType);
    },
    
    applyToGrid : function(eventType) {
        // set lastUsedFilter in app settings so that filter.load listener selects the correct filter
//        PRM.App.Settings.lastUsedFilter = eventType == 'delete' ? 0 : this.record.id;
//        
//        if (eventType == 'edit') {
//            PRM.App.Settings.forceLoad = true;
//        }
//        
//        PRM.App.Stores.filter.load();
    }
});