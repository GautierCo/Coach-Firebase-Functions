// Middlewares validate data

const validator = require("./validatorInit");

// SIGNUP_COACH : Middleware qui check chaque champ du formulaire avant de next() sinon il retourne les erreurs.
exports.ValidSignupCoach = (req, res, next) => {
    const validationRule = {
        email: "required|email",
        password: "required|string|min:6|max:30|confirmed",
        password_confirmation: "required|string|min:6",
        firstname: "required|string|min:3|max:30",
        lastname: "required|string|min:3|max:30",
        pseudo: "string|min:3|max:10",
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

// SIGNUP_STUDENT_WITH_COACH : Middleware qui check chaque champ du formulaire avant de next() sinon il retourne les erreurs.
exports.ValidSignupStudent = (req, res, next) => {
    const validationRule = {
        email: "required|email",
        phone: "required|phone",
        firstname: "required|string|min:3",
        lastname: "required|string|min:3",

        country: "string|max:30",
        city: "string|min:2",
        numberStreet: "string",
        address: "string|max:30",
        postalcode: "integer|min:5|max:5",
        region: "string|max:30",

        birthday: "date",
        size: "integer|max:3",
        weight: "integer|max:3",
        gender: "string|max:30",
        nbrSeance: "integer",
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

// LOGIN_USERS : Middleware
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

// EDIT_COACH : Middleware
exports.ValidEditCoach = (req, res, next) => {
    const validationRule = {
        email: "required|email",
        password: "string|min:6|max:30|confirmed",
        password_confirmation: "string|min:6|max:30",
        newEmail: "required|email",
        newPassword: "string|min:6|max:30|confirmed",
        newPassword_confirmation: "string|min:6|max:30",
        firstname: "required|string|min:3|max:30",
        lastname: "required|string|min:3|max:30",
        pseudo: "string|min:3|max:30",
        birthday: "date",

        country: "string|max:30",
        city: "string|min:2",
        numberStreet: "string",
        address: "string|max:30",
        postalcode: "integer|min:5|max:5",
        region: "string|max:30",
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

// EDIT_STUDENT : Middleware
exports.ValidEditStudent = (req, res, next) => {
    const validationRule = {
        email: "required|email",
        password: "string|min:6|max:30|confirmed",
        password_confirmation: "string|min:6|max:30",
        newEmail: "required|email",
        newPassword: "string|min:6|max:30|confirmed",
        newPassword_confirmation: "string|min:6|max:30",
        firstname: "required|string|min:3|max:30",
        lastname: "required|string|min:3|max:30",

        country: "string|max:30",
        city: "string|min:2",
        numberStreet: "string",
        address: "string|max:30",
        postalcode: "integer|min:5|max:5",
        region: "string|max:30",

        birthday: "date",
        size: "integer|max:3",
        weight: "integer|max:3",
        gender: "string|max:30",
        nbrSeance: "integer",
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
                message: "Validation signup Coach failed",
                data: err,
            });
        } else {
            next();
        }
    });
};
