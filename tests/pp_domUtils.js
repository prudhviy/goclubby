// Copyright (c) 2005, Projectplace AB, All rights reserved.
// Author  Olle Dahlström
//
// Unauthorized reproduction, copying or redistribution of any software
// herein is strictly prohibited.
//
// H i s t o r y
// 2003-01-23 Olle - Moved pp_popup functions into this file.
// 2003-01-25 Olle - Hade to place all try statments in evals not to crash NS4
// 2003-01-30 Olle - Added registrationWait() for the pleaseWait in the reg.process. To be removed ASP!!!
// 2003-02-20 Olle - Big changes to showEmptyMsg(). Added submit function communicate with server, function submitEmptyMsgStartPage()
// 2003-02-18 Olle - Fix in startme() for infpages.
// 2003-05-21 Olle - Added the var bNoDocumentClick in function PopDOMWin that checks if we should close the popup when the 
//                          user clicks outside of the popup. Default it closes the popup. Now only used in function showEmptyMsg.
// 2003-12-12 Olle - Added - function hovertext to present a PP tooltip. (see function for description)
// 2003-12-18 Olle - Added - function createWindowTabs to create small tabs dynamic.
// 2004-01-02 Olle - Added - function createSettingsPage to create the popup settings page Calls createWindowTabs to get the tabs.
// 2005-09-22 Olle - Added - Functionality to replace the content of a hovertext object instead of creating a new hovertext object.
//
//********************************************************
//Global vars used in pp_domUtils.js

var oMainTarget = null; // The target document object
var started = false; // Used in startMe() to signal if we are moving an object
var mainWindow = null; // The target window object
var id = null; // Used in startMe() to get the unique ID of an obejct
var xObjectOffset = ''; // Used in startMe() to get possition of object
var yObjectOffset = ''; // Used in startMe() to get possition of object
var notParent = false; // A pointer if we shall script to document or another target. Used in showEmptyMsg()
var extraSubmitFunc = null; // An extra submit function used in showEmptyMsg to submit a change to server.
var sendTarget = null; 
var removeObjId = null;
var extraCSSPath = ''; //getCSSSubPath();

function isDefined(v)
{
    return (typeof(v) !== "undefined");
}

function isMSWindows()
{
    return navigator.userAgent.indexOf("Windows") >= 0;
}

function isSafari(){
	return navigator.userAgent.indexOf("Safari") >= 0;
		
}
/*.-.-.-.-.-.-.-.-.-.-.-A dom FRAMSET creator .-.-.-.-.-.-.-.-.-.-.-.-.-.*/
function createFrameSetClass(oTarget,sNoborder,sFrameborder,sFramespacing,sCols)
{
   var oFrameset = oTarget.document.createElement("frameset");
   oFrameset.setAttribute("noborder",sNoborder);
   oFrameset.setAttribute("frameborder",sFrameborder);
   oFrameset.setAttribute("framespacing",sFramespacing);
   oFrameset.setAttribute("cols",sCols);
   return oFrameset;
}
/*.-.-.-.-.-.-.-.-.-.-.-A dom Frame creator .-.-.-.-.-.-.-.-.-.-.-.-.-.*/
function createFrameClass(oTarget,sName,sFrameborder,sFramespacing,sSrc,scrolling) {
   var oFrame = sTarget.document.createElement("frame");
   oFrame.setAttribute("name",sName);
   oFrame.setAttribute("id",sName);
   oFrame.setAttribute("frameborder",sFrameborder);
   oFrame.setAttribute("framespacing",sFramespacing);
   oFrame.setAttribute("src",sSrc);
   oFrame.setAttribute("scrolling",scrolling);
   return oFrame;
}
/*.-.-.-.-.-.-.-.-.-.-.-A dom FORM creator .-.-.-.-.-.-.-.-.-.-.-.-.-.*/
function createFormClass(oTarget,sName,sAction,sMethod) {
   var oForm = oTarget.createElement("form");
   oForm.setAttribute("name",sName);
   oForm.setAttribute("id",sName);
   oForm.setAttribute("action",sAction);
   oForm.setAttribute("method",sMethod);
   return oForm;
}

/*.-.-.-.-.-.-.-.-.-.-.-A dom Input creator .-.-.-.-.-.-.-.-.-.-.-.-.-.*/
function createInputClass(oTarget,sType,sName,sValue)
{
   var oInput = oTarget.createElement("input");
   oInput.setAttribute("type",sType);
   oInput.setAttribute("name",sName);
   oInput.setAttribute("id",sName);
   oInput.setAttribute("value",sValue);
   return oInput;
}

/*.-.-.-.-.-.-.-.-.-.-.-A dom Table creator .-.-.-.-.-.-.-.-.-.-.-.-.-.*/
function createTableClass(oTarget,sId,sWidth,sClass,iBorder,sCellspace,sCellPadd)
{
   var oTable = oTarget.createElement('table');
   oTable.setAttribute('name',sId);
   oTable.setAttribute('id',sId);
   oTable.setAttribute('width',sWidth);
   oTable.className=sClass;
   oTable.setAttribute('border',iBorder);
   oTable.setAttribute('cellSpacing',sCellspace);
   oTable.setAttribute('cellPadding',sCellPadd);
   return oTable;
}
/*.-.-.-.-.-.-.-.-.-.-.-A dom TR creator .-.-.-.-.-.-.-.-.-.-.-.-.-.*/
function createTrClass(oTarget,sId)
{
     var oTr = oTarget.createElement('tr');
     oTr.setAttribute('name',sId);
     oTr.setAttribute('id',sId);
     return oTr;
}
/*.-.-.-.-.-.-.-.-.-.-.-A dom TD creator .-.-.-.-.-.-.-.-.-.-.-.-.-.*/
function createTdClass(oTarget,sId,sClass)
{
   var oTd = oTarget.createElement('td');
   oTd.setAttribute('name',sId);
   oTd.setAttribute('id',sId);
   oTd.className=sClass;
return oTd;
}
/*.-.-.-.-.-.-.-.-.-.-.-A dom TBODY creator .-.-.-.-.-.-.-.-.-.-.-.-.-.*/
function createTBodyClass(oTarget)
{
    var oTBody = oTarget.createElement('tbody');
    return oTBody;
}
/*.-.-.-.-create a floating Div (Used for float windows)-.-.-.-.-.-.-.-.-.-.-.*/
function makeDiv(oTarget,sLeft,sTop,sWidth,sHeight,sCol)
{
  var oDiv = oTarget.createElement("DIV");
  oDiv.style.left = sLeft + "px";
  oDiv.style.position = 'absolute';
  oDiv.style.top = sTop + "px"	;

  if(sWidth)
  {
      oDiv.style.width = sWidth + "px";
  }
  if(sHeight)
  {
      oDiv.style.height = sHeight + "px";
  }  
    
  oDiv.className = sCol;
  
  oDiv.style.zIndex = '100';
  oDiv.style.padding= "0px 0px 0px 0px";

  return oDiv;
}

/**
* getMainTarget
* We should mostly often have a valid oMainTarget. Then this function just returns that.
* But sometimes we don't (like in inf_pages) and then we can make some extra efforts to get the document.
*/
function getMainTarget()
{
    //Feel free to add extra check for specific frames when needed.
    try
    {
        if(frames.p_content) // We are in a inf_page where we do not set the oMainTarget
        {
            return frames.p_content.document;
        }            
    }
    catch (err)
    {
        return oMainTarget;
    }
}

/**
 * Get the absolute left of a single object. 
 * @param {DOMObject} domObject - the DOM Object you what to get the absolute left possition.
 * @return {Integer}    Returns a Integer
 * @author Olle Dahlström 
 * @version 0.1
 */
function GetAbsoluteLeft(domObject) 
{
    var fixBrowserQuirks = true;
      // If a string is passed in instead of an object ref, resolve it
    if (domObject===null) {
      return null;
    }
    
    var left = 0;
    var parentNode = null;
    var offsetParent = null;
  
    
    offsetParent = domObject.offsetParent;
    var originalObject = domObject;
    var el = domObject;
    while (el.parentNode!==null) {
      el = el.parentNode;
      if (el.offsetParent!==null) {
          if (el.scrollLeft && el.scrollLeft>0) 
          {
            left -= el.scrollLeft;
          } 
      }
      if (el == offsetParent) 
      {
        left += domObject.offsetLeft;
        if (el.clientLeft && el.nodeName!="TABLE") 
        { 
          left += el.clientLeft;
        }
        
        domObject = el;
        if (domObject.offsetParent===null) 
        {
          if (domObject.offsetLeft) 
          {
            left += domObject.offsetLeft;
          }
        }
        offsetParent = domObject.offsetParent;
      }
    }
  
    return left;
  }

   /**
   * -Get the absolute top of a single object.
   * @param {DOMObject} domObject - the DOM Object you what to get the absolute top possition.
   * @return {Integer}    Returns a Integer
   * @author Olle Dahlström 
   * @version 0.1
   */
function GetAbsoluteTop(domObject) //Gör om denna så att det är samma funk som räknar ut top/left.. en param in bara.
{
    var left = 0;
    var top = 0;
    var width = 0;
    var height = 0;
    var parentNode = null;
    var offsetParent = null;
 
    offsetParent = domObject.offsetParent;
    var originalObject = domObject;
    var el = domObject; 
    while (el.parentNode!==null) {
      el = el.parentNode;
      if (el.offsetParent!==null) {
          if (el.scrollTop && el.scrollTop>0) 
          {
            top -= el.scrollTop;
          }
      }
      // If this node is also the offsetParent, add on the offsets and reset to the new offsetParent
      if (el == offsetParent) {
        top += domObject.offsetTop;
        if (el.clientTop && el.nodeName!="TABLE") {
          top += el.clientTop;
        }
        domObject = el;
        if (domObject.offsetParent===null) {
          if (domObject.offsetTop) {
            top += domObject.offsetTop;
          }
        }
        offsetParent = domObject.offsetParent;
      }
    }
    return top;
}
 /*.-.--.-.-.-Assigns events to Dom Elements.-.--.-.-.-*/
 function addEvent(obj, evType, fn, useCapture){
  if (obj.addEventListener){
    obj.addEventListener(evType, fn, useCapture);
    return true;
  } else if (obj.attachEvent){
      var r = obj.attachEvent("on"+evType, fn);
    return r;
  }
}

/*.-.--.-.-.-Assigns function calls to the window onload event.-.--.-.-.-*/
function addOnLoadEvent(sFunc)
{
    if(window.addEventListener) {
        window.addEventListener('load', sFunc, false);
    }
    else if(window.attachEvent) {
        window.attachEvent('onload', sFunc);
    }
}

/**
 * returns html code for standard focus windows 
 * @param {document object} oTarget: a copy of the document on which the popup window should be set
 * @param {string} content: html or text displayed as content of the focus window
 * @param {string} title: title text displayed on top of the window
 * @param {string} mode: can be edit, medium, small, defines a.o. size of the focus window
 * @param {string} onCloseHandler: name of function to be called if close button is clicked
 */
function createStandardFocusWindow(oTarget, posLeft, posTop, content, title, mode, windowId)
{
    var standardFocusWin = NewHTMLPopDOMWin(windowId,oTarget,posLeft, posTop, title, false, true, false, mode);
    standardFocusWin.firstChild.appendChild(getContentDiv(oTarget, content))
    return standardFocusWin;
}

function createSlimFocusWindow(oTarget, posLeft, posTop, content, mode, windowId)
{
    var slimFocusWin = NewHTMLPopDOMWin(windowId,oTarget,posLeft, posTop, '', false, true, true, mode);
    slimFocusWin.firstChild.appendChild(getContentDiv(oTarget, content))
    return slimFocusWin;    
}

function getContentDiv(oTarget, content)
{
    var contentDiv = oTarget.createElement('div')
    contentDiv.innerHTML = content
    contentDiv.className = 'content'
    return contentDiv   
}

/**
 * creates new floating window and adds it to current page 
 */
function addFloatingWindowTo(oTargetDoc, xPos, yPos, content, title, mode, divId)
{
  var newDiv = createStandardFocusWindow(oTargetDoc,xPos,yPos, content, title, mode, divId)
  addFloatingWindowToDocument(oTargetDoc, newDiv)
}

function addFloatingWindowToDocument(oTargetDoc, newDiv)
{
  var oldDiv = oTargetDoc.getElementById(newDiv.id)
  body = oTargetDoc.getElementsByTagName('body')
  if (oldDiv)
  {
    oTargetDoc.getElementsByTagName('body').item(0).removeChild(oldDiv)
  }

  oTargetDoc.getElementsByTagName('body').item(0).appendChild(newDiv)   
}

/**
 * Removes childNode from parentNode.
 * @param {HTMLElement} parentNode: the parent of the element that should be removed
 * @param {HTMLElement} childNode: the element to remove
 */
function removeChildNode(parentNode, childNode)
{
    parentNode.removeChild(childNode);
}

 /*
  * PopDOMWin without style tags
  * */
function NewHTMLPopDOMWin(sFirstID,oTarget,sLeft,sTop,text,bFontStyle,bNoDocumentClick, isSlim, mode)
{
    var oContentDiv = makeDiv(oTarget,sLeft,sTop, null, null, 'floatWin ' + mode);
    oContentDiv.setAttribute('id',sFirstID)
    oContentDiv.setAttribute('type','superparent')

    var oBodyDiv = oTarget.createElement('div')
    oBodyDiv.className = 'foreground'
    
    var oHeadingDiv = oTarget.createElement('div')
    oHeadingDiv.className = 'header'
    
  if(bFontStyle)
  {
      var aSplitedText = text.split('__%%__')
      
      if(aSplitedText[1])
      {
        var titleText = oTarget.createTextNode(aSplitedText[0])
        var sIssueName = oTarget.createTextNode(aSplitedText[aSplitedText.length-1])
        var oSpanIssueName = oTarget.createElement('span')
        oSpanIssueName.className = 'mailBackground'
        oSpanIssueName.setAttribute('id','rightHeadingSpan')
        oSpanIssueName.appendChild(sIssueName)
        
        oHeadingDiv.appendChild(titleText)
        oHeadingDiv.appendChild(oSpanIssueName)
    }
    else
    {
        var titleText = oTarget.createTextNode(aSplitedText[0])
        var oSpanIssueName = oTarget.createElement('span')
        oSpanIssueName.className = 'mailBackground'
        oSpanIssueName.setAttribute('id','rightHeadingSpan')
        oSpanIssueName.appendChild(titleText)
        oHeadingDiv.appendChild(oSpanIssueName)
    }  
  }
  else
  {
        var headerTag = oTarget.createElement('h4')
        var titleText = oTarget.createTextNode(text)
        
        oHeadingDiv.appendChild(headerTag)
        headerTag.appendChild(titleText)
  }
  oContentDiv.appendChild(oBodyDiv)
  if(isSlim == false){
    oBodyDiv.appendChild(oHeadingDiv)
  }

  sendTarget =  oTarget
  removeObjId = sFirstID
  if(!bMSIE)
  {
    eval ('try{mainWindow = oTarget.defaultView;}catch(e){}')   
  }
 else
     eval ('try{mainWindow = oTarget.parentWindow; mainWindow.event.cancelBubble=true}catch(e){}')
  if(!bNoDocumentClick)
    addEvent(oTarget,'click',closeWin,true);

  return oContentDiv
}

/*
 * deprecated; can't be removed yet because of popup-calender in tasks views (start-/enddata)
 */
