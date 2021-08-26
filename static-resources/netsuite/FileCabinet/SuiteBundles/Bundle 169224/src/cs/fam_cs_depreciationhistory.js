/**
 * 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 * @NScriptId _fam_cs_depreciationhistory
 * @NScriptType ClientScript
 * @NApiVersion 2.x
 * 
 */

define([],

function() {
    var module = {};

    /**
     * Function to be executed when field is changed
     *
     * @param {Object} scriptContext
     */
    module.fieldChanged = function(context) {
        setWindowChanged(window, false);
        main_form.submit();
    };

    return module;
});