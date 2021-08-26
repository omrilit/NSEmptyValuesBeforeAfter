/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.wf = dunning.component.wf || {};

dunning.component.wf.DunningConfigurationRemover = function DunningConfigurationRemover () {
  var CONFIG_RECORD = 'customrecord_3805_dunning_config';
  var SUBSIDIARY_FIELD = 'custrecord_3805_config_subsidiary';

  function deleteConfig () {
    var Search = ns_wrapper.Search;

    var subsidiaryId = ns_wrapper.api.record.getRecordId();
    var search = new Search(CONFIG_RECORD);
    search.addFilter(SUBSIDIARY_FIELD, 'is', subsidiaryId);

    var subsIterator = search.getIterator();

    if (subsIterator.hasNext()) {
      var r = subsIterator.next();
      deleteConfigurationRecord(r.getId());
    }
  }

  function deleteConfigurationRecord (id) {
    ns_wrapper.api.record.deleteRecord(CONFIG_RECORD, id);
  }

  return {
    deleteConfig: deleteConfig
  };
};

dunning.component.wf.deleteDunningConfig = function deleteDunningConfig () {
  var configUpdate = new dunning.component.wf.DunningConfigurationRemover();
  configUpdate.deleteConfig();
};
