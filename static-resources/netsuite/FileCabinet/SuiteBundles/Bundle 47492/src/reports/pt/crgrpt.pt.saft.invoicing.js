/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function PT_SAFT_Invoicing_Report(state, params, output, job) {
    this.taxAccountingBasis = 'F';
    PT_SAFT_Report_v2.call(this, state, params, output, job);
    
    this.GetOutline = function GetOutline() {
        return {
            "Section": this.AuditFile,
            "SubSections": [
                {"Section": this.Header},
                {
                    "Section": this.MasterFiles,
                    "SubSections": [
                        {"Section": this.Customers},
                        {"Section": this.Suppliers},
                        {"Section": this.Products},
                        {"Section": this.TaxTable}
                    ]
                },
                {
                    "Section": this.SourceDocuments,
                    "SubSections": [
                        {"Section": this.SalesInvoices},
                        {"Section": this.MovementOfGoods},
                        {"Section": this.WorkingDocuments},
                        {"Section": this.Payments}
                    ]
                }
            ]
        };
    };
}

PT_SAFT_Invoicing_Report.IsCRGReport = true;
PT_SAFT_Invoicing_Report.ReportId = "SAFT_PT_INVOICING_XML";
