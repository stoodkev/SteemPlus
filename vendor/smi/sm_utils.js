function getMarketSettings() {
  return new Promise(function(fulfill, reject) {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: "https://steemmonsters.com/settings",
      success: function(response) {
        console.log(response);
        fulfill(response);
      },
      error: function(msg) {
        console.log(msg);
        reject(msg);
      }
    });
  });
}

var sm = {
  getMarketSettings: getMarketSettings
};

window.SteemPlus = window.SteemPlus || {};
window.SteemPlus.SteemMonsters = sm;
