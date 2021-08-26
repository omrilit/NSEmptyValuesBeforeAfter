/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/field"], function (_exports, _tslib, _field) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ChecklistFormBuilder = void 0;

  var ChecklistFormBuilder =
  /** @class */
  function () {
    function ChecklistFormBuilder(ui, message, runtime, translate) {
      this.ui = ui;
      this.message = message;
      this.runtime = runtime;
      this.translate = translate;
      this.messages = [];
    }

    ChecklistFormBuilder.prototype.addError = function (error) {
      this.messages.push((0, _tslib.__assign)((0, _tslib.__assign)({}, error), {
        type: this.message.Type.ERROR
      }));
    };

    ChecklistFormBuilder.prototype.addWarning = function (error) {
      this.messages.push((0, _tslib.__assign)((0, _tslib.__assign)({}, error), {
        type: this.message.Type.WARNING
      }));
    };

    ChecklistFormBuilder.prototype.buildEmpty = function () {
      var form = this.ui.createForm({
        title: this.translate("account_checklist_title")
      });
      this.messages.forEach(function (message) {
        return form.addPageInitMessage(message);
      });
      return form;
    };

    ChecklistFormBuilder.prototype.build = function (parameters) {
      var isOneWorld = this.runtime.isOneWorld();
      var isAccountingBook = this.runtime.isMultiBookEnabled();
      var form = this.ui.createForm({
        title: this.translate("account_checklist_title")
      });
      var addField = (0, _field.createFieldAdder)(form);
      form.addFieldGroup({
        id: "custpage_basic_filters"
        /* BASIC_FILTERS */
        ,
        label: this.translate("period_subsidiary_filter")
      });
      addField({
        defaultValue: "search"
        /* SEARCH */
        ,
        displayType: this.ui.FieldDisplayType.HIDDEN,
        id: "custpage_action"
        /* ACTION */
        ,
        label: "custpage_action"
        /* ACTION */
        ,
        type: this.ui.FieldType.TEXT
      });
      addField({
        breakType: this.ui.FieldBreakType.STARTCOL,
        container: "custpage_basic_filters"
        /* BASIC_FILTERS */
        ,
        defaultValue: parameters.dateMin.valueOr(""),
        help: this.translate("date_from_help_checklist"),
        id: "custpage_date_min"
        /* DATE_MIN */
        ,
        label: this.translate("date_from_field"),
        layoutType: this.ui.FieldLayoutType.STARTROW,
        type: this.ui.FieldType.DATE
      });
      addField({
        container: "custpage_basic_filters"
        /* BASIC_FILTERS */
        ,
        defaultValue: parameters.dateMax.valueOr(""),
        help: this.translate("date_to_help_checklist"),
        id: "custpage_date_max"
        /* DATE_MAX */
        ,
        label: this.translate("date_to_field"),
        layoutType: this.ui.FieldLayoutType.MIDROW,
        type: this.ui.FieldType.DATE
      });
      var layoutType = this.ui.FieldLayoutType.STARTROW;

      if (isAccountingBook) {
        addField({
          container: "custpage_basic_filters"
          /* BASIC_FILTERS */
          ,
          defaultValue: parameters.accountingBook.valueOr(""),
          help: this.translate("accounting_book_help_checklist"),
          id: "custpage_accounting_book"
          /* ACCOUNTING_BOOK */
          ,
          label: this.translate("accounting_book_field"),
          layoutType: layoutType,
          source: "accountingbook",
          type: this.ui.FieldType.SELECT
        });
        layoutType = this.ui.FieldLayoutType.ENDROW;
      }

      if (isOneWorld) {
        addField({
          container: "custpage_basic_filters"
          /* BASIC_FILTERS */
          ,
          defaultValue: parameters.subsidiary.valueOr(""),
          help: this.translate("subsidiary_help_checklist"),
          id: "custpage_subsidiary"
          /* SUBSIDIARY */
          ,
          label: this.translate("subsidiary_field"),
          layoutType: layoutType,
          source: "subsidiary",
          type: this.ui.FieldType.SELECT
        });
      }

      form.addFieldGroup({
        id: "custpage_account_filters"
        /* ACCOUNT */
        ,
        label: this.translate("account_checklist_filter")
      });
      addField({
        container: "custpage_account_filters"
        /* ACCOUNT */
        ,
        defaultValue: parameters.isMatchable ? "T" : "F",
        help: this.translate("matchable_field_help"),
        id: "custpage_is_matchable"
        /* IS_MATCHABLE */
        ,
        label: this.translate("matchable_field"),
        layoutType: this.ui.FieldLayoutType.ENDROW,
        type: this.ui.FieldType.CHECKBOX
      });
      form.addSubmitButton({
        label: this.translate("show_accounts")
      });
      this.messages.forEach(function (message) {
        return form.addPageInitMessage(message);
      });
      return form;
    };

    return ChecklistFormBuilder;
  }();

  _exports.ChecklistFormBuilder = ChecklistFormBuilder;
});