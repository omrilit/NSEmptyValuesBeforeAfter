/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Oct 2014     fteves
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
{
    //Sales Order
    REC_SO = 'salesorder';
    FLD_SO_PROJ = 'job';
    FLD_SO_CUSTOMER = 'entity';
    
    //Customer
    REC_CUSTOMER = 'customer';
    
    //Project
    REC_PROJECT = 'job';
    FLD_PROJ_ID = 'internalid';
        FLD_PROJ_NAME = 'companyname';
    FLD_PROJ_PROJ_MNGR = 'custentity_projectmanager';
    FLD_PROJ_AMNT_BUILD = 'chargeamountbilled';
    FLD_PROJ_CALC_END_DATE = 'calculatedenddate';
    FLD_PROJ_PROJ_STATUS = 'entitystatus';
    FLD_PROJ_HRS_WORK = 'actualtime';
    FLD_PROJ_PRCNT_COMPLETE = 'percenttimecomplete';
    
    //Project Task
    REC_PROJECT_TASK = 'projecttask';
    FLD_PROJECT_TASK_ID = 'internalid';
    FLD_PROJECT_TASK_NAME = 'title';
    FLD_PROJECT_TASK_STATUS = 'status';
    FLD_PROJECT_TASK_END_DATE = 'enddate';
    FLD_PROJECT_TASK_PERCENT_COMPLETE = 'percentworkcomplete';
    FLD_PROJECT_TASK_ISMILESTONE = 'ismilestone';
    SEARCH_PROJECT_TASK = 'customsearch_fmt_project_task';
}

function projectReportReturn_suitelet(request, response){
    
    nlapiLogExecution('DEBUG', 'projectId', 'projectId1: ' + projectId);

    var salesOrderId = request.getParameter('salesorderid');
    var objSalesOrder = nlapiLoadRecord(REC_SO, salesOrderId);
    
    var customerId = objSalesOrder.getFieldValue(FLD_SO_CUSTOMER);
    var objCustomer = nlapiLoadRecord(REC_CUSTOMER, customerId); 

    var projectId = objSalesOrder.getFieldValue(FLD_SO_PROJ);
    nlapiLogExecution('DEBUG', 'projectId', 'projectId: ' + projectId);
        
    var resObj = {};
    //Sales Order
    resObj.salesOrderData = getSOInfo(salesOrderId);
    //Company Logo
    resObj.logoData = getCompanyLogo();

  //Customer and Bill To
    resObj.customerData = getCustomerInfo(objCustomer);
    resObj.billtoData = getBillingAddress(objCustomer);

    if(projectId){
        //Project
        resObj.projectData = getProject(projectId);
        //Project Task
        resObj.ProjectTaskData = getProjectTask(projectId);
    }

    response.write(JSON.stringify(resObj));
    
    
    
}

function formatFieldValue(val) {
    if (val==null) {
        return '';
    }
    else {
        return nlapiEscapeXML(val);
    }
}

function getSOInfo(trans_id) {
    var res=nlapiSearchRecord('transaction', null, [
                                                    ['mainline', 'is', 'T'], 'AND',
                                                    ['internalid', 'anyof', trans_id], 'OR',
                                                    ['type', 'is', 'invoice']],
                                                    [new nlobjSearchColumn('recordtype'),
                                                    new nlobjSearchColumn('trandate'),
                                                    new nlobjSearchColumn('duedate'),
                                                    new nlobjSearchColumn('tranid'),
                                                    new nlobjSearchColumn('totalamount'),
                                                    new nlobjSearchColumn('status'),
                                                    new nlobjSearchColumn('companyname', 'jobmain'),
                                                    new nlobjSearchColumn('entityid', 'jobmain'),
                                                    new nlobjSearchColumn('type')]);
    var so_info=null;
    if (res!=null) {
        for (var i=0;i<res.length;i++) {
            if (res[i].getValue('recordtype')=='salesorder') {
                return so_info={
                    id: formatFieldValue(res[i].getId()),
                    trans_id: formatFieldValue(res[i].getValue('tranid')),
                    //date: convertDate(formatFieldValue(res[i].getValue('trandate'))),
                    //due_date: convertDate(formatFieldValue(res[i].getValue('duedate'))),
                    //date: getFormattedDate(formatFieldValue(res[i].getValue('trandate'))),
                    //due_date: getFormattedDate(formatFieldValue(res[i].getValue('duedate'))),
                    date: formatFieldValue(res[i].getValue('trandate')),
                    due_date: formatFieldValue(res[i].getValue('duedate')),
                    record_type: formatFieldValue(res[i].getValue('recordtype')),
                    project: formatProjectName(res[i].getValue('companyname', 'jobmain'), res[i].getValue('entityid', 'jobmain')),
                    total: formatCurrencyValue(res[i].getValue('totalamount'))
                };
            }
        }
    }
    return so_info;
}


