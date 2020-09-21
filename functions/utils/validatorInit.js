// Config of Validator

const Validator = require("validatorjs");

// Adding Phone validator function
Validator.register(
    "phone",
    function (value, requirement, attribute) {
        const regex = new RegExp(/^[+](\d{3})\)?(\d{3})(\d{5,6})$|^(\d{10,10})$/);
        return regex.test(value);
    },
    "Le numéro de téléphone est invalide."
);

// Translations errors
let messages = Validator.getMessages("fr");
messages.required = "Ce champ est requis.";
messages.email = "Vous devez entrer une adresse email valide.";
messages.phone = "Vous devez entrer une numéro de téléphone valide.";
messages.min = "Un nombre de caractères minimum est requis.";
messages.max = "Vous avez dépassé le nombre de caractères maximum.";
messages.confirmed = "Les mots de passe ne doivent pas être différent";
messages.string = "Ce champ doit seulement être du texte";
messages.date = "Ce champ doit être une date valide";
messages.boolean = "Ce champ doit être true ou false";
messages.integer = "Ce champ doit être un entier";
Validator.setMessages("fr", messages);

// Set language to French
Validator.useLang("fr");

const validator = (body, rules, customMessages, callback) => {
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};

module.exports = validator;
