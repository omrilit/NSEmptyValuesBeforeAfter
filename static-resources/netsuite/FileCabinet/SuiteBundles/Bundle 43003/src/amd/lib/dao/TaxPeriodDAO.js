/**
 * Copyright © 2018, 2019, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', 'N/runtime', '../base/BaseDAO'], function(error, search, runtime, BaseDAO) {

    TaxPeriodDAO = function() {
        BaseDAO.call(this);
        this.name = 'TaxPeriodDAO';
        this.recordType = 'taxperiod';
        this.isMultiCalendar = runtime.isFeatureInEffect({ feature: 'MULTIPLECALENDARS' });
        this.fields = {
            id: { id: 'internalid' },
            name: { id: 'periodname' },
            startDate: { id: 'startdate', sort: search.Sort.ASC },
            endDate: { id: 'enddate' },
            isQuarter: { id: 'isquarter' },
            isYear: { id: 'isyear' },
            parent: { id: 'parent' },
            isPosting: {id: 'isposting' }
        };
        if (this.isMultiCalendar) {
            this.fields['fiscalCalendar'] = { id: 'fiscalcalendar' };
        }
        this.columns = [];
        this.filters = [];
    };

    util.extend(TaxPeriodDAO.prototype, BaseDAO.prototype);

    TaxPeriodDAO.prototype.createSearchFilters = function(params) {
        var filters = [];
        if (params) {
            if (params.id) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.IS,
                    values: params.id
                }));
            }
            if (params.ids) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.ANYOF,
                    values: params.ids
                }));
            }
            if (params.startDate) {
                filters.push(search.createFilter({
                    name: this.fields.startDate.id,
                    operator: search.Operator.ON,
                    values: params.startDate
                }));
            }
            if (params.endDate) {
                filters.push(search.createFilter({
                    name: this.fields.endDate.id,
                    operator: search.Operator.ON,
                    values: params.endDate
                }));
            }
            if (params.periodRange) {
                filters.push(search.createFilter({
                    name: this.fields.startDate.id,
                    operator: search.Operator.ONORAFTER,
                    values: params.periodRange.startDate
                }));
                filters.push(search.createFilter({
                    name: this.fields.endDate.id,
                    operator: search.Operator.ONORBEFORE,
                    values: params.periodRange.endDate
                }));
            }
            if (util.isBoolean(params.isQuarter)) {
                filters.push(search.createFilter({
                    name: this.fields.isQuarter.id,
                    operator: search.Operator.IS,
                    values: params.isQuarter
                }));
            }
            if (util.isBoolean(params.isYear)) {
                filters.push(search.createFilter({
                    name: this.fields.isYear.id,
                    operator: search.Operator.IS,
                    values: params.isYear
                }));
            }
            if (params.parent) {
                filters.push(search.createFilter({
                    name: this.fields.parent.id,
                    operator: search.Operator.IS,
                    values: params.parent
                }));
            }
            if (params.fiscalCalendar) {
                filters.push(search.createFilter({
                    name: this.fields.fiscalCalendar.id,
                    operator: search.Operator.IS,
                    values: params.fiscalCalendar
                }));
            }
            if (util.isBoolean(params.isPosting)){
                filters.push(search.createFilter({
                    name: this.fields.isPosting.id,
                    operator: search.Operator.IS,
                    values: params.isPosting
                }));
            }
        }
        return filters;
    };

    TaxPeriodDAO.prototype.getCoveredTaxPeriodMonths = function(periodFromId, periodToId, fiscalCalendar) {
        var periodFrom = this.getList({ id: periodFromId, fiscalCalendar: fiscalCalendar })[0];
        var periodTo = periodFromId === periodToId ? periodFrom : this.getList({ id: periodToId, fiscalCalendar: fiscalCalendar })[0];

        return this.getList({
            periodRange: {
                startDate: periodFrom.startDate,
                endDate: periodTo.endDate
            },
            isPosting: true
        });
    };


    return TaxPeriodDAO;
});
