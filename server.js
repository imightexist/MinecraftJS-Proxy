const ws = require('ws');
const mc = require('minecraft-protocol');
const server = new ws.Server({
    port:80
});

//console.warn('This is a beta, expect issues!');
server.on('connection',function(e){
    e.on('message',function(msg){
        array = new Uint8Array(msg);
        let cmd = "";
        array.forEach(function (h) {
            let char = String.fromCharCode(h);
            cmd += char
        });
	    cmd = JSON.parse(cmd)
		let client;
        if (cmd[0] == "play"){
            client = mc.createClient(cmd[1]);
			client.on('packet',function(p){
				/*
				let json = JSON.parse(p.message);
				if (jsonMsg.translate == 'chat.type.announcement' || jsonMsg.translate == 'chat.type.text'){
					if (username == client.username){
						return;
					}
					e.send(JSON.stringify(['chat',json.with[0].text,json.with[1]]));
				}
				*/
				e.send(JSON.stringify(['read',p]))
			});
        }
		if (cmd[0] == "write"){
			client.write(cmd[1],cmd[2]);
		}
    });
});

function decodeCommand(cypher) {
	var sections = [];
	var bump = 0;
	while (sections.length <= 50 && cypher.length >= bump) {
		var current = cypher.substring(bump);
		var length = parseInt(current.substring(current.search(/\./) - 2));
		var paramater = current.substring(length.toString().length + 1, Math.floor(length / 10) + 2 + length);
		sections[sections.length] = paramater;
		bump += Math.floor(length / 10) + 3 + length;
	}
	sections[sections.length - 1] = sections[sections.length - 1].substring(0, sections[sections.length - 1].length - 1);
	return sections;
}
function encodeCommand(cypher) {
	var command = "";
	for (var i = 0; i < cypher.length; i++) {
		var current = cypher[i];
		command += current.length + "." + current;
		command += (i < cypher.length - 1 ? "," : ";");
	}
	return command;
}
