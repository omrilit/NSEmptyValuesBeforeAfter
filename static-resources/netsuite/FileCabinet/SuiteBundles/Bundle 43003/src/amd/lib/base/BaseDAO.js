/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define(['../module/error', 'N/search', 'N/record'], function(error, search, record) {

    BaseDAO = function() {
        this.name = 'BaseDAO';
        this.columns = [];
        this.filters = [];
        this.recordType = '';
        this.searchId = '';
        this.fields = {
            /*
            <property name>: { id: <internal id of field>, join: <join table>, sort: <sort> }
            */
        };
        this.search = search;
        this.record = record;
        this.error = error;
    }

    BaseDAO.prototype.getList = function(params) {
        try {
            this.prepareSearch(params);
            return this.processList(this.runSearch());
        } catch (ex) {
            this.error.throw(ex, { className: this.name, functionName: 'getList' });
        }
    };

    BaseDAO.prototype.prepareSearch = function(params) {
        this.columns = this.createSearchColumns(params);
        this.filters = this.createSearchFilters(params);
    };
    
    BaseDAO.prototype.createSearchFilters = function(params) {
        return [];
    };
    
    BaseDAO.prototype.createSearchColumns = function(params) {
        try {
            var columns = [];
            var column;
            var field;
            for (var name in this.fields) {
                field = this.fields[name];
                column = {
                    name: field.id,
                    join: field.join
                };
                if (field.sort) {
                    column.sort = field.sort;
                }
                columns.push(this.search.createColumn(column));
            }
            return columns;
        } catch (ex) {
            this.error.throw(ex, { className: this.name, functionName: 'createSearchColumns' });
        }
    };

    BaseDAO.prototype.processList = function(rows) {
        if (!rows) {
            error.throw({
                code: 'MISSING_PARAMETER', message: 'rows is a required parameter'
            }, {
                className: this.name, functionName: 'processList'
            });
        }

        try {
            var list = [];
            var rowToObject = this.rowToObject;
            var fields = this.fields;
            rows.each(function(row) {
                list.push(rowToObject(row, fields));
                return true;
            });

            return list;
        } catch (ex) {
            this.error.throw(ex, { className: this.name, functionName: 'processList' });
        }
    };

    BaseDAO.prototype.rowToObject = function(row, fields) {
        if (!row) {
            this.error.throw({
                code: 'MISSING_PARAMETER', message: 'row is a required parameter'
            }, {
                className: this.name, functionName: 'rowToObject'
            });
        }
        if (!fields) {
            this.error.throw({
                code: 'MISSING_PARAMETER', message: 'fields is a required parameter'
            }, {
                className: this.name, functionName: 'rowToObject'
            });
        }
        try {
            var object = {};
            var field;
            for (var name in fields) {
                field = fields[name];
                object[name] = row.getValue({ name: field.id, join: field.join });
            }
            return object;
        } catch (ex) {
            this.error.throw(ex, { className: this.name, functionName: 'rowToObject' });
        }
    };

    BaseDAO.prototype.runSearch = function() {
        try {
            var searchObject = this.searchId ? this.search.load(this.searchId) : this.search.create({
                type: this.recordType,
                columns: this.columns,
                filters: this.filters
            });

            if (this.searchId) {
                var columns = [];
                for (var i = 0; i < this.columns.length; i++) {
                    columns.push(this.columns[i]);
                }
                searchObject.columns = searchObject.columns.concat(columns);

                var filters = [];
                for (var i = 0; i < this.filters.length; i++) {
                    filters.push(this.filters[i]);
                }
                searchObject.filters = searchObject.filters.concat(filters);
            }

            return searchObject.run();
        } catch(ex) {
            this.error.throw(ex, { className: this.name, functionName: 'runSearch' });
        }
    };

    BaseDAO.prototype.get = function(id) {
        try {
            var rec = this.record.load({
                type: this.recordType,
                id: id,
                isDynamic: true
            });
            var field;
            var object = {};

            for (var name in this.fields) {
                field = this.fields[name];
                if (field) {
                    object[name] = rec.getValue({ fieldId: field.id });
                }
            }

            return object;
        } catch (ex) {
            this.error.throw(ex, { className: this.name, functionName: 'get' });
        }
    };

    BaseDAO.prototype.create = function(object, params) {
        try {
            var rec = this.record.create({
                type: this.recordType,
                isDynamic: true
            });
            var field;

            for (var name in object) {
                field = this.fields[name];
                if (field) {
                    rec.setValue({
                        fieldId: field.id,
                        value: object[name]
                    });
                }
            }

            return rec.save(params);
        } catch (ex) {
            this.error.throw(ex, { className: this.name, functionName: 'create' });
        }
    };

    BaseDAO.prototype.update = function(id, object) {
        try {
            var field;
            var values = {};

            for (var name in object) {
                field = this.fields[name];
                values[field.id] = object[name];
            }
            return this.record.submitFields({
                type: this.recordType,
                id: id,
                values: values
            });
        } catch (ex) {
            this.error.throw(ex, { className: this.name, functionName: 'update' });
        }
    };

    BaseDAO.prototype.delete = function(id) {
        try {
            return this.record.delete({
                type: this.recordType,
                id: id
            });
        } catch (ex) {
            this.error.throw(ex, { className: this.name, functionName: 'delete' });
        }
    };
    
    return BaseDAO;
});