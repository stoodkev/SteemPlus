const xmldom = {
    DOMParser: window.DOMParser,
    XMLSerializer: window.XMLSerializer
};


const urlChar = '[^\\s"<>\\]\\[\\(\\)]'
const urlCharEnd = urlChar.replace(/\]$/, '.,\']') // insert bad chars to end on
const imagePath = '(?:(?:\\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs/[a-z\\d]{40,}))'
const domainPath = '(?:[-a-zA-Z0-9\\._]*[-a-zA-Z0-9])'
const urlChars = '(?:' + urlChar + '*' + urlCharEnd + ')?'

const urlSet = function({
    domain = domainPath,
    path
} = {}) {
    // urlChars is everything but html or markdown stop chars
    return `https?:\/\/${domain}(?::\\d{2,5})?(?:[/\\?#]${urlChars}${path ? path : ''})${path ? '' : '?'}`
}

/**
    Unless your using a 'g' (glob) flag you can store and re-use your regular expression.  Use the cache below.  If your using a glob (for example: replace all), the regex object becomes stateful and continues where it left off when called with the same string so naturally the regexp object can't be cached for long.
*/
const any = function(flags = 'i') {
    return new RegExp(urlSet(), flags);
}
const local = function(flags = 'i') {
    return new RegExp(urlSet({
        domain: '(?:localhost|(?:.*\\.)?steemit.com)'
    }), flags);
}
const remote = function(flags = 'i') {
    return new RegExp(urlSet({
        domain: `(?!localhost|(?:.*\\.)?steemit.com)${domainPath}`
    }), flags);
}
const youTube = function(flags = 'i') {
    return new RegExp(urlSet({
        domain: '(?:(?:.*\.)?youtube.com|youtu.be)'
    }), flags);
}
const image = function(flags = 'i') {
    return new RegExp(urlSet({
        path: imagePath
    }), flags);
}
const imageFile = function(flags = 'i') {
    return new RegExp(imagePath, flags);
}
// export const nonImage = (flags = 'i') => new RegExp(urlSet({path: '!' + imageFile}), flags)
// export const markDownImageRegExp = (flags = 'i') => new RegExp('\!\[[\w\s]*\]\(([^\)]+)\)', flags);

var linksRe = {
    any: any(),
    local: local(),
    remote: remote(),
    image: image(),
    imageFile: imageFile(),
    youTube: youTube(),
    youTubeId: /(?:(?:youtube.com\/watch\?v=)|(?:youtu.be\/)|(?:youtube.com\/embed\/))([A-Za-z0-9\_\-]+)/i,
    vimeoId: /(?:vimeo.com\/|player.vimeo.com\/video\/)([0-9]+)/,
    // simpleLink: new RegExp(`<a href="(.*)">(.*)<\/a>`, 'ig'),
    ipfsPrefix: /(https?:\/\/.*)?\/ipfs/i,
}


const BadActorList = `
polonox
poloneix
biitrex
biittrex
bitter
bitterx
bittex
bittrax
bittre
bittres
bittrex.com
bittrexe
bittrexx
bittrez
bittrix
bittrx
bitttrex
bitrex
bitrexx
bitrix
bitrrex
bttrex
btrex
bttrex
ittrex
bittrex-deposit
poloiex
poloinex
polomiex
polon
poloneex
poloneix
polonex
poloni
poloniax
polonie
poloniec
poloniee
polonieex
poloniek
polonieks
polonies
poloniet
poloniets
poloniex.com
poloniexcold
poloniexe
poloniexs
poloniext
poloniexx
poloniey
poloniez
poloniiex
poloniix
poloniks
poloniox
polonium
polonix
polonniex
polooniex
pooniex
poooniex
plolniex
ploniex
plooniex
poloex
oloniex
pooloniex
poliniex
polniex
poleniex
polionex
pollniex
polloniex
polnoiex
polonyex
polonied
polonixe
blocktardes
blocktrade
bocktrades
changelly.com
changely
shapeshif
shapeshift
randomwhale
coinpayments
minnowboost
minnowboster
minowbooster
blocktades
`.trim().split('\n');

const VerifiedExchangeList = `
poloniex
bittrex
`.trim().split('\n');


var tt = function(x) {
    return x;
};

