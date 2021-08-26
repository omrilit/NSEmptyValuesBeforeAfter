/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/*
 * All tooltip definitions here
 */
Ext4.create('PRM.Cmp.ToolTip', {
    id : 'prm-tooltip-read-only-worked-hours',
    delegate : '.prm-tooltip-read-only-worked-hours',
    text : PRM.Translation.getText('TOOLTIP.READ_ONLY_WORKED_HOURS')
});

Ext4.create('PRM.Cmp.ToolTip', {
    id : 'prm-tooltip-read-only-has-assignments',
    delegate : '.prm-tooltip-read-only-has-assignments',
    text : PRM.Translation.getText('TOOLTIP.CANNOT_DELETE_HAS_ASSIGNMENTS')
});

Ext4.create('PRM.Cmp.ToolTip', {
    id : 'prm-tooltip-no-records-to-delete',
    delegate : '.prm-tooltip-no-records-to-delete',
    text : PRM.Translation.getText('TOOLTIP.NO_RECORDS_TO_DELETE')
});

Ext4.create('PRM.Cmp.ToolTip', {
    id : 'prm-tooltip-cannot-delete-with-worked-hours',
    delegate : '.prm-tooltip-cannot-delete-with-worked-hours',
    text : PRM.Translation.getText('TOOLTIP.CANNOT_DELETE_WITH_WORKED_HOURS')
});

