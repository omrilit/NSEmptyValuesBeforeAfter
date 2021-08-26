/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueSubListDefinition = function DunningQueueSubListDefinition (translator, definition) {
  var context = ns_wrapper.context();

  var obj = {
    'name': 'custpage_3805_dunning_queue',
    'type': 'list',
    'label': definition.title,
    'add_mark_all': true,
    'show_results': true,
    'converterClass': 'dunning.app.DunningQueueSubListRowConverter',
    'translator': translator,
    getSearch: getSearch,

    lineItemSearch: getSearch()
  };

  function getSearch () {
    var search = new suite_l10n.view.Search();
    search.type = 'customrecord_3805_dunning_eval_result';
    search.id = definition.savedSearch;
    applyFilters(search);

    var searchBuilder = new suite_l10n.app.SearchBuilder(search);
    return searchBuilder.buildSearch();
  }

  function applyFilters (search) {
    var queueFilters = definition.queueFilters;
    var queueFiltersLength = queueFilters.length;

    if (queueFiltersLength > 0) {
      for (var i = 0; i < queueFiltersLength; i++) {
        var queueFilter = queueFilters[i];
        search.filters.push(queueFilter);
      }
    }

    var hasDunningAccess = hasDunningRoleAccess();
    if (!hasDunningAccess) {
      var filter = getDunningProcedureManagerFilter();
      search.filters.push(filter);
    }

    nlapiLogExecution('ERROR', 'queueFilters', JSON.stringify(queueFilters));
  }

  function getDunningProcedureManagerFilter () {
    /* Dunning Manager is me */
    var filter = {};
    filter.name = 'custrecord_3805_eval_result_manager_id';
    filter.join = null;
    filter.operator = 'is';
    filter.value = context.getUser();

    return filter;
  }

  function hasDunningRoleAccess () {
    /* User : Role is any of Administrator, Dunning Director, Accountant
     * or
     * User : Custom Role: Dunning Role field is Dunning Director */

    var roleId = context.getRoleId();
    var hasUserAccess = false;
    var ADMINISTRATOR = 'administrator';
    var DUNNING_DIRECTOR = 'customrole_3805_dunning_director';
    var ACCOUNTANT = 'accountant';
    var DUNNING_ROLE_FLAG_DIRECTOR = '1';

    if (roleId == ADMINISTRATOR || roleId == DUNNING_DIRECTOR || roleId == ACCOUNTANT) {
      /* for ADMINISTRATOR, bundle defined DUNNIG_DIRECTOR and DUNNIG_MANAGER roles */
      hasUserAccess = true;
    } else {
      /* for custom roles with Dunning Director */
      var dunningRoleFlag = definition.dunningRole;
      if (dunningRoleFlag == DUNNING_ROLE_FLAG_DIRECTOR) {
        hasUserAccess = true;
      }
    }

    return hasUserAccess;
  }

  function init () {
    obj.fields = [{
      'name': 'dunning_mark',
      'type': 'checkbox',
      'label': translator.getString('dqf.sublist.common.mark')
    }, {
      'name': 'id',
      'type': 'text',
      'label': translator.getString('dqf.sublist.common.id'),
      'displayType': 'hidden'
    }, {
      'name': 'view_link',
      'type': 'url',
      'label': translator.getString('dqf.sublist.common.view'),
      'displayType': 'normal',
      'linkText': translator.getString('dqf.sublist.common.view')
    }, {
      'name': 'customer',
      'type': 'text',
      'label': translator.getString('dqf.sublist.common.customer')
    }, {
      'name': 'related_entity',

      'type': 'text',

      'label': translator.getString('dqf.sublist.common.related_entity')

    }, {

      'name': 'dunning_level',

      'type': 'text',

      'label': translator.getString('dqf.sublist.common.dunning_level'),

      'displayType': 'inline'

    }, {

      'name': 'dunning_procedure',

      'type': 'text',

      'label': translator.getString('dqf.sublist.common.dunning_procedure')

    }, {
      'name': 'applies_to',
      'type': 'text',
      'label': translator.getString('dqf.sublist.dp.applies_to'),
      'displayType': 'inline'
    }, {
      'name': 'to_email',
      'type': 'text',
      'label': translator.getString('dqf.sublist.record.dunning_allow_email'),
      'displayType': 'inline'
    }, {
      'name': 'to_print',
      'type': 'text',
      'label': translator.getString('dqf.sublist.record.dunning_allow_print'),
      'displayType': 'inline'
    }, {

      'name': 'last_letter_sent',

      'type': 'text',

      'label': translator.getString('dqf.sublist.record.last_letter_sent')

    }, {
      'name': 'evaluation_date',
      'type': 'text',
      'label': translator.getString('dqf.sublist.common.evaluation_date'),
      'displayType': 'inline'
    }];
  }

  init();
  return obj;
};