var validate_account_name = function(value, memo) {
    let i, label, len, length, ref, suffix;

    suffix = tt('chainvalidation_js.account_name_should');
    if (!value) {
        return suffix + tt('chainvalidation_js.not_be_empty');
    }
    length = value.length;
    if (length < 3) {
        return suffix + tt('chainvalidation_js.be_longer');
    }
    if (length > 16) {
        return suffix + tt('chainvalidation_js.be_shorter');
    }
    if (/\./.test(value)) {
        suffix = tt('chainvalidation_js.each_account_segment_should');
    }
    if (BadActorList.includes(value)) {
        return 'Use caution sending to this account. Please double check your spelling for possible phishing. ';
    }
    if (VerifiedExchangeList.includes(value) && !memo) {
        return tt('chainvalidation_js.verified_exchange_no_memo')
    }
    ref = value.split('.');
    for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!/^[a-z]/.test(label)) {
            return suffix + tt('chainvalidation_js.start_with_a_letter');
        }
        if (!/^[a-z0-9-]*$/.test(label)) {
            return suffix + tt('chainvalidation_js.have_only_letters_digits_or_dashes');
        }
        if (/--/.test(label)) {
            return suffix + tt('chainvalidation_js.have_only_one_dash_in_a_row');
        }
        if (!/[a-z0-9]$/.test(label)) {
            return suffix + tt('chainvalidation_js.end_with_a_letter_or_digit');
        }
        if (!(label.length >= 3)) {
            return suffix + tt('chainvalidation_js.be_longer');
        }
    }
    return null;
}



var STM_Config = false;
/**
 * this regular expression should capture all possible proxy domains
 * Possible URL schemes are:
 * <proxy>/<file url>
 * <proxy>/{int}x{int}/<external domain and file url>
 * <proxy>/{int}x{int}/[...<proxy>/{int}x{int}/]<external domain and file url>
 * <proxy>/{int}x{int}/[<proxy>/{int}x{int}/]<proxy>/<file url>
 * @type {RegExp}
 */
const rProxyDomain = /^http(s)?:\/\/steemit(dev|stage)?images.com\//g;
const rProxyDomainsDimensions = /http(s)?:\/\/steemit(dev|stage)?images.com\/([0-9]+x[0-9]+)\//g;
const NATURAL_SIZE = '0x0/';

/**
 * Strips all proxy domains from the beginning of the url. Adds the global proxy if dimension is specified
 * @param {string} url
 * @param {string|boolean} dimensions - optional -  if provided. url is proxied && global var $STM_Config.img_proxy_prefix is avail. resp will be "$STM_Config.img_proxy_prefix{dimensions}/{sanitized url}"
 *                                          if falsy, all proxies are stripped.
 *                                          if true, preserves the first {int}x{int} in a proxy url. If not found, uses 0x0
 * @returns string
 */
