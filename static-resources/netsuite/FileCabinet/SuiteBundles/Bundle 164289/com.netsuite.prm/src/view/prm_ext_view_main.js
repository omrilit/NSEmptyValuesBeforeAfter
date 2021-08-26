/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
var sleep;

function init() {
    /*
     * initialize all UI components
     */
    Ext4.tip.QuickTipManager.init();
    Ext4.util.CSS.createStyleSheet('* { font-family: ' + nsFont + ' !important; }');
    PRM.App.Filter = Ext4.create('PRM.View.FiltersPanel');
    PRM.App.Toolbar = Ext4.create('PRM.View.Toolbar');
    PRM.App.Grid = Ext4.create('PRM.View.Grid');
    Ext4.EventManager.onWindowResize(function() {
        PRM.App.Grid.autofit();
    });

    /*
     * flow:
     * 1) load filters first; necessary for loading last used filters
     * 2) load pageList via filters callback
     * 3) load gridStore via pageList callback
     * 4) load remaining stores via gridStore callback
     */
    PRM.App.Stores.filter.load();

    /*
     * We make a log into the ElasticSearch every time a customer opens the app.
     * This is purely for research purposes and can be removed after 30th March 2020.
     */
    logTheUsage();
};

function logTheUsage() {
    var context = nlapiGetContext();
    var custId = context.getCompany()
    nlapiServerCall('/app/accounting/project/elastic/loggerservice.nl', 'logMessage', ['[PSA] PRM used by customer ' + custId, {}]);
};

var doneFeatureCheck = false;
function waitForRequiredStores() {
    if (PRM.App.Stores.feature.isLoaded()) {
        if (!doneFeatureCheck) {
            doneFeatureCheck = true;
            var disabledFeaturesErrorMsg = PRM.App.Stores.feature.disabledPrerequisiteFeatures(); 
            if (disabledFeaturesErrorMsg) {
                alert(disabledFeaturesErrorMsg);
                clearTimeout(sleep);
                window.location = '/app/center/card.nl?sc=-29';
                return;
            }
        }
        if (PRM.App.Stores.isRequiredLoaded()) {
            clearTimeout(sleep);
            init();
        } else {
            sleep = setTimeout(waitForRequiredStores, 100);
        }
    } else {
        sleep = setTimeout(waitForRequiredStores, 100);
    }
};

Ext4.onReady(function() {
    waitForRequiredStores();
});