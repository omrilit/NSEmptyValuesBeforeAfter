/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.AllocFormCS = new function AllocFormCS() {
    var that = this;
    this.clientInit = function(type) {
        that._clientInit(type, window.opener);
    };
    
    this._clientInit = function(type, opener) {
        this.prm = opener && opener.PRM ? opener.PRM : null;

        if (this.prm) {
            this.ext = opener.Ext4;
            this.log = opener.console.log;
            this.raForm = this.prm.App.Forms.allocationNS;
            this.rsForm = this.prm.App.Forms.resourceSearchNS;
            
            this.confirmEvent();
            this.initResourceSearch();
            this.cacheFields();
        }
    };
    
    this.confirmEvent = function() {
        var eventType = getParameter('prm_event_type'),
            recordId  = getParameter('id');
        
        if (eventType) {
            alert(this.prm.Translation.getText('ALERT.ALLOCATION_SUCCESSFUL_' + eventType.toUpperCase()));
            this.raForm.triggerCallback(eventType, recordId);
            this.raForm.closeForm();
        }
    };
    
    this.clientSaveRecord = function() {
        if (this.prm) {
            return this.isValid();
        }
        
        return true;
    };
    
    this.requestValidaton = function(params) {
        var scriptURL       = nlapiResolveURL('SUITELET', 'customscript_prm_sl_alloc_validation', 'customdeploy_prm_sl_alloc_validation'),
            paramEncodedURL = this.ext.urlAppend(scriptURL, this.ext.urlEncode(params)),
            response        = nlapiRequestURL(paramEncodedURL);
        
        return response;
    };
    
    this.setRecurrenceParameters = function(params) {
        params.frequency = nlapiGetFieldValue('_frequency') || 'NONE';
        params.seriesStartDate = nlapiGetFieldValue('seriesstartdate');
        params.seriesEndDate = nlapiGetFieldValue('endbydate');
        
        switch(params.frequency) {
            case 'NONE':
                break;
            case 'DAY':
                var mode = nlapiGetFieldValue('_day_mode');
                if (mode == 'EVERY') {
                    params.period = nlapiGetFieldValue('_day_period');
                } else if (mode == 'WEEKDAY') {
                    params.frequency = 'WEEK';
                    params.period = 1;
                    params.dayOfWeekMask = 'FTTTTTF'; // take note that core does not respect work calendars
                }
                break;
            case 'WEEK':
                params.period = nlapiGetFieldValue('_week_period');
                params.dayOfWeekMask = [
                    nlapiGetFieldValue('_week_dow_1'),
                    nlapiGetFieldValue('_week_dow_2'),
                    nlapiGetFieldValue('_week_dow_3'),
                    nlapiGetFieldValue('_week_dow_4'),
                    nlapiGetFieldValue('_week_dow_5'),
                    nlapiGetFieldValue('_week_dow_6'),
                    nlapiGetFieldValue('_week_dow_7'),
                ].join('');
                break;
            case 'MONTH':
                var mode = nlapiGetFieldValue('_month_mode');
                if (mode == 'DOM') {
                    params.period = nlapiGetFieldValue('_month_dom_period');
                } else if (mode == 'DOWIM') {
                    params.period = nlapiGetFieldValue('_month_dowim_period');
                    params.dayOfWeek = nlapiGetFieldValue('_month_dow');
                    params.dayOfWeekInMonth = nlapiGetFieldValue('_month_dowim');
                }
                break;
            case 'YEAR':
                var mode = nlapiGetFieldValue('_year_mode');
                params.period = 1;
                if (mode == 'DOM') {
                    // do nothing
                } else if (mode == 'DOWIM') {
                    params.dayOfWeek = nlapiGetFieldValue('_year_dow');
                    params.dayOfWeekInMonth = nlapiGetFieldValue('_year_dowim');
                }
                break;
        }
    };
    
    this.isValid = function() {
        var params = {
            id          : getParameter('id'),
            resource    : nlapiGetFieldValue('allocationresource'),
            project     : nlapiGetFieldValue('project'),
            projectTask : nlapiGetFieldValue('projecttask'),
            startDate   : nlapiGetFieldValue('startdate'),
            endDate     : nlapiGetFieldValue('enddate')
        }
        
        this.setRecurrenceParameters(params);
        
        if (params.resource && params.project && params.startDate && params.endDate) {
            var response = this.requestValidaton(params);
            
            if (response.code == 200) {
                var returnData = JSON.parse(response.body);
                
                switch (returnData.isValid) {
                    case 'hasOverlaps':
                        alert(this.prm.Translation.getText('ALERT.ALLOCATION_ERROR_OVERLAP'));
                        return false;
                    case 'hasNoWorkHours':
                        alert(this.prm.Translation.getText('ALERT.ALLOCATION_ERROR_NON_WORKING'));
                        return false;
                }
            } else {
                return false;
            }
        }
        
        return true;
    };
    
    this.createResourceSearchButton = function() {
        var rsLink = this.ext.Element(document.createElement('a'));
        
        rsLink.onclick = this.openResourceSearch;
        rsLink.id = 'resource_search_btn';
        rsLink.title = this.prm.Translation.getText('TOOLTIP.RESOURCE_SEARCH');
        rsLink.style = 'background-image: url(/images/icon_search_gray.png); background-position: 2px 2px !important; cursor: pointer;'; /* keep until ns creates a uir-field-widget search button */
        
        return rsLink;
    };
    
    this.initResourceSearch = function() {
        var span = Ext.select('#allocationresource_fs > span.uir-field-widget');
        
        if (span.elements.length) {
            var parent = span.elements[0];
            
            parent.appendChild(this.createResourceSearchButton());
        }
    };
    
    this.openResourceSearch = function() {
        psa_prm.AllocFormCS.rsForm.openForm();
    };
    
    this.clientValidateField = function(type, name) {
        if (this.prm) {
            switch (name) {
                case 'allocationresource':
                case 'project':
                    if (nlapiGetFieldValue('custpage_prm_reallocate_flag') == 'F') {
                        alert(this.ext.String.format(this.prm.Translation.getText('ALERT.REALLOCATION_ERROR_TASK_ASSIGNMENT'), this.prm.Translation.getText('FIELD.' + (name == 'project' ? 'PROJECT' : 'RESOURCE')), this.cache.allocationresource, this.cache.project));
                        return false;
                    }
                    break;
            }
        }
        
        return true;
    };
    
    this.cacheFields = function() {
        this.cache = {
            allocationresource : nlapiGetFieldText('allocationresource'),
            project : nlapiGetFieldText('project')
        };
    };
};