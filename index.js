function startApplication() {
  var appRoot = process.env.LSNODE_ROOT || process.cwd();
  var startupFile = process.env.LSNODE_STARTUP_FILE || "app.js";
  LsNode.listenDone = false;

  if (process.env.LSNODE_ROOT != undefined) {
    try {
      process.chdir(process.env.LSNODE_ROOT);
    } catch (err) {
      console.error(
        "Error setting directory to: " + process.env.LSNODE_ROOT + ": " + err
      );
    }
  }

  if (!startupFile.startsWith("/")) {
    startupFile = appRoot + "/" + startupFile;
  }

  process.title = "lsnode:" + appRoot;

  var consoleLog = process.env.LSNODE_CONSOLE_LOG || "/dev/null";
  fs.closeSync(1);
  try {
    fs.openSync(consoleLog, "w+");
  } catch (e) {
    fs.openSync("/dev/null", "w+");
  }

  http.Server.prototype.realListen = http.Server.prototype.listen;
  http.Server.prototype.listen = customListen;
  http.Server.prototype.address = lsnode_address;
  var app = require(startupFile);
  if (!LsNode.listenDone) {
    if (typeof app.listen === "function") app.listen(3000);
  }
}

function lsnode_address() {
  return process.env.LSNODE_SOCKET;
}
function customListen(port) {
  function onListenError(error) {
    server.emit("error", error);
  }

  // The replacement for the listen call!

  var server = this;

  if (LsNode.listenDone) {
    throw new Error(
      "http.Server.listen() was called more than once " +
        "which is not allowed."
    );
  }

  LsNode.listenDone = true;

  var listeners = server.listeners("request");
  var i;
  server.removeAllListeners("request");
  server.on("request", function (req) {
    req.connection.defineGetter("remoteAddress", function () {
      return "127.0.0.1";
    });
    req.connection.defineGetter("remotePort", function () {
      return port;
    });
    req.connection.defineGetter("addressType", function () {
      return 4;
    });
  });
  for (i = 0; i < listeners.length; i++) {
    server.on("request", listeners[i]);
  }
  var callback;
  if (
    arguments.length > 1 &&
    typeof arguments[arguments.length - 1] == "function"
  ) {
    callback = arguments[arguments.length - 1];
  }
  server.once("error", onListenError);
  server.realListen(socketObject, function () {
    server.removeListener("error", onListenError);
    if (callback) {
      server.once("listening", callback);
    }
    server.emit("listening");
  });
  return server;
}
