/*
const isEmpty = (string) => {
    if (string.trim() === "") return true;
    else return false;
};

const isValidEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!email.match(emailRegEx) || isEmpty(email)) return false;
    else return true;
};

exports.validateSignupData = (data) => {
    let errors = {};

    if (isValidEmail(data.email)) {
        errors.email = "L'adresse email n'est pas valide";
    }

    if (data.password !== data.password_confirmation) {
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

exports.validateCoachData = (data) => {

    let errors = {};
    let userDetails = {};

    if (!isEmpty(data.firstname.trim())) userDetails.firstname = data.firstname;

    if (!isEmpty(data.lastname.trim())) {
        userDetails.lastname = data.lastname;
    }

    if (!isEmpty(data.email.trim())) userDetails.email = data.email;
    if (!isEmpty(data.phone.trim())) userDetails.phone = data.phone;
    if (!isEmpty(data.birthday.trim())) userDetails.birthday = data.birthday;
    if (!isEmpty(data.country.trim())) userDetails.country = data.country;
    if (!isEmpty(data.city.trim())) userDetails.city = data.city;
    if (!isEmpty(data.numberStreet.trim())) userDetails.numberStreet = data.numberStreet;
    if (!isEmpty(data.address.trim())) userDetails.address = data.address;
    if (!isEmpty(data.postalcode.trim())) userDetails.postalcode = data.postalcode;
    if (!isEmpty(data.region.trim())) userDetails.region = data.region;
};
*/
