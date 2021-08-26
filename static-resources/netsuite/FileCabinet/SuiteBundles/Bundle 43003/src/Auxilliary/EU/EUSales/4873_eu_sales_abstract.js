/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

var ECSALES;
if (!ECSALES)
    ECSALES = {};

ECSALES.ECSalesReportName = "EC Sales Summary by Tax Code [4873]";
ECSALES.ECSalesJournalReportName = "EC Sales Summary by Tax Code [4873] - JRN";
ECSALES.ECSalesTransactionReportName = "EC Sales Summary by Tax Code and Tran No [4873]";
ECSALES.ECSalesJournalTransactionReportName = "EC Sales Summary by Tax Code_Tran No [4873] - JRN";

ECSALES.Header = function _Header(startPeriodId, endPeriodId, subId, isConsolidated, dateFormat, countryform) {
    nlapiLogExecution("Debug", "ECSALES.Header: params", JSON
        .stringify({startPeriodId: startPeriodId, endPeriodId: endPeriodId, subId: subId, isConsolidated: isConsolidated, dateFormat: dateFormat, countryform: countryform}));
    this.subId = subId;
    this.dateFormat = dateFormat;
    this.nexus = countryform ? countryform.substring(0, 2) : "";
    this.languageCode = countryform ? countryform.substring(countryform.indexOf("_") + 1) : "";
    
    this._startPeriodDate = new SFC.System.TaxPeriod(startPeriodId);
    this._endPeriodDate = new SFC.System.TaxPeriod(endPeriodId);
    this._userInfo = _App.LoadCurrentUser();
    
    nlapiLogExecution("Debug", "ECSALES.Header: params", JSON.stringify({nexus: this.nexus, languageCode: this.languageCode}));
    
    this.formatDate = function _formatDate(dateObj, isPeriod) {
        var dateStr = "";
        if (dateObj) {
            var format = "";
            if (isPeriod) {
                format = (this.dateFormat && this.dateFormat.periodDateFormat) ? this.dateFormat.periodDateFormat : "MMMM yyyy";
            } else {
                format = (this.dateFormat && this.dateFormat.longDateFormat) ? this.dateFormat.longDateFormat : "MMMM d, yyyy";
            }
            dateStr = dateObj.toString(format);
        }
        return dateStr;
    };
    
    this.formatValue = function _formatValue(val) {
        return val ? nlapiEscapeXML(val) : "";
    };
    
    this.initializeDateFormatting = function _initializeDateFormatting() {
        try {
            if (!this.dateFormat) {
                this.dateFormat = {};
                this.dateFormat.shortDateFormat = "MM/dd/yyyy";
                this.dateFormat.longDateFormat = "MMMM d, yyyy";
                this.dateFormat.periodDateFormat = "MMMM yyyy";
            }
            
            if (!this.dateFormat.shortDateFormat) {
                this.dateFormat.shortDateFormat = "MM/dd/yyyy";
            }
            
            if (!this.dateFormat.longDateFormat) {
                this.dateFormat.longDateFormat = "MMMM d, yyyy";
            }
            
            if (!this.dateFormat.periodDateFormat) {
                this.dateFormat.periodDateFormat = "MMMM yyyy";
            }
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.DataHeader.initializeDateFormatting", errorMsg);
        }
    };
    
    this.getCompleteAddress = function _getCompleteAddress(company) {
        var completeAddress = [];
        
        if (company.Address1 && company.Address2) {
            completeAddress.push(company.Address1 + " " + company.Address2);
        }
        
        if (company.City) {
            completeAddress.push(company.City);
        }
        
        if (company.State) {
            completeAddress.push(company.State);
        }
        
        completeAddress.push(company.Country + " " + company.Zip);
        return completeAddress.join(", ");
    };
    
    this.getCompany = function _getCompany(isOneWorld) {
        var company = {};
        
        try {
            if (isOneWorld) {
                subsidiary = SFC.System.Subsidiary(this.subId, false);
                
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
                company.CompleteAddress = this.getCompleteAddress(company);
                
                if (company.Name == 'Parent Company')
                    company.Name = nlapiLoadConfiguration("companyinformation").getFieldValue("companyname");
                
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
                company.CompleteAddress = this.getCompleteAddress(company);
            }
            
            nlapiLogExecution("Debug", "ECSALES.DataHeader.getCompany: data", JSON.stringify(company));
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.DataHeader.getCompany", errorMsg);
        }
        
        return company;
    };
    
    this.getTaxReturnsConfig = function _getTaxReturnsConfig(company, isOneWorld) {
        var configuration = {};
        if (isOneWorld) {
            configuration = new Tax.Returns.Configuration(this.nexus ? this.nexus : company.CountryCode, this.subId);
        } else {
            configuration = new Tax.Returns.Configuration(this.nexus);
        }
        return configuration;
    };
    
    this.getConfigData = function _getConfigData(company, isOneWorld) {
        var data = {};
        try {
            if (this.nexus && getTaxFilingNexuses()[this.nexus]) {
                var configuration = this.getTaxReturnsConfig(company, isOneWorld);
                
                if (configuration) {
                    var config = new VAT.Configuration();
                    var schema = config.getSchemaByCountry(this.nexus ? this.nexus : company.CountryCode);
                    for ( var iprop in schema) {
                        var property = schema[iprop];
                        var propvalue = configuration.GetValue(property.altcode);
                        var lov = property.lov;
                        propvalue = propvalue ? propvalue : property.value;
                        
                        if (lov) {
                            for ( var ilov in lov) {
                                if (lov[ilov].value == propvalue && lov[ilov].lang2 == this.languageCode) {
                                    data[iprop + "_text"] = lov[ilov].description;
                                }
                            }
                        }
                        
                        data[iprop] = this.formatValue(propvalue);
                    }
                }
            }
            
            nlapiLogExecution("Debug", "ECSALES.DataHeader.getConfigData: data", JSON.stringify(data));
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.DataHeader.getConfigData", errorMsg);
        }
        return data;
    };
    
    this.getDateObject = function _getDateObject(type) {
        var dateobj = null;
        try {
            switch (type) {
                case "StartDate":
                    if (this._startPeriodDate)
                        dateobj = this._startPeriodDate.GetStartDate();
                    break;
                case "EndDate":
                    if (this._endPeriodDate)
                        dateobj = this._endPeriodDate.GetEndDate();
                    break;
            }
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.DataHeader.getDateObject", errorMsg);
        }
        
        return dateobj;
    };
    
    this.getEndPeriodType = function _getEndPeriodType() { // Do We Need To
        // Localize Using
        // User
        // Preferences
        var endPeriodType = "";
        try {
            if (this._endPeriodDate) {
                endPeriodType = this._endPeriodDate.GetType();
            }
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.DataHeader.getEndPeriodType", errorMsg);
        }
        
        return endPeriodType;
    };
    
    this.getStartPeriodType = function _getStartPeriodType() {
        var startPeriodType = "";
        try {
            if (this._startPeriodDate) {
                startPeriodType = this._startPeriodDate.GetType();
            }
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.DataHeader.getStartPeriodType", errorMsg);
        }
        
        return startPeriodType;
    };
    
    this.getBaseDate = function _getBaseDate() {
        var baseDate = this._startPeriodDate;
        
        if (!baseDate) {
            baseDate = this._endPeriodDate;
        }
        return baseDate;
    };
    
    this.getTaxYear = function _getTaxYear() {
        var fullYear = "";
        try {
            var baseDate = this.getBaseDate();
            if (baseDate) {
                fullYear = baseDate.GetStartDate().getFullYear();
            }
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.DataHeader.getTaxYear", errorMsg);
        }
        
        return fullYear;
    };
    
    this.getTaxMonth = function _getTaxMonth() {
        var month = "";
        try {
            var baseDate = this.getBaseDate();
            if (baseDate) {
                month = baseDate.GetStartDate().getMonth() + 1;
            }
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.DataHeader.getTaxMonth", errorMsg);
        }
        
        return month;
    };
    
    this.getPrintMsg = function _getPrintMsg() {
        var message;
        try {
            // Need to localize message and date format;
            var defaultMsg = [];
            defaultMsg.push("Printed by");
            defaultMsg.push(this._userInfo.Name);
            defaultMsg.push("(" + this._userInfo.Id + ")");
            defaultMsg.push("on");
            defaultMsg.push(new Date().toString("MMMM d, yyyy"));
            
            message = defaultMsg.join(" ");
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.DataHeader.getPrintMsg", errorMsg);
        }
        
        return message;
    };
    
    this.getConsolidatedMsg = function _getConsolidatedMsg() {
        var message = "";
        if (isConsolidated) {
            message = "This is a consolidated report.";
        } else {
            message = "";
        }
        
        return message;
    };
    
    this.setLocale = function _setLocale(locale) {
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
                case "zh":
                case "zha":
                    Date.CultureInfo = Date.CultureInfo_zh_tw;
                    break;
                case "en":
                case "eng":
                default:
                    Date.CultureInfo = Date.CultureInfo_en;
            }
        }
    };
    
    this.stripNumbersOnly = function _stripNumbersOnly(value) {
        var regexEU = new RegExp("[^0-9A-Za-z]", "g");
        var formattedvalue = value.replace(regexEU, ""); // numbers and
        // letters only
        
        var prefix = formattedvalue.substring(0, 2);
        
        var result = "";
        if (isNaN(parseInt(prefix.charAt(0))) && isNaN(parseInt(prefix.charAt(1))) && ECSALES.Constant.EU_COUNTRIES[prefix]) {
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
    };
    
    this.applyConfigOverrides = function _applyConfigOverrides(configuration, returnobj) {
        var configValues = Tax.DefaultValue[this.nexus];
        if (configValues) {
            for ( var iconfig in configValues) {
                var configobj = configValues[iconfig];
                var value = configuration.GetValue(configobj.internalid);
                if (value == null) { // vat online config does not
                    // exist
                    if (!returnobj[iconfig]) {
                        returnobj[iconfig] = configobj.value; // use
                        // default
                    }
                } else { // vat online config exist
                    value = this.formatValue(value);
                    if (configobj.type == "DATE" && value) {
                        value = Date.parseExact(value, Tax.DATE_FORMAT).toString(this.dateFormat.shortDateFormat);
                    }
                    returnobj[iconfig] = value;
                }
            }
        }
    };
    
    this.generate = function _generate() {
        try {
            this.initializeDateFormatting();
            this.setLocale(this.languageCode);
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.DataHeader", errorMsg);
        }
        var isOneWorld = ECSALES.isSubsidiarySettingOn();
        var _company = this.getCompany(isOneWorld);
        var _configdata = this.getConfigData(_company, isOneWorld);
        var returnobj = {};
        try {
            var startDateObj = this.getDateObject("StartDate");
            var endDateObj = this.getDateObject("EndDate");
            returnobj.province = this.formatValue(_company.State);
            returnobj.city = this.formatValue(_company.City);
            returnobj.address1 = this.formatValue(_company.Address1);
            returnobj.address2 = this.formatValue(_company.Address2);
            returnobj.completeAddress = this.formatValue(_company.CompleteAddress);
            returnobj.zipcode = this.formatValue(_company.Zip);
            returnobj.telephone = this.formatValue(_company.Telephone);
            returnobj.country = this.formatValue(_company.Country);
            returnobj.countrycode = this.formatValue(_company.CountryCode);
            returnobj.company = this.formatValue(_company.Name);
            returnobj.legalname = this.formatValue(_company.LegalName);
            returnobj.vatno = this.stripNumbersOnly(_company.VatNo);
            returnobj.email = this.formatValue(_company.Email);
            returnobj.startperiod = this.formatDate(startDateObj, true);
            returnobj.endperiod = this.formatDate(endDateObj, true);
            returnobj.taxyear = this.getTaxYear();
            returnobj.taxmonth = this.getTaxMonth();
            returnobj.StartDate = this.formatValue(this.formatDate(startDateObj, false));
            returnobj.EndDate = this.formatValue(this.formatDate(endDateObj, false));
            returnobj.consolidated = this.formatValue(this.getConsolidatedMsg());
            returnobj.printmsg = this.formatValue(this.getPrintMsg());
            returnobj.taxreg = this.formatValue(_configdata.taxreg);
            returnobj.startperiodtype = this.getStartPeriodType();
            returnobj.endperiodtype = this.getEndPeriodType();
            returnobj.startdateobj = startDateObj;
            returnobj.enddateobj = endDateObj;
            
            if (!this.nexus) {
                this.nexus = _company.CountryCode;
                if (ECSALES.Constant.EU_COUNTRIES[this.nexus]) {
                    var context = new COUNTRY_FORMS[this.nexus][0];
                    this.setLocale(context.language);
                    nlapiLogExecution("Debug", "ECSALES.DataHeader.getCompany: No Locale Found", context.language);
                }
            }
            
            var configuration = this.getTaxReturnsConfig(_company, isOneWorld);
            if (configuration) {
                this.applyConfigOverrides(configuration, returnobj);
            } else {
                nlapiLogExecution("Debug", "ECSALES.DataHeader.getCompany: configuration", "No Configuration Found");
            }
            
            nlapiLogExecution("Debug", "ECSALES.Header", JSON.stringify(returnobj));
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "ECSALES.Header", errorMsg);
        }
        return returnobj;
    };
};

