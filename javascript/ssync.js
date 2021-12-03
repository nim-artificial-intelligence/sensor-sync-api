// minimal javascript client

// intended use:
//
//
// set IP address to use:
// ------------------------------------------------------------------------
// set_ssync_ip(ip_address_as_string);
//
//
// activate a sensor:
// ------------------------------------------------------------------------
// activate_sensor(sensor_number);    // sensor number range: 1..8
//
//
// de-activate a sensor:
// ------------------------------------------------------------------------
// reset_sensor(sensor_number);       // sensor number range: 1..8
//
//
// read config:
// ------------------------------------------------------------------------
// read_config()    // returns a promise, access with .then(...)
//
// read_config().then(data => console.log(data.ip, data.mac, data.sensors))
//
//
//
// return value and error handling
// ------------------------------------------------------------------------
//                // just activate
//                activate_sensor(1);
//
//                // activate sensor and log result to console
//                activate_sensor(1).then(result_html => console.log(result_html));
//
//                // activate sensor and log result to console, catch and log error
//                activate_sensor(1)
//                    .then(result_html => console.log(result_html))
//                    .catch(function (err) {
//                        console.log('Fetch Error :-S', err);
//                    });
//
// NOTE: if you chain multiple calls and want them to be executed in order, 
//       use the `await` keyword.  This only works inside of functions:
//
//        async function foo() {
//            console.log('the following happens in order')
//
//            // just activate
//            await activate_sensor(1);
//
//            // activate sensor and log result to console
//            await activate_sensor(1).then(result_html => console.log(result_html));
//
//            // activate sensor and log result to console, catch and log error
//            await activate_sensor(1)
//                .then(result_html => console.log(result_html))
//                .catch(function (err) {
//                    console.log('Fetch Error :-S', err);
//                });
//
//            await read_config().then(data => console.log('\n',
//                'ip: ' + data.ip, '\n',
//                'mac: ' + data.mac, '\n',
//                'sensor states: ', data.sensors, '\n',
//                data)
//            );
//            
//            console.log('finished');
//        }
//
//        // call the function
//        foo();
//
// see `ssync-demo.js` for an example for how to use this inside of an HTML file.


// the default ip
var ssync_ip = '192.168.2.49';

let apis = {
    activate: {
        url: (ip, sensor_number) => {
            return "http://" + ip + "?activate=" + sensor_number
        }
    },
    reset: {
        url: (ip, sensor_number) => {
            return "http://" + ip + "?reset=" + sensor_number
        }
    },
    reboot: {
        url: (ip) => {
            return "http://" + ip + "?reboot=true"
        }
    },
    status: {
        url: (ip) => {
            return "http://" + ip + "?status=true"
        }
    },
    write_ip: {
        url: (ip, new_ip) => {
            return "http://" + ip + "?ip=" + new_ip
        }
    },
    write_mac: {
        url: (ip, new_mac) => {
            return "http://" + ip + "?mac=" + new_mac
        }
    },
};


function set_ssync_ip(ip_address_as_string) {
    ssync_ip = ip_address_as_string;
}


async function activate_sensor(sensor) {
    return fetch(apis.activate.url(ssync_ip, sensor))
        .then(response => response.text())
        .catch(err => {throw err})
}

async function reset_sensor(sensor) {
    return fetch(apis.reset.url(ssync_ip, sensor))
        .then(response => response.text())
        .catch(err => {throw err})
}

async function reboot() {
    return fetch(apis.reboot.url(ssync_ip))
        .then(response => response.text())
        .catch(err => {throw err})
}


function handle_status(data) {
    const lines = data.split('\r\n');

    // we will parse into these variables
    var read_ip = '';
    var read_mac = '';
    var read_sensors = 0;

    for (const line of lines) {
        const keyval = line.split('=');
        if (keyval.length != 2)
            continue;
        const key = keyval[0];
        const value = keyval[1];
        if (key == "MAC") {
            // do something with the mac address
            read_mac = value;
        }
        if (key == "IP") {
            // do something with the mac address
            read_ip = value;
        }
        if (key == "SENSORS") {
            var state = parseInt(value, 16);
            // do something with the states 
            read_sensors = state;
        }
    }
    return {
        'ip': read_ip,
        'mac': read_mac,
        'sensors': read_sensors,
    }
}

async function read_config() {
    return fetch(apis.status.url(ssync_ip))
        .then(response => response.text())
        .then(data => handle_status(data))
        .catch(err => {throw err})
}

async function write_ip(new_ip) {
    return fetch(apis.write_ip.url(ssync_ip, new_ip))
        .then(response => response.text())
        .catch(err => {throw err})
}

async function write_mac(new_mac) {
    return fetch(apis.write_mac.url(new_mac))
        .then(response => response.text())
        .catch(err => {throw err})
}

