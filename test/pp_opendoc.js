//Globals needed for the plugin
if (supportsJar && bMoz) {
	addOnLoadEvent(sourceMozPluginLoader)
}

function sourceMozPluginLoader()
{
	
	/**
	 * Immediately calls the setting function to call the cookie. If the cookie doesnt exist
	 * top.mozPluginLoaded = false. If the cookie exists it will be set either to true or false
	 * depending on the cookie. 
	 */
	setMozPluginLoadedFromCookie();
	var mozIframe = getMozPluginIframe();
	if (mozIframe)
	{
		mozIframe.src = "jar:https://" + hn + "/secure.jar!/install_check.html";		
	}
	
	// Timeout to allow the jar to do its business completely before setting top.mozPluginLoaded
	setTimeout("setMozPluginLoadedFromCookie()", 2000);	
}

/** 
 * JN: 080702
 * Not good looking - a function which is called from a timeout which finds the cookie
 * and sets top.mozPluginLoaded to the correct value. 
 */
function setMozPluginLoadedFromCookie() {
	var mozPlug = getCookie("plugIsLoaded");

	if (mozPlug == "true") { 
		top.mozPluginLoaded = true;
	} else {
		top.mozPluginLoaded = false;
	}
}

function getCookie(c_name){
	if (document.cookie.length>0)	{
  		c_start=document.cookie.indexOf(c_name + "=");
  		if (c_start!=-1) { 
    		c_start=c_start + c_name.length+1; 
    		c_end=document.cookie.indexOf(";",c_start);
    		if (c_end==-1) c_end=document.cookie.length;
    		return unescape(document.cookie.substring(c_start,c_end));
    	} 
  	}
	return "";
}

/**
 * Returns the iframe where the firfox plugin jar file is loaded or null if
 * this ifram can not be found.
 */
function getMozPluginIframe()
{
	if (top.document.getElementById('mozpluginloader') != null)
	{
		return top.document.getElementById('mozpluginloader');
	}
	else if (document.getElementById('mozpluginloader') != null)
	{
		return document.getElementById('mozpluginloader');
	}
	
	return null;
}

var rightclickMimeTypes = new Array('application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.ms-excel','application/vnd.visio', 'text/html', 'text/htm', 'text/plain');
var BROWSER_MIME_TYPES = new Array('url',
								   'application/x-shockwave-flash',
								   'text/html',
								   'text/htm',
								   'video/quicktime',
								   'application/vnd.rn-realmedia',
								   'application/hta',
								   'svg',
								   'image/svg+xml');
var FALL_BACK_BROWSER_MIME_TYPES = new Array('application/pdf');

t = navigator.mimeTypes;
for (i = 0; i < t.length; i++)
{
    if (t[i].enabledPlugin)
	{		
        FALL_BACK_BROWSER_MIME_TYPES[FALL_BACK_BROWSER_MIME_TYPES.length] = t[i].type;
	}
}
var dndIsLoaded = false;
axversion = false;
if (bMSIE)
{
	try {
		axversion = top.AxCheckInstalledVersion(); //exists in actx.vbs, might not be loaded in top in all situations
	} catch (error) { }
}
if (axversion)
  dndIsLoaded = true;


//Interfaces that are used by the HTML to open documents  
function cgiName()
{
    return 'pp/pp.cgi/'
}

var URL = window.location.protocol+'//'+window.location.host+'/' + cgiName()

function strip_object_id(id)
{
	return (new String(id)).replace(/[^0-9]/g, "");
}

function openDocument(obj_id, winname, mime, axfilestatus)
{
	param = new ownLinkObj(strip_object_id(obj_id),winname,winname,0,mime, axfilestatus);	
	return OD(param,mime);
}

function ownParentElement(id,oname,wname,lock,axfilestatus)
{
  this.id      = id
  this.ONAME   = oname
  this.WNAME   = wname
  this.LOCK    = lock
  this.AXFILESTATUS = axfilestatus
  this.VERSION = ''
  this.getAttribute = _getAttribute
}

function ownLinkObj(id,oname,wname,lock,mime,axfilestatus)
{
  this.id = id
  this.parentElement = new ownParentElement(id,oname,wname,lock,axfilestatus)
  
  this.getAttribute = function(attri){return this[attri]}
  
  switch(mime)
  {
    case 'URL': this.href       = URL +id;
                this.pathname   = 'pp/pp.cgi/'+id;    
                break;
    default:    this.href       = URL + 'd'+id+'/'+escape(wname);
                this.pathname   = 'pp/pp.cgi/d'+id+'/'+wname;
                break;
  }
}


