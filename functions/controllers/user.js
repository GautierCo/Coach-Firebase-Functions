const { db, admin } = require("../utils/admin");
const { firebaseConfig } = require("../utils/firebaseConfig");
const firebase = require("../utils/firebase");

exports.login = (req, res) => {
    const { email, password } = req.body;

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

exports.uploadImage = (req, res) => {
    const BusBoy = require("busboy");
    const path = require("path");
    const os = require("os");
    const fs = require("fs");

    const busboy = new BusBoy({ headers: req.headers });
    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
            return res.status(400).json({ message: "Type of file need to be PNG or JPEG" });
        }

        // Get the image extension
        const imageExtension = filename.split(".")[filename.split(".").length - 1];
        // Generate a filename (2151354789.png)
        imageFileName = `${Math.round(Math.random() * 1000000000)}.${imageExtension}`;
        // Path
        const filePath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filePath, mimetype };
        // Create the file
        file.pipe(fs.createWriteStream(filePath));
    });

    busboy.on("finish", () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filePath, {
                resumable: false,
                metadata: {
                    contentType: imageToBeUploaded.mimetype,
                },
                //gzip
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
                db.collection("users")
                    .doc(req.user.uid)
                    .update({ avatarUrl: imageUrl })
                    .then(() => {
                        return res.status(201).json({ message: "L'avatar a bien été enregistrée" });
                    })
                    .catch((err) => {
                        console.error(err);
                        return res
                            .status(500)
                            .json({ message: "Une erreur est survenue lors de l'enregistrement de l'avatar" });
                    });
            })
            .catch((err) => {});
    });

    busboy.end(req.rawBody);
};

exports.getAuthUser = (req, res) => {
    db.collection("users")
        .doc(req.user.uid)
        .get()
        .then((data) => {
            console.log("data", data.data());
            return res.json(data.data());
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
};
