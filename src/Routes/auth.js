const router = require("express").Router();
const UserDbFunctions = require("../utils/UserDbFunctions");
const errCodes = require("../utils/Constants/errCodes");
const Tokens = require("../utils/tokens");

// -------------------------------------SignUp Route
router.post("/signup", (req, res) => {
  // create user schema from json received
  UserDbFunctions.createUser({ ...req.body }, (err, user) => {
    if (err) {
      res.json({
        success: false,
        err,
        errCode: errCodes.USER_ALREADY_REGISTERED,
      });
    } else {
      const tokens = Tokens.createTokens(user);
      res.json({ success: true, tokens });
    }
  });
});

// -------------------------------------Login Route
router.post("/signin", (req, res) => {
  // console.log("login hit");
  // console.log(req.body);
  const { email, password } = req.body;
  // find in db and match password
  UserDbFunctions.findUser({ email }, (err, user) => {
    if (err) {
      // console.log(err, "err");

      res.json({ succesS: false, err, errCode: errCodes.SERVER_DB_ERROR });
    } else if (!user) {
      // console.log("user not found");
      res.json({
        success: false,
        err: "user not found",
        errCode: errCodes.USER_NOT_FOUND,
      });
    } else {
      // Compare password and then generate token
      UserDbFunctions.comparePassword({ password, dbPassword: user.password }, (err1, isMatch) => {
        if (err1) {
          // console.log("err1");
          // console.log(err1);
          res.json({ success: false, err1, errCode: errCodes.SERVER_PASSWORD_MATCHING_ERROR });
        } else if (isMatch) {
          // create token and refresh token and send
          const tokens = Tokens.createTokens(user);
          res.json({
            success: true,
            err: null,
            msg: "Logged in",
            tokens,
          });
        } else {
          res.json({
            success: false,
            err: "password incorrect",
            errCode: errCodes.PASSWORD_INVALID,
          });
        }
      });
    }
  });
});

// -------------------------------------forgot Password Route
/* hit reset Route otp from mail */
router.post("/forgot", (req, res) => {
  const { email } = req.body;
  UserDbFunctions.findUser({ email }, (err, user) => {
    if (err) {
      // console.log(err, "err");

      res.json({ succes: false, err, errCode: errCodes.SERVER_DB_ERROR });
    } else if (!user) {
      // console.log("user not found");
      res.json({
        success: false,
        err: "user not found",
        errCode: errCodes.USER_NOT_FOUND,
      });
    } else {
      const otp = Math.floor(1000 + Math.random() * 9000);
      // console.log(otp);
      const token = Tokens.generateOtpToken({ email });
      UserDbFunctions.updateUser({ email }, { otp }, (err1) => {
        if (err1) {
          res.json({ success: false, err, errCode: errCodes.ERROR_UPDATING_USER });
        } else {
          // store new id and otp in db
          // Send Mail and then send response
          res.json({ success: true, token });
        }
      });
    }
  });
});

// -------------------------------------check otp route
// get otp and check against db and then generate another token and give with uuid and email
router.post("/otp", (req, res) => {
  const { otp } = req.body;
  const token = req.headers.authorization;

  Tokens.verifyOtpToken(token, (err, decoded) => {
    if (err) {
      res.json({ success: false, err });
    } else {
      // verify otp against decoded token
      // console.log(decoded, otp);
      UserDbFunctions.findUser(decoded.data, (err1, user) => {
        if (err1) {
          res.json({ success: false, err });
        } else if (user.otp === otp) {
          const resetToken = Tokens.generateResetToken({
            email: user.email,
          });
          res.json({ success: true, msg: "otp Matched", resetToken });
        } else {
          res.json({ success: false, err: "Wrong Otp" });
        }
      });
    }
  });
  // extract token from header
  // check otp against db
});

// -------------------------------------reset Password route
router.post("/reset", (req, res) => {
  const token = req.headers.authorization;
  Tokens.verifyResetToken(token, (err, decoded) => {
    if (err) {
      res.json({ success: false, err });
    } else {
      const { newPassword } = req.body;
      // Compare the password with DB if same
      UserDbFunctions.findUser({ email: decoded.data.email }, (err1, user) => {
        if (err1) {
          res.json({ success: false, err1 });
        } else {
          UserDbFunctions.comparePassword(
            { password: newPassword, dbPassword: user.password },
            (err2, isMatch) => {
              if (err2) {
                res.json({ success: false, err2 });
              } else if (isMatch) {
                res.json({ success: false, err: "same passwords" });
              } else {
                UserDbFunctions.updatePassword(user, newPassword, (err3) => {
                  if (err3) {
                    res.json({ success: false, err3 });
                  } else {
                    res.json({ success: true, msg: "Password reset Complete" });
                  }
                });
              }
            },
          );
        }
      });
    }
  });
});

// -------------------------------------refreshTokens
router.get("/refreshtokens", (req, res) => {
  const token = req.headers.authorization;
  Tokens.verifyRefreshToken(token, (err, decoded) => {
    if (err) {
      res.json({ success: false, err });
    } else {
      // verify decoded token against db with uuid
      UserDbFunctions.findUser({ email: decoded.data.email }, (err1, user) => {
        if (err1) {
          res.json({ success: false, err1 });
        } else if (!user) {
          res.json({ success: false, err: "User not found" });
        } else if (decoded.data.uuid === user.uuid) {
          // generate tokens
          const tokens = Tokens.createTokens(decoded.data);
          res.json({ success: true, msg: "Tokens refrehsed", tokens });
        }
      });
    }
  });
  // verify token and give new current and refresh token
});

// -------------update Password Route

module.exports = router;
