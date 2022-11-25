"use strict";

let exec = require("node:child_process").exec;

const { Router } = require("express");
const router = new Router();

//renders de las paginas web
router.get("/", (req, res) => {
    res.render("starter");
});

router.get("/access", (req, res) => {
    res.render("access");
});

router.get("/starter", (req, res) => {
    res.render("starter");
});

router.get("/stats", (req, res) => {
    res.render("stats");
});

router.get("/topology", (req, res) => {
    res.render("topology");
});
//This booleans is for manage controller and the vsorc
let isVsorcUP = false;
let isControllerUP = false;
router.get("/health", (req, res) => {
    res.render("index");
});
//en lo adelante se encuentran las peticiones de datos
router.get("/free", (req, res) => {
    var child;
    child = exec(
        "free -b | grep Mem |  awk  '{print $3}'",
        function (error, stdout, stderr) {
            console.log("free");
            res.send(stdout);
        }
    );
});

router.post("/flowdel", (req, res) => {
    var child;
    var flow = JSON.stringify(req.body);
    child = exec(
        "curl -X POST -d " + req.body + "localhost:8080/flowdel",
        function (error, stdout, stderr) {
            console.log(stdout);
            console.log(req.body);
            res.send(req.body);
        }
    );
});

router.get("/mpstat", (req, res) => {
    var child;
    child = exec(
        "mpstat 1 1| grep all | grep Average | awk '{print $12}'",
        function (error, stdout, stderr) {
            console.log("mpstat");
            res.send(stdout);
        }
    );
});

router.get("/ifstat", (req, res) => {
    var child;
    child = exec(
        "ifstat -n -b -i eth0  0.3 1 | grep [0-9]$",
        function (error, stdout, stderr) {
            console.log("ifstat");
            res.send(stdout);
        }
    );
});

router.get("/showtemp", (req, res) => {
    var child;
    child = exec(
        'cd $(echo $HOME/vsorcdistro)/scripts && (./multissh.sh  "$(echo $(cat geteverything.sh))" |grep -v rpi | sort -n -t . -k 1,1 -k 2,2 -k 3,3 -k 4,4)',
        function (error, stdout, stderr) {
            console.log("show temp"); //this was modified
            res.send(stdout);
        }
    );
});
router.get("/gettopo", (req, res) => {
    var child;
    child = exec(
        "curl localhost:8080/topology",
        function (error, stdout, stderr) {
            console.log("gettopo");
            res.send(stdout);
        }
    );
});

router.get("/net", (req, res) => {
    var child;
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && echo net > fifo",
        function (error, stdout, stderr) {
            console.log("net");
            res.send(stdout);
        }
    );
});

router.get("/rpiping", (req, res) => {
    var child;
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && ./rpiping.sh",
        function (error, stdout, stderr) {
            console.log("rpiping");
            res.send(stdout);
        }
    );
});

router.get("/nodes", (req, res) => {
    var child;
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && echo nodes > fifo",
        function (error, stdout, stderr) {
            console.log("nodes");
            res.send(stdout);
        }
    );
});

router.get("/statusnodes", (req, res) => {
    var child;
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && echo status > fifo",
        function (error, stdout, stderr) {
            console.log("status");
            res.send(stdout);
        }
    );
});

router.get("/intfs", (req, res) => {
    var child;
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && echo intfs > fifo",
        function (error, stdout, stderr) {
            console.log("interfaces");
            res.send(stdout);
        }
    );
});

router.get("/iperf", (req, res) => {
    var child;
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && echo iperf > fifo",
        function (error, stdout, stderr) {
            console.log("pingall");
            res.send(stdout);
        }
    );
});

router.get("/pingall", (req, res) => {
    var child;
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && echo pingall > fifo",
        function (error, stdout, stderr) {
            console.log("pingall");
            res.send(stdout);
        }
    );
});
router.get("/placement", (req, res) => {
    var child;
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && echo placement > fifo",
        function (error, stdout, stderr) {
            console.log("placement");
            res.send(stdout);
        }
    );
});

