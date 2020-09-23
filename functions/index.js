const functions = require("firebase-functions");
const app = require("express")();

const {
    newCoach,
    editCoach,
    newExercice,
    newTraining,
    addExerciceToTraining,
    addTrainingToStudent,
    getAllExercices,
} = require("./controllers/coach"); // Coach handlers
const { getAllStudents, newStudent, editStudent } = require("./controllers/student");
const { firebaseAuth, firebaseAuthCoach, firebaseAuthCoachStudent } = require("./utils/firebaseAuth"); // Middlewares checkToken and role
const { login, uploadImage, getAuthUser } = require("./controllers/user"); // Student handlers
const {
    ValidSignupCoach,
    ValidEditCoach,
    ValidSignupStudent,
    ValidEditStudent,
    ValidLogin,
    ValidNewExercice,
    ValidNewTraining,
} = require("./utils/validator"); // Middlewares Validators req.body

// Coach routes
app.post("/coach", ValidSignupCoach, newCoach);
app.post("/coach/edit", firebaseAuthCoach, ValidEditCoach, editCoach);
app.post("/coach/exercice", firebaseAuthCoach, ValidNewExercice, newExercice);
app.post("/coach/training", firebaseAuthCoach, ValidNewTraining, newTraining);
app.post("/coach/training/:trainingId/exercice", firebaseAuthCoach, addExerciceToTraining);
app.post("/coach/training/:trainingId/student", firebaseAuthCoach, addTrainingToStudent);

app.get("/coach/exercices", firebaseAuthCoach, getAllExercices);

// Student routes
app.post("/student", firebaseAuthCoach, ValidSignupStudent, newStudent);
app.post("/student/edit", firebaseAuthCoachStudent, ValidEditStudent, editStudent);
app.get("/students", firebaseAuthCoach, getAllStudents);

// User (Coach & Student)
app.post("/login", ValidLogin, login);
app.post("/user/image", firebaseAuth, uploadImage);
app.get("/user", firebaseAuth, getAuthUser);

// TODO

//app.get("/exercices/:coachid", firebaseAuth, getAllExercices);

exports.api = functions.region("europe-west1").https.onRequest(app);

// #Student

// GET PROFILE OF STUDENT (middleware coach)

// #Coach

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
