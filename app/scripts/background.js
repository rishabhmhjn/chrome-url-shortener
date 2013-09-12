'use strict';

chrome.runtime.onInstalled.addListener(function(details) {
  console.log('previousVersion', details.previousVersion);
});
1

var oauth = ChromeExOAuth.initBackgroundPage({
  "request_url": "https://www.google.com/accounts/OAuthGetRequestToken",
  "authorize_url": "https://www.google.com/accounts/OAuthAuthorizeToken",
  "access_url": "https://www.google.com/accounts/OAuthGetAccessToken",
  "consumer_key": "anonymous",
  "consumer_secret": "anonymous",
  "scope": [
    "https://www.googleapis.com/auth/urlshortener https://www.googleapis.com/auth/userinfo.profile"
  ],
  "app_name": "URL Zippy"
});



var doLogin = function() {
  console.log("doLogin called");


  oauth.authorize(function() {
    console.log("oauth.authorize callback");
    console.log(arguments);

  });


};