var token_external_link_tab = null;
var aut = null;
var menuClass = 'smi-external-links-menu';
var isOpen = false;

var isSteemit = null;
var isBusy = null;

var retryCountExternalLink = 0;

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
    title: 'Minnow Support',
    href: function(username) {
        return 'http://minnowpond.org';
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
}, {
    title: 'SteemOcean',
    href: function(username) {
        return 'http://steemocean.com/voter/' + username;
    }
}, {
    title: 'Accusta - account statistics',
    href: function(username) {
        return 'https://steemit.accusta.tk/@' + username + '/by_month';
    }
}];


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to == 'external_link_tab') {
        aut = request.data.user;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        retryCountExternalLink = 0;

        if (request.order === 'start' && token_external_link_tab == null) {
            token_external_link_tab = request.token;
            addExternalLinksMenu();
        } else if (request.order === 'click' && token_external_link_tab == request.token) {
            addExternalLinksMenu();
        }
    }
});

function createMenuLinks(username) {
    return externalLinks.map(function(link) {
        return '<li>\
        <a href="' + link.href(username) + '" target="_blank" rel="noopener">' + link.title + '</a>\
      </li>';
    }).join('');
};

function createMenu(menuContainer, username) {

    var menu = null;
    if (isSteemit) {
        var isMe = menuContainer.children().length >= 2;
        menu = $('<li class="' + menuClass + (isMe ? '' : ' not-me') + '">\
        <a class="smi-open-menu smi-open-menu-ELT" aria-haspopup="true">\
          Links\
          <span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg>\
          </span>\
        </a>\
        <div class="dropdown-pane dropdown-pane-ELT">\
          <span>@' + username + ':</span>\
          <ul class="VerticalMenu menu vertical">' +
            createMenuLinks(username) +
            '</ul>\
        </div>\
      </li>');
    } else if (isBusy) {
        menu = $('<li class="UserMenu__item menu-external-links-busy" role="presentation" data-key="steemplus">\
            <span>External Links</span>\
            <a class="Topnav__link Topnav__link--light">\
              <i class="iconfont icon-caretbottom" style="color: #99aab5!important;font-weight: 600!important;font-size: 12px;"></i>\
            </a>\
          </li>');
        menuContainer.append(menu);
        var popupExternalLinks = $('<div style="position: absolute; top: 0px; left: 0px; width: 100%;" class="popup-external-link-busy">\
        <div>\
          <div class="ant-popover ant-popover-busy ant-popover-placement-bottom ant-popover-hidden" style="position: fixed; left: ' + ($('.menu-external-links-busy')[0].clientWidth * 1.5 + $('.menu-external-links-busy')[0].offsetLeft) + 'px; top: ' + ($('.menu-external-links-busy')[0].offsetParent.offsetParent.offsetParent.offsetTop + $('.menu-external-links-busy')[0].offsetHeight) + 'px; transform-origin: 50% -4px 0px;">\
            <div class="ant-popover-content"><div class="ant-popover-arrow"></div>\
            <div class="ant-popover-inner">\
              <div>\
                <div class="ant-popover-inner-content">\
                  <div>\
                    <div role="presentation" class="Popover__overlay"></div>\
                    <span>@' + username + ':</span>\
                      <ul class="PopoverMenu">' +
            createMenuLinks(username) + '\
                      </ul>\
                    </div>\
                  </div>\
                </div>\
              </div>\
            </div>\
          </div>\
        </div>\
      </div>');

        $('body').append(popupExternalLinks);
    }
    return menu;
};

function addExternalLinksMenu() {
    if (regexBlogSteemit.test(window.location.href) && retryCountExternalLink < 20) {

        var name = window.SteemPlus.Utils.getPageAccountName();
        if (!name) {
            return;
        }
        console.log('Adding external links menu: ' + name);

        window.SteemPlus.Utils.getUserTopMenusForAccountName(name, function(menus) {
            var menu = menus.eq(2); // third menu
            var el = menu.find('li.' + menuClass);
            if (el.length) {
                el.remove();
            }
            el = createMenu(menu, name);
            el.find('a.smi-open-menu-ELT').on('click', function(e) {
                e.preventDefault();

                if ($('.' + menuClass + ' .dropdown-pane-ELT').hasClass('is-open')) {
                    $('.' + menuClass + ' .dropdown-pane-ELT').removeClass('is-open');
                } else {
                    el.find('.dropdown-pane-ELT').addClass('is-open');
                }

                $('body').on('click', function(e) {
                    var t = $(e.target);
                    if (!t.closest('.' + menuClass).length) {
                        $('.' + menuClass + ' .dropdown-pane').removeClass('is-open');
                    }
                });


            });
            menu.prepend(el);
        });
    } else if (regexBlogBusy.test(window.location.href) && retryCountExternalLink < 20) {
        if ($('.UserMenu__menu').length === 0) {
            setTimeout(function() {
                retryCountExternalLink++;
                addExternalLinksMenu();
            }, 1000);
        } else {
            var name = window.SteemPlus.Utils.getPageAccountName();
            if (!name) {
                return;
            }

            var menu = $('.UserMenu__menu').eq(0);
            var el = menu.find('.menu-external-links-busy');
            if (el.length > 0)
                el.remove();
            if ($('.popup-external-link-busy').length > 0)
                $('.popup-external-link-busy').remove();
            el = createMenu(menu, name);
            $('.menu-external-links-busy').unbind('click').click(function(e) {
                e.preventDefault();
                $('.UserMenu__item--active').removeClass('UserMenu__item--active');
                $(this).addClass('UserMenu__item--active');
                $('.popup-external-link-busy').find('.ant-popover-hidden').removeClass('ant-popover-hidden');
            });

            $('body').on('click', function(e) {
                var t = $(e.target);
                if (!t.closest('.menu-external-links-busy').length) {
                    $('.popup-external-link-busy').find('.ant-popover-busy').addClass('ant-popover-hidden');
                }
            });
        }
    }
};