function PopDOMWin(sFirstID,oTarget,sLeft,sTop,sWidth,sHeight,text,bFontStyle,bNoDocumentClick)
{
	
	var oContentDiv = new makeDiv(oTarget,sLeft,sTop,sWidth,sHeight,'popUpBoby')
	oContentDiv.setAttribute('id',sFirstID)
	oContentDiv.setAttribute('className','popUpBoby')
	oContentDiv.setAttribute('type','superparent')
	
	var oHeadingDiv = new makeDiv(oTarget,4,4,sWidth-14,18,'popUptoolBar')
	oHeadingDiv.setAttribute('className','popUptoolBar')
	
	if(bMSIE)
	{
	  if(oMainTarget.parentWindow.event)
	  {
	    oHeadingDiv.style.cursor = 'move'
	    addEvent(oHeadingDiv,'mousedown',startMe,true);
	    addEvent(oHeadingDiv,'mouseup',releaseMe,true);
	    addEvent(oHeadingDiv,'mousemove',moveMe,true);
	  }
	  iBodyWidth = sWidth-8 
	  iBodyHeight = sHeight-34
	}
	else
	{
	    iBodyWidth = sWidth-4   
	    iBodyHeight = sHeight-32
	}
	var oBodyDiv = new makeDiv(oTarget,4,26,iBodyWidth,iBodyHeight,"popUpcontentArea",true)
	if (bMSIE)
	{
	    oBodyDiv.style.width = (parseInt(oBodyDiv.style.width)-4)+"px"
	}
	else
	{
	    oBodyDiv.style.width = (parseInt(oBodyDiv.style.width)-7)+"px"
	}
	oBodyDiv.setAttribute('className','popUpcontentArea')
	  if(bFontStyle)
	  {
	      var aSplitedText = text.split('__%%__')
	  
	  if(aSplitedText[1])
	  {
	    var titleText = oTarget.createTextNode(aSplitedText[0])
	    var sIssueName = oTarget.createTextNode(aSplitedText[aSplitedText.length-1])
	    var oSpanIssueName = oTarget.createElement('span')
	    oSpanIssueName.className = 'mailBackground'
	    oSpanIssueName.setAttribute('id','rightHeadingSpan')
	    oSpanIssueName.style.fontSize = '11px'
	    oSpanIssueName.style.fontStyle = 'italic'
	    oSpanIssueName.style.cursor = 'default'
	    oSpanIssueName.appendChild(sIssueName)
	    
	    oHeadingDiv.appendChild(titleText)
	    oHeadingDiv.appendChild(oSpanIssueName)
	}
	else
	{
	    var titleText = oTarget.createTextNode(aSplitedText[0])
	    var oSpanIssueName = oTarget.createElement('span')
	    oSpanIssueName.className = 'mailBackground'
	    oSpanIssueName.setAttribute('id','rightHeadingSpan')
	    oSpanIssueName.style.fontSize = '11px'
	    oSpanIssueName.style.fontStyle = 'italic'
	    oSpanIssueName.style.cursor = 'default'
	        oSpanIssueName.appendChild(titleText)
	        oHeadingDiv.appendChild(oSpanIssueName)
	    }  
	  }
	  else
	  {
	        var titleText = oTarget.createTextNode(text)
	        oHeadingDiv.appendChild(titleText)
	  }
	  oContentDiv.appendChild(oBodyDiv)
	  oContentDiv.appendChild(oHeadingDiv)
	
	  sendTarget =  oTarget
	  removeObjId = sFirstID
	  if(!bMSIE)
	  {
	    eval ('try{mainWindow = oTarget.defaultView;}catch(e){}')   
	  }
	 else
	     eval ('try{mainWindow = oTarget.parentWindow; mainWindow.event.cancelBubble=true}catch(e){}')
	  if(!bNoDocumentClick)
	    addEvent(oTarget,'click',closeWin,true);
	    
	  moveTipBox(oContentDiv,oTarget)
	  return oContentDiv
}


/*-.-.-.-.-.-.-PopDOMAddCloseX adds a close X button in upper left corner of a PopDOMWin-.-.-.-.-.-.-*/
function PopDOMAddCloseX(oBody)
{
  try
  {
    var sClose = pp_message('close')
  }
  catch(e)
  {
    var sClose = ''
  }
  var cusor ="cursor: pointer; "
  if (bMSIE && (os.indexOf('mac') == -1))
    cusor ="cursor: hand;"
  var iWidth = (parseInt(oBody.style.width)) - 8 + 'px'
  oBody.lastChild.innerHTML += '<div class="" id="emptyMSGHeadingClose" align="left" valign="top" style="padding-right: 0px; padding-left: 0px; z-index: 100; left: '+iWidth+'; top: 0px; padding-bottom: 0px; margin-left: -20px; width: 10px; '+cusor+' padding-top: 0px; position: absolute; height: 10px; background-color: #808080"><img alt="'+sClose+'" title="'+sClose+'" onclick="div=document.getElementById(\''+oBody.id+'\');div.parentNode.removeChild(div);showHideSelects(false);"" src="/ppi/HelpClose.gif" />'
}

/*-.-.-.-.-.-.-DOMWait creates the Please Wait window in W3C DOM created windows-.-.-.-.-.-.-*/
/*-.-.-.-.-.-.-Is called from update(), addObject() and updateCat() -.-.-.-.-.-.-*/
    function DOMWait(oTargetDoc,msg,img)
    {
        if(!oTargetDoc)
            oTargetDoc = oMainTarget
        var pleaseWait = oTargetDoc.getElementById('pleasewait_div')
        if(pleaseWait){
            pleaseParent = pleaseWait.parentNode
            pleaseParent.removeChild(pleaseWait)
        }
    
        var x = (oTargetDoc.body.clientWidth - 150) / 2
        var y = 0
        if(oTargetDoc.body.scrollTop)
            y =  oTargetDoc.body.scrollTop
        y = (oTargetDoc.body.clientHeight / 2) + y 
        if(x <= 0)
            x = 200
        if(y <= 0)
            y = 150
        
        pleaseWaitHTML = '<div class="progressBar">'
            +'<div class="foreground"></div>'
            +'</div>';
        
        var oFloatWindow = new makeDiv(oTargetDoc,x,y,100,50,'')
        oFloatWindow.id = 'pleasewait_div'
        oFloatWindow.innerHTML = pleaseWaitHTML //oFloatWindow.innerHTML + oPleaseImg
        
        
        oTargetDoc.getElementsByTagName('body').item(0).appendChild(oFloatWindow)
        eval('try{ppPossition.posObject(oFloatWindow, oTargetDoc,x,y); }catch(e){}')
    }

/*-.-.-.-.-.-.-closeWin is called from PopDOMWin. Closes the win if click is made outside of object-.-.-.-.-.-.-*/
/*-.-.-.-.-.-.-Due to NS4 not understanding try we have to eval it to another function called _FNS -.-.-.-.-.-.-*/
function closeWin(e)
{
 eval('try{_FNS(e)} catch (e) {}')
}
function _FNS(e)
{
   var found = false
    if(bMSIE)
    {
        oSrcElement = e.srcElement
    }
    else
    {
        oSrcElement = e.target  
    }   

    if(oMainTarget.getElementById(removeObjId) && oMainTarget.getElementById(removeObjId).firstClick)
    {
        if(oSrcElement.tagName !='HTML') // have to have this for Gecko.. Empty page is html and not body(IE)
        {
          while(oSrcElement.tagName!='BODY' && !found)
          {
             if((oSrcElement.tagName != 'DIV') && (oSrcElement.tagName != 'SELECT') && (oSrcElement.tagName != 'INPUT') && (oSrcElement.tagName != 'OPTION') && (oSrcElement.id != 'rightHeadingSpan') && (oSrcElement.id != 'noClose'))
             {
                found = true
                oParent = oMainTarget.getElementById(removeObjId).parentNode
                oParent.removeChild(oMainTarget.getElementById(removeObjId))
                if(oMainTarget.removeEventListener)
                    oMainTarget.removeEventListener('click',closeWin,true)
                else
                    oMainTarget.detachEvent('onclick',closeWin)
                showHideSelects(false);
                if(oMainTarget.getElementById('emptyMsgTD')) // Is here for the empty msg... The div is placed inside a TD, so we move this one up.
                {
                    oMainTarget.getElementById("emptyMsgTD").style.height = 23
                }
             }
             else
              oSrcElement =   oSrcElement.parentNode
           }
          }
    }
    else if(oMainTarget.getElementById(removeObjId))
    {
         oMainTarget.getElementById(removeObjId).firstClick = true
    }
}

/*-.-.-.-.-.-.-Starts the drag event if window-.-.-.-.-.-.-*/

function startMe() // Fix the NS6 movement...
{
started = true;

if(!notParent)
{
    if(!oMainTarget) 
    {   
        //This runs it the global var oMainTarget is Null
        //Feel free to add extra check for specific frames when needed.
        if(document.frames.p_content) // We are in a inf_page where we do not set the oMainTarget
            //TODO: This is probably never used. Should be removed. PEZ 070604
            oMainTarget  = document.frames.p_content.document
        else
            return false
    }
    
    var oTargetDoc = oMainTarget
    var oTargetWindow = oTargetDoc.parentWindow
    id = oMainTarget.parentWindow.event.srcElement.uniqueID
    
}
else
{
    var oTargetDoc = document
    var oTargetWindow = window
    oMainTarget = oTargetDoc
    id = window.event.srcElement.uniqueID
}
oObject = oTargetDoc.getElementById(id);

  if(bMSIE)
  {  
   var tempObj = oObject;
   var bFound = false;
    if(tempObj.tagName !='HTML')
    {
      while(tempObj.tagName!='BODY' && !bFound)
      {
       if(tempObj.type && tempObj.type.toLowerCase() == 'superparent')
         bFound    =   true
       else
         tempObj =   tempObj.parentNode
       }
    }

    xObjectOffset = oTargetWindow.event.clientX - GetAbsoluteLeft(tempObj);
    yObjectOffset = oTargetWindow.event.clientY - GetAbsoluteTop(tempObj);
    
    oObject.setCapture()
  }
}

/*-.-.-.-.-.-.-Moves the window after start-.-.-.-.-.-.-*/
function moveMe() // And fix the NS6 movement...
{
  var bChildren = '';
  if(started)
  {
    oObject = oMainTarget.getElementById(id);
    var found = false;
    if(oObject)
    {
        if(oObject.tagName !='HTML')
        {
          while(oObject.tagName!='BODY' && !found)
          {
           if(oObject.type && oObject.type.toLowerCase() == 'superparent')
             found    =   true
           else
             oObject =   oObject.parentNode
           }
        }
        
         oObject.style.left = (oMainTarget.parentWindow.event.x - xObjectOffset) + 'px';
         oObject.style.top = (oMainTarget.parentWindow.event.y - yObjectOffset) + 'px';
         oObject.style.zIndex = 2000
    }
  }
}
/*-.-.-.-.-.-.-Releases the drag window -.-.-.-.-.-.-*/
    function releaseMe() //And fix the NS6 movement...
    {
        started = false;
        oObject = oMainTarget.getElementById(id);
        if(bMSIE && oObject)
        {
            oObject.releaseCapture()
            var bChildren = oObject.hasChildNodes()
            if(bChildren)
            {
             if(oObject.parentNode && oObject.parentNode.type)
             {
                  if(oObject.parentNode.type.toLowerCase() == 'superparent')
                       oObject.parentNode.style.zIndex = 0
             }
            }
            else
            {
             oObject.style.zIndex = 0
            }
        }
    }
    
/*-.-.-.-.-.-.- Creates "empty" msg box (See I&I) -.-.-.-.-.-.-*/
//wwwooooho... The bIsWarning is a really ugly hack to make a warning instead of a tip!!!
    function showEmptyMsg(oTargetWin, bPrint,objectClicked,sText, tipsHeading,useParent,extraHight,extraWidth,bIsWarning)
    {
        notParent = useParent
         // var closeButtonText. set this var in the document object(now used in central.html) if you need a string from the server
        
       if(!bIsWarning)
       {
        var imgSrc = 'src="/ppi/lamp_999999.gif"';
        eval("try{var PPmessage =  'no_objects_'+extraInfo; var sMessage = pp_message(PPmessage);var tip_heading = pp_message('tip_'+extraInfo);var sClose = pp_message('close');}catch(e){ var sMessage =unescape(sText);var tip_heading = tipsHeading;var sClose = closeButtonText;}")
       }
       else
       {
            var imgSrc = 'src="/ppi/info_s.gif"';
            var tip_heading = tipsHeading;
            var sMessage =unescape(sText);
            try
            {
                var sClose = pp_message('close')
            }
            catch(e)
            {
                var sClose = closeButtonText
            }
       }
       if (!oTargetWin)
       {
            oTargetDoc = oMainTarget
       }
       else
       {
            oTargetDoc = oTargetWin.document
            oMainTarget = oTargetDoc
        }
       if(oTargetDoc.getElementById('emptyMSG'))
       {
            oTargetDoc.getElementById('emptyMSG').parentNode.removeChild(oTargetDoc.getElementById('emptyMSG'))
        }
       eval('try{var x = (oTargetDoc.body.clientWidth/2)-250; } catch(e){var x = 325}')

        if(!objectClicked || oTargetDoc.getElementById('emptyMsgTD'))
        {
            var y = 35
            padding = 'padding-top: 5px;'
            eval('try{oTargetDoc.getElementById("emptyMsgTD").style.height = "260px"} catch(e){}')
        }
        else
       {
            var y = GetAbsoluteTop(objectClicked) - 40            
            padding = 'padding-top: 15px;'
         }

        if(bMSIE && (os.indexOf('mac') == -1))
        {
            sHeight = '155px'
            cusor ="cursor: hand;"
            moveCursor = "cursor: move;"
            if(!notParent)
                eventHandl = 'onmousedown="parent.startMe();" onmouseup="parent.releaseMe();" onmousemove="parent.moveMe();"'
            else
                eventHandl = 'onmousedown="startMe(notParent);" onmouseup="releaseMe(notParent);" onmousemove="moveMe(notParent);"'
            
            headingPos = 'cursor:default; position:absolute; top:2'
            
        }
        else
        {
            sHeight = '255px'
            cusor ="cursor: pointer; "
            moveCursor = "cursor: default; "
            eventHandl = ''
            headingPos = 'cursor:default; position:absolute; top:2; left:20px'
         }
        if(!bIsWarning)
       {
            eval("try{sHeading = pp_message('tip')+' - '+tip_heading    }catch(e){  sHeading =tip_heading}")
        }
        else
        {
            sHeading = tip_heading
        }
    //Set height for the tip
        if(extraHight)
            floatHeight = extraHight + 235
        else
            floatHeight = 235

    //Set width for the tip
        if(extraWidth)
            floatWidth = extraWidth + 480
        else
            floatWidth = 480

        var oFloatWindow = new PopDOMWin('emptyMSG',oTargetDoc,10,100,floatWidth,floatHeight, sHeading,true,true)
        oFloatWindow.style.position = 'absolute'
        oFloatWindow.style.left = x +'px'
        oFloatWindow.style.top = y +'px'
        oFloatWindow.firstChild.style.fontSize = '10px'
        oFloatWindow.firstChild.innerHTML = sMessage
        
        if(!notParent)
            sOnClick = 'onclick="parent.closeInfoText(this);'+extraSubmitFunc+'" '
        else
            sOnClick = 'onclick="closeInfoText(this,true);'+extraSubmitFunc+'"'
        
        oFloatWindow.firstChild.innerHTML = oFloatWindow.firstChild.innerHTML + '<div align="right"><input id="close" type="button" '+sOnClick+' value="'+sClose+'"></div>'
        oFloatWindow.firstChild.className = 'tipInnerText'      
        if(bMSIE)
            var iWidth = (parseInt(oFloatWindow.style.width)) - 2 + 'px'
        else
            var iWidth = (parseInt(oFloatWindow.style.width) -4)+ 'px'

        oFloatWindow.style.backgroundColor = '#ffffff'
        oFloatWindow.style.borderTop = '1px solid black'
        oFloatWindow.style.borderLeft = '1px solid black'
        oFloatWindow.style.borderRight = '1px solid black'
        oFloatWindow.style.borderBottom = '1px solid black'
        oFloatWindow.style.filter  = "progid:DXImageTransform.Microsoft.dropshadow(OffX=5, OffY=5, Color='gray', Positive='true')"
        
        oFloatWindow.lastChild.childNodes[0].className = ''
        oFloatWindow.lastChild.childNodes[0].style.color = '#FFF'
        oFloatWindow.lastChild.childNodes[0].style.fontSize = '11px'
        oFloatWindow.lastChild.childNodes[0].style.fontStyle = 'normal'
        if(bMSIE)
        {
            topValue = '-1px'
        }
        else
        {
            topValue = '0'
        }
        oFloatWindow.lastChild.innerHTML = '<img '+imgSrc+' style="vertical-align:middle;cursor:default; position:relative; top:'+topValue+'; margin-top:0px; margin-right:3px; margin-left:5px;" alt="" />'+oFloatWindow.lastChild.innerHTML
        oFloatWindow.lastChild.innerHTML = oFloatWindow.lastChild.innerHTML + '<div class="" id="emptyMSGHeadingClose" align="left" style="padding-right: 0px; padding-left: 0px; z-index: 100; left: '+iWidth+'; padding-bottom: 0px; margin-left: -20px; width: 10px; '+cusor+' padding-top: 0px; position: absolute; top: 3px; height: 10px; background-color: #808080"><img alt="'+sClose+'" title="'+sClose+'" '+sOnClick+' src="/ppi/HelpClose.gif" />'
        
        oFloatWindow.lastChild.className = 'dirText'
        oFloatWindow.lastChild.style.backgroundColor = '#999999'
        oFloatWindow.lastChild.style.color = '#ffffff'
        oFloatWindow.lastChild.style.paddingRight = '0px'
        oFloatWindow.lastChild.style.paddingLeft = '0px'
        oFloatWindow.lastChild.style.width = iWidth 

        oFloatWindow.lastChild.style.left = '0px'
        oFloatWindow.lastChild.style.paddingTop = '0px'
        oFloatWindow.lastChild.style.top = '0px'
        oFloatWindow.lastChild.style.paddingBottom = '0px'
        oFloatWindow.lastChild.style.marginTop = '0px'

        oFloatWindow.lastChild.style.paddingRight = '5px'
        oFloatWindow.lastChild.style.borderBottom = '1px solid black'

         if(bPrint) // bPrint is a var that tells the function to print it direct to a page and not return a object.
        {
              oTargetDoc.getElementsByTagName('body').item(0).appendChild(oFloatWindow)
              tempObj = oFloatWindow;
              tempTargetDoc = oTargetDoc;
              setTimeout('moveTipBox(tempObj,tempTargetDoc);',10);  
        }
        else
        {
                moveTipBox(oFloatWindow,oTargetDoc)
                return oFloatWindow
        }
    }
    /*
        Another nice MSIE bug!
        ----
        To make IE draw the borders on the tip/info box right, 
        we need to move it one pix after creation.  Olle
        ----
    */
    var tempObj = null; // used in moveTipBox
    var tempTargetDoc = null;// used in moveTipBox
    function moveTipBox(obj,oTargetDoc)
    {
        if(bMSIE)
        {
            if(oTargetDoc.getElementById(obj.id) != null)
            {
                obj.style.left = parseInt(obj.style.left)-1 +"px"
            }
            else
            {
                tempObj = obj;
                tempTargetDoc = oTargetDoc;
                setTimeout('moveTipBox(tempObj,tempTargetDoc);',10);            
            }
        }
    }
    /**
    * will fix the white page problems that can happen in xhtml/css based pages.
    * @param {DomObject} targetDocumentObject
    */
    function fixWhitePage(targetDocumentObject)
    {
        var obj = targetDocumentObject.getElementsByTagName('body')[0]
        return forceReLayouting(obj);
    }
    
    /**
     * we force the browser, IE7 for the most, to re-render a DoM element;
     * this is for cases where we experience that elements are not rendered 
     * with the correct style before the user triggers the rendering himself 
     * (e.g. by re-sizing the window, by hovering over an object, or similar)
     * @param {Object} domObject - fetched by e.g. document.getElementByID
     */
    function forceReLayouting(domObject)
    {
        var orgWidthgValue = domObject.style.width;
        domObject.style.width = orgWidthgValue + 1 + 'px';
        domObject.style.width = orgWidthgValue;
        return false;
    }
    
    function checkTempCookie(sCheckString)
    {
    var result = ''
        if (top.document.cookie.search(sCheckString)!= -1)
        {
            begin   = top.document.cookie.indexOf(sCheckString)
            begin  += sCheckString.length + 1
            end    = top.document.cookie.indexOf(";",begin)
            if (end == -1)
              end = top.document.cookie.length
            result = unescape (top.document.cookie.substring(begin,end))
            return result
        }
        else
            return result
    }
