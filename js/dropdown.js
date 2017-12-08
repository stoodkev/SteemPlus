steem.api.getCurrentMedianHistoryPrice(function(err, result) {
  console.log(err, result);
});

$(document).click(function(){

  setTimeout(function(){
      if($('.dropdown-pane').length!==0)
      {
        var li=document.createElement('li');
        li.innerHTML='<a href="/market"><span class="Icon " style="display: inline-block; width: 1.12rem; height: 1.12rem;"><img src="'+chrome.extension.getURL("/img/steemblack.svg")+'"/></span>Market</a>';
        if($('.dropdown-pane .VerticalMenu .title').length!==0)
          $('.dropdown-pane .VerticalMenu').append(li);
      }
  },1000);

});
