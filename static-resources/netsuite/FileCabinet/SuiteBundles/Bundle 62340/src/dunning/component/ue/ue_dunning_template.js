/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.template = dunning.template || {};

dunning.template.DunningTemplateUE = function DunningTemplateUE () {
  var SUBLIST_ID = 'recmachcustrecord_3805_template_parent';
  var CRM_EMAIL_CHILD_PARENT_FIELD_ID = 'custrecord_3805_dun_crm_email_temp_par';
  var PDF_CHILD_PARENT_FIELD_ID = 'custrecord_3805_template_parent_pdf';
  var EMAIL_CHILD_PARENT_FIELD_ID = 'custrecord_3805_template_parent_email';
  var CHILD_RECORD_TYPE = 'customrecord_3805_dunning_template_doc';
  var CRM_TEMPLATE_RECORD_TYPE = 'customrecord_3805_dun_crm_email_template';
  var CRM_SUBLIST_ID = 'recmachcustrecord_3805_dun_crm_email_temp_par';

  var DISABLED = 'disabled';
  var XML_TEMPLATE_FIELDS = [
    'custrecord_3805_template_language',
    'custrecord_3805_template_subject',
    'custrecord_3805_header_doc',
    'custrecord_3805_body_doc',
    'custrecord_3805_footer_doc',
    'custrecord_3805_template_default'];

  var MESSAGE_ACCESS_ERROR = 'l10n.deleteAccessForDDandAccountant';
  var messages;

  function loadMessageObjects () {
    if (!messages) {
      var stringCodes = [MESSAGE_ACCESS_ERROR];

      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.ServerSideMessageLoader(messageLoaderContext);
      messages = messageLoader.getMessageMap();
    }
  }

  function removeChildRecords (setting) {
    var childRemover = new suite_l10n.app.ChildRecordRemover(setting);
    childRemover.removeChildren();
  }

  function removeCRMTemplates () {
    var setting = new suite_l10n.view.ChildRemoverSetting();
    setting.childRecordType = CRM_TEMPLATE_RECORD_TYPE;
    setting.parentFieldId = CRM_EMAIL_CHILD_PARENT_FIELD_ID;
    setting.subListId = CRM_SUBLIST_ID;
    setting.record = ns_wrapper.api.record.getNewRecord();
    removeChildRecords(setting);
  }

  function removeTemplateDocs (relationshipId) {
    var setting = new suite_l10n.view.ChildRemoverSetting();
    setting.childRecordType = CHILD_RECORD_TYPE;
    setting.parentFieldId = relationshipId;
    setting.subListId = SUBLIST_ID;
    setting.record = ns_wrapper.api.record.getNewRecord();

    removeChildRecords(setting);
  }

  this.beforeSubmit = function beforeSubmit (type) {
    if (type == 'delete') {
      var dunningRoleAssessor = new dunning.app.DunningRoleAssessor();
      if (!dunningRoleAssessor.isDunningDirector()) {
        loadMessageObjects();
        throw nlapiCreateError('DUNNING_DELETE_PERMISSION_FOR_ADMIN_DD_ACCOUNTANT_ONLY', messages[MESSAGE_ACCESS_ERROR]);
      }
      removeCRMTemplates();
      removeTemplateDocs(EMAIL_CHILD_PARENT_FIELD_ID);
      removeTemplateDocs(PDF_CHILD_PARENT_FIELD_ID);
    }
  };

  this.beforeLoad = function beforeLoad (type) {
    disableEmailXMLSubList();
  };

  function disableEmailXMLSubList () {
    var field;
    var sublistName = 'recmach' + EMAIL_CHILD_PARENT_FIELD_ID;
    for (var i = 0; i < XML_TEMPLATE_FIELDS.length; i++) {
      field = ns_wrapper.api.sublist.getLineItemField(sublistName, XML_TEMPLATE_FIELDS[i]);
      if (field) {
        field.setDisplayType(DISABLED);
        field.setMandatory(false);
      }
    }
  }
};

dunning.template.ue = new dunning.template.DunningTemplateUE();
