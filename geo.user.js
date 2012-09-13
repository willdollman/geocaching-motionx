// ==UserScript==
// @name           Geocaching.com-MotionX connector
// @author         Will
// @license        ?
// @include        http://geocaching.com/*
// @include        http://www.geocaching.com/*
// @run-at	       document-end
// ==/UserScript==

    var link = document.createElement('a');
    link.href = "http://www.example.com";
    link.appendChild(document.createTextNode("Click Me"));
    var targetNode = document.getElementById('ctl00_ContentBody_lnkPrintDirectionsSimple');
	//targetNode.parentNode.insertBefore(link, targetNode);


    var queueButton = document.createElement('input');
    if ( cacheQueued() ) {
        queueButton.setAttribute('disabled', 'disabled');
    }
    queueButton.setAttribute('id', 'addQueueButton');
    queueButton.setAttribute('type', 'button');
    queueButton.setAttribute('value', 'Add to Queue');
    queueButton.setAttribute('onClick', "storePageGeocache()");
    var queueTargetNode = document.getElementById('ctl00_ContentBody_lnkPrintDirectionsSimple');
	queueTargetNode.parentNode.insertBefore(queueButton, queueTargetNode);

    var queueButton = document.createElement('input');
    queueButton.setAttribute('id', 'sendQueueButton');
    queueButton.setAttribute('type', 'button');
    queueButton.setAttribute('value', "Send Queue ("+ retrieveGeocache().length +")");
    queueButton.setAttribute('onClick', "postGeocache()");
    var queueTargetNode = document.getElementById('ctl00_ContentBody_lnkPrintDirectionsSimple');
	queueTargetNode.parentNode.insertBefore(queueButton, queueTargetNode);


// return true if cache is in queue
function cacheQueued()
{
    var geocache = retrieveGeocache();
    
    // I think a match on both title & location is suitably tight
    var cacheTitle    = document.getElementById('ctl00_ContentBody_CacheName').innerText;
    var cacheLocation = document.getElementById('uxLatLon').innerText;
    
    for (var i=0; i<geocache.length; i++) {
        if ( cacheTitle == geocache[i].title && cacheLocation == geocache[i].location ) {
            return true;
        }
    }
    return false; 
}

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
    
unsafeWindow.postGeocache = function()
{
    // this should POST the json-ified geocache object to dollman.org
    
    var geocache = localStorage.geocache;
    
    if (geocache === undefined) {
        console.log("No sites in queue");
        return;
    }
    
    GM_xmlhttpRequest({
        method: "post",
        url: "http://dollman.org/geocaching/api.php",
        headers: { "Content-type" : "application/x-www-form-urlencoded" },
        data: encodeURI("geocache_json=" + geocache),
        //onload: function(e) { alert(e.responseText); }
    });
    
}

// Insecure, should probably fix
unsafeWindow.storePageGeocache = function()
{
    var geo_temp = localStorage.geocache;

    if (geo_temp === undefined) {
        geocache = new Array();
        var i = 0;
        console.log("--- Creating new array");
    } else
    {
        geocache = JSON.parse(geo_temp);
        var i = geocache.length;
        console.log("Already got array with " + i + " elements");
    }

    geocache[i] = new Object;
    geocache[i].title     = document.getElementById('ctl00_ContentBody_CacheName').innerText;
    geocache[i].location  = document.getElementById('uxLatLon').innerText;
    geocache[i].shortDesc = document.getElementById('ctl00_ContentBody_ShortDescription').innerText;
    geocache[i].longDesc  = document.getElementById('ctl00_ContentBody_LongDescription').innerText;
    geocache[i].hint      = document.getElementById('div_hint').innerText;

    console.log(geocache);

    localStorage.geocache = JSON.stringify(geocache);
    
    // grey out the button that was just clicked
    var addQueueButtonTarget = document.getElementById('addQueueButton');
    console.log("disabling button...");
    addQueueButtonTarget.setAttribute('disabled', 'disabled');
    
    // recalculate the number of caches in the queue
    var sendQueueButtonTarget = document.getElementById('sendQueueButton');
    console.log("updating queuecount button...");
    sendQueueButtonTarget.setAttribute('value', "Send Queue ("+ retrieveGeocache().length +")");
}
