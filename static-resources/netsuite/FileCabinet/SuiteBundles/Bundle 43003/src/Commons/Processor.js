/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};

Tax.Processor = function Processor() {
	this.next = null;
	this.errorHandler = null;
};

Tax.Processor.prototype.setNext = function setNext(nextSequence) {
	if (!nextSequence) {
		//TODO: throw or pass to errorHandler
		throw nlapiCreateError('MISSING_NEXT_SEQUENCE', this.Name + '::Tax.Processor.setNext');
	}
	this.next = nextSequence;
};

Tax.Processor.prototype.process = function process(result, params) { };

Tax.Processor.prototype.runSequence = function runSequence(params) {
//	var params = {
//		result: {},
//		filterParams: filterParams,
//		errorHandler: errorHandler,
//	};
	
	try {
		var result = this.process(params.result, params); // {message: 'success', result: {}} ?
		params.result = result;
		return this.next ? this.next.runSequence(params) : params.result;
	} catch (ex) {
		logException(ex, (this.Name || '') + '::Tax.Processor.prototype.runSequence');
		this.errorHandler.handle(ex, (this.Name || '') + '::Tax.Processor.prototype.runSequence', 'ERROR');
		throw ex; 
	}
};