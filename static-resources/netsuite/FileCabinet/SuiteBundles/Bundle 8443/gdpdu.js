//Global Mining  : 578996
//German OneWord : 1018013
//AusPot : 250617
var ns;
if (!ns) ns = {};
ns.GdpDu = {};




function main(request, response)
{
    var app = new ns.GdpDu.Application(request, response);
    app.Run();
}




function client_save_record()
{
    var msg = 'You have initiated the generation of audit files.\n\n' +
    'This process might take some time to complete depending on the volume of data.\n' +
    'Upon completion, you will receive an email instruction on how to retrieve the generated files.\n\n' +
    'Press OK to continue.';
    var answer = false;
    return confirm(msg);
}




function client_changed_function(type, name, linenum)
{
    if (name == "subsidiaryid") 
    {
        var subId = nlapiGetFieldValue("subsidiaryid");
        if (subId != "") {
            var sub = new ns.GdpDu.Subsidiary(subId);
            
            nlapiSetFieldValue("companyname", sub.Name, false);
			nlapiSetFieldValue("country", sub.Country, false);
            nlapiSetFieldValue("zipcode", sub.ZipCode, false);
			nlapiSetFieldValue("region", sub.State, false);
			nlapiSetFieldValue("street", sub.Address, false);
			//nlapiSetFieldValue("phone", sub.Phone, false);
			nlapiSetFieldValue("registration", sub.TaxId, false);

        }
    }
}




function client_btnSave_onclick()
{
	main_form.submit();
}




//==============================================================================
ns.GdpDu.Application = function Application()
{
    var _Params = InitParams(request.getAllParameters());
    var _IsPostBack = request.getMethod() == "POST";
    var _IsSubsidiaryEnabled = (nlapiGetContext()).getSetting("FEATURE","SUBSIDIARIES") == "T";
    var _Form = null;
    var _StateEngine = new ns.JsPersistence.ScriptState("gdpdu.js");
	var _RM = new ns.Resources.ResourceManager("gdpdu.js");

	
	

    
	
   
    //--------------------------------------------------------------------------
    this.Run = function Run()
	{
        if(_IsPostBack)
		{
            GenerateReports();
            
            nlapiSetRedirectURL('SUITELET', 'customscript_gdpdu', 'customdeploy_gdpdu_dp', null, _Params);
			
			_StateEngine.Save( _Params);
        }
        else
		{
			_Params = _StateEngine.Load();
            DisplayForm();
        }
        
        
    }
    
    
    
    //--------------------------------------------------------------------------
    function GenerateReports()
	{
        var company = new ns.GdpDu.CompanyProfile(
            _Params["companyname"],
            _Params["registration"],
            _Params["street"],
            _Params["zipcode"],
            _Params["region"],
            _Params["country"],
            //_Params["currency"],
            "Euro",					
            _Params["phone"],
            _Params["fax"],
            //_Params["accountingbasis"],
            "Invoice Basis",
            _Params["basecofa"]);
        
        var audit = new ns.GdpDu.AuditProfile(
        	//_Params["auditversion"],
        	"gdpdu-01-08-2003",
        	_Params["period"],
        	_Params["firstmonth"],
        	_Params["outputfolder"],
        	_Params["subsidiaryid"],
        	new Date());
        
        var gdpdu = new ns.GdpDu.GdpDu(company, audit,_RM);
        
        _Params["lastoutput"] = gdpdu.Generate();
    }
    
    
    
    //--------------------------------------------------------------------------
    function DisplayForm()
    {
        _Form = nlapiCreateForm(_RM.GetString("AuditFileGeneration"), false);
        _Form.setScript("customscript_gdpdu_client");
        
        if(_IsSubsidiaryEnabled)
        {
        	var fldSubsidiary = _Form.addField("subsidiaryid", "select", _RM.GetString("Subsidiary"), "subsidiary");
        	fldSubsidiary.setMandatory(true);
        	if(_Params["subsidiaryid"] != null)
        		fldSubsidiary.setDefaultValue(_Params["subsidiaryid"]);
        }
			
        CreateInputField("companyname", "text", _RM.GetString("Name"), true, _Params["companyname"]);
        CreateInputField("registration", "text", _RM.GetString("CompanyId"), true, _Params["registration"]);
        CreateInputField("street", "text", _RM.GetString("Address"), true, _Params["street"]);
        CreateInputField("zipcode", "text", _RM.GetString("ZipCode"), true, _Params["zipcode"]);
        CreateInputField("region", "text", _RM.GetString("Region"), true, _Params["region"]);
        CreateInputField("country", "text", _RM.GetString("Country"), true, _Params["country"]);
        CreateInputField("phone", "text", _RM.GetString("Phone"), false, _Params["phone"]);
        CreateInputField("fax", "text", _RM.GetString("Fax"), false, _Params["fax"], true);
		
        var fldAuditVersion = CreateInputField("auditversion", "text", _RM.GetString("AuditFileVersion"), false, "gdpdu-01-08-2003", false);
		fldAuditVersion.setLayoutType("normal", "startcol");
		InitPeriod();
		InitMonths();
        CreateInputField("accountingbasis", "text", _RM.GetString("AccountingBasis"), false, "Invoice Basis", false);
        CreateInputField("currency", "text", _RM.GetString("Currency"), false, "Euro", false);
        CreateInputField("basecofa", "text", _RM.GetString("BaseChartOfAccounts"), false, "SKR-03");
        CreateInputField("outputfolder", "text", _RM.GetString("OutputFolder"), true, _Params["outputfolder"]==null? _RM.GetString("DefaultOutputFolder"): _Params["outputfolder"]);
        CreateInputField("remind1", "inlinehtml", "Reminder", false, _RM.GetString("ReminderLine1"));
        CreateInputField("remind2", "inlinehtml", "Reminder", false, _RM.GetString("ReminderLine2"));
        CreateInputField("remind3", "inlinehtml", "Reminder", false, _RM.GetString("ReminderLine3"));

        if( _Params["lastoutput"] != null)
        	_Form.addPageLink("crosslink", "Output", _Params["lastoutput"]);

       	_Form.addSubmitButton(_RM.GetString("GenerateReports"));

        response.writePage(_Form);
    }
    
    
    
    //--------------------------------------------------------------------------
    function CreateInputField(name, type, label, isMandatory, defaultValue, isEnabled)
    {
        var field = _Form.addField(name, type, label);
        
        if(isMandatory) 
            field.setMandatory(isMandatory);
        
        if( defaultValue != null)
            field.setDefaultValue(defaultValue);
			
        
        if (isEnabled != null && !isEnabled) 
            field.setDisplayType("disabled");
        
        return field;
    }
    
    
    
    //--------------------------------------------------------------------------
    function InitPeriod()
	{
		var fldPeriod = CreateInputField("period", "select", _RM.GetString("FinancialYear"));
        var accountingPeriods = new ns.GdpDu.AccountingPeriods();
        var years = accountingPeriods.GetYears();
        for (var i in years) 
            fldPeriod.addSelectOption(years[i].Id, years[i].Name);
			
		if(_Params["period"] != null)
			fldPeriod.setDefaultValue(_Params["period"]);
    }
    
    
    
    //--------------------------------------------------------------------------
    function InitMonths(fld1stMonth)
	{
		var fld1stMonth = CreateInputField("firstmonth", "select", _RM.GetString("FirstFiscalMonth"));
		
        fld1stMonth.addSelectOption(_RM.GetString("January"), _RM.GetString("January"));
        fld1stMonth.addSelectOption(_RM.GetString("February"), _RM.GetString("February"));
        fld1stMonth.addSelectOption(_RM.GetString("March"), _RM.GetString("March"));
        fld1stMonth.addSelectOption(_RM.GetString("April"), _RM.GetString("April"));
        fld1stMonth.addSelectOption(_RM.GetString("May"), _RM.GetString("May"));
        fld1stMonth.addSelectOption(_RM.GetString("June"), _RM.GetString("June"));
        fld1stMonth.addSelectOption(_RM.GetString("July"), _RM.GetString("July"));
        fld1stMonth.addSelectOption(_RM.GetString("August"), _RM.GetString("August"));
        fld1stMonth.addSelectOption(_RM.GetString("September"), _RM.GetString("September"));
        fld1stMonth.addSelectOption(_RM.GetString("October"), _RM.GetString("October"));
        fld1stMonth.addSelectOption(_RM.GetString("November"), _RM.GetString("November"));
        fld1stMonth.addSelectOption(_RM.GetString("December"), _RM.GetString("December"));
    
		var defaultValue = _Params["firstmonth"] == null? _RM.GetString("January"): _Params["firstmonth"];  
       	fld1stMonth.setDefaultValue( defaultValue);
    }
    
    
    
    //--------------------------------------------------------------------------
    function InitParams(allParams)
    {
        var params = {};
        
        for (var i in allParams)
		{
            params[i] = allParams[i];
        }
        
        return params;
    }
}
//==============================================================================




