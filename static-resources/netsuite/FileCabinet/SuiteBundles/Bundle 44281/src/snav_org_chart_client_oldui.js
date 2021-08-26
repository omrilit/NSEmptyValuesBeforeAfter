// hide cancel button
var cancelBtn = Ext.get('close');
if (cancelBtn) {
    cancelBtn.findParent('table').style.display = 'none';
}

// hide suitelet title
Ext.select('.pt_container').setStyle('display', 'none');

// set the inline field width to 100%
Ext.select('.table_fields').setWidth('100%');

// remove some extra space at the top of the suitelet
Ext.get('main_form').select('table').elements[1].style.display = 'none';

// ======================================================================================
// start of chart functions
// ======================================================================================
function snavAddParentRequiredRows(parentId) {
    var parentElId = 'td-node--' + parentId;
    jQuery('#' + parentElId + ' .org-chart-expand-or-collapse').show();
    Ext.select('#' + parentElId + ' .org-chart-show-subordinates').setStyle('display', 'none');
    var markup = "<table id='tbl-nodes-of--" + parentId + "' class='org-chart-table' cellpadding='0' cellspacing='0' style='jtable-layout: fixed; visibility: inherit'>     ";
    markup += "<tr id='tr-parent-line--" + parentId + "' class='parent-line-row'>";
    markup += '</tr>';

    // child lines
    markup += "<tr id='tr-child-line--" + parentId + "' class='child-line-row'>";
    // markup += snavRenderRows('tmpChildLine', nodes);
    markup += '</tr>';

    // child nodes
    markup += "<tr id='tr-child-content--" + parentId + "' class='child-content-row'>";
    // markup += snavRenderRows('tmpChildNode', nodes);
    markup += '</tr>';
    markup += "</table>  ";

    jQuery('#' + parentElId).append(markup);
}

/**
 * Remove the top line of the 1st and last cell of the child line row
 */
function snavRemoveEndTopLines() {
    var trs = jQuery('.child-line-row');
    for (var i = 0; i < trs.length; i++) {
        var tr = trs[i];
        var tds = jQuery(tr).find('td');
        jQuery(tds[0]).removeClass('top');
        var lastIndex = tds.length - 1;
        jQuery(tds[lastIndex]).removeClass('top');
    }
}

function snavRenderRows(templateId, rows) {
    return snavTemplateApply(templateId, rows);
}

function snavRenderRow(templateId, row) {
    var rows = [ row ];
    return snavRenderRows(templateId, rows);
}

function onExpandOrCollapseClicked(event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var id = target.getAttribute('data-internalid');

    if (jQuery(target).html() == '-') {
        // collapse
        jQuery(target).html('+');
        jQuery(target).attr('title', 'Expand');
    } else {
        // expand
        jQuery(target).html('-');
        jQuery(target).attr('title', 'Collapse');

        // check if subordinates are already in the chart
        if (target.getAttribute('data-subordinates-already-retrieved') == 'false') {
            snavShowSubordinates(id);
            return;
        }
    }
    // logger.log('You clicked ' + target.innerHTML);
    // logger.log(target.nextSibling);
    // }

    var parentTable = jQuery(target).closest('[class=org-chart-node-td]')[0];
    // logger.log('parentTable=' + parentTable);
    // now find the 1st org-chart-table
    var nodesTable = jQuery(parentTable).find('[class=org-chart-table]')[0];
    // logger.log('nodesTable=' + nodesTable);
    // alert(jQuery(nodesTable).css('display'))
    // logger.log(jQuery(target.nextSibling).css('display'))
    // logger.log(jQuery(target.nextSibling).css('visibility'))

    var node = jQuery(parentTable).find('[class=node]')[0];

    // get next org-chart-table
    if (jQuery(nodesTable).css('display') == 'none') {
        // expand/show
        jQuery(nodesTable).css('visibility', 'hidden');
        jQuery(nodesTable).css('display', 'table');
        //        
        snavArrange();

        jQuery(nodesTable).css('display', 'none');
        jQuery(nodesTable).css('visibility', 'visible');

        jQuery(nodesTable).show('slide', {
            direction : 'up'
        }, 700, function() {
            snavArrange();
            jQuery(parentTable).effect('highlight', null, 1000);
        });
    } else {
        // collapse/hide
        jQuery(nodesTable).hide('slide', {
            direction : 'up'
        }, 700, function() {
            jQuery(nodesTable).css('display', 'none');
            snavArrange();
            jQuery(node).effect('highlight', null, 1000);
        });
    }
}

function snavCreateSampleNodes(parentNodeId, numberOfNodes) {
    var nodes = [];
    for (var i = 1; i <= numberOfNodes; i++) {
        var id = parentNodeId.replace('td-node--', '') + '-' + i;
        nodes.push({
            id : id,
            name : id
        });
    }
    snavCreateNodes(parentNodeId, nodes);
}

