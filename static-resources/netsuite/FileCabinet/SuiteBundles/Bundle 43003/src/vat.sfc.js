/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */
var SFC;
if (!SFC) SFC = {};
if (!SFC.System) SFC.System = {};
if (!SFC.Utils) SFC.Utils = {};
SFC.IsOW = nlapiGetContext().getSetting("FEATURE", "SUBSIDIARIES") == "T";

SFC.System.Application = function(appGuid) {
	this.Context = nlapiGetContext();
	this.Params = {};
	this.InitParams=InitParams;
	this.IsOneWorld = this.Context.getFeature("SUBSIDIARIES");
	this.IsMultibook = this.Context.getFeature("MULTIBOOK");
	var _AppGuid = appGuid;
	var _AppFolderId = null; 
	var isNewVersion = nlapiGetContext().version === '2014.1' ? false : true;

	this.CreateField = function(form, name, type, label, isMandatory, defaultValue, displayType, layoutType, breakType, tabname) {
		var field; 
		
		if (tabname) {
			field = form.addField(name, type, label, null, tabname);
		} else {
			field = form.addField(name, type, label, null);
		}
		if (isMandatory)
			field.setMandatory(isMandatory);
		if (defaultValue != null)
			field.setDefaultValue(defaultValue);
		if (displayType != null)
			field.setDisplayType(displayType);
		if (layoutType != null)
		{
			if (breakType != null)
				field.setLayoutType(layoutType, breakType);
			else
				field.setLayoutType(layoutType);
		}
		return field;
	}

	function GetFolder() {
		var filters = [new nlobjSearchFilter("name", null, "is", _AppGuid)];
		var rs = nlapiSearchRecord("file", null, filters, [new nlobjSearchColumn("folder")]);
		return nlapiLoadRecord('folder', rs[0].getValue("folder"));
	}
	
	function GetAppFolderId() {
		if (_AppFolderId == null) {
			var filters = [new nlobjSearchFilter("name", null, "is", _AppGuid)];
			var rs = nlapiSearchRecord("file", null, filters, [new nlobjSearchColumn("folder")]);
			_AppFolderId = rs[0].getValue("folder");
		}
		return _AppFolderId;
	}

	this.GetLibraryFile = function(filename) {
		var folder = GetFolder();
		var file;
		if (!folder) {
			var rsg = nlapiSearchGlobal(filename);
			if (rsg) {
				file = nlapiLoadFile(rsg[0].getId());
			}
		} else {
			var parentfolderid = folder.getFieldValue("parent");
			var filters = [new nlobjSearchFilter("name", null, "is", filename), new nlobjSearchFilter("folder", null, "is", parentfolderid)];
			var rs = nlapiSearchRecord("file", null, filters);
			
			if (rs) {
				file = nlapiLoadFile(rs[0].getId());
			}
		}
		
		return file;
	}

	this.GetFileId = GetFileId;
	function GetFileId(fileName, isErrorWhenNotFound) {
		filters = [
			new nlobjSearchFilter("name", null, "is", fileName),
			new nlobjSearchFilter("folder", null, "is", GetAppFolderId())];
		var rs = nlapiSearchRecord("file", null, filters);
		if (rs == null)
		{
			if (isErrorWhenNotFound)
				throw nlapiCreateError("Error", "File not found (" + fileName + ")");
			else
				return null;
		}
		return rs[0].getId();
	}

	this.GetFileURL = GetFileURL;
	function GetFileURL(filename) {
		var fileId = GetFileId(filename, false);
		var file = nlapiLoadFile(fileId);
		return file.getURL();
	}

	this.GetFileContent = GetFileContent;
	function GetFileContent(fileName, isErrorWhenNotFound)
	{
		var fileId = GetFileId(fileName, isErrorWhenNotFound);
		var file = nlapiLoadFile(fileId);
		return file.getValue();
	}

	this.LoadCurrentUser = LoadCurrentUser;
	function LoadCurrentUser() {
		return {
			Id: this.Context.getUser(),
			Name: this.Context.getName()
		};
	}

	function InitParams(request) {
		var allParams = request == null ? [] : request.getAllParameters();
		var params = {};
		for (var i in allParams)
			params[i] = allParams[i];
		if (request) {
			params["baseurl"] = SFC.System.getBaseURL(request);
		}
		return params;
	}

	this.ButtoniseExtJs = function(id, label, onClick, isEnabled, splitButton) {
		if (splitButton && typeof splitButton != 'undefined') {
			return ["<span id='_", id, "'/>", 
					"<script type='text/javascript'>",
					"Ext.onReady(function(){new Ext.Button({",
						"id: '", id, "',",
						"text: '", label, "',", 
						"renderTo:'_", id, "',",
						"style: 'margin:3px',",
						"disabled:", !isEnabled, ",",
						isNewVersion?"listeners: {menushow: function(){Ext.select('.x-menu').setStyle({'background-image': 'none'})}, afterrender: function() {  Ext.select('.x-btn-text').setStyle({'font-size': '14px','color': '#333333','font-weight': 600,'padding':'0px 12px','height':'23px'});}}, ":"",
						"menu :[", createMenuItems(splitButton), "]", 
						
					"})}); </script>"].join("");
		} else {
			return ["<span id='_", id, "'/>",
					"<script type='text/javascript'>",
					"Ext.onReady(function(){new Ext.Button({", 
					"id: '", id, "',",
					"text: '", label, "',",
					"renderTo: '_", id, "',",
					"style: 'margin:3px',",
					"disabled:", !isEnabled, ",", 
					isNewVersion?"listeners: {afterrender: function() {Ext.select('.x-btn-text').setStyle({'font-size': '14px','color': '#333333','font-weight': 600,'padding':'0px 12px','height':'23px'});}}, ":"",
					"handler: function(){", onClick, "}", 
			"})}); </script>"].join("");
		}
	};
	
	this.CreateButtonMenuItem = function (id, text, handler) {
		var menu = {};
		menu.Name = id;
		menu.Label = text;
		menu.Handler = handler;
		
		return menu;
	};
	
	this.CreateButtonItem = function (id, label, onClick, url, isEnabled, buttons) {
		return {
			Name : id,
			Label : label,
			Handler : onClick,
			URL : url,
			IsEnabled : isEnabled,
			Buttons : buttons ? buttons : null
		};
	};
	
	function createMenuItems(buttons) {
		var menuItems = [];
		for (var button = 0; button < buttons.length; button++) {
			var buttonItems = [];
			if (buttons[button].Buttons) {
				buttonItems.push(createButtonItems(buttons[button].Buttons));
			}
			
			if (isNewVersion) {
				if (buttonItems.length > 0) {
					menuItems.push("{text: '"+ buttons[button].Label + "', menu: [" + buttonItems + "], style:'font-size:14px; color:#333333; font-weight:600; padding:0px 24px 0px 12px; line-height:23px; height:23px', listeners: {afterrender: function(){Ext.select('.x-menu').setStyle({'background-image': 'none'})}}}");
				} else {
					menuItems.push("{text: '"+ buttons[button].Label + "',style:'font-size:14px; color:#333333; font-weight:600; padding:0px 12px; line-height:23px; height:23px',handler:function(){"+ buttons[button].Handler +"}, listeners: {afterrender: function(){Ext.select('.x-menu').setStyle({'background-image': 'none'})}}}");
				}
			}else{
				if (buttonItems.length > 0) {
					menuItems.push("{text: '"+ buttons[button].Label + "', menu: [" + buttonItems + "]}");
				} else {
					menuItems.push("{text: '"+ buttons[button].Label + "',handler:function(){"+ buttons[button].Handler +"}}");
				}
			}
			
			if (button != buttons.length - 1) {
				menuItems.push(", ");
			}
		}
		return menuItems.join("");
	}
	
	function createButtonItems(buttons) {
		var buttonString = [];
		for (var button = 0; button < buttons.length; button++) {
			
			if (isNewVersion) {
				buttonString.push("{text: '" + buttons[button].Label + "',style:'font-size:14px; color:#333333; font-weight:600; padding:0px 12px; line-height:23px; height:23px', listeners: {afterrender: function(){Ext.select('.x-menu').setStyle({'background-image': 'none'})}}");
			}else{
				buttonString.push("{text: '" + buttons[button].Label + "'");
			}
			
			buttons[button].Handler ? buttonString.push(", handler: function(){" + buttons[button].Handler + "}}") : buttonString.push("}");
			if (button != buttons.length -1) {
				buttonString.push(", ");
			}
		}
		return buttonString.join("");
	}
	this.RenderTemplate = function(template, ds) {
		var content = template;
		for (var i in ds) {
			var pattern = new RegExp("{" + i + "}", "g");
			content = content.replace(pattern, String(ds[i]).replace(/\$/gm, "$$$"));
		}
		return content;
	};
	
	this.RenderHandlebarsTemplate = function(template, ds) {
		Handlebars.registerPartial('styles', getTaxTemplate('CSS_STYLES').short);
		var compiledTemplate = Handlebars.compile(template);
		return compiledTemplate(ds);
	};
	
	this.FormatReport = function(reportData, subId, countryCode, languageCode) {
		var formatter = VAT.Report.FormatterSingleton.getInstance(subId, countryCode, languageCode);
		if (typeof reportData.numbers == 'undefined') {
			return;
		}
		
		for (var data in reportData) {
			if (reportData.numbers.indexOf(data) > -1) {
				reportData[data] = formatter.formatCurrency(reportData[data].toString());
			}
		}
	};
};

