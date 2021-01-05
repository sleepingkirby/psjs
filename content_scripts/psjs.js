

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

  /*--------------------
  pre: everything. patt is a string of pattern
  post: modifies the setting
  greps the entire html of the page and returns what it finds to the settings
  ---------------------*/
  function grepHTML(patt){
    if(!patt){
    return false;
    }

    var html=document.documentElement.innerHTML;
    var regexPatt = new RegExp(patt, "ig");
    var strings=html.match(regexPatt);
    //console.log("mewate: pattern fount matches");
    //console.log(strings);
      if( strings==null ||  !strings || strings.length<=0){
      return false;
      }
    var lns='';
      for(let ln of strings){
      lns=lns+ln+'\n';
      }
  
  return lns;
  }

  function autoPull(item){
    if(item.hasOwnProperty('autoChck') && item.autoChck){
    console.log('mewate: auto pulling results with pattern '+item.patt);
    var lns=grepHTML(item.patt);
      if(lns && lns!=''){
      lns=item.list+lns;
        chrome.storage.local.set({list:lns},() => { 
        console.log('mewate: auto pull found results');
        chrome.runtime.sendMessage({bdgNm: lns.trim().split(/\r\n|\r|\n/).length.toString()});
        });
      }
      else{
      console.log('mewate: auto pull found no results');  
      }
    } 
  }


/*
    //auto pull 
    chrome.storage.local.get( null ,(item) => {
      if(item.hasOwnProperty('autoPgChck') && item.autoPgChck){
        if(item.hasOwnProperty('autoCChck') && item.autoCChck){
          item.list='';
          chrome.storage.local.set({'list':""} ,() => {
          console.log("mewate: auto purging list");
          chrome.runtime.sendMessage({bdgNm: ""});
          autoPull(item);
          });
        }  
        else{
        autoPull(item);
        }
      }

       a lot of pages these days change URL but not a change page.
        I haven't decided if "auto clear" means "clear on find" or "clear
        on new page" yet. Until then, this "clear on new page" is commented
        out 
      else{
        if(item.hasOwnProperty('autoCChck') && item.autoCChck){
          chrome.storage.local.set({'list':""} ,() => {
          console.log("mewate: auto purging list");
          chrome.runtime.sendMessage({bdgNm: ""});
          });
        }
      }
      
    });
*/

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
rasdfasdfasdfasdfasdfasdfasdfeqwer();
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
throw new Error("PSJS: Gracefully stopping all JS. "+msg);
}

/*------------------------------------------------ 
pre: none
post: assigns null function to addEventListener
assigns null function addEventListener function
to prevent any new eventlisteners from being added
------------------------------------------------*/
function preventEventListener(){
//window.addEventListener('contextmenu',function(e){e.stopPropagation();}, true);
//window.addEventListener=funcion(){}; assigns a null function to event listener, stopping it to assign any new eventListener 

console.log("PSJS: Injecting code to prevent all attempts to add an event listener.");
  EventTarget.prototype.addEventListener=function(type,listener){
  console.log("PSJS: An attempt to add event listener of type: \""+type+"\", with listener: \""+listener+"\"");
  }


var injectedCode = '(' + function() {
  EventTarget.prototype.addEventListener=function(type,listener){
  console.log("PSJS: An attempt to add event listener of type: \""+type+"\", with listener: \""+listener+"\"");
  }
} + ')();';

var script = document.createElement('script');
script.textContent = injectedCode;
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

}


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
  parseXHRList(d.xhrLst);//caching applyLst into easily findable hash
  var host=window.location.host;

  //global setting application
  if(!ignrLst.hasOwnProperty(host)){
    //breaking javascript
    if(d.breakJs){
    breakJs();
    }

    // stopping javascript
    if(d.stopJs){
    stopJs();
    }

    if(d.prvntEvnt){
    preventEventListener();
    }
  }
  else{
  console.log("PSJS: Host name on ignore list: "+host);
  }

  

});





//gracefully stop all javascript
//throw new Error();
//stops propagation of the event to prevent additional listeners from intercepting. 
//don't forget to find all elements with oncontextmenu and remove it.
//window.addEventListener('contextmenu',function(e){e.stopPropagation();}, true);
//window.addEventListener=funcion(){}; assigns a null function to event listener, stopping it to assign any new eventListener 

XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(value) {
    this.addEventListener("progress", function(){
        console.log("Loading");
    }, false);
    this.realSend(value);
};


chrome.runtime.onMessage.addListener(runOnMsg);
})();




