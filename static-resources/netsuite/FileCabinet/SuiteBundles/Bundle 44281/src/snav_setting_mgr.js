function SubNav_Config()
{
    //Singleton
    if (this.constructor.prototype.instance != null)
    {
        return this.constructor.prototype.instance;
    }
    this.constructor.prototype.instance = this;
    
    

    //Dependencies
    var SuiteScript = System.Components.Use("SuiteScript");


    
    //Interface
    this.Load = _Load;
    this.SaveSetting = _SaveSetting;
    this.GetSetting = _GetSetting;

    

    //Private
    var SETTING = {
        _ENABLE_LOGO_USE: { Type: "boolean", DefaultValue: true },
        _ENABLE_TOOLTIP_USE: { Type: "boolean", DefaultValue: true },
        LOGO_USE: { Type: "boolean", DefaultValue: true}
    };





    function _Load(userId, roleId)
    {
        var ss = _SearchSettings(userId, roleId);

        var settings = _GetDefault();
        
        for (var i = 0; i < ss.length; ++i)
        {
            settings[ss[i].Name] = ss[i].Value;
        }
        
        return settings;
    }
    
    
    
    
    
    function _GetDefault()
    {
        var settings = {};
        
        for(var i in SETTING)
        {
            settings[i] = SETTING[i].DefaultValue;
        }
        
        return settings;
    }





    function _SaveSetting(userId, roleId, settingId, value)
    {
        if (settingId == null || settingId == "")
        {
            return undefined;
        }

        if (!settingId in SETTING)
        {
            return undefined;
        }

        var isAdminSetting = settingId[0].charAt(0) == "_";
        if (isAdminSetting && !(roleId == 3 || roleId == 18))
        {
            return undefined;
        }

        //Search setting
        var sr = _SearchSetting(userId, roleId, settingId);
        if (sr == null)
        {
            var rec = SuiteScript.nlapiCreateRecord("customrecord_subnav_settings");

            if (!isAdminSetting)
            {
                rec.setFieldValue("custrecord_subnav_setting_userid", userId);
                rec.setFieldValue("custrecord_subnav_setting_roleid", roleId);
            }

            rec.setFieldValue("name", settingId);
            rec.setFieldValue("custrecord_subnav_setting_type", SETTING[settingId].Type);
            rec.setFieldValue("custrecord_subnav_setting_value", value);

            return SuiteScript.nlapiSubmitRecord(rec);
        }


        var recId = sr[0].getId();
        var oldValue = sr[0].getValue("custrecord_subnav_setting_value");

        if (oldValue != value)
        {
            SuiteScript.nlapiSubmitField("customrecord_subnav_settings", recId, "custrecord_subnav_setting_value", value);
        }

        return recId;
    }





    function _GetSetting(userId, roleId, settingId)
    {
        if (settingId == null || settingId == "")
        {
            return undefined;
        }

        if (!settingId in SETTING)
        {
            return undefined;
        }

        var settings = _Load(userId, roleId);

        return settings[settingId];
    }
    
    
    
    
    
    function _SearchSettings(userId, roleId)
    {
        var filters = [
            ["custrecord_subnav_setting_userid", "anyof", [userId, "@NONE@"]],
            "AND",
            ["custrecord_subnav_setting_roleid", "anyof", [roleId, "@NONE@"]]
        ];

        var columns = [
            new SuiteScript.nlobjSearchColumn("name"),
            new SuiteScript.nlobjSearchColumn("custrecord_subnav_setting_value"),
            new SuiteScript.nlobjSearchColumn("custrecord_subnav_setting_type")
        ];

        var sr = SuiteScript.nlapiSearchRecord("customrecord_subnav_settings", null, filters, columns) || [];

        var ss = [];
        for (var i = 0; i < sr.length; ++i)
        {
            var value = undefined;
            var rawValue = sr[i].getValue("custrecord_subnav_setting_value");
            var type = sr[i].getValue("custrecord_subnav_setting_type");
            
            if(type == "boolean")
            {
                value = rawValue == "true";
            }
            else
            {
                value = rawValue;
            }
        
            ss.push({
                Iid: sr[i].getId(),
                Name: sr[i].getValue("name"),
                Value: value
            });
        }

        return ss;
    }
    
    
    
    
    
    function _SearchSetting(userId, roleId, settingId)
    {
        var isAdminSetting = settingId[0].charAt(0) == "_";
    
        var filters = [
            ["custrecord_subnav_setting_userid", "is", isAdminSetting ? "@NONE@" : userId],
            "AND",
            ["custrecord_subnav_setting_roleid", "is", isAdminSetting ? "@NONE@" : roleId],
            "AND",
            ["name", "is", settingId]
        ];

        var columns = [
            new SuiteScript.nlobjSearchColumn("custrecord_subnav_setting_value"),
            new SuiteScript.nlobjSearchColumn("custrecord_subnav_setting_type")
        ];

        return SuiteScript.nlapiSearchRecord("customrecord_subnav_settings", null, filters, columns);
    }
}