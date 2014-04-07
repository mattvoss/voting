"use strict";

var fs = require('fs'),
    path = require('path'),
    ldap = require('ldapjs'),
    mysql = require('mysql'),
    email = require('nodemailer'),
    crypto = require('crypto'),
    spawn = require('child_process').spawn,
    execFile = require('child_process').execFile,
    async = require('async'),
    Acl = require('acl'),
    uuid = require("node-uuid"),
    glob = require('glob'),
    underscore = require('underscore'),
    pdf417 = require('pdf417'),
    ipp = require('ipp'),
    handlebars = require('handlebars'),
    authnet = require('authnet'),
    svgHeader = fs.readFileSync("./header.svg", "utf8"),
    opts = {},
    connection = null,
    client = null,
    transport = null,
    acl = null,
    db = null,
    reconnectTries = 0;

/**
 * usages (handlebars)
 * {{short_string this}}
 * {{short_string this length=150}}
 * {{short_string this length=150 trailing="---"}}
**/
handlebars.registerHelper('short_string', function(context, options){
    //console.log(options);
    var maxLength = options.hash.length || 100;
    var trailingString = options.hash.trailing || '';
    if (typeof context != "undefined") {
        if(context.length > maxLength){
            return context.substring(0, maxLength) + trailingString;
        }
    }
    return context;
});

exports.setKey = function(key, value) {
    opts[key] = value;
};

exports.initialize = function() {
    //Initialize Mysql
    getConnection();

    //Initialize Email Client
    transport = email.createTransport("sendmail", {
        args: ["-f noreply@vpr.tamu.edu"]
    });

};

var getOffices = function(cb) {
    var sql = "SELECT * FROM electionOffices ORDER BY position ASC";


    connection.query(sql, function(err, rows) {
        sql = "";
        var vars = [],
            offices = rows;
        if (offices.length > 0) {
            offices.forEach(function(office, index) {
                sql += "SELECT * FROM electionOfficeCandidates WHERE electionId = ? ORDER BY position ASC; ";
                vars.push(office.id);
            })
        }
        //console.log(sql);
        connection.query(sql, vars, function(err, candidates) {
            if (err) throw err;
            //console.log(rows.length);
            if (offices.length > 0) {
                console.log("Total Offices:", offices.length);
                processOffices(offices, candidates, 0, cb);
            } else {
                console.log("Total Offices: 0");
                cb([]);
            }
        });
    });
}

var processOffices = function(offices, candidates, index, cb) {

    if (offices.length < 2) {
        offices[index].candidates = candidates;
    } else {
        offices[index].candidates = candidates[index];
    }
    index++;
    if (offices.length >= (index+1)) {
        processOffices(offices, candidates, index, cb);
    } else {
        cb(offices);
    }
}

/************
* Routes
*************/

exports.index = function(req, res){
    var sid = req.session.id;
    //Regenerates the JS/template file
    //if (req.url.indexOf('/bundle') === 0) { bundle(); }

    //Don't process requests for API endpoints
    if (req.url.indexOf('/api') === 0 ) { return next(); }
    console.log("[index] session id:", req.session.id);

    var init = "$(document).ready(function() { App.initialize(); });";
    //if (typeof req.session.user !== 'undefined') {
        init = "$(document).ready(function() { App.uid = '" + sid + "'; App.initialize(); });";
    //}
    fs.readFile(__dirname + '/../public/templates/index.html', 'utf8', function(error, content) {
        if (error) { console.log(error); }
        content = content.replace("{{init}}", init);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(content, 'utf-8');
        res.end('\n');
    });
};

//Return documents
exports.offices = function(req, res) {

    var callback = function(offices) {
            //if (err) console.log(err);
            res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
            res.writeHead(200, { 'Content-type': 'application/json' });
            res.write(JSON.stringify(offices), 'utf-8');
            res.end('\n');
        };
    getOffices(callback);
};



//Helpers
var getConnection = function() {
    // Test connection health before returning it to caller.
    if ((connection) && (connection._socket)
            && (connection._socket.readable)
            && (connection._socket.writable)) {
        return connection;
    }
    console.log(((connection) ?
            "UNHEALTHY SQL CONNECTION; RE" : "") + "CONNECTING TO SQL.");
    connection = mysql.createConnection(opts.configs.mysql);
    connection.connect(function(err) {
        if (err) {
            console.log("(Retry: "+reconnectTries+") SQL CONNECT ERROR: " + err);
            reconnectTries++;
            var timeOut = ((reconnectTries * 50) < 30000) ? reconnectTries * 50 : 30000;
            if (reconnectTries == 50) {
                /**
                var mailOptions = {
                    from: "VPPPA Site ID Lookup <noreply@vpppa.org>", // sender address
                    to: "problem@griffinandassocs.com", // list of receivers
                    subject: "VPPPA Site ID Lookup DB Issue", // Subject line
                    text: "The VPPPA Site ID Lookup is unable to connect to the mysql db server.", // plaintext body
                    html: "<b>The VPPPA Site ID Lookup is unable to connect to the mysql db server.</b>" // html body
                };

                transport.sendMail(mailOptions, function(error, response){
                    if(error){
                        console.log(error);
                    }else{
                        console.log("Message sent: " + response.message);
                    }

                    // if you don't want to use this transport object anymore, uncomment following line
                    //smtpTransport.close(); // shut down the connection pool, no more messages
                });
                **/
            }
            setTimeout(getConnection, timeOut);
        } else {
            console.log("SQL CONNECT SUCCESSFUL.");
            reconnectTries = 0;
            handleDisconnect(connection);
        }
    });
    connection.on("close", function (err) {
        console.log("SQL CONNECTION CLOSED.");
    });
    connection.on("error", function (err) {
        console.log("SQL CONNECTION ERROR: " + err);
    });
    connection = connection;
    return connection;
}


var handleDisconnect = function (connection) {
  connection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }

    console.log('Re-connecting lost connection: ' + err.stack);

    getConnection();

  });
};

function logAction(uid, objType, objId, modType, desc) {
    var logData = {
            objectType: objType,
            objectId: objId,
            uid: uid,
            modType: modType,
            description: desc
        };

    opts.io.broadcast('talk', logData);
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
