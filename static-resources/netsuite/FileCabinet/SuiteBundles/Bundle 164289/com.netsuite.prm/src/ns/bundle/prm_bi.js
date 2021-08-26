/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var PrmBundleInstallation = new function() {

    var _baseFeatures = [ 
        { name : 'Project Management', id : 'advancedjobs' }, 
        { name : 'Resource Allocations', id : 'resourceallocations' }, 
        { name : 'Custom Records', id : 'customrecords' }, 
        { name : 'Client SuiteScript', id : 'customcode' }, 
        { name : 'Server SuiteScript', id : 'serversidescripting' } 
    ];
    
    var _timeFeatures = [ 
        { name: 'Timesheets', id: 'timesheets' },
        { name: 'Time Tracking', id: 'timetracking' }
    ];

    this.getFeatureNames = function getFeatureNames() {
        var features = _baseFeatures.concat(_timeFeatures);
        return features.map(function(e) {
            return '[ ' + e.name + ' ]';
        }).join(', ');
    };

    this.getFeatureDisabledErrorMessage = function getFeatureDisabledErrorMessage() {
        var message = '',
            disabledRequiredFeatures = [];
        
        _baseFeatures.forEach(function(feature){
            if (!psa_prm.serverlibrary.isFeatureEnabled(feature.id)){
                disabledRequiredFeatures.push(feature.name);
            }
        });
        
        // at least one time feature should be enabled
        var disabledTimeFeatures = [];
        _timeFeatures.forEach(function(feature){
            if (!psa_prm.serverlibrary.isFeatureEnabled(feature.id)){
                disabledTimeFeatures.push(feature.name);
            }        
        });        
        if (disabledTimeFeatures.length == _timeFeatures.length) {
            disabledRequiredFeatures.push(disabledTimeFeatures.join(' or '));
        }
        
        if (disabledRequiredFeatures.length > 0){
            message = 'Feature ' + disabledRequiredFeatures.join(', ') + ' must be enabled. Please enable the features and re-try.';
        }
        
        return message;
    };
};

function beforeInstall(toversion) {
    nlapiLogExecution('DEBUG', 'Bundle Install', '[beforeInstall] toVersion = ' + toversion);
    beforeUpdate();
}

function beforeUpdate(fromversion, toversion) {
    nlapiLogExecution('DEBUG', 'beforeUpdate', fromversion + ' - ' + toversion);
    var errorMessage = PrmBundleInstallation.getFeatureDisabledErrorMessage();
    if (errorMessage) {
        throw new nlobjError('INSTALLATION_ERROR', errorMessage);
    } else {
        nlapiLogExecution('DEBUG', 'Feature', PrmBundleInstallation.getFeatureNames() + ' enabled.');
    }
}

function afterInstall(toversion) {

}

function afterUpdate(fromversion, toversion) {

}

