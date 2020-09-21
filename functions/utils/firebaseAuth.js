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
            console.log("TEST1", data.docs[0].data());
            // voir https://www.youtube.com/watch?v=Fz1f7NLvcu4&list=PLMhAeHCz8S38ryyeMiBPPUnFAiWnoPvWP&index=6
            // Il utilise handle, mais je ne vois pas pourquoi?
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
            // On check si c'est bien un Coach avant d'effectuer le next() du middleware.
            const coach = data.docs[0].data();

            if (!coach) return res.status(400).json({ message: "Le coach n'existe pas" });
            if (coach.isCoach === false) {
                return res.status(403).json({ message: "Vous devez être Coach pour ajouter un élève" });
            } else {
                return next();
            }
        })
        .catch((err) => {
            console.error(err);
            return res.status(400).json({ message: "Le coach n'existe pas" });
        });
};
