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
    getAllTrainings,
    getOneTraining,
    editExercice,
    editTraining,
    deleteExercice,
    deleteTraining,
} = require("./controllers/coach"); // Coach controllers
const { getAllStudents, newStudent, editStudent } = require("./controllers/student");
const { firebaseAuth, firebaseAuthCoach, firebaseAuthCoachStudent } = require("./utils/firebaseAuth"); // Middlewares checkToken and role
const { login, uploadImage, getAuthUser } = require("./controllers/user"); // Student controllers
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

/** @POST Coach routes */
app.post("/coach", ValidSignupCoach, newCoach);
app.post("/coach/exercice", firebaseAuthCoach, ValidNewExercice, newExercice);
app.post("/coach/training", firebaseAuthCoach, ValidNewTraining, newTraining);
app.post("/coach/edit", firebaseAuthCoach, ValidEditCoach, editCoach);
app.post("/coach/training/:trainingId/exercice", firebaseAuthCoach, addExerciceToTraining);
app.post("/coach/training/:trainingId/student", firebaseAuthCoach, addTrainingToStudent);
app.post("/coach/exercice/:exerciceId/edit", firebaseAuthCoach, ValidNewExercice, editExercice);
app.post("/coach/training/:trainingId/edit", firebaseAuthCoach, ValidNewTraining, editTraining);
app.delete("/coach/exercice/:exerciceId", firebaseAuthCoach, deleteExercice);
app.delete("/coach/training/:trainingId", firebaseAuthCoach, deleteTraining);

/** @GET Coach routes */
app.get("/coach/exercices", firebaseAuthCoach, getAllExercices);
app.get("/coach/trainings", firebaseAuthCoach, getAllTrainings);
app.get("/coach/training/:trainingId", firebaseAuthCoach, getOneTraining); // With exercices

// Student routes
app.post("/student", firebaseAuthCoach, ValidSignupStudent, newStudent);
app.post("/student/edit", firebaseAuthCoachStudent, ValidEditStudent, editStudent);
app.get("/students", firebaseAuthCoach, getAllStudents);

// User (Coach & Student)
app.post("/login", ValidLogin, login);
app.post("/user/image", firebaseAuth, uploadImage);
app.get("/user", firebaseAuth, getAuthUser);

exports.api = functions.region("europe-west1").https.onRequest(app);

// TODO

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

// CHANGE EMAIL IN SENDEMAIL() FUNCTION

// triggers quand on delete un exercice, on doit aussi le supprimer d'un training -> exercicesId = []
// triggers quand on delete un training, on doit aussi le supprimer des trainings du coach et eleve
