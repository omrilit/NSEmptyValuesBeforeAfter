var br5032ns; 
if (!br5032ns){ br5032ns = {}; }
br5032ns.Class = {};
br5032ns.Class.Utility = {};

br5032ns.Class.BSReportExtraction = function (resourcemgr, from, to, periods, subs)
{
	var _accountsBSObj = {};
    //var _glAcctRowYTDObjects = [];  // this will contain the Total Debit and Credit for the YTD for both detail and summary...
    
    var _fromperiodid = from;
    var _subsidiary = subs;
    var _assocallperiodids = [];
    var _assocrangeperiodids = [];
    var _allperiodsarray = [];
    var _rm = resourcemgr;
    var _withretrieveddata = false;
    var _withtrans;
    var _ispivotTable;
    var CurrentAsset = [_rm.GetString("CA_BANK"),_rm.GetString("CA_ACCOUNTS_RECEIVABLE"),_rm.GetString("CA_UNBILLED_RECEIVABLE"),_rm.GetString("CA_OTHER_CURRENT_ASSET"),_rm.GetString("CA_DEFERRED_EXPENSE")];
    var FixedAsset = [_rm.GetString("FA_FIXED_ASSET")];
    var OtherAsset = [_rm.GetString("OT_OTHER_ASSET")];
    var Liability = [_rm.GetString("L_ACCOUNTS_PAYABLE"),_rm.GetString("L_CREDIT_CARD"),_rm.GetString("L_OTHER_CURRENT_LIABILITY"),_rm.GetString("L_DEFERRED_REVENUE")];
	var LongTermLiability = [_rm.GetString("LTL_LONG_TERM_LIABILITY")];
	var CapitalAndReserves = [_rm.GetString("CAR_EQUITY")];
	var NetIncome = [_rm.GetString("NI_INCOME"),_rm.GetString("NI_COST_OF_GOODS_SOLD"),_rm.GetString("NI_EXPENSE"),_rm.GetString("NI_OTHER_INCOME"),_rm.GetString("NI_OTHER_EXPENSE")];
    var bStartPFalse = false;
    var bStartPTrue = true;
    var bEndPFalse = false;
    var bEndPTrue = true;
    var _prevRetainedEarnings = 0;
    var _initialNetIncome = 0;
    var _fiscalYear = {};
	
	var _BSType = {};
	setTypes();
	
    this.isWithData = function(){return _withretrieveddata; };
    this.getBSAccounts = function(){ return _accountsBSObj; };
    this.getBSTypes = function(){ return _BSType; };
    this.getPrevRetEarn = function(){ return _prevRetainedEarnings; };
    this.getInitNetInc = function(){ return _initialNetIncome; };
    this.getFiscalYearData = function(){ return _fiscalYear; };
    
   
    this.run = function()
    {
        // 'periods' contains the periods within the fiscal year. based on the 'to date' field.
        var periodinfopair = periods.split('|');  // 72#31/1/2009| 73#28/2/2009|
        var periodarraylength = periodinfopair.length;
        for (var i=0; i < periodarraylength; i++)
        {
            var pinfod = periodinfopair[i].split('#');  // 80#31/7/2009
            var pinfo = pinfod[1].split('%');
            
            var pinfoobj = {};
            pinfoobj.internalid = pinfod[0];
            pinfoobj.startdatestr = pinfo[0];
            pinfoobj.enddatestr = pinfo[1];
            pinfoobj.startdateobj = nlapiStringToDate((""+pinfoobj.startdatestr).replace(/-/g,'/'));
            pinfoobj.enddateobj = nlapiStringToDate((""+pinfoobj.enddatestr).replace(/-/g,'/'));
            _assocallperiodids[pinfoobj.internalid] = pinfoobj;                     // associative array...
            _allperiodsarray[_allperiodsarray.length] = pinfoobj;                // non-associative array...
        }

        var allperiodarraylength = _allperiodsarray.length;
        for (var i=0; i < allperiodarraylength; i++)
        {
            if( _allperiodsarray[i].enddateobj < _assocallperiodids[_fromperiodid].enddateobj) { continue; }
            var pobj = {};
            pobj.internalid = _allperiodsarray[i].internalid;
            var assocpobj = _assocallperiodids[pobj.internalid];
            var assocobjedate = assocpobj.enddatestr;
            pobj.enddatestr = assocobjedate;
            _assocrangeperiodids[assocobjedate] = pobj;
        }

        // run the report for all the ranges...maximum of 12 nlapiRunReport. from the starting month of the fiscal year to the latest month...
        var repid = getReportID( _rm.GetString( "IS_REPORT_NAME" ) );
        retrievePivotTable(repid,_ispivotTable,allperiodarraylength);
        
        getRetainedEarnings();
        getInitialNetIncome();
    };
    
    function getFiscalYear( periodFrom )
    {
    	var fiscalYear = {};
    	fiscalYear.lastfy = -555;
    	fiscalYear.thisfy = -555;
    	fiscalYear.firstperiod = -555;
    	fiscalYear.prevperiod = -555;
    	fiscalYear.initialbalancedate = '';
    	fiscalYear.endingbalancedate = new Date();
    	fiscalYear.firstmonthofyear = false;
    	
    	var fields = ['startdate','enddate'];
        var column = nlapiLookupField('accountingperiod', periodFrom, fields);
        var periodenddate = column.enddate;
        var periodstartdate = column.startdate;

        // get the isyear == 'T' to get the lowerbound and upperbound...
        var filters = [ new nlobjSearchFilter("isyear", null, "is", "T" ) ];
        var columns = [new nlobjSearchColumn("startdate").setSort(),
                       new nlobjSearchColumn("enddate")];
        columns[0].setSort();  //sort by startdate
        
        var sr = nlapiSearchRecord("accountingperiod", null, filters, columns);        

        var currec;
        var datebasis; 
        var startdate;
        var enddate; 
        
        if (sr != null)
        {
        	fiscalYear.firstperiod = sr[0].id;	//get the FIRST EVER PERIOD
        }
        
	    for (var i=0; i < sr.length; i++)
        {
            currec = sr[i];	//get first fiscal year
            datebasis = nlapiStringToDate( periodenddate ); 
            startdate = nlapiStringToDate( currec.getValue("startdate") );
            enddate = nlapiStringToDate( currec.getValue("enddate") ); 
            if ( datebasis >= startdate && datebasis <= enddate  ) 
            { 
            	fiscalYear.thisfy = sr[i].id;
            	
            	if(i > 0) 
            		fiscalYear.lastfy = sr[i-1].id;
            	else
            		fiscalYear.lastfy = -1;
            	
            	var startofperiod = nlapiStringToDate(periodstartdate);
            	if(nlapiDateToString(startofperiod) == nlapiDateToString(startdate))
            		fiscalYear.firstmonthofyear = true;
            	break; 
            }
        }
	    var filters2 = [new nlobjSearchFilter("isyear", null, "is", "F" ),
                       new nlobjSearchFilter("isquarter", null, "is", "F" )];
        var sr2 = nlapiSearchRecord("accountingperiod", null, filters2, columns);
        if (sr2 != null)
        {
        	for(var g=0; g < sr2.length; g++)
        	{
        		if(sr2[g].id == _allperiodsarray[0].internalid)
        		{
        			if(g > 0)
        			{
        				//check if prevperiod is within range of the this fiscal year
            			//if not, fiscalYear.prevperiod = -1;
            	        column = nlapiLookupField('accountingperiod', sr2[g-1].id, fields);
            	        fiscalYear.initialbalancedate = column.enddate; //initial balance End date
            	        prevperiodenddate = column.enddate;
            	        datebasis = nlapiStringToDate( prevperiodenddate ); 
            	        if ( datebasis >= startdate && datebasis <= enddate  ) 
            	        	fiscalYear.prevperiod = sr2[g-1].id;
            	        else
            	        	fiscalYear.prevperiod = -1;
        			}
        			else
        			{
        				fiscalYear.prevperiod = -1;
        			}
        			
        			if(_allperiodsarray[0].internalid == _allperiodsarray[(_allperiodsarray.length-1)].internalid)
        			{
        				fiscalYear.endingbalancedate = sr2[g].getValue("enddate");
        				break;
        			}
        			
        		}else if(sr2[g].id == _allperiodsarray[(_allperiodsarray.length-1)].internalid)
        		{
        			fiscalYear.endingbalancedate = sr2[g].getValue("enddate");
        			break; 
        		}
        	}
        }
        return fiscalYear; //-555 = no result, -1 = first fy, else period ID
    }
    
    function retrieveISTable()
    {
    	var repISid = -200; //Netsuite Income Statement ID
    	var pivotISTable = null;
    	
    	//get the LAST FISCAL YEAR
    	var lastfiscalyear = _fiscalYear.lastfy;
        
        if(lastfiscalyear < 0)
        {
        	return pivotISTable;
        }
        else
        {
        	//get the FIRST PERIOD
        	var firstperiod = _fiscalYear.firstperiod;
	    	 	
	        var runattempterrorobj = "";
	        var attemptlimit = 5;
	
	        // NOTE: sometimes, an attempt to call the nlapiRunReport
	        for (var runattempts = 1; runattempts <= attemptlimit; runattempts++ )
	        {
	        	var reportSettings = new nlobjReportSettings(firstperiod, lastfiscalyear);
	        	if ( br5032ns.Class.Utility.isSubsidiarySettingOn()) { reportSettings.setSubsidiary(_subsidiary); }
	            try
	            {
	            	pivotISTable = nlapiRunReport(repISid, reportSettings);
	            	break; // if no exception was encountered, exit run attempt loop.
	            }
	            catch(ex) 
	            { 
	            	runattempterrorobj = _rm.GetString( "RUNREPORT_EXCEPTION_MSG" );
	                schedsleep(20000); // wait for 20 seconds before another attempt to the nlapiRunReport API.
	                continue; 
	            }
	        }
	
	        // after maximum attempts to run the nlapiRunReport throw an exception and stop the script. Try restarting later.
	        if (runattempts >= attemptlimit) 
	        { 
	            var dbgerrmsg =  runattempterrorobj + "<BR/><BR/>"+ "TAX PERIOD that failed is : id => "+ 
	            				firstperiod + ", end date => "+ lastfiscalyear;  
	            throw runattempterrorobj; 
	        }
	        return pivotISTable;
        }
    }
     
    
    function getRetainedEarnings()
    {
    	_fiscalYear = getFiscalYear(_allperiodsarray[0].internalid); //internal id of the Period From
    	var pivotISTable = retrieveISTable();
    	var prevRetainedEarnings = 0;
    	
    	if(pivotISTable == null)
    	{
    		prevRetainedEarnings = 0;
    	}
    	else
    	{
    		var columns = pivotISTable.getColumnHierarchy().getVisibleChildren();
    		var level0 = pivotISTable.getRowHierarchy().getChildren();
    		var i0 = level0.length-1;
    		var amountSummaryLine= level0[i0].getSummaryLine(); //Net Profit / (Loss)
    		prevRetainedEarnings = amountSummaryLine.getValue(columns[0]);
    	}
    	_prevRetainedEarnings = prevRetainedEarnings;
    }
    
    
    
    function retrieveNITable()
    {
    	var repISid = -200; //Netsuite Income Statement ID
    	var pivotNITable = null;
    	
    	//get the CURRENT FISCAL YEAR
        var currentfiscalyear = _fiscalYear.thisfy;
        
        if(currentfiscalyear < 0)
        {
        	return pivotNITable;
        }
        else
        {
	    	//get the PREVIOUS Period
	    	var prevperiod = _fiscalYear.prevperiod;
	    	if((prevperiod == -555) || (prevperiod == -1))
	    		return pivotNITable;
	        var runattempterrorobj = "";
	        var attemptlimit = 5;
	
	        // NOTE: sometimes, an attempt to call the nlapiRunReport
	        for (var runattempts = 1; runattempts <= attemptlimit; runattempts++ )
	        {
	        	var reportSettings = new nlobjReportSettings(currentfiscalyear, prevperiod);
	        	
	        	if ( br5032ns.Class.Utility.isSubsidiarySettingOn()) { reportSettings.setSubsidiary(_subsidiary); }
	            try
	            {
	            	pivotNITable = nlapiRunReport(repISid, reportSettings);
	            	break; // if no exception was encountered, exit run attempt loop.
	            }
	            catch(ex) 
	            { 
	            	TraceUsage("", "FAILED call to nlapiRunReport(repid, reportSettings) - ATTEMPT #"+runattempts+" | taxperiodid => "+currentfiscalyear+"-"+prevperiod);
	                runattempterrorobj = _rm.GetString( "RUNREPORT_EXCEPTION_MSG" );
	                schedsleep(20000); // wait for 20 seconds before another attempt to the nlapiRunReport API.
	                continue; 
	            }
	        }
	
	        // after maximum attempts to run the nlapiRunReport throw an exception and stop the script. Try restarting later.
	        if (runattempts >= attemptlimit) 
	        { 
	            var dbgerrmsg =  runattempterrorobj + "<BR/><BR/>"+ "TAX PERIOD that failed is : id => "+ 
	            				currentfiscalyear + ", end date => "+ prevperiod;  
	            TraceUsage("", "ATTEMPT LIMIT REACHED nlapiRunReport(repid, reportSettings) - ATTEMPT #"+attemptlimit+" | taxperiodid => "+currentfiscalyear+"-"+prevperiod+" | <br>Message "+dbgerrmsg);
	            throw runattempterrorobj; 
	        }
	        
	        return pivotNITable;
        }
    }
    
    function getInitialNetIncome()
    {
    	var pivotNITable = retrieveNITable();
    	
    	if(pivotNITable == null)
    	{
    		initialNetIncome = 0;
    	}
    	else
    	{
    		var columns = pivotNITable.getColumnHierarchy().getVisibleChildren();
    		var level0 = pivotNITable.getRowHierarchy().getChildren();
    		var i0 = level0.length-1;
    		var amountSummaryLine= level0[i0].getSummaryLine(); //Net Profit / (Loss)
    		initialNetIncome = amountSummaryLine.getValue(columns[0]);
    	}
    	_initialNetIncome = initialNetIncome;
    }
    
    
    function retrievePivotTable(repid,pivotTable,allperiodarraylength)
    {
    	for (var i=0; i < allperiodarraylength; i++)
        { 
        	var runattempterrorobj = "";
            var attemptlimit = 5;

            // NOTE: sometimes, an attempt to call the nlapiRunReport
            for (var runattempts = 1; runattempts <= attemptlimit; runattempts++ )
            {
            	var reportSettings = new nlobjReportSettings(parseInt( _allperiodsarray[i].internalid, 10 ), parseInt( _allperiodsarray[i].internalid, 10 ) );
            	
            	if ( br5032ns.Class.Utility.isSubsidiarySettingOn()) { reportSettings.setSubsidiary(_subsidiary); }
                try
                {
                	pivotTable = nlapiRunReport(repid, reportSettings);
                	break; // if no exception was encountered, exit run attempt loop.
                }
                catch(ex) 
                { 

                    TraceUsage("", "FAILED call to nlapiRunReport(repid, reportSettings) - ATTEMPT #"+runattempts+" | taxperiodid => "+_allperiodsarray[i].internalid);
                    runattempterrorobj = _rm.GetString( "RUNREPORT_EXCEPTION_MSG" );
                    schedsleep(20000); // wait for 20 seconds before another attempt to the nlapiRunReport API.
                    continue; 
                }
            }

            // after maximum attempts to run the nlapiRunReport throw an exception and stop the script. Try restarting later.
            if (runattempts >= attemptlimit) 
            { 
                var dbgerrmsg =  runattempterrorobj + "<BR/><BR/>"+ "TAX PERIOD that failed is : id => "+ 
                                            _allperiodsarray[i].internalid + ", end date => "+ _allperiodsarray[i].enddatestr;  
                TraceUsage("", "ATTEMPT LIMIT REACHED nlapiRunReport(repid, reportSettings) - ATTEMPT #"+attemptlimit+" | taxperiodid => "+_allperiodsarray[i].internalid+" | <br>Message "+dbgerrmsg);
                throw runattempterrorobj; 
            }
			
            if((i==0)&&(i==(allperiodarraylength-1)))	//if Start = End, only 1 period
            	retrieveData(pivotTable,bStartPTrue,bEndPTrue,_allperiodsarray[i].internalid);
            else if(i==0)
            	retrieveData(pivotTable,bStartPTrue,bEndPFalse,_allperiodsarray[i].internalid); //if Start
            else if(i==(allperiodarraylength-1))
            	retrieveData(pivotTable,bStartPFalse,bEndPTrue,_allperiodsarray[i].internalid); //if End
            else
            	retrieveData(pivotTable,bStartPFalse,bEndPFalse,_allperiodsarray[i].internalid); //if middle
        }//for (var i=0; i < allperiodarraylength; i++)
	    
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Sort Account Name alphabetically
        
        var accountsBSObjType={};
        
        for(var u in _accountsBSObj){
        	accountsBSObjType[u]={};
        	var alphaArray = [];
        	
        	for(var w in _accountsBSObj[u]){
        		alphaArray.push(w);
        	}
        	alphaArray.sort();
        	
        	for(var v=0; v < alphaArray.length; v++){
        		accountsBSObjType[u][alphaArray[v]] = {};
        		accountsBSObjType[u][alphaArray[v]] = _accountsBSObj[u][alphaArray[v]];
        	}
        	_accountsBSObj[u] = accountsBSObjType[u];
        }
        
    }
	
   
    
	function setTypes(){
		_BSType.CurrentAsset = CurrentAsset;
		_BSType.FixedAsset = FixedAsset;
		_BSType.OtherAsset = OtherAsset;
		_BSType.Liability = Liability;
		_BSType.LongTermLiability = LongTermLiability;
		_BSType.CapitalAndReserves = CapitalAndReserves;
		_BSType.NetIncome = NetIncome;
	}
	
	function getType(accountType){
		for(var t in _BSType){
			var typeLength = _BSType[t].length;
			for(var f=0; f<typeLength; f++){
				if(_BSType[t][f] == accountType){
					return t;
				}
			}
		}
		return _rm.GetString( "INVALID_TYPE" );
	}
	
	
	function retrieveData(pivotTable,isStartPeriod, isEndPeriod, period)
	{
		
		
		var columns = pivotTable.getColumnHierarchy().getVisibleChildren();
		var level0 = pivotTable.getRowHierarchy().getChildren();
		var accountsObjTemp = {};

		for (var i0 = 0; i0 < level0.length; i0++)  //Other Current Asset, Bank, Fixed Asset, Accounts Payable etc
		{
			//var childIndex = 0;
			var accountType = level0[i0].getValue(); //Other Current Asset, Bank, Fixed Asset, Accounts Payable etc
			
			accountsObjTemp[accountType] = {};
			accountsObjTemp[accountType].Type = getType(accountType); // returns if Asset or Liability
			accountsObjTemp[accountType].AccountTypeName = accountType;
			accountsObjTemp[accountType].AccountTypeOpeningBalance = 0;
			accountsObjTemp[accountType].AccountTypeDebit = 0;
			accountsObjTemp[accountType].AccountTypeCredit = 0;
			accountsObjTemp[accountType].AccountTypeEndingBalance = 0;
			
			var level1 = level0[i0].getChildren();
			if (level1 == null)
				continue;
			for (var i1 = 0; i1 < level1.length; i1++)  
			{
				var accountName = level1[i1].getValue(); //1090 - Undeposited Funds, 86.130105 - Prepaid Maintenance, 86.124302 - Inventory Packaging (CN stores) etc
				
				var accountNameOpeningLine = level1[i1].getOpeningLine();
				var accountNameSummaryLine = level1[i1].getSummaryLine();
				var accountNameOpeningBalance = accountNameOpeningLine.getValue(columns[1]);	//Opening Balance
				var accountNameEndingBalance = accountNameSummaryLine.getValue(columns[1]); //Ending Balance
				
				var level2 = level1[i1].getChildren();
				if (level2 == null)
					continue;
				var detail = { Debit: 0, Credit: 0};
				
				for (var i2 = 0; i2 < level2.length; i2++)  //Detail
				{
					var node = level2[i2];
					
					var amount = node.getValue(columns[0]);
					
					if(amount == null)
						amount = 0;
				
					if(amount > 0){
						detail.Debit += parseFloat(amount);
					}else{
						detail.Credit += parseFloat(amount);
					}
					
					//Another SubChildren, ex., Expense -> Motor Vehicle - > PETROL & OIL
					var level3 = level2[i2].getChildren();
					if (level3 == null)
						continue;
					
					for (var i3 = 0; i3 < level3.length; i3++){
						var node2 = level3[i3];
						
						var amount2 = node2.getValue(columns[0]);
						
						if(i3 == 0){
							var ob = node2.getValue(columns[1]) - node2.getValue(columns[0]);
							accountNameOpeningBalance += ob;	//Opening Balance
						}
						
						if(amount2 == null)
							amount2 = 0;
					
						if(amount2 > 0){
							detail.Debit += parseFloat(amount2);
						}else{
							detail.Credit += parseFloat(amount2);
						}
					}
					
					
				}
				
				// if no opening balance and ending balance, move to next account in the array...
				if (accountNameOpeningBalance == 0 && accountNameEndingBalance == 0 && detail.Debit == 0 && detail.Credit == 0) { continue; }
			
				// the '_withdataretrieved' flag makes sure that the account has atleast an opening balance for the specified period.
				if (!_withretrieveddata) {_withretrieveddata = true; }
				
				
				//if Account Name has Opening Balance / Debit / Credit / Ending Balance
				if((accountNameOpeningBalance != 0) || (detail.Debit != 0) || (detail.Credit != 0) || (accountNameEndingBalance != 0)){
					accountsObjTemp[accountType][accountName] = {};
					accountsObjTemp[accountType][accountName].AccountNameOpeningBalance = accountNameOpeningBalance;
					accountsObjTemp[accountType][accountName].AccountNameDebit = detail.Debit;
					accountsObjTemp[accountType][accountName].AccountNameCredit = detail.Credit;
					accountsObjTemp[accountType][accountName].AccountNameEndingBalance = accountNameEndingBalance;

					accountsObjTemp[accountType].AccountTypeOpeningBalance += accountsObjTemp[accountType][accountName].AccountNameOpeningBalance;
					accountsObjTemp[accountType].AccountTypeDebit += accountsObjTemp[accountType][accountName].AccountNameDebit;
					accountsObjTemp[accountType].AccountTypeCredit += accountsObjTemp[accountType][accountName].AccountNameCredit;
					accountsObjTemp[accountType].AccountTypeEndingBalance += accountsObjTemp[accountType][accountName].AccountNameEndingBalance;
					
					//childIndex++;
				}//if((accountNameOpeningBalance != 0) || (detail.Debit != 0) || (detail.Credit != 0) || (accountNameEndingBalance != 0)){
				
				//if MIDDLE of range period
				if((!isEndPeriod)&& (!isStartPeriod) &&
					((accountsObjTemp[accountType].AccountTypeOpeningBalance != 0) || (accountsObjTemp[accountType].AccountTypeDebit != 0) || 
					(accountsObjTemp[accountType].AccountTypeCredit != 0) || (accountsObjTemp[accountType].AccountTypeEndingBalance != 0)))
				{
					/*nlapiLogExecution('Debug','--------','');
					nlapiLogExecution('Debug','!isStartPeriod: '+!isStartPeriod+', !isEndPeriod: '+!isEndPeriod,'');
					nlapiLogExecution('Debug','accountType: '+accountType+', accountName: '+accountName,'');
					*/
					if((_accountsBSObj[accountType] == null) || (_accountsBSObj[accountType] == undefined))
					{
						//nlapiLogExecution('Debug','not existing-accountType: '+accountType,'');
						_accountsBSObj[accountType] = {};
						accountsObjTemp[accountType].AccountTypeOpeningBalance = 0; //if End Period and AccntType NOT EXISTING, Opening Balance initialize to 0
						
						for(var property in accountsObjTemp[accountType]){
							//nlapiLogExecution('Debug','accountsObjTemp[accountType]-property: '+property,'');
							_accountsBSObj[accountType][property] = accountsObjTemp[accountType][property];
						}
					}
					else //if accountType is existing
					{
						//nlapiLogExecution('Debug','existing-accountType: '+accountType,'');
						
						if((_accountsBSObj[accountType][accountName] == null) || (_accountsBSObj[accountType][accountName] == undefined)) //if accountName is NOT existing
						{
							//nlapiLogExecution('Debug','not existing-accountName: '+accountName,'');
							_accountsBSObj[accountType][accountName] = {};
							accountsObjTemp[accountType][accountName].AccountNameOpeningBalance = 0;  //if End Period AccntType EXISTING and AccntName NOT EXISTING, Opening Balance initialize to 0
							
							for(var property in accountsObjTemp[accountType][accountName]){
								//nlapiLogExecution('Debug','accountsObjTemp[accountType][accountName]-property: '+property,'');
								_accountsBSObj[accountType][accountName][property] = accountsObjTemp[accountType][accountName][property];
							}
							
							_accountsBSObj[accountType].AccountTypeDebit += _accountsBSObj[accountType][accountName].AccountNameDebit;
							_accountsBSObj[accountType].AccountTypeCredit += _accountsBSObj[accountType][accountName].AccountNameCredit;
							_accountsBSObj[accountType].AccountTypeEndingBalance = 0;
							
							//nlapiLogExecution('Debug','accountType:'+accountType+' ,AccountTypeEndingBalance:'+_accountsBSObj[accountType].AccountTypeEndingBalance,'');
							
						}else{
							//nlapiLogExecution('Debug','existing-accountName: '+accountName,'');
							_accountsBSObj[accountType][accountName].AccountNameDebit += accountsObjTemp[accountType][accountName].AccountNameDebit;
							_accountsBSObj[accountType][accountName].AccountNameCredit += accountsObjTemp[accountType][accountName].AccountNameCredit;
							
							_accountsBSObj[accountType][accountName].AccountNameEndingBalance = accountsObjTemp[accountType][accountName].AccountNameEndingBalance;
							
							_accountsBSObj[accountType].AccountTypeDebit += accountsObjTemp[accountType][accountName].AccountNameDebit;
							_accountsBSObj[accountType].AccountTypeCredit += accountsObjTemp[accountType][accountName].AccountNameCredit;
							_accountsBSObj[accountType].AccountTypeEndingBalance = 0;
	
						}
					}//else
				}//if MIDDLE of range period
			
				//if END of a PERIOD only
				if((isEndPeriod)&& (!isStartPeriod) &&
					((accountsObjTemp[accountType].AccountTypeEndingBalance != 0) || (accountsObjTemp[accountType].AccountTypeDebit != 0) || 
					(accountsObjTemp[accountType].AccountTypeCredit != 0)))
				{
					//nlapiLogExecution('Debug','--------','');
					//nlapiLogExecution('Debug','!isStartPeriod: '+!isStartPeriod+', isEndPeriod: '+isEndPeriod,'');
					//nlapiLogExecution('Debug','accountType: '+accountType+', accountName: '+accountName,'');
					
					if((_accountsBSObj[accountType] == null) || (_accountsBSObj[accountType] == undefined))
					{
						//nlapiLogExecution('Debug','not existing-accountType: '+accountType,'');
						_accountsBSObj[accountType] = {};
						accountsObjTemp[accountType].AccountTypeOpeningBalance = 0; //if End Period and AccntType NOT EXISTING, Opening Balance initialize to 0
						
						for(var property in accountsObjTemp[accountType]){
							//nlapiLogExecution('Debug','accountsObjTemp[accountType]-property: '+property,'');
							_accountsBSObj[accountType][property] = accountsObjTemp[accountType][property];
						}
					}
					else //if accountType is existing
					{
						//nlapiLogExecution('Debug','existing-accountType: '+accountType,'');
						
						if((_accountsBSObj[accountType][accountName] == null) || (_accountsBSObj[accountType][accountName] == undefined)) //if accountName is NOT existing
						{
							//nlapiLogExecution('Debug','not existing-accountName: '+accountName,'');
							_accountsBSObj[accountType][accountName] = {};
							accountsObjTemp[accountType][accountName].AccountNameOpeningBalance = 0;  //if End Period AccntType EXISTING and AccntName NOT EXISTING, Opening Balance initialize to 0
							
							for(var property in accountsObjTemp[accountType][accountName]){
								//nlapiLogExecution('Debug','accountsObjTemp[accountType][accountName]-property: '+property,'');
								_accountsBSObj[accountType][accountName][property] = accountsObjTemp[accountType][accountName][property];
							}
							
							_accountsBSObj[accountType].AccountTypeDebit += _accountsBSObj[accountType][accountName].AccountNameDebit;
							_accountsBSObj[accountType].AccountTypeCredit += _accountsBSObj[accountType][accountName].AccountNameCredit;
							_accountsBSObj[accountType].AccountTypeEndingBalance += _accountsBSObj[accountType][accountName].AccountNameEndingBalance;
							
						}else{
							//nlapiLogExecution('Debug','existing-accountName: '+accountName,'');
							_accountsBSObj[accountType][accountName].AccountNameDebit += accountsObjTemp[accountType][accountName].AccountNameDebit;
							_accountsBSObj[accountType][accountName].AccountNameCredit += accountsObjTemp[accountType][accountName].AccountNameCredit;
							
							//var tempAccntNameEndingBal = _accountsBSObj[accountType][accountName].AccountNameEndingBalance; //previous Ending Balance of the AccntName
							_accountsBSObj[accountType][accountName].AccountNameEndingBalance = accountsObjTemp[accountType][accountName].AccountNameEndingBalance;
							
							_accountsBSObj[accountType].AccountTypeDebit += accountsObjTemp[accountType][accountName].AccountNameDebit;
							_accountsBSObj[accountType].AccountTypeCredit += accountsObjTemp[accountType][accountName].AccountNameCredit;
							
							//_accountsBSObj[accountType].AccountTypeEndingBalance -= tempAccntNameEndingBal; //subtract the previous Ending Balance of the AccntName on the AccntType
							_accountsBSObj[accountType].AccountTypeEndingBalance += accountsObjTemp[accountType][accountName].AccountNameEndingBalance;
						}
					}//else
				}//if END of a PERIOD only
				
			}//for (var i1 = 0; i1 < level1.length; i1++)
			
			//if START of a PERIOD only
			if((isStartPeriod) && (!isEndPeriod) && 
				((accountsObjTemp[accountType].AccountTypeOpeningBalance != 0) || (accountsObjTemp[accountType].AccountTypeDebit != 0) || 
				(accountsObjTemp[accountType].AccountTypeCredit != 0)))
			{
				//nlapiLogExecution('Debug','--------','');
				//nlapiLogExecution('Debug','isStartPeriod: '+!isStartPeriod+', !isEndPeriod: '+!isEndPeriod,'');
				if((_accountsBSObj[accountType] == null) || (_accountsBSObj[accountType] == undefined))  //if accountType is NOT existing
				{
					//nlapiLogExecution('Debug','not existing-accountType: '+accountType,'');
					_accountsBSObj[accountType] = {};
					accountsObjTemp[accountType].AccountTypeEndingBalance = 0; //if Start Period, Ending Balance initialize to 0
					_accountsBSObj[accountType] = accountsObjTemp[accountType];
				}
				else //if accountType is existing && isStartPeriod means that START = END
				{
					//nlapiLogExecution('Debug','StartPeriod but existing accountType?! Please check. accountType: '+accountType,'');
				}//else
			}//if START of a PERIOD only
			
			//if START = END
			if((isStartPeriod) && (isEndPeriod) && 
				((accountsObjTemp[accountType].AccountTypeOpeningBalance != 0) || (accountsObjTemp[accountType].AccountTypeDebit != 0) || 
				(accountsObjTemp[accountType].AccountTypeCredit != 0) || (accountsObjTemp[accountType].AccountTypeEndingBalance != 0)))
			{
				//nlapiLogExecution('Debug','--------','');
				//nlapiLogExecution('Debug','isStartPeriod: '+!isStartPeriod+', isEndPeriod: '+isEndPeriod,'');
				
				if((_accountsBSObj[accountType] == null) || (_accountsBSObj[accountType] == undefined))  //if accountType is NOT existing
				{
					//nlapiLogExecution('Debug','not existing-accountType: '+accountType,'');
					_accountsBSObj[accountType] = {};
					_accountsBSObj[accountType] = accountsObjTemp[accountType];
				}
				else //if accountType is existing && isStartPeriod means that START = END
				{
					//nlapiLogExecution('Debug','StartPeriod but existing accountType?! Please check. accountType: '+accountType,'');
				}//else
			}//if START = END
			
		}//for (var i0 = 0; i0 < level0.length; i0++)
	}
	
	
    function schedsleep(ms)
    {
        if ( ms == null ) { ms = 10000; }
        var dt = new Date();
        dt.setTime(dt.getTime() + ms);
        while (new Date().getTime() < dt.getTime());
    }
    
    
    function getColumnValue( child, columns, index )
    {
        var value = "";
        value += ( child.getValue( columns[index] ) != null ) ? child.getValue( columns[index] ) : "";
        // '_withtrans' is a flag to determine whether there is atleast one field with value.  
        if (!_withtrans){ if ( value != "" ) { _withtrans = true; } }
        return value; 
    }
    
    
    function trim(stringToTrim) { return (''+stringToTrim).replace(/^\s+|\s+$/g,""); } 

    
    function getReportID(reportName)
    {
        // default the report to the General Ledger if no report name passed...
        if (reportName == null || reportName == "") { reportName = "General Ledger";}
        var rs = nlapiSearchGlobal(reportName);
        if (rs == null) { return null; }
        
        var reportId = 0;
        for (var i=0; i < rs.length; i++)
        {
            if ((rs[i].getValue("name")).length == reportName.length)
            {
                if (rs[i].getValue("name") == reportName)
                {
                    reportId = rs[i].getId().replace(/REPO_/, "");  //remove "REPO_" prefix
                    break;
                } 
            }
        }
        return parseInt(reportId);
    }

};  // br5032ns.Class.BSReportExtraction = function (childaccts, resourcemgr, from, to, subs, printtype, printparent)

