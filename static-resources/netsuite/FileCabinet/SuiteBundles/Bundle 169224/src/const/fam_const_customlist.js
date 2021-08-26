/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */ 
 
define([],

function (){ 
    var constants = {};
    
    constants.PeriodConvention = {
        "12m of 30d" : 1, // 12 months of 30 days each
        "Exact 365d" : 2 // Exact number of days in month, year has 365 days
    };

    constants.AnnualMethodEntry = {
        "Anniversary" : 1,
        "Fiscal Year" : 2
    };        

    constants.MonthNames = {
        January : 1,
        February : 2,
        March : 3,
        April : 4,
        May : 5,
        June : 6,
        July : 7,
        August : 8,
        September : 9,
        October : 10,
        November : 11,
        December : 12
    };
    
    constants.TransactionType = {
        'Acquisition' : 1,
        'Depreciation' : 2,
        'Sale or Disposal' : 3,
        'Write-Down' : 4,
        'Revaluation' : 5,
        'Sale' : 6,
        'Write-Off' : 7,
        'Transfer' : 8
    };

    constants.AssetStatus = {
        "Depreciating" : 2,
        "Fully Depreciated" : 3,
        "Disposed" : 4,
        "Disposed (WO)" : 5,
        "New" : 6,
        "Splitting" : 7,
        "Part Disposed" : 8 // deprecated
    };

    constants.DepreciationRules = {
        "Acquisition" : 1,
        "Disposal" : 2,
        "Pro-rata" : 3,
        "Mid-month" : 4
    };

    constants.FinalPeriodCon = {
        "Fully Depreciate" : 1,
        "Retain Balance" : 2
    };

    constants.BGProcessStatus = {
        InProgress : 1,
        Completed : 2,
        CompletedError : 3,
        Failed : 4,
        Queued : 5,
        Reverting : 6
    };
    
    constants.BGLogMessageType = {
        "Error" : 1,
        "Warning" : 2,
        "Message" : 3
    };

    constants.DeprActive = {
        True : 1,
        False : 2,
        OnProjComp : 3 // On Project Completion
    };

    constants.TaxMethodStatus = {
        "New" : 1,
        "Depreciating" : 2,
        "Fully Depreciated" : 3,
        "Disposed" : 4,
        "Part Disposed" : 5 // deprecated
    };

    constants.Conventions = {
        "None" : 1,
        "Half-Year" : 2,
        "Mid-Quarter" : 3,
        "Mid-Month" : 4
    };

    constants.DeprPeriod = {
        "Monthly" : 1,
        "Annually" : 2,
        "Fiscal Period" : 3,
        "Fiscal Year" : 4
    };

    constants.SummarizeBy = {
        "Asset Type" : 1,
        "Parent" : 2,
        "Sub-Category" : 3
    };

    constants.ProposalStatus = {
        New      : 1,
        Pending  : 2,
        Created  : 3,
        Rejected : 4,
        Combined : 5,
        Split    : 6
    };

    constants.BGPActivityType = {
        Direct : 1,
        Custom : 2,
        Planned : 3
    };

    constants.RevisionRules = {
        RemainingLife : 1,
        CurrentPeriod : 2
    };

    constants.DisposalType = {
        "Sale"      : 1,
        "Write Off" : 2
    };

    constants.ReportType = {
        "Asset Register" : 1,
        "Asset Summary" : 2,
        "DepSchedule NBV" : 3,
        "DepSchedule PD" : 4
    };

    constants.CustomTransactionStatus = {
        "Pending Approval" : "A",
        "Approved" : "B"
    };
    
    constants.ProcessStatus = {
        Queued : 1,
        InProgress : 2,
        Completed : 3,
        Failed : 4,
        Interrupted : 5,
        CompletedWithErrors : 6 // not in list, used only for status page
    };
    
    constants.ProcStageStatus = {
        Initiated : 1,
        InProgress : 2,
        Completed : 3,
        Failed : 4,
        CompletedWithErrors : 5,
        NotRequired : 6
    };
    
    constants.ForecastStatus = {
        Completed : 1
    };
    
    constants.BatchSize = {
        Precalc : 50000,
        PreCalcPeriod : 90,
        AssetUpdateFiles : 500,
        AssetUpdateSlaves : 1000000, // script param length; long text
        Migrate : 50000,
        UpdateNoBook : 300000
    };
    
    constants.FileLimit = {
        CSVLines: 5500
    };
    
    // TODO Move to fam_const_list
    constants.Permissions = {
        None   : 0,
        View   : 1,
        Create : 2,
        Edit   : 3,
        Full   : 4
    };
    
    constants.ScheduleOptions = {
        All: 1,
        Yes: 2,
        No: 3
    };
    
    constants.ErrorHandlingScripts = {
        CheckSummaries: 1,
        AssetUpdate: 2,
    };
    
    return constants; 
});
