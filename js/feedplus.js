var feedplus_url=document.getElementsByClassName("HorizontalMenu")[0].firstChild.firstChild.href+"plus";

var feedplus=document.createElement('li');
feedplus.className="HorizontalMenu menu";
feedplus.id='FeedPlus';
var a=document.createElement('a');
a.innerHTML='Feed';
var img=document.createElement('img');
img.id='img_plus'
img.src=chrome.extension.getURL("/img/logo.png");
feedplus.appendChild(a);
feedplus.appendChild(img);

feedplus.onclick=function(){
    window.history.pushState("", "",feedplus_url);
    feedplus.class+="active";
}
document.getElementsByClassName("HorizontalMenu")[0].appendChild(feedplus);