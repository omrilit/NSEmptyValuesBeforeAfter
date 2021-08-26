/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', '../base/BaseDAO'], function(error, search, BaseDAO) {

    var FolderDAO = function() {
        BaseDAO.call(this);
        this.name = 'FolderDAO';
        this.recordType = 'folder';
        this.fields = {
            id: { id: 'internalid' },
            name: { id: 'name' }
        };
        this.columns = [];
        this.filters = [];
    }

    util.extend(FolderDAO.prototype, BaseDAO.prototype);

    FolderDAO.prototype.createSearchFilters = function(params) {
        var filters = [];

        if (params) {
            if (params.id) {
                filters.push(search.createFilter({
                    name: this.fields.id.id,
                    operator: search.Operator.IS,
                    values: params.id
                }));
            }

            if (params.name) {
                filters.push(search.createFilter({
                    name: this.fields.name.id,
                    operator: search.Operator.IS,
                    values: params.name
                }));
            }
        }

        return filters;
    };

    return FolderDAO;
});
