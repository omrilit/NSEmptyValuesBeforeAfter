/* Suitelet used to generate resource data, resource page, and resource scripts. */
function resourceFinder( request, response )
{
    /* download resource data. */
    if ( request.getParameter('data') == 'T' )
    {
        response.writeLine( "window.opener.ResourceFinder_instantiateResourceFinder()" );
        response.writeLine( "var ResourceFinder = window.opener.ResourceFinder" );
        /* initialize job resources (employees). */
        var filters = [ new nlobjSearchFilter('supportrep', null, 'is', 'T') ];
        var columns = [ new nlobjSearchColumn('entityid'),
                        new nlobjSearchColumn('image'),
                        new nlobjSearchColumn('custentity_skills'),
                        new nlobjSearchColumn('location')  ];
        var employees = nlapiSearchRecord('employee', null, filters, columns);
        for ( var i = 0; employees != null && i < employees.length; i++ )
        {
            var id = employees[i].getId();
            var name = employees[i].getValue('entityid');
            var image = employees[i].getText('image') != null ? "'"+employees[i].getText('image')+"'" : null;
            var skills = employees[i].getValue('custentity_skills') != null ? '['+employees[i].getValue('custentity_skills')+']' : null;
            var location = employees[i].getValue('location');
            var locationName = employees[i].getText('location');
            if (location==''||location==null) {
                location = "null";
            }
            response.writeLine( "ResourceFinder.employeesArray["+i+"] = ["+id+",'"+name+"',"+image+","+skills+",false,"+location+",'"+locationName+"']" );
        }

        /* initialize job assignment data (from saved search). */
        /*
        var projects = nlapiSearchRecord('job','customsearch_jobassignments', null, null);
        for ( var i = 0; projects != null && i < projects.length; i++ )
        {
            var id = projects[i].getValue('jobresource');
            var startdate = projects[i].getValue('startdate');
            var enddate = projects[i].getValue('projectedenddate');
            response.writeLine( "ResourceFinder.jobassignments["+i+"] = ["+id+",window.opener.nlapiStringToDate('"+startdate+"')," +(enddate != null ? "window.opener.nlapiStringToDate('"+enddate+"')" : "null")+ "]" );
        }
        */

        var projects = nlapiSearchRecord('calendarevent','customsearch_resource_cal', null, null);
        for ( var i = 0; projects != null && i < projects.length; i++ )
        {
            var eventId = projects[i].getId();
            var id = projects[i].getValue('attendee');
            var startdate = projects[i].getValue('startdate');
            var starttime = projects[i].getValue('starttime');
            var tmp = starttime.split(':');
            if (starttime.indexOf('PM') > -1) {
                var hr = parseInt(tmp[0])+12;
                if (hr==24) {
                    hr = 0;
                }
                starttime = hr+':'+tmp[1].substring(0,2);
            } else {
                starttime = tmp[0]+':'+tmp[1].substring(0,2);
            }
            var endtime = projects[i].getValue('endtime');
            var tmp = endtime.split(':');
            if (endtime.indexOf('PM') > -1) {
                var hr = parseInt(tmp[0])+12;
                if (hr==24) {
                    hr = 0;
                }
                endtime = hr+':'+tmp[1].substring(0,2);
            } else {
                endtime = tmp[0]+':'+tmp[1].substring(0,2);
            }
            response.writeLine( "ResourceFinder.jobassignments["+i+"] = ["+id+",window.opener.nlapiStringToDate('"+startdate+' '+starttime+"'),window.opener.nlapiStringToDate('"+startdate+' '+endtime+"'),"+eventId+"]" );
        }

        /* initialize list of all active skills. */
        var skills = nlapiSearchRecord('customlist_skills',null, new nlobjSearchFilter('isinactive', null, 'is', 'F'), new nlobjSearchColumn('name'));
        for ( var i = 0; skills != null && i < skills.length; i++ )
        {
            var id = skills[i].getId();
            var name = skills[i].getValue('name');
            response.writeLine( "ResourceFinder.skillsArray["+id+"] = '"+name+"'" );
        }

        /* initialize list of all locations. */
        var loc = nlapiSearchRecord('location',null, new nlobjSearchFilter('isinactive', null, 'is', 'F'), new nlobjSearchColumn('name'));
        for ( var i = 0; loc != null && i < loc.length; i++ )
        {
            var id = loc[i].getId();
            var name = loc[i].getValue('name');
            response.writeLine( "ResourceFinder.locArray["+id+"] = '"+name+"'" );
        }

        /* configure Resource Finder page from script settings. */
       /*
        var number_of_weeks = nlapiGetContext().getSetting('SCRIPT','custscript_number_of_weeks_to_show');
        if ( number_of_weeks != null )
            response.writeLine( "ResourceFinder.WEEKS_IN_CALENDAR = "+number_of_weeks );

        var week_days_only = nlapiGetContext().getSetting('SCRIPT','custscript_show_weekdays_only');
        if ( week_days_only != null )
            response.writeLine( "ResourceFinder.SHOW_WEEK_DAYS_ONLY = '"+week_days_only+"' == 'T'" );

        var show_previous_week = nlapiGetContext().getSetting('SCRIPT','custscript_show_previous_week');
        if ( show_previous_week != null )
            response.writeLine( "ResourceFinder.START_ONE_WEEK_AGO = '"+show_previous_week+"' == 'T'" );
        */
    }
    /* download resource HTML page. */
    else
    {
        //var html = nlapiGetContext().getSetting('SCRIPT', 'custscript_resourcefinder_html');
        var html =
        '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN"><HTML><TITLE>Resource Finder</TITLE>'+
        '<HEAD>'+
        '<STYLE type="text/css">'+
        '<!--'+
        'body, p, td {'+
            'font-family: Verdana, Arial, Helvetica, sans-serif;'+
            'font-size: 11px;'+
        '}'+
        '-->'+
        '</STYLE>'+
        '<!-- resource and availability data is initialized by SuiteScript servlet. -->'+
        '<SCRIPT type="text/javascript" SRC="/app/site/hosting/scriptlet.nl?script=customscript_resourcefinder&deploy=customdeploy_resourcefinder&data=T"></SCRIPT>'+
        '</HEAD>'+
        '<BODY BGCOLOR="#FFFFFF" TEXT="#000000" LINK="#000000" VLINK="#666666" ALINK="#CCCCCC" onload="ResourceFinder.initPage('+request.getParameter('custpage_id')+')">'+
        '<form name=\'main_form\' id=\'main_form\'>'+
        '<p style="font-family:Arial; font-size:15px; font-weight:bold; margin-bottom:8px;">Find Resources</p>'+
        '<table cellpadding=3 cellspacing=0 border=0>'+
            '<tr>'+
                '<td align=right valign=top nowrap><font color="#666666">Skill(s) Required</font></td>'+
                '<td valign=top>'+
                    '<!-- Skills filter -->'+
                    '<select size=4 style="font-size:12px;" MULTIPLE name="skills" disabled=true onchange="ResourceFinder.searchEmployees()">'+
                    '</select>'+
                '</td>'+
                '<td align=right valign=top nowrap>'+
                    '<!-- Show all resources checkbox -->'+
                    '<font color="#666666">Show All</font>'+
                    '<span style=\'position:relative;top:2px\'><input type="checkbox" id="showall" name="showall" checked="true" onclick="ResourceFinder.showAll()"></span>'+
                '</td>'+
                '<!--<td valign=top>-->'+
                    '<!---->'+
                '<!--</td>-->'+
                '<td>&nbsp;</td>'+
                '<td align=right valign=top nowrap><font color="#666666">Location(s) Required</font></td>'+
                '<td valign=top>'+
                    '<!-- Location filter -->'+
                    '<select size=4 style="font-size:12px;" MULTIPLE name="location" disabled=true onchange="ResourceFinder.searchEmployees()">'+
                    '</select>'+
                '</td>'+
                '<td align=right valign=top nowrap>'+
                    '<!-- Show all resources checkbox -->'+
                    '<font color="#666666">Show All</font>'+
                    '<span style=\'position:relative;top:2px\'><input type="checkbox" id="showalllocations" name="showalllocations" checked="true" onclick="ResourceFinder.showAll()"></span>'+
                '</td>'+
                '<!--<td valign=top>-->'+
                    '<!---->'+
                '<!--</td>-->'+
                '<td>&nbsp;</td>'+
            '</tr>'+
        '</table>'+
        '<br>'+
        '<table cellpadding=0 cellspacing=0 border=0 width=780>'+
            '<tr>'+
                '<!-- resources banner image -->'+
                '<td colspan=3><IMG SRC="https://system.netsuite.com/core/media/media.nl?id=698211&c=NLCORP&h=c9548ee1b6d6e52ae260" ALT="" WIDTH=778 HEIGHT=23 BORDER=0></td>'+
            '</tr>'+
            '<tr>'+
                '<!-- spacer image -->'+
                '<td bgcolor="#CCCCCC" width=1><img src="https://system.netsuite.com/core/media/media.nl?id=698209&c=NLCORP&h=fd3682a87547dbb88d6a" width=1 height=1 alt=""></td>'+
                '<td width=778>'+
                    '<table cellpadding=5 cellspacing=0 border=0 width=778>'+
                        '<tr bgcolor="#DBE1EB">'+
                            //'<td width=40><font color="#666666">Select</font></td>'+
                            '<td width=110><font color="#666666">Photo</font></td>'+
                            '<td width=175><font color="#666666">Name</font></td>'+
                            '<td width=175><font color="#666666">Location</font></td>'+
                            '<td width=318><font color="#666666">Skills</font></td>'+
                        '</tr>'+
                    '</table>'+
                    '<!-- page container used to display resources that match criteria. -->'+
                    '<div style="height:250px; overflow-y:auto; width:778px" id="employees_display"></div>'+
                '</td>'+
                '<!-- spacer image -->'+
                '<td bgcolor="#CCCCCC" width=1><img src="https://system.netsuite.com/core/media/media.nl?id=698209&c=NLCORP&h=fd3682a87547dbb88d6a" width=1 height=1 alt=""></td>'+
            '</tr>'+
        '</table>'+
        '<table cellpadding=0 cellspacing=0 border=0 width=780>'+
            '<tr>'+
                '<!-- availability banner image -->'+
                '<td colspan=3><IMG SRC="https://system.netsuite.com/core/media/media.nl?id=698210&c=NLCORP&h=e60bb30f332e745834a9" ALT="" WIDTH=778 HEIGHT=23 BORDER=0></td>'+
            '</tr>'+
            '<tr>'+
                '<!-- spacer image -->'+
                '<td bgcolor="#CCCCCC" width=1><img src="https://system.netsuite.com/core/media/media.nl?id=698209&c=NLCORP&h=fd3682a87547dbb88d6a" width=1 height=1 alt=""></td>'+
                '<td width=778>'+
                    '<!-- page container used to resource availability for selected resources. -->'+
                    '<div style="height:135px; overflow-y:auto; width:778px" id="availability_display"></div>'+
                '</td>'+
                '<!-- spacer image -->'+
                '<td bgcolor="#CCCCCC" width=1><img src="https://system.netsuite.com/core/media/media.nl?id=698209&c=NLCORP&h=fd3682a87547dbb88d6a" width=1 height=1 alt=""></td>'+
            '</tr>'+
            '<tr>'+
                '<!-- spacer image -->'+
                '<td bgcolor="#CCCCCC" colspan=3><img src="https://system.netsuite.com/core/media/media.nl?id=698209&c=NLCORP&h=fd3682a87547dbb88d6a" width=1 height=1 alt=""></td>'+
            '</tr>'+
        '</table>'+
        /*
        '<table cellpadding=5 cellspacing=0 border=0 width=800>'+
            '<tr>'+
                '<!-- Close Window, Select Resources & Close Window buttons -->'+
                '<td align=right> <input type="button" value=" Select " onClick="ResourceFinder.setAndCommitResources(); window.close()">&nbsp;<input type="button" value="Cancel" onClick="window.close()"></td>'+
            '</tr>'+
        '</table>'+
        */
        '</form>'+
        '</BODY></HTML>';
        response.write( html );
    }
}

/* add "Find Resources" button to the case */
function beforeLoad( type, form )
{
    if ( type != 'view' && nlapiGetRecordId()!=null )
    {
        var url = nlapiResolveURL('SUITELET','customscript_resourcefinder','customdeploy_resourcefinder');
        var script = "ResourceFinder_openResourceFinderPopup('"+ url + '&custpage_id='+nlapiGetRecordId()+"')";
        form.addButton('custpage_resourcefinder','Schedule Support Call', script);
    }
}


function pageInit(type) {
    var pos = window.location.href.indexOf('custpage_employee=');
    if (type=='create' && pos > -1) {
        var id = window.location.href.substring(pos+18);
        nlapiSelectNewLineItem('attendee');
        nlapiSetCurrentLineItemValue('attendee', 'attendee', id);
        nlapiCommitLineItem('attendee');
    }
}
