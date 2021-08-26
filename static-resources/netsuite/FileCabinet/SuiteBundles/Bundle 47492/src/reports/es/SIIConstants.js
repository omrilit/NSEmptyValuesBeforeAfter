/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.SII = TAF.SII || {};
TAF.SII = TAF.SII || {};

TAF.SII.CONSTANTS = {
    VERSION: '1.1',
    PROGRESS: {
        HEADER: 10,
        REGISTER: 30,
        COMPLETE: 100
    },
    SUBMISSION_TYPE: {
        REGISTRATION: 'A0',
        UPDATE: 'A1'
    },
    FIELD_MAP: {
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
            id: { id: 'custentity_sii_id', nexus: ['ES'], recordType: ['customer', 'vendor'] }
        },
        TRANSACTION_COLUMN: {
            annualProrate: { id: 'custcol_sii_annual_prorate', nexus: ['ES'],
                recordType: ['vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg'] },
            serviceDate: { id: 'custcol_sii_service_date', nexus: ['ES'],
                recordType: ['vendorbill', 'check', 'creditcardcharge', 'creditcardcharge_CardChrg'] },
            exemptLineDetails: { id: 'custcol_sii_exempt_line_details', nexus: ['ES'],
            	recordType: ['invoice', 'cashsale', 'salesorder', 'estimate', 'returnauthorization'] }
        },
    },
    TRANSACTION: {
        INVOICE: 'F1',
        EXEMPTION_NO_SURCHARGE: 'S1',
        EXEMPTION_ALL_SURCHARGE: 'S2',
        EXEMPTION_MIXED: 'S3',
        FLAG_YES: 'S',
        FLAG_NO: 'N',
        SPCL_SCHEME_CODE_BUSINESS_WITH_TAX: '12',
        SPCL_SCHEME_CODE_BUSINESS_WITH_AND_WITHOUT_TAX: '13',
        SPCL_SCHEME_CODE_REAGYP: '02',
        SPCL_SCHEME_CODE_IMPORT: '08',
        SPCL_SCHEME_CODE_LIST: ['01', '02', '04', '07', '08', '10', '11', '12', '13', '14', '15', '16'],
        SPCL_SCHEME_CODE_CUOTADEDUCIBLE_ZERO_LIST: ['03', '04', '05', '06'],
        SPCL_SCHEME_CODE_RETROACTIVE_RECEIVED: '14',
        SPCL_SCHEME_CODE_RETROACTIVE_ISSUED: '16',
        CORRECTED_INVOICE_TYPE_DIFFERENCE: 'I',
        STATUS: {
            REGISTERED: '1',
            REGISTERED_WITH_ERRORS: '2',
            REJECTED: '3'
        }
    },
    ENTITY: {
        ID_TYPE_NIF_VAT: '02'
    },
    REPORT: {
        ISSUED_INVOICE: 'ES_SII_ISSUED_INVOICE',
        RECEIVED_INVOICE: 'ES_SII_RECEIVED_INVOICE',
        INTRA_COMMUNITY_TRANSACTION: 'ES_SII_INTRA_COMMUNITY_TRANSACTION',
        ISSUED_INVOICE_AMENDING_TXN: 'ES_SII_ISSUED_INVOICE_AMENDING_TXN',
        ISSUED_INVOICE_AMENDED_REGISTERED: 'ES_SII_ISSUED_INVOICE_AMENDED_REGISTERED',
        ISSUED_INVOICE_CORRECTED_AMENDING_TXN: 'ES_SII_ISSUED_INVOICE_CORRECTED_AMENDING_TXN',
        RECEIVED_INVOICE_AMENDED_REGISTERED: 'ES_SII_RECEIVED_INVOICE_AMENDED_REGISTERED',
        RECEIVED_INVOICE_AMENDING_TXN: 'ES_SII_RECEIVED_INVOICE_AMENDING_TXN',
        RECEIVED_INVOICE_CORRECTED_AMENDING_TXN: 'ES_SII_RECEIVED_INVOICE_CORRECTED_AMENDING_TXN',
        CASH_COLLECTIONS: 'ES_SII_CASH_COLLECTIONS',
        INVESTMENT_GOODS_REGISTER: 'ES_SII_INVESTMENT_GOODS_REGISTER'
    },
    PERIOD_ANNUAL: '0A',
    CASH_COLLECTIONS_THRESHOLD: 6000,
    MACRODATA_THRESHOLD: 100000000,
    MEMO: {
        NON_DEDUCTIBLE: 'Non-Deductible Tax|Tax Code:',
        REVERSE_CHARGE: 'Reverse Charge Notional Tax Posting|Tax Code:'
    }
};
