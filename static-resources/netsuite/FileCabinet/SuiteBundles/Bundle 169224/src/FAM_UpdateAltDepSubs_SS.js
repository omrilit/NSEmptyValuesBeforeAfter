/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var objContext = nlapiGetContext();
var  ncFAR_OW = (objContext.getSetting('FEATURE', 'SUBSIDIARIES') == 'T') ? true : false;

var USAGE_LIMIT = 100;

function updateAltDepSubs()
{
    nlapiLogExecution('DEBUG', 'SCRIPT STARTED', 'SCRIPT INITIAL START');
    if (ncFAR_OW) {
        //Get all Subsidiaries
        var arrSubs = [];
        var altMethodSubs = {};
        var res = nlapiSearchRecord('subsidiary', null, [new nlobjSearchFilter('isinactive',null,'is','F')]);
        if (res != null) {
            for (var i = 0; i < res.length; i++) {
                arrSubs.push(res[i].getId() + '');
            }
        }
    }
    //Set default values for dummy/initial Alt Methods
    var res = nlapiSearchRecord('customrecord_ncfar_altmethods',null);
    if (res != null) {
        for (var i=0; i<res.length; i++) {
            var rId = res[i].getId();
            var rec = nlapiLoadRecord('customrecord_ncfar_altmethods',rId);
            var changed = false;
            
            if (rec.getFieldValue('custrecord_altmethodconvention') == null) {
                rec.setFieldValue('custrecord_altmethodconvention',1);
                changed = true;
            }
            if (rec.getFieldValue('custrecord_altmethodlifetime') == null) {
                rec.setFieldValue('custrecord_altmethodlifetime',0);
                changed = true;
            }
            if (rec.getFieldValue('custrecord_altmethodfinancialyear') == null) {
                rec.setFieldValue('custrecord_altmethodfinancialyear',1);
                changed = true;
            }
            if (rec.getFieldValue('custrecord_altmethod_periodconvention') == null) {
                rec.setFieldValue('custrecord_altmethod_periodconvention',1);
                changed = true;
            }
            if (ncFAR_OW) {
                if (rec.getFieldValues('custrecord_altmethodsubsidiary') == null) {
                    rec.setFieldValues('custrecord_altmethodsubsidiary', arrSubs);
                    changed = true;
                    altMethodSubs['s'+rId] = arrSubs;
                } else {
                    altMethodSubs['s'+rId] = rec.getFieldValues('custrecord_altmethodsubsidiary');
                }
            }
            if (changed) {
                nlapiSubmitRecord(rec);
            }
        }
    }
    
    if (ncFAR_OW) {
        //Set values for Subsidiary in Default Alt Depr
        var rlength = 1;
        while (rlength > 0) {
            var res = nlapiSearchRecord('customrecord_ncfar_altdeprdef', null,
                            [new nlobjSearchFilter('custrecord_altdeprdef_subsidiary', null, 'anyof', '@NONE@')],
                            [new nlobjSearchColumn('custrecord_altdeprdef_altmethod')]);
            if (res == null) {
                rlength = -1;
            } else {
                rlength = res.length;
                for (var i=0; i<rlength; i++) {
                    var rec = res[i];
                    nlapiSubmitField('customrecord_ncfar_altdeprdef',rec.getId(),'custrecord_altdeprdef_subsidiary',
                                        altMethodSubs['s'+rec.getValue('custrecord_altdeprdef_altmethod')]);
                    if (objContext.getRemainingUsage() < USAGE_LIMIT) {
                        nlapiScheduleScript(objContext.getScriptId(), objContext.getDeploymentId());
                        return;
                    }
                }
            }
        }
        
        //Set values for Subsidiary in Proposal's Alt Depr
        var arrNewProp = getNewProposalIDs();
        if (arrNewProp != null) {
            var rlength = 1;
            while (rlength > 0) {
                var res = nlapiSearchRecord('customrecord_ncfar_altdepr_proposal', null,
                                [new nlobjSearchFilter('custrecord_propaltdepr_subsidiary', null, 'anyof', '@NONE@'),
                                 new nlobjSearchFilter('custrecord_propaltdepr_propid',null,'anyof',arrNewProp,null)],
                                [new nlobjSearchColumn('custrecord_propaltdepr_propid')]);
                if (res == null) {
                    rlength = -1;
                } else {
                    rlength = res.length;
                    for (var i=0; i<rlength; i++) {
                        var rec = res[i];
                        nlapiSubmitField('customrecord_ncfar_altdepr_proposal',
                                            rec.getId(),
                                            'custrecord_propaltdepr_subsidiary',
                                            nlapiLookupField('customrecord_ncfar_assetproposal',
                                                            rec.getValue('custrecord_propaltdepr_propid'),
                                                            'custrecord_propsubsidiary'
                                                            )
                                         );
                        if (objContext.getRemainingUsage() < USAGE_LIMIT) {
                            nlapiScheduleScript(objContext.getScriptId(), objContext.getDeploymentId());
                            return;
                        }
                    }
                }
            }
        }
    }
}


function getNewProposalIDs()
{
    var arrNewProp = null;
    
    var res = nlapiSearchRecord('customrecord_ncfar_assetproposal',null,
                                [new nlobjSearchFilter('custrecord_propstatus',null,'anyof',1,null)]);
    if (res!=null) {
        arrNewProp = [];
        for (var i=0; i<res.length; i++) {
            arrNewProp.push(res[i].getId());
        }
    }
    
    return arrNewProp;
}
