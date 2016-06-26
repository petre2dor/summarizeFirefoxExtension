// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} url - current url
 * @param {function(string)} callback - Called when an summary was found
 * @param {function(string)} errorCallback - Called when an error occurs.
 *   The callback gets a string that describes the failure reason.
 */
function getSummary(url, callback, errorCallback) {
  var summarizeApiUrl = 'http://46.101.138.193:8000/summary';
  var x = new XMLHttpRequest();

  x.open('GET', summarizeApiUrl + '?url=' + url);
  // it responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from summaryApi.
    var response = x.response;
    console.log(response);
    if (!response || !response) {
      errorCallback('No response.');
      return;
    }
    console.log(response.title);
    console.log(response.body);
    callback(response.title, response.body);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}



function renderResults(title, summary) {
  document.getElementById('title').textContent = title;
  document.getElementById('summary').textContent = summary;
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
        // Put the image URL in Google search.
        renderResults('Getting summary for: ', url);

        getSummary( url,
                    function(title, summary) {
                        renderResults(title, summary);
                    },
                    function(errorMessage) {
                        renderResults('Cannot display summary. ' + errorMessage);
                    }
        );
  });
});
