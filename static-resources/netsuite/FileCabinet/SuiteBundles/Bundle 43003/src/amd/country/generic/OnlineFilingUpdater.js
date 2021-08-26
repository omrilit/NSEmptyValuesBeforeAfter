/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', '../../lib/base/BaseProcess', '../../lib/OnlineFilingManager'], function(error, BaseProcess, OnlineFilingManager) {
	function OnlineFilingUpdater() {
        BaseProcess.apply(this, arguments);
		this.name = 'OnlineFilingUpdater';
		this.onlineFilingManager = new OnlineFilingManager();
	};

    util.extend(OnlineFilingUpdater.prototype, BaseProcess.prototype);

    OnlineFilingUpdater.prototype.process = function(context) {
        var onlineFilingId = context.getVariable('id');
        var onlineFilingFields = {
            status: context.getVariable('status'),
            result: context.getVariable('result')
        };
        this.onlineFilingManager.update(onlineFilingId, onlineFilingFields);
        return context;
	};

	return OnlineFilingUpdater;
});
