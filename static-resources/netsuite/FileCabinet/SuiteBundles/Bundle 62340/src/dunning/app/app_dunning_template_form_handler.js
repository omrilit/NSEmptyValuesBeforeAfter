/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningTemplateFormHandler = function DunningTemplateFormHandler () {
  var fieldToggler = new suite_l10n.field.FieldToggler();
  var handler = dunning.app.DunningTemplateFormHandler;

  var TEMPLATE_DOC_EMAIL = 'recmachcustrecord_3805_template_parent_email';
  var TEMPLATE_CRM_EMAIL = 'recmachcustrecord_3805_dun_crm_email_temp_par';

  handler.ATTACH_STMT = 'custrecord_3805_template_statement';
  handler.OVERDUE_STMT = 'custrecord_3805_template_open_only_st';
  handler.ATTACH_INV = 'custrecord_3805_template_invoice';
  handler.OVERDUE_INV = 'custrecord_3805_template_overdue_only';
  handler.DEFAULT = 'custrecord_3805_template_default';
  handler.CRM_DEFAULT = 'custrecord_3805_dun_crm_email_default';
  handler.CUSTOM_STMT_FORM = 'custrecord_3805_template_cust_form';
  handler.CUSTOM_STMT_DATE = 'custrecord_3805_statement_date';
  handler.CUSTOM_STMT_START_DATE = 'custrecord_3805_statement_start_date';

  var SublistAPI = ns_wrapper.api.sublist;

  handler.DUNNING_TEMPLATE_FIELD_SETS = {
    'ACTIVE_STATEMENT_ATTACHMENT': {
      'enabled': [handler.OVERDUE_STMT, handler.CUSTOM_STMT_FORM,
        handler.CUSTOM_STMT_DATE, handler.CUSTOM_STMT_START_DATE],
      'disabled': []
    },
    'INACTIVE_STATEMENT_ATTACHMENT': {
      'enabled': [],
      'disabled': [handler.OVERDUE_STMT, handler.CUSTOM_STMT_FORM,
        handler.CUSTOM_STMT_DATE, handler.CUSTOM_STMT_START_DATE]
    },
    'ACTIVE_INVOICE_ATTACHMENT': {
      'enabled': [handler.OVERDUE_INV],
      'disabled': []
    },
    'INACTIVE_INVOICE_ATTACHMENT': {
      'enabled': [],
      'disabled': [handler.OVERDUE_INV]
    }
  };

  function toogleFields (fieldSet) {
    fieldToggler.disableFields(fieldSet);
    fieldToggler.enableFields(fieldSet);
  }

  function configureStatementAttachment () {
    var fieldSet;

    if (ns_wrapper.api.field.getFieldValue(handler.ATTACH_STMT) == 'T') {
      fieldSet = handler.DUNNING_TEMPLATE_FIELD_SETS.ACTIVE_STATEMENT_ATTACHMENT;
    } else {
      fieldSet = handler.DUNNING_TEMPLATE_FIELD_SETS.INACTIVE_STATEMENT_ATTACHMENT;
    }

    toogleFields(fieldSet);
  }

  function configureInvoiceAttachment () {
    var fieldSet;

    if (ns_wrapper.api.field.getFieldValue(handler.ATTACH_INV) == 'T') {
      fieldSet = handler.DUNNING_TEMPLATE_FIELD_SETS.ACTIVE_INVOICE_ATTACHMENT;
    } else {
      fieldSet = handler.DUNNING_TEMPLATE_FIELD_SETS.INACTIVE_INVOICE_ATTACHMENT;
    }

    toogleFields(fieldSet);
  }

  this.engageFieldChangeEvents = function engageFieldChangeEvents (name) {
    switch (name) {
      case handler.ATTACH_STMT:
        configureStatementAttachment();
        break;
      case handler.ATTACH_INV:
        configureInvoiceAttachment();
        break;
    }
  };

  this.init = function init () {
    configureStatementAttachment();
    configureInvoiceAttachment();
  };

  this.lineInit = function lineInit (type) {
    if (SublistAPI.getLineItemCount(type) == 1) {
      var defaultField = type === TEMPLATE_CRM_EMAIL ? handler.CRM_DEFAULT : handler.DEFAULT;
      SublistAPI.setLineItemValue(type, defaultField, 1, 'T');
    }
  };

  this.clearXMLEmailSubList = function clearXMLEmailSubList (removeAll) {
    var count = SublistAPI.getLineItemCount(TEMPLATE_DOC_EMAIL);
    var allowDelete = count > 0 && removeAll;
    if (allowDelete) {
      for (var i = 1; i <= count; i++) {
        SublistAPI.removeLineItem(TEMPLATE_DOC_EMAIL, i);
      }
    }
    return allowDelete;
  };
};
