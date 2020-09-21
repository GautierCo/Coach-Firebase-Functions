const { db } = require("../utils/admin");
const firebase = require("../utils/firebase");
const { firebaseConfig } = require("../utils/firebaseConfig");
const generator = require("generate-password");
const { sendMail } = require("../utils/email");
const { validateSignupData } = require("../utils/validations");
const admin = require("../utils/admin");

// add avatarUrl with default image

const imageByDefault = "blank-profile.png";
const imageByDefaultUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageByDefault}?alt=media`;

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

exports.editCoach = (req, res) => {
    const userRequest = req.user;
    const coachEditData = req.body;

    db.collection("users")
        .doc(userRequest.uid)
        .update(coachEditData)
        .then(() => {
            return res.json({ message: "Coach updated data successfully" });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code, message: "Error when Coach updated data" });
        });
};
