/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['./module/error'], function(error) {
    var Context = function(environmentVariables, configurations) {
        // private
        var environmentVariables = environmentVariables || {};
        var configurations = configurations || {};

        this.setVariable = function(key, value) {
            environmentVariables[key] = value;
        };

        this.getVariable = function(key) {
            return environmentVariables[key];
        };

        this.getVariables = function() {
            return environmentVariables;
        };

        this.addConfiguration = function(configName, key, value) {
            configurations[configName][key] = value;
        };

        this.getConfiguration = function(configName, key) {
            return configurations[configName][key];
        };

        this.getConfigurations = function(configName) {
            return configurations[configName];
        };
    }

	return Context;
});
