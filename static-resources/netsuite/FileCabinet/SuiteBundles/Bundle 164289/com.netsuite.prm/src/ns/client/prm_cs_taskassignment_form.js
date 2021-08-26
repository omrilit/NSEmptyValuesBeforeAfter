/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 20 Sep 2016 jcera
 * 
 */

var psa_prm = psa_prm || {};

psa_prm.AssignmentFormCS = {

    Form : window.opener ? window.opener.PRM.App.Forms.taskAssignment : {},
            
    RsForm : window.opener ? window.opener.PRM.App.Forms.resourceSearchNS : {},

    Translation : window.opener ? window.opener.PRM.Translation : {},

    Ext : window.opener ? window.opener.Ext4 : {},

    onPageInit : function(type) {
        if ('create' == type) {

            window.onbeforeunload = null;

            if (!this.errorAlreadyCalled && this.Form.hasError()) {
                var error = this.Form.getErrorMsg();
                alert(this.Translation.getText(error));
                this.errorAlreadyCalled = true;
            }

            this.initResourceSearch();
            this.initProjectTaskLink();
        }
    },

    onValidateField : function(type, name, linenum) {
        var valid = this.Validator.validate(this.Form.getData(), name);
        return valid;
    },

    onFieldChange : function(type, name, linenum) {
        if ('project' == name && this.Form.getProjectId()) {
            window.location = this.Form.config.url + this.Form.constructURLParametersFromSelectedValue();
        }

        if ('resource' == name) {
            var projectResource = ProjectResourceService.getProjectResource(this.Form.getResourceId());
            if (projectResource) {
                this.Form.setBillingClass(projectResource.billingClass);
                this.Form.setUnitCost(projectResource.laborCost == '' ? '' : parseFloat(projectResource.laborCost));
            }

            if (this.Form.isEditMode()) {
                this.recalculateUnitPrice();
            }
        }

        if ('unitcost' === name) {
            var unitCost = this.Form.getUnitCost();
            var decimalPlace = unitCost.split('.')[1];
            if (decimalPlace) {
                if (decimalPlace.length > 2) {
                    this.Form.setUnitCost(Number(unitCost).toFixed(2));
                }
            }
        }

        if ('unitpercent' == name) {
            var unitPercent = this.Form.getUnitPercent();
            var decimalPlace = unitPercent.split('.')[1];
            if (decimalPlace) {
                if (decimalPlace.length > 2) {
                    this.Form.setUnitPercent(Number(unitPercent).toFixed(2));
                }
            }
        }

        if ('billingclass' == name || 'serviceitem' == name) {
            if (this.Form.isEditMode()) {
                this.recalculateUnitPrice();
            }
        }
    },

    onSave : function () {
        this.Form.beforeSave();
        return true;
    },
    
    initResourceSearch : function() {
        var e = Ext.select('#resource_fs > div');
        var resourceSearchButton = this.createResourceSearchButton();
        
        if (this.Form.isResourceDisabled()) {
            resourceSearchButton.style['display'] = 'none';
        }
        
        e.elements[0].appendChild(resourceSearchButton);
    },
    
    createResourceSearchButton : function() {
        var containerSpan = document.createElement('span');
        containerSpan.className = 'uir-field-widget';
        containerSpan.style.display = 'inline-block';
        containerSpan.style.position = 'absolute';
        
        var a = document.createElement('a');
        a.id = 'resource_search_btn';
        a.onclick = this.openResourceSearch;
        a.title = this.Translation.getText('TOOLTIP.RESOURCE_SEARCH');
        a.style = 'background-image: url(/images/icon_search_gray.png); background-position: 2px 2px !important; cursor: pointer; visibility: hidden !important; margin : 0 !important; border : none';
        
        containerSpan.onmouseover = function () {
            a.style = 'background-image: url(/images/icon_search_gray.png); background-position: 2px 2px !important; cursor: pointer; visibility: visible !important; margin : 0 !important; border : none';
        };
        containerSpan.onmouseout = function () {
            a.style = 'background-image: url(/images/icon_search_gray.png); background-position: 2px 2px !important; cursor: pointer; visibility: hidden !important; margin : 0 !important; border : none';
        };
        
        containerSpan.appendChild(a);
        
        return containerSpan;
    },

    openResourceSearch : function() {
        psa_prm.AssignmentFormCS.RsForm.openForm(null, '&is_task_assignment=T&project_id=' + nlapiGetFieldValue('project'));
    },
    
    initProjectTaskLink : function () {
        if (this.Form.getProjectTaskId()) {
            var e = Ext.select('#projecttask_fs > div');
            var link = this.createProjectTaskLink();
            e.elements[0].appendChild(link);
        }
    },
    
    createProjectTaskLink : function () {
        var containerSpan = document.createElement('span');
        containerSpan.className = 'uir-field-widget';
        containerSpan.style.display = 'inline-block';
        containerSpan.style.position = 'absolute';
        
        var a = document.createElement('a');
        a.id = 'projecttask_link';
        a.href = nlapiResolveURL('RECORD', 'projecttask', this.Form.getProjectTaskId());
        a.target = '_blank';
        a.title = this.Translation.getText('TOOLTIP.OPEN');
        a.style = 'background-image: url(/uirefresh/img/field/open.png); background-position: 2px 2px !important; cursor: pointer; visibility: hidden !important; margin : 0 !important; border : none';
        
        containerSpan.onmouseover = function () {
            a.style = 'background-image: url(/uirefresh/img/field/open.png); background-position: 2px 2px !important; cursor: pointer; visibility: visible !important; margin : 0 !important; border : none';
        };
        containerSpan.onmouseout = function () {
            a.style = 'background-image: url(/uirefresh/img/field/open.png); background-position: 2px 2px !important; cursor: pointer; visibility: hidden !important; margin : 0 !important; border : none';
        };
        
        containerSpan.appendChild(a);
        
        return containerSpan;
    },

    recalculateUnitPrice : function() {
        var _this = this;
        var unitPriceParam = this.Form.getUnitPriceParam();
        var url = nlapiResolveURL('SUITELET', 'customscript_prm_sl_taskassignment_form',
                'customdeploy_prm_sl_taskassignment_form');
        nlapiRequestURL(url, {
            'mode' : 'computeUnitPrice',
            'unitPriceParam' : JSON.stringify(unitPriceParam)
        }, null, function(response) {
            _this.Form.setUnitPrice(isNaN(parseInt(response.body)) ? '' : parseInt(response.body));
        });
    },

    Validator : {

        MAX_VALUE_ESTIMATED_WORK : 2080,
        MIN_VALUE_ESTIMATED_WORK : 0,
        MAX_VALUE_UNIT_PERCENT : 500,
        MIN_VALUE_UNIT_PERCENT : 5,
        MAX_VALUE_UNIT_COST : 10000000000000,

        Translation : window.opener ? window.opener.PRM.Translation : {},

        validateEstimatedWork : function(estimatedWork) {
            var valid = true;

            if (estimatedWork
                    && (estimatedWork < this.MIN_VALUE_ESTIMATED_WORK || estimatedWork > this.MAX_VALUE_ESTIMATED_WORK)) {
                valid = false;
                alert(this.Translation.getText('ALERT.INVALID_NUM_MUST_BE_BETWEEN_0_AND_2080'));
            }

            return valid;
        },

        validateUnitPercent : function(unitPercent) {
            var valid = true;

            if (unitPercent
                    && (unitPercent < this.MIN_VALUE_UNIT_PERCENT || unitPercent > this.MAX_VALUE_UNIT_PERCENT)) {
                valid = false;
                alert(this.Translation.getText('ALERT.INVALID_PERCENTAGE_MUST_BE_BETWEEN_5_AND_500'));
            }

            return valid;
        },

        validateUnitCost : function(unitCost, estimatedWork) {
            var valid = true;

            if (unitCost && ((unitCost * estimatedWork) >= this.MAX_VALUE_UNIT_COST)) {
                valid = false;
                alert(this.Translation.getText('ALERT.TOTAL_AMOUNT_IS_TOO_LARGE'));
            }

            return valid;
        },

        validate : function(data, name) {
            var isValid = true;
            switch (name) {
            case 'estimatedwork':
                isValid = this.validateEstimatedWork(data.estimatedWork);
                if (isValid && data.unitCost) {
                    isValid = this.validateUnitCost(data.unitCost, data.estimatedWork);
                }
                break;
            case 'unitpercent':
                isValid = this.validateUnitPercent(data.unitPercent);
                break;
            case 'unitcost':
                isValid = this.validateUnitCost(data.unitCost, data.estimatedWork);
                break;
            }

            return isValid;
        }
    }

};
