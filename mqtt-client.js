var mqtt = require('mqtt')
var argv = require('yargs').argv;
console.log("Connecting...")

var wsh = argv.url;
var clientId = argv.clientId;
var topic= argv.topic;

var options = {
	keepalive: 180,
	clientId: clientId,
	protocolId: 'MQTT',
	protocolVersion: 4,
	clean: true,
	reconnectPeriod: 100,
	connectTimeout: 1000
};

var client  = mqtt.connect(wsh, options)

client.on('error', function(error) {
	console.log('error');
	console.log(error)
})

client.on('packetreceive', function(packet) {
	//console.log("Packet received!")
	//console.log(packet)
})

client.on('packetsend', function(packet) {
	//console.log("Packet sent!")
	//console.log(packet)
})


client.on('close', function() {
	console.log("Closed!")
})

client.on('offline', function() {
	console.log("Offline!")
})

client.on('connect', function () {
	console.log("Connected!")
	try {
		client.subscribe(topic)
	} catch (e) {
		console.log(e)
	}
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log("Message Received!")
  console.log(message.toString())
  client.end()
})
