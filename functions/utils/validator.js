const validator = require("./validatorInit");

// SIGNUP_COACH
exports.ValidSignupCoach = (req, res, next) => {
    const validationRule = {
        email: "required|email",
        password: "required|string|min:6|max:30|confirmed",
        password_confirmation: "required|string|min:6",
        firstname: "required|string|min:3|max:80",
        lastname: "required|string|min:3|max:80",
        pseudo: "string|min:3|max:80",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412).send({
                success: false,
                message: "Validation signup Coach failed",
                data: err,
            });
        } else {
            next();
        }
    });
};

// SIGNUP_STUDENT_WITH_COACH
exports.ValidSignupStudent = (req, res, next) => {
    const validationRule = {
        coachId: "required|string",
        email: "required|email",
        phone: "required|phone",
        firstname: "required|string|min:3",
        lastname: "required|string|min:3",

        country: "string|max:200",
        city: "string|min:2",
        numberStreet: "string|max:200",
        address: "string|max:200",
        postalcode: ["integer", { digits: 5 }], // a check
        region: "string|max:200",

        birthday: "date",
        size: ["integer", { digits_between: [1, 3] }], // a check
        weight: ["integer", { digits_between: [1, 3] }], // a check
        gender: "string|max:30",
        nbrSeance: ["integer", { digits_between: [1, 2] }], // a check
        objectif: "string|max:30",
        note: "string|max:5000",

        status: "required|boolean",
        formule: ["string", { required_if: ["status", true] }],
        startContract: ["date", { required_with: "formule" }],
        endContract: ["date", { required_with: "startContract" }],
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412).send({
                success: false,
                message: "Validation signup Student failed",
                data: err,
            });
        } else {
            next();
        }
    });
};

// LOGIN_USERS
exports.ValidLogin = (req, res, next) => {
    const validationRule = {
        email: "required|email",
        password: "required|string|min:6|max:30",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412).send({
                success: false,
                message: "Validation Login USER failed",
                data: err,
            });
        } else {
            next();
        }
    });
};

// EDIT_COACH
exports.ValidEditCoach = (req, res, next) => {
    const validationRule = {
        email: "required|email",
        password: "string|min:6|max:30|confirmed",
        password_confirmation: "string|min:6|max:30",
        newEmail: "required|email",
        newPassword: "string|min:6|max:30|confirmed",
        newPassword_confirmation: "string|min:6|max:30",
        firstname: "required|string|min:3|max:80",
        lastname: "required|string|min:3|max:80",
        pseudo: "string|min:3|max:80",
        birthday: "date",

        country: "string|max:200",
        city: "string|min:2|max:200",
        numberStreet: "string|max:200",
        address: "string|max:200",
        postalcode: ["integer", { digits: 5 }],
        region: "string|max:80",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412).send({
                success: false,
                message: "Validation signup Coach failed",
                data: err,
            });
        } else {
            next();
        }
    });
};

// EDIT_STUDENT
exports.ValidEditStudent = (req, res, next) => {
    const validationRule = {
        email: "required|email",
        password: "string|min:6|max:30|confirmed",
        password_confirmation: "string|min:6|max:30",
        newEmail: "required|email",
        newPassword: "string|min:6|max:30|confirmed",
        newPassword_confirmation: "string|min:6|max:30",
        firstname: "required|string|min:3|max:80",
        lastname: "required|string|min:3|max:80",

        country: "string|max:200",
        city: "string|min:2|max:200",
        numberStreet: "string|max:200",
        address: "string|max:200",
        postalcode: ["integer", { digits: 5 }],
        region: "string|max:200",

        birthday: "date",
        size: ["integer", { digits_between: [1, 3] }],
        weight: ["integer", { digits_between: [1, 3] }],
        gender: "string|max:30",
        nbrSeance: ["integer", { digits_between: [1, 2] }],
        objectif: "string|max:200",
        note: "string|max:5000",

        status: "required|boolean",
        formule: ["string", { required_if: ["status", true] }],
        startContract: ["date", { required_with: "formule" }],
        endContract: ["date", { required_with: "startContract" }],
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412).send({
                success: false,
                message: "Validation signup Coach failed",
                data: err,
            });
        } else {
            next();
        }
    });
};

// ADD_NEW_EXERCICE
exports.ValidNewExercice = (req, res, next) => {
    const validationRule = {
        name: "required|string|min:3|max:200",
        description: "string|min:3|max:5000",
        advice: "string|min:3|max:5000",
        nbrRep: ["integer", { digits_between: [1, 4] }],
        nbrSerie: ["integer", { digits_between: [1, 4] }],
        restTime: ["integer", { digits_between: [1, 4] }], // temps de repos en seconde
        weight: ["integer", { digits_between: [1, 3] }],
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412).send({
                success: false,
                message: "Validation signup Coach failed",
                data: err,
            });
        } else {
            next();
        }
    });
};

// ADD_NEW_TRAINING
exports.ValidNewTraining = (req, res, next) => {
    const validationRule = {
        name: "required|string|min:3|max:200",
        description: "string|min:3|max:5000",
        days: {
            lundi: "required|boolean",
            mardi: "required|boolean",
            mercredi: "required|boolean",
            jeudi: "required|boolean",
            vendredi: "required|boolean",
            samedi: "required|boolean",
            dimanche: "required|boolean",
        },
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412).send({
                success: false,
                message: "Validation signup Coach failed",
                data: err,
            });
        } else {
            next();
        }
    });
};
