import env from "../env";
import { resend } from "./resend";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationUrl: string
) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Welcome to our app, ${username}!</h2>
        <p>We're very excited to have you on board.</p>
        <p>To verify your email please click on the following button:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #22BC66; text-decoration: none; border-radius: 5px;">
          Verify your email
        </a>
        <p style="margin-top: 20px;">Need help, or have questions? Just reply to this email, we'd love to help.</p>
      </div>
    `;

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL, //TODO: change to my domain in future
      to: email,
      subject: "Welcome to our app! We're very excited to have you on board. ",
      html: htmlContent,
    });
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    //TODO add logger here
  }
}

export async function forgatePasswordEmail(
  email: string,
  username: string,
  verificationUrl: string
) {
  try {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hello, ${username}!</h2>
          <p>We received a request to reset your password.</p>
          <p>If you did not request a password reset, please ignore this email. Otherwise, you can reset your password using the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #22BC66; text-decoration: none; border-radius: 5px;">
            Reset Your Password
          </a>
          <p style="margin-top: 20px;">Need help, or have questions? Just reply to this email, we'd love to help.</p>
        </div>
      `;

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL, //TODO: change to my domain in future
      to: email,
      subject: "Password reset request. ",
      html: htmlContent,
    });
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    //TODO add logger here
  }
}
