/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Cmp.ResourceSearchForm', {
	id : 'prm-form-allocation-search-resource',
	extend : 'PRM.Cmp.Form',
	title : PRM.Translation.getText('WINDOW.SEARCH_RESOURCE'),
	width : 600,
	returnToCriteria : false,
	componentIdList : [ 'from-date', 'to-date', 'percent-available', 'billing-class-cmb', 'max-labor-cost' ],
	items : [ Ext4.create('PRM.Cmp.FormPanel', {
		id : 'prm-form-allocation-search-resource-panel',
		listeners : {
			afterrender : function() {
				var cancelBtn = Ext4.getCmp('prm-form-allocation-search-resource-panel-cancel');
				cancelBtn.on('click', this.handlers.cancelHandler, this);

				var saveBtn = Ext4.getCmp('prm-form-allocation-search-resource-panel-save');
				saveBtn.on('click', this.handlers.saveHandler, this);
				saveBtn.setText(PRM.Translation.getText('BUTTON.SUBMIT'));
			}
		},
		items : [ Ext4.create('Ext4.panel.Panel', {
			layout : 'column',
			border : false,
			items : [ Ext4.create('Ext4.form.FieldSet', {
				flex : 1,
				layout : 'anchor',
				title : PRM.Translation.getText('FIELDSET.AVAILABILITY'),
				columnWidth : 0.4875,
				id : 'prm-availability-fieldset',
				defaults : {
					anchor : '100%',
					hideEmptyLabel : false,
					labelWidth : 10
				},
				items : [ Ext4.create('PRM.Cmp.Date', {
					id : 'prm-form-allocation-search-resource-from-date',
					fieldLabel : PRM.Translation.getText('FIELD.FROM'),
					allowBlank : false,
					value : new Date(),
					listeners : {
						blur : function(dateField, blurEvent, e) {
							var startDate = dateField.getValue();
							var endDate = Ext4.getCmp('prm-form-allocation-search-resource-to-date').getValue();
							if (dateField.isValid() && Ext4.getCmp('prm-form-allocation-search-resource-to-date').isValid() && startDate > endDate) {
								Ext4.getCmp('prm-form-allocation-search-resource-to-date').setValue(startDate);
							}
						}
					}
				}), Ext4.create('PRM.Cmp.Date', {
					id : 'prm-form-allocation-search-resource-to-date',
					fieldLabel : PRM.Translation.getText('FIELD.TO'),
					allowBlank : false,
					value : new Date(),
					listeners : {
						blur : function(dateField, blurEvent, e) {
							var endDate = dateField.getValue();
							var startDate = Ext4.getCmp('prm-form-allocation-search-resource-from-date').getValue();
							if (dateField.isValid() && Ext4.getCmp('prm-form-allocation-search-resource-from-date').isValid() && startDate > endDate) {
								Ext4.getCmp('prm-form-allocation-search-resource-from-date').setValue(endDate);
							}
						}
					}
				}), Ext4.create('PRM.Cmp.Number', {
					id : 'prm-form-allocation-search-resource-percent-available',
					fieldLabel : PRM.Translation.getText('FIELD.PERCENT_AVAILABLE'),
					minValue : 0,
					maxValue : 100
				}) ]
			}), Ext4.create('Ext4.form.Panel', {
				border : false,
				columnWidth : 0.025
			}), Ext4.create('Ext4.form.FieldSet', {
				flex : 1,
				layout : 'anchor',
				title : PRM.Translation.getText('FIELDSET.OTHERS'),
				columnWidth : 0.4875,
				id : 'prm-others-fieldset',
				defaults : {
					anchor : '100%',
					hideEmptyLabel : false
				},
				items : [ Ext4.create('PRM.Cmp.ComboBox', {
					id : 'prm-form-allocation-search-resource-billing-class-cmb',
					featureName : 'billingClass',
					fieldLabel : PRM.Translation.getText('FIELD.BILLING_CLASS'),
					store : PRM.App.Stores.billingClassForm,
					allowBlank : true,
					emptyText : PRM.Translation.getText('TEXT.ALL-'),
					forceSelection : false,
				}), Ext4.create('PRM.Cmp.Number', {
					id : 'prm-form-allocation-search-resource-max-labor-cost',
					fieldLabel : PRM.Translation.getText('FIELD.MAX_LABOR_COST')
				}) ]
			}) ]
		}) ],
		getFilters : function() {
			return {
				fromDate : Ext4.getCmp('prm-form-allocation-search-resource-from-date').getValue(),
				toDate : Ext4.getCmp('prm-form-allocation-search-resource-to-date').getValue(),
				percentAvailable : Ext4.getCmp('prm-form-allocation-search-resource-percent-available').getValue(),
				billingClass : Ext4.getCmp('prm-form-allocation-search-resource-billing-class-cmb').getValue(),
				maxLaborCost : Ext4.getCmp('prm-form-allocation-search-resource-max-labor-cost').getValue()
			};
		},
		handlers : {
			saveHandler : function() {
				var savedFilterRecord = Ext4.getCmp('prm-cmb-saved-filters').getSelectedRecord();
				var searchFilters = this.getFilters();
				var requestParams = {
					viewFilters : JSON.stringify(savedFilterRecord.data),
					searchFilters : JSON.stringify(searchFilters)
				};

				PRM.App.Forms.resourceResult.loadResults(requestParams);
				PRM.App.Forms.resourceResult.show();
				PRM.App.Forms.resourceSearch.hide();
			},
			cancelHandler : function() {
				PRM.App.Forms.resourceSearch.hide(null, function() {
					this.resetFormFields();
				});
			}
		},
	}) ]
});

