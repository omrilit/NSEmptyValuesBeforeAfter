/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 Jun 2018     jmarimla         Initial
 * 2.00       15 Jan 2019     jmarimla         Suitebundles fix
 * 3.00       12 Feb 2019     rwong            Fix for nlapiLoadRecord permission error for SuiteBundles folder
 * 4.00       28 May 2020     lemarcelo        Updated require path
 * 5.00       07 Aug 2020     jmarimla         Changed sdf directory
 */

var APMLocale = APMLocale || 'en_US';
var APMTransStartTime = new Date().getTime();
var APMTranslation = null;

//fix for SuiteBundles renamed issue
var SuiteBundlesFdName = '';
var SuiteBundlesFd = nlapiSearchRecord('folder', null, ['internalidnumber', 'equalto', -16], new nlobjSearchColumn('name', null, null))
if (SuiteBundlesFd) {
    SuiteBundlesFdName = SuiteBundlesFd[0].getValue('name');
} else {
    SuiteBundlesFdName = 'SuiteBundles'; //default
}

(function () {
    var path = APMBundleId ?
            SuiteBundlesFdName + '/Bundle ' + APMBundleId + '/src/l10n/translation_external' : 
            '/SuiteApps/com.netsuite.appperfmgmt/src/l10n/translation_external';

    require([path], function(translation_external) {
        console.log('Locale: ' + APMLocale);
        translation_external.load.promise({
            keys: ['*'],
            locales: [APMLocale]
        })
        .then(function (handle) {
            APMTranslation = handle;
            console.log('Translation:');
            console.log(APMTranslation);
        });
    });
})();

var APMWaitForTranslation = function () {
    if (APMTranslation) {
        console.log('Translation Load Time (ms): ' + (new Date().getTime() - APMTransStartTime));
        clearTimeout(sleep);
        waitDone();
    } else {
        console.log('Waiting for translation...');
        sleep = setTimeout(APMWaitForTranslation, 100);
    }
};
APMWaitForTranslation();