/*-.-.-.-.-.-.- Closes the empty text from the top right icon (X) or an input.  -.-.-.-.-.-.-*/
    function closeInfoText(objectID, notParent)
    {
        if(!notParent)
        {
            if(oMainTarget)
                oTargetDoc = oMainTarget;
            else
                oTargetDoc = frames.mainpage.document
        }
        else
            oTargetDoc = document
         oTargetDoc.getElementById("popUpBoby")
         oTargetDoc.onclick = ''
         oTargetDoc.getElementById("emptyMSG").parentNode.removeChild(oTargetDoc.getElementById("emptyMSG"));
         emptyTextClose = true;
         if(oTargetDoc.getElementById('emptyMsgTD'))
         {
             oTargetDoc.getElementById("emptyMsgTD").style.height = '23px'
          }

    }

try
 {
 	bDOM = bDOM;
 }
 catch(e){bDOM = true;}
//old pp_popup functions moved into this file (pp_domUtils)

if (NETSCAPE == null)
    var NETSCAPE = (navigator.appName == 'Netscape' && !bDOM)?1:0; // we can not remove this.. 
                                                                                                //Since we use this var at so many places.. 
                                                                                                // Now only used for NS 4
var mainWindow, ppObjectID = null 
var ProjectplaceInt = {} // The namespace
var pp = ProjectplaceInt // Namespace reference var
pp.pp_popup = {
    size:'medium',
    init: function(id,win)
    {
        if(!win)
        {
            mainWindow = window
            winDoc = document
        }
        else
        {           
            mainWindow = win
            winDoc = win.document
        }
        
        this.moveTo = pp.pp_popup.ie_moveTo
        this.setText = pp.pp_popup.setText
        this.setXY = pp.pp_popup.setXY
        this.show = pp.pp_popup.show
        this.hide = pp.pp_popup.hide
        this.setKey = pp.pp_popup.setKey
        this.clickEvent = pp.pp_popup.clickEvent
        this.checkObject = pp.pp_popup.checkObject
        this.original_mouse_event = null
        this.id = id
        
        this.targetWinDoc = winDoc
        
        ppObjectID = id
        
        if(winDoc.createElement)
        {
            oDiv = winDoc.createElement('div') //This we need to change into a string (the name of the object, instead of the object)
            oDiv.setAttribute('id', id)
            oDiv.style.position ='absolute'
            oDiv.style.zIndex = '200'
            oDiv.style.visibility= 'hidden' // have to use visibility instead of display to be able to count offsetWidth on a hidden object in show().
            oDiv.className = 'floatWin'
            if(winDoc)
            {
                winDoc.private_descrobj    =  this
            }
            this.DOMObj = oDiv
        }
    },
    ie_moveTo: function(x,y)
    {   
        //NOT USED
        if(this.checkObject())
            return false;
    },
    setText : function(text)
    {
        this.DOMObj.className = 'floatWin '+pp.pp_popup.size
        if(this.checkObject())
        {
            this.DOMObj.innerHTML = '<div class="foreground" id="foreground">'+text+'</div>';
        }
    },
    setXY: function(x,y)
    {
        if(this.checkObject())
        {
            this.DOMObj.style.left = x+'px'
            this.DOMObj.style.top = y+'px'
        }
    },
    show: function()
    {
        if(this.checkObject())
        {
            winDoc = this.targetWinDoc
            id = this.id
            if(!winDoc.getElementById(id))
            {
                if(winDoc.getElementsByTagName("body").item(0))
                    winDoc.getElementsByTagName("body").item(0).appendChild(this.DOMObj)
                else
                { //the page is reloading, so we can not access the object
                    return false;
                }
            }
            this.original_mouse_event   = winDoc.onclick
            ppPossition.posObject(this.DOMObj, this.targetWinDoc) // function to set the X & Y of the object
            this.DOMObj.style.visibility  =  'visible'
            
            if(winDoc.attachEvent)
            {
                eval ('try{mainWindow.event.cancelBubble=true}catch(e){}')
                winDoc.onclick  = this.clickEvent
            }
            else if(winDoc.addEventListener)
                winDoc.addEventListener("click",this.clickEvent,true); 
        }
    },
    hide: function(e)
    {
        if(this.checkObject())
        {
            this.DOMObj.style.visibility= 'hidden'
        
            if(this.targetWinDoc.removeEventListener)
                this.targetWinDoc.removeEventListener("click",this.clickEvent,true)
            else
                this.targetWinDoc.onclick = this.original_mouse_event
            
            this.DOMObj.style.left = 1
            this.DOMObj.style.top = 1
        }
    },
    clickEvent: function(e)
    {
        var found = false
        if(e)
        {
            oSrcElement = e.target  
        }
        else
        {
            oSrcElement = mainWindow.event.srcElement
        }   
      if(oSrcElement.tagName !='HTML') // have to have this for Gecko.. Empty page is html and not body(IE)
      {
        while(oSrcElement.tagName!='BODY' && !found)
        {
         if(oSrcElement.id == ppObjectID)
           found    =   true
         else
           oSrcElement =   oSrcElement.parentNode
         }
      }
      
      if(!found)
        return mainWindow.document.private_descrobj.hide(e)
      else
        return true     
    },
    setKey: function(template,key,value)
    {
        str  = template
        re   = new RegExp('\\%\\('+key+'\\)s','g')
        return (str.replace(re,value))
    },
    pleaseWait: function(msg)
    {
        if(!mainWindow)
            windDoc = oMainTarget
        else
            windDoc = mainWindow.document
        if(!bDOM)
            return pp.pp_popup.registrationWait(msg)
        if(DOMWait)
        {
            if(msg)
                DOMWait(windDoc,msg)
            else
                DOMWait(windDoc)
        }           
    },
    pleaseWaitClose: function()
    {
        if(!mainWindow)
            windDoc = oMainTarget
        else
            windDoc = mainWindow.document
        var Wait = windDoc.getElementById('pleasewait_div')
        if(Wait){
            WaitParent = Wait.parentNode
            WaitParent.removeChild(Wait)
        }
    },
    checkObject: function() // this check is done for NS on Mac. 
    {                               //The document is offen not loaded, so in the init the object is not appended to the document object
        if(bDOM)
        {
            winDoc = this.targetWinDoc
            if(!winDoc.private_descrobj)
                winDoc.private_descrobj    =  this
            return winDoc.private_descrobj
        }
        else
            return false
    },
    registrationWait: function(msg) // TO BE REMOVED as soon as possible... Only here for the Mikaels registration process!! 
    {
        if(!msg)
            msg = ''        
        obj = new Layer(1,mainWindow);  
        obj.document.write('<div id="pleasewait_div"><div align="center" class="popUpBoby"><div class="popUptoolBar" style="padding-top:3px; ">'+ msg + '</div><div style="padding-bottom:13px;"><img src="/ppi/hourglass.gif" hspace="0" vspace="20" border="0" align="center"></div></div></div>')
        obj.document.close()
        obj.moveTo(((window.innerWidth - 150) / 2),300)
        obj.visibility    =  'show'
    }
}

pp_popup = pp.pp_popup.init
pleaseWait = pp.pp_popup.pleaseWait
pleaseWaitClose = pp.pp_popup.pleaseWaitClose


/**
 * Positions and element (sObjToPositionID) relative to another element (sRelativeObjID).
 * Tries to position the under and to the right of the relative element, leaving (minRightMargin)
 * pixels between the object and the left window border. If there's not enough space to the right
 * of the relative object it is moved to the left. If there's not enough space to under the relative
 * object it tries to move it on top of the relative element.
 * Note: oMainTarget must be set!
 * 
 * @param {string} sObjToPositionID
 * @param {string} sRelativeObjID
 * @param {int} minRightMargin
 * @param {boolean} fixWhitePage
 */
function autoPosition(sObjToPositionID, sRelativeObjID, minRightMargin, fixWhitePage)
{
    horizontalAutoPosition(sObjToPositionID, sRelativeObjID, minRightMargin, fixWhitePage);
    verticalAutoPosition(sObjToPositionID, sRelativeObjID, fixWhitePage);
    return false;
}

/**
 * Same as autoPosition but only does the vertical part.
 */
function verticalAutoPosition(sObjToPositionID, sRelativeObjID, fix)
{
	var objTop = GetAbsoluteTop(oMainTarget.getElementById(sObjToPositionID));
    var objHeight = oMainTarget.getElementById(sObjToPositionID).offsetHeight;
    
    var relTop = GetAbsoluteTop(oMainTarget.getElementById(sRelativeObjID));
    var relHeight = oMainTarget.getElementById(sRelativeObjID).offsetHeight;
    
    var canBePlacedUnder = relTop + relHeight + objHeight <= getScrollY() + getWindowHeight();
    var canBePlacedOver = relTop - objHeight >= getScrollY() && relTop - objHeight > 0;
    
	if (canBePlacedUnder || !canBePlacedOver)
    {
        oMainTarget.getElementById(sObjToPositionID).style.top = (relTop + relHeight)+ 'px';
    }
    else
    {
        oMainTarget.getElementById(sObjToPositionID).style.top = (relTop - objHeight) + 'px';
    }
	oMainTarget.getElementById(sObjToPositionID).style.position = 'absolute';
    if (bMSIE && fix) {
        fixWhitePage(oMainTarget);
    }
    return false;
}

/**
 * Same as autoPosition but only does the horizontal part.
 */
function horizontalAutoPosition(sObjToPositionID, sRelativeObjID, minRightMargin, fix)
{
	if(!minRightMargin) minRightMargin = 0;
	
	var objLeft = GetAbsoluteLeft(oMainTarget.getElementById(sObjToPositionID));
    var objWidth = oMainTarget.getElementById(sObjToPositionID).offsetWidth;
    
    var relLeft = GetAbsoluteLeft(oMainTarget.getElementById(sRelativeObjID));
    var relWidth = oMainTarget.getElementById(sRelativeObjID).offsetWidth;
	
	var rightMargin = (getScrollX() + getWindowWidth() - minRightMargin) - (relLeft + objWidth);
    var leftMargin = relLeft - getScrollX();
    
    var slideToLeft = (rightMargin < 0 ? (-1) * rightMargin : 0);
    if (slideToLeft > leftMargin) slideToLeft = leftMargin;
    
	oMainTarget.getElementById(sObjToPositionID).style.left = (relLeft - slideToLeft) +'px';
	oMainTarget.getElementById(sObjToPositionID).style.position = 'absolute';
    if (bMSIE && fix) {
        fixWhitePage(oMainTarget);
    }
    return false;
}

/**
 * Returns the y scroll position of the oMainTarget frame or window.
 * Note: oMainTarget must be set!
 */
function getScrollY()
{
    if (oMainTarget.body && (oMainTarget.body.scrollLeft || oMainTarget.body.scrollTop)) //DOM compliant
	{
        return oMainTarget.body.scrollTop;
    }
	else if (oMainTarget.documentElement && (oMainTarget.documentElement.scrollLeft || oMainTarget.documentElement.scrollTop)) //IE6 standards compliant mode
	{
        return oMainTarget.documentElement.scrollTop;
    }
    
	return 0;	
}

/**
 * Returns the x scroll position of the oMainTarget frame or window.
 * Note: oMainTarget must be set!
 */
function getScrollX()
{
    if (oMainTarget.body && (oMainTarget.body.scrollLeft || oMainTarget.body.scrollTop)) //DOM compliant
    {
        return oMainTarget.body.scrollLeft;
    }
    else if (oMainTarget.documentElement && (oMainTarget.documentElement.scrollLeft || oMainTarget.documentElement.scrollTop)) //IE6 standards compliant mode
    {
        return oMainTarget.documentElement.scrollLeft;
    }
    
    return 0;
}

/**
 * Returns the height of the window.
 * Note: oMainTarget must be set!
 */
function getWindowHeight()
{
    if (typeof(window.innerWidth) == 'number') //Non-IE
    {
        return window.innerHeight;
    }
    else if (oMainTarget.documentElement && (oMainTarget.documentElement.clientWidth || oMainTarget.documentElement.clientHeight)) //IE 6+ in 'standards compliant mode'
    {
        return oMainTarget.documentElement.clientHeight;
    }
    else if (oMainTarget.body && (oMainTarget.body.clientWidth || oMainTarget.body.clientHeight)) //IE 4 compatible
    {
        return oMainTarget.body.clientHeight;
    }
}

/**
 * Returns the width of the window.
 * Note: oMainTarget must be set!
 */
function getWindowWidth()
{
	if (typeof(window.innerWidth) == 'number') //Non-IE
    {
        return window.innerWidth;
    }
    else if (oMainTarget.documentElement && (oMainTarget.documentElement.clientWidth || oMainTarget.documentElement.clientHeight)) //IE 6+ in 'standards compliant mode'
    {
        return oMainTarget.documentElement.clientWidth;
    }
    else if (oMainTarget.body && (oMainTarget.body.clientWidth || oMainTarget.body.clientHeight)) //IE 4 compatible
    {
        return oMainTarget.body.clientWidth;
    }
}

function closePopupCal()
{           
    popObj = oMainTarget.getElementById('popcal_' + mainWindow.currentID)
    if (popObj)
        oMainTarget.getElementsByTagName('body').item(0).removeChild(popObj)        

}

function moveCallPopUpBottom(textId)
{
    var popObj = oMainTarget.getElementById('popcal_' + mainWindow.currentID)
    var iTop = GetAbsoluteTop(oMainTarget.getElementById(textId)) + 20;
    popObj.style.top = iTop + 'px';       
}

