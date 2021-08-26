/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var INTRASTAT = INTRASTAT || {};

INTRASTAT.Context = INTRASTAT.Context || {};

INTRASTAT.ContextManager = function() {
	this.createContext = function(countryform) {
		var newcontext = createNewContext(INTRASTAT, "INTRASTAT.Context." + countryform)

		if (!newcontext) {
			return new INTRASTAT.Context.OTHER;
		} else {
			return newcontext;
		}
	};

	function createNewContext(root, value) {
		nlapiLogExecution('Debug', 'INTRASTAT.ContextManager.createContext:value', value);
		try {
			var period = value.indexOf(".");
			if (period > -1) {
				var attribute = value.slice(0, period);
				if (attribute != 'INTRASTAT') {
					return createNewContext(root[attribute], value.slice(period + 1));
				} else {
					return createNewContext(root, value.slice(period + 1));
				}
			} else {
				return new root[value];
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "INTRASTAT.ContextManager.createNewContext", errorMsg);
		}
	}
};

INTRASTAT.ColumnMetaData = function(id, type, label, visible, attribute, spacebreak) {
	var _id = id;
	var _type = type;
	var _label = label;
	var _visible = visible;
	var _attribute = attribute;
	var _spacebreak = spacebreak ? spacebreak : false;

	var _isLink = false;
	var _actiontype;
	var _align = "left";
	var _options;
	var _width = 0; //dont set it
	var _searchtype;
	var _searchattribute;

	this.getId = function() {
		return _id;
	}
	this.getType = function() {
		return _type;
	}
	this.getLabel = function() {
		var newLabel = _label;
		if (_spacebreak) {
			newLabel = _label.replace(/\s/gi, "<br/>");
		}
		return newLabel;
	};
	this.getVisible = function() {
		return _visible;
	}

	this.setAlignment = function(newalign) {
		_align = newalign;
		return this;
	}
	this.getAlignment = function() {
		return _align;
	}

	this.setWidth = function(newwidth) {
		_width = newwidth;
		return this;
	}
	this.getWidth = function() {
		return _width;
	}

	this.setOptions = function(newoption) {
		_options = newoption;
		return this;
	}
	this.getOptions = function() {
		return _options;
	}

	this.setLinkParam = function(newactiontype, newsearchtype, searchattribute) {
		_isLink = true;
		_actiontype = newactiontype;
		_searchtype = newsearchtype;
		_searchattribute = searchattribute;

		return this;
	};
	this.getLinkParam = function() {
		return {
			isLink: _isLink,
			actiontype: _actiontype,
			searchtype: _searchtype,
			searchattribute: _searchattribute
		}
	}

	this.getValue = function(obj) {
		return String(obj[_attribute]);
	};

	this.getFormattedValue = function(obj) {
		var value = obj[_attribute];
		if (!value) {
			return "";
		}

		var newvalue = String(obj[_attribute]);

		if (_isLink) {
			var unencodedvalue = newvalue.replace("&amp;", "&").replace("&apos;", "'").replace("&gt;", ">").replace("&lt;", "<");

			var newurl = [INTRASTAT.URL, "&actiontype=", _actiontype, "&searchval=", escape(unencodedvalue), "&searchtype=", _searchtype ? _searchtype : obj[_searchattribute]];
			return ["<a href = '", newurl.join(""), "'>", newvalue, "</a>"].join("")
		} else {
			var formatValue = newvalue;
			switch (_align) {
				case "center":
					formatValue = "<div align='center'><span>" + newvalue + "</span></div>"
					break;
				case "left":
					formatValue = "<div align='left'><span>" + newvalue + "</span></div>"
					break;
				case "right":
					formatValue = "<div align='right'><span>" + newvalue + "</span></div>"
					break;
			}

			return formatValue;
		}
	};
};

