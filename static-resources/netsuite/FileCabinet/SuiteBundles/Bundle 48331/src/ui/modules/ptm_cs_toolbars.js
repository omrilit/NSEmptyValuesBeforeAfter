/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Toolbar Classes
 */

Ext4.define('PSA.PTM.ToolBar.Main', {
    extend : 'Ext4.toolbar.Toolbar',
    id : 'ptm-main-toolbar',
    cls : 'ptm-toolbar-main',
    height : 38,
    border : '1 1 0 1',
    defaults : {
        margin : '0 15 0 0'
    },
        items : [
        /*
         * expand collapse buttons
         */
        Ext4.create('PSA.RA.UIComponent.ToggleExpandCollapse', {
            id : 'ptm-chartExpandBtn',
            text : translatedStrings.getText('BUTTON.EXPAND_ALL').toUpperCase(),
            mode : 'expand',
            margin : '0 15 0 15'
        }),
        Ext4.create('PSA.RA.UIComponent.ToggleExpandCollapse', {
            id : 'ptm-chartCollapseBtn',
            text : translatedStrings.getText('BUTTON.COLLAPSE_ALL').toUpperCase(),
            mode : 'collapse'
        }),
        /*
         * export functions
         */
        Ext4.create('PSA.RA.UIComponent.MenuSeparator'),
        Ext4.create('PSA.RA.UIComponent.ExportButton', {
            id : 'ptm-exportPDFBtn',
            iconCls : 'icon-pdf',
            tooltip : 'Export - PDF', // TODO: translatedStrings.getText('BUTTON.EXPORT.PDF')
            handler : function() {
                PSA.RA.App.loadExportData('PDF');
            }
        }),
        Ext4.create('PSA.RA.UIComponent.ExportButton', {
            id : 'ptm-exportCSVBtn',
            iconCls : 'icon-csv',
            tooltip : 'Export - CSV', // TODO: translatedStrings.getText('BUTTON.EXPORT.CSV')
            handler : function() {
                PSA.RA.App.loadExportData('CSV');
            }
        }),
        Ext4.create('PSA.RA.UIComponent.ExportButton', {
            id : 'ptm-exportExcelBtn',
            iconCls : 'icon-excel',
            tooltip : 'Export - Microsoft ® Excel', // TODO: translatedStrings.getText('BUTTON.EXPORT.XLS')
            handler : function() {
                PSA.RA.App.loadExportData('XLS');
            }
        }),
        Ext4.create('PSA.RA.UIComponent.MenuSeparator'),
        Ext4.create('PSA.RA.UIComponent.ExportButton', {
            id : 'ptm-printBtn',
            iconCls : 'icon-print',
            tooltip : 'Print', // TODO: translatedStrings.getText('BUTTON.PRINT')
            handler : function() {
                PSA.RA.App.getSchedulingView().scrollVerticallyTo(0, false);
                setTimeout(function() {
                    PSA.RA.App.print();
                }, 1000);
            }
        }),
        /*
         * Settings button
         */
        Ext4.create('PSA.PTM.UIComponent.IconButton', {
            id : 'ptm-chartSettingsBtn',
            iconCls : 'icon-options',
            tooltip : 'Settings', // TODO: translatedStrings.getText('BUTTON.SETTINGS')
            handler : function() {
                PSA.RA.App.formSettings.show();
            }
        }),        
        /*
         * Wide padding
         */
        Ext4.create('Ext4.toolbar.Spacer', {
            height : 5,
            width : 200
        }),
        /*
         * View presets - Daily/Weekly/Monthly
         */
        Ext4.create('PSA.RA.UIComponent.ViewPresetToggleLink', {
            id      : 'ra-chartPresetDaily',
            text : translatedStrings.getText('LINK.DAILY'),
            presetClassName    : 'PSA.RA.ViewPreset.Daily'
        }),
        Ext4.create('PSA.RA.UIComponent.MenuSeparatorSmall'),
        Ext4.create('PSA.RA.UIComponent.ViewPresetToggleLink', {
            id      : 'ra-chartPresetWeekly',
            text : translatedStrings.getText('LINK.WEEKLY'),
            presetClassName    : 'PSA.RA.ViewPreset.Weekly',
            pressed : true
        }),
        Ext4.create('PSA.RA.UIComponent.MenuSeparatorSmall'),
        Ext4.create('PSA.RA.UIComponent.ViewPresetToggleLink', {
            id      : 'ra-chartPresetMonthly',
            text : translatedStrings.getText('LINK.MONTHLY'),
            presetClassName : 'PSA.RA.ViewPreset.Monthly'
        }),
        /*
         * Date range controls and label/display
         */
        Ext4.create('PSA.RA.UIComponent.MenuSeparator'),
        Ext4.create('PSA.RA.UIComponent.ArrowButton', {
            id      : 'ra-chartPanLeft',
            iconCls : 'icon-prev',
            tooltip    : translatedStrings.getText('TOOLTIP.PREVIOUS'),
            handler : function() {
                PSA.RA.App.movement = 'left';
                perfTestLogger.start('Pan Left');
                PSA.RA.App.shiftPrevious();
                //PSA.RA.App.refreshChartDensity();
                perfTestLogger.stop();
            }
        }),
        Ext4.create('PSA.RA.UIComponent.ArrowButton', {
            id      : 'ra-chartPanRight',
            iconCls : 'icon-next',
            tooltip    : translatedStrings.getText('TOOLTIP.NEXT'),
            handler : function() {
                PSA.RA.App.movement = 'right';
                perfTestLogger.start('Pan Right');
                PSA.RA.App.shiftNext();
                //PSA.RA.App.refreshChartDensity();
                perfTestLogger.stop();
            }
        }),
        Ext4.create('Ext4.toolbar.TextItem', {
            id : 'rangefield'
        }),
        /*
         * Float right from this point onwards
         */
        Ext4.create('Ext4.toolbar.Fill'),
        /*
         * Paging components
         */
        Ext4.create('PSA.RA.UIComponent.PagingComboBox', {
            id : 'ra-page-combo-box',
            store : PSA.RA.dataStores.pageStore
        }),
        Ext4.create('Ext4.form.field.Display', {
            id : 'ra-total-page',
            hidden : true
        }),
        Ext4.create('PSA.RA.UIComponent.ArrowButton', {
            id : 'ra-prevPage',
            iconCls : 'icon-prev',
            tooltip : translatedStrings.getText('TOOLTIP.PREVIOUS'),
            handler : function() {
                var combo = Ext4.getCmp('ra-page-combo-box');
                if (combo.isProcessing) {
                    return;
                }
                var currPage = combo.getValue();
                if (currPage == 0) {
                    alert(translatedStrings.getText('MESSAGE.WARNING.FIRST_PAGE'));
                } else {
                    combo.select(currPage - 1);
                }
            }
        }),
        Ext4.create('PSA.RA.UIComponent.ArrowButton', {
            id : 'ra-nextPage',
            iconCls : 'icon-next',
            tooltip : translatedStrings.getText('TOOLTIP.NEXT'),
            handler : function() {
                var combo = Ext4.getCmp('ra-page-combo-box');
                if (combo.isProcessing) {
                    return;
                }
                var currPage = combo.getValue();
                var totalPages = combo.store.getCount();
                if (currPage == totalPages - 1) {
                    alert(translatedStrings.getText('MESSAGE.WARNING.LAST_PAGE'));
                } else {
                    combo.select(currPage + 1);
                }
            }
        }),
        Ext4.create('Ext4.form.field.Display', {
            id : 'ptm-total-page',
            fieldLabel : 'Total', // translatedStrings.getText('LABEL.TOTAL'), // to be translated
            labelAlign : 'right',
            labelSeparator : ':',
            labelWidth : 'auto',
            height : 20,
            width : 'auto',
            value : 0
        }),
        /*
         * Help icon and tooltip
         */
        Ext4.create('Ext4.button.Button', {
            id : 'ra-icon-info',
            iconCls : 'icon-info',
            cls : 'ra-icon-btn',
            scale : 'medium',
            tooltip : translatedStrings.getText('BUTTON.RESIZE_INFO')
        })
    ]
});
Ext4.define('PSA.PTM.ToolBar.Legend', {
    id : 'ptm-toolbar-legend',
    extend : 'Ext4.toolbar.Toolbar',
    cls : 'ptm-toolbar-legend',
    height : 48,
    layout : {
        align : 'bottom'
    },
    defaults : {
        margin : 0
    },
    initComponent : function(args) {
        this.callParent(args);
    },
    initTypeBgMap : function() {
        if (!this.typeBgMap) this.typeBgMap = {};
        var settings = PTM.Settings;
        this.typeBgMap['legend-staffed'] = '#999999';
        this.typeBgMap['legend-over'] = '#' + settings.get('availabilityColor1');
        this.typeBgMap['legend-assigned'] = '#' + settings.get('availabilityColor2');
        this.typeBgMap['legend-worked'] = '#' + settings.get('availabilityColor3');
        this.typeBgMap['legend-non-working'] = '#EDEDED';
    },
    loadLegendColors : function() {
        Ext4.getCmp('ptm-legend-staffed').el.setStyle('background-color', this.typeBgMap['legend-staffed']);
        Ext4.getCmp('ptm-legend-over').el.setStyle('background-color', this.typeBgMap['legend-over']);
        Ext4.getCmp('ptm-legend-assigned').el.setStyle('background-color', this.typeBgMap['legend-assigned']);
        Ext4.getCmp('ptm-legend-worked').el.setStyle('background-color', this.typeBgMap['legend-worked']);
        Ext4.getCmp('ptm-legend-non-working').el.setStyle('background-color', this.typeBgMap['legend-non-working']);
    },
    listeners : {
        boxready : function() {
            this.initTypeBgMap();
            this.loadLegendColors();
        }
    },
    items : [
        Ext4.create('Ext4.toolbar.Fill'),
        Ext4.create('Ext4.panel.Panel', {
            cls : 'ptm-legend-fieldset',
            height : 38,
            layout : {
                type : 'hbox',
                align : 'middle'
            },
            defaults : {
                margin : '0 15 0 0'
            },
            items : [
                Ext4.create('PSA.PTM.UIComponent.Legend', {
                    id : 'ptm-legend-staffed',
                    margin : '0 15 0 15'
                }),
                Ext4.create('PSA.PTM.UIComponent.LegendLabel', {
                    id : 'ptm-legend-label-staffed',
                    text : translatedStrings.getText('COMPONENT.STAFFED')
                }),
                Ext4.create('PSA.PTM.UIComponent.Legend', {
                    id : 'ptm-legend-over'
                }),
                Ext4.create('PSA.PTM.UIComponent.LegendLabel', {
                    id : 'ptm-legend-label-over',
                    text : translatedStrings.getText('COMPONENT.OVER')
                }),
                Ext4.create('PSA.PTM.UIComponent.Legend', {
                    id : 'ptm-legend-assigned'
                }),
                Ext4.create('PSA.PTM.UIComponent.LegendLabel', {
                    id : 'ptm-legend-label-assigned',
                    text : translatedStrings.getText('COMPONENT.ASSIGNED')
                }),
                Ext4.create('PSA.PTM.UIComponent.Legend', {
                    id : 'ptm-legend-worked'
                }),
                Ext4.create('PSA.PTM.UIComponent.LegendLabel', {
                    id : 'ptm-legend-label-worked',
                    text : translatedStrings.getText('COMPONENT.WORKED')
                }),
                Ext4.create('PSA.PTM.UIComponent.Legend', {
                    id : 'ptm-legend-non-working'
                }),
                Ext4.create('PSA.PTM.UIComponent.LegendLabel', {
                    id : 'ptm-legend-label-non-working',
                    text : translatedStrings.getText('COMPONENT.NON_WORKING')
                })
            ]
        })
    ]
});
