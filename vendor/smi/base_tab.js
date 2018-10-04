(function() {

    var tabs = [];
    var tabsById = {};

    var isSteemit = (window.location.href.includes('steemit.com') || window.location.href.includes('mspsteem.com'));
    var isBusy = window.location.href.includes('busy.org');


    var showTab = function(tabId) {
        var tab = tabsById[tabId];
        var container = null;
        var otherTabs = [];
        var realSelectedTab;
        var tabDiv;
        if (isSteemit) container = $('.UserProfile');
        else if (isBusy) container = $('.feed-layout');

        var divs = container.children();

        if (isSteemit) {
            for (var i = divs.length - 1; i >= 0; i--) {
                var div = $(divs[i]);
                if (!div.hasClass('smi-tabs-div')) {
                    realSelectedTab = div;
                    break;
                } else if (div.hasClass(tab._tabClass)) {
                    tabDiv = div;
                } else {
                    otherTabs.push(div);
                }
            }
            if (tabDiv) {
                tabDiv.remove();
            }
        } else if (isBusy) {
            for (var i = divs.length - 1; i >= 0; i--) {
                var div = $(divs[i]);
                if (div.is('.UserProfile__top-nav + div')) {
                    break
                } else if (!div.hasClass('smi-tabs-div')) {
                    realSelectedTab = div;
                    break;
                } else if (div.hasClass(tab._tabClass)) {
                    tabDiv = div;
                } else {
                    otherTabs.push(div);
                }
            }
            if (tabDiv) {
                tabDiv.remove();
            }
            container.children().hide();
        }

        tabDiv = $('<div class="smi-tabs-div ' + tab._tabClass + '"></div>');

        if (isSteemit) container.append(tabDiv);
        else if (isBusy) container.after(tabDiv);


        tab.createTab(tabDiv);


        otherTabs.forEach(function(otherTab) {
            otherTab.remove();
        });
        if (realSelectedTab) {
            realSelectedTab.hide();
        }

        if (isSteemit) {
            $('.UserProfile__top-menu ul.menu li a').removeClass('active');
            $(tab._menuSelector + ' a').addClass('active');
        } else if (isBusy) {
            $('.UserMenu__menu.UserMenu__item--active > span').parent().removeClass('UserMenu__item--active');
            $('.menu-steemplus-busy').addClass('UserMenu__item--active');
        }


        tabDiv.show();
        window.location.hash = '#' + tab.id;

    };


    var updateMenu = function(onCreate) {

        var name = window.SteemPlus.Utils.getPageAccountName();
        if (!name) {
            return;
        }

        if (isSteemit) {
            window.SteemPlus.Utils.getUserTopMenusForAccountName(name, function(menus) {
                var menu = menus.eq(0); // first menu
                var menuDropDownSP = null;


                if ($('.menuSP_dropdown').length > 0) {
                    menuDropDownSP = $('.menuSP_dropdown');
                } else {
                    menuDropDownSP = $('<li class="menuSP_dropdown">\
            <a class="smi-open-menu-SP" aria-haspopup="true">\
              SteemPlus\
              <span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg>\
              </span>\
            </a>\
            <div class="dropdown-pane dropdown-pane-SP">\
              <ul class="VerticalMenu menuSP vertical">\
              </ul>\
            </div>\
          </li>');
                }
                $(menu).append(menuDropDownSP);

                menuDropDownSP.find('a.smi-open-menu-SP').unbind('click').on('click', function(e) {
                    e.preventDefault();
                    // if($('.dropdown-pane-SP').hasClass('is-open'))
                    hideOrShowDropdownPanel();
                });

                $('body').on('click', function(e) {
                    //hideOrShowDropdownPanel();
                    var t = $(e.target);
                    if (!t.closest('.menuSP_dropdown').length) {
                        $('.menuSP_dropdown .dropdown-pane-SP').removeClass('is-open');
                        $('.menuSP_dropdown .dropdown-pane-SP').hide();
                    }
                });

                tabs.forEach(function(tab) {
                    if (!tab.enabled) {
                        return;
                    }

                    var menuLi = menu.find(tab._menuSelector);
                    if (!menuLi.length) {
                        menuLi = $('<li class="smi-menu-li ' + tab._menuClass + '"><a href="#">' + tab.title + '</a></li>');
                        menuLi.find('a').unbind('click').on('click', function(e) {
                            e.preventDefault();
                            hideOrShowDropdownPanel();
                            showTab(tab.id);
                        });
                        if(tab.newTab)
                            $('.UserProfile__top-menu > div > ul.menu').eq(0).append(menuLi);
                        else
                            $(menuDropDownSP).find('.dropdown-pane-SP > ul').append(menuLi);
                    }

                    // if(onCreate && window.location.hash === '#' + tab.id){
                    //   showTab(tab.id);
                    // }
                });
            });
        } else if (isBusy) {
            window.SteemPlus.Utils.getUserTopMenusBusy(function(menus) {
                if ($('.menu-steemplus-busy').length > 0) {
                    var menuSteemplus = $('.menu-steemplus-busy');
                } else {
                    menus.append('<li class="UserMenu__item menu-steemplus-busy" role="presentation" data-key="steemplus">\
            <span>Steemplus</span>\
            <a class="Topnav__link Topnav__link--light">\
              <i class="iconfont icon-caretbottom" style="color: #99aab5!important;font-weight: 600!important;font-size: 12px;"></i>\
            </a>\
          </li>');
                }
                var popupSteemplusMenu = $('<div style="position: absolute; top: 0px; left: 0px; width: 100%;">\
          <div>\
            <div class="ant-popover ant-popover-busy ant-popover-placement-bottom ant-popover-hidden" style="position: fixed; left: ' + ($('.menu-steemplus-busy')[0].clientWidth * 1.5 + $('.menu-steemplus-busy')[0].offsetLeft + $('.menu-steemplus-busy')[0].offsetWidth) + 'px; top: ' + ($('.menu-steemplus-busy')[0].offsetParent.offsetParent.offsetParent.offsetTop + $('.menu-steemplus-busy')[0].offsetHeight) + 'px; transform-origin: 50% -4px 0px;">\
              <div class="ant-popover-content"><div class="ant-popover-arrow"></div>\
              <div class="ant-popover-inner">\
                <div>\
                  <div class="ant-popover-inner-content">\
                    <div>\
                      <div role="presentation" class="Popover__overlay"></div>\
                        <ul class="PopoverMenu">\
                        </ul>\
                      </div>\
                    </div>\
                  </div>\
                </div>\
              </div>\
            </div>\
          </div>\
        </div>');

                $('body').append(popupSteemplusMenu);
                $('.menu-steemplus-busy').unbind('click').click(function(e) {
                    e.preventDefault();
                    $('.UserMenu__item--active').removeClass('UserMenu__item--active');
                    $(this).addClass('UserMenu__item--active');
                    $(popupSteemplusMenu).find('.ant-popover-hidden').removeClass('ant-popover-hidden');
                });

                $('body').on('click', function(e) {
                    var t = $(e.target);
                    if (!t.closest('.UserMenu__item--active').length) {
                        $(popupSteemplusMenu).find('.ant-popover-busy').addClass('ant-popover-hidden');
                    }
                });

                tabs.forEach(function(tab) {
                    if (!tab.enabled) {
                        return;
                    }

                    var menuLi = popupSteemplusMenu.find(tab._menuSelector);
                    if (!menuLi.length) {
                        menuLi = $('<li class="PopoverMenuItem PopoverMenuItem--bold ' + tab._menuClass + '">\
                        <a role="presentation"><span>' + tab.title + '</span></a>\
                      </li>');
                        menuLi.find('a').unbind('click').on('click', function(e) {
                            e.preventDefault();
                            showTab(tab.id);
                        });
                        $(popupSteemplusMenu).find('.PopoverMenu').append(menuLi);
                    }
                });
            });
        }
    };

    function hideOrShowDropdownPanel() {
        if ($('.dropdown-pane-SP').attr('display') === 'block' || $('.dropdown-pane-SP').hasClass('is-open')) {
            $('.dropdown-pane-SP').removeClass('is-open');
            $('.dropdown-pane-SP').hide();
        } else {
            $('.dropdown-pane-SP').addClass('is-open');
            $('.dropdown-pane-SP').show();
        }
    }


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

        if (tab.enabled) {
            updateMenu(true);
        }
    };


    var removeSMITabs = function() {
        var container = null;
        if (isSteemit) container = $('.UserProfile');
        if (isBusy) container = $('.feed-layout');

        if (isSteemit) {
            var divs = container.children();
            var realSelectedTab;
            for (var i = divs.length - 1; i >= 0; i--) {
                var div = $(divs[i]);
                if (!div.hasClass('smi-tabs-div')) {
                    realSelectedTab = div;
                    break;
                }
            }
            $('.smi-tabs-div').remove();
            if (realSelectedTab) {
                realSelectedTab.show();
            }
            $('.UserProfile__top-menu ul.menu li a').removeClass('active');
        } else if (isBusy) {
            $('.smi-tabs-div').remove();
            container.children().show();
            $('.menu-steemplus-busy').removeClass('UserMenu__item--active');
        }
    };


    var onMenuItemClick = function() {
        if (isBusy && $(this).hasClass('menu-steemplus-busy')) return;
        var li = $(this).parent();
        if (!li.hasClass('smi-menu-li')) {
            if (li.is('li') && li.find('a').attr('aria-haspopup') == 'true') {
                return;
            }
            removeSMITabs();
            if (li.is('li')) {
                li.find('a').addClass('active');
            }
        }
    };
    if (isSteemit) {
        $('body').on('click', '.UserProfile__top-menu ul.menu li a', onMenuItemClick);
        $('body').on('click', '.dropdown-pane.is-open .VerticalMenu.menu.vertical li a', onMenuItemClick);
        $('body').on('click', '.UserProfile__stats span a', onMenuItemClick);
    } else if (isBusy) {
        $('body').on('click', '.UserMenu__item > span', onMenuItemClick);
        $('body').on('click', '.UserHeader__container > div > a', onMenuItemClick);
    }

    var Tabs = {
        createTab: createTab,
        enableTab: enableTab,
        disableTab: disableTab,
        showTab: showTab
    };

    window.SteemPlus = window.SteemPlus || {};
    window.SteemPlus.Tabs = Tabs;
})()
