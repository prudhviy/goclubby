// Copyright (c) 2005, Projectplace AB, All rights reserved.
// Author  Olle Dahlström
//
// Unauthorized reproduction, copying or redistribution of any software
// herein is strictly prohibited.


// used in checklogin
var startTime = new Date().getTime();
// the length of the cache to live.
var iSecCacheToLive = new Date().getTime();
var aNODETYPES = new Array();//What is the node type, text, or element
aNODETYPES['1'] = 'element'
aNODETYPES['2'] = 'attribute'
aNODETYPES['3'] = 'text'
aNODETYPES['4'] = 'cdata'

var aISCLOSEDELEMENT = new Array(); // Should we add a close tag for the element?true:false. Add more if you need it.
aISCLOSEDELEMENT['div'] = true;
aISCLOSEDELEMENT['span'] = true;
aISCLOSEDELEMENT['img'] = false;
aISCLOSEDELEMENT['a'] = true;
aISCLOSEDELEMENT['td'] = true;
aISCLOSEDELEMENT['tr'] = true;
aISCLOSEDELEMENT['h1'] = true;
aISCLOSEDELEMENT['body'] = true;
aISCLOSEDELEMENT['table'] = true;
aISCLOSEDELEMENT['tbody'] = true;

var regReadyState = {
    Uninitialized: 0,
    Loading: 1,
    Loaded:2,
    Interactive:3,
    Complete: 4
}
var regStatus = {
    OK: 200,
    NoneContent: 204,
    Forbidden: 403,
    NotFound: 404,
    Error: 500,
	ConnectionDead: 0
}
/**
 * ppXMLHTTP - Lets you comunicate with the server through xmlhttps(Ajax)
 * @classDescription Call ppXMLHTTP.loadXML to create the static Ajax object
 * @author Olle Dahlström
 * @version 0.1
 */

