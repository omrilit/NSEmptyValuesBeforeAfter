/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.TaskAssignmentForm', {

    config : {
        url : nlapiResolveURL('SUITELET', 'customscript_prm_sl_taskassignment_form',
                'customdeploy_prm_sl_taskassignment_form'),
        formName : 'Task Assignment',
        width : 500,
        height : 550,
        resizable : true,
        scrollable : true,
        editMode : false,
        fieldIds : {
            project : 'project',
            projectTask : 'projecttask',
            resource : 'resource',
            startDate : 'startdate',
            endDate : 'enddate',
            unitPercent : 'unitpercent',
            billingClass : 'billingclass',
            unitCost : 'unitcost',
            unitPrice : 'unitprice',
            estimatedWork : 'estimatedwork',
            actualWork : 'actualwork',
            serviceItem : 'serviceitem',
            isDelete : 'isdelete',
            previousResource : 'previousresource',
            gridId : 'gridid',
            record : 'record',
            errorMsg : 'errormsgcontainer'
        }
    },

    mixins : {
        observable : 'Ext4.util.Observable'
    },

    constructor : function(config) {
        this.addEvents('afterSave', 'beforeSave');
        this.mixins.observable.constructor.call(this, config);

        this.initConfig(config);
        this.initWindowProps();
    },

    initWindowProps : function(editMode) {
        this.windowProps = [ 'width=' + this.config.width, 'height=' + (editMode ? (this.config.height + 220) : this.config.height),
                'left=' + ((window.innerWidth / 2) - (this.config.width / 2)),
                'top=' + ((window.innerHeight / 2) - ((editMode ? (this.config.height + 220) : this.config.height) / 2)),
                'resizable=' + (this.config.resizable ? 'yes' : 'no'),
                'scrollbars=' + (this.config.scrollable ? 'yes' : 'no') ].join(',');
    },

    open : function (editMode, record) {
        var additionalUrlParams = '';
        if (editMode) {
            this.config.editMode = editMode;
            if (record) {
                additionalUrlParams += '&record=' + encodeURIComponent(record);
            }
            this.initWindowProps(editMode);
        } else {
            if (record) {
                additionalUrlParams += '&project=' + record.project;
                if (record.projectTask) {
                    additionalUrlParams += '&projecttask=' + record.projectTask;
                }
                if (record.resource) {
                    additionalUrlParams += '&resource=' + record.resource;
                }
            }
        }
        additionalUrlParams += '&timestamp=' + Date.now(); 
        this.form = window.open(this.config.url + additionalUrlParams, this.config.formName, this.windowProps);
        return this.form;
    },
    
    openAsNew : function() {
        this.config.editMode = false;
        return this.open();
    },

    openAsEdit : function (taskAssignmentRecord) {
        return this.open(true, taskAssignmentRecord);
    },
    
    reset : function() {
        this.form.window.location = this.config.url;
    },

    getErrorMsg : function() {
        return this.form.nlapiGetFieldValue(this.config.fieldIds.errorMsg);
    },

    hasError : function() {
        return this.getErrorMsg() ? true : false;
    },

    getFieldValue : function(fieldId) {
        return this.form.nlapiGetFieldValue(fieldId);
    },

    setFieldValue : function(fieldId, value) {
        this.form.nlapiSetFieldValue(fieldId, value, false);
    },

    getProjectId : function() {
        return this.getFieldValue(this.config.fieldIds.project);
    },

    getProjectTaskId : function() {
        return this.getFieldValue(this.config.fieldIds.projectTask);
    },

    getResourceId : function () {
        return this.getFieldValue(this.config.fieldIds.resource);
    },
    
    getEstimatedWork : function() {
        return this.getFieldValue(this.config.fieldIds.estimatedWork);
    },

    setEstimatedWork : function(value) {
        return this.setFieldValue(this.config.fieldIds.estimatedWork, value);
    },

    setBillingClass : function (value) {
        return this.setFieldValue(this.config.fieldIds.billingClass, value);
    },
    
    getUnitCost : function() {
        return this.getFieldValue(this.config.fieldIds.unitCost);
    },

    setUnitCost : function(value) {
        this.setFieldValue(this.config.fieldIds.unitCost, value);
    },

    getUnitPercent : function() {
        return this.getFieldValue(this.config.fieldIds.unitPercent);
    },

    setUnitPercent : function(value) {
        this.setFieldValue(this.config.fieldIds.unitPercent, value);
    },
    
    setUnitPrice : function (value) {
        this.setFieldValue(this.config.fieldIds.unitPrice, value);
    },

    setIsDelete : function (value) {
        this.setFieldValue(this.config.fieldIds.isDelete, value);
    },
    
    isDelete : function () {
        return parseInt(this.getFieldValue(this.config.fieldIds.isDelete)) ? true : false;
    },
    
    isEditMode : function () {
        return this.config.editMode;
    },
    
    enableProjectTask : function() {
        this.form.nlapiDisableField(this.config.fieldIds.projectTask, false);
    },
    
    isResourceDisabled : function () {
        return this.form.nlapiGetFieldDisabled(this.config.fieldIds.resource);
    },

    submit : function () {
        this.form.jQuery('#submitter').click();
    },
    
    getData : function() {
        var data = {};
        Object.keys(this.getConfig('fieldIds')).forEach(function(key) {
            data[key] = this.getFieldValue(this.config.fieldIds[key]);
        }, this);
        return data;
    },

    getUnitPriceParam : function () {
        return {
          projectTaskId : this.getFieldValue(this.config.fieldIds.projectTask),
          previousResourceId : this.getFieldValue(this.config.fieldIds.previousResource),
          resourceId : this.getFieldValue(this.config.fieldIds.resource),
          unitCost : parseInt(this.getFieldValue(this.config.fieldIds.unitCost)),
          billingClassId : this.getFieldValue(this.config.fieldIds.billingClass),
          serviceItemId : this.getFieldValue(this.config.fieldIds.serviceItem)
        };
    },
    
    log : function (title, obj) {
        console.log(title, obj);
    },
    
    alert : function (msg) {
        alert(msg);
    },
    
    constructURLParametersFromSelectedValue : function() {
        var urlParam = '';
        var _this = this;

        var selectedValue;
        Object.keys(this.getConfig('fieldIds')).forEach(function(key) {
            selectedValue = _this.getFieldValue(_this.config.fieldIds[key]);
            if (selectedValue) {
                urlParam += ('&' + _this.config.fieldIds[key] + '=' + selectedValue);
            }
        });
        return urlParam;
    },

    afterSave : function(taskAssignmentData) {
        this.fireEvent('afterSave', taskAssignmentData);
    },
    
    beforeSave : function () {
        this.fireEvent('beforeSave');
    }
});