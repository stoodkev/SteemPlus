const regexWalletSteemit = /^https:\/\/steemit\.com\/@[a-zA-Z0-9\-\.]*\/transfers\/*$/;
const regexWalletBusy = /^https:\/\/busy\.org\/wallet\/*$/;
const regexWalletBusy2 = /^https:\/\/busy\.org\/@[a-zA-Z0-9\-\.]*\/transfers\/*$/;
const regexBlogSteemit = /^https:\/\/steemit\.com\/@.*$/;
const regexBlogBusy = /^https:\/\/busy\.org\/@.*$/;
const regexFeedSteemit = /^https:\/\/steemit\.com\/(created|hot|promoted|trending)\/.*$/;
const regexFeedBusy = /^https:\/\/busy\.org\/(created|hot|active|trending)\/.*$/;
const regexFeedPlusSteemit = /^https:\/\/steemit\.com\/(created|hot|promoted|trending)\/*#plus$/;
const regexPostSteemit = /^https:\/\/steemit\.com\/[a-zA-Z0-9]+\/@[\.\-a-zA-Z0-9]*\/.*$/;

// Warning! To use this one you'll have to test the wallet too cause the format is the same
const regexPostBusy = /^https:\/\/busy\.org\/@[a-zA-Z0-9\.\-]*\/.*$/;