SFC.System.FindReportId = function(reportName) {
	if (reportName == null || reportName == "")
		throw nlapiCreateError("SFC", id + " is not a valid saved report name.");
	var rs = nlapiSearchGlobal(reportName);
	if (rs == null)
		return null;
	for (var i = 0; i < rs.length; ++i) {
		if (String(rs[i].getValue("name").toLowerCase()).trim() == String(reportName.toLowerCase()).trim()) {
			var reportId = rs[i].getId().replace(/REPO_/, "");  //remove "REPO_" prefix
			return parseInt(reportId);
		}
	}
	return null;
};

SFC.System.Subsidiary = function(id, shouldThrowError, bookId) {
	var context = nlapiGetContext();
	var isMultibook = context.getFeature("MULTIBOOK");
	var isForeignCurrencyMgmt = context.getFeature('FOREIGNCURRENCYMANAGEMENT');
	var isMultiCalendar = context.getFeature('multiplecalendars');
	
	if (!context.getFeature("SUBSIDIARIES")) {
		if (shouldThrowError)
			throw nlapiCreateError("SFC.System.Subsidiary", id + " is not a valid subsidiary id.");
		else
			return null;
	}
	var filters = [new nlobjSearchFilter("internalid", null, "is", parseInt(id))];
	var columns = [new nlobjSearchColumn("name"),
				   new nlobjSearchColumn("country"),
				   new nlobjSearchColumn("taxidnum"),
				   new nlobjSearchColumn("legalname"),
				   new nlobjSearchColumn("namenohierarchy"),
				   new nlobjSearchColumn("zip"),
				   new nlobjSearchColumn("phone"),
				   new nlobjSearchColumn("state"),
				   new nlobjSearchColumn("city"),
				   new nlobjSearchColumn("address1"),
				   new nlobjSearchColumn("address2"),
				   new nlobjSearchColumn("email"),
				   new nlobjSearchColumn("country"),
				   new nlobjSearchColumn("custrecord_subsidiary_branch_id")];
	
	if (isMultiCalendar) {
		columns.push(new nlobjSearchColumn('taxfiscalcalendar'));
	}
	
	var currencyColumn = 'currency';
	if (isMultibook && isForeignCurrencyMgmt && bookId) {
		filters.push(new nlobjSearchFilter('accountingbook', null, 'is', bookId));
		currencyColumn = 'accountingbookcurrency';
	}
	
	columns.push(new nlobjSearchColumn(currencyColumn));
	
	var rs = nlapiSearchRecord("subsidiary", null, filters, columns);
	if (rs == null) {
		if (shouldThrowError)
			throw nlapiCreateError("SFC.System.Subsidiary", id + " is not found.");
		else
			return null;
	}
	var sub = {};
	sub.Id = id;
	sub.Name = rs[0].getValue("name");
	sub.NameNoHeirarchy = rs[0].getValue("namenohierarchy");
	sub.CountryCode = rs[0].getValue("country");
	sub.VRN = rs[0].getValue("taxidnum");
	sub.LegalName = rs[0].getValue("legalname");
	sub.Zip = rs[0].getValue("zip");
	sub.Telephone = rs[0].getValue("phone");
	sub.Address1 = rs[0].getValue("address1");
	sub.Address2 = rs[0].getValue("address2");
	sub.State = rs[0].getValue("state");
	sub.City = rs[0].getValue("city");
	sub.Country = rs[0].getText("country");
	sub.CountryCode = rs[0].getValue("country");
	sub.Email = rs[0].getValue("email");
	sub.Currency =  rs[0].getText(currencyColumn);
	sub.CurrencyId = rs[0].getValue(currencyColumn);
	var addr1 = rs[0].getValue("address1");
	var addr2 = rs[0].getValue("address2");
	sub.Address = addr1 + addr1 == "" || addr2 == "" ? "" : ", " + addr2;
	sub.FiscalCalendar = isMultiCalendar ? rs[0].getValue('taxfiscalcalendar') : '';
	return sub;
};

