const { db, admin } = require("../utils/admin");
const firebase = require("../utils/firebase");
const { firebaseConfig } = require("../utils/firebaseConfig");

// avatarUrl with default image on signup
const imageByDefault = "blank-profile.png";
const imageByDefaultUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageByDefault}?alt=media`;

/** @POST - Signup a new coach : **/
exports.newCoach = (req, res) => {
    const { email, password, firstname, lastname } = req.body;

    let token;
    let newCoachUid;
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((data) => {
            newCoachUid = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            // updateProfile() pour ajouter nom prenom

            db.collection("users")
                .doc(newCoachUid)
                .set({
                    uid: newCoachUid,
                    isCoach: true,
                    isStudent: false,
                    email,
                    firstname,
                    lastname,
                    avatarUrl: imageByDefaultUrl,
                    createdAt: new Date().toISOString(),
                })
                .then(() => {
                    return res
                        .status(201)
                        .json({ token, message: `New Coach as been signup successfully ${newCoachUid}` });
                })
                .catch((err) => {
                    console.error("createStudent", err);
                    return res.status(500).json({
                        error: "An error occurred while creating a new Coach.",
                    });
                });
        })
        .catch((err) => {
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).json({ data: { errors: { email: ["L'adresse email est déjà utilisée"] } } });
            } else if (err.code === "auth/invalid-email") {
                return res.status(400).json({ data: { errors: { email: ["L'adresse email n'est pas valide"] } } });
            } else {
                return res
                    .status(500)
                    .json({ error: err.code, message: "Un problème est survenue lors de la création du compte" });
            }
        });
};

/** @POST - Edit coach infos : **/
exports.editCoach = async (req, res) => {
    const userRequest = req.user;

    const { password: newPassword, newEmail, password_confirmation, ...rest } = req.body;
    let finalData = {};

    if (newPassword || newEmail) {
        await admin
            .auth()
            .updateUser(userRequest.uid, {
                ...(newEmail && { email: newEmail }),
                ...(newPassword && { password: newPassword }),
            })
            .then(() => {
                if (newEmail) {
                    finalData = {
                        ...rest,
                        email: newEmail,
                    };
                }
                return res.status(201).json({ message: "Le coach a été mis à jour sur firebaseAuth" });
            })
            .catch((err) => {
                console.log("Error updating user:", err);
                return res.status(500).json({ message: err });
            });
    } else {
        finalData = { ...rest };
    }

    db.collection("users")
        .doc(userRequest.uid)
        .update(finalData)
        .then(() => {
            return res.json({ message: "Coach updated data successfully" });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code, message: "Error when Coach updated data" });
        });
};

/** @POST - Add exercice : **/
exports.newExercice = (req, res) => {
    const exerciceData = {
        ...req.body,
        coachId: req.user.uid,
        createdAt: new Date().toISOString(),
    };

    db.collection("exercices")
        .add(exerciceData)
        .then((doc) => {
            const exerciceId = doc.id;
            exerciceData.exerciceId = exerciceId;

            return res.json(exerciceData);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
};

/** @POST - Edit exercice by Id : **/
exports.editExercice = (req, res) => {
    if (!req.params.exerciceId) {
        return res.status(400).json({ message: "Vous devez avoir en paramètre exerciceId" });
    }

    const exerciceData = req.body;
    const { exerciceId } = req.params;

    db.collection("exercices")
        .doc(exerciceId)
        .update(exerciceData)
        .then(() => {
            res.json(`L'exercice ${exerciceId} a bien été mis à jour`);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err });
        });
};

/** @DELETE - Delete exercice by Id : **/
exports.deleteExercice = (req, res) => {
    if (!req.params.exerciceId) {
        return res.status(400).json({ message: "Vous devez avoir en paramètre exerciceId" });
    }

    const { exerciceId } = req.params;

    db.collection("exercices")
        .doc(exerciceId)
        .delete()
        .then(() => {
            res.json(`L'exercice ${exerciceId} a bien été supprimé`);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err });
        });
};

