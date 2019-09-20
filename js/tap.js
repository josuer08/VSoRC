/*
 * Copyright (C) 2014 SDN Hub
 *
 * Licensed under the GNU GENERAL PUBLIC LICENSE, Version 3.
 * You may not use this file except in compliance with this License.
 * You may obtain a copy of the License at
 *
 *    http://www.gnu.org/licenses/gpl-3.0.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied.
 */

var url = "http://" + location.hostname + ":8080";
var originalMain;

var portMap = {};

function updateSwitchList() {
    var switchSelect = document.getElementById("switch");
    $.getJSON(url.concat("/v1.0/topology/switches"), function(switches){
        $.each(switches, function(index, value){
            var el = document.createElement("option");
            el.textContent = value.dpid;
            el.value = value.dpid;
            switchSelect.appendChild(el);

            portMap[value.dpid] = value.ports;
        });
    }).then(updatePorts);
}

function updatePorts() {
    var srcPortSelect = document.getElementById("src-ports");
    removeAllChildren(srcPortSelect);

    var allEl = document.createElement("option");
    allEl.textContent = "all";
    allEl.value = "all";
    allEl.setAttribute('selected', 'selected');
    srcPortSelect.appendChild(allEl);

    var sinkPortSelect = document.getElementById("sink-ports");
    removeAllChildren(sinkPortSelect);

    var dpid = $('#switch').val();
    $.each(portMap[dpid], function(key, value) {
        var portNum = parseInt(value.port_no);
        var el = document.createElement("option");
        el.textContent = portNum;
        el.value = portNum;
        srcPortSelect.appendChild(el);

        el = document.createElement("option");
        el.textContent = portNum;
        el.value = portNum;
        sinkPortSelect.appendChild(el);
   });
}

/* Format of the POST data is as follows:

{'fields': {'  'dl_src': mac string,
               'dl_dst': mac string,
               'dl_type': int,
               'dl_vlan': int,
               'nw_src': ip string,
               'nw_dst': ip string,
               'nw_proto': int,
               'tp_src': int,
               'tp_dst': int},
'sources': list of {'dpid': int, 'port_no': int},
'sinks': list of {'dpid': int, 'port_no': int}
}

 */

function makePostData() {
    var tapInfo = {};
    var dpid = $('#switch').val();
    var srcPorts = $('#src-ports').val();
    var sinkPorts = $('#sink-ports').val();

    if (sinkPorts == undefined) {
        alert("Sink ports need to be specified.");
        return undefined;
    } 

    tapInfo['sources'] = [];
    tapInfo['sinks'] = [];
    tapInfo['fields'] = {};

    if ($.inArray('all', srcPorts) != -1)
         tapInfo.sources.push({'dpid': parseInt(dpid), 'port_no': 'all'});
    else {
        $.each(srcPorts, function(index, value) {
            port = {'dpid': parseInt(dpid), 'port_no': parseInt(value)};
            tapInfo.sources.push(port);
        });
    }
    $.each(sinkPorts, function(index, value) {
        var port = {'dpid': parseInt(dpid), 'port_no': parseInt(value)};
        tapInfo.sinks.push(port);
    });

    var macStr = $('#mac-addr').val();
    var ipStr = $('#ip-addr').val();
    var trafficType = $('#traffic-type').val();
    var macClass = $('#mac-class').val();
    var ipClass = $('#ip-class').val();

    if (macClass != "--Ignore--") {
        if (macStr == undefined || macStr=="") {
            alert("MAC address needs to be specified.");
            return undefined;
        }
    }
    if (macClass == 'Source') 
        tapInfo.fields['dl_src'] = macStr;
    else if (macClass == 'Destination') 
        tapInfo.fields['dl_dst'] = macStr;
    else if (macClass == 'Src or Dest') 
        tapInfo.fields['dl_host'] = macStr;

    if (ipClass != "--Ignore--") {
        if (ipStr == undefined || ipStr=="") {
            alert("MAC address needs to be specified.");
            return undefined;
        }
        tapInfo.fields['dl_type'] = 0x800;
    }
    if (ipClass == 'Source') 
        tapInfo.fields['nw_src'] = ipStr;
    else if (ipClass == 'Destination') 
        tapInfo.fields['nw_dst'] = ipStr;
    else if (ipClass == 'Src or Dest') 
        tapInfo.fields['nw_host'] = ipStr;

    if (trafficType == 'ARP') {
        tapInfo.fields['dl_type'] = 0x806;
    }

    // Set prerequisite of IPv4 for all other types
    else if (trafficType == 'ICMP') {
        tapInfo.fields['dl_type'] = 0x800;
        tapInfo.fields['nw_proto'] = 1;

    } else if (trafficType == 'TCP') {
        tapInfo.fields['dl_type'] = 0x800;
        tapInfo.fields['nw_proto'] = 6;
    }
    else if (trafficType == 'HTTP') {
        tapInfo.fields['dl_type'] = 0x800;
        tapInfo.fields['nw_proto'] = 6;
        tapInfo.fields['tp_port'] = 80;
    }
    else if (trafficType == 'HTTPS') {
        tapInfo.fields['dl_type'] = 0x800;
        tapInfo.fields['tp_port'] = 443;
        tapInfo.fields['nw_proto'] = 6;
    }
    else if (trafficType == 'UDP') {
        tapInfo.fields['dl_type'] = 0x800;
        tapInfo.fields['nw_proto'] = 0x11;
    }
    else if (trafficType == 'DNS') {
        tapInfo.fields['dl_type'] = 0x800;
        tapInfo.fields['tp_port'] = 53;
        tapInfo.fields['nw_proto'] = 0x11;
    } else if (trafficType == 'DHCP') {
        tapInfo.fields['dl_type'] = 0x800;
        tapInfo.fields['tp_port'] = 67;
        tapInfo.fields['nw_proto'] = 0x11;
    } 
    console.log(tapInfo.fields);

    return tapInfo;
}

function restoreMain() {
    $("#main").replaceWith(originalMain);
    $('#post-status').html('');
}

function setTap() {
    var tapInfo = makePostData();
    if (tapInfo == undefined)
        return;

    $.post(url.concat("/v1.0/tap/create"), JSON.stringify(tapInfo), function() { 
    }, "json")
    .done(function() {
        originalMain = $('#main').clone();
        $('#post-status').html('');
        $('#main').html('<h2>Tap created</h2><p>Successfully created tap. Check the <a href="/web/stats.html#flow">flow statistics</a> to verify that the rules have been created.</p><button class="pure-button pure-button-primary" onclick="restoreMain()">Create another tap</button>');
    })
    .fail(function() {
        $('#post-status').html('<p style="color:red; background:silver;">Error: Tap creation failed. Please verify your input.');
    });
}


function clearTap() {
    var tapInfo = makePostData();
    if (tapInfo == undefined)
        return;

    $.post(url.concat("/v1.0/tap/delete"), JSON.stringify(tapInfo), function() { 
    }, "json")
    .done(function() {
        originalMain = $('#main').clone();
        $('#post-status').html('');
        $('#main').html('<h2>Tap deleted</h2><p>Successfully deleted tap. Check the <a href="/web/stats.html#flow">flow statistics</a> to verify that the rules have been deleted.</p><button class="pure-button pure-button-primary" onclick="restoreMain()">Create another tap</button>');
    })
    .fail(function() {
        $('#post-status').html('<p style="color:red; background:silver;">Error: Tap deletion failed. Please verify your input.');
    });
}

updateSwitchList();