function getCompanyLogo() {
    var subsidiary_info=nlapiLoadRecord('subsidiary', nlapiGetSubsidiary());
    var img_id=subsidiary_info.getFieldValue('pagelogo');
    if (!img_id) {
        return null;
    }
    var so_logo=nlapiLoadFile(img_id);
    if (so_logo) {
        return so_logo.getURL();
    }
    return null;
}


function getCustomerInfo(objCustomer) {
    var fname=formatFieldValue(objCustomer.getFieldValue('firstname'));
    var lname=formatFieldValue(objCustomer.getFieldValue('lastname'));
    var company_name=formatFieldValue(objCustomer.getFieldValue('companyname'));
    var email=formatFieldValue(objCustomer.getFieldValue('email'));
    var customer_info={
        first_name: fname,
        last_name: lname,
        company_name: company_name,
        email_address: email
    };
    return customer_info;
}

function getBillingAddress(objCustomer) {
    var addressee = formatFieldValue(objCustomer.getFieldValue('billaddressee'));
    var addr1 = formatFieldValue(objCustomer.getFieldValue('billaddr1'));
    var addr2 = formatFieldValue(objCustomer.getFieldValue('billaddr2'));
    var city = formatFieldValue(objCustomer.getFieldValue('billcity'));
    var state = formatFieldValue(objCustomer.getFieldValue('billstate'));
    var zip = formatFieldValue(objCustomer.getFieldValue('billzip'));
    var country = formatFieldValue(objCustomer.getFieldValue('billcountry'));
    var billto_info={
        addressee: addressee,
        addr1: addr1,
        addr2: addr2,
        city: city,
        state: ((state!='')&&(zip!=''))?(state+', '+zip):(state),
        country: country
    };
    return billto_info;
}


function getProject(projectId) {
    if(projectId){
        var objProject = nlapiLoadRecord(REC_PROJECT, projectId);
            var sProjectName = objProject.getFieldValue(FLD_PROJ_NAME);
        var sProjectManager = objProject.getFieldText(FLD_PROJ_PROJ_MNGR);
        var sAmountBilled = objProject.getFieldValue(FLD_PROJ_AMNT_BUILD);
        var sCalcEndDate = objProject.getFieldValue(FLD_PROJ_CALC_END_DATE);
        var sProjStatus = objProject.getFieldText(FLD_PROJ_PROJ_STATUS);
        var sProjHrsWork = objProject.getFieldValue(FLD_PROJ_HRS_WORK);
        var sPcntComplete = objProject.getFieldValue(FLD_PROJ_PRCNT_COMPLETE);
        
        var project_info={
                            sProjectName: sProjectName,
                sProjectManager: sProjectManager,
                sAmountBilled: sAmountBilled,
                //sCalcEndDate: getFormattedDate(sCalcEndDate),
                sCalcEndDate: sCalcEndDate,
                sProjStatus: sProjStatus,
                sProjHrsWork: sProjHrsWork,
                sPcntComplete: getPercent(sPcntComplete)
            };
            return project_info;    
    }
}

