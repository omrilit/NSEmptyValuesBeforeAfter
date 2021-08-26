/**
* @author ecariaga
*/
// CLIENT SIDE CODES...

// custrecordparentaccount
// custrecordchildaccount

// example of parent account, child account relationship.
// parent account => 1001
//    child account => 86.10010104


// printform => BLANK or TR201 or TR211
// printtype => DETAIL or SUMMARY

//1001 Cash On Hand    
//1002 Cash In Bank        
        

var br5032ns; 
if (!br5032ns){ br5032ns = {}; }
br5032ns.Class = {};
br5032ns.Utility = {};
var _clientSideObject;

function mainPageInit(type) { _clientSideObject = new br5032ns.Class.MainApp(type); }
function fieldChange(type, name, linenum) { _clientSideObject.fieldChange(type, name, linenum); } 
function printReport(printform, printtype){ _clientSideObject.printBSReport(printform, printtype); }
function setWindowChanged(x, y){}

br5032ns.Class.MainApp =  function(type) 
{
    var msgObj = new br5032ns.Utility.Translation();
	   
    this.fieldChange = function (type, name, linenum)
    {
        if (name == 'custpage_subs' ) { refreshParentAccts(); }
        else if (name == 'accountingperiod_from' || name == 'accountingperiod_to') { return checkPeriodRange(); }
    };
         
    this.printBSReport = function(printform, printtype)
    {
		var acctperiodfrom = nlapiGetFieldValue('accountingperiod_from');
        var acctperiodto = nlapiGetFieldValue('accountingperiod_to');
        
        var facctprdname = nlapiGetFieldText('accountingperiod_from');
        var tacctprdname = nlapiGetFieldText('accountingperiod_to');
        if ( acctperiodto == null )
        { 
            acctperiodto = acctperiodfrom; 
            tacctprdname = facctprdname;
        }
        
        var params = "";        
        params += "&subsidiary="+ encodeURI( nlapiGetFieldValue('custpage_subs'));
        params += "&isconsolidated="+ encodeURI( nlapiGetFieldValue('custpage_isconsolidated'));
		params += "&fromacctperiod="+ encodeURI( acctperiodfrom );
		params += "&toacctperiod="+ encodeURI( acctperiodto );
		params += "&printform="+ encodeURI( printform );
		params += "&printtype="+ encodeURI( printtype );
		params += "&periodids="+encodeURI( getReportRange( acctperiodfrom,acctperiodto ));
		params += "&factprdname="+ encodeURI( facctprdname );
		params += "&tactprdname="+ encodeURI( tacctprdname );
		params += "&userdate="+ encodeURI( new Date().toString("MMMM d, yyyy HH:mm:ss") );

		var notice = msgObj.getSchedNotice(printtype);

        xmlHttp = GetXmlHttpObject();
        if (xmlHttp == null) { alert(msgObj.getAjaxErrMsg()); return; }

        var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_br5032_launcher', 'customdeploy_br5032_launcher');
        xmlHttp.open("POST", suiteletUrl, true);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.setRequestHeader("Content-length", params.length);
        xmlHttp.setRequestHeader("Connection", "close");
        xmlHttp.send(encodeURI(params));

        document.getElementById("main_form").onsubmit = "javascript:return true;";
        
        document.main_form.submit();
    };
    
    function showAlertBox(priority, message, details)
    {
    	document.main_form.addField('alert', 'help', [
            "<div id='div__alert' style='margin-top: 1em;' />",
            "<script>",
            "showAlertBox('div__alert', '", message, "', '&nbsp;&nbsp; ", details,
            "', NLAlertDialog.TYPE_", priority, "_PRIORITY,  '100%', null, null, null);",
            "</script>"
        ].join('')).setLayoutType('outsidebelow', 'startrow');
    }
   
    function checkPeriodRange()
    {
        var goodtogo = true;
        var arrActgPeriods = eval(nlapiGetFieldValue("custpage_arractgperiods"));
        var startActgPeriodValue = nlapiGetFieldValue('accountingperiod_from');
        var endActgPeriodValue = nlapiGetFieldValue('accountingperiod_to');
        
        // if the accountingperiod_to is null, it means the 'detailed' type of report is selected.
        // therefore, no need for date range...
        if ( endActgPeriodValue == null) { disablePrintBtn(false); return true; }
        
        var startActgPeriod = null;
        for (var i in arrActgPeriods)
        {
        	if (arrActgPeriods[i][0] == startActgPeriodValue)
            {
            	startActgPeriod = arrActgPeriods[i][1];
                break;
            }
        }
    
        var endActgPeriod = null;
        for (var i in arrActgPeriods)
        {
            if (arrActgPeriods[i][0] == endActgPeriodValue)
            {
                endActgPeriod = arrActgPeriods[i][2];
                break;
            }
        }
        
        if(endActgPeriod < startActgPeriod)
        {
            alert(msgObj.getPeriodErrMsg());
            disablePrintBtn( true);
            goodtogo = false;
        }
        else { disablePrintBtn(false); }

        return goodtogo;
    }   
    
    function refreshParentAccts( subsid, parentacctddctrl )
    {
        nlapiSetFieldValue('custpage_subsflag', 'clicked', false, true);
		document.getElementById("main_form").onsubmit = "javascript:return true;";
        document.main_form.submit();
    }
    
    function disablePrintBtn( disableBtn )
    {
        if (disableBtn)
        {
            document.getElementById('custpage_print_blank').disabled = true;
            document.getElementById('custpage_print_blank').className = "rndbuttoninptdis";
        }
        else
        {
            document.getElementById('custpage_print_blank').disabled = false;
            document.getElementById('custpage_print_blank').className = "rndbuttoninpt";
		}
    }

    function GetXmlHttpObject(handler)
    {
        var objXMLHttp = null;
        if (window.XMLHttpRequest) { objXMLHttp = new XMLHttpRequest(); }
        else 
        {
            if (window.ActiveXObject) { objXMLHttp = new ActiveXObject("Msxml2.XMLHTTP"); }
        }
        return objXMLHttp;
    }
    
    
    function getReportRange( PeriodIdFROM,PeriodIdTO )
    {
    	var fieldsFrom = ['startdate'];
        var columnFrom = nlapiLookupField('accountingperiod', PeriodIdFROM, fieldsFrom);
        
        var periodstartdate = columnFrom.startdate;
        
    	var fields = ['enddate'];
        var column = nlapiLookupField('accountingperiod', PeriodIdTO, fields);
        
        var periodenddate = column.enddate;

        // get the months...
        var filters2 = [];
        filters2[filters2.length] = new nlobjSearchFilter("isyear", null, "is", "F" );
        filters2[filters2.length] = new nlobjSearchFilter("isquarter", null, "is", "F" );
        var columns2 = [];
        columns2[columns2.length] = new nlobjSearchColumn("startdate").setSort();
        columns2[columns2.length] = new nlobjSearchColumn("enddate");
        columns2[columns2.length] = new nlobjSearchColumn("parent");
        columns2[columns2.length] = new nlobjSearchColumn("isquarter");
        columns2[columns2.length] = new nlobjSearchColumn("isyear");
        columns2[columns2.length] = new nlobjSearchColumn("internalid");
        var sr2 = nlapiSearchRecord("accountingperiod", null, filters2, columns2);        

        var periodids = [];
        var monthenddate; 
        var lowerbound;
        var upperbound; 
        for (var j=0; j < sr2.length; j++) 
        {
            currec2 = sr2[j];
            monthenddate = nlapiStringToDate( currec2.getValue("enddate") ); 
            lowerbound = nlapiStringToDate( periodstartdate );
            upperbound = nlapiStringToDate( periodenddate ); 

            if ( monthenddate >= lowerbound && monthenddate <= upperbound) 
            { 
                var periodobj = {};
                periodobj.internalid = currec2.getValue("internalid");
                periodobj.startdate = currec2.getValue("startdate");
                periodobj.enddate = currec2.getValue("enddate");
                periodids[periodobj.internalid] = periodobj; 
            }
        }

		periodids.sort( compareEndDates );
		var periodidstxt = "";
		
		for (var p in periodids)
        {
		if (!periodids[p].hasOwnProperty('internalid') ){ continue; }
            if (periodidstxt != "" ) { periodidstxt += "|"; }
            periodidstxt += periodids[p].internalid +"#"+ periodids[p].startdate+"%"+periodids[p].enddate;
		}

        return periodidstxt;
    }
    
    function compareEndDates(a, b) 
    {
        var adate = nlapiStringToDate( a.enddate );
        var bdate = nlapiStringToDate( b.enddate ); 

        if (adate < bdate) { return -1; }
        if (adate > bdate) { return 1; }
        return 0;
    }    

}; // end of 'br5032ns.Class.MainApp =  function(type)'

