const http = require('http');

const options = {
    host: 'localhost',
    port: process.env.PORT || 3000,
    timeout: 2000,
    path: '/health' // You'll need to add this endpoint to your app
};

const request = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

request.on('error', (err) => {
    console.log('ERROR');
    process.exit(1);
});

request.end();