/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       02 Oct 2020     lemarcelo        Initial
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType SDFInstallationScript
 */
define(['N/runtime'], function(runtime) {
    function run(context) {
        // access to context.fromVersion and context.toVersion here
        var customRecords = runtime.isFeatureInEffect({
            feature: 'CUSTOMRECORDS'
        });
        var clientScript = runtime.isFeatureInEffect({
            feature: 'CUSTOMCODE'
        });
        var serverScript = runtime.isFeatureInEffect({
            feature: 'SERVERSIDESCRIPTING'
        });

        if (customRecords && clientScript && serverScript) {
            log.debug('Feature', 'Custom records, client/server side scripts enabled.');
        }
        else {
            throw '[Custom Records], [Client SuiteScript], and [Server SuiteScript] Features must be enabled. Please enable the features and try again.';
        }

    }
    return {
        run: run
    };
});
