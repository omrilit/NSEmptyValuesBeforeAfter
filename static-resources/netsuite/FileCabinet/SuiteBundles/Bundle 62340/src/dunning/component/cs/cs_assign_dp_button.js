/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.cs = dunning.component.cs || {};

var dunningcs = dunning.component.cs;

dunningcs.assignDunningProcedure = function assignDunningProcedure () {
  var customerManager = new dunning.app.CustomerManager();
  customerManager.assignDunningProcedure();
};