function snavCreateRootNode(targetId, root) {
    jQuery('#' + targetId).append(snavRenderRow('tmpRoot', root));
}

function snavAppendNode(parentId, child) {
    // check if the child already exists in the page
    if (document.getElementById('td-node--' + child.id)) {
        // yes, so just append it
        snavAppendExistingNode(parentId, child.id);
        return;
    }

    // parent single downward line
    if (Ext.get('table-parent-downward-line--' + parentId)) {
        Ext.get('table-parent-downward-line--' + parentId).show();
    }

    // child lines
    var childLineRow = jQuery('#td-node--' + parentId).find('.child-line-row')[0];
    // logger.log('childLineRow='+childLineRow)
    if (typeof childLineRow == 'undefined') {
        snavAddParentRequiredRows(parentId);
        childLineRow = jQuery('#td-node--' + parentId).find('.child-line-row')[0];
    }
    jQuery(childLineRow).append(snavRenderRow('tmpChildLine', child));

    // child nodes
    var currentNodes = jQuery('#tr-child-content--' + parentId);
    var childContentRow = currentNodes[0];
    jQuery(childContentRow).append(snavRenderRow('tmpChildNode', child));

    snavArrange();

    Ext.select('#placeholder1 [data-is-new=true]').fadeIn({
        duration : 1
    }).set({
        'data-is-new' : 'false'
    });
}

/**
 * childId numeric id of the child
 */
