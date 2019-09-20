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
var hostList = {};

function updateHosts() {
    var serverSelect = document.getElementById("servers");

	$.getJSON(url.concat("/v1.0/hosts"), function(hosts){
	    $.each(hosts, function(key, value){
            hostList[key] = value.mac
            el = document.createElement("option");
            el.textContent = key;
            el.value = key;
            serverSelect.appendChild(el);
        });
    });
}
    
updateHosts();

/* Format of the POST data is as follows:

{'servers': list of {'ip': ip string, 'mac': mac string},
'virtual_ip': ip string,
'rewrite_ip': 0 or 1 }

 */

function makePostData() {
    var vip = $('#virtual-ip').val();
    var servers = $('#servers').val();
    var rewriteIP = $('#rewrite-ip').is(':checked');
    var lbConfig = {};
    lbConfig['servers'] = [];

    if (servers != undefined) {
        for (i=0; i<servers.length;i++) {
            var server = servers[i];
            lbConfig['servers'].push({'ip': server, 'mac': hostList[server]});
        }
    }
    lbConfig['virtual_ip'] = vip;

    if (rewriteIP) 
        lbConfig['rewrite_ip'] = 1;
    else
        lbConfig['rewrite_ip'] = 0;

    return lbConfig;
}


function createLBPool() {
    $('#post-status').html('');

    var lbConfig = makePostData();
    if (lbConfig == undefined)
        return;

    $.post(url.concat("/v1.0/loadbalancer/create"), JSON.stringify(lbConfig), function() { 
    }, "json")
    .done(function() {
        $('#post-status').html('');
        $('#main').html('<h2>Load-balancer pool created</h2><p>Successfully created load-balancer pool.  Start sending requests to the virtual IP.</p><button class="pure-button pure-button-primary" onclick="deleteLBPool(\''+lbConfig.virtual_ip+'\')">Delete LB pool</button>');
    })
    .fail(function() {
        $('#post-status').html('<p style="color:red; background:silver;">Error: Load-balancer pool creation failed. Please verify your input.');
    });
}

function deleteLBPool(vip) {
    if (typeof(vip)==='undefined') {
        vip = $('#virtual-ip').val();
    }

    $('#post-status').html('');

    lbConfig = {};
    lbConfig['virtual_ip'] = vip;
    lbConfig['rewrite_ip'] = 1;
    lbConfig.servers = [];

    $.post(url.concat("/v1.0/loadbalancer/delete"), JSON.stringify(lbConfig), function() { 
    }, "json")
    .done(function() {
        // In direct call cases where VIP was pre-specified in onClick,
        // it will be best to direct to the original main even before
        // the delete pool button click
        $('#post-status').html('');
        $('#main').html('<h2>Load-balancer pool deleted</h2><p>Successfully deleted load-balancer pool.</p><button class="pure-button pure-button-primary" onclick="window.location.reload()">Create LB pool</button>');
    })
    .fail(function() {
        $('#post-status').html('<p style="color:red; background:silver;">Error: Load-balancer pool deletion failed. Please verify your input.');
    });
}