/** @POST - Add training : **/
exports.newTraining = (req, res) => {
    const trainingData = {
        ...req.body,
        coachId: req.user.uid,
        createdAt: new Date().toISOString(),
    };

    db.collection("trainings")
        .add(trainingData)
        .then((doc) => {
            const trainingId = doc.id;
            trainingData.trainingId = trainingId;

            return res.json(trainingData);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
};

/** @POST - Edit training by Id : **/
exports.editTraining = (req, res) => {
    if (!req.params.trainingId) {
        return res.status(400).json({ message: "Vous devez avoir en paramètre trainingId" });
    }

    const trainingData = req.body;
    const { trainingId } = req.params;

    db.collection("trainings")
        .doc(trainingId)
        .update(trainingData)
        .then(() => {
            res.json(`Le training ${trainingId} a bien été mis à jour`);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err });
        });
};

/** @DELETE - Delete training by Id : **/
exports.deleteTraining = (req, res) => {
    if (!req.params.trainingId) {
        return res.status(400).json({ message: "Vous devez avoir en paramètre trainingId" });
    }

    const { trainingId } = req.params;

    db.collection("trainings")
        .doc(trainingId)
        .delete()
        .then(() => {
            res.json(`Le training ${trainingId} a bien été supprimé`);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err });
        });
};

/** @POST - Add exercice(s) to training : **/
exports.addExerciceToTraining = (req, res) => {
    if (!req.params.trainingId) {
        return res.status(400).json({ message: "Vous devez avoir en paramètre le trainingId" });
    }

    if (!req.body.exercicesId || !Array.isArray(req.body.exercicesId)) {
        return res.status(400).json({ message: "exercicesId doit être un tableau" });
    }

    const { trainingId } = req.params;
    const { exercicesId } = req.body; // ['exercice_id_1', 'exercice_id_2', ...] || ['exercice_id']
    const trainingIdArray = [trainingId];
    let batch = db.batch();

    db.collection("trainings")
        .doc(trainingId)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.json({ error: `Le training ${trainingId} est introuvable` });
            }
            // Add exercicesId to training document
            return doc.ref.update({ exercicesId: admin.firestore.FieldValue.arrayUnion(...exercicesId) });
        })
        .then(() => {
            return db.collection("exercices").where("exerciceId", "in", exercicesId).get();
        })
        .then((docs) => {
            // Add trainingId for each exerciceId in training collection.
            docs.forEach((doc) => {
                batch.update(doc.ref, { trainingsId: admin.firestore.FieldValue.arrayUnion(...trainingIdArray) });
            });
            return batch.commit();
        })
        .then(() => {
            return res.json({
                message: `Les exercices ${exercicesId.join(",")} ont bien été ajouté au training ${trainingId}`,
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
};

/** @DELETE - Delete exercice(s) of training : **/
exports.deleteExerciceOfTraining = (req, res) => {
    if (!req.params.trainingId) {
        return res.status(400).json({
            message: "Vous devez avoir en paramètre le trainingId",
        });
    }

    if (!req.body.exercicesId || !Array.isArray(req.body.exercicesId)) {
        return res.status(400).json({
            message: "exercicesId doit être un tableau ['exercice_id_1', 'exercice_id_2', ...] || ['exercice_id']",
        });
    }

    const { trainingId } = req.params; // "AZE4d4D5d54SQ5F4"
    const { exercicesId } = req.body; // ['exercice_id_1', 'exercice_id_2', ...] || ['exercice_id']
    const trainingIdArray = [trainingId];
    let batch = db.batch();

    db.collection("exercices")
        .where("exerciceId", "in", exercicesId)
        .get()
        .then((docs) => {
            // Delete exerciceId for each exercice document who have this trainingId .
            docs.forEach((doc) => {
                batch.update(doc.ref, { trainingsId: admin.firestore.FieldValue.arrayRemove(...trainingIdArray) });
            });
            return db.collection("trainings").doc(trainingId).get();
        })
        .then((doc) => {
            if (!doc.exists) {
                return res.json({ error: `Le training ${trainingId} est introuvable` });
            }
            // Delete exercicesId in trainings documents. (Les exercices ont plusieurs trainings)
            return doc.ref.update({ exercicesId: admin.firestore.FieldValue.arrayRemove(...exercicesId) });
        })
        .then(() => {
            batch.commit();
            return res.json({
                message: `Les exercices ont bien été ${exercicesId.join(",")} supprimé du training ${trainingId}`,
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
};

/** @POST - Add training to student : **/
exports.addTrainingToStudent = (req, res) => {
    if (!req.params.trainingId) {
        return res.status(400).json({ message: "Vous devez avoir en paramètre le trainingId" });
    }

    if (!req.body.studentId) {
        return res.status(400).json({ message: "Vous devez renseigner studentId" });
    }

    let trainingId = req.params.trainingId;
    const { studentId } = req.body;

    trainingId = [trainingId]; // Need to be an array for use arrayUnion

    db.collection("users")
        .doc(studentId)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.json({ error: `L'utilisateur ${studentId} est introuvable` });
            }
            return doc.ref.update({ trainingsId: admin.firestore.FieldValue.arrayUnion(...trainingId) });
        })
        .then(() => {
            return res.json({ message: `Le training ${trainingId} a bien été ajouté au à l'élève ${studentId}` });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
};

/** @DELETE - Delete training of student */
exports.deleteTrainingOfStudent = (req, res) => {
    if (!req.params.trainingId) {
        return res.status(400).json({
            message: "Vous devez avoir en paramètre le trainingId",
        });
    }

    if (!req.params.studentId) {
        return res.status(400).json({
            message: "studentId ne doit pas être vide pour supprimer un training",
        });
    }

    const { trainingId, studentId } = req.params;
    const trainingIdArray = [trainingId];

    db.collection("students")
        .doc(studentId)
        .update({ trainingsId: admin.firestore.FieldValue.arrayRemove(...trainingIdArray) })
        .then(() => {
            res.json({ message: `Le trainingId ${trainingId} a bien été supprimé de l'élève ${studentId}` });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err });
        });
};

/** @GET - Get all exercices */
exports.getAllExercices = (req, res) => {
    const coachId = req.user.uid;
    let allExercices = [];
    db.collection("exercices")
        .where("coachId", "==", coachId)
        .orderBy("createdAt", "desc")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                allExercices.push({ ...doc.data(), exerciceId: doc.id });
            });
            return res.json({ exercices: allExercices });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err });
        });
};

