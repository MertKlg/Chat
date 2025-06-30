interface IBaseChat {
    chat_id : string,
    message : string,
    chat_type : ChatType
}

type ChatType = "TEXT" | "IMAGE"

export interface IChatId{
  chat_id : string
}

export interface IChatUser {
    username : string,
    photo : string,
    user_id : string,
}

export interface IChat extends IBaseChat, IChatUser{}

export interface IChatMessage extends IBaseChat, IChatUser {
  chat_message_id: string;
  sended_at: string;
  chat_image: string
}

export interface IChatSeemed {
  id: string;
  chat_message_id: string;
  user_id: string;
  chat_id: string;
}

export interface IChatCreated {
  chat_id : string
}

export interface IChatSeemed extends IChatUser{
    seemed_at : string,
    chat_message_id : string
}