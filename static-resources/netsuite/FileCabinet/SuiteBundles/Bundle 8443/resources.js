var ns;
if(!ns) ns={};
if(!(ns.Resources)) ns.Resources={};



//==============================================================================
ns.Resources.ResourceManager = function ResourceManager( scriptName, cultureInfo)
{
	var _CultureInfo = cultureInfo == null? _GetCurrentUserCulture(): cultureInfo;
	var _ScriptName = scriptName;
	var _FolderId = _GetFolderId( scriptName);	
	var _Resources = [];
	
	 
	_LoadResource(_CultureInfo);
	
	
	
	
	
	
	//--------------------------------------------------------------------------
	function _LoadResource( cultureInfo)
	{
		if(_Resources[cultureInfo] == null)
		{
			var resource = _OpenResourceFile( cultureInfo);
			_Resources[cultureInfo] = resource;
		}
	}
	
	
	
	//--------------------------------------------------------------------------
	this.GetString = function GetString( string, cultureInfo)
	{
		var ci = cultureInfo == null? _CultureInfo: cultureInfo;
		
		if(_Resources[ci] == null)
			_LoadResource( ci);
			
		var resx = _Resources[ci];
		
		if( resx == null || resx.data == null)
			return "(" + string + ")";
		
		if( resx.data.(@name == string))
			return resx.data.(@name == string).value.toString();
			
		return "(" + string + ")";
	}
	
	
	
	//--------------------------------------------------------------------------
	this.GetStream = function GetStream( string, cultureInfo)
	{
		var ci = cultureInfo == null? _CultureInfo: cultureInfo;
		
		if(_Resources[ci] == null)
			_LoadResource( ci);
			
		var resx = _Resources[ci];
		
		if( resx == null || resx.data == null)
			return "(" + string + ")";
		
		if( resx.data.(@name == string && @type == "System.Drawing.Bitmap, System.Drawing"))
			return resx.data.(@name == string).value;
			
		return "(" + string + ")";
	}
	
	
	
	//--------------------------------------------------------------------------
	function _GetCurrentUserCulture()
	{
		var result = nlapiSearchRecord( "employee", null,
			[new nlobjSearchFilter("internalid", null, 'is', nlapiGetUser())],
			[new nlobjSearchColumn("countrycode")]);
		
		if( result == null)
			return null;
		
		var dr = new ns.DataAccess.DataRow( result[0]);
		
		return dr.countrycode;
	}
	
	
	
	//--------------------------------------------------------------------------
	function _GetFileId( fileName)
	{
		var result = nlapiSearchRecord( "file", null,
			[new nlobjSearchFilter("name", null, 'is', fileName)],
			[new nlobjSearchColumn("internalid")]);
				
		return result == null? null: result[0].getValue("internalid");
	}
	
	

	//--------------------------------------------------------------------------
	function _GetFolderId( fileName)
	{
		var fileId = _GetFileId( fileName);
		if( fileId == null)
			return null;
		
		var file = nlapiLoadFile( fileId);
		if( file == null)
			return null;
			
		return file.getFolder();
	}
		
	
	
	//--------------------------------------------------------------------------
	function _OpenResourceFile( cultureInfo)
	{
		var defaultResx = _ScriptName + ".US.resx"
		var resxFileName = _ScriptName + "." + cultureInfo + ".resx";
		
		var fileId = _GetFileId( resxFileName);
		if( fileId == null)
			fileId = _GetFileId( defaultResx);
			
		if( fileId == null)
			return null;
			
		var file = nlapiLoadFile( fileId);
		if( file == null)
			return null;
		
		var xml = new XML();
		xml = eval(file.getValue());
		return xml;
	}
} 