// class definitions for Account and Transactions...
br5032ns.Class.Account = function()
{
    var accountName;
    var openingBalance = 0;
    var accountTxs = [];
    var acctPeriodEndDate;

    this.getAccountName = function (){ return accountName; }; 
    this.getOpeningBalance = function (){ return openingBalance; };
    this.getAcctPeriodEndDate = function (){ return acctPeriodEndDate; };
    
    this.getAccountTxs = function (){ return accountTxs; };
    this.setAccountTxs = function (values){ accountTxs = values; };

    this.setAccountName = function(value){ accountName = value; }; 
    this.setOpeningBalance = function(value)
    {
        var nvalue = isNaN(parseFloat(value))?0:parseFloat(value);
        openingBalance = nvalue; 
    };
    this.setAccountTx = function(value){ accountTxs[accountTxs.length] = value; };
    this.setAcctPeriodEndDate = function(value) { acctPeriodEndDate = value.replace(/-/g,'/'); };

    this.addAccountTxs = function(values)
    {
        var valuesLength = values.length;
        for (var i=0; i < valuesLength; i++){ accountTxs[accountTxs.length] = values[i]; }
    };
    
    
    var accountTvaTxs = [];
    this.getAccountTvaTxs = function (){ return accountTvaTxs; };
    this.setAccountTvaTx = function(value){ accountTvaTxs[accountTvaTxs.length] = value; };
    this.addAccountTvaTxs = function(values)
    {
        var valuesLength = values.length;
        for (var i=0; i < valuesLength; i++){ accountTvaTxs[accountTvaTxs.length] = values[i]; }
    };
    
    var yearOpeningBalance = 0;
    this.setYearOpeningBalance = function(value)
    { 
        var nvalue = isNaN(parseFloat(value))?0:parseFloat(value);
        yearOpeningBalance = nvalue; 
    };
    this.getYearOpeningBalance = function (){ return yearOpeningBalance; };
    // added 08.26.2010 - end
};
            