SFC.System._TaxPeriods = null;
SFC.System._TaxPeriodTree = null;
SFC.System.TaxPeriod = function(id, shouldThrowError) {
	var _ShouldThrowError = shouldThrowError;
	var _FiscalCalendar = null; //only for quarter and year
	var _IsMultiCalendarEnabled = nlapiGetContext().getFeature('multiplecalendars');
	
	this.GetFiscalCalendar = function() { return _FiscalCalendar; };
	this.SetFiscalCalendar = function(value) { _FiscalCalendar = value; };
	
	var _Id = null;
	this.id = '';
	this.GetId = function() { return _Id; };
	this.SetId = function(value) { _Id = value; this.id = value;};

	var _Name = null;
	this.GetName = function() { return _Name; };
	this.SetName = function(value) { _Name = value; };
	
	var _StructuredName = null;
	this.text = '';
	this.GetStructuredName = function() { return _StructuredName; };
	this.SetStructuredName = function(value) { _StructuredName = value; this.text = value;};
	
	var _StartDate = null;
	this.GetStartDate = function() { return _StartDate; };
	this.SetStartDate = function(value) { _StartDate = value; };
	var _EndDate = null;
	this.GetEndDate = function() { return _EndDate; };
	this.SetEndDate = function(value) { _EndDate = value; };
	var _Type = null;  //"year", "quarter", "month"
	this.GetType = function() { return _Type; };
	this.SetType = function(value) { _Type = value; };
	var _IsActive = null;
	this.IsActive = function() { return _IsActive; };
	this.SetActive = function(value) { _IsActive = value; };
	var _IsClosed = null;
	this.IsClosed = function() { return _IsClosed; };
	this.SetClosed = function(value) { _IsClosed = value; };
	var _IsPosting = false;
	this.IsPosting = function() { return _IsPosting; };
	this.SetIsPosting = function(value) { _IsPosting = value; };
	var _ParentId = null;
	this.GetParentId = function() { return _ParentId; };
	this.SetParentId = function(value) { _ParentId = value; };
	var _Children = null;
	this.GetChildren = function() {
		if (_Children == null) {
			_Children = [];
			var periods = LoadAll();
			for (var i in periods) {
				if (periods[i].GetParentId() == _Id)
					_Children.push(periods[i]);
			}
		}
		return _Children;
	}
	
	var _RawStartDate = null;
	this.GetRawStartDate = function() { return _RawStartDate; };
	this.SetRawStartDate = function(value) { _RawStartDate = value; };
	var _RawEndDate = null;
	this.GetRawEndDate = function() { return _RawEndDate; };
	this.SetRawEndDate = function(value) { _RawEndDate = value; };
	
	if (id != null) {
		Load.call(this, id);
	}
	function Load(id) {
		if (id == null || isNaN(parseInt(id))) {
			if (_ShouldThrowError)
				throw nlapiCreateError("SFC.System.TaxPeriod", id + " is not a valid tax period id.");
			else
				return null;
		}
		try {
			var columns = [ new nlobjSearchColumn("internalid"),
							new nlobjSearchColumn("periodname"),
							new nlobjSearchColumn("startdate"),
							new nlobjSearchColumn("enddate"),
							new nlobjSearchColumn("isinactive"),
							new nlobjSearchColumn("isyear"),
							new nlobjSearchColumn("isquarter"),
							new nlobjSearchColumn("isadjust"),
							new nlobjSearchColumn("isposting"),
							new nlobjSearchColumn("parent"),
							new nlobjSearchColumn("allclosed")];
			var filters = [new nlobjSearchFilter('internalid', null, "is", id)];
			var rs = nlapiSearchRecord("taxperiod", null, filters, columns);
			
			_Id = parseInt(id);
			this.id = _Id;
			_Name = rs[0].getValue("periodname");
			this.text = _Name;
			_StructuredName = rs[0].getValue("periodname");
			_StartDate = nlapiStringToDate(rs[0].getValue("startdate"));
			_EndDate = nlapiStringToDate(rs[0].getValue("enddate"));
			_IsActive = rs[0].getValue("isinactive") != "T";
			_IsClosed = rs[0].getValue("allclosed") == "T";
			_IsPosting = rs[0].getValue("isposting") == "T";
			_Type = rs[0].getValue("isadjust") == "T" ? "adjustment" :
				rs[0].getValue("isyear") == "T" ? "year" :
				rs[0].getValue("isquarter") == "T" ? "quarter" : "month";
			
			if (_Type == "year" || _Type == "quarter" && SFC.IsOW) {
				var periodrec = nlapiLoadRecord("taxperiod", id);
				_FiscalCalendar = parseInt(periodrec.getFieldValue("fiscalcalendar")) || parseInt(periodrec.getFieldValue("fc"));
			}
			
			var p = rs[0].getValue("parent");
			_ParentId = parseInt(p);
			_RawStartDate = rs[0].getValue("startdate");
			_RawEndDate = rs[0].getValue("enddate");
		} catch (e) {
			if (_ShouldThrowError)
				throw nlapiCreateError("SFC.System.TaxPeriod", "Tax period id(" + id + ") not found.");
			else
				return null
		}
	}
	this.LoadAll = LoadAll;
	function LoadAll(subid) {
		if (SFC.System._TaxPeriods == null)
		{
			var columns = [ new nlobjSearchColumn("internalid"),
				new nlobjSearchColumn("periodname"),
				new nlobjSearchColumn("startdate"),
				new nlobjSearchColumn("enddate"),
				new nlobjSearchColumn("isinactive"),
				new nlobjSearchColumn("isyear"),
				new nlobjSearchColumn("isquarter"),
				new nlobjSearchColumn("isadjust"),
				new nlobjSearchColumn("isposting"),
				new nlobjSearchColumn("parent"),
				new nlobjSearchColumn("allclosed")];
			columns[2].setSort();  //sort by startdate
			columns[5].setSort(true);  //sort by enddate
			columns[6].setSort(true);  //sort by enddate
			
			if (SFC.IsOW && _IsMultiCalendarEnabled) {
				columns.push(new nlobjSearchColumn("fiscalcalendar"));
			}

            var filters = [];
            SFC.System._TaxPeriods = [];
            var taxPeriodSearch = new nlapiCreateSearch("taxperiod", filters, columns);
            var searchResultSet = taxPeriodSearch.runSearch();
            searchResultSet.forEachResult(function(result){
                SFC.System._TaxPeriods.push(CreateInstanceFromSearchRow(result));
                return true;
            });
		}
		return SFC.System._TaxPeriods;
	}
	this.GetCurrentPeriod = GetCurrentPeriod;
	function GetCurrentPeriod() {
		var today = new Date();
		var periods = LoadAll();
		var firstPeriod = periods.length > 0 ? periods[0] : null;
		var current = { Month: null, Quarter: null, Year: null };
		for (var i = periods.length - 1; i > 0; --i)
		{
			if (periods[i].GetStartDate() <= today && periods[i].GetEndDate() >= today)
			{
				if (periods[i].GetType() == "month")
					current.Month = periods[i];
				else if (periods[i].GetType() == "quarter")
					current.Quarter = periods[i];
				else if (periods[i].GetType() == "year")
					current.Year = periods[i];
			}
		}
		return current.Month != null ? current.Month :
			   current.Quarter != null ? current.Quarter :
			   current.Year != null ? current.Year
			   : firstPeriod;
	}
	function CreateInstanceFromSearchRow(row) {
		if (row == null)
			return null;
		var period = new SFC.System.TaxPeriod();
		period.SetId(parseInt(row.getId()));
		period.SetName(row.getValue("periodname"));
		period.SetStartDate(nlapiStringToDate(row.getValue("startdate")));
		period.SetEndDate(nlapiStringToDate(row.getValue("enddate")));
		period.SetActive(row.getValue("isinactive") != "T");
		period.SetClosed(row.getValue("allclosed") == "T");
		period.SetIsPosting(row.getValue("isposting") == "T");
		period.SetType(row.getValue("isadjust") == "T" ? "adjustment" :
				   row.getValue("isyear") == "T" ? "year" :
				   row.getValue("isquarter") == "T" ? "quarter" : "month");
		var p = row.getValue("parent");
		period.SetParentId((p == null || isNaN(parseInt(p))) ? null : parseInt(p));
		if ((period.GetType() == "year" || period.GetType() == "quarter") && SFC.IsOW) {
			period.SetFiscalCalendar(parseInt(_IsMultiCalendarEnabled ? row.getValue("fiscalcalendar") : "1"));
		}
		period.SetRawStartDate(row.getValue("startdate"));
		period.SetRawEndDate(row.getValue("enddate"));
		
		return period;
	}
	
	this.GetStructuredTaxPeriods = GetStructuredTaxPeriods;
	function GetStructuredTaxPeriods(subid) {
		var visiblePeriods = [];
		var taxPeriods = new SFC.System.TaxPeriod().LoadAll();
		var months = null;
		var enabledMultCal = nlapiGetContext().getFeature('multiplecalendars') == true;
		
		var fs = -1;
		if (subid && SFC.IsOW) {
			var subrec = nlapiLoadRecord('subsidiary', subid);
			fs = subrec.getFieldValue('taxfiscalcalendar');
		}
		
		for (var i in taxPeriods) {
			if (taxPeriods[i].GetType() == "year") {
				if (SFC.IsOW && enabledMultCal) {
					if (fs != taxPeriods[i].GetFiscalCalendar()) continue;
				}
				visiblePeriods.push(taxPeriods[i]);

				var quarters = taxPeriods[i].GetChildren();
				for (var j in quarters) {
					visiblePeriods.push(quarters[j]);

					months = quarters[j].GetChildren();
					for (var k in months) {
						visiblePeriods.push(months[k]);
					}
				}
			} else if (taxPeriods[i].GetType() == "quarter" && taxPeriods[i].GetParentId() == null) {
				if (SFC.IsOW && enabledMultCal) {
					if (fs != taxPeriods[i].GetFiscalCalendar()) continue;
				}
				
				visiblePeriods.push(taxPeriods[i]);

				months = taxPeriods[i].GetChildren();
				for (var l in months)
				{
					visiblePeriods.push(months[l]);
				}
			} else if (taxPeriods[i].GetType() == "month" && taxPeriods[i].GetParentId() == null) {
				visiblePeriods.push(taxPeriods[i]);
			}
		}
		
		for (var i in visiblePeriods) {
			var periodType = visiblePeriods[i].GetType();
			var spaces = (periodType == "month") ? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" : (periodType == "quarter") ? "&nbsp;&nbsp;&nbsp;" : "";
			visiblePeriods[i].SetStructuredName(spaces + visiblePeriods[i].GetName());
		}
		
		return visiblePeriods;
	}
	
	this.GetFiscalYearPeriodIndex = GetFiscalYearPeriodIndex;
	function GetFiscalYearPeriodIndex(periodId, fiscalCalendar, isQuarter) {
		var fyPeriodsList = [];
		var fiscalYearPeriodObj = this.GetParentPeriod(periodId, fiscalCalendar, true);
		if (fiscalYearPeriodObj) {
			fyPeriodsList = this.GetFiscalYearPeriodsList(fiscalYearPeriodObj.getValue('internalid'), (isQuarter == true || isQuarter == 'T' ? 'T' : 'F'));
		}
		
		var index = fyPeriodsList.indexOf(periodId.toString()); 
		return index > -1 ? index + 1 : index;
	}
	
	this.GetFiscalYearPeriodsList = GetFiscalYearPeriodsList;
	function GetFiscalYearPeriodsList(fiscalYearInternalId, isQuarter) {
		
		var fiscalYearPeriodsList = [];
		var fyFilters = [new nlobjSearchFilter('internalid', null, 'is', fiscalYearInternalId)];
		var fyColumns = [new nlobjSearchColumn('internalid'),
		                 new nlobjSearchColumn('startdate'),
		                 new nlobjSearchColumn('enddate')];
		
		if (SFC.IsOW && _IsMultiCalendarEnabled) {
			fyColumns.push(new nlobjSearchColumn("fiscalcalendar"));
		}
		
		var periods = nlapiSearchRecord('taxperiod', null, fyFilters, fyColumns);
		
		if (periods.length > 0) {
			var fiscalYear = periods[0];
			var filters = [new nlobjSearchFilter('startdate', null, 'onorafter', fiscalYear.getValue('startdate')),
			               new nlobjSearchFilter('enddate', null, 'onorbefore', fiscalYear.getValue('enddate')),
			               new nlobjSearchFilter('isyear', null, 'is', 'F'),
			               new nlobjSearchFilter('isquarter', null, 'is', (isQuarter == true || isQuarter == 'T' ? 'T' : 'F'))];
			
			if (SFC.IsOW && _IsMultiCalendarEnabled) {
				filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', fiscalYear.getValue('fiscalcalendar')));
			}
			
			var columns = [new nlobjSearchColumn('internalid'),
			               new nlobjSearchColumn('periodname'),
			               new nlobjSearchColumn('startdate').setSort()];
			
			var result = nlapiSearchRecord('taxperiod', null, filters, columns);
			
			for (var index=0; index<result.length; index++) {
				fiscalYearPeriodsList.push(result[index].getValue('internalid'));
			}
		}

		return fiscalYearPeriodsList;
	}
	
	this.GetParentPeriod = GetParentPeriod;
	function GetParentPeriod(periodId, fiscalCalendar, isParentYear) {
		isParentYear = isParentYear == true || isParentYear == 'T' ? 'T' : 'F';
		
		var filters = [new nlobjSearchFilter('internalid', null, 'is', periodId)];
		var columns = [new nlobjSearchColumn('internalid'),
		               new nlobjSearchColumn('periodname'),
		               new nlobjSearchColumn('startdate'),
		               new nlobjSearchColumn('enddate'),
		               new nlobjSearchColumn('parent'),
		               new nlobjSearchColumn('isyear'),
		               new nlobjSearchColumn('isquarter')];
		
		if (fiscalCalendar) {			
			filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', fiscalCalendar));
			columns.push(new nlobjSearchColumn('fiscalcalendar'));
		}
		
		var periods = nlapiSearchRecord('taxperiod', null, filters, columns);
		var periodObject = null;
		if (periods.length > 0) {
			periodObject = periods[0];
			if (periodObject.getValue('isyear') == 'T') {
				return periodObject;
			} else if (periodObject.getValue('isquarter') == 'T' && isParentYear == 'F') {
				return periodObject;
			} else {
				return this.GetParentPeriod(periodObject.getValue('parent'), (fiscalCalendar ? periodObject.getValue('fiscalcalendar') : fiscalCalendar), isParentYear);
			}
		}
		return null;
	}
	
	this.GetPostingDescendantPeriods = GetPostingDescendantPeriods;
	function GetPostingDescendantPeriods(startDateString, endDateString, fiscalCalendar) {
		var postingDescendantPeriods = [];
		var filters = [new nlobjSearchFilter('isposting', null, 'is', 'T'),
		               new nlobjSearchFilter('startdate', null, 'onorafter', startDateString),
		               new nlobjSearchFilter('enddate', null, 'onorbefore', endDateString)];
		
		var columns = [new nlobjSearchColumn('internalid'),
		               new nlobjSearchColumn('periodname'),
		               new nlobjSearchColumn('isposting'),
		               new nlobjSearchColumn('startdate').setSort()];
		
		if (fiscalCalendar) {			
			filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', fiscalCalendar));
			columns.push(new nlobjSearchColumn('fiscalcalendar'));
		}
		
		var periods = nlapiSearchRecord('taxperiod', null, filters, columns);
		if (periods.length > 0) {
			for (var index=0; index<periods.length; index++) {
				postingDescendantPeriods.push(periods[index].getValue('internalid'));
			}
		}
		
		return postingDescendantPeriods;
	}
};

