
var eTypes=["abort", "afterprint", "animationend", "animationiteration", "animationstart", "beforeprint", "beforeunload", "blur", "canplay", "canplaythrough", "change", "click", "contextmenu", "copy", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "ended", "error", "focus", "focusin", "focusout", "fullscreenchange", "fullscreenerror", "hashchange", "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata", "loadstart", "message", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseup", "mousewheel", "offline", "online", "open", "pagehide", "pageshow", "paste", "pause", "play", "playing", "popstate", "progress", "ratechange", "resize", "reset", "scroll", "search", "seeked", "seeking", "select", "show", "stalled", "storage", "submit", "suspend", "timeupdate", "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitionend", "unload", "volumechange", "waiting", "wheel"];

var xhrTypes=["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"];



function addNewRow( className ){
var tbl=document.getElementsByClassName(className);
var newIn="";
}

//convert text lines to obj
function txtArToObj(str){
var lines=str.split("\n");
console.log(lines);
var rtrn={};
  for(let item of lines){
    if(item && item !== "\n"){
    var tokPos=item.indexOf('|');
    var indx=tokPos>0?item.substr(0,tokPos):item;
    var patt=item.substr(tokPos+1,item.length-tokPos);
      if( tokPos < 0 || patt.length === 0 || patt == ""){
      patt=null;
      }
    rtrn[indx]=patt;
    }
  }
return rtrn;
}

//convert object to text lines
function objToTxtAr(obj){
var rtrn="";
var nl="";
  for(var key in obj){
    if(obj[key] === undefined || obj[key] === null){
    rtrn+=nl+key;
    }
    else{
    rtrn+=nl+key+"|"+obj[key];
    }
  nl="\n";
  }
return rtrn;
}


function saveNotify( obj, str, appnd=false){
console.log('butWhyMod: ' + str);
    if(appnd){
    obj.appendChild(document.createElement("br")); 
    obj.appendChild(document.createTextNode(str)); 
    }
    else{
      //clear all children
      while(obj.firstChild){
        obj.firstChild.remove();
      }
    obj.appendChild(document.createTextNode(str)); 
    }
}


function genSelect(elId, arr){
  if(!Array.isArray(arr)){
  return false;
  }

let el = document.getElementById(elId);
  if( el == null ){
  return false;
  } 
 
  arr.forEach((a) => {
  var node = document.createElement("option");
  var textnode = document.createTextNode(a);
  node.appendChild(textnode);
  el.appendChild(node);
  });

return true;
}


function setMsg(el){
    document.getElementById(el.getAttribute("msgId")).innerText=el.getAttribute("info");
    document.getElementById(el.getAttribute("msgId")).style=el.getAttribute("msgStyl");
}

function clearMsg(el){
    document.getElementById(el.getAttribute("msgId")).innerText="";
    document.getElementById(el.getAttribute("msgId")).style="";
}



//main function
function startListen(){
  document.addEventListener("click", (e) => {
    switch(e.target.name){
      case 'savePref':
      //grab settings, parse and enter into storage.local
      var custList=document.getElementsByClassName('custListTxt')[0].value;
      var custListObj=txtArToObj(custList);
      var custDmnPat=document.getElementsByClassName('custDmnPatTxt')[0].value;
      var custDmnPatObj=txtArToObj(custDmnPat);
      var custDmnSty=document.getElementsByClassName('custDmnStyTxt')[0].value;
      var custDmnStyObj=txtArToObj(custDmnSty);

      var notif=document.getElementsByClassName('notify')[0];
      notif.id='';
      notif.innerHTML='';

        //setting custom list
        chrome.storage.local.set({custList: custListObj},saveNotify(notif, 'Ignore List saved.', false ));

        //setting custom domain pattern list
        chrome.storage.local.set({custDmnPatList: custDmnPatObj}, saveNotify(notif, 'Custom domains and patterns saved.', true ));

        //setting custom domain style patterns list
        chrome.storage.local.set({custDmnStyList: custDmnStyObj}, saveNotify(notif, 'Custom domains and styled patterns saved.', true ));


      notif.id='fadeOut';
        notif.addEventListener("animationend", ()=>{
        notif.id='';
        });
      break;
      default:
        if( e.target.hasAttribute('msgId') && e.target.id == e.target.getAttribute('msgId')){
          document.getElementById(e.target.getAttribute("msgId")).innerText="";
          document.getElementById(e.target.getAttribute("msgId")).style="";
        }
        else if(e.target.hasAttribute('msgId') && e.target.hasAttribute('info') ){
          document.getElementById(e.target.getAttribute("msgId")).innerText=e.target.getAttribute("info");
          document.getElementById(e.target.getAttribute("msgId")).style=e.target.getAttribute("msgStyl");
        }
      break;
    }
  });

}


/*
//getting saved settings
chrome.storage.local.get(null,(item) => {

    //set default
    if(!item.hasOwnProperty('mnl')){
    console.log('butWhyMod: manual setting doesn\'t exist. Setting default value.');
    item={mnl: true};
    chrome.storage.local.set({mnl: true});
    }


    //gets ignorelist and custom domain modal removal class
    //also sets defaults if the variables doesn't exist.
  var custList={};
    if(item.hasOwnProperty('custList') === false){
      chrome.storage.local.set({custList: {'mail.google.com': null, 'twitter.com': null }});
    custList={'mail.google.com': null, 'twitter.com': null };
    }
    else{
    custList=item.custList;
    }

  var custDmnPatList={};
    if(!item.hasOwnProperty('custDmnPatList')){
    chrome.storage.local.set({custDmnPatList: {'www.facebook.com':'_5hn6'}});
    custDmnPatList={'www.facebook.com':'_5hn6'};
    }
    else{
    custDmnPatList=item.custDmnPatList;
    }

  var custDmnStyList={};
    if(!item.hasOwnProperty('custDmnStyList')){
    chrome.storage.local.set({custDmnStyList: {}});
    custDmnStyList={};
    }
    else{
    custDmnStyList=item.custDmnStyList;
    }

 //document.getElementsByClassName('custListTxt')[0].value=objToTxtAr(custList);
 //document.getElementsByClassName('custDmnPatTxt')[0].value=objToTxtAr(custDmnPatList);
 //document.getElementsByClassName('custDmnStyTxt')[0].value=objToTxtAr(custDmnStyList);
});
*/


//running main function

genSelect("lstnEvents", eTypes);
genSelect("xhrTypes", xhrTypes);
startListen();
