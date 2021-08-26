/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/field", "../common/fn", "../common/Maybe", "../../vendor/lodash-4.17.4", "./DashboardResultTabBuilder", "./types"], function (_exports, _tslib, _field, _fn, _Maybe, _lodash, _DashboardResultTabBuilder, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getOption = getOption;
  _exports.getEmptyOption = getEmptyOption;
  _exports.DashboardFormBuilder = void 0;

  function getOption(value, text) {
    return {
      text: text || value,
      value: value
    };
  }

  function getEmptyOption() {
    return getOption("", "&nbsp;");
  }

  function getMatchingStatusOptions(parameters) {
    return (0, _fn.joinMultiSelectValue)(parameters.action.caseOf({
      just: function just() {
        return parameters.matchingStatus.getSelected();
      },
      nothing: function nothing() {
        return ["none"
        /* NONE */
        , "paired"
        /* PAIRED */
        ];
      }
    }));
  }

  var DashboardFormBuilder =
  /** @class */
  function () {
    function DashboardFormBuilder(accountRepository, tranTypeRepository, matchingStatusMap, format, ui, message, runtime, translate) {
      this.accountRepository = accountRepository;
      this.tranTypeRepository = tranTypeRepository;
      this.matchingStatusMap = matchingStatusMap;
      this.format = format;
      this.ui = ui;
      this.message = message;
      this.runtime = runtime;
      this.translate = translate;
      this.messages = [];
    }

    DashboardFormBuilder.prototype.addError = function (error) {
      this.messages.push((0, _tslib.__assign)((0, _tslib.__assign)({}, error), {
        type: this.message.Type.ERROR
      }));
    };

    DashboardFormBuilder.prototype.addWarning = function (error) {
      this.messages.push((0, _tslib.__assign)((0, _tslib.__assign)({}, error), {
        type: this.message.Type.WARNING
      }));
    };

    DashboardFormBuilder.prototype.buildEmpty = function () {
      var form = this.ui.createForm({
        title: this.translate("dashboard_title")
      });
      this.messages.forEach(function (message) {
        return form.addPageInitMessage(message);
      });
      return form;
    };

    DashboardFormBuilder.prototype.build = function (parameters) {
      var isOneWorld = this.runtime.isOneWorld();
      var form = this.ui.createForm({
        title: this.translate("dashboard_title")
      });
      var addField = (0, _field.createFieldAdder)(form);
      var subsidiaries = [];
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
        defaultValue: JSON.stringify({}),
        displayType: this.ui.FieldDisplayType.HIDDEN,
        id: "custpage_action_data"
        /* ACTION_DATA */
        ,
        label: "custpage_action_data"
        /* ACTION_DATA */
        ,
        type: this.ui.FieldType.LONGTEXT
      });
      form.addFieldGroup({
        id: "custpage_basic_filters"
        /* BASIC_FILTERS */
        ,
        label: this.translate("basic_filters")
      });
      form.addFieldGroup({
        id: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        label: this.translate("advanced_filters")
      });

      if (isOneWorld) {
        addField({
          breakType: this.ui.FieldBreakType.STARTCOL,
          container: "custpage_basic_filters"
          /* BASIC_FILTERS */
          ,
          defaultValue: parameters.subsidiary.valueOr(""),
          help: this.translate("subsidiary_help"),
          id: "custpage_subsidiary"
          /* SUBSIDIARY */
          ,
          isMandatory: true,
          label: this.translate("subsidiary_field"),
          source: "subsidiary",
          type: this.ui.FieldType.SELECT
        });
        parameters.subsidiary["do"]({
          just: function just(subsidiaryId) {
            return subsidiaries.push(subsidiaryId);
          }
        });
      }

      var accountFieldOptions = {
        container: "custpage_basic_filters"
        /* BASIC_FILTERS */
        ,
        defaultValue: parameters.account.valueOr(""),
        help: this.translate("account_help"),
        id: "custpage_account"
        /* ACCOUNT */
        ,
        isMandatory: true,
        label: this.translate("account_field"),
        type: this.ui.FieldType.SELECT
      };
      var accounts = isOneWorld && subsidiaries.length > 0 ? this.accountRepository.findOptionsBySubsidiaries(subsidiaries) : this.accountRepository.findOptions();

      if (this.runtime.hasAccountingContext()) {
        var accountingContextId = this.runtime.getAccountingContext();
        var accountIds = accounts.map(function (x) {
          return x.value;
        });
        accountFieldOptions.options = (0, _tslib.__spreadArrays)([getEmptyOption()], this.accountRepository.findAccountingContextNames(accountIds, accountingContextId));
      } else {
        accountFieldOptions.options = (0, _tslib.__spreadArrays)([getEmptyOption()], accounts);
      }

      if (this.runtime.isMultiBookEnabled()) {
        addField({
          container: "custpage_basic_filters"
          /* BASIC_FILTERS */
          ,
          defaultValue: parameters.accountingBook.valueOr(_types.DEFAULT_ACCOUNTING_BOOK),
          help: this.translate("accounting_book_help"),
          id: "custpage_accounting_book"
          /* ACCOUNTING_BOOK */
          ,
          isMandatory: true,
          label: this.translate("accounting_book_field"),
          source: "accountingbook",
          type: this.ui.FieldType.SELECT
        });
      }

      addField(accountFieldOptions);
      addField({
        breakType: this.ui.FieldBreakType.STARTCOL,
        container: "custpage_basic_filters"
        /* BASIC_FILTERS */
        ,
        defaultValue: getMatchingStatusOptions(parameters),
        help: this.translate("matching_status_help"),
        id: "custpage_matching_status"
        /* MATCHING_STATUS */
        ,
        label: this.translate("matching_status_field"),
        options: (0, _lodash.sortBy)(this.matchingStatusMap.getAll(), function (x) {
          return x.name;
        }).map(function (_a) {
          var name = _a.name,
              value = _a.value;
          return {
            text: name,
            value: value
          };
        }),
        type: this.ui.FieldType.MULTISELECT
      });
      addField({
        breakType: this.ui.FieldBreakType.STARTCOL,
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.matchingCode.valueOr(""),
        help: this.translate("matching_code_help"),
        id: "custpage_matching_code"
        /* MATCHING_CODE */
        ,
        label: this.translate("matching_code_field"),
        layoutType: this.ui.FieldLayoutType.STARTROW,
        type: this.ui.FieldType.TEXT
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.matchingReference.valueOr(""),
        help: this.translate("matching_reference_help"),
        id: "custpage_matching_reference"
        /* MATCHING_REFERENCE */
        ,
        label: this.translate("matching_reference_field"),
        layoutType: this.ui.FieldLayoutType.ENDROW,
        type: this.ui.FieldType.TEXT
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.memo.valueOr(""),
        help: this.translate("memo_help"),
        id: "custpage_memo"
        /* MEMO */
        ,
        label: this.translate("memo_field"),
        layoutType: this.ui.FieldLayoutType.STARTROW,
        type: this.ui.FieldType.TEXT
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.memoLine.valueOr(""),
        help: this.translate("memo_line_help"),
        id: "custpage_line_memo"
        /* LINE_MEMO */
        ,
        label: this.translate("memo_line_field"),
        layoutType: this.ui.FieldLayoutType.ENDROW,
        type: this.ui.FieldType.TEXT
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: (0, _DashboardResultTabBuilder.repeatString)("&nbsp;", 10),
        displayType: this.ui.FieldDisplayType.INLINE,
        help: "&nbsp;",
        id: "custpage_empty_3"
        /* EMPTY_3 */
        ,
        label: "&nbsp;",
        type: this.ui.FieldType.TEXT
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.customer.valueOr(""),
        displayType: this.resolveEntityFiltersByPar(parameters, parameters.customer),
        help: this.translate("customer_help"),
        id: "custpage_customer"
        /* CUSTOMER */
        ,
        label: this.translate("customer_field"),
        source: "customer",
        type: this.ui.FieldType.SELECT
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.vendor.valueOr(""),
        displayType: this.resolveEntityFiltersByPar(parameters, parameters.vendor),
        help: this.translate("vendor_help"),
        id: "custpage_vendor"
        /* VENDOR */
        ,
        label: this.translate("vendor_field"),
        source: "vendor",
        type: this.ui.FieldType.SELECT
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.employee.valueOr(""),
        displayType: this.resolveEntityFiltersByPar(parameters, parameters.employee),
        help: this.translate("employee_help"),
        id: "custpage_employee"
        /* EMPLOYEE */
        ,
        label: this.translate("employee_field"),
        source: "employee",
        type: this.ui.FieldType.SELECT
      });
      var billingFieldOptions = {
        breakType: this.ui.FieldBreakType.STARTCOL,
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.billingStatus.valueOr(""),
        help: this.translate("billing_status_help"),
        id: "custpage_billing_status"
        /* BILLING_STATUS */
        ,
        label: this.translate("billing_status_field"),
        options: [getEmptyOption(), getOption("F", this.translate("closed"
        /* CLOSED */
        )), getOption("T", this.translate("open"
        /* OPEN */
        ))],
        type: this.ui.FieldType.SELECT
      };

      if (this.accountRepository.isBillingStatusDisabled(parameters.account.valueOr(""))) {
        billingFieldOptions.displayType = this.ui.FieldDisplayType.DISABLED;
      }

      addField(billingFieldOptions);
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: (0, _fn.joinMultiSelectValue)(parameters.transactionTypes.map(function (x) {
          return JSON.stringify(x);
        })),
        help: this.translate("tran_types_help"),
        id: "custpage_tran_types"
        /* TRANSACTION_TYPES */
        ,
        label: this.translate("tran_types_field"),
        options: this.tranTypeRepository.findAllowedTranTypes(this.runtime.getLanguage()).map(function (item) {
          return {
            text: item.name,
            value: JSON.stringify(item)
          };
        }),
        type: this.ui.FieldType.MULTISELECT
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.dateMin.valueOr(""),
        help: this.translate("date_from_help"),
        id: "custpage_date_min"
        /* DATE_MIN */
        ,
        label: this.translate("date_from_field"),
        layoutType: this.ui.FieldLayoutType.STARTROW,
        type: this.ui.FieldType.DATE
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.dateMax.valueOr(""),
        help: this.translate("date_to_help"),
        id: "custpage_date_max"
        /* DATE_MAX */
        ,
        label: this.translate("date_to_field"),
        layoutType: this.ui.FieldLayoutType.ENDROW,
        type: this.ui.FieldType.DATE
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.amountMin.valueOr(""),
        help: this.translate("min_amount_help"),
        id: "custpage_amount_min"
        /* AMOUNT_MIN */
        ,
        label: this.translate("min_amount_field"),
        layoutType: this.ui.FieldLayoutType.STARTROW,
        type: this.ui.FieldType.CURRENCY
      });
      addField({
        container: "custpage_advanced_filters"
        /* ADVANCED_FILTERS */
        ,
        defaultValue: parameters.amountMax.valueOr(""),
        help: this.translate("max_amount_help"),
        id: "custpage_amount_max"
        /* AMOUNT_MAX */
        ,
        label: this.translate("max_amount_field"),
        layoutType: this.ui.FieldLayoutType.ENDROW,
        type: this.ui.FieldType.CURRENCY
      });
      var isDepartmentEnabled = this.runtime.isDepartmentEnabled();
      var isClassEnabled = this.runtime.isClassEnabled();

      if (isDepartmentEnabled) {
        addField({
          breakType: this.ui.FieldBreakType.STARTCOL,
          container: "custpage_advanced_filters"
          /* ADVANCED_FILTERS */
          ,
          defaultValue: parameters.department.valueOr(""),
          help: this.translate("department_help"),
          id: "custpage_department"
          /* DEPARTMENT */
          ,
          label: this.translate("department_field"),
          source: "department",
          type: this.ui.FieldType.SELECT
        });
      }

      if (isClassEnabled) {
        addField({
          breakType: this.setSegmentFieldBreakType(isDepartmentEnabled),
          container: "custpage_advanced_filters"
          /* ADVANCED_FILTERS */
          ,
          defaultValue: parameters.classification.valueOr(""),
          help: this.translate("class_help"),
          id: "custpage_class"
          /* CLASS */
          ,
          label: this.translate("class_field"),
          source: "classification",
          type: this.ui.FieldType.SELECT
        });
      }

      if (this.runtime.isLocationEnabled()) {
        addField({
          breakType: this.setSegmentFieldBreakType(isDepartmentEnabled, isClassEnabled),
          container: "custpage_advanced_filters"
          /* ADVANCED_FILTERS */
          ,
          defaultValue: parameters.location.valueOr(""),
          help: this.translate("location_help"),
          id: "custpage_location"
          /* LOCATION */
          ,
          label: this.translate("location_field"),
          source: "location",
          type: this.ui.FieldType.SELECT
        });
      }

      form.addSubmitButton({
        label: this.translate("search_button")
      });
      form.addResetButton({
        label: this.translate("reset_button")
      });
      form.addButton({
        functionName: "goToChecklist",
        id: "custpage_go_to_checklist_button"
        /* GO_TO_CHECKLIST */
        ,
        label: this.translate("go_to_checklist")
      });
      form.clientScriptModulePath = "../entrypoints/glm_cs_dashboard.js";
      this.messages.forEach(function (message) {
        return form.addPageInitMessage(message);
      });
      return form;
    };

    DashboardFormBuilder.prototype.resolveEntityFiltersByPar = function (parameters, entityValue) {
      if ((0, _Maybe.isNothing)(entityValue)) {
        return [parameters.vendor, parameters.customer, parameters.employee].filter(function (value) {
          return (0, _Maybe.isJust)(value);
        }).length === 0 ? this.ui.FieldDisplayType.NORMAL : this.ui.FieldDisplayType.DISABLED;
      }

      return this.ui.FieldDisplayType.NORMAL;
    };

    DashboardFormBuilder.prototype.setSegmentFieldBreakType = function () {
      var features = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        features[_i] = arguments[_i];
      }

      return features.indexOf(true) > -1 ? this.ui.FieldBreakType.NONE : this.ui.FieldBreakType.STARTCOL;
    };

    return DashboardFormBuilder;
  }();

  _exports.DashboardFormBuilder = DashboardFormBuilder;
});