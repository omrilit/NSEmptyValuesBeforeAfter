/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @constructor
 * @extends {suite_l10n.app.BaseConverter<dunning.model.DunningInvoice, dunning.view.DunningInvoice>}
 */
dunning.app.DunningInvoiceConverter = function () {
  return new suite_l10n.app.BaseConverter({
    model: dunning.model.DunningInvoice,
    view: dunning.view.DunningInvoice,
    modelViewMap: {
      id: 'id',
      sendByEmail: 'sendByEmail',
      sendByPrint: 'sendByPrint',
      isDunningPaused: 'isDunningPaused',
      lastSentDate: 'lastSentDate',
      dunningProcedureId: 'dunningProcedureId',
      dunningLevelId: 'dunningLevelId',
      dunningManager: 'dunningManager',
      status: 'status',
      substatus: 'substatus',
      subsidiary: 'subsidiary',
      customer: 'customer',
      classification: 'classification',
      location: 'location',
      department: 'department'
    },
    recordModelMap: {
      internalid: 'id',
      custbody_3805_dunning_letters_toemail: 'sendByEmail',
      custbody_3805_dunning_letters_toprint: 'sendByPrint',
      custbody_3805_dunning_paused: 'isDunningPaused',
      custbody_3805_last_dunning_letter_sent: 'lastSentDate',
      custbody_3805_dunning_procedure: 'dunningProcedureId',
      custbody_3805_dunning_level: 'dunningLevelId',
      custbody_3805_dunning_manager: 'dunningManager',
      subsidiary: 'subsidiary',
      class: 'classification',
      location: 'location',
      department: 'department',
      entity: 'customer'
    }
  });
};
