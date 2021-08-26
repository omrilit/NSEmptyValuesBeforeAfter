// hide cancel button
var cancelBtn = Ext.get('close');
if (cancelBtn)
{
    cancelBtn.findParent('table').style.display = 'none';
}

Ext.select('.pt_container').setStyle('display', 'none');  // hide suitelet title
Ext.select('.table_fields').setWidth('100%');  // set the inline field width to 100%
Ext.get('main_form').select('table').elements[1].style.display = 'none';  // remove some extra space at the top of the suitelet

var snavTooltips = null;

jQuery('body').bind('click', _CloseDialogOnClickedOutside);
var CONTEXT = nlapiGetContext();
var IS_ADMIN_ROLE = CONTEXT.getRole() == 3 || CONTEXT.getRole() == 18;





// ======================================================================================
// start of chart functions
// ======================================================================================
function snavAddParentRequiredRows(parentId)
{
    var parentElId = 'td-node--' + parentId;
    jQuery('#' + parentElId + ' .org-chart-expand-or-collapse').show();
    Ext.select('#' + parentElId + ' .org-chart-show-subordinates').setStyle('display', 'none');
    
    var markup = "<table id='tbl-nodes-of--" + parentId + "' class='org-chart-table' cellpadding='0' cellspacing='0' style='jtable-layout: fixed; visibility: inherit'>     ";
    markup += "<tr id='tr-parent-line--" + parentId + "' class='parent-line-row'>";
    markup += '</tr>';

    // child lines
    markup += "<tr id='tr-child-line--" + parentId + "' class='child-line-row'>";
    markup += '</tr>';

    // child nodes
    markup += "<tr id='tr-child-content--" + parentId + "' class='child-content-row'>";
    markup += '</tr>';
    markup += "</table>  ";

    jQuery('#' + parentElId).append(markup);
}





/**
 * Remove the top line of the 1st and last cell of the child line row
 */
function snavRemoveEndTopLines()
{
    var trs = jQuery('.child-line-row');
    for (var i = 0; i < trs.length; i++)
    {
        var tr = trs[i];
        var tds = jQuery(tr).find('td');
        jQuery(tds[0]).removeClass('top');
        var lastIndex = tds.length - 1;
        jQuery(tds[lastIndex]).removeClass('top');
    }
}





function snavRenderRows(templateId, rows)
{
    return snavTemplateApply(templateId, rows);
}





function snavRenderRow(templateId, row)
{
    var rows = [row];
    return snavRenderRows(templateId, rows);
}





function onExpandOrCollapseClicked(event)
{
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var id = target.getAttribute('data-internalid');

    if (jQuery(target).html() == '-')
    {
        // collapse
        jQuery(target).html('+');
        jQuery(target).attr('title', 'Expand');
    }
    else
    {
        // expand
        jQuery(target).html('-');
        jQuery(target).attr('title', 'Collapse');

        // check if subordinates are already in the chart
        if (target.getAttribute('data-subordinates-already-retrieved') == 'false')
        {
            snavShowSubordinates(id);
            return;
        }
    }

    var parentTable = jQuery(target).closest('[class=org-chart-node-td]')[0];

    // now find the 1st org-chart-table
    var nodesTable = jQuery(parentTable).find('[class=org-chart-table]')[0];

    var node = jQuery(parentTable).find('[class=node]')[0];

    // get next org-chart-table
    if (jQuery(nodesTable).css('display') == 'none')
    {
        // expand/show
        jQuery(nodesTable).css('visibility', 'hidden');
        jQuery(nodesTable).css('display', 'table');
        //        
        snavArrange();

        jQuery(nodesTable).css('display', 'none');
        jQuery(nodesTable).css('visibility', 'visible');

        jQuery(nodesTable).show('slide', {
            direction: 'up'
        }, 700, function()
        {
            snavArrange();
            jQuery(parentTable).effect('highlight', null, 1000);
        });
    }
    else
    {
        // collapse/hide
        jQuery(nodesTable).hide('slide', {
            direction: 'up'
        }, 700, function()
        {
            jQuery(nodesTable).css('display', 'none');
            snavArrange();
            jQuery(node).effect('highlight', null, 1000);
        });
    }
}





