try {
    require('./server.js');
} catch (e) {
    console.log(e.stack);
}
