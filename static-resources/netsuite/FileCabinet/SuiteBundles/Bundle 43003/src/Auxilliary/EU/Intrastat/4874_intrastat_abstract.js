/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var INTRASTAT;
if (!INTRASTAT) INTRASTAT = {};
INTRASTAT.ConversionDivisor = 2.2046;

INTRASTAT.Header = function(startPeriodId, endPeriodId, subId, isConsolidated, dateFormat, countryform) {
	var languageCode = (countryform && countryform.length > 2) ? countryform.substring(countryform.indexOf("_") + 1) : "";
	var nexus = countryform ? countryform.substring(0, 2) : "";
	nlapiLogExecution("Debug", "INTRASTAT.Header: param",
		JSON.stringify({
			countryform: countryform,
			startPeriodId: startPeriodId,
			endPeriodId: endPeriodId,
			subId: subId,
			isConsolidated: isConsolidated,
			dateFormat: dateFormat
		}));

	var _company = getCompany(nexus);
	var _configData = getConfigData(_company);
	var _startPeriodDate = new SFC.System.TaxPeriod(startPeriodId);
	var _endPeriodDate = new SFC.System.TaxPeriod(endPeriodId);
	var _userInfo = _App.LoadCurrentUser();

	try {
		initializeDateFormatting();
		setLocale(languageCode);
	} catch (ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "VAT.Header", errorMsg);
	}

	function initializeDateFormatting() {
		try {
			if (!dateFormat) {
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
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.DataHeader.initializeDateFormatting", errorMsg);
		}
	}

	function setLocale(locale) {
		if (locale) {
			switch (locale) {
				case "kr":
				case "kor":
					Date.CultureInfo = Date.CultureInfo_kr;
					break;
				case "pl":
				case "pol":
					Date.CultureInfo = Date.CultureInfo_pl;
					break;
				case "nl":
				case "dut":
					Date.CultureInfo = Date.CultureInfo_du;
					break;
				case "da":
				case "dan":
					Date.CultureInfo = Date.CultureInfo_da;
					break;
				case "sr":
				case "srp":
					Date.CultureInfo = Date.CultureInfo_sr;
					break;
				case "bg":
				case "bul":
					Date.CultureInfo = Date.CultureInfo_bg;
					break;
				case "zh":
				case "chi":
					Date.CultureInfo = Date.CultureInfo_zh;
					break;
				case "cs":
				case "cze":
					Date.CultureInfo = Date.CultureInfo_cs;
					break;
				case "sv":
				case "sve":
					Date.CultureInfo = Date.CultureInfo_sv;
					break;
				case "sl":
				case "slv":
					Date.CultureInfo = Date.CultureInfo_sl;
					break;
				case "th":
				case "tha":
					Date.CultureInfo = Date.CultureInfo_th;
					break;
				case "it":
				case "ita":
					Date.CultureInfo = Date.CultureInfo_it;
					break;
				case "ro":
				case "ron":
					Date.CultureInfo = Date.CultureInfo_ro;
					break;
				case "fi":
				case "fin":
					Date.CultureInfo = Date.CultureInfo_fi;
					break;
				case "de":
				case "deu":
					Date.CultureInfo = Date.CultureInfo_de;
					break;
				case "fr":
				case "fra":
					Date.CultureInfo = Date.CultureInfo_fr;
					break;
				case "es":
				case "spa":
					Date.CultureInfo = Date.CultureInfo_es;
					break;
				case "pt":
				case "por":
					Date.CultureInfo = Date.CultureInfo_pt;
					break;
				case "el":
				case "ell":
					Date.CultureInfo = Date.CultureInfo_el;
					break;
				case "zha":
					Date.CultureInfo = Date.CultureInfo_zh_tw;
					break;
				case "en":
				case "eng":
				default:
					Date.CultureInfo = Date.CultureInfo_en;
			}
		}
	}

	function getCompany(nexus) {
		var company = {};

		try {
			if (INTRASTAT.isSubsidiarySettingOn()) {
				subsidiary = SFC.System.Subsidiary(subId, false);

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

			if (!nexus) {
				nexus = company.CountryCode;
				if (COUNTRY_FORMS[nexus]) {
					var context = new COUNTRY_FORMS[nexus][0];
					setLocale(context.language);
					nlapiLogExecution("Debug", "VAT.DataHeader.getCompany: Setting locale", context.language);
				} else {
					setLocale("eng");
					nlapiLogExecution("Debug", "VAT.DataHeader.getCompany: No Locale Found", "");
				}
			}

			nlapiLogExecution("Debug", "VAT.DataHeader.getCompany: nexus: " + countryform, "[" + nexus + "]");

			var configuration;
			if (INTRASTAT.isSubsidiarySettingOn()) {
				configuration = new Tax.Returns.Configuration(nexus ? nexus : company.CountryCode, subId);
			} else {
				configuration = new Tax.Returns.Configuration(nexus ? nexus : company.CountryCode);
			}

			nlapiLogExecution("Debug", "VAT.DataHeader.getCompany: configuration", JSON.stringify(configuration));

			if (configuration) {
				var newVatNo = configuration.GetValue("VATRegistration");
				var intrastatBranchNo = configuration.GetValue("IntrastatBranchNo");
				var participantNo = configuration.GetValue("ParticipantNo");
				company.VatNo = newVatNo ? newVatNo : company.VatNo;
				company.IntrastatBranchNo = intrastatBranchNo ? intrastatBranchNo : "";
				company.ParticipantNo = participantNo ? participantNo : "";
			} else {
				nlapiLogExecution("Debug", "VAT.DataHeader.getCompany: configuration", "No Configuration Found");
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "VAT.DataHeader.getCompany", errorMsg);
		}

		return company;
	}

	function getStartPeriod(dateFormat) {
		var startPeriod = "";
		try {
			if (_startPeriodDate) {
				if (dateFormat && dateFormat.periodDateFormat) {
					startPeriod = _startPeriodDate.GetStartDate().toString(dateFormat.periodDateFormat);
				} else {
					startPeriod = _startPeriodDate.GetStartDate().toString("MMMM yyyy");
				}
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.DataHeader.getStartPeriod", errorMsg);
		}

		return startPeriod;
	}

	function getEndPeriod(dateFormat) { //Do We Need To Localize Using User Preferences
		var endPeriod = "";
		try {
			if (_endPeriodDate) {
				if (dateFormat && dateFormat.periodDateFormat) {
					endPeriod = _endPeriodDate.GetEndDate().toString(dateFormat.periodDateFormat);
				} else {
					endPeriod = _endPeriodDate.GetEndDate().toString("MMMM yyyy");
				}
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.DataHeader.getEndPeriod", errorMsg);
		}

		return endPeriod;
	}

	function getStartDate(dateFormat) {
		var startDate = "";
		try {
			if (_startPeriodDate) {
				if (dateFormat && dateFormat.longDateFormat) {
					startDate = _startPeriodDate.GetStartDate().toString(dateFormat.longDateFormat);
				} else {
					startDate = _startPeriodDate.GetStartDate().toString("MMMM d, yyyy");
				}
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.DataHeader.getStartDate", errorMsg);
		}

		return startDate;
	}

	function getEndDate(dateFormat) { //Do We Need To Localize Using User Preferences
		var endDate = "";
		try {
			if (_endPeriodDate) {
				if (dateFormat && dateFormat.longDateFormat) {
					endDate = _endPeriodDate.GetEndDate().toString(dateFormat.longDateFormat);
				} else {
					endDate = _endPeriodDate.GetEndDate().toString("MMMM d, yyyy");
				}
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.DataHeader.getEndDate", errorMsg);
		}

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
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.DataHeader.getEndDate", errorMsg);
		}

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
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.DataHeader.getEndDate", errorMsg);
		}

		return month;
	}

	function getEndTaxYear() {
		var fullYear = "";
		try {
			var baseDate = _endPeriodDate;
			if (baseDate) {
				fullYear = baseDate.GetStartDate().getFullYear().toString().slice(-2);
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.DataHeader.getEndDate", errorMsg);
		}

		return fullYear;
	}

	function getEndTaxMonth() {
		var month = "";
		try {
			var baseDate = _endPeriodDate;

			if (baseDate) {
				month = baseDate.GetEndDate().getMonth() + 1;
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.DataHeader.getEndDate", errorMsg);
		}

		return month;
	}

	function getPrintMsg() {
		var message;
		try {
			//Need to localize message and date format;
			var defaultMsg = [];
			defaultMsg.push("Printed by");
			defaultMsg.push(_userInfo.Name);
			defaultMsg.push("(" + _userInfo.Id + ")");
			defaultMsg.push("on");
			defaultMsg.push(new Date().toString("MMMM d, yyyy"));

			message = defaultMsg.join(" ");
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.DataHeader.getEndDate", errorMsg);
		}

		return message;
	}

	function stripNumbersOnly(value) {
		var regexEU = new RegExp("[^0-9A-Za-z]", "g");
		var formattedvalue = value.replace(regexEU, ""); //numbers and letters only

		var prefix = formattedvalue.substring(0, 2)

		var result = "";
		if (isNaN(parseInt(prefix.charAt(0))) && isNaN(parseInt(prefix.charAt(1))) && INTRASTAT.EU_COUNTRIES[prefix]) {
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
			return nlapiEscapeXML(val);
		} else {
			return "";
		}
	}

	function getConfigData(company) {
		var data = {};
		try {
			if (nexus && getTaxFilingNexuses()[nexus]) {
				var configuration;
				if (_App.IsOneWorld) {
					configuration = new Tax.Returns.Configuration(nexus ? nexus : company.CountryCode, subId);
				} else {
					configuration = new Tax.Returns.Configuration(nexus);
				}

				if (configuration) {
					var config = new VAT.Configuration();
					var schema = config.getSchemaByCountry(nexus ? nexus : company.CountryCode);

					for (var iprop in schema) {
						var property = schema[iprop];
						var propvalue = configuration.GetValue(property.altcode);
						var lov = property.lov;
						propvalue = propvalue ? propvalue : property.value;

						if (lov) {
							for (var ilov in lov) {
								if (lov[ilov].value == propvalue && lov[ilov].lang2 == languageCode) {
									data[iprop + "_text"] = lov[ilov].description;
								}
							}
						}

						data[iprop] = formatValue(propvalue);
						if (iprop == 'regionindex') {
						    data[iprop] = getTransactionRegion(data[iprop]);
						}
					}
				}
			}
		} catch (ex) {
			logException(ex, 'VAT.DataHeader.getConfigData');
		}
		return data;
	}
	
	function getTransactionRegion(regionIndex) {
	    var TRANSACTION_REGION_MAP = {
	        1: {name: 'Baden-Württemberg', regionCode: 8},
	        2: {name: 'Bavaria', regionCode: 9},
	        3: {name: 'Berlin', regionCode: 11},
	        4: {name: 'Brandenburg', regionCode: 12},
	        5: {name: 'Bremen', regionCode: 4},
	        6: {name: 'Hamburg', regionCode: 2},
	        7: {name: 'Hesse', regionCode: 6},
	        8: {name: 'Lower Saxony', regionCode: 3},
	        9: {name: 'Rhineland-Palatinate', regionCode: 7},
	        10: {name: 'Mecklenburg-Western Pomerania', regionCode: 13},
	        11: {name: 'North Rhine-Westphalia', regionCode: 5},
	        12: {name: 'Saarland', regionCode: 10},
	        13: {name: 'Saxony', regionCode: 14},
	        14: {name: 'Saxony-Anhalt', regionCode: 15},
	        15: {name: 'Schleswig-Holstein', regionCode: 1},
	        16: {name: 'Thuringia', regionCode: 16}
	    };
	    
        return TRANSACTION_REGION_MAP[regionIndex].regionCode;
    };

	var headerData = {
		province: formatValue(_company.State),
		city: formatValue(_company.City),
		address1: formatValue(_company.Address1),
		address2: formatValue(_company.Address2),
		completeAddress: formatValue(_company.CompleteAddress),
		zipcode: formatValue(_company.Zip),
		telephone: formatValue(_company.Telephone),
		country: formatValue(_company.Country),
		countrycode: formatValue(_company.CountryCode),
		company: formatValue(_company.Name),
		legalname: formatValue(_company.LegalName),
		vatno: stripNumbersOnly(_company.VatNo),
		intrastatbranch: formatValue(_company.IntrastatBranchNo),
		participantno: formatValue(_company.ParticipantNo),
		email: formatValue(_company.Email),
		startperiod: getStartPeriod(dateFormat),
		endperiod: getEndPeriod(dateFormat),
		taxyear: getTaxYear(),
		taxmonth: getTaxMonth(),
		endyear: getEndTaxYear(),
		endmonth: getEndTaxMonth(),
		StartDate: formatValue(getStartDate(dateFormat)),
		EndDate: formatValue(getEndDate(dateFormat)),
		printmsg: formatValue(getPrintMsg())
	}

	for (var data in _configData) {
		if (data == 'vatno' && !_configData[data]) {
			continue;
		}
		headerData[data] = _configData[data];
	}

	return headerData;
}

INTRASTAT.FilterBuilder = function(form, params) {
	nlapiLogExecution("Debug", "INTRASTAT.FilterBuilder", JSON.stringify(params));

	if (_App.IsOneWorld) {
		var euSubsidiaries = getEUSubsidiaries();
		var isValidDefaultSub = false;
		for (var ieusub = 0; ieusub < euSubsidiaries.length; ieusub++) {
			if (euSubsidiaries[ieusub].id == params.subsidiaryid) {
				isValidDefaultSub = true;
				break;
			}
		}

		if (!isValidDefaultSub) {
			params.subsidiaryid = euSubsidiaries[0].id;
		}
	}

	var nexus = getSelectedNexus(params.subsidiaryid);
	this.getSelectedNexus = function() {
		return nexus;
	};

	var selectedContext = getContext();
	this.getContext = function() {
		return selectedContext
	};

	var nexusmap = getNexusMap(params.subsidiaryid);

	function getNexusMap(subsidiaryid) {
		var nexusMap = {};

		if (_App.IsOneWorld) {
			var sub = nlapiLoadRecord('subsidiary', subsidiaryid);
			var count = sub.getLineItemCount("nexus");

			for (var i = 1; i <= count; i++) {
				nexusMap[sub.getLineItemValue('nexus', 'country', i)] = sub.getLineItemText('nexus', 'country', i);
			}
		} else if (_App.Context.getFeature("advtaxengine")) { //SI
			var filters = [new nlobjSearchFilter("isinactive", null, "is", "F")];
			var columns = [new nlobjSearchColumn("country", null, "GROUP")];
			var rs = nlapiSearchRecord("salestaxitem", null, filters, columns);
			if (rs != null) {
				for (var i = 0; i < rs.length; ++i) {
					nexusMap[rs[i].getValue("country", null, "GROUP")] = rs[i].getText("country", null, "GROUP");
				}
			}
		} else { // SI
			nexusMap[nlapiLoadConfiguration("companyinformation").getFieldValue("country")] = nlapiLoadConfiguration("companyinformation").getFieldText("country");
		}

		return nexusMap;
	}

	function getContext() {
		nlapiLogExecution("Debug", "INTRASTAT.FilterBuilder.getContext: nexus:", nexus);
		var context;
		if (params.countryform && COUNTRY_FORMS[nexus]) {
			nlapiLogExecution("Audit", "INTRASTAT.FilterBuilder.getContext:countryForm", params.countryform);
			var mgr = new INTRASTAT.ContextManager();
			context = mgr.createContext(params.countryform);
		} else if (nexus && COUNTRY_FORMS[nexus]) {
			nlapiLogExecution("Audit", "INTRASTAT.FilterBuilder.getContext:countryForm:", "Use First In Nexus");
			context = new COUNTRY_FORMS[nexus][0];
		} else {
			nlapiLogExecution("Audit", "INTRASTAT.FilterBuilder.getContext:countryForm", "No Country Form. Use Generic");
			var genericForm = new COUNTRY_FORMS["OTHER"][0];
			genericForm.setCountryCode(nexus);
			params.countryform = genericForm.getLocale();
			return genericForm;
		}

		return context;
	}

	this.buildFilters = function() {
		if (INTRASTAT.isSubsidiarySettingOn()) {
			var objSubList = form.addField(INTRASTAT.FIELDS.subsidiaryid, 'select', "Subsidiary");

			populateValidEuSubsidiary(objSubList); // show only valid 'EU' members only...
			objSubList.setLayoutType("outsideabove", "startrow").setDisplaySize(250);
		}

		var objReportType = form.addField(INTRASTAT.FIELDS.type, 'select', "Report Type").setLayoutType('outsideabove');
		populateReportType(objReportType);

		var objCountryForm = form.addField(INTRASTAT.FIELDS.countryform, 'select', "Country Form").setLayoutType('outsideabove');
		populateCountryForm(objCountryForm);

		new SFC.System.TaxPeriodCombobox(form, INTRASTAT.FIELDS.fromperiodid, "Tax Period", params.fromperiodid, "outsideabove", params.subsidiaryid);
		new SFC.System.TaxPeriodCombobox(form, INTRASTAT.FIELDS.toperiodid, "To", params.toperiodid, "outsideabove", params.subsidiaryid);
	}

	function getSelectedNexus(subsidiaryid) {
		if (!params.countryform) { //get Subsidiary country/Country
			var nexuses = getNexusMap(subsidiaryid);
			for (var inexus in nexuses) {
				if (INTRASTAT.EU_COUNTRIES[inexus]) { //EU Country
					return inexus;
				}
			}
		} else {
			return params.countryform.substring(0, params.countryform.indexOf("_"));
		}
	}

	function populateReportType(objReportType) {
		if (!params.type) {
			params.type = INTRASTAT.SALEREPORT;
		}

		for (var itype in INTRASTAT.REPORTTYPE) {
			objReportType.addSelectOption(itype, INTRASTAT.REPORTTYPE[itype], params.type == itype);
		}
	}

	function populateCountryForm(objCountryForm) { //Show all nexuses under subsidiary and default to nexus
		var countryFormsOptions = {};

		var countryFormSortList = [];
		for (var iCountry in nexusmap) {
			var countryForms = COUNTRY_FORMS[iCountry];

			if (countryForms) {
				for (var jForms = 0; jForms < countryForms.length; jForms++) {
					var context = new countryForms[jForms];
					countryFormsOptions[context.getName()] = {
						"countryformid": context.getLocale(),
						"isselected": (selectedContext.getLocale() == context.getLocale())
					};
					countryFormSortList.push(context.getName());
				}
			} else if (INTRASTAT.EU_COUNTRIES[iCountry]) {
				var genericContext = new COUNTRY_FORMS["OTHER"][0];
				genericContext.setCountryCode(iCountry);
				countryFormsOptions[genericContext.getName(nexusmap[iCountry])] = {
					"countryformid": genericContext.getLocale(),
					"isselected": (nexus == iCountry)
				};
				countryFormSortList.push(genericContext.getName(nexusmap[iCountry]));
			}
		}

		countryFormSortList.sort();
		for (var isort = 0; isort < countryFormSortList.length; isort++) {
			var sortkey = countryFormSortList[isort];
			objCountryForm.addSelectOption(countryFormsOptions[sortkey].countryformid, sortkey, countryFormsOptions[sortkey].isselected);
		}
	}

	function populateValidEuSubsidiary(objSubsidiaryList) {
		if (euSubsidiaries.length > 0) {
			for (var isub = 0; isub < euSubsidiaries.length; isub++) {
				var subinternalid = euSubsidiaries[isub].id;
				var isSelected = (subinternalid == params.subsidiaryid || isub == 0);
				objSubsidiaryList.addSelectOption(subinternalid, euSubsidiaries[isub].name, isSelected);
			}
		}
	}
}

INTRASTAT.CACHE = {};
INTRASTAT.CACHE.TAX_CODE = {};
INTRASTAT.TaxCodeCache = function(nexus) {
	try {
		if (!INTRASTAT.EU_COUNTRIES[nexus]) {
			return;
		}

		var columns = [new nlobjSearchColumn("itemid"), new nlobjSearchColumn("rate")];
		var filters = [];

		if (INTRASTAT.isAdvanceTaxesSettingOn()) {
			filters.push(new nlobjSearchFilter("country", null, "is", INTRASTAT.EU_COUNTRIES[nexus].nexuscode));
		}

		var rs = nlapiSearchRecord("salestaxitem", null, filters, columns);
		for (var i in rs) {
			var taxcursor = rs[i];
			var taxname = taxcursor.getValue("itemid");
			INTRASTAT.CACHE.TAX_CODE[taxname] = createTaxCode(taxcursor.getId(), taxcursor.getValue("itemid"), taxcursor.getValue("rate"), nexus);
		}
	} catch (ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "INTRASTAT.TaxCodeCache", errorMsg);
	}

	function createTaxCode(id, name, rate, countrycode) {
		return {
			"id": id,
			"name": name,
			"rate": rate,
			"countrycode": countrycode,
			"isservice": false,
			"isupdated": false
		}
	}

	function updateTaxCode(taxId) {
		var rec = nlapiLoadRecord("salestaxitem", taxId);
		var name = rec.getFieldValue("itemid");
		var taxcode = INTRASTAT.CACHE.TAX_CODE[name];

		if (taxcode && !taxcode.isupdated) {
			taxcode.isservice = rec.getFieldValue("service") == "T";
			taxcode.isupdated = true;
		}
	}

	this.findByName = findByName;

	function findByName(name) {
		if (INTRASTAT.CACHE.TAX_CODE[name] && !INTRASTAT.CACHE.TAX_CODE[name].isupdated) {
			updateTaxCode(INTRASTAT.CACHE.TAX_CODE[name].id);
		}

		return INTRASTAT.CACHE.TAX_CODE[name];
	}
}

INTRASTAT.CACHE.NOTC = {};
INTRASTAT.NOTCDefaultCache = function(nexus) {
	var trantypemap = {};

	try {
		var mapcolumns = [new nlobjSearchColumn("name"), new nlobjSearchColumn("custrecord_alt_code")];
		var mapfilter = [new nlobjSearchFilter("custrecord_map_type", null, "is", "TXN")];
		var maprs = nlapiSearchRecord("customrecord_tax_report_map", null, mapfilter, mapcolumns);

		for (var imap in maprs) {
			trantypemap[maprs[imap].getValue("custrecord_alt_code")] = maprs[imap].getValue("name")
		}

		var filters = [new nlobjSearchFilter("isinactive", null, "is", "F"), new nlobjSearchFilter("custrecord_notcdef_country", null, "is", INTRASTAT.EU_COUNTRIES[nexus].id)];
		var columns = [new nlobjSearchColumn("custrecord_notcdef_trantype"), new nlobjSearchColumn("custrecord_notc_code", 'custrecord_notcdef_notc')];
		var rsnotcdef = nlapiSearchRecord("customrecord_notc_default", null, filters, columns);

		if (rsnotcdef) {
			for (var inotc = 0; inotc < rsnotcdef.length; inotc++) {
				var notccode = rsnotcdef[inotc].getValue('custrecord_notc_code', 'custrecord_notcdef_notc');
				var trantypearr = rsnotcdef[inotc].getText('custrecord_notcdef_trantype').split(",");

				for (var itype = 0; itype < trantypearr.length; itype++) {
					INTRASTAT.CACHE.NOTC[trantypemap[trantypearr[itype]]] = notccode;
				}
			}
		}
	} catch (ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "INTRASTAT.NOTCDefaultCache", errorMsg);
	}

	this.findDefault = findDefault;

	function findDefault(trantype) {
		return INTRASTAT.CACHE.NOTC[trantype];
	}
}

INTRASTAT.runReport = function(reportName, fromperiod, toperiod, subid, isConsolidated) {
	nlapiLogExecution("Debug", "INTRASTAT.runReport: ",
		JSON.stringify({
			reportName: reportName,
			fromperiod: fromperiod,
			toperiod: toperiod,
			subid: subid,
			isConsolidated: isConsolidated
		}));

	var objReport;
	try {
		var reportid = SFC.System.FindReportId(reportName);
		nlapiLogExecution("Debug", "INTRASTAT.runReport.runReport: reportid", reportid);

		var _ReportSettings = new nlobjReportSettings(fromperiod.toString(), toperiod.toString());

		if (_App.IsOneWorld)
			_ReportSettings.setSubsidiary(isConsolidated ? -subid : subid);

		objReport = nlapiRunReport(reportid, _ReportSettings);
	} catch (ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "INTRASTAT.runReport", errorMsg);
	}

	return objReport;
}

INTRASTAT.ReportRunner = function(fromperiodid, toperiodid, subsidiaryid, nexus, truncate, metadata) {
	nlapiLogExecution('Debug', "INTRASTAT.ReportRunner",
		JSON.stringify({
			fromperiodid: fromperiodid,
			toperiodid: toperiodid,
			subsidiaryid: subsidiaryid,
			nexus: nexus,
			truncate: truncate
		}));

	function formatValue(value) { //callback function
		if (!value || value == "null") {
			return "";
		} else {
			return String(value);
		}
	}

	function formatVAT(value, shipcountry) {
		if (value && value.indexOf(shipcountry) == 0) {
			return value.replace(shipcountry, "");
		} else {
			return value;
		}
	}

	var reportRunner;
	var savedreports;
	var taxcache = new INTRASTAT.TaxCodeCache(nexus);
	var notccache = new INTRASTAT.NOTCDefaultCache(nexus);

	switch (nexus) {
		case "DE":
			reportRunner = new INTRASTAT.GermanyReportRunner(taxcache, notccache, formatValue, truncate);
			savedreports = reportRunner.getSavedReports();
			break;
		case "IT":
			reportRunner = new INTRASTAT.ItalyReportRunner(taxcache, notccache, formatValue, formatVAT, truncate);
			savedreports = reportRunner.getSavedReports();
			break;
		case "FR":
			reportRunner = new INTRASTAT.FranceReportRunner(taxcache, notccache, formatValue, formatVAT, truncate, metadata);
			savedreports = reportRunner.getSavedReports();
			break;
		default:
			reportRunner = new INTRASTAT.GenericReportRunner(taxcache, notccache, formatValue, formatVAT, truncate);
			savedreports = reportRunner.getSavedReports();
			break;
	}

	this.getSalesReport = getSalesReport;

	function getSalesReport() {
		var objReport = INTRASTAT.runReport(savedreports.sales, fromperiodid, toperiodid, subsidiaryid, false);
		return reportRunner.getReport(objReport);
	}

	this.getPurchaseReport = getPurchaseReport;

	function getPurchaseReport() {
		var objReport = INTRASTAT.runReport(savedreports.purchase, fromperiodid, toperiodid, subsidiaryid, false);
		return reportRunner.getReport(objReport);
	}
}

INTRASTAT.GenericReportRunner = function(taxcache, notccache, formatValue, formatVAT, truncate) { //used by GB and Generic
	var savedreports = {
		sales: "Intrastat Generic Sales Report[4873]",
		purchase: "Intrastat Generic Purchase Report[4873]"
	}
	this.getSavedReports = function() {
		return savedreports;
	}

	this.getReport = getReport;

	function getReport(objReport) { //feed with value from sales or purchase report
		var reportMap = {
			"list": [],
			"customer": {},
			"keys": {}
		}; //keys and where it is in the list
		traverseReport(reportMap, objReport.getRowHierarchy(), objReport.getColumnHierarchy().getVisibleChildren());
		return reportMap.list;
	}

	function traverseReport(map, rowObj, cols, entityname) {
		var rowChildren = rowObj.getChildren();
		if (!rowChildren) return;
		for (var iChild in rowChildren) {
			var node = rowChildren[iChild];
			if (node.getChildren()) {
				traverseReport(map, node, cols, node.getValue());
			} else {
				var objNode = parseNode(map, node, cols, entityname);
				if (!objNode) {
					continue;
				} //not part of nexus
				if (map.keys[objNode.key]) {
					consolidateNode(map.list, map.keys[objNode.key], objNode.content);
				} else {
					map.keys[objNode.key] = map.list.length; //current index in list
					objNode.content.row = map.list.length + 1; //update the row
					map.list.push(objNode.content);
				}
			}
		}
	}

	function parseNode(map, node, cols, entityname) {
		var taxcodename = formatValue(node.getValue(cols[9]));
		var taxcode = taxcache.findByName(taxcodename)
		if (!taxcode || taxcode.isservice) {
			return null;
		}

		var vatno = formatValue(node.getValue(cols[0]));
		var entity = formatValue(entityname);
		if (!vatno) {
			vatno = formatValue(node.getValue(cols[1])); //project
			if (map.customer[vatno]) {
				entity = map.customer[vatno];
			}
		} else { //put in customer map
			map.customer[vatno] = entityname;
		}
		var countrycode = formatValue(node.getValue(cols[6]));
		vatno = formatVAT(vatno, countrycode);

		var commoditycode = formatValue(node.getValue(cols[2]));
		var trantype = formatValue(node.getValue(cols[8]));

		var notc = formatValue(node.getValue(cols[3]));
		if (!notc) notc = formatValue(node.getValue(cols[4])); //column field
		if (!notc) notc = formatValue(notccache.findDefault(trantype));

		var deliveryterm = formatValue(node.getValue(cols[5]));
		var tranno = formatValue(node.getValue(cols[7]));
		var weightinpounds = Number(node.getValue(cols[12])).toFixed(4);
		var quantity = Math.abs(node.getValue(cols[11]));
		var grossweightinkilos = (weightinpounds / INTRASTAT.ConversionDivisor) * quantity;
		var netamount = Math.abs(node.getValue(cols[10]));
		
		return {
			content: {
				"row": 0,
				"exclude": "F",
				"entity": nlapiEscapeXML(entity),
				"vatno": vatno,
				"commoditycode": commoditycode,
				"notc": notc,
				"deliveryterm": deliveryterm,
				"countrycode": countrycode,
				"tranno": tranno,
				"trantype": trantype,
				"netamount": truncate ? parseInt(netamount, 10) : nlapiFormatCurrency(netamount),
				"quantity": Math.ceil(quantity),
				"grossweight": Math.max(Math.ceil(grossweightinkilos), 1),
				"origquantity": quantity,
				"orignetamount": netamount,
				"origweight": grossweightinkilos
			},
			"key": [commoditycode, notc, deliveryterm, countrycode, tranno, vatno].join(".")
		}
	}

	function consolidateNode(list, index, node) {
		var reportnode = list[index];
		reportnode.orignetamount += node.orignetamount;
		reportnode.origquantity += node.origquantity;
		reportnode.origweight += node.origweight;

		reportnode.netamount = truncate ? parseInt(reportnode.orignetamount) : nlapiFormatCurrency(reportnode.orignetamount);
		reportnode.quantity = Math.ceil(reportnode.origquantity);
		reportnode.grossweight = Math.max(Math.ceil(reportnode.origweight), 1);
		return reportnode;
	}
}

INTRASTAT.GermanyReportRunner = function(taxcache, notccache, formatValue, truncate) {
	var savedreports = {
		sales: "Intrastat DE Sales Report[4873]",
		purchase: "Intrastat DE Purchase Report[4873]"
	}
	this.getSavedReports = function() {
		return savedreports;
	}

	this.getReport = getReport;

	function getReport(objReport) { //feed with value from sales or purchase report
		var reportList = [];
		traverseReport(reportList, objReport.getRowHierarchy(), objReport.getColumnHierarchy().getVisibleChildren());
		return reportList;
	}

	function traverseReport(list, rowObj, cols) {
		var rowChildren = rowObj.getChildren();
		if (!rowChildren) return;
		for (var iChild in rowChildren) {
			var node = rowChildren[iChild];
			var objNode = parseNode(node, cols);
			if (!objNode) {
				continue;
			}

			objNode.content.row = list.length + 1;
			list.push(objNode.content);
		}
	}

	function parseNode(node, cols) {
		var index = {
			'itemdesc': 0,
			'item': 1,
			'countrycode': 2,
			'region': 3,
			'notcbody': 4,
			'notc': 5,
			'commoditycode': 6,
			'quantity': 7,
			'netamount': 8,
			'deliveryterm': 9,
			'trantype': 10,
			'taxcodename': 11,
			'weightinpounds': 12,
			'grossweight': 13,
			'modeoftransport': 14,
			'statvaluebasecurrency': 15
		};

		var taxcodename = formatValue(node.getValue(cols[index.taxcodename]));
		var taxcode = taxcache.findByName(taxcodename);
		if (!taxcode || taxcode.isservice) {
			return null;
		};

		var trantype = formatValue(node.getValue(cols[index.trantype]));
		var notc = formatValue(node.getValue(cols[index.notcbody]));
		if (!notc) notc = formatValue(node.getValue(cols[index.notc])); //column field
		if (!notc) notc = formatValue(notccache.findDefault(trantype));

		var weightinpounds = Number(node.getValue(cols[index.weightinpounds])).toFixed(4);
		var quantity = Math.abs(Number(node.getValue(cols[index.quantity])));
		var grossweightinkilos = Math.max(Math.ceil((weightinpounds / INTRASTAT.ConversionDivisor) * quantity), 1);
		var netamount = Math.abs(node.getValue(cols[index.netamount]));
		var modeoftransportcode = node.getValue(cols[index.modeoftransport]);
		var statvaluebasecurrency = node.getValue(cols[index.statvaluebasecurrency]);

		return {
			content: {
				"row": 0,
				"exclude": "F",
				"itemdesc": nlapiEscapeXML(formatValue(node.getValue(cols[index.itemdesc]))),
				"item": nlapiEscapeXML(formatValue(node.getValue(cols[index.item]))),
				"countrycode": formatValue(node.getValue(cols[index.countrycode])),
				"region": formatValue(node.getValue(cols[index.region])),
				"notc": notc,
				"commoditycode": formatValue(node.getValue(cols[index.commoditycode])),
				"quantity": Math.abs(Number(node.getValue(cols[index.quantity]))),
				"netamount": truncate ? parseInt(netamount, 10) : nlapiFormatCurrency(netamount),
				"deliveryterm": formatValue(node.getValue(cols[index.deliveryterm])),
				"trantype": trantype,
				"grossweight": grossweightinkilos,
				"transportmode": modeoftransportcode,
				"statisticalvalue": truncate ? parseInt(statvaluebasecurrency, 10) : nlapiFormatCurrency(statvaluebasecurrency)
			}
		}
	}
}

INTRASTAT.ItalyReportRunner = function(taxcache, notccache, formatValue, formatVAT, truncate) {
	var savedreports = {
		sales: "Intrastat IT Sales Report[4873]",
		purchase: "Intrastat IT Purchase Report[4873]"
	}
	this.getSavedReports = function() {
		return savedreports;
	}

	this.getReport = getReport;

	function getReport(objReport) { //feed with value from sales or purchase report
		var reportMap = {
			"list": [],
			"customer": {},
			"keys": {}
		}; //keys and where it is in the list
		traverseReport(reportMap, objReport.getRowHierarchy(), objReport.getColumnHierarchy().getVisibleChildren());
		return reportMap.list;
	}

	function traverseReport(map, rowObj, cols, entityname) {
		var rowChildren = rowObj.getChildren();
		if (!rowChildren) return;
		for (var iChild in rowChildren) {
			var node = rowChildren[iChild];
			if (node.getChildren()) {
				traverseReport(map, node, cols, node.getValue());
			} else {
				var objNode = parseNode(map, node, cols, entityname);
				if (!objNode) {
					continue;
				}

				if (map.keys[objNode.key]) {
					consolidateNode(map.list, map.keys[objNode.key], objNode.content);
				} else {
					map.keys[objNode.key] = map.list.length; //current index in list
					objNode.content.row = map.list.length + 1; //update the row
					map.list.push(objNode.content);
				}
			}
		}
	}

	function parseNode(map, node, cols, entityname) {
		var taxcodename = formatValue(node.getValue(cols[9]));
		var taxcode = taxcache.findByName(taxcodename);
		if (!taxcode || taxcode.isservice) {
			return null
		};

		var countrycode = formatValue(node.getValue(cols[0]));
		var vatno = formatValue(node.getValue(cols[1]));
		var entity = formatValue(entityname);
		if (!vatno) {
			vatno = formatValue(node.getValue(cols[2])); //project
			if (map.customer[vatno]) {
				entity = map.customer[vatno];
			}
		} else { //put in customer map
			map.customer[vatno] = entityname;
		}
		vatno = formatVAT(vatno, countrycode);

		var trantype = formatValue(node.getValue(cols[10]));
		var notc = formatValue(node.getValue(cols[3]));
		if (!notc) notc = formatValue(node.getValue(cols[4])); //column field
		if (!notc) notc = formatValue(notccache.findDefault(trantype));
		
		var commoditycode = formatValue(node.getValue(cols[5]));
		var netamount = Math.abs(node.getValue(cols[7]));
		var deliveryterm = formatValue(node.getValue(cols[8]));		
		var weightinpounds = Number(node.getValue(cols[11])).toFixed(4);
		var quantity = Math.abs(node.getValue(cols[6]));
		var grossweightinkilos = (weightinpounds / INTRASTAT.ConversionDivisor) * quantity;

		return {
			content: {
				"row": 0,
				"exclude": "F",
				"entity": nlapiEscapeXML(entity),
				"vatno": vatno,
				"commoditycode": commoditycode,
				"notc": notc,
				"deliveryterm": deliveryterm,
				"countrycode": countrycode,
				"trantype": trantype,
				"netamount": truncate ? parseInt(netamount, 10) : nlapiFormatCurrency(netamount),
				"quantity": Math.ceil(quantity),
				"grossweight": Math.max(Math.ceil(grossweightinkilos), 1),
				"origquantity": quantity,
				"orignetamount": netamount,
				"origweight": grossweightinkilos
			},
			"key": [commoditycode, notc, deliveryterm, countrycode, vatno].join(".")
		}
	}

	function consolidateNode(list, index, node) {
		var reportnode = list[index];
		reportnode.orignetamount += node.orignetamount;
		reportnode.origquantity += node.origquantity;
		reportnode.origweight += node.origweight;

		reportnode.netamount = truncate ? parseInt(reportnode.orignetamount) : nlapiFormatCurrency(reportnode.orignetamount);
		reportnode.quantity = Math.ceil(reportnode.origquantity);
		reportnode.grossweight = Math.max(Math.ceil(reportnode.origweight), 1);
		return reportnode;
	}
}

INTRASTAT.FranceReportRunner = function(taxcache, notccache, formatValue, formatVAT, truncate, metadata) { //used by GB and Generic
	var savedreports = {
		sales: "Intrastat FR Sales Report[4873]",
		purchase: "Intrastat FR Purchase Report[4873]"
	}
	var dateformat = nlapiGetContext().getPreference('DATEFORMAT').toLowerCase().replace("mm", "MM").replace("month", "MMMM").replace("mon", "MMM");

	nlapiLogExecution('Debug', 'INTRASTAT.FranceReportRunner:dateformat', dateformat);
	this.getSavedReports = function() {
		return savedreports;
	}

	this.getReport = getReport;

	function getReport(objReport) { //feed with value from sales or purchase report
		var reportMap = {
			"list": [],
			"customer": {},
			"keys": {}
		}; //keys and where it is in the list
		traverseReport(reportMap, objReport.getRowHierarchy(), objReport.getColumnHierarchy().getVisibleChildren());
		return reportMap.list;
	}

	function traverseReport(map, rowObj, cols, entityname) {
		var rowChildren = rowObj.getChildren();
		if (!rowChildren) return;
		for (var iChild in rowChildren) {
			var node = rowChildren[iChild];
			if (node.getChildren()) {
				traverseReport(map, node, cols, node.getValue());
			} else {
				var objNode = parseNode(map, node, cols, entityname);
				if (!objNode) {
					continue;
				} //not a part of nexus

				if (map.keys[objNode.key]) {
					consolidateNode(map.list, map.keys[objNode.key], objNode.content);
				} else {
					map.keys[objNode.key] = map.list.length; //current index in list
					objNode.content.row = map.list.length + 1; //update the row
					map.list.push(objNode.content);
				}
			}
		}
	}

	function parseNode(map, node, cols, entityname) {
		var taxcodename = formatValue(node.getValue(cols[12]));
		var taxcode = taxcache.findByName(taxcodename);

		if (!taxcode) {
			return null;
		}
		var indicator = taxcode.isservice ? metadata.service : metadata.good;

		var vatno = formatValue(node.getValue(cols[0]));
		var entity = formatValue(entityname);
		if (!vatno) {
			vatno = formatValue(node.getValue(cols[1])); //project
			if (map.customer[vatno]) {
				entity = map.customer[vatno];
			}
		} else { //put in customer map
			map.customer[vatno] = entityname;
		}
		var countrycode = formatValue(node.getValue(cols[4]));
		vatno = formatVAT(vatno, countrycode);

		var commoditycode = formatValue(node.getValue(cols[6]));
		var trantype = formatValue(node.getValue(cols[11]));

		var notc = formatValue(node.getValue(cols[8]));
		if (!notc) notc = formatValue(node.getValue(cols[9])); //column field
		if (!notc) notc = formatValue(notccache.findDefault(trantype));

		var deliveryterm = formatValue(node.getValue(cols[7]));
		var tranno = formatValue(node.getValue(cols[3]));
		var trandate = formatValue(node.getValue(cols[2]));
		var weightinpounds = Number(node.getValue(cols[13])).toFixed(4);
		var quantity = Math.abs(node.getValue(cols[10]));
		var grossweightinkilos = (weightinpounds / INTRASTAT.ConversionDivisor) * quantity;
		var netamount = Math.abs(node.getValue(cols[5]));
				
		return {
			content: {
				"row": 0,
				"exclude": "F",
				"entity": nlapiEscapeXML(entity),
				"vatno": vatno,
				"trandate": Date.parseExact(trandate, 'yyyy-MM-dd').toString(dateformat),
				"tranno": tranno,
				"countrycode": countrycode,
				"netamount": truncate ? parseInt(netamount, 10) : nlapiFormatCurrency(netamount),
				"commoditycode": commoditycode,
				"deliveryterm": deliveryterm,
				"notc": notc,
				"quantity": Math.ceil(quantity),
				"trantype": trantype,
				"grossweight": Math.max(Math.ceil(grossweightinkilos), 1),
				"origquantity": quantity,
				"orignetamount": netamount,
				"origweight": grossweightinkilos,
				"indicator": indicator
			},
			"key": [trandate, tranno, vatno, countrycode, commoditycode, deliveryterm, notc, indicator].join(".")
		}
	}

	function consolidateNode(list, index, node) {
		var reportnode = list[index];
		reportnode.orignetamount += node.orignetamount;
		reportnode.origquantity += node.origquantity;
		reportnode.origweight += node.origweight;

		reportnode.netamount = truncate ? parseInt(reportnode.orignetamount) : nlapiFormatCurrency(reportnode.orignetamount);
		reportnode.quantity = Math.ceil(reportnode.origquantity);
		reportnode.grossweight = Math.max(Math.ceil(reportnode.origweight), 1);
		return reportnode;
	}
}