/*
External Class(object) used to sett X & Y relative to the documents top and left
Now used from: 
    ProjectplaceInt.pp_popup (this file)
    menuDisplay (this file)
Can also be called from other functions:
    Set the vars:
    objectToCheckAndMove = DOMobject
    theDocumentObject = DOMobject
    moveTheObjectToX = string or Int (optional) / will be parsed through parseInt()
    moveTheObjectToY = string or Int (optional) / will be parsed through parseInt()
    Call it by ppPossition.posObject(objectToCheckAndMove, theDocumentObject,moveTheObjectToX(optional),moveTheObjectToY(optional)) 
*/
var ppPossition = {
    eventX:0,
    eventY:0,
    posObject : function(oObject, oDocument,objectX, objectY)
    {
        if(objectX && objectY)
            ppPossition.setObjXY(oObject,objectX, objectY)
        if(bMSIE)
        {
                var objectWidth = GetAbsoluteLeft(oObject) + oObject.offsetWidth
                var objectHeight = GetAbsoluteTop(oObject) + oObject.offsetHeight
                
                var windowX = ppPossition.getScreenScrollX(oDocument)
                var windowY = ppPossition.getScreenScrollY(oDocument)
        }
        else          // Gecko does not count the scroll effect on the containing document.
        {            // so we need to set the objects left and top to = 0
                
                var tempLeft = oObject.style.left
                var tempTop = oObject.style.top
                oObject.style.left = 0
                oObject.style.top = 0

                var objectWidth = parseInt(tempLeft) + oObject.offsetWidth
                var objectHeight = parseInt(tempTop) + oObject.offsetHeight
                
                var windowX = ppPossition.getScreenScrollX(oDocument)
                var windowY = ppPossition.getScreenScrollY(oDocument)
                
                oObject.style.left = tempLeft
                oObject.style.top = tempTop
        }
        
        if((objectWidth > windowX) && (windowX > 0)) // (windowX > 0) Is here for Calendar view. 
        {                                                               // Gecko can not find body.clientWidth
            diff = objectWidth - windowX;
            oObject.style.left =  parseInt(oObject.style.left) - (diff + 15) +'px';
        }
        if((objectHeight > windowY) && (windowY > 0))  // (windowY > 0) Is here for Calendar view. 
        {                                                               // Gecko can not find body.clientHeight
            diff = objectHeight - windowY   
            if(parseInt(oObject.style.top) - diff > 0)
                oObject.style.top =  parseInt(oObject.style.top) - (diff + 15) +'px';
        }
    },
    getScreenScrollX: function(oDocument) 
    {
      var scrollX = 0;
      if(oDocument.body.clientWidth)
      {
        var tempX = 0
        if(oDocument.body.scrollLeft)
            tempX = oDocument.body.scrollLeft
        scrollX = oDocument.body.clientWidth + tempX

      }
      else if(oDocument.documentElement.clientWidth)
      {
        scrollX = oDocument.documentElement.clientWidth;
      }
      
      return scrollX;
    },  
    getScreenScrollY: function(oDocument) 
    {
      var scrollY = 0;
        if(oDocument.documentElement && oDocument.documentElement.clientHeight)
        {
            var tempY = 0
            if(oDocument.documentElement.scrollTop)//IE, FF will always return 0
            {
                tempY = oDocument.documentElement.scrollTop
            }
            else if(oDocument.body.scrollTop)//FF
            {
                tempY = oDocument.body.scrollTop;
            }    
            scrollY = oDocument.documentElement.clientHeight + tempY
        }
      else if(oDocument.body.clientHeight)
      {
        var tempY = 0
        if(oDocument.body.scrollTop)
            tempY = oDocument.body.scrollTop
        scrollY = oDocument.body.clientHeight + tempY
      }
      return scrollY;
    },
    setObjXY: function(oObject,x,y)
    {
            oObject.style.left = parseInt(x)+'px'
            oObject.style.top = parseInt(y)+'px'
            
    },
    _getMouseTopLeft:function(e)
    {
        if(e.srcElement)
        {
            el =e.srcElement
        }
        else
        {
            el = e.target;
        }
        ppPossition.eventY = GetAbsoluteTop(el);
        ppPossition.eventX = e.clientX;
        if(oMainTarget.removeEventListener)
            oMainTarget.removeEventListener('mousemove',ppPossition._getMouseTopLeft,true)
        else
            oMainTarget.detachEvent('mousemove',ppPossition._getMouseTopLeft)
        
    },
    activateMousePos:function()
    {
        addEvent(oMainTarget,'mousemove',ppPossition._getMouseTopLeft,true);    
    }
}
/*
    External Functions NOT used from inside pp.pp_popup functions
*/
function setKey(template,key,value){
  str  = template
  re   = new RegExp('\\%\\('+key+'\\)s','g')
  if(key.toLowerCase() == 'descr')
  {
        value   = unescape(value).replace(/<BR>/g, '\n')
        var descLength = value.length
        
        var iRows = 5
        var iCols = 43
        if(!bMSIE)
        {
            var iCols = 41
        }

        var colsRe   = new RegExp('\\%\\(cols\\)s','g')
        var rowsRe   = new RegExp('\\%\\(rows\\)s','g')
        
        iRows = 'rows="'+iRows+'"'
        iCols = 'cols="'+iCols+'"'
                        
        str  = str.replace(colsRe,iCols)
        str  = str.replace(rowsRe,iRows)
  }    
  return (str.replace(re,value))
}

/**
 * Returns the translated message for the specified key.
 */
function pp_message(message)
{
    if (!window.pp_messages)
        return '';
    
    var ms = pp_messages[message];
    if (!ms)
        alert('No message with key "' + message + '" !!!');
    
    return ms;
}

/**
 * Generates the html code for the description dialog shown in for example the document archive when you
 * edit the description of a document.
 * 
 * @param {Object} documentId: the id of the document.
 * @param {Object} descr: 
 * @param {Object} mayChangeDescription: true if the user is allowed to edit the description.
 */
function htmlDesriptionTemplate(documentId,descr,mayChangeDescription, updateCloseFunctionFrame)
{
	if(descr=='—')
		descr='';

    htmlsrc  =   '<div class="content">';
    htmlsrc  +=  '<FORM NAME="inputform">\n';
    htmlsrc  +=  '<label for="descr">%(description_title)s</label>';
    htmlsrc  +=  '<TEXTAREA NAME="descr" id="descr" WRAP=VIRTUAL rows="6" cols="75" %(disabled)s >%(descr)s</TEXTAREA><BR>\n';
    htmlsrc  +=  ' <div class="buttons">';
    if (mayChangeDescription)
        htmlsrc  +=  '<INPUT TYPE="button" class="button" VALUE=" %(update_button)s " onClick="%(function_location)schangeDescr(\'%(document_id)s\',document.inputform.descr.value);">&nbsp;';
    htmlsrc  +=  '<INPUT TYPE="button" class="button cancel" VALUE=" %(close_button)s " onClick="%(function_location)shideForm();">';
    htmlsrc  += '</div>';
    htmlsrc  +=  '</FORM>';
    htmlsrc  += '</div>';
    
    htmlsrc = setKey(htmlsrc, 'description_title', pp_message('description'));
    htmlsrc = setKey(htmlsrc, 'disabled', (mayChangeDescription ? '' : 'disabled="disabled"'));
    htmlsrc = setKey(htmlsrc, 'update_button', pp_message('update'));
    htmlsrc = setKey(htmlsrc, 'close_button', pp_message('close'));
    
    htmlsrc = setKey(htmlsrc,'descr',descr);
      htmlsrc = setKey(htmlsrc,'document_id',documentId);
    
    htmlsrc = setKey(htmlsrc, 'function_location', (updateCloseFunctionFrame != '' ? updateCloseFunctionFrame + '.' : ''));
    
    return htmlsrc;
}

function pleaseWaitPage(win)
{
  win.document.open("text/html", "replace")
  win.document.write('<html><head><link rel="stylesheet" href="/css/'+extraCSSPath+'ppdefault.css" type="text/css"></head><body></body></html>')
  win.document.close()
  var tmp = oMainTarget
  oMainTarget = win.document
  pleaseWait()
  oMainTarget = tmp
}
/*------------------------------------------------------------------------------------------
    - function hovertext
        - Dependencies:
            - oMainTarget must be sett(the document object of the page where the hover should
                be placed).
        - Interface:
            - Call init to create the hovertext range with the msg to present.(event "onmouseover" for instance)
            - Call close to close the hovertext range.(event "onmouseout" for instance)
            - To be able to count the new height of the hovertext box, every new line must be seperated by '\n'
        - params:
            - sMsg = the message to display in the hover text
            - oObj = the calling object
            - iSubLeft = The left possition to place the hover(int)[optional] 
            - iSubTop = The top possition to the place(int)[optional] 
            - iDelay = Override the delay to present the hover(int millisec)[optional] 
            - oReplace = Replace the content instead of removing a already generated hover(hovertext html object)[optional]
         - iCustomWidth
            - iCustomWidth = I have added the possibility to add a custom width to the hovertext. Sett the attr before calling init.
            - iCustomWidth will be reset to null in hovertext.close()
         - specialCSSClass set this var before calling init(), then this will be the class used in the body of the pop up.
         - iAddCustomTop and iAddCustomLeft lefts you add some extra top or left values to the placement of the hovertext.
            - Both attr will be reset to null in hovertext.close()
         
        -    Olle
------------------------------------------------------------------------------------------*/
var hovertext = {
    sCallerID: null,
    appendToForm: false,
    iOpacity: 0,
    bFilterDone: false,
    iCustomDelay: false,
    iCustomWidth: null,
    iAddCustomTop:null,
    iAddCustomLeft:null,
    specialCSSClass: null,
    customSizeClass:'medium',
    removeSemCol:false,
	runAfter:null,
	oObj:null,
	isRunning:false,
	
    init: function(sMsg, oObj, iSubLeft, iSubTop, iDelay,oReplace, runAfter)
    {
		this.bFilterDone = false;
        if (runAfter) this.runAfter = runAfter;
		this.oObj = oObj;
		
        if(!hovertext._checkAccess())
            return false;
        if(oMainTarget.getElementById('textHover') && !oReplace)
        {
            hovertext.close()
        }
        if(sMsg)
        {
            this.iCustomDelay  = iDelay;
            this.sCallerID = oObj.id;
            var sText = this._parseText(sMsg);
            
            oObj.title = '' // the title tooltip risks obscuring the custom hover
            
            var aHeightWidth = this._returnHeightWidth(sText);        
            if(!oReplace)
            {
                var oDiv = new makeDiv(oMainTarget,4,4,null,null,'floatWin');
            }
            else
            {
                var oDiv = oReplace;
            }
            oDiv.id = 'textHover';
            oDiv.className = 'floatWin '+this.customSizeClass;
            oDiv.innerHTML = '<div class="foreground">' +sText +'</div>'; 
            if(!iSubLeft)
                sLeft = GetAbsoluteLeft(oMainTarget.getElementById(this.sCallerID));
            else
                sLeft = iSubLeft;
            if(!iSubTop)
                sTop = GetAbsoluteTop(oMainTarget.getElementById(this.sCallerID));
            else
                sTop = iSubTop;
            
            if(this.iAddCustomLeft)
                sLeft += this.iAddCustomLeft;
            if(this.iAddCustomTop)
                sTop += this.iAddCustomTop;
            
            if (this.appendToForm)
                oMainTarget.getElementsByTagName('form')[0].appendChild(oDiv);
            else
                oMainTarget.getElementsByTagName('body').item(0).appendChild(oDiv);
                   
            hovertext._moveToVisible(oDiv,sLeft,sTop,aHeightWidth)
            showHideSelects(true);
            if(!this.iCustomDelay)
                window.setTimeout("hovertext._show(50,true)",500)
            else if (this.iCustomDelay < 0)
                window.setTimeout("hovertext._show(100,true)",0)
            else
                window.setTimeout("hovertext._show(50,true)",this.iCustomDelay)
            
			oDiv = null;
            return false;
        }
    },
    _parseText: function(sParse)
    {
            sText = unescape(unescape(sParse));
            
            if(hovertext.removeSemCol)
            {
                sText = sText.replace(/;/ig, ' '); //Replace newlines with <br> tag
            }
            sText = sText.replace(/\n/ig, '<br />'); //Replace newlines with <br> tag
            sText = sText.replace(/<sc/ig, '&lt;sc');
            sText = sText.replace(/<sc/ig, '&lt;/sc');
            sText = sText.replace(/<Sc/ig, '&lt;Sc');
            sText = sText.replace(/<\/Sc/ig, '&lt;/Sc');
            sText = sText.replace(/<SC/ig, '&lt;SC');
            sText = sText.replace(/<\/SC/ig, '&lt;/SC');
            sText = sText.replace(/<sC/ig, '&lt;sC');
            sText = sText.replace(/<\/sC/ig, '&lt;/sC');
            return sText;
    },
    _moveToVisible: function(obj,sLeft,sTop,aHeightWidth)
    {
        var iVisibleArea = ppPossition.getScreenScrollX(oMainTarget)
        
        var iNewWidth = sLeft + 20 // Add 20px to the hovertext box left attr.
        var hoverTextPosWidth = iNewWidth + aHeightWidth[1];
        obj.style.top = sTop + 20 +'px' // Add 20px to the hovertext box top attr. -- We need the 'px' in some cases when the Browser is Mozilla
        obj.style.display = 'block';
        
        if(hoverTextPosWidth > iVisibleArea)
        {
            while(hoverTextPosWidth > iVisibleArea)
            {  
                hoverTextPosWidth = hoverTextPosWidth - 10;
            }
            if(hoverTextPosWidth - aHeightWidth[1] > 0)
            {
                diff = iVisibleArea-hoverTextPosWidth;
                if(!bMSIE6)
                {
                    diff = diff + 19;
                }
                obj.style.left = hoverTextPosWidth - aHeightWidth[1] - (diff + 15)+'px';
            }
            else
                obj.style.left = 2
        }    
        else
        {
            obj.style.left = iNewWidth + 'px';
        }
        var iCallerTop = GetAbsoluteTop(oMainTarget.getElementById(hovertext.sCallerID));
        var iObjectHeight = parseInt(obj.style.top) + obj.offsetHeight;
        var iObjectTop = parseInt(obj.style.top);
        var windowY = ppPossition.getScreenScrollY(oMainTarget);

        if(iObjectHeight > windowY)
        {
            
            while(iObjectTop > windowY)
            {  
                iObjectTop = iObjectTop -20
            }
            iObjectTop = iObjectTop - (obj.offsetHeight + 4)
            if(iObjectTop < 0)
            {
                iObjectTop = 10;
            }
            obj.style.top = iObjectTop+'px';
            
            if((iObjectTop != 10)&& (parseInt(obj.style.top) + obj.offsetHeight) > iCallerTop)
            {
                var newVerticalPos =  GetAbsoluteTop(obj) + obj.offsetHeight;
                ppPossition.activateMousePos();
                if(ppPossition.eventY)
                {
                    var diff = newVerticalPos - ppPossition.eventY;
                    obj.style.top = (GetAbsoluteTop(obj) - diff)-5+'px';
                }
           }
        }
        if(bMoz)
             obj.style.MozOpacity = 0;
        obj.style.display = 'none';
        
    }, 
    _show: function(iOpacity, bSetMoz)
    {
        if(!hovertext._checkAccess())
            return false;
            
        if(oMainTarget.getElementById('textHover'))
        {
            if(hovertext.iOpacity < 100 && !hovertext.bFilterDone)
            {
                hovertext.iOpacity = hovertext.iOpacity+iOpacity;
                if(bMoz)
                    oMainTarget.getElementById('textHover').style.MozOpacity = hovertext.iOpacity /100; 
                /*else
                    oMainTarget.getElementById('textHover').style.filter = eval('"alpha(opacity=\''+hovertext.iOpacity+'\')"')
                */
                if(oMainTarget.getElementById('textHover').style.display != 'block')
                {
                    ppPossition.posObject(oMainTarget.getElementById('textHover'), oMainTarget)
                    oMainTarget.getElementById('textHover').style.display = 'block';                    
                }
                /*
                 * removed due to that we do not set the height of the
                 * hovertext div no more, we let the browser set the height
                 * of the div instead.
                 if(!bMSIE && bSetMoz) //Due to that Mozilla does not let the content expand the container we need to set the height of "hovertextcontainer" div.
                    oMainTarget.getElementById('textHover').style.height =  oMainTarget.getElementById('hovertextcontainer').offsetHeight + 30 +'px';
                */
                
                if(!hovertext.iCustomDelay)
                    setTimeout("hovertext._show(25)",150);
                else
                    setTimeout("hovertext._show(25)",hovertext.iCustomDelay);
            }
            else
            {
                hovertext.bFilterDone = true;
                hovertext.iOpacity = 0;
            }
        }

		if (this.runAfter) this.runAfter(this.oObj);
    },
    _returnHeightWidth: function(sText)
    {
        var aNewlines =  sText.split('<br />');
        var iHeight = (aNewlines.length *14);
        
        if(!bMSIE)
        {
            if(aNewlines.length < 2)
                iHeight = (2 *14);
        }    
        var iWidth= 0;
        if(!hovertext.iCustomWidth)
        {    
            for(var i = 0;i < aNewlines.length; i++)
            {
                if(iWidth < aNewlines[i].length * 6)
                    iWidth = aNewlines[i].length * 6;  // 6, the length of a single character.
            }
        
            if(iWidth < 200)
                iWidth = 200;
        
            if(iWidth > 570) // we do not let the width be bigger then 570px.
            {
                
                extraHeight = iWidth / 570;
                extraHeight = extraHeight *14;
                iHeight = iHeight + extraHeight;
                iWidth = 570;
            }
        }
        else
            var iWidth = hovertext.iCustomWidth;    
        return [iHeight,iWidth]
    },
    close:function(e)
    {
        if(!hovertext._checkAccess())
            return false;
        if(oMainTarget.getElementById('textHover'))
        {
            oParent = oMainTarget.getElementById('textHover').parentNode;
            oParent.removeChild(oMainTarget.getElementById('textHover'));
            oParent = null;
        }
        
        hovertext.iCustomWidth = null; 
        
        hovertext.iOpacity = 0;
        hovertext.sCallerID = null;
        hovertext.bFilterDone = false;
        hovertext.removeSemCol = false;
        hovertext.iAddCustomLeft = null;
        hovertext.iAddCustomTop = null;
        showHideSelects(false);
    },
    _checkAccess:function()
    { 
        // - check and see that the page we are trying to access is still there, or is the page loading or unloading
        try
        {
            return ( oMainTarget.getElementById && oMainTarget.getElementsByTagName&& oMainTarget.getElementsByTagName( "head" )[ 0 ]
                && oMainTarget.getElementsByTagName( "head" )[ 0 ].appendChild
                && oMainTarget.createElement )
            
        }
        catch(e)
        {
            return false
        }
    }
}

