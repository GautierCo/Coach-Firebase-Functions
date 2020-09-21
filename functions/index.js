const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const express = require("express");
const app = express();
const cors = require("cors")({ origin: true });
const firebase = require("firebase");
const generator = require("generate-password");
const config = functions.config();

const firebaseConfig = {
    apiKey: config.fbconfig.apikey,
    authDomain: config.fbconfig.authdomain,
    databaseURL: config.fbconfig.databaseurl,
    projectId: config.fbconfig.projectid,
    storageBucket: config.fbconfig.storagebucket,
    messagingSenderId: config.fbconfig.messagingsenderid,
    appId: config.fbconfig.appid,
    measurementId: config.fbconfig.measurementid,
};

admin.initializeApp();
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

/* ##### Utils #####*/

/** @Utils Send email after new student register **/
const sendMail = (data, req, res) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "guatiix5@gmail.com",
            pass: "1$yV00vpqqn3",
        },
    });
    cors(req, res, () => {
        const { accessToken, displayName, tempPassword, dest } = data;

        console.log(data);

        const mailOptions = {
            from: "Your Account Name <yourgmailaccount@gmail.com>", // Something like: Jane Doe <janedoe@gmail.com>
            to: dest,
            subject: `Bienvenue sur Coach ${displayName}`, // email subject
            html: `<p style="font-size: 16px;">Voici votre mot de passe généré aléatoirement, vous allez devoir le modifier : 
                Mot de passe temporaire: ${tempPassword}
            </p>
                <br />
            `,
        };

        return transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.send(error.toString());
            }
            return res.send("Sended");
        });
    });
};

const isValidEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) return true;
    else return false;
};

const isEmpty = (string) => {
    if (string.trim() === "") return true;
    else return false;
};

/* ##### API #####*/

/** @GET all Students by ?coachid=zzzz **/
app.get("/students", (req, res) => {
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
        });
});

/** @POST new Student */
app.post("/student", (req, res) => {
    const newStudent = {
        /*
        firstname,
        lastname,
        email,
        phone,

        country,
        city,
        numberStreet,
        address,
        postalcode,
        region,
        birthday: req.body.birthday,

        size: req.body.size,
        weight: req.body.weight,
        gender: req.body.gender,
        nbrSeance: req.body.nbrSeance,
        objectif: req.body.objectif,
        note: req.body.note,

        coachId: req.body.coachId,
        status: req.body.status,
        formule: req.body.formule,
        startContract: req.body.startContract,
        endContract: req.body.endContract,
        isCoach: false,
        isStudent: true,

        createdAt: new Date().toISOString(),
        */
    };

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
            sendMail(
                {
                    dest: email,
                    tempPassword,
                    displayName: firstname + " " + lastname,
                },
                req,
                res
            );

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
                    res.status(201).json({ message: `New Student Document ${doc.id} created successfully` });
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
                return res
                    .status(500)
                    .json({ error: err.code, message: "Un problème est survenue lors de la création du compte" });
            }
        });
});

/** @POST new Coach */
app.post("/coach", (req, res) => {
    const { email, password, confirmPassword, firstname, lastname } = req.body;

    let errors = {};

    if (isEmpty(email) || !isValidEmail(email)) {
        errors.email = "L'adresse email n'est pas valide";
    }

    if (password !== confirmPassword) {
        errors.password = "Les mots de passe sont différents.";
    } else if (isEmpty(password)) {
        errors.password = "Le mot de passe ne peut pas être vide";
    } else if (password.length < 6) {
        errors.password = "Le mot de passe doit avoir 6 caractères minimum";
    }

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

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
});

/** @POST Login Coach / Student */
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    let errors = {};
    if (isEmpty(email) || !isValidEmail(email)) errors.email = "L'adresse email n'est pas valide";
    if (isEmpty(password)) errors.password = "Le mot de passe ne doit pas être vide";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    let uid;
    let dataUser;
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((data) => {
            uid = data.user.uid;
            return data.user.getIdToken();
        })
        .then((token) => {
            db.collection("users")
                .doc(uid)
                .get()
                .then((doc) => {
                    dataUser = doc.data();
                    return res.json({ token, dataUser });
                })
                .catch((err) => {
                    console.error(err);
                });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found")
                return res.status(403).json({ message: "Adresse email ou mot de passe incorrect" });
        });
});

exports.api = functions.region("europe-west1").https.onRequest(app);