INTRASTAT.Context.ExportContext = function(params, id, label, template, exportmetadata, callbackFunction, formatter) {
	var _id = id;
	var _label = label;
	var _template = template;
	var _exporttype = exportmetadata.id;
	var _extension = exportmetadata.extension;
	var _handler = 'onExport("' + _id + '", "' + INTRASTAT.FORMAT.timestamp + '")';

	this.setHandler = function(newhandler) {
		_handler = newhandler;
	};
	this.getHandler = function() {
		return _handler;
	};

	this.getId = function() {
		return _id;
	};
	this.setId = function(newid) {
		newid = _id;
	};

	this.getLabel = function() {
		return _label;
	};
	this.setLabel = function(newlabel) {
		_label = newlabel;
	};

	this.getExportType = function() {
		return _exporttype;
	};
	this.setExportType = function(newexporttype) {
		_exporttype = newexporttype;
	};

	this.getFileName = function() {
		var filename = '';
		if (_extension == INTRASTAT.FILETYPE.ascii.extension) {
			filename = [_template.filename[params.type]];
		} else {
			filename = [params.countryform.substring(0, 2), "Intrastat"];
			Date.CultureInfo = Date.CultureInfo_en; //English Only

			if (params.type == INTRASTAT.SALEREPORT) {
				filename.push("Sale");
			} else {
				filename.push("Purchase");
			}

			var fromperiod = new SFC.System.TaxPeriod(params.fromperiodid);
			var toperiod = new SFC.System.TaxPeriod(params.toperiodid);

			if (fromperiod.GetId() == toperiod.GetId()) {
				if (fromperiod.GetType() == "month") { //Check if Monthly
					filename.push(fromperiod.GetStartDate().toString("MMMyy"));
				} else { //Quarterly or Yearly
					filename.push(fromperiod.GetStartDate().toString("MMMyy"));
					filename.push(toperiod.GetEndDate().toString("MMMyy"));
				}
			} else {
				filename.push(fromperiod.GetStartDate().toString("MMMyy"));
				filename.push(toperiod.GetStartDate().toString("MMMyy"));
			}
		}
		var currentstamp = new Date();
		filename.push(currentstamp.toString("MMddyyHHmmss"));

		return filename.join("_") + "." + _extension;
	};

	this.getReport = getReport;

	function getReport(objList) {
		nlapiLogExecution('DEBUG', 'INTRASTAT.Context.ExportContext.getReport:' + objList.length, JSON.stringify(params));
		nlapiLogExecution('DEBUG', 'INTRASTAT.Context.ExportContext.getReport:exportmetadata', JSON.stringify(exportmetadata));

		var header = new INTRASTAT.Header(params.fromperiodid, params.toperiodid, params.subsidiaryid, false, exportmetadata.dateformat, params.countryform);
		nlapiLogExecution('DEBUG', 'INTRASTAT.Context.ExportContext.getReport:header', JSON.stringify(header));

		for (var imeta in exportmetadata) {
			header[imeta] = exportmetadata[imeta];
		}

		if (callbackFunction) {
			callbackFunction(params, header, objList);
		}

		var rowTemplateName = '';
		var reportTemplateName = '';

		if (params.type == INTRASTAT.SALEREPORT) {
			reportTemplateName = _template.sales;
			rowTemplateName = _template.salesrow || _template.row;
		} else {
			reportTemplateName = _template.purchase;
			rowTemplateName = _template.purchaserow || _template.row;
		}

		var rowTemplate = getTaxTemplate(rowTemplateName, true);
		var reportTemplate = getTaxTemplate(reportTemplateName, true);

		var reportbody = [];
		var objClock = new INTRASTAT.PerformanceLog("Build Rows - HTML");
		objClock.start();

		for (var irow = 0; irow < objList.length; irow++) {
			var row = objList[irow];
			
			if (_extension == INTRASTAT.FILETYPE.ascii.extension) { 
				row.vatno = header.vatno;
				row.endmonth = header.endmonth;
				row.endyear = header.endyear;
				row.regionindex = header.regionindex;
				row.BLK = ' ';
			}
			
			var formattedRow = formatter ? formatter.formatDataObject(row) : row;
			reportbody.push(String(_App.RenderTemplate(rowTemplate.short, formattedRow)));
		}
		
		if (_extension == INTRASTAT.FILETYPE.ascii.extension) {
		    reportbody.push(''); // add an extra line feed at the end of the export file for ascii format
		}

		objClock.stopAndLog();
		header.reportbody = reportbody.join("\n");

		header.imgurl = nlapiEscapeXML(reportTemplate.imgurl);
		return _App.RenderTemplate(reportTemplate.short, header);
	}
};

INTRASTAT.Context.UIContext = function(params, colmetadata, uicontextmeta, template) {
	var _colmetadata = colmetadata;
	var _template = template;
	var _contextmeta = uicontextmeta;
	var _auxilliaryInfo = {};

	this.setAuxilliaryInfo = function(obj) {
		_auxilliaryInfo = obj;
	};
	this.getAuxilliaryInfo = function() {
		return _auxilliaryInfo;
	};

	this.setContextMetaData = function(newcontextmeta) {
		_contextmeta = newcontextmeta;
	};
	this.getContextMetaData = function() {
		return _contextmeta;
	};

	this.setColumnMetaData = function(newmetadata) {
		_colmetadata = newmetadata;
	};
	this.getColumnMetaData = function() {
		return _colmetadata;
	};

	this.getReportHeader = function() {
		var header = new INTRASTAT.Header(params.fromperiodid, params.toperiodid, params.subsidiaryid, false, null, params.countryform);

		for (var idata in _auxilliaryInfo) {
			header[idata] = _auxilliaryInfo[idata];
		}

		for (var icontext in uicontextmeta) {
			header[icontext] = uicontextmeta[icontext];
		}

		var reportTemplate = _template.sales;
		if (params.type == INTRASTAT.PURCHASEREPORT) {
			reportTemplate = _template.purchase;
		}

		var newtemplate = getTaxTemplate(reportTemplate, true);
		header.imgurl = newtemplate.imgurl;
		return _App.RenderTemplate(newtemplate.short, header);
	};

	this.getReportData = function(objList) {
		var newList = [];

		for (var irow = 0; irow < objList.length; irow++) {
			var obj = {};
			var currentObj = objList[irow];
			for (var imeta = 0; imeta < _colmetadata.length; imeta++) {
				obj[_colmetadata[imeta].getId()] = _colmetadata[imeta].getFormattedValue(currentObj);
			}
			newList.push(obj);
		}
		return newList;
	};
};

