/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.ss = dunning.component.cs || {};

dunning.component.ss.DunningScheduledEvalStatementGenerator = function DunningScheduledEvalStatementGenerator (type) {
  var PROCEDURE_LIST_PARAM = 'custscript_3805_ss_eval_gen_proc';
  var RULE_LIST_PARAM = 'custscript_3805_ss_eval_gen_rules';
  var DUNNING_LEVEL_RULE = 'customrecord_3805_dunning_eval_rule';
  var DUNNING_LEVEL_RULE_DAYS_OVERDUE = 'custrecord_3805_der_days_overdue';
  var DUNNING_LEVEL = 'customrecord_3805_dunning_level';
  var DUNNING_LEVEL_DAYS_OVERDUE = 'custrecord_3805_dl_days';

  this.generateStatements = function generateStatements () {
    var context = ns_wrapper.context();
    var procedureList = (context.getScriptSetting(PROCEDURE_LIST_PARAM) || '').split(',');

    if (procedureList.length > 0) {
      var evalStatementManager = new dunning.app.DunningEvalStatementManager();
      evalStatementManager.updateEvaluationStatementRecords(procedureList);
    }

    nlapiLogExecution('DEBUG', 'usage after generating', context.getRemainingUsage());
  };

  this.updateDunningLevels = function updateDunningLevels () {
    var context = ns_wrapper.context();
    var ruleList = (context.getSetting('SCRIPT', RULE_LIST_PARAM) || '').split(',');

    ruleList.forEach(function (rule) {
      var daysOverdue = nlapiLookupField(DUNNING_LEVEL_RULE, rule, DUNNING_LEVEL_RULE_DAYS_OVERDUE);

      if (daysOverdue) {
        var dlDAO = new dao.DunningLevelDAO();
        var levels = dlDAO.retrieveByRuleId(rule);
        levels.forEach(function (level) {
          nlapiSubmitField(DUNNING_LEVEL, level.id, DUNNING_LEVEL_DAYS_OVERDUE, daysOverdue);
        });
      }
    });
  };
};

/**
 * @param {string} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 */
dunning.component.ss.createEvalStmt = function createEvalStmt (type) {
  var statementGenerator = new dunning.component.ss.DunningScheduledEvalStatementGenerator(type);
  statementGenerator.updateDunningLevels();
  statementGenerator.generateStatements();
};
