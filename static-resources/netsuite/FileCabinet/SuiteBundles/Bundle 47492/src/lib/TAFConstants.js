/**
 * Copyright © 2017, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.CONSTANTS = TAF.CONSTANTS || {};

TAF.CONSTANTS.SUITELET = {
    'MAIN': {
        'SUITELET_ID': 'customscript_4599_main_s',
        'DEPLOYMENT_ID': 'customdeploy_4599_main_s'
    },
    'FILTER': {
        'SUITELET_ID': 'customscript_taf_filter',
        'DEPLOYMENT_ID': 'customdeploy_taf_filter'
    }
};

TAF.CONSTANTS.FIELDS = {
    'REPORT': 'report',
    'ACCOUNTING_PERIOD_FROM': 'accountingperiod_from',
    'ACCOUNTING_PERIOD_TO': 'accountingperiod_to',
    'TAX_PERIOD_FROM': 'taxperiod_from',
    'TAX_PERIOD_TO': 'taxperiod_to',
    'SUBSIDIARY': 'subsidiary',
    'INCLUDE_CHILD_SUBS': 'include_child_subs',
    'ACCOUNTING_BOOK': 'accountingbook',
    'SUBSIDIARIES': 'subsidiaries',
    'ACCOUNTING_BOOKS': 'accountingbooks',
    'ACCOUNTING_CONTEXT': 'accountingcontext',
    'ENGINE_OPTION': 'engineoption',
    'START_DATE': 'start_date',
    'END_DATE': 'end_date',
    'POSTING_DATE': 'posting_date'
};

TAF.CONSTANTS.FIELD_MAP = {
    TRANSACTION: {
        issuedInvoiceType: { id: 'custbody_sii_issued_inv_type', nexus: ['ES'],
            recordType: ['invoice', 'cashsale', 'salesorder', 'estimate', 'returnauthorization'] },
        receivedInvoiceType: { id: 'custbody_sii_received_inv_type', nexus: ['ES'],
            recordType: ['vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg', 'purchaseorder', 'vendorreturnauthorization'] },
        receivedInvoiceTypeTemp: { id: 'custpage_sii_temp_received_inv_type', nexus: ['ES'], displayType: 'hidden',
            recordType: ['vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg', 'purchaseorder', 'vendorreturnauthorization'] },
        spclSchemeCodeSales: { id: 'custbody_sii_spcl_scheme_code_sales', nexus: ['ES'], recordType: ['invoice', 'cashsale', 'salesorder', 'estimate', 'returnauthorization'] },
        spclSchemeCodePurchase: { id: 'custbody_sii_spcl_scheme_code_purchase', nexus: ['ES'],
            recordType: ['vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg', 'purchaseorder', 'vendorreturnauthorization'] },
        propertyLocation: { id: 'custbody_sii_property_location', nexus: ['ES'], recordType: ['invoice', 'cashsale', 'salesorder', 'estimate', 'returnauthorization'] },
        landRegister: { id: 'custbody_sii_land_register', nexus: ['ES'], recordType: ['invoice', 'cashsale', 'salesorder', 'estimate', 'returnauthorization'] },
        exemptDetails: { id: 'custbody_sii_exempt_details', nexus: ['ES'], recordType: ['invoice', 'cashsale', 'salesorder', 'estimate', 'returnauthorization'] },
        intraCommunityTxnType: { id: 'custbody_sii_intra_txn_type', nexus: ['ES'],
            recordType: ['invoice', 'cashsale', 'vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg', 'salesorder', 'estimate', 'purchaseorder',
                         'vendorreturnauthorization'] },
        originalInvoice: { id: 'custbody_sii_orig_invoice', nexus: ['ES'],
            recordType: ['creditmemo', 'cashrefund', 'customerrefund', 'journalentry'] },
        originalBill: { id: 'custbody_sii_orig_bill', nexus: ['ES'],
            recordType: ['vendorcredit', 'journalentry', 'creditcardrefund', 'creditcardcharge_CardRfnd', 'creditcardcharge'] },
        referenceNo: { id: 'custbody_sii_ref_no', nexus: ['ES'], recordType: ['journalentry'] },
        externalReference: { id: 'custbody_sii_external_reference', nexus: ['ES'],
            recordType: ['invoice', 'cashsale', 'vendorbill', 'check', 'creditmemo', 'cashrefund', 'customerrefund', 'vendorreturnauthorization', 'returnauthorization',
                         'vendorcredit', 'journalentry', 'creditcardcharge', 'creditcardrefund', 'creditcardcharge_CardChrg', 'creditcardcharge_CardRfnd'] },
        correctionType: { id: 'custbody_sii_correction_type', nexus: ['ES'],
            recordType: ['creditmemo', 'cashrefund', 'journalentry', 'vendorcredit', 'creditcardrefund', 'creditcardcharge_CardRfnd', 'creditcardcharge'] },
        operationDate: { id: 'custbody_sii_operation_date', nexus: ['ES'],
            recordType: ['invoice', 'cashsale', 'vendorbill', 'check', 'creditmemo', 'cashrefund', 'vendorcredit', 'vendorreturnauthorization', 'returnauthorization',
                          'journalentry', 'creditcardcharge', 'creditcardrefund', 'creditcardcharge_CardChrg', 'creditcardcharge_CardRfnd'] },
        invoiceDate: { id: 'custbody_sii_invoice_date', nexus: ['ES'],
            recordType: ['vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg', 'purchaseorder','vendorcredit',
                         'journalentry', 'creditcardrefund', 'creditcardcharge_CardRfnd', 'vendorreturnauthorization'] },
        accountingDate: { id: 'custbody_sii_accounting_date', nexus: ['ES'],
            recordType: ['vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg', 'purchaseorder','vendorcredit',
                         'journalentry', 'creditcardrefund', 'creditcardcharge_CardRfnd', 'vendorreturnauthorization'] },
        issuedByThirdParty: { id: 'custbody_sii_is_third_party', nexus: ['ES'], recordType: ['invoice', 'cashsale', 'salesorder', 'estimate', 'returnauthorization'] },
        article7273: { id: 'custbody_sii_article_72_73', nexus: ['ES'],
            recordType: ['invoice', 'cashsale', 'vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg', 'salesorder', 'estimate', 'purchaseorder',
                         'vendorreturnauthorization'] },
        notReportedInTime: { id: 'custbody_sii_not_reported_in_time', nexus: ['ES'],
            recordType: ['invoice', 'cashsale', 'vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg', 'salesorder', 'estimate', 'purchaseorder',
                         'vendorreturnauthorization'] },
        article61d: { id: 'custbody_sii_article_61d', nexus: ['ES'],
            recordType: ['invoice', 'cashsale', 'salesorder', 'estimate', 'returnauthorization'] },
        registrationStatus: { id: 'custbody_sii_registration_status', nexus: ['ES'], displayType: 'inline',
            recordType: ['invoice', 'cashsale', 'vendorbill', 'check', 'creditmemo', 'cashrefund', 'vendorcredit', 'vendorreturnauthorization', 'returnauthorization',
                         'journalentry', 'creditcardcharge', 'creditcardrefund', 'creditcardcharge_CardChrg', 'creditcardcharge_CardRfnd'] },
        registrationCode: { id: 'custbody_sii_registration_code', nexus: ['ES'], displayType: 'inline',
            recordType: ['invoice', 'cashsale', 'vendorbill', 'check', 'creditmemo', 'cashrefund', 'customerrefund', 'vendorreturnauthorization', 'returnauthorization',
                         'vendorcredit', 'journalentry', 'creditcardcharge', 'creditcardrefund', 'creditcardcharge_CardChrg', 'creditcardcharge_CardRfnd'] },
        registrationMsg: { id: 'custbody_sii_registration_msg', nexus: ['ES'], displayType: 'inline',
            recordType: ['invoice', 'cashsale', 'vendorbill', 'check', 'creditmemo', 'cashrefund', 'customerrefund', 'vendorreturnauthorization', 'returnauthorization',
                         'vendorcredit', 'journalentry', 'creditcardcharge', 'creditcardrefund', 'creditcardcharge_CardChrg', 'creditcardcharge_CardRfnd'] }
    },
    ENTITY: {
        idType: { id: 'custentity_sii_id_type', nexus: ['ES'], recordType: ['customer', 'vendor'] },
        id: { id: 'custentity_sii_id', nexus: ['ES'], recordType: ['customer', 'vendor'] },
        taxRegNo: { id: 'custentity_tax_reg_no', nexus: ['DE'], recordType: ['customer', 'vendor'] }
    },
    TRANSACTION_COLUMN: {
        annualProrate: { id: 'custcol_sii_annual_prorate', nexus: ['ES'],
            recordType: ['vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg'] },
        serviceDate: { id: 'custcol_sii_service_date', nexus: ['ES'],
            recordType: ['vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg'] },
        exemptLineDetails: { id: 'custcol_sii_exempt_line_details', nexus: ['ES'],
        	recordType: ['invoice', 'cashsale', 'salesorder', 'estimate', 'returnauthorization', 'creditmemo', 'cashrefund', 'customerrefund', 'journalentry'] }
    }
};

TAF.CONSTANTS.TRANSACTION = {
    INVOICE: 'F1',
    EXEMPTION_NO_SURCHARGE: 'S1',
    EXEMPTION_ALL_SURCHARGE: 'S2',
    EXEMPTION_MIXED: 'S3',
    ISSUED_BY_THIRD_PARTY_YES: 'S',
    ISSUED_BY_THIRD_PARTY_NO: 'N',
    SPCL_SCHEME_CODE_BUSINESS_WITH_TAX: '12',
    SPCL_SCHEME_CODE_BUSINESS_WITH_AND_WITHOUT_TAX: '13',
    SPCL_SCHEME_CODE_REAGYP: '02',
    SPCL_SCHEME_CODE_IMPORT: '08',
    SPCL_SCHEME_CODE_RETROACTIVE_RECEIVED: '14',
    SPCL_SCHEME_CODE_RETROACTIVE_ISSUED: '16',
    CORRECTED_INVOICE_TYPE_DIFFERENCE: 'I',
    STATUS: {
        REGISTERED: '1',
        REGISTERED_WITH_ERRORS: '2',
        REJECTED: '3'
    }
};