//Poject Task
function getProjectTask(projectId) {
    nlapiLogExecution('DEBUG', 'getProjectTask', 'projectId: ' + projectId);
    var arrProjectTask = searchProjectTask(projectId);
    var idProjTask, nameProjTask, statusProjTask, finishdateProjTask, percentcompleteProjTask, ismilestoneProjTask, projectTaskResult;
    var arrProjectTaskResult = new Array();
    for (var i = 0; i < arrProjectTask.length; i++) {
        projectTaskResult = {
            idProjTask: arrProjectTask[i].getValue(FLD_PROJECT_TASK_ID, REC_PROJECT_TASK),
            nameProjTask: arrProjectTask[i].getValue(FLD_PROJECT_TASK_NAME, REC_PROJECT_TASK),
            statusProjTask: arrProjectTask[i].getText(FLD_PROJECT_TASK_STATUS, REC_PROJECT_TASK),
            //finishdateProjTask: getFormattedDate(arrProjectTask[i].getValue(FLD_PROJECT_TASK_END_DATE, REC_PROJECT_TASK)),
            finishdateProjTask: arrProjectTask[i].getValue(FLD_PROJECT_TASK_END_DATE, REC_PROJECT_TASK),
            percentcompleteProjTask: getPercent(arrProjectTask[i].getValue(FLD_PROJECT_TASK_PERCENT_COMPLETE, REC_PROJECT_TASK)),
            ismilestoneProjTask: arrProjectTask[i].getValue(FLD_PROJECT_TASK_ISMILESTONE, REC_PROJECT_TASK)
        };
        arrProjectTaskResult.push(projectTaskResult);
    }
    return arrProjectTaskResult;
}


function searchProjectTask(idProj) {
    var arrFilters = new Array();
    arrFilters.push(new nlobjSearchFilter(FLD_PROJ_ID, null, 'is', idProj));
            
    return nlapiSearchRecord(REC_PROJECT, SEARCH_PROJECT_TASK, arrFilters, null);
}

function numberWithCommas(x) {
    var y=x;
    if (y.toString().indexOf('.')==-1) {
        y=x.toFixed(2);
    }
    var parts=y.toString().split('.');
    parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts[1]!=null && parts[1].length==1) {
        parts[1]+='0';
    }
    else if (parts[1]!=null && parts[1].length>2) {
        parts[1]=parts[1].substring(0,2);
    }
    return parts.join(".");
}

function convertDate(date_raw) {
    var result_date=date_raw.split('/');
    var month=['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
    if (result_date.length>=3) {
        return appendZeroOnDate(parseInt(result_date[1]))+' '+month[parseInt(result_date[0])-1]+' '+appendZeroOnDate(parseInt(result_date[2]));
    }
    else {
        return '';
    }
}

function appendZeroOnDate(date_field) {
    if (date_field<10) {
        return '0'+date_field;
    }
    else {
        return date_field;
    }
}

function formatProjectName(name, num) {
    if (name==null || num==null) {
        return '';
    }
    else {
        // companyname returns "customer : subproject (optional) : project"
        // this regex is greedy and will always return the string after the last colon (:)
        var re = /(?:.*):(.*)/;
        var m = re.exec(name);
        var n = (m && m[1]) ? num + m[1] : num + name;
        return nlapiEscapeXML(n);
    }
}

function formatCurrencyValue(val) {
    if (val==null||val=='') {
        return '0.00';
    }
    else {
        return nlapiEscapeXML(val);
    }
}

function getPercent(sPercent) {
    var fPct = 1;

    if (sPercent) {
        var signIndex = sPercent.indexOf('%');
        fPct = sPercent.slice(0, signIndex);
        nlapiLogExecution('DEBUG', 'getPercent', 'fPct: ' + fPct);
    }
    return fPct;
}

function getFormattedDate(date) {
      nlapiLogExecution('DEBUG', 'getFormattedDate', 'date: ' + date);
      if(date){
          var newDate = new Date(date);
          var year = newDate.getFullYear();
          var month = (1 + newDate.getMonth()).toString();
          month = month.length > 1 ? month : '0' + month;
          var day = newDate.getDate().toString();
          day = day.length > 1 ? day : '0' + day;
          return day + '/' + month + '/' + year;
      }else{
          return '';
      }
}