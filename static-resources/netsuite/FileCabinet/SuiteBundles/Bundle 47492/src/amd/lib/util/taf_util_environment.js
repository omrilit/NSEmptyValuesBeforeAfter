/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 */
define([
    '../../adapter/taf_adapter_config',
    '../../adapter/taf_adapter_runtime',
    '../../adapter/taf_adapter_search',
],utilConfig);

function utilConfig(config, runtime, search){
    var config = {};
    var module = {};
    module.isOneWorld = function(){
        if(!config.isOneWorld){
            config.isOneWorld = runtime.isFeatureInEffect({feature :'SUBSIDIARIES'});
        }
        return config.isOneWorld;
    };
    
    module.isMultiBook = function(){
        if(!config.isMultiBook){
            config.isMultiBook = runtime.isFeatureInEffect({feature :'MULTIBOOK'});
        }
        return config.isMultiBook;
    };
    
    module.isGLAuditNumbering = function(){
        if(!config.isGLAuditNumbering){
            config.isGLAuditNumbering = runtime.isFeatureInEffect({feature :'GLAUDITNUMBERING'});
        }
        return config.isGLAuditNumbering;
    };
    
    module.isMultiCurrency = function(){
        if(!config.isMultiCurrency){
            config.isMultiCurrency = runtime.isFeatureInEffect({feature :'MULTICURRENCY'});
        }
        return config.isMultiCurrency;
    };
    
    module.hasMXCompliance = function(){
        var MEXICO_COMPLIANCE_BUNDLE = '10f7d41f-88bc-41e6-ab61-6664bfdaef24';
        
        return this.hasBundleInstalled(MEXICO_COMPLIANCE_BUNDLE);
    };
	
	module.hasMXLocalization = function(){
        var MEXICO_LOCALIZATION_BUNDLE = 'cd476cab-e846-474e-9f11-e213e69c420b';
        
        return this.hasBundleInstalled(MEXICO_LOCALIZATION_BUNDLE);
    };
    
    module.hasBundleInstalled = function(guid){
        var searchParams = {};
        
        searchParams.type = 'file';
        searchParams.filters = [ {name: 'name', operator: search.getOperator('IS'), values: guid}];
       
        var searchRes = search.create(searchParams).run().getRange({start: 0, end: 1});
        
        return searchRes.length>0;
            
    };
    
    return module;
};
