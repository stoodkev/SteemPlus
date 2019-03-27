const regexWalletSteemit = /^https:\/\/steemit\.com\/@[a-zA-Z0-9\-\.]*\/transfers\/*$/;
const regexWalletSteemitWallet = /^https:\/\/steemitwallet\.com\/@[a-zA-Z0-9\-\.]*\/transfers\/*$/;
const regexWalletBusy = /^https:\/\/busy\.org\/(wallet\/*$|@[a-zA-Z0-9\-\.]*\/transfers\/*$)/;
const regexBlogSteemit = /^https:\/\/steemit\.com\/@.*$/;
const regexBlogBusy = /^https:\/\/busy\.org\/@([a-zA-Z0-9\-\.]*)\/*.*$/;
const regexFeedSteemit = /^https:\/\/steemit\.com\/(created|hot|promoted|trending|@[a-zA-Z0-9\-\.]*\/feed)[\/.]*$/;
const regexFeedBusy = /^https:\/\/busy\.org\/(created|hot|active|trending)\/*.*$/;
const regexFeedPlusSteemit = /^https:\/\/steemit\.com\/(created[a-zA-Z0-9\-\.\/]*|hot[a-zA-Z0-9\-\.\/]*|promoted[a-zA-Z0-9\-\.\/]*|trending[a-zA-Z0-9\-\.\/]*|@[a-zA-Z0-9\-\.\/]*\/feed)\/*#plus$/;
const regexFeedPlusBusy = /^https:\/\/busy\.org\/(created[a-zA-Z0-9\-\.\/]*|hot[a-zA-Z0-9\-\.\/]*|promoted[a-zA-Z0-9\-\.\/]*|trending[a-zA-Z0-9\-\.\/]*|@[a-zA-Z0-9\-\.\/]*\/feed|)\/*#plus$/;
const regexPostSteemit = /^https:\/\/steemit\.com\/[a-z0-9\-]+\/@[\.\-a-zA-Z0-9]*\/.*$/;
const regexPostSteemitParameters = /^https:\/\/steemit\.com\/[a-z0-9\-]+\/@([\.\-a-zA-Z0-9]*)\/(.*)$/;
const regexCreatePostSteemit = /^https:\/\/steemit\.com\/submit\.html$/;
const regexCreatePostBusy = /^https:\/\/busy\.org[\/editor]+$/;

// Warning! To use this one you'll have to test the wallet too cause the format is the same
const regexPostBusy = /^https:\/\/busy\.org\/@[a-zA-Z0-9\.\-]*\/.*$/;
const regexBusy = /^https:\/\/busy\.org\/*$/;

const regexClassificationUserBlogSteemit = /^https:\/\/steemit\.com\/@[a-zA-Z0-9\.\-]*(\/comments#*|\/recent-replies#*|.*#mentions|.*#votes)*\/*$/;
const regexVoteWeightSliderBlogSteemit = /^https:\/\/steemit\.com\/@[a-zA-Z0-9\.\-]*(\/comments#*|\/recent-replies#*)*\/*$/;


// Settings regex
const regexSettingsSteemit = /^https:\/\/steemit\.com\/@([a-zA-z0-9\.\-]*)\/settings$/
const regexSettingsBusySignature = /^https:\/\/busy\.org\/@([a-zA-z0-9\.\-]*)\/settings$/
const regexSettingsBusy = /^https:\/\/busy\.org\/settings$/
// const regexSettingsUtopian = /^https:\/\/steemit\.com\/@([a-zA-z0-9\.\-]*)\/settings$/
