/**
 * this code loads only if the user clicks on the popup icon
 */


/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        var url = tab.url;
        callback(url);
    });
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

        if (!response || !response) {
            errorCallback('No response.');
            return;
        }

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

document.addEventListener('DOMContentLoaded', function clickOnPopupIcon(event) {
    document.removeEventListener(event, clickOnPopupIcon, false); // remove listener, no longer needed
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
}, false);
