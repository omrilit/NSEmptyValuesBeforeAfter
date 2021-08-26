/** 
 * � 2015 NetSuite Inc. 
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code. 
 *
 * @NScriptName FAM Environment Configuration
 * @NScriptId _fam_util_envcfg
 * @NAPIVersion 2.x
 */ 

define([
    '../adapter/fam_adapter_runtime',
],

function (runtime){ 

    function isOneWorld() {
        return runtime.isFeatureInEffect({feature:"SUBSIDIARIES"});
    }
    
    function isClassEnabled() {
        return runtime.isFeatureInEffect({feature:"CLASSES"});
    }
    
    function isDeptEnabled() {
        return runtime.isFeatureInEffect({feature:"DEPARTMENTS"});
    }
    
    function isLocEnabled() {
        return runtime.isFeatureInEffect({feature:"LOCATIONS"});
    }
    
    function isMultiBook() {
        return runtime.isFeatureInEffect({feature:"MULTIBOOK"});
    }
    
    function isMultiCurrency() {
        return runtime.isFeatureInEffect({feature:"MULTICURRENCY"});
    }
    
    function isJobsEnabled() {
        return runtime.isFeatureInEffect({feature:"JOBS"});
    }
    
    return { 
        isOneWorld : isOneWorld,
        isClassEnabled : isClassEnabled,
        isDeptEnabled : isDeptEnabled, 
        isLocEnabled : isLocEnabled,
        isMultiBook: isMultiBook,
        isMultiCurrency : isMultiCurrency,
        isJobsEnabled : isJobsEnabled
    };
});