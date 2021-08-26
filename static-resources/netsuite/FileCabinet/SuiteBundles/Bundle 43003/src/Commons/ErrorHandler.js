/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};

Tax.ErrorHandler = function ErrorHandler() {};

Tax.ErrorHandler.prototype.handle = function handle(exception, functionName, paramlogLevel) {
	var logLevel = paramlogLevel ? paramlogLevel : 'ERROR';
	this.log(exception, functionName, logLevel);
};

Tax.ErrorHandler.prototype.log = function log(exception, functionName, logLevel) {
	var errorMsg = exception.getCode != null ? exception.getCode() + ': ' + exception.getDetails() : logLevel + ': ' + (exception.message != null ? exception.message : exception);
	nlapiLogExecution(logLevel, functionName, errorMsg);
};