function snavCreateSampleNodes(parentNodeId, numberOfNodes)
{
    var nodes = [];
    for (var i = 1; i <= numberOfNodes; i++)
    {
        var id = parentNodeId.replace('td-node--', '') + '-' + i;
        nodes.push({
            id: id,
            name: id
        });
    }
    snavCreateNodes(parentNodeId, nodes);
}





function snavCreateRootNode(targetId, root)
{
    jQuery('#' + targetId).append(snavRenderRow('tmpRoot', root));
}





function snavAppendNode(parentId, child)
{
    // check if the child already exists in the page
    if (document.getElementById('td-node--' + child.id))
    {
        // yes, so just append it
        snavAppendExistingNode(parentId, child.id);
        return;
    }

    // parent single downward line
    if (Ext.get('table-parent-downward-line--' + parentId))
    {
        Ext.get('table-parent-downward-line--' + parentId).show();
    }

    // child lines
    var childLineRow = jQuery('#td-node--' + parentId).find('.child-line-row')[0];
    if (typeof childLineRow == 'undefined')
    {
        snavAddParentRequiredRows(parentId);
        childLineRow = jQuery('#td-node--' + parentId).find('.child-line-row')[0];
    }
    
    jQuery(childLineRow).append(snavRenderRow('tmpChildLine', child));

    // child nodes
    var currentNodes = jQuery('#tr-child-content--' + parentId);
    var childContentRow = currentNodes[0];
    child.parentId = parentId == 'ocRoot' ? parentId : child.parentId;
    
    jQuery(childContentRow).append(snavRenderRow('tmpChildNode', child));

    snavArrange();

    Ext.select('#placeholder1 [data-is-new=true]').fadeIn({
        duration: 1
    }).set({
        'data-is-new': 'false'
    });
}





/**
 * childId numeric id of the child
 */
function snavAppendExistingNode(parentId, childId)
{
    var parentElId = 'td-node--' + parentId;
    var jParent = jQuery('#' + parentElId);
    var child = {
        internalid: childId
    };
    
    if (jParent === null)
    {
        throw 'parent is null';
    }
    
    var childLineRow = jParent.find('.child-line-row')[0];
    if (typeof childLineRow == 'undefined')
    {
        // create required
        snavAddParentRequiredRows(parentId);
    }
    
    childLineRow = jParent.find('.child-line-row')[0];
    if (typeof childLineRow == 'undefined')
    {
        snavCreateNodes(parentElId, [child]);
        return;
    }
    
    jQuery(childLineRow).append(snavRenderRow('tmpChildLine', child));

    // child nodes
    var currentNodes = jParent.find('.child-content-row');
    var childContentRow = currentNodes[0];
    var jTdChild = jQuery('#td-node--' + childId);
    jQuery(childContentRow).append(jTdChild);

    // parent lines colspan
    var nodeCount = jQuery('#tr-child-content--' + parentId + ' > td').length;
    jQuery('#tr-parent-line--' + parentId + ' > td').attr('colspan', nodeCount);
    snavArrange();
}





function snavArrange(placeHolderId)
{
    placeHolderId = 'placeholder1';
    jQuery('#' + placeHolderId + ' td').css('width', 'auto');
    jQuery('#' + placeHolderId + ' .width-adjuster').css('width', '100%');
    var tds = jQuery('td');

    // set the colspan of the parent line cells
    var childContentRows = jQuery('.child-content-row');
    var count = childContentRows.length;

    for (var i = 0; i < count; i++)
    {
        // get parent line row
        var childContentRow = childContentRows[i];
        var parentLineRowElId = childContentRow.id.replace('child-content', 'parent-line');
        var parentLineRow = jQuery('#' + parentLineRowElId);
        var nodeCount = jQuery('#' + childContentRow.id + ' > td').length;

        parentLineRow.find('td').attr('colspan', nodeCount);
    }

    tds = jQuery('.parent-line-left');
    for (i = tds.length - 1; i >= 0; i--)
    {
        if (jQuery(tds[i]).width() === 0)
        {
            continue;
        }

        // set the width of the left top line
        var tdLowerId = tds[i].id;
        var divUpperId = tdLowerId.replace('td-parent', 'div-child');
        var leftCellWidth = Ext.get(tdLowerId).getWidth();
        if (Ext.get(divUpperId))
        {
            Ext.get(divUpperId).setWidth(leftCellWidth);
        }
        // set the width of the right top line
        tdLowerId = tdLowerId.replace('-left-', '-right-');
        divUpperId = tdLowerId.replace('td-parent', 'div-child');
        // alert(divUpperId)

        if (Ext.get(divUpperId))
        {
            var rightCellWidth = Ext.get(tdLowerId).getWidth();
            Ext.get(divUpperId).setWidth(rightCellWidth);
        }

        // position div
        tds[i].id.replace('td-parent-line-left-', 'div--');
    }

    if (Ext.isIE)
    {
        Ext.select('.org-chart .nodeContainer').setStyle('margin', '1px');
        Ext.select('.tr-parent-downward-line').setStyle('lineHeight', '10px');
        Ext.select('.tr-parent-downward-line').setStyle('height', '10px');
        Ext.select('.node').setStyle('padding', '3px');
    }
}