br5032ns.Class.AccountTransaction = function()
{

    var acctngPeriod;  // accounting period End Date
    var acctngPeriodMonth;
    var acctngPeriodDay;
    var acctngPeriodYear;
    
    var tranDate;
    var tranMonth;
    var tranDay;
    var tranYear;
    
    var voucherNbr;
    var memo;
    var debit = 0;
    var credit = 0;
    var type;  // this is the Type column... Fulfillment, Invoice, Journal, etc...
    var glTranNbr;

    var parentAcct;
    var memoJE;
    var memoMain;
    var docRawFName; // this the Name column..which is also the 'Store' name eg. "BJ042 惠新东街 (Huixindongjie)", etc...

    // getters...
    this.getVoucherNbr = function(){ return voucherNbr; }; 
    this.getMemo = function(){ return memo; };
    this.getDebit = function(){ return debit; }; 
    this.getCredit = function(){ return credit; }; 
    this.getType = function(){ return type; }; 
    this.getGLTranNbr = function(){ return glTranNbr; }; 

    this.getParentAcct = function(){ return parentAcct; };
    this.getMemoJE = function(){ return memoJE; };
    this.getMemoMain = function(){ return memoMain; };
    this.getDocRawFName = function (){ return docRawFName; };
 
    this.getTranDate = function(){ return tranDate; }; 
    this.getTranMonth = function(){ return tranMonth; };
    this.getTranDay = function(){ return tranDay; };
    this.getTranYear = function(){ return tranYear; };

    this.getAcctngPeriod = function (){ return acctngPeriod; };
    this.getAcctngPeriodMonth = function(){ return acctngPeriodMonth; };
    this.getAcctngPeriodDay = function(){ return acctngPeriodDay; };
    this.getAcctngPeriodYear = function(){ return acctngPeriodYear; };


    // setters...
    this.setTranDate = function(value, fromTranLine)
    { 
        tranDate = value.replace(/-/g,'/');
        var txDate; // retrieve the Month! this is needed for reordering for printing parent account... 
        if (fromTranLine) { txDate = new Date( tranDate ); } // yyyy/mm/dd 
        else{ txDate = nlapiStringToDate( tranDate ); }  // dd/mm/yyyy
        tranDate = txDate;
        
        tranMonth = padleft(txDate.getMonth() + 1, '0', 2);
        tranDay = padleft(txDate.getDate(), '0', 2);
        tranYear = txDate.getFullYear();
    };
    
    this.setAcctngPeriod = function(value, fromTranLine)
    { 
        acctngPeriod = value.replace(/-/g,'/');
        var acctPDate; // retrieve the Month! this is needed for reordering for printing parent account...
        if (fromTranLine) { acctPDate = new Date( acctngPeriod ); } // yyyy/mm/dd 
        else{ acctPDate = nlapiStringToDate( acctngPeriod ); }  // dd/mm/yyyy

        acctngPeriod = acctPDate;
        acctngPeriodMonth = padleft(acctPDate.getMonth() + 1, '0', 2);
        acctngPeriodDay = padleft(acctPDate.getDate(), '0', 2);
        acctngPeriodYear = acctPDate.getFullYear();
    }; 
    
    this.setVoucherNbr = function(value){ voucherNbr  = value; }; 
    this.setMemo = function(value)
    {
        // var myNewString = myOldString.replace(/username/g, visitorName);
        var rawmemo = value;
        rawmemo = rawmemo.replace(/&gt;/g, ">"); 
        rawmemo = rawmemo.replace(/&lt;/g, "<"); 
        memo = rawmemo; 
    }; 
    this.setDebit = function(value)
    {
        var nvalue = isNaN(parseFloat(value))?0:parseFloat(value);
        debit = nvalue; 
    }; 
    this.setCredit = function(value)
    {
        var nvalue = isNaN(parseFloat(value))?0:parseFloat(value);
        credit = nvalue; 
    }; 
    this.setType = function(value)
    { 
        type = trim( value );
        
        // added 08.18.2010 - start
        if (type == 'Inventory Transfer'){ invTransferTxFlag = true; }
        if (type == 'Deposit'){ makeDepTxFlag = true; }
        // added 08.18.2010 - end
         
    }; 
    this.setGLTranNbr = function(value){ glTranNbr = value; };
    
    this.setParentAcct = function( value ){ parentAcct = value; };
    this.setMemoJE = function( value )
    { 
        var rawmemoje = value;
        rawmemoje = rawmemoje.replace(/&gt;/g, ">"); 
        rawmemoje = rawmemoje.replace(/&lt;/g, "<"); 
        memoJE = rawmemoje;  
    };
    this.setMemoMain = function( value )
    { 
        var rawmemom = value;
        rawmemom = rawmemom.replace(/&gt;/g, ">"); 
        rawmemom = rawmemom.replace(/&lt;/g, "<"); 
        memoMain = rawmemom; 
    };
    this.setDocRawFName= function ( value )
    { 
        docRawFName = value;

        // added 08.05.2010 - fill the prefix member field...
        if (docRawFName != null && docRawFName != "")
        {
            var prefixarray = docRawFName.split(" ");
            docRawFNamePrefix = prefixarray[0]; 
        }

    };
    
    function padleft (stringToTrim, delimiter, maxlen) 
    { 
        var paddedstr = trim( stringToTrim );
        for (;paddedstr.length < maxlen; ) { paddedstr = delimiter + paddedstr.replace(/^\s+/,""); }
        return paddedstr;
    }

    // 08.03.2010 - start
    function trim(stringToTrim) { return (''+stringToTrim).replace(/^\s+|\s+$/g,""); } 

    var docRawFNamePrefix = ""; // this the Name column..which is also the 'Store' name - only the store prefix... 'BJ004', etc. this is unique... 
    this.getDocRawFNamePrefix = function (){ return docRawFNamePrefix; };

    var tvaTxFlag = false;
    this.isTvaTx = function(){ return tvaTxFlag; };

    // this will hold the value for the custom field...
    var customTranType; // this is where the 'transfer voucher (a) can be identified'
    this.getCustomTranType = function() { return customTranType; };
    this.setCustomTranType = function(value, tva_en, tva_cn)
    { 
        customTranType = trim( value );

        // check whether the line is a Transfer Voucher (A)<chinese>...
        // if yes, set the tvaTxFlag to true
        if ( customTranType == tva_en || customTranType == tva_cn ){  tvaTxFlag = true; }

    };
    // 08.03.2010 - end
    
    // 08.18.2010 - start
    var locationName;
    this.setLocationName = function(value){ locationName = value; };
    this.getLocationName = function(){ return locationName; };
     
    var invTransferTxFlag = false;
    this.isInvTransferTx = function(){ return invTransferTxFlag; };

    var makeDepTxFlag = false;
    this.isMakeDepositTx = function(){ return makeDepTxFlag; };
    // 08.18.2010 - end
 
};

