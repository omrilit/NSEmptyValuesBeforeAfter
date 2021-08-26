/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType BundleInstallationScript
 * @NModuleScope Public
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "N/log", "N/query", "N/record", "N/runtime", "N/search", "N/task"], function (_exports, _log, nQuery, nRecord, nRuntime, nSearch, nTask) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.afterUpdate = _exports.afterInstall = void 0;
  nQuery = _interopRequireWildcard(nQuery);
  nRecord = _interopRequireWildcard(nRecord);
  nRuntime = _interopRequireWildcard(nRuntime);
  nSearch = _interopRequireWildcard(nSearch);
  nTask = _interopRequireWildcard(nTask);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  function isMultiBookEnabled() {
    return nRuntime.isFeatureInEffect({
      feature: "multibook"
    }) || nRuntime.isFeatureInEffect({
      feature: "fullmultibook"
    });
  }

  function getGLMSearches() {
    var allGLMsearches = {};

    try {
      nSearch.create({
        columns: [nSearch.createColumn({
          label: "Internal ID",
          name: "internalid"
        }), nSearch.createColumn({
          label: "ID",
          name: "id"
        }), nSearch.createColumn({
          label: "Title",
          name: "title"
        })],
        filters: [["id", "is", "customsearch_glm_sublist_multibook_on"], "OR", ["id", "is", "customsearch_glm_sublist_multibook_off"], "OR", ["id", "is", "customsearch_glm_report_multibook_off"], "OR", ["id", "is", "customsearch_glm_report_multibook_on"]],
        type: nSearch.Type.SAVED_SEARCH
      }).run().each(function (search) {
        var values = search.getAllValues();
        allGLMsearches["" + values.id] = {
          internalID: values.internalid[0].value,
          title: values.title
        };
        return true;
      });
    } catch (e) {
      (0, _log.error)("GLM - BI - Bundle installation script - getGLMSearches() failed", e);
    }

    return allGLMsearches;
  }

  function switchSearchInGLMatchingSublist(GLMSublistSearchMultibookOn) {
    try {
      var GLMSublistID = nQuery.runSuiteQL({
        query: "SELECT id FROM sublist WHERE scriptid = 'custsublist_glm_sublist'"
      }).results[0].values[0];
      var GLMSublist = nRecord.load({
        type: "sublist",
        id: GLMSublistID
      });
      GLMSublist.setValue({
        fieldId: "savedsearch",
        value: GLMSublistSearchMultibookOn.internalID
      });
      GLMSublist.save();
    } catch (e) {
      (0, _log.error)("GLM - BI - Bundle installation script - switchSearchInGLMatchingSublist() failed", e);
    }
  }

  function removeUnusedGLMReportSearch(remove) {
    try {
      nSearch["delete"]({
        id: remove.internalID
      });
    } catch (e) {
      (0, _log.error)("GLM - BI - Bundle installation script - renameAndRemoveUnusedGLMReportSearches() remove failed", e);
    }
  }

  function runQuery(query, parameters) {
    if (parameters === void 0) {
      parameters = [];
    }

    return nQuery.runSuiteQL({
      params: parameters,
      query: query
    }).results.map(function (x) {
      return x.values;
    });
  }

  var VariableSchema = {
    fields: {
      name: "name",
      value: "custrecord_glm_var_value"
    },
    type: "customrecord_glm_variable"
  };

  function fetchAllVariables() {
    return runQuery("\n            SELECT id\n                 , " + VariableSchema.fields.name + "\n                 , " + VariableSchema.fields.value + "\n            FROM " + VariableSchema.type + "\n        ").map(function (row) {
      return {
        id: row[0],
        name: row[1],
        value: row[2]
      };
    });
  }

  function setMultibookStatus(value) {
    for (var _i = 0, _a = fetchAllVariables(); _i < _a.length; _i++) {
      var variable = _a[_i];

      if (variable.name === "LastMultiBookStatus") {
        try {
          var LastMultiBookStatus = nRecord.load({
            id: variable.id,
            type: "customrecord_glm_variable"
          });
          LastMultiBookStatus.setValue({
            fieldId: "custrecord_glm_var_value",
            value: value.toString()
          });
          return LastMultiBookStatus.save();
        } catch (e) {
          (0, _log.error)("The variable LastMultiBookStatus set failed", e);
        }
      }
    }

    throw new Error("The variable LastMultiBookStatus not found");
  }

  function handleMultiBook() {
    var GLMsearches = getGLMSearches();
    var multiBookStatus = isMultiBookEnabled();

    if (multiBookStatus) {
      switchSearchInGLMatchingSublist(GLMsearches.customsearch_glm_sublist_multibook_on);
      removeUnusedGLMReportSearch(GLMsearches.customsearch_glm_report_multibook_off);
    } else {
      switchSearchInGLMatchingSublist(GLMsearches.customsearch_glm_sublist_multibook_off);
      removeUnusedGLMReportSearch(GLMsearches.customsearch_glm_report_multibook_on);
    }

    setMultibookStatus(multiBookStatus);
  }

  var afterInstall = function afterInstall() {
    handleMultiBook();
  };

  _exports.afterInstall = afterInstall;

  var afterUpdate = function afterUpdate() {
    handleMultiBook();

    try {
      var scheduler = nTask.create({
        deploymentId: "customdeploy_glm_ss_scheduler",
        scriptId: "customscript_glm_ss_scheduler",
        taskType: nTask.TaskType.SCHEDULED_SCRIPT
      });
      scheduler.submit();
    } catch (e) {// intentionally swallowed
    }
  };

  _exports.afterUpdate = afterUpdate;
});