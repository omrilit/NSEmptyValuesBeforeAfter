/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', 'N/runtime', '../base/BaseDAO'], function(error, search, runtime, BaseDAO) {

    var SubsidiaryDAO = function() {
        BaseDAO.call(this);
        this.isMultiCalendar = runtime.isFeatureInEffect({ feature: 'MULTIPLECALENDARS' });
        this.name = 'SubsidiaryDAO';
        this.recordType = 'subsidiary';
        this.fields = {
            id: { id: 'internalid' },
            name: { id: 'name' },
            legalName: { id: 'legalname' }
        };
        if (this.isMultiCalendar) {
            this.fields['taxFiscalCalendar'] = { id: 'taxfiscalcalendar' };
        }
        this.columns = [];
        this.filters = [];
    }

    util.extend(SubsidiaryDAO.prototype, BaseDAO.prototype);

    SubsidiaryDAO.prototype.createSearchFilters = function(params) {
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

    return SubsidiaryDAO;
});
