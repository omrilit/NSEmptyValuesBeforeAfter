/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

/* All of these are reused in either ui.js or abstract.js */
var ECSALES;
if (!ECSALES) ECSALES = {};

ECSALES.VAT_FORMAT_REGEX = { //put this in record type in the future
	AT: "^(AT){0,1}[U]{1}[0-9]{8}$", 
	BE: "^(BE){0,1}[0]{1}[0-9]{9}$",
	GB: "^(GB){0,1}(GD|HA){0,1}[0-9]{3,9}$",
	DE: "^(DE){0,1}[0-9]{9}$",
	ES: "^(ES){0,1}[A-Z0-9]{1}[0-9]{7}[A-Z0-9]{1}$",
	IT: "^(IT){0,1}[0-9]{11}$",
	SE: "^(SE){0,1}[0-9]{12}$",
	NL: "^(NL){0,1}[0-9]{9}[B]{1}[0-9]{2}$",
	
	BG: "^(BG){0,1}[0-9]{9,10}$",
	CY: "^(CY){0,1}[0-9]{8}[A-Z]{1}$",
	CZ: "^(CZ){0,1}[0-9]{8,10}$",
	DK: "^(DK){0,1}[0-9]{8}$",
	EE: "^(EE){0,1}[0-9]{9}$",
	EL: "^(EL){0,1}[0-9]{9}$", //Greece
	GR: "^(EL){0,1}[0-9]{9}$", //Greece
	FI: "^(FI){0,1}[0-9]{8}$",
	FR: "^(FR){0,1}[A-HJ-NP-Z]{0,2}[0-9]{9,11}$",
	HU: "^(HU){0,1}[0-9]{8}$",
	IE: "^(IE){0,1}[0-9]{1}[0-9A-Z]{1}[0-9]{5}[A-Z]{1}$",
	LT: "^(LT){0,1}[0-9]{9,12}$",
	LU: "^(LU){0,1}[0-9]{8}$",
	LV: "^(LV){0,1}[0-9]{11}$",
	MT: "^(MT){0,1}[0-9]{8}$",
	PL: "^(PL){0,1}[0-9]{10}$",
	PT: "^(PT){0,1}[0-9]{9}$",
	RO: "^(RO){0,1}[0-9]{2,10}$",
	SI: "^(SI){0,1}[0-9]{8}$",
	SK: "^(SK){0,1}[0-9]{10}$",
	MC: "^(FR|MC){0,1}[A-HJ-NP-Z]{0,2}[0-9]{9,11}$"
};

//Reusable methods for report generation
ECSALES.locateParentCustomer = function(treeObj, node) {
	 if (node.parent == "root") { //Parent customer with no vat
		 return node; 
	 } else if (!node.vatno || node.vatno == "null") { //No vat = project
		 return ECSALES.locateParentCustomer(treeObj, treeObj[node.parent]);
	 } else {//customer found
		 return node;
	 }
}

ECSALES.createReportRow = function(countrycode, amount, indicator, customername, vatno, tranno, trandate, trantype) {
	var rowObj = new ECSALES.VatEcSales();
	
	rowObj.CountryCode = countrycode;
	rowObj.TotalValueOfSupplies = amount;
	rowObj.CustomerInternalID = 0;
	rowObj.GoodsAndServices = indicator;
	rowObj.CustomerName = customername;
	rowObj.CustomerVATRegistrationNumber = vatno;
	rowObj.TransactionNumber = tranno;
	rowObj.TransactionDate = trandate;
	rowObj.TransactionType = trantype;

	return rowObj;
}
	
ECSALES.runReport = function (reportName, fromperiod, toperiod, subid, isConsolidated) {
	
	var objReport;
	try {
		var reportid = SFC.System.FindReportId(reportName);
		nlapiLogExecution("Audit", "ECSALES.Vat101Report.runReport: reportid", reportid);
		
		var _ReportSettings = new nlobjReportSettings(fromperiod.toString(), toperiod.toString());
		
		if (_App.IsOneWorld)
			_ReportSettings.setSubsidiary(isConsolidated ? -subid : subid);
		
		objReport = nlapiRunReport(reportid, _ReportSettings);
		
		nlapiLogExecution("Audit", "ECSALES.Vat101Report.runReport: objReport", objReport);
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "ECSALES.Vat101Report.runReport", errorMsg);
	}
	
	return objReport;
}
	
