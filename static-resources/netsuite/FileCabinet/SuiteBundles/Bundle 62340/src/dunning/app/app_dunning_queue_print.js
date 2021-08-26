/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueuePrint = function DunningQueuePrint () {
  this.performAction = function (dunningQueueActionInput) {
    var derIdList = dunningQueueActionInput.derIdList;
    var pdfResultPaths = [];
    var dunningPDFManager = new dunning.app.DunningPDFManager();

    for (var i = 0; i < derIdList.length; i++) {
      var derId = derIdList[i];

      var path = dunningPDFManager.generatePDFFiles(derId);
      pdfResultPaths.push(path);
    }

    dunningPDFManager.notifyUser(pdfResultPaths, -5);
  };
};
