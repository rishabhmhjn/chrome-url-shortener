'use strict';
console.log('popup.js loaded');

document.addEventListener('DOMContentLoaded', function() {

  chrome.tabs.getSelected(null, function(tab) {
    $('input[name="url"]').val(tab.url);
  });

  var $resultDiv = $('div.result-main');
  var $resultUrl = $('.result-url');

  var $msgCopy = $('.msg-copy');


  $('.get-url-btn').click(function getUrlCallback( /* event */ ) {
    /* Act on the event */
    var $this = $(this);
    $this.unbind('click');

    $resultDiv.hide();

    $this.addClass('pure-button-disabled');

    jQuery.ajax({
      "type": "POST",
      "contentType": "application/json",
      "url": 'https://www.googleapis.com/urlshortener/v1/url/',
      "data": JSON.stringify({
        "longUrl": $('input[name="url"]').val()
      }),
      // "dataType": "json",
      "success": function(data) {
        var url = data.id;
        // var urlDOM = $('<a>').attr({
        //   "href": url,
        //   "target": "_blank"
        // }).text(url);
        $resultUrl.val(url);
        $resultDiv.show("fast");

        $this.removeClass('pure-button-disabled');
        $this.click(getUrlCallback);
      }
    });
  });

  $('.copy-btn').click(function() {
    $resultUrl.select();
    $msgCopy.show();
    document.execCommand("copy", false, null);
    setTimeout(function() {
      $msgCopy.fadeOut('slow', function() {
        $resultUrl.show();
      });
    }, 1000);
  });

  $resultUrl.click(function() {
    this.select();
  });

  var bg = chrome.extension.getBackgroundPage();

  if (bg.oauth.hasToken()) {
    var request = {
      'method': 'GET',
      'parameters': {
        'alt': 'json'
      }
    };
    var url = 'https://www.googleapis.com/oauth2/v1/userinfo';

    bg.oauth.sendSignedRequest(url, function(resp, xhr) {
      console.log('oauth.sendSignedRequest completed');
      // console.log(arguments);
      if (xhr.status == 200) {
        resp = JSON.parse(resp);
        console.log(resp);

        $('.loginBlock').append(
          'Logged in as <a href="' + resp.link + '" target="_blank">' + resp.name + '</a>'
        );
      }


    }, request);

  } else {
    $('.loginBlock').append(
      '<a href="javascript:void(0);" class="do-login">Login</a>'
    );
    $('.do-login').click(function() {
      bg.doLogin();
    });
  }


});