ECSALES.isDefaultCountry = function (reportNode) {
	var isDefaultCountry = false;
	var value = reportNode.vatno;
	
	var re = new RegExp("[^0-9A-Za-z]", "g");  
	var formattedvalue = value.replace(re, ""); //numbers and letters only
	var prefix = formattedvalue.substring(0, 2)
	
	if (isNaN(parseInt(prefix.charAt(0))) && isNaN(parseInt(prefix.charAt(1)))) { //first 2 characters are letters
		isDefaultCountry = (prefix == reportNode.countrycode);
	}
	
	return isDefaultCountry;
}
	
ECSALES.getReportNode = function (node, cols) {
	var vatno = String(node.getValue(cols[0]));
	var projvatno = String(node.getValue(cols[6]));
	if (!vatno || vatno == "null") {
		vatno = projvatno;
	}
	
	var billcountrycode = String(node.getValue(cols[1]));
	var shipcountrycode = String(node.getValue(cols[2]));
	var taxcodename = String(node.getValue(cols[3]));
	var taxamount = Number(node.getValue(cols[4])); //netamount
	var trantype = String(node.getValue(cols[5]));

	var tranno = cols.length>7?String(node.getValue(cols[7])):"";
	var trandate = cols.length>7?String(node.getValue(cols[8])):"";
	
	var countrycode = String(shipcountrycode?shipcountrycode:(billcountrycode?billcountrycode:"null"));
	
	return {
		"vatno": vatno,
		"billcountrycode": billcountrycode,
		"shipcountrycode": shipcountrycode,
		"taxcodename": taxcodename,
		"taxamount": taxamount,
		"trantype": trantype,
		"tranno": tranno,
		"trandate": trandate,
		"countrycode": countrycode
	}
}	

//Nodes.  Each Customer will either have country nodes or transaction nodes.  Each transaction node will have country nodes.
ECSALES.createCustomerTreeNode = function (entityname, parententity, vatno) {
	return {
		"entityname": entityname, 
		"vatno": vatno, 
		"parent": parententity, 
		defaultcountry: "",
		transaction: {}, //To be used if Using Transaction No
		country: {}
	}
}

ECSALES.createTransactionTreeNode = function (reportNode) {
	return {
		"tranno": reportNode.tranno,
		"trandate": reportNode.trandate,
		"trantype": reportNode.trantype,
		country: {}
	}
}

ECSALES.createCountryNode = function(reportNode) {
	return {
		"shipcountrycode": reportNode.shipcountrycode, 
		"billcountrycode": reportNode.billcountrycode, 
		"servicesamount": 0,
		"goodsamount": 0,
		"returnservicesamount": 0,
		"returngoodsamount": 0,
		taxcode: {}
	}
}

ECSALES.PerformanceLog = function(name) {
	var startDate;
	var endDate;
	this.start = function() {
		startDate = new Date();
	}
	
	this.stop = function() {
		endDate = new Date();
	}
	
	this.stopAndLog = function() {
		this.stop();
		this.log();
	}
	
	this.log = function() {
		var startTime = getUTC(startDate);
		var endTime = getUTC(endDate);
		nlapiLogExecution("Error", name, endTime - startTime);
	}
	
	function getUTC(dateObj) {
		return Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), dateObj.getHours(), dateObj.getMinutes(), dateObj.getSeconds(), dateObj.getMilliseconds());
	}
}

