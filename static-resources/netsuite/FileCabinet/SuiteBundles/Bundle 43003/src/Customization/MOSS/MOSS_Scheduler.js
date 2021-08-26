/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.MOSS = VAT.MOSS || {};

VAT.MOSS.Scheduler = function Scheduler() {
    this.scriptId = 'customscript_moss_provisioning_processor';
    this.deploymentId = 'customdeploy_moss_provisioning_processor';
    this.params = {};
};


VAT.MOSS.Scheduler.prototype.run = function run(params) {
    nlapiScheduleScript(this.scriptId, this.deploymentId, params);
};
