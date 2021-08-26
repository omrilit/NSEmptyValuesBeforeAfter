/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.model = dunning.model || {};

dunning.model.DunningLevel = {
  /**
   * @return {dunning.model.Level}
   * @private
   */
  _newLevel: function () {
    return dunning.model.Level ? new dunning.model.Level() : {};
  },

  /**
   * @param {number} id
   * @return {dunning.model.Level}
   */
  fromRecord: function (id) {
    var record = nlapiLoadRecord('customrecord_3805_dunning_level', id);
    var result = this._newLevel();
    result.id = record.getId();
    result.internalid = result.id;
    result.procedureID = record.getFieldValue('custrecord_3805_dl_procedure');
    result.daysOverdue = record.getFieldValue('custrecord_3805_dl_days');
    result.currency = record.getFieldValue('custrecord_3805_dl_currency');
    result.minOutstandingAmount = record.getFieldValue('custrecord_3805_dl_amount');
    result.templateId = record.getFieldValue('custrecord_3805_dl_template_group');
    return result;
  },

  /**
   * @param {nlobjRecord} record
   * @param {number} level
   * @return {dunning.model.Level}
   */
  fromProcedure: function (record, level) {
    var group = 'recmachcustrecord_3805_dl_procedure';
    var result = this._newLevel();
    result.id = record.getLineItemValue(group, 'id', level);
    result.internalid = result.id;
    result.procedureID = record.getLineItemValue(group, 'custrecord_3805_dl_procedure', level);
    result.daysOverdue = record.getLineItemValue(group, 'custrecord_3805_dl_days', level);
    result.currency = record.getLineItemValue(group, 'custrecord_3805_dl_currency', level);
    result.minOutstandingAmount = record.getLineItemValue(group, 'custrecord_3805_dl_amount', level);
    result.templateId = record.getLineItemValue(group, 'custrecord_3805_dl_template_group', level);
    return result;
  }
};
