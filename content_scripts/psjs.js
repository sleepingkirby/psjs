

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
  window.hasModaled = false;

  

  
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
        chrome.storage.local.get(null, (item) => {
        console.log('mewate: pull results with pattern '+item.patt);
        var lns=grepHTML(item.patt);
          if(lns && lns!=''){
          lns=item.list+lns;
            chrome.storage.local.set({list:lns},() => { 
            console.log('mewate: results found.');
            chrome.runtime.sendMessage({bdgNm: lns.trim().split(/\r\n|\r|\n/).length.toString()});
            sendResponse({'list':lns});
            });
          }
          else{
          console.log('mewate: no results found.');  
          }
        });
        sendResponse({'pullPatt':'done'});
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

console.log("starting psjs");


//gracefully stop all javascript
//throw new Error();
//stops propagation of the event to prevent additional listeners from intercepting. 
//don't forget to find all elements with oncontextmenu and remove it.
//document.addEventListener('contextmenu',function(e){event.stopPropagation();}, true);



  chrome.runtime.onMessage.addListener(runOnMsg);
})();




