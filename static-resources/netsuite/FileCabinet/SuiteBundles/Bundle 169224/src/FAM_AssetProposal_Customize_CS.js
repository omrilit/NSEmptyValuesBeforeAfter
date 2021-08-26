/**
 * � 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

FAM.AssetProposalCustomize_CS = new function () {

    this.Constants = {
        Field_Sublist: {
            ID: 'custpage_fields_sublist',
            Fields: {
                INCLUDE: 'custpage_include',
                FIELD_ID: 'custpage_field_id',
                FIELD_TYPE: 'custpage_field_id'
            }
        },
        Suitelets: {
            Asset_Proposal: {
                ID: 'customscript_fam_assetproposal_su',
                DEPLOYMENT: 'customdeploy_fam_assetproposal_su'
            },
            Asset_Proposal_Customize: {
                ID: 'customscript_fam_assetproposalcustmze_su',
                DEPLOYMENT: 'customdeploy_fam_assetproposalcustmze_su'
            }
        }
    };

    this.doCancel = function doCancel() {
        window.history.back();
    };

    this.doSubmit = function doSubmit() {

        var me = this;

        var url = nlapiResolveURL('SUITELET',
            this.Constants.Suitelets.Asset_Proposal_Customize.ID,
            this.Constants.Suitelets.Asset_Proposal_Customize.DEPLOYMENT);

        var params = JSON.stringify({
            flds: me.getSelectedFields()
        });

        NS.form.setChanged(false);nlapiRequestURL(url, params, null, this.redirectToAssetProposalPage);
    };

    this.doReset = function doReset() {
        page_reset();
    };

    this.getSelectedFields = function getSelectedFields() {

        var fieldArr = [];

        var lineCount = nlapiGetLineItemCount(this.Constants.Field_Sublist.ID);
        for(var i = 1; i <= lineCount; i++) {
            var include = nlapiGetLineItemValue(this.Constants.Field_Sublist.ID, this.Constants.Field_Sublist.Fields.INCLUDE, i);
            if(include == 'T') {
                fieldArr.push(nlapiGetLineItemValue(this.Constants.Field_Sublist.ID, this.Constants.Field_Sublist.Fields.FIELD_ID, i));
            }
        }

        return fieldArr;
    }

    this.redirectToAssetProposalPage = function redirectToAssetProposalPage() {
        var redirectUrl = nlapiResolveURL('SUITELET',
            FAM.AssetProposalCustomize_CS.Constants.Suitelets.Asset_Proposal.ID,
            FAM.AssetProposalCustomize_CS.Constants.Suitelets.Asset_Proposal.DEPLOYMENT);
        window.open(redirectUrl, '_self');
    }
};