/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

/**
 * @returns {Void} Any or no return value
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.wf = dunning.component.wf || {};

dunning.component.wf.DunningConfigurationUpdater = function DunningConfigurationUpdater () {
  var INACTIVE_FIELD = 'isinactive';
  var CONFIG_RECORD = 'customrecord_3805_dunning_config';
  var SUBSIDIARY_FIELD = 'custrecord_3805_config_subsidiary';

  var obj = {
    update: update
  };

  function update () {
    var Search = ns_wrapper.Search;

    var subsidiaryId = ns_wrapper.api.record.getRecordId();
    var inactiveFlag = ns_wrapper.api.field.getFieldValue(INACTIVE_FIELD);

    var search = new Search(CONFIG_RECORD);
    search.addFilter(SUBSIDIARY_FIELD, 'is', subsidiaryId);

    var subsIterator = search.getIterator();

    if (subsIterator.hasNext()) {
      var r = subsIterator.next();
      updateConfigurationRecord(r.getId(), inactiveFlag);
    } else {
      createConfigurationRecord(subsidiaryId);
    }
  }

  function updateConfigurationRecord (id, isinactive) {
    // update configuration record
    ns_wrapper.api.field.submitField(CONFIG_RECORD, id, INACTIVE_FIELD, isinactive);
  }

  function createConfigurationRecord (subsidiaryId) {
    var model = new dunning.model.DunningConfiguration();
    var dcDAO = new dao.DunningConfigurationDAO();

    model.subsidiary = subsidiaryId;

    dcDAO.create(model);
  }

  return obj;
};

dunning.component.wf.updateDunningConfig = function updateDunningConfig () {
  var configUpdate = new dunning.component.wf.DunningConfigurationUpdater();
  configUpdate.update();
};