SFC.System.SubsidiaryCombobox = function(form, fieldName, label, defaultId, layoutType, subsidiaryList, tabname, breaktype) {
	var cbo; 
	if (tabname) {
		cbo = form.addField(fieldName, "select", label, null, tabname);
	} else {
		cbo = form.addField(fieldName, "select", label, null);
	}
	
	if (layoutType != null)
		cbo.setLayoutType(layoutType);
	
	if (breaktype) {
		cbo.setBreakType(breaktype);
	}
	cbo.setDisplaySize(300);
	
	var filters = [new nlobjSearchFilter("isinactive", null, "is", "F")];
	var columns = [new nlobjSearchColumn("name"), new nlobjSearchColumn("namenohierarchy")];
	if (subsidiaryList && subsidiaryList.length > 0) {
		filters.push(new nlobjSearchFilter("internalid", null, "anyof", subsidiaryList));
	}
	
	var rs = nlapiSearchRecord("subsidiary", null, filters, columns);
	if (rs == null)
		return;
	var stack = [];
	for (var i in rs) {
		var id = rs[i].getId();
		var subName = rs[i].getValue("name");
		var count = subName.match(/ : /g) == null ? 0 : subName.match(/ : /g).length;
		for (var leadingSpaces = "", j = 0; j < count; ++j)
			leadingSpaces += "&nbsp;&nbsp;&nbsp;"; 
		var isSelected = defaultId != null && defaultId == id;
		cbo.addSelectOption(id, leadingSpaces + rs[i].getValue("namenohierarchy"), isSelected);
	}
};