var proxifyImageUrl = function(url, dimensions = false) {
    const proxyList = url.match(rProxyDomainsDimensions);
    let respUrl = url;
    if (proxyList) {
        const lastProxy = proxyList[proxyList.length - 1];
        respUrl = url.substring(url.lastIndexOf(lastProxy) + lastProxy.length);
    }
    if (dimensions && STM_Config && STM_Config.img_proxy_prefix) {
        let dims = dimensions + '/';
        if (typeof dimensions !== 'string') {
            dims = (proxyList) ? proxyList.shift().match(/([0-9]+x[0-9]+)\//g)[0] : NATURAL_SIZE;
        }
        if (NATURAL_SIZE !== dims || !rProxyDomain.test(respUrl)) {
            return STM_Config.img_proxy_prefix + dims + respUrl;
        }
    }
    return respUrl;
}


// FROM https://raw.githubusercontent.com/steemit/condenser/master/src/shared/HtmlReady.js



const noop = function() {}
const DOMParser = new xmldom.DOMParser()
const XMLSerializer = new xmldom.XMLSerializer()

/**
 * Functions performed by HTMLReady
 *
 * State reporting
 *  - hashtags: collect all #tags in content
 *  - usertags: collect all @mentions in content
 *  - htmltags: collect all html <tags> used (for validation)
 *  - images: collect all image URLs in content
 *  - links: collect all href URLs in content
 *
 * Mutations
 *  - link()
 *    - ensure all <a> href's begin with a protocol. prepend https:// otherwise.
 *  - iframe()
 *    - wrap all <iframe>s in <div class="videoWrapper"> for responsive sizing
 *  - img()
 *    - convert any <img> src IPFS prefixes to standard URL
 *    - change relative protocol to https://
 *  - linkifyNode()
 *    - scans text content to be turned into rich content
 *    - embedYouTubeNode()
 *      - identify plain youtube URLs and prep them for "rich embed"
 *    - linkify()
 *      - scan text for:
 *        - #tags, convert to <a> links
 *        - @mentions, convert to <a> links
 *        - naked URLs
 *          - if img URL, normalize URL and convert to <img> tag
 *          - otherwise, normalize URL and convert to <a> link
 *  - proxifyImages()
 *    - prepend proxy URL to any non-local <img> src's
 *
 * We could implement 2 levels of HTML mutation for maximum reuse:
 *  1. Normalization of HTML - non-proprietary, pre-rendering cleanup/normalization
 *    - (state reporting done at this level)
 *    - normalize URL protocols
 *    - convert naked URLs to images/links
 *    - convert embeddable URLs to <iframe>s
 *    - basic sanitization?
 *  2. Steemit.com Rendering - add in proprietary Steemit.com functions/links
 *    - convert <iframe>s to custom objects
 *    - linkify #tags and @mentions
 *    - proxify images
 *
 * TODO:
 *  - change ipfsPrefix(url) to normalizeUrl(url)
 *    - rewrite IPFS prefixes to valid URLs
 *    - schema normalization
 *    - gracefully handle protocols like ftp, mailto
 */

/** Split the HTML on top-level elements. This allows react to compare separately, preventing excessive re-rendering.
 * Used in MarkdownViewer.jsx
 */
// export function sectionHtml (html) {
//   const doc = DOMParser.parseFromString(html, 'text/html')
//   const sections = Array(...doc.childNodes).map(child => XMLSerializer.serializeToString(child))
//   return sections
// }

/** Embed videos, link mentions and hashtags, etc...
    If hideImages and mutate is set to true all images will be replaced
    by <pre> elements containing just the image url.
*/
window.HtmlReady = function(html, {
    mutate = true,
    hideImages = false
} = {}) {
    const state = {
        mutate
    }
    state.hashtags = new Set()
    state.usertags = new Set()
    state.htmltags = new Set()
    state.images = new Set()
    state.links = new Set()
    try {
        const doc = DOMParser.parseFromString(html, 'text/html')
        traverse(doc, state)
        if (mutate) {
            if (hideImages) {
                for (const image of Array.from(doc.getElementsByTagName('img'))) {
                    const pre = doc.createElement('pre')
                    pre.setAttribute('class', 'image-url-only')
                    pre.appendChild(doc.createTextNode(image.getAttribute('src')))
                    image.parentNode.replaceChild(pre, image)
                }
            } else {
                proxifyImages(doc)
            }
        }
        // console.log('state', state)
        if (!mutate) return state
        state.html = (doc) ? XMLSerializer.serializeToString(doc) : '';
        return state;
    } catch (error) {
        // Not Used, parseFromString might throw an error in the future
        console.error(error.toString())
        return {
            html
        }
    }
}

function traverse(node, state, depth = 0) {
    if (!node || !node.childNodes) return
    Array(...node.childNodes).forEach(function(child) {
        // console.log(depth, 'child.tag,data', child.tagName, child.data)
        const tag = child.tagName ? child.tagName.toLowerCase() : null
        if (tag) state.htmltags.add(tag)

        if (tag === 'img')
            img(state, child)
        else if (tag === 'iframe')
            iframe(state, child)
        else if (tag === 'a')
            link(state, child)
        else if (child.nodeName === '#text')
            linkifyNode(child, state)

        traverse(child, state, depth + 1)
    })
}

function link(state, child) {
    const url = child.getAttribute('href')
    if (url) {
        state.links.add(url)
        if (state.mutate) {
            // If this link is not relative, http, or https -- add https.
            if (!/^\/(?!\/)|(https?:)?\/\//.test(url)) {
                child.setAttribute('href', "https://" + url)
            }
        }
    }
}

// wrap iframes in div.videoWrapper to control size/aspect ratio
function iframe(state, child) {
    const url = child.getAttribute('src')
    if (url) {
        const {
            images,
            links
        } = state
        const yt = youTubeId(url)
        if (yt && images && links) {
            links.add(yt.url)
            images.add('https://img.youtube.com/vi/' + yt.id + '/0.jpg')
        }
    }

    const {
        mutate
    } = state
    if (!mutate) return

    const tag = child.parentNode.tagName ? child.parentNode.tagName.toLowerCase() : child.parentNode.tagName
    if (tag == 'div' && child.parentNode.getAttribute('class') == 'videoWrapper') return;
    const html = XMLSerializer.serializeToString(child)
    child.parentNode.replaceChild(DOMParser.parseFromString(`<div class="videoWrapper">${html}</div>`), child)
}

function img(state, child) {
    const url = child.getAttribute('src')
    if (url) {
        state.images.add(url)
        if (state.mutate) {
            let url2 = ipfsPrefix(url)
            if (/^\/\//.test(url2)) {
                // Change relative protocol imgs to https
                url2 = "https:" + url2
            }
            if (url2 !== url) {
                child.setAttribute('src', url2)
            }
        }
    }
}

// For all img elements with non-local URLs, prepend the proxy URL (e.g. `https://img0.steemit.com/0x0/`)
function proxifyImages(doc) {
    if (!doc) return;
    [...doc.getElementsByTagName('img')].forEach(function(node) {
        const url = node.getAttribute('src')
        if (!linksRe.local.test(url))
            node.setAttribute('src', proxifyImageUrl(url, true))
    })
}

function linkifyNode(child, state) {
    try {
        const tag = child.parentNode.tagName ? child.parentNode.tagName.toLowerCase() : child.parentNode.tagName
        if (tag === 'code') return
        if (tag === 'a') return

        const {
            mutate
        } = state
        if (!child.data) return
        if (embedYouTubeNode(child, state.links, state.images)) return
        if (embedVimeoNode(child, state.links, state.images)) return

        const data = XMLSerializer.serializeToString(child)
        const content = linkify(data, state.mutate, state.hashtags, state.usertags, state.images, state.links)
        if (mutate && content !== data) {
            const newChild = DOMParser.parseFromString(`<span>${content}</span>`)
            child.parentNode.replaceChild(newChild, child)
            return newChild;
        }
    } catch (error) {
        console.log(error)
    }
}

function linkify(content, mutate, hashtags, usertags, images, links) {
    // hashtag
    content = content.replace(/(^|\s)(#[-a-z\d]+)/ig, function(tag) {
        if (/#[\d]+$/.test(tag)) return tag // Don't allow numbers to be tags
        const space = /^\s/.test(tag) ? tag[0] : ''
        const tag2 = tag.trim().substring(1)
        const tagLower = tag2.toLowerCase()
        if (hashtags) hashtags.add(tagLower)
        if (!mutate) return tag
        return space + `<a href="/trending/${tagLower}">${tag}</a>`
    })

    // usertag (mention)
    content = content.replace(/(^|\s)(@[a-z][-\.a-z\d]+[a-z\d])/ig, function(user) {
        const space = /^\s/.test(user) ? user[0] : ''
        const user2 = user.trim().substring(1)
        const userLower = user2.toLowerCase()
        const valid = validate_account_name(userLower) == null
        if (valid && usertags) usertags.add(userLower)
        if (!mutate) return user
        return space + (valid ?
            `<a href="/@${userLower}">@${user2}</a>` :
            '@' + user2
        )
    })

    content = content.replace(linksRe.any, function(ln) {
        if (linksRe.image.test(ln)) {
            if (images) images.add(ln)
            return `<img src="${ipfsPrefix(ln)}" />`
        }

        // do not linkify .exe or .zip urls
        if (/\.(zip|exe)$/i.test(ln)) return ln;

        if (links) links.add(ln)
        return `<a href="${ipfsPrefix(ln)}">${ln}</a>`
    })
    return content
}

function embedYouTubeNode(child, links, images) {
    try {
        if (!child.data) return false
        const data = child.data
        const yt = youTubeId(data)
        if (!yt) return false

        const v = DOMParser.parseFromString(`~~~ embed:${yt.id} youtube ~~~`)
        child.parentNode.replaceChild(v, child)
        if (links) links.add(yt.url)
        if (images) images.add('https://img.youtube.com/vi/' + yt.id + '/0.jpg')
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}

/** @return {id, url} or <b>null</b> */
function youTubeId(data) {
    if (!data) return null

    const m1 = data.match(linksRe.youTube)
    const url = m1 ? m1[0] : null
    if (!url) return null

    const m2 = url.match(linksRe.youTubeId)
    const id = m2 && m2.length >= 2 ? m2[1] : null
    if (!id) return null

    return {
        id,
        url
    }
}

function embedVimeoNode(child, links, /*images*/ ) {
    try {
        if (!child.data) return false
        const data = child.data

        let id {
            const m = data.match(linksRe.vimeoId)
            id = m && m.length >= 2 ? m[1] : null
        }
        if (!id) return false;

        const url = `https://player.vimeo.com/video/${id}`
        const v = DOMParser.parseFromString(`~~~ embed:${id} vimeo ~~~`)
        child.parentNode.replaceChild(v, child)
        if (links) links.add(url)

        // Preview image requires a callback.. http://stackoverflow.com/questions/1361149/get-img-thumbnails-from-vimeo
        // if(images) images.add('https://.../vi/' + id + '/0.jpg')

        return true
    } catch (error) {
        console.log(error);
        return false
    }
}

function ipfsPrefix(url) {
    if (STM_Config.ipfs_prefix) {
        // Convert //ipfs/xxx  or /ipfs/xxx  into  https://steemit.com/ipfs/xxxxx
        if (/^\/?\/ipfs\//.test(url)) {
            const slash = url.charAt(1) === '/' ? 1 : 0
            url = url.substring(slash + '/ipfs/'.length) // start with only 1 /
            return STM_Config.ipfs_prefix + '/' + url
        }
    }
    return url
}