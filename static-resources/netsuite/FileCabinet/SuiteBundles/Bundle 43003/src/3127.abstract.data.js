/**
 * Copyright © 2014, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) VAT = {};
VAT.DATEFORMAT = "dd-MM-yyyy";

VAT.REPORT = {
	SLS: "Sales Summary By Entity [4444]",
	SLP: "Purchase Summary By Entity [4444]"
};

VAT.PeriodSummary = function(taxcodeDefinitions, splitReturn) {
	var _Summaries = {};

	for (var i in taxcodeDefinitions.GetEntries()) {
		_Summaries[i] = { NetAmount: 0, TaxAmount: 0, NotionalAmount: 0,GrossAmount: 0 };
		if (splitReturn) {
			_Summaries[String(i) + "_R"] = { NetAmount: 0, TaxAmount: 0, NotionalAmount: 0, GrossAmount: 0};
		}
	}

	this.Summary = _Summaries;
	this.Of = function(taxcodeType) {
		var obj = _Summaries[taxcodeType];
		if (obj) {obj.GrossAmount = obj.NetAmount + obj.TaxAmount};

		return obj ? obj : null;
	};

	this.Accrue = function(arrtypes) {
		var accrual = { NetAmount: 0, TaxAmount: 0, NotionalAmount: 0, GrossAmount: 0 };

		for(var iaccrual = 0; iaccrual < arrtypes.length; iaccrual++) {
			var summaryobj = _Summaries[arrtypes[iaccrual]] ? _Summaries[arrtypes[iaccrual]] : null;

			if (summaryobj) {
				accrual.NetAmount += summaryobj.NetAmount;
				accrual.TaxAmount += summaryobj.TaxAmount;
				accrual.NotionalAmount += summaryobj.NotionalAmount;
				accrual.GrossAmount += summaryobj.NetAmount + summaryobj.TaxAmount;
			}
		}

		return accrual;
	};
};

VAT.AdjustmentSummary = function(taxdef, taxmap, otherSummary) {
	var _Summaries = {};

	for(var imap in taxmap) {
		_Summaries[imap] = {};
		for (var ientry in taxdef.GetEntries()) {
		    _Summaries[imap][ientry] = { NetAmount: 0, TaxAmount: 0, NotionalAmount: 0, GrossAmount: 0};
		    if(otherSummary){
		        for(var i = 0; i < otherSummary.length; i++){
		            _Summaries[imap][ientry][otherSummary[i]] = { NetAmount: 0, TaxAmount: 0, NotionalAmount: 0, GrossAmount: 0};
		        }
		    }
		}
	}

	this.Summary = _Summaries;
	this.Of = function(field, taxtype, ignorecase, otherSummary) {
		var fieldid = ignorecase ? field.toLowerCase() : field;
		return otherSummary?_Summaries[fieldid][taxtype][otherSummary]:_Summaries[fieldid][taxtype];
	};

	this.Accrue = function(field, arrtypes, ignorecase) {
		var accrual = { NetAmount: 0, TaxAmount: 0, NotionalAmount: 0, GrossAmount: 0};
		var fieldid = ignorecase ? field.toLowerCase() : field;

		for(var iaccrual = 0; iaccrual < arrtypes.length; iaccrual++) {
			var summaryobj = _Summaries[fieldid][arrtypes[iaccrual]] ? _Summaries[fieldid][arrtypes[iaccrual]] : null;

			if (summaryobj) {
				accrual.NetAmount += summaryobj.NetAmount;
				accrual.TaxAmount += summaryobj.TaxAmount;
				accrual.NotionalAmount += summaryobj.NotionalAmount;
				accrual.GrossAmount += summaryobj.NetAmount + summaryobj.TaxAmount;
			}
		}

		return accrual;
	};
};

VAT.PeriodSummaryByType = function(taxcodeDefinitions) {
	var _Summaries = {};

	for (var i in taxcodeDefinitions.GetEntries()) {
		_Summaries[i] = {};
	}

	this.Accrue = function(taxcodelist) {
		var obj = {};

		obj.Sum = function(trantypelist) {
			var accrual = {NetAmount: 0, TaxAmount: 0, NotionalAmount: 0, GrossAmount: 0};
			for(var itaxcode = 0; itaxcode < taxcodelist.length; itaxcode++) {
				var summaryobj = _Summaries[taxcodelist[itaxcode]];

				for(var itype in trantypelist) {
					var objType = trantypelist[itype];
					if (summaryobj[objType]) {
						accrual.NetAmount += summaryobj[objType].NetAmount;
						accrual.TaxAmount += summaryobj[objType].TaxAmount;
						accrual.NotionalAmount += summaryobj[objType].NotionalAmount;
						accrual.GrossAmount += summaryobj[objType].NetAmount + summaryobj[objType].TaxAmount;
					}
				}
			}

			return accrual;
		};

		return obj;
	};

	this.Summary = _Summaries;
	this.Of = function(type) {
		if (!_Summaries[type]) {
			return null;
		}
		var obj = _Summaries[type];
		obj.Get = function(tranType) {
			if (!obj[tranType]) {
				obj[tranType] = {TranType:tranType, NetAmount: 0, TaxAmount: 0, NotionalAmount: 0, GrossAmount: 0};
			}
			return obj[tranType];
		};
		obj.Sum = function(filter) {
			var accrual = {NetAmount: 0, TaxAmount: 0, NotionalAmount: 0, GrossAmount: 0};
			for(var i in filter) {
				var objFilter = filter[i];
				if (obj[objFilter]) {
					accrual.NetAmount += obj[objFilter].NetAmount;
					accrual.TaxAmount += obj[objFilter].TaxAmount;
					accrual.NotionalAmount += obj[objFilter].NotionalAmount;
					accrual.GrossAmount += obj[objFilter].NetAmount + obj[objFilter].TaxAmount;
				}
			}

			return accrual;
		};
		return obj;
	};
};

VAT.GetTaxPeriodList = function(fromperiodid, toperiodid) {
	var taxperiods = new SFC.System.TaxPeriod().LoadAll();
	var periodlist = [];
	var include = false;

	var periodmap = {};

	for(var iperiod = 0; iperiod < taxperiods.length; iperiod++) {

		if (taxperiods[iperiod].GetId() == fromperiodid) {
			include = true;
		}

		if (include && taxperiods[iperiod].GetType() == 'month') { //continue adding if monthly
			var monthid = taxperiods[iperiod].GetId();
			periodmap[monthid] = true;
		}

		if (include && taxperiods[iperiod].IsPosting() && taxperiods[iperiod].GetType() != 'month') {
			var monthid = taxperiods[iperiod].GetId();
			periodmap[monthid] = true;
		}

		if (taxperiods[iperiod].GetId() == toperiodid) {
			include = false;

			if (taxperiods[iperiod].GetType() != 'month') {
				var endperiodchildren = taxperiods[iperiod].GetChildren();

				for(var ichild = 0; ichild < endperiodchildren.length; ichild++) { //append all months
					if (endperiodchildren[ichild].GetType() == 'month' || endperiodchildren[ichild].IsPosting()) {
						periodmap[endperiodchildren[ichild].GetId()] = true;
					} else if (endperiodchildren[ichild].GetType() == 'quarter') {
						var quarterchildren = endperiodchildren[ichild].GetChildren();
						for(var iquarter = 0; iquarter < quarterchildren.length; iquarter++) {
							periodmap[quarterchildren[iquarter].GetId()] = true;
						}
					}
				}
			}
			break;
		}
	}

	for(var iperiod in periodmap) {
		periodlist.push(parseInt(iperiod));
	}

	return periodlist;
};

VAT.DataReader = function(taxcodeDefs, periodId, periodId2, subId, isConsolidated, salecacheid, purchasecacheid) {
	var _SALES_REPORT_NAME = "Sales by Tax Code [GB]";
	var _PURCHASE_REPORT_NAME = "Purchases by Tax Code [GB]";
	var _SALES_SUMMARY_REPORT_NAME = "Sales Summary by Tax Code [4444]";
	var _PURCHASE_SUMMARY_REPORT_NAME = "Purchase Summary by Tax Code [4444]";
	var _SALES_SUMMARY_BY_TYPE_REPORT_NAME = "Sales Summary by Tax Code and Tran Type [4444]";
	var _PURCHASE_SUMMARY_BY_TYPE_REPORT_NAME = "Purchase Summary by Tax Code and Tran Type [4444]";

	// For UAE only
	var _SALES_SUMMARY_BY_EMIRATE_REPORT_NAME = "Sales Summary by Tax Code and Emirate";
	var _PURCHASE_SUMMARY_BY_EMIRATE_REPORT_NAME = "Purchase Summary by Tax Code and Emirate";

	var _Context = nlapiGetContext();
	var _IsMultiCurrency = _Context.getFeature("multicurrency");
	var _IsMultibook = _Context.getFeature("MULTIBOOK");

	var _TaxcodeDefinitions = taxcodeDefs;
	var _PeriodId = periodId;
	var _PeriodId2 = periodId2;
	var _SubId = subId;
	var _IsConsolidated = isConsolidated;
	var _SaleCacheId = salecacheid;
	var _PurchaseCacheId = purchasecacheid;

	var _TaxCodes = {};
	var _TaxCodeRates = {};
	var _BookId = null;
	var _TaxCodeIds = null;
	var _TranTypes = null;
	var _TransactionRegions = null;
	var _SalesReport = null;
	var _PurchaseReport = null;
	var _SalesJournalReport = null;
	var _PurchaseJournalReport = null;
	var _SalesByTypeReport = null;
	var _PurchaseByTypeReport = null;
	var _NexusId = null;
	var _IsCashBasisReporting = null;

	var dateformat = VAT.DATEFORMAT;
	var _ReportSettings = null;

    var _IsOnlineFiling = null;

	if (arguments.length == 1) {
		setParameters(arguments[0]);
	}
	_ReportSettings = initReportSettings({periodFrom:_PeriodId, periodTo:_PeriodId2, subId:_SubId, bookId:_BookId, nexusId:_NexusId, isCashBasisReporting: _IsCashBasisReporting});


	function setParameters(params) {
		_SubId = params.subId;
		_IsConsolidated = params.isConsolidated;
		_PeriodId = params.periodFrom;
		_PeriodId2 = params.periodTo;
		_SaleCacheId = params.saleCacheId;
		_PurchaseCacheId = params.purchaseCacheId;
		_BookId = params.bookId;
		_TaxcodeDefinitions = params.taxCodeDefs;
		_NexusId = params.nexusId;
		_IsCashBasisReporting = params.isCashBasisReporting;
        _IsOnlineFiling = params.isOnlineFiling;
	}

	function initReportSettings(params) {
		if (!params.periodFrom || !params.periodTo) {
			return null;
		}

		var reportSettings = new nlobjReportSettings(params.periodFrom.toString(), params.periodTo.toString());
		if (_App.IsOneWorld) {
			reportSettings.setSubsidiary(_IsConsolidated ? -params.subId : params.subId);
		}
		if (_Context.getFeature('multibook') && params.bookId) {
			reportSettings.setAccountingBookId(params.bookId);
		}
		if (params.nexusId) {
			reportSettings.setTaxCashBasisMode(params.isCashBasisReporting);
		}
		
		return reportSettings;
	}

	this.SetDateFormat = function (newdateformat) { dateformat = newdateformat;};
	this.GetDateFormat = function () {return dateformat;};

	this.GetSalesSummary = function() { return GetSummaryFrom(GetSummarySalesReport()); };
	this.GetPurchaseSummary = function() { return GetSummaryFrom(GetSummaryPurchaseReport()); };

	this.GetNonDeductibleSummary = function(groupByType) { return GetNonDeductibleTaxSummary(groupByType, false); };
	this.GetNonDeductibleSummaryBelgium = function(groupByType) { return GetNonDeductibleTaxSummary(groupByType, true); };

    this.GetSalesByTypeSummary = function() { return GetSummaryByTypeFrom(GetSummarySalesByTypeReport()); };
    this.GetPurchaseByTypeSummary = function() { return GetSummaryByTypeFrom(GetSummaryPurchaseByTypeReport()); };

    this.GetSalesByEmirateSummary = function() { return GetSummaryByEmirateFrom(GetSummarySalesByEmirateReport()); };
    this.GetPurchaseByEmirateSummary = function() { return GetSummaryByEmirateFrom(GetSummaryPurchaseByEmirateReport()); };

	this.GetAllSaleDetails = function() {return GetDetailsFromV2(GetSalesReport(), ["ALL"]).concat(GetAdjustmentSalesDetails(["ALL"])); };
	this.GetAllPurchaseDetails = function() {
		var details = GetDetailsFromV2(GetPurchaseReport(), ["ALL"]).concat(
					  GetAdjustmentPurchaseDetails(["ALL"]).concat(
					  GetNonDeductibleTaxDetail(["ALL"])));
		return details;
	};
	
	this.GetSalesAdjustmentSummary = function (taxmap, ignorecase, otherSummary) { return getAdjustmentSummary("SALE", _TaxcodeDefinitions, taxmap, ignorecase, otherSummary);};
	this.GetPurchaseAdjustmentSummary = function (taxmap, ignorecase, otherSummary) {return getAdjustmentSummary("PURCHASE", _TaxcodeDefinitions, taxmap, ignorecase, otherSummary);};
	function getAdjustmentSummary(type, taxdef, taxmap, ignorecase, otherSummary) {
		try {
			var periodlist = VAT.GetTaxPeriodList (_PeriodId, _PeriodId2);
			var summary = new VAT.AdjustmentSummary(taxdef, taxmap, otherSummary);
			var periodFrom = new SFC.System.TaxPeriod(_PeriodId);
			var periodTo = new SFC.System.TaxPeriod(_PeriodId2);

			nlapiLogExecution("Debug", "getAdjustmentSummary",
					JSON.stringify({periodId:_PeriodId, periodId2:_PeriodId2, periodlist:periodlist,
						periodFrom: periodFrom.GetStartDate(), periodTo:periodTo.GetEndDate()}));

			var filters = [
				new nlobjSearchFilter("type", null, "is", "Journal"),
				new nlobjSearchFilter("mainline", null, "is", "T"),
				new nlobjSearchFilter("custbody_adjustment_journal", null, "is", "T"),
				new nlobjSearchFilter("custcol_adjustment_tax_code", null, "noneof", "@NONE@"),
				new nlobjSearchFilter("custcol_adjustment_field", null, "isnotempty"),
				new nlobjSearchFilter("posting", null, "is", "T"),
				new nlobjSearchFilter("trandate", null, "within", nlapiDateToString(periodFrom.GetStartDate()), nlapiDateToString(periodTo.GetEndDate()))
			];
			filters.push(new nlobjSearchFilter("accounttype", null, "anyof", type == "PURCHASE"?'OthCurrAsset':'OthCurrLiab'));

			if (_App.IsOneWorld && _SubId) {
				filters.push(new nlobjSearchFilter("subsidiary", null, "is", _SubId));
			}

			var amountJoinColumn = null;
			var amountColumn = _IsMultiCurrency ? 'fxamount' : 'amount';

			if (_IsMultibook && _BookId) {
				filters.push(new nlobjSearchFilter('accountingbook', 'accountingtransaction', 'is', _BookId));
				amountJoinColumn = 'accountingtransaction';
				amountColumn = 'fxamount';
			}

			var columns = [
				new nlobjSearchColumn("custcol_adjustment_tax_code", null, "group"),
				new nlobjSearchColumn("taxperiod", null, "group"),
				new nlobjSearchColumn("custcol_adjustment_field", null, "group"),
				new nlobjSearchColumn(amountColumn, amountJoinColumn, "sum")
			];
			
			if(otherSummary){
			    columns.push(new nlobjSearchColumn("custcol_emirate", null, "group"));
			}

			var rs = nlapiSearchRecord("transaction", null, filters, columns);
			for(var irs in rs) {
				var amount = rs[irs].getValue(amountColumn, amountJoinColumn, "sum");
				var taxcodename = rs[irs].getText("custcol_adjustment_tax_code", null, "group");
				var period = Number(rs[irs].getValue("taxperiod", null, "group"));
				var field = rs[irs].getValue("custcol_adjustment_field", null, "group");
				var emirate = null;
				if(otherSummary){
				    var emirate = rs[irs].getText("custcol_emirate", null, "group");
				}

				if (!field || periodlist.indexOf(period) == -1) continue;

				var taxcode = FindTaxcodeByName(taxcodename);
				if (!taxcode) continue;

				var taxtype = taxdef.GetTypeOf(taxcode);
				if (!taxtype) continue;

				var summaryobj = summary.Of(field, taxtype, ignorecase);
				if (summaryobj != null) {
				    summaryobj.TaxAmount += Number(amount);
				    if(otherSummary && otherSummary.indexOf(emirate)>-1){
				        summaryobj[emirate].TaxAmount += Number(amount);
				    }
				}
			}
		} catch(ex) {logException(ex, "getAdjustmentSummary");}
		return summary;
	}

	this.GetAdjustmentSalesDetails = GetAdjustmentSalesDetails;
	function GetAdjustmentSalesDetails(filters, field) {return getAdjustmentDetails("SALE", field, _TaxcodeDefinitions, filters);}
	this.GetAdjustmentPurchaseDetails = GetAdjustmentPurchaseDetails;
	function GetAdjustmentPurchaseDetails(filters, field) {return getAdjustmentDetails("PURCHASE", field, _TaxcodeDefinitions, filters);}

	function getAdjustmentDetails (type, field, taxdef, typelist) {
		var taxCache = new VAT.TaxCache();
		var list = [];
		try {
			var cacheid = type=="SALE"?_SaleCacheId:_PurchaseCacheId;
			if (cacheid) {
				var detailcontent = (_PurchaseCacheId==-1)? taxCache.GetSysNoteCache(_SaleCacheId, type).detail:taxCache.GetTaxCache(cacheid).detail;
				var tempdetails = detailcontent;

				for(var irow = 0 ; irow < tempdetails.length; irow++) {
					var currentdetail = tempdetails[irow];
					if (field != currentdetail[26]) {
						continue;
					} else if (filters.indexOf(currentdetail[9]) > -1 && field == currentdetail[26]) {
						list.push(currentdetail);
					}
				}
			} else {
				var periodlist = VAT.GetTaxPeriodList (_PeriodId, _PeriodId2);
				var periodFrom = new SFC.System.TaxPeriod(_PeriodId);
				var periodTo = new SFC.System.TaxPeriod(_PeriodId2);

				var filters = [
					new nlobjSearchFilter("type", null, "is", "Journal"),
					new nlobjSearchFilter("mainline", null, "is", "T"),
					new nlobjSearchFilter("custbody_adjustment_journal", null, "is", "T"),
					new nlobjSearchFilter("custcol_adjustment_tax_code", null, "noneof", "@NONE@"),
					new nlobjSearchFilter("posting", null, "is", "T"),
					new nlobjSearchFilter("trandate", null, "within", nlapiDateToString(periodFrom.GetStartDate()), nlapiDateToString(periodTo.GetEndDate()))
				];

				if (field) {
					filters.push(new nlobjSearchFilter("custcol_adjustment_field", null, "is", field));
				}

				var source = type == "PURCHASE"?"vendor":"customer";
				filters.push(new nlobjSearchFilter("accounttype", null, "anyof", type == "PURCHASE"?'OthCurrAsset':'OthCurrLiab'));

				var amountJoinColumn = null;
				var amountColumn = _IsMultiCurrency ? 'fxamount' : 'amount';

				if (_IsMultibook && _BookId) {
					filters.push(new nlobjSearchFilter('accountingbook', 'accountingtransaction', 'is', _BookId));
					amountJoinColumn = 'accountingtransaction';
					amountColumn = 'fxamount';
				}

				var columns = [
				   new nlobjSearchColumn("custcol_adjustment_tax_code", null, "group"),
				   new nlobjSearchColumn("taxperiod", null, "group"),
				   new nlobjSearchColumn("custcol_adjustment_field", null, "group"),
				   new nlobjSearchColumn("tranid", null, "group"),
				   new nlobjSearchColumn("internalid", null, "group"),
				   new nlobjSearchColumn("trandate", null, "group"),
				   new nlobjSearchColumn("entity", null, "group"),
				   new nlobjSearchColumn("type", null, "group"),
				   new nlobjSearchColumn("custbody_report_timestamp", null, "group"),
				   new nlobjSearchColumn("lastname", source, "group"),
				   new nlobjSearchColumn("firstname", source, "group"),
				   new nlobjSearchColumn("middlename", source, "group"),
				   new nlobjSearchColumn("companyname", source, "group"),
				   new nlobjSearchColumn("isperson", source, "group"),
				   new nlobjSearchColumn("vatregnumber", source, "group"),
				   new nlobjSearchColumn("memo", null, "group"),
				   new nlobjSearchColumn("address", source, "group"),
				   new nlobjSearchColumn("custentity_tax_contact_last", source, "group"),
				   new nlobjSearchColumn("custentity_tax_contact_middle", source, "group"),
				   new nlobjSearchColumn("custentity_tax_contact_first", source, "group"),
				   new nlobjSearchColumn("rate", "custcol_adjustment_tax_code", "group"),
				   new nlobjSearchColumn(amountColumn, amountJoinColumn, 'sum')
				];

				if (_App.IsOneWorld && _SubId) {
					filters.push(new nlobjSearchFilter("subsidiary", null, "is", _SubId));
				}

				var rs = nlapiSearchRecord("transaction", null, filters, columns);
				for(var irs in rs) {
					var amount = rs[irs].getValue(amountColumn, amountJoinColumn, "sum");
					var taxcodename = rs[irs].getText("custcol_adjustment_tax_code", null, "group");
					var period = Number(rs[irs].getValue("taxperiod", null, "group"));
					var field = rs[irs].getValue("custcol_adjustment_field", null, "group");
					var tranid = rs[irs].getValue("tranid", null, "group");
					tranid = tranid?tranid:"";
					var entity = formatValue(rs[irs].getText("entity", null, "group"));
					var trantype = rs[irs].getText("type", null, "group");
					var timestamp = rs[irs].getValue("custbody_report_timestamp", null, "group");
					var trandate = rs[irs].getValue("trandate", null, "group");
					var tempdate = nlapiStringToDate(trandate);
					if (tempdate) {
						trandate = tempdate.toString(dateformat);
					}

					if (!field || periodlist.indexOf(period) == -1) continue;

					var taxcode = FindTaxcodeByName(taxcodename);
					if (!taxcode) continue;

					var taxtype = taxdef.GetTypeOf(taxcode);
					if (!taxtype) continue;

					var entityline = nlapiSearchRecord("transaction", null, [new nlobjSearchFilter('internalid', null, 'is', rs[irs].getValue('internalid', null, 'group')),
																			 new nlobjSearchFilter("custcol_adjustment_tax_code", null, "noneof", "@NONE@")],
																			 new nlobjSearchColumn("entity", null, "count"));
					var entitylineid = entityline && entityline.length > 0 ? entityline[0].getValue("entity", null, "count") : '';
					if (typelist.indexOf(taxtype) != -1 || typelist[0] == "ALL") {
						var line =[taxcodename, trandate, entity, tranid, trantype, 0, amount, 0, "GENJRNL", taxtype, timestamp, 'journalentry', tempdate.valueOf(), tranid?parseInt(tranid.replace(/[^0-9]/g, '')):"",
							rs[irs].getValue("isperson", source, "group"), formatValue(rs[irs].getValue("companyname", source, "group")), rs[irs].getValue("lastname", source, "group"),
							rs[irs].getValue("firstname", source, "group"), rs[irs].getValue("middlename", source, "group"), rs[irs].getValue("vatregnumber", source, "group"),
							rs[irs].getValue("address", source, "group").replace(/\n/gi, " ").replace(/\r/gi, " ").replace(/,/gi, " "), rs[irs].getValue("custentity_tax_contact_last", source, "group"),
							rs[irs].getValue("custentity_tax_contact_middle", source, "group"), rs[irs].getValue("custentity_tax_contact_first", source, "group"),
							rs[irs].getValue("memo", null, "group"), rs[irs].getValue("rate", "custcol_adjustment_tax_code", "group"),
							field
						];

						list.push(line);
					}
					//[0taxcode, 1trandate, 2entityname, 3tranno, 4trantype, 5netamt, 6taxamt, 7notionalamt, 8trantypeid, 9taxtype, 10timestamp, 11trantypeinternalid, 12trandate#, 13tranno#,
					//14isperson, 15companyname, 16lastname, 17firstname, 18middlename, 19vatregnumber, 20address, 21taxcontactlast, 22taxcontactmiddle, 23taxcontactfirst, 24memo, 25adjtaxcode]
				}
			}
		} catch(ex) {logException(ex, "getAdjustmentDetails");}

		return list;
	}

	this.GetPurchaseJournalDetails = function(filter) {return GetJournalDetail("PURCHASE", filter);};
	this.GetSalesJournalDetails = function(filter) {return GetJournalDetail("SALE", filter);};
	function GetJournalDetail(type, filters) {
		var summary = new VAT.PeriodSummary(_TaxcodeDefinitions, true);
		var detail = GetDrillDownDetails({type:type,
										  filters:filters,
										  field:null,
										  trantypes:["GENJRNL"],
										  filterjrn:null,
										  ignorecase:false});

		for(var idetail = 0; idetail < detail.length; idetail++) {
			var currentdetail = detail[idetail];
			if (currentdetail[5] < 0) {
				var objSummary = summary.Of(currentdetail[9] + "_R");
			} else {
				var objSummary = summary.Of(currentdetail[9]);
			}

			objSummary.NetAmount += currentdetail[5];
			objSummary.TaxAmount += currentdetail[6];
			objSummary.NotionalAmount += currentdetail[7];
			objSummary.GrossAmount += currentdetail[5] + currentdetail[6];
		}

		return summary;
	}

	this.GetSalesDetails = function(filters, field, trantypes, filterjrn, ignorecase, emirates) {
		var params = {type:'SALE',
					  filters:filters,
					  field:field,
					  trantypes:trantypes,
					  filterjrn:filterjrn,
					  ignorecase:ignorecase,
					  emirates: emirates};
		return GetDrillDownDetails(params);
	};
	this.GetPurchaseDetails = function(filters, field, trantypes, filterjrn, ignorecase, emirates) {
		var params = {type:'PURCHASE',
					  filters:filters,
					  field:field,
					  trantypes:trantypes,
					  filterjrn:filterjrn,
					  ignorecase:ignorecase,
					  emirates: emirates};
		return GetDrillDownDetails(params);
	};
	this.GetPurchaseDetailsSTCNDPos = function(filters, field, trantypes, filterjrn, ignorecase) {
		var params = {type:'PURCHASE',
					  filters:filters,
					  field:field,
					  trantypes:trantypes,
					  filterjrn:filterjrn,
					  ignorecase:ignorecase,
					  isFilterNewND: true, //true to return stc non-deductible only
					  reverseSign: true}; //true to reverse sign
		return GetDrillDownDetails(params);
	};
	this.GetPurchaseDetailsStcNdDrCr = function(filters, field, trantypes, filterjrn, ignorecase, reverseSign) {
		var params = {type:'PURCHASE',
					  filters:filters,
					  field:field,
					  trantypes:trantypes,
					  filterjrn:filterjrn,
					  ignorecase:ignorecase,
					  isFilterNewND: true, //true to return stc non-deductible only
					  reverseSign:reverseSign, //true to reverse sign
					  getTotals: true};
		return GetDrillDownDetails(params);
	};
	this.GetPurchaseDetailsSTCNDNeg = function(filters, field, trantypes, filterjrn, ignorecase) {
		var params = {type:'PURCHASE',
					  filters:filters,
					  field:field,
					  trantypes:trantypes,
					  filterjrn:filterjrn,
					  ignorecase:ignorecase,
					  isFilterNewND: true}; //true to return stc non-deductible only
		return GetDrillDownDetails(params);
	};

	function GetDrillDownDetails (parameters) {
		var type = parameters.type;
		var filters = parameters.filters;
		var field = parameters.field;
		var trantypes = parameters.trantypes;
		var filterjrn = parameters.filterjrn;
		var ignorecase = parameters.ignorecase;
		var isFilterNewND = parameters.isFilterNewND;
        var reverseSign = parameters.reverseSign;
        var emirates = parameters.emirates;
        var getTotals = parameters.getTotals;

		var taxCache = new VAT.TaxCache();
		var details = [];
		var cacheid = type=="SALE"?_SaleCacheId:_PurchaseCacheId;

		if (cacheid) {
            var detailcontent;
            if (_IsOnlineFiling) {
                detailcontent = (_PurchaseCacheId==-1)? taxCache.GetOnlineFilingCache(_SaleCacheId, type).detail:taxCache.GetOnlineFilingCache(cacheid).detail;
            } else {
                detailcontent = (_PurchaseCacheId==-1)? taxCache.GetSysNoteCache(_SaleCacheId, type).detail:taxCache.GetTaxCache(cacheid).detail;
            }
			var tempdetails = detailcontent;

			var newdetails = [];
			for(var irow = 0 ; irow < tempdetails.length; irow++) {
				var currentdetail = tempdetails[irow];
				var currentfield = (ignorecase && currentdetail[26]) ? currentdetail[26].toLowerCase() : currentdetail[26];

				if ((currentfield && !field) ||
					(currentfield && field && field != currentfield) ||
					(trantypes && trantypes.indexOf(currentdetail[8]) == -1) && !currentfield) {
					continue;
				}

				if (emirates && emirates.indexOf(currentdetail[19]) === -1) {
				    continue;
				}

				if (filterjrn && currentdetail[8] == "GENJRNL" &&
					(filterjrn == "R" && currentdetail[5] > 0) ||
					(filterjrn == "NR" && currentdetail[5] < 0)) {
					continue;
				}

				if (filters.indexOf(currentdetail[9]) != -1) { //valid taxcode
					if ((!isFilterNewND && currentdetail[currentdetail.length-4] !== 'ND_STC') || //line is not stc
						(isFilterNewND && currentdetail[currentdetail.length-4] === 'ND_STC')) { //line is stc

						if (isFilterNewND && currentdetail[currentdetail.length-4] === 'ND_STC') {
							var negate = reverseSign ? -1 : 1;							
							var ndTaxAmount = getTotals ? (currentdetail[currentdetail.length-2]||-currentdetail[currentdetail.length-1]) : currentdetail[6]; 
							
							currentdetail[6] = negate * ndTaxAmount;
						}
						newdetails.push(currentdetail);
					}
				}
			}
			details = newdetails;
		} else {
            nlapiLogExecution('DEBUG', 'Cache is NOT Used');
            nlapiLogExecution('DEBUG', 'Filter', JSON.stringify(trantypes || emirates));

            if (isFilterNewND) {
				details = GetNonDeductibleTaxDetail(filters);
			} else {
				details = GetDetailsFromV2(type=="SALE"?GetSalesReport():GetPurchaseReport(), filters);
			}

			if (trantypes) {
			    details = GetFilteredDetails(details, filterjrn, trantypes, 8);
			} else if (emirates) { // if UAE VAT
                details = GetFilteredDetails(details, filterjrn, emirates, 18);
			}

			if (field) {
				details = details.concat(type=="SALE"?GetAdjustmentSalesDetails(filters, field):GetAdjustmentPurchaseDetails(filters, field));
			}
		}
		return details;
	}

	function GetFilteredDetails(details, filterjrn, filters, filterIndex) {
        var newdetails = [];
        var currentdetail;

        for(var idetail = 0; idetail < details.length; idetail++) {
            currentdetail = details[idetail];
            if (filterjrn && currentdetail[8] == "GENJRNL" &&
                (filterjrn == "R" && currentdetail[5] > 0) ||
                (filterjrn == "NR" && currentdetail[5] < 0)) {
                continue;
            }

            if (filters.indexOf(details[idetail][filterIndex]) != -1) {
                newdetails.push(details[idetail]);
            }
        }
        return newdetails;
	}

	function GetSalesReport() {
		_SalesReport = LoadReportByName(_SALES_REPORT_NAME, true);
		return { IsSales: true, Result: _SalesReport };
	}

	function GetPurchaseReport() {
		_PurchaseReport = LoadReportByName(_PURCHASE_REPORT_NAME, true);
		return { IsSales: false, Result: _PurchaseReport };
	}

	function GetSummarySalesReport() {
		if (_SalesReport == null)
			_SalesReport = LoadReportByName(_SALES_SUMMARY_REPORT_NAME, true);

		return { IsSales: true, Result: _SalesReport };
	}

	function GetSummaryPurchaseReport() {
		if (_PurchaseReport == null)
			_PurchaseReport = LoadReportByName(_PURCHASE_SUMMARY_REPORT_NAME, true);

		return { IsSales: false, Result: _PurchaseReport };
	}

	function GetSummarySalesByTypeReport() {
		if (_SalesByTypeReport == null)
			_SalesByTypeReport = LoadReportByName(_SALES_SUMMARY_BY_TYPE_REPORT_NAME, true);

		return { IsSales: true, Result: _SalesByTypeReport};
	}

	function GetSummaryPurchaseByTypeReport() {
		if (_PurchaseByTypeReport == null)
			_PurchaseByTypeReport = LoadReportByName(_PURCHASE_SUMMARY_BY_TYPE_REPORT_NAME, true);

		return { IsSales: false, Result: _PurchaseByTypeReport};
	}

    function GetSummarySalesByEmirateReport() {
        if (_SalesByTypeReport == null)
            _SalesByTypeReport = LoadReportByName(_SALES_SUMMARY_BY_EMIRATE_REPORT_NAME, true);

        return { IsSales: true, Result: _SalesByTypeReport};
    }

    function GetSummaryPurchaseByEmirateReport() {
        if (_PurchaseByTypeReport == null)
            _PurchaseByTypeReport = LoadReportByName(_PURCHASE_SUMMARY_BY_EMIRATE_REPORT_NAME, true);

        return { IsSales: false, Result: _PurchaseByTypeReport};
    }

	function LoadReportByName(reportName, isErrorWhenNotFound) {
		try {
			var id = FindReportId(reportName);
			if (id == null) {
				if (isErrorWhenNotFound)
					throw nlapiCreateError("VAT.DataReader.LoadReportByName", "Unable to locate saved report [" + reportName + "]");
				else
					return null;
			}
			return nlapiRunReport(id, _ReportSettings);
		} catch(e) {
			throw nlapiCreateError("1", "sss Running the report failed. Please run VAT/GST Sales or Purchase reports to see the errors", true);
		}
	}

	function GetSummaryFrom(reportObj) {
		var report = reportObj.Result;
		var summary = new VAT.PeriodSummary(_TaxcodeDefinitions);

		if (report == null)
			return summary;

		var cols = report.getColumnHierarchy().getVisibleChildren();
		var level1 = report.getRowHierarchy().getChildren();
		if (level1 == null)
			return summary;

		for (var i1 in level1) {  //EC Code
			var level2 = level1[i1].getChildren();
			if (level2 == null)
				continue;

			for (var i2 in level2) { //Tax codes
				var taxcodeName = level2[i2].getValue();
				var taxcode = FindTaxcodeByName(taxcodeName);
				if (taxcode == null)
					continue;

				var level3 = level2[i2].getChildren();
				if (level3 == null)
					continue;

				for (var i3 in level3) {  //Detail
					var line = level3[i3];

					var netAmount = 0;
					var taxAmount = 0;
					var notionalAmount = 0;
					
					netAmount = AsNumeric(line.getValue(cols[3]));
					taxAmount = AsNumeric(line.getValue(cols[4]));

					if (taxcode.IsReverseChargeAlt) {
						notionalAmount = AsNumeric(nlapiFormatCurrency(netAmount * (Number(taxcode.NotionalRate)/100)));
					} else {
						notionalAmount = AsNumeric(line.getValue(cols[5])) * (reportObj.IsSales ? -1 : 1);
					}

					var taxcodeType = _TaxcodeDefinitions.GetTypeOf(taxcode);
					var taxcodeTypeSummary = summary.Of(taxcodeType);
					if (taxcodeTypeSummary != null) {
						taxcodeTypeSummary.NetAmount += netAmount;
						taxcodeTypeSummary.TaxAmount += taxAmount;
						taxcodeTypeSummary.NotionalAmount += notionalAmount;
						taxcodeTypeSummary.Rate = line.getValue(cols[6]);
					}
				}
			}
		}

		nlapiLogExecution("Debug", (reportObj.IsSales? "Sales": "Purchase") + "PeriodSummary.Summary", JSON.stringify(summary.Summary));
		return summary;
	}

	function GetSummaryByTypeFrom(reportObj) {
        var txnMap = LoadTranTypes();
        return GetSummaryByGroupFrom(reportObj, txnMap);
	}

    function GetSummaryByEmirateFrom(reportObj) {
        var emirateMap = LoadTransactionRegions(_TaxcodeDefinitions.CountryCode);
        emirateMap['- Unassigned -']={id:'- Unassigned -',code:"Unassigned",country: "United Arab Emirates"};
        return GetSummaryByGroupFrom(reportObj, emirateMap);
    }

	function GetSummaryByGroupFrom(reportObj, map) {
		var report = reportObj.Result;
		var summary = new VAT.PeriodSummaryByType(_TaxcodeDefinitions);
//		var tranmap = LoadTranTypes();

		if (report == null)
			return summary;

		var cols = report.getColumnHierarchy().getVisibleChildren();
		var level1 = report.getRowHierarchy().getChildren();
		if (level1 == null)
			return summary;

		for (var i1 in level1) { //EC Code
			var level2 = level1[i1].getChildren();
			if (level2 == null)
				continue;

			for (var i2 in level2) { //Tax codes
				var taxcodeName = level2[i2].getValue();
				var taxcode = FindTaxcodeByName(taxcodeName);
				if (taxcode == null)
					continue;

				var level3 = level2[i2].getChildren();
				if (level3 == null)
					continue;

				for (var i3 in level3) { //Type
					var level4 = level3[i3].getChildren();
					if (level4 == null)
						continue;

					for (var i4 in level4) { //Details
					    var lvl3Value = level3[i3].getValue() || '- Unassigned -';
						
						var line = level4[i4];
						var taxcodeType = _TaxcodeDefinitions.GetTypeOf(taxcode)
						var taxcodeTypeSummary = summary.Of(taxcodeType);

						if (taxcodeTypeSummary) {
							var summaryObj = taxcodeTypeSummary.Get(map[lvl3Value].id);
							if (summaryObj) {
								summaryObj.NetAmount += AsNumeric(line.getValue(cols[3]));
								summaryObj.TaxAmount += AsNumeric(line.getValue(cols[4]));
								summaryObj.NotionalAmount += AsNumeric(line.getValue(cols[5])) * (reportObj.IsSales ? -1 : 1);
							}
						}
					}
				}
			}
		}

		return summary;
	}

	function getTaxCodeNamesByIds(taxcodeIds) {
		if (!taxcodeIds || taxcodeIds.length === 0) {
			return;
		}
		var taxcodeNames = {};
		var sr = nlapiSearchRecord('salestaxitem', null, new nlobjSearchFilter('internalid', null, 'anyof', taxcodeIds), new nlobjSearchColumn('itemid'));
		for (var isr = 0; sr && isr < sr.length; isr++) {
			taxcodeNames[sr[isr].getId()] = sr[isr].getValue('itemid');
		}
		return taxcodeNames;
	}

	function extractTaxcodeIds(data) {
		var taxcodeIds = [];
		for (var idata = 0; data && idata < data.length; idata++) {
			taxcodeIds.push(data[idata].taxcodeId);
		}
		return taxcodeIds;
	}
	
	function GetNonDeductibleTaxSummary(groupByType, useDrCr) {
		var summary = groupByType ? new VAT.PeriodSummaryByType(_TaxcodeDefinitions) : new VAT.PeriodSummary(_TaxcodeDefinitions);
		try {
			var tranmap = LoadTranTypes();
			var ndTaxDao = new Tax.DAO.NonDeductibleTaxDAO().getList({
				subsidiary: (_App.IsOneWorld ? _SubId : null),
				periodFrom: _PeriodId,
				periodTo: _PeriodId2,
				multiCurrency: _IsMultiCurrency,
				book: _BookId,
				countryCode: _TaxcodeDefinitions.CountryCode
			});
			var ndTaxAdapter = new Tax.Adapter.NonDeductibleTaxAdapter();
			ndTaxAdapter.rawdata = ndTaxDao;
			
			var ndTaxes = ndTaxAdapter.transform();

			var taxcodeIds = extractTaxcodeIds(ndTaxes);
			var taxcodeNames = getTaxCodeNamesByIds(taxcodeIds);
			for (var ind = 0; ndTaxes && ind < ndTaxes.length; ind++) {
				var taxcodeName = taxcodeNames[ndTaxes[ind].taxcodeId];
				var taxcode = FindTaxcodeByName(taxcodeName);
				if (!taxcode) {
					continue;
				}
				var taxcodeType = _TaxcodeDefinitions.GetTypeOf(taxcode);
				var taxcodeTypeSummary = summary.Of(taxcodeType);
				var summaryObj = groupByType ? taxcodeTypeSummary.Get(tranmap[ndTaxes[ind].transactionType].id) : taxcodeTypeSummary;
				
				if (summaryObj) {	
					if(useDrCr){
						summaryObj.TaxAmount += AsNumeric(ndTaxes[ind].debitAmount || -ndTaxes[ind].creditAmount);
					} 
					else{
					summaryObj.TaxAmount += AsNumeric(ndTaxes[ind].amount);
				}
			}
			}
		} catch(ex) {
			logException(ex, 'VAT.DataReader.GetNonDeductibleTaxSummary');
		}
		return summary;
	}

	this.GetSupplementaryData = GetSupplementaryData;
	function GetSupplementaryData(reportname, reportparser, definitions, tranmap) {
		try {
			var report = LoadReportByName(reportname, true);
			var row = report.getRowHierarchy();
			var col = report.getColumnHierarchy().getVisibleChildren();

			var data = {};
			if (row.getChildren()) {
				data = reportparser(row, col, FindTaxcodeByName, definitions);
			}
			return data;
		} catch(ex) {logException(ex, "VAT.SupplementaryReader.getReportData");}
		return data;
	}

	function AsNumeric(repValue) {
		if (repValue == null)
			return 0.00;

		var value = Math.round(Number(repValue)*100)/100;
		return isNaN(value) ? 0.00 : value;
	}

	function FindReportId(reportName) { //this needs to be removed!
		var rs = nlapiSearchGlobal(reportName);
		if (rs == null)
			return null;

		for (var i = 0; i < rs.length; ++i) {
			if (rs[i].getValue("name").toLowerCase() == reportName.toLowerCase()) {
				var reportId = rs[i].getId().replace(/REPO_/, "");  //remove "REPO_" prefix
				return parseInt(reportId);
			}
		}
		return null;
	}

	function FindTaxcodeByName(taxcodeName) {
		if (_TaxCodeIds == null) {
			_TaxCodeIds = {};  //To ensure nlapiSearchRecord is called only once
			_TaxCodeRates = {};

			var isAdvanceTax = _Context.getFeature('advtaxengine');
			var isCountry = false;
			if (!_App.IsOneWorld) {
				var country = nlapiLoadConfiguration("companyinformation").getFieldValue("country");
				isCountry = country == _TaxcodeDefinitions.CountryCode;
			}

			if (_App.IsOneWorld || isAdvanceTax || isCountry) {
				var filters = _Context.getFeature("advtaxengine") ?
					[new nlobjSearchFilter("country", null, "is", _TaxcodeDefinitions.CountryCode)] : null;

				var columns = [
					new nlobjSearchColumn("itemid"),
					new nlobjSearchColumn("rate")
				];

				var rs = nlapiSearchRecord("salestaxitem", null, filters, columns);
				if (rs != null) {
					for (var i = 0; i < rs.length; ++i)
					{
						var sRate = rs[i].getValue("rate");
						var rate = (sRate == null || sRate == "" || isNaN(parseFloat(sRate))) ? null : parseFloat(sRate);

						_TaxCodeIds[rs[i].getValue("itemid")] = rs[i].getId();
						_TaxCodeRates[rs[i].getId()] = rate;
					}
				}
			}
		}

		if (_TaxCodes[taxcodeName] == undefined) {
			var id = _TaxCodeIds[taxcodeName];
			if (id) {
				_TaxCodes[taxcodeName] = LoadTaxcodeById(id);
			}
		}

		return _TaxCodes[taxcodeName];
	}

	this.LoadTaxcodeById = LoadTaxcodeById;
	function LoadTaxcodeById(taxcodeId) {
		if (taxcodeId == null)
			return null;

		var rec = nlapiLoadRecord("salestaxitem", taxcodeId);
		if (rec == null)
			return null;

		var sRate = rec.getFieldValue("rate");
		var a = rec.getFieldValue("available");

		var tc = {};
		tc.Id = rec.getId();
		tc.Name = rec.getFieldValue("itemid");
		tc.CountryCode = _TaxcodeDefinitions.CountryCode;
		tc.Rate = (sRate == null || sRate == "" || isNaN(parseFloat(sRate))) ? 0.0 : parseFloat(sRate);
		tc.IsForSales = (a == "BOTH" || a == "SALE");
		tc.IsForPurchase = (a == "BOTH" || a == "PURCHASE");
		tc.IsExempt = rec.getFieldValue("exempt") == "T";
		tc.IsService = rec.getFieldValue("service") == "T";
		tc.IsEC = rec.getFieldValue("eccode") == "T";
		tc.IsForExport = rec.getFieldValue("export") == "T";
		tc.IsExcluded = rec.getFieldValue("excludefromtaxreports") == "T";
		tc.IsReverseCharge = rec.getFieldValue("reversecharge") == "T";
		tc.NotionalRate = _TaxCodeRates[rec.getFieldValue("parent")];

		try {
			tc.IsImport = rec.getFieldValue("custrecord_4110_import") == "T";
			tc.IsGovernment = rec.getFieldValue("custrecord_4110_government") == "T";
			tc.IsCapitalGoods = rec.getFieldValue("custrecord_4110_capital_goods") == "T";
			tc.IsNoTaxInvoice = rec.getFieldValue("custrecord_4110_no_tax_invoice") == "T";
			tc.IsPurchaserIssued = rec.getFieldValue("custrecord_4110_purchaser_issued") == "T";
			tc.IsDuplicateInvoice = rec.getFieldValue("custrecord_4110_duplicate") == "T";
			tc.IsTriplicateInvoice = rec.getFieldValue("custrecord_4110_triplicate") == "T";
			tc.IsOTherTaxEvidence = rec.getFieldValue("custrecord_4110_other_tax_evidence") == "T";
			tc.IsCashRegister = rec.getFieldValue("custrecord_4110_cash_register") == "T";
			tc.IsReduced = rec.getFieldValue("custrecord_4110_reduced_rate") == "T";
			tc.IsSuperReduced = rec.getFieldValue("custrecord_4110_super_reduced") == "T";
			tc.IsSurcharge = rec.getFieldValue("custrecord_4110_surcharge") == "T";

			tc.IsNonOperation = rec.getFieldValue("custrecord_4110_non_operation") == "T";
			tc.IsNoTaxCredit = rec.getFieldValue("custrecord_4110_no_tax_credit") == "T";
			tc.IsElectronic = rec.getFieldValue("custrecord_4110_electronic") == "T";
			tc.IsSpecialTerritory = rec.getFieldValue("custrecord_4110_special_territory") == "T";
			tc.IsUnknownTaxCredit = rec.getFieldValue("custrecord_4110_unknown_tax_credit") == "T";
			tc.IsSuspended = rec.getFieldValue("custrecord_4110_suspended") == "T";
			tc.IsNonTaxable = rec.getFieldValue("custrecord_4110_non_taxable") == "T";
			tc.IsPartialCredit = rec.getFieldValue("custrecord_4110_partial_credit") == "T";
			tc.IsCustomsDuty = rec.getFieldValue("custrecord_4110_duty") == "T";
			tc.IsPaid = rec.getFieldValue("custrecord_4110_paid") == "T";
			tc.IsOutsideCustoms = rec.getFieldValue("custrecord_4110_outside_customs") == "T";
			tc.IsNonResident = rec.getFieldValue("custrecord_4110_non_resident") == "T";
			tc.IsNonRecoverable = rec.getFieldValue("custrecord_4110_non_recoverable") == "T";

			tc.IsReverseChargeAlt = rec.getFieldValue("custrecord_4110_reverse_charge_alt") == "T";
			tc.IsNonDeductibleRef = rec.getFieldValue("custrecord_4110_nondeductible_parent") ? true : false;
			tc.IsNonDeductible = rec.getFieldValue("custrecord_4110_non_deductible") == "T";
			tc.DeferredOn = rec.getFieldValue("custrecord_deferred_on");
			tc.IsForDigitalServices = rec.getFieldValue("custrecord_for_digital_services") == "T";
			tc.IsPostponedImportVAT = rec.getFieldValue("custrecord_postponed_import_vat") == "T";			
			tc.IsDirectCostServiceItem = rec.getFieldValue("custrecord_is_direct_cost_service") == "T";
			tc.IsCategoryType = function getSelectedCategory(val, isNull) {
				var selcategory = rec.getFieldValue("custrecord_4110_category");

				if (!selcategory && isNull) {
					return true;
				} else {
					return selcategory == val;
				}
			}

			if (tc.IsReverseChargeAlt && !tc.NotionalRate) {
				var tempNotionalRate = _TaxCodeRates[rec.getFieldValue("custrecord_4110_parent_alt")];
				tc.NotionalRate = tempNotionalRate ? tempNotionalRate : 0;
				}
		} catch (ex) {logException(ex, "VAT.DataReader.LoadTaxcodeById");}

		return tc;
	}

	function LoadTranTypes() {
		if (_TranTypes) {
			return _TranTypes;
		} else {
			_TranTypes = {};

			var filters = [new nlobjSearchFilter("custrecord_map_type", null, "is", "TXN")];
			var columns = [
				new nlobjSearchColumn("name"),
				new nlobjSearchColumn("custrecord_internal_id"),
				new nlobjSearchColumn("custrecord_transaction_name")
			];

			var rs = nlapiSearchRecord("customrecord_tax_report_map", null, filters, columns);
			if (!rs) {return _TranTypes;}

			for(var irow = 0; irow < rs.length; irow++) {
				_TranTypes[rs[irow].getText('custrecord_transaction_name')] = {id: rs[irow].getValue('name'), internalid:rs[irow].getValue('custrecord_internal_id')};
			}
		}
		nlapiLogExecution('Debug', 'LoadTranTypes', JSON.stringify(_TranTypes));

		return _TranTypes;
	}

    function LoadTransactionRegions(nexus) {
        if (_TransactionRegions) {
            return _TransactionRegions;
        } else {
            _TransactionRegions = {};

            var filters = [];
            var columns = [
                new nlobjSearchColumn('custrecord_region_code'),
                new nlobjSearchColumn('custrecord_region_name'),
                new nlobjSearchColumn('custrecord_region_country')
            ];

            if (nexus) {
                filters.push(new nlobjSearchFilter('custrecord_region_nexus', null, 'is', nexus));
            }

            var rs = nlapiSearchRecord('customrecord_intrastat_region', null, filters, columns);
            if (!rs) {
                return _TransactionRegions;
            }

            for(var irow = 0; irow < rs.length; irow++) {
                _TransactionRegions[rs[irow].getValue('custrecord_region_name')] = {
                    id: rs[irow].getValue('custrecord_region_name'),
                    code: rs[irow].getValue('custrecord_region_code'),
                    country: rs[irow].getText('custrecord_region_country')
                };
            }
        }
        nlapiLogExecution('Debug', 'LoadTransactionRegions', JSON.stringify(_TransactionRegions));

        return _TransactionRegions;
    }

	var dateCache = {};
	function GetDetailsFromV2(reportObj, filters) {
		var report = reportObj.Result;
		var data = [];
		var taxcodeMap = {};
		_TranTypes = LoadTranTypes();
		_TransactionRegions = LoadTransactionRegions(_TaxcodeDefinitions.CountryCode);		

		if (report == null) throw nlapiCreateError("Drilldown Data", "Undefined report");
		if (filters.length == 0) return data;
		var cols = report.getColumnHierarchy().getVisibleChildren();
		var rows = report.getRowHierarchy().getChildren();

		if (rows == null || !rows)
			return data;

		for (var irow = 0; irow < rows.length; irow++) {
			var node = rows[irow];
			var taxcodeName = node.getValue(cols[0]);
			var taxcode = FindTaxcodeByName(taxcodeName);
			var trantype = node.getValue(cols[5]);

			if (taxcode == null) continue;
			if (!_TaxcodeDefinitions.IsAnyOf(taxcode, filters, taxcodeMap)) {
			    continue;
			}

			var datevalue = node.getValue(cols[1]);
			if (!dateCache[datevalue]) {
				var parsedateobj = Date.parseExact(datevalue.toString(), "yyyy-MM-dd");
				dateCache[datevalue] = {"object": parsedateobj, "text": parsedateobj.toString(dateformat), "value":parsedateobj.valueOf()};
			}
			var dateobj = dateCache[datevalue];
			var trandate = dateobj.object;
			var tranno = node.getValue(cols[4]);
				tranno = (tranno && tranno!= "null")?tranno:"";
			var trantypeid = _TranTypes[trantype].id;
			var trantypeinternalid = _TranTypes[trantype].internalid;
			var entityname = trantypeid == 'GENJRNL'?node.getValue(cols[3]):node.getValue(cols[2]);
			entityname = (entityname && entityname!= "null")?entityname:"";
			//[0taxcode, 1trandate, 2entityname, 3tranno, 4trantype]
			var line = [taxcodeName, dateobj.text, entityname, tranno, trantype];
			
			//[5netamt, 6taxamt, 7notionalamt]
			line = line.concat ([(Number(node.getValue(cols[6]))),
								 (Number(node.getValue(cols[7]))),
								 (Math.round(node.getValue(cols[8])*(reportObj.IsSales?-100:100))/100)]);

								 

			//[8trantypeid, 9taxtype, 10timestamp, 11trantypeinternalid]
			line = line.concat([trantypeid, taxcodeMap[taxcodeName], node.getValue(cols[12]), trantypeinternalid,
					//[12trandate#, 13tranno#, 14memo, 15tranid]
					dateobj.value, 
					parseInt(tranno.replace(/[^0-9]/g, '')), 
					reportObj.IsSales ? node.getValue(cols[18]) : node.getValue(cols[15]),
					reportObj.IsSales ? node.getValue(cols[20]) : node.getValue(cols[17])]);

			if (reportObj.IsSales) {
				//[16qty, 17customsregno, 18shipcountry]
				line = line.concat([node.getValue(cols[15]), node.getValue(cols[16]), node.getValue(cols[17])]);
			}
			

            var emirate = reportObj.IsSales ? node.getValue(cols[19]) : node.getValue(cols[16]); // Used in UAE VAT
			if (emirate) {
	            line.push(emirate);
			}
			data[data.length] = line;
		}

//      [0taxcode, 1trandate, 2entityname, 3tranno, 4trantype, 5netamt, 6taxamt, 7notionalamt, 8trantypeid, 9taxtype,
//      10timestamp, 11trantypeinternalid, 12trandate#, 13tranno#, 14memo, 15tranid, 16qty, 17customsregno, 18shipcountry]

		return data;
	}

	function GetNonDeductibleTaxDetail(filters) {
		var details = [];
		var taxcodeMap = {};
		var txnTypes = LoadTranTypes();
		try {
			var ndTaxDao = new Tax.DAO.NonDeductibleTaxDetailDAO().getList({
				subsidiary: _SubId,
				periodFrom: _PeriodId,
				periodTo: _PeriodId2,
				multiCurrency: _IsMultiCurrency,
				book: _BookId,
				countryCode: _TaxcodeDefinitions.CountryCode
			});
			var ndTaxAdapter = new Tax.Adapter.NonDeductibleTaxDetailAdapter();
			ndTaxAdapter.rawdata = ndTaxDao;
			var ndTaxes = ndTaxAdapter.transform();

			var taxcodeIds = extractTaxcodeIds(ndTaxes);
			var taxcodeNames = getTaxCodeNamesByIds(taxcodeIds);

			for (var ind = 0; ndTaxes && ind < ndTaxes.length; ind++) {
				var tax = ndTaxes[ind];
				var taxcodeName = taxcodeNames[tax.taxcodeId];
				var taxcode = FindTaxcodeByName(taxcodeName);

				if (!taxcode || !_TaxcodeDefinitions.IsAnyOf(taxcode, filters, taxcodeMap) || taxcode.IsNonDeductibleRef) {
					continue;
				}

				var tempdate = nlapiStringToDate(tax.date);
				var trandate = tempdate ? tempdate.toString(dateformat) : '';

				var txnTypeId = txnTypes[tax.transactionType].id;
				var txnTypeInteralId = txnTypes[tax.transactionType].internalid;
				var tranNo = tax.documentNumber || '';
				
				var detail = [taxcodeName,
							  trandate,
							  tax.entity,
							  tranNo,
							  tax.transactionType,
							  0, //netamt
							  tax.amount,
							  0, //notionalamt
							  txnTypeId,
							  taxcodeMap[taxcodeName], //taxtype
							  tax.timestamp,
							  txnTypeInteralId,
							  tempdate.valueOf(),
							  tranNo.replace(/[^0-9]/g, ''),
							  tax.isIndividual,
							  tax.companyName,
							  tax.lastName,
							  tax.firstName,
							  tax.middleName,
							  tax.vatno,
							  tax.address,
							  tax.contactLast,
							  tax.contactFirst,
							  tax.contactMiddle,
							  tax.memo,
							  'ND_STC',
							  0,/*26th*/
							  tax.debitAmount,
							  tax.creditAmount];
				details.push(detail);
			}
		} catch (ex) {
			logException(ex, 'VAT.DataReader.GetNonDeductibleTaxDetail');
		}
		return details;
	}

	function formatValue(val) {
		if (val) {
			return nlapiEscapeXML(val).replace("&amp;lt;", "&lt;").replace("&amp;gt;", "&gt;").replace("&apos;", "'");
		} else {
			return "";
		}
	}
};

