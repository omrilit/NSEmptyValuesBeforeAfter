/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 * @NScriptId _fam_cs_proposalsplit
 * @NScriptType ClientScript
 * @NApiVersion 2.x
 * 
 */

define(['../adapter/fam_adapter_url',
        '../util/fam_util_cs',
        '../util/fam_util_currency',
        '../util/fam_util_proposal',
        '../util/fam_util_validation',
        '../util/fam_util_validation_proposal'
        ],
    function(url, fUtilCS, fCurr, fPropUtil, fUtilVal, fPropVal
            ) {
        var module = {}; 
        this.screenName = 'proposalsplit';
        this.messageIds = {
                ALERT_INVALID_COST       : 'message_sub_proposal_invalid_cost',
                ALERT_INVALID_TOTALCOST  : 'message_sub_proposal_invalid_totalcost',
                ALERT_INVALID_QTY        : 'message_sub_proposal_invalid_qty',
                ALERT_INVALID_TOTALQTY   : 'message_sub_proposal_invalid_totalqty',
                ALERT_INVALID_SPLITCOUNT : 'message_sub_proposal_invalid_splitcount',
                ALERT_INVALID_COSTQTY    : 'message_sub_proposal_splitrem_invalidcostqty',
                ALERT_INVALID_MINAMT     : 'message_sub_proposal_invalid_min_amt',
                CONFIRM_SPLITREM         : 'message_sub_proposal_splitrem_confirm',
                
            };
        
        module.messages = {};
        
        module.pageInit = function(context){
            var rec = context.currentRecord, 
                bgpMsg = rec.getValue({fieldId: 'bgpmsg'});
            if(bgpMsg){
                alert(bgpMsg);
            }
            this.messages = fUtilCS.fetchMessageObj(this.messageIds, this.screenName);
        };
        
        module.validateLine = function(context){
            var rec = context.currentRecord,
                lineCost = rec.getCurrentSublistValue({sublistId: 'splitdetails', fieldId: 'splitcost'}),
                lineQty = rec.getCurrentSublistValue({sublistId: 'splitdetails', fieldId: 'splitqty'}),
                currLine = rec.getCurrentSublistIndex({sublistId: 'splitdetails'}), 
                currLineCount = rec.getLineCount({sublistId: 'splitdetails'}),
                totCost = rec.getValue({fieldId: 'oc'}),
                totQty = rec.getValue({fieldId: 'qty'}),
                remCost = rec.getValue({fieldId: 'remcost'}),
                remQty = rec.getValue({fieldId: 'remqty'});
            
            if(currLine < currLineCount){//editing
                remCost += rec.getSublistValue({sublistId: 'splitdetails', fieldId: 'splitcost', line: currLine});
                remQty += rec.getSublistValue({sublistId: 'splitdetails', fieldId: 'splitqty', line: currLine});
            }
            
            // Split Cost Validations
            if(!fPropVal.isValidCost(lineCost)){
                alert(this.messages.ALERT_INVALID_COST);
                return false;
            }
            
            if(!fPropVal.isValueEnough(lineCost, remCost)){
                alert(fUtilCS.injectMessageParameter(
                        this.messages.ALERT_INVALID_TOTALCOST, 
                        [(totCost-remCost+lineCost).toFixed(2), totCost.toFixed(2)]));
                return false;
            }
            
            // Split Quantity Validations
            if(!fPropVal.isValidQuantity(lineQty)){
                alert(this.messages.ALERT_INVALID_QTY);
                return false;
            }
            
            if(!fPropVal.isValueEnough(lineQty, remQty)){
                alert(fUtilCS.injectMessageParameter(
                        this.messages.ALERT_INVALID_TOTALQTY, 
                        [(totQty-remQty+lineQty).toFixed(2), totQty.toFixed(2)]));
                return false;
            }
            
            rec.setValue({fieldId: 'remcost', value: remCost - lineCost});
            rec.setValue({fieldId: 'remqty', value: remQty - lineQty});
            
            return true;
        };
        
        module.validateDelete = function(context){
            var rec = context.currentRecord,
                lineCost = rec.getCurrentSublistValue({sublistId: 'splitdetails', fieldId: 'splitcost'}),
                lineQty = rec.getCurrentSublistValue({sublistId: 'splitdetails', fieldId: 'splitqty'}),
                remCost = rec.getValue({fieldId: 'remcost'}),
                remQty = rec.getValue({fieldId: 'remqty'});
            
            rec.setValue({fieldId: 'remcost', value: remCost + lineCost});
            rec.setValue({fieldId: 'remqty', value: remQty + lineQty});
            
            return true;
        };
        
        module.saveRecord = function(context){
            var rec = context.currentRecord,
                remCost = rec.getValue({fieldId: 'remcost'}),
                remQty = rec.getValue({fieldId: 'remqty'}),
                totCost = rec.getValue({fieldId: 'oc'}),
                totQty = rec.getValue({fieldId: 'qty'}),
                lineCount = rec.getLineCount({sublistId: 'splitdetails'}),
                isSplitRem = rec.getValue({fieldId: 'splitrem'}); 
            
            var validSplitSublistCountFlag =
                fPropVal.isValidSplitSublistCount(lineCount, isSplitRem, remCost, remQty);
            if(!validSplitSublistCountFlag) {
                alert(this.messages.ALERT_INVALID_SPLITCOUNT);
                return false;
            }
            
            if (isSplitRem) {
                if(!((remCost > 0 && remQty > 0) ||
                    (remCost === 0 && remQty === 0))) {
                    alert(this.messages.ALERT_INVALID_COSTQTY);
                    return false;
                }
                
                var splitInto = 1;
                var iterations = fPropUtil.getSplitIterations(remQty, splitInto);
                var propCurrId = rec.getValue({fieldId: 'curr'});
                var prcn  = fCurr.getPrecision(+propCurrId);
                if (!fPropVal.isMinAmountValid(remCost, iterations, prcn)) {
                    alert(this.messages.ALERT_INVALID_MINAMT);
                    return false;
                }
                
                if((remCost > 0 && remQty > 0) && !confirm(this.messages.CONFIRM_SPLITREM)) {
                    return false;
                }
            }
            else {
                if(remCost > 0){
                    alert(fUtilCS.injectMessageParameter(
                            this.messages.ALERT_INVALID_TOTALCOST, 
                            [(totCost-remCost).toFixed(2), totCost.toFixed(2)]));
                    return false;
                }
                
                if(remQty > 0){
                    alert(fUtilCS.injectMessageParameter(
                            this.messages.ALERT_INVALID_TOTALQTY, 
                            [(totQty-remQty).toFixed(2), totQty.toFixed(2)]));
                    return false;
                }    
            }
            return true;
        };
        
        module.cancelProposalSplit = function() {
            var proposalLink = 
                    url.resolveScript({
                        scriptId            : 'customscript_fam_assetproposal_su',
                        deploymentId        : 'customdeploy_fam_assetproposal_su',
                        returnExternalUrl   : false
                    });
            window.location = proposalLink;
        };
        
        return module;
});