Ext4.define('PRM.Cmp.ResourceResultForm', {
	extend : 'PRM.Cmp.Window',
	title : PRM.Translation.getText('WINDOW.SELECT_RESOURCE'),
	width : 850,
	height : 375,
	defaults : {
		margin : '20 0 0 20'
	},
	layout : 'vbox',
	items : [ {
		xtype : 'panel',
		layout : 'hbox',
		border : false,
		defaults : {
			margin : '0 15 0 0'
		},
		items : [ {
			xtype : 'prm-btn-blue',
			id : 'prm-form-allocation-search-result-return',
			text : PRM.Translation.getText('BUTTON.RETURN_TO_CRITERIA'),
			handler : function() {
				PRM.App.Forms.resourceResult.hide();
				PRM.App.Forms.resourceSearch.show();
			}
		}, {
			xtype : 'prm-btn-gray',
			id : 'prm-form-allocation-search-result-close',
			text : PRM.Translation.getText('BUTTON.CLOSE'),
			handler : function() {
				PRM.App.Forms.resourceResult.hide();
				PRM.App.Forms.resourceSearch.resetFormFields();
			}
		}, ]
	}, {
		xtype : 'grid',
		id : 'prm-allocation-search-results-grid',
		cls : 'prm-allocation-search-results',
		store : PRM.App.Stores.resourceSearch,
		width : 785,
		height : 240,
		autoScroll : true,
		invalidateScrollerOnRefresh : false,
		disableSelection : true,
		viewConfig : {
			loadMask : false
		},
		hidden : true,
		columns : [ {
			xtype : 'actioncolumn',
			id : 'prm-form-allocation-search-result-column-select',
			text : PRM.Translation.getText('HEADER.SELECT'),
			dataIndex : 'resourceId',
			menuDisabled : true,
			resizeable : false,
			iconCls : 'prm-icon-select',
			width : 58,
			handler : function(grid, row, col, column, event, rec) {
				var resourceField = Ext4.getCmp(PRM.App.Forms.resourceSearch.triggerFormId + '-resource');
				resourceField.setValue(rec.get('resourceId'));
				PRM.App.Forms.resourceResult.hide();
				PRM.App.Forms.resourceSearch.hide();
			}
		}, {
			id : 'prm-form-allocation-search-result-column-name',
			text : PRM.Translation.getText('HEADER.RESOURCE'),
			dataIndex : 'resourceName',
			menuDisabled : true,
			resizeable : false,
			width : 200
		}, {
			id : 'prm-form-allocation-search-result-column-type',
			text : PRM.Translation.getText('HEADER.TYPE'),
			dataIndex : 'resourceType',
			menuDisabled : true,
			resizeable : false,
			width : 150
		}, {
			id : 'prm-form-allocation-search-result-column-billing-class',
			text : PRM.Translation.getText('HEADER.BILLING_CLASS'),
			dataIndex : 'billingClass',
			menuDisabled : true,
			resizeable : false,
			width : 150
		}, {
			id : 'prm-form-allocation-search-result-column-labor-cost',
			text : PRM.Translation.getText('HEADER.LABOR_COST'),
			dataIndex : 'laborCost',
			menuDisabled : true,
			resizeable : false,
			width : 110
		}, {
			id : 'prm-form-allocation-search-result-column-percent-available',
			text : PRM.Translation.getText('HEADER.PERCENT_AVAILABLE'),
			dataIndex : 'percentAvailable',
			menuDisabled : true,
			resizeable : false,
			width : 100
		} ]
	}, {
		xtype : 'text',
		id : 'prm-form-allocation-search-result-empty',
		text : PRM.Translation.getText('TEXT.NO_SEARCH_RESULTS'),
		layout : 'block',
		hidden : true
	} ],
	loadResults : function(params) {
		var store = PRM.App.Stores.resourceSearch;

		if (store.hasOwnProperty('params')) {
			Ext4.apply(store.params, params);
		} else {
			store.params = params;
		}

		store.load({
			params : store.params
		});
	},
	listeners : {
		hide : function() {
			Ext4.getCmp('prm-form-allocation-search-result-empty').hide();
			Ext4.getCmp('prm-allocation-search-results-grid').hide();
		}
	}
});