function _getAttribute(attrib)
{
  return eval('this.'+attrib);
}
ownParentElement.prototype.getAttribute = _getAttribute


//Functions used privately for the plugin follows 
//Please do not call them from any HTML files
function isMember(elem, list)
{
	for (var i = 0; i < list.length; i++)
	{
		if (list[i] == elem)
		{
			return true;
		}
	}
	return false;
}

/**
 * Reverse any xss protection escaping applied on a string
 * @param {String} s
 */
function unXSSEscape(s)
{
	return s.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
}

/**
 * Replace Numerical Character References with their unicode character equivalents
 * @param {Object} s
 */
function NCRReplace(s) {
	  return s.replace(/&#([0-9]*);/g, function(s1, s2) { return String.fromCharCode(s2) } );      
}

function ODAX(link)
{
  var p,uid,n,v,l,fs;
  p = link.parentElement;
  uid = p.id;
  n = getPluginFileName(p.getAttribute("WNAME"));    
  v = p.getAttribute("VERSION");
  l = p.getAttribute("LOCK");
  fs = p.getAttribute("AXFILESTATUS");
  if (l == "1") {
    if (!confirm(confirmOpenLock))
        return;
  }
  
  OpenDoc2(uid, n, v, fs);
}

function openDocIE(link, mime)
{
	if(!link.pathname)
	{
		link = link.parentNode;
    }
    //Documents that can be showed in the browser, eg. html,txt and pictures(gif etc.)
    else if (isMember(mime, BROWSER_MIME_TYPES_SAME_DOMAIN)) {
        top.OpenW(link.href, "_blank", null);
    }
    else
	{
        //If mac or not activated ActiveX
        if (isMac || !ODAX(link)) 
		{
            if(hasDavEditDoc(link)){
                //if we get here we have no activex, but we do have EditDoc capability 
                davEditDoc(link); //JAVE currently see actx.js for EditDoc
                return false; 
            }
			if (isMember(mime, rightclickMimeTypes))
			{
				if (link.pathname)
				{			
                	top.OpenW('/pp/pp.cgi/0/1?op=rightclick&link=' + escape(link.pathname), '', "width=400,height=400,menubar=0,toolbar=0,location=0,scrollbars=0,resizable=0");
                }
            }    
            else
			{
				if (link.href)
				{
                	top.OpenW(link.href, "_blank", null);
				}
            }    	
                
        }
    }
    return false;
}

//////////////////////////////////////////////////////////////
// mozilla pplugin wrapper code

function isMozPluginLoaded() {
	var openers = openerPath();
	for (var i = 0; i < openers.length; i++)
	{
		loaded = openers[i].top.mozPluginLoaded;
		if (loaded != undefined)
		{
			return loaded;
		}
	}
	return false;
}

function getPluginFileName(wname)
{
  wname = returnNoneSafeGUIString(wname);
  wname = unXSSEscape(wname);
  wname = NCRReplace(wname);
  return wname; 	
}
function ODMozPlug(link) {
  document.getElementById('mozpluginloader').src = '/domBlank.html'
  var p,uid,n,v,l,fs;
  p = link.parentNode;
  if (!p)
    p = link.parentElement
  uid = p.id;

  n = getPluginFileName(p.getAttribute("WNAME"))
  v = p.getAttribute("VERSION");
  l = p.getAttribute("LOCK");
  fs = p.getAttribute("AXFILESTATUS");
  if (l == "1") {
    if (!confirm(confirmOpenLock))
        return;
  }      
  useSSL = '1';             

  username = GetC('user');
  userid = GetC('uid');
    
  token = GetC('atoken');
  langid = GetC('lang');
  if (!v) { v = "";}
  
  var src = 'jar:https://' + hn +'/secure.jar!/opener.html?servername=' + hn + '&useSSL=' + useSSL + '&username=' + username + '&userid=' + userid + '&docID=' + uid+ '&docname=' + n+ '&token=' + token + '&langid=' + langid + '&fs=' + fs + '&v=' + v;
  document.getElementById('mozpluginloader').src = src;
}

var av = navigator.appVersion;
var isMSIE4 = (av.indexOf('MSIE') != -1);
var isMac = (av.indexOf('Mac') != -1);


/**
 * Opens a document in a suiting way. All document openings should go through this function which will decide, how it
 * should be opened, with the plugin, via webDAV, in the browser in a nother domain etc.
 * @param {Object} link_obj: an a-tag or another element inside an a-tag, e.g. a span.
 * @param {Object} mime: the mime type of the document.
 * @return false (to cancel the event chain)
 */
function OD(link_obj, mime)
{
	if (shouldOpenWithBrowser(mime))
	{
		openWithNewBrowserWindow(link_obj, mime);
	}
    else if(shouldOpenWithProjectplacePlanner(link_obj, mime))
    {
        openWithProjectplacePlanner(link_obj);
    }
	else if (shouldOpenWithXplotPlugin(mime))
	{
		openWithXplotPlugin(link_obj);
	}
	else if (shouldOpenWithPPPlugin(mime))
	{
		openWithPPPlugin(link_obj);
	}
	else if (shouldOpenWithAirPlugin())
	{
		showPopUp(link_obj)
	}
	else if (shouldOpenWithWebDAV(link_obj))
	{
		openWithWebDAV(link_obj);
	}
	else if(shouldOpenInFallBackBrowser(link_obj, mime))
	{
		openWithNewBrowserWindow(link_obj, mime);
	}
	else
	{
		openWithBrowserSaveAs(link_obj);
	}
	return false;
}


function shouldOpenWithAirPlugin(){

	try {	
		//Normal page
		if (window.top.frames.B_DETECT_AIR)
			return window.top.frames.B_DETECT_AIR.docManagerInstalled
			
		//For pop up window's
		if (window.opener){
			return window.opener.top.frames.B_DETECT_AIR.docManagerInstalled
		}
		
		//For pop up windows with frames
		if (window.parent.opener){
			//For portfolio documents from portfolio
			if (window.parent.opener.parent.opener){
				if (window.parent.opener.parent.opener.frames.B_DETECT_AIR){
					return window.parent.opener.parent.opener.frames.B_DETECT_AIR.docManagerInstalled
				}
			}
			return window.parent.opener.top.frames.B_DETECT_AIR.docManagerInstalled
		}
	} catch (error) { }

	return false
}

function getLinkObj(link){
	if(!link.pathname) {
		if (bMSIE)
        {
            link = link.parentElement;
        }
        else
        {
            link = link.parentNode;
        }
	}
	
	return link;
}

function shouldOpenInFallBackBrowser(link_obj, mime)
{
	return isMember(mime, FALL_BACK_BROWSER_MIME_TYPES);	
}

function shouldOpenWithBrowserSaveAs(link, mime)
{
	return link.pathname && isMember(mime, rightclickMimeTypes);
}

function shouldOpenWithProjectplacePlanner(link, mime)
{
	return mime == 'planner/projectplace-planner';
}

function openWithProjectplacePlanner(link_obj) {
	link_obj = getLinkObj(link_obj);
	var versionID = get_link_attribute(link_obj, 'VERSION');
    var params = '?planner=1';
	
    if (versionID) 
    {
        params = params + '&vid=' + versionID;
    }

    //set location to 'yes' to show the url bar; otherwise the url will be shown
	//in the titlebar instead of the plan name and the read-only indicator
	top.OpenW('/' + link_obj.pathname.replace(/^\/?/, "").split(';')[0] + params, '_blank', 
	"width=1024,height=760,toolbar=no, location=yes, directories=no, status=no,"
	+ "menubar=no, scrollbars=no, resizable=yes, copyhistory=no");
}

function openWithBrowserSaveAs(link)
{
	var _href = link.href
    var _pathName = link.pathname
    var version = get_link_attribute(link, 'VERSION');
    if (!_href) {
        if (link.parentElement) {
            _href = link.parentElement.href;
            _pathName = link.parentElement.pathname
        }
        else {
            _href = link.parentNode.href;
            _pathName = link.parentNode.pathname
        }
    }
    
    if (isMSWindows())
	{
        var ver = ''
        if(version)
        {
            ver = '&version='+version;
        }
		top.OpenW('/pp/pp.cgi/0/1?op=rightclick&link=' + escape(_pathName)+ver, '', "width=400,height=400,menubar=0,toolbar=0,location=0,scrollbars=0,resizable=0");
	}
	else
	{
		var pathname = link.pathname.replace(/^\/?/, "");
		document.location.href = document.location.protocol + '//' + document.location.hostname + '/' + pathname + '?save_as=1'
	}
}

function shouldOpenWithPPPlugin(mime)
{
	return getPluginVersion() > 0;
}

function shouldOpenWithWebDAV(link)
{
	if (!isMSWindows() || !bMSIE)
	{
		return false;
	}
	
	var editDocument = null;
    var editDocumentv3 = null;
	var davregexp = /\.(mpp|doc|xls|ppt|docx|xlsx|pptx)x?(\?.+)?$/;
	var supportedFile = !window.davdisablecheck && davregexp.test(link.href.split(';')[0]);
    if (supportedFile)
	{
	    try
		{
	        var editDocumentv3 = new ActiveXObject("SharePoint.OpenDocuments.3"); //we have opendoc v3
	    }
		catch (err) { }

	    try
		{
	        var editDocument = new ActiveXObject("SharePoint.OpenDocuments.2"); //we have opendoc v2
	    }
		catch (err) { }
	} 
	return editDocument != null;
}


function openWithPPPlugin(link)
{
	if (bMSIE)
	{
		ODAX(link);
	}
	else
	{
		ODMozPlug(link);
	}
}

function openWithWebDAVCallback(data, xmlObj)
{
	var document = new ActiveXObject("SharePoint.OpenDocuments.2");
	var documentPath = xmlObj.getElementsByTagName('davUrl')[0].firstChild.nodeValue;
    document.EditDocument(documentPath);
}

function openWithWebDAV(link)
{	
	p = link.parentElement;
	postVal = 'op=webdav_token_generator&doc_id=' + p.id;
	ppXMLHTTP.post(p.id, postVal, 'openWithWebDAVCallback');
}

function shouldOpenWithXplotPlugin(mime)
{
	return bMSIE && top.use_xplot > 0 && (mime == 'application/vnd.hp-hpgl' || mime == 'vector/x-hpgl');
}

/**
 * hplg plotter: use_xplot == 0 -> default actxopen. use_xplot == 1 -> open witj xplot. use_xplot == 2 -> prompt user to use xplot or not
 */
function openWithXplotPlugin(link)
{
	if (top.use_xplot == 1)
	{
		top.OpenW('/pp/pp.cgi/0/1?op=view_xplot&link=' + escape(get_link_attribute(link, 'href')) + '&id=' + get_link_attribute(link, 'id'), "_blank", 'toolbar=0,location=0,scrollbars=1,resizable=1')
	}
	else
	{
		top.OpenW('/pp/pp.cgi/0/'+objid+'?op=use_xplot', '', "width=450,height=280,menubar=0,status=1,toolbar=0,location=0,scrollbars=1,resizable=1")
	}
}

function shouldOpenWithBrowser(mime)
{
	return isMember(mime, BROWSER_MIME_TYPES);	
}

function openWithNewBrowserWindow(link, mime)
{
	var versionID = get_link_attribute(link, 'VERSION');
	var windowsName = get_link_attribute(link, 'WNAME');
	var version = '';
	
	if (versionID) 
	{
		version = '?vid=' + versionID;
	}
	if (mime == 'application/pdf')
	{
		if (version)
		{
			version += '&save_as=1'
		} 
		else
		    version += '?&save_as=1'
	}	
	
	if (mime == 'url') 
	{
		top.OpenW("/pp/pp.cgi/" + get_link_attribute(link, 'id'), "_blank", "");
	}
	else
	{
		top.OpenW("/pp/pp.cgi/d" + get_link_attribute(link, 'id') + "/" + windowsName + version, "_blank", "");
		
	}
}

/**
 * Returns the requested attribute of a an html a-tag. If link_obj does not have the attribute its parent is checked instead.
 * @param {Object} link_obj: an a-tag, or another element inside an a-tag(like a span) or it can be a Javascript object..
 * @param {String} attri: the attribute to check for, like id, href, version
 */
function get_link_attribute(link_obj, attri)
{
	var attriValue = link_obj.getAttribute(attri);
	
	if (typeof attriValue == undefined) 
	{
		return '';
	}
	else if(!attriValue)
	{
		if (link_obj.parentElement)
			attriValue = link_obj.parentElement.getAttribute(attri);
		else
			attriValue = link_obj.parentNode.getAttribute(attri);
	}

	return (attriValue?attriValue:'')
}

/**
 * Creates the iframe needed by the FF plugin if it is not found onload
 */
function addIframeToPage()
{
  if(bMoz && (os.indexOf('win') != -1)){
    if (!document.getElementById('mozpluginloader'))
    {
       		var mozFrame = document.createElement('iframe');
       		mozFrame.name="mozpluginloader"; 
       		mozFrame.id="mozpluginloader";
       		mozFrame.src="/domBlank.html";
       		mozFrame.style.height = '0px';
       		mozFrame.style.width = '0px';
       		mozFrame.style.border = '0';
       		document.getElementsByTagName('body')[0].appendChild(mozFrame);
    }
  }
}
addOnLoadEvent(addIframeToPage)

//Document Manager
var ppObjectLink = null;
var downloadInitiated = false;
var DMCheckBox = 'actionOpen';

/**
 * This method returns the flash object embedded in the document
 * @param movieName {string} - Name for flash movie embedded in html
 * @returns - flash object
 */
function getFlashObjectByName(movieName) {
	
	if (navigator.appName.indexOf("Microsoft") != -1){
		return document.getElementById(movieName)
	}
	else
		return document[movieName]
 }	

/**
 * This function is called from flash file embedded in the Document manager 
 * popup to say that it has finished with loading.
 * Once its loaded we should show the options for downloading the file 
 */
function informJavascript(){
	downloadInitiated = true;
	$("#progressBar").css("display", "none");
	$("#radioOptions").css("display", "block");
	getFlashObjectByName('ppflash').style.zIndex = 0;
}

/**
 * This function is called when user clicks on flash file embedded in the Document Manager popup
 * and called from flash file.
 * This functions hides the options displayed for downloading the document
 */
function onFlashClick(){
	$("#progressBar").css("display", "block");
	$("#radioOptions").css("display", "none");
	getFlashObjectByName('ppflash').style.zIndex = -1;
}

/**
 * THis function is called to show pop up for downloading the document
 * through Document Manager(Air App)
 * @param link {Object} - Document link object which needs to be downloaded
 */
function showPopUp(link){
	var p = link.parentElement;
	if (!p){
		p = link.parentNode
	}
 	var access = p.getAttribute("AXFILESTATUS");
 	var fileName = shortenedName(getPluginFileName(p.getAttribute("WNAME")));  
 	
 	 ppObjectLink = p
	 $("#documentAgent").css("display", "block");
         $("#documentAgent").css("position", "fixed");
	 $('#documentAgent').html('<div style="left: 40%; top: 25%; width:300px;position:fixed;" class="floatWin lightbox-window"><div class="foreground"><div class="header"><h4>' + pp_message('popUpHeadingDA') + '</h4><a href="#" title="Close" onclick="closeDALightbox();return false;" class="close" ><span>Close</span></a></div><div id="lightboxContent" class="content">')
	 var content = '<h2 style="display:none;">' + pp_message('popUpHeadingDA') + '</h2></hr><p>' + fileName + '</p> \n' // PP MESSAGE TEMPORARLY HIDDEN and moved OBS OBS OBS OBS!
	 content += '<div id="progressBar" class="progressBar">\n'
	 content += '<div class="foreground" style="background:url(\'/ppi/2009/layout/bg_loading.gif\') no-repeat scroll center center #EEEEEE !important;"></div></div> \n' 
	 content += '<div id="radioOptions" style="display:none">' 
		 
	 if (access == 'RO'){
		 DMCheckBox = 'actionOpenRead'
		 content += '<div onclick="selectRadioBox(this.childNodes[0])"><input type="radio" value="actionOpenRead" name="checkboxDA" onclick="setCheckBoxValue(this.value)" checked="checked" />' + pp_message('openReadOnlyDA') + '</div> \n' 
	 }
	 else if (access == 'RW'){
		 DMCheckBox = 'actionOpen'
		 content += '<div onclick="selectRadioBox(this.childNodes[0])"><input type="radio" value="actionOpen" onclick="setCheckBoxValue(this.value)" name="checkboxDA" checked="checked" />' + pp_message('openOptionDA') + '</div> \n' 
	 }
	 else{
		 DMCheckBox = 'actionOpen'
		 content += '<div onclick="selectRadioBox(this.childNodes[0])"><input type="radio" value="actionOpen" onclick="setCheckBoxValue(this.value)" name="checkboxDA" checked="checked" />' + pp_message('openOptionDA') + '</div> \n' +
		 			'<div onclick="selectRadioBox(this.childNodes[0])"><input type="radio" value="actionOpenLock" onclick="setCheckBoxValue(this.value)" name="checkboxDA" />' + pp_message('openAndLockOptionDA') + '</div> \n'
	 }
	 
	 content += '<div onclick="selectRadioBox(this.childNodes[0])"><input type="radio" value="actionSave" onclick="setCheckBoxValue(this.value)" name="checkboxDA" />' + pp_message('saveOptionDA') + '</div> \n'
	 content += '</div>' 
	 content += 
			'<div style="float:right; margin-top:10px;"><div style="float:left;position:relative;"><object style="float:left; position:absolute;left:0px;z-index: 99999;" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="ppflash" width="48" height="27"> \n' +
			'<param name="movie" value="/plugin/flash_components/ppflash/bin-debug/ppflash.swf" /> \n' +
			'<param name="wmode" value="opaque" /> \n' +
			'<param name="bgcolor" value="#eaeaea" /> \n' +
			'<embed wmode="opaque" style="position:absolute;left:0px;z-index:-1"  src="/plugin/flash_components/ppflash/bin-debug/ppflash.swf" bgcolor="#eaeaea" \n'+
			'width="48" height="27" name="ppflash" type="application/x-shockwave-flash"> \n'+
			'</embed></object></input>\n' + 
			'<input type="button" style="float:left;" disabled="disabled" id="okButton" value="Ok" onclick="sendInputForDownload();"> \n</div>'+
			'<div style="float:left;"><input type="button" class="button cancel" style="float:left;padding-top:6px;" value="' + pp_message('cancelTextDA') + '" onclick="closeDALightbox()" /></div></div>' 
	 
	 //$('#lightboxContent').html(content)
	 document.getElementById('lightboxContent').innerHTML = content
}

/**
 * THis function is called from flash file on finishing launch of 
 * Document Manager Application.
 * Once Document Manager is launched, a request for downloading the 
 * document is sent Document Manager(Air App) via flash file
 */
function sendDownloadRequest(){
	if (downloadInitiated){
		downloadInitiated = false;
		sendInputForDownload();
	}
}

/**
 * This function returns the shortName for documents with longer name
 * @param fileName
 * @returns shortFile of filename
 */
function shortenedName(fileName){
	
	var MAXLENGTH = 52
	var dotString = "..."
	var index =  fileName.lastIndexOf(".")
	var allowed = MAXLENGTH - (fileName.substring(index).length + dotString.length + 1)
 	return fileName.length>MAXLENGTH? fileName.substring(0, allowed) + dotString +  ' ' + fileName.substring(index): fileName
}

/**
 * Method returns the position of  flash ok button depending on the browser
 * @returns {String}: Position for flash ok button
 */
function getPosition(){
	 var position = '50px';
	 if (navigator.userAgent.indexOf('Safari') != -1)
		 position = '73px';
	 if (navigator.userAgent.indexOf('Chrome') != -1)
		 position = '63px';
	 if (navigator.userAgent.indexOf('Firefox') != -1)
		 position = '64px';
	 
	 return position;
}


function selectRadioBox(inputElement){
	inputElement.checked = true;
	setCheckBoxValue(inputElement.value)
}

/**
 * This methods sets the option choosen by user for downloading the
 * document
 * @param checkBoxValue {string} - Name of radio button
 */
function setCheckBoxValue(checkBoxValue){
    DMCheckBox = checkBoxValue
}

/**
 * This function is used for closing the popup created for
 * downloading the document 
 */
function closeDALightbox(){
	 $("#documentAgent").html('')
	 $("#documentAgent").css("display", "none");
}

/**
 * This function sends the input for dowanloding the document using 
 * Documnent Manager(Air App) via flash object
 */
function sendInputForDownload(){
	  
    var fName = getPluginFileName(ppObjectLink.getAttribute("WNAME"))
    var version = ppObjectLink.getAttribute("VERSION")
    getFlashObjectByName('ppflash').downloadFile(ppObjectLink.id, fName, version, DMCheckBox, GetC("uid"));
    closeDALightbox()
}

/**
 * This function is inlcuded to close the DM popup on press of esc
 */
window.onkeyup = function (event) {
	var docAgentDivObj = $("#documentAgent")
	if (event.keyCode == 27) {
		if ( docAgentDivObj && docAgentDivObj.css("display") == "block"){
			closeDALightbox()
		}
	}
}