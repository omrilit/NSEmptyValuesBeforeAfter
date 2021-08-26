/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm = psa_prm || {};

psa_prm.TaskAssignmentForm = function() {

    this.request;
    this.errorMsg;
    this.form;
    this.editMode;
    this.record;
    
    this.labels = {
        title : 'Task Assignment',
        project : 'Project',
        projectTask : 'Project Task',
        resource : 'Resource',
        startDate : 'Start Date',
        endDate : 'End Date',
        unitPercent : 'Unit Percent',
        billingClass : 'Billing Class',
        unitCost : 'Unit Cost',
        unitPrice : 'Unit Price',
        estimatedWork : 'Estimated Work',
        actualWork : 'Actual Work',
        serviceItem : 'Service Item',
        reset : 'Reset',
        cancel : 'Cancel',
        del : 'Delete'
    };
    
    this.helpTexts = {
        project : 'Select the project for this assignment.',
        projectTask : 'Select a task for this assignment. Tasks that are not completed, not a milestone, and not a parent task are available.',
        resource : 'Select a resource for this assignment. Only employees and vendors identified as project resources are available for task assignments. Check the Project Resource box on the employee or vendor record to identify a project resource. Also, if the Display All Resources for Project Task Assignment preference is checked on the record of the selected project, all active project resources are available. Otherwise, only active and allocated project resources are available for task assignments.',
        unitPercent : 'Enter the percentage of available work time this resource will commit to this task. The minimum valid value is 5 and the maximum is 500.',
        billingClass : 'If you use Per-Employee Billing Rates, select a billing class for this resource to apply to this project task. For more information about billing classes, read the help topic Project Billing Rates.',
        unitCost : 'Enter the cost for this resource to work on this task.',
        estimatedWork : 'Enter the amount of work time you expect this resource to spend on this task. The estimated work for the task must be specified in hours. Similarly service items to be used on the project task must be priced in hours. The minimum valid value for this field is 0 and the maximum is 2080.',
        serviceItem : "Select a service item for this resource's work on this task. Note: Adding a service item is optional. If you do not specify a service item, unit price, or assign a resource for a task on a Time and Materials project, then NetSuite displays a warning when you refresh the Schedule subtab of the project record. For Time and Materials projects, a task must have an assignee and a unit price to be billed on the sales order.",
        
        startDate : 'Start date of this task.',
        endDate : 'End date of this task.',
        unitPrice : 'Unit price for the selected resource. This may be sourced from the billing class of the selected resource and/or the selected service item for this task assignment.',
        actualWork : 'Actual work hours rendered by the resource for this task.'
    };

    this.setErrorMsg = function(errorMsg) {
        this.errorMsg = errorMsg;
        return this;
    };

    this.setRequest = function(request) {
        this.request = request;
        this.editMode = this.request.getParameter('record') ? true : false;
        if (this.editMode) {
            this.record = JSON.parse(this.request.getParameter('record'));
        }
        return this;
    };

    this.getProjectId = function () {
        if (this.editMode) {
            return this.record.id.split('~')[0];
        } 
        return this.request.getParameter('project');
    };
    
    this.getProjectTaskId = function () {
        if (this.editMode) {
            return this.record.id.split('~')[1];
        } 
        return this.request.getParameter('projecttask');
    };
    
    this.createForm = function() {
        this.form = nlapiCreateForm(this.labels.title, true);
        this.form.setScript('customscript_prm_cs_taskassignment_form');

        var fields = [ this.projectField, 
                       this.projectTaskField, 
                       this.resourceField, 
                       this.startDateField,
                       this.endDateField,
                       this.unitPercentField,
                       this.billingClassField, 
                       this.estimatedWorkField, 
                       this.unitCostField,
                       this.unitPriceField,
                       this.actualWorkField,
                       this.serviceItemField,
                       this.isDeleteField,
                       this.previousResourceField,
                       this.gridIdField,
                       this.recordField,
                       this.errorMsg ? this.errorMsgField : null ];

        this.addToForm(fields);
        
        this.form.addSubmitButton();
        this.form.addButton('reset', this.labels.reset, 'window.opener.PRM.App.Forms.taskAssignment.reset();');
        this.form.addButton('cancel', this.labels.cancel, 'window.close();');

        nlapiLogExecution('DEBUG', 'this.editMode', this.editMode);
        
        if (this.editMode) {
            var deleteButton = this.form.addButton('delete', this.labels.del, 'window.opener.PRM.App.Forms.taskAssignment.setIsDelete(1); window.opener.PRM.App.Forms.taskAssignment.submit();');
            if (this.record.hrsWorked && parseInt(this.record.hrsWorked) > 0) {
                deleteButton.setDisabled(true);
            }
        }
        
        return this.form;
    };
    
    this.addToForm = function(fieldCreationFn) {
        if (Array.isArray(fieldCreationFn)) {
            var _this = this;
            fieldCreationFn.forEach(function(fn) {
                if (fn) {
                    fn(_this);
                }
            });
        } else {
            fieldCreationFn(this);
        }
    };

    this.projectField = function(_this) {
        var field = _this.form.addField('project', 'select', _this.labels.project, 'job');
        field.setMandatory(true);
        field.setHelpText(_this.helpTexts.project);
        
        var projectId = _this.getProjectId();
        if (projectId) {
            _this.form.setFieldValues({
                project : projectId
            });
        }
        
        field.setLayoutType('normal', 'startcol');
        field.setDisplaySize(300);
        
        if (_this.editMode) {
            field.setDisplayType('disabled');
        }
    };

    this.projectTaskField = function(_this) {
        var field = _this.form.addField('projecttask', 'select', _this.labels.projectTask);
        field.setMandatory(true);
        field.addSelectOption('', '');
        field.setHelpText(_this.helpTexts.projectTask);
        
        var projectId = _this.getProjectId();
        if (projectId) {
            var ProjectTaskService = new PRM.Service.ProjectTaskService(psa_prm.serverlibrary);
            var projectTasks = ProjectTaskService.searchAllProjectTasksByProject(projectId);
            projectTasks.forEach(function(e) {
                field.addSelectOption(e.getId(), e.getValue("title"));
            });
            
            var projectTaskId = _this.getProjectTaskId();
            if (projectTaskId) {
                _this.form.setFieldValues({
                    projecttask : projectTaskId
                });
            }
        }
        
        if (!projectId || _this.editMode) {
            field.setDisplayType('disabled');
        }
    };

    this.resourceField = function(_this) {
        var field = _this.form.addField('resource', 'select', _this.labels.resource);
        field.setMandatory(true);
        field.setHelpText(_this.helpTexts.resource);
        
        if (!_this.editMode) {
            field.addSelectOption('', '');
        }

        var projectId = _this.getProjectId();
        if (projectId) {
            
            var projectService = new PRM.Service.ProjectService(psa_prm.serverlibrary);
            var showAllResources = projectService.projectAllowsAllResourcesForTasks(projectId);
            
            var resources = [];
            if (showAllResources) {
                resources = ProjectResourceService.getAllActiveResources();
            } else {
                resources = ProjectResourceService.getAllGenericResources();
                resources = resources.concat(projectService.getProjectResources(projectId));
            }
            
            resources.forEach(function(e) {
                field.addSelectOption(e.resourceId, e.resourceName);
            });
            
            var selectedResourceId = _this.request.getParameter('resource'); 
            if (selectedResourceId) {
                _this.form.setFieldValues({
                    resource : selectedResourceId,
                });
                
                var selectedResource = resources.filter(function(r) {
                    return r.resourceId == selectedResourceId;
                })[0];

                _this.record = _this.record || {};
                _this.record.unitCost = selectedResource.laborCost || 0;
                _this.record.billingClassId = selectedResource.billingClassId;
            } else {
                if (_this.editMode) {
                    var res = resources.filter(function (r) {
                        return r.resourceId == _this.record.id.split('~')[3];
                    });
                    if (res.length == 0) {
                        field.addSelectOption(_this.record.id.split('~')[3], _this.record.resourceName);
                    }
                    _this.form.setFieldValues({
                        resource : _this.record.id.split('~')[3]
                    });
                }
            }
            
        }
        
        if (!projectId) {
            field.setDisplayType('disabled');
        }
    };

    this.startDateField = function (_this) {
        if (_this.editMode) {
            var field = _this.form.addField('startdate', 'date', _this.labels.startDate);
            var assignStartDate = new Date(_this.record.assignStartDate);
            assignStartDate.setDate(assignStartDate.getDate() + 1);
            
            _this.form.setFieldValues({
                startdate : nlapiDateToString(assignStartDate)
            });
            
            field.setDisplaySize(300);
            field.setDisplayType('disabled');
        }
    };
    
    this.endDateField = function (_this) {
        if (_this.editMode) {
            var field = _this.form.addField('enddate', 'date', _this.labels.endDate);
            var assignEndDate = new Date(_this.record.assignEndDate);
            assignEndDate.setDate(assignEndDate.getDate() + 1);
            
            _this.form.setFieldValues({
                enddate : nlapiDateToString(assignEndDate)
            });
            
            field.setDisplaySize(300);
            field.setDisplayType('disabled');
        }
    };
    
    this.unitPercentField = function(_this) {
        var field = _this.form.addField('unitpercent', 'float', _this.labels.unitPercent);
        field.setMandatory(true);
        field.setDisplaySize(39);
        field.setHelpText(_this.helpTexts.unitPercent);
        
        if (_this.editMode) {
            _this.form.setFieldValues({
                unitpercent : parseFloat(_this.record.unitPct)
            });
        }
    };

    this.billingClassField = function(_this) {
        var field = _this.form.addField('billingclass', 'select', _this.labels.billingClass,
                'billingclass');
        field.setHelpText(_this.helpTexts.billingClass);
        
        if (_this.record && _this.record.billingClassId) {
            _this.form.setFieldValues({
                billingclass : _this.record.billingClassId
            });
        }
    };

    this.unitCostField = function(_this) {
        var field = _this.form.addField('unitcost', 'float', _this.labels.unitCost);
        field.setMandatory(true);
        field.setDisplaySize(39);
        field.setHelpText(_this.helpTexts.unitCost);
        
        if (_this.record && _this.record.unitCost) {
            _this.form.setFieldValues({
                unitcost : _this.record.unitCost
            });
        } else {
            _this.form.setFieldValues({
                unitcost : 0
            });
        }
    };
    
    this.unitPriceField = function (_this) {
        if (_this.editMode) {
            var field = _this.form.addField('unitprice', 'float', _this.labels.unitPrice);
            field.setDisplaySize(39);
        
            if (_this.record.unitPrice) {
                _this.form.setFieldValues({
                    unitprice : _this.record.unitPrice
                });
            }
        }
    };
    
    this.estimatedWorkField = function(_this) {
        var field = _this.form.addField('estimatedwork', 'float', _this.labels.estimatedWork);
        field.setMandatory(true);
        field.setDisplaySize(39);
        field.setHelpText(_this.helpTexts.estimatedWork);
        
        if (_this.editMode) {
            _this.form.setFieldValues({
                estimatedwork : _this.record.hrsEstimated
            });
        }
    };
    
    this.actualWorkField = function (_this) {
        if (_this.editMode) {
            var field = _this.form.addField('actualwork', 'text', _this.labels.actualWork);  
          _this.form.setFieldValues({
              actualwork : _this.record.hrsWorked
          });
          field.setDisplaySize(39);
          field.setDisplayType('disabled');
      }
    };

    this.serviceItemField = function(_this) {
        var field = _this.form.addField('serviceitem', 'select', _this.labels.serviceItem);
        field.addSelectOption('', '');
        field.setHelpText(_this.helpTexts.serviceItem);
        
        var ServiceItemService = new PRM.Service.ServiceItemService(psa_prm.serverlibrary);
        ServiceItemService.searchServiceItems().forEach(function(e) {
            field.addSelectOption(e.id, e.name);
        });

        if (_this.editMode) {
            if (_this.record.serviceItemId) {}
            _this.form.setFieldValues({
                serviceitem : _this.record.serviceItemId
            });
        }
    };

    this.isDeleteField = function (_this) {
      var field = _this.form.addField('isdelete', 'text', 'Delete');
      _this.form.setFieldValues({
          isdelete : 0
      });
      field.setDisplayType('hidden');
    };
    
    this.previousResourceField = function (_this) {
        if (_this.editMode) {
            var field = _this.form.addField('previousresource', 'text', 'Previous Resource');
            _this.form.setFieldValues({
                previousresource : _this.record.id.split('~')[3]
            });
            field.setDisplayType('hidden');
        }
    };
    
    this.gridIdField = function (_this) {
        if (_this.editMode) {
            var field = _this.form.addField('gridid', 'text', 'Grid Id');
            _this.form.setFieldValues({
                gridid : _this.record.id
            });
            field.setDisplayType('hidden');
        }
    };
    
    this.recordField = function (_this) {
        if (_this.editMode) {
            var field = _this.form.addField('record', 'longtext', 'Record');
            _this.form.setFieldValues({
                record : JSON.stringify(_this.record)
            });
            field.setDisplayType('hidden');
        }
    };
        
    
    this.errorMsgField = function(_this) {
        var errorMsgField = _this.form.addField('errormsgcontainer', 'inlinehtml', null);
        errorMsgField.setDisplayType('hidden');
        if (_this.errorMsg) {
            errorMsgField.setDefaultValue(_this.errorMsg);
        }
    };
    
};