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
    queueButton.setAttribute('type', 'button');
    queueButton.setAttribute('value', 'Add to Queue');
    queueButton.setAttribute('onClick', "storePageGeocache()");
    var queueTargetNode = document.getElementById('ctl00_ContentBody_lnkPrintDirectionsSimple');
	queueTargetNode.parentNode.insertBefore(queueButton, queueTargetNode);

    var queueButton = document.createElement('input');
    queueButton.setAttribute('type', 'button');
    queueButton.setAttribute('value', 'Send to MotionX');
    queueButton.setAttribute('onClick', "postGeocache()");
    var queueTargetNode = document.getElementById('ctl00_ContentBody_lnkPrintDirectionsSimple');
	queueTargetNode.parentNode.insertBefore(queueButton, queueTargetNode);

    //storePageGeocache();
    //<button onclick="storePageGeocache()">Add page to queue</button>
    //postGeocache();


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
}
