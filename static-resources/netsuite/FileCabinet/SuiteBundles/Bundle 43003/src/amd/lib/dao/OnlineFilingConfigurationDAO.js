/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', '../base/BaseDAO'], function(error, search, BaseDAO) {

    OnlineFilingConfigurationDAO = function() {
        BaseDAO.call(this);
        this.name = 'OnlineFilingConfigurationDAO';
        this.recordType = 'customrecord_filing_config';
        this.fields = {
            id: { id: 'internalid' },
            name: { id: 'name' },
            nexus: { id: 'custrecord_filing_config_nexus' },
            isForTest: { id: 'custrecord_filing_config_is_test' },
            process: { id: 'custrecord_filing_config_proc' },
			config: { id: 'custrecord_filing_config_config' },
            isInactive: { id: 'isinactive' }
        };
        this.columns = [];
        this.filters = [];
    }

    util.extend(OnlineFilingConfigurationDAO.prototype, BaseDAO.prototype);

    OnlineFilingConfigurationDAO.prototype.createSearchFilters = function(params) {
        var filters = [];

        if (params) {
            if (params.id) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.IS,
                    values: params.id
                }));
            }

            // Always default to isForTest = true, unless specified
            if (util.isBoolean(params.isForTest)) {
                filters.push(search.createFilter({
                    name: this.fields.isForTest.id,
                    operator: search.Operator.IS,
                    values: params.isForTest
                }));
            } else {
                filters.push(search.createFilter({
                    name: this.fields.isForTest.id,
                    operator: search.Operator.IS,
                    values: true
                }));
            }

            if (params.nexus) {
                filters.push(search.createFilter({
                    name: this.fields.nexus.id,
                    operator: search.Operator.IS,
                    values: params.nexus
                }));
            }

            if (util.isBoolean(params.isInactive)) {
                filters.push(search.createFilter({
                    name: this.fields.isInactive.id,
                    operator: search.Operator.IS,
                    values: params.isInactive
                }));
            } else {
                filters.push(search.createFilter({
                    name: this.fields.isInactive.id,
                    operator: search.Operator.IS,
                    values: false
                }));
            }
        }
        return filters;
    };

    return OnlineFilingConfigurationDAO;
});
