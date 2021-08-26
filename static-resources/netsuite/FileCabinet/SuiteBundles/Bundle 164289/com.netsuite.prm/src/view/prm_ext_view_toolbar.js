/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.View.Toolbar', {
    extend : 'Ext4.toolbar.Toolbar',
    id : 'prm-view-toolbar',
    renderTo : Ext4.get('main_form'),
    height : 38,
    border : '1 1 0 1',
    defaults : {
        margin : '0 15 0 0'
    },
    hidden : true,
    items : [
        /*{
            xtype : 'prm-button-icon',
            id : 'prm-btn-export-csv',
            iconCls : 'prm-icon-csv',
            margin : '0 15 0 15',
            tooltip : PRM.Translation.getText('TOOLTIP.EXPORT_TO_CSV'),
            handler : function(button, event) {
                button.up().submitExportForm('CSV');
            }
        },
        {
            xtype : 'prm-button-icon',
            id : 'prm-btn-export-xls',
            iconCls : 'prm-icon-xls',
            tooltip : PRM.Translation.getText('TOOLTIP.EXPORT_TO_XLS'),
            handler : function(button, event) {
                button.up().submitExportForm('XLS');
            }
        },
        {
            xtype : 'prm-button-icon',
            id : 'prm-btn-export-pdf',
            iconCls : 'prm-icon-pdf',
            tooltip : PRM.Translation.getText('TOOLTIP.EXPORT_TO_PDF'),
            handler : function(button, event) {
                button.up().submitExportForm('PDF');
            }
        },
        {
            xtype : 'prm-separator'
        },*/
        {
            xtype : 'prm-button-icon',
            id : 'prm-btn-print',
            iconCls : 'prm-icon-print',
            margin : '0 15 0 15',
            tooltip : PRM.Translation.getText('TOOLTIP.PRINT'),
            handler : function() {
                PRM.App.Grid.print();
            }
        },
        {
            xtype : 'prm-separator'
        },
        {
            xtype : 'prm-button-icon',
            id : 'prm-btn-settings',
            iconCls : 'prm-icon-settings',
            tooltip : PRM.Translation.getText('TOOLTIP.SETTINGS'),
            handler : function() {
                PRM.App.Forms.settings.show();
            }
        },
        {
            xtype : 'tbspacer',
            height : 5,
            width : 200
        },
        {
            xtype : 'prm-button-preset',
            id : 'prm-btn-daily',
            text : PRM.Translation.getText('BUTTON.PRESET_DAILY')
        },
        {
            xtype : 'prm-separator-small'
        },
        {
            xtype : 'prm-button-preset',
            id : 'prm-btn-weekly',
            text : PRM.Translation.getText('BUTTON.PRESET_WEEKLY'),
            pressed : true
        },
        {
            xtype : 'prm-separator-small'
        },
        {
            xtype : 'prm-button-preset',
            id : 'prm-btn-monthly',
            text : PRM.Translation.getText('BUTTON.PRESET_MONTHLY')
        },
        {
            xtype : 'prm-separator'
        },
        {
            xtype : 'prm-button-panning',
            id : 'prm-btn-pan-left',
            tooltip : PRM.Translation.getText('TOOLTIP.PAN_LEFT'),
            direction : 'left'
        },
        {
            xtype : 'prm-button-panning',
            id : 'prm-btn-pan-right',
            tooltip : PRM.Translation.getText('TOOLTIP.PAN_RIGHT'),
            direction : 'right'
        },
        {
            xtype : 'text',
            id : 'prm-date-range'
        },
        {
            xtype : 'tbfill'
        },
        {
            xtype : 'prm-page-combo-box',
            id : 'prm-page-combo-box',
            store : PRM.App.Stores.pageList,
            value : 1
        },
        {
            xtype : 'prm-button-paging',
            id : 'prm-btn-page-left',
            tooltip : PRM.Translation.getText('TOOLTIP.PAGE_LEFT'),
            direction : 'left'
        },
        {
            xtype : 'prm-button-paging',
            id : 'prm-btn-page-right',
            tooltip : PRM.Translation.getText('TOOLTIP.PAGE_RIGHT'),
            direction : 'right'
        },
        {
            xtype : 'displayfield',
            id : 'prm-total-page',
            fieldLabel : PRM.Translation.getText('TEXT.TOTAL'),
            labelAlign : 'right',
            labelWidth : 'auto',
            value : PRM.Translation.getText('MASK.LOADING')
        },
        {
            xtype : 'prm-button-icon',
            id : 'prm-btn-info',
            iconCls : 'prm-icon-info',
            tooltip : {
                xtype : 'quicktip',
                showDelay : 0,
                autoHide : true,
                hideDelay : 0,
                dismissDelay : 0,
                text : [
                    '<table>',
                        '<tr>',
                            '<td class="prm-color-code-resource-no-assignment">XYZ</td>',
                            '<td>' + PRM.Translation.getText('TEXT.LEGEND_RESOURCE_HAS_NO_ASSIGNMENTS') + '</td>',
                        '</tr>',
                        '<tr>',
                            '<td class="prm-color-code-task-no-resources">XYZ</td>',
                            '<td>' + PRM.Translation.getText('TEXT.LEGEND_TASK_HAS_NO_RESOURCES') + '</td>',
                        '</tr>',
                        '<tr>',
                            '<td class="prm-color-code-editable-value">XYZ</td>',
                            '<td>' + PRM.Translation.getText('TEXT.LEGEND_EDITABLE_VALUE') + '</td>',
                        '</tr>',
                        '<tr>',
                            '<td class="prm-color-code-read-only-value">XYZ</td>',
                            '<td>' + PRM.Translation.getText('TEXT.LEGEND_READ_ONLY_VALUE') + '</td>',
                        '</tr>',
                        '<tr>',
                            '<td class="prm-color-code-inactive-resource">XYZ</td>',
                            '<td>' + PRM.Translation.getText('TEXT.LEGEND_INACTIVE_RESOURCE') + '</td>',
                        '</tr>',
                    '</table>',
                    '<div style="margin-top:10px;">*' + PRM.Translation.getText('TEXT.CLICK_CELL_TO_EDIT') + '</div>'
                ].join('')
            }
        }
    ],
    /*
     * PRM Specific Methods and Properties
     */
    submitExportForm : function(format) {
        /*
         * create hidden form for submitting
         */
        if (!this.exportUrl) {
            this.exportUrl = nlapiResolveURL('SUITELET', 'customscript_prm_sl_data_exporter', 'customdeploy_prm_sl_data_exporter');
        }
        if (!this.tempInput) {
            this.tempInput = document.createElement("input");
            this.tempInput.type = "text";
            this.tempInput.name = "exportParams";
        }
        if (!this.tempForm) {
            this.tempForm = document.createElement("form");
            this.tempForm.method = "POST";
            this.tempForm.style.display = "none";
            this.tempForm.appendChild(this.tempInput);
            document.body.appendChild(this.tempForm);
        }
        /*
         * setup properties then submit
         */
        var exportParams = [];
        exportParams.push(format);
        exportParams.push(PRM.App.Settings.projectsPerPage);
        exportParams.push(PRM.App.Settings.currentPage);
        this.tempInput.value = exportParams.join('~');
        this.tempForm.action = this.exportUrl;
        this.tempForm.submit();
    },
    /*
     *  Sets the label of the date range found in the toolbar
     *
     *  @param {Object} start   - raw JS date object, used as basis for start of date range
     *  @param {Object} end     - raw JS date object, used as basis for end of date range
     *  @param {String} preset  - grid preset (can be Daily, Weekly, or Monthly)
     */       
    setDateRange: function(start, end, preset){
        var label = '';
        // compute for date range label
        switch (preset){
            case 'Daily':
                var startMonthLabel = Ext4.Date.monthNames[start.getMonth()];
                var endMonthLabel = Ext4.Date.monthNames[end.getMonth()];
                if (startMonthLabel == endMonthLabel){
                    label = startMonthLabel + ' ' + start.getDate() + ' - ' + end.getDate() + ', ' + end.getFullYear();
                }
                else {
                    label = startMonthLabel + ' ' + start.getDate() + ' - ' + endMonthLabel + ' ' + end.getDate() + ', ' + end.getFullYear();
                }
                break;                
            case 'Weekly':
                var startMonthLabel = Ext4.Date.monthNames[start.getMonth()];
                var endMonthLabel = Ext4.Date.monthNames[end.getMonth()];
                if (start.getFullYear() == end.getFullYear()){
                    label = startMonthLabel + ' ' + start.getDate() + ' - ' + endMonthLabel + ' ' + end.getDate() + ', ' + end.getFullYear();
                }
                else {
                    label = startMonthLabel + ' ' + start.getDate() + ', ' + start.getFullYear() + ' - ' + endMonthLabel + ' ' + end.getDate() + ', ' + end.getFullYear();
                }
                break;
            case 'Monthly':
                var startMonthLabel = Ext4.Date.monthNames[start.getMonth()];
                var endMonthLabel = Ext4.Date.monthNames[end.getMonth()];
                label = startMonthLabel + ' ' + start.getFullYear() + ' - ' + endMonthLabel + ' ' + end.getFullYear();            
                break;
            default:
                alert('ERROR: Preset is invalid');
                break;
        }
        
        // set date range label
        this.down('#prm-date-range').setText(label);
    }
});