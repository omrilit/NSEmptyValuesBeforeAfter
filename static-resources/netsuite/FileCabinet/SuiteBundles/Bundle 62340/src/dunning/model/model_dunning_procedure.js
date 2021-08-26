/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.model = dunning.model || {};

/**
 * Bevare of possible name conlision with src\dunning\model\model_dunning.js
 *
 * @param {number} id
 * @constructor
 */
dunning.model.DunningProcedure = function (id) {
  var sourceList = new suite_l10n.variable.LocalizationVariableList('dunning_source');

  /**
   * @type {number}
   */
  this.id = id;

  /**
   * @type {nlobjRecord}
   */
  this.record = nlapiLoadRecord('customrecord_3805_dunning_procedure', id);

  /**
   * @type {string}
   */
  this.daysBetweenSending = this.record.getFieldValue('custrecord_3805_dp_days_between');

  /**
   * @type {string}
   */
  this.weighting = this.record.getFieldValue('custrecord_3805_dp_weighting');

  /**
   * @type {boolean}
   */
  this.allowOverride = this.record.getFieldValue('custrecord_3805_dp_override') === 'T';

  /**
   * @type {string}
   */
  this.source = sourceList.getValue(this.record.getFieldText('custrecord_3805_dp_type'));

  /**
   * @type {boolean}
   */
  this.isCustomer = this.source === 'customer';

  /**
   * @returns {Array.<dunning.model.Level>}
   */
  this.getLevelList = function () {
    var levelList = [];
    var dunningLevelCount = this.record.getLineItemCount('recmachcustrecord_3805_dl_procedure');

    for (var i = 1; i <= dunningLevelCount; i++) {
      levelList.push(dunning.model.DunningLevel.fromProcedure(this.record, i));
    }

    return levelList;
  };
};
