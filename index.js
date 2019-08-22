const SerialPort = require('serialport'); //import package

var io = require('socket.io-client');
var socket = io.connect('https://wibunolep-server.herokuapp.com/', {reconnect: true});

const portNumber =  'COM5';

let myPort;
// buat object serial port
 myPort = new SerialPort(portNumber, {
	baudRate : 57600
}, error => {
	if (error)
        return console.log({ message: `on SerialPort(${portNumber})`, error });
    console.log(`Serial port started on ${portNumber}`);
});
// console.log(myPort);

//parser biar ga nampilin buffer
const parsers = SerialPort.parsers;
const parser = new parsers.Readline({ delimiter : '\r\n' });
myPort.pipe(parser); // using parser

// event yang dipanggil ketika serial port kebuka. pake 'open'
myPort.on('open', ()=> {
	console.log("Arduino Connected on port " + portNumber);

	const timeOut = 3000; // 3detik
	setTimeout(()=> {
		// kirim command 1 ke arduino
		myPort.write('1', (err)=> {
			if(err)
				console.log(err); // munculin error
			else
				console.log("success write 1"); // kalo ga error kasih notif
		});
	}, timeOut);
});

parser.on('data', (data) => {
    const dataHasil = parsingRawDataV2 (data);
    // console.log({data, hasilParsing});
    // console.log(data);

    /** [<latitude>, <longitude>, <humidity>, <temperature>, <acc_x>, <acc_x>, <acc_x>, <gyro_x>, <gyro_y>, <gyro_z>] */
	socket.emit('echo', { dataHasil, dataMentah: data });
	// socket.emit('data-mentah', data);
})

/**
 *
 * @param {String} data
 * @returns
 *  [<latitude>, <longitude>, <humidity>, <temperature>, <acc_x>, <acc_x>, <acc_x>, <gyro_x>, <gyro_y>, <gyro_z>]
 */
function parsingRawDataV2 (data) {
	const regex = /([0-9|\.|-]*)/g;
	let hasilParsing = [];
		data.match(regex).forEach(element => {
			if (element != '')
				hasilParsing.push(element);
		});
		return hasilParsing;
}