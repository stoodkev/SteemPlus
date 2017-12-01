function getUsernameFromProfile()
{
    return window.location.href.split('@')[1].split('/')[0];
}

 function getAccountData(username)
{
    return new Promise (function(resolve,reject){steem.api.getAccounts([username], function(err, response){
     resolve(response);
    });
});
}