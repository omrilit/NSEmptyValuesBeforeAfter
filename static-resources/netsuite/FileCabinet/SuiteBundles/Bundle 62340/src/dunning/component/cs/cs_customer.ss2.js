/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope public
 */

define([], function () {
  var dao = dao || {};
  dao.customer = {
    DUNNING_RECIPIENT: {
      TYPE: 'sublist',
      ID: 'recmachcustrecord_3805_dunning_recipient_cust',
      FIELDS: {
        CONTACT: {
          TYPE: 'list/record',
          ID: 'custrecord_3805_dunning_recipient_cont'
        }
      }
    }
  };

  /**
   * Verify if newly added recipient isn't already in Dunning recipients
   * @param {module:N/record.Record} record
   * @param {string} sublist
   * @param {string} field
   * @param {string} newValue
   * @returns {boolean}
   */
  function isValueAlreadyInSublist (record, sublist, field, newValue) {
    const result = record.findSublistLineWithValue({
      sublistId: sublist,
      fieldId: field,
      value: newValue
    }) === -1;

    if (!result) {
      const textValue = record.getCurrentSublistText({
        sublistId: sublist,
        fieldId: field
      });
      alert(textValue + ' is already present in the list');
    }

    return result;
  }

  function validateField (context) {
    var result = true;

    const record = context.currentRecord;
    const sublist = context.sublistId;
    const field = context.fieldId;

    if (sublist === dao.customer.DUNNING_RECIPIENT.ID && field === dao.customer.DUNNING_RECIPIENT.FIELDS.CONTACT.ID) {
      const newRecipient = record.getCurrentSublistValue({
        sublistId: sublist,
        fieldId: field
      });

      result = isValueAlreadyInSublist(record, sublist, field, newRecipient);
    }

    return result;
  }

  return {
    validateField: validateField
  };
});
