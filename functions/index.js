const functions = require("firebase-functions");
const app = require("express")();
const { db, admin } = require("./utils/admin");
const { getAllStudents, newStudent, editStudent } = require("./controllers/student");
const { firebaseAuth, firebaseAuthCoach, firebaseAuthCoachStudent } = require("./utils/firebaseAuth"); // Middlewares checkToken and role
const { login, uploadImage, getAuthUser } = require("./controllers/user"); // Student controllers
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
app.post("/coach", ValidSignupCoach, newCoach); // Coach signup
app.post("/coach/exercice", firebaseAuthCoach, ValidNewExercice, newExercice); // Coach add new exercice
app.post("/coach/training", firebaseAuthCoach, ValidNewTraining, newTraining); // Coach add training
app.post("/coach/edit", firebaseAuthCoach, ValidEditCoach, editCoach); // Coach edit infos
app.post("/coach/training/:trainingId/exercice", firebaseAuthCoach, addExerciceToTraining); // Coach add exercice(s) to training
app.post("/coach/training/:trainingId/student", firebaseAuthCoach, addTrainingToStudent); // Coach add training to student
app.post("/coach/exercice/:exerciceId/edit", firebaseAuthCoach, ValidNewExercice, editExercice); // Coach edit exercice by ID
app.post("/coach/training/:trainingId/edit", firebaseAuthCoach, ValidNewTraining, editTraining); // Coach edit training by ID
app.delete("/coach/exercice/:exerciceId", firebaseAuthCoach, deleteExercice); // Coach delete exercice by ID
app.delete("/coach/training/:trainingId", firebaseAuthCoach, deleteTraining); // Coach delete training by ID

/** @GET Coach routes */
app.get("/coach/exercices", firebaseAuthCoach, getAllExercices); // Get all exercices by coachId
app.get("/coach/trainings", firebaseAuthCoach, getAllTrainings); // Get all trainings by coachId
app.get("/coach/training/:trainingId", firebaseAuthCoach, getOneTraining); // Get all trainings with exercices by coachId

// Student routes
app.post("/student", firebaseAuthCoach, ValidSignupStudent, newStudent);
app.post("/student/edit", firebaseAuthCoachStudent, ValidEditStudent, editStudent);
app.get("/students", firebaseAuthCoach, getAllStudents);

// User (Coach & Student)
app.post("/login", ValidLogin, login);
app.post("/user/image", firebaseAuth, uploadImage);
app.get("/user", firebaseAuth, getAuthUser);

// Export express App
exports.api = functions.region("europe-west1").https.onRequest(app);

// When coach delete exercice, we need to delete all exerciceId in trainings
exports.onDeleteExercice = functions
    .region("europe-west1")
    .firestore.document("/exercices/{exerciceId}")
    .onDelete((snapshot, context) => {
        let exerciceId = context.params.exerciceId;
        const batch = db.batch();

        return db
            .collection("trainings")
            .where("exercicesId", "array-contains", exerciceId)
            .get()
            .then((querySnapshot) => {
                // Delete all exerciceId in trainings who have this exerciceId
                exerciceId = [exerciceId];
                querySnapshot.forEach((doc) => {
                    batch.update(doc.ref, { exercicesId: admin.firestore.FieldValue.arrayRemove(...exerciceId) });
                });
                console.log(`Exercice(s) have been delete in training`);
                return batch.commit();
            })
            .catch((err) => {
                console.error(err);
            });
    });

// When coach delete training, we need to delete all trainingId in exercices
exports.onDeleteTraining = functions
    .region("europe-west1")
    .firestore.document("/trainings/{trainingId}")
    .onDelete((snapshot, context) => {
        let trainingId = context.params.trainingId;
        const batch = db.batch();

        return db
            .collection("trainings")
            .where("exercicesId", "array-contains", trainingId)
            .get()
            .then((querySnapshot) => {
                // Delete all trainingId in trainings who have this trainingId
                trainingId = [trainingId];
                querySnapshot.forEach((doc) => {
                    batch.update(doc.ref, { trainingsId: admin.firestore.FieldValue.arrayRemove(...trainingId) });
                });
                console.log(`Training have been delete in training`);
                return batch.commit();
            })
            .catch((err) => {
                console.error(err);
            });
    });

// On add new exercice we add exerciceId in the document of this exercice.
exports.onAddExercice = functions
    .region("europe-west1")
    .firestore.document("/exercices/{exerciceId}")
    .onCreate((snapshot, context) => {
        let exerciceId = context.params.exerciceId;
        const batch = db.batch();
        return db
            .collection("exercices")
            .doc(exerciceId)
            .update({ exerciceId: exerciceId })
            .then(() => {
                return batch.commit();
            })
            .catch((err) => {
                console.error(err);
            });
    });

/*
    quand j'ajoute un nouveau exercice j'ajoute son exerciceId
    quand j'ajoute un exercice ou des exercices a un training 
   */

// TODO

// #Student

// GET PROFILE OF STUDENT (middleware coach)

// #Coach

// ADD FORMULE
// EDIT FORMULE
// DELETE FORMULE
// GET ALL FORMULES
// GET ONE FORMULE

// # User (Coach & Student)

// CHANGE EMAIL IN SENDEMAIL() FUNCTION

// triggers quand on delete un exercice, on doit aussi le supprimer d'un training -> exercicesId = []
// triggers quand on delete un training, on doit aussi le supprimer des trainings du coach et eleve
// Video for explain triggers : https://youtu.be/uu43m1SpbTA?list=PLMhAeHCz8S38ryyeMiBPPUnFAiWnoPvWP
// DOC triggers firestore : https://firebase.google.com/docs/functions/firestore-events