ECSALES.CACHE = {};
ECSALES.CACHE.TAX_CODE = {};

ECSALES.TaxCodeCache = function _TaxCodeCache(nexus) {
    try {
    	if (!CONSTANTS.EU_NEXUSES[nexus]) {
    		return;
    	}
        
        var columns = [new nlobjSearchColumn("itemid"), new nlobjSearchColumn("rate")];
        var filters = [];
        
        if (ECSALES.isAdvanceTaxesSettingOn()) {
        	filters.push(new nlobjSearchFilter("country", null, "is", CONSTANTS.EU_NEXUSES[nexus].nexuscode));
        }
        
        var rs = nlapiSearchRecord("salestaxitem", null, filters, columns);
        
        for ( var i in rs) {
            var taxcursor = rs[i];
            var taxname = taxcursor.getValue("itemid");
            ECSALES.CACHE.TAX_CODE[taxname] = createTaxCode(taxcursor.getId(), taxcursor.getValue("itemid"), taxcursor.getValue("rate"), nexus);
        }
    } catch (ex) {
        var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
        nlapiLogExecution("ERROR", "ECSALES.TaxCodeCache", errorMsg);
    }
    
    function createTaxCode(id, name, rate, countrycode) {
        return {"id": id, "name": name, "rate": rate, "countrycode": countrycode, "isservice": false, "isupdated": false};
    }
    
    function updateTaxCode(taxId) {
        var rec = nlapiLoadRecord("salestaxitem", taxId);
        var name = rec.getFieldValue("itemid");
        var taxcode = ECSALES.CACHE.TAX_CODE[name];
        
        if (taxcode && !taxcode.isupdated) {
            taxcode.isservice = rec.getFieldValue("service") == "T";
            taxcode.isupdated = true;
        }
    }
    
    this.findByName = function _findByName(name) {
        if (ECSALES.CACHE.TAX_CODE[name] && !ECSALES.CACHE.TAX_CODE[name].isupdated) {
            updateTaxCode(ECSALES.CACHE.TAX_CODE[name].id);
        }
        
        return ECSALES.CACHE.TAX_CODE[name];
    };
};

