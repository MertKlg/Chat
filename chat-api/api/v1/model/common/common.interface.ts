interface BaseResult<T> {
    data? : T,
    error? : Error
}


export interface IResult<T> extends BaseResult<T> {}

export interface IJwt {
  payload : string | Buffer | object,
  subject : string,
  expiresIn : number,
  audience : string,
}


export interface ErrorMessages {
  USERNAME: {
    EMPTY: string;
    LENGTH: string;
    ALREADY_USING: string;
  };
  EMAIL: {
    EMPTY: string;
    ALREADY_USING: string;
    VALIDATE_EMAIL: string;
    NOT_VALIDATED: string;
  };
  PASSWORD: {
    WEAK: string;
    NOT_SAME: string;
    UPDATED: string;
  };
  PHONE: {
    ALREADY_EXISTS: string;
    NOT_VALIDATED: string;
    EMPTY: string;
  };
  AUTH: {
    ACCOUNT_SUCCESSFULLY_CREATED: string;
    USER_NOT_FOUND: string;
    WRONG_PASSWORD: string;
    SUCCESSFULLY_SIGNED_IN: string;
    SUCCESSFULLY_SIGN_OUT: string;
  };

  FRIEND : {
    REQUEST_ALREADY_SENDED : string,
    REQUEST_SENDED : string,
    NEW_REQUEST_GETTED : string,
    SEND_A_NEW_FRIEND_REQUEST : string,
    ACCEPTED_FRIEND_REQUEST : string,
    REJECTED_FRIEND_REQUEST : string,
    UNFRIEND_FRIEND_REQUSET : string
  }

  USER : {
    NOT_FOUNDED : string
  },
  PROFILE : {
    UPDATED : string,
    PROFILE_IMAGE_UPDATED : string,
    PROFILE_IMAGE_MISSING: string
  },

  MESSAGE : {
    MESSAGE_NOT_SENDED : string,
    MESSAGE_SENDED : string,
    MESSAGE_COULD_NOT_UPDATED : string,
    MESSAGE_DELETED : string,
    MESSAGE_UPDATED : string,
    MESSAGE_COULD_NOT_DELETED : string
  },

  TOKEN: {
    MISS: string,
    INVALID : string
  };
  GENERAL: {
    SOMETHING_WENT_WRONG: string;
    UNKNOWN_DEVICE: string;
    SUCCESS: string;
  };
}