/*
    - function createSettingsPage
        - returns a DOM Object page with tabs.
        - Interface:
            - Takes a array of names to present on the page tabs(see createWindowTabs)
            - Takes a id as a string, to be able to have multiple windows open.
            - Takes 
        - Dependencies:
            - oMainTarget must be sett(the document object of the container page where the tabs should be placed).
            - ppdefault.css
            - Calls createWindowTabs that creates the tabs for the page.
*/
var createSettingsPage = function(sID,aTabs,iWidth,iHeight,bDoNotUseParent)
{
    var left = (oMainTarget.body.clientWidth/2) -300;
    var top=  oMainTarget.body.scrollTop + 100;
    
    var oFloatWindow = new makeDiv(oMainTarget,left,top,iWidth,iHeight,'popUpBoby');
    oFloatWindow.setAttribute('type','superparent')
    oFloatWindow.id = sID;
    
    var oTabBar = new makeDiv(oMainTarget,4,4,iWidth-14,20,'popUptoolBar');
    if(bMSIE)
    {
     oTabBar.style.cursor = 'move'
     addEvent(oTabBar,'mousedown',startMe,true);
     addEvent(oTabBar,'mouseup',releaseMe,true);
     addEvent(oTabBar,'mousemove',moveMe,true);
     iBodyWidth = iWidth-8;
     iBodyHeight = iHeight-28;
    }
    else
    {
       iBodyWidth = iWidth-4; 
       iBodyHeight = iHeight-25;
    }    
    
    var oBodyDiv = new makeDiv(oMainTarget,4,26,iBodyWidth,iBodyHeight,"",true);
    if (bMSIE)
    {
       oBodyDiv.style.width = (parseInt(oBodyDiv.style.width)-4)+"px";
    }
    else
    {
       oBodyDiv.style.width = (parseInt(oBodyDiv.style.width)-7)+"px";
    }       
    oBodyDiv.style.borderLeft = '1px solid #999999';
        
    oFloatWindow.appendChild(oBodyDiv);
    oFloatWindow.appendChild(oTabBar);
    
    tableWidth = iBodyWidth + 1;
    var sTabs = createWindowTabs(aTabs,tableWidth,bDoNotUseParent);

    oFloatWindow.lastChild.innerHTML = sTabs;
    PopDOMAddCloseX(oFloatWindow);
    return oFloatWindow;
}

/*
    - function createWindowTabs
        - returns string of tabs to be used in a PopDOMWin or a standard makeDiv window.
        - Interface:
            - Takes a array of names to present on the tabs, if this is the active tab and the function to call when clicked apone([sName,bActive,sFunction,sName,bActive,sFunction...])
            - tableWidth is used to specify the width of the table.
            - bDoNotUseParent is true if we do not want to user parent as target for call to setActiveSmallTab()
        - Dependencies:
            - Calls setActiveSmallTab where     oMainTarget must be sett(the document object of the container page where the tabs should
                be placed).
            - ppdefault.css
            - pp_message for the tooltip string onmouseover.
*/
var CONSTANT_SMALL_TABS = [] //Holds the ids of all the dynamic created small tabs.
var createWindowTabs = function(aNameArray,tableWidth,bDoNotUseParent)
{
    var extraSpacing = '';
    var returnValue = ''; 
    var sDivHeight = '';
    var marginTopValue = '';
    var tmpI = 0
    var sClassName = ''
    var ie5Nowrap = '';
    var ie5BackSpace = '';

    if(bMSIE)
    {
        
        if(bMSIE5)
        {
            ie5Nowrap = 'nowrap="nowrap"';
            ie5BackSpace = '&nbsp;&nbsp;&nbsp;'
        }
        extraSpacing = '&nbsp;&nbsp;&nbsp;'
        sDivHeight = '16px'
        marginTopValue = '-3px'
    }
    else
    {
        sDivHeight = '16px'
        marginTopValue = '1px'
    }
    
    returnValue += '<table border="0" onselectstart="return false"  style="position:absolute;left:-1px; border-top:0px; border-bottom:0px; border-left:0px; border-right:0px;" cellspacing="1" width="'+tableWidth+'" cellpadding="0">'
            +'<tbody><tr>'
    var activeTabCallBack = 'parent.setActiveSmallTab(this);';
    if(bDoNotUseParent)
       activeTabCallBack = 'setActiveSmallTab(this);'
    
    for(var i = 0; i < aNameArray.length;)
    {
        tmpI = i
        sName = aNameArray[tmpI]
        bActive = aNameArray[tmpI+1]
        sFunc = aNameArray[tmpI+2]
        for (tab in CONSTANT_SMALL_TABS)
        {
            if('smalltab_'+i == CONSTANT_SMALL_TABS[tab])
                delete CONSTANT_SMALL_TABS[tab]
        }
        CONSTANT_SMALL_TABS[CONSTANT_SMALL_TABS.length] = 'smalltab_'+i

        sClassName = 'inactiveSmallTab'
        if(bActive)
            sClassName = 'activeSmallTab'
        
        returnValue += '<td style="border-top:0px; border-bottom:0px; border-left:0px; border-right:0px;" '+ie5Nowrap+'>'
                + '<div title="'+sName+'" style="height:'+sDivHeight+';" id="smalltab_'+i+'" class="'+sClassName+'" '
                + 'onclick="'+activeTabCallBack+''+sFunc+'">'
                    + '<img src="/ppi/toolbar/smalltableft.gif" style="position:absolute; margin-top:-1px;" />'        
            returnValue += '<span style="font-size:10px; margin-left:15px; margin-right:15px;">'+extraSpacing+''+sName+''+ie5BackSpace+'</span>'
        returnValue += '<img src="/ppi/toolbar/smalltabright.gif" style="position:absolute;margin-top:-1px;margin-left:-2px;" />'
                +'</div></td>'
        i = i+3;
    }
    
    returnValue += '<td style="height:16px;width:100%; background:#FFFFFF; border-top:0px; border-bottom:0px; border-left:0px; border-right:0px;">'
            + '<div style="height:16px; background:#FFFFFF; margin-top:'+marginTopValue+'; border-bottom:1px solid #999999;"></div></td>'
    
    returnValue += '</tr></tbody></table>'
    
    returnValue += '<div style="height:10px; position:absolute;margin-top:12px;width:1px; background:#999999"></div>'
    return returnValue;
} 
/*
    - function setActiveSmallTab
        - Called from function createWindowTabs when a user clicks on a smalltab. 
            Sets the tab into active and the rest inactive. 
*/
var setActiveSmallTab = function(clickedTab)
{
    var oTargetDoc = oMainTarget
    for (tab in CONSTANT_SMALL_TABS)
    {
        if(clickedTab.id == CONSTANT_SMALL_TABS[tab])
        {    
            if(oTargetDoc.getElementById(CONSTANT_SMALL_TABS[tab]))
                oTargetDoc.getElementById(CONSTANT_SMALL_TABS[tab]).className= 'activeSmallTab'
        }
        else
        {
            if(oTargetDoc.getElementById(CONSTANT_SMALL_TABS[tab]))
                oTargetDoc.getElementById(CONSTANT_SMALL_TABS[tab]).className= 'inactiveSmallTab'
        }
    }
}
/*returns a unescape string with some "bad" HTML GUI car. replaced*/
var returnSafeGUIString = function(sString)
{
    sEscString = unescape(unescape(unescape(sString)))
    sEscString = sEscString.replace(new RegExp('\\\\', 'g'), '')
    sEscString = sEscString.replace(new RegExp("<BR>", 'g'), "\n")
    sEscString = sEscString.replace(new RegExp("pp_equal", 'g'), "='")
    sEscString = sEscString.replace(new RegExp("'", 'g'), "&#39;")
    sEscString = sEscString.replace(new RegExp(">", 'g'), "&gt;")
    sEscString = sEscString.replace(new RegExp("<", 'g'), "&lt;")
    sEscString = sEscString.replace(new RegExp('"', 'g'), "&quot;")
    return sEscString;
}

/*returns a unescape string with some "bad" HTML GUI car. re converted for createTextNode() calls.*/
var returnNoneSafeGUIString = function(sString)
{
    sEscString = unescape(unescape(unescape(sString)))
    sEscString = sEscString.replace(new RegExp('\\\\', 'g'), '')
    sEscString = sEscString.replace(new RegExp("pp_equal", 'g'), "='")
    sEscString = sEscString.replace(new RegExp("&#39;", 'g'), "'")
    sEscString = sEscString.replace(new RegExp("&gt;", 'g'), ">")
    sEscString = sEscString.replace(new RegExp("&lt;", 'g'), "<")
    sEscString = sEscString.replace(new RegExp('&quot;', 'g'), '"')
    sEscString = sEscString.replace(new RegExp('&amp;', 'g'), '&')
    return sEscString;
}

/*------------------------------------------------------------------------------------------
    - function capsLockDetect
        - Dependencies:
            - Send the event to the function(i.e. capsLockDetect(event) )
            - Create a function on the calling page called capsErrorMsg. In this function
              you present your error msg or what ever you want to do. 
            - mainWindow must be sett.
        - Interface:
            - Call this function by adding onkeypress="capsLockDetect(event)" to the input object to check.
    -    Olle
------------------------------------------------------------------------------------------*/
var capsLockDetect = function(e) 
{    
    if(!e)
        e = mainWindow.event; 
    if(!e) 
        return;
    var keyPressed = e.which ? e.which : ( e.keyCode ? e.keyCode : ( e.charCode ? e.charCode : 0 ) );
    var bShift = e.shiftKey
    
    if( (keyPressed > 64 && keyPressed < 91 && !bShift ) || ( (keyPressed > 96 && keyPressed < 123 && bShift) || (keyPressed == 214) || (keyPressed == 196) || (keyPressed == 197) ) ) 
    {
        capsErrorMsg(true)
    }
    else
        capsErrorMsg(false)
}
/*
    - function returnInputVScrollBar
        - returns string of a input type text with the step up/down icons attached to it.
            sInputIdName = the name and id of the input
            iInputSize = the size (length) of the input
            iInputMaxLength = the max length value of the input
            sInputValue = default value of the input
            sExtraFuncAsString = if you want any function attached to the input, for ex: onblur, onunload..
            bParentTarget = Is the countup/countdown functions located in the parent frame ? true:false;
*/
var returnInputVScrollBar = function(sInputIdName,iInputSize,iInputMaxLength,sInputValue,sExtraFuncAsString,bParentTarget)
{
    var sInput = '<input class="text" type="text" id="'+sInputIdName+'" name="'+sInputIdName+'" ';
    if(iInputSize)
        sInput += 'size="'+iInputSize+'"';
    if(iInputMaxLength)
        sInput += 'maxlength="'+iInputMaxLength+'"';
    if(sExtraFuncAsString)
        sInput += sExtraFuncAsString; 
    sInput += 'value="'+sInputValue+'" orgvalue="'+sInputValue+'">'; 
    
    if(bParentTarget)
    {
        sVScroll = '<input class="button" type="button" name="decrease_count" id="decrease_count" onMouseUp="parent.countDown(\''+sInputIdName+'\')" value="<"/>'
        sVScroll += sInput 
        sVScroll += '<input class="button" type="button" name="increase_count" id="increase_count" onMouseUp="parent.countUp(\''+sInputIdName+'\')" value=">"/>'
    }
    else
    {
        sVScroll = '<input class="button" type="button" name="decrease_count" id="decrease_count" onMouseUp="countDown(\''+sInputIdName+'\')" value="<"/>'
        sVScroll += sInput 
        sVScroll += '<input class="button" type="button" name="increase_count" id="increase_count" onMouseUp="countUp(\''+sInputIdName+'\')" value=">"/>'
    }
    
    return '<div class="group">' 
           +'  <div class="data">'
           +    sVScroll
           +'  </div>'
           +'</div>'
}
/*
    - function countUp
        - Used in function returnInputVScrollBar to count the input value up (integer)
*/
var countUp = function(sInputId)
{
    var sValue = parseInt(oMainTarget.getElementById(sInputId).value);
    if(isNaN(sValue))
            oMainTarget.getElementById(sInputId).value = 25;
    else
    {
        if((sValue + 25) > 100)
            sValue = 100;
        else
        {
            if(sValue == 0)
                sValue = 25; 
            else if(sValue < 25) 
                sValue = 25;
            else if(sValue < 50)
                sValue = 50;
            else if(sValue < 75) 
                sValue = 75;
            else if(sValue < 100)
                sValue = 100;
        }
        oMainTarget.getElementById(sInputId).value = sValue +'%';
        oMainTarget.getElementById(sInputId).orgvalue = sValue +'%';
    }
    oMainTarget.getElementById(sInputId).focus()
    oMainTarget.getElementById(sInputId).blur()
}
/*
    - function countDown
        - Used in function returnInputVScrollBar to count the input value down (integer)
*/
var countDown = function(sInputId)
{
    var sValue = parseInt(oMainTarget.getElementById(sInputId).value);
    if(isNaN(sValue))
        oMainTarget.getElementById(sInputId).value = 0;
    else
    {
        if((sValue - 25) < 0)
            sValue = 0;
        else
        {
            if(sValue > 75)
                sValue = 75; 
            else if(sValue > 50) 
                sValue = 50;
            else if(sValue > 25)
                sValue = 25;
            else if(sValue <= 25) 
                sValue = 0;
        }
        //    sValue -=  25;
        oMainTarget.getElementById(sInputId).value = sValue +'%';
        oMainTarget.getElementById(sInputId).orgvalue = sValue +'%';
    }
    oMainTarget.getElementById(sInputId).focus()
    oMainTarget.getElementById(sInputId).blur()
}

FADE_MAX = 1
FADE_MIN = 0
FADE_STEP_LENGTH = 0.1;
FADE_STEP_MILLISEC = 10;

function _setElementOpacity(element, opacity) {
    element.style.opacity = opacity;
    element.style.filter = 'alpha(opacity=' + opacity * 100 + ')';
}

function _getElementOpacity(element) {
    return Math.round(Number(element.style.opacity) * 100) / 100;
}

function _fadeElement(elementId, endOpacity)
{
    endOpacity = Number(endOpacity);
    element = oMainTarget.getElementById(elementId);
    currentOpacity = _getElementOpacity(element);
    if (currentOpacity > endOpacity)
    {
        _setElementOpacity(element, Math.max(endOpacity, currentOpacity - FADE_STEP_LENGTH));
    } 
    else
    {
        _setElementOpacity(element, Math.min(endOpacity, currentOpacity + FADE_STEP_LENGTH));
    }
    if (_getElementOpacity(element) != endOpacity)
    {
        setTimeout("_fadeElement('" + elementId + "', " + endOpacity + ")", FADE_STEP_MILLISEC)
    }
}

function fadeOutElement(elementId)
{
    element = oMainTarget.getElementById(elementId);
    if (_getElementOpacity(element) > FADE_MIN)
    {
        if (_getElementOpacity(element) < FADE_MAX)
        {
            setTimeout("fadeOutElement('" + elementId+ "')", FADE_STEP_MILLISEC);
        }
        else
        {
            _fadeElement(elementId, FADE_MIN);
        }        
    }
}

function fadeInElement(elementId)
{
    element = oMainTarget.getElementById(elementId);
    if (_getElementOpacity(element) < FADE_MAX)
    {
        if (_getElementOpacity(element) > FADE_MIN)
        {
            setTimeout("fadeInElement('" + elementId+ "')", FADE_STEP_MILLISEC);        
        }
        else
        {
            _fadeElement(elementId, FADE_MAX);        
        }
    }
}

