types:'use strict';

var applyLst={};
var ignrLst={};
var xhrLst={};
var conf={};

//gets hostname from url
function hostFromURL(str){
var rtrn=str;
var proto=rtrn.match(/[a-z]+:\/\/+/g);
rtrn=rtrn.substr(proto[0].length,rtrn.length);

var end=rtrn.search('/');
  if(end>=0){
  rtrn=rtrn.substr(0,end);
  }

return rtrn;
}


//parses pipe list 
function parsePipeList(str){
  if(!str || str==""){
  return {};
  }

var tmpLst= str.split("|");
var rtrn={};
  for(let v of tmpLst){
    rtrn[v]=1;
  }
return rtrn;
}

function parseXHRList(str){
console.log("PSJS: caching Network List");
xhrLst=parsePipeList(str);
return 0;
}


//puts ignore list into hash for easy search
function parseIgnoreList(str){
  if(!str || str==""){
  ignrLst={};
  return 1;
  }
console.log("PSJS: caching Ignore List");
var tmpLst=str.split("\n");
  for(let v of tmpLst){
    ignrLst[v]=1;
  }
return 0;
}

//parses the string for applyLst in chrome.storage.local into a hash that's easily searchable
function parseApplyList(str){
  if(!str || str==""){
  return 1;
  }

console.log("PSJS: Parsing and caching custom apply list...");
var arr=str.trim().split("\n");
var tmpl=['applyLstDmn','applyLstEnbld', 'applyLstBrkJs', 'applyLstStpJs', 'applyLstEvnt', 'applyLstXHR', 'applyLstEvntCst', 'applyLstNtwrk'];
 
  for(let ln of arr){
  var set=ln.split(",");
  var m=set.length;
  applyLst[set[0]]={};
  applyLst[set[0]][tmpl[1]]=set[1];
  applyLst[set[0]][tmpl[2]]=set[2];
  applyLst[set[0]][tmpl[3]]=set[3];
  applyLst[set[0]][tmpl[4]]=set[4];
  applyLst[set[0]][tmpl[5]]=set[5];
  applyLst[set[0]][tmpl[6]]={};
  applyLst[set[0]][tmpl[7]]={};

    if(set.length>=7){
    var evnt=set[6].split("|");
    var em=evnt.length;
      for(let ei=0; ei<em; ei++){
      applyLst[set[0]][tmpl[6]][evnt[ei]]=1;   
      }
    }

    if(set.length>=8){
    var ntwrk=set[7].split("|");
    var nm=ntwrk.length;
      for(let ni=0; ni<nm; ni++){
      applyLst[set[0]][tmpl[7]][ntwrk[ni]]=1;   
      }
    }
  }
return 0;
}


//============================== main code ran ====================================

chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });


//listener for contentScript
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if(msg.hasOwnProperty('bdgNm')) {
    chrome.browserAction.setBadgeText({text: msg.bdgNm});
  }
});

//initializing the extension settings if no settings exists
chrome.storage.local.get(null, (d) => {
  if(Object.keys(d).length <= 0){
  var obj={"applyLst": "","breakJs": false,"evntLst": "","evntLstBool": false,"ignrLst": "","on": true,"prvntEvnt": false,"prvntXhr": false,"stopJs": false,"xhrLst": "","xhrLstBool": false};
    chrome.storage.local.set(obj,(e)=>{
    console.log("PSJS: No settings found for extension. Initializing settings.");
    conf=obj;
    //the 2 functions below *should* run, if it were not for the fact that we 100% know both ingrLst and applyLst is empty; If the default ever changes, we can uncomment these
    //parseApplyList(obj.applyLst);
    //parseIgnoreList(obj.ignrLst);
    //parseXHRList(obj.xhrLst);
    });
  }
  else{
  //doing this twice as there's no telling that the previouvs set will happen before this runs
  parseApplyList(d.applyLst);//caching applyLst into easily findable hash
  parseIgnoreList(d.ingrLst);//caching applyLst into easily findable hash
  parseXHRList(d.xhrLst);//caching applyLst into easily findable hash
  conf=d;
  }
});


//listen to changes on applyLst reparse if changes exist
chrome.storage.onChanged.addListener(function(c,n){
  if(n=="local"){
    if(c.hasOwnProperty("applyLst")){
    parseApplyList(c.applyLst.newValue);
    }
    if(c.hasOwnProperty("ignrLst")){
    parseIgnoreList(c.ignrLst.newValue);
    }
    if(c.hasOwnProperty("xhrLst")){
    parseXHRList(c.xhrLst.newValue);
    }
    var arr=Object.keys(c);
    for(let i of arr){
    conf[i]=c[i].newValue;
    }
  }
});


//  chrome.webRequest.onBeforeRequest.addListener(callback, filter, opt_extraInfoSpec); 
/*
frameId: 29531
initiator: "https://lovetvshow.cc"
method: "GET"
parentFrameId: 0
requestId: "471764"
tabId: 2473
timeStamp: 1608739201986.1008
type: "xmlhttprequest"
url: "https://diaoshi.dehua-kuyun.com/20201012/19401_8688b4df/1000k/hls/48709064ea7000088.ts"
__proto__: Object

types:
"main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", or "other" 
*/
//{"applyLst": "","breakJs": false,"evntLst": "","evntLstBool": false,"ignrLst": "","on": true,"prvntEvnt": false,"prvntXhr": false,"stopJs": false,"xhrLst": "","xhrLstBool": false}
/*---------------------------------------------
pre: on, ignrLst, xhrLstBool, xhrLst, global var applyLst, applyLst Parser, 
post: none
goes through the applyLst and applies the rules
---------------------------------------------*/
chrome.webRequest.onBeforeRequest.addListener(
  function(details){
    //if turned off, do NOTHING
    if(!conf.on){
    console.log("PSJS: Extension turned off. Nothing to be done."); 
    return {};
    }
    
    let host=hostFromURL(details.url);
    if(!ignrLst.hasOwnProperty(host)){ //if domain is in ignore list, don't run global settings
      if(conf.xhrLstBool){ //run only if xhrLstBool is turned on
        if(xhrLst.hasOwnProperty(details.type)){
        console.log("PSJS: Request to \""+details.url+"\" of type \""+details.type+"\" blocked by global setting.\"");
        return {cancel: true};
        }
      }
    }
    else{
    console.log("PSJS: Global settings ignored due to domain being in the \"Ignore List\": "+host);
    }
    
    //if applyLst is empty, block nothing.
    if(Object.keys(applyLst).length<=0){
    return {};
    }

    if(applyLst.hasOwnProperty(host) && applyLst.applyLstEnbld){
      if(applyLst[host].applyLstNtwrk.hasOwnProperty(details.type)){
      console.log("PSJS: network call of host \""+host+"\" with type \""+details.type+"\" blocked due to \"apply List rules\": "+details.url);
      return {cancel: true}; //return {cancel: true}; //returning {cancel: true} will prevent/stop the network call
      }
    }
    
  },
{urls: ["<all_urls>"]},['blocking']);




chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {urlMatches: '(http|https|file):/+[a-z]*'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

