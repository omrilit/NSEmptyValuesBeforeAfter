function SubNav_Subsidiary_UE()
{
    //Dependencies
    var SuiteScript = System.Components.Use("SuiteScript");

    //Interface
    this.OnBeforeSubmit = _OnBeforeSubmit;


    function _OnBeforeSubmit(p)
    {
        if (p.OperationType == "create" || p.OperationType == "edit")
        {
            p.NewRecord.setFieldValue("custrecord_subnav_subsidiary_logo", p.NewRecord.getFieldValue("logo"));
        }

        return true;
    }
}





SubNav_Subsidiary_UE.OnBeforeSubmit = function __OnBeforeSubmit(nsType)
{
    var SuiteScript = System.Components.Use("SuiteScript");

    if(nsType != "edit" && nsType != "create")
    {
        return true;
    }

    try
    {
        return new SubNav_Subsidiary_UE().OnBeforeSubmit({
            OperationType: nsType,
            NewRecord: SuiteScript.nlapiGetNewRecord()
        });
    }
    catch (ex)
    {
        //SuiteScript.nlapiLogExecution("ERROR", "Caught exception", JSON.stringify(ex));
    }

    return true;
}
