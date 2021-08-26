/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningLevelStatementGenerator = function DunningLevelStatementGenerator () {
  var DurationStatementGenerator = dunning.app.DurationStatementGenerator;
  var AmountStatementGenerator = dunning.app.AmountStatementGenerator;

  this.generateStatement = function generateStatement (input) {
    var conditionGenerators = [new DurationStatementGenerator(), new AmountStatementGenerator()];

    var statement = [];
    for (var i = 0; i < conditionGenerators.length; i++) {
      var condition = conditionGenerators[i].generateStatement(input);
      if (condition) {
        statement.push(condition);
      }
    }

    return 'when ' + statement.join(' and ');
  };
};
