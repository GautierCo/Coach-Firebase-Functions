const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

exports.sendMail = (req, res, data) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "guatiix5@gmail.com",
            pass: "1$yV00vpqqn3",
        },
    });
    cors(req, res, () => {
        const { accessToken, displayName, tempPassword, dest } = data;

        const mailOptions = {
            from: "Your Account Name <yourgmailaccount@gmail.com>", // Something like: Jane Doe <janedoe@gmail.com>
            to: dest,
            subject: `Bienvenue sur Coach ${displayName}`, // email subject
            html: `<p style="font-size: 16px;">Voici votre mot de passe généré aléatoirement, vous allez devoir le modifier : 
                Mot de passe temporaire: ${tempPassword}
            </p>
                <br />
            `,
        };

        return transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.send(error.toString());
            }
            return res.send("Sended");
        });
    });
};
