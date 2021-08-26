/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NScriptType clientscript
 * @NApiVersion 2.x
 */
define(function () {
    var module = {};
    
    module.pageInit = function () {
        // simply to implement one Entry Point function (core validation)
    };
    
    module.cancel = function () {
        window.history.back();
    };
    
    return module;
});