ECSALES.VatEcSales = function _VatEcSales() { /* Data Structure */
    var nonestr = '--none--';
    
    this.GoodsAndServices = nonestr;
    this.setGoodsAndServices = function(value) {
        this.GoodsAndServices = value;
    };
    
    this.CountryCode = nonestr;
    this.setCountryCode = function(value) {
        this.CountryCode = value;
    };
    
    this.CountryName = nonestr;
    this.setCountryName = function(value) {
        this.CountryName = value;
    };
    
    this.CustomerVATRegistrationNumber = nonestr;
    this.setCustomerVATRegNbr = function(value) {
        this.CustomerVATRegistrationNumber = value;
    };
    
    this.TransactionIndicator = nonestr;
    this.setTransactionIndicator = function(value) {
        this.TransactionIndicator = value;
    };
    
    this.TotalValueOfSupplies = 0;
    this.setTotalValueOfSupplies = function(value) {
        this.TotalValueOfSupplies = value;
    };
    
    this.DecimalAmount = 0;
    this.setDecimalAmount = function(value) {
        this.setDecimalAmount = value;
    };
    
    // member variables that are NOT printed in the XML document
    this.CustomerName = nonestr;
    this.setCustomerName = function(value) {
        this.CustomerName = value;
    };
    
    this.CustomerCode = nonestr;
    this.setCustomerCode = function(value) {
        this.CustomerCode = value;
    };
    
    this.CustomerInternalID = nonestr;
    this.setCustomerInternalID = function(value) {
        this.CustomerInternalID = value;
    };
    
    this.TransactionNumber;
    this.setTransactionNumber = function(value) {
        this.TransactionNumber = value;
    };
    
    this.TransactionType;
    this.setTransactionType = function(value) {
        this.TransactionType = value;
    };
    
    this.TransactionDate;
    this.setTransactionDate = function(value) {
        this.TransactionDate = value;
    };
    
    this.Exclude;
    this.setExclude = function(value) {
        this.Exclude = value;
    };
};

