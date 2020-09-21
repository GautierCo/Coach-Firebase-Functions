const functions = require("firebase-functions");
const app = require("express")();

const { getAllStudents, newStudent, newCoach } = require("./controllers/coach");
const { login } = require("./controllers/common");
const { firebaseAuth, firebaseAuthCoach } = require("./utils/firebaseAuth");

// Coach routes
app.post("/coach", newCoach);
app.post("/student", firebaseAuthCoach, newStudent);
app.get("/students", firebaseAuthCoach, getAllStudents);

// Common routes
app.post("/login", login);

exports.api = functions.region("europe-west1").https.onRequest(app);
