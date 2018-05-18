var token_add_signature = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='add_signature'&&request.order==='start'&&token_add_signature==null)
  {
    token_add_signature=request.token;
    startAddSignature();
  }
  else if(request.to==='add_signature'&&request.order==='click'&&token_add_signature==request.token)
  {
    startAddSignature();
  }
});

function startAddSignature()
{
  
}