VAT.DataHeader = function(startPeriodId, endPeriodId, subId, isConsolidated, languageCode, dateFormat, nexus, locationid) {
	var bookId = 0;

	if (arguments.length == 1) {
		setParameters(arguments[0]);
	}

	var _Context = nlapiGetContext();
	var _IsOneWorld = _Context.getFeature("SUBSIDIARIES");
	var _IsMultibook = _Context.getFeature("MULTIBOOK");
	var _company = getCompany();
	var _startPeriodDate = new SFC.System.TaxPeriod(startPeriodId);
	var _endPeriodDate = new SFC.System.TaxPeriod(endPeriodId);
	var _userInfo = _App.LoadCurrentUser();
	var translator = new VAT.Translation(languageCode);
	var _formatter = nexus ? VAT.Report.FormatterSingleton.getInstance(subId, nexus, languageCode, null, bookId) : {};
	var periodlist = VAT.GetTaxPeriodList(startPeriodId, endPeriodId);
	var configdata = getConfigData(_company);

	function setParameters(params) {
		subId = params.subId;
		isConsolidated = params.isConsolidated;
		languageCode = params.languageCode;
		dateFormat = params.dateFormat;
		nexus = params.nexus;
		locationid = params.locationId;
		bookId = params.bookId;
		endPeriodId = params.periodTo;
		startPeriodId = params.periodFrom
	};

	if (_formatter) {
		if (_startPeriodDate.GetType() == _endPeriodDate.GetType()) {
			_formatter.setPeriodType(_formatter.periodtypes[_startPeriodDate.GetType()]);
		} else {
			_formatter.setPeriodType(_formatter.periodtypes.month);
		}
	}

	if (locationid) {
		getLocation();
	}

	try {
		initializeDateFormatting();
		if (!_formatter) {
			var cultureInfo = translator.getCultureInfo();
			if (cultureInfo) {
				Date.CultureInfo = cultureInfo; //override;
			}
		}
	} catch(ex) {logException(ex, "VAT.DataHeader");}
	
	function getOnlineFilingSubmissionStatus(vrn) {
        var submission = {
            status: '',
            submittedperiodid: [],
            submittedperiodlist: []
        };
	    var dao = new Tax.DAO.OnlineFilingDAO();
	    var daoParams = {
	        periods: periodlist,
	        nexus: nexus,
	        subsidiary: _IsOneWorld ? subId : null,
	        status: 'SUBMITTED',
	        action: 'submit',
	        vrn: vrn
	    };
	    var list = dao.getList(daoParams);
	    if (list && list.length > 0) {
            var coveredPeriods = list[0].coveredPeriods;
            var submittedPeriods = coveredPeriods ? coveredPeriods.split(',') : [];
            var period;
	        submission.status = 'SUBMITTED';
	        for (var i = 0; i < periodlist.length; i++) {
	            period = periodlist[i] + '';
	            if (submittedPeriods.indexOf(period) > -1 && submission.submittedperiodid.indexOf(period) === -1) {
	                submission.submittedperiodid.push(periodlist[i]);
	            }
	        }
	    }
	    return submission;
	}

	function getSubmissionStatus() {
		var submitstatus = {"status": "", submittedperiodid: [], submittedperiodlist: []};
		try {
			var filters = [new nlobjSearchFilter("isinactive", null, "is", "F"),
						   new nlobjSearchFilter("custrecord_online_form", null, "isnotempty")
						   ];

			if (nexus) {
				filters.push(new nlobjSearchFilter("custrecord_nexus", null, "is", nexus));
			}

			if (_startPeriodDate.GetType() == _endPeriodDate.GetType() && _startPeriodDate.GetType() == "year" && nexus == "DE") {
				filters.push(new nlobjSearchFilter("custrecord_submitted_period", null, "allof", periodlist));
			} else {
				filters.push(new nlobjSearchFilter("custrecord_submitted_period", null, "anyof", periodlist));
			}

			if (nexus == "CZ") {
				filters.push(new nlobjSearchFilter("custrecord_submitted_type", null, "is", "B"));
			} else if (nexus == "IE") {
				filters.push(new nlobjSearchFilter("custrecord_submitted_type", null, "is", "0"));
			}

			if (_IsOneWorld) {
				filters.push(new nlobjSearchFilter("custrecord_vatonline_subsidiary", null, "is", subId));
			}
			var columns = [new nlobjSearchColumn("custrecord_submitted_period"), new nlobjSearchColumn("custrecord_vatonline_status")];
			var rs = nlapiSearchRecord("customrecord_vatonline_submittedperiod", null, filters, columns);

			var submittedperiodlist = {};
			var statusmap = {};
			for(var irec in rs) {
				var currentperiodid = rs[irec].getValue("custrecord_submitted_period").split(",");
				var currentperiodnames = rs[irec].getText("custrecord_submitted_period").split(",");

				for(var iperiod = 0; iperiod < currentperiodid.length; iperiod++) {
					submittedperiodlist[currentperiodid[iperiod]] = currentperiodnames[iperiod];
				}
			}

			if (nexus == "GB") { //search for old records
				var filters_GB = [new nlobjSearchFilter("isinactive", null, "is", "F"), new nlobjSearchFilter("custrecord_vatonline_status", null, "is", "SUBMITTED")];
				var columns_GB = [new nlobjSearchColumn("custrecord_vatonline_tax_period")];
				var rs_GB = nlapiSearchRecord("customrecord_vatonline_submittedperiod", null, filters_GB, columns_GB);

				var periodlist_GB = [];
				for(var irs_GB in rs_GB) {
					var periodid_GB = rs_GB[irs_GB].getValue("custrecord_vatonline_tax_period");
					periodlist_GB.push(parseInt(periodid_GB));
					submittedperiodlist[periodid_GB] = true;
				}

				if (periodlist_GB.length > 0)  {
					var filters_GBTax = [new nlobjSearchFilter("isinactive", null, "is", "F"), new nlobjSearchFilter("internalid", null, "is", periodlist_GB)];
					var columns_GBTax = [new nlobjSearchColumn("periodname")];
					var rs_GBTax = nlapiSearchRecord("taxperiod", null, filters_GBTax, columns_GBTax);
					for(var irs_GBTax in rs_GBTax) {
						submittedperiodlist[String(rs_GBTax[irs_GBTax].getId())] = rs_GBTax[irs_GBTax].getValue("periodname");
					}
				}
			}

			var iscompletelysubmitted = true;
			for(var ilist in periodlist) {
				var periodid = periodlist[ilist]
				var objperiod = periodlist[ilist];
				if (!submittedperiodlist[String(periodid)]) {
					iscompletelysubmitted = false;
				} else {
					submitstatus.submittedperiodid.push(periodid);
					submitstatus.submittedperiodlist.push(submittedperiodlist[periodid]);
				}
			}

			if (iscompletelysubmitted) { //all period is submitted
				if (nexus == "GB") {
					submitstatus.status = "SUBMITTED";
				} else {
					submitstatus.status = "FINAL";
				}
			}
			nlapiLogExecution("Debug", "getSubmissionStatus", JSON.stringify(submitstatus));
		} catch(ex) {logException(ex, "VAT.DataHeader.getSubmissionStatus");}

		return submitstatus;
	}

	function initializeDateFormatting() {
		try {
			if(!dateFormat) {
				dateFormat = {};
				dateFormat.shortDateFormat = "MM/dd/yyyy";
				dateFormat.longDateFormat = "MMMM d, yyyy";
				dateFormat.periodDateFormat = "MMMM yyyy";
			}

			if (!dateFormat.shortDateFormat) {
				dateFormat.shortDateFormat = "MM/dd/yyyy";
			}

			if (!dateFormat.longDateFormat) {
				dateFormat.longDateFormat = "MMMM d, yyyy";
			}

			if (!dateFormat.periodDateFormat) {
				dateFormat.periodDateFormat = "MMMM yyyy";
			}
		} catch(ex) {logException(ex, "VAT.DataHeader.initializeDateFormatting");}
	}

	function getLocation() {
		var filters = [new nlobjSearchFilter("isinactive", null, "is", "F"),
					   new nlobjSearchFilter("internalid", null, "is", locationid)];
		var columns = [new nlobjSearchColumn("namenohierarchy"),
					   new nlobjSearchColumn("address1"),
					   new nlobjSearchColumn("address2"),
					   new nlobjSearchColumn("city"),
					   new nlobjSearchColumn("country"),
					   new nlobjSearchColumn("phone"),
					   new nlobjSearchColumn("state"),
					   new nlobjSearchColumn("zip"),
					   new nlobjSearchColumn("custrecord_5826_loc_branch_id")];

		var rs = nlapiSearchRecord("location", null, filters, columns);

		if (!rs || rs.length == 0) {
			return;
		}

		_company.Zip = rs[0].getValue('zip');
		_company.Telephone = rs[0].getValue('phone');
		_company.Address1 = rs[0].getValue('address1');
		_company.Address2 = rs[0].getValue('address2');
		_company.City = rs[0].getValue('city');
		_company.State = rs[0].getValue('state');
		_company.Country = rs[0].getValue('country');
		_company.BranchId = rs[0].getValue('custrecord_5826_loc_branch_id') ? rs[0].getValue('custrecord_5826_loc_branch_id') : '00000';

		var completeSubsidiaryAddr = [];

		if (_company.Address1 && _company.Address2) {
			completeSubsidiaryAddr.push(_company.Address1 + " " + _company.Address2);
		}

		if (_company.City) {
			completeSubsidiaryAddr.push(_company.City);
		}

		if (_company.State) {
			completeSubsidiaryAddr.push(_company.State);
		}

		completeSubsidiaryAddr.push(_company.Country + " " + _company.Zip);
		_company.CompleteAddress = completeSubsidiaryAddr.join(", ");
	}

	function getCompany() {
		var company = {};

		try {
			if (_IsOneWorld) {
				subsidiary = SFC.System.Subsidiary(subId, false, bookId);

				company.Zip = subsidiary.Zip;
				company.Telephone = subsidiary.Telephone;
				company.Address1 = subsidiary.Address1;
				company.Address2 = subsidiary.Address2;
				company.City = subsidiary.City;
				company.State = subsidiary.State;
				company.Email = subsidiary.Email;
				company.VatNo = subsidiary.VRN;
				company.Name = subsidiary.NameNoHeirarchy;
				company.LegalName = subsidiary.LegalName;
				company.Country = subsidiary.Country;
				company.CountryCode = subsidiary.CountryCode;
				company.Currency = subsidiary.Currency;
				company.CurrencyId = subsidiary.CurrencyId;

				var completeSubsidiaryAddr = [];

				if (company.Address1 && company.Address2) {
					completeSubsidiaryAddr.push(company.Address1 + " " + company.Address2);
				}

				if (company.City) {
					completeSubsidiaryAddr.push(company.City);
				}

				if (company.State) {
					completeSubsidiaryAddr.push(company.State);
				}

				completeSubsidiaryAddr.push(company.Country + " " + company.Zip);
				company.CompleteAddress = completeSubsidiaryAddr.join(", ");

				if (company.Name == 'Parent Company') {
					company.Name = nlapiLoadConfiguration("companyinformation").getFieldValue("companyname");
				}
			} else {
				parent = nlapiLoadConfiguration("companyinformation");

				company.Zip = parent.getFieldValue("zip");
				company.Telephone = parent.getFieldValue("phone");
				company.Address1 = parent.getFieldValue("address1");
				company.Address2 = parent.getFieldValue("address2");
				company.City = parent.getFieldValue("city");
				company.State = parent.getFieldValue("state");
				company.Email = parent.getFieldValue("email");
				company.VatNo = parent.getFieldValue("employerid");
				company.Name = parent.getFieldValue("companyname");
				company.LegalName = parent.getFieldValue("legalname");
				company.Country = parent.getFieldText("country");
				company.CountryCode = parent.getFieldValue("country");
				company.Currency = parent.getFieldText("basecurrency");
				company.CurrencyId = parent.getFieldValue("basecurrency");

				var completeAddr = [];
				if (company.Address1 && company.Address2) {
					completeAddr.push(company.Address1 + " " + company.Address2);
				}

				if (company.City) {
					completeAddr.push(company.City);
				}

				if (company.State) {
					completeAddr.push(company.State);
				}

				completeAddr.push(company.Country + " " + company.Zip);
				company.CompleteAddress = completeAddr.join(", ");
			}
		} catch(ex) {logException(ex, "VAT.DataHeader.getCompany");}

		return company;
	}

	function getStartPeriod(dateFormat) {
		var startPeriod = "";
		try {
			if (_startPeriodDate) {
				if (_formatter && _formatter.usetaxperiodname) {
					startPeriod = _startPeriodDate.GetName();
				} else if (_formatter && !_formatter.usetaxperiodname) {
					startPeriod = _formatter.formatDate(_startPeriodDate.GetStartDate().toString(dateFormat.periodDateFormat), _formatter.month, true);
				} else {
					startPeriod = _startPeriodDate.GetStartDate().toString("MMMM yyyy");
				}
			}
		} catch(ex) {logException(ex, "VAT.DataHeader.getStartPeriod");}

		return startPeriod;
	}

	function getEndPeriod(dateFormat) {
		var endPeriod = "";
		try {
			if (_endPeriodDate) {
				if (_formatter && _formatter.usetaxperiodname) {
					endPeriod = _endPeriodDate.GetName();
				} else if (_formatter && !_formatter.usetaxperiodname) {
					endPeriod = _formatter.formatDate(_endPeriodDate.GetEndDate().toString(dateFormat.periodDateFormat), _formatter.month, true);
				} else {
					endPeriod = _endPeriodDate.GetEndDate().toString("MMMM yyyy");
				}
			}
		} catch(ex) {logException(ex, "VAT.DataHeader.getEndPeriod");}

		return endPeriod;
	}

	function getStartDate(dateFormat) {
		var startDate = "";
		try {
			if (_startPeriodDate) {
				if (_formatter) {
					startDate = _formatter.formatDate(_startPeriodDate.GetStartDate().toString(dateFormat.longDateFormat), _formatter.longdate);
				} else {
					startDate = _startPeriodDate.GetStartDate().toString("MMMM d, yyyy");
				}
			}
		} catch(ex) {logException(ex, "VAT.DataHeader.getStartDate");}

		return startDate;
	}

	function getEndDate(dateFormat) {
		var endDate = "";
		try {
			if (_endPeriodDate) {
				if (dateFormat && dateFormat.longDateFormat) {
					endDate = _formatter.formatDate(_endPeriodDate.GetEndDate().toString(dateFormat.longDateFormat), _formatter.longdate);
				} else {
					endDate = _endPeriodDate.GetEndDate().toString("MMMM d, yyyy");
				}
			}
		} catch(ex) {logException(ex, "VAT.DataHeader.getEndDate");}

		return endDate;
	}

	function getTaxYear() {
		var fullYear = "";
		try {
			var baseDate = _startPeriodDate;

			if (!baseDate) {
				baseDate = _endPeriodDate;
			}

			if (baseDate) {
				fullYear = baseDate.GetStartDate().getFullYear();
			}
		} catch(ex) {logException(ex, "VAT.DataHeader.getTaxYear");}

		return fullYear;
	}

	function getTaxMonth() {
		var month = "";
		try {
			var baseDate = _startPeriodDate;

			if (!baseDate) {
				baseDate = _endPeriodDate;
			}

			if (baseDate) {
				month = baseDate.GetStartDate().getMonth() + 1;
			}
		} catch(ex) {logException(ex, "VAT.DataHeader.getTaxMonth");}

		return month;
	}

	function getFromPeriodDate() {
		var objdate;
		try {
			objdate = {startdate: _startPeriodDate.GetStartDate(), enddate: _startPeriodDate.GetEndDate()};
		} catch(ex) {logException(ex, "VAT.DataHeader.getFromPeriodDate");}
		return objdate;
	}

	function getToPeriodDate() {
		var objdate;
		try {
			objdate = {startdate: _endPeriodDate.GetStartDate(), enddate: _endPeriodDate.GetEndDate()};
		} catch(ex) {logException(ex, "VAT.DataHeader.getToPeriodDate");}

		return objdate;
	}

	function getConsolidatedMsg() {
		var message = ""
		if (isConsolidated) {
			message = "This is a consolidated report.";
		} else {
			message = ""
		}
		return message;
	}

	function getPrintMsg() {
		var message;
		try {
			var dateToday = _formatter ? _formatter.formatDate(new Date().toString("MMMM d, yyyy"), _formatter.longdate) : new Date().toString("MMMM d, yyyy");

			var defaultMsg = [];
			defaultMsg.push("Printed by");
			defaultMsg.push(_userInfo.Name);
			defaultMsg.push("(" + _userInfo.Id + ")");
			defaultMsg.push("on");
			defaultMsg.push(dateToday);

			message = defaultMsg.join(" ");
		} catch(ex) {logException(ex, "VAT.DataHeader.getPrintMsg");}

		return message;
	}

	function getExcelMsg() {
		var message;
		try {
			var defaultMsg = [];
			defaultMsg.push("Exported by");
			defaultMsg.push(_userInfo.Name);
			defaultMsg.push("(" + _userInfo.Id + ")");
			defaultMsg.push("on");
			defaultMsg.push(_formatter ? _formatter.formatDate(new Date().toString("MMMM d, yyyy"), _formatter.longdate) : new Date().toString("MMMM d, yyyy"));

			message = defaultMsg.join(" ");
		} catch(ex) {logException(ex, "VAT.DataHeader.getExcelMsg");}

		return message;
	}

	function getVersion() {
		var version = "";
		try {
			if(_IsOneWorld) {
				version = "NetSuite OneWorld";
			} else {
				version = "NetSuite Mid-market";
			}

			version += " " + _Context.getVersion();

		} catch(ex) {logException(ex, "VAT.DataHeader.getVersion");}

		return version;
	}

	function stripNumbersOnly(value) {
		var EU_COUNTRIES = { //For checking if EU
			AT: true, BE: true, BG: true, CY: true, CZ: true,
			DE: true, DK: true, EE: true, EL: true, ES: true,
			FI: true, FR: true, GB: true, HU: true, IE: true,
			IT: true, LT: true, LU: true, LV: true, MT: true,
			NL: true, PL: true, RO: true, SE: true, SI: true,
			SK: true, PT: true, GR: true
		};

		var regexEU = new RegExp("[^0-9A-Za-z]", "g");
		var formattedvalue = value.replace(regexEU, ""); //numbers and letters only

		var prefix = formattedvalue.substring(0, 2)

		var result = "";
		if (isNaN(parseInt(prefix.charAt(0))) && isNaN(parseInt(prefix.charAt(1))) && EU_COUNTRIES[prefix]) {
			result = formattedvalue.substring(2);
		} else {
			var regexNonEU = new RegExp("[^0-9]", "g");
			result = value.replace(regexNonEU, "");
		}

		if (result) {
			return result;
		} else {
			return value;
		}
	}

	function formatValue(val) {
		if (val) {
			return nlapiEscapeXML(val).replace("&amp;lt;", "&lt;").replace("&amp;gt;", "&gt;").replace("&apos;", "'");
		} else {
			return "";
		}
	}

	function getEndPeriodType() {
		var endPeriodType = "";
		try {
			if (_endPeriodDate) {
				endPeriodType = _endPeriodDate.GetType();
			}
		} catch(ex) {logException(ex, "VAT.DataHeader.getEndPeriodType");}

		return endPeriodType;
	}

	function getStartPeriodType() {
		var startPeriodType = "";
		try {
			if (_startPeriodDate) {
				startPeriodType = _startPeriodDate.GetType();
			}
		} catch(ex) {logException(ex, "VAT.DataHeader.getStartPeriodType");}

		return startPeriodType;
	}

	function getLoadReportMessage() {
		return {title: 'Loading report...', msg: 'Please wait...'};
	}

	function getConfigData(company) {
		var data = {};
		try {
			if (nexus && getTaxFilingNexuses()[nexus]) {
				var configuration;
				if (_IsOneWorld) {
					configuration = new Tax.Returns.Configuration(nexus?nexus:company.CountryCode, subId);
				} else {
					configuration = new Tax.Returns.Configuration(nexus);
				}

				if (configuration) {
					var config = new VAT.Configuration();
					var schema = config.getSchemaByCountry(nexus?nexus:company.CountryCode);

					for(var iprop in schema) {
						var property = schema[iprop];
						var propvalue = configuration.GetValue(property.altcode);
						var lov = property.lov;
						propvalue = propvalue?propvalue:property.value;

						if (lov) {
							for(var ilov in lov) {
								if (lov[ilov].value == propvalue && lov[ilov].lang2 == languageCode) {
									data[iprop + "_text"] = lov[ilov].description;
								}
							}
						}

						data[iprop] = formatValue(propvalue);
					}
				}
			}
		} catch (ex) {
			logException(ex, 'VAT.DataHeader.getConfigData');
		}
		return data;
	}
	
	function getOnlineSubmissionStatus(nexus, subsidiary) {
	    var submission = null;
	    if (nexus === 'GB') {
	        var configuration = new Tax.Returns.Configuration(nexus, subsidiary);
	        var isOnlineFiling = configuration.GetValue('MTD') === 'T';
	        if (isOnlineFiling) {
	            var vrn = (configuration.GetValue('VATRegistration') || '').replace(/[^a-z0-9]/gmi, '');
	            var onlineFilingSubmission = getOnlineFilingSubmissionStatus(vrn);
	            if (onlineFilingSubmission.status) {
	                submission = onlineFilingSubmission;
	            }
	        }
	    }
	    if (!submission) {
	        submission = getSubmissionStatus();
	    }
	    return submission;
	}

	var returnObj = {};
	try {
		returnObj.province = formatValue(_company.State);
		returnObj.city = formatValue(_company.City);
		returnObj.address1 = formatValue(_company.Address1);
		returnObj.address2 = formatValue(_company.Address2);
		returnObj.completeAddress = formatValue(_company.CompleteAddress);
		returnObj.zipcode = formatValue(_company.Zip);
		returnObj.telephone = formatValue(_company.Telephone);
		returnObj.country = formatValue(_company.Country);
		returnObj.countrycode = formatValue(_company.CountryCode);
		returnObj.languagecode = formatValue(languageCode?languageCode:"ENG");
		returnObj.company = formatValue(_company.Name);
		returnObj.legalname = formatValue(_company.LegalName);
		returnObj.vatno = stripNumbersOnly(_company.VatNo);
		returnObj.unformattedvatno = _company.VatNo;
		returnObj.branchno = _company.BranchId ? stripNumbersOnly(_company.BranchId) : '';
		returnObj.email = formatValue(_company.Email);
		returnObj.currency = formatValue(_company.Currency);
		returnObj.currencyid = formatValue(_company.CurrencyId);
		returnObj.startperiod = getStartPeriod(dateFormat);
		returnObj.endperiod = getEndPeriod(dateFormat);

		returnObj.taxyear = getTaxYear();
		returnObj.taxmonth = getTaxMonth();
		returnObj.StartDate = formatValue(getStartDate(dateFormat));
		returnObj.EndDate = formatValue(getEndDate(dateFormat));
		returnObj.startperiodtype = getStartPeriodType();
		returnObj.endperiodtype = getEndPeriodType();
		returnObj.fromperioddate = getFromPeriodDate();
		returnObj.toperioddate = getToPeriodDate();

		returnObj.consolidated = formatValue(getConsolidatedMsg());
		returnObj.printmsg = formatValue(getPrintMsg());
		returnObj.excelmsg = formatValue(getExcelMsg());
		returnObj.version = formatValue(getVersion());
		returnObj.reportingperiod = (startPeriodId == endPeriodId) ? getStartPeriod(dateFormat) : getStartPeriod(dateFormat) + " - " + getEndPeriod(dateFormat);
		returnObj.loadreporttitle = getLoadReportMessage().title;
		returnObj.loadreportmsg = getLoadReportMessage().msg;
		returnObj.shortdate = _formatter.shortdate;
		returnObj.longdate = _formatter.longdate;
		returnObj.number = _formatter.number;
		returnObj.negative = _formatter.negative;
		returnObj.month = _formatter.month;
		returnObj.quarter = _formatter.quarter;
		returnObj.year = _formatter.year;
		returnObj.periodtypes = _formatter.periodtypes;
		returnObj.usetaxperiodname = _formatter.usetaxperiodname;
		var submitstatus = getOnlineSubmissionStatus(nexus, subId);
		returnObj.filingstatus = submitstatus.status;
		returnObj.submittedperiodname = submitstatus.submittedperiodlist;
		returnObj.submittedid = submitstatus.submittedperiodid;

		returnObj.thousand = _formatter.thousand;
		returnObj.decimal = _formatter.decimal;
		returnObj.precision = _formatter.precision;
		returnObj.currencysymbol = _formatter.currencysymbol;
		returnObj.poscurrencyformat = _formatter.poscurrencyformat;
		returnObj.negcurrencyformat = _formatter.negcurrencyformat;
		returnObj.zerocurrencyformat = _formatter.zerocurrencyformat;

		for(var idata in configdata) {
			returnObj[idata] = configdata[idata]?configdata[idata]:returnObj[idata];
		}

        nlapiLogExecution("Debug", "VAT.DataHeader", JSON.stringify(returnObj));
	} catch(ex) {logException(ex, "VAT.DataHeader");}

	return returnObj;
};

