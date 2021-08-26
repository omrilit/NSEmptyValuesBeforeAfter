/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  'N/https',
  'N/search',
  'N/runtime',
  'N/url',
  '../../common/di',
  '../../common/utils',
  '../../queue/search/rules',
  '../../common/search_util',
  '../EvaluationResult',
  '../../../constants'
],
function (nHttps, N_search, nRuntime, nUrl, di, utils, rules, search_util, EvaluationResult, C) {
  'use strict';

  return {

    /**
     * @param {InternalId[]} internalIds
     * @param {InternalId} letterTypeId
     * @returns {Array.<EvaluationResult>}
     */
    queued: function (internalIds, letterTypeId) {
      const search = N_search.create({
        type: C.TYPE.EVALUATION_RESULT,
        filters: [
          N_search.createFilter({
            name: 'internalid',
            operator: N_search.Operator.ANYOF,
            values: internalIds
          }),
          N_search.createFilter({
            name: C.FIELD.EVALUATION_RESULT.TYPE,
            operator: N_search.Operator.IS,
            values: letterTypeId
          }),
          N_search.createFilter({
            name: C.FIELD.EVALUATION_RESULT.STATUS,
            operator: N_search.Operator.IS,
            values: di.variables().EVALUATION_RESULT_STATUS.QUEUED
          })
        ]
      });

      return search_util.fetchAll(search, function (result) {
        return new EvaluationResult(result.id, letterTypeId);
      });
    },

    /**
     * @param {string} key
     * @param {*} values
     * @returns {Object|null}
     * @private
     */
    prepareFilter: function (key, values) {
      const PARAM = C.QUEUE_MODULE.FILTER_PARAM;
      const FIELD = C.FIELD.EVALUATION_RESULT;

      switch (key) {
        case PARAM.CUSTOMER:
          return {
            name: FIELD.CUSTOMER,
            operator: N_search.Operator.IS,
            values: values
          };
        case PARAM.SUBSIDIARY:
          return {
            name: 'subsidiary',
            join: FIELD.CUSTOMER,
            operator: N_search.Operator.IS,
            values: values
          };
        case PARAM.PROCEDURE:
          return {
            name: 'custrecord_3805_evaluation_result_dp',
            operator: N_search.Operator.IS,
            values: values
          };
        case PARAM.LEVEL:
          return {
            name: 'custrecord_3805_dl_rule',
            join: FIELD.LEVEL,
            operator: N_search.Operator.ANYOF,
            values: rules.getRuleIdsByName(values)
          };
        case PARAM.TARGET:
          return {
            name: 'custrecord_3805_dp_type',
            join: FIELD.PROCEDURE,
            operator: N_search.Operator.IS,
            values: values
          };
        case PARAM.LETTER_START:
          return {
            name: 'custentity_3805_last_dunning_letter_sent',
            join: FIELD.CUSTOMER,
            operator: N_search.Operator.ONORAFTER,
            values: values
          };
        case PARAM.LETTER_END:
          return {
            name: 'custentity_3805_last_dunning_letter_sent',
            join: FIELD.CUSTOMER,
            operator: N_search.Operator.ONORBEFORE,
            values: values
          };
        case PARAM.EVALUATION_START:
          return {
            name: FIELD.CREATED,
            operator: N_search.Operator.ONORAFTER,
            values: values
          };
        case PARAM.EVALUATION_END:
          return {
            name: FIELD.CREATED,
            operator: N_search.Operator.ONORBEFORE,
            values: values
          };
      }

      return null;
    },

    /**
     * @param {module:N/search.Search} search
     * @param {Object} params
     * @param {number} pageSize
     * @param {number[]} except
     * @returns {SearchPagedData}
     * @private
     */
    _fetchQueue: function (search, params, pageSize, except) {
      const keys = utils.objectValues(C.QUEUE_MODULE.FILTER_PARAM);
      const data = utils.filterParameters(params, keys);
      const filters = Object.keys(data)
        .map(function (key) { return this.prepareFilter(key, params[key]); }, this)
        .filter(function (filter) { return filter !== null; })
        .map(N_search.createFilter);

      search.filters = search.filters.concat(filters);

      if (Array.isArray(except) && except.length > 0) {
        search.filters.push(N_search.createFilter({
          name: C.FIELD.EVALUATION_RESULT.ID,
          operator: N_search.Operator.NONEOF,
          values: except
        }));
      }

      return search.runPaged({pageSize: pageSize});
    },

    /**
     * @param {Object} params
     * @param {number} pageSize
     * @param {number[]} except
     * @returns {SearchPagedData}
     */
    emailQueue: function (params, pageSize, except) {
      const search = N_search.load({id: C.QUEUE_MODULE.SEARCH.EMAIL});

      if (!this.dunningDirectorPermissions()) {

        search.filters.push(N_search.createFilter({
          name: "custrecord_3805_eval_result_manager_id",
          operator: "anyof",
          values: "@CURRENT@"
        }));
      }

      return this._fetchQueue(search, params, pageSize, except);
    },

    /**
     * @param {Object} params
     * @param {number} pageSize
     * @param {number[]} except
     * @returns {SearchPagedData}
     */
    pdfQueue: function (params, pageSize, except) {
      const search = N_search.load({id: C.QUEUE_MODULE.SEARCH.PDF});

      if (!this.dunningDirectorPermissions()) {
        search.filters.push(N_search.createFilter({
          name: "custrecord_3805_eval_result_manager_id",
          operator: "anyof",
          values: "@CURRENT@"
        }));

      }

      return this._fetchQueue(search, params, pageSize, except);
    },

    dunningDirectorPermissions: function () {

      var userRole = nRuntime.getCurrentUser().roleId;
      var userId = nRuntime.getCurrentUser().id;

      if (userRole == 'customrole_3805_dunning_director' || userRole == 'administrator' || userRole == 'accountant') {
        return true;
      }

      const url = nUrl.resolveScript({
        deploymentId: "customdeploy_3805_search_emp_dun_role_su",
        params: {
          userId: userId,
          currentRole: userRole
        },
        scriptId: "customscript_3805_search_emp_dun_role_su",
        returnExternalUrl: true
      });

      const response = nHttps.get({url: url});
      const dunningRole = Number(response.body);

      return dunningRole == 1;
    }
  };
});
