const { db, admin } = require("../utils/admin");
const firebase = require("../utils/firebase");
const generator = require("generate-password");
const { firebaseConfig } = require("../utils/firebaseConfig");
const { sendMail } = require("../utils/email");

const imageByDefault = "blank-profile.png";
const imageByDefaultUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageByDefault}?alt=media`;

/** @POST - Signup a new student : **/
exports.newStudent = (req, res) => {
    const { firstname, lastname, email } = req.body;

    const tempPassword = generator.generate({
        length: 10,
        numbers: true,
    });

    firebase
        .auth()
        .createUserWithEmailAndPassword(email, tempPassword)
        .then((data) => {
            const newStudentUid = data.user.uid;

            // Send email with temp password
            sendMail(req, res, {
                dest: email,
                tempPassword,
                displayName: firstname + " " + lastname,
            });

            // updateProfile() pour ajouter nom prenom

            // Send others data to Firestore
            db.collection("users")
                .doc(newStudentUid)
                .set({
                    uid: newStudentUid,
                    isCoach: false,
                    isStudent: true,
                    ...req.body,
                    avatarUrl: imageByDefaultUrl,
                    createdAt: new Date().toISOString(),
                })
                .then((doc) => {
                    res.status(201).json({ message: `New Student Document ${doc.uid} created successfully` });
                })
                .catch((err) => {
                    console.error("createStudent", err);
                    return res.status(500).json({
                        error: "An error occurred while creating a new Student",
                    });
                });
        })
        .catch((err) => {
            console.log(err);
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).json({ message: "L'adresse email est déjà utilisée" });
            } else {
                return res.status(500).json({
                    error: err.code,
                    message: "Un problème est survenue lors de la création du compte",
                });
            }
        });
};

/** @POST - Edit student infos : **/
exports.editStudent = (req, res) => {
    const userRequest = req.user; // COACH ou STUDENT
    //const studentEditData = req.body;
    const { newPassword, newEmail, password_confirmation, ...rest } = req.body;
    let finalData = {};

    db.collection("users")
        .doc(req.body.uid)
        .get()
        .then(async (data) => {
            const user = data.data();

            if (userRequest.isCoach && user.coachId !== userRequest.uid) {
                return res.json({ message: "Vous n'êtes pas le coach de cet élève" });
            } else if (user.uid !== req.user.uid) {
                return res.json({ message: "Vous n'êtes pas authentifié sous ce compte" });
            }

            if (newPassword || newEmail) {
                await admin
                    .auth()
                    .updateUser(req.body.uid, {
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
                        return res.status(201).json({ message: "L'étudiant a été mis à jour sur firebaseAuth" });
                    })
                    .catch((err) => {
                        console.log("Error updating user:", err);
                        return res.status(500).json({ message: err });
                    });
            } else {
                finalData = { ...rest };
            }

            db.collection("users")
                .doc(req.body.uid)
                .update(finalData)
                .then(() => {
                    return res.json({ message: "User updated data successfully" });
                })
                .catch((err) => {
                    console.error(err);
                    return res.status(500).json({ error: err.code, message: "Error when Student updated data" });
                });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                error: err,
                message: "Un problème est survenue lors de l'édition de l'élève par le coach",
            });
        });
};

/** @GET - Get all students : **/
exports.getAllStudents = (req, res) => {
    const { coachid } = req.query;

    db.collection("users")
        .orderBy("createdAt", "desc")
        .where("coachId", "==", coachid)
        .get()
        .then((data) => {
            let students = [];
            data.forEach((studentDoc) => {
                students.push(studentDoc.data());
            });
            return res.json(students);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json(err);
        });
};
