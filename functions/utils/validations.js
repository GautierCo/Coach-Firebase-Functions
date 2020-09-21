const isValidEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) return true;
    else return false;
};

const isEmpty = (string) => {
    if (string.trim() === "") return true;
    else return false;
};

exports.validateSignupData = (data) => {
    let errors = {};

    if (isEmpty(data.email) || !isValidEmail(data.email)) {
        errors.email = "L'adresse email n'est pas valide";
    }

    if (data.password !== data.confirmPassword) {
        errors.data.password = "Les mots de passe sont différents.";
    } else if (isEmpty(data.password)) {
        errors.password = "Le mot de passe ne peut pas être vide";
    } else if (data.password.length < 6) {
        errors.password = "Le mot de passe doit avoir 6 caractères minimum";
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validateLoginData = (data) => {
    let errors = {};
    if (isEmpty(data.email) || !isValidEmail(data.email)) errors.email = "L'adresse email n'est pas valide";
    if (isEmpty(data.password)) errors.password = "Le mot de passe ne doit pas être vide";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};
