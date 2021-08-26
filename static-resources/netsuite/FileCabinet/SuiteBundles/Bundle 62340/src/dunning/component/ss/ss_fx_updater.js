/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.ss = dunning.component.ss || {};

dunning.component.ss.DunningFXUpdater = function DunningFXUpdater () {
  var REC_TYPE = 'customrecord_3805_dunning_eval_rule';
  var Search = ns_wrapper.Search;
  var Record = ns_wrapper.Record;

  this.updateFX = function updateFX () {
    var search = new Search(REC_TYPE);
    var rs = search.getIterator();

    while (rs.hasNext()) {
      var currItem = rs.next();

      var record = new Record(REC_TYPE, currItem.getId());
      record.saveRecord();
    }
  };
};

dunning.component.ss.updateFX = function updateFX () {
  var updater = new dunning.component.ss.DunningFXUpdater();
  updater.updateFX();
};
