/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */
define([
    './fam_dict_assetupdate',
    './fam_dict_buildcompoundasset',
    './fam_dict_checksummaries',
    './fam_dict_createassets',
    './fam_dict_deleteforecast',
    './fam_dict_depreciation',
    './fam_dict_deprmonthreport',
    './fam_dict_deprschedreport',
    './fam_dict_disposal',
    './fam_dict_generateassets',
    './fam_dict_migrate',
    './fam_dict_migrate_postingmethods',
    './fam_dict_nobookupdate',
    './fam_dict_postprocess',
    './fam_dict_precalc',
    './fam_dict_proposal',
    './fam_dict_proposalsplit',
    './fam_dict_registerreport',
    './fam_dict_resetassetvalues',
    './fam_dict_revaluation',
    './fam_dict_split',
    './fam_dict_summaryreport',
    './fam_dict_transfer',
    './fam_dict_updatecompound'
], function (dictAssetUpdate, dictBuildCompound, dictCheckSummaries, dictCreate, dictDelete,
    dictDepr, dictDeprMonthReport, dictDeprSchedReport, dictDisposal, dictGenerate, dictMigrate,
    dictPostingTaxMigration, dictNoBookUpdate, dictPostProcess, dictPrecalc, dictProposal,
    dictProposalSplit, dictRegisterReport, dictResetAssetVals, dictRevaluation, dictSplit,
    dictSummaryReport, dictTransfer, dictUpdateCompound) {
    
    var module = {
        assetCreation : [
            dictCreate.Propose,
            dictCreate.Generate
        ],

        assetGeneration : [ dictGenerate ],
        
        assetSplit : [
            dictSplit, 
            dictDelete
        ],

        assetUpdateRecovery : [
            dictAssetUpdate
        ],

        assetValsReset : [
            dictResetAssetVals,
            dictDelete
        ],

        compoundAssetCreation : [ dictBuildCompound ],
   
        compoundAssetUpdate : [
            dictUpdateCompound,
            dictPostProcess
        ],

        depreciation : [
            dictDepr.Precompute,
            dictDepr.CreateJournal,
            dictDepr.Batching,
            dictAssetUpdate,
            dictNoBookUpdate,
            dictUpdateCompound,
            dictPostProcess
        ],

        deprMonthlyReport : [ dictDeprMonthReport ],

        deprSummaryCheck : [
            dictCheckSummaries.CheckSummaries,
            dictCheckSummaries.CreateSummaries
        ],

        disposal : [
            dictDisposal,
            dictPostProcess, 
            dictDelete, 
            dictUpdateCompound,
            dictPostProcess
        ],

        postingTaxMigration : [
            dictPostingTaxMigration.DefAltDepr,
            dictPostingTaxMigration.PropAltDepr,
            dictPostingTaxMigration.AltDepr
        ],

        precalc : [ dictPrecalc ],
       
        precomputeMigration : [
            dictMigrate.NewDepreciating.asset,
            dictMigrate.NewDepreciating.taxMethod,
            dictMigrate.DeleteScheduleDhr,
            dictMigrate.FullyDepreciated.asset,
            dictMigrate.FullyDepreciated.taxMethod,
            dictMigrate.Disposed.asset,
            dictMigrate.Disposed.taxMethod
        ],
       
        proposal : [ dictProposal ],
       
        proposalSplit : [
            dictProposalSplit,
            dictPostProcess
        ],
            
        registerReport : [ dictRegisterReport ],
       
        revaluation : [
            dictRevaluation, 
            dictPostProcess, 
            dictDelete, 
            dictUpdateCompound,
            dictPostProcess
        ],

        // same process is called by 2 different report process id's
        // done to avoid changing report list
        schedReportNBV : [
            dictPrecalc,
            dictDeprSchedReport
        ],

        schedReportPD : [
            dictPrecalc,
            dictDeprSchedReport
        ],

        summaryReport : [ dictSummaryReport ],

        transfer : [
            dictTransfer.TransferValidation,
            dictTransfer.Precompute,
            dictDepr.CreateJournal,
            dictDepr.Batching,
            dictAssetUpdate,
            dictNoBookUpdate,
            dictTransfer.TransferUpdate,
            dictUpdateCompound,
            dictPostProcess,
            dictDelete
        ]
    };
    
    module.bulkTransfer = [dictTransfer.TransferCSV].concat(module.transfer);
    
    return module;
});
