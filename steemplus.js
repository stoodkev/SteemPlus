var hide_resteem=false;
var username="";

chrome.storage.local.get(['username','hide_resteem'], function (items) {
    console.log('fe');

    if(items.hide_resteem!==undefined)
        hide_resteem=items.hide_resteem;
    if(items.username!==undefined)
        username=items.username;
    console.log('plop',items.hide_resteem);
    hide();
});



function hide() {
    if(hide_resteem) {

            tab = window.location.href;
            console.log(tab,"https://steemit.com/@"+username);
            if(username===""||tab!=="https://steemit.com/@"+username) {
                var reblogged = document.getElementsByClassName("PostSummary__reblogged_by");
                //console.log(reblogged);
                for (var i = 0; i < reblogged.length; i++) {
                    reblogged[i].parentNode.style.display = 'none';
                }
            }
    }
}



function onElementHeightChange(elm, callback){
    var lastHeight = elm.clientHeight, newHeight;
    (function run(){
        newHeight = elm.clientHeight;
        if( lastHeight != newHeight )
            callback();
        lastHeight = newHeight;

        if( elm.onElementHeightChangeTimer )
            clearTimeout(elm.onElementHeightChangeTimer);

        elm.onElementHeightChangeTimer = setTimeout(run, 200);
    })();
}


onElementHeightChange(document.body, function(){
    hide();
});
