/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define(["exports", "../common/fn", "../common/Maybe", "./types"], function (_exports, _fn, _Maybe, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TransactionClientHandler = void 0;
  var previousReference = "glm_previousReference_value";

  var TransactionClientHandler =
  /** @class */
  function () {
    function TransactionClientHandler(dialog, translate, document, getPermission) {
      this.dialog = dialog;
      this.translate = translate;
      this.document = document;
      this.getPermission = getPermission;
    }

    TransactionClientHandler.prototype.resolveReferenceChange = function (context) {
      var _this = this;

      var record = context.currentRecord;
      var reference = record.getValue(_types.tReference);

      if (context.fieldId === _types.tReference && (0, _Maybe.isJust)((0, _Maybe.maybe)(reference)) && reference !== this.getReferenceFromDOM()) {
        this.dialog.create({
          buttons: [{
            label: this.translate("warning_reference_button_ok"),
            value: "T"
          }, {
            label: this.translate("warning_reference_button_cancel"),
            value: "F"
          }],
          message: this.translate("warning_reference_popup")
        }).then(function (value) {
          value === "F" ? record.setValue(_types.tReference, _this.getReferenceFromDOM()) : _this.setReferenceToDOM(record);
        });
        this.resolvePermissions(context);
      }
    };

    TransactionClientHandler.prototype.setAndCreateReferenceElement = function (record) {
      record.setValue(_types.permissionBodyField, "");
      var element = this.document.createElement("glm_matching_tag");
      element.setAttribute("id", previousReference);
      this.document.body.appendChild(element);
      this.setReferenceToDOM(record);
    };

    TransactionClientHandler.prototype.resolveReferenceField = function (record) {
      if (record.getValue(_types.csvReference)) {
        record.getField({
          fieldId: _types.tReference
        }).isDisabled = true;
      }
    };

    TransactionClientHandler.prototype.resolvePermissions = function (context) {
      if ((0, _Maybe.isJust)((0, _Maybe.maybe)(context.currentRecord.getValue(_types.tReference)))) {
        context.currentRecord.setValue(_types.permissionBodyField, this.getPermission());
      }
    };

    TransactionClientHandler.prototype.setReferenceToDOM = function (record) {
      var element = this.document.getElementById(previousReference);

      if (element) {
        element.setAttribute("value", (0, _fn.stringOrDefault)(record.getValue(_types.tReference)));
      }
    };

    TransactionClientHandler.prototype.getReferenceFromDOM = function () {
      return (0, _Maybe.maybe)(this.document.getElementById(previousReference)).caseOf({
        just: function just(e) {
          return (0, _fn.stringOrDefault)(e.getAttribute("value"));
        },
        nothing: function nothing() {
          return "";
        }
      });
    };

    return TransactionClientHandler;
  }();

  _exports.TransactionClientHandler = TransactionClientHandler;
});