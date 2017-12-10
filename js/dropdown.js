$(document).click(function(){

  setTimeout(function(){
      if($('.dropdown-pane').length!==0)
      {
        var i=0;
        var li=document.createElement('li');
        var li2=document.createElement('li')
        var xhttp = new XMLHttpRequest();

        li.innerHTML='<a href="/market"><span class="Icon " style="display: inline-block; width: 1.12rem; height: 1.12rem;"><img src="'+chrome.extension.getURL("/img/steemblack.svg")+'"/></span>Market</a>';
        li2.innerHTML='<a  href="/market"><span class="price" style="font-size:0.9em;"></span><span class="daily_change" style="font-size:0.75em; margin-left:2px"></span></a>';
        if($('.dropdown-pane .VerticalMenu .title').length!==0)
        {
            $('.dropdown-pane .VerticalMenu').append(li);
            $('.dropdown-pane .VerticalMenu').append(li2);
        }
        var intr= null;
          DisplayPriceFeed(intr,i,xhttp);
         intr = setInterval(function() {
           i++;
          DisplayPriceFeed(intr,i,xhttp);

        },5000,0);
      }
  },200);

});

function DisplayPriceFeed(intr,i,xhttp)
{
  if($('.dropdown-pane').length===0||$('.dropdown-pane .VerticalMenu .title').length===0)
    clearInterval(intr);
  if(i%3===0)
  {
    steem.api.getCurrentMedianHistoryPrice(function(err, result) {
      $(".price").html('1 STEEM = '+parseFloat(result.base)/10+' SBD');
      $(".daily_change").html("");
        });
        $(".price").parent().prop('href',"/market");
  }
  else if(i%3===1)
  {
    xhttp.open("GET", "https://api.coinmarketcap.com/v1/ticker/steem/", false);
    xhttp.send();
    $(".price").html('1 STEEM = '+JSON.parse(xhttp.responseText)[0].price_usd+'$');
    $(".daily_change").html(' ('+JSON.parse(xhttp.responseText)[0].percent_change_24h+'%) ');
    if(parseFloat(JSON.parse(xhttp.responseText)[0].percent_change_24h)>=0)
      $(".daily_change").css('color','green');
    else
      $(".daily_change").css('color','red');
    $(".price").parent().prop('href',"https://coinmarketcap.com/currencies/steem/");
  }
  else if(i%3===2)
  {
    xhttp.open("GET", "https://api.coinmarketcap.com/v1/ticker/steem-dollars/", false);
    xhttp.send();
    $(".price").html('1 SBD = '+JSON.parse(xhttp.responseText)[0].price_usd+'$');
    $(".daily_change").html(' ('+JSON.parse(xhttp.responseText)[0].percent_change_24h+'%) ');
    if(parseFloat(JSON.parse(xhttp.responseText)[0].percent_change_24h)>=0)
      $(".daily_change").css('color','green');
    else
      $(".daily_change").css('color','red');
    $(".price").parent().prop('href',"https://coinmarketcap.com/currencies/steem-dollars/");
  }

}
