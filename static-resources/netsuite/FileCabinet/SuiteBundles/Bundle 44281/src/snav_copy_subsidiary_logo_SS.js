function _RunSchedScript_CopySubLogo()
{
    var SuiteScript = System.Components.Use("SuiteScript");

    var recId = SuiteScript.nlapiGetContext().getSetting("SCRIPT", "custscript_snav_last_rec_id");
    var iteration = SuiteScript.nlapiGetContext().getSetting("SCRIPT", "custscript_snav_iteration");
    
    new _CopySubsidiaryLogo_SS().Run(recId, iteration);
}





function _CopySubsidiaryLogo_SS()
{
    //Dependencies
    var SuiteScript = System.Components.Use("SuiteScript");


    //Interface
    this.Run = _Run;
    

    //Private    
    var _nContext = SuiteScript.nlapiGetContext();
    
    
        
    
    
    function _Run(lastRecId, iteration)
    {
        var recId = lastRecId;
        iteration = iteration == null || iteration == ""? 1: iteration;

        do
        {
            var records = _SearchRecords(recId);
            SuiteScript.nlapiLogExecution("AUDIT", "Iteration: " + iteration, "Record Count: " + records.length);
            
            for (var i = 0; i < records.length; ++i)
            {
                recId = records[i].getId();

                SuiteScript.nlapiLogExecution("AUDIT", "recId", recId);
                
                var rec = SuiteScript.nlapiLoadRecord("subsidiary", recId);
                
                var logoFileId = rec.getFieldValue("logo") || 0;
                var snavFileId = rec.getFieldValue("custrecord_subnav_subsidiary_logo") || 0;

                if (logoFileId != snavFileId)
                {
                    rec.setFieldValue("custrecord_subnav_subsidiary_logo", logoFileId);
                    SuiteScript.nlapiSubmitRecord(rec);
                    //SuiteScript.nlapiSubmitField("subsidiary", recId, "custrecord_subnav_subsidiary_logo", logoFileId);  //Causing error
                }
                
                if(_IsBeyondGovernanceThreshold())
                {
                    SuiteScript.nlapiLogExecution("AUDIT", "Rescheduling Execution", "Last RecId: " + recId);
                    _RescheduleExecution(recId, iteration);
                    
                    return;
                }
            }
            
        } while (records.length >= 1000);
    }





    function _SearchRecords(lastRecId)
    {
        var filters = [
            new SuiteScript.nlobjSearchFilter("isinactive", null, "is", "F")
        ];

        if (lastRecId != null && lastRecId != "")
        {
            filters.push(new SuiteScript.nlobjSearchFilter("internalidnumber", null, "greaterthan", lastRecId));
        }

        var columns = [
            new SuiteScript.nlobjSearchColumn("internalid").setSort()
        ];

        return SuiteScript.nlapiSearchRecord("subsidiary", null, filters, columns) || [];
    }
    
    
    
    
    
    function _IsBeyondGovernanceThreshold()
    {
        var EXECUTION_THRESHOLD = 100;
        
        //Documentation on SSS_TIME_LIMIT_EXCEEDED limit it to 15 minutes.
        var TIME_THRESHOLD = 10 * 60 * 1000;  //10 minutes * 60 seconds * 1000 milliseconds

        var runningTime = (new Date()).valueOf();

        return (_nContext.getRemainingUsage() <= EXECUTION_THRESHOLD) ||  //governance limit
               ((runningTime - _IsBeyondGovernanceThreshold.StartTime) > TIME_THRESHOLD);  //time limit
    }
    _IsBeyondGovernanceThreshold.StartTime = (new Date()).valueOf();
    
    
    
    
    
    function _RescheduleExecution(recId, iteration)
    {
        var scriptParams = {
            custscript_snav_last_rec_id: recId,
            custscript_snav_iteration: iteration + 1
        };

        var result = SuiteScript.nlapiScheduleScript("customscript_snav_copysublogo", "customdeploy_snav_copysublogo", scriptParams);
        if (result != "QUEUED")
        {
            throw new Error("Rescheduling failed.");
        }
    }
}