//==============================================================================
ns.GdpDu.GdpDu = function GdpDu(company, audit, resourceMgr)
{
    var m_Company = company;
    var m_Audit = audit;
    var _RM = resourceMgr;
    var _FolderUrl = null;
    var _IsMultiCurrency = (nlapiGetContext()).getSetting("FEATURE","MULTICURRENCY") == "T";
    
    this.HasNotifications = true;
    this.Reports = [];
    this.ReportFolder = "audit" +
    	m_Audit.Time.getFullYear().toString() +  
    	(m_Audit.Time.getMonth()<9?"0":"") + (1+m_Audit.Time.getMonth()).toString() +
    	(m_Audit.Time.getDate()<10?"0":"") + (m_Audit.Time.getDate()).toString();  
    
    
    //----------------------------------------------------------------------------
    this.Generate = function Generate()
	{
        with( this)
        {
            SendJobStartedEmail();
            
            var formatter = new ns.GdpDu.Formatter("DD.MM.YYYY", ",", ".", "\t", 2);
            var reports =
            [
                new ns.GdpDu.CompanyFile(formatter, m_Company, m_Audit),
                new ns.GdpDu.AnnualVATReport(formatter, m_Audit.SubsidiaryId, m_Audit.PeriodId),
                new ns.GdpDu.TaxcodeFile(formatter, m_Audit.SubsidiaryId),
                new ns.GdpDu.COFAFile(formatter, m_Audit.SubsidiaryId, m_Audit.PeriodId),
                new ns.GdpDu.JournalReport(formatter, m_Audit.SubsidiaryId, m_Audit.PeriodId, _IsMultiCurrency, m_Company.Currency),
                new ns.GdpDu.ReceivablesReport(formatter, m_Audit.SubsidiaryId, m_Audit.PeriodId),
   				new ns.GdpDu.PayablesReport(formatter, m_Audit.SubsidiaryId, m_Audit.PeriodId),
				new ns.GdpDu.GeneralLedgerReport(formatter, m_Audit.SubsidiaryId, m_Audit.PeriodId),
   				new ns.GdpDu.SumsAndBalancesReport(formatter, m_Audit.SubsidiaryId, m_Audit.PeriodId),
   				new ns.GdpDu.DTDFile()
            ];
            
            reports.push(new ns.GdpDu.ReportIndex(formatter, m_Company, reports));
            
            var reportJob = new ns.GdpDu.ReportingJob(null, reports)
            
            var reportFolderId = InitReportFolder();
            _FolderUrl = this.GetHost() + this.GetFolderURL( reportFolderId);
            PrintReports(reportFolderId, reportJob);
            
            SendJobFinishedEmail(reportFolderId);
        }
        return _FolderUrl;
    }
    
    
    
    
    
    //---------------------------------------------------------------------------------
    this.PrintReports = function PrintReports(folderId, reportJob)
    {
        for( var i in reportJob.Reports) {
            var file = nlapiCreateFile(reportJob.Reports[i].FileName, reportJob.Reports[i].FileType, reportJob.Reports[i].Generate());
            file.setFolder(folderId);
            nlapiSubmitFile(file);
        }
    }
    
    
    
    
    
    //----------------------------------------------------------------------------
    this.SendJobStartedEmail = function SendJobStartedEmail(){
        if (!this.HasNotifications) 
            return;
        
        var msg = _RM.GetString("JobStartedMessage");
        msg = msg.replace("PeriodName", m_Audit.GetPeriodName());
        
        SendEmail(msg);
    }
    
    
    
    
    //----------------------------------------------------------------------------
    this.SendJobFinishedEmail = function SendJobFinishedEmail(reportFolderId)
    {
        if (!this.HasNotifications) 
            return;
        
        var msg = _RM.GetString("JobCompletedMessage");
        msg = msg.replace(/PeriodName/g, m_Audit.GetPeriodName());
        msg = msg.replace(/RootFolder/g, m_Audit.RootFolder);
        msg = msg.replace(/ReportFolder/g, this.ReportFolder);
        msg = msg.replace(/FolderUrl/g, _FolderUrl);
        
        SendEmail(msg);
    }
    
    
    
    
    //----------------------------------------------------------------------------
    this.InitReportFolder = function InitReportFolder()
    {
        //Ensure root folder exists
        var rootFolderId = this.CreateFolder(m_Audit.RootFolder);
        
        
        //Ensure report subfolder exists
        var reportFolderName = this.ReportFolder;
        
	    var filters = [
           new nlobjSearchFilter('name', null, 'startswith', this.ReportFolder),
	       new nlobjSearchFilter('parent', null, 'is', rootFolderId)
        ];
	    
	    var columns = [new nlobjSearchColumn("internalid",null,"count")];
	    
	    var folder = nlapiSearchRecord('folder', null, filters, columns);
    	var dr = new ns.DataAccess.DataRow( folder[0]);
    	var ctr = parseInt(dr.internalid);
    	if( ctr>0)
    	{
    		ctr++;
    		var sCounter = (ctr<10? "0": "") + ctr; 
    		reportFolderName += "(" + sCounter + ")";
    	}

        
        return this.CreateFolder(reportFolderName, rootFolderId);
    }
    
    
    
    
    //----------------------------------------------------------------------------
    this.CreateFolder = function CreateFolder(folderName, parentFolderId)
    {
        var filters = [new nlobjSearchFilter('name', null, 'is', folderName)];
        if ((parentFolderId != undefined) && (parentFolderId != null)) 
            filters.push(new nlobjSearchFilter('parent', null, 'is', parentFolderId));
        
        var columns = [new nlobjSearchColumn("internalid")];
        
        var folder = nlapiSearchRecord('folder', null, filters, columns);
        
        
        if (folder == null || folder.length <= 0) {
            var newFolder = nlapiCreateRecord("folder");
            
            newFolder.setFieldValue("name", folderName);
            
            if ((parentFolderId != undefined) && (parentFolderId != null)) 
                newFolder.setFieldValue('parent', parentFolderId)
            
            return nlapiSubmitRecord(newFolder);
        }
        
        return folder[0].getValue('internalid');
    }
    
   
    
    
    //----------------------------------------------------------------------------
    this.GetFolderURL = function GetFolderURL(folderId)
    {
        if (folderId == undefined || folderId == null) 
            return "";
        
        var filters = [new nlobjSearchFilter('internalid', null, 'is', folderId)];
        var columns = [new nlobjSearchColumn("folderurl")];
        
        var folders = nlapiSearchRecord('folder', null, filters, columns);
        
        return (folders == null || folders.length <= 0) ? "" : folders[0].getValue("folderurl");
    }
    
    
    
    //----------------------------------------------------------------------------
    this.GetHost = function GetHost(){
        var url = request.getURL();
        var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
        
        return url.match(re)[0].toString();
    }
    
    
    
    //-----------------------------------------------------------------------------
    function SendEmail(msg){
        var context = nlapiGetContext();
        
        var sendEmail = nlapiSendEmail(context.getUser(), context.getEmail(), 'Audit Reports Generation', msg);
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.AccountingPeriods = function AccountingPeriods()
{
    var m_Data = null;
    
    
    //----------------------------------------------------------------------------
    this.GetAll = GetAll;
    function GetAll()
    {
        var columns = GetDataColumns();
        columns[0].setSort();
        
        var periods = nlapiSearchRecord("accountingperiod", null, null, columns);
        if (periods == null) 
            periods = new Array();
        
        var doc = nlapiStringToXML("<?xml version='1.0' encoding='UTF-8' ?><Periods />");
        
        for( var i in periods)
        {
            var dr = new ns.DataAccess.DataRow(periods[i])
            
            var periodNode = doc.createElement("p_" + dr.internalid);
            periodNode.setAttribute("id", dr.internalid);
            periodNode.setAttribute("name", dr.periodname);
            periodNode.setAttribute("startdate", dr.startdate);
            periodNode.setAttribute("enddate", dr.enddate);
            
            var isYear = dr.isyear == "T";
            var isQuarter = dr.isquarter == "T";
            var isAdjustment = dr.isadjust == "T";
            periodNode.setAttribute("type", isAdjustment ? "adjustment" : isYear ? "year" : isQuarter ? "quarter" : "month");
            
            var isActive = dr.isinactive == "F";
            periodNode.setAttribute("isactive", isActive ? 1 : 0);
            
            var parentId = dr.parent;
            var parentNode = parentId == "" ? doc.getDocumentElement() : doc.getElementsByTagName("p_" + parentId).item(0);
            
            parentNode.appendChild(periodNode);
        }
        
        m_Data = doc;
    }
    
    
    
    
    //----------------------------------------------------------------------------
    this.GetDescendantIds = GetDescendantIds;
    function GetDescendantIds(periodId)
    {
        var period = FindPeriod(periodId);
        if (period == null) 
            return [];
        
        var descendantIds = "";
        var childPeriods = period.getElementsByTagName("*");
        for (var i = 0; i < childPeriods.getLength(); ++i)
        {
            descendantIds += (descendantIds == "" ? "" : ",") + childPeriods.item(i).getAttribute("id");
        }
        
        return descendantIds;
    }
    
    
    
    
    //----------------------------------------------------------------------------
    this.GetAllChildren = GetAllChildren;
    function GetAllChildren(periodId)
    {
        if (m_Data == null) 
            GetAll();
        
        var period = FindPeriod(periodId);
        if (period == null) 
            return [];
        
        
        var childPeriods = period.getElementsByTagName("*");
        var children = [];
        
        for (var i = 0; i < childPeriods.getLength(); ++i)
        {
            children.push(ConvertElementToPeriod(childPeriods.item(i)));
        }
        
        return children;
    }
    
    
    
    
    //----------------------------------------------------------------------------
    this.GetPreviousPeriods = GetPreviousPeriods;
    function GetPreviousPeriods(periodId)
    {
        if (m_Data == null) 
            GetAll();
        
        var period = FindPeriod(periodId);
        if (period == null) 
            return null;
        
        var periodStartDate = nlapiStringToDate(period.getAttribute("startdate"));
        
        var previousPeriods = (m_Data.getDocumentElement()).getElementsByTagName("*");
        
        var sPeriods = "";
        for( var i = 0; i < previousPeriods.getLength(); ++i)
        {
            var candidatePeriod = previousPeriods.item(i);
            var candidatePeriodEndDate = nlapiStringToDate(candidatePeriod.getAttribute("enddate"));
            
            if (candidatePeriodEndDate < periodStartDate)
            {
                sPeriods += (sPeriods == "" ? "" : ",") + candidatePeriod.getAttribute("id");
            }
        }
        
        return sPeriods;
    }
    
    
    
    
    //----------------------------------------------------------------------------
    this.Generate = Generate;
    function Generate()
    {
        if(m_Data == null) 
            this.GetAll();
        
        return nlapiXMLToString(m_Data);
    }
    
    
    
    
    //----------------------------------------------------------------------------
    this.GetYears = GetYears;
    function GetYears(){
        var filters = [new nlobjSearchFilter("isinactive", null, "is", "F"), new nlobjSearchFilter("isyear", null, "is", "T")];
        
        var columns = GetDataColumns();
        columns[1].setSort(true); //Sort by year/name
        var result = nlapiSearchRecord("accountingperiod", null, filters, columns);
        if (result == null) 
            return [];
        
        
        var yearPeriods = [];
        for (var i in result) {
            yearPeriods.push(ConvertRowToPeriod(result[i]));
        }
        
        return yearPeriods;
    }
    
    
    
    
    //----------------------------------------------------------------------------
    this.GetPeriodById = GetPeriodById;
    function GetPeriodById(periodId)
    {
        var filters = [new nlobjSearchFilter("internalid", null, "is", periodId)];
        
        var result = nlapiSearchRecord("accountingperiod", null, filters, GetDataColumns());
        
        if (result == undefined || result == null || result.length == 0) 
            return null;
        
        return ConvertRowToPeriod(result[0])
    }
    
    
    
    
    //----------------------------------------------------------------------------
    function GetDataColumns()
    {
        return [
            new nlobjSearchColumn("internalid", null, null),
            new nlobjSearchColumn("periodname", null, null),
            new nlobjSearchColumn("startdate", null, null),
            new nlobjSearchColumn("enddate", null, null),
            new nlobjSearchColumn("isinactive", null, null),
            new nlobjSearchColumn("isyear", null, null),
            new nlobjSearchColumn("isquarter", null, null),
            new nlobjSearchColumn("isadjust", null, null),
            new nlobjSearchColumn("parent", null, null)
        ];
    }
    
    
    
    
    //----------------------------------------------------------------------------
    function ConvertRowToPeriod(row)
    {
        var dr = new ns.DataAccess.DataRow(row);
        
        var isYear = dr.isyear == "T";
        var isQuarter = dr.isquarter == "T";
        var isActive = dr.isinactive == "F";
        
        return new ns.GdpDu.Period(dr.internalid, dr.periodname, new Date(dr.startdate), new Date(dr.enddate), (isYear ? "year" : isQuarter ? "quarter" : "month"), isActive);
    }
    
    
    
    
    //----------------------------------------------------------------------------
    function ConvertElementToPeriod(element)
    {
        return new ns.GdpDu.Period(
        		element.getAttribute("id"), 
        		element.getAttribute("name"), 
        		new Date(element.getAttribute("startdate")), 
        		new Date(element.getAttribute("enddate")), 
        		element.getAttribute("type"), 
        		element.getAttribute("isactive") == "1");
    }
    
    
    
    
    //----------------------------------------------------------------------------
    function FindPeriod(periodId)
    {
        var periods = GetData().getElementsByTagName("p_" + periodId);
        
        if (periods == null || periods.getLength() <= 0) 
            return null;
        
        return periods.item(0);
    }
    
    
    
    
    //----------------------------------------------------------------------------
    function GetData(){
        if (m_Data == null) //Make sure accounting periods data are loaded
            GetAll();
        
        return m_Data;
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.Period = function Period(id, name, startDate, endDate, type, isActive){
    this.Id = id;
    this.Name = name;
    this.StartDate = startDate;
    this.EndDate = endDate;
    this.Type = type;
    this.IsActive = isActive;
}
//==============================================================================





//==============================================================================
ns.GdpDu.TaxcodeFile = function TaxcodeFile(formatter, subsidiaryId)
{
    var _Delimiter = formatter.ColumnSeparator;
    var _Formatter = formatter;
    var _Columns = _InitColumns();
    var _SubsidiaryId = subsidiaryId;
    
    this.FileName = "taxcodelist.txt";
    this.FileType = "PLAINTEXT";
    this.Description = "List of tax codes";
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return _Columns;
    }
    
    
    
    //-----------------------------------------------------------------------------
    this.Generate = function Generate()
    {
    	if(_SubsidiaryId != null)
    		var filters = [new nlobjSearchFilter("country", null, "is", "DE")];
        
        var columns = [new nlobjSearchColumn("itemid"), new nlobjSearchColumn("rate"), new nlobjSearchColumn("description")];
        
        var result = nlapiSearchRecord("salestaxitem", null, filters, columns);
        
        
        var s = _GetHeader();
        
        for (var i in result) {
            var dr = new ns.DataAccess.DataRow(result[i]);
            
            s += _GetLine([dr.itemid, dr.rate, dr.description]);
        }
        
        return s;
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _InitColumns(){
        var columns = [new ns.GdpDu.ReportColumn("Tax_Code", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Tax_Percentage", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Tax_Code_Description", "AlphaNumeric")];
        
        return columns;
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _GetHeader(){
        var sHeading = "";
        
        for (var i in _Columns) {
            sHeading += (sHeading == "" ? "" : _Delimiter) + _Columns[i].Name;
        }
        
        return sHeading + "\r\n";
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _GetLine(line)
    {
        var sLine = "";
        for (var i in line) 
        {
        	var columnType = _Columns[i] == null? "AlphaNumeric": _Columns[i].Type;
            sLine += (i == 0 ? "" : _Delimiter) + _Formatter.Format(line[i], columnType);
        }
        
        return sLine + "\r\n";
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.CompanyFile = function CompanyFile(formatter, companyProfile, auditProfile)
{
    var _Delimiter = formatter.ColumnSeparator;
    var _Columns = _InitColumns();
    var m_Company = companyProfile;
    var m_Audit = auditProfile
    var _Formatter = formatter;
    
    this.FileName = "company.txt";
    this.FileType = "PLAINTEXT";
    this.Description = "Company information";
    this.IsIndexeable = true;
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return _Columns;
    }
    
    
    
    //-----------------------------------------------------------------------------
    this.Generate = function Generate()
    {
        return _GetHeader() +
        	_GetLine(
        		[m_Audit.Version,
        		 m_Company.Registration,
        		 m_Company.Name,
        		 m_Company.Street,
        		 m_Company.ZipCode,
        		 m_Company.Region,
        		 m_Company.Country,
        		 m_Audit.GetPeriodName(),
        		 m_Audit.FirstMonth,
        		 m_Company.Currency,
        		 m_Company.Phone,
        		 m_Company.Fax,
        		 m_Company.AccountingBasis]);

    }
    
    
    
    //----------------------------------------------------------------------------	
    this._InitColumns = _InitColumns()
    function _InitColumns(){
        var columns = [
			new ns.GdpDu.ReportColumn("Audit_File_Version", "AlphaNumeric"), 
			new ns.GdpDu.ReportColumn("Company_ID", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("Company_Name", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("Street", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("Postal_Code", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("Region", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("Country", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("Financial_Year", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("First_Fiscal_Month", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("Currency", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("Telephone", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("Fax", "AlphaNumeric"),
			new ns.GdpDu.ReportColumn("Accounting_Basis", "AlphaNumeric")
		];
        
        return columns;
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _GetHeader(){
        var sHeading = "";
        
        for (var i in _Columns) {
            sHeading += (sHeading == "" ? "" : _Delimiter) + _Columns[i].Name;
        }
        
        return sHeading + "\r\n";
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _GetLine(line)
    {
        var sLine = "";
        for (var i in line) 
        {
        	var columnType = _Columns[i] == null? "AlphaNumeric": _Columns[i].Type;
            sLine += (i == 0 ? "" : _Delimiter) + _Formatter.Format(line[i], columnType);
        }
        
        return sLine + "\r\n";
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.COFAFile = function COFAFile(formatter, subsidiary, periodId)
{
    var _Delimiter = formatter.ColumnSeparator;
    var _Formatter = formatter;
    var _Columns = _InitColumns();
    var _Subsidiary =  subsidiary;
    var _PeriodId = periodId
    
    this.FileName = "accountslist.txt";
    this.FileType = "PLAINTEXT";
    this.IsIndexeable = true;
    this.Description = "Chart of accounts data";
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return _Columns;
    }
    
    
    //-----------------------------------------------------------------------------
    this.Generate = function Generate()
    {
        var arrayCoaField = new Array();
        arrayCoaField['Bank'] = 'Current Assets|ASSETS';
        arrayCoaField['AccountsReceivable'] = 'Current Assets|ASSETS';
        arrayCoaField['OtherCurrentAsset'] = 'Current Assets|ASSETS';
        arrayCoaField['UnbilledReceivable'] = 'Unbilled Receivable|Current Assets|ASSETS';
        arrayCoaField['FixedAsset'] = 'Fixed Assets|ASSETS';
        arrayCoaField['OtherAsset'] = 'Other Assets|ASSETS';
        arrayCoaField['DeferredExpense'] = 'Deferred Expense|ASSETS';
        arrayCoaField['AccountPayable'] = 'Current Liabilities|LIABILITIES & EQUITY';
        arrayCoaField['CreditCard'] = 'Current Liabilities|LIABILITIES & EQUITY';
        arrayCoaField['OtherCurrentLiability'] = 'Current Liabilities|LIABILITIES & EQUITY';
        arrayCoaField['LongTermLiability'] = 'Long Term Liability|LIABILITIES & EQUITY';
        arrayCoaField['Equity'] = 'Equity|LIABILITIES & EQUITY';
        arrayCoaField['DeferredRevenue'] = 'Deferred Revenue|LIABILITIES & EQUITY';
        arrayCoaField['Income'] = 'Income|INCOME';
        arrayCoaField['OtherIncome'] = 'Other Income|INCOME';
        arrayCoaField['CostofGoodsSold'] = 'Expense|EXPENSE';
        arrayCoaField['Expense'] = 'Expense|EXPENSE';
        arrayCoaField['OtherExpense'] = 'Other Expense|EXPENSE';
        arrayCoaField['AccountsPayable'] = 'Current Liabilities|LIABILITIES & EQUITY';
        //arrayCoaField['NonPosting']= 'Current Liabilities|LIABILITIES & EQUITY';
        
        var NONPOSTING = 'Non Posting';
        
        
        //var result = LoadData();
        var result = LoadTransactions();
        
        var s = _GetHeader();
        
        // build the lines from search...
        for( var recCounter in result)
        {
            var dr = new ns.DataAccess.DataRow(result[recCounter])
            
            var acctType = dr.account_type;  //var acctType = dr.type;
            var acctTypeLabel = '';
            var cofaArrLabel = '';
            
            if (dr.account_type == NONPOSTING)  //if (dr.type == NONPOSTING) 
                continue;
            
            
            //if (dr.type != null && dr.type != "")
            if(dr.account_type != null && dr.account_type != "")
            {
                //acctTypeLabel = (dr.type).split(" ");
                acctTypeLabel = (dr.account_type).split(" ");
            }
            
            for (var i = 0; i < acctTypeLabel.length; i++)
            {
                cofaArrLabel += trim(acctTypeLabel[i]);
            }
            
            var arrayitem = arrayCoaField[cofaArrLabel];
            if (arrayitem == null)
            {
                arrayitem = "undefined|undefined";
            }
            
            
            var categArr = arrayitem.split("|");
            var category = rtrim(categArr[1]);
            var subcategory = ltrim(categArr[0]);
            //var accountId = dr.number; //dr.number == ""? ("_" + dr.internalid): dr.number;
            //s += _GetLine([accountId, _Formatter.FormatAccountName(dr.number, dr.name), category, subcategory, dr.type]);
            var accountId = dr.account_number;
            s += _GetLine([accountId, _Formatter.FormatAccountName(dr.account_number, dr.account_name), category, subcategory, dr.account_type]);
            
        }
        
        return s;
    }
    
    
    
    //--------------------------------------------------------------------------	
    function _InitColumns(){
        var columns = [new ns.GdpDu.ReportColumn("Account_ID", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Description", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Category", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Subcategory", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Account_Type", "AlphaNumeric")];
        
        return columns;
    }
    
    
    
    //--------------------------------------------------------------------------	
    function _GetHeader(){
        var sHeading = "";
        
        for (var i in _Columns) {
            sHeading += (sHeading == "" ? "" : _Delimiter) + _Columns[i].Name;
        }
        
        return sHeading + "\r\n";
    }
    
    
    
    //--------------------------------------------------------------------------	
    function LoadData()
    {
        var columns = [
            new nlobjSearchColumn("number"), 
            new nlobjSearchColumn("name"), 
            new nlobjSearchColumn("type"), 
            new nlobjSearchColumn("internalid")
        ];
        
        var result = nlapiSearchRecord("account", null, null, columns);
        
        return result ? result : new Array();
    }
    
    
    
    
    //--------------------------------------------------------------------------	
    function LoadTransactions()
    {
        var filters = [];
        filters.push(new nlobjSearchFilter("posting", null, "is", "T"));
        
        if(_Subsidiary != null) 
            filters.push(new nlobjSearchFilter("subsidiary", null, "is", _Subsidiary));
        
        if(_PeriodId != null)
        {
            var ap = new ns.GdpDu.AccountingPeriods();
            filters.push(new nlobjSearchFilter("postingperiod", null, "anyof", ap.GetDescendantIds(_PeriodId)));
        }
        
        var columns = [
            new nlobjSearchColumn("number", "account", "GROUP"),
			new nlobjSearchColumn("name", "account", "MIN"),
            new nlobjSearchColumn("type", "account", "MIN"),
            new nlobjSearchColumn("internalid", "account", "MIN")
        ];
        
        columns[0].setSort();
        var result = nlapiSearchRecord("transaction", null, filters, columns);
        
        return result ? result : new Array();
    }
    
    
    //----------------------------------------------------------------------------	
    function _GetLine(line)
    {
        var sLine = "";
        for (var i in line) 
        {
        	var columnType = _Columns[i] == null? "AlphaNumeric": _Columns[i].Type;
            sLine += (i == 0 ? "" : _Delimiter) + _Formatter.Format(line[i], columnType);
        }
        
        return sLine + "\r\n";
    }
    
    
    
    function trim(s){
        return s.replace(/^\s+|\s+$/g, "");
    }
    function ltrim(s){
        return s.replace(/^\s+/, "");
    }
    function rtrim(s){
        return s.replace(/\s+$/, "");
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.PayablesReport = function PayablesReport(formatter, subsidiary, periodId){
    var _Formatter = formatter;
    var _Delimiter = formatter.ColumnSeparator;
    var m_Subsidiary = subsidiary;
    var _Columns = _InitColumns();
    
    
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return _Columns;
    }
    this.PeriodId = periodId;
    this.FileName = "payables.txt";
    this.FileType = "PLAINTEXT";
    this.IsIndexeable = true;
    this.Description = "Accounts payable transactions";
    
    
    
    
    //--------------------------------------------------------------------------
    this.Generate = function Generate(){
        with (this) {
            var s = _GetHeader();
            var transactions = LoadTransactions();
            var openBalance = GetOpeningBalance();
            
            for (var i in transactions) {
                var dr = new ns.DataAccess.DataRow(transactions[i]);
                
                var isPerson = (dr.isperson == "T");
                var isExpenseReport = (dr.type == "ExpRept");
                var supplierName = 
                	isExpenseReport? (dr.employee_firstname + " " + dr.employee_lastname) :
                	isPerson? (dr.vendor_firstname + " " + dr.vendor_lastname) : 
                		dr.vendor_companyname;
                
                s += _GetLine([openBalance, dr.typeTEXT, dr.GetId(), (isExpenseReport ? ("E" + dr.employee_internalid) : dr.vendor_internalid), supplierName, dr.trandate, dr.tranid, dr.memo, dr.debitamount, dr.creditamount]);
            }
            
            return s;
        }
    }
    
    
    
    //--------------------------------------------------------------------------	
    function _InitColumns(){
        var columns = [new ns.GdpDu.ReportColumn("Opening_Balance", "Numeric", _Formatter.Precision), new ns.GdpDu.ReportColumn("Transaction_Type", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Internal_Trans_ID", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Vendor_ID", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Company_Name", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Document_Date", "Date", _Formatter.DateFormat), new ns.GdpDu.ReportColumn("Reference_Number", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Description", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Debit_Amount", "Numeric", _Formatter.Precision), new ns.GdpDu.ReportColumn("Credit_Amount", "Numeric", _Formatter.Precision)];
        
        return columns;
    }
    
    
    
    
    
    //--------------------------------------------------------------------------	
    this.LoadTransactions = function LoadTransactions(){
        var filters = [];
        filters.push(new nlobjSearchFilter("posting", null, "is", "T"));
        filters.push(new nlobjSearchFilter("accounttype", null, "is", "AcctPay"));
        
        if (m_Subsidiary != null) 
            filters.push(new nlobjSearchFilter("subsidiary", null, "is", m_Subsidiary));
        
        if (this.PeriodId != null)
        {
            var ap = new ns.GdpDu.AccountingPeriods();
            filters.push(new nlobjSearchFilter("postingperiod", null, "anyof", ap.GetDescendantIds(this.PeriodId)));
        }
        
        var columns = [new nlobjSearchColumn("tranid"), 
                       new nlobjSearchColumn("postingperiod"), 
                       new nlobjSearchColumn("trandate"), 
                       new nlobjSearchColumn("type"), 
                       new nlobjSearchColumn("account"), 
                       new nlobjSearchColumn("datecreated"), 
                       new nlobjSearchColumn("debitamount"), 
                       new nlobjSearchColumn("creditamount"), 
                       new nlobjSearchColumn("line"), 
                       new nlobjSearchColumn("class"), 
                       new nlobjSearchColumn("custtype"), 
                       new nlobjSearchColumn("item"), 
                       new nlobjSearchColumn("quantity"), 
                       new nlobjSearchColumn("netamount"), 
                       new nlobjSearchColumn("grossamount"), 
                       new nlobjSearchColumn("memo"), 
                       new nlobjSearchColumn("entity"), 
                       new nlobjSearchColumn("totalamount"), 
                       new nlobjSearchColumn("rate"), 
                       new nlobjSearchColumn("salesdescription", "item"), 
                       new nlobjSearchColumn("itemid", "item"), 
                       new nlobjSearchColumn("internalid", "vendor"), 
                       new nlobjSearchColumn("isperson", "vendor"), 
                       new nlobjSearchColumn("companyname", "vendor"), 
                       new nlobjSearchColumn("firstname", "vendor"), 
                       new nlobjSearchColumn("middlename", "vendor"), 
                       new nlobjSearchColumn("lastname", "vendor"), 
                       new nlobjSearchColumn("entityid", "vendor"), 
                       new nlobjSearchColumn("internalid", "employee"), 
                       new nlobjSearchColumn("firstname", "employee"), 
                       new nlobjSearchColumn("lastname", "employee")];
        
        
        var result = nlapiSearchRecord("transaction", null, filters, columns);
        
        return result ? result : new Array();
    }
    
    
    
    
    //--------------------------------------------------------------------------
    this.GetOpeningBalance = function GetOpeningBalance(){
        var filters = [];
        
        filters.push(new nlobjSearchFilter("posting", null, "is", "T"));
        filters.push(new nlobjSearchFilter("accounttype", null, "is", "AcctPay"));
        
        if (m_Subsidiary != null) 
            filters.push(new nlobjSearchFilter("subsidiary", null, "is", m_Subsidiary));
        
        if (this.PeriodId != null) {
            var previousPeriods = (new ns.GdpDu.AccountingPeriods()).GetPreviousPeriods(this.PeriodId);
            
            if (previousPeriods.length > 0) 
                filters.push(new nlobjSearchFilter("postingperiod", null, "anyof", previousPeriods));
        }
        
        var columns = [new nlobjSearchColumn("amount", null, "SUM")];
        
        
        var result = nlapiSearchRecord("transaction", null, filters, columns);
        if (!result) 
            return 0.00;
        
        var dr = new ns.DataAccess.DataRow(result[0]);
        
        return parseFloat(dr.amount);
    }
    
    
    
    
    
    //----------------------------------------------------------------------------	
    function _GetLine(line)
    {
        var sLine = "";
        for (var i in line) 
        {
        	var columnType = _Columns[i] == null? "AlphaNumeric": _Columns[i].Type;
            sLine += (i == 0 ? "" : _Delimiter) + _Formatter.Format(line[i], columnType);
        }
        
        return sLine + "\r\n";
    }
    
    
    
    
    //--------------------------------------------------------------------------	
    function _GetHeader(){
        var sHeading = "";
        
        for (var i in _Columns) 
            sHeading += (sHeading == "" ? "" : _Delimiter) + _Columns[i].Name;
        
        return sHeading + "\r\n";
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.ReceivablesReport = function ReceivablesReport(formatter, subsidiary, periodId)
{
    var _Delimiter = formatter.ColumnSeparator;
    var _Formatter = formatter;
    var _Columns = _InitColumns();
    var m_Subsidiary = subsidiary;
    var _OpeningBalance = null;
    var _PrevId = null;
    var _PrevLineId = null;
    
    this.PeriodId = periodId;
    this.FileName = "receivables.txt";
    this.FileType = "PLAINTEXT";
    this.IsIndexeable = true;
    this.Description = "Accounts receivable transactions";
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return _Columns;
    }
    
    
    
    //-----------------------------------------------------------------------------	
    this.Generate = function Generate()
    {
        var s = _GetHeader();
        var transactions = this.LoadTransactions();
        var openBalance = this.GetOpeningBalance();
        
        for (var i in transactions)
        {
            var dr = new ns.DataAccess.DataRow(transactions[i]);
            
            if( dr.internalid == _PrevId && dr.line == _PrevLineId)
            	continue;
            
            var isPerson = dr.isperson == "T";
            var customerName = isPerson ? (dr.customer_firstname + " " + dr.customer_lastname) : dr.customer_companyname;
            
            s += _GetLine([
                openBalance, 
                dr.typeTEXT, 
                dr.internalid, //dr.GetId(), 
                dr.customer_entityid, 
                customerName, 
                dr.trandate, 
                (dr.type == "CustPymt" ? dr.appliedToTransaction_number : dr.tranid), 
                dr.memo, 
                dr.debitamount, 
                dr.creditamount
            ]);
            
            _PrevId = dr.internalid;
            _PrevLineId = dr.line;
        }
        
        return s;
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _InitColumns(){
        with (_Formatter) {
            var columns = [
                new ns.GdpDu.ReportColumn("Opening_Balance", "Numeric", Precision), 
                new ns.GdpDu.ReportColumn("Transaction_Type", "AlphaNumeric"), 
                new ns.GdpDu.ReportColumn("Internal_Trans_ID", "AlphaNumeric"), 
                new ns.GdpDu.ReportColumn("Customer_ID", "AlphaNumeric"), 
                new ns.GdpDu.ReportColumn("Company_Name", "AlphaNumeric"), 
                new ns.GdpDu.ReportColumn("Document_Date", "Date", DateFormat), 
                new ns.GdpDu.ReportColumn("Reference_Number", "AlphaNumeric"), 
                new ns.GdpDu.ReportColumn("Description", "AlphaNumeric"), 
                new ns.GdpDu.ReportColumn("Debit_Amount", "Numeric", Precision), 
                new ns.GdpDu.ReportColumn("Credit_Amount", "Numeric", Precision)
            ];
        }
        
        return columns;
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _GetHeader(){
        var sHeading = "";
        
        for (var i in _Columns) {
            sHeading += (sHeading == "" ? "" : _Delimiter) + _Columns[i].Name;
        }
        
        return sHeading + "\r\n";
    }
    
    
    
    
    //-----------------------------------------------------------------------------
    this.LoadTransactions = function LoadTransactions(){
        var filters = [];
        filters.push(new nlobjSearchFilter("posting", null, "is", "T"));
        filters.push(new nlobjSearchFilter("accounttype", null, "is", "AcctRec"));
        
        if (m_Subsidiary != null) 
            filters.push(new nlobjSearchFilter("subsidiary", null, "is", m_Subsidiary));
        
        if (this.PeriodId != null) {
            var ap = new ns.GdpDu.AccountingPeriods();
            filters.push(new nlobjSearchFilter("postingperiod", null, "anyof", ap.GetDescendantIds(this.PeriodId)));
        }
        
        
        var columns = [
            new nlobjSearchColumn("internalid"),
            new nlobjSearchColumn("line"),
            new nlobjSearchColumn("type"),
            new nlobjSearchColumn("itemid", "item"),
            new nlobjSearchColumn("entityid", "customer"),
            new nlobjSearchColumn("isperson", "customer"), 
            new nlobjSearchColumn("companyname", "customer"), 
            new nlobjSearchColumn("firstname", "customer"), 
            new nlobjSearchColumn("middlename", "customer"), 
            new nlobjSearchColumn("lastname", "customer"),            
            new nlobjSearchColumn("tranid"), 
            new nlobjSearchColumn("trandate"),
            new nlobjSearchColumn("memo"),
            new nlobjSearchColumn("debitamount"), 
            new nlobjSearchColumn("creditamount"),            
            new nlobjSearchColumn("number", "appliedToTransaction")
             

            
            
            /*
            new nlobjSearchColumn("account"),
            new nlobjSearchColumn("postingperiod"),
            new nlobjSearchColumn("datecreated"), 
            new nlobjSearchColumn("class"), 
            new nlobjSearchColumn("custtype"), 
            new nlobjSearchColumn("item"), 
            new nlobjSearchColumn("quantity"), 
            new nlobjSearchColumn("netamount"), 
            new nlobjSearchColumn("grossamount"), 
            new nlobjSearchColumn("number"), 
            new nlobjSearchColumn("entity"), 
            new nlobjSearchColumn("totalamount"), 
            new nlobjSearchColumn("rate"), 
            new nlobjSearchColumn("taxamount"), 
            new nlobjSearchColumn("salesdescription", "item"), 
            new nlobjSearchColumn("accounttype"), 
            new nlobjSearchColumn("internalid", "customer")
            */
        ];
        
        columns[0].setSort();
        columns[1].setSort();
        
        var result = nlapiSearchRecord("transaction", null, filters, columns);
        
        return result ? result : new Array();
    }
    
    
    
    
    //-----------------------------------------------------------------------------
    this.GetOpeningBalance = function GetOpeningBalance()
    {
    	if(_OpeningBalance != null)
    		return _OpeningBalance;
    	
    	
        var filters = [];
        filters.push(new nlobjSearchFilter("posting", null, "is", "T"));
        filters.push(new nlobjSearchFilter("accounttype", null, "is", "AcctRec"));
        
        
        if (m_Subsidiary != null) 
            filters.push(new nlobjSearchFilter("subsidiary", null, "is", m_Subsidiary));
        
        
        if (this.PeriodId != null) {
            var previousPeriods = (new ns.GdpDu.AccountingPeriods()).GetPreviousPeriods(this.PeriodId);
            
            if (previousPeriods.length > 0) 
                filters.push(new nlobjSearchFilter("postingperiod", null, "anyof", previousPeriods));
        }
        
        var columns = [new nlobjSearchColumn("amount", null, "SUM")];
        
        
        var result = nlapiSearchRecord("transaction", null, filters, columns);
        if (!result) 
            return 0.00;
        
        var dr = new ns.DataAccess.DataRow(result[0]);
        
        _OpeningBalance = parseFloat(dr.amount);
        
        return _OpeningBalance;
    }
    
    
    
    
    //----------------------------------------------------------------------------	
    function _GetLine(line)
    {
        var sLine = "";
        for (var i in line) 
        {
        	var columnType = _Columns[i] == null? "AlphaNumeric": _Columns[i].Type;
            sLine += (i == 0 ? "" : _Delimiter) + _Formatter.Format(line[i], columnType);
        }
        
        return sLine + "\r\n";
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.GeneralLedgerReport = function GeneralLedgerReport(formatter, subsidiary, periodId)
{
    var _Delimiter = formatter.ColumnSeparator;
    var _Formatter = formatter;
    var _Columns = _InitColumns();
    ;
    var m_Subsidiary = subsidiary;
    
    this.PeriodId = periodId;
    this.FileName = "genledger.txt";
    this.FileType = "PLAINTEXT";
    this.IsIndexeable = true;
    this.Description = "General ledger";
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return _Columns;
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _InitColumns(){
        with (_Formatter) {
            var columns = [new ns.GdpDu.ReportColumn("Account_Number", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Account_Description", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Transaction_Type", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Document_Date", "Date", DateFormat), new ns.GdpDu.ReportColumn("Document_Number", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Description", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Debit_Amount", "Numeric", Precision), new ns.GdpDu.ReportColumn("Credit_Amount", "Numeric", Precision)];
        }
        
        return columns;
    }
    
    
    
    //-----------------------------------------------------------------------------
    this.Generate = function Generate()
    {
        var s = _GetHeader();
        var result = this.LoadTransactions();
        
        for (var i in result) {
            var dr = new ns.DataAccess.DataRow(result[i]);
            
            if (dr.debitamount == 0.00 && dr.creditamount == 0.00) 
                continue;
            
            s += _GetLine([
                dr.account_number, 
                _Formatter.FormatAccountName(dr.account_number, dr.account_name), 
                dr.typeTEXT, 
                dr.trandate, 
                dr.tranid, 
                dr.memo, 
                dr.debitamount, 
                dr.creditamount
            ]);
        }
        
        return s;
    }
    
    
    
    
    //----------------------------------------------------------------------------	
    function _GetHeader(){
        var sHeading = "";
        
        for (var i in _Columns) {
            sHeading += (sHeading == "" ? "" : _Delimiter) + _Columns[i].Name;
        }
        
        return sHeading + "\r\n";
    }
    
    
    
    //-----------------------------------------------------------------------------
    this.LoadTransactions = function LoadTransactions()
    {
        var filters = [];
        filters.push(new nlobjSearchFilter("posting", null, "is", "T"));
        filters.push(new nlobjSearchFilter("item", null, "noneof", -2));
        
        if (m_Subsidiary != null) 
            filters.push(new nlobjSearchFilter("subsidiary", null, "is", m_Subsidiary));
        
        if (this.PeriodId != null) {
            var ap = new ns.GdpDu.AccountingPeriods();
            filters.push(new nlobjSearchFilter("postingperiod", null, "anyof", ap.GetDescendantIds(this.PeriodId)));
        }
        
        var columns = [
            new nlobjSearchColumn("tranid"),
            new nlobjSearchColumn("postingperiod"),
            new nlobjSearchColumn("trandate"),
            new nlobjSearchColumn("type"),
            new nlobjSearchColumn("datecreated"),
            new nlobjSearchColumn("debitamount"),
            new nlobjSearchColumn("creditamount"),
            new nlobjSearchColumn("line"),
            new nlobjSearchColumn("class"),
            new nlobjSearchColumn("custtype"),
            new nlobjSearchColumn("item"),
            new nlobjSearchColumn("quantity"),
            new nlobjSearchColumn("netamount"),
            new nlobjSearchColumn("grossamount"),
            new nlobjSearchColumn("memo"),
            new nlobjSearchColumn("entity"),
            new nlobjSearchColumn("totalamount"),
            new nlobjSearchColumn("rate"),
            new nlobjSearchColumn("taxamount"),
            new nlobjSearchColumn("salesdescription", "item"),
            new nlobjSearchColumn("itemid", "item"),
            new nlobjSearchColumn("accounttype"),
            new nlobjSearchColumn("number", "account"),
            new nlobjSearchColumn("name", "account")
        ];
        
        columns[0].setSort();
        var result = nlapiSearchRecord("transaction", null, filters, columns);
        
        return result ? result : new Array();
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _GetLine(line){
        var sLine = "";
        for (var i in line) 
            sLine += (i == 0 ? "" : _Delimiter) + _Formatter.Format(line[i], _Columns[i].Type);
        
        return sLine + "\r\n";
    }
}



//==============================================================================





//==============================================================================
ns.GdpDu.SumsAndBalancesReport = function SumsAndBalancesReport(formatter, subsidiary, periodId){
    var _Delimiter = formatter.ColumnSeparator;
    var _Formatter = formatter;
    var _Columns = _InitColumns();
    var m_Subsidiary = subsidiary;
    
    this.PeriodId = periodId;
    this.FileName = "Account_balances.txt";
    this.FileType = "PLAINTEXT";
    this.IsIndexeable = true;
    this.Description = "Summary of the chart of account opening balances, movements and ending balances.";
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return _Columns;
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _InitColumns(){
        with (_Formatter) {
            var columns = [new ns.GdpDu.ReportColumn("Account_ID", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Account_Name", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Last_Posting_Date", "Date", DateFormat), new ns.GdpDu.ReportColumn("Opening_DR_Balance", "Numeric", Precision), new ns.GdpDu.ReportColumn("Opening_CR_Balance", "Numeric", Precision), new ns.GdpDu.ReportColumn("Total_Debit", "Numeric", Precision), new ns.GdpDu.ReportColumn("Total_Credit", "Numeric", Precision), new ns.GdpDu.ReportColumn("YTD_Debit", "Numeric", Precision), new ns.GdpDu.ReportColumn("YTD_Credit", "Numeric", Precision), new ns.GdpDu.ReportColumn("YTD_DR_Balance", "Numeric", Precision), new ns.GdpDu.ReportColumn("YTD_CR_Balance", "Numeric", Precision)];
        }
        
        return columns;
    }
    
    
    
    //-----------------------------------------------------------------------------
    this.Generate = function Generate()
    {
        var s = _GetHeader();
        var ap = new ns.GdpDu.AccountingPeriods();
        var openingBalances = this.LoadTransactions(ap.GetPreviousPeriods(this.PeriodId));

        
        var transactions = this.LoadTransactions(ap.GetDescendantIds(this.PeriodId));
        
        
        for (var i in transactions)
        {
            var dr = new ns.DataAccess.DataRow(transactions[i])
            
            var accountName = _Formatter.FormatAccountName(dr.account_number, dr.account);
            if (dr.account_number == "" && accountName == "") 
                continue;
            
            var periodCredit = (dr.creditamount && dr.creditamount != null) ? Math.abs(parseFloat(dr.creditamount)) : 0.00;
            var periodDebit  = (dr.debitamount && dr.debitamount != null) ? Math.abs(parseFloat(dr.debitamount)) : 0.00;
            var openBal = this.GetBalance(openingBalances, dr.account_internalid);
            var periodBal = new ns.GdpDu.AccountBalance(periodCredit, periodDebit);
            var endBal = new ns.GdpDu.AccountBalance(openBal.CreditAmount + periodCredit, openBal.DebitAmount + periodDebit);
            
            s += _GetLine([
                dr.account_number,		//Account Number
                accountName,			//Account Name (w/o account no.)
                dr.trandate,			//Last Posting Date
                openBal.DebitAmount,	//Opening Balance Debit
                openBal.CreditAmount,	//Opening Balance Credit
                periodDebit,			//Total Debit
                periodCredit,			//Total Credit
                periodBal.DebitAmount,	//YTD Debit
                periodBal.CreditAmount,	//YTD Credit
                endBal.DebitAmount,		//YTD Balance Debit
                endBal.CreditAmount		//YTD Balance Credit
            ]); 
        }
        
        return s;
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _GetHeader(){
        var sHeading = "";
        
        for (var i in _Columns) {
            sHeading += (sHeading == "" ? "" : _Delimiter) + _Columns[i].Name;
        }
        
        return sHeading + "\r\n";
    }
    
    
    
    //-----------------------------------------------------------------------------
    this.GetBalance = function GetBalance(openingBalances, accountId)
    {
        for( var i in openingBalances)
        {
            var dr = new ns.DataAccess.DataRow(openingBalances[i]);
            
            if (dr.account_internalid == accountId)
            {
                var debitTotal = parseFloat(dr.debitamount);
                var creditTotal = parseFloat(dr.creditamount);
                
                return new ns.GdpDu.AccountBalance(creditTotal, debitTotal);
            }
        }
        
        return new ns.GdpDu.AccountBalance(0.00, 0.00);
    }
    
    
    
    
    //-----------------------------------------------------------------------------
    this.LoadTransactions = function LoadTransactions(periods)
    {
        var filters = [new nlobjSearchFilter("posting", null, "is", "T")];
        
        if (m_Subsidiary != null) 
            filters.push(new nlobjSearchFilter("subsidiary", null, "is", m_Subsidiary));
        
        if (periods != null && periods.length > 0) 
            filters.push(new nlobjSearchFilter("postingperiod", null, "anyof", periods));
        
        var columns = [
            new nlobjSearchColumn("internalid", "account", "GROUP"), 
            new nlobjSearchColumn("number", "account", "MAX"), 
            new nlobjSearchColumn("account", null, "MAX"), 
            new nlobjSearchColumn("creditamount", null, "SUM"), 
            new nlobjSearchColumn("debitamount", null, "SUM"), 
            new nlobjSearchColumn("trandate", null, "MAX")];
        
        columns[0].setSort();
        
        var result = nlapiSearchRecord("transaction", null, filters, columns);
        
        return result ? result : [];
    }
    
    
    
    
    //----------------------------------------------------------------------------	
    function _GetLine(line)
    {
        var sLine = "";
        for (var i in line) 
        {
        	var columnType = _Columns[i] == null? "AlphaNumeric": _Columns[i].Type;
            sLine += (i == 0 ? "" : _Delimiter) + _Formatter.Format(line[i], columnType);
        }
        
        return sLine + "\r\n";
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.JournalReport = function JournalReport(formatter, subsidiary, periodId, isMultiCurrency, currency)
{
    var _Delimiter = formatter.ColumnSeparator;
    var _Currency = currency; 
    
    var _Formatter = formatter;
    var _Columns = _InitColumns();
    var m_Subsidiary = subsidiary;
    var _IsMultiCurrency = isMultiCurrency;
    
    this.PeriodId = periodId;
    this.FileName = "transaction_journal.txt";
    this.FileType = "PLAINTEXT";
    this.IsIndexeable = true;
    this.Description = "Journal transactions";
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return _Columns;
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _InitColumns()
	{
        with (_Formatter) {
            var columns = [
				new ns.GdpDu.ReportColumn("Internal_ID","AlphaNumeric"),
				new ns.GdpDu.ReportColumn("Transaction_Type", "AlphaNumeric"),
				new ns.GdpDu.ReportColumn("Date", "Date", DateFormat),
				new ns.GdpDu.ReportColumn("Posting_Period", "AlphaNumeric"),
				new ns.GdpDu.ReportColumn("Document_Number", "AlphaNumeric"),
				new ns.GdpDu.ReportColumn("Description", "AlphaNumeric"),
				new ns.GdpDu.ReportColumn("Debit_Account", "AlphaNumeric"),
				new ns.GdpDu.ReportColumn("Debit_Amount", "Numeric", Precision),
				new ns.GdpDu.ReportColumn("Credit_Account", "AlphaNumeric"),
				new ns.GdpDu.ReportColumn("Credit_Amount", "Numeric", Precision),
				new ns.GdpDu.ReportColumn("VAT_Debit_Account", "AlphaNumeric"),
				new ns.GdpDu.ReportColumn("VAT_Debit_Amount", "Numeric", Precision),
				new ns.GdpDu.ReportColumn("VAT_Credit_Account", "AlphaNumeric"),
				new ns.GdpDu.ReportColumn("VAT_Credit_Amount", "Numeric", Precision),
				new ns.GdpDu.ReportColumn("Tax_Code", "AlphaNumeric"),
				new ns.GdpDu.ReportColumn("Currency", "AlphaNumeric")
			];
        }
        
        return columns;
    }
    
    
    
    //-----------------------------------------------------------------------------	
    this.Generate = function Generate()
    {
        with (this)
        {
            var s = _GetHeader();
            var transactions = LoadTransactions();
            
            for (var i in transactions)
            {
                var dr = new ns.DataAccess.DataRow(transactions[i]);
                
                var isTaxLine = dr.taxline == "T";
                var isDebit = dr.debitamount > 0;
                var account = _Formatter.FormatAccountName(dr.account_number, dr.accountTEXT);
                var floatAmount = (isDebit? dr.debitamount: dr.creditamount);
                var amount = parseFloat( floatAmount);
                
                s += _GetLine(
                	[
                	    dr.internalid,
                	    dr.type, //Transaction Type
                	    dr.trandate,
                	    dr.postingperiod,
                	    dr.tranid, //Document number
                	    dr.memo, //Description
                	    (!isTaxLine && isDebit ? account : ""),	//Debit Account
                	    (!isTaxLine && isDebit? amount : ""),	//Debit Amount
                	    (!isTaxLine && !isDebit ? account : ""),//Credit Account
                	    (!isTaxLine && !isDebit ? amount : ""),	//Crediit Amount
                	    (isTaxLine && isDebit ? account : ""),	//VAT Debit Account
                	    (isTaxLine && isDebit ? amount : ""),	//VAT Debit Amount
                	    (isTaxLine && !isDebit ? account : ""), //VAT Credit Account
                	    (isTaxLine && !isDebit ? amount : ""),	//VAT Credit Amount
                	    (isTaxLine? dr.taxcode : ""),
                	    (dr.currency == null? _Currency: dr.currency)
                	]
                );
            }
            
            return s;
        }
    }
    
    
    
    
    
    //----------------------------------------------------------------------------	
    function _GetHeader(){
        var sHeading = "";
        
        for (var i in _Columns) {
            sHeading += (sHeading == "" ? "" : _Delimiter) + _Columns[i].Name;
        }
        
        return sHeading + "\r\n";
    }
    
    
    
    //-----------------------------------------------------------------------------	
    this.LoadTransactions = function LoadTransactions()
	{
        var filters = [];
        filters.push(new nlobjSearchFilter("posting", null, "is", "T"));
        
        if (m_Subsidiary != null) 
            filters.push(new nlobjSearchFilter("subsidiary", null, "is", m_Subsidiary));
        
        if (this.PeriodId != null) {
            var ap = new ns.GdpDu.AccountingPeriods();
            filters.push(new nlobjSearchFilter("postingperiod", null, "anyof", ap.GetDescendantIds(this.PeriodId)));
        }
        
        
        var columns = [
            new nlobjSearchColumn("internalid", null, "GROUP"),
            new nlobjSearchColumn("account", null, "GROUP"),
            new nlobjSearchColumn("creditamount", null, "SUM"),
            new nlobjSearchColumn("trandate", null, "MIN"),
            new nlobjSearchColumn("postingperiod", null, "MIN"),
            new nlobjSearchColumn("debitamount", null, "SUM"),
            new nlobjSearchColumn("total", null, "SUM"),
            new nlobjSearchColumn("amount", null, "SUM"),
            new nlobjSearchColumn("type", null, "MIN"),
            new nlobjSearchColumn("tranid", null, "MAX"),
            new nlobjSearchColumn("memo", null, "MAX"),
            new nlobjSearchColumn("taxcode", null, "MIN"),
            new nlobjSearchColumn("taxline", null, "MIN"),
            new nlobjSearchColumn("number", "account", "MIN")
        ];
        
        if(_IsMultiCurrency)
        	columns.push(new nlobjSearchColumn("currency", null, "MIN"));
        
        columns[0].setSort(); //Sort by internalid
        var result = nlapiSearchRecord("transaction", null, filters, columns);
        
        return result ? result : new Array();
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _GetLine(line)
    {
        var sLine = "";
        for (var i in line) 
        {
        	var columnType = _Columns[i] == null? "AlphaNumeric": _Columns[i].Type;
            sLine += (i == 0 ? "" : _Delimiter) + _Formatter.Format(line[i], columnType);
        }
        
        return sLine + "\r\n";
    }
}
//==============================================================================




	
//==============================================================================
ns.GdpDu.ReportIndex = function ReportIndex(formatter, companyProfile, reports){
    var _Formatter = formatter;
    var m_Company = companyProfile;
    var m_Reports = reports;
    var m_Doc = null;
    
    this.FileName = "index.xml";
    this.FileType = "XMLDOC";
    this.IsIndexeable = false;
    this.Description = "List and description of all files";
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return [];
    }
    
    
    
    //----------------------------------------------------------------------------
    this.Generate = function Generate(){
        m_Doc = nlapiStringToXML('<DataSet/>');
        
        var docElement = m_Doc.getDocumentElement();
        docElement.appendChild(CreateElement("Version", "1.0"));
        
        var dataSupplier = CreateElement("DataSupplier");
        dataSupplier.appendChild(CreateElement("Name", m_Company.Name));
        dataSupplier.appendChild(CreateElement("Location", m_Company.GetAddress()));
        dataSupplier.appendChild(CreateElement("Comment", m_Company.Name));
        docElement.appendChild(dataSupplier);
        
        var media = CreateElement("Media");
        media.appendChild(CreateElement("Name", "Disk 1"));
        
        for (var i in reports) {
            if (reports[i].IsIndexeable) 
                media.appendChild(CreateTableElement(reports[i]));
        }
        
        docElement.appendChild(media);
        
        var xml = (nlapiXMLToString(m_Doc)).replace('<?xml version="1.0" encoding="UTF-8"?>', '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE DataSet SYSTEM "gdpdu-01-08-2002.dtd">');
        
        return xml;
    }
    
    
    
    //----------------------------------------------------------------------------
    function CreateTableElement(report){
        var table = CreateElement("Table");
        table.appendChild(CreateElement("URL", report.FileName));
        table.appendChild(CreateElement("Name", report.FileName));
        table.appendChild(CreateElement("Description", report.Description));
        table.appendChild(CreateElement("DecimalSymbol", _Formatter.DecimalSymbol));
        table.appendChild(CreateElement("DigitGroupingSymbol", _Formatter.ThousandsSeparator));
        
        
        var range = CreateElement("Range");
        range.appendChild(CreateElement("From", "2"));
        table.appendChild(range);
        
        
        var columns = report.GetColumns();
        
        //if( columns != null && columns.length > 0)
        //{
        var varLen = CreateElement("VariableLength");
        varLen.appendChild(CreateElement("ColumnDelimiter", _Formatter.ColumnSeparator));
        
        for (var i in columns) 
            varLen.appendChild(CreateColumnElement(columns[i]));
        
        table.appendChild(varLen);
        //}
        
        return table;
    }
    
    
    
    //--------------------------------------------------------------------------
    function CreateElement(name, value){
        if (name == undefined || name == null) 
            return null;
        
        var element = m_Doc.createElement(name);
        
        if (value != undefined && value != null) 
            element.appendChild(m_Doc.createTextNode(value));
        
        return element;
    }
    
    
    
    //--------------------------------------------------------------------------
    function CreateColumnElement(column){
        var varCol = CreateElement("VariableColumn");
        varCol.appendChild(CreateElement("Name", column.Name));
        
        var type = CreateElement(column.Type);
        
        if (column.Format != null) 
            type.appendChild(CreateElement("Format", column.Format));
        
        if (column.Precision != null && column.Precision > 0) 
            type.appendChild(CreateElement("Accuracy", column.Precision));
        
        varCol.appendChild(type);
        
        return varCol;
    }
}
//==============================================================================



	

//==============================================================================
ns.GdpDu.AccountBalance = function AccountBalance(credit, debit)
{
	var creditValue = (credit && credit != null)? credit: 0;
	var debitValue = (debit && debit != null)? debit: 0;
	
    this.Amount = Math.abs(creditValue - debitValue);
    this.IsCredit = creditValue >= debitValue;
    this.CreditAmount = this.IsCredit ? this.Amount : 0;
    this.DebitAmount = this.IsCredit ? 0 : this.Amount;
}
//==============================================================================





//==============================================================================
ns.GdpDu.DTDFile = function DTDFile()
{
    var _Delimiter = "\t";
    
    this.FileName = "gdpdu-01-08-2002.dtd";
    this.FileType = "PLAINTEXT";
    this.Description = "DTD file for Index.xml";
    this.IsIndexeable = false;
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return [];
    }
    
    
    //--------------------------------------------------------------------------	
    this.Generate = function Generate(){
        //Locate dtd file
        var filters = [new nlobjSearchFilter('name', null, 'is', "template.gdpdu-01-08-2002.dtd")];
        var columns = [new nlobjSearchColumn("internalid")];
        
        var fileRecord = nlapiSearchRecord('file', null, filters, columns);
        var dr = new ns.DataAccess.DataRow(fileRecord[0]);
        
        var file = nlapiLoadFile(dr.internalid);
        return file.getValue();
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.AnnualVATReport = function AnnualVATReport(formatter, subsidiary, periodId){
    var _Formatter = formatter;
    var m_Subsidiary = subsidiary;
    var m_PeriodId = periodId;
    var m_Periods = LoadPeriods();
    var m_TaxCodes = LoadTaxCodes();
    var m_TaxDistribution = InitTaxDistribution();
    var m_TaxPurchases = InitTaxPeriods();
    var m_Totals = InitTaxPeriods();
    var _Columns = _InitColumns();
    var _Delimiter = formatter.ColumnSeparator;
    
    this.FileName = "annualvat.txt";
    this.FileType = "PLAINTEXT";
    this.IsIndexeable = true;
    this.Description = "Distribution of VAT per month during the period";
    this.GetDelimiter = function GetDelimiter(){
        return _Delimiter;
    }
    this.GetColumns = function GetColumns(){
        return _Columns;
    }
    
    
    
    //----------------------------------------------------------------------------	
    this.Generate = function Generate(){
        var sContent = _GetHeader();
        
        var transactions = LoadTransactions();
        
        //Distribute tax to periods
        for (var i in transactions) {
            var dr = new ns.DataAccess.DataRow(transactions[i]);
            
            var amount = dr.creditamount > 0? parseFloat(dr.creditamount): (-parseFloat(dr.debitamount)); 
            
            if (dr.type == "VendBill") 
                DistributePurchaseTax(dr.taxitem, dr.postingperiod, amount);
            
            else 
                if (dr.type == "CustInvc") 
                    DistributeSalesTax(dr.taxitem, dr.postingperiod, amount);
        }
        
        sContent += GetTaxLines();
        sContent += GetTotalsLine();
        
        return sContent;
    }
    
    
    
    
    //----------------------------------------------------------------------------	
    function _InitColumns()
    {
        var columns = [new ns.GdpDu.ReportColumn("Tax_Code", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Amount_Type", "AlphaNumeric"), new ns.GdpDu.ReportColumn("Total", "Numeric", _Formatter.Precision)];
        
        for (var i in m_Periods)
        {
            var invalidChars = "~!$^&*(){}[]\\|;:\"\'?/,<>@ #`.-+="; //"~!$^&*(){}[]\\|;:\"\'?/,<>@ #`.-+=";
            var periodName = m_Periods[i].Name;
            
            for (var i = 0; i < invalidChars.length; ++i) 
                periodName = periodName.replace(invalidChars.charAt(i), "_");
            
            columns.push(new ns.GdpDu.ReportColumn(periodName, "Numeric", _Formatter.Precision));
        }
        
        return columns;
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _GetHeader(){
        var sHeading = "";
        
        for (var i in _Columns) {
            sHeading += (sHeading == "" ? "" : _Delimiter) + _Columns[i].Name;
        }
        
        return sHeading + "\r\n";
    }
    
    
    
    //----------------------------------------------------------------------------
    function LoadTaxCodes()
    {
    	var filters = [];
    	if(m_Subsidiary != null)
    		filters.push( new nlobjSearchFilter('country', null, 'is', 'DE'));
    	
        var columns = [
            new nlobjSearchColumn("itemid"),
            new nlobjSearchColumn("rate"),
            new nlobjSearchColumn("internalid"),
            new nlobjSearchColumn("description"),
            new nlobjSearchColumn("name")
        ];
        
        columns[2].setSort();
        
        var rows = nlapiSearchRecord("salestaxitem", null, filters, columns);
        
        if (rows == null) 
            return [];
        
        var taxCodes = [];
        for (var i in rows) {
            var dr = new ns.DataAccess.DataRow(rows[i]);
            taxCodes.push(new ns.GdpDu.TaxCode(dr.internalid, dr.name, dr.description));
        }
        
        return taxCodes;
    }
    
    
    
    //----------------------------------------------------------------------------
    function LoadPeriods(){
        var monthPeriods = [];
        var allPeriods = (new ns.GdpDu.AccountingPeriods()).GetAllChildren(m_PeriodId);
        
        for (var i in allPeriods) {
            if (allPeriods[i].Type == "month" || allPeriods[i].Type == "adjustment") {
                monthPeriods.push(allPeriods[i]);
            }
        }
        
        return monthPeriods;
    }
    
    
    
    //----------------------------------------------------------------------------
    function GetTaxLines(){
        var str = "";
        
        for (var i in m_TaxCodes) {
            var line = [m_TaxCodes[i].Name, m_TaxCodes[i].Description, m_TaxDistribution[m_TaxCodes[i].Id]["_TOTAL_"]];
            
            for (var j in m_Periods) 
                line.push(m_TaxDistribution[m_TaxCodes[i].Id][m_Periods[j].Id]);
            
            str += _GetLine(line);
        }
        
        
        //str += "***\tVAT on purchases\t" + m_TaxPurchases["_TOTAL_"].toFixed(2);
        
        //for( var i in m_Periods)
        //{
        //	str += "\t" + m_TaxPurchases[m_Periods[i].Id].toFixed(2);
        //}
        //str += "\r\n";
        
        return str;
    }
    
    
    
    //----------------------------------------------------------------------------
    function GetTotalsLine()
    {
        var line = ["***", "Net Amount", m_Totals["_TOTAL_"]];
        
        for (var i in m_Periods) 
            line.push(m_Totals[m_Periods[i].Id]);
        
        return _GetLine(line);
    }
    
    
    
    //----------------------------------------------------------------------------
    function InitTaxDistribution(){
        var distribution = [];
        
        for (var i in m_TaxCodes) {
            distribution[m_TaxCodes[i].Id] = InitTaxPeriods();
        }
        
        return distribution;
    }
    
    
    
    //----------------------------------------------------------------------------
    function InitTaxPeriods(){
        var taxPeriods = [];
        
        for (var i in m_Periods) {
            taxPeriods[m_Periods[i].Id] = 0;
        }
        
        taxPeriods["_TOTAL_"] = 0;
        return taxPeriods;
    }
    
    
    
    //----------------------------------------------------------------------------
    function DistributeSalesTax(taxCodeId, periodId, amount){
        if (m_TaxDistribution[taxCodeId] == null || m_TaxDistribution[taxCodeId][periodId] == null) 
            return;
        
        m_TaxDistribution[taxCodeId][periodId] += amount;
        m_TaxDistribution[taxCodeId]["_TOTAL_"] += amount;
        m_Totals[periodId] += amount;
        m_Totals["_TOTAL_"] += amount;
    }
    
    
    
    
    //--------------------------------------------------------------------------
    function DistributePurchaseTax(taxCodeId, periodId, amount)
    {
        //if( m_TaxPurchases[periodId] == null)
        //	return;
        
        //m_TaxPurchases[periodId] += amount;
        //m_TaxPurchases["_TOTAL_"] += amount;
        if (m_TaxDistribution[taxCodeId] == null || m_TaxDistribution[taxCodeId][periodId] == null) 
            return;
        
        m_TaxDistribution[taxCodeId][periodId] += amount;
        m_TaxDistribution[taxCodeId]["_TOTAL_"] += amount;
        
        m_Totals[periodId] -= amount;
        m_Totals["_TOTAL_"] -= amount;
    }
    
    
    
    //--------------------------------------------------------------------------	
    function LoadTransactions()
    {
        var filters = [new nlobjSearchFilter("posting", null, "is", "T"), new nlobjSearchFilter("taxline", null, "is", "T"), new nlobjSearchFilter("type", null, "anyof", ["VendBill", "CustInvc"])];
        
        if (m_Subsidiary != null) 
            filters.push(new nlobjSearchFilter("subsidiary", null, "is", m_Subsidiary));
        
        if (m_PeriodId != null) {
            var descendantPeriods = (new ns.GdpDu.AccountingPeriods()).GetDescendantIds(m_PeriodId);
            if (descendantPeriods.length > 0) 
                filters.push(new nlobjSearchFilter("postingperiod", null, "anyof", descendantPeriods));
        }
        
        var columns = [
            new nlobjSearchColumn("taxitem"),
            new nlobjSearchColumn("amount"),
            new nlobjSearchColumn("creditamount"),
            new nlobjSearchColumn("debitamount"),
            new nlobjSearchColumn("postingperiod"),
            new nlobjSearchColumn("type")];
        
        var result = nlapiSearchRecord("transaction", null, filters, columns);
        
        return result ? result : [];
    }
    
    
    
    //----------------------------------------------------------------------------	
    function _GetLine(line)
    {
        var sLine = "";
        for (var i in line) 
        {
        	var columnType = _Columns[i] == null? "AlphaNumeric": _Columns[i].Type;
            sLine += (i == 0 ? "" : _Delimiter) + _Formatter.Format(line[i], columnType);
        }
        
        return sLine + "\r\n";
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.TaxCode = function TaxCode(id, name, description)
{
    this.Id = id;
    this.Name = name;
    this.Description = description;
}
//==============================================================================





//==============================================================================
ns.GdpDu.ReportColumn = function ReportColumn(name, type, descriptor){
    this.Name = name
    this.Type = type;
    this.Precision = null;
    this.Format = null;
    
    if (type == "Numeric") 
        this.Precision = descriptor;
    else 
        if (type == "Date") 
            this.Format = descriptor;
}
//==============================================================================


	


//==============================================================================
ns.GdpDu.CompanyProfile = function CompanyProfile(name, registration, street, zipCode, region, country, currency, phone, fax, accountingBasis, baseCofa)
{
    this.Name = name;
    this.Registration = registration;
    this.Street = street;
    this.ZipCode = zipCode;
    this.Region = region;
    this.Country = country;
    this.Currency = currency;
    this.Phone = phone;
    this.Fax = fax;
    this.AccountingBasis = accountingBasis;
    this.BaseCOFA = baseCofa;
    
    this.GetAddress = function GetAddress(){
        return this.Street + ", " + this.Region + ", " + this.Country;
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.AuditProfile = function AuditProfile(version, periodId, firstMonth, rootFolder, subsidiaryId, time)
{
    this.Version = version;
    this.PeriodId = periodId;
    this.FirstMonth = firstMonth;
    this.RootFolder = rootFolder;
    this.SubsidiaryId = subsidiaryId;
    this.Time = time;
    
    
    
    this.GetPeriodName = function GetPeriodName()
    {
        var ap = new ns.GdpDu.AccountingPeriods();
        
        var period = ap.GetPeriodById(this.PeriodId);
       
        
        return period == null? "": period.Name;
    }
}
//==============================================================================



	

//==============================================================================
ns.GdpDu.Subsidiary = function Subsidiary(id)
{
	this.Id;
	this.Name;
	this.Country;
	this.TaxId;
	this.Address1;
	this.Address2;
	this.Fax;
	this.Phone;
	this.ZipCode;
	this.State;
	this.Currency;


    var filters = [new nlobjSearchFilter("internalid", null, "is", id)];
    
    var columns = [
		new nlobjSearchColumn("internalid"),
		new nlobjSearchColumn("namenohierarchy"),
		new nlobjSearchColumn("name"),
		new nlobjSearchColumn("taxidnum"),
        new nlobjSearchColumn("address1"),
        new nlobjSearchColumn("address2"),
        //new nlobjSearchColumn("fax"),
        //new nlobjSearchColumn("phone"),
		//new nlobjSearchColumn("currency"),
		new nlobjSearchColumn("zip"),
		new nlobjSearchColumn("state"),
		new nlobjSearchColumn("country")
	];
    
    var result = nlapiSearchRecord("subsidiary", null, filters, columns);
    var dr = new ns.DataAccess.DataRow(result[0]);
    
    if (result.length > 0)
	{
		this.Id = id;
		this.Name = dr.namenohierarchy;
		this.Country = dr.countryTEXT;
		this.TaxId = dr.taxidnum;
		this.Address = dr.address1 + " " + dr.address2;
		//this.Fax = dr.fax;
		//this.Phone = dr.telephone;
		//this.Currency = dr.currency;
		this.ZipCode = dr.zip;
		this.State = dr.state;
	}
	
    
    
    //--------------------------------------------------------------------------
    function LoadByCountry(country){
        var filters = [new nlobjSearchFilter("country", null, "is", country)];
        
        var columns = [new nlobjSearchColumn('internalid'), new nlobjSearchColumn('name'), new nlobjSearchColumn('country')];
        
        var result = nlapiSearchRecord('subsidiary', null, filters, columns);
        
        
        var subsidiaries = [];
        for (var i in result)
        {
            var dr = new ns.DataAccess.DataRow(result[i]);
            
            subsidiaries.push(dr.internalid, dr.name, dr.country);
        }
        
        return subsidiaries;
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.ReportingJob = function ReportingJob(date, reports){
    this.Date = date;
    this.Reports = reports
}
//==============================================================================





//==============================================================================
ns.GdpDu.Formatter = function Formatter(dateFormat, decimalSymbol, thousandsSeparator, columnSeparator, precision)
{
	var _Precision = precision;
	var _DecimalSymbol = decimalSymbol;
	var _ThousandsSeparator = thousandsSeparator;
	
    this.DateFormat = dateFormat;
    this.DecimalSymbol = decimalSymbol;
    this.ThousandsSeparator = thousandsSeparator;
    this.ColumnSeparator = columnSeparator;
    this.Precision = precision;
    var _Buffer = null;
    
    
    
    //--------------------------------------------------------------------------
    this.Format = function Format(value, columnType){
        if (columnType == "Date") 
            return this.FormatDate(value);
        
        if (columnType == "Numeric") 
            return this.FormatCurrency(value);
        
        return this.FormatAlphaNumeric(value);
    }
    
     
    
    //--------------------------------------------------------------------------
    this.FormatDate = function FormatDate(date){
        if (!(date instanceof Date)) 
            date = nlapiStringToDate(date);
        
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var yyyy = date.getFullYear();
        var yy = yyyy.toString().substring(2);
        var m = date.getMonth() + 1;
        var mm = m < 10 ? "0" + m : m;
        var mmm = months[m];
        var d = date.getDate();
        var dd = d < 10 ? "0" + d : d;
        
        var formatString = this.DateFormat;
        
        formatString = formatString.replace(/YYYY/i, yyyy);
        formatString = formatString.replace(/YY/i, yy);
        formatString = formatString.replace(/MMM/i, mmm);
        formatString = formatString.replace(/MM/i, mm);
        formatString = formatString.replace(/M/i, m);
        formatString = formatString.replace(/DD/i, dd);
        formatString = formatString.replace(/D/i, d);
        
        return formatString;
    }
    
    
    
    
    //--------------------------------------------------------------------------
    this.FormatCurrency = function FormatCurrency(value)
    {
        var precision = (_Precision == null || _Precision < 0)? 0: _Precision;
        
    	if( !value || value == null || value == 0)
        {
        	var zero = "0" + (precision > 0? _DecimalSymbol: "");
        	for( var i = 0; i < precision; ++i)
        		zero += "0";
        	
    		return zero;
        }
    	
    	var sFixed = parseFloat(value).toFixed(precision);
    	
    	var decimalSeparatorIndex = sFixed.length - precision - 1;
    	var decimalPart = sFixed.slice( decimalSeparatorIndex+1);
    	var wholePart = sFixed.slice(0, decimalSeparatorIndex);
    	var formatted = "";
    	
    	
    	for( var end = wholePart.length; end>0; end-=3)
    	{
    		var start = end<=3? 0: end-3;
    		formatted =
    			wholePart.slice(start, end) +
    			(formatted == ""? "":_ThousandsSeparator) +
    			formatted;
    	}
    	
    	if(precision > 0)
    		formatted += _DecimalSymbol + decimalPart;
    	
    	return formatted;
    }
    
    
    
    
    //--------------------------------------------------------------------------
    this.FormatAccountName = function FormatAccountName(accountNumber, accountName)
    {
        if (!accountNumber) 
            accountNumber = "";
        
        if (!accountName) 
            accountName = "";
        
        var re = eval("/^" + accountNumber + " /");
        return accountName.replace(re, "");
    }
    
    
    
    //--------------------------------------------------------------------------
    this.FormatAlphaNumeric = function FormatAlphaNumeric(value){
        //var invalidChars = "~!$^&*(){}[]\\|;:\"\'?/,<>@ #`.-+=";             //"~!$^&*(){}[]\\|;:\"\'?/,<>@ #`.-+=";
        //var formatted = value;
        
        //for( var i=0; i < invalidChars.length; ++i)
        //{
        //	formatted = formatted.replace( invalidChars.charAt(i), "%" + (invalidChars.charCodeAt(i).toString(16)).toUpperCase() + ";");
        //}
        
        //return formatted;
        return value;
    }
}
//==============================================================================





//==============================================================================
ns.GdpDu.Currency = function Currency(name)
{
	//this.Name;
	//this.Id = 666;
	
	
	
    var filters = [new nlobjSearchFilter("name", null, "is", name)];
        
    var columns = [
       new nlobjSearchColumn('internalid'),
       new nlobjSearchColumn('name')
    ];
    
    var result = nlapiSearchRecord('currency', null, filters, columns);
    
    if( result == null)
    	return;
    
    var dr = new ns.DataAccess.DataRow(result[0]);
    
    this.Name = dr.name;
    this.Id = dr.internalid;
}
//==============================================================================
