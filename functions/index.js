const functions = require("firebase-functions");
const app = require("express")();

const { newCoach, editCoach } = require("./controllers/coach");
const { getAllStudents, newStudent, editStudent } = require("./controllers/student");
const { firebaseAuth, firebaseAuthCoach, firebaseAuthCoachStudent } = require("./utils/firebaseAuth"); // Middleware checkToken and role
const { login, uploadImage } = require("./controllers/user");
const {
    ValidSignupCoach,
    ValidEditCoach,
    ValidSignupStudent,
    ValidEditStudent,
    ValidLogin,
} = require("./utils/validator"); // Middleware Validators

// Coach routes
app.post("/coach", ValidSignupCoach, newCoach);
app.post("/coach/edit", firebaseAuthCoach, ValidEditCoach, editCoach);

// Student routes
app.post("/student", firebaseAuthCoach, ValidSignupStudent, newStudent);
app.post("/student/edit", firebaseAuthCoachStudent, ValidEditStudent, editStudent);
app.get("/students", firebaseAuthCoach, getAllStudents);

// Common routes
app.post("/login", ValidLogin, login);

// User (Coach & Student)
app.post("/user/image", firebaseAuth, uploadImage);

exports.api = functions.region("europe-west1").https.onRequest(app);

// #Student

// GET PROFILE OF STUDENT (middleware coach)

// #Coach

// EDIT COACH ACCOUNT (email, password, phone, firstname, lastname)
// EDIT COACH DETAILS (others details)

// ADD FORMULE
// EDIT FORMULE
// DELETE FORMULE
// GET ALL FORMULES
// GET ONE FORMULE

// ADD EXERCICE
// EDIT EXERCICE
// DELETE EXERCICE
// GET ALL EXERCICES
// GET ONE EXERCICE

// ADD TRAINING
// EDIT TRAINING
// DELETE TRAINING
// GET ALL TRAININGS
// GET ONE TRAINING

// # User (Coach & Student)
