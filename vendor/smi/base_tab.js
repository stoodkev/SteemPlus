
(function () {
  
  var tabs = [];
  var tabsById = {};


  var showTab = function(tabId){
    var tab = tabsById[tabId];
    var container = $('.UserProfile');
    var divs = container.children();
    var otherTabs = [];
    var realSelectedTab;
    var tabDiv;
    for (var i = divs.length - 1; i >= 0; i--) {
      var div = $(divs[i]);
      if(div.is('.UserProfile__top-nav + div')){
        break
      }else if(!div.hasClass('smi-tabs-div')){
        realSelectedTab = div;
        break;
      }else if(div.hasClass(tab._tabClass)){
        tabDiv = div;
      }else{
        otherTabs.push(div);
      }
    }
    if(tabDiv){
      tabDiv.remove();
    }
    tabDiv = $('<div class="smi-tabs-div ' + tab._tabClass + '"></div>');
    container.append(tabDiv);
 

    tab.createTab(tabDiv);


    otherTabs.forEach(function(otherTab){
      otherTab.remove();
    });
    if(realSelectedTab){
      realSelectedTab.hide();
    }

    $('.UserProfile__top-menu ul.menu li a').removeClass('active');
    $(tab._menuSelector + ' a').addClass('active');
    tabDiv.show();
    window.location.hash = '#' + tab.id;

  };


  var updateMenu = function(onCreate) {

    var name = window.SteemPlus.Utils.getPageAccountName();
    if(!name){
      return;
    }    
    console.log('Adding tabs menu for account: ' + name);

    window.SteemPlus.Utils.getUserTopMenusForAccountName(name, function(menus){
      var menu = menus.eq(0); // first menu

      tabs.forEach(function(tab) {
        if(!tab.enabled){
          return;
        }

        var menuLi = menu.find(tab._menuSelector);
        if(!menuLi.length){
          menuLi = $('<li class="smi-menu-li ' + tab._menuClass + '"><a href="#">' + tab.title + '</a></li>');
          menuLi.find('a').on('click', function(e) {
            e.preventDefault();
            showTab(tab.id);
          });
          menu.append(menuLi);
        }

        if(onCreate && window.location.hash === '#' + tab.id){
          showTab(tab.id);
        }

      });

    });

  };


  var enableTab = function(tabId) {
    var tab = tabsById[tabId]
    tab.enabled = true;
    updateMenu();
  };

  var disableTab = function(tabId) {
    var tab = tabsById[tabId]
    tab.enabled = false;
    $(tab._menuSelector).remove();
    $(tab._tabSelector).remove();
  };


  var createTab = function(tab) {
    tabs.push(tab);
    tabsById[tab.id] = tab;

    tab._menuClass = 'menu-' + tab.id + '-tab-li';
    tab._menuSelector = 'li.' + tab._menuClass;
    tab._tabClass = 'smi-' + tab.id + '-tab';
    tab._tabSelector = '.' + tab._tabClass;

    if(tab.enabled){
      updateMenu(true);
    }
  };


  var removeSMITabs = function(){
    var container = $('.UserProfile');
    var divs = container.children();
    var realSelectedTab;
    for (var i = divs.length - 1; i >= 0; i--) {
      var div = $(divs[i]);
      if(div.is('.UserProfile__top-nav + div')){
        break
      }else if(!div.hasClass('smi-tabs-div')){
        realSelectedTab = div;
        break;
      }
    }
    $('.smi-tabs-div').remove();
    if(realSelectedTab){
      realSelectedTab.show();
    }
    $('.UserProfile__top-menu ul.menu li a').removeClass('active');
  };


  var onMenuItemClick = function() {
    var li = $(this).parent();
    if(!li.hasClass('smi-menu-li')){
      if(li.is('li') && li.find('a').attr('aria-haspopup') == 'true'){
        return;
      }
      removeSMITabs();
      if(li.is('li')){
        li.find('a').addClass('active');
      }
    }
  };
  $('body').on('click', '.UserProfile__top-menu ul.menu li a', onMenuItemClick);
  $('body').on('click', '.dropdown-pane.is-open .VerticalMenu.menu.vertical li a', onMenuItemClick);
  $('body').on('click', '.UserProfile__stats span a', onMenuItemClick);



  var Tabs = {
    createTab: createTab,
    enableTab: enableTab,
    disableTab: disableTab
  };

  window.SteemPlus = window.SteemPlus || {};
  window.SteemPlus.Tabs = Tabs;

})()
