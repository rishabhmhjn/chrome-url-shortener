'use strict';
console.log('popup.js loaded');

document.addEventListener('DOMContentLoaded', function() {

  var bg = chrome.extension.getBackgroundPage();

  chrome.tabs.getSelected(null, function(tab) {
    $('input[name="url"]').val(tab.url);
  });

  var $resultDiv = $('div.result-main');
  var $resultUrl = $('.result-url');

  var $msgCopyDiv = $('.msg-copy');
  var $msgCopy = $('small', $msgCopyDiv);


  $('.get-url-btn').click(function getUrlCallback( /* event */ ) {
    /* Act on the event */
    var $this = $(this);
    $this.unbind('click');

    $resultDiv.hide();

    $this.addClass('pure-button-disabled');

    var onResult = function(shortUrl) {
      $resultUrl.val(shortUrl);
      $resultDiv.show("fast");

      var $qrImg = $('<img>').attr('src', 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' + encodeURIComponent(shortUrl) + '&choe=UTF-8');
      $('.qr-block').empty().append($qrImg).show();

      $this.removeClass('pure-button-disabled');
      $this.click(getUrlCallback);
    };

    var onResultFail = function() {
      $msgCopy.html('<span style="color:red;">Failed!!!</span>');
      $msgCopyDiv.show();
      setTimeout(function() {
        $msgCopyDiv.fadeOut('slow', function() {
          $resultUrl.show();
        });
      }, 2000);
      $this.click(getUrlCallback);
    }

    // login check 
    if (bg.oauth.hasToken()) {
      bg.oauth.sendSignedRequest('https://www.googleapis.com/urlshortener/v1/url/', function(resp, xhr) {
        // console.log(arguments);
        if (xhr.status == 200) {
          onResult(JSON.parse(resp).id);
        } else {
          onResultFail();
        }
      }, {
        'method': 'POST',
        'headers': {
          "Content-Type": "application/json"
        },
        'body': JSON.stringify({
          "longUrl": $('input[name="url"]').val()
        })
      });
    } else {
      jQuery.ajax({
        "type": "POST",
        "contentType": "application/json",
        "url": 'https://www.googleapis.com/urlshortener/v1/url/',
        "data": JSON.stringify({
          "longUrl": $('input[name="url"]').val()
        })
      }).done(function(data) {
        var url = data.id;
        onResult(url);
      }).fail(onResultFail);
    }
  });

  $('.copy-btn').click(function() {
    $resultUrl.select();
    $msgCopy.text("Copied to clipboard");
    $msgCopyDiv.show();
    document.execCommand("copy", false, null);
    setTimeout(function() {
      $msgCopyDiv.fadeOut('slow', function() {
        $resultUrl.show();
      });
    }, 1000);
  });

  $resultUrl.click(function() {
    this.select();
  });

  var logoutSetup = function() {

    $('.login-block small').empty().append(
      '<a href="javascript:void(0);" class="do-login">Login</a>'
    );
    $('.do-login').unbind('click').click(function() {
      bg.doLogin();
    });
  };


  if (bg.oauth.hasToken()) {
    var request = {
      'method': 'GET',
      'parameters': {
        'alt': 'json'
      }
    };

    var url = 'https://www.googleapis.com/oauth2/v1/userinfo';

    bg.oauth.sendSignedRequest(url, function(resp, xhr) {
      // console.log('oauth.sendSignedRequest completed');
      // console.log(arguments);
      if (xhr.status == 200) {
        resp = JSON.parse(resp);
        // console.log(resp);

        $('.login-block small').empty().append(
          '<a href="' + resp.link + '" target="_blank">' + '<img src="' + resp.picture + '" style="width:20px;height:20px;vertical-align:middle" alt="' + resp.name + '" />' + '</a>' + ' | <a class="logout" href="#">Logout</a>'
        );

        $('.logout').unbind('click').click(function() {
          bg.oauth.clearTokens();
          logoutSetup();
        })
      }
    }, request);

  } else {
    logoutSetup();
  }


});