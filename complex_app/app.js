const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
let flash = require("connect-flash");
const router = require("./router");
const markdown = require("marked");
const sanitizeHTML = require("sanitize-html");
const app = express();

// boilerplate / template for session
let sessionOptions = session({
  secret: "JavaScript is cool",
  store: new MongoStore({ client: require("./db").client }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
});

// boilerplate / template for app
app.use(sessionOptions); // session
app.use(express.static("public")); //locate static file
app.set("views", "views"); // locate html file for rendering
app.set("view engine", "ejs"); // choose ejs as rendering machine
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash()); // for flash message
app.use((req, res, next) => {
  // make markown function available in render page
  res.locals.filterUserHTML = (content) => {
    return sanitizeHTML(markdown(content), {
      allowedTags: [
        "li",
        "strong",
        "bold",
        "ul",
        "ol",
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
      allowedAttributes: {},
    });
  };

  // make flash errors and success available in render page
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");

  // make current user id available for request object
  if (req.session.user) {
    console.log("in app: ", req.session.user._id.toString());
    res.locals.visitorId = req.session.user._id.toString();
  } else {
    res.locals.visitorId = "0";
  }
  // for giving to every render page our session data
  res.locals.user = req.session.user;
  next();
});

// use router
app.use("/", router);

// socket
const server = require("http").createServer(app);
const io = require("socket.io")(server);

io.use((socket, next) => {
  // make session available on socket
  sessionOptions(socket.request, socket.request.res, next);
});

io.on("connection", (socket) => {
  if (socket.request.session.user) {
    let user = socket.request.session.user;

    socket.emit("welcome", { username: user.username, avatar: user.avatar });

    socket.on("chatMessageFromBrowser", (data) => {
      socket.broadcast.emit("chatMessageFromServer", {
        message: data.message,
        session: user,
      });
    });
  }
});

// export app
module.exports = server;
