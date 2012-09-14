// ==UserScript==
// @name           Geocaching.com-MotionX connector
// @author         Will
// @license        ?
// @include        http://geocaching.com/seek/*
// @include        http://www.geocaching.com/seek/*
// @run-at	       document-end
// ==/UserScript==

    // ...
    drawButtons();

function drawButtons()
{
    var addQueueButton = document.createElement('input');
    addQueueButton.setAttribute('id', 'addQueueButton');
    addQueueButton.setAttribute('type', 'button');
    addQueueButton.setAttribute('value', 'Add to Queue');
    addQueueButton.setAttribute('onClick', "addToQueue()");
    if (isCacheQueued()) addQueueButton.setAttribute('disabled', 'disabled');
    var queueTargetNode = document.getElementById('Download');
	queueTargetNode.parentNode.insertBefore(addQueueButton, queueTargetNode);

    var sendQueueButton = document.createElement('input');
    sendQueueButton.setAttribute('id', 'sendQueueButton');
    sendQueueButton.setAttribute('type', 'button');
    sendQueueButton.setAttribute('value', "Send Queue ("+ retrieveGeocache().length +")");
    sendQueueButton.setAttribute('onClick', "postQueue()");
    if (0 == retrieveGeocache().length) sendQueueButton.setAttribute('disabled', 'disabled');
    var queueTargetNode = document.getElementById('Download'); // ctl00_ContentBody_lnkPrintDirectionsSimple
	queueTargetNode.parentNode.insertBefore(sendQueueButton, queueTargetNode);
}

// return true if cache is in queue
function isCacheQueued()
{
    var geocache = retrieveGeocache();
    
    // I think a match on title & location is tight enough
    var cacheTitle    = document.getElementById('ctl00_ContentBody_CacheName').innerText;
    var cacheLocation = document.getElementById('uxLatLon').innerText.replace("°","").replace("°","");
    
    for (var i=0; i<geocache.length; i++) {
        if ( cacheTitle == geocache[i].title && cacheLocation == geocache[i].location ) {
            return true;
        }
    }
    return false; 
}

// grab data from localStorage and parse
function retrieveGeocache()
{
    var geocache = localStorage.geocache;
    
    if (geocache === undefined) {
        return new Array();
    } else
    {
        return JSON.parse(geocache);
    }
}


// When the 'Add to Queue' button is clicked
// scrape the page and save it in localStorage
unsafeWindow.addToQueue = function()
{    
    var geocache = retrieveGeocache();
    var i = geocache.length;

    geocache[i] = new Object;
    geocache[i].title     = document.getElementById('ctl00_ContentBody_CacheName').innerText;
    geocache[i].location  = document.getElementById('uxLatLon').innerText.replace("°","").replace("°","");
    geocache[i].shortDesc = document.getElementById('ctl00_ContentBody_ShortDescription').innerText;
    geocache[i].longDesc  = document.getElementById('ctl00_ContentBody_LongDescription').innerText;
    geocache[i].hint      = document.getElementById('div_hint').innerText;

    console.log(geocache);

    localStorage.geocache = JSON.stringify(geocache);
    
    // grey out the button that was just clicked
    var addQueueButtonTarget = document.getElementById('addQueueButton');
    addQueueButtonTarget.setAttribute('disabled', 'disabled');
    
    // recalculate the number of caches in the queue and un-disable
    var sendQueueButtonTarget = document.getElementById('sendQueueButton');
    sendQueueButtonTarget.setAttribute('value', "Send Queue ("+ retrieveGeocache().length +")");
    if (0 != retrieveGeocache().length) {
        sendQueueButtonTarget.removeAttribute('disabled');
    }
}
    
// POST the json-ified geocache object to endpoint
unsafeWindow.postQueue = function()
{
    var geocache = localStorage.geocache;
    
    if (geocache === undefined) {
        console.log("No sites in queue");
        return;
    }
    
    GM_xmlhttpRequest({
        method: "post",
        url: "http://dollman.org/geocaching/api.php",
        headers: { "Content-type" : "application/x-www-form-urlencoded" },
        data: "geocache_json=" + encodeURIComponent(geocache),
        onload: function(e) { 
            // check for success and set buttons appropriately
            // what's >= 1 when it's not at home? or a string?
            if (e.responseText >= 1) {
                localStorage.clear();
                var sendQueueButtonTarget = document.getElementById('sendQueueButton');
                sendQueueButtonTarget.setAttribute('value', "Success! :)");
                sendQueueButtonTarget.setAttribute('disabled', "disabled");
                console.log("Successful request: " + e.responseText);
            } else
            {
                console.log(e.responseText);
                alert(":( something went wrong! (check the console)");
            }
        }
    });
}