var ppXMLHTTP = {
    sIsActive:null,
    req:null,
    loading:false,
    sLeft:0,
    sTop:0,
    sReturnToFunc:null,
    postDataReturn:null,
    runAtInit:null,
    disregardCache:false,
    _bToCache:false,
    _iCacheMaxLength:7,
    _aCache:new Array(),
    sServerPath: null,
    _sContext: null,
    hoverTextClass:'medium',
    /**
     * - Request.object will always be the container, so the var uid must be sett.
     * @param {String} objectID - the id to get from server.[req]
     * @param {DOMObject} obj -  the calling object, a <a>, <div> or something.[Optional]
     * @param {String} context - we specfiy the context of the request. In other words, a reguest to for instance a home object might be done from the startpage or any other page.. [req]
     * @param {String} returnFunc  - Specify an external function that will get the request xml object and the data[string] as arguments.[Optional]
                                - If not specified the ppXMLHTTP will return the data as text in a hover.
     * @param {String} extra - Wanna go to some other op then xmlhttp.[Optional] Example: From the startpage we submit token=[token].
     * @param {boolean} useCache -  Do you want to cache the response we get from the server[Optional]
                                - If true, the next request will not be retrived from the server.
                                    - We have an automatic removal of all cache after aprox 2min,
                                    - or if the number of objects in the cache is more then 7.
     */
    loadXML:function(objectID,obj,context,returnFunc,extra,useCache)
    {
        if(this._checkLogin())
        {
            if(ppXMLHTTP.loading) // Are we waiting for a reponse from the server, do not send another request.
            {
                return false;
            }
            if(returnFunc)
            {
                ppXMLHTTP.sReturnToFunc = returnFunc;
            }
            else
            {
                ppXMLHTTP.sReturnToFunc = null;
            }
            if(useCache || ppXMLHTTP._aCache.length || ppXMLHTTP.disregardCache)
            {
                var iNow = new Date().getTime();
                if(iNow - iSecCacheToLive > 121875) // aprox 2min
                {
                    ppXMLHTTP._clearCache();
                    iSecCacheToLive = new Date().getTime();
                }
                else if((ppXMLHTTP._aCache.length) &&(ppXMLHTTP._aCache.length/2 >= ppXMLHTTP._iCacheMaxLength))
                {
                    ppXMLHTTP._clearCache();
                }
                else if (ppXMLHTTP.disregardCache)
                {
                    ppXMLHTTP._clearCache();
                    ppXMLHTTP.disregardCache = false;
                }
                this._bToCache = useCache;
            }
            if(obj)
            {
                ppXMLHTTP.sLeft = GetAbsoluteLeft(document.getElementById(obj.id))
                ppXMLHTTP.sTop = GetAbsoluteTop(document.getElementById(obj.id))
            }
            ppXMLHTTP.sIsActive = objectID;
            ppXMLHTTP._sContext = context;
            if(window.XMLHttpRequest)
            {
                ppXMLHTTP.req = ppXMLHTTP._createXMLHttp();
                if(!ppXMLHTTP.req)
                {
                    return false;
                }
                ppXMLHTTP.req.onreadystatechange = ppXMLHTTP._showInfo;

                var pathname = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/')+1);
                if(!extra)
                     ppXMLHTTP.sServerPath = pathname+uid+'?op=xmlhttp&id='+objectID+'&context='+ppXMLHTTP._sContext;
                 else
                     ppXMLHTTP.sServerPath = pathname+uid+'?'+extra +'&context='+ppXMLHTTP._sContext;

                if(!ppXMLHTTP._checkInCache(this.sServerPath))
                {
                     ppXMLHTTP.req.open("GET", this.sServerPath, true);
                     ppXMLHTTP.req.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
                     ppXMLHTTP.req.send(null);
                 }
                 else
                 {
                    ppXMLHTTP.req = new ppXMLHTTP.fakeResponse(ppXMLHTTP._checkInCache(this.sServerPath));
                    ppXMLHTTP._showInfo();
                 }
            }
            else if (window.ActiveXObject)
            {
                ppXMLHTTP.req = ppXMLHTTP._createXMLHttp();
                if(!ppXMLHTTP.req)
                {
                    return false;
                }

                if(!extra)
                    ppXMLHTTP.sServerPath = '/pp/pp.cgi/0/'+uid+'?op=xmlhttp&id='+objectID+'&context='+ppXMLHTTP._sContext;
                else
                    ppXMLHTTP.sServerPath = '/pp/pp.cgi/0/'+uid+'?'+extra+'&context='+ppXMLHTTP._sContext;
                if (ppXMLHTTP.req)
                {
                    ppXMLHTTP.req.onreadystatechange = ppXMLHTTP._showInfo;
                    if(!ppXMLHTTP._checkInCache(this.sServerPath))
                    {
                        ppXMLHTTP.req.open("GET", this.sServerPath, true);
                        ppXMLHTTP.req.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
                        ppXMLHTTP.req.send();
                    }
                    else
                    {
                        ppXMLHTTP.req = new ppXMLHTTP.fakeResponse(ppXMLHTTP._checkInCache(this.sServerPath));
                        ppXMLHTTP._showInfo();
                    }
                }
            }
         }
    },
    post: function(iPostTargetID,sPostValue,returnDataToFunc,runtAtLoadFunc)
    {
        if(!ppXMLHTTP._checkLogin() || ppXMLHTTP.loading)
        {
            return false;
        }
        ppXMLHTTP.req = ppXMLHTTP._createXMLHttp();
        if(!ppXMLHTTP.req)
        {
            return false;
        }
        ppXMLHTTP.loading = true;
        if(runtAtLoadFunc)
        {
            ppXMLHTTP.runAtInit = runtAtLoadFunc;
        }
        ppXMLHTTP.sServerPath = '/pp/pp.cgi/0/'+iPostTargetID;

        ppXMLHTTP.postDataReturn = returnDataToFunc;
        sPostValue = ppXMLHTTP._addXSRF(sPostValue);
        ppXMLHTTP.req.open('POST',ppXMLHTTP.sServerPath,true);
        ppXMLHTTP.req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        ppXMLHTTP.req.onreadystatechange = ppXMLHTTP._postReturn;
        ppXMLHTTP.req.send(encodeURI(sPostValue));

    },
    _createXMLHttp: function(bShowErrMsg)
    {
        var oReq = null;
        if(window.XMLHttpRequest)
        {
            oReq = new XMLHttpRequest();
        }
        else if(window.ActiveXObject)
        {
            try
            {
                oReq = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch(e)
            {
                oReq = null;
            }
        }

        if(bShowErrMsg && !oReq) //present a warning message
        {
            if(document.getElementById('ajaxError'))
            {
                document.getElementById('ajaxError').style.display = 'block';
            }
        }
        return oReq;
    },
    _postReturn: function()
    {
        if (ppXMLHTTP.runAtInit)
        {
            eval(ppXMLHTTP.runAtInit+'()');
        }
        ppXMLHTTP.loading = false;
        if (ppXMLHTTP.req && ppXMLHTTP.req.readyState == 4)
        {
             if(ppXMLHTTP.req.status == 200)
             {
                var oXML = ppXMLHTTP.req.responseXML
                var aXML = oXML.getElementsByTagName('*');
                var aXMLData = new Array();
                for(var i = 0; i < aXML.length;i++)
                {
                    if(aXML[i].tagName.toLowerCase() != 'container')
                    {
                      if(aXML[i].parentNode.tagName.toLowerCase() == 'container')
                        aXMLData.push(ppXMLHTTP._returnXMLData(aXML[i]));
                   }
                }
                eval(ppXMLHTTP.postDataReturn+'(aXMLData,oXML)');
             }
            else if(ppXMLHTTP.req.status == 403) // we have an access denied on the server.
            {
                ppXMLHTTP.errorAccess(ppXMLHTTP.req.responseXML,regStatus.Forbidden);
            }
            else
            {
               ppXMLHTTP.errorAccess(ppXMLHTTP.req.responseXML,regStatus.Error);
            }
        }
    },
    _addToCache: function(sURL,oXMLObj)
    {
        if(!ppXMLHTTP._checkInCache(sURL))
        {
            ppXMLHTTP._aCache.push(sURL);
            ppXMLHTTP._aCache.push(oXMLObj);
        }
    },
    _checkInCache: function(sURL)
    {
        if(!ppXMLHTTP._bToCache)
            return false;
        var oReturn = false;
        for(var i = 0; i < ppXMLHTTP._aCache.length; i+=2)
        {
            if(ppXMLHTTP._aCache[i] == sURL)
               return ppXMLHTTP._aCache[i+1];
        }
        return oReturn;
    },
    _clearCache: function()
    {
        ppXMLHTTP._aCache.length = 0;
    },
    fakeResponse: function(oXML) {
        this.readyState = regReadyState.Complete;
        this.status = regStatus.OK;
        this.responseXML = oXML;
    },
    _showInfo: function()
    {
        if (ppXMLHTTP.req && ppXMLHTTP.req.readyState == 4)
        {
            ppXMLHTTP.loading = false;
            if(ppXMLHTTP.req.status == 200)
            {
                if(ppXMLHTTP.sReturnToFunc)// Using external XML parser.
                {
                    var sData = ppXMLHTTP.parseandCreate(ppXMLHTTP.req.responseXML,false);
                    ppXMLHTTP.sServerPath = null; // Release the url
                    eval(ppXMLHTTP.sReturnToFunc+'(ppXMLHTTP.req,sData)');
                }
                else
                  ppXMLHTTP.parseandCreate(ppXMLHTTP.req.responseXML,true);
            }
            else if(ppXMLHTTP.req.status == 403) // we have an access denied on the server.
                ppXMLHTTP.errorAccess(ppXMLHTTP.req.responseXML,regStatus.Forbidden);
           	else if (ppXMLHTTP.req.status != regStatus.ConnectionDead) {
				ppXMLHTTP.errorAccess(ppXMLHTTP.req.responseXML, regStatus.Error);
			}
        }
        else if(!ppXMLHTTP.loading)
        {
            ppXMLHTTP.loading = true;
            ppXMLHTTP.presentWait();
        }
    },
    presentWait: function(sText)
    {
        if(ppXMLHTTP.sReturnToFunc)
            return false
        var showOf = document.getElementById('showOf');
        try
        {
            var sLoadingData = sLoading;
        }
        catch(e){var sLoadingData = '';}

        if(ppXMLHTTP._sContext == 'mm')
            hovertext.specialCSSClass = 'hovertextWhite'
        hovertext.customSizeClass = 'mini'
        hovertext.init('<div>'+sLoadingData+'</div>',showOf,ppXMLHTTP.sLeft,ppXMLHTTP.sTop,1);
    },
    _returnXMLData:function(oXMLObj,bRecursive)
    {
        var dom_str = '';
        function dom_to_string(element)
        {
          var attribs = '';
          if (!element.tagName)
          {
            tempStr = returnNoneSafeGUIString(element.nodeValue);
            // Override parts of the replaceing in returnNoneSafeGUIString
                tempStr = tempStr.replace(new RegExp(">", 'g'), "&gt;")
                tempStr = tempStr.replace(new RegExp("<", 'g'), "&lt;")
            dom_str += tempStr
            return;
          }
          for (var j=0;j<element.attributes.length;j++)
          {
            var att_name = element.attributes[j].nodeName;
            var att_value = element.getAttribute(att_name);
            if (att_value)
            {
              attribs += att_name + '="' + att_value + '" ';
            }
          }
          dom_str += '<' + element.tagName + ' ' + attribs + '>';

          for (var j=0;j<element.childNodes.length;j++)
          {
            dom_to_string(element.childNodes[j]);
          }
          dom_str += '</' + element.tagName + '>';
        }

        dom_to_string(oXMLObj)
        return dom_str
    },
    parseandCreate: function(oXML,bShow)
    {
        var showOf = document.getElementById('showOf');

        var aXML = oXML.getElementsByTagName('*');
        var aXMLData = new Array();
        for(var i = 0; i < aXML.length;i++)
        {
            if(aXML[i].tagName.toLowerCase() != 'container')
            {
              if(aXML[i].parentNode.tagName.toLowerCase() == 'container')
                aXMLData.push(ppXMLHTTP._returnXMLData(aXML[i]));
           }
        }
        if(ppXMLHTTP._bToCache)
            ppXMLHTTP._addToCache(ppXMLHTTP.sServerPath,ppXMLHTTP.req.responseXML);

        ppXMLHTTP.presentWait();

        sXMLData = '';
        ppXMLHTTP.sServerPath = null; // Release the url
        ppXMLHTTP.sIsActive = null;
        for(var i = 0; i < aXMLData.length;i++)
        {
            sXMLData +=aXMLData[i];
        }
        if(!bShow)
            return sXMLData;
        else
        {
            hovertext.customSizeClass = ppXMLHTTP.hoverTextClass;
            ppXMLHTTP.hoverTextClass = 'medium';
            return hovertext.init(sXMLData,showOf,ppXMLHTTP.sLeft,ppXMLHTTP.sTop,null,document.getElementById('textHover'));
        }
    },
    errorAccess:function(oXML,errorType)
    {
        // -- The user does not have access to the requested information.
        // -- I use this special function for presenting the data so we can log more info in the future.
        var showOf = document.getElementById('showOf');
        if(!showOf)
        {
            return '';
        }
        
        var aXMLData = new Array();
        var sXMLData = '';
        if(regStatus.Forbidden == errorType)
        {
            var aXML = oXML.getElementsByTagName('*');
            for(var i = 0; i < aXML.length;i++)
            {
                if(aXML[i].tagName.toLowerCase() != 'container')
                {
                  if(aXML[i].parentNode.tagName.toLowerCase() == 'container')
                    aXMLData.push(ppXMLHTTP._returnXMLData(aXML[i]));
               }
            }
             ppXMLHTTP.presentWait();
            for(var i = 0; i < aXMLData.length;i++)
            {
                sXMLData +=aXMLData[i];
            }
          }
          else if(regStatus.Error == errorType)
          {
                sXMLData = 'Temporary error on the server. Please reload the page.'
          }
          // run hoverinit
          return hovertext.init(sXMLData,showOf,ppXMLHTTP.sLeft,ppXMLHTTP.sTop,null,document.getElementById('textHover'));

    },
    _checkLogin:function()
    {
        var submitTime = new Date().getTime();
        if (submitTime - startTime > 1760000)
        {
            if (submitTime - top.B_LOC.startTime > 1760000)
            {
                    top.B_LOC.location.reload(true);
                    return false;
            }
        }
        return true;
    },
    canAjax: function()
    {
        return (ppXMLHTTP._createXMLHttp(true)?true:false);

    },
    _addXSRF: function(sPostValue)
    {
		if (sPostValue.indexOf('xsrf_token') >= 0) {
			return sPostValue;
		}
        var token = getXSRFToken();
        if (token) {
            sPostValue += '&xsrf_token=' + token;
        }
        else {
            sPostValue += '&xsrf_token=' + 'missing token';
        }
        return sPostValue;
    }
}

function showInfo(callerObj, stringToGet)
{
    ppXMLHTTP.loadXML(objid,null,'get_message_string','presentServerString','op=xmlhttp&string_to_get='+stringToGet);
    var message = '<div class="header">'
            +'<a href="#" title=""><img src="/ppi/HelpClose.gif" onclick="hovertext.close();" alt="" /></a>'
            +'</div>'
            +'<div class="content" id="serverString"></div>'

    var objectLeft = callerObj.style.left;
    var objectTop = callerObj.style.top;

    hovertext.customSizeClass = 'mini';
    hovertext.init(message, callerObj, objectLeft, objectTop)

    var left = callerObj.offsetLeft - 170
    if (left > 0)
    {
        oMainTarget.getElementById('textHover').style.left = left + 'px';
    }

    return false;
}
function _he(e)
{
	alert(e)
}
function presentServerString(xmlObj, xmlString)
{
    document.getElementById('serverString').innerHTML = xmlString;
}

//-- Added the support for push of Arrays. This to make ppXMLHTTP work in IE5.
if(![].push){
  Array.prototype.push = function(i)
  {
    this[this.length]=i
  }
}
