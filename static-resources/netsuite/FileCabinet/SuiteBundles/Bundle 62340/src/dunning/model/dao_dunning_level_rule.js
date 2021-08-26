/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dao = dao || {};

dao.DunningLevelRuleDAO = function DunningLevelRuleDAO () {
  var RECORD_TYPE = 'customrecord_3805_dunning_eval_rule';

  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);
  var FIELD_MAP = {
    'id': 'internalid'
  };

  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(dunning.model.DunningLevelRule);

  return obj;
};