VAT.TaxcodeDefinitions = function(countryCode, definitions) {
	var _CountryCode = countryCode;
	this.CountryCode = _CountryCode;

	var _Definitions = definitions;
	this.GetEntries = function() { return _Definitions; };

	this.GetTypeOf = _GetTypeOf;
	this.IsAnyOf = _IsAnyOf;

	function _GetTypeOf(taxcode) {
		for (var i in _Definitions)
		{
			if (_Definitions[i](taxcode))
				return i;
		}

		return undefined;
	};

	function _IsAnyOf(taxcode, filters, taxcodemap) {
		var type;
		if (taxcodemap) {
			type = taxcodemap[taxcode.Name];
			if (!type) {
				type = _GetTypeOf(taxcode);
				taxcodemap[taxcode.Name] = type;
			}
		} else {
			type = _GetTypeOf(taxcode);
		}


		if (!type)
			return false;

		for (var i = 0; i < filters.length; ++i)
		{
			if (filters[i] == type || filters[i] == "ALL")
				return true;
		}

		return false;
	};
};

VAT.Translation = function(locale) {
	var cultureInfo;
	nlapiLogExecution("DEBUG", "VAT.Translation", locale);

	try {
		var languageCode = extractISOCode(locale);
		switch (languageCode) {
			case "kr": case "kor": cultureInfo = Date.CultureInfo_kr; break;
			case "pl": case "pol": cultureInfo = Date.CultureInfo_pl; break;
			case "nl": case "dut":
				fileName = "vat.translate.dut.xml";
				cultureInfo = Date.CultureInfo_du;
				break;
			case "da": case "dan": cultureInfo = Date.CultureInfo_da; break;
			case "sr": case "srp": cultureInfo = Date.CultureInfo_sr; break;
			case "bg": case "bul": cultureInfo = Date.CultureInfo_bg; break;
			case "zh": case "chi": cultureInfo = Date.CultureInfo_zh; break;
			case "cs": case "cze": cultureInfo = Date.CultureInfo_cs; break;
			case "sv": case "swe": cultureInfo = Date.CultureInfo_sv; break;
			case "sl": case "slv": cultureInfo = Date.CultureInfo_sl; break;
			case "th": case "tha": cultureInfo = Date.CultureInfo_th; break;
			case "ro":  case "ron": cultureInfo = Date.CultureInfo_ro; break;
			case "de": case "deu": cultureInfo = Date.CultureInfo_de; break;
			case "fr": case "fra":
				fileName = "vat.translate.fra.xml";
				cultureInfo = Date.CultureInfo_fr;
				break;
			case "es": case "spa":
				fileName = "vat.translate.spa.xml";
				cultureInfo = Date.CultureInfo_es;
				break;
			case "pt": case "por":
				fileName = "vat.translate.por.xml";
				cultureInfo = Date.CultureInfo_pt;
				break;
			case "el": case "ell": cultureInfo = Date.CultureInfo_el; break;
			case "zh": case "zha": cultureInfo = Date.CultureInfo_zh_tw; break;
            case "fi": case "fin": Date.CultureInfo = Date.CultureInfo_fi; break;
            case "it": case "ita": Date.CultureInfo = Date.CultureInfo_it; break;
			case "en": case "eng":
			default:
				fileName = "vat.translate.eng.xml";
				cultureInfo = Date.CultureInfo_eng;
				break;
		}
	} catch(ex) {logException(ex, "VAT.Translation");}

	this.extractISOCode = extractISOCode;
	function extractISOCode(val) {
		try {
			if (val) {
				var underscorePos = val.indexOf("_");
				if (underscorePos > -1) {
					return val.slice(0, underscorePos).toLowerCase();
				} else {
					return val.toLowerCase();
				}
			} else {
				return "en";
			}
		} catch(ex) {
			logException(ex, "VAT.Translation.extractISOCode");
			return "en";
		}
	}

	this.getCultureInfo = getCultureInfo;
	function getCultureInfo() {
		try {
			if (cultureInfo) {
				return cultureInfo;
			} else {
				return Date.CultureInfo_eng;
			}
		} catch(ex) {
			logException(ex, "VAT.Translation.getCultureInfo");
			return Date.CultureInfo_eng;
		}
	}
}

