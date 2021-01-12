//loading external files and settings.
(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */


  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  

  
  /*--------------------------
  pre: none
  post: none
  new fangled wait function 
  https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
  ---------------------------*/
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  /*-----------------------
  pre: pageDone()
  post: none
  runs pageDone after "secs" amount of time
  -----------------------*/
  async function delayRun(secs=6500) {

    console.log('butWhyMod: Setting time for delayed modal removal for ' + secs + " milliseconds");
    await sleep(secs);
    console.log('butWhyMod: Time\'s up. Running delayed modal removal.');
    pageDone();
  }

  /*--------------------
  pre: everything above here
  post: everything modified as a result of running functions above here
  the main logic for what to do when a message comes in from the popup menu
  ---------------------*/
  function runOnMsg(request, sender, sendResponse){
    switch(request.action){
      case 'pullPatt':
      break;
      default:
      break;
    }
  }


/*------------------------------------------------ 
pre: none
post: breaks javascript
No, really, this functions just runs broken 
javascript code. This is the *nuclear* option for
pages that are really smart about running their 
javascript code.
------------------------------------------------*/
function breakJs(){
console.log("PSJS: Breaking javascript as requested...");

var injectedCode = '(' + function() {
rasdfasdfasdfasdfasdfasdfasdfeqwer();
} + ')();';
var s = document.createElement('script');
s.textContent = injectedCode;
(document.head || document.documentElement).appendChild(s);

}

/*------------------------------------------------ 
pre: none
post: throws error
attempts to stop all JS by throwing an error. 
Should do the trick most of the time. If it doesn't...
that's what breakJs() is for.
param: str to append to message.
------------------------------------------------*/
function stopJs(str){
var msg="";
  if( str && (typeof str === 'string' || str instanceof String) && str!=""){
  msg=str;
  }
console.log("PSJS: Gracefully stopping all JS as requested. "+msg);
var injectedCode = '(' + function() {
throw new Error("PSJS: Gracefully stopping all JS. ");
} + ')();';
var s = document.createElement('script');
s.textContent = injectedCode;
(document.head || document.documentElement).appendChild(s);

}

/*------------------------------------------------ 
pre: none
post: assigns null function to addEventListener
assigns null function addEventListener function
to prevent any new eventlisteners from being added
------------------------------------------------*/
function preventEventListener(){
//window.addEventListener('contextmenu',function(e){e.stopPropagation();}, true);
//window.addEventListener=function(){}; //assigns a null function to event listener, stopping it to assign any new eventListener 

console.log("PSJS: Preventing all event listeners from running.");
var injectedCode = '(' + function() {
  EventTarget.prototype.addEventListener=function(type,listener){
  console.log("PSJS: An attempt to add event listener of type: \""+type+"\", with listener: \""+listener+"\"");
  }
} + ')();';

var s = document.createElement('script');
s.textContent = injectedCode;
(document.head || document.documentElement).appendChild(s);
s.parentNode.removeChild(s);

}

/*------------------------------------------------ 
pre: none
post: assigns null function to xhr's send function
assigns null function send function
to prevent any new send from being added
------------------------------------------------*/
function preventXHRListener(){
console.log("PSJS: Preventing all AJAX listeners from running.");
var injectedCode = '(' + function() {
  XMLHttpRequest.prototype.send = function(v) {
  console.log("PSJS: An attempt to send an AJAX call was made with value: \""+v+"\". And object:");
  console.log(this);
  }
} + ')();';

var s = document.createElement('script');
s.textContent = injectedCode;
(document.head || document.documentElement).appendChild(s);
s.parentNode.removeChild(s);

}

/*------------------------------------------------ 
pre: evntLst (list of type types to stop, from common.js) 
post: adds stopPropagation() to the listener of each type
goes through evntLst and assigns a stopPropagation() to each
type 
------------------------------------------------*/
function stopEventListeners(obj, msg=""){
console.log("PSJS: Stopping propagation on selected event types "+msg);
  if(typeof obj !== 'object' || obj === null){
  console.log("PSJS: Event list "+msg+"is empty or not an object. Quitting.");
  }

var k=Object.keys(obj).length;
  if(k<=0){
  console.log("PSJS: List of events types "+msg+"is empty. Doing nothing");
  return 1;
  }

  for(let t of k){
  console.log("PSJS: Stopping propagation on type \""+t+"\"" + msg);
  window.addEventListener(t,function(e){e.stopPropagation();e.stopImmediatePropagation();}, true);
  }

}


//================================================= main code run ====================================================
var conf={};

chrome.storage.local.get(null, function(d){
console.log("PSJS: Starting...");

  if(!d.on){
  console.log("PSJS: Extension is turned off... Doing nothing.");
  return 0;
  }

  //setting up conf and hash
  parseApplyList(d.applyLst);//caching applyLst into easily findable hash
  parseIgnoreList(d.ignrLst);//caching applyLst into easily findable hash
  xhrLst=parseXHRList(d.xhrLst);//caching applyLst into easily findable hash
  evntLst=parseEventList(d.evntLst);//caching applyLst into easily findable hash
  var host=window.location.host;

  //-----global setting application-----
  if(!ignrLst.hasOwnProperty(host)){
    //breaking javascript
    if(d.breakJs){
    breakJs();
    }

    // stopping javascript
    if(d.stopJs){
    stopJs();
    }
    
    // preventing event listeners
    if(d.prvntEvnt){
    preventEventListener();
    }

    //prevent XHR's send function
    if(d.prvntXhr){
    preventXHRListener();
    }
    
    if(d.evntLstBool){
    stopEventListeners(evntLst);
    }

    //xhrLstBool/xhrLst handled in background.js

  }
  else{
  console.log("PSJS: Host name on ignore list: "+host);
  }

  //-----apply list-----


  /*
{www.youtube.com: {…}}
www.youtube.com:
applyLstBrkJs: "true"
applyLstEnbld: "true"
applyLstEvnt: "true"
applyLstEvntCst:
contextmenu: 1
scroll: 1
__proto__: Object
applyLstNtwrk:
ping: 1
xmlhttprequest: 1
__proto__: Object
applyLstStpJs: "true"
applyLstXHR: "true"
  */
  console.log(applyLst); 
  if(applyLst.hasOwnProperty(host) && applyLst[host].applyLstEnbld){
  console.log("PSJS: Domain \""+host+"\" in apply list. Applying custom settings.");
  //breakjs
    if(applyLst[host].applyLstBrkJs){
    console.log("PSJS: Break javascript for domain \""+host+"\" is turned on.");
    breakJs();
    }

    // stopping javascript
    if(applyLst[host].applyLstStpJs){
    console.log("PSJS: Stop javascript for domain \""+host+"\" is turned on.");
    stopJs();
    }

    // preventing event listeners
    if(applyLst[host].applyLstEvnt){
    console.log("PSJS: Preventing any event listeners for domain \""+host+"\" is turned on.");
    preventEventListener();
    }

    //prevent XHR's send function
    if(applyLst[host].applyLstXHR){
    console.log("PSJS: Preventing AJAX for domain \""+host+"\" is turned on.");
    preventXHRListener();
    }


    if(Object.keys(applyLst[host].applyLstEvntCst).length > 0){
    stopEventListeners(applyLst[host].applyLstEvntCst, "for apply list on domain: \""+host+"\"");
    }
  }


});


chrome.runtime.onMessage.addListener(runOnMsg);
})();




