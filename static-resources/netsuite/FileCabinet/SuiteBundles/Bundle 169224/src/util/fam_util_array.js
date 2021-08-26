/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define([], function () {
    var module = {};
    
    module.findDuplicates = function (arr) {
        var dup, unique;
        
        dup = arr.filter(function (value, index) { return arr.indexOf(value) !== index; });
        unique = this.findUnique(dup);
        
        return unique;
    };
    
    module.findUnique = function (arr) {
        return arr.filter(function (value, index) { return arr.indexOf(value) === index; });
    };
    
    return module;
});
