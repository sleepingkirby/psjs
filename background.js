'use strict';

chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });

//listener for contentScript
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if(msg.hasOwnProperty('bdgNm')) {
    chrome.browserAction.setBadgeText({text: msg.bdgNm});
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

      chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
        console.log("============>>");
        console.log(details);
        //return {cancel: true}; //returning {cancel: true} will prevent/stop the network call
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

