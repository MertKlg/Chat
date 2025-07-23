import { ErrorMessages } from "../model/common/common.interface"

const errorMessages: ErrorMessages = {
  USERNAME: {
    EMPTY: "Username cannot be empty",
    LENGTH: "Username must be at least 3 and at most 12",
    ALREADY_USING: "This username already exists",
  },
  EMAIL: {
    EMPTY: "Email cannot be empty",
    ALREADY_USING: "This email already exists",
    VALIDATE_EMAIL: "Email cannot be validated, send a validated email",
    NOT_VALIDATED: "Email not validated",
  },
  PASSWORD: {
    WEAK: "The password must contain 6 characters, 1 lower case letter, 1 upper case letter, 1 number and 1 symbol",
    NOT_SAME: "Passwords are not the same",
    UPDATED: "Your password successfully updated",
  },
  PHONE: {
    ALREADY_EXISTS: "That phone number already exists",
    NOT_VALIDATED: "This phone number not validated",
    EMPTY: "Phone number empty",
  },
  AUTH: {
    ACCOUNT_SUCCESSFULLY_CREATED: "Your account successfully created",
    USER_NOT_FOUND: "User not found",
    WRONG_PASSWORD: "Wrong password",
    SUCCESSFULLY_SIGNED_IN: "Successfully signed in",
    SUCCESSFULLY_SIGN_OUT: "Successfully signed out",
  },
  USER : {
    NOT_FOUNDED : "User not founded"
  },
  FRIEND : {
    REQUEST_ALREADY_SENDED : "Request already sended",
    REQUEST_SENDED : "Request sended",
    NEW_REQUEST_GETTED : "New friend request gotted",
    SEND_A_NEW_FRIEND_REQUEST : "Send a new friend request",
    ACCEPTED_FRIEND_REQUEST : "Accepted your friend request",
    REJECTED_FRIEND_REQUEST : "Rejected your friend request",
    UNFRIEND_FRIEND_REQUSET : "Unfriended"
  },
  PROFILE : {
    UPDATED : "Profile updated",
    PROFILE_IMAGE_UPDATED : "Profile image updated",
    PROFILE_IMAGE_MISSING : "Profile image missing"
  },

  MESSAGE : {
    MESSAGE_NOT_SENDED : "Your message could not be sent. Please try again",
    MESSAGE_SENDED : "Your message successfully sent",
    MESSAGE_COULD_NOT_UPDATED : "Your message could not be updated",
    MESSAGE_DELETED : "Your message successfully deleted",
    MESSAGE_UPDATED : "Your message successfully updated",
    MESSAGE_COULD_NOT_DELETED : "Your message could not be deleted"
  },
  TOKEN: {
    MISS: "Token expired",
    INVALID : "Invalid Token"
  },
  GENERAL: {
    SOMETHING_WENT_WRONG: "Something went wrong",
    UNKNOWN_DEVICE: "No device or browser information found",
    SUCCESS: "Success",
  },
};

export default errorMessages