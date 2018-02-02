chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='drop'&&request.order==='click')
      startDropdown(request.data.market);
});
    function startDropdown(market_d){

      setTimeout(function(){
          if($('.dropdown-pane').length!==0)
          {
            var i=0;
            var li=document.createElement('li');
            var li2=document.createElement('li');
            var xhttp = new XMLHttpRequest();

            li.innerHTML='<a href="/market"><span class="Icon " style="display: inline-block; width: 1.12rem; height: 1.12rem;"><img src="'+chrome.extension.getURL("src/img/steemblack.svg")+'"/></span>Market</a>';
            li2.innerHTML='<a  href="/market"><span class="price" style="font-size:0.9em;"></span><span class="daily_change" style="font-size:0.75em; margin-left:2px"></span></a>';
            if($('.dropdown-pane .VerticalMenu .title').length!==0)
            {
                $('.dropdown-pane .VerticalMenu').append(li);
                $('.dropdown-pane .VerticalMenu').append(li2);
            }
            var intr= null;
              DisplayPriceFeed(intr,i,market_d);
             intr = setInterval(function() {
               i++;
              DisplayPriceFeed(intr,i,market_d);

            },5000,0);
          }
      },200);
    }


    function DisplayPriceFeed(intr,i,market_d)
    {
      if($('.dropdown-pane').length===0||$('.dropdown-pane .VerticalMenu .title').length===0)
        clearInterval(intr);
      if(i%3===0)
      {
          $(".price").html('1 STEEM = '+Math.round(market_d.SBDperSteem*1000)/1000+' SBD');
          $(".daily_change").html("");
          $(".price").parent().prop('href',"/market");
      }
      else if(i%3===1)
      {
        $(".price").html('1 STEEM = '+Math.round(market_d.priceSteem*1000)/1000+'$');
        /*$(".daily_change").html(' ('+market_d.changeSteem+'%) ');
        if(market_d.changeSteem>=0)
          $(".daily_change").css('color','green');
        else
          $(".daily_change").css('color','red');*/
        $(".price").parent().prop('href',"https://bittrex.com/Market/Index?MarketName=BTC-steem");
      }
      else if(i%3===2)
      {
        $(".price").html('1 SBD = '+Math.round(market_d.priceSBD*1000)/1000+'$');
        /*$(".daily_change").html(' ('+Math.round(market_d.changeSBD*100)/100+'%) ');
        if(market_d.changeSBD>=0)
          $(".daily_change").css('color','green');
        else
          $(".daily_change").css('color','red');*/
        $(".price").parent().prop('href',"https://bittrex.com/Market/Index?MarketName=BTC-sbd");
      }

    }
