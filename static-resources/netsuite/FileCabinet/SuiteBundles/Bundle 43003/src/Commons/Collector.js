/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};

Tax.Collector = function Collector() {
	Tax.Processor.call(this);
	this.Name = 'Collector';
};
Tax.Collector.prototype = Object.create(Tax.Processor.prototype);

Tax.Collector.prototype.process = function process(result, filterParams) {
	var memoryCache = Tax.Cache.MemoryCache.getInstance();
	memoryCache.append('Collector', result.formatter);
	var processedResult = {};
	return processedResult;
};