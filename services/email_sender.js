require("dotenv").config();
const fs = require("fs");
const nodemailer = require("nodemailer");

const email = process.env.GMAIL;
const email_pass = process.env.GMAIL_PASS;

const htmlTemplate = fs.readFileSync(
    "email_template/email_confirm.html",
    "utf8"
);
const htmlTemplateUpdate = fs.readFileSync(
    "email_template/weather_updates.html",
    "utf8"
);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: `${email}`,
        pass: `${email_pass}`,
    },
});

function buildConfirmationEmail(token) {
    const confirmUrl = `http://localhost:3000/api/confirm/${token}`;
    return htmlTemplate
        .replace("{{TOKEN}}", token)
        .replace("{{CONFIRM_LINK}}", confirmUrl);
}

function buildUpdateEmail(token, weather) {
    const unsubscribeLink = `http://localhost:3000/api/unsubscribe/${token}`;
    return htmlTemplateUpdate
        .replace("{{TEMPERATURE}}", weather.temperature)
        .replace("{{HUMIDITY}}", weather.humidity)
        .replace("{{DESCRIPTION}}", weather.description)
        .replace("{{CONFIRM_LINK}}", unsubscribeLink);
}

function sendConfirmationEmail(token, user_email) {
    const html = buildConfirmationEmail(token);
    const mailOptions = {
        from: `${email}`,
        to: `${user_email}`,
        subject: "Please confirm your WeatherAPI subscription",
        html: html,
    };
    transporter.sendMail(mailOptions);
}

function sendUpdates(token, user_email, weather) {
    const html = buildUpdateEmail(token, weather);
    const mailOptions = {
        from: `${email}`,
        to: `${user_email}`,
        subject: "WeatherAPI updates",
        html: html,
    };
    transporter.sendMail(mailOptions);
}

module.exports = { sendConfirmationEmail, sendUpdates };
