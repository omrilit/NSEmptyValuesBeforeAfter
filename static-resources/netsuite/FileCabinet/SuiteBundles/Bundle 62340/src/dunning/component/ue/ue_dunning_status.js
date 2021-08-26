/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.status = dunning.status || {};

dunning.status.DunningStatusUE = function DunningStatusUE () {
  var SUBLIST_ID = 'recmachcustrecord_3805_dunning_ss_parent';
  var CHILD_PARENT_FIELD_ID = 'custrecord_3805_dunning_ss_parent';
  var CHILD_RECORD_TYPE = 'customrecord_3805_dunning_substatus';

  function removeSubStatus () {
    var setting = new suite_l10n.view.ChildRemoverSetting();
    setting.childRecordType = CHILD_RECORD_TYPE;
    setting.parentFieldId = CHILD_PARENT_FIELD_ID;
    setting.subListId = SUBLIST_ID;
    setting.record = ns_wrapper.api.record.getNewRecord();
    setting.multipleSelect = true;

    var childRemover = new suite_l10n.app.ChildRecordRemover(setting);
    childRemover.removeChildren();
  }

  this.beforeSubmit = function beforeSubmit (type) {
    if (type == 'delete') {
      removeSubStatus();
    }
  };
};

dunning.status.ue = new dunning.status.DunningStatusUE();