ECSALES.getFileName = function (countrycode, isconsolidated, fromperiod, toperiod, extension) {
	var fileName = [countrycode, "EUSales"];
	Date.CultureInfo = Date.CultureInfo_en; //English Only
	
	if (isconsolidated) {
		fileName.push("(Group)");
	}

	if (fromperiod.GetId() == toperiod.GetId()) {
		if (fromperiod.GetType() == "month") { //Check if Monthly
			fileName.push(fromperiod.GetStartDate().toString("MMMyy"));
		} else { //Quarterly or Yearly
			fileName.push(fromperiod.GetStartDate().toString("MMMyy"));
			fileName.push(toperiod.GetEndDate().toString("MMMyy"));
		}
	} else {
		fileName.push(fromperiod.GetStartDate().toString("MMMyy"));
		fileName.push(toperiod.GetStartDate().toString("MMMyy"));
	}
	
	var currentstamp = new Date();
	fileName.push(currentstamp.toString("MMddyyHHmmss"));
	
	return fileName.join("_") + "." + extension;
}

ECSALES.createOutputFolder = function ( rootFolder ) {
	var arrayRootFolder = nlapiSearchRecord('folder', null, new nlobjSearchFilter('name', null, 'is', rootFolder), new nlobjSearchColumn('internalid') );
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
}    
	
ECSALES.createIndicatorObject = function(indicatorList) {
	var objIndicator = {};
	
	if (indicatorList ) {
		var objIndicatorArr = indicatorList.split("|");
		nlapiLogExecution('Debug', 'ECSALES.createIndicatorObject: Array Length', objIndicatorArr.length);
		for(var iIndicatorArr = 0; iIndicatorArr < objIndicatorArr.length; iIndicatorArr++) {
			var objArr = objIndicatorArr[iIndicatorArr].split(":");
			objIndicator[objArr[0]] = objArr[1];
		}
	}
	
	return objIndicator;
}
	
ECSALES.createExcludeObject = function (excludeList) {
	var objExclude = {};
	
	if (excludeList) {
		var objExcludeArr = excludeList.split("|");
		nlapiLogExecution('Debug', 'ECSALES.createExcludeObject: Array Length', objExcludeArr.length);
		for(var iExcludeArr = 0; iExcludeArr<objExcludeArr.length; iExcludeArr++) {
			objExclude[objExcludeArr[iExcludeArr]] = true;
		}
	}
	
	return objExclude;
}
	
ECSALES.fixParamValue = function(value) {
	if (value) {
		return value.replace(",", "");  //Netsuite puts , during post
	} else {
		return value;
	}
}

ECSALES.getVatRegNoToDisplay = function (value) {
	var vatno = "";
	if (value == 'null' || !value) {
		return vatno;
	} else { // trim the first 2 chars if country code
		var re = new RegExp("[^0-9A-Za-z]", "g");  
		var formattedvalue = value.replace(re, ""); //numbers and letters only
		var prefix = formattedvalue.substring(0, 2)
		
		if (isNaN(parseInt(prefix.charAt(0))) && isNaN(parseInt(prefix.charAt(1)))) { //First 2 chars are country codes
			vatno = formattedvalue.substring(2);
		} else {
			vatno = formattedvalue;
		}
	}
	
	return vatno;
}

ECSALES.getVatNoCountryCode = function (value) {
	var vatnocountrycode = "";

	if (value && value != 'null') {
		var re = new RegExp("[^0-9A-Za-z]", "g");  
		var formattedvalue = value.replace(re, ""); //numbers and letters only
		var prefix = formattedvalue.substring(0, 2);
		
		if (isNaN(parseInt(prefix.charAt(0))) && isNaN(parseInt(prefix.charAt(1)))) {
			vatnocountrycode = prefix;
		}
	}
	
	return vatnocountrycode;
};

