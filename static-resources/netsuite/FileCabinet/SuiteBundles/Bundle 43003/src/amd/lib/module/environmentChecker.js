/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['./error', 'N/runtime', 'N/file', '../Constants', '../dao/FileDAO'], function(error, runtime, file, Constants, FileDAO) {

    const LIVE_BUNDLE_ID = '43003';
    const TEST_FILE = '120892f8-aba6-4672-8d1e-0d1766759093';

    var module = {

        isLiveEnvironment: function() {
            var bundleIds = runtime.getCurrentScript().bundleIds;
            return bundleIds.indexOf(LIVE_BUNDLE_ID) > -1;
        },

        isProductionEnvironment: function() {
            return runtime.envType === runtime.EnvType.PRODUCTION;
        },

        isTestEnvironment: function() {
            var fileList = new FileDAO().getList({ name: TEST_FILE });
            return fileList && fileList[0] ? true : false;
        },

        isValidEnvironment: function() {
            return this.isTestEnvironment() || (this.isLiveEnvironment() && this.isProductionEnvironment());
        },

        validateEnvironment: function() {
            if (!this.isValidEnvironment()) {
                error.throw({ code: 'ONLINE_FILING_EXCEPTION', message: 'Online filing is disabled on a non-Production environment.' }, 'ONLINE_FILING');
            }
        }
    };

    return module;
});
