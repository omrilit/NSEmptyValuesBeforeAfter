/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.FilterUE = new function FilterUE() {
    
    this.ueBeforeLoad = function(type, form, request) {
        if (form && request) {
            var prmFlag = request.getParameter('prm_rand');
            
            if (prmFlag) {
                var field = form.addField('custpage_prm_flag', 'checkbox');
                field.setDefaultValue('T');
                field.setDisplayType('hidden');

                this.setFieldDisplayTypes();
            }
        }
    };
    
    this.setFieldDisplayTypes = function() {
        var owner   = nlapiGetFieldValue('owner'),
            user    = nlapiGetContext().getUser(),
            display = owner == user ? 'normal' : 'disabled',
            fSubs   = nlapiGetContext().getFeature('subsidiaries'),
            fBClass = nlapiGetContext().getFeature('billingclasses');
            
        nlapiLogExecution('DEBUG', 'toggledSharedView');
        var allFields = [
            'name',
            'custrecord_prm_share_view',
            'custrecord_prm_filter_start_date_type',
            'custrecord_prm_filter_start_date',
            'custrecord_prm_filter_restype_employee',
            'custrecord_prm_filter_employee',
            'custrecord_prm_filter_restype_vendor',
            'custrecord_prm_filter_vendor',
            'custrecord_prm_filter_restype_generic',
            'custrecord_prm_filter_generic_resource',
            'custrecord_prm_filter_billing_class',
            'custrecord_prm_filter_customer',
            'custrecord_prm_filter_project',
            'custrecord_prm_filter_task'
        ];

        for (i in allFields) {
            nlapiGetField(allFields[i]).setDisplayType(display);
        }
        
        nlapiGetField('custrecord_prm_filter_subsidiary').setDisplayType(fSubs ? display : 'hidden');
        nlapiGetField('custrecord_prm_filter_sub_subsidiary').setDisplayType(fSubs ? display : 'hidden');
        nlapiGetField('custrecord_prm_filter_billing_class').setDisplayType(fBClass ? display : 'hidden');
        nlapiGetField('owner').setDisplayType(user == owner ? 'hidden' : 'inline');
    };
    
    this.ueAfterSubmit = function(type) {
        var prmFlag = nlapiGetFieldValue('custpage_prm_flag');
        
        if (prmFlag) {
            var recordId = type == 'create' || type == 'edit' ? nlapiGetRecordId() : null;
            
            nlapiSetRedirectURL('RECORD', nlapiGetRecordType(), recordId, true, {
                prm_event_type : type,
                l : 'T'
            });
        }
    };

    this.ueBeforeSubmit = function(type) {
        if (type == 'delete') {
            this.ueBeforeSubmitDelete();
        }
    };
    
    this.ueBeforeSubmitDelete = function() {
        var owner = nlapiGetFieldValue('owner'),
            user  = nlapiGetContext().getUser();
        
        if (owner && owner != user) {
            throw nlapiCreateError('PRM_UNABLE_TO_DELETE', 'Unable to delete View created by another user.', true);
        }
        
        return true;
    };
    
}