/*
    class AccordionEvent
        - Dependent on oMainTarget in not setting oTarget to the document object before
          calling expand.
        - To call
            - Sett AccordionEvent.aExPandableElements with an array of Expandable elements.
                like this: AccordionEvent.aExPandableElements = new Array('firstheading','secondheading',...);
                This can be done onclick of the element, but a better ide is to set this var onload of the document.
            - Onclick on the header to expand(the box located under the heading):
                onclick="AccordionEvent.expand('firstheading');"
        - FYI: This function is in a class because I have the feeling that we will be adding animations and so on...
        - Olle

*/
var AccordionEvent = {
    aExPandableElements:new Array(),
    oTarget:null,
    sActiveId:null,
    bNoCollapsOfOthers:false,
    expand:function(sActiveId,swapImgId)
    {
        if(!this.oTarget)
            this.oTarget = oMainTarget;
        this.sActiveId = sActiveId
        
        if(!this.bNoCollapsOfOthers)
        {
            for(var i = 0; i < this.aExPandableElements.length;i++)
            {
               
                    if(this.aExPandableElements[i] != this.sActiveId)
                    {
                        this.oTarget.getElementById(this.aExPandableElements[i]).style.display = 'none';
                    }
                    else
                    {
                        this.oTarget.getElementById(this.aExPandableElements[i]).style.display = 'block';
                    }
            }
        }
        else
        {
             var isState = this.oTarget.getElementById(this.sActiveId).style.display;
             
                
             if(isState == 'none' || isState == '')
             {
                 bShow = true;
                 this.oTarget.getElementById(this.sActiveId).style.display = 'block';
             }
             else
             {
                 bShow = false;
                 this.oTarget.getElementById(this.sActiveId).style.display = 'none';
             }
             if(swapImgId)
             {
                 this._checkExpCollImg(this.oTarget.getElementById(this.sActiveId),swapImgId,bShow);
             }
        }
        
    },
    setHoverActions:function()
    {
       if(!this.oTarget)
           this.oTarget = oMainTarget;
       var aDiv = this.oTarget.getElementsByTagName('div');

       for(var i = 0; i < aDiv.length; i++)
       {
           if(aDiv[i].className == 'accordionHeader')
           {
               if(aDiv[i].getElementsByTagName('h4').length)
               {
                aDiv[i].onmouseover = function(){this.childNodes[0].className= 'accordionHeaderH4Hover';}
                aDiv[i].onmouseout = function(){this.childNodes[0].className = ''}
               }
           }
       }
    },
    _checkExpCollImg:function(oDivContainer,sImg,bOpen)
    {    
       if(sImg)
       {
           var aImgCollection = oDivContainer.parentNode.getElementsByTagName('img');
           for(var i = 0;i < aImgCollection.length;i++)
           {
            if(aImgCollection[i].className == 'expandColl')
            {
                if(aImgCollection[i].id == sImg)
                {
                    aImgCollection[i].src = (bOpen)?'/ppi/expanded.gif':'/ppi/collapsed.gif';
                }

            }
           }
       }
    }
}
/*
    function setIEInputHover
       Since IE does not understand :hover, :focus on any other element then <a> 
       we need this script to set the events manually.
       Call it by calling:
       //IE specific function to set the borders of the inputs
        addOnLoadEvent(setIEInputHover);
        
        Dependent on that the inputs and textareas has the classname "m_input" 
        and that the css file 
        - Olle

*/
function setIEInputHover()
{
    if(!bMSIE)
        return false;
    var oTargetDoc = oMainTarget;
    var aInputs = oTargetDoc.getElementsByTagName('input');
    var aAreas = oTargetDoc.getElementsByTagName('textarea');
    for(var i = 0; i < aInputs.length; i++)
    {
        if((aInputs[i].className.indexOf('m_input') != -1) || (aInputs[i].className.indexOf('m_input ') != -1))
        {
            addEvent(aInputs[i],'mouseover',_inputOver,true);
            addEvent(aInputs[i],'mouseout',_inputOut,true);
            addEvent(aInputs[i],'focus',_onFocus,true);
            addEvent(aInputs[i],'blur',_onBlur,true);
        }
    }
    for(var i = 0; i < aAreas.length; i++)
    {
        if((aAreas[i].className.indexOf('m_input') != -1) || (aAreas[i].className.indexOf('m_input ') != -1))
        {
            addEvent(aAreas[i],'mouseover',_inputOver,true);
            addEvent(aAreas[i],'mouseout',_inputOut,true);
            addEvent(aInputs[i],'focus',_onFocus,true);
            addEvent(aInputs[i],'blur',_onBlur,true);
            
        }
    }
}
/*
    Since IE does not understand "this"(should be an input object)
    we need to get the event.
*/
function _inputOver(e)
{
    if(e.srcElement && (e.srcElement.tagName == 'INPUT' || e.srcElement.tagName == 'TEXTAREA'))
    {
       oSrcElement = e.srcElement;
       oSrcElement.className = oSrcElement.className.replace(new RegExp(/m_input/g)," m_inputOver ");
    }
}
function _inputOut(e)
{
    if(e.srcElement && (e.srcElement.tagName == 'INPUT' || e.srcElement.tagName == 'TEXTAREA'))
    {
        oSrcElement = e.srcElement;    
        if(!oSrcElement.getAttribute('_hasFocus'))
        {
            oSrcElement.className = oSrcElement.className.replace(new RegExp(/m_inputOver/g)," m_input ");
       }
    }
}
function _onFocus(e)
{
    if(e.srcElement && (e.srcElement.tagName == 'INPUT' || e.srcElement.tagName == 'TEXTAREA'))
    {
        oSrcElement = e.srcElement;
        oSrcElement.setAttribute('_hasFocus',true);
        _inputOver(e);
    }
}
function _onBlur(e)
{
    if(e.srcElement && (e.srcElement.tagName == 'INPUT' || e.srcElement.tagName == 'TEXTAREA'))
    {
        oSrcElement = e.srcElement;
        oSrcElement.setAttribute('_hasFocus',false);
        _inputOut(e);
    }
}

/**
 * sortable
 */
var sortable = 
{
    sortableTableClasses:new Array('sortableContent'),
    sortableHeadingsClasses:new Array('sortHeading'),
    seportatorClasses:new Array('sortingSep'),
    sortableClasses:new Array('sortable'),
    nodeList:null,
    afterSort:null,
    sortOrder:1,
    activeCCSClass:'odd',
    init:function()
    {
        var allSortableTables =  sortable.getByClass(sortable.sortableTableClasses);
        for(var i = 0; i < allSortableTables.length;i++)
        {   
            var sortHeadings = allSortableTables[i].getElementsByTagName('th');
            for (var j = 0; j < sortHeadings.length; j++)
            {
                for(var k = 0; k < sortable.sortableHeadingsClasses.length; k++)
                {
                    if(sortHeadings[j].className.indexOf(sortable.sortableHeadingsClasses[k]) != -1)
                    {
                        //sortHeadings[j].style.cursor = 'pointer';
                        addEvent(sortHeadings[j],'click',sortable.sort,true);    
                        sortHeadings[j].setAttribute('__sorttarget__',allSortableTables[i].id);
                        sortHeadings[j].setAttribute('__sorttarget_index__',j);
                    }    
                }    
            }
        }
    },
    getByClass:function(cssClasses)
    {
        var isArr= false;
        if(cssClasses.push())
            isArr = true;
        var foundElements = new Array();
        var all = oMainTarget.getElementsByTagName('*');
        if(isArr)
        {
            for(var i = 0; i < all.length;i++)
            {
                for(var j = 0; j < cssClasses.length;j++)
                {
                    objCSS = all[i].className.toString();
                    if(objCSS.indexOf(cssClasses[j]) != -1)
                    {
                        foundElements.push(all[i]);
                    }
                }   
            }
        }
        else
        {
            for(var i = 0; i < all.length;i++)
            {
                if(cssClasses == all[i].className)
                {
                    foundElements.push(all[i]);
                }
            }
        }
        return foundElements;
    },
    filterOutSubClasses:function()
    {
        var tmpArr = new Array;
        if(!sortable.isMultipleGroupSort)
        {
            for(var i = 0; i < sortable.nodeList.length;i++)
            {
                for(var j = 0; j < sortable.sortableClasses.length; j++)
                {
                    cssClass = sortable.nodeList[i].className.toString()
                    if(cssClass && (cssClass.indexOf(sortable.sortableClasses[j]) != -1))
                    {
                        tmpArr.push(sortable.nodeList[i])
                    }
                    else
                    {
                        for(var k = 0; k < sortable.seportatorClasses.length; k++)
                        {
                            if(cssClass && (cssClass.indexOf(sortable.seportatorClasses[k]) != -1))
                            {
                                tmpArr.push(sortable.nodeList[i])    
                            }
                        }
                    }
                }
            }
        }
        else
        {
            var singleArrHolder = new Array();
            var tmpMultipleArrHolder = new Array();
            for(var i = 0; i < sortable.nodeList.length;i++)
            {
                singleArr = sortable.nodeList[i];
                for(var p = 0; p < singleArr.length;p++)
                {
                    for(var j = 0; j < sortable.sortableClasses.length; j++)
                    {
                        cssClass = singleArr[p].className.toString()
                        if(cssClass && (cssClass.indexOf(sortable.sortableClasses[j]) != -1))
                        {
                            singleArrHolder.push(singleArr[p])
                        }
                    }
                }
                tmpMultipleArrHolder.push(singleArrHolder.slice(0,singleArrHolder.length));
                singleArrHolder.length = 0;
            }
            tmpArr = tmpMultipleArrHolder;
        }
        sortable.nodeList = tmpArr;
    },
    sort:function(e)
    {
        if(e.srcElement)
        {
            obj = e.srcElement;
        }
        else
        {
            obj = e.target;
        }
        if(obj.tagName == 'SPAN' || obj.tagName == 'A')
            obj = obj.offsetParent
                
        var sortID = obj.getAttribute('__sorttarget__');
        sortable.sortTDIndex = obj.getAttribute('__sorttarget_index__');
        var sortHead = obj;
        
        var sortTable = oMainTarget.getElementById(sortID);
        if(sortTable.getAttribute('__sortorder__'))
        {
            value = sortTable.getAttribute('__sortorder__');
            if(value == '1')
                sortable.sortOrder = '-1'
            else
                sortable.sortOrder = '1'
            sortTable.setAttribute('__sortorder__',sortable.sortOrder);
        }
        else
        {
            sortable.sortOrder = 1
            sortTable.setAttribute('__sortorder__','1');
        }
        
        sortable.setActiveHeaderClassName(sortHead);
        
        sortable.nodeList = sortTable.getElementsByTagName('tr');
        sortable.checkSetMultipleSort();
        sortable.filterOutSubClasses();
        for(var i = 0; i < sortable.nodeList.length;i++)
        {
            for(var j = 0; j < sortable.nodeList[i].length;j++)
            {
                sortable.nodeList[i][j].parentNode.removeChild(sortable.nodeList[i][j])
            }
        }
        for(var i = 0; i < sortable.sepGrpHolder.length;i++)
        {
            sortable.sepGrpHolder[i].parentNode.removeChild(sortable.sepGrpHolder[i])
        }
        sortable.sortDisplayClear(sortTable,sortHead);
    },
    setActiveHeaderClassName:function(sortHead)
    {
        aTag = sortHead.getElementsByTagName('a')[0]
        
        cssClass = aTag.className.toString()
        var removeFromAllInstances = ['showSortImg1','showSortImg-1','showSortImg0']
        if(cssClass.indexOf('showSortImgNone') != -1)
        {
            cssClass = cssClass.replace('showSortImgNone', 'showSortImg'+sortable.sortOrder)
        }
        else if(cssClass.indexOf('showSortImg1') != -1)
        {
            cssClass = cssClass.replace('showSortImg1', 'showSortImg'+sortable.sortOrder)
        }
        else if(cssClass.indexOf('showSortImg-1') != -1)
        {
            cssClass = cssClass.replace('showSortImg-1', 'showSortImg'+sortable.sortOrder)
        }
        else if(cssClass.indexOf('showSortImg0') != -1)
        {
            cssClass = cssClass.replace('showSortImg0', 'showSortImg'+sortable.sortOrder)
        }
        
        var prevWithCssObjs = sortable.getByClass(removeFromAllInstances);
        for(var i = 0; i < prevWithCssObjs.length;i++)
        {
            for(var j = 0;j < removeFromAllInstances.length;j++)
            {
                css = prevWithCssObjs[i].className.toString();
                prevWithCssObjs[i].className = css.replace(new RegExp(removeFromAllInstances[j])," showSortImgNone ");
            }
        }
        aTag.className = cssClass; 
    },
    checkSetMultipleSort:function()
    {
        var tmpArray = new Array();
        sortable.sepGrpHolder = new Array();
        for (var i = 0; i < sortable.nodeList.length;i++ )
        {
            tmpArray.push(sortable.nodeList[i]);
            
        }
        var saveArr = new Array();
        var prevSlice = 0;
        for(var i = 0; i < tmpArray.length;i++)
        {
            for(var j = 0; j < sortable.seportatorClasses.length;j++)
            {
                if(tmpArray[i].className.indexOf(sortable.seportatorClasses[j]) != -1)
                {
                    tmp = tmpArray;
                    saveArr.push(tmp.slice(prevSlice,i));
                    prevSlice = i;
                    sortable.isMultipleGroupSort = true;
                    sortable.sepGrpHolder.push(tmpArray[i]);
                    sortable.sepIndex = i;
                }
                else if(i == tmpArray.length-1)
                {
                    saveArr.push(tmpArray.slice(prevSlice,tmpArray.length));
                }
            }
        }
        if(sortable.isMultipleGroupSort)
        {
            sortable.nodeList = saveArr;
        }
    },
    sortDisplayClear:function(obj,sortHead)
    {
        /*
            - 0 == c,b,a
            - 1 == a,b,c
        */
        if(sortable.isMultipleGroupSort)
        {
            for(var i = 0; i < sortable.nodeList.length; i++)
            {
                
                sortable.nodeList[i].sort(sortable.sortIntoOrder)
                sortable.display(sortable.nodeList[i],obj)
            }
        }
        else
        {
            sortable.nodeList.sort(sortable.sortIntoOrder);
            sortable.display(sortable.nodeList,obj)
        }
        
        if (sortable.afterSort)
        {
            eval(sortable.afterSort+'(sortable.sortOrder)');
        }
        sortable.nodeList.length = 0;
        sortable.sortOrder = '1';
        sortable.sortTDIndex = 0;
    },
    sortIntoOrder:function(a,b)
    {
        //a and b are tr objects.
       falling = parseInt(sortable.sortOrder);
       
       aValue = a.getElementsByTagName('td')[sortable.sortTDIndex].getAttribute('sortValue');
       bValue = b.getElementsByTagName('td')[sortable.sortTDIndex].getAttribute('sortValue');
       if(isNaN(aValue) &&isNaN(bValue))
       {
           if (unescape(aValue.toLowerCase().replace(/\\\\\\/g, '')) > unescape(bValue.toLowerCase().replace(/\\\\\\/g, ''))){return falling * 1}
           if (unescape(aValue.toLowerCase().replace(/\\\\\\/g, '')) < unescape(bValue.toLowerCase().replace(/\\\\\\/g, ''))){return falling *  -1}
       }
       else
       {
           if (aValue < bValue){return falling * 1}
        if (aValue > bValue){return falling *  -1}
       }
       return 0
    },
    display:function(objList,obj)
    {
        
        obj = obj.getElementsByTagName('tbody')[0];
        for(var i = 0; i < objList.length; i++)
        {
            css = objList[i].className.toString();        
            objList[i].className = css.replace(new RegExp("odd", 'g'), " ");
            if(sortable.activeCCSClass == 'odd')
            {
                objList[i].className =objList[i].className+' odd'
            }
            obj.appendChild(objList[i]);
            if(sortable.activeCCSClass == 'odd')
            {
                sortable.activeCCSClass = '';
            }
            else
            {
                sortable.activeCCSClass = 'odd';
            }
        }
        
        if(sortable.sepIndex == objList.length+1)
        {
            if(sortable.sepGrpHolder)
            {
                obj.appendChild(sortable.sepGrpHolder[0]);
                sortable.sepGrpHolder = null;
            }    
        }
    }
}

function getJavaEnabled()
{
    if(javawsInstalled && navigator.javaEnabled())
    {
        return 1;
    }
    return 0;
}

function _callServerOnlineMeeting(calledFrom, action, noAccess)
{
    if(!calledFrom)
    {
        var calledFromWhere = 'unknown';
        try
        {
            if(tbname)
            {
                calledFromWhere = tbname;
            }
        }
        catch(e){}
    }
    else
    {
        var calledFromWhere = calledFrom;
    }
    // Try to figure out the context to send this to log (meeting, project, user)
    var callID = uid;
    try
    {
        if(projectid && projectid != '0')
        {
            callID = projectid;
            ppXMLHTTP.post(uid,'op=online_meet&pid='+projectid+'&action='+action,calledFromWhere)
        }
    }
    catch(e){}
    
    if(action == 'join')
    {
        if (top.getPluginVersion() >= 8)
            top.downloadAndOpen(callID, 'online_meet&pp_plugin=1&fetch_client_info=p&where='+calledFromWhere, 1)
        else        
            ONLINE_MEETING_WINDOW = window.open('/pp/pp.cgi/0/' + callID+ '?op=online_meet&where='+calledFromWhere+'&fetch_client=p&java=' + getJavaEnabled(),'onlinemeet','width=480,height=240,menubar=0,toolbar=0,alwaysRaised=0,location=0,scrollbars=1,resizable=1');
    }
    else
    {
        if (top.getPluginVersion() >= 8 && !noAccess)
            top.downloadAndOpen(callID, 'online_meet&pp_plugin=1&where='+calledFromWhere, 1)
        else
            ONLINE_MEETING_WINDOW = window.open('/pp/pp.cgi/0/' + callID+ '?op=online_meet&where='+calledFromWhere + '&java=' + getJavaEnabled(),'onlinemeet','width=480,height=240,menubar=0,toolbar=0,alwaysRaised=0,location=0,scrollbars=1,resizable=1');
    }
    return false;
}

function onlineMeeting(calledFrom)
{
    return _callServerOnlineMeeting(calledFrom, '')
}

function joinNetvMeet(calledFrom)
{
    return _callServerOnlineMeeting(calledFrom, 'join')
}

function openNoAccessOnLineMeet(calledFrom)
{
    return _callServerOnlineMeeting(calledFrom, '', true)
}

function canSkype()
{
    var skypeMime = navigator.mimeTypes["application/x-skype"];
    if(typeof(skypeMime) == "object") {
        return true;
    }
    else if(bMSIE)
    {
        if(isSkypeInstalled())
        { 
             return true;
        }
    }
    try
    {
        alert(canNotSkype);
    }
    catch(e){}

    return false
}

