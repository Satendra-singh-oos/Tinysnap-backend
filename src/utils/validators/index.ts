import { z } from "zod";
import { UserRolesEnum } from "../../constant";

export const registerUserValidation = z.object({
  username: z
    .string()
    .min(3, "User Name Must be minimum of 3 characters")
    .max(20, "User name Must be less then 20 characters")
    .regex(
      /^[a-zA-Z\s-]+$/,
      "Name can only contain letters, spaces, and hyphens"
    ),
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const loginUserValidation = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password Not As We Created "
    ),
});

export const forgatePasswordValidation = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

export const resetForgottoenPasswordValidation = z.object({
  newPassword: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const changeCurrentPasswordValidation = z.object({
  oldPassword: z
    .string({
      required_error: "Old Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password Not As We Created "
    ),
  newPassword: z
    .string({
      required_error: "New Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const userRoleValidation = z.object({
  role: z.enum(["ADMIN", "USER", "INFLUENCER"]),
});
