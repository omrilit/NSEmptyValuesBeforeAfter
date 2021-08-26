/* Object used to encapsulate logic on Resource Finder Page. */
function ResourceFinderPage()
{
    this.caseId = null;

    this.employeesArray = new Array();
    this.EMPLOYEE_ID = 0;
    this.EMPLOYEE_NAME = 1;
    this.EMPLOYEE_IMAGE = 2;
    this.EMPLOYEE_SKILLS = 3;
    this.EMPLOYEE_SELECTED = 4;
    this.EMPLOYEE_LOCATION = 5;
    this.EMPLOYEE_LOCATION_NAME = 6;
    this.EMPLOYEE_AVAILABILITY = 7;

    this.jobassignments = new Array();
    this.JOB_STARTDATE = 1;
    this.JOB_ENDDATE = 2;
    this.JOB_ID = 3;

    /* store all skill names indexed by id. */
    this.skillsArray = new Array();

    /* locations */
    this.locArray = new Array();

    this.availability_startdate = null;
    this.availability_enddate = null;

    this.WEEKS_IN_CALENDAR = 1;
    this.SHOW_WEEK_DAYS_ONLY = true;
    this.START_ONE_WEEK_AGO = true;

    this.days_of_the_week = new Array();
    this.days_of_the_week[0] = "Sunday";
    this.days_of_the_week[1] = "Monday";
    this.days_of_the_week[2] = "Tuesday";
    this.days_of_the_week[3] = "Wednesday";
    this.days_of_the_week[4] = "Thursday";
    this.days_of_the_week[5] = "Friday";
    this.days_of_the_week[6] = "Saturday";

    this.MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];


    /* Helper function: return val2 if val1 is null or empty */
    this.ifEmptyThen = function(val1, val2)
    {
        return val1 != null && val1 != '' ? val1 : val2;
    }

    /* Helper function: returns the first index position of a value in an Array. Otherwise it returns -1. */
    this.indexOfArray = function(array, val)
    {
        for ( var i = 0; array != null && i < array.length; i++ )
            if ( val == array[i] )
                return i;
        return -1;
    }

    /* Initialize the skills dropdown using searchresult data, initialize the employee and availability sections from the job resources sublist. */
    this.initPage = function(caseId)
    {
        this.caseId = caseId;
        var sel = ResourceFinderWindow.document.forms['main_form'].elements['skills'];
        for ( var i in this.skillsArray )
        {
            var opt = ResourceFinderWindow.document.createElement('OPTION');
            opt.text = this.skillsArray[ i ];
            opt.value = i;
            sel.add(opt, document.all ? sel.length : null);
        }

        var loc = ResourceFinderWindow.document.forms['main_form'].elements['location'];
        for ( var i in this.locArray )
        {
            var opt = ResourceFinderWindow.document.createElement('OPTION');
            opt.text = this.locArray[ i ];
            opt.value = i;
            //opt.selected = true;
            loc.add(opt, document.all ? loc.length : null);
        }

        var selectedEmployees = new Array();
        var selectedResources = new Array();
        /*
        for ( var i = 1; i <= nlapiGetLineItemCount('jobresources'); i++ )
            selectedResources[selectedResources.length] = nlapiGetLineItemValue('jobresources', 'jobresource', i);
        */
        for ( var i = 0; i < this.employeesArray.length; i++ )
        {
            var employee = this.employeesArray[i];
            //if ( this.indexOfArray( selectedResources, employee[this.EMPLOYEE_ID] ) != -1 )
            //{
                employee[this.EMPLOYEE_SELECTED] = true;
                selectedEmployees[selectedEmployees.length] = employee;
                this.setAvailability( employee[this.EMPLOYEE_ID], employee[this.EMPLOYEE_SELECTED] );
            //}
        }

        this.setEmployees( selectedEmployees )

        if ( selectedEmployees.length == 0 )
            this.setAvailability(  );
    }

    /* Search for all employees whose skillset matches the current skills selections. */
    this.searchEmployees = function()
    {
        var selections = new Array();
        if (ResourceFinderWindow.document.forms['main_form'].elements['showall'].checked == false) {
            var sel = ResourceFinderWindow.document.forms['main_form'].elements['skills'];
            for (var i = 0; i < sel.length; i++)
                if (sel.options[i].selected)
                    selections[selections.length] = sel.options[i].value;
        }

        var locs = new Array();
        if (ResourceFinderWindow.document.forms['main_form'].elements['showalllocations'].checked == false) {
            var loc = ResourceFinderWindow.document.forms['main_form'].elements['location'];
            for (var i = 0; i < loc.length; i++)
                if (loc.options[i].selected)
                    locs[locs.length] = loc.options[i].value;
        }

        var employeeList = new Array();
        for ( var i = 0; i < this.employeesArray.length; i++ )
        {
            var employee = this.employeesArray[i];
            employee[this.EMPLOYEE_SELECTED] = false;
            if ( employee[this.EMPLOYEE_SKILLS] == null )
                continue;

            if (selections.length > 0) {
                var hasSkills = false;
                for (var k = 0; k < selections.length; k++)
                    if (this.indexOfArray(employee[this.EMPLOYEE_SKILLS], selections[k]) != -1)
                        hasSkills = true;
                if (!hasSkills)
                    continue;
            }

            if (locs.length==0 || this.indexOfArray(locs,employee[this.EMPLOYEE_LOCATION])!=-1) {
                employee[this.EMPLOYEE_SELECTED] = true;
                employeeList[employeeList.length] = employee;
            }
        }
        this.setEmployees( employeeList, selections );
        this.setAvailability(  );
    }

    /* Show all employees and disable the skills filter */
    this.showAll = function()
    {   /*
        var sel = ResourceFinderWindow.document.forms['main_form'].elements['skills'];
        var employeeList = new Array();
        var selections = new Array();
        if ( showall )
        {
            for (var i=0; i < sel.length; i++)
                sel.options[i].selected = false;
            for ( var i = 0; i < this.employeesArray.length; i++ )
            {
                var employee = this.employeesArray[i];
                employee[this.EMPLOYEE_SELECTED] = false;
                employeeList[employeeList.length] = employee;
            }
        }
        sel.disabled = showall;
        this.setEmployees( employeeList, selections );
        this.setAvailability(  );
        */
        var sel = ResourceFinderWindow.document.forms['main_form'].elements['skills'];
        sel.disabled = ResourceFinderWindow.document.forms['main_form'].elements['showall'].checked;
        if ( sel.disabled ) {
            for (var i = 0; i < sel.length; i++) {
                sel.options[i].selected = false;
            }
        }
        var loc = ResourceFinderWindow.document.forms['main_form'].elements['location'];
        loc.disabled = ResourceFinderWindow.document.forms['main_form'].elements['showalllocations'].checked;
        if ( loc.disabled ) {
            for (var i = 0; i < loc.length; i++) {
                loc.options[i].selected = false;
            }
        }
        this.searchEmployees();
    }

    /* Display a list of employees and highlight their skillset if its among the selections. */
    this.setEmployees = function( employeeList, selections )
    {
        var html = '';
        for ( var i = 0; i < employeeList.length; i++ )
        {
            var skillsDisplay = '';
            var employee = employeeList[i];
            var selected = employee[this.EMPLOYEE_SELECTED];
            var image = this.ifEmptyThen( employee[this.EMPLOYEE_IMAGE], 'https://system.netsuite.com/core/media/media.nl?id=698213&c=NLCORP&h=3afeacb7c23ca230d0d0');

            var skills = employee[this.EMPLOYEE_SKILLS];
            if ( skills != null )
            {
                for ( var j = 0; j < skills.length; j++ )
                {
                    var skillDisplay = this.skillsArray[skills[j]];
                    if ( this.indexOfArray( selections, skills[j] ) != -1 )
                        skillsDisplay += ('&nbsp;&#149;<b>'+skillDisplay+'</b><br>');
                    else
                        skillsDisplay += ('&nbsp;&#149;'+skillDisplay+'<br>');
                }
            }
            else
                skillsDisplay += '&nbsp;';
            html +=     '<table cellpadding=5 cellspacing=0 border=0 width=778>'+
                            '<tr bgcolor="#F1F3F9">'+
                                //'<td width=40 valign=top>&nbsp; &nbsp;<input type="checkbox" onClick="window.opener.ResourceFinder.setAvailability('+employee[this.EMPLOYEE_ID]+', this.checked);" '+(selected ? "CHECKED" : "")+'></td>'+
                                '<td width=110 valign=top><IMG SRC="'+image+'" ALT="" WIDTH=60 HEIGHT=75 BORDER=0></td>'+
                                '<td width=175 valign=top>'+employee[this.EMPLOYEE_NAME]+'</td>'+
                                '<td width=175 valign=top>'+employee[this.EMPLOYEE_LOCATION_NAME]+'</td>'+
                                '<td width=318 valign=top>'+skillsDisplay+'</td>'+
                            '</tr>'+
                        '</table>'+
                        '<table cellpadding=0 cellspacing=0 border=0 width=778><tr><td bgcolor="#F1F3F9" align=center><IMG SRC="https://system.netsuite.com/core/media/media.nl?id=698214&c=NLCORP&h=ab4ac8f6b81a4944b1a1" ALT="" WIDTH=778 HEIGHT=1 BORDER=0></td></tr></table>';
        }
        ResourceFinderWindow.document.getElementById('employees_display').innerHTML = html;
    }

    /* Calculate and display job resource availability. */
    this.setAvailability = function(id, show)
    {
        var border = ' style="empty-cells:show; border-collapse:collapse; border-bottom: 0.25pt solid gray; border-right: 0.25pt solid gray;" ';
        var border2 = ' style="empty-cells:show; border-collapse:collapse; border-bottom: 0.25pt solid gray; border-right: 0.25pt solid gray; border-left: 0.25pt solid gray;" ';
        var html = '<table border=0 cellspacing=0 cellpadding=0 width="1096px">';

        // build availability header
        html += '<tr bgcolor="#DBE1EB">';
        html += '<td width=200></td>';
        var date = new Date();
        /*
        date.setTime( this.getStartDate().getTime() )
        for ( var i = 0; i < this.WEEKS_IN_CALENDAR; i++ )
        {
            html += this.getLiner("#CCCCCC", 2);
            var colspan = this.SHOW_WEEK_DAYS_ONLY ? 9 : 13;
            html += '<td colspan='+colspan+' width=80 align=center nowrap><font face="Arial">&nbsp;';
            html += (date.getMonth()+1) + '/' + date.getDate();
            html += ' - ';
            date = nlapiAddDays( date, this.SHOW_WEEK_DAYS_ONLY ? 4 : 6 );
            html += (date.getMonth()+1) + '/' + date.getDate();
            html += '</font></td>';

            date = nlapiAddDays( date, this.SHOW_WEEK_DAYS_ONLY ? 3 : 1 );
        }
        html += '</tr>';

        html += '<tr bgcolor="#DBE1EB">';
        date = new Date();
        */
        date.setTime( this.getStartDate().getTime() )
        while ( date.getTime() <= this.getEndDate().getTime() )
        {
            if ( !this.SHOW_WEEK_DAYS_ONLY || (date.getDay() != 0 && date.getDay() != 6) ) /* ignore Sundays and Saturdays (for now) */
            {
                //if ( date.getDay() != 1 )
                //    html += this.getLiner("#DBE1EB");
                html += '<td width=128 align=center colspan="8" '+((date.getDay()==1) ? border2 : border)+'><font color="#666666">';
                //html += this.days_of_the_week[date.getDay()].charAt(0);
                html += this.days_of_the_week[date.getDay()].substring(0,3) + ' ' + date.getDate() + ' ' + this.MONTHS[ date.getMonth() ];
                html += '</font></td>';
            }
            date = nlapiAddDays( date, 1 );
        }
        html += '</tr>';

        /*
        html += '<tr>';
        for ( var i = 0; i < (8*this.WEEKS_IN_CALENDAR*(this.SHOW_WEEK_DAYS_ONLY ? 5 : 7)*2)+1; i++ )
            html += this.getLiner("#CCCCCC");
        html += '</tr>'
        */

        // now add selected attendees
        var hours = [ 8, 9, 10, 11, 13, 14, 15, 16 ];
        for ( var i = 0; i < this.employeesArray.length; i++ )
        {
            var employee = this.employeesArray[i];
            /*if ( id == null )
                employee[this.EMPLOYEE_SELECTED] = false;
            else if ( employee[this.EMPLOYEE_ID] == id )
                employee[this.EMPLOYEE_SELECTED] = show;*/
            if ( employee[this.EMPLOYEE_SELECTED] )
            {
                if ( employee[this.EMPLOYEE_AVAILABILITY] == null )
                {
                    var resourcehtml = '<tr bgcolor="#FFFFFF">';
                    resourcehtml += '<td width=200 '+border+'><div style="padding-top:2px; padding-bottom:2px;">&nbsp;'+employee[this.EMPLOYEE_NAME]+'</div></td>';
                    date = new Date();
                    date.setTime( this.getStartDate().getTime() )
                    while ( date.getTime() <= this.getEndDate().getTime() )
                    {
                        if (!this.SHOW_WEEK_DAYS_ONLY || (date.getDay() != 0 && date.getDay() != 6)) {
                            var datetime = new Date(date);
                            for (var hr = 0; hr < 8; hr++) {
                                datetime.setHours(hours[hr],0,0,0);
                                var eventId = this.isBusy(employee[this.EMPLOYEE_ID], datetime);
                                var url = (eventId==null) ? 'https://system.netsuite.com/app/crm/calendar/event.nl?ccal=7&date='+(date.getMonth()+1)+'%2F'+date.getDate()+'%2F'+date.getFullYear()+'&time='+hours[hr]+'00&supportcase='+this.caseId+'&whence=/app/site/hosting/scriptlet.nl?script=customscript_resourcefinder%26deploy=customdeploy_resourcefinder&custpage_employee='+employee[this.EMPLOYEE_ID]
                                : 'https://system.netsuite.com/app/crm/calendar/event.nl?id='+eventId+'&whence=/app/site/hosting/scriptlet.nl?script=customscript_resourcefinder%26deploy=customdeploy_resourcefinder';
                                var bgcolor = (eventId!=null) ? '#DDDDDD' : '#FFFFFF';
                                //resourcehtml += this.getLiner("#CCCCCC");
                                resourcehtml += '<td width=16 bgcolor="' + bgcolor + '" '+border+' onclick="document.location=\''+url+'\'">&nbsp;</td>';
                            }
                        }
                        date = nlapiAddDays( date, 1 );
                    }
                    resourcehtml += '</tr>';
                    employee[this.EMPLOYEE_AVAILABILITY] = resourcehtml;
                }
                html += employee[this.EMPLOYEE_AVAILABILITY];

                /*
                html += '<tr>';
                //for ( var x = 0; x < (this.WEEKS_IN_CALENDAR*(this.SHOW_WEEK_DAYS_ONLY ? 5 : 7)*2)+1; x++ )
                for ( var x = 0; x < (8*this.WEEKS_IN_CALENDAR*(this.SHOW_WEEK_DAYS_ONLY ? 5 : 7)*2)+1; x++ )
                    html += this.getLiner("#CCCCCC");
                html += '</tr>'
                */
            }
        }
        html += '</table>';
        ResourceFinderWindow.document.getElementById('availability_display').innerHTML = html;
    }

    /* Helper function: returns a line used for rendering availability UI. */
    this.getLiner = function(color, rowspan)
    {
        if ( rowspan == null )
            rowspan = 1;
        // -- insert spacer image
        return '<td width=1 rowspan='+rowspan+' bgcolor="'+color+'"><img width=1 height=1 src="https://system.netsuite.com/core/media/media.nl?id=698209&c=NLCORP&h=fd3682a87547dbb88d6a"></td>';
    }

    /* Helper function: returns the start date used to generate the availability window. */
    this.getStartDate = function()
    {
        if ( this.availability_startdate == null )
        {
            var date = nlapiStringToDate(nlapiDateToString(new Date()));
            this.availability_startdate = nlapiAddDays( date, 1 - date.getDay() );
            if ( this.START_ONE_WEEK_AGO )
                this.availability_startdate = nlapiAddDays( this.availability_startdate, -7 );
        }
        return this.availability_startdate;
    }

    /* Helper function: returns the end date used to generate the availability window (this.WEEKS_IN_CALENDAR after start date). */
    this.getEndDate = function()
    {
        if ( this.availability_enddate == null )
        {
            var date = nlapiStringToDate(nlapiDateToString(this.getStartDate()));
            this.availability_enddate = nlapiAddDays( date, (this.WEEKS_IN_CALENDAR * 7)-( this.SHOW_WEEK_DAYS_ONLY ? 3 : 1) );
        }
        return this.availability_enddate;
    }

    /* Helper function: returns TRUE if a resource is busy on a given date. */
    this.isBusy = function(resource, date)
    {
        var dateend = new Date(date);
        dateend.setHours(dateend.getHours()+1,0,0,0);
        for ( var i = 0; i < this.jobassignments.length; i++ )
        {
            var assignment = this.jobassignments[i];
            if ( assignment[this.EMPLOYEE_ID] != resource )
                continue;

            if ( assignment[this.JOB_STARTDATE] == null )
                continue;
            if ( assignment[this.JOB_STARTDATE].getTime() > date.getTime()
                || (assignment[this.JOB_ENDDATE] != null && assignment[this.JOB_ENDDATE].getTime() < dateend.getTime()) )
                continue;
            return assignment[this.JOB_ID];
        }

        return null;
    }

    /* Commit all the selected resources to the job resources sublist. */
    /*
    this.setAndCommitResources = function()
    {
        var count = nlapiGetLineItemCount('jobresources');
        while ( count-- > 0 )
        {
            nlapiSelectLineItem('jobresources',1);
            nlapiRemoveLineItem('jobresources');
        }

        for ( var i = 0; i < this.employeesArray.length; i++ )
        {
            var employee = this.employeesArray[i];
            if ( employee[this.EMPLOYEE_SELECTED] )
            {
                nlapiSelectNewLineItem('jobresources');
                nlapiSetCurrentLineItemValue('jobresources','jobresource',employee[this.EMPLOYEE_ID])
                nlapiCommitLineItem('jobresources');
            }
        }
    }*/
}

function ResourceFinder_openResourceFinderPopup( url )
{
    window.ResourceFinderWindow = window.open( url ,'resourcefinder','height=600,width=800,status=no,toolbar=no,menubar=no,location=no')
}
function ResourceFinder_instantiateResourceFinder( )
{
    window.ResourceFinder = new ResourceFinderPage();
}


var ResourceFinder = null;
var ResourceFinderWindow = null;
ResourceFinder_instantiateResourceFinder();