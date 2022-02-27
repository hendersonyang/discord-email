const Imap = require("imap")

let lastMsg = ""

module.exports.getHeader = function (callback) {
    let imap = new Imap({
        user: process.env.imap_username,
        password: process.env.imap_password,
        host: process.env.imap_server,
        port: process.env.imap_port,
        tls: true
    });
    function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
    }
    imap.once('ready', function () {
        setInterval(() => {
            openInbox(function (err, box) {
                if (err) throw err;
                var f = imap.seq.fetch(box.messages.total + ':*', {
                    bodies: '',
                    struct: true
                });
                f.on('message', function (msg, seqno) {
                    msg.on('body', function (stream, info) {
                        var buffer = '';
                        stream.on('data', function (chunk) {
                            buffer += chunk.toString('utf8');
                        });
                        stream.once('end', function () {
                            let header = Imap.parseHeader(buffer)
                            if (header["message-id"][0] === lastMsg) {
                                callback("SEEN");
                            } else {
                                lastMsg = header["message-id"][0]
                                callback(header);
                            }
                        });
                    });
                    msg.once('attributes', function (attrs) {
                    });
                    msg.once('end', function () {
                    });
                });
                f.once('error', function (err) {
                    console.log('Fetch error: ' + err);
                });
                f.once('end', function () {
                    //imap.end();
                });
            });
        }, 10000)
    });

    imap.once('error', function (err) {
        console.log(err);
    });

    imap.once('end', function () {
    });

    imap.connect();
}

module.exports.getEmail = function (callback) {
    let imap = new Imap({
        user: process.env.imap_username,
        password: process.env.imap_password,
        host: process.env.imap_server,
        port: process.env.imap_port,
        tls: true
    });
    function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
    }
    imap.once('ready', function () {
        openInbox(function (err, box) {
            if (err) throw err;
            var f = imap.seq.fetch(box.messages.total + ':*', {
                bodies: ['TEXT'],
                struct: true
            });
            f.on('message', function (msg, seqno) {
                msg.on('body', function (stream, info) {
                    var buffer = '';
                    stream.on('data', function (chunk) {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', function () {
                        callback(buffer)
                    });
                });
                msg.once('attributes', function (attrs) {
                });
                msg.once('end', function () {
                });
            });
            f.once('error', function (err) {
                console.log('Fetch error: ' + err);
            });
            f.once('end', function () {
                imap.end();
            });
        });
    });

    imap.once('error', function (err) {
        console.log(err);
    });

    imap.once('end', function () {
    });

    imap.connect();
}