if (!VAT.Export) VAT.Export = {};
VAT.Export.Context = function(index, type, label, handler, template) {
	var enabled = true;
	var currentstamp = new Date();
	var exporttemplate = template;
	var exportindex = index;
	var exporttype = type;
	var exportlabel = label;
	var exporthandler = handler;

	var name = ["btn", type.toLowerCase(), currentstamp.toString("MMddyyHHmmss")].join("") ;

	this.getExportType = function() {return exporttype;};
	this.setExportType = function(val) {exporttype = val;};

	this.getLabel = function() {return exportlabel;};
	this.setLabel = function(val) {exportlabel = val;};

	this.getHandler = function() {return exporthandler;};
	this.setHandler = function(val) {exporthandler = val;};

	this.getName = function() {return name;};
	this.setName = function(val) {name = val;};

	this.getExportIndex = function() {return exportindex;};
	this.setExportIndex = function(val) {exportindex = val;};

	this.getExportFileName = function(reportObj, isConsolidated, fromPeriodId, toPeriodId){
		var fileName = [reportObj.CountryCode];
		fileName.push(reportObj.ReportName?reportObj.ReportName:"VAT");
		
		if(reportObj.CountryCode == 'GB') {
			fileName.push(reportObj.vatno);
		}

		Date.CultureInfo = Date.CultureInfo_en; //English Only

		if (isConsolidated) {
			fileName.push("(Group)");
		}

		if (fromPeriodId == toPeriodId) {
			var singlePeriodTo = new SFC.System.TaxPeriod(fromPeriodId);

			if (singlePeriodTo.GetType() == "month") { //Check if Monthly
				fileName.push(singlePeriodTo.GetStartDate().toString("MMMyy"));
			} else { //Quarterly or Yearly
				var singlePeriodFrom = new SFC.System.TaxPeriod(toPeriodId);
				fileName.push(singlePeriodTo.GetStartDate().toString("MMMyy"));
				fileName.push(singlePeriodFrom.GetEndDate().toString("MMMyy"));
			}
		} else {
			var fromPeriod = new SFC.System.TaxPeriod(fromPeriodId);
			var toPeriod = new SFC.System.TaxPeriod(toPeriodId);

			fileName.push(fromPeriod.GetStartDate().toString("MMMyy"));
			fileName.push(toPeriod.GetEndDate().toString("MMMyy"));
		}

		var currentstamp = new Date();
		fileName.push(currentstamp.toString("MMddyyHHmmss"));

		var extension;
		switch(type) {
			case "EXCEL": extension = ".xls";  break;
			case "CSV": extension = ".csv";  break;
			case "HTMLDOC": extension = ".htm";  break;
			case "PLAINTEXT": extension = ".txt";  break;
			case "XMLDOC": extension = ".xml";  break;
			default:
				extension = ".txt";  break;
		}
		return fileName.join("_") + extension;
	}

	this.getExportTemplate = function () {return exporttemplate;};
	this.setExportTemplate = function (val) {exporttemplate = val;};

	this.isEnabled = function() {return enabled;};
	this.setEnabled = function(val) {enabled = val;};
};