ECSALES.ECSalesReport = function _ECSalesReport(fromPeriodId, pToPeriodId, pSubsidiary, isConsolidated, nexus) {
    nlapiLogExecution("Debug", "ECSALES.ECSalesReport: param", JSON
        .stringify({nexus: nexus, fromPeriodId: fromPeriodId, pToPeriodId: pToPeriodId, pSubsidiary: pSubsidiary, isConsolidated: isConsolidated}));
    this.taxcache = new ECSALES.TaxCodeCache(nexus);
    
    this.traverseReport = function _traverseReport(treeObj, rowObj, cols, parent, nexus, isDebug) {
        var rowChildren = rowObj.getChildren();
        if (rowChildren) {
            for ( var iChild in rowChildren) {
                var node = rowChildren[iChild];
                
                if (node.getChildren()) {
                    treeObj[String(node.getValue())] = ECSALES.createCustomerTreeNode(node.getValue(), parent);
                    this.traverseReport(treeObj, node, cols, node.getValue(), nexus, isDebug);
                } else {
                    var reportNode = ECSALES.getReportNode(node, cols);
                    var taxcode = this.taxcache.findByName(reportNode.taxcodename);
                    if (nexus && !taxcode) { // No tax means it's not part of
                        // nexus
                        continue;
                    }
                    var parentNode = treeObj[parent]; 
                    parentNode.vatno = reportNode.vatno;
                    if (!parentNode.defaultcountry && ECSALES.isDefaultCountry(reportNode)) {// set
                        // default
                        // country
                        parentNode.defaultcountry = reportNode.countrycode;
                    }
                    var countryNode = parentNode.country[reportNode.countrycode];
                    // accrue per tax code
                    if (!countryNode) {
                        parentNode.country[reportNode.countrycode] = ECSALES.createCountryNode(reportNode);
                        countryNode = parentNode.country[reportNode.countrycode];
                        if (isDebug) {
                            countryNode.taxcode[reportNode.taxcodename] = reportNode.taxamount;
                        }
                    } else if (isDebug) {
                        var taxNode = countryNode.taxcode[reportNode.taxcodename];
                        taxNode = taxNode ? taxNode : 0 + reportNode.taxamount;
                    }
                    
                    // accrue per type, service, goods
                    if (taxcode.isservice) {
                        if (reportNode.taxamount > 0) {
                            countryNode.servicesamount += reportNode.taxamount;
                        } else {
                            countryNode.returnservicesamount += reportNode.taxamount;
                        }
                    } else {
                        if (reportNode.taxamount > 0) {
                            countryNode.goodsamount += reportNode.taxamount;
                        } else {
                            countryNode.returngoodsamount += reportNode.taxamount;
                        }
                    }
                }
            }
        }
    };
    
    this.consolidateByCustomer = function _consolidateByCustomer(treeObj) {
        var customerTree = {};
        for ( var iTree in treeObj) {
            var node = treeObj[iTree];
            
            if ((!node.vatno || node.vatno == "null") && node.parent != "root") { // No
                // Vat
                // =
                // project
                // -
                // must
                // accrue
                // to
                // parent
                // that
                // has
                // vat
                
                var nodeCountry = node.country;
                var parent = ECSALES.locateParentCustomer(treeObj, node);
                
                if (!customerTree[parent.entityname]) { // Copy entity to tree
                    customerTree[parent.entityname] = parent;
                }
                

                if (parent.entityname == node.entityname) { // ignore if it's
                    // the parent node
                    continue;
                }
                
                var parentCountry = parent.country;
                

                for ( var iCountry in nodeCountry) {
                    var countrycursor = (iCountry) ? iCountry : parent.defaultcountry;
                    var currentNodeCountry = nodeCountry[iCountry];
                    var childNode = parentCountry[countrycursor];
                    if (childNode) {
                        childNode.servicesamount += currentNodeCountry.servicesamount;
                        childNode.goodsamount += currentNodeCountry.goodsamount;
                        childNode.returnservicesamount += currentNodeCountry.returnservicesamount;
                        childNode.returngoodsamount += currentNodeCountry.returngoodsamount;
                    } else { // copy to parent
                        parentCountry[countrycursor] = currentNodeCountry;
                    }
                }
            } else if (node.vatno || node.parent == "root") { // this is a
                // customer,
                // copy to
                // customer
                // tree;
                customerTree[iTree] = node;
            }
        }
        return customerTree;
    };
    
    this.appendJournalTree = function _appendJournalTree(transactiontree, journaltree) {
        for ( var itreenode in journaltree) {
            if (transactiontree[itreenode]) { // entity exists
                var treenode = journaltree[itreenode];
                for ( var icountry in treenode.country) {
                    var countryindex = (!icountry || icountry == "null") ? transactiontree[itreenode].defaultcountry : icountry;
                    
                    if (!countryindex) { // no default country, add to first
                        // country in list.
                        for ( var itemp in transactiontree[itreenode].country) {
                            countryindex = itemp;
                            break;
                        }
                    }
                    
                    var countrynode = transactiontree[itreenode].country[countryindex]; // country
                    // exists
                    if (countrynode) {
                        var treecountrynode = treenode.country[icountry];
                        countrynode.servicesamount += treecountrynode.servicesamount;
                        countrynode.goodsamount += treecountrynode.goodsamount;
                        countrynode.returnservicesamount += treecountrynode.returnservicesamount;
                        countrynode.returngoodsamount += treecountrynode.returngoodsamount;
                    } else {
                        transactiontree[itreenode].country[icountry] = treenode.country[icountry];
                    }
                }
            } else {
                transactiontree[itreenode] = journaltree[itreenode];
            }
        }
        
        return transactiontree;
    };
    
    this.getReport = function() {
        var runreportProfiler = new ECSALES.PerformanceLog("Performance: ECSALES.runReport");
        runreportProfiler.start();
        var reportObj = ECSALES.runReport(ECSALES.ECSalesReportName, fromPeriodId, pToPeriodId, pSubsidiary, isConsolidated);
        var jrnreportObj = ECSALES.runReport(ECSALES.ECSalesJournalReportName, fromPeriodId, pToPeriodId, pSubsidiary, isConsolidated);
        runreportProfiler.stopAndLog();
        
        var transTree = {};
        var journalTree = {};
        var reportProfiler = new ECSALES.PerformanceLog("Performance: traverseReport");
        reportProfiler.start();
        var isDebug = nlapiGetContext().getLogLevel() == 'DEBUG';
        
        this
            .traverseReport(transTree, reportObj.getRowHierarchy(), reportObj.getColumnHierarchy().getVisibleChildren(), "root", nexus, isDebug);
        this
            .traverseReport(journalTree, jrnreportObj.getRowHierarchy(), jrnreportObj.getColumnHierarchy().getVisibleChildren(), "root", nexus, isDebug);
        reportProfiler.stopAndLog();
        
        var treereportProfiler = new ECSALES.PerformanceLog("Performance: consolidateByCustomer");
        treereportProfiler.start();
        
        var customerTransTree = this.consolidateByCustomer(transTree);
        var customerJournalTree = this.consolidateByCustomer(journalTree);
        var customerTree = this.appendJournalTree(customerTransTree, customerJournalTree);
        treereportProfiler.stopAndLog();
        
        var data = [];
        
        for ( var iCustTree in customerTree) {
            var currentNode = customerTree[iCustTree];
            
            if (currentNode) {
                for ( var iCountry in currentNode.country) {
                    var countryNode = currentNode.country[iCountry];
                    var countrycode;
                    
                    if (countryNode.shipcountrycode && countryNode.shipcountrycode != "null") {
                        countrycode = countryNode.shipcountrycode;
                    } else {
                        countrycode = countryNode.billcountrycode;
                    }
                    
                    if (nexus == 'AT') {
                        var servicestotal = Number(countryNode.servicesamount) + Number(countryNode.returnservicesamount);
                        var goodstotal = Number(countryNode.goodsamount) + Number(countryNode.returngoodsamount);
                        
                        if (servicestotal != 0) {
                            data.push(ECSALES
                                .createReportRow(countrycode, servicestotal, "Services", currentNode.entityname, currentNode.vatno));
                        }
                        
                        if (goodstotal != 0) {
                            data.push(ECSALES.createReportRow(countrycode, goodstotal, "Goods", currentNode.entityname, currentNode.vatno));
                        }
                    } else {
                        if (Number(countryNode.servicesamount) > 0) {
                            data
                                .push(ECSALES
                                    .createReportRow(countrycode, countryNode.servicesamount, "Services", currentNode.entityname, currentNode.vatno));
                        }
                        
                        if (Number(countryNode.goodsamount) > 0) {
                            data.push(ECSALES
                                .createReportRow(countrycode, countryNode.goodsamount, "Goods", currentNode.entityname, currentNode.vatno));
                        }
                        
                        if (Number(countryNode.returngoodsamount) < 0) {
                            data
                                .push(ECSALES
                                    .createReportRow(countrycode, countryNode.returngoodsamount, "Goods", currentNode.entityname, currentNode.vatno));
                        }
                        
                        if (Number(countryNode.returnservicesamount) < 0) {
                            data
                                .push(ECSALES
                                    .createReportRow(countrycode, countryNode.returnservicesamount, "Services", currentNode.entityname, currentNode.vatno));
                        }
                    }
                }
            }
        }
        
        nlapiLogExecution('Debug', 'ECSALES.ECSalesReport.getVat101Data: rowcount', data ? data.length : 0);
        
        return data;
    };
};

