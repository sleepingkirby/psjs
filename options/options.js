
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


//gets hostname from url
function hostFromURL(str){
var rtrn=str;
var proto=rtrn.match(/[a-z]+:\/\/+/g);
var rtrn=rtrn.substr(proto[0].length,rtrn.length);
var end=rtrn.search('/');
var rtrn=rtrn.substr(0,end);
return rtrn;
}

/*
        chrome.tabs.query({active: true, currentWindow: true},(tabs) => {
        var url=tabs[0].url;
        var host=hostFromURL(url);
          chrome.storage.local.get('custList',(custList) => {
          var newCL=custList.custList;
          newCL[host]=null;
            var notif=document.getElementsByClassName('notify')[0];
            notif.id=''; //resets the notification area animation
            chrome.storage.local.set({custList: newCL},()=>{
            console.log('butWhyMod: added host to custom List ' + host);
            notif.textContent='\'' + host + '\' added to white list.';
            notif.id='fadeOut';
            notif.addEventListener("animationend", ()=>{
            notif.id='';
            });
            })
          });
        });
*/

function compileOpts(){
var dmn=document.getElementById('applyLstDmn').value;
  if(!dmn || dmn==""){
  return ['',''];
  }
var arr=['applyLstEnbld', 'applyLstBrkJs', 'applyLstStpJs', 'applyLstEvnt', 'applyLstXHR', 'applyLstEvntCst', 'applyLstNtwrk'];
var kv={};
var str=dmn;
var v="";
  for(let idStr of arr){
    var tmpEl=document.getElementById(idStr);
    v=tmpEl.type=="checkbox"?tmpEl.checked:tmpEl.value;
    str+=","+v;
  }
return [dmn,str];
}

//main function
function startListen(){
  document.addEventListener("click", (e) => {
    switch(e.target.getAttribute("act")){
      case 'save':
        //save self
        if( !e.target.hasAttribute("actFor") || e.target.getAttribute("actFor")=="self"){
        var obj={};
        obj[e.target.name]=e.target.type=="checkbox"?e.target.checked:e.target.value;
          chrome.storage.local.set(obj, function(){
            chrome.storage.local.get(null, function(e){
            console.log(e);
            });
          }); 
        break;
        }
    
        //save for element
        var tmpEl=document.getElementById(e.target.getAttribute("actFor"));
        var value=tmpEl.type=="checkbox"?tmpEl.checked:tmpEl.value;
        if(tmpEl.hasAttribute("name")){
        var obj={};
        obj[tmpEl.name]=value;
          chrome.storage.local.set(obj, function(e){
            chrome.storage.local.get(null, function(e){
            console.log(e);
            });
          });
        }
      break;
      case 'convAndAdd':
        var arr=compileOpts();
        var el=document.getElementById("applyLstTA");
        if(arr[0]!="" && !el.textContent.includes(arr[0])){
        el.textContent=el.textContent+arr[1]+"\n";
        }
      break;
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
      case 'addLstnTxtInptSbmt':
      //var tmpEl=document.getElementById("addLstnTxtInpt");
      //console.log(tmpEl);
      //console.log(e.target);
      break;
      default:
      break;
    }
  });

  document.addEventListener("mouseover", (e) => {
    switch(e.target.name){
      default:
         if(e.target.hasAttribute('mMsgId') && e.target.hasAttribute('info') ){
          document.getElementById(e.target.getAttribute("mMsgId")).innerText=e.target.getAttribute("info");
          document.getElementById(e.target.getAttribute("mMsgId")).classList.add(e.target.getAttribute("msgClass"));
        }
      break;
    }
  });

  document.addEventListener("mouseout", (e) => {
    switch(e.target.name){
      default:
         if(e.target.hasAttribute('mMsgId') && e.target.hasAttribute('info') ){
          document.getElementById(e.target.getAttribute("mMsgId")).classList.remove(e.target.getAttribute("msgClass"));
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

startListen();
