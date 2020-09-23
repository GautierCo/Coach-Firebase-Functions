const { admin, db } = require("./admin");

exports.firebaseAuth = (req, res, next) => {
    let tokenId;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        tokenId = req.headers.authorization.split("Bearer ")[1];
    } else {
        return res.status(403).json({ error: "Unauthorized access, need a valid token" });
    }

    admin
        .auth()
        .verifyIdToken(tokenId)
        .then((decodedToken) => {
            //console.log(decodedToken);
            req.user = decodedToken;
            return db.collection("users").where("uid", "==", req.user.uid).limit(1).get();
        })
        .then((data) => {
            //console.log("TEST1", data.docs[0].data());
            // voir https://www.youtube.com/watch?v=Fz1f7NLvcu4&list=PLMhAeHCz8S38ryyeMiBPPUnFAiWnoPvWP&index=6
            // Il utilise handle, mais je ne vois pas pourquoi?

            // Si on a besoin d'ajouter des data dans notre req.user par exemple
            req.user.avatarUrl = data.docs[0].data().avatarUrl;
            return next();
        })
        .catch((err) => {
            console.error(err);
            return res.status(403).json(err);
        });
};

exports.firebaseAuthCoach = (req, res, next) => {
    let tokenId;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        tokenId = req.headers.authorization.split("Bearer ")[1];
    } else {
        return res.status(403).json({ error: "Unauthorized access, need a valid token" });
    }

    admin
        .auth()
        .verifyIdToken(tokenId)
        .then((decodedToken) => {
            req.user = decodedToken;
            return db.collection("users").where("uid", "==", req.user.uid).limit(1).get();
        })
        .then((data) => {
            const coach = data.docs[0].data();
            // On check si c'est bien un Coach avant d'effectuer le next() du middleware.
            if (!coach) return res.status(400).json({ message: "Le coach n'existe pas" });
            if (coach.isCoach === false) {
                return res.status(403).json({ message: "Vous devez être Coach pour effectuer cette action" });
            } else {
                // Si on a besoin d'ajouter des data dans notre req.user par exemple
                req.user.avatarUrl = data.docs[0].data().avatarUrl;
                return next();
            }
        })
        .catch((err) => {
            console.error(err);
            return res.status(400).json({ error: err.code });
        });
};

// Surement useless -> à virer plus tard
exports.firebaseAuthCoachStudent = (req, res, next) => {
    let tokenId;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        tokenId = req.headers.authorization.split("Bearer ")[1];
    } else {
        return res.status(403).json({ error: "Unauthorized access, need a valid token" });
    }

    admin
        .auth()
        .verifyIdToken(tokenId)
        .then((decodedToken) => {
            req.user = decodedToken;
            db.collection("users")
                .doc(decodedToken.uid)
                .get()
                .then((data) => {
                    if (!data.data()) return res.json({ message: "L'utilisateur n'existe pas" });

                    const user = data.data();
                    // Si on a besoin d'ajouter des data dans notre req.user par exemple
                    req.user.avatarUrl = data.data().avatarUrl;
                    return next();
                })
                .catch((err) => {
                    console.error(err);
                    return res.status(400).json({ error: err.code });
                });
        })
        .catch((err) => {
            console.error(err);
            return res.status(400).json({ error: err.code });
        });
};