ECSALES.ECSalesTransactionReport = function _ECSalesTransactionReport(fromperiodid, toperiodid, subsidiaryid, isconsolidated, nexus) {
    nlapiLogExecution("Debug", "ECSALES.ECSalesTransactionReport: param", JSON
        .stringify({nexus: nexus, fromperiodid: fromperiodid, toperiodid: toperiodid, subsidiaryid: subsidiaryid, isconsolidated: isconsolidated}));
    this.taxcache = new ECSALES.TaxCodeCache(nexus);
    
    this.traverseReport = function _traverseReport(treeObj, rowObj, cols, parent, nexus, isDebug) {
        var rowChildren = rowObj.getChildren();
        if (rowChildren) {
            for ( var iChild in rowChildren) {
                var node = rowChildren[iChild];
                
                if (node.getChildren()) {
                    treeObj[String(node.getValue())] = ECSALES.createCustomerTreeNode(node.getValue(), parent);
                    this.traverseReport(treeObj, node, cols, node.getValue(), nexus, isDebug);
                } else {
                    var reportNode = ECSALES.getReportNode(node, cols);
                    var taxcode = this.taxcache.findByName(reportNode.taxcodename);
                    
                    if (nexus && !taxcode) { // No tax means it's not part of
                        // nexus
                        continue;
                    }
                    
                    var parentNode = treeObj[parent];
                    parentNode.vatno = reportNode.vatno;
                    
                    if (!parentNode.defaultcountry && ECSALES.isDefaultCountry(reportNode)) {
                        parentNode.defaultcountry = reportNode.countrycode;
                    }
                    
                    var key = reportNode.trantype + reportNode.tranno; // trantype
                    // +
                    // tranno
                    this.accrueTransactionNode(parentNode, key, reportNode, taxcode, isDebug);
                }
            }
        }
    };
    
    this.accrueTransactionNode = function _accrueTransactionNode(node, key, reportNode, taxcode, isDebug) {
        var transaction = node.transaction[key];
        if (!transaction) { // create the transaction node
            transaction = ECSALES.createTransactionTreeNode(reportNode);
            node.transaction[key] = transaction;
        }
        var countryNode = transaction.country[reportNode.countrycode];
        if (!countryNode) { 
            countryNode = ECSALES.createCountryNode(reportNode);
            transaction.country[reportNode.countrycode] = countryNode;
        }
        
        if (isDebug) {
            countryNode.taxcode[reportNode.taxcodename] = reportNode.taxamount;
        }
        
        // check and accrue if service or goods
        if (taxcode.isservice) {
            countryNode.servicesamount += reportNode.taxamount;
        } else {
            countryNode.goodsamount += reportNode.taxamount;
        }
    };
    
    this.consolidateByCustomer = function _consolidateByCustomer(treeObj) {
        var customerTree = {};
        for ( var iTree in treeObj) {
            var node = treeObj[iTree];
            
            if (!node.vatno || node.vatno == "null") { // No Vat = project -
                // must accrue to parent
                // that has vat
                var parent = ECSALES.locateParentCustomer(treeObj, node);
                if (!customerTree[parent.entityname]) { // Copy entity to tree
                    customerTree[parent.entityname] = parent;
                }
                
                if (parent.entityname == node.entityname) { // ignore if it's
                    // the parent node
                    continue;
                }
                
                var parentTran = parent.transaction;
                var nodeTran = node.transaction;
                for ( var iTran in nodeTran) { // copy all to parent
                    parentTran[iTran] = nodeTran[iTran];
                }
            } else if (node.vatno || node.parent == "root") { // this is a
                // customer,
                // copy to
                // customer
                // tree;
                customerTree[iTree] = node;
            }
        }
        return customerTree;
    };
    
    this.appendJournalTree = function _appendJournalTree(transactiontree, journaltree) {
        for ( var itreenode in journaltree) {
            if (transactiontree[itreenode]) { // entity exists
                var treenode = journaltree[itreenode];
                
                for ( var itransaction in treenode.transaction) {
                    var trannode = treenode.transaction[itransaction];
                    var key = trannode.trantype + trannode.tranno;
                    transactiontree[itreenode].transaction[key] = trannode;
                }
            } else {
                transactiontree[itreenode] = journaltree[itreenode];
            }
        }
        return transactiontree;
    };
    
    this.getReport = function() {
        var reportObj = ECSALES.runReport(ECSALES.ECSalesTransactionReportName, fromperiodid, toperiodid, subsidiaryid, isconsolidated);
        var jrnreportObj = ECSALES
            .runReport(ECSALES.ECSalesJournalTransactionReportName, fromperiodid, toperiodid, subsidiaryid, isconsolidated);
        var transTree = {};
        var journalTree = {};
        
        var isDebug = nlapiGetContext().getLogLevel() == 'DEBUG';
        
        var reportProfiler = new ECSALES.PerformanceLog("Performance: traverseReport");
        reportProfiler.start();
        this.traverseReport(transTree, reportObj.getRowHierarchy(), reportObj.getColumnHierarchy().getVisibleChildren(), "root", nexus, isDebug);
        this.traverseReport(journalTree, jrnreportObj.getRowHierarchy(), jrnreportObj.getColumnHierarchy().getVisibleChildren(), "root", nexus, isDebug);
        
        reportProfiler.stopAndLog();
        var customerTransTree = this.consolidateByCustomer(transTree);
        var customerJournalTree = this.consolidateByCustomer(journalTree);
        
        var customerTree = this.appendJournalTree(customerTransTree, customerJournalTree);
        var data = [];
        
        for ( var iTree in customerTree) {
            var customernode = customerTree[iTree];
            for ( var iTran in customernode.transaction) {
                var trannode = customernode.transaction[iTran];
                for ( var iCountry in trannode.country) {
                    var countrynode = trannode.country[iCountry];
                    
                    var countrycode = countrynode.shipcountrycode && countrynode.shipcountrycode != "null" ? countrynode.shipcountrycode : countrycode = countrynode.billcountrycode;
                    
                    if (Number(countrynode.servicesamount) != 0) {
                        data
                            .push(ECSALES
                                .createReportRow(countrycode, countrynode.servicesamount, "Services", customernode.entityname, customernode.vatno, trannode.tranno, trannode.trandate, trannode.trantype));
                    }
                    
                    if (Number(countrynode.goodsamount) != 0) {
                        data
                            .push(ECSALES
                                .createReportRow(countrycode, countrynode.goodsamount, "Goods", customernode.entityname, customernode.vatno, trannode.tranno, trannode.trandate, trannode.trantype));
                    }
                }
            }
        }
        
        return data;
    };
};
