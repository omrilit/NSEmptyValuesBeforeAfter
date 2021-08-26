/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm)
    psa_prm = {};

psa_prm.FeatureListSL = new function FeatureListSL() {

    var _features = [
        {
            name : 'timeTracking',
            featureId : 'timetracking'
        }, {
            name : 'timesheets',
            featureId : 'timesheets'
        }, {
            name : 'projectManagement',
            featureId : 'advancedjobs'
        }, {
            name : 'resourceAllocation',
            featureId : 'resourceallocations'
        }, {
            name : 'customRecord',
            featureId : 'customrecords'
        }, {
            name : 'clientScript',
            featureId : 'customCode'
        }, {
            name : 'serverScript',
            featureId : 'serversidescripting'
        }, {
            name : 'department',
            featureId : 'departments',
        }, {
            name : 'class',
            featureId : 'classes',
        }, {
            name : 'location',
            featureId : 'locations',
        }, {
            name : 'billingClass',
            featureId : 'billingclasses',
        }, {
            name : 'subsidiary',
            featureId : 'subsidiaries'
        }, {
            name : 'jobCosting',
            featureId : 'jobcosting'
        }
    ];

    var _preferences = [
        {
            name : 'approvalWorkflow',
            preferenceId : 'CUSTOMAPPROVALRSRCALLOC'
        }
    ];
    
    this.init = function() {
        this.context = nlapiGetContext();
    };

    this.suiteletEntry = function(request, response) {

        this.init();

        var returnData = {};

        try {

            if (request.getMethod() != 'GET') {
                throw new nlobjError('HTML Error', 'Request method is of an incorrect type: ' + request.getMethod());
            }

            returnData = this.getReturnData();
        } catch (ex) {
            var errorCode = ex.name || ex.getCode(), errorMessage = ex.message || ex.getDetails();

            nlapiLogExecution('ERROR', errorCode, errorMessage);

            returnData = {
                success : false,
                message : errorCode + ' : ' + errorMessage
            };
        }

        response.setContentType('JSON');
        response.write(JSON.stringify(returnData));
    };

    this.getReturnData = function() {
        var returnData = {
            success : true,
            message : 'Feature list loaded'
        };
        
        returnData.data = this.getFeatures().concat(this.getPreferences());
        
        return returnData;
    };
    
    this.getFeatures = function() {
        var _this = this;
        
        var ret = _features.map(function (feature) {
            feature.isEnabled = _this.context.getFeature(feature.featureId);
            return feature;
        });
        
        nlapiLogExecution('DEBUG', 'getFeatures', JSON.stringify(ret));
        
        return ret;
    };
    
    this.getPreferences = function() {
        var _this = this;
        
        return _preferences.map(function (preference) {
            preference.isEnabled = _this.context.getPreference(preference.preferenceId) == 'T';
            return preference;
        });
    };
};