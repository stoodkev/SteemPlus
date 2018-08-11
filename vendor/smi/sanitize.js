(function() {

    var remarkableStripper = new Remarkable();

    /** Removes all markdown leaving just plain text */
    var remarkableStripperFunc = function(md) {
        md.renderer.render = function(tokens, options, env) {
            var str = ''
            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].type === 'inline') {
                    str += md.renderer.render(tokens[i].children, options, env);
                } else {
                    // console.log('content', tokens[i])
                    var content = tokens[i].content
                    str += (content || '') + ' '
                }
            }
            return str
        }
    }

    remarkableStripper.use(remarkableStripperFunc); // removes all markdown


    var htmlCharMap = {
        amp: '&',
        quot: '"',
        lsquo: '‘',
        rsquo: '’',
        sbquo: '‚',
        ldquo: '“',
        rdquo: '”',
        bdquo: '„',
        hearts: '♥',
        trade: '™',
        hellip: '…',
        pound: '£',
        copy: ''
    }

    var htmlDecode = function(txt) {
        return txt.replace(/&[a-z]+;/g, function(ch) {
            var char = htmlCharMap[ch.substring(1, ch.length - 1)]
            return char ? char : ch
        })
    };




    var postBodyShort = function(body) {
        var body2 = remarkableStripper.render(body);
        var desc = sanitizeHtml(body2, {
            allowedTags: []
        }) // remove all html, leaving text
        desc = htmlDecode(desc)

        // Strip any raw URLs from preview text
        desc = desc.replace(/https?:\/\/[^\s]+/g, '');

        // Grab only the first line (not working as expected. does rendering/sanitizing strip newlines?)
        desc = desc.trim().split("\n")[0];

        if (desc.length > 140) {
            desc = desc.substring(0, 140).trim();

            var dotSpace = desc.lastIndexOf('. ')
            if (dotSpace > 80) {
                desc = desc.substring(0, dotSpace + 1)
            } else {
                // Truncate, remove the last (likely partial) word (along with random punctuation), and add ellipses
                desc = desc.substring(0, 120).trim().replace(/[,!\?]?\s+[^\s]+$/, "…");
            }
        }
        return desc;
    };


    var sanitizeMemo = function(memo) {
        // remove existing < and > 
        memo = memo.replace(/[<>]/g, function(ch) {
            if (ch == '<') {
                return '&lt;';
            } else {
                return '&gt;';
            }
        });

        // add links
        memo = linkifyStr(memo, {
            target: '_blank',
            defaultProtocol: 'https',
            attributes: {
                rel: 'nofollow'
            },
            formatHref: {
                mention: function(href) {
                    return 'https://steemit.com/@' + href.substring(1);
                }
            }
        });

        memo = sanitizeHtml(memo, {
            allowedTags: ['a']
        }); // remove all html, leaving text and a added
        memo = htmlDecode(memo);

        return memo;
    };


    var Sanitize = {
        postBodyShort: postBodyShort,
        sanitizeMemo: sanitizeMemo
    };


    window.SteemPlus = window.SteemPlus || {};
    window.SteemPlus.Sanitize = Sanitize;

})();