/** @GET - Get all training */
exports.getAllTrainings = (req, res) => {
    const coachId = req.user.uid;
    let allTrainings = [];
    db.collection("trainings")
        .where("coachId", "==", coachId)
        .orderBy("createdAt", "desc")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                allTrainings.push({ ...doc.data(), trainingId: doc.id });
            });
            return res.json({ trainings: allTrainings });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err });
        });
};

/** @GET - Get one training with exercices */
exports.getOneTraining = (req, res) => {
    if (!req.params.trainingId) {
        return res.status(400).json({ message: "Vous devez avoir en paramètre le trainingId" });
    }
    const trainingId = req.params.trainingId;
    let training = {};
    let exercices = [];

    db.collection("trainings")
        .doc(trainingId)
        .get()
        .then((dataTraining) => {
            const { exercicesId, ...rest } = dataTraining.data();
            training = { ...rest };

            db.collection("exercices")
                .where("trainingsId", "array-contains", trainingId)
                .orderBy("createdAt", "desc")
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        exercices.push({ ...doc.data(), exerciceId: doc.id });
                    });
                    training = {
                        ...training,
                        exercices,
                    };
                    return res.json(training);
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ error: err });
                });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err });
        });
};

// Add exercice by day
/* 

lundi: [exercice_id1, exercice_id2]

et quand on get on transforme en 

exerciceByDay: {
    lundi {
        allExercices
    }
}
*/