//-----------------------------------------------------------------------------
function TraceUsage(api, functionName)
{
    var governance = {
        "nlapiDeleteFile": 20,
        "nlapiInitiateWorkflow": 20,
        "nlapiTriggerWorkflow": 20,
        "nlapiScheduleScript": 20,
        "nlapiSubmitConfiguration": 20,
        "nlapiSubmitFile": 20,
        "nlapiDeleteRecord": 20,
        "nlapiSubmitRecord": 20,
        "nlapiExchangeRate": 10,
        "nlapiLoadConfiguration": 10,
        "nlapiLoadFile": 10,
        "nlapiMergeRecord": 10,
        "nlapiRequestURL": 10,
        "nlapiSearchRecord": 10,
        "nlapiSendEmail": 10,
        "nlapiCreateRecord": 10,
        "nlapiCopyRecord": 10,
        "nlapiLookupField": 10,
        "nlapiLoadRecord": 10,
        "nlapiSubmitField": 10,
        "nlapiTransformRecord": 10,
        "nlapiRunReport": 20
    };

    var apiUsage = governance[api] == null ? 0 : governance[api];
    var currentUsage = nlapiGetContext().getRemainingUsage();

    nlapiLogExecution("DEBUG", "TRACE USAGE", api + "-" + functionName + " +" + apiUsage + " / " + currentUsage);
}




