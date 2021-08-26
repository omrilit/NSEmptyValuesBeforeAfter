/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['require', './Context'], function(require, Context) {

    var OnlineFilingRunner = function() {
        this.name = 'OnlineFilingRunner';
    };

    OnlineFilingRunner.prototype.run = function(params) {
        var processList = params.onlineFilingConfiguration.process[params.onlineFiling.action];
        var context = this.buildContext(params);
        var nextProcess;
        var process;
        var modulePath;
        var next = null;

        // See the custom record Online Filing Configuration for the details of the processList
        for (var i = 0; i < processList.length; i++) {
            nextProcessConfig = processList[i + 1] ? processList[i + 1].configuration : null;
            require([processList[i].handler], function(Process) {
                process = new Process();
                context = process.process(context, processList[i].configuration, nextProcessConfig);
            });
        };
    };

    // TODO Move to Builder class
    OnlineFilingRunner.prototype.buildContext = function(params) {
        var environmentVariables = params.onlineFiling;
        var onlineFilingConfiguration = params.onlineFilingConfiguration;
        var commonConfig = onlineFilingConfiguration.config.common || {};
        var processConfig = onlineFilingConfiguration.config.process;
        var processList = onlineFilingConfiguration.process[params.triggeredProcess];
        var context;

        util.extend(environmentVariables, commonConfig);
        context = new Context(environmentVariables, processConfig);
        return context;
    };

    return OnlineFilingRunner;
});
