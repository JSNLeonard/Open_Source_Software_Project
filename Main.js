var mqtt = require('mqtt'); // Requirement for MQTT to Run.
var topicToSubscribeTo = "jason/Button" // Subscribed Topic.
var topicToPublishTo = "jason/LED" // Published Topic.
var topicToPublishStep = "jason/Step" // Published Step Topic.
const deviceOfInterest = 'CE:84:AB:94:ED:D8' // MAC Address of BBC Microbit V2
const ledService = '00000001-0002-0003-0004-000000003000' // UUID of LED Service.
const ledCharacteristic = '00000001-0002-0003-0004-000000003001' // UUID for Read/Write Characteristic of LED Service.
const buttonService = '00000001-0002-0003-0004-000000002000' //UUID of Button A Service.
const buttonCharacteristic = '00000001-0002-0003-0004-000000002001' //UUID of Read/Notify Characteristic of Button A Service.
const stepService = '00000001-0002-0003-0004-000000000000' // UUID of Step Count Service.
const stepCharacteristic = '00000001-0002-0003-0004-000000000004' // UUID for Characteristic of Step Count Service.
const options = // New Const called Options for below data to be entered.
{
  port: 1883, // Port Number required to connect.
  qos:0 // Quality of Service number.
}
var mqttClient = mqtt.connect('mqtt://broker.mqttdashboard.com', options); // New variable to connect to MQTT.
console.log("Starting MQTT Client on the Gateway Device in Order to Both Publish and Subscribe to Messages, to and from the HiveMQ Broker for the Year of 2022/23."); // Print statement to state it has started the MQTT Client on the Gateway Device.
console.log("Writing to " + topicToSubscribeTo) // States in the terminal that it is writing to the topic that it has subscribed to.
mqttClient.on('connect', connectedToBrokerCallback); // Connects to the MQTT broker.
function connectedToBrokerCallback() // New function for connecting to the broker on MQTT.
{
	console.log("Connected to MQTT Broker."); // States in the terminal that it has connected to the MQTT Broker.
	mqttClient.subscribe(topicToSubscribeTo, subscribeCallback); // Subscribes to MQTT.
	mqttClient.publish(topicToPublishTo, 'Reading Messages', publishCallback); // Publishes to MQTT that it's reading messages.
}
function subscribeCallback(error, granted) // Function for subscription call backs.
{ 
   	if (error) // If statement for error handling.
   	{
		console.log("Error Subscribing to Topic."); // States if an error was found when subscribing to the topic.
	} else
	{	
		console.log("Subscribed to Messages on Topic: ") // States if you were able to subscribe to messages on the topic.
		for(var i=0; i<granted.length;i++) // For loop.
		{
			console.log(granted[i]); // Grants the i variable in the for loop.
		}
    	}
}
mqttClient.on('message', messageEventHandler);
function messageEventHandler(topic, message, packet) // New function to handle the messages from MQTT, featuring the topic, message and packet.
{ 
	console.log("Received Message '" + message + "' on the Topic '" + topic + "'"); // States when a message is received from MQTT.
	if (message == 'on') // If statement when the message that is sent is called on.
	{
		console.log("LED is ON!\n"); // States that the LED is turned on.
		r.writeValue(Buffer.from("00000001", 'hex')); // Turns LED on.
	}
	else if (message == 'off') // If statement when the message that is sent is called on.
	{
		console.log("LED is OFF!\n"); // States that the LED is turned off.
		r.writeValue(Buffer.from("00000000", 'hex')); // Turns LED off.
	}
}
function publishCallback(error) // New function to publish step data.
{     
   	if (error) // If statement for errors.
   	{
		console.log("Error Publishing Data"); // States if an error is found when publishing data.
	}
	else // Else statement if above does not happen.
	{	 
        	console.log("Message is Published to Topic '" + topicToPublishTo + "'"); // States that a message has been published if an error was not found.
    	}
}
function publishCallbackStep(error) // New function to publish step data.
{     
   	if (error) // If statement for errors.
   	{
		console.log("Error Publishing Data"); // States if an error is found when publishing data.
	}
	else // Else statement if above does not happen.
	{	 
        	console.log("Message is Published to Topic '" + topicToPublishStep + "'"); // States that a message has been published if an error was not found.
    	}
}
const main = async() => // New const called main for the async function.
{	
	const {createBluetooth} = require('node-ble') // Const created for creationg of the bluetooth requiring node-ble.
	const {bluetooth, destroy} = createBluetooth() // Const created for the creation of the bluetooth.

	// Get bluetooth adapter.
	const adapter = await bluetooth.defaultAdapter() // Get an available Bluetooth adapter.
	await adapter.startDiscovery() // Using the adapter, start a device discovery session.
	console.log('Discovering') // States it is discovering for devices.

	// Look for a specific device.
	const device = await adapter.waitDevice(deviceOfInterest) // Is looking for the device that has the mac address I input at the very start of my code.
	console.log('Got Device', await device.getAddress()) // await device.getAddress())
	const deviceName = await device.getName() // New const called device name to get the name of the device.
	console.log('Got Device Remote Name', deviceName) // Statement to state the device remote name.
	console.log('Got Device User Friendly Name', await device.toString()) // Statement to get the user friendly name.
	await adapter.stopDiscovery() // Stops the discovery.
	
	// Connect to the specific device.
	await device.connect() // Connects to the specified device.
	console.log("Connected to Device : " + deviceName) // Connects to the device name and states the name of the device.
	const gattServer = await device.gatt() // New const for gattServer where it waits for the devices gatt.
	services = await gattServer.services() // New variable called services where it awaits the gattServers services.
	
	while (device.connect) // While loop to run whilst the device is connected to MQTT.
	{
		const sleep = require("util").promisify(setTimeout); // Creates a new const called sleep to run the timeout below.
		await sleep(1000); // Creation of a delay of 1 second.
		// This is the console.log("services are " + services).
		if (services.includes(ledService)) //  // If statement for the LED Service.
		{
			console.log('\n\n\nGot the LED Service') // Print statement to say the LED Service has been found.
			const primaryLED = await gattServer.getPrimaryService(ledService) // Creation of a new const called primaryLED to link itself to the LED Service.
			chars = await primaryLED.characteristics() // Creation of a new variable for the charactertistics of the LED.
			console.log("The Service Characteristics Are: " + chars) // Print statement to show all Service Charactertistics of the LED Service.
			console.log("UUID of Characteristic of Interest is: " + ledCharacteristic) // Print statement to show the Characteristic Interest of the LED Service.
			r = await primaryLED.getCharacteristic(ledCharacteristic) // Creation of new variable to get the flags in next line.
			console.log("Characteristic Flags are: " + await r.getFlags()) // Print statement to show all of the Characteristic Flags of the LED Service.
		}
		await sleep(1000); // Creation of a delay of 1 second.
		if (services.includes(stepService)) // If statement for the Step Service.
		{
			console.log('\n\n\nGot the Step Service') // Print statement to say the Step Service has been found.
			const primaryStep = await gattServer.getPrimaryService(stepService) // Creation of a new const called primaryLED to link itself to the Step Service.
			a = await primaryStep.characteristics() // Creation of a new variable for the charactertistics of the Step Service.
			console.log("The Service Characteristics Are: " + a) // Print statement to show the Service Characteristics of the Step Service.
			console.log("UUID of Characteristic of Interest is: " + stepCharacteristic) // Print statement to show the Characteristic Interest of the Step Service.
			b = await primaryStep.getCharacteristic(stepCharacteristic) // Creation of new variable to get the flags in next line.
			console.log("Characteristic Flags are: " + await b.getFlags()) // Print statement to show all of the Characteristic Flags of the Step Service.
			c = await b.readValue() // Reads the value of B.
			d = c.toString('hex') // Converts the value in C to hex.
			// const buf = Buffer.from([-1, 5]);
			// e = console.log("Step Count Value: ", buf.readInt8(0));
			mqttClient.publish(topicToPublishStep, d, publishCallbackStep); // Publishes the values of d to the MQTT Service.
		}
		await sleep(1000); // Creation of a delay of 1 second.
		if (services.includes(buttonService)) // If statement for the Button Service.
		{
			console.log('\n\n\nGot the Button A Service') // Print statement to say the Button A Service has been found.
			const primaryButton = await gattServer.getPrimaryService(buttonService) // Creation of a new const called primaryLED to link itself to the Button A Service.
			const notifyChar = await primaryButton.getCharacteristic(buttonCharacteristic) // Creation of a new const for the charactertistics of the Button A Service.
			console.log("Characteristic Flags Are: " + await notifyChar.getFlags()) // Print statement to show all of the Characteristic Flags of the Button A Service.
			await notifyChar.startNotifications() // Starts the notifications to MQTT.
			notifyChar.on('valuechanged', buffer => {console.log("Button Toggled, LED State Changed"); // Detects when a value changes on the buffer of the button and states a message when it occurs.
			r.writeValue(Buffer.from([01])) // Writes a buffer value of 01 to change the LED to turn on.
			mqttClient.publish(topicToPublishTo, "Button Toggled, LED State Changed", publishCallback); // Publishes data to MQTT and send a message stating, Button Toggled, LED State Changed.
			r.catch((e) => console.log("There was an error", e))}); // Prints out there was an error if one was found during the promise rejection handle.
		}
	}
}
main() // Main function
	.then() // Returns a promise.
	.catch(console.error) // Catches any console errors that may be found.