/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.pt = dunning.component.pt || {};

dunning.component.pt.DunningQueuePortlet = function DunningQueuePortlet (pPortlet) {
  var portlet = new ns_wrapper.Portlet(pPortlet);
  var CUSTOMER = 'custrecord_3805_evaluation_result_cust';
  var SOURCE_TYPE = 'custrecord_3805_eval_result_source_type';
  var DUNNING_PROCEDURE = 'custrecord_3805_evaluation_result_dp';
  var DUNNING_PROCEDURE_LEVEL = 'custrecord_3805_evaluation_result_level';
  var LAST_LETTER_SENT = 'custentity_3805_last_dunning_letter_sent';
  var TO_EMAIL = 'custentity_3805_dunning_letters_toemail';
  var TO_PRINT = 'custentity_3805_dunning_letters_toprint';
  var SEND = 'pt_dpq_send';
  var REMOVE = 'pt_dpq_remove';
  var DUNNING_QUEUE_TITLE = 'dq.pt.dunningQueueTitle';
  var COLUMN_SOURCE = 'dq.pt.source';
  var COLUMN_DUNNING_PROC = 'dq.pt.dunningProcedure';
  var COLUMN_DUNNING_LEVEL = 'dq.pt.dunningLevel';
  var COLUMN_LAST_SENT = 'dq.pt.lastLetterSent';
  var COLUMN_TO_EMAIL = 'dq.pt.emailingAllowed';
  var COLUMN_TO_PRINT = 'dq.pt.printingAllowed';
  var COLUMN_SEND = 'dq.pt.send';
  var COLUMN_REMOVE = 'dq.pt.remove';
  var COLUMN_CUSTOMER = 'dq.pt.customer';

  var messages = {};
  this.run = function () {
    // TODO Move all of this to Dunning Queue Portlet Generator after POC is approved. Or something like that.
    loadMessages();
    portlet.setTitle(messages[DUNNING_QUEUE_TITLE]);
    var search = new suite_l10n.view.Search();
    search.type = 'customrecord_3805_dunning_eval_result';
    search.id = 'customsearch_3805_dunning_queue';
    var searchBuilder = new suite_l10n.app.SearchBuilder(search);

    var builtSearch = searchBuilder.buildSearch();
    var iterator = builtSearch.getIterator();

    if (iterator) {
      portlet.addColumn(SOURCE_TYPE, 'text', messages[COLUMN_SOURCE], 'LEFT');
      portlet.addColumn(DUNNING_PROCEDURE, 'text', messages[COLUMN_DUNNING_PROC], 'LEFT');
      portlet.addColumn(DUNNING_PROCEDURE_LEVEL, 'text', messages[COLUMN_DUNNING_LEVEL], 'LEFT');
      portlet.addColumn(LAST_LETTER_SENT, 'text', messages[COLUMN_LAST_SENT], 'LEFT');
      portlet.addColumn(TO_EMAIL, 'text', messages[COLUMN_TO_EMAIL], 'LEFT');
      portlet.addColumn(TO_PRINT, 'text', messages[COLUMN_TO_PRINT], 'LEFT');

      var sendColumn = portlet.addColumn(SEND, 'text', messages[COLUMN_SEND], 'LEFT');
      sendColumn.setURL('http://google.com');
      sendColumn.addParamToURL('sendId', 'custrecord_3805_evaluation_result_cust', true);

      var removeColumn = portlet.addColumn(REMOVE, 'text', messages[COLUMN_REMOVE], 'LEFT');
      removeColumn.setURL('http://google.com');
      removeColumn.addParamToURL('removeId', 'custrecord_3805_evaluation_result_cust', true);

      while (iterator.hasNext()) {
        portlet.addRow(prepareRow(iterator.next()));
      }
    }
  };

  function prepareRow (row) {
    var objRow = {};

    var customerCol = portlet.addColumn(CUSTOMER, 'text', messages[COLUMN_CUSTOMER], 'LEFT');

    objRow[CUSTOMER] = row.getText(CUSTOMER);
    customerCol.setURL(nlapiResolveURL('RECORD', 'customer') + '&id=' + row.getValue(CUSTOMER));
    objRow[SOURCE_TYPE] = row.getValue(SOURCE_TYPE);
    objRow[DUNNING_PROCEDURE] = row.getText(DUNNING_PROCEDURE);
    objRow[DUNNING_PROCEDURE_LEVEL] = row.getText(DUNNING_PROCEDURE_LEVEL);
    objRow[LAST_LETTER_SENT] = row.getValue(LAST_LETTER_SENT, CUSTOMER);
    objRow[TO_EMAIL] = tfHandler(row.getValue(TO_EMAIL, CUSTOMER));
    objRow[TO_PRINT] = tfHandler(row.getValue(TO_PRINT, CUSTOMER));
    objRow[SEND] = 'Send';
    objRow[REMOVE] = 'Remove';

    return objRow;
  }

  function tfHandler (value) {
    switch (value) {
      case 'T' :
        return 'Yes';
      case 'F' :
      default :
        return 'No';
    }
  }

  function loadMessages () {
    if (!messages) {
      var stringCodes = [COLUMN_SOURCE,
        COLUMN_DUNNING_PROC,
        COLUMN_DUNNING_LEVEL,
        COLUMN_LAST_SENT,
        COLUMN_TO_EMAIL,
        COLUMN_TO_PRINT,
        COLUMN_SEND,
        COLUMN_REMOVE,
        COLUMN_CUSTOMER];

      var messageLoaderContext = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext.getLoaderContext(stringCodes));

      messages = messageLoader.getMessageMap();
    }
  }
};

function runPortlet (portlet, column) { // eslint-disable-line no-unused-vars
  var dunningQueuePortlet = new dunning.component.pt.DunningQueuePortlet(portlet);
  dunningQueuePortlet.run();
}