router.get("/getvsorcdata", (req, res) => {
    var child;
    var child2;
    var child3;
    child2 = exec(
        "ps aux | grep GRE| grep sudo | grep -v tail| awk {'print $2'}",
        function (error, stdout, stderr) {
            console.log("view status vsorc"); //Cambia el valor de isVsorcUP revisando el ID proceso
            if (stdout === "") {
                isVsorcUP = false;
            } else {
                isVsorcUP = true;
            }
        }
    );
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && cat aichivo 2>/dev/null",
        function (error, stdout, stderr) {
            console.log("getting vsorc data");
            res.send(stdout + "^" + isVsorcUP);
        }
    );
});
router.get("/getcontrollerdata", (req, res) => {
    var child;
    var child2;
    child2 = exec(
        "ps aux | grep python | grep ryu | grep -v grep |awk {'print $2'}",
        function (error, stdout, stderr) {
            console.log(stdout);
            console.log("view status controller");
            if (stdout === "") {
                isControllerUP = false;
            } else {
                isControllerUP = true;
            }
        }
    );
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && cat controllerout 2>/dev/null",
        function (error, stdout, stderr) {
            console.log("getting controller data");
            res.send(stdout + "^" + isControllerUP); //Send controller data and UP or DOWN separate by ^
        }
    );
});

router.get("/resetflows", (req, res) => {
    var child;
    var child2;
    let salida;
    child = exec(
        "curl localhost:8080/data?list=switches",
        function (error, stdout, stderr) {
            let value = "";
            try {
                value = JSON.parse(stdout);
                for (key in value) {
                    child2 = exec(
                        "cd $(echo $HOME/vsorcdistro)/scripts && ./resetflows.sh " +
                            key,
                        function (err, out, stder) {
                            console.log(out);
                            salida = out;
                        }
                    );
                }

                if (stdout === undifined) {
                    res.send("Switches not found");
                } else {
                    res.send(salida);
                }
            } catch (error) {
                //console.error(error);
                console.log("no response from server");
                // expected output: ReferenceError: nonExistentFunction is not def$
                // Note - error messages will vary depending on browser
            }
        }
    );
});

router.get("/listswitch", (req, res) => {
    var child;
    child = exec(
        "curl localhost:8080/data?list=switches",
        function (error, stdout, stderr) {
            console.log("listswitch");
            console.log(stdout);
            let value = "";
            try {
                value = JSON.parse(stdout);
                res.send(value);
            } catch (error) {
                //console.error(error);
                console.log("no response from controller");
                // expected output: ReferenceError: nonExistentFunction is not defined
                // Note - error messages will vary depending on browser
                res.send(null);
            }
        }
    );
});

router.get("/status", (req, res) => {
    var child;
    console.log(req.query.status + req.query.dpid);
    child = exec(
        'curl "localhost:8080/status?status=' +
            req.query.status +
            "&dpid=" +
            req.query.dpid +
            '"',
        function (error, stdout, stderr) {
            console.log("statusFlows");
            console.log(stdout);
            let value = JSON.parse(stdout);

            res.send(value);
        }
    );
});

router.get("/tablestatus", (req, res) => {
    var child;
    console.log(req.query);
    child = exec(
        'curl "localhost:8080/data?tablestat=' + req.query.tablestat + '"',
        function (error, stdout, stderr) {
            console.log("table status");
            console.log(stdout);
            let value = "";
            try {
                value = JSON.parse(stdout);
                res.send(value);
            } catch (error) {
                //console.error(error);
                console.log("no response from server");
                // expected output: ReferenceError: nonExistentFunction is not defined
                // Note - error messages will vary depending on browser
                let er = "No response from server";
                res.send(JSON.stringify(er));
            }
        }
    );
});

router.get("/portsdesc", (req, res) => {
    var child;
    console.log(req.query);
    child = exec(
        'curl "localhost:8080/data?portdesc=' + req.query.portdesc + '"',
        function (error, stdout, stderr) {
            console.log("port desc");
            let value = "";
            try {
                value = JSON.parse(stdout);
                res.send(value);
            } catch (error) {
                //console.error(error);
                console.log("no response from server");
                // expected output: ReferenceError: nonExistentFunction is not defined
                // Note - error messages will vary depending on browser
                let er = "No response from server";
                res.send(JSON.stringify(er));
            }
        }
    );
});

router.get("/portsstat", (req, res) => {
    var child;
    console.log(req.query);
    child = exec(
        'curl "localhost:8080/data?portstat=' + req.query.portstat + '"',
        function (error, stdout, stderr) {
            console.log("port status");
            console.log(stdout);
            let value = "";
            try {
                value = JSON.parse(stdout);
                res.send(value);
            } catch (error) {
                //console.error(error);
                console.log("no response from server");
                // expected output: ReferenceError: nonExistentFunction is not defined
                // Note - error messages will vary depending on browser
                let er = "No response from server";
                res.send(JSON.stringify(er));
            }
        }
    );
});

