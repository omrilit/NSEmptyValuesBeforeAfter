/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.FilterFormCS = new function FilterFormCS() {
    
    this.clientInit = function(type) {
        this._clientInit(type, window.opener);
    };
    
    this._clientInit = function(type, opener) {
        
        this.prm = opener && opener.PRM ? opener.PRM : null;
        
        if (this.prm) {
            this.ext = opener.Ext4;
            this.log = opener.console.log;
            this.extForm = this.prm.App.Forms.filterNS;
            this.oldVals = {};
            
            this.hideComponents();
            
            this.confirmEvent();
            
            if (type == 'create') {
                this.setDefaultDate(new Date(), opener);
            } else {
                this.initResourceMultiselects();
            }
        }
    };
    
    this.hideComponents = function() {
        var selectors = [
            '.uir-button-menu-divider',
            '#tbl_customize',
            '#tbl_secondarycustomize',
            '#tbl_changeid',
            '#tbl_secondarychangeid'
        ];
        
        if (!this.isOwnedByCurrentUser()) {
            selectors = selectors.concat([
                '#tbl_submitter',
                '#tbl_secondarysubmitter',
                '#tbl_resetter',
                '#tbl_secondaryresetter',
                '#tbl_delete',
                '#tbl_secondarydelete'
            ]);
        }
        
        var collection = Ext.select(selectors.join(','));
        for (j in collection.elements) {
            Ext.get(collection.elements[j]).setDisplayed(false);
        }
    };
    
    this.confirmEvent = function() {
        var eventType = getParameter('prm_event_type'),
            recordId  = getParameter('id');
        
        if (eventType) {
            alert(this.prm.Translation.getText('ALERT.VIEW_SUCCESSFUL_' + eventType.toUpperCase()));
            this.extForm.triggerCallback(eventType, recordId);
            this.extForm.closeForm();
        }
    };
    
    this.clientSaveRecord = function() {
        if (this.prm) {
            return this.isValid();
        }
        
        return true;
    };
    
    this.addYearToDate = function(date, year) {
        date.setFullYear(date.getFullYear() + year);
    };
    
    this.setDefaultDate = function(now, opener) {
        this.addYearToDate(now, -1);
        
        nlapiSetFieldValue('custrecord_prm_filter_start_date', opener.Ext4.Date.format(now, opener.nsDateFormat));
    };
    
    this.isValid = function() {
        var params = {
            id       : getParameter('id'),
            name     : nlapiGetFieldValue('name'),
            employee : nlapiGetFieldValue('custrecord_prm_filter_restype_employee'),
            vendor   : nlapiGetFieldValue('custrecord_prm_filter_restype_vendor'),
            generic  : nlapiGetFieldValue('custrecord_prm_filter_restype_generic')
        };
        
        if (params.name) {
            if (this.prm.App.Stores.filter.isNameDuplicate(params.name, params.id)) {
                alert(this.prm.Translation.getText('ALERT.FILTER_NAME_EXISTS_ERROR'));
                return false;
            }
            
            if (params.employee == 'F' && params.vendor == 'F' && params.generic == 'F') {
                alert(this.prm.Translation.getText('ALERT.FILTER_AT_LEAST_ONE_RESOURCE_TYPE'));
                return false;
            }
        }
        
        return true;
    };
    
    this.RESOURCE_FIELD_IDS = {
        CHECKBOX : {
            EMPLOYEE : 'custrecord_prm_filter_restype_employee',
            VENDOR : 'custrecord_prm_filter_restype_vendor',
            GENERIC_RESOURCE : 'custrecord_prm_filter_restype_generic'
        },
        MULTISELECT : {
            EMPLOYEE : 'custrecord_prm_filter_employee',
            VENDOR : 'custrecord_prm_filter_vendor',
            GENERIC_RESOURCE : 'custrecord_prm_filter_generic_resource'
        }
    };

    this.isOwnedByCurrentUser = function() {
        if (!this.hasOwnProperty('isOwner')) {
            var currentUser = nlapiGetContext().getUser(),
                viewOwner   = nlapiGetFieldValue('owner');
            
            this.isOwner = currentUser == viewOwner;
        }
        
        return this.isOwner;
    }
    
    this.initResourceMultiselects = function() {
        if (this.isOwnedByCurrentUser()) {
            for (resType in this.RESOURCE_FIELD_IDS.CHECKBOX) {
                this.clientFieldChanged(null, this.RESOURCE_FIELD_IDS.CHECKBOX[resType]);
            }
        }
    };
    
    this.clientFieldChanged = function(type, name) {
        if (this.prm) {
            var value = nlapiGetFieldValue(name);
            switch (name) {
                case this.RESOURCE_FIELD_IDS.CHECKBOX.EMPLOYEE:
                    nlapiSetFieldDisabled(this.RESOURCE_FIELD_IDS.MULTISELECT.EMPLOYEE, value == 'F');
                    this.toggleResourceSelection(value, this.RESOURCE_FIELD_IDS.MULTISELECT.EMPLOYEE);
                    break;
                case this.RESOURCE_FIELD_IDS.CHECKBOX.VENDOR:
                    nlapiSetFieldDisabled(this.RESOURCE_FIELD_IDS.MULTISELECT.VENDOR, value == 'F');
                    this.toggleResourceSelection(value, this.RESOURCE_FIELD_IDS.MULTISELECT.VENDOR);
                    break;
                case this.RESOURCE_FIELD_IDS.CHECKBOX.GENERIC_RESOURCE:
                    nlapiSetFieldDisabled(this.RESOURCE_FIELD_IDS.MULTISELECT.GENERIC_RESOURCE, value == 'F');
                    this.toggleResourceSelection(value, this.RESOURCE_FIELD_IDS.MULTISELECT.GENERIC_RESOURCE);
                    break;
            }
        }
    };
    
    this.toggleResourceSelection = function(checkbox, field) {
        if (checkbox == 'F') {
            this.oldVals[field] = nlapiGetFieldValue(field);
            nlapiSetFieldValue(field);
        } else {
            if (this.oldVals.hasOwnProperty(field)) {
                nlapiSetFieldValue(field, this.oldVals[field]);
                delete this.oldVals[field];
            }
        }
    };
    
};