SFC.System.AccountingBookCombobox = function(form, fieldName, label, defaultId, layoutType, tabname, breaktype, bookList) {
	var cbo; 
	if (tabname) {
		cbo = form.addField(fieldName, "select", label, null, tabname);
	} else {
		cbo = form.addField(fieldName, "select", label, null);
	}
	
	if (layoutType != null)
		cbo.setLayoutType(layoutType);
	
	if (breaktype) {
		cbo.setBreakType(breaktype);
	}
	cbo.setDisplaySize(300);
	
	
	for (var i in bookList) {
		var id = bookList[i].id;
		var bookName = bookList[i].name;
		var isPrimaryBook = bookList[i].isprimary == 'T';
		//if not Book is selected yet, default selection should be the Primary Book
		var isSelected = (defaultId == null && isPrimaryBook) || (defaultId != null && defaultId == id);
				
		cbo.addSelectOption(id, bookName, isSelected);
	}
};

SFC.System.TaxPeriodCombobox = function(form, fieldName, label, defaultId, layoutType, subid) {
	var cbo = form.addField(fieldName, "select", label);
	if (layoutType != null)
		cbo.setLayoutType(layoutType);
	cbo.setDisplaySize(150);
	var fs = -1;
	if (subid && SFC.IsOW) {
		var subrec = nlapiLoadRecord('subsidiary', subid);
		fs = subrec.getFieldValue('taxfiscalcalendar');
	}
	
	var taxPeriods = new SFC.System.TaxPeriod().LoadAll();
	var visiblePeriods = [];
	var months = null;
	var enabledMultCal = nlapiGetContext().getFeature('multiplecalendars') == true;
	
	for (var i in taxPeriods) {
		if (taxPeriods[i].GetType() == "year") {
			if (SFC.IsOW && enabledMultCal) {
				if (fs != taxPeriods[i].GetFiscalCalendar()) continue;
			}
			visiblePeriods.push(taxPeriods[i]);
			var quarters = taxPeriods[i].GetChildren();
			for (var j in quarters) {
				visiblePeriods.push(quarters[j]);
				months = quarters[j].GetChildren();
				for (var k in months) {
					visiblePeriods.push(months[k]);
				}
			}
		} else if (taxPeriods[i].GetType() == "quarter" && taxPeriods[i].GetParentId() == null) {
			if (SFC.IsOW && enabledMultCal) {
				if (fs != taxPeriods[i].GetFiscalCalendar()) continue;
			}
			
			visiblePeriods.push(taxPeriods[i]);
			months = taxPeriods[i].GetChildren();
			for (var l in months)
			{
				visiblePeriods.push(months[l]);
			}
		} else if (taxPeriods[i].GetType() == "month" && taxPeriods[i].GetParentId() == null) {
			visiblePeriods.push(taxPeriods[i]);
		}
	}
	for (var i in visiblePeriods) {
		var periodType = visiblePeriods[i].GetType();
		var spaces = (periodType == "month") ? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" : (periodType == "quarter") ? "&nbsp;&nbsp;&nbsp;" : "";
		var isSelected = defaultId != null && defaultId == visiblePeriods[i].GetId();
		cbo.addSelectOption(visiblePeriods[i].GetId(), spaces + visiblePeriods[i].GetName(), isSelected);
	}
	return cbo;
};

