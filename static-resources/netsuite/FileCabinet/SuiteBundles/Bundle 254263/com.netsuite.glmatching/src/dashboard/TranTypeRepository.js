/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/expectations", "../../vendor/lodash-4.17.4"], function (_exports, _tslib, _expectations, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TranTypeRepository = void 0;

  var TranTypeRepository =
  /** @class */
  function () {
    function TranTypeRepository(getCache, runQuery, translate) {
      this.getCache = getCache;
      this.runQuery = runQuery;
      this.translate = translate;
    }

    TranTypeRepository.prototype.findAllowedTranTypes = function (language) {
      var _this = this;

      var value = this.getCache().get({
        key: "TransactionSearch.findAllowedTranTypes(\"" + language + "\")",
        loader: function loader(_) {
          return JSON.stringify(_this.fetchRecordTypesWithDeployments());
        },
        ttl: 10 * 60
      });
      return JSON.parse(value);
    };

    TranTypeRepository.prototype.fetchRecordTypesWithDeployments = function () {
      var query = "\n            SELECT LOWER(usereventscriptdeployment.recordtype)\n                 , Builtin.DF(usereventscriptdeployment.recordtype)\n            FROM usereventscriptdeployment, script\n            WHERE script.id = usereventscriptdeployment.script\n              AND usereventscriptdeployment.isdeployed = 'T'\n              AND script.isinactive = 'F'\n              AND script.scriptid IN ('customscript_glm_ue_transaction', 'customscript_glm_ue_custom_transaction')\n        ";
      var scriptableTranTypes = this.runQuery(query).map(function (r) {
        return {
          name: (0, _expectations.expectString)(r[1]),
          type: (0, _expectations.expectString)(r[0])
        };
      });
      return (0, _lodash.orderBy)((0, _tslib.__spreadArrays)(scriptableTranTypes, [{
        name: this.translate("taxliab"),
        type: "taxliab"
      }, {
        name: this.translate("gladj"),
        type: "glimpactadjustment"
      }, {
        name: this.translate("fxreval"),
        type: "fxreval"
      }]), function (x) {
        return x.name;
      });
    };

    return TranTypeRepository;
  }();

  _exports.TranTypeRepository = TranTypeRepository;
});