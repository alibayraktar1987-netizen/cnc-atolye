(function(){
  var root=document.documentElement;
  var tabId=(root.getAttribute("data-tab")||"").trim();
  if(!tabId){
    return;
  }
  var next=new URL("index.html",window.location.href);
  var params=new URLSearchParams(window.location.search||"");
  params.set("tab",tabId);
  next.search=params.toString();
  next.hash=window.location.hash||"";
  window.location.replace(next.toString());
})();
