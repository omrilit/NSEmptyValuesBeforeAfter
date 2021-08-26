/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.view = dunning.view || {};

dunning.view._L10N_VAR_VL_CUSTOMER = 'customer';
dunning.view._L10N_VAR_VL_INVOICE = 'invoice';
dunning.view._L10N_VAR_VL_AUTOMATIC = 'automatic';
dunning.view._L10N_VAR_VL_MANUAL = 'manual';

dunning.view._APPLIES_TO_TYPE = 'dunning_source';
dunning.view._SENDING_SCHEDULE_TYPE = 'sending_schedule';

dunning.view._APPLIES_TO = 'custrecord_3805_dp_type';
dunning.view._SUBSIDIARIES = 'custrecord_3805_dp_sub';
dunning.view._CLASSES = 'custrecord_3805_dp_classes';
dunning.view._DEPARTMENTS = 'custrecord_3805_dp_dept';
dunning.view._LOCATIONS = 'custrecord_3805_dp_locations';
dunning.view._OVERRIDE = 'custrecord_3805_dp_override';
dunning.view._SAVED_SEARCH_CUSTOMER = 'custrecord_3805_dp_cust_search';
dunning.view._SAVED_SEARCH_INVOICE = 'custrecord_3805_dp_invoice_search';
dunning.view._SENDING_TYPE = 'custrecord_3805_dp_sending_type';
dunning.view._EVAL_TIME = 'custrecord_3805_dp_eval_time';
dunning.view._TIMEZONE = 'custrecord_3805_dp_timezone';
dunning.view._MIN_DUN_INTERVAL = 'custrecord_3805_dp_days_between';

dunning.view._CUSTOMER_ID = undefined;
dunning.view._INVOICE_ID = undefined;
dunning.view._MANUAL_ID = undefined;
dunning.view._AUTOMATIC_ID = undefined;

dunning.view._FIELD_SETS = {
  APPLIES_TO: {
    CUSTOMER: {
      enabled: [dunning.view._SAVED_SEARCH_CUSTOMER,
        dunning.view._OVERRIDE],
      disabled: [dunning.view._CLASSES,
        dunning.view._DEPARTMENTS,
        dunning.view._LOCATIONS,
        dunning.view._SAVED_SEARCH_INVOICE]
    },
    INVOICE: {
      enabled: [dunning.view._CLASSES,
        dunning.view._DEPARTMENTS,
        dunning.view._LOCATIONS,
        dunning.view._SAVED_SEARCH_INVOICE],
      disabled: [dunning.view._SAVED_SEARCH_CUSTOMER,
        dunning.view._OVERRIDE]
    },
    BLANK: {
      enabled: [],
      disabled: [dunning.view._CLASSES,
        dunning.view._DEPARTMENTS,
        dunning.view._LOCATIONS,
        dunning.view._SAVED_SEARCH_INVOICE,
        dunning.view._SAVED_SEARCH_CUSTOMER,
        dunning.view._OVERRIDE]
    }
  },
  SENDING_SCHED: {
    AUTOMATIC: {
      enabled: [dunning.view._EVAL_TIME,
        dunning.view._TIMEZONE],
      disabled: []
    },
    MANUAL: {
      enabled: [],
      disabled: [dunning.view._EVAL_TIME,
        dunning.view._TIMEZONE]
    },
    BLANK: {
      enabled: [],
      disabled: [dunning.view._EVAL_TIME,
        dunning.view._TIMEZONE]
    }
  },
  DISABLE_MINIMUM_DUNNING_INTERVAL: {
    TRUE: {
      enabled: [],
      disabled: [dunning.view._MIN_DUN_INTERVAL]
    },
    FALSE: {
      enabled: [dunning.view._MIN_DUN_INTERVAL],
      disabled: []
    }
  }
};

dunning.view.DunningProcedureFieldToggler = function DunningProcedureFieldToggler () {
  var fieldToggler = new suite_l10n.field.FieldToggler();

  /** ** Based on "applies to" ****/
  this.toggleFieldsByAppliesTo = function toggleFieldsByAppliesTo (selectedId) {
    _loadDunningProcVarIds();

    switch (selectedId) {
      // Toggle (enable/disable) the fields when the selected "applies to" is a customer
      case dunning.view._CUSTOMER_ID :
        fieldToggler.disableFields(dunning.view._FIELD_SETS.APPLIES_TO.CUSTOMER);
        fieldToggler.enableFields(dunning.view._FIELD_SETS.APPLIES_TO.CUSTOMER);
        break;

      // Toggle (enable/disable) the fields when the selected "applies to" is an invoice
      case dunning.view._INVOICE_ID :
        fieldToggler.disableFields(dunning.view._FIELD_SETS.APPLIES_TO.INVOICE);
        fieldToggler.enableFields(dunning.view._FIELD_SETS.APPLIES_TO.INVOICE);
        break;

      // Disable the fields when there is no selected "applies to"
      default :
        fieldToggler.disableFields(dunning.view._FIELD_SETS.APPLIES_TO.BLANK);
        break;
    }
  };

  /** ** Based on sending type ****/
  this.toggleFieldsBySendingSched = function toggleFieldsBySendingSched (selectedId) {
    _loadDunningProcVarIds();

    switch (selectedId) {
      // Toggle (enable/disable) the fields when the selected sending schedule is manual
      case dunning.view._MANUAL_ID :
        fieldToggler.disableFields(dunning.view._FIELD_SETS.SENDING_SCHED.MANUAL);
        break;

      // Toggle (enable/disable) the fields when the selected sending schedule is automatic
      case dunning.view._AUTOMATIC_ID :
        fieldToggler.enableFields(dunning.view._FIELD_SETS.SENDING_SCHED.AUTOMATIC);
        break;

      // Disable the fields when there is no selected sending schedule
      default :
        fieldToggler.disableFields(dunning.view._FIELD_SETS.SENDING_SCHED.BLANK);
        break;
    }
  };

  /** ** Based on permission to multiple sending of letters ****/
  this.toggleFieldsByDisablingMinDunInterval = function toggleFieldsByEnablingMultipleSending (disableMinDunInterval) {
    var fieldSet = dunning.view._FIELD_SETS.DISABLE_MINIMUM_DUNNING_INTERVAL;

    if (disableMinDunInterval === 'T') {
      fieldToggler.disableFields(fieldSet.TRUE);
    } else {
      fieldToggler.enableFields(fieldSet.FALSE);
    }
  };

  /**
   * Loads the localization variable ID's
   */
  function _loadDunningProcVarIds () {
    var appliesToIds;
    var sendingSchedIds;

    if (!dunning.view._CUSTOMER_ID || !dunning.view._INVOICE_ID) {
      appliesToIds = new suite_l10n.variable.LocalizationVariableList(dunning.view._APPLIES_TO_TYPE);
      dunning.view._CUSTOMER_ID = appliesToIds.getIdByValue(dunning.view._L10N_VAR_VL_CUSTOMER);
      dunning.view._INVOICE_ID = appliesToIds.getIdByValue(dunning.view._L10N_VAR_VL_INVOICE);
    }

    if (!dunning.view._MANUAL_ID || !dunning.view._AUTOMATIC_ID) {
      sendingSchedIds = new suite_l10n.variable.LocalizationVariableList(dunning.view._SENDING_SCHEDULE_TYPE);
      dunning.view._MANUAL_ID = sendingSchedIds.getIdByValue(dunning.view._L10N_VAR_VL_MANUAL);
      dunning.view._AUTOMATIC_ID = sendingSchedIds.getIdByValue(dunning.view._L10N_VAR_VL_AUTOMATIC);
    }
  }
};