// ======================================================================================================
// start of sub nav related code
// ======================================================================================================
function snavRestrictView(subsidiaryId)
{
    snavSelectSubsidiary(subsidiaryId);
    snavSuiteletProcessAsyncUser('restrictView', subsidiaryId, function(isOK)
    {
        if (isOK != 'ok')
        {
            uiShowError('error in restrictView');
            return;
        }
        
        snavRefreshPortlets();
    });
    return false;
}





/**
 * Selects/highlights a sub and all its children
 * 
 * @param {Object}
 *        subsidiaryId
 */
function snavSelectSubsidiary(subsidiaryId)
{
    if (!snavHasValue(subsidiaryId))
    {
        return;
    }

    Ext.select('.node').removeClass('node-selected').addClass('node-not-selected');
    var selectedSub = Ext.select('.node[data-id=' + subsidiaryId + ']').elements[0];
    if (snavHasNoValue(selectedSub))
    {
        throw 'snavHasNoValue(selectedSub); subsidiaryId=' + subsidiaryId;
    }
    
    // select all subs that starts with the full name of the selected sub
    var fullName = selectedSub.getAttribute('data-fullname');
    var internalId = selectedSub.getAttribute('data-id');
    var parentId = selectedSub.getAttribute('data-parentid');
    
    var els = Ext.select('.node').elements;
    for (var i = 0; i < els.length; i++)
    {
        var nodeFullName = els[i].getAttribute('data-fullname');
        var nodeInternalId = els[i].getAttribute('data-id');
        var nodeParentId = els[i].getAttribute('data-parentid');
        if ((!snavHasNoValue(nodeFullName) && nodeFullName.substr(0, fullName.length) == fullName && parentId != nodeParentId) || internalId == nodeInternalId)
        {
            Ext.get(els[i]).addClass('node-selected').removeClass('node-not-selected');
        }
    }
}





function snavShowHelp()
{
    // Init the singleton. Any tag-based quick tips will start working.
    Ext.QuickTips.init();
    var qtip = 'The Subsidiary Navigator Portlet allows you to limit the information displayed on your dashboard, searches, and reports to a specific subsidiary. It contains a chart from which you can select the subsidiary whose records you want to display. Clicking a subsidiary is equivalent to setting the Restrict View to a subsidiary option in the Set Preferences page.';
    qtip += '<br>';
    qtip += '<br>';
    qtip += 'The chart enables you to restrict your access to records from the selected areas.';
    qtip += '<br>';
    qtip += '<br>';
    qtip += 'Note that the settings will apply for the duration of the current session. Normal settings will be restored upon next login.';
    qtip += '<br>';
    qtip += '<br>';
    qtip += 'For more information, see <a target=_blank href="https://system.netsuite.com/app/help/helpcenter.nl?topic=DOC_SubsidiaryNavigator">Subsidiary Navigator</a>.';

    var tooltip = (new Ext.ToolTip({
        title: 'Subsidiary Navigator',
        ids: 'Tooltip',
        target: 'snavHelpIcon',
        anchor: 'left',
        html: qtip,
        autoWidth: false,
        maxWidth: 500,
        autoHide: false,
        closable: true,
        autoShow: false,
        hideDelay: 0,
        dismissDelay: 0,
        style: {
            color: 'red'
        },
        bodyStyle: 'padding: 5px; background-color: lightyellow',
        listeners: {

            'hide': function()
            {
                this.destroy();
            },
            'renderX': function()
            {

                this.header.on('click', function(e)
                {
                    e.stopEvent();
                    Ext.Msg.alert('Link', 'Link to something interesting.');

                }, this, {
                    delegate: 'a'
                });
            }
        }
    }));

    tooltip.show();

    Ext.select('.x-tip-mc').setStyle({
        'background-color': 'lightyellow'
    });

    if (Ext.select('.x-ie-shadow'))
    {
        Ext.select('.x-ie-shadow').hide();
    }
}