INTRASTAT.PerformanceLog = function(name) {
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
	};

	this.log = function() {
		var startTime = getUTC(startDate);
		var endTime = getUTC(endDate);
		nlapiLogExecution("DEBUG", name, endTime - startTime);
	};

	function getUTC(dateObj) {
		return Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), dateObj.getHours(), dateObj.getMinutes(), dateObj.getSeconds(), dateObj.getMilliseconds());
	};
};

INTRASTAT.isSubsidiarySettingOn = function() {
	return INTRASTAT.isAcctFeatureOn('FEATURE', 'SUBSIDIARIES');
};

INTRASTAT.isAdvanceTaxesSettingOn = function() {
	return INTRASTAT.isAcctFeatureOn('FEATURE', 'ADVTAXENGINE');
};

INTRASTAT.isAcctFeatureOn = function(featureType, featureName) {
	var isFeatureOn = true;
	var featureStatus = nlapiGetContext().getSetting(featureType, featureName);
	if (featureStatus == 'F') {
		isFeatureOn = false;
	}
	return isFeatureOn;
};

INTRASTAT.CacheRowSet = function(params, objList, bypassfilterUpdate) {
	var taxCache = new VAT.TaxCache();
	var cachefileid = params.cachefileid;

	var recordsperpage = Number(nlapiGetContext().getPreference('LISTSEGMENTSIZE'));
	var pagecount = 0;
	var rowcount = 0;
	var currentpage = params.pageno ? params.pageno : 0;
	var _bypassfilterUpdate = bypassfilterUpdate ? bypassfilterUpdate : false;

	this.getRowSetMetaData = function() {
		return {
			cachefileid: cachefileid,
			recordsperpage: recordsperpage,
			pagecount: pagecount,
			rowcount: rowcount,
			currentpage: currentpage
		};
	};

	var objRowList;
	var objMetaData = {};
	nlapiLogExecution("Debug", "INTRASTAT.CacheRowSet:" + (objList ? objList.length : ""), JSON.stringify(params));

	try {
		if (!cachefileid) {
			taxCache.CleanupCacheRecord("Intrastat");
			rowcount = objList.length;
			pagecount = Math.ceil(objList.length / recordsperpage);
			cachefileid = taxCache.AddTaxCache("Intrastat", "", objList, objMetaData);
			objRowList = objList;
		} else {
			var cache = taxCache.GetTaxCache(cachefileid);
			objRowList = cache.detail;
			objMetaData = getMetaDataCache(cache.metadata);

			pagecount = Math.ceil(objRowList.length / recordsperpage);
			rowcount = objRowList.length;
		}
	} catch (ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "INTRASTAT.CacheRowSet", errorMsg);
	}

	function getMetaDataCache(objmetadata) {
		var taxCache = new VAT.TaxCache();
		var beginrow = parseInt(params.beginrowno);
		var endrow = parseInt(params.endrowno);

		if (_bypassfilterUpdate) {
			nlapiLogExecution("Debug", "INTRASTAT.CacheRowSet.getMetaDataCache:", "By pass metadata update");
			return objmetadata;
		}

		if (params.markall) {
			for (var irow = 0; irow < objRowList.length; irow++) {
				var currentrow = objRowList[irow];
				var rownum = String(currentrow.row);

				var metacontent = objmetadata[rownum];
				if (!metacontent) {
					objmetadata[rownum] = {};
				}
				objmetadata[rownum].exclude = params.markall == "marked" ? "T" : "F";
			}
		}

		var currentmeta = params.metadata;
		for (var imeta in currentmeta) {
			objmetadata[imeta] = currentmeta[imeta];
		}

		taxCache.UpdateTaxCache(cachefileid, "", objmetadata);
		return objmetadata;
	}

	this.getInclusiveResult = getInclusiveResult;

	function getInclusiveResult() {
		var newRowList = [];

		for (var irow = 0; irow < objRowList.length; irow++) {
			var currentrow = objRowList[irow];
			var rownum = String(currentrow.row);

			var metacontent = objMetaData[rownum];
			if (metacontent && metacontent.exclude == "T") {
				continue;
			}

			for (var imetacontent in metacontent) {
				currentrow[imetacontent] = metacontent[imetacontent];
			}
			newRowList.push(currentrow);
		}

		return newRowList;
	}

	this.getPageResult = getPageResult;

	function getPageResult() {
		var pageresultset = [];
		if (rowcount <= recordsperpage) {
			pageresultset = objRowList;
		} else {
			pageresultset = objRowList.slice(currentpage * recordsperpage, (currentpage * recordsperpage) + recordsperpage);
		}

		for (var irow = 0; irow < pageresultset.length; irow++) {
			var currentrow = pageresultset[irow];
			var rownum = String(currentrow.row);

			var metacontent = objMetaData[rownum];
			if (!metacontent) {
				continue;
			}
			for (var imetacontent in metacontent) {
				currentrow[imetacontent] = metacontent[imetacontent];
			}
		}

		return pageresultset;
	}
};