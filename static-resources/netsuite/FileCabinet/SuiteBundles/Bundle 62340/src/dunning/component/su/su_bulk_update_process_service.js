/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.su = dunning.component.su || {};

dunning.component.su.BulkUpdateProcessService = function BulkUpdateProcessService () {
  var BULK_UPDATE_RECORD = 'customrecord_dunning_bulk_batch';
  var BULK_UPDATE_STATUS_FIELD = 'custrecord_3805_bulk_update_status';
  var BULK_UPDATE_SUBSIDIARY_FIELD = 'custrecord_3805_bulk_update_sub';
  var OWNER = 'owner';

  var PENDING_STATUS = 1;
  var PROCESSING_STATUS = 2;

  this.run = function run (request, response) {
    var record;
    var subsidiary = request.getParameter('subsidiary');

    var search = new ns_wrapper.Search(BULK_UPDATE_RECORD);
    search.addColumn(OWNER);

    search.addFilter(BULK_UPDATE_STATUS_FIELD, 'anyof', [PENDING_STATUS, PROCESSING_STATUS]);
    if (subsidiary) {
      search.addFilter(BULK_UPDATE_SUBSIDIARY_FIELD, 'is', subsidiary);
    }

    var it = search.getIterator();

    if (it.hasNext()) {
      var r = it.next();
      var id = r.getId();
      var owner = r.getText(OWNER);
      var ownerId = r.getValue(OWNER);
      record = {
        'id': id,
        'owner': owner,
        'ownerId': ownerId
      };
    }
    response.write(JSON.stringify(record));
  };
};

function runSuitelet (request, response) { // eslint-disable-line no-unused-vars
  var service = new dunning.component.su.BulkUpdateProcessService();
  service.run(request, response);
}