function snavShowChangeSubLink()
{
    // check first if jQuery is loaded; otherwise, check again later
    var winParent = window.parent;
    var winjQuery = winParent.jQuery;
    if (winjQuery == undefined)
    {
        setTimeout(snavShowChangeSubLink, 200);
        return;
    }

    // check first if there's already the link
    var changeSubLink = winjQuery('#ns-change-sub-link');
    if (changeSubLink.length == 0)
    {
        // get dashboard links container
        var dashLinkContainer = winjQuery('#ns-dashboard-navigation-panel ul');
        if (dashLinkContainer.length > 0)
        {
            // remove inverted pyramid
            winjQuery('body').prepend('<style>#ns-dashboard-navigation-panel ul li>span.snav-dash-link:after { content: ""; background-image: none; padding-left: 0px; margin-left: 0px; }</style>');

            // get script to be inserted
            var script = jQuery('#snavParentScript').detach();
            winjQuery('body').append(script);

            // get subnav width and height
            winParent.snavWidth = jQuery('#root-table--ocRoot').width();
            winParent.snavHeight = jQuery('#snavPlaceholder1').parents('div.uir-field-wrapper').height();

            // set close icon to window parent's global variable
            winParent.snavIconClose = snavIconClose;

            // html to insert
            var html = '<span id="ns-change-sub-link" class="ns-link-button snav-dash-link" role="button" tabindex="0" onclick="snavShowSubNavPopup();">Change Subsidiary</span>';
            dashLinkContainer.prepend(jQuery('<li>').html(html));
        }
    }
}






Ext.onReady(function()
{
    jQuery('#div__body, #main_form').css({
        padding: '0px',
        'padding-top': '0px',
        margin: '0px'
    });

    jQuery("iframe").each(function()
    {
        //Using closures to capture each one
        var iframe = jQuery(this);
        iframe.on("load", function()
        { //Make sure it is fully loaded
            iframe.contents().click(function(event)
            {
                iframe.trigger("click");
            });
        });

        iframe.click(_CloseDialogOnClickedOutside);
    });

    snavSuiteletProcessAsyncUser('getRestrictViewSubsidiaryIds', 'any', function(subIds)
    {
        if (subIds.length <= 1)
        {
            Ext.get('snavProgress').update('<br />You need access to more than one subsidiary before you can use the Subsidiary Navigator.');
            return;
        }

        // get subs
        //snavSuiteletProcessAsync('getSubsidiaries', subIds, function(subsidiaries)
        snavSuiteletProcessAsync("getState", subIds, function(state)
        {
            _InitSettings(state.Config);
            var subsidiaries = state.Subsidiaries;

            Ext.get('snavProgress').dom.style.display = 'none';
            if (subsidiaries.length === 0)
            {
                uiShowError('You do not have access to subsidiaries');
                return;
            }

            // root
            var placeHolderId = 'snavPlaceholder1';
            snavCreateRootNode(placeHolderId, { internalid: 'ocRoot' });

            // display in tree chart
            for (var i = 0; i < subsidiaries.length; i++)
            {
                var subId = snavHasValue(subsidiaries[i].parentId) ? subsidiaries[i].parentId : "ocRoot";
                subsidiaries[i].HTM_LOGO = _GetSubsidiaryHtmLogo(subsidiaries[i]);

                snavAppendNode(subId, subsidiaries[i]);
            }

            //hide root's parent and child lines
            Ext.get('div--ocRoot').setStyle('display', 'none');
            Ext.get('tr-parent-line--ocRoot').setStyle('display', 'none');
            Ext.get('tr-child-line--ocRoot').setStyle('display', 'none');

            //get the width of the longest subsidiary text and set as the width of all node boxes
            var els = Ext.select('.nodename').elements;
            var maxWidth = 0;
            for (var i = 0; i < els.length; i++)
            {
                if (Ext.get(els[i]).getWidth() > maxWidth)
                {
                    maxWidth = Ext.get(els[i]).getWidth();
                }
            }
            Ext.select('.org-chart .nodeContainer').setStyle('width', 'auto');
            snavArrange();

            snavRemoveEndTopLines();


            // show currently selected subsidiary
            snavSuiteletProcessAsyncUser('getSubsidiary', 'any', function(subsidiaryId)
            {
                snavSelectSubsidiary(subsidiaryId);
            });

            snavEnableTooltips(state.Config._ENABLE_TOOLTIP_USE);

            // show change subsidiary link on dashboard links
            snavShowChangeSubLink();
        });
    });
});





