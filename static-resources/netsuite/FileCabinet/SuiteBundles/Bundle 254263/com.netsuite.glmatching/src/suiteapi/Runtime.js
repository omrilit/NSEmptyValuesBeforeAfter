/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../dashboard/index"], function (_exports, _index) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Runtime = void 0;
  var SUITEAPP_ID = "/com.netsuite.glmatching";

  var Runtime =
  /** @class */
  function () {
    function Runtime(runtime) {
      this.runtime = runtime;
    }

    Runtime.prototype.hasAccountingContext = function () {
      return null !== this.getAccountingContext();
    };

    Runtime.prototype.getAccountingContext = function () {
      return this.runtime.getCurrentUser().getPreference({
        name: "ACCOUNTING_CONTEXT"
      });
    };

    Runtime.prototype.getLanguage = function () {
      return this.runtime.getCurrentUser().getPreference({
        name: "LANGUAGE"
      });
    };

    Runtime.prototype.getCustomPermission = function (permissionId) {
      return this.runtime.getCurrentUser().getPermission({
        name: "LIST_CUSTRECORDENTRY".concat(permissionId)
      });
    };

    Runtime.prototype.checkMandatoryPermissions = function () {
      var _this = this;

      return this.getMandatoryPermissions().filter(function (p) {
        return (0, _index.expectCustomPermission)(_this.getCorePermission(p)) === 0
        /* NONE */
        ;
      }).length !== 0;
    };

    Runtime.prototype.getCorePermission = function (permissionId) {
      return this.runtime.getCurrentUser().getPermission({
        name: permissionId
      });
    };

    Runtime.prototype.getCurrentUser = function () {
      return String(this.runtime.getCurrentUser().id);
    };

    Runtime.prototype.getCurrentRole = function () {
      return String(this.runtime.getCurrentUser().role);
    };
    /**
     * Returns path depending on if the file is coming from SDF SuiteApp or Bundle
     */


    Runtime.prototype.getRealPath = function (path) {
      return [this.isBundle() ? "SuiteBundles/Bundle " + this.getBundleID() + SUITEAPP_ID : "SuiteApps" + SUITEAPP_ID, path.replace(/^\/+/, "")].join("/");
    };

    Runtime.prototype.isOneWorld = function () {
      return this.runtime.isFeatureInEffect({
        feature: "subsidiaries"
      });
    };

    Runtime.prototype.isDepartmentEnabled = function () {
      return this.runtime.isFeatureInEffect({
        feature: "departments"
      });
    };

    Runtime.prototype.isMultiBookEnabled = function () {
      return this.runtime.isFeatureInEffect({
        feature: "multibook"
      }) || this.runtime.isFeatureInEffect({
        feature: "fullmultibook"
      });
    };

    Runtime.prototype.isClassEnabled = function () {
      return this.runtime.isFeatureInEffect({
        feature: "classes"
      });
    };

    Runtime.prototype.isLocationEnabled = function () {
      return this.runtime.isFeatureInEffect({
        feature: "locations"
      });
    };

    Runtime.prototype.getNetsuiteVersion = function () {
      return this.runtime.version;
    };

    Runtime.prototype.getContextType = function () {
      return this.runtime.executionContext;
    };

    Runtime.prototype.getContextTypeEnum = function () {
      return this.runtime.ContextType;
    };

    Runtime.prototype.doesItRunInCSVImport = function () {
      return this.runtime.executionContext === this.runtime.ContextType.CSV_IMPORT;
    };

    Runtime.prototype.isBundle = function () {
      var script = this.runtime.getCurrentScript();
      return script && script.bundleIds && script.bundleIds.length > 0;
    };

    Runtime.prototype.getBundleID = function () {
      return this.runtime.getCurrentScript().bundleIds[0];
    };

    Runtime.prototype.getMandatoryPermissions = function () {
      var list = ["TRAN_FIND", "REPO_ANALYTICS", "LIST_ACCOUNT", "LIST_FILECABINET", "LIST_CURRENCY", "LIST_FIND", "ADMI_CUSTOMSCRIPT", "ADMI_ACCTPERIODS", "ADMI_SS_SCHEDULING", "ADMI_CUSTRECORD"];

      if (this.isMultiBookEnabled()) {
        list.push("ADMI_ACCOUNTINGBOOK");
      }

      if (this.isOneWorld()) {
        list.push("LIST_SUBSIDIARY");
      }

      return list;
    };

    return Runtime;
  }();

  _exports.Runtime = Runtime;
});