/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

/**
 * @template Model, View
 * @param {Object} options
 * @param {Model} options.model
 * @param {View} options.view
 * @param {Object.<string,string>} options.modelViewMap
 * @param {Object.<string,string>} options.recordModelMap
 * @constructor
 */
suite_l10n.app.BaseConverter = function (options) {
  this._model = options.model;
  this._view = options.view;
  this._modelViewMap = options.modelViewMap;
  this._recordModelMap = options.recordModelMap;
};

/**
 * @param {View} view
 * @returns {Model}
 */
suite_l10n.app.BaseConverter.prototype.castToModel = function (view) {
  var model = new this._model();
  for (var field in this._modelViewMap) {
    model[field] = view[this._modelViewMap[field]];
  }
  return model;
};

/**
 * @param {Model} model
 * @returns {View}
 */
suite_l10n.app.BaseConverter.prototype.castToView = function (model) {
  var view = new this._view();
  for (var field in this._modelViewMap) {
    view[this._modelViewMap[field]] = model[field];
  }
  return view;
};

/**
 * @param {nlobjRecord|ns_wrapper.Record} record
 * @returns {View}
 */
suite_l10n.app.BaseConverter.prototype.castRecordToView = function (record) {
  return this.castToView(this.castRecordToModel(record));
};

/**
 * @param {nlobjRecord|ns_wrapper.Record} record
 * @returns {Model}
 */
suite_l10n.app.BaseConverter.prototype.castRecordToModel = function (record) {
  /**
   * @param {string} name
   * @returns {boolean}
   */
  function isFieldMultiselect (name) {
    var field = record.getField(name);
    return field && field.getType() === 'multiselect';
  }

  var model = new this._model();
  for (var field in this._recordModelMap) {
    var value = record.getFieldValue(field);

    if (isFieldMultiselect(field) && ['string', 'number'].indexOf(typeof value) >= 0) {
      model[this._recordModelMap[field]] = [value];
    } else {
      model[this._recordModelMap[field]] = value;
    }
  }
  model.id = record.getId();
  return model;
};

/**
 * @param {Array.<View>} views
 * @returns {Array.<Model>}
 */
suite_l10n.app.BaseConverter.prototype.castToMultipleViews = function (views) {
  return views.map(function (model) { return this.castToView(model); }, this);
};

/**
 * @param {Array.<Model>} models
 * @returns {Array.<View>}
 */
suite_l10n.app.BaseConverter.prototype.castToMultipleModels = function (models) {
  return models.map(function (view) { return this.castToModel(view); }, this);
};
