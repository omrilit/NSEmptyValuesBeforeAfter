/**
 * Copyright 2017 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define([], function() {
    function BaseDAO() {
        this.name = 'BaseDAO';
        this.filters = [];
        this.columns = [];
        this.searchObject = null;
    }
    
    BaseDAO.prototype = {
        initialize: function initialize(params) {},
        search: function search() {
            this.searchObject = search.create({
                type: this.recordType,
                columns: this.columns,
                filters: this.filters
            });
            
            return this.searchObject.run();
        },
        rowToObject: function rowToObject(row) {
            return {};
        },
        getList: function getList(params) {
            try {
                this.initialize(params);
                return this.processList(this.search());
            } catch (ex) {
                log.error({title: this.name + '.getList', details: ex.toString()});
                throw ex;
            }
        },
        processList: function processList(rows) {
            var list = [];
            var callback = this.rowToObject.bind(this);
            
            rows.each(function(row) {
                list.push(callback(row));
                return true;
            });
            
            return list;
        }
    };
    
    return BaseDAO;
});
