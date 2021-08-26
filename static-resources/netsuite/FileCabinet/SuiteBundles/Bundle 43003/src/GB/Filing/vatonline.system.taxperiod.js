/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

var System = System || {};
System.Period = System.Period || {};

System.Period.TPeriod = function(id) {
	var _Id = null;
	this.GetId = function() { return _Id; };
	this.SetId = function(value) { _Id = value; };
	
	var _Name = null;
	this.GetName = function() { return _Name; };
	this.SetName = function(value) { _Name = value; };
	
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

	var _ParentId = null;
	this.GetParentId = function() { return _ParentId; };
	this.SetParentId = function(value) { _ParentId = value; };

	
	if(id != null) {
		Load(id);
	}
	
	function Load(id) {
		if(id == null || isNaN(parseInt(id))) {
			return null;
		}
		
		var rec = nlapiLoadRecord("taxperiod", id);
		if(rec == null) {
			return null;
		}

		_Id = parseInt(rec.getId());
		_Name = rec.getFieldValue("periodname");
		_StartDate = nlapiStringToDate(rec.getFieldValue("startdate"));
		_EndDate = nlapiStringToDate(rec.getFieldValue("enddate"));
		_IsActive = rec.getFieldValue("isinactive") != "T";
		_IsClosed = rec.getFieldValue("allclosed") == "T";
		_Type = rec.getFieldValue("isadjust") == "T"? "adjustment": rec.getFieldValue("isyear") == "T"? "year": rec.getFieldValue("isquarter") == "T"? "quarter": "month";
		var p = rec.getFieldValue("parent");
		_ParentId = (p == null || isNaN(parseInt(p))) ? null: parseInt(p);
	}
	
	this.GetChildren = GetChildren;
	function GetChildren() {
		if(_Id == null || isNaN(parseInt(_Id))) {
			return [];
		}
			
		if(_Type == "month" || _Type == "adjustment") {
			return [];
		}
		
		var filters = [new nlobjSearchFilter("internalidnumber", null, "greaterthan", _Id)];
		if(_Type == "year") {
			filters.push(new nlobjSearchFilter("isquarter", null, "is", true));
		} else if(_Type == "quarter") {
			filters.push(new nlobjSearchFilter("isquarter", null, "is", false));
			filters.push(new nlobjSearchFilter("isyear", null, "is", false));
			filters.push(new nlobjSearchFilter("isadjust", null, "is", false));
		}
			
		var rs = nlapiSearchRecord("taxperiod", null, filters, GetPeriodColumns());
		if (rs == null) {
			return [];
		}
		
		var children = [];
		for(var i in rs) {
			var oTaxPeriod = CreateInstanceFromSearchRow(rs[i]);
			
			if(oTaxPeriod.GetParentId() == _Id) {
				children.push( oTaxPeriod);
			}
		}
		return children;
	}
	
	
	this.LoadAll = LoadAll;
	function LoadAll() {
		var columns = GetPeriodColumns();
		columns[2].setSort();
		var filters = null;
		
		var rs = nlapiSearchRecord("taxperiod", null, filters, columns);
		if (rs == null) {
			return [];
		}
		
		var tp = [];
		for(var i in rs) {
			tp.push( CreateInstanceFromSearchRow(rs[i]));
		}
		
		return tp;
	}
	
	function GetPeriodColumns() {
		return [
			new nlobjSearchColumn("internalid"),
			new nlobjSearchColumn("periodname"),
			new nlobjSearchColumn("startdate"),
			new nlobjSearchColumn("enddate"),
			new nlobjSearchColumn("isinactive"),
			new nlobjSearchColumn("isyear"),
			new nlobjSearchColumn("isquarter"),
			new nlobjSearchColumn("isadjust"),
			new nlobjSearchColumn("parent"),
			new nlobjSearchColumn("allclosed")
		];
	}

	function CreateInstanceFromSearchRow(row) {
		if(row == null) {
			return null;
		}
		var period = new System.Period.TPeriod();
		period.SetId(parseInt(row.getId()));
		period.SetName(row.getValue("periodname"));
		period.SetStartDate(nlapiStringToDate(row.getValue("startdate")));
		period.SetEndDate(nlapiStringToDate(row.getValue("enddate")));
		period.SetActive(row.getValue("isinactive") != "T");
		period.SetClosed(row.getValue("allclosed") == "T");
		period.SetType(row.getValue("isadjust") == "T" ? "adjustment": row.getValue("isyear") == "T"? "year": row.getValue("isquarter") == "T"? "quarter": "month");
		
		var p = row.getValue("parent");
		period.SetParentId( (p == null || isNaN(parseInt(p)))? null: parseInt(p));
		
		return period;
	}
};