SFC.System.LocationCombobox = function(form, fieldName, label, defaultId, layoutType, tabname, breaktype, subid, locationList) {
	var locations = getLocations(subid, locationList);
	
	var cbo;
	if (tabname) {
		cbo = form.addField(fieldName, "select", label, null, tabname);
	} else {
		cbo = form.addField(fieldName, "select", label, null);
	}
	
	if (layoutType != null)
		cbo.setLayoutType(layoutType);
	
	if (breaktype) {
		cbo.setBreakType(breaktype);
	}
	cbo.setDisplaySize(150);
	
	if (!locations) {
		return;
	}
	cbo.addSelectOption('', '');
	for (var i in locations) {
		var id = locations[i].id;
		var subName = locations[i].name;
		var count = subName.match(/ : /g) == null ? 0 : subName.match(/ : /g).length;
		for (var leadingSpaces = "", j = 0; j < count; ++j)
			leadingSpaces += "&nbsp;&nbsp;&nbsp;";
		isSelected = defaultId ? defaultId == id : false;
		cbo.addSelectOption(id, leadingSpaces + locations[i].label, isSelected);
	}
	
	function getLocations(subid, locationList) {
		var filters = [];
		if (subid) {
			filters.push(new nlobjSearchFilter("subsidiary", null, "anyof", subid));
		}
		if (locationList.length > 0) {
			filters.push(new nlobjSearchFilter("internalid", null, "anyof", locationList));
		}
		
		var columns = [new nlobjSearchColumn("name"), 
					   new nlobjSearchColumn("namenohierarchy")];
		
		var rs = nlapiSearchRecord("location", null, filters, columns);
		
		if (!rs){
			return null;
		}
		
		var locations = [];
		for (var i in rs) {
			locations.push({id : rs[i].getId(), name : rs[i].getValue('name'), label : rs[i].getValue('namenohierarchy')});
		}
		return locations;
	}
};

