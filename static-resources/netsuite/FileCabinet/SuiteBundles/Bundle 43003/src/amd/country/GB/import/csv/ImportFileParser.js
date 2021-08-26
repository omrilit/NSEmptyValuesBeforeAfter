/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/file',
    '../../../../lib/module/error',
    '../../../../lib/module/util',
    '../../../../lib/Constants'
], function(
    file,
    error,
    filingUtil,
    Constants
) {

    var ImportFileParser = function(context) {
        this.name = 'ImportFileParser';
        this.fileType = file.Type.CSV;
        this.filingUtil = filingUtil;
    };

    ImportFileParser.prototype.parse = function(content) {
        try {
            var jsonOutput = {};
            var separator = content.indexOf('\r\n') > -1 ? '\r\n' : '\n';
            var lines = content.split(separator);
            var cell;
            var key;

            for (var i = 0; i < lines.length; i++) {
                cell = lines[i].split(',');
                key = cell[0].toUpperCase().trim();
                jsonOutput[key] = cell[1];
            }
            return jsonOutput;
        } catch (ex) {
            error.throw(
                Constants.MESSAGE.ERROR.PARSING_ERROR
            );
        }
    };
    
    ImportFileParser.prototype.readFile = function(fileObj) {
        if (fileObj.fileType === this.fileType) {
            return fileObj.data;
        } else {
        	var errorObj = Constants.MESSAGE.ERROR.INVALID_FILE;
        	if (!fileObj.fileType && !fileObj.name) {
        		errorObj = Constants.MESSAGE.ERROR.NO_FILE_SELECTED;            	
        	}        	
            error.throw({ code: errorObj.code, message: this.filingUtil.formatString(errorObj.message, this.fileType) });
        }
    };

    return ImportFileParser;
});
