/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function PT_SAFT_Accounting_Report(state, params, output, job) {
    var _Output = output;
    
    this.taxAccountingBasis = 'C';
    PT_SAFT_Report_v2.call(this, state, params, output, job);

    this.GetOutline = function GetOutline() {
        return {
            "Section": this.AuditFile,
            "SubSections": [
                {"Section": this.Header},
                {
                    "Section": this.MasterFiles,
                    "SubSections": [
                        {"Section": this.GeneralLedger},
                        {"Section": this.Customers},
                        {"Section": this.Suppliers},
                        {"Section": this.TaxTable}
                    ]
                },
                {"Section": this.GeneralLedgerEntries},
                {
                    "Section": this.SourceDocuments,
                    "SubSections": [
                        {"Section": this.Payments}
                    ]
                }
            ]
        };
    };
    
    this.SourceDocuments = function() {
    	var acctngPref = nlapiLoadConfiguration('accountingpreferences');
    	var isCashBasis = acctngPref.getFieldValue('cashbasis') == 'T';

    	if (!isCashBasis) {
    		return;
    	}
    	
        this.On_Header = _OnHeader;
        this.On_Footer = _OnFooter;

        function _OnHeader() {
            _Output.WriteLine("<SourceDocuments>");
        }

        function _OnFooter() {
            _Output.WriteLine("</SourceDocuments>");
        }
    };
}

PT_SAFT_Accounting_Report.IsCRGReport = true;
PT_SAFT_Accounting_Report.ReportId = "SAFT_PT_ACCOUNTING_XML";
