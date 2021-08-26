/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 */

Ext4.define('PRM.Cmp.FilterNSForm', {
    extend : 'PRM.Cmp.NSForm',
    
    config : {
        urlType    : 'record',
        identifier : 'customrecord_prm_filters',
        formName   : 'filterPopup',
        returnData : 'filter'
    },

    callbackFunction : function(me, eventType, recordId) {
        // no additional data needed from NetSuite
        me.applyToGrid(eventType);
    },
    
    applyToGrid : function(eventType) {
        // set lastUsedFilter in app settings so that filter.load listener selects the correct filter
        PRM.App.Settings.lastUsedFilter = eventType == 'delete' ? 0 : this.record.id;
        
        if (eventType == 'edit') {
            PRM.App.Settings.forceLoad = true;
        }
        
        PRM.App.Stores.filter.load();
    }
});