ECSALES.formatVATNo = function (vatno, vatcountrycode, shipcountrycode) {
	var displayedVatRegNo;
		
	if ((vatcountrycode == shipcountrycode) || (!shipcountrycode || shipcountrycode == 'null' || shipcountrycode == 'MC') || (vatcountrycode == 'EL')) {
		//Check if the format is correct
		var regexformat = ECSALES.VAT_FORMAT_REGEX[(shipcountrycode && shipcountrycode != 'null')?shipcountrycode:vatcountrycode];
		
		if (!regexformat) { //no format found
			displayedVatRegNo = vatno;
		} else {
			var regex = new RegExp(regexformat, "g");  
			if (regex.test(vatno)) {
				displayedVatRegNo = vatno;
			} else {
				displayedVatRegNo = ["<span style='color: #7B68EE'>", vatno, "</span>"].join("");
			}
		}
	} else if (vatno && vatno != "&nbsp;") {
		displayedVatRegNo = ["<span style='color: #7B68EE'>", vatno, "</span>"].join("");
	} else {
		displayedVatRegNo = "";
	}
	
	return displayedVatRegNo
}

ECSALES.isSubsidiarySettingOn = function() {
    return ECSALES.isAcctFeatureOn('FEATURE', 'SUBSIDIARIES');
}

ECSALES.isAdvanceTaxesSettingOn = function() {
    return ECSALES.isAcctFeatureOn('FEATURE', 'ADVTAXENGINE');
}

ECSALES.isAcctFeatureOn = function(featureType, featureName) {
    var isFeatureOn = true;
    var featureStatus = nlapiGetContext().getSetting(featureType, featureName);
    if (featureStatus == 'F') { isFeatureOn = false; }
    return isFeatureOn;
}

ECSALES.loadFileContent = function (filename, fileid) {
	if (!fileid) {
		fileid = _App.GetFileId(filename, false);
	} 
	var fileobj = nlapiLoadFile(parseInt(fileid));

	fileobj.setEncoding("UTF-8");
	return fileobj.getValue();
}

