/**
 * Copyright (c) 2016, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.Adapter = Tax.EU.Intrastat.Adapter || {};

Tax.EU.Intrastat.Adapter.OnlineAdapter = function _OnlineAdapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'OnlineAdapter';
};
Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype.process = function process(result, params) {
	try {
		this.onlineDAO = Tax.Cache.MemoryCache.getInstance().load('OnlineDAO');
		result.formatter = this.transform(params);

		return result;
	} catch (ex) {
		logException(ex, 'OnlineAdapter.process');
		throw ex;
	}
};

Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype.transform = function _transform(params) {
	if (!params) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
	}

	try {
		var adapterResult = {};
		adapterResult.fields = this.getFieldData(params);
		adapterResult.buttons = params.meta.buttons;
		adapterResult.body = this.getBodyData(params);
		adapterResult.template = this.onlineDAO.template;

		var result = {};
		result[this.Name] = [adapterResult];

		return result;
	} catch (ex) {
		logException(ex, 'OnlineAdapter.transform');
		throw ex;
	}
};

Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype.convertToSubsidiaryFieldList = function _convertToSubsidiaryFieldList(subsidiaries) {
	if (!subsidiaries) {
		throw nlapiCreateError('MISSING_PARAMETER', 'subsidiaries argument is required');
	}

	try {
		var subsidiaryFieldList = [];
		var subNameMatch = [];
		var count = 0;
		var subsidiary = null;

		for (var i = 0; i < subsidiaries.length; i++) {
			subsidiary = subsidiaries[i];
			countryCode = subsidiary.countryCode;
			subNameMatch = subsidiary.name.match(/ : /g);
			count = subNameMatch == null ? 0 : subNameMatch.length;

			for (var leadingSpaces = '', jcount = 0; jcount < count; ++jcount) {
				leadingSpaces += '&nbsp;&nbsp;&nbsp;';
			}

			subsidiaryFieldList.push({
				id: subsidiary.id,
				text: leadingSpaces + subsidiary.nameNoHierarchy
			});
		}

		return subsidiaryFieldList;
	} catch (ex) {
		logException(ex, 'OnlineAdapter.convertToSubsidiaryFieldList');
		throw ex;
	}
};

Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype.getFieldData = function _getFieldData(params) {
	if (!params) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
	}

	try{
		var meta = params.meta;
		var fields = meta.fields;
		var field = null;
		var validFields = [];

		var taxPeriods = this.onlineDAO.taxPeriods;
		var fromPeriod = new SFC.System.TaxPeriod(params.fromperiod || this.onlineDAO.fromTaxPeriod);
		var toPeriod = new SFC.System.TaxPeriod(params.toperiod || this.onlineDAO.toTaxPeriod);

		for (var i = 0; i < fields.length; i++) {
			field = fields[i];
			switch(field.id) {
				case 'subsidiary':
					if (!params.isOneWorld) {
						continue;
					}
					field.data = this.convertToSubsidiaryFieldList(params.euSubsidiaries);
					field.value = params.subsidiary || this.getFieldValue(field);
					break;
				case 'reporttype':
					field.data = CONSTANTS.LIST_DATA.REPORT_TYPE;
					field.value = params.reportType || this.getFieldValue(field);
					break;
				case 'countryform':
					field.data = this.getCountryFormList(params);
					var result = field.data.filter(function(datum) {
					    return datum.id === params.countryform;
					});
					field.value = result.length > 0 ? params.countryform : this.getFieldValue(field)
					break;
				case 'fromperiod':
					field.data = this.onlineDAO.taxPeriods;
					field.value = fromPeriod.GetId();
					break;
				case 'toperiod':
					field.data = taxPeriods;
					if (fromPeriod.GetEndDate() > toPeriod.GetEndDate()) {
						field.value = fromPeriod.GetId();
					} else {
						field.value = toPeriod.GetId();
					}
					break;
				case 'bookid':
					if (!params.isMBA) {
						continue;
					}
					field.value = params.bookid;
					field.data = [];
					for (var book in params.books) {
						field.data.push({
							id: book,
							text: params.books[book].name
						});
					}
					break;
				default:
					nlapiLogExecution('DEBUG', 'OnlineAdapter : getFieldData', field + ' field is not supported');
			}

			validFields.push(field);
		}

		validFields.push({
			id: 'countrycode',
			label: 'countrycode',
			type: 'longtext',
			data: params.countryCode,
			displayType:'hidden'
		});

		validFields.push({
			id: 'languagecode',
			label: 'languagecode',
			type: 'longtext',
			data: params.languageCode,
			displayType:'hidden'
		});

		return validFields;
	} catch (ex) {
		logException(ex, 'OnlineAdapter.getFieldData');
		throw ex;
	}
};

Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype.getFieldValue = function _getFieldValue(field) {
    return field && field.data && field.data[0] && field.data[0].id;
};

Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype.getBodyData = function _getBodyData(params) {
	if (!params) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
	}
	if (!params.meta || !params.meta.columns) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.columns argument is required');
	}

	try {
		var bodyData = {};

		bodyData.pageSize = params.context.getPreference('LISTSEGMENTSIZE');
		bodyData.url = nlapiResolveURL('SUITELET', CONSTANTS.SCRIPT.INTRASTAT, CONSTANTS.DEPLOYMENT.INTRASTAT) +
			'&actiontype=' +
			CONSTANTS.ACTION_TYPE.GET_DATA;
		bodyData.columns = this.getBodyColumns(params.meta.columns['ReportAdapter']);

		return bodyData;
	} catch (ex) {
		logException(ex, 'OnlineAdapter.getBodyData');
		throw ex;
	}
};

Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype.getBodyColumns = function _getBodyColumns(metaColumns) {
	var bodyColumns = [];

	for (var key in metaColumns) {
		var column = {
			id : key,
			type : metaColumns[key].type,
			align : metaColumns[key].align,
			label : metaColumns[key].label,
		};
		if (metaColumns[key].width) {
			column.width = metaColumns[key].width;
		}
		if (metaColumns[key].data) {
			column.data = metaColumns[key].data;
		}
		bodyColumns.push(column);
	}

	return bodyColumns;
};

Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype.getCountryFormList = function _getCountryFormList(params) {
	if (!params || !this.onlineDAO || !this.onlineDAO.countryFormMap) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		var list = [];
		var euNexusMap = this.convertToMap(params.completeEuNexusList, 'name');

		for (var nexus in this.onlineDAO.countryFormMap) {
			var reportList = this.onlineDAO.countryFormMap[nexus];
			var countryFormList = this.getCountryForm(euNexusMap, nexus, reportList);
			list = list.concat(countryFormList);
		}

		return list;
	} catch (ex) {
		logException(ex, 'OnlineAdapter.getCountryFormList');
		throw ex;
	}
};

Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype.getCountryForm = function _getCountryForm(euNexusMap, nexus, reportList) {
	if (!reportList) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		var countryFormList = [];
		for (var i = 0; i < reportList.length; i++) {
			var report = reportList[i];
			var countryForm = {
				id : [report.name, nexus, report.language].join('-'),
				text : report.isGeneric ?
					[euNexusMap[nexus].countryNameText, report.label].join(' ') :
					report.label
			};
			countryFormList.push(countryForm);
		}
		return countryFormList;
	} catch (ex) {
		logException(ex, 'OnlineAdapter.getCountryForm');
		throw ex;
	}
};

Tax.EU.Intrastat.Adapter.OnlineAdapter.prototype.convertToMap = function _convertToMap(list, keyName) {
	if (!list || !keyName) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	var map = {};
	var key = '';
	for (var i = 0; i < list.length; i++) {
		var line = list[i];
		key = line[keyName];
		map[key] = line;

		if(line['alternateCode']){
			key = line['alternateCode'];
			map[key] = line;
		}
	}
	return map;
};
