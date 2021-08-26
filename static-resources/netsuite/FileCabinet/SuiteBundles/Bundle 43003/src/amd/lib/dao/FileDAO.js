/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['N/error', 'N/search', '../base/BaseDAO'], function(error, search, BaseDAO) {

    FileDAO = function() {
        BaseDAO.call(this);
        this.name = 'FileDAO';
        this.recordType = 'file';
        this.fields = {
            id: { id: 'internalid' },
            name: { id: 'name' },
            folder: { id: 'folder' },
            url: { id: 'url' }
        };
        this.columns = [];
        this.filters = [];
    }

    util.extend(FileDAO.prototype, BaseDAO.prototype);
    
    FileDAO.prototype.createSearchFilters = function(params) {
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

    return FileDAO;
});