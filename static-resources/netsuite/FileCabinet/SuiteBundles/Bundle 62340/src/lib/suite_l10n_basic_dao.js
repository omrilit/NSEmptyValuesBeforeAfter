/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.dao = suite_l10n.dao || {};

/**
 * @template T
 * @param {string} recordType
 * @param {string} [searchRecordType]
 * @constructor
 */
suite_l10n.dao.BasicDAO = function (recordType, searchRecordType) {
  if (!recordType) {
    throw new Error('RecordType is a required parameter');
  }

  /**
   * @type {string}
   * @protected
   */
  this._recordType = recordType;

  /**
   * @type {string}
   * @protected
   */
  this._searchRecordType = searchRecordType;

  /**
   * @type {Object.<string,string>|null}
   * @protected
   */
  this._fieldMap = null;

  /**
   * @type {Function|null}
   * @protected
   */
  this._modelClass = null;

  /**
   * @type {Array.<nlobjSearchFilter>|null}
   * @protected
   */
  this._subRecordSearchFilters = null;
};

suite_l10n.dao.BasicDAO.prototype = {
  /**
   * @param {Object} model
   * @param {string[]} fieldsForUpdate
   * @returns {Array}
   * @protected
   */
  _getValuesForUpdate: function (model, fieldsForUpdate) {
    return fieldsForUpdate.map(function (field) {
      return model[field];
    });
  },

  /**
   * This will return the search recordtype if set. By default, this will return the same record type used for loading
   * @returns {string}
   */
  getSearchRecordType: function () {
    return this._searchRecordType || this._recordType;
  },

  /**
   * @param {Array.<nlobjSearchFilter>} filters
   */
  setRecordSearchFilters: function (filters) {
    this._subRecordSearchFilters = filters;
  },

  /**
   * @returns {Array.<nlobjSearchFilter>|null}
   */
  getRecordSearchFilters: function () {
    return this._subRecordSearchFilters;
  },

  /**
   * @param {Function} modelClass
   */
  setModelClass: function (modelClass) {
    this._modelClass = modelClass;
  },

  /**
   * Set the field map to be used when retrieving values.
   * fieldMap attributes should be named after model attributes
   * fieldMap values should be the id for corresponding fields
   */
  setFieldMap: function (newFieldMap) {
    this._fieldMap = newFieldMap;
  },

  /**
   * @returns {*}
   */
  getFieldMap: function () {
    return this._fieldMap;
  },

  /**
   * @returns {T}
   */
  getModelClass: function () {
    return this._modelClass;
  },

  /**
   * @param {Object.<string,string>} baseMap
   * @param {Object.<string,string>} additionalMap
   */
  mergeFieldMaps: function (baseMap, additionalMap) {
    for (var i in additionalMap) {
      baseMap[i] = additionalMap[i];
    }
  },

  /**
   * @throws {Error}
   */
  validateSetup: function () {
    if (!this.getFieldMap()) {
      throw new Error('Please set Field Map variable');
    }
    if (!this.getModelClass()) {
      throw new Error('Please set Model Class variable');
    }
  },

  /**
   * Do additional processing on a model's values given its record object
   * @param {T} model
   * @param {nlobjRecord|ns_wrapper.Record} record
   */
  postProcessModelRecord: function (model, record) {
  },

  /**
   * Do additional processing on a model's values given its search result object
   * @param {T} model
   * @param {nlobjSearchResult} result
   */
  postProcessModelSearch: function (model, result) {
  },

  /**
   * @param {nlobjSearchResult|nlobjRecord|ns_wrapper.Record} source
   * @param {boolean} [isResult=false]
   * @returns {T}
   */
  castToModel: function (source, isResult) {
    this.validateSetup();

    var ModelClass = this.getModelClass();
    var model = new ModelClass();
    var fieldMap = this.getFieldMap();

    if (isResult) {
      Object.keys(fieldMap).forEach(function (field) {
        model[field] = source.getValue(fieldMap[field]);
      });
      this.postProcessModelSearch(model, source);
    } else {
      Object.keys(fieldMap).forEach(function (field) {
        model[field] = source.getFieldValue(fieldMap[field]);
      });
      this.postProcessModelRecord(model, source);
    }

    model.id = source.getId();

    return model;
  },

  /**
   * @param {T} model
   * @returns {Array.<{id:string,value:*}>}
   */
  getFieldValueList: function (model) {
    this.validateSetup();
    var fieldMap = this.getFieldMap();

    return Object.keys(fieldMap).map(function (i) {
      return {
        id: fieldMap[i],
        value: model[i]
      };
    });
  },

  /**
   * @param {number} id
   * @returns {T}
   */
  retrieve: function (id) {
    return this.castToModel(new ns_wrapper.Record(this._recordType, id));
  },

  /**
   * @param {T} model
   * @returns {number}
   */
  create: function (model) {
    var record = new ns_wrapper.Record(this._recordType);
    record.setRecordFields(this.getFieldValueList(model));
    return record.saveRecord();
  },

  /**
   * @param {T} model
   * @returns {number}
   */
  update: function (model) {
    var record = new ns_wrapper.Record(this._recordType, model.id);
    record.setRecordFields(this.getFieldValueList(model));
    return record.saveRecord();
  },

  /**
   * @param {T} model
   * @param {string[]} fieldsForUpdate
   */
  updateFields: function (model, fieldsForUpdate) {
    var valuesForUpdate = this._getValuesForUpdate(model, fieldsForUpdate);
    var mappedFieldsForUpdate = this._getValuesForUpdate(this._fieldMap, fieldsForUpdate);
    ns_wrapper.api.field.submitField(this._recordType, model.id, mappedFieldsForUpdate, valuesForUpdate);
  },

  /**
   * @returns {ns_wrapper.Search}
   */
  getSearch: function () {
    var search = new ns_wrapper.Search(this.getSearchRecordType());

    var fieldMap = this.getFieldMap();
    for (var i in fieldMap) {
      search.addColumn(fieldMap[i]);
    }

    var filters = this.getRecordSearchFilters();
    if (filters) {
      search.addFilters(filters);
    }

    return search;
  },

  /**
   * @param {number} id
   */
  remove: function (id) {
    var record = new ns_wrapper.Record(this._recordType, id);
    record.deleteRecord(id);
  },

  /**
   * @param {Array.<nlobjSearchFilter>} [filters]
   * @returns {T}
   */
  retrieveWithFilters: function (filters) {
    var search = this.getSearch();

    if (filters && filters.length > 0) {
      search.addFilters(filters);
    }

    return search.map(function (result) {
      return this.castToModel(result, true);
    }.bind(this));
  },

  /**
   * @returns {Array.<T>}
   */
  retrieveAll: function () {
    return this.retrieveWithFilters();
  },

  /**
   * @param {number[]} idList
   * @returns {Array.<T>}
   */
  retrieveByIdList: function (idList) {
    return this.retrieveWithFilters([
      ns_wrapper.search.createSearchFilter('internalid', null, 'anyof', idList)
    ]);
  }
};
