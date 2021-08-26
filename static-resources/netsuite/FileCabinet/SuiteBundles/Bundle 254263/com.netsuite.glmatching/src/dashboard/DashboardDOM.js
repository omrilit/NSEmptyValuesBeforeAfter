/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.DashboardDOM = void 0;

  var DashboardDOM =
  /** @class */
  function () {
    function DashboardDOM(document, $, resolveDashboard, setWindowChanged, translate, window, resolveChecklist) {
      this.document = document;
      this.$ = $;
      this.resolveDashboard = resolveDashboard;
      this.setWindowChanged = setWindowChanged;
      this.translate = translate;
      this.window = window;
      this.resolveChecklist = resolveChecklist;
    }

    DashboardDOM.prototype.download = function (url) {
      var link = this.document.createElement("a");
      link.target = "_blank";
      link.href = url;
      this.document.body.appendChild(link);
      link.click();
      this.document.body.removeChild(link);
    };

    DashboardDOM.prototype.reload = function (filterParameters) {
      this.setWindowChanged();
      var url = this.resolveDashboard(filterParameters);
      this.window.location.replace(url);
    };

    DashboardDOM.prototype.submit = function () {
      var submitter = this.document.getElementById("submitter");

      if (submitter) {
        this.setWindowChanged();
        submitter.click();
      }
    };

    DashboardDOM.prototype.goToChecklist = function (filterParameters) {
      try {
        this.window.open(this.resolveChecklist(filterParameters));
      } catch (e) {// intentionally swallowed
      }
    };

    DashboardDOM.prototype.replaceTransactionLinks = function (names, linkClassName) {
      var _this = this;

      Array.from(this.document.getElementsByClassName(linkClassName)).forEach(function (link) {
        var $link = _this.$(link);

        var transactionId = $link.data("id");

        if (transactionId && names[transactionId]) {
          $link.html("<a href=\"/app/accounting/transactions/transaction.nl?id=" + transactionId + "\" target=\"_blank\">" + names[transactionId] + "</a>");
        }
      });
    };

    DashboardDOM.prototype.initiateTransactionPopups = function (formID, popUpClassName, callback) {
      var form = this.document.getElementById(formID);
      console.log(form);

      if (!form) {
        console.error("Form #" + formID + " not found");
        return;
      }

      var $ = this.$;
      $(form).on("click", "." + popUpClassName, function (event) {
        console.log(event);
        var $target = $(event.target);
        var line = parseInt(String($target.data("line")), 10);
        callback(line);
      });
    };

    return DashboardDOM;
  }();

  _exports.DashboardDOM = DashboardDOM;
});