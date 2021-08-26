/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */
var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.FileManager = function _FileManager() {
	Tax.FileManager.call(this);
	this.Name = 'IntrastatFileManager';
};
Tax.EU.Intrastat.FileManager.prototype = Object.create(Tax.FileManager.prototype);

Tax.EU.Intrastat.FileManager.prototype.process = function _process(result, params) {
    if (!result) {
        throw nlapiCreateError('MISSING_PARAMETER', 'result argument is required');
    }
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }
	
	try {
		var fileId = null;
		var file = null;
		var fileProperties = this.getFileProperties(result, params);
		fileId = this.createFile(fileProperties, result.rendered);
		file = this.getFileById(fileId);
		var url = file.getURL();

		return params.TEST_MODE === true ? {url: url, rendered: result.rendered} : {url: url};
	} catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.FileManager.process');
        throw ex;
	}
};

Tax.EU.Intrastat.FileManager.prototype.getFileProperties = function _getFileProperties(result, params) {
    if (!result) {
        throw nlapiCreateError('MISSING_PARAMETER', 'result argument is required');
    }
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }
    if (!params.meta || !params.meta.file) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.file argument is required');
    }

	try {
		var fileProperties = params.meta.file[params.filetype];
	    var fromPeriod = new SFC.System.TaxPeriod(params.fromperiod).GetStartDate().toString('MMMyy');
	    var toPeriod = new SFC.System.TaxPeriod(params.toperiod).GetEndDate().toString('MMMyy');
	    var period = fromPeriod == toPeriod ? fromPeriod : [fromPeriod, toPeriod].join('_');

		fileProperties.format = params.filetype;	
		fileProperties.filename = [params.countrycode, 'Intrastat', CONSTANTS.REPORT_TYPE[params.reporttype].text, period, new Date().toString('MMddyyHHmmss')].join('_');
		fileProperties.folder = this.getRootFolder(params);

		return fileProperties;
	} catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.FileManager.getFileProperties');
        throw ex;
	}
};

Tax.EU.Intrastat.FileManager.prototype.getRootFolder = function _getRootFolder(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }
    if (!params.meta || !params.meta.folder) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.folder argument is required');
    }
    if (!params.countrycode) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.countrycode argument is required');
    }

    var eslRootFolder = this.getVatConfigESLRootFolder();

    if (eslRootFolder) {
        return [ '/', eslRootFolder ].join('');
    } else {
        return [ params.meta.folder, params.countrycode ].join('');
    }
};

Tax.EU.Intrastat.FileManager.prototype.getVatConfigESLRootFolder = function _getVatConfigESLRootFolder() {
    var vatConfigList = Tax.Cache.MemoryCache.getInstance().load('vatConfig');
    var vatConfig = null;

    for (var i = 0; vatConfigList && i < vatConfigList.length; i++) {
        vatConfig = vatConfigList[i];
        if (vatConfig.name == 'ESLRootFolder') {
            return vatConfig.value;
        }
    }

    return null;
};