function loadisSkypeInstalled()
{
    if(bMSIE)
    {
        document.write(
            ['<script language="VBscript">',
            'Function isSkypeInstalled()',
            'on error resume next',
            'Set oSkype = CreateObject("Skype.Detection")',
            'isSkypeInstalled = IsObject(oSkype)',
            'Set oSkype = nothing',
            'End Function',
            '</script>'].join("\n")
        );
    }
}

// Belongs in something like pp_utils.js, but we don't have that file yet
function getCookieVal(offset)
{
    var c=document.cookie;
    var endstr = c.indexOf (";", offset);
    if (endstr == -1) endstr = c.length;
    return unescape(c.substring(offset, endstr));
}

function GetC(name)
{
  var arg = name + "=";
  var p = document.cookie.indexOf(arg, 0);
  if (p == -1)
      return "";
  return getCookieVal (p + arg.length);
}

// 
var DONT_SHOW_PLUGIN_LINK = 0;
var SHOW_INSTALL_PLUGIN_LINK = 1;
var SHOW_UPGRADE_PLUGIN_LINK= 2;

/**
 * Returns the plugin installation status, i.e. one of DONT_SHOW_PLUGIN_LINK, 
 * SHOW_INSTALL_PLUGIN_LINK and SHOW_UPGRADE_PLUGIN_LINK.
 */
function getPluginStatus()
{
    var  axversion;
    if(bMSIE)
    {
      axversion=AxCheckInstalledVersion();
      // If in some case we can not show the pp plugin text, we should not genereate any js errors. 
      try{
    
         if(axversion == 0)
         {
            return SHOW_INSTALL_PLUGIN_LINK;
         }
         else if (axversion == 1)
         {
            return SHOW_UPGRADE_PLUGIN_LINK;
         }
      }catch(e){}
    }
    return DONT_SHOW_PLUGIN_LINK;    
}

