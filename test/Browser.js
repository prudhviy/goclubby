// browser.js JScript Browsers and OS and DOM support.
// Copyright (c) 2000, Projectplace AB, All rights reserved.
// Author Olle Dahlström
//
// Unauthorized reproduction, copying or redistribution of any software
// herein is strictly prohibited.
//
//********************************************************

var True = true;
var False = false;

var bNS 	= false;
var bNS4	= false;
var bNS6	= false;
var bMoz	= false; 
var bMSIE	= false;
var bMSIE5	= false;
var bMSIE6	= false;
var bMSIE7  = false;
var bMSIE8  = false;
var bMSIE9  = false;
var bMSIE4	= false;
var bMSIE55 = false;
var bOpera	= false;  //We treat all Opera browsers as Opera 7(DOM Comp.)
var bDOM	= false;
var bIframe = false;
var isXPSP2 =  false;
var isXPSP1  = false;
var bKonq = bDOM  = (navigator.userAgent.indexOf("Konqueror")!=-1)? true:false
var chrome = (navigator.userAgent.indexOf("Chrome/")!=-1)? true:false
var sBrowser	= navigator.appName.toLowerCase();
var os = navigator.platform.toLowerCase();
var strBrowserAppName = navigator.appName;
var strAppVersion = navigator.appVersion.toLowerCase();
var intMSIEindex = strAppVersion.indexOf("MSIE ");
var sCursor = 'cursor:hand;' //A global cursor variable to be used in a style attribute
var isVista = (navigator.userAgent.indexOf('Windows NT 6') != -1 ? true : false);
var supportsJar = true;

if(sBrowser.indexOf('microsoft')!= -1)
{
	bMSIE = true;
    bDOM   = true;
	if(strAppVersion.indexOf('msie 8') != -1)
    {
        bMSIE8 = true;
        bIframe = true;
    }
	if(strAppVersion.indexOf('msie 9') != -1)
    {
        bMSIE9 = true;
        bIframe = true;
    }
    else if(strAppVersion.indexOf('msie 7') != -1)
    {
        bMSIE7 = true;
        bIframe = true;
    }
    else if(strAppVersion.indexOf('msie 5.5') != -1)
    {
        bMSIE55 = true;
        bIframe = true;
    }
	else if(strAppVersion.indexOf('msie 6') != -1)
	{
		bMSIE6 = true;
		bIframe = true;
		
		if(navigator.userAgent.indexOf("Windows NT 5.1") >-1)
		{
			if(navigator.appMinorVersion && navigator.appMinorVersion.indexOf('SP2') > -1)
				isXPSP2 = true
			if(navigator.appMinorVersion && navigator.appMinorVersion.indexOf('SP1') > -1)
				isXPSP1 = true
		}
	}
    else
	{
	    bMSIE5 = true;
	}
}

if(sBrowser.indexOf('netscape')!= -1)
{
	bNS = true;
    
	if(navigator.userAgent.indexOf("Gecko")!=-1)
	{
		bNS6 = true;
		bDOM = true;
		bIframe = true;
		sCursor = 'cursor:pointer;'
	}
	if(strAppVersion.indexOf('4.') != -1)
	{
	bNS4 = true;
	}
}
if(navigator.userAgent.indexOf("Mozilla")!=-1)
{
    if(navigator.userAgent.indexOf("Gecko")!=-1)
	{
        bMoz = true;
        bDOM = true;
        bIframe = true;
        sCursor = 'cursor:pointer;'
    }
}
if(navigator.userAgent.toLowerCase().indexOf('opera')!= -1)
{
	bOpera = true;
	bDOM = true;		//We treat Opera as Opera 7, the DOM compl. version of Opera.
	bMSIE6 = false;	//Opera can identify itself as MSIE, so we cancel MSIE.
	bMSIE5 = false;
	bMSIE = false;
	bIframe = true;
	sCursor = 'cursor:pointer;'
}

if(os.indexOf('mac') > -1 || os == 'ipad' || os == 'iphone')
{
	supportsJar = false;
}
