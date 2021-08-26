/**
 * © 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define([
    '../const/fam_const_customlist',
    '../util/fam_util_process',
    '../util/fam_util_systemsetup'
], function (constList, utilProcess, utilSysSetup) {
    var module = {};

    module.triggerProcess = function() {
        var procId = null;
        
        try {
            if (utilSysSetup.getSetting('precompute')) {
            	procId = utilProcess.Record.create({
                    procId: 'precomputeMigration'
                });
            }
        } catch(ex) {
            log.error('Trigger precompute migration exception', ex);
        }
        
        return procId;
    };
    
    return module;
});