/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/expectations", "../common/fn", "../../lib/errors", "../../vendor/lodash-4.17.4", "./FilterParameters"], function (_exports, _expectations, _fn, _errors, _lodash, _FilterParameters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.expectEntry = expectEntry;
  _exports.parseAction = parseAction;
  _exports.parseActionData = parseActionData;
  _exports.parseFilterParameters = parseFilterParameters;

  function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function expectEntry(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var accountingBook = (0, _expectations.expectInternalId)(object.accountingBook);
    var id = (0, _expectations.expectInternalId)(object.id);
    var isPeriodClosed = Boolean(object.isPeriodClosed);
    var line = (0, _expectations.expectInternalId)(object.line);
    var matching = (0, _expectations.expectOptionalInternalId)(object.matching);
    var reference = (0, _fn.stringOrDefault)(object.reference);
    return (0, _fn.compactObject)({
      accountingBook: accountingBook,
      id: id,
      isPeriodClosed: isPeriodClosed,
      line: line,
      matching: matching,
      reference: reference
    });
  }

  function parseAction(request) {
    if (!(0, _lodash.isPlainObject)(request.parameters) || typeof request.parameters["custpage_action"
    /* ACTION */
    ] !== "string") {
      return "search"
      /* SEARCH */
      ;
    }

    switch (request.parameters["custpage_action"
    /* ACTION */
    ]) {
      case "ref_unmatch"
      /* CHANGE_REFERENCE_AND_UNMATCH_TRANSACTION */
      :
      case "ref_all"
      /* CHANGE_REFERENCE_ON_ALL_MATCHED_TRANSACTIONS */
      :
      case "ref_single"
      /* CHANGE_REFERENCE_ON_SINGLE_TRANSACTION */
      :
      case "exportCSV"
      /* EXPORT_CSV */
      :
      case "match"
      /* MATCH */
      :
      case "search"
      /* SEARCH */
      :
      case "unmatch"
      /* UNMATCH */
      :
        return request.parameters["custpage_action"
        /* ACTION */
        ];

      default:
        return "search"
        /* SEARCH */
        ;
    }
  }

  function parseActionData(request) {
    if (!(0, _lodash.isPlainObject)(request.parameters) || typeof request.parameters["custpage_action_data"
    /* ACTION_DATA */
    ] !== "string") {
      throw (0, _errors.createTypeError)("Invalid Action data");
    }

    return JSON.parse(request.parameters["custpage_action_data"
    /* ACTION_DATA */
    ]);
  }

  function parseFilterParameters(request) {
    if (_typeof(request.parameters) !== "object" || request.parameters === null) {
      return new _FilterParameters.FilterParameters();
    }

    var parameters = request.parameters;
    return _FilterParameters.FilterParameters.parse({
      account: parameters["custpage_account"
      /* ACCOUNT */
      ],
      accountingBook: parameters["custpage_accounting_book"
      /* ACCOUNTING_BOOK */
      ],
      accountingContext: parameters["custpage_accounting_context"
      /* ACCOUNTING_CONTEXT */
      ],
      action: parameters["custpage_action"
      /* ACTION */
      ],
      amountMax: parameters["custpage_amount_max"
      /* AMOUNT_MAX */
      ],
      amountMin: parameters["custpage_amount_min"
      /* AMOUNT_MIN */
      ],
      billingStatus: parameters["custpage_billing_status"
      /* BILLING_STATUS */
      ],
      classification: parameters["custpage_class"
      /* CLASS */
      ],
      customer: parameters["custpage_customer"
      /* CUSTOMER */
      ],
      dateMax: parameters["custpage_date_max"
      /* DATE_MAX */
      ],
      dateMin: parameters["custpage_date_min"
      /* DATE_MIN */
      ],
      department: parameters["custpage_department"
      /* DEPARTMENT */
      ],
      employee: parameters["custpage_employee"
      /* EMPLOYEE */
      ],
      isMatchable: parameters["custpage_is_matchable"
      /* IS_MATCHABLE */
      ],
      location: parameters["custpage_location"
      /* LOCATION */
      ],
      matchingCode: parameters["custpage_matching_code"
      /* MATCHING_CODE */
      ],
      matchingReference: parameters["custpage_matching_reference"
      /* MATCHING_REFERENCE */
      ],
      matchingStatus: (0, _fn.splitMultiSelectValue)((0, _fn.stringOrDefault)(parameters["custpage_matching_status"
      /* MATCHING_STATUS */
      ])),
      memo: parameters["custpage_memo"
      /* MEMO */
      ],
      memoLine: parameters["custpage_line_memo"
      /* LINE_MEMO */
      ],
      pageNumber: parameters["custpage_page_number"
      /* PAGE_NUMBER */
      ],
      pageSize: parameters["custpage_results_per_page"
      /* RESULTS_PER_PAGE */
      ],
      subsidiary: parameters["custpage_subsidiary"
      /* SUBSIDIARY */
      ],
      transactionTypes: (0, _fn.splitMultiSelectValue)((0, _fn.stringOrDefault)(parameters["custpage_tran_types"
      /* TRANSACTION_TYPES */
      ])),
      vendor: parameters["custpage_vendor"
      /* VENDOR */
      ]
    });
  }
});