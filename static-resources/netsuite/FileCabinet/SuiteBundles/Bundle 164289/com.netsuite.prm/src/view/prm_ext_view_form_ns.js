/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/*
 * When extending the class, the following should be implemented in the new class:
 * 1. config
 * 2. callbackFunction
 * 3. applyToGrid
 * 
 * See PRM.Cmp.AllocationNSForm for an example.
 */

Ext4.define('PRM.Cmp.NSForm', {
    config : {
        width      : 1000,
        height     : 1000,
        resizable  : true,
        scrollable : true,
        /*
         * override the ff
         */
        urlType    : null,
        identifier : null,
        formName   : null,
        returnData : null,
        callback   : { script : null, deploy : null }
    },
    
    constructor : function(config) {
        this.initConfig(config);
        
        this.initURL();
        this.initWindowProps();
        this.initCallbackURL();
    },
    
    initURL : function() {
        if (this.config.urlType == 'record') {
            this.url = nlapiResolveURL(this.config.urlType, this.config.identifier);
        } else if (this.config.urlType == 'suitelet') {
            this.url = nlapiResolveURL(this.config.urlType, this.config.identifier.scriptId, this.config.identifier.deployId);
        }
        
        this.url += (this.url.indexOf('?') == -1 ? '?' : '&') + 'l=T&prm_rand=' + Ext4.Number.randomInt(0, Date.now());
    },
    
    initWindowProps : function() {
        this.windowProps = [
            'width=' + this.config.width,
            'height=' + this.config.height,
            'resizable=' + (this.config.resizable ? 'yes' : 'no'),
            'scrollbars=' + (this.config.scrollable ? 'yes' : 'no')
        ].join(',');
    },
    
    initCallbackURL : function() {
        if (this.config.callback.script && this.config.callback.deploy) {
            this.callbackURL = nlapiResolveURL('SUITELET', this.config.callback.script, this.config.callback.deploy);
        }
    },
    
    openForm : function(record, additionalUrlParam) {
        // always reset this.record when opening a form, before applying new record values
        this.record = {};
        Ext4.apply(this.record, record);
        
        this.form = nlOpenWindow(this.url + (record && record.id ? '&e=T&id=' + record.id : '') + (additionalUrlParam || ''), this.config.formName, this.windowProps);
    },
    
    closeForm : function() {
        if (this.form.window) {
            this.form.close();
        }
    },
    
    triggerCallback : function(eventType, recordId) {
        var me = this;

        Ext4.applyIf(me.record, {
            id : recordId
        });
        
        Ext4.util.TaskManager.start({
            run : function() {
                me.callbackFunction(me, eventType, recordId);
            },
            interval : 1,
            repeat : 1
        });
    },
    
    getCallbackURL : function() {
        return Ext4.urlAppend(this.callbackURL, Ext4.urlEncode(this.record));
    },
    
    /*
     * override this; update this.record with values from NetSuite if needed (for instance, values of newly created or updated records)
     * always call me.applyToGrid(eventType);
     */
    callbackFunction : function(me, eventType, recordId) {
        console.log('ERROR: callbaskTask not implemented in subclass.');
    },
     
    /*
     * override this; retrieve information from this.record
     * be default, this.record will contain at least an 'id' attribute, and any other attributes passed through openForm
     */
    applyToGrid : function(eventType) {
        console.log('ERROR: applyToGrid not implemented in subclass.');
    }
});