<?php

// should be changed to POST later
$geocache_json = $_REQUEST['geocache_json'];

//var_dump( json_decode($geocache_json) );
$geocache = json_decode($geocache_json);

//echo "<br><br>Title: ". $geocache[0]->{'title'};


// need to parse out the hours and minutes from the coordinates (use DMStoDEC)
// this should be done in geocachetoXML

//loop through geocache[ ]'s
$geoXML[0] = geocachetoXML($geocache);

print multi_attach_mail("will@dollman.org", $geoXML, "will@dollman.org", count($geocache));


// Make sure that all variables are encoded to REMOVE XML characters!
function geocachetoXML($geocache)
{

// gpx header
$xml = <<<EOD
<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" creator="MotionXGPSFull 19.1 Build 4444R">

EOD;

    // insert waypoints
    for($i=0; $i<count($geocache); $i++) {
        $xml .= createWaypoint($geocache[$i]);
    }

// gpx footer
$xml .= <<<EOD
</gpx>
EOD;

    return $xml;
}


function createWaypoint($geodata)
{

preg_match('/N\s(\d*)\s([\d.]*)\sW\s(\d*)\s([\d.]*)/', $geodata->{location}, $coordPart);

$geodata->{latitude} = DMStoDEC( $coordPart[1], $coordPart[2], 0 );
$geodata->{longitude} = -1 * DMStoDEC( $coordPart[3], $coordPart[4], 0 );

$waypointData = <<<EOD
<wpt lat="{$geodata->{latitude}}" lon="{$geodata->{longitude}}">
<name>{$geodata->{title}}</name>
<desc>{$geodata->{shortDesc}}\n---\n{$geodata->{longDesc}}\n---\nHint: {$geodata->{hint}}</desc>
</wpt>

EOD;

    return $waypointData;
}

function DMStoDEC($deg,$min,$sec)
{

// Converts DMS ( Degrees / minutes / seconds ) 
// to decimal format longitude / latitude

    return $deg+((($min*60)+($sec))/3600);
}    

function DECtoDMS($dec)
{

// Converts decimal longitude / latitude to DMS
// ( Degrees / minutes / seconds ) 

// This is the piece of code which may appear to 
// be inefficient, but to avoid issues with floating
// point math we extract the integer part and the float
// part by using a string function.

    $vars = explode(".",$dec);
    $deg = $vars[0];
    $tempma = "0.".$vars[1];

    $tempma = $tempma * 3600;
    $min = floor($tempma / 60);
    $sec = $tempma - ($min*60);

    return array("deg"=>$deg,"min"=>$min,"sec"=>$sec);
}   



function multi_attach_mail($to, $geodata, $sendermail, $geoCount) 
{
    // email fields: to, from, subject, and so on
    //$from = "Files attach <".$sendermail.">"; 
    $from = "will@dollman.org";
    $subject = date("d.M H:i")." F=".count($geodata); 
    $message = "GPS import from Geocaching-MotionX importer\nContains $geoCount datapoints";
    $headers = "From: will@dollman.org";
 
    // boundary 
    $semi_rand = md5(time()); 
    $mime_boundary = "==Multipart_Boundary_x{$semi_rand}x"; 

    // headers for attachment 
    $headers .= "\nMIME-Version: 1.0\n" . "Content-Type: multipart/mixed;\n" . " boundary=\"{$mime_boundary}\""; 
 
    // multipart boundary 
    $message = "--{$mime_boundary}\n" . "Content-Type: text/plain; charset=\"iso-8859-1\"\n" .
    "Content-Transfer-Encoding: 7bit\n\n" . $message . "\n\n"; 
    // preparing attachments
    for($i=0;$i<count($geodata);$i++){
            $message .= "--{$mime_boundary}\n";
            $chunkdata = chunk_split(base64_encode($geodata[$i]));
            $message .= "Content-Type: application/octet-stream; name=\"data.gpx\"\n";
            $message .= "Content-Description: data.gpx\n";
            $message .= "Content-Disposition: attachment;\n" . " filename=\"gpsdata$i.gpx\"; size=100;\n";
            $message .= "Content-Transfer-Encoding: base64\n\n" . $chunkdata . "\n\n";
        }
    $message .= "--{$mime_boundary}--";
    $returnpath = "-f" . $sendermail;
    $ok = @mail($to, $subject, $message, $headers); 
    if($ok){ return $i; } else { return 0; }
}

?>
