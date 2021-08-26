function buildPortlet(portlet, column)
{
    var title = 'OpenAir Dashboard';
    portlet.setTitle(title);
    var url = nlapiOutboundSSO('customsso_oa_sso');
    var content = '<iframe src="'+url+'" align="center" style="width: 100%; height: 885px; margin:0; border:0; padding:0"></iframe>';
    portlet.setHtml( content );
}