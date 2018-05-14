const regexWalletSteemit = /^https:\/\/steemit\.com\/@[a-zA-Z0-9\-\.]*\/transfers\/*$/;
const regexWalletBusy = /^https:\/\/busy\.org\/(wallet\/*$|@[a-zA-Z0-9\-\.]*\/transfers\/*$)/;
const regexBlogSteemit = /^https:\/\/steemit\.com\/@.*$/;
const regexBlogBusy = /^https:\/\/busy\.org\/@.*$/;
const regexFeedSteemit = /^https:\/\/steemit\.com\/(created|hot|promoted|trending|@[a-zA-Z0-9\-\.]*\/feed)[\/.]*$/;
const regexFeedBusy = /^https:\/\/busy\.org\/(created|hot|active|trending)\/.*$/;
const regexFeedPlusSteemit = /^https:\/\/steemit\.com\/(created|hot|promoted|trending|@[a-zA-Z0-9\-\.]*\/feed)\/*#plus$/;
const regexPostSteemit = /^https:\/\/steemit\.com\/[a-z0-9\-]+\/@[\.\-a-zA-Z0-9]*\/.*$/;
const regexCreatePostSteemit = /^https:\/\/steemit\.com\/submit\.html$/;

// Warning! To use this one you'll have to test the wallet too cause the format is the same
const regexPostBusy = /^https:\/\/busy\.org\/@[a-zA-Z0-9\.\-]*\/.*$/;

const regexClassificationUserBlogSteemit = /^https:\/\/steemit\.com\/@[a-zA-Z0-9\.\-]*(\/comments#*|\/recent-replies#*|.*#mentions|.*#votes)*\/*$/;
const regexVoteWeightSliderBlogSteemit = /^https:\/\/steemit\.com\/@[a-zA-Z0-9\.\-]*(\/comments#*|\/recent-replies#*)*\/*$/;
