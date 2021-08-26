/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */
var Tax = Tax || {};
Tax.Adapter = Tax.Adapter || {};

Tax.Adapter.BaseAdapter = function BaseAdapter() {
	this.Name = 'BaseAdapter';
    this.rawdata = [];
	this.daos = [];
};

Tax.Adapter.BaseAdapter.prototype = Object.create(Tax.Processor.prototype);

Tax.Adapter.BaseAdapter.prototype.transform = function transform(params) {
};

Tax.Adapter.BaseAdapter.prototype.process = function process(result, params) {
	try {
		for (var idao = 0; this.daos && idao < this.daos.length; idao++) {
			var data = Tax.Cache.MemoryCache.getInstance().load(this.daos[idao]);
			if (data) {
				this.rawdata = this.rawdata.concat(data);
			}
		}
	} catch (ex) {
		logException(ex, 'Tax.Adapter.BaseAdapter.process');
	}
	return {adapter: this.transform(params)};
};