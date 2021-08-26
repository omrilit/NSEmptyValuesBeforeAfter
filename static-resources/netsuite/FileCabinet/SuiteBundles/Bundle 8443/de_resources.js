var ns;
if(!ns) ns={};
if(!(ns.Resources)) ns.Resources={};



//==============================================================================
ns.Resources.ResourceManager = function ResourceManager( resfilename, userLanguage)
{
    var _UserLanguage = userLanguage == null? _GetUserLanguagePreference(): userLanguage;
    var _ResourceFile = resfilename;
    var _FolderId = _GetFolderId( resfilename );  
    var _Resources = [];
    
     
    _LoadResource(_UserLanguage);
    
    
    
    
    
    
    //--------------------------------------------------------------------------
    function _LoadResource( userLanguage)
    {
        if(_Resources[userLanguage] == null)
        {
            var resource = _OpenResourceFile( userLanguage);
            _Resources[userLanguage] = resource;
        }
    }
    
    
    
    //--------------------------------------------------------------------------
    this.GetString = function GetString( string, userLanguage)
    {
        var ci = userLanguage == null? _UserLanguage: userLanguage;
        
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
    this.GetStream = function GetStream( string, userLanguage)
    {
        var ci = userLanguage == null? _UserLanguage: userLanguage;
        
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
    function _GetUserLanguagePreference()
    {
        return nlapiGetContext().getPreference('LANGUAGE');
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
    function _OpenResourceFile( userLanguage )
    {
        
        var defaultResx = _ResourceFile + ".en_US.resx"
        var resxFileName = _ResourceFile + "." + userLanguage + ".resx";
        var fileId = _GetFileId( resxFileName);
        
        if (fileId == null) { fileId = _GetFileId(defaultResx); }

        if (fileId == null) { return null; }
            
        var file = nlapiLoadFile( fileId);
        if (file == null) { return null; }

        var xml = new XML();
        xml = eval(file.getValue());
        return xml;
    }
}