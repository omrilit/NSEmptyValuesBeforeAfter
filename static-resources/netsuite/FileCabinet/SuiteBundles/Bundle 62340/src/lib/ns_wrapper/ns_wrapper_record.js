/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

/**
 * @param {string} type
 * @param {string|number} [id]
 * @constructor
 */
ns_wrapper.Record = function (type, id) {
  /**
   * @type {string}
   * @private
   */
  this._type = undefined;

  /**
   * @type {undefined|string|number}
   * @private
   */
  this._id = undefined;

  /**
   * @type {nlobjRecord}
   */
  this._record = undefined;
  if (typeof arguments[0] === 'object') {
    this._record = arguments[0];
    this._type = this._record.getRecordType();
  } else {
    this._type = type;
    this._id = id;
    this._record = id ? nlapiLoadRecord(type, id) : nlapiCreateRecord(type);
  }
};

ns_wrapper.Record.prototype = {

  /**
   * @param {number|string} id
   * @returns {nlobjRecord}
   */
  loadRecord: function (id) {
    return nlapiLoadRecord(this._type, id);
  },

  /**
   * @param {number|string} id
   * @returns {*}
   */
  deleteRecord: function (id) {
    return nlapiDeleteRecord(this._type, id);
  },

  /**
   * @param {Array.<string,{id,value}>} fieldList
   */
  setRecordFields: function (fieldList) {
    fieldList.forEach(function (field) {
      if (field.value && this._record.getFieldValue(field.id) != field.value) {
        this._record.setFieldValue(field.id, field.value);
      }
    }.bind(this));
  },

  /**
   * @param {Object} fieldMap
   */
  setRecordFieldMap: function (fieldMap) {
    for (var i in fieldMap) {
      if (fieldMap[i]) {
        this._record.setFieldValue(i, fieldMap[i]);
      }
    }
  },

  /**
   * @param {string} sublistId
   * @param {Object} sublistValues
   */
  addSubListLine: function (sublistId, sublistValues) {
    this._record.selectNewLineItem(sublistId);

    for (var field in sublistValues) {
      this._record.setCurrentLineItemValue(sublistId, field, sublistValues[field]);
    }

    this._record.commitLineItem(sublistId);
  },

  /**
   * Works only for the Job Engine
   */
  addSublistRecordField: function (sublistId, sublistFieldList) {
    this._record.selectNewLineItem(sublistId);
    var fieldMap = sublistFieldList.getFieldMap ? sublistFieldList.getFieldMap() : {};

    for (var i in sublistFieldList) {
      var value = sublistFieldList[i];
      if (typeof value !== 'function' &&
        fieldMap[i] != 'internalid' &&
        fieldMap[i] != 'custrecord_l10n_job_prop_parent' &&
        fieldMap[i] != 'custrecord_l10n_task_list_prop_parent' &&
        fieldMap[i]
      ) {
        if (typeof value === 'boolean') {
          value = value ? 'T' : 'F';
        }
        this._record.setCurrentLineItemValue(sublistId, fieldMap[i], value);
      }
    }

    this._record.commitLineItem(sublistId);
  },

  /**
   * @param {string} sublistId
   * @param {number} lineNo
   * @param {Array.<{id,value}>} sublistFieldList
   */
  updateSublistRecordField: function (sublistId, lineNo, sublistFieldList) {
    this._record.selectLineItem(sublistId, lineNo);

    sublistFieldList.forEach(function (field) {
      this._record.setCurrentLineItemValue(sublistId, field.id, field.value);
    }.bind(this));
  },

  /**
   * @deprecated
   * @param {Array.<{id,value}>} fieldList
   * @returns {number}
   */
  createRecord: function (fieldList) {
    this.setRecordFields(fieldList);
    return this.saveRecord();
  },

  /**
   * @deprecated
   * @param {string|number} id
   * @param {Array.<{id,value}>} fieldList
   * @returns {nlobjRecord}
   */
  updateRecord: function (id, fieldList) {
    var rec = nlapiLoadRecord(this._type, id);
    fieldList.forEach(function (field) {
      if (field.value && (rec.getFieldValue(field.id) != field.value)) {
        rec.setFieldValue(field.id, field.value);
      }
    });
    nlapiSubmitRecord(rec);
    return rec;
  },

  /**
   * @returns {number}
   */
  saveRecord: function () {
    return nlapiSubmitRecord(this._record);
  },

  /**
   * @param {string} name
   * @returns {*|Field}
   */
  getField: function (name) {
    return this._record.getField(name);
  },

  /**
   * @param {string} name
   * @returns {*}
   */
  getFieldValue: function (name) {
    return this._record.getFieldValue(name);
  },

  /**
   * @param {string} name
   * @returns {*}
   */
  getFieldValues: function (name) {
    return this._record.getFieldValues(name);
  },

  /**
   * @param {string} fieldName
   * @param {string} value
   */
  setFieldValue: function (fieldName, value) {
    this._record.setFieldValue(fieldName, value);
  },

  /**
   * @param {string} name
   * @param {string[]} values
   */
  setFieldValues: function (name, values) {
    this._record.setFieldValues(name, values);
  },

  /**
   * @param {string} name
   * @returns {string|null}
   */
  getFieldText: function (name) {
    return this._record.getFieldText(name);
  },

  /**
   * @returns {number}
   */
  getId: function () {
    return this._record.getId();
  },

  /**
   * @param {string} group
   * @returns {Array.<Object<string,*>>}
   */
  getLineItems: function (group) {
    var lines = [];
    var count = this._record.getLineItemCount(group);
    var fields = this._record.getAllLineItemFields(group);

    for (var i = 1; i <= count; i++) {
      var data = {};

      fields.forEach(function (field) {
        data[field] = this._record.getLineItemValue(group, field, i);
      }, this);

      lines.push(data);
    }

    return lines;
  },

  getAllLineItemFields: function (group) {
    return this._record.getAllLineItemFields(group);
  },

  getLineItemCount: function (group) {
    return this._record.getLineItemCount(group);
  },

  getLineItemValue: function (group, field, i) {
    return this._record.getLineItemValue(group, field, i);
  },

  getAllFields: function () {
    return this._record.getAllFields();
  },

  /**
   * @returns {nlobjRecord}
   */
  getRawRecord: function () {
    return this._record;
  }
};
