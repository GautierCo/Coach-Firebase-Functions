const { db, admin } = require("../utils/admin");
const firebase = require("../utils/firebase");
const { firebaseConfig } = require("../utils/firebaseConfig");

// avatarUrl with default image on signup
const imageByDefault = "blank-profile.png";
const imageByDefaultUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageByDefault}?alt=media`;

/** @POST - Signup a new coach : **/
exports.newCoach = (req, res) => {
    const { email, password, firstname, lastname } = req.body;

    //const { valid, errors } = validateSignupData(req.body);

    //console.log(req, req.errors);

    //if (!valid) return res.status(400).json({ errors });

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

/** @POST - Add exercice(s) to training : **/
exports.addExerciceToTraining = (req, res) => {
    if (!req.params.trainingId) {
        return res.status(400).json({ message: "Vous devez avoir en paramètre le trainingId" });
    }

    if (!req.body.exercicesId || !Array.isArray(req.body.exercicesId)) {
        return res.status(400).json({ message: "exercicesId doit être un tableau" });
    }

    const trainingId = req.params.trainingId;
    const { exercicesId } = req.body; // ['exercice_id_1', 'exercice_id_2', ...] || ['exercice_id']

    db.collection("trainings")
        .doc(trainingId)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.json({ error: `Le training ${trainingId} est introuvable` });
            }
            return doc.ref.update({ exercicesId: admin.firestore.FieldValue.arrayUnion(...exercicesId) });
        })
        .then(() => {
            return res.json({ message: `Les exercices ont bien été ajouté au training ${trainingId}` });
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
                .where("trainingId", "==", trainingId)
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
