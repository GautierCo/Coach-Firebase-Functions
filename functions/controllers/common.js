const { db } = require("../utils/admin");
const firebase = require("../utils/firebase");
const { validateLoginData } = require("../utils/validations");

exports.login = (req, res) => {
    const { email, password } = req.body;

    const { valid, errors } = validateLoginData(req.body);

    if (!valid) return res.status(400).json({ errors });

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
};
