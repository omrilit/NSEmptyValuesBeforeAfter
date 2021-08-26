//ResourceMgr is designed to work on server side and client side scripts.
//Be mindful of this when adding new functionality or maintaining code.
var System = System || (new function _System()
{
    //Singleton
    if (this.constructor.prototype.instance != null)
    {
        return this.constructor.prototype.instance;
    }
    this.constructor.prototype.instance = this;


    this.Components = new _Components();
    this.LoadScript = _LoadScript;
    this.DumpInterface = _DumpInterface;
    this.Clone = _Clone;
    this.GetGlobalObject = _GetGlobalObject;





    function _LoadScript(sScript)
    {
        if (sScript == null || sScript == "")
        {
            return undefined;
        }

        //Use annonymous function to eval sScript on global namespace
        return (function() { eval("{" + sScript + "}"); } ());
    }





    function _DumpInterface(obj)
    {
        if (obj == null || typeof obj !== "object")
        {
            return "";
        }

        var s = "";
        for (var i in obj)
        {
            if (typeof obj[i] === "function")
            {
                s += (s === "" ? "" : ",\n") + "\"" + i + "\"";
            }
        }

        return s;
    }





    function _Clone(obj)
    {
        return JSON.parse(JSON.stringify(obj));
    }





    function _GetGlobalObject()
    {
        return (function() { return this; } ());
    }










    function _Components()
    {
        var GLOBAL_OBJECT = function() { return this; } ();

        var _COMPONENTS = {
            "SuiteScript": { Ref: GLOBAL_OBJECT, OrigRef: GLOBAL_OBJECT }
        };

        this.Include = _Include;
        this.Define = _Include;
        this.Undefine = _Undefine;
        this.Use = _Use;



        function _Include(id, component)
        {
            if (id == null)
            {
                throw new Error("Components::Register() - Null component id");
            }

            if (component == null)
            {
                throw new Error("Components::Register() - Null component (" + id + ")");
            }

            _ResetGlobalIdentifier(id, component);

            return component;
        }



        function _Undefine(id)
        {
            _RevertGlobalIdentifier(id);
        }



        function _Use(id)
        {
            if (id == null)
            {
                throw new Error("Components::Use() - Null component id");
            }

            if (_COMPONENTS[id] === undefined)
            {
                throw new Error("Components::Use() - Undefined component [" + id + "]");
            }

            return _COMPONENTS[id].Ref;
        }



        function _ResetGlobalIdentifier(id, component)
        {
            _COMPONENTS[id] = { Ref: component, OrigRef: null };

            if (id in GLOBAL_OBJECT)
            {
                _COMPONENTS[id].OrigRef = GLOBAL_OBJECT[id];
                //GLOBAL_OBJECT[id] = undefined;
            }
        }



        function _RevertGlobalIdentifier(id)
        {
            if (id in _COMPONENTS)
            {
                GLOBAL_OBJECT[id] = _COMPONENTS[id].OrigRef;
                _COMPONENTS[id] = undefined;
            }
        }
    }
});
