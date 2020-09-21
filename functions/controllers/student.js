const { db } = require("../utils/admin");
const firebase = require("../utils/firebase");
const generator = require("generate-password");
const { firebaseConfig } = require("../utils/firebaseConfig");
const { sendMail } = require("../utils/email");

const imageByDefault = "blank-profile.png";
const imageByDefaultUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageByDefault}?alt=media`;

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
            console.log("(NewStudent) Une erreur est survenue lors de la création d'un nouveau élève:", err);
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

exports.editStudent = (req, res) => {
    const userRequest = req.user;

    const studentEditData = req.body;

    db.collection("users")
        .doc(studentEditData.uid)
        .get()
        .then((data) => {
            console.log("data", data.data());
            const user = data.data();

            if (user.coachId !== userRequest.uid) {
                return res.status(403).json("Ce n'est pas votre élève.");
            }

            db.collection("users")
                .doc(studentEditData.uid)
                .update(studentEditData)
                .then(() => {
                    return res.json({ message: "User updated data successfully" });
                })
                .catch((err) => {
                    console.error(err);
                    return res.status(500).json({ error: err.code, message: "Error when Student updated data" });
                });
        })
        .catch((err) => {
            res.status(500).json({
                error: err.code,
                message: "Un problème est survenue lors de l'édition de l'élève par le coach",
            });
        });
};

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
