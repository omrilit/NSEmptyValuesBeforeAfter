/**
 * Copyright (c) 2018, 2019, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/ui/message',
    'N/runtime',
    'N/record',
    'N/url',
    './Constants'
],
function(
    message,
    runtime,
    record,
    url,
    Constants
) {

    var FormView = function(context) {
        this.name = 'FormView';
        this.message = message;
        this.messageFieldId = 'custpage_message';
        this.context = context;
    };

    FormView.prototype.init = function() {
        var currentRecord = this.context.currentRecord;
        this.showMessage();

        baseUrl = url.resolveScript({
            scriptId: Constants.SCRIPT.ONLINE_FILING_IMPORT,
            deploymentId: Constants.DEPLOY.ONLINE_FILING_IMPORT
        });
        this.baseUrl = baseUrl;
        
        var buttoniseExtJs = this.buttoniseExtJs;
        var setFieldHelp = this.setFieldHelp;
        var buildReportTabs = this.buildReportTabs;
        var createStore = this.createStore;
        var createGrid = this.createGrid;
        var createSystemNotesTab = this.createSystemNotesTab;
        var getFieldLabelHelp = this.getFieldLabelHelp;        
        
        var OnSave = this.OnSave;
        var OnEdit = this.OnEdit;
        var OnCancel = this.OnCancel;
        var OnSubmit = this.OnSubmit;
        var form = this;

        Ext.onReady(function(){
        	setFieldHelp(getFieldLabelHelp);
        	var queryParams = Ext.urlDecode(window.location.search.substring(1));
        	if (queryParams){
        		var isEdit = queryParams.mode == 'edit' ? true : false;
        		var isCsv = queryParams.mode == 'csv' ? true : false;
    		}
        	
        	Ext.MessageBox.show({title: 'Loading', msg: 'Please wait...', width: 300, closable: true, wait: true, waitConfig: {interval:200}});
        	Ext.getDom('divvat').className="divdotted";
        	if (Ext.select('.customtab').elements.length > 0) {
        		var customtabs = [];
        		Ext.select('.customtab').each(function(el){
        			customtabs.push({
        				"title": el.getAttribute("label"),
        				"contentEl": el.getAttribute("id")
        				});
        		});
        		buildReportTabs(customtabs, isCsv ? 1 : 0, createSystemNotesTab, createStore, createGrid);
        	}

        	if(isEdit) {
                buttoniseExtJs('btnsave', 'Save', '_btnsave', form, OnSave, isEdit);
        	} else {
                buttoniseExtJs('btnedit', 'Edit', '_btnedit', form, OnEdit, !isEdit);
        	}
            buttoniseExtJs('btncancel', 'Cancel', '_btncancel', form, OnCancel, isEdit);
            buttoniseExtJs('btnsubmit', 'Submit', '_btnsubmit', form, OnSubmit, !isEdit);
    	});
    }
        
    FormView.prototype.OnSubmit = function(form) {        
        var requestParams = {};
        var fileReader = new FileReader();
        var fileData = {
        		'name':'',
        		'fileType':''
    			};
        
        requestParams = form.getFileValue();
        if (requestParams.files.length == 0){           
        	var urlObj = baseUrl + '&actiontype=' + Constants.ACTION.SUBMIT_CSV;
            Ext.Ajax.request({
                url: urlObj,
                params: fileData,
                timeout: 300000,
                method: 'POST',
                success: function(xhr) {
                	window.onbeforeunload = null;
                	window.location.href = baseUrl + '&mode=csv';
                	}});
            return;
        }
        
        fileData = form.getFileInfo(form, requestParams);
    	fileReader.readAsText(requestParams.files[0]);
        fileReader.onload = function(e){            	
            fileData.data = e.target.result;
            var urlObj = baseUrl + '&actiontype=' + Constants.ACTION.SUBMIT_CSV;
            Ext.Ajax.request({
                url: urlObj,
                params: fileData,
                timeout: 300000,
                method: 'POST',
                success: function(xhr) {
                    try{		        	  
                        if(xhr.responseText){
                            if(xhr.responseText == Constants.Status.ERROR) {
                                window.onbeforeunload = null;
                                window.location.href = baseUrl + '&mode=csv';
                            }
                            else {
                                var data = JSON.parse(xhr.responseText);
                                form.SubmitImportData(data);
                            }
                        }
                    }catch(ex){
                        Ext.Msg.show({
                            title:'Submit Failed please try again',
                            msg: 'Validation Callback Failed',
                            buttons: Ext.Msg.OK,
                            icon: Ext.MessageBox.Error,
                            width: 400
                        });
                    }
                },
                failure: function() {    		        	  	
                        Ext.Msg.show({
                            title:'You cannot submit the form due to the following error(s)',
                            msg: 'Validation Callback Failed',
                            buttons: Ext.Msg.OK,
                            icon: Ext.MessageBox.Error,
                            width: 400
                        });
                    }
            });
        };
    }
    
    FormView.prototype.SubmitImportData = function(data){
		var confirm_msg = ['Please indicate that all values to be submitted are final and correct. '];
		confirm_msg.push('It is your responsibility to ensure that these are reviewed and confirmed to be accurate before submission to HMRC.');
		confirm_msg.push('<br><br>');
		confirm_msg.push('<input type="checkbox" id="chkfinal" onclick="toggleOnlineFiling()"/>Final and Correct');

		Ext.MessageBox.buttonText = {
			no: 'CANCEL',
			yes: 'SUBMIT'
		};
		Ext.MessageBox.getDialog().buttons[1].disable();
		
		Ext.MessageBox.confirm('Important', confirm_msg.join(''), function(btn) {
			if(btn == 'yes') {
				window.SubmitOnline(data);
			}
		});
		Ext.MessageBox.setIcon(Ext.MessageBox.WARNING);
	}
    
    FormView.prototype.getFileValue = function(){
    	var field = Ext.select('input');
    	var elements = field.elements;
    	var file;
    	for(var element = 0; element < elements.length; element++){
    		var currentElement = elements[element];
    		if(currentElement.type == 'file'){
    			return currentElement;
    		}
    	}
    }
    
    FormView.prototype.getFileInfo = function(form, file){
    	var fileType = form.getFileType(file.files[0].name);
    	var fileInfo = {
        		"name":file.files[0].name,
        		"fileType":fileType
        		};
    	return fileInfo;
    }
    
    FormView.prototype.getFileType = function(filename){
    	var ret = filename.split('.');
    	var fileType = ret[ret.length-1];
    	return fileType.toUpperCase();
    };
    
    FormView.prototype.OnEdit = function(form) {
        window.location.href = form.baseUrl + '&mode=edit';
    }
    
    FormView.prototype.OnCancel = function(form) {
        window.location.href = form.baseUrl;
    }
    
    FormView.prototype.OnSave = function(form) {
        form.validateSetupFiling(form, form.saveFiling);
    };
    
    FormView.prototype.validateSetupFiling = function(form, callback) {
        var requestParams = {};
        form.getFieldValues.call(requestParams, 'input');
        form.getFieldValues.call(requestParams, 'select');
        
        var urlObj = form.baseUrl + '&actiontype='+Constants.ACTION.VALIDATE_SETUP;
        Ext.Ajax.request({
            url: urlObj,
            timeout: 300000,
            params: requestParams,
            method: 'POST',
            success: function(xhr) {
                if(xhr.responseText == Constants.Status.ERROR) {
                    form.OnEdit(form);
                } else {
                    callback(form);
                }
            },
            failure: function() {
                Ext.Msg.show({
                    title:'You cannot submit the form due to the following error(s)',
                    msg: 'Validation Callback Failed',
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.Error,
                    width: 400
                });
            }
        });
    };
    
    FormView.prototype.saveFiling = function(form) {
        var requestParams = {};
        form.getFieldValues.call(requestParams, 'select');
        var fields = Ext.select('input');
        var elements = fields.elements;
        
        for(var i = 0; i < elements.length; i++) {
            var element = elements[i];
            requestParams[element.id] = escape(element.value);
        }
        
        var urlObj = form.baseUrl + '&actiontype='+Constants.ACTION.SAVE_CONFIG;
        
        Ext.MessageBox.show({
            title: 'Saving settings',
            msg: 'Please wait...',
            progressText: 'Saving...',
            width: 300,
            wait: true,
            waitConfig: {interval:200}
        });
        
        Ext.Ajax.request({
            url: urlObj,
            params: requestParams,
            timeout: 300000,
            method: 'POST',
            success: function(xhr) {
                window.location.href = form.baseUrl;
            }, 
            failure: function(xhr) {
                window.location.href = form.baseUrl;
            }
        });
    }
    
    FormView.prototype.getFieldValues = function(fieldType) {
        var field = Ext.select(fieldType);
        var elements = field.elements;
        for(var element = 0; element < elements.length; element++) {
            var currentElement = elements[element];
            
            if(currentElement.multiple) {
                var selectedValues = [];
                for (var i = 0; i < currentElement.options.length; i++) {
                     if(currentElement.options[i].selected){
                         selectedValues.push(currentElement.options[i].value);
                      }
                  }
                this[currentElement.id] = selectedValues.join('|');
            } else {
                this[currentElement.id] = currentElement.value;
            }
        }
    }
    
    FormView.prototype.buildReportTabs = function (customtabs, activeTabIndex, createSystemNotesTab,createStore, createGrid){
        	var pagesize = parseInt(runtime.getCurrentUser().getPreference({name: 'LISTSEGMENTSIZE'}));
        	var tabs = customtabs.slice(0, 3);

        	var tabPanel = new Ext.TabPanel({
        		renderTo: 'maintab',
        		width:'auto',
        		activeTab: activeTabIndex,
        		frame:true,
        		defaults:{autoHeight: true},
        		items:tabs
        	});

            var urlObj = this.baseUrl + '&actiontype='+Constants.ACTION.SYSTEM_NOTE;
            
            var rec = 'customrecord_online_filing';
        	var recUrl = url.resolveRecord({
        		recordType: rec
        	});
        	
        	var fields = [];
        	var columns = [];
        	var columnWidth = {
        		date     : 100,
        		userName : 120,
        		period   : 100,
        		status   : 100
        	};
        	var defaultFields = [
        		 {name: 'Date', mapping: 'Date'},{name: 'User', mapping: 'User'},
				 {name: 'PeriodFrom', mapping: 'PeriodFrom'}, {name: 'PeriodTo', mapping: 'PeriodTo'},
				 {name: 'Id', mapping: 'Id'},{name: 'Status', mapping: 'Status'}
			 ];
        	var defaultColumns =  [
				   {header: 'Date', width: columnWidth.date, dataIndex: 'Date', sortable: false},
				   {header: 'User Name', width: columnWidth.userName, dataIndex: 'User', sortable: false},
				   {header: 'From Period', width: columnWidth.period, dataIndex: 'PeriodFrom', sortable: false},
				   {header: 'To Period', width: columnWidth.period, dataIndex: 'PeriodTo', sortable: false},
				   {header: 'Status', width: columnWidth.status, dataIndex: 'Status',
					   renderer  : function(value, metadata, record) {
						   return '<a href="javascript:void(window.open(\'' + recUrl + '&id=' + record.get("Id")+ '\'))">'+ value +'</a>';
					   }
				   }
			   ];
            
        	fields = fields.concat(defaultFields);
        	columns = columns.concat(defaultColumns);
            createSystemNotesTab(pagesize, urlObj, fields, columns,createStore, createGrid);
        }
        
    FormView.prototype.createStore = function (pageSize, url, fields) {
            return new Ext.data.XmlStore({
                autoDestroy: true,
                autoLoad: {params:{start:0, limit: pageSize}},
                proxy : new Ext.data.HttpProxy({
                    method: 'GET',
                    prettyUrls: true,
                    listeners: {
                    	'load': function(obj, records, options) {
            				Ext.MessageBox.hide();
            			},
                        'exception': function(proxy, type, action, option, response, arg){
                            alert("An error occurred while retrieving submission:" + type);
                            Ext.MessageBox.hide();
                        }
                    },
                    url: url,
                        api: {
                            load: url,
                            read: url
                        }
                    }),
                record: 'Note',
                totalProperty: 'Total',
                idPath: 'Id',
                fields: fields
            });
        }

    FormView.prototype.createGrid = function(store, columns, pageSize, renderTo) {
            return new Ext.grid.GridPanel({
                store: store,
                columns: columns,
                 bbar: new Ext.PagingToolbar({
                     pageSize: pageSize,
                     store: store,
                     displayInfo: false,
                     displayMsg: 'Displaying Submission History {0} - {1} of {2}',
                     emptyMsg: "No History to display"
                 }),
                 enableColumnHide: false,
                 renderTo: renderTo,
                 width: 800,
                 autoHeight: true,
                 height: 200,
                 layout:'fit'
             });
        }
        
    FormView.prototype.createSystemNotesTab = function(pagesize, url, fields, columns, createStore, createGrid) {
            var systemNotesStore = createStore(pagesize, url, fields);
            var systemNotesGrid = createGrid(systemNotesStore, columns, pagesize, 'submithistory');
        }        
        
    FormView.prototype.setFieldHelp = function(getFieldLabelHelp) {
           new  Ext.select('.tooltip').each(function(el){
                el.set({"title":"What's this?"});
                el.setStyle('cursor', 'help');
                el.setStyle('text-decoration', 'none');
                el.on('mouseover', function(event, htmlel, obj){
                    Ext.get(htmlel.id).setStyle('text-decoration', 'underline');
                });
                el.on('mouseout', function(event, htmlel, obj){
                    Ext.get(htmlel.id).setStyle('text-decoration', 'none');
                });

                el.on('click', function(event, htmlel, obj){
                    getFieldLabelHelp(event, htmlel);
                });
            });
        };
        
    FormView.prototype.getFieldLabelHelp = function(event, htmlel) {
            var url = this.baseUrl;
            url += '&actiontype=' + Constants.ACTION.FIELD_HELP;
            url += '&id=' + htmlel.id
            
            Ext.Ajax.request({
                url: url,
                timeout: 300000,
                method: 'POST',
                success: function(xhr) {
                    var msgobj = Ext.decode(xhr.responseText);
                    
                    var msg = Ext.MessageBox.show({
                        title: unescape(msgobj.title),
                        msg: unescape(msgobj.text),
                        width: 300
                    });
                    msg.getDialog().setPosition(event.getPageX(), event.getPageY());
                }, 
                failure: function(xhr) {
                    Ext.MessageBox.alert("An error occurred while retrieving the field level help.  Please contact technical support");
                }
            });
        }    

    FormView.prototype.showMessage = function() {
        var currentRecord = this.context.currentRecord;
        var messageField = currentRecord.getField({ fieldId: this.messageFieldId });

        if (messageField) {
            var messageObj = JSON.parse(currentRecord.getValue({ fieldId: this.messageFieldId }));
            var messageFld = this.message.create({
                title: messageObj.title,
                message: messageObj.message,
                type: this.message.Type[messageObj.type]
            });
            messageFld.show();
        }
    }; 

    FormView.prototype.buttoniseExtJs = function (id, label, renderTo, form, onClick, isEnabled) {
        new Ext.Button({  
            id: id,
            text: label,
            renderTo: renderTo,
            style:'margin:3px; display: inline-block',
            disabled: !isEnabled,
            listeners:{  
                afterrender:function()      {  
                   Ext.select('.x-btn-text').setStyle({  
                      'font-size':'14px',
                      'color':'#333333',
                      'font-weight':600,
                      'padding':'0px 12px',
                      'height':'23px'
                   });
                }
             },
             handler: function() {
                 onClick(form)
             },
        });
    };
    
    return FormView;
});
