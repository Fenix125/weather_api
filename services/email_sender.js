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

function buildConfirmationEmail(token, city) {
    const url = process.env.URL;
    const confirmUrl = `http://${url}/api/confirm/${token}`;
    return htmlTemplate
        .replace("{{TOKEN}}", token)
        .replace("{{CONFIRM_LINK}}", confirmUrl)
        .replace("{{CITY}}", city);
}

function buildUpdateEmail(token, weather, city) {
    const url = process.env.URL;
    const unsubscribeLink = `http://${url}/api/unsubscribe/${token}`;
    return htmlTemplateUpdate
        .replace("{{TEMPERATURE}}", weather.temperature)
        .replace("{{HUMIDITY}}", weather.humidity)
        .replace("{{DESCRIPTION}}", weather.description)
        .replace("{{CONFIRM_LINK}}", unsubscribeLink)
        .replace("{{CITY}}", city);
}

function sendConfirmationEmail(token, user_email, city) {
    const html = buildConfirmationEmail(token, city);
    const mailOptions = {
        from: `${email}`,
        to: `${user_email}`,
        subject: "Please confirm your WeatherAPI subscription",
        html: html,
    };
    transporter.sendMail(mailOptions);
}

function sendUpdates(token, user_email, weather, city) {
    const html = buildUpdateEmail(token, weather, city);
    const mailOptions = {
        from: `${email}`,
        to: `${user_email}`,
        subject: "WeatherAPI updates",
        html: html,
    };
    transporter.sendMail(mailOptions);
}

module.exports = { sendConfirmationEmail, sendUpdates };