function snavAppendExistingNode(parentId, childId) {
    var parentElId = 'td-node--' + parentId;
    var jParent = jQuery('#' + parentElId);
    var child = {
        internalid : childId
    };
    if (jParent === null) {
        throw 'parent is null';
    }
    var childLineRow = jParent.find('.child-line-row')[0];
    if (typeof childLineRow == 'undefined') {
        // create required
        snavAddParentRequiredRows(parentId);
    }
    childLineRow = jParent.find('.child-line-row')[0];
    if (typeof childLineRow == 'undefined') {
        snavCreateNodes(parentElId, [ child ]);
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

function snavArrange(placeHolderId) {
    var logger = new tcobjLogger(arguments);
    placeHolderId = 'placeholder1';
    jQuery('#' + placeHolderId + ' td').css('width', 'auto');
    jQuery('#' + placeHolderId + ' .width-adjuster').css('width', '100%');
    var tds = jQuery('td');
    // set the colspan of the parent line cells
    var childContentRows = jQuery('.child-content-row');
    var count = childContentRows.length;
    // logger.log('count=' + count);
    for (var i = 0; i < count; i++) {
        // get parent line row
        var childContentRow = childContentRows[i];
        var parentLineRowElId = childContentRow.id.replace('child-content', 'parent-line');
        var parentLineRow = jQuery('#' + parentLineRowElId);
        var nodeCount = jQuery('#' + childContentRow.id + ' > td').length;
        logger.log('nodeCount=' + nodeCount);
        parentLineRow.find('td').attr('colspan', nodeCount);
    }

    tds = jQuery('.parent-line-left');
    for (i = tds.length - 1; i >= 0; i--) {
        if (jQuery(tds[i]).width() === 0) {
            continue;
        }
        logger.log('td.id=' + tds[i].id);

        // set the width of the left top line
        var tdLowerId = tds[i].id;
        var divUpperId = tdLowerId.replace('td-parent', 'div-child');
        var leftCellWidth = Ext.get(tdLowerId).getWidth();
        if (Ext.get(divUpperId)) {
            Ext.get(divUpperId).setWidth(leftCellWidth);
        }
        // set the width of the right top line
        tdLowerId = tdLowerId.replace('-left-', '-right-');
        divUpperId = tdLowerId.replace('td-parent', 'div-child');
        // alert(divUpperId)

        if (Ext.get(divUpperId)) {
            var rightCellWidth = Ext.get(tdLowerId).getWidth();
            Ext.get(divUpperId).setWidth(rightCellWidth);
        }

        // position div
        tds[i].id.replace('td-parent-line-left-', 'div--');
    }

    if (Ext.isIE) {
        Ext.select('.org-chart .nodeContainer').setStyle('margin', '1px');
        Ext.select('.tr-parent-downward-line').setStyle('lineHeight', '10px');
        Ext.select('.tr-parent-downward-line').setStyle('height', '10px');
        Ext.select('.node').setStyle('padding', '3px');
    }
    Ext.get('snavPlaceholder1').setWidth(Ext.get('root-table--ocRoot').getWidth());
}

// ======================================================================================================
// start of sub nav related code
// ======================================================================================================
function snavRestrictView(subsidiaryId) {
    var logger = new tcobjLogger(arguments);
    snavSelectSubsidiary(subsidiaryId);
    snavSuiteletProcessAsyncUser('restrictView', subsidiaryId, function(isOK) {
        logger.log('isOK=' + isOK);
        if (isOK != 'ok') {
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
function snavSelectSubsidiary(subsidiaryId) {
    var logger = new tcobjLogger(arguments);
    Ext.select('.node').removeClass('node-selected').removeClass('formtabon').addClass('node-not-selected').addClass('formtabtextoff');
    // Ext.select('.node').select('a').removeClass('formtabon');
    var selectedSub = Ext.select('.node[data-id=' + subsidiaryId + ']').elements[0];
    if (snavHasNoValue(selectedSub)) {
        throw 'snavHasNoValue(selectedSub); subsidiaryId=' + subsidiaryId;
    }
    // select all subs that starts with the full name of the selected sub
    var fullName = selectedSub.getAttribute('data-fullname');
    logger.log('fullName=' + fullName);
    var els = Ext.select('.node[data-fullname^=' + fullName + ']').elements;
    logger.log('els.length=' + els.length);
    for (var i = 0; i < els.length; i++) {
        Ext.get(els[i]).addClass('node-selected').removeClass('node-not-selected');
        Ext.get(els[i]).addClass('formtabon');
    }
}

function snavShowHelp() {
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
        title : 'Subsidiary Navigator',
        ids : 'Tooltip',
        target : 'snavHelpIcon',
        anchor : 'left',
        html : qtip,
        autoWidth : false,
        maxWidth : 500,
        autoHide : false,
        closable : true,
        autoShow : false,
        hideDelay : 0,
        dismissDelay : 0,
        style : {
            color : 'red'
        },
        bodyStyle : 'padding: 5px; background-color: lightyellow',
        listeners : {

            'hide' : function() {
                this.destroy();
            },
            'renderX' : function() {

                this.header.on('click', function(e) {
                    e.stopEvent();
                    Ext.Msg.alert('Link', 'Link to something interesting.');

                }, this, {
                    delegate : 'a'
                });
            }
        }
    }));

    tooltip.show();
}

Ext.onReady(function() {
    var logger = new tcobjLogger();

    snavSuiteletProcessAsyncUser('getRestrictViewSubsidiaryIds', 'any', function(subIds) {

        if (subIds.length == 1) {
            Ext.get('snavProgress').update('<br />You need access to more than one subsidiary before you can use the Subsidiary Navigator.');
            return;
        }
        // get subs
        snavSuiteletProcessAsync('getSubsidiaries', subIds, function(subsidiaries) {
            Ext.get('snavProgress').dom.style.display = 'none';
            if (subsidiaries.length === 0) {
                uiShowError('You do not have access to subsidiaries');
                return;
            }

            // root
            var placeHolderId = 'snavPlaceholder1';
            snavCreateRootNode(placeHolderId, {
                internalid : 'ocRoot'
            });

            // display in tree chart
            for (var i = 0; i < subsidiaries.length; i++) {
                var subsidiary = subsidiaries[i];
                if (snavHasValue(subsidiary.parentId)) {
                    snavAppendNode(subsidiary.parentId, subsidiary);
                } else {
                    snavAppendNode('ocRoot', subsidiary);
                }
            }

            // hide root's parent and child lines
            Ext.get('div--ocRoot').setStyle('display', 'none');
            Ext.get('tr-parent-line--ocRoot').setStyle('display', 'none');
            Ext.get('tr-child-line--ocRoot').setStyle('display', 'none');

            // get the width of the longest subsidiary text and set as the width
            // of all node boxes
            var els = Ext.select('.nodename').elements;
            var maxWidth = 0;
            for (var i = 0; i < els.length; i++) {
                if (Ext.get(els[i]).getWidth() > maxWidth) {
                    maxWidth = Ext.get(els[i]).getWidth();
                }
            }
            Ext.select('.org-chart .nodeContainer').setStyle('width', 'auto');
            snavArrange()

            snavRemoveEndTopLines();

            // change iframe height based on the height of the document
            // if (parent.Ext) {
            // var chartHeight = Ext.get('div__body').getHeight();
            // parent.Ext.get('snavPortlet').setHeight(chartHeight + 20 /*
            // allowance to prevent vert scrollbar from displaying*/);
            // }

            // show currently selected subsidiary
            snavSuiteletProcessAsyncUser('getSubsidiary', 'any', function(subsidiaryId) {
                logger.log('subsidiaryId=' + subsidiaryId);
                if (snavHasValue(subsidiaryId)) {
                    snavSelectSubsidiary(subsidiaryId);
                }
            });
        })
    });
});
