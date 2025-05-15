require("dotenv").config();
const nodemailer = require("nodemailer");

const email = process.env.GMAIL;
const email_pass = process.env.GMAIL_PASS;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: `${email}`,
        pass: `${email_pass}`,
    },
});

const mailOptions = {
    from: `${email}`,
    to: "migelspainn@gmail.com",
    subject: "WeatherAPI",
    text: "Test email senter",
};

transporter.sendMail(mailOptions);
