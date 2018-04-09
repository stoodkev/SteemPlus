chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='drop'&&request.order==='click')
      startDropdown(request.data.market);
});
    function startDropdown(market_d){

      if($('.market-item').length > 0)
        return;

      setTimeout(function(){
          if($('div > .dropdown-pane').length!==0)
          {
            var i=0;
            var li=document.createElement('li');
            var li2=document.createElement('li');
            var xhttp = new XMLHttpRequest();

            li.innerHTML='<a class="market-item" href="/market"><span class="Icon " style="display: inline-block; width: 1.12rem; height: 1.12rem;"><img src="'+chrome.extension.getURL("src/img/steemblack.svg")+'"/></span>Market</a>';
            if($('.dropdown-pane .VerticalMenu .title').length!==0)
            {
              /*var priceDiv1 = $('<a class="price-div1" href="https://bittrex.com/Market/Index?MarketName=BTC-steem"><span class="price" style="font-size:0.9em;"></span><span class="daily_change" style="font-size:0.75em; margin-left:2px"></span></a>');
              var priceDiv2 = $('<a class="price-div2" href="https://bittrex.com/Market/Index?MarketName=BTC-sbd"><span class="price" style="font-size:0.9em;"></span><span class="daily_change" style="font-size:0.75em; margin-left:2px"></span></a>');
              var priceDiv3 = $('<a class="price-div3" href="/market"><span class="price" style="font-size:0.9em;"></span><span class="daily_change" style="font-size:0.75em; margin-left:2px"></span></a>');
             */ 
              
              
              var divSlider = $('<div class="my-slider">\
                                  <ul>\
                                    <li><a class="price-div1" href="https://bittrex.com/Market/Index?MarketName=BTC-steem">1 STEEM = '+Math.round(market_d.SBDperSteem*1000)/1000+' SBD<span class="price" style="font-size:0.9em;"></span><span class="daily_change" style="font-size:0.75em; margin-left:2px"></span></a></li>\
                                    <li><a class="price-div2" href="https://bittrex.com/Market/Index?MarketName=BTC-sbd">1 STEEM = '+Math.round(market_d.priceSteem*1000)/1000+'$<span class="price" style="font-size:0.9em;"></span><span class="daily_change" style="font-size:0.75em; margin-left:2px"></span></a></li>\
                                    <li><a class="price-div3" href="/market"><span class="price" style="font-size:0.9em;">1 SBD = '+Math.round(market_d.priceSBD*1000)/1000+'$</span><span class="daily_change" style="font-size:0.75em; margin-left:2px"></span></a></li>\
                                  </ul>\
                                </div>');

              // $(priceDiv2).css('display', 'none');
              // $(priceDiv3).css('display', 'none');

              $('div > .dropdown-pane .VerticalMenu').append(li);
              $(li2).append(divSlider);
              // $(li2).append(priceDiv1);
              // $(li2).append(priceDiv2);
              // $(li2).append(priceDiv3);
              $('div > .dropdown-pane .VerticalMenu').append(li2);
              console.log($(divSlider));
              $(function(){
                $('.my-slider').unslider({ autoplay: true, nav: false, arrows: false });
              });   
            }
            // var intr= null;
            //   DisplayPriceFeed2(intr,i,market_d);
            //  intr = setInterval(function() {
            //    i++;
            //   DisplayPriceFeed2(intr,i,market_d);

            // },2000,0);
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

    function DisplayPriceFeed2(intr,i,market_d)
    {
      if($('.dropdown-pane').length===0||$('.dropdown-pane .VerticalMenu .title').length===0)
        clearInterval(intr);
      if(i%3===0)
      {
          $(".price-div1 .price").html('1 STEEM = '+Math.round(market_d.SBDperSteem*1000)/1000+' SBD');
          $('.price-div3').css('display', 'none');
          $('.price-div1').css('display', 'inline-block');
      }
      else if(i%3===1)
      {
        $(".price-div2 .price").html('1 STEEM = '+Math.round(market_d.priceSteem*1000)/1000+'$');
        $('.price-div1').css('display', 'none');
        $('.price-div2').css('display', 'inline-block');
      }
      else if(i%3===2)
      {
        $(".price-div3 .price").html('1 SBD = '+Math.round(market_d.priceSBD*1000)/1000+'$');
        $('.price-div2').css('display', 'none');
        $('.price-div3').css('display', 'inline-block');
      }

    }