/**
* Enables or disables the subsidiary tooltips on client side.
* @param {Boolean} bEnable - set to true to enable tooltip; otherwise, set to false.
*/
function snavEnableTooltips(bEnable)
{
    if (bEnable)
    {
        if (snavHasNoValue(snavTooltips))
        {
            // copy tooltip template to actual content placement
            var elements = jQuery('.tooltip-styles').parent('[id!="content-{internalid}"]');
            for (var i = 0; i < elements.length; i++)
            {
                var jElem = jQuery(elements[i]);
                var jElemId = jElem.attr('id');
                if (jElemId.indexOf('content-') == 0)
                {
                    var jElemCopyId = 'tooltip-' + jElemId;
                    if (jQuery('#' + jElemCopyId).length == 0)
                    {
                        var jElemCopy = jElem.clone().attr({ id: jElemCopyId });
                        jElem.parent().append(jElemCopy);
                    }
                }
            }
            // render tooltips
            snavTooltips = jQuery(".node-tooltip[data-tooltip-content!='#tooltip-content-{internalid}']").tooltipster({
                arrow: false,
                theme: ['tooltipster-shadow', 'tooltipster-shadow-customized'],
                animation: 'grow',
                animationDuration: 250
            });
        }
    }
    else
    {
        // destroy tooltips
        if (snavHasValue(snavTooltips))
        {
            snavTooltips.tooltipster('destroy');
            snavTooltips = null;
        }
    }
}






function _GetSubsidiaryHtmLogo(sub)
{
    var isUseLogo = jQuery("#chkUseLogo").prop("checked");
    var isUseLogoEnabled = jQuery("#tglEnableUseLogo").prop("value");
    var logoStyle = isUseLogo && isUseLogoEnabled ? "inline" : "none";

    if (sub.LogoURL == null || sub.LogoURL == "")
    {
        return '<div class="sublogo" style="display:' + logoStyle + '"><strong style="font-size:12px">' + _GetStringInitials(sub.name) + '</strong><br></div>';
    }

    return '<div class="sublogo" style="display:' + logoStyle + '"><img class="sublogo" src="' + encodeURI(sub.LogoURL) + '" height="15px"><br></div>';
}





function _GetStringInitials(s)
{
    if (s == null || s == "")
    {
        return "";
    }

    var initials = "";

    for (var i = 0, prevChar = " "; i < s.length; ++i)
    {
        if (/^[0-9]*$/gm.test(s[i]))
        {
            initials += s[i];
        }
        else if (prevChar == " ")
        {
            if (/^[a-z]+$/i.test(s[i]) ||       //ASCII alphabetic?
                /[^\u0000-\u007F]+/.test(s[i])) //unicode?
            {
                initials += s[i].toUpperCase();
            }
            else
            {
                continue;
            }
        }

        prevChar = s[i]
    }

    return initials;
}





function _OnShowLogo_Click()
{
    var chkShowLogo = jQuery("#chkUseLogo");
    var newValue = chkShowLogo.prop("checked");

    _UpdateCheckLogoUI()

    snavSuiteletProcessAsync("setConfig", { LOGO_USE: newValue }, new Function(), true);
}





