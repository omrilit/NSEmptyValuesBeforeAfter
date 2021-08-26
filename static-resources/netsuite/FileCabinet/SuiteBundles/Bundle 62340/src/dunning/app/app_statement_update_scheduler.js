/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.StatementUpdaterScheduler = function StatementUpdaterScheduler () {
  this.getAffectedProcedures = function getAffectedProcedures (ruleList) {
    var dlDAO = new dao.DunningLevelDAO();

    var levels = dlDAO.retrieveByRuleId(ruleList);
    var procedures = [];
    for (var i = 0; i < levels.length; i++) {
      var procedure = levels[i].procedureID;
      if (procedures.indexOf(procedure) === -1) {
        procedures.push(procedure);
      }
    }
    return procedures;
  };

  var PROCEDURE_LIST_PARAM = 'custscript_3805_ss_eval_gen_proc';
  var RULE_LIST_PARAM = 'custscript_3805_ss_eval_gen_rules';
  var UPDATE_STATEMENT_SCRIPT = 'customscript_3805_ss_eval_stmt_gen';
  var UPDATE_STATEMENT_DEPLOYMENT = 'customdeploy_3805_ss_eval_stmt_gen';

  function scheduleScript (procedureList, ruleList) {
    if (procedureList.length > 0) {
      var scheduler = new ns_wrapper.Scheduler();
      var params = {};
      params[PROCEDURE_LIST_PARAM] = procedureList.join(',');
      params[RULE_LIST_PARAM] = ruleList.join(',');
      scheduler.scheduleScript(UPDATE_STATEMENT_SCRIPT, UPDATE_STATEMENT_DEPLOYMENT, params);
    }
  }

  this.scheduleUpdaterByRules = function scheduleUpdaterByRules (ruleList) {
    scheduleScript(this.getAffectedProcedures(ruleList), ruleList);
  };

  this.scheduleUpdaterByProcedures = function scheduleUpdaterByProcedures (procList) {
    scheduleScript(procList);
  };
};
