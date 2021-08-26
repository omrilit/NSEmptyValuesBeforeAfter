/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', '../base/BaseDAO'], function(error, search, BaseDAO) {

    OnlineFilingAuthorizationDAO = function() {
        BaseDAO.call(this);
        this.name = 'OnlineFilingAuthorizationDAO';
        this.recordType = 'customrecord_filing_authorization';
        this.fields = {
            id: {
                id: 'internalid'
            },
            credentials: {
                id: 'custrecord_filing_authorization_cred'
            }
        };
        this.columns = [];
        this.filters = [];
    }

    util.extend(OnlineFilingAuthorizationDAO.prototype, BaseDAO.prototype);

    OnlineFilingAuthorizationDAO.prototype.createSearchFilters = function(params) {
        var filters = [];

        if (params) {
            if (params.id) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.IS,
                    values: params.id
                }));
            }
        }

        return filters;
    };

    return OnlineFilingAuthorizationDAO;
});