function _UpdateCheckLogoUI()
{
    var isChecked = jQuery("#chkUseLogo").prop("checked");
    var isEnabled = jQuery("#tglEnableUseLogo").prop("value");
    
    //Update tree
    jQuery(".sublogo").css({ display: isChecked && isEnabled ? "inline" : "none" });
}





function _OnTglEnableUseLogo_Click()
{
    var toggle = jQuery("#tglEnableUseLogo");
    var newValue = !toggle.prop("value");
    toggle.prop("value", newValue);

    _UpdateToggleLogoUI();

    snavSuiteletProcessAsync("setConfig", { _ENABLE_LOGO_USE: newValue }, new Function(), true);
}





function _UpdateToggleLogoUI()
{
    var toggle = jQuery("#tglEnableUseLogo");
    var value = toggle.prop("value");
    
    toggle.removeClass(value ? "toggled-off" : "toggled-on");
    toggle.addClass(value ? "toggled-on" : "toggled-off");

    if (value)
    {
        jQuery("#lblUseLogo").removeClass("setting_disabled");  //Normal text
        jQuery("#chkUseLogo").removeProp("disabled");  //Enable checkbox
    }
    else
    {
        jQuery("#lblUseLogo").addClass("setting_disabled");  //Grey-out text
        jQuery("#chkUseLogo").prop("disabled", true);  //Disable checkbox
        jQuery(".sublogo").css({ display: "none" });

        if (!IS_ADMIN_ROLE)
        {
            jQuery("#rowUseLogo").prop("title", "This feature is disabled by the administrator on this account.");
        }
    }

    _UpdateCheckLogoUI();
}





function _OnTglEnableTooltip_Click()
{
    var toggle = jQuery("#tglEnableUseTooltip");
    var newValue = !toggle.prop("value");
    toggle.prop("value", newValue);

    toggle.removeClass(newValue ? "toggled-off" : "toggled-on");
    toggle.addClass(newValue ? "toggled-on" : "toggled-off");

    snavEnableTooltips(newValue);

    snavSuiteletProcessAsync("setConfig", { _ENABLE_TOOLTIP_USE: newValue }, new Function(), true);
}





function _InitSettings(config)
{
    var toggleTooltip = jQuery("#tglEnableUseTooltip");
    toggleTooltip.prop("value", config._ENABLE_TOOLTIP_USE);
    toggleTooltip.removeClass(config._ENABLE_TOOLTIP_USE ? "toggled-off" : "toggled-on");
    toggleTooltip.addClass(config._ENABLE_TOOLTIP_USE ? "toggled-on" : "toggled-off");
    
    jQuery("#chkUseLogo").prop("checked", config.LOGO_USE);
    jQuery("#tglEnableUseLogo").prop("value", config._ENABLE_LOGO_USE);
    _UpdateToggleLogoUI();

    jQuery(".AdminSetting").css({ display: IS_ADMIN_ROLE ? "" : "none" });
}





function _OnSettings_Click()
{
    var popup = jQuery(".PopupSetting");

    if (!popup.hasClass("ui-dialog-content"))  //Init dialog once
    {
        popup.dialog({
            autoOpen: false,
            height: IS_ADMIN_ROLE ? 56 : 42,
            width: IS_ADMIN_ROLE ? 182 : 100,
            position: ["top", 23],
            show: .5,
            resizable: false
        });

        popup.css('overflow', 'hidden');       //disable scrollbars
        jQuery(".ui-dialog-titlebar").hide();  //hide titlebar      
    }
    
    popup.dialog(popup.dialog("isOpen") ? "close" : "open");

    return false;
}





function _CloseDialogOnClickedOutside(e)
{
    if (e.target.id == "imgSetting")
    {
        return true;
    }

    var popup = jQuery(".PopupSetting");
    
    if (popup.hasClass("ui-dialog-content") &&  //dialog initialised?
        popup.dialog('isOpen') &&
        !jQuery(e.target).is('.ui-dialog, a') &&
        !jQuery(e.target).closest('.ui-dialog').length)
    {
        popup.dialog('close');
    }
}