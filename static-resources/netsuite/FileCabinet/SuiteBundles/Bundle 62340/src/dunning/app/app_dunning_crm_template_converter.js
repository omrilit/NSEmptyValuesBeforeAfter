/**
 * @license
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @constructor
 * @extends {suite_l10n.app.BaseConverter<dunning.model.DunningCRMTemplate, dunning.view.DunningCRMTemplate>}
 */
dunning.app.DunningCRMTemplateConverter = function () {
  return new suite_l10n.app.BaseConverter({
    model: dunning.model.DunningCRMTemplate,
    view: dunning.view.DunningCRMTemplate,
    modelViewMap: {
      id: 'id',
      name: 'name',
      language: 'language',
      emailTemplate: 'emailTemplate',
      default: 'default',
      dunningCRMTemplateEmailParent: 'dunningCRMTemplateEmailParent'
    },
    recordModelMap: {
      id: 'internalid',
      name: 'name',
      language: 'custrecord_3805_dun_crm_email_temp_lang',
      emailTemplate: 'custrecord_3805_dun_crm_email_temp_rec',
      default: 'custrecord_3805_dun_crm_email_default',
      dunningCRMTemplateEmailParent: 'custrecord_3805_dun_crm_email_temp_par'
    }
  });
};
