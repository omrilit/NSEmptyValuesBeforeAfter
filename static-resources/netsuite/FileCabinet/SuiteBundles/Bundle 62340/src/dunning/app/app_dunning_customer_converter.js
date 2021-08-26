/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @constructor
 * @extends {suite_l10n.app.BaseConverter<dunning.model.DunningCustomer, dunning.view.DunningCustomer>}
 */
dunning.app.DunningCustomerConverter = function () {
  return new suite_l10n.app.BaseConverter({
    model: dunning.model.DunningCustomer,
    view: dunning.view.DunningCustomer,
    modelViewMap: {
      id: 'id',
      language: 'language',
      sendByEmail: 'sendByEmail',
      sendByPrint: 'sendByPrint',
      isDunningPaused: 'isDunningPaused',
      lastSentDate: 'lastSentDate',
      dunningLevelId: 'dunningLevelId',
      dunningManager: 'dunningManager',
      email: 'email',
      source: 'source',
      recordType: 'recordType',
      dunningProcedureId: 'dunningProcedureId',
      subsidiary: 'subsidiary'
    },
    recordModelMap: {
      internalid: 'id',
      language: 'language',
      custentity_3805_dunning_letters_toemail: 'sendByEmail',
      custentity_3805_dunning_letters_toprint: 'sendByPrint',
      custentity_3805_dunning_paused: 'isDunningPaused',
      custentity_3805_last_dunning_letter_sent: 'lastSentDate',
      custentity_3805_dunning_procedure: 'dunningProcedureId',
      custentity_3805_dunning_level: 'dunningLevelId',
      custentity_3805_dunning_manager: 'dunningManager',
      email: 'email',
      subsidiary: 'subsidiary'
    }
  });
};