Ext4.define('PRM.Cmp.MainToolTip', {
    extend : 'Ext4.tip.ToolTip',
    target: 'prm-grid-targetEl',
    html : PRM.Translation.getText('MASK.LOADING'),
    showDelay : 0,
    autoHide : true,
    hideDelay : 0,
    trackMouse : true,
    dismissDelay : 0,
    anchor : 'left',
    listeners: {
        beforeshow: function updateTipBody(tip) {
            if (PRM.App.Settings.showHovers) {
                var recordId = tip.triggerElement.parentNode.parentNode.parentNode.getAttribute('data-recordid');
                var recordObj = PRM.App.Grid.store.getNodeById(recordId).raw;
                if (recordObj.type === 'project') {
                    this.tooltipTemplate = PRM.App.Templates.projectDetailsTemplate;
                    tip.update(tip.tooltipTemplate().apply(recordObj).replace(/[']/g, "&#146;"));
                } else if (recordObj.type === 'resource-summary') {
                    this.tooltipTemplate = PRM.App.Templates.resourceSummaryTemplate;
                    var resourceId = recordObj.id.split('~')[3],
                        resourceObj = PRM.App.Stores.resourceForm.getSelectedRecord(parseInt(resourceId));
                    if (resourceObj) {
                        var tipDetails = {
                                resource: recordObj.name,
                                email: resourceObj.data.email,
                                role: recordObj.role,
                                type: resourceObj.data.type
                        };
                        if (PRM.App.Stores.feature.isJobCostingEnabled()) {
                            tipDetails.defaultCost = resourceObj.data.laborCost;
                            tipDetails.costOverride = '';
                        }
                        tip.update(tip.tooltipTemplate().apply(tipDetails).replace(/[']/g, "&#146;"));
                    } else { 
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
});

Ext4.define('PRM.Cmp.AssignmentToolTip', {
    extend : 'PRM.Cmp.MainToolTip',
    target: 'prm-grid-targetEl',
    projectTemplate : PRM.App.Templates.assignmentTemplate,
    listeners: {
        beforeshow: function updateTipBody(tip) {
            if (PRM.App.Settings.showHovers){
                var recordId = tip.triggerElement.parentNode.getAttribute('data-recordid');
                var isAssignmentId = /^[0-9~]+$/ig.test(recordId),
                    assignmentNode = PRM.App.Grid.store.getRowById(recordId),
                    isAssignment = isAssignmentId && assignmentNode.getAssignmentId() > 0;
                if (isAssignment) {
                    var taskNode = assignmentNode.parentNode,
                        projectNode = taskNode.parentNode,
                        billingClassStore = PRM.App.Stores.billingClassForm,
                        billingClassRecord = billingClassStore.getSelectedRecord(assignmentNode.get('billingClassId')),
                        serviceItemStore = PRM.App.Stores.serviceItemForm,
                        serviceItemRecord = serviceItemStore.getSelectedRecord(assignmentNode.get('serviceItemId')),
                        tipObj = {
                            projectTask : taskNode.get('name'),
                            customerProject : projectNode.get('name'),
                            resource : assignmentNode.get('name'),
                            startDate : Ext4.util.Format.date(new Date(assignmentNode.get('assignStartDate')), nsDateFormat),
                            endDate : Ext4.util.Format.date(new Date(assignmentNode.get('assignEndDate')), nsDateFormat),
                            unitPercent : assignmentNode.get('unitPct'),
                            billingClass : billingClassRecord ? billingClassRecord.get('name') : '',
                            unitCost : parseFloat(assignmentNode.get('unitCost')) ? parseFloat(assignmentNode.get('unitCost')).toFixed(2) : '',
                            unitPrice : parseFloat(assignmentNode.get('unitPrice')) ? parseFloat(assignmentNode.get('unitPrice')).toFixed(2) : '',
                            estimatedWork : assignmentNode.get('hrsEstimated'),
                            actualWork : assignmentNode.get('timeBills') ? PRM.App.Grid.getTotalHrsWorked(JSON.parse(assignmentNode.get('timeBills'))) : assignmentNode.get('hrsWorked'),
                            serviceItem : serviceItemRecord ? serviceItemRecord.get('name') : ''
                        };
                    tip.update(tip.projectTemplate().apply(tipObj).replace(/[']/g, "&#146;"));
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
});

Ext4.define('PRM.Cmp.ResourceAllocationToolTip', {
    extend : 'PRM.Cmp.ToolTip',
    target: 'prm-grid-targetEl',
    projectTemplate : PRM.App.Templates.resourceAllocationTemplate,
    listeners: {
        beforeshow: function updateTipBody(tip) {
            if (PRM.App.Settings.showHovers){
                var recordId = tip.triggerElement.parentNode.getAttribute('data-recordid');
                var resourceSummaryNode = PRM.App.Grid.store.getRowById(recordId);
                var allocations = resourceSummaryNode.get('allocations') ?  JSON.parse(resourceSummaryNode.get('allocations')) : null;
                var allocId = tip.triggerElement.getAttribute('allocId');
                var allocObj = allocations.find(function(e) { return e.id == allocId; }) || {};
                var tipObj = {
                        resource : resourceSummaryNode.get('name'),
                        customerProject : resourceSummaryNode.parentNode.get('name'),
                        startDate : allocations ? allocObj.startDate : '',
                        endDate : allocations ? allocObj.endDate : '',
                        allocate : allocations ? allocObj.hrsAllocated : '',
                        allocationType : allocations ? PRM.App.Stores.allocationType.getById(parseInt(allocObj.allocationType)).get('name') : '',
                        comments : allocations ? allocObj.notes : '',
                };
                tip.update(tip.projectTemplate().apply(tipObj).replace(/[']/g, "&#146;"));
            } else {
                return false;
            }
        }
    }
});

Ext4.create('PRM.Cmp.ToolTip', {
    id : 'prm-tooltip-cannot-reassign-with-worked-hours',
    delegate : '.prm-tooltip-cannot-reassign-with-worked-hours',
    text : PRM.Translation.getText('TOOLTIP.CANNOT_REASSIGN_WITH_WORKED_HOURS')
});

Ext4.create('PRM.Cmp.ToolTip', {
    id : 'prm-tooltip-cannot-modify-start-with-worked-hours',
    delegate : '.prm-tooltip-cannot-modify-start-with-worked-hours',
    text : PRM.Translation.getText('TOOLTIP.CANNOT_MODIFY_START_WITH_WORKED_HOURS')
});

Ext4.create('PRM.Cmp.ToolTip', {
    id : 'prm-tooltip-read-only-include-all-projects',
    delegate : '.prm-tooltip-read-only-include-all-projects',
    text : PRM.Translation.getText('TOOLTIP.NO_MORE_PROJECTS_TO_ADD')
});