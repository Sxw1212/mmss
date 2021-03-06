var protocol = require("minecraft-protocol");
var events = require("events");

function server(opts) {
	var local = this;
	
	local.setMaxListeners(0);
	//Default options
	opts = opts || {};
    local.opts = opts;
    local.opts["gamemode"] = opts["gamemode"] || 0;
    local.opts["motd"] = opts["motd"] || "MMSS Server";
    local.opts["max-players"] = opts["max-players"] || 20;
    local.opts["port"] = opts["port"] || 25565;
    
    local.clients = [];
    local.id = 1;
    
    local.serv = protocol.createServer(local.opts);
    local.serv.on("login", function(client) {
    	client.id = local.id++;
    	local.clients[client.id] = client;
    	
    	local.emit("client_preconnect", client);
    	
        client.write(0x01, {
            entityId: client.id,
            levelType: "default",
            gameMode: local.opts["gamemode"],
            dimension: 0,
            difficulty: 2,
            maxPlayers: local.opts["max-players"]
        });
        
        client.pos = {
        	x: 0,
        	y: 50,
        	stance: 50,
        	z: 0,
        	yaw: 0,
        	pitch: 0
        }
        
        local.emit("client_preconnect2", client);
        
        client.write(0x0d, {
            x: 0,
            y: 50,
            stance: 50,
            z: 0,
            yaw: 0,
            pitch: 0,
            onGround: true
        });
        
        client.on("end", function() {
        	local.clients = local.clients.filter(function(c) {
        		if (client == c) {
        			return false;
        		}
        		return true;
        	});
        	
        	local.emit("client_disconnect", client);
        });
        
        local.emit("client_connect", client);
    });
    
    local.serv.on("error", function(err) {
    	console.log("Protocol: " + err);
    });
    
    setInterval(function() {
    	local.emit("server_tick");
    }, 50)
}

server.prototype.__proto__ = events.EventEmitter.prototype;

exports.createServer = function(options) {
    return new server(options);
};
