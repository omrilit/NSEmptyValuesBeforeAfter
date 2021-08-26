/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Formatter = TAF.ES.Formatter || {};

TAF.ES.Formatter.ReportFormatter = function _ReportFormatter() {
    TAF.Formatter.ReportFormatter.call(this);
	this.Name = 'ESReportFormatter';
    this.isXML = true;
    this.fields = new TAF.ES.Formatter.FieldDefinitions().getFields();
	this.namespaces = this.getNamespace();
	this.TEMPLATE = {
		MAIN: {
			HEADER: ['<?xml version="1.0" encoding="UTF-8"?>',
					 '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
					     'xmlns:' + this.namespaces[0].prefix + '="' + this.namespaces[0].url + '" ' +
						 'xmlns:' + this.namespaces[1].prefix + '="' + this.namespaces[1].url + '">' +
  					 '<soapenv:Header />',
  					 '<soapenv:Body>'].join('\n'),
			FOOTER: ['</soapenv:Body>',
					 '</soapenv:Envelope>'].join('\n')
		},
		TRANSACTION: {
			CABECERA: ['<' + this.namespaces[0].prefix + ':Cabecera>',
    				   '<' + this.namespaces[0].prefix + ':IDVersionSii>{version}</sii:IDVersionSii>',
    				   '<' + this.namespaces[0].prefix + ':Titular>',
      				   '<' + this.namespaces[0].prefix + ':NombreRazon>{name}</sii:NombreRazon>',
      				   '<' + this.namespaces[0].prefix + ':NIF>{vatNo}</sii:NIF>',
    				   '</' + this.namespaces[0].prefix + ':Titular>',
  					   '</' + this.namespaces[0].prefix + ':Cabecera>'].join('\n')
		}
	};
};
TAF.ES.Formatter.ReportFormatter.prototype = Object.create(TAF.Formatter.ReportFormatter.prototype);

TAF.ES.Formatter.ReportFormatter.prototype.getNamespace = function _getNamespace() {
	throw nlapiCreateError('UNSUPPORTED_OPERATION', this.Name + '.getNamespace: getNamespace must be implemented');
};

TAF.ES.Formatter.ReportFormatter.prototype.getCabecera = function _getCabecera(headerData) {
    if (!headerData) {
        throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.getCabecera: headerData is a required parameter');
    }
    return this.formatElement(headerData, this.TEMPLATE.TRANSACTION.CABECERA);
};

TAF.ES.Formatter.ReportFormatter.prototype.getSuministroHeader = function _getSuministroHeader() {
    return this.TEMPLATE.TRANSACTION.SUMINISTRO.HEADER;
};

TAF.ES.Formatter.ReportFormatter.prototype.getSuministroFooter = function _getSuministroFooter() {
    return this.TEMPLATE.TRANSACTION.SUMINISTRO.FOOTER;
};

TAF.ES.Formatter.ReportFormatter.prototype.formatFileName = function _formatFileName(startDate, endDate, fileIndex) {
	if (!this.FILE_NAME) {
		throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.formatFileName: this.FILE_NAME is a required parameter');
	}
	if (!startDate) {
		throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.formatFileName: startDate is a required parameter');
	}
	if (!endDate) {
		throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.formatFileName: endDate is a required parameter');
	}

    var startDateStr = nlapiDateToString(startDate);
    var endDateStr = nlapiDateToString(endDate);
    var fileName = this.FILE_NAME;

    if (startDateStr === endDateStr) {
        fileName += '_' + this.formatDate(startDateStr, 'MMddyyyy');
    } else {
        fileName += '_' + this.formatDate(startDateStr, 'MMddyyyy') +
            '_' + this.formatDate(endDateStr, 'MMddyyyy');
    }
    if (fileIndex) {
        fileName += '_' + fileIndex;
    }

	return fileName + '.' + this.FILE_EXTENSION;
};
