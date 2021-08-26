/**
 * Copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', '../base/BaseDAO'], function(error, search, BaseDAO) {

    var SchemaDAO = function() {
        BaseDAO.call(this);
        this.name = 'SchemaDAO';
        this.recordType = 'customrecord_tax_field';
        this.fields = {
            id: { id: 'custrecord_internalid' },
            taxForm: { id: 'custrecord_tax_form' },
            type: {id: 'custrecord_field_type'},
            validation: { id: 'custrecord_validation' },
            help: {id: 'custrecord_fieldhelp'},
            altCode: {id: 'custrecord_altcode'}
        };
        this.columns = [];
        this.filters = [];
    }

    util.extend(SchemaDAO.prototype, BaseDAO.prototype);

    SchemaDAO.prototype.createSearchFilters = function(params) {
        var filters = [];

        if (params) {
            if (params.id) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.IS,
                    values: params.id
                }));
            }

            if (params.taxForm) {
                filters.push(search.createFilter({
                    name: this.fields.taxForm.id,
                    operator: search.Operator.IS,
                    values: params.taxForm
                }));
            }

            if (params.type) {
                filters.push(search.createFilter({
                    name: this.fields.type.id,
                    operator: search.Operator.IS,
                    values: params.type
                }));
            }

            if (params.validation) {
                filters.push(search.createFilter({
                    name: this.fields.validation.id,
                    operator: search.Operator.IS,
                    values: params.validation
                }));
            }

            if (params.altCode) {
                filters.push(search.createFilter({
                    name: this.fields.altCode.id,
                    operator: search.Operator.IS,
                    values: params.altCode
                }));
            }
        }

        return filters;
    };

    return SchemaDAO;
});
