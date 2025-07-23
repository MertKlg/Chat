import { Socket } from "socket.io";
import ResponseModel from "../../model/error-model";
import { getSocketInstanse } from "../socket-instanse";
import errorCodes from "../../common/error.messages";
import { writeFileToFolderAsync } from "../../../../service/file-service";
import { ChatType } from "../../model/types/chat-type";
import errorMessages from "../../common/error.messages";
import { deleteChatMessage, editChatMessage, getChatMembers, getChatMessages, markMessageAsSeen, sendChatImage, sendChatMessage, checkOneSeemedMessage, getSeemedMessages, getPersonalChats, checkChat, createChat, addChatMember, getChatMessage } from "../../model/chat/chat.model";
import { createPersonalChat } from "../../helper/chat-helper";
import { deleteStorageFileAsync } from "../../common/file";
import { generateUUID } from "../../common/uuid";


export const sendTextMessageHandler = async (data: any, socket: Socket) => {

  const { user_id, username, photo } = socket.data.user;
  const { chat_id, message, chat_type } = data;
  const io = getSocketInstanse();

  
  const generateChatMessageId = generateUUID();

  const ifError = await sendChatMessage({ params: [generateChatMessageId,message, user_id, chat_id] });

  if (ifError.error) {
    socket.emit("send_chat_message_result", new ResponseModel(errorMessages.MESSAGE.MESSAGE_NOT_SENDED, 500));
    return;
  }

  socket.emit("send_chat_message_result", new ResponseModel(errorCodes.MESSAGE.MESSAGE_SENDED, 200))
  io.to(chat_id).emit("get_last_chat_message", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, [{ user_id, username, photo, message, sended_at: new Date(), chat_message_id : generateChatMessageId }]));
};

export const sendImageMessageHandler = async (data: any, socket: Socket) => {
  const io = getSocketInstanse();
  const { chat_id, images, chat_type, } = data;
  const { user_id, username, photo } = socket.data.user;

  const imgs = images as string[];

  if (imgs.length <= 0) {
    socket.emit("send_chat_image_message_result", new ResponseModel("No any image founded", 400))
    return
  }

  const imageFilesResult = await writeFileToFolderAsync(chat_id, imgs);

  if (imageFilesResult.status !== 200 || !imageFilesResult.files) {
    socket.emit("send_chat_image_message_result", new ResponseModel(imageFilesResult.message, imageFilesResult.status));
    return;
  }

  const sendedImageMessages: string[] = []
  const failedImageMessages: string[] = []

  await Promise.all(
    imageFilesResult.files.map(async (fileStatus) => {
      if (!fileStatus.status) {
        failedImageMessages.push(fileStatus.fileName);
      } else {
        try {
          const result = await sendChatImage({ params: [fileStatus.fileName, "Image", user_id, chat_id] })
          if (result.error) {
            failedImageMessages.push(`Failed to save image to DB: ${fileStatus.fileName} - ${result.error.message}`);
          } else {
            sendedImageMessages.push(fileStatus.fileName)
          }
        } catch (e) {
          failedImageMessages.push(`Unexpected error saving image to DB: ${fileStatus.fileName}`);
        }
      }
    })
  );


  if (sendedImageMessages.length > 0) {
    socket.emit("send_chat_image_message_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200));
    io.to(chat_id).emit("get_chats_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, [{ user_id, username, message: "Image", photo, chat_id, chat_type }]))
    io.to(chat_id).emit("get_last_chat_message", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, [{ user_id, username, message: "Image", photo, chat_id, chat_type, chat_image: sendedImageMessages, sended_at: new Date() }]));
  }

  if (failedImageMessages.length > 0) {
    socket.emit("send_chat_image_message_result",
      new ResponseModel(
        `Some images failed to send: ${failedImageMessages.join(', ')}`,
        400,
        [
          {
            succeeded: sendedImageMessages,
            failed: failedImageMessages
          }
        ]
      )
    );
  } else {
    socket.emit("send_chat_image_message_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200));
  }

};


export const editChatMessageHandler = async (data: any, socket: Socket) => {
  const { chat_message_id, chat_id, message,chat_type } = data;
  const io = getSocketInstanse();

  if (!chat_message_id || !chat_id || !message) {
    socket.emit("edit_chat_message_result", new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 400))
    return
  }

  const editMessage = await editChatMessage({ params: [message, chat_id, chat_message_id] });

  if (editMessage.error) {
    socket.emit("edit_chat_message_result", new ResponseModel(errorCodes.MESSAGE.MESSAGE_COULD_NOT_UPDATED, 400))
    return
  }

  io.to(chat_id).emit("edit_chat_message_result", new ResponseModel(errorCodes.MESSAGE.MESSAGE_UPDATED, 200, [{ chat_message_id, message }]));
  
};

export const deleteChatMessageHandler = async (data: any, socket: Socket) => {
  const { chat_message_id, chat_id } = data;
  const io = getSocketInstanse();

  const getMessage = await getChatMessage({ params: [chat_id, chat_message_id] })

  if (getMessage.error || !getMessage.data) {
    socket.emit("delete_chat_message_result", new ResponseModel(errorMessages.MESSAGE.MESSAGE_COULD_NOT_DELETED, 400))
    return
  }

  if (getMessage.data.chat_image) {
    const fileResult = await deleteStorageFileAsync(getMessage.data.chat_image)
    if (fileResult.error) {
      socket.emit("delete_chat_message_result", new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 400))
      return
    }
  }

  const deleteMessage = await deleteChatMessage({ params: [chat_id, chat_message_id] });

  if (deleteMessage.error) {
    socket.emit("delete_chat_message_result", new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 400))
    return
  }
  io.to(chat_id).emit("delete_chat_message_result", new ResponseModel(errorCodes.GENERAL.SUCCESS, 200, [{ chat_message_id }]));
};

export const getChatMessageHandler = async (data: any, socket: Socket) => {
  const { chat_id } = data;
  const { user_id } = socket.data.user;
  const io = getSocketInstanse();

  // Mesajları çekiyoruz
  const messages = await getChatMessages({ params: [chat_id, user_id, null, null, 30] });

  if (messages.error || !messages.data) {
    socket.emit("get_chat_messages_result", new ResponseModel(errorCodes.GENERAL.SOMETHING_WENT_WRONG, 500));
    return;
  }

  socket.emit("get_chat_messages_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, messages.data));
};


export const createChatHandler = async (data: any, socket: Socket) => {
  // Want to start a chat with this user.
  const { to_user_id } = data;
  const { user_id } = socket.data.user;
  const io = getSocketInstanse();

  const chatList = await checkChat({ params: [user_id, to_user_id] })

  if (chatList.data || chatList.error) {
    socket.emit("create_chat_result", new ResponseModel(chatList.error ? chatList.error.message : errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500))
    return
  }

  const createChatResult = await createPersonalChat([user_id, to_user_id])

  if (createChatResult.error) {
    socket.emit("create_chat_result", new ResponseModel(createChatResult.error.message, 500))
    return
  }

  socket.emit("create_chat_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200))
  socket.to(to_user_id).emit("create_chat_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200))

};

export const getChatsHandler = async (data: any, socket: Socket) => {
  const { user_id } = socket.data.user;

  const getChat = await getPersonalChats({ params: [user_id, user_id] });

  if (!getChat.data || getChat.error) {
    socket.emit("get_chats_result", new ResponseModel(getChat.error?.message ?? "No chats founded", 500))
    return
  }

  socket.emit("get_chats_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, getChat.data));
};
