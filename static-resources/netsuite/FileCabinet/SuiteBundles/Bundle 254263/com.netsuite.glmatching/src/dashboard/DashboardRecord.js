/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define(["exports", "../common/expectations", "../common/fn", "../common/Summary", "../scheduler/index", "./FilterParameters", "./types"], function (_exports, _expectations, _fn, _Summary, _index, _FilterParameters, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.DashboardRecord = void 0;
  var sublistId = "custpage_sublist_results"
  /* RESULTS */
  ;

  var DashboardRecord =
  /** @class */
  function () {
    function DashboardRecord(format, isBillingStatusDisabled, record, runtime, translate) {
      this.format = format;
      this.isBillingStatusDisabled = isBillingStatusDisabled;
      this.record = record;
      this.runtime = runtime;
      this.translate = translate;
    }

    DashboardRecord.prototype.setMandatoryFields = function (isMandatory) {
      if (this.runtime.isOneWorld()) {
        this.getField("custpage_subsidiary"
        /* SUBSIDIARY */
        ).isMandatory = isMandatory;
      }

      if (this.runtime.isMultiBookEnabled()) {
        this.getField("custpage_accounting_book"
        /* ACCOUNTING_BOOK */
        ).isMandatory = isMandatory;
      }

      this.getField("custpage_account"
      /* ACCOUNT */
      ).isMandatory = isMandatory;
    };

    DashboardRecord.prototype.updateAccountFilter = function () {
      var field = this.getField("custpage_billing_status"
      /* BILLING_STATUS */
      );
      field.isDisabled = this.isBillingStatusDisabled(this.getAccount());
      this.setValue("custpage_billing_status"
      /* BILLING_STATUS */
      , "");
    };

    DashboardRecord.prototype.updateEntityFilters = function (fieldId) {
      var isValueSet = (0, _fn.stringOrDefault)(this.getValue(fieldId)) !== "";
      this.getField("custpage_customer"
      /* CUSTOMER */
      ).isDisabled = isValueSet;
      this.getField("custpage_employee"
      /* EMPLOYEE */
      ).isDisabled = isValueSet;
      this.getField("custpage_vendor"
      /* VENDOR */
      ).isDisabled = isValueSet;

      if (isValueSet) {
        this.getField(fieldId).isDisabled = false;
      }
    };

    DashboardRecord.prototype.getFilterParameters = function () {
      var _this = this;

      var get = function get(fieldId) {
        return _this.record.getValue({
          fieldId: fieldId
        });
      };

      var dateMax = get("custpage_date_max"
      /* DATE_MAX */
      );
      var dateMin = get("custpage_date_min"
      /* DATE_MIN */
      );
      return _FilterParameters.FilterParameters.parse({
        account: get("custpage_account"
        /* ACCOUNT */
        ),
        accountingBook: get("custpage_accounting_book"
        /* ACCOUNTING_BOOK */
        ),
        accountingContext: get("custpage_accounting_context"
        /* ACCOUNTING_CONTEXT */
        ),
        action: get("custpage_action"
        /* ACTION */
        ),
        amountMax: String(get("custpage_amount_max"
        /* AMOUNT_MAX */
        )),
        amountMin: String(get("custpage_amount_min"
        /* AMOUNT_MIN */
        )),
        billingStatus: get("custpage_billing_status"
        /* BILLING_STATUS */
        ),
        classification: get("custpage_class"
        /* CLASS */
        ),
        customer: get("custpage_customer"
        /* CUSTOMER */
        ),
        dateMax: dateMax instanceof Date ? this.format.formatDate(dateMax) : undefined,
        dateMin: dateMin instanceof Date ? this.format.formatDate(dateMin) : undefined,
        department: get("custpage_department"
        /* DEPARTMENT */
        ),
        employee: get("custpage_employee"
        /* EMPLOYEE */
        ),
        location: get("custpage_location"
        /* LOCATION */
        ),
        matchingCode: get("custpage_matching_code"
        /* MATCHING_CODE */
        ),
        matchingReference: get("custpage_matching_reference"
        /* MATCHING_REFERENCE */
        ),
        matchingStatus: get("custpage_matching_status"
        /* MATCHING_STATUS */
        ),
        memo: get("custpage_memo"
        /* MEMO */
        ),
        memoLine: get("custpage_line_memo"
        /* LINE_MEMO */
        ),
        pageNumber: get("custpage_page_number"
        /* PAGE_NUMBER */
        ),
        pageSize: get("custpage_results_per_page"
        /* RESULTS_PER_PAGE */
        ),
        subsidiary: get("custpage_subsidiary"
        /* SUBSIDIARY */
        ),
        transactionTypes: get("custpage_tran_types"
        /* TRANSACTION_TYPES */
        ),
        vendor: get("custpage_vendor"
        /* VENDOR */
        )
      });
    };

    DashboardRecord.prototype.getSelectedEntries = function () {
      var entries = [];

      for (var line = this.record.getLineCount({
        sublistId: sublistId
      }); line--;) {
        if (this.isRowSelected(line)) {
          entries.push(this.getEntry(line));
        }
      }

      return entries;
    };

    DashboardRecord.prototype.getAccount = function () {
      return (0, _expectations.expectInternalId)(this.getValue("custpage_account"
      /* ACCOUNT */
      ));
    };

    DashboardRecord.prototype.getAccountingBook = function () {
      return (0, _expectations.expectInternalId)(this.getValue("custpage_accounting_book"
      /* ACCOUNTING_BOOK */
      ) || _types.DEFAULT_ACCOUNTING_BOOK);
    };

    DashboardRecord.prototype.getEntry = function (line) {
      var _this = this;

      var get = function get(fieldId) {
        return _this.record.getSublistValue({
          fieldId: fieldId,
          line: line,
          sublistId: sublistId
        });
      };

      return {
        accountingBook: (0, _expectations.expectInternalId)(get("custpage_results_accounting_book"
        /* ACCOUNTING_BOOK */
        )),
        id: (0, _expectations.expectInternalId)(get("custpage_results_tran_id"
        /* TRAN_ID */
        )),
        isPeriodClosed: get("custpage_results_is_period_closed"
        /* IS_PERIOD_CLOSED */
        ) === "T",
        line: (0, _expectations.expectInternalId)(get("custpage_results_tran_line"
        /* TRAN_LINE */
        )),
        matching: (0, _expectations.expectOptionalInternalId)(get("custpage_results_matching_id"
        /* MATCHING_ID */
        )),
        reference: String(get("custpage_results_matching_reference"
        /* MATCHING_REFERENCE */
        ))
      };
    };

    DashboardRecord.prototype.getSubsidiary = function () {
      return (0, _expectations.expectInternalId)(this.getValue("custpage_subsidiary"
      /* SUBSIDIARY */
      ) || _types.DEFAULT_SUBSIDIARY);
    };

    DashboardRecord.prototype.updateSummary = function () {
      var _this = this;

      var summary = this.getSummary();

      var getTotal = function getTotal(fieldId) {
        return (0, _fn.stringOrDefault)(_this.getValue(fieldId)).replace(/.*\/\s+/, "");
      };

      this.setValue("custpage_credit_checked"
      /* CREDIT_BALANCE */
      , this.format.formatBalanceFields(summary.credit, getTotal("custpage_credit_checked"
      /* CREDIT_BALANCE */
      )));
      this.setValue("custpage_debit_checked"
      /* DEBIT_BALANCE */
      , this.format.formatBalanceFields(summary.debit, getTotal("custpage_debit_checked"
      /* DEBIT_BALANCE */
      )));
      this.setValue("custpage_balance_total"
      /* BALANCE_TOTAL */
      , this.format.formatBalanceFields(summary.balance, getTotal("custpage_balance_total"
      /* BALANCE_TOTAL */
      )));
    };

    DashboardRecord.prototype.setSelected = function (value) {
      for (var line = this.record.getLineCount({
        sublistId: sublistId
      }); line--;) {
        this.record.selectLine({
          line: line,
          sublistId: sublistId
        });

        if (this.record.getCurrentSublistValue({
          fieldId: "custpage_results_matching_reference"
          /* MATCHING_REFERENCE */
          ,
          sublistId: sublistId
        }) !== this.translate(_index.JobStatus.PROCESSING)) {
          this.record.setCurrentSublistValue({
            fieldId: "custpage_results_selected"
            /* SELECTED */
            ,
            fireSlavingSync: false,
            ignoreFieldChange: true,
            sublistId: sublistId,
            value: value
          });
          this.record.commitLine({
            sublistId: sublistId
          });
        }
      }

      this.updateSummary();
    };

    DashboardRecord.prototype.setAction = function (action, data) {
      this.record.setValue("custpage_action"
      /* ACTION */
      , action);
      this.record.setValue("custpage_action_data"
      /* ACTION_DATA */
      , JSON.stringify(data));
    };

    DashboardRecord.prototype.getHistoryData = function () {
      var value = this.record.getValue({
        fieldId: "custpage_history_data"
        /* HISTORY_DATA */

      });
      return JSON.parse((0, _expectations.expectString)(value));
    };

    DashboardRecord.prototype.getInProgressData = function () {
      var value = this.record.getValue({
        fieldId: "custpage_in_progress_data"
        /* IN_PROGRESS_DATA */

      });
      return JSON.parse((0, _expectations.expectString)(value));
    };

    DashboardRecord.prototype.getField = function (fieldId) {
      return this.record.getField({
        fieldId: fieldId
      });
    };

    DashboardRecord.prototype.getValue = function (fieldId) {
      return this.record.getValue({
        fieldId: fieldId
      });
    };

    DashboardRecord.prototype.setValue = function (fieldId, value) {
      return this.record.setValue({
        fieldId: fieldId,
        value: value
      });
    };

    DashboardRecord.prototype.getSummary = function () {
      var _this = this;

      var summaries = [];

      var _loop_1 = function _loop_1(line) {
        var get = function get(fieldId) {
          return _this.record.getSublistValue({
            fieldId: fieldId,
            line: line,
            sublistId: sublistId
          });
        };

        var isSelected = Boolean(get("custpage_results_selected"
        /* SELECTED */
        ));

        if (isSelected) {
          var credit = Number(get("custpage_results_credit"
          /* CREDIT */
          ));
          var debit = Number(get("custpage_results_debit"
          /* DEBIT */
          ));
          summaries.push(new _Summary.Summary(credit, debit));
        }
      };

      for (var line = this.record.getLineCount({
        sublistId: sublistId
      }); line--;) {
        _loop_1(line);
      }

      return _Summary.Summary.sum(summaries);
    };

    DashboardRecord.prototype.isRowSelected = function (line) {
      return Boolean(this.record.getSublistValue({
        fieldId: "custpage_results_selected"
        /* SELECTED */
        ,
        line: line,
        sublistId: sublistId
      }));
    };

    return DashboardRecord;
  }();

  _exports.DashboardRecord = DashboardRecord;
});