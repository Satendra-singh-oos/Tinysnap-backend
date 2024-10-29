import { Router } from "express";
import passport from "passport";
import {
  assignRole,
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  handleSocialLogin,
  loginUser,
  logoutUser,
  registerUser,
  resendEmailVerification,
  resetForgottoenPassword,
  verifyEmail,
} from "../controllers/user.controllers";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();

// SSO Route
router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
  (req, res) => {
    res.send("redirecting to google...");
  }
);

router
  .route("/google/callback")
  .get(passport.authenticate("google"), handleSocialLogin);

// Unsecured route
router.route("/register").post(registerUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/logout").post(logoutUser);
router.route("/forgot-password").post(forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(resetForgottoenPassword);

//secured route

router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/assign-role/:userId").post(verifyJWT, verifyAdmin, assignRole);
router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;