br5032ns.Utility.Translation = function()
{
	var contentsAsObject = getTheHiddenFieldContentsInJsonFormat();
	var translationData = contentsAsObject[0].data;

	var _ajaxerrormsg = translationData[0].value;
    var _perioderrormsg = translationData[1].value;
    var _bssumblank = translationData[2].value;
    var _commonmsg1 = translationData[3].value;
    var _commonmsg2 = translationData[4].value;
    var _commonmsg3 = translationData[5].value;
    var _bssumqueuemsg = translationData[6].value;
    
	var _language = nlapiGetContext().getPreference('LANGUAGE');
	for(var i in contentsAsObject)
	{
		if(contentsAsObject[i].language == _language){
			translationData = contentsAsObject[i].data;
			
			_ajaxerrormsg = translationData[0].value;
			_perioderrormsg = translationData[1].value;
			_bssumblank = translationData[2].value;
			_commonmsg1 = translationData[3].value;
			_commonmsg2 = translationData[4].value;
			_commonmsg3 = translationData[5].value;
			_bssumqueuemsg = translationData[6].value;
		}
		
	}
	
	this.getAjaxErrMsg = function(){ return _ajaxerrormsg; };
    this.getPeriodErrMsg = function(){ return _perioderrormsg; };
   
    this.getSchedNotice = function( printtype ) 
    {
        var _notice = "";
        _notice = _bssumblank;
        _notice += "\n\n" + _commonmsg1 +"\n" + updateFileType(printtype,_commonmsg2)+"\n\n"+ _commonmsg3;
        return _notice;                                          
    };
    
    this.getQueuedMsg = function()
    {
        var _notice = "";
        _notice = _bssumqueuemsg;
        return _notice;        
    };
	
    function updateFileType(printtype,msg)
    {
    	return msg.toString().replace("PDF",printtype);
    }
    
	function getTheHiddenFieldContentsInJsonFormat()
	{
		return JSON.parse(nlapiGetFieldValue('custpage_hidden_json_obj'));
	};
}
