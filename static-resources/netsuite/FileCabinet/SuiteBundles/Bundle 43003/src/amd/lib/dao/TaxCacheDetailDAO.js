/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', '../base/BaseDAO'], function(error, search, BaseDAO) {

    var TaxCacheDetailDAO = function() {
        BaseDAO.call(this);
        this.name = 'TaxCacheDetailDAO';
        this.recordType = 'customrecord_tax_cache_detail';
        this.fields = {
            id: { id: 'internalid' },
            parent: { id: 'custrecord_tax_cache' },
            detail: { id: 'custrecord_detail' },
            metaData: { id: 'custrecord_metadata' }
        };
        this.columns = [];
        this.filters = [];
    }

    util.extend(TaxCacheDetailDAO.prototype, BaseDAO.prototype);

    TaxCacheDetailDAO.prototype.createSearchFilters = function(params) {
        var filters = [];
        if (params) {
            if (params.id) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.IS,
                    values: params.id
                }));
            }
            if (params.parent) {
                filters.push(search.createFilter({
                    name: this.fields.parent.id,
                    operator: search.Operator.IS,
                    values: params.parent
                }));
            }
        }
        return filters;
    };

    return TaxCacheDetailDAO;
});