function validateEmailField(formValue) {
	var sText = formValue.replace(/[\s|,|;]+/g,',');
    var aSplitedText = sText.split(",");

    var wrongAddress = new Array();
    var iFaildAdr = 0;
    var re = /^[a-zA-Z0-9]+([-|_|\.][a-zA-Z0-9]+)*@[a-zA-Z0-9\-\.\_\']+\.[a-zA-Z]{2,}$/

    for(var j = 0; j < aSplitedText.length; j++)
    {
        if (aSplitedText[j])
        {
            var re_value  = re.exec(aSplitedText[j])
            if (!re_value || aSplitedText[j] != re_value[0])
            {
                wrongAddress[wrongAddress.length] = aSplitedText[j];
            }
        }
        else
            iFaildAdr++
    }
    if (wrongAddress.length)
        return wrongAddress;
    if(iFaildAdr == aSplitedText.length)
        return 'failed';
    return '';
}

function alertEmailErrorMessage(wrongAddress) {
	if (wrongAddress != '')
    {
		var txt_msg = pp_message('email_empty_alert_js');
        if (wrongAddress == 'failed')
            alert(txt_msg);
        else
        {
            txt_msg = pp_message('email_error_alert_js') +'\n\n';
            for (var i = 0; i < wrongAddress.length;i++)
                txt_msg += wrongAddress[i]+'\n';
            alert(txt_msg);
        }
        return false;
    }
	return true;
}

function validateEmailAdr(adressArr)
{
    var adresses  = adressArr.valueAsString()

    adresses = adresses.replace(/[\s|,|;]+/g,',')
    var aSplitedText = adresses.split(",");
    var re = /^[a-zA-Z0-9]+([-|_|\.][a-zA-Z0-9]+)*@[a-zA-Z0-9\-\.\_\']+\.[a-zA-Z]{2,}$/
    for(var j = 0; j < aSplitedText.length; j++)
    {
        var m  = re.exec(aSplitedText[j])
        if (!m || aSplitedText[j] != m[0])
        {
            return false
        }
    }
    return true;
}

function hideShowInputSelect(target,disp)
{
    if(!target)
    {
        if(oMainTarget)
        {
            var target = oMainTarget;
        }
        else
        {
            var target = document;
        }
    }
    var inputs = target.getElementsByTagName('input');
    var selects = target.getElementsByTagName('select');
    for(var i = 0; i < inputs.length;i++)
    {
        if(inputs[i].type == 'text' || inputs[i].type == 'password')
        {
            inputs[i].style.display = disp;
        }
    }

    for(var i = 0; i < selects.length;i++)
    {
           selects[i].style.display = disp;
    }
}

/*
* Take two select <multiple> lists, and moves the selected objects from the fromList to the toList object
* Sorts the toList after update.
*/
function moveSelected(fromListId, toListId)
{
    if(!fromListId || !toListId)
    {
        return false
    }

    var fromlist = oMainTarget.getElementById(fromListId);
    var tolist = oMainTarget.getElementById(toListId);

    var fromListOptions = fromlist.options

    var toMove = new Array()
    var toListObjects = new Array()
    for(var i = 0; i < fromListOptions.length;i++)
    {
        if(fromListOptions[i].selected)
        {
            toMove.push(fromListOptions[i]);
        }
    }

    var toListOptions = tolist.options;
    for(var i = 0; i < toListOptions.length; i++)
    {
        toListObjects.push(toListOptions[i]);
    }

    toListObjects = toListObjects.concat(toMove)

    toListObjects.sort(sortMoveSelected)

    //Remove all options from the list

    for (var i = 0; i < toListOptions.length; i++)
    {
        toListOptions[i].parentNode.removeChild(toListOptions[i])
    }

    //Add the sorted list
    for (var i = 0; i < toListObjects.length; i++)
    {
        toListObjects[i].selected = false;
        tolist.appendChild(toListObjects[i])
    }
    toMove.length = 0;
}

function sortMoveSelected(a,b)
{
    aValue = a.text
    bValue = b.text

    if (aValue.toLowerCase() > bValue.toLowerCase()){return 1}
    if (aValue.toLowerCase() < bValue.toLowerCase()){return -1}
    return 0;

}

function selectItemsInBox(id)
{
    var box = document.getElementById(id);
    for (var i = 0, n = box.options.length; i < n; i++)
    {
        box.options[i].selected = true;
    }
}

/**
 * remFavoritUser
 * @param {String} userID The user id to remove
 * @param {String} callBackFunc  The function to call when the response is return, as a string
 * @requires uid to be set.
 */
function remFavoritUser(userid,callBackFunc)
{
    ppXMLHTTP._clearCache();
    ppXMLHTTP.post(uid,'op=xmlhttp&remove_fav_user=1&who_id='+userid,callBackFunc);
    hovertext.close();
}

/**
 * addToFavoritUser
 * @param {String} userID The user id to add
 * @param {String} callBackFunc  The function to call when the response is return, as a string
 * @requires uid to be set.
 */
function addToFavoritUser(userid,callBackFunc)
{
    ppXMLHTTP._clearCache();
    ppXMLHTTP.post(uid,'op=xmlhttp&add_fav_user=1&who_id='+userid,callBackFunc);
    hovertext.close();
}

function openUserPage(url)
{
    parent.OpenW(url,'_blank','width=700,height=670,menubar=0,toolbar=0,location=0,scrollbars=0,resizable=0');
    return false
}

ppSort = {
    inOrder:1,
    sortValueToGet:'id',
    doSort:function(aObj,bObj)
    {
       falling = parseInt(ppSort.inOrder);
       
       
       aValue = aObj.getAttribute(ppSort.sortValueToGet);
       bValue = bObj.getAttribute(ppSort.sortValueToGet);
       if(isNaN(aValue) || isNaN(bValue))
       {
           if (unescape(aValue.toLowerCase()) > unescape(bValue.toLowerCase())){return falling * 1}
           if (unescape(aValue.toLowerCase()) < unescape(bValue.toLowerCase())){return falling *  -1}
       }
       else
       {
            if (falling == 1)
            {
                return aValue - bValue;
            }
            else
            {
                return bValue - aValue;
            }
       }
       return 0
    }
}

/**
* _checkIfPPMainPage
* Check if we are on the pp main page. 
* We use leftNavigation to identify that we are on the pp main page.
* Any other page could have the B_NAV frame but they will not have
* the leftNavigation div.
* @param ppWindow - window object
*/
function _checkIfPPMainPage(ppWindow)
{
    if(checkIfAccessToWindow(ppWindow))
    {
    	for(var i = 0; i < ppWindow.frames.length; i++)
		{	
			try
			{
				if(ppWindow.frames[i] && ppWindow.frames[i].name == 'B_NAV')
	        	{
	            	return (ppWindow.frames[i].document.getElementById('leftNavigation') ? true : false);
	        	}
			}
			catch(err)
			{}
	    }
    }
    return false;
}

/**
* _openerPath
* Helper function for openerPath()
* @param openers An array containg window objects. Should contain the originating window for the first call.
* @return An array with all windows down the opener path for the originating window. Starting with the originating window. 
*/
function _openerPath(openers)
{
	var current_window = openers[openers.length - 1];
	var next_opener = null;
	
	next_opener = current_window.top.opener;
	
	if (next_opener != null && next_opener != current_window)
	{
	   
		if(_checkIfPPMainPage(next_opener))
		{
			next_opener = next_opener.top.B_CON;
			openers.push(next_opener);
			return openers;
		}
		openers.push(next_opener);	
		return _openerPath(openers);
	}
	else
	{
		return openers;
	}
}

/**
* openerPath
* Finds all windows in the opener path.
* @return An array with all windows down the opener path for the originating window. Starting with the originating window.           
*/
function openerPath()
{
    var openers = new Array();
    openers.push(window);
    if(_checkIfPPMainPage(window.top))
    {
        return openers
    }
    return _openerPath(openers);
}

function getPPMainWindowTop()
{
	var openers = openerPath();
	return openers[openers.length-1].top;
}

/**
* refreshOpenerWindows
* Refresh all opener windows.
* @param {function} callback - A function to call after the refresh is done.
*/
function refreshOpenerWindows(callback)
{
    var openers = openerPath();
    for(var i = openers.length - 1; i > 0; i--)
    {
        try
        {
            openers[i].frames['B_CON'].location.reload();
        }
        catch(err)
        {
            openers[i].location.reload();
        }
    }
    if (callback)
    {
        callback();
    }
}

/**
 * Get the main window and reload the frames B_NAV and B_LOC if they exists.
 */
function refreshNavigationAndLocationFrames()
{
    var main = getPPMainWindowTop();
    if (main.frames)
    {
        if( main.frames['B_NAV'])
        {
            main.frames['B_NAV'].location.reload(true);
        }
        if (main.frames['B_LOC'])
        {
            main.frames['B_LOC'].location.reload(true);
        }
    }
}

/**
* This is needed for Internet Explorer. If an input field with the name xsrf_token is found outside a form, the IE returns
* the input object.
* @param {Object} win: Makes sure that we get a xsrf token back
*/
function _XSRFVarExists(win)
{
    return win.xsrf_token && typeof(win.xsrf_token) == "string";
}

/**
* getXSRFToken
* Looks for the XSRF token in the path of window openers. Starts in the current window. Returns the first token it finds.
* @return The first XSRF token found in the path of window openers.      
*/
function getXSRFToken()
{
    
    if(_XSRFVarExists(window))
    {
        return xsrf_token;    
    }
    try
    {
        var openers = openerPath();
    }
    catch(e)
    {
        var openers = new Array();
    }
    
    if (openers.length) {
        for (var i = 0; i < openers.length; i++) {
            try {
                bcon = openers[i].top.B_CON
                if (_XSRFVarExists(bcon)) {
                    token = bcon.xsrf_token;
                }
                else {
                    token = bcon.document.getElementById('xsrf_token').value;
                }
                if (token) {
                    return token;
                }
            } 
            catch (err) {
                continue;
            }
        }
    }
    else
    {
        if(document.getElementById('xsrf_token'))
            return document.getElementById('xsrf_token').value;
    }
    return '';
}

/**
* addXSRFField
* Finds the XSRF token (@see getXSRFToken) and appends it to all forms in the document provided.
* @param doc: The document to tokenize.      
*/
function addXSRFField(doc)
{
    if (doc.forms)
    {
        token = getXSRFToken();
        for (i = 0, n = doc.forms.length; i < n; i++)
        {
            var inputArr = doc.forms[i].getElementsByTagName('input');
            var xsrf_tokens = new Array()
            for(var j = 0; j < inputArr.length; j++)
            {
                if(inputArr[j].type == 'hidden' && inputArr[j].name == 'xsrf_token')
                {
                    xsrf_tokens.push(inputArr[j]);
                }
            }
            if (xsrf_tokens.length == 0 && token)
            {        
                var token_input = doc.createElement('input');
                token_input.type = 'hidden';
                token_input.name = 'xsrf_token';
                token_input.value = token;
                doc.forms[i].appendChild(token_input);
            }
        }
    }
}

/**
 * showHideSelects
 * Find select elements in the document object(oMainTarget || document) and hide/show them
 * @param hideElements: Boolean. true=hide the select elements. false =show the select elements
 * Needs Browser.js 
 */
function showHideSelects(hideElements)
{
    if(!bMSIE6)
    {
        return false;
    }

    var _target = oMainTarget|| document;
    var els = _target.getElementsByTagName('select');
    var _showHide = (hideElements?'hidden':'visible');
    for(var i = 0; i < els.length; i++)
    {
        els[i].style.visibility = _showHide;
    } 
}

/**
 * pp.ActionClose is used to close items in a Action container. 
 * See for instance the getting started on the startpage.
 * Dependent on ppXMLHTTP.js and oMaintarget.
 */
pp.ActionClose = 
{
    init:function()
    {
        var closeableEls = new Array();
        var oActionBoxes = oMainTarget.getElementsByClassName('Action closable');
        for(var i = 0; i < oActionBoxes.length; i++)
        {
            contents = oActionBoxes[i].getElementsByTagName('*');
            for(var j = 0;j < contents.length; j++)
            {
                if(contents[j].className == 'close')
                {
                    closeableEls.push(contents[j])
                }
            }
        }
        for(var i = 0; i < closeableEls.length;i++)
        {
            addEvent(closeableEls[i],'click',pp.ActionClose._click,true);
        }
    },
    _click:function(e)
    {
        var oSrcElement = (e.srcElement?e.srcElement:e.target);
        var clickAction = oSrcElement.getAttribute('removeAction');
        var classesToClose = 'rem' + oSrcElement.id;
        var elsToClose = new Array();
        var oActionBoxes = oMainTarget.getElementsByClassName('Action closable');
        
        for(var i = 0; i < oActionBoxes.length; i++)
        {
            contents = oActionBoxes[i].getElementsByTagName('*');
            for(var j = 0;j < contents.length; j++)
            {
                if(contents[j].className == classesToClose)
                {
                    elsToClose.push(contents[j])
                }
            }
        }
        for(var i = 0;i < elsToClose.length;i++)
        {
            elsToClose[i].parentNode.removeChild(elsToClose[i])
        }
        ppXMLHTTP.post(uid,'op=xmlhttp&'+clickAction+'=true','pp.ActionClose._emptyCallBack');
    },
    _emptyCallBack:function(){}
}

/**
 * Update project name in the left navigation with the new project name.
 * @param {String} projectId
 * @param {String} newProjectName
 * @param {Window} navigationFrame
 */
function updateNavigationProjectName(projectId, newProjectName, navigationFrame)
{
    if(navigationFrame)
    {
        proj_nav = 'proj_' + projectId;
        innerHtml = '<a class="contextName" href="' + projectId + '">' + XSSEscape(XSSUnEscape(newProjectName)) + '</a></li>';
        navigationFrame.document.getElementById(proj_nav).innerHTML = innerHtml;
        navigationFrame.document.getElementById(proj_nav).setAttribute('sortName',newProjectName);
        navigationFrame.ppN.sortPresent();
        navigationFrame.ppN.calculateHeight();
    }
}

/**
 * Selects or unselects all checkboxes with id checkboxesId depending on wether
 * the main checkbox with id mainCheckboxId is selected or not. Should be called
 * when the main checkbox is clicked.
 * 
 * @param {String} mainCheckboxId: the id of the main checkbox.
 * @param {String} checkboxesId: the id of all the other checkboxes to be selected.
 */
function syncAllCheckboxesWithId(mainCheckboxId, checkboxesId)
{
    checkAllCheckboxes(oMainTarget.getElementById(mainCheckboxId).checked, checkboxesId)
}

/**
 * Set checked attribute of all checkboxes with id == checkboxesId
 * 
 * @param {Boolean} check: New checked value.
 * @param {String} checkboxesId: the id of all the other checkboxes to be selected.
 */
function checkAllCheckboxes(check, checkboxesId)
{
    var inputElements = oMainTarget.getElementsByTagName('input');
    for (var i = 0; i < inputElements.length; i++)
    {
        if (inputElements[i].type == 'checkbox' && inputElements[i].id == checkboxesId)
        {
            if(!inputElements[i].disabled)
            {
                inputElements[i].checked = check;
            }
        }
    }
}

/**
 * Updates the main checkbox depending on whether all checkboxes with id chexkboxesId
 * are selected or not.
 * 
 * @param {String} mainCheckboxId: the id of the main checkbox.
 * @param {String} checkboxesId: the id of all the checkboxes connected with the main checkbox.
 */
function updateMainCheckbox(mainCheckboxId, checkboxesId)
{
    oMainTarget.getElementById(mainCheckboxId).checked = areAllCheckboxesSelected(checkboxesId);
}

/**
 * Checks whether all checkboxes with id checkboxesId are selected or not.
 * 
 * @param {String} checkboxesId: the id of the checkbox group.
 */
function areAllCheckboxesSelected(checkboxesId)
{
    return areCheckboxesChecked(checkboxesId, MODE_ALL_CHECKED);
}

/**
 * Checks if at least one checkbox with id checkboxesId is checked.
 *
 * @param {String} checkboxesId: the id of the checkbox group.
 */
function isAtLeastOneCheckboxChecked(checkboxesId)
{
    return areCheckboxesChecked(checkboxesId, MODE_ONE_CHECKED);
}

MODE_ALL_CHECKED = 0
MODE_ONE_CHECKED = 1

/**
 * Returns true if one or all checkboxes are selected.
 *
 * @param: checkboxesId: the id of all checkboxes to investigate.
 * @param: mode: MODE_ALL_CHECKED means true is returned only if all checkboxes are checked.
 *               MODE_ONE_CHECKED means true is returned if at least one checkbox is checked.
 */
function areCheckboxesChecked(checkboxesId, mode)
{
    var checkboxes = getCheckboxesWithId(checkboxesId);
    
    if (checkboxes.length == 0)
    {
        return false;
    }
    
    for (var i = 0; i < checkboxes.length; i++)
    {
         if(mode == MODE_ONE_CHECKED && checkboxes[i].checked)
        {
            return true;
        }
        else if(mode == MODE_ALL_CHECKED && !checkboxes[i].checked)
        {
            return false;
        }
    }

    return (mode == MODE_ONE_CHECKED ? false : true);
}

function getCheckboxesWithId(id)
{
    var checkboxes = new Array();
    
    var inputElements = oMainTarget.getElementsByTagName('input');
    for (var i = 0; i < inputElements.length; i++)
    {
         if (inputElements[i].type == 'checkbox' && inputElements[i].id == id)
        {
             checkboxes.push(inputElements[i])
        }
    }

    return checkboxes;
}

/**
 * Opens a window with a Gantt scheme for a project.
 * @param image_href: the href of the Gantt image to display. The width of the image will
 *                    be appended to the url.
 */
function openGanttWindow(image_href)
{
    width = top.screen.width - 10
    height = top.screen.height - 100
    var sep = (image_href.indexOf('?') != -1 ? '&' : '?');
    window.gantt_get_img_href = image_href + sep + 'width=' + (width-20)
    document.gantt_win        = window.open('/gantt_page.html','','width='+width+',height='+height+',menubar=0,toolbar=0,location=0,scrollbars=1,resizable=1')
    setTimeout('document.gantt_win.moveTo(0,0);document.gantt_win.focus()', 10)
}


function cancelWindowEvent(e)
{

    if(window.event)
    {
        window.event.cancelBubble = true;
    }
    else
    {
        e.stopPropagation();
    }
}
/**
 * Does a submit instead of a get from the contextmenu. Vill try and set the checkbox of the element to checked.
 * @param {String} op: The operation name
 * @param {Strin} id: Object id of the checkbox to check and post.
 */
function submitMenuTrigger(op, id)
{
    var checkBoxes = oMainTarget.getElementsByName('id');
    for (i=0; i<checkBoxes.length; i++)
        checkBoxes[i].checked = (checkBoxes[i].value.split("_")[1] == id);
    
    try {
        opInput = oMainTarget.forms[0].op;
        opInput.value = op;
    }
    catch (e) {
        oMainTarget.forms[0].removeChild(oMainTarget.forms[0].operation);
        
        opInput = oMainTarget.createElement('input');
        opInput.value = op;
        opInput.name = 'op';
        opInput.id = 'op';
        opInput.type = 'hidden';
        oMainTarget.forms[0].appendChild(opInput);
    }

    oMainTarget.forms[0].submit();
}

/**
 * Returns the element with the correct tagName(elementType) and index(indexInHierachy)in the parents of rootElement
 * @param {String} elementType
 * @param {Number} indexInHierachy
 * @param {Object} rootElement
 */
function getParentObjectByClassNameAndIndex(elementType, indexInHierachy, rootElement){
	
    var el = rootElement;
    var foundCounter = 0;
	while (el.parentNode != null) {
		el = el.parentNode;
		if (el.tagName.toLowerCase() == elementType.toLowerCase()) {
			foundCounter++;
			if (foundCounter == indexInHierachy) {
				break;
			}	
		}
	}
	return el
}

String.prototype.unescape_string = function()
{
    var keys = {'&quot;':'"', '&#39;': "'", '&amp;': '&', '&lt;': '<', '&gt;':'>'}
    var returnString = this;
    for(key in keys)
    {
        re   = new RegExp(key,'g');
        returnString = returnString.replace(re,keys[key])
    }
    return returnString
}

/**
 * Checks if the string starts with the specified sub string.
 * @param {string} subString: the substring to search for.
 * @return {boolean} - true if the string starts with subString.
 */
String.prototype.startsWith = function (subString)
{
	return (this.indexOf(subString) === 0);
}

if (!Array.prototype.filter)  
{  
  Array.prototype.filter = function(fun /*, thisp */)  
  {  
    "use strict";  
  
    if (this === void 0 || this === null)  
      throw new TypeError();  
  
    var t = Object(this);  
    var len = t.length >>> 0;  
    if (typeof fun !== "function")  
      throw new TypeError();  
  
    var res = [];  
    var thisp = arguments[1];  
    for (var i = 0; i < len; i++)  
    {  
      if (i in t)  
      {  
        var val = t[i]; // in case fun mutates this  
        if (fun.call(thisp, val, i, t))  
          res.push(val);  
      }  
    }  
  
    return res;  
  };  
}

Array.prototype.valueAsString = function()
{
    var returnValue = '';
    for (var i = 0; i < this.length;i++)
    {
        returnValue += this[i]
        tmpI = i
        if(tmpI+1 < this.length)
            returnValue +=','
    }
    return returnValue
}

document.getElementsByClassName = function(className,element)
{
    var testClass = new RegExp("\\b" + className + "\\b");
    if(!element)
    {
        var elm = oMainTarget || document;
    }
    else
    {
        var elm  = element;
    }
    var elements = elm.getElementsByTagName('*');
    var returnElements = [];
    var current;
    var length = elements.length;
    for(var i=0; i<length; i++){
        current = elements[i];
        if(testClass.test(current.className)){
            returnElements.push(current);
        }
    }
    return returnElements;
}

function closeDialog()
{
  if (top.opener != null)
  {// Dialog was opened/initiated by other browser window. Close window
    top.close();
  }
  else
  {// Dialog was opened/initiated by other application; e.g. from email client
    top.location = '/pp/start.cgi';   
  }
}

/**
 * Call this on page load to configure the close button to handle orphan windows. 
 * @param {String} button_id: The id of the close button
 * @param {String} close_string: '%(buttontext_close)s' is recomended
 * @param {String} goto_startpage_string: '%(buttontext_startpage)s' is recomended
 */
function configure_close_button(button_id, close_string, goto_startpage_string)
{
  var close_button = document.getElementById(button_id);
  if (close_button && close_button.type == 'button')
  {
    close_button.onclick = closeDialog;
    if (top.opener != null)
      close_button.value = close_string;
    else
      close_button.value = goto_startpage_string;
  } 
}

/**
 * Function to escape and unescape strings in javascript
 * for XSS protection
*/

function XSSEscape(s)
{
	return s.replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, '&quot;').replace(/&/g, "&amp;")
}
 
function XSSUnEscape(s)
{
	return s.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
}

var minmumContextMenuDivWidth = 200
function reCalMinDocLenght()
{
    var menuDivs = document.getElementsByClassName('context-menu-opener');
    for(var i = 0; i < menuDivs.length; i++)
    {
        if(menuDivs[i].offsetWidth < minmumContextMenuDivWidth)
        {
            menuDivs[i].style.width = minmumContextMenuDivWidth + 'px';
        }
    }
}

function clearDefaultContent(target)
{
    var obj = document.getElementById(target.id);
    if(obj.value == obj.getAttribute('defaultVal'))
    {
        obj.className='text'
        obj.value='';
    }
}
function resetSelf(target)
{
    var obj = document.getElementById(target.id);
    if(obj.value.length == 0){
        obj.className='text inactive';
        obj.value=obj.getAttribute('defaultVal');
    }
}
/**
 * Resets the textfield for cellphones to their dummynumber
 */

function resetEmptyText()
{
    var mob = document.getElementById('mobile_number');
    if(mob.value == mob.getAttribute('defaultVal'))
    {
        mob.value='';
    }
}

function disableInvalidPhoneNumberKeys(entry)
{
    var valid = true;
    var numericOnlyPattern = /^[0-9]*$/;
    var plus = getPlus(entry.value);
    var number = getNumber(entry.value);

    if(!numericOnlyPattern.test(number))
    {
        valid = false;
        number = number.replace(/[^0-9]/g,"");
    }

    if (plus != '+' && !numericOnlyPattern.test(plus))
    {
        valid = false;
        plus = '';
    }
    showFeedbackOnPhoneNumber(entry, valid, plus, number);
}

function showFeedbackOnPhoneNumber(entry, valid, plus, number)
{
	var msg = pp_message('invalid_phone_number_msg');
	if (!valid) 
    {
        document.getElementById("invalid_character_warning_message").innerHTML = msg
        entry.value = plus + number;
    }
    else
    {
        document.getElementById("invalid_character_warning_message").innerHTML = "" 
    }
}

function getPlus(phoneNumber)
{
    return phoneNumber.charAt(0);
}

function getNumber(phoneNumber)
{
    return phoneNumber.substring(1, phoneNumber.length);
}

function getVisualPath(pathToCheck)
{
	var _windows = openerPath();
	var returnValue = '';
	if(parent.isProjectTemplate)
	{
		return returnValue;
	}	
	for(var i = 0; i < _windows.length; i++)
	{
		if(checkIfAccessToWindow(_windows[i]))
		{
			if(pathToCheck == 'cssSubPath')
			{
				tmpCSS = (_windows[i].cssSubPath?_windows[i].cssSubPath:_windows[i].top.cssSubPath)		
				if(tmpCSS)
				{
					returnValue = tmpCSS; 
					break;
				}
			}
			else if(pathToCheck == 'imageSubPath')
			{
				tmpImage = (_windows[i].imageSubPath?_windows[i].imageSubPath:_windows[i].top.imageSubPath)		
				if(tmpImage)
				{
					returnValue = tmpImage; 
					break;
				}
			}	
		}	
	}
	return returnValue;	

}

function getCSSSubPath(win)
{
	return getVisualPath('cssSubPath');	
}

function getImageSubPath(win)
{
	return getVisualPath('imageSubPath');	
}

/**
* checkIfAccessToWindow
* win (window)
* Checks if we have access to the given window object by trying to get the name of it.
* 
* If we don't have access to the window, an exception will be thrown thus letting us know
* that we don't have access. Otherwise we will be able to read the name property and the 
* function will return true.
**/
function checkIfAccessToWindow(win)
{
	try
	{
		win.name //we have access to the window if this doesn't throw an exception
		return true;
	}
	catch(e)
	{
		return false;
	}
}

/**
 * THis function checks for screen resolution and adds special class accordingly
 * @param {String} identifyClassName: The className which identifies element to which special
 *  class is added based on resolution 
 * if identifyClassName is undefined then return true so that class will be changed in place where this funvtion will be called
 */
function handleLowResolution(identifyClassName)
{
		MINSCREENSIZE = 1024;
		if(screen.width <= MINSCREENSIZE)
		{
			if (identifyClassName){
				var aULs = document.getElementsByClassName(identifyClassName);			
				if(aULs.length)
					aULs[0].className += ' lowres';
			}
			else
				return true;
		}
}
/**
 * Changes the hover class on all li:s in the context menu for IE
 * @param {Event} e
 */
function MenuLIHover(e){
	if (e.srcElement.tagName.toLowerCase() != 'a') {
		return false;
	}
	if (e.srcElement.parentNode.className.indexOf(' hover') == -1) {
		e.srcElement.parentNode.className += ' hover';
	}
	else {
		e.srcElement.parentNode.className = e.srcElement.parentNode.className.replace(' hover','')
	}
}

/**
 * Handles event bubbling
 * @param {Event} e
 */
function bubbleHandle(e)
{

	if(window.event){
        window.event.cancelBubble = true;
    }
    else{
       e.stopPropagation();

    }
}

function disappear(obj) 
{
  
  obj = document.getElementById('timeselect_win');
  if(!obj)
  {
    return;
  } 
  if (obj.style.display == "none") {
    obj.style.display = "";
  }
  else {
    obj.style.display = "none";
  }
}
function helpShow(id, extra)
{
    url = ''
    if (!url)
        url = '/pub/' + lang + '.cgi/0/' + id + '?op=help'

    if (extra != '')
        url = url + '&helpop=' + extra

    help_window = window.open(url, "PPHelp");

    return help_window
}
function feedBackWinOpen() 
{
    var url = '/pp/pp.cgi/0/1?op=feedback';
    window.open(url,'feedback','');
}

function textcounter(field, countfield, maxlimit)
{
  if (field.value.length > maxlimit) // if too long...trim it!
  {
    field.value = field.value.substring(0, maxlimit);
  }
  else // otherwise, update 'characters left' counter
  {
    countfield.value = maxlimit - field.value.length;
  }
}

/*
 * This function is used to disable submit buttons to prevent multiple submits.
 * 
 * button {dom object} - the button which should be disabled.
 */
function disablePressedButton(button)
{
	button.disabled='disabled';
}

function openProjSettings(view)
{
  var url = '';
  switch (view)
  {
    case 'news':
      url = '/pp/pp.cgi/s'+uid+'?op=project_admin&sub=project_news';
      parent.OpenW(url, 'AdminW','width=870,height=550,resizable=1,toolbar=0,scrollbars=0,location=0,statusbars=0,menubars=0,toolbar=0');
      break;
    case 'impdocs':
      url = '/pp/pp.cgi/s'+uid+'?op=project_overview&sub=project_documents';
      parent.OpenW(url, 'OvwW', 'width=960,height=640,resizable=1,toolbar=0,scrollbars=0,location=0,statusbars=0,menubars=0,toolbar=0'); 
      break;
    case 'dps':
      url = '/pp/pp.cgi/0/s'+uid+'?op=project_overview&sub=project_schedule';
      parent.OpenW(url, 'OvwW', 'width=960,height=640,resizable=1,toolbar=0,scrollbars=0,location=0,statusbars=0,menubars=0,toolbar=0');
      break;
    default:
      url = '/pp/pp.cgi/0/s'+uid+'?op=project_overview';
      parent.OpenW(url, 'OvwW', 'width=960,height=640,resizable=1,toolbar=0,scrollbars=0,location=0,statusbars=0,menubars=0,toolbar=0');
      break;
  }
  return false;
}

function openFlags(obj)
{
    var objHref = obj.href;
    var winParams = "width=580,height=500,menubar=0,status=1,toolbar=0,location=0,scrollbars=1,resizable=1";
    
    var newsWin = OpenW(objHref,'flagsWin',winParams); 
    return false;    
}

/**
 * Returns the selected option from Radiolist. Returns empty string
 * if nothing is selected in the radio box.
 * @param {Object} boxName Identifier for Radiolist.
 */
function getRadioListValue(boxName)
{
    var radioBoxes = document.getElementsByName(boxName);
    for( i = 0; i < radioBoxes.length; i++ )
    {
        if(radioBoxes[i].checked)
        {
            return radioBoxes[i].value;
        }
    }

    return '';
}

/**
 * positions an object so it appears at the center of the page
 * @param {Object} objId - the id of the DOM object to be positioned
 */
function centerToPage(objId, position){
	var obj = oMainTarget.getElementById(objId);

	obj.style.left = getLeftForCentering() + "px";
	obj.style.top = getTopForCentering() + "px";
	obj.style.position = position;
	obj.style.zIndex = "100";
	obj.style.paddding = "0px";
	obj.style.display = "block";
	obj.style.opacity = "1";
}

/**
 * calculates the value for style.left for centering an object to the page
 */
function getLeftForCentering(){
    if (oMainTarget.documentElement.clientWidth) 
        var _middle = (oMainTarget.documentElement.clientWidth / 2) - 250
    else 
        var _middle = (oMainTarget.body.clientWidth / 2) - 250;
    return _middle;
}
/**
 * calculated style.top value for centering an object to the page
 */
function getTopForCentering()
{
	return oMainTarget.body.scrollTop + 100;
}

function goto_e_learning_demo()
{
  top.OpenW(demoFilmAccessRights, 'AdminW','width=870,height=550,resizable=1,toolbar=0,scrollbars=0,location=0,statusbars=0,menubars=0,toolbar=0');
}

function showHelpAccessRights()
{
	top.OpenW(learnAboutAccessRights,'AccessRights');
}