SFC.System.createOutputFolder = function ( rootFolder ) {
	var arrayRootFolder = nlapiSearchRecord('folder', null, new nlobjSearchFilter('name', null, 'is', rootFolder), new nlobjSearchColumn('internalid'));
	var subfolderId = '';
	var parentFolderId = '';
	// create the root folder if necessary...
	if (arrayRootFolder == null || arrayRootFolder.length == 0) {
		var parentfolder = nlapiCreateRecord('folder');
		parentfolder.setFieldValue('name', rootFolder);
		parentFolderId = nlapiSubmitRecord(parentfolder);
	}
	else {
		parentFolderId = arrayRootFolder[0].getValue('internalid');
	}
	return parentFolderId;
};

SFC.System.createFile = function (filename, content, outputFolderId, filetype, seriesnumber, extension) {
	var newfilename = [filename, seriesnumber].join("_") + (extension?extension:'.txt');
	var fileobj = nlapiCreateFile(newfilename, (filetype?filetype:'PLAINTEXT'), content);
	
	fileobj.setFolder(outputFolderId);
	fileobj.setEncoding("UTF-8");
	var fileid = nlapiSubmitFile(fileobj);
	
	return {"id":String(parseInt(fileid)), "name":newfilename};
};

SFC.System.createFileName = function (prefix, fileparts) {
	var filename = [prefix, nlapiGetUser()];
	for(var ipart in fileparts) {
		filename.push(fileparts[ipart]);
	}
		
	return newfilename = filename.join("_");
};

SFC.System.loadFileContent = function (fileid) {
	var content = "";
	try {
		var fileobj = nlapiLoadFile(parseInt(fileid));
		fileobj.setEncoding("UTF-8");
		content = fileobj.getValue();
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "SFC.System.loadFileContent", errorMsg);
	}
	
	return content;
};

SFC.System.getBaseURL = function (request) {
	try {
		return request.getURL().split('/app')[0];
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "SFC.System.getBaseURL", errorMsg);
	}
};

SFC.System.getViewRestrictionSettings = function(classification) { //subsidiary, location, class
	var settings = {id : '', includesubordinates : false, includeunassigned : false};
	var currentSettings = nlapiGetRestrictViewSettings(classification);
	
	if (!currentSettings) {
		return settings;
	}
	settings.id = currentSettings.getClassId();
	settings.includesubordinates = currentSettings.getIncludeSubordinates();
	settings.includeunassigned = currentSettings.getIncludeUnassigned();
	return settings;
};
