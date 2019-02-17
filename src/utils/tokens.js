const jwt = require("jsonwebtoken");
const tokenSecret = require("./Constants/tokenSecret");
// get User Oject and create token,refreshToken and return
const createTokens = (user) => {
  // generate Token and return
  const token = jwt.sign(
    {
      data: { email: user.email },
      exp: Math.floor(Date.now() / 1000 + 60 * 60),
    },
    tokenSecret.tokenSecret,
  );
  const refreshToken = jwt.sign(
    {
      data: { email: user.email, uuid: user.uuid },
      exp: Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7),
    },
    tokenSecret.refreshTokenSecret,
  );
  return { token, refreshToken };
};
const verifyRefreshToken = (token, cb) => {
  jwt.verify(token, tokenSecret.refreshTokenSecret, cb);
};
const generateOtpToken = (data) => {
  const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000 + 60 * 30) }, "AustonOtp");
  return token;
};
const generateResetToken = (data) => {
  const token = jwt.sign({ data, exp: Math.floor(Date.now() / 1000 + 60 * 30) }, "AustonReset");
  return token;
};
const verifyOtpToken = (token, cb) => {
  jwt.verify(token, "AustonOtp", cb);
};

const verifyResetToken = (token, cb) => {
  jwt.verify(token, "AustonReset", cb);
};

const extractUserEmail = (token) => {
  const { email } = jwt.decode(token).data;
  return email;
};
const extractTokenRequest = (req) => {
  if (req.headers && req.headers.authorization) {
    const { authorization } = req.headers;
    return authorization;
  }
  return null;
};
const verifyToken = (token, cb) => {
  jwt.verify(token, tokenSecret.tokenSecret, cb);
};
module.exports = {
  createTokens,
  generateOtpToken,
  verifyOtpToken,
  generateResetToken,
  verifyResetToken,
  verifyRefreshToken,
  extractUserEmail,
  extractTokenRequest,
  verifyToken,
};