router.get("/startcontroller", (req, res) => {
    isControllerUP = true;

    var child;
    //cd /home/pi && setsid $(cat /home/pi/ejecutarcontroller.sh | grep sudo) >/dev/null 2>&1 < /dev/null &
    //cd /home/pi && ./ejecutarcontroller.sh > /dev/null 2>&1 < /dev/null &  //comando anterior
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && touch controllerout && ./ejecutarcontroller.sh > controllerout 2>&1 &",
        function (error, stdout, stderr) {
            console.log("controller started");
            res.send(stdout);
        }
    );
});

router.get("/startcontrollerrouter", (req, res) => {
    isControllerUP = true;

    var child;
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && touch controllerout && ./ryurouter.sh > controllerout 2>&1 &",
        function (error, stdout, stderr) {
            console.log("controller REST Router started");
            res.send(stdout);
        }
    );
});

router.get("/stopcontroller", (req, res) => {
    isControllerUP = false;

    var child;
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && rm controllerout && sudo kill $(ps aux | grep python | grep ryu | awk {'print $2'})",
        function (error, stdout, stderr) {
            console.log("controller stopped");
            res.send(stdout);
        }
    );
});
router.get("/sendcommand", (req, res) => {
    var child;
    console.log(req.query);
    // request = JSON.parse(req.query.cmd); //recibiendo el comando
    //
    // console.log(request);
    child = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && echo " +
            req.query.cmd +
            " > fifo",
        function (error, stdout, stderr) {
            console.log("command received \n" + req.query.cmd + "\n");
            res.send(stdout);
        }
    );
});
router.get("/cancel", (req, res) => {
    var child;
    child = exec(
        "sudo kill -2 $(ps aux | grep GRE| grep sudo|awk {'print $2'})",
        function (error, stdout, stderr) {
            console.log("cancelled");
            res.send(stdout);
        }
    );
});
router.get("/startvsorc", (req, res) => {
    var child0; //needs a mkfifo named fifo to exist
    var child1;
    var child2;
    var child3;
    var child4;
    var answer;
    request = JSON.parse(req.query.topology);
    console.log("Topology is : \n" + request);
    //controlar que solo se haga un arranque por vez y agregar el exec 3>fifo
    child0 = exec(
        'cd $(echo $HOME/vsorcdistro)/scripts && echo "' + request + '" > data',
        function (error, stdout, stderr) {
            console.log(stdout + stderr);
            answer += stdout;
        }
    );
    child1 = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && mkfifo fifo && rm aichivo && touch aichivo",
        function (error, stdout, stderr) {
            console.log(stdout + stderr);
            answer += stdout;
        }
    );
    child2 = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && exec 3>fifo",
        function (error, stdout, stderr) {
            console.log(stdout + stderr);
            answer += stdout;
        }
    );

    //child3 uses tail so it can read from fifo even after a EOF
    child3 = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && tail -n +1 -f fifo | sudo ./clusterGRE.py > aichivo 2>&1 &",
        function (error, stdout, stderr) {
            console.log(stdout + stderr);
            answer += stdout;
        }
    );
    res.send(answer);
});

router.get("/stopvsorc", (req, res) => {
    var child1;
    var child2;
    var child3;
    var payload;
    console.log("erasing...");
    child1 = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && exec 3>&- ",
        function (error, stdout, stderr) {
            console.log(stdout);

            payload += "rm done\n\n" + stdout;
        }
    ); //esto cierra el fifo, lo cual cierra el programa

    //antes, en ves de echo exit > fifo, estaba sudo kill $(ps aux | grep GRE| grep sudo|awk {'print $2'})
    console.log("Exiting...");
    child2 = exec(
        "cd $(echo $HOME/vsorcdistro)/scripts && echo exit > fifo && rm fifo && sudo killall tail",
        function (error, stdout, stderr) {
            console.log(stdout);
            payload += "killed\n\n" + stdout;
        }
    );
    // console.log("Multisshing and cleaning...");
    // child3 = exec("cd /home/pi/scripts && ./multissh.sh sudo -E mn -c; sudo -E mn -c", function(error, stdout, stderr) {
    //   console.log(stdout);
    //   console.log("multisshed");
    //   payload+="Multisshed\n\n"+stdout;
    //
    // });
    res.send(payload);
});
module.exports = router;
