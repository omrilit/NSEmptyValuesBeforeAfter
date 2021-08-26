/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', 'N/runtime', '../base/BaseDAO'], function(error, search, runtime, BaseDAO) {

    OnlineFilingDAO = function() {
        BaseDAO.call(this);
        this.isMultiBook = runtime.isFeatureInEffect({ feature: 'MULTIBOOK' });
        this.isOneWorld = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' });
        this.name = 'OnlineFilingDAO';
        this.recordType = 'customrecord_online_filing';
        this.fields = {
            id: { id: 'internalid' },
            dateCreated: { id: 'created' },
            user: { id: 'custrecord_online_filing_user' },
            nexus: { id: 'custrecord_online_filing_nexus' },
            vrn: { id: 'custrecord_online_filing_vrn' },
            coveredPeriods: { id: 'custrecord_online_filing_covered_periods' },
            status: { id: 'custrecord_online_filing_status' },
            action: { id: 'custrecord_online_filing_action' },
            metaData: { id: 'custrecord_online_filing_meta_data' },
            data: { id: 'custrecord_online_filing_data' },
            result: { id: 'custrecord_online_filing_result' }
        };
        if (this.isOneWorld) {
            this.fields['subsidiary'] = { id: 'custrecord_online_filing_subsidiary' };
        }
        if (this.isMultiBook) {
            this.fields['accountingBook'] = { id: 'custrecord_online_filing_acct_book' };
        }
        this.columns = [];
        this.filters = [];
    }

    util.extend(OnlineFilingDAO.prototype, BaseDAO.prototype);

    OnlineFilingDAO.prototype.createSearchFilters = function(params) {
        var filters = [];

        if (params) {
            if (params.id) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.IS,
                    values: params.id
                }));
            }

            if (params.user) {
                filters.push(search.createFilter({
                    name: this.fields.user.id,
                    operator: search.Operator.IS,
                    values: params.user
                }));
            }

            if (params.subsidiary) {
                filters.push(search.createFilter({
                    name: this.fields.subsidiary.id,
                    operator: search.Operator.IS,
                    values: params.subsidiary
                }));
            }

            if (params.vrn) {
                filters.push(search.createFilter({
                    name: this.fields.vrn.id,
                    operator: search.Operator.IS,
                    values: params.vrn
                }));
            }
        }

        return filters;
    };

    return OnlineFilingDAO;
});
