const { db } = require("../utils/admin");
const firebase = require("../utils/firebase");
const generator = require("generate-password");
const { sendMail } = require("../utils/email");
const { validateSignupData } = require("../utils/validations");

exports.newCoach = (req, res) => {
    const { email, password, firstname, lastname } = req.body;

    const { valid, errors } = validateSignupData(req.body);

    if (!valid) return res.status(400).json({ errors });

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
            db.collection("users")
                .doc(newCoachUid)
                .set({
                    uid: newCoachUid,
                    isCoach: true,
                    isStudent: false,
                    email,
                    firstname,
                    lastname,
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
                return res.status(400).json({ message: "L'adresse email est déjà utilisée" });
            } else if (err.code === "auth/invalid-email") {
                return res.status(400).json({ message: "L'adresse email n'est pas valide" });
            } else {
                return res
                    .status(500)
                    .json({ error: err.code, message: "Un problème est survenue lors de la création du compte" });
            }
        });
};

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

            // Send others data to Firestore
            db.collection("users")
                .doc(newStudentUid)
                .set({
                    uid: newStudentUid,
                    isCoach: false,
                    isStudent: true,
                    ...req.body,
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
