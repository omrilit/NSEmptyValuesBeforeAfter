/**
 * Copyright © 2018, 2019, Oracle and/or its affiliates. All rights reserved.
 * @NModuleScope SameAccount
 */

define(["N/search"],
    adapterSearch);

function adapterSearch(search) {
    return {
        create: function(options) {
            return search.create(options);
        },
        
        createColumn: function(options) {
                     return search.createColumn(options);
        },
        
        createFilter: function(options) {
            return search.createFilter(options);
        },
        
        'delete' : function(options) {
            return search['delete'](options);
        },
        
        generateColumn: function(name, join, summary, sort, formula, func, label) {
            var out = {
                name: name,
                join: join,
                summary: summary,
                sort: sort,
                formula: formula,
                label: label
            };
            out['function'] = func ? func: null;
            return this.createColumn(out);
        },
        
        generateFilter: function(name, operator, values, join, formula, summary) {
            return this.createFilter({
                name: name,
                join: join,
                operator: operator,
                values: values,
                formula: formula,
                summary: summary
            });
        },
        
        getOperator: function (param) { return param ? search.Operator[param]: search.Operator; },
        
        getSort: function(param) { return param ? search.Sort[param]: search.Sort; },
        
        getSummary: function (param) { return param ? search.Summary[param]: search.Summary; },
        
        getType: function(param) { return param ? search.Type[param]: search.Type; },
        
        load: function(options) {
            return search.load(options);
        },
        
        lookupFields: function(options) {
            return search.lookupFields(options);
        }
    };
}