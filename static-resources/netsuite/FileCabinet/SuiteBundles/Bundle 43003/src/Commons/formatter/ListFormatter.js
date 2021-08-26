/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.Formatter = Tax.Formatter || {};

Tax.Formatter.ListFormatter = function ListFormatter(errorHandler) {
    this.errorHandler = errorHandler;
    Tax.Processor.call(this);
};
Tax.Formatter.ListFormatter.prototype = Object.create(Tax.Processor.prototype);

Tax.Formatter.ListFormatter.prototype.process = function process(result, params) {
    if (!result || !result.adapter || !params || !params.format || !params.meta || !params.meta.columns) {
        throw nlapiCreateError('INVALID_PARAMETER', 'ListFormatter parameter is invalid');
    }
    
    try {
        var formattedData = {};
        var sectionParams = {
            isXML : (params.format === 'XML'),
            reportFormatter: new Tax.ReportFormatter(params)
        };
        
        for (var key in result.adapter) {
            sectionParams.formatColumns = params.meta.columns[key];
            sectionParams.list = result.adapter[key];
            
            var formatted = this.formatSection(sectionParams);
            if (formatted) {
                formattedData[key] = formatted;
            }
        }
        
        result.formatter = formattedData;
        return result;
    } catch (ex) {
        logException(ex, 'Tax.Formatter.ListFormatter.process');
        throw ex;
    }
};

Tax.Formatter.ListFormatter.prototype.formatSection = function formatSection(params) {
    if (!params) {
        throw nlapiCreateError('INVALID_PARAMETER', 'ListFormatter parameter is invalid');
    }
    
    try {
        var formatted = this.formatList(params);

        return formatted;
    } catch (ex) {
        logException(ex, 'Tax.Formatter.ListFormatter.formatSection');
        throw ex;
    }
};

Tax.Formatter.ListFormatter.prototype.formatList = function formatObject(params) {
    if (!params || !params.list || !Array.isArray(params.list)) {
        throw nlapiCreateError('INVALID_PARAMETER', 'ListFormatter parameter is invalid');
    }

    try {
        var formatted = [];
        var list = params.list;
        
        if (!params.formatColumns) {
            return list;
        }
    
        for (var i = 0; i < list.length; i++) {
            params.line = list[i];
            var line = this.formatObject(params);
            formatted.push(line);
        }
        
        return formatted;
    } catch (ex) {
        logException(ex, 'Tax.Formatter.ListFormatter.formatList');
        throw ex;
    }
};

Tax.Formatter.ListFormatter.prototype.formatObject = function formatObject(params) {
    if (!params || !params.line || !params.reportFormatter || !params.formatColumns) {
        throw nlapiCreateError('INVALID_PARAMETER', 'ListFormatter parameter is invalid');
    }

    try {
        var line = params.line;
        for (var column in line) {
            var columnObject = params.formatColumns[column];
            if (columnObject && line[column] !== '') {
                var columnFormat = params.isXML ? columnObject.format : null;
                line[column] = params.reportFormatter.format(line[column], columnObject.type, columnFormat);
            }
        }
        
        return line;
    } catch (ex) {
        logException(ex, 'Tax.Formatter.ListFormatter.formatObject');
        throw ex;
    }
};
