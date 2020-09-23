let database = {
    users: [
        {
            uid: "azSD5QS4D541d21",
            firstname: "firstname",
            lastname: "lastname",
            displayName: "firstname" + " " + "lastname",
            email: "email",
            phone: "phone",

            country: "country",
            city: "city",
            numberStreet: "numberStreet",
            address: "address",
            postalcode: "postalcode",
            region: "region",
            birthday: "birthday",

            size: "size",
            weight: "weight",
            gender: "gender",
            nbrSeance: "nbrSeance",
            objectif: "objectif",
            note: "note",

            coachId: "coachId",
            status: "status",
            formule: "formule",
            startContract: "startContract",
            endContract: "endContract",
            isCoach: "false || true",
            isStudent: "false || true",

            createdAt: new Date().toISOString(),
        },
    ],
    trainings: [
        {
            name: "Entrainement perte de poid",
            //trainingId: "91dufqbCN2yQ5eoQ0Ako",
            coachId: "TvDmbyOGF5Zm5FPZsDq7I0Z3x7w1",
            days: {
                lundi: true,
                mardi: false,
                mercredi: true,
                jeudi: false,
                vendredi: true,
                samedi: false,
                dimanche: false,
            },
            category: "Perte de poid",
        },
    ],
    exercices: [
        {
            advice: "Bloquer votre coude pour une meilleure sensation",
            description: "Utiliser des haltères main gauche et droite",
            name: "Développer coucher",
            nbrRep: 10,
            nbrSerie: 5,
            restTime: 60, //(secondes)
            trainingId: "91dufqbCN2yQ5eoQ0Ako",
            exerciceId: "rzaagY67W2y6vyRrNTOs",
            weight: 15,
        },
    ],
};

firstname;
lastname;
email;
phone;
birthday;

country;
city;
numberStreet;
address;
postalcode;
region;

size;
weight;
gender;
nbrSeance;
objectif;
note;

coachId;
status;
formule;
startContract;
endContract;
