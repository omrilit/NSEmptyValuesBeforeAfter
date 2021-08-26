/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define(["exports", "../../vendor/tslib"], function (_exports, _tslib) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Dialogs = void 0;

  var Dialogs =
  /** @class */
  function () {
    function Dialogs(dialog, translate) {
      this.dialog = dialog;
      this.translate = translate;
    }

    Dialogs.prototype.showTransactionList = function (title, names) {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        var links;
        return (0, _tslib.__generator)(this, function (_a) {
          links = Object.keys(names).map(function (id) {
            return "<a href=\"/app/accounting/transactions/transaction.nl?id=" + id + "\" target=\"_blank\">" + names[id] + "</a>";
          }).join("<br>");
          return [2
          /*return*/
          , this.showPopup(title, "<div style=\"overflow-y: auto; max-height:400px\">" + links + "</div>")];
        });
      });
    };

    Dialogs.prototype.alertError = function (message) {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        return (0, _tslib.__generator)(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4
              /*yield*/
              , this.dialog.alert({
                message: message,
                title: this.translate("error")
              })];

            case 1:
              _a.sent();

              return [2
              /*return*/
              ];
          }
        });
      });
    };

    Dialogs.prototype.alertNotSelectedTransaction = function () {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        return (0, _tslib.__generator)(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4
              /*yield*/
              , this.dialog.alert({
                message: this.translate("message_001")
              })];

            case 1:
              _a.sent();

              return [2
              /*return*/
              ];
          }
        });
      });
    };

    Dialogs.prototype.showConfirmationDialog = function (message) {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        return (0, _tslib.__generator)(this, function (_a) {
          return [2
          /*return*/
          , this.dialog.create({
            buttons: [{
              label: this.translate("dialog_button_cancel"),
              value: "F"
            }, {
              label: this.translate("dialog_button_ok"),
              value: "T"
            }],
            message: message
          }).then(function (value) {
            return value === "T";
          })];
        });
      });
    };

    Dialogs.prototype.showFirstReferenceDialog = function () {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        return (0, _tslib.__generator)(this, function (_a) {
          return [2
          /*return*/
          , this.dialog.create({
            buttons: [{
              label: this.translate("reference_1st_dialog_no"),
              value: "N"
            }, {
              label: this.translate("reference_1st_dialog_yes"),
              value: "Y"
            }],
            message: this.translate("reference_1st_dialog_message"),
            title: this.translate("reference_1st_dialog_title")
          }).then(function (value) {
            return value === "Y";
          })];
        });
      });
    };

    Dialogs.prototype.showPopup = function (title, message) {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        return (0, _tslib.__generator)(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4
              /*yield*/
              , this.dialog.create({
                buttons: [{
                  label: this.translate("close"),
                  value: "close"
                }],
                message: message,
                title: title
              })];

            case 1:
              _a.sent();

              return [2
              /*return*/
              ];
          }
        });
      });
    };

    Dialogs.prototype.showSecondReferenceDialog = function () {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        return (0, _tslib.__generator)(this, function (_a) {
          return [2
          /*return*/
          , this.dialog.create({
            buttons: [{
              label: this.translate("reference_2nd_dialog_unmatch_transaction"),
              value: "ref_unmatch"
              /* CHANGE_REFERENCE_AND_UNMATCH_TRANSACTION */

            }, {
              label: this.translate("reference_2nd_dialog_change_all_references"),
              value: "ref_all"
              /* CHANGE_REFERENCE_ON_ALL_MATCHED_TRANSACTIONS */

            }, {
              label: this.translate("reference_2nd_dialog_do_nothing"),
              value: "ref_single"
              /* CHANGE_REFERENCE_ON_SINGLE_TRANSACTION */

            }],
            message: this.translate("reference_2nd_dialog_message"),
            title: this.translate("reference_2nd_dialog_title")
          }).then(function (value) {
            return value;
          })];
        });
      });
    };

    Dialogs.prototype.showMatchingMethodDialog = function () {
      return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
        return (0, _tslib.__generator)(this, function (_a) {
          return [2
          /*return*/
          , this.dialog.create({
            buttons: [{
              label: this.translate("use_all_group"),
              value: "toGroup"
            }, {
              label: this.translate("force_code"),
              value: "forceCode"
            }, {
              label: this.translate("reference_1st_dialog_no"),
              value: "cancel"
            }],
            message: this.translate("message_005")
          }).then(function (value) {
            return value;
          })];
        });
      });
    };

    return Dialogs;
  }();

  _exports.Dialogs = Dialogs;
});