ECSALES.CACHEROWSET = function(context, nexus, params) {
	this.pageresultset;
	this.cachefilename = getFileCacheName("EUSales");
	this.cachefileid;
	this.recordsperpage = Number(nlapiGetContext().getPreference('LISTSEGMENTSIZE'));
	this.pagecount = 0;//Math.ceil(objRowList.length/this.recordsperpage);
	this.rowcount = 0;
	this.currentpage = 1;
	this.filterfilename = getFileCacheName("EUSalesFilter");
	this.filterfileid;
	var objRowList;
		
	nlapiLogExecution("Audit", "ECSALES.CACHEROWSET: nexus", nexus);
	nlapiLogExecution("Audit", "ECSALES.CACHEROWSET: records per page", this.recordsperpage);
	nlapiLogExecution("Audit", "ECSALES.CACHEROWSET: page count", this.pagecount);
	
	for(var iParam in params) {
		nlapiLogExecution("Audit", "ECSALES.CACHEROWSET:" + iParam, params[iParam]);
	}
	
	try {
		if (!params["cachefileid"] && !params["cachefilename"]) { //first invocation
			objRowList = getReportRows(context, nexus, params);
			this.rowcount = objRowList.length;
			//cleanupFileCache();
			
			nlapiLogExecution('Debug', 'ECSALES.CACHEROWSET: Rowcount', this.rowcount);
			if (this.rowcount > this.recordsperpage) { //no need to page
				this.cachefileid = createFileCache(this.cachefilename, this.recordsperpage, objRowList);
				this.pagecount = Math.ceil(objRowList.length/this.recordsperpage);
				this.filterfileid = createFilterFileCache(context, this.filterfilename, objRowList, this.recordsperpage);
				var content = ECSALES.loadFileContent(this.cachefilename, this.cachefileid); 
				objRowList = JSON.parse(content);
			}
			
			nlapiLogExecution("Audit", "ECSALES.CACHEROWSET: cachefileid", this.cachefileid);
			nlapiLogExecution("Audit", "ECSALES.CACHEROWSET: filterfileid", this.filterfileid);
		} else {
			this.filterfileid = parseInt(params["filterfileid"]);
			this.filterfilename = params["filterfilename"];
			this.cachefileid = parseInt(params["cachefileid"]);
			this.cachefilename = params["cachefilename"];
			var filecachecontent = ECSALES.loadFileContent(this.cachefilename, this.cachefileid);
			var filecacheresult = JSON.parse(filecachecontent);
			objRowList = filecacheresult;
			this.pagecount = objRowList.length;
			this.rowcount = objRowList[this.pagecount-1].length + ((this.pagecount-1)*this.recordsperpage);
		}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "ECSALES.CACHEROWSET", errorMsg);
	}
	
	function getCountryCode(vatNo) {
		if (vatNo) {
			var prefix = vatNo.substring(0, 2);	
			if (isNaN(Number(prefix))) {
				return prefix;
			}
		} 
	}
	
	function getReportRows(context, nexus, params) {
		nlapiLogExecution('Debug', 'ECSALES.CACHEROWSET.getReportRows: ' + nexus, JSON.stringify(params));
		var listbody = [];
		var colmetadata = context.getListColumnMetaData();
		var ecData = context.getReportData(params["fromperiodid"], params["toperiodid"], params["subsidiaryid"], params["isconsolidated"], nexus);
		
        for (var iRow = 0; iRow < ecData.length; iRow++) { //Add the rows
			var currentRow = ecData[iRow];
			var customercolumn;
			var chkboxfld;
			var countryCode = currentRow.CountryCode;
			
			//Need to move this to format row
			if (currentRow.CustomerName == '- No Entity -') {
				customercolumn = currentRow.CustomerName;
				chkboxfld = "T";
			} else if (nexus == countryCode) { //In Country
				customercolumn = ["<a style='color: red' target='_blank' href='", context.CustomerURL, '&customername=', escape(currentRow.CustomerName), "'>", currentRow.CustomerName, "</a>"].join(""); 
				chkboxfld = "T";
			} else if (countryCode && countryCode != 'null' && !ECSALES.Constant.EU_COUNTRIES[countryCode]) { //Non-EU
				customercolumn = ["<a style='color: #A52A2A' target='_blank' href='", context.CustomerURL, '&customername=', escape(currentRow.CustomerName), "'>", currentRow.CustomerName, "</a>"].join(""); 
				chkboxfld = "T";
			} else if (!countryCode || countryCode == 'null') { //No Country Destination
				customercolumn = ["<a style='color: #7B68EE' target='_blank' href='", context.CustomerURL, '&customername=', escape(currentRow.CustomerName), "'>", currentRow.CustomerName, "</a>"].join(""); 
				chkboxfld = "T";
			} else if (!ECSALES.getVatRegNoToDisplay(currentRow.CustomerVATRegistrationNumber) || currentRow.CustomerVATRegistrationNumber=='null'){ //No Vat
				customercolumn = ["<a style='color: #7B68EE' target='_blank' href='", context.CustomerURL, '&customername=', escape(currentRow.CustomerName), "'>", currentRow.CustomerName, "</a>"].join(""); 
				chkboxfld = "T";
			} else {
				customercolumn = ["<a style='color: black' target='_blank' href='", context.CustomerURL, '&customername=', escape(currentRow.CustomerName), "'>", currentRow.CustomerName, "</a>"].join(""); 
				chkboxfld = "F";
			}
			
			currentRow.setCustomerName(customercolumn);
			currentRow.setExclude(chkboxfld);
			var indicator = String((currentRow.GoodsAndServices == 'Services')?context.ServicesOptionValue:context.GoodsOptionValue);
			currentRow.setGoodsAndServices(indicator);
			
			var row = new ECSALES.Context.RowData(iRow+1, currentRow, "", "");
			listbody.push (context.formatRowData(colmetadata, row));
        }
		
		return listbody;
	}
	
	function getFileCacheName(prefix) {
		var fileName = [prefix, nlapiGetSubsidiary(), nlapiGetUser()];
		Date.CultureInfo = Date.CultureInfo_en; //English Only
		
		var currentstamp = new Date();
		fileName.push(currentstamp.toString("MMddyyHHmmss"));
		fileName.push(".txt");
		
		return fileName.join("");
	}
	
	function updateFilterFile(filename, objcontent) {	
		var fileobj = nlapiCreateFile(filename, 'PLAINTEXT', JSON.stringify(objcontent));
		var outputFolderId = ECSALES.createOutputFolder("TaxReportBundleTempFolder");
		fileobj.setFolder(outputFolderId);
		fileobj.setName(filename);
		fileobj.setEncoding("UTF-8");
		var fileid = nlapiSubmitFile(fileobj);	
		return fileid;
	}
	
	function createFileCache(filename, recordsperpage, objRowList) {
		var runProfiler =  new ECSALES.PerformanceLog("Performance: ECSALES.CACHEROWSET.createFileCache");
		runProfiler.start();
		var pagearray = [];
		nlapiLogExecution('Debug', 'ECSALES.CACHEROWSET.createFileCache: records per page' , recordsperpage);
		if (objRowList && objRowList.length > 0) {
			for(var icount=0; icount < objRowList.length; icount += recordsperpage) {
				var page = objRowList.slice(icount, icount + recordsperpage);
				pagearray.push(page);
			}
		}
		var fileobj = nlapiCreateFile(filename, 'PLAINTEXT', JSON.stringify(pagearray));
		var outputFolderId = ECSALES.createOutputFolder("TaxReportBundleTempFolder");
		fileobj.setFolder(outputFolderId);
		fileobj.setName(filename);
		fileobj.setEncoding("UTF-8");
		var fileid = nlapiSubmitFile(fileobj);	
		runProfiler.stopAndLog();
		return String(parseInt(fileid));
	}
	
	function createFilterFileCache(context, filename, objRowList, recordsperpage) {
		var filtercache = {};
		filtercache["indicator"] = [];
		
		var mgr = new ECSALES.ContextManager();
		var metadata = context.getListColumnMetaData();
		var excludeindex = mgr.findIndex(metadata, "exclude");
		var excludeid = metadata[excludeindex].id;
		
		//Exclude
		var excludeobj = [];
		var excludepage = [];
		
		for(var iRow=0; iRow<objRowList.length; iRow++) {
			if ((iRow+1)%recordsperpage == 0) {
				if (objRowList[iRow][excludeid] == 'T') {
					excludepage.push(iRow+1);
				}
				excludeobj.push(excludepage.join("|"));
				excludepage = [];
			} else {
				if (objRowList[iRow][excludeid] == 'T') {
					excludepage.push(iRow+1);
				}
			}
		}
		excludeobj.push(excludepage.join("|"));
		
		filtercache["exclude"] = excludeobj;
		
		var fileobj = nlapiCreateFile(filename, 'PLAINTEXT', JSON.stringify(filtercache));
		var outputFolderId = ECSALES.createOutputFolder("TaxReportBundleTempFolder");
		fileobj.setFolder(outputFolderId);
		fileobj.setName(filename);
		fileobj.setEncoding("UTF-8");
		var fileid = nlapiSubmitFile(fileobj);	
		
		return String(parseInt(fileid));
	}
	
	function cleanupFileCache() {
		try {
			var folderfilter = [new nlobjSearchFilter("name", null, "is", 'TaxReportBundleTempFolder')];
			var rsFolder = nlapiSearchRecord("folder", null, folderfilter);

			if (!rsFolder) {return;}
			
			var filefilter = [new nlobjSearchFilter("folder", null, "is", rsFolder[0].getId())];
			var filecolumn = [new nlobjSearchColumn('name'), new nlobjSearchColumn('owner')]
			var rsFile = nlapiSearchRecord("file", null, filefilter, filecolumn);
			for(var iFile in rsFile){
				var owner = rsFile[iFile].getValue('owner');
				var name = rsFile[iFile].getValue('name');
				
				if (owner == nlapiGetUser()) {
					nlapiLogExecution("ERROR", "INTRASTAT.CacheRowSet.cleanupFileCache", name);
					nlapiDeleteFile(rsFile[iFile].getId());
				}
			}
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.CacheRowSet.cleanupFileCache", errorMsg);
		}
	}
	
	
	this.getPageResult = function (context, params, request) {
		if (this.rowcount <= this.recordsperpage) { //no need to page
			return objRowList;
		}
		
		var mgr = new ECSALES.ContextManager();
		var metadata = context.getListColumnMetaData();
		var excludeindex = mgr.findIndex(metadata, "exclude");
		var excludeid = metadata[excludeindex].id;
		var indicatorindex = mgr.findIndex(metadata, "indicator");
		var indicatorid = metadata[indicatorindex].id;
		var rowindex = mgr.findIndex(metadata, "row");
		var rowid = metadata[rowindex].id;

		nlapiLogExecution("Audit", "ECSALES.CACHEROWSET.getPageResult:" + iParam, JSON.stringify(params));
		
		if (params["pageno"]) {
			this.currentpage = params["pageno"];
		} else {
			this.currentpage = 1;
		}
		
		var tempresultset = objRowList[this.currentpage-1];

		var filterfilecontent = ECSALES.loadFileContent(this.filterfilename, this.filterfileid);
		var previouspage = parseInt(params["previouspageno"]);
		var objfilter = JSON.parse(filterfilecontent);
		
		if (params["previouspageno"]) {
			//if Marked All
			if (params["markall"] && params["markall"] == 'unmarked') {
				for(var iunmarked = 0; iunmarked < objfilter.exclude.length; iunmarked++) {
					objfilter.exclude[iunmarked] = "";
				}
			} else if (params["markall"] && params["markall"] == 'marked') {
				var counter = 1;
				for(var imarked = 0; imarked < objRowList.length; imarked++) { //pages
					var currentpage = objRowList[imarked];
					var currentpagelist = [];
					for(var jmarked = 0; jmarked < currentpage.length; jmarked++) { //rows
						currentpagelist.push(counter++);
					}
					objfilter.exclude[imarked] = currentpagelist.join("|");
				}
			}
			
			objfilter.exclude[previouspage - 1] = params["exclude"];
			objfilter.indicator[previouspage - 1] = params["indicator"];
			
			if (context.countrycode == 'CZ') {
				if (!objfilter.cancel) {
					objfilter.cancel = {};
				}
				var sublistcount = request.getLineItemCount(ECSALES.Constant.SUBLIST_ID);
				if (sublistcount != -1) {
					for(var irow = 1; irow <= sublistcount; irow++) {
						var cancelrowid = request.getLineItemValue(ECSALES.Constant.SUBLIST_ID, metadata[1].id, irow);
						var cancelvalue = request.getLineItemValue(ECSALES.Constant.SUBLIST_ID, metadata[2].id, irow);
						objfilter.cancel[cancelrowid] = cancelvalue;
					}
				}
			}
			
			updateFilterFile(this.filterfilename, objfilter);
			
			var indicatorobj = {};
			var excludeobj = {};
			if (objfilter.exclude[this.currentpage-1]) {
				excludeobj = ECSALES.createExcludeObject(objfilter.exclude[this.currentpage-1]);	
			}
			
			if (objfilter.indicator[this.currentpage-1]) {
				indicatorobj = ECSALES.createIndicatorObject(objfilter.indicator[this.currentpage-1]);
			}
			
			var colmeta = context.getListColumnMetaData();
			for(var iRow2=0; iRow2<tempresultset.length; iRow2++) {
				var currentrow = tempresultset[iRow2];
				var currentrowid = currentrow[rowid];
				if (excludeobj[currentrowid]) {
					currentrow[excludeid] = "T";
				} else {
					currentrow[excludeid] = "F";
				}
				
				if (context.countrycode == 'CZ') {
					currentrow[metadata[2].id] = objfilter.cancel[currentrowid]?objfilter.cancel[currentrowid]:"F"; 
				}
				
				if (indicatorobj[currentrowid]) {
					currentrow[indicatorid] = indicatorobj[currentrowid];
				}
			}
		}
		return tempresultset;
	}
}