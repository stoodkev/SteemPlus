
  var token_external_link_tab=null;
  var aut=null;
  var menuClass = 'smi-external-links-menu';
  var isOpen = false;

  var externalLinks = [{
    title: 'Steemd.com',
    href: function(username) { 
      return 'https://steemd.com/@' + username; 
    }
  }, {
    title: 'SteemDB.com',
    href: function(username) { 
      return 'https://steemdb.com/@' + username; 
    }
  }, {
    title: 'Steem Followers',
    href: function(username) { 
      return 'https://steem.makerwannabe.com/@' + username + '/followers/4';
    }
  }, {
    title: 'Potential Rewards',
    href: function(username) { 
      return 'http://steem.supply/@' + username;
    }
  }, {
    title: 'Mentions',
    href: function(username) { 
      return 'http://steemistry.com/steemit-mentions-tool/?mention=@' + username;
    }
  }, {
    title: 'SteemWorld',
    href: function(username) {
      return 'https://steemworld.org/@' + username
    }
  }, {
    title: 'Steem Whales',
    href: function(username) { 
      return 'http://steemwhales.com/' + username;
    }
  }, {
    title: 'Steemit Board',
    href: function(username) { 
      return 'http://steemitboard.com/board.html?user=' + username;
    }
  }, {
    title: 'SteemReports',
    href: function(username) { 
      return 'http://www.steemreports.com/top-voters/@' + username;
    }
  }, {
    title: 'Utopian',
    href: function(username) { 
      return 'https://utopian.io/@' + username;
    }
  }, {
    title: 'Steemian Wit',
    href: function(username) { 
      return 'https://steemian.info/witnesses';
    }
  }, {
    title: 'Steem Bot Tracker',
    href: function(username) { 
      return 'https://steembottracker.com';
    }
  }];


  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='external_link_tab'){
      aut=request.data.user;
      if(request.order==='start'&&token_external_link_tab==null)
      {
        token_external_link_tab=request.token;

        addExternalLinksMenu();

        $('body').on('click', function(e) {
          var t = $(e.target);
          if(!t.closest('.' + menuClass).length){
            $('.' + menuClass + ' .dropdown-pane').removeClass('is-open');
          }
        });
      }
    }
  });
  
  function createMenuLinks(username) {
    return externalLinks.map(function(link){
      return '<li>\
        <a href="' + link.href(username) + '" target="_blank" rel="noopener">' + link.title + '</a>\
      </li>';
    }).join('');
  };

  function createMenu(menuContainer, username) {
    var isMe = menuContainer.children().length >= 2;
    var menu = $('<li class="' + menuClass + (isMe ? '' : ' not-me') + '">\
      <a class="smi-open-menu" aria-haspopup="true">\
        Links\
        <span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg>\
        </span>\
      </a>\
      <div class="dropdown-pane">\
        <span>@' + username + ':</span>\
        <ul class="VerticalMenu menu vertical">' +
          createMenuLinks(username) +
        '</ul>\
      </div>\
    </li>');
    return menu;
  };

  function addExternalLinksMenu() {
    var name = window.SteemPlus.Utils.getPageAccountName();
    if(!name){
      return;
    }
    console.log('Adding external links menu: ' + name);

    window.SteemPlus.Utils.getUserTopMenusForAccountName(name, function(menus){
      var menu = menus.eq(1); // second menu
      var el = menu.find('li.' + menuClass);
      if(el.length){
        el.remove();
      }
      el = createMenu(menu, name);
      el.find('a.smi-open-menu').on('click', function(e) {
        e.preventDefault();
        
        if($('.' + menuClass + ' .dropdown-pane').hasClass('is-open'))
        {
          $('.' + menuClass + ' .dropdown-pane').removeClass('is-open');
        }
        else
        {
          el.find('.dropdown-pane').addClass('is-open');
        }

        
      });
      menu.prepend(el);
    });
  };


  
