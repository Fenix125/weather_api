const crypto = require("crypto");

function makeToken(bytes = 16) {
    return crypto.randomBytes(bytes).toString("hex");
}
function tokenizeString(string) {
    return Buffer.from(string).toString("base64url");
}
function detokenizeString(string) {
    return Buffer.from(string, "base64url").toString("utf8");
}
module.exports = { makeToken, tokenizeString, detokenizeString };
