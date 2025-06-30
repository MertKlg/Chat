import { Socket } from "socket.io";
import ResponseModel from "../../model/error-model";
import { getSocketInstanse } from "../socket-instanse";
import errorCodes from "../../common/error.messages";
import { writeFileToFolderAsync } from "../../../../service/file-service";
import { ChatType } from "../../model/types/chat-type";
import errorMessages from "../../common/error.messages";
import { deleteChatMessage, editChatMessage, getChatMembers, getChatMessages, markMessageAsSeen, sendChatImage, sendChatMessage, checkOneSeemedMessage, getSeemedMessages, getPersonalChats, checkChat, createChat, addChatMember } from "../../model/chat/chat.model";
import { createPersonalChat } from "../helper/chat-helper";


export const sendTextMessageHandler = async (data: any, socket: Socket) => {

  const { user_id } = socket.data.user;
  const { chat_id, message, chat_type } = data;
  const io = getSocketInstanse();

  const ifError = await sendChatMessage({ params: [message, user_id, chat_id] });

  if (ifError.error) {
    socket.emit("send_chat_message_result", new ResponseModel(errorMessages.MESSAGE.MESSAGE_NOT_SENDED, 500));
    return;
  }

  const lastMessage = await getChatMessages({
    params: [
      chat_id,
      user_id,
      null,
      null,
      1
    ]
  })
  if (!lastMessage.data || lastMessage.error) {
    socket.emit("send_chat_message_result", new ResponseModel(errorMessages.MESSAGE.MESSAGE_NOT_SENDED, 500));
    return;
  }

  io.to(chat_id).emit("get_last_chat_message", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, lastMessage.data));

  // Share data by chat types
  // We have 2 chat type PERSONAL and GROUP
  // If user sended a message to personal chat type, CHATTYPE.message case working
  // If chat type have group type working GROUP case
  switch (chat_type) {
    case ChatType.PERSONAL:
      io.to(chat_id).emit("get_chats_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, lastMessage.data))
      break;

    case ChatType.GROUP:
      // get_group_chats_result
      break;

    default:
      break;
  }
};

export const sendImageMessageHandler = async (data: any, socket: Socket) => {
  const io = getSocketInstanse();
  const { chat_id, images } = data;
  const { user_id } = socket.data.user;

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

  var lastMessageData = null;
  if (sendedImageMessages.length > 0) {
    const lastMessageResult = await getChatMessages({ params: [chat_id, user_id, null, null, 1] });
    if (!lastMessageResult.error && lastMessageResult.data && lastMessageResult.data.length > 0) {
      lastMessageData = lastMessageResult.data[0];
    }
  }
  if (lastMessageData) {
    io.to(chat_id).emit("get_last_chat_message", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, [lastMessageData]));
  } else if (sendedImageMessages.length === 0) {
    console.warn(`No messages sent to chat ${chat_id}.`);
  }

  const chatMembersResult = await getChatMembers({ params: [chat_id] });
  if (chatMembersResult.data && !chatMembersResult.error) {
    const chatMemberIds = chatMembersResult.data.map(e => e.user_id);
    io.to(chatMemberIds).emit("get_chats_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, [lastMessageData]));
  } else {
    console.error("Error fetching chat members:", chatMembersResult.error);
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

  socket.emit("send_chat_image_message_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200));
};


export const editChatMessageHandler = async (data: any, socket: Socket) => {
  const { chat_message_id, chat_id, message } = data;
  const io = getSocketInstanse();

  if (!chat_message_id || !chat_id || !message) {
    socket.emit("edit_chat_message_result", new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 400))
    return
  }

  const editMessage = await editChatMessage({ params: [chat_id, chat_message_id, message] });

  if (editMessage.error) {
    socket.emit("edit_chat_message_result", new ResponseModel(errorCodes.MESSAGE.MESSAGE_NOT_SENDED, 400))
    return
  }

  io.to(chat_id).emit("edit_chat_message_result", new ResponseModel(errorCodes.GENERAL.SUCCESS, 200, [{ chat_message_id, message }]));
};

export const deleteChatMessageHandler = async (data: any, socket: Socket) => {
  const { chat_message_id, chat_id } = data;
  const io = getSocketInstanse();

  const deleteMessage = await deleteChatMessage({ params: [chat_id, chat_message_id] });

  if (deleteMessage.error) {
    socket.emit("delete_chat_message_result", new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 400))
    return
  }

  io.to(chat_id).emit("delete_chat_message_result", new ResponseModel(errorCodes.GENERAL.SUCCESS, 200, [{ chat_message_id }]));
};

export const messageSeemedHandler = async (data: any, socket: Socket) => {
  const { chat_message_id, chat_id } = data;
  const { user_id } = socket.data.user;
  const io = getSocketInstanse();

  const lastMessage = await getChatMessages({ params: { user_id, chat_id, undefined, limit: 1 } });

  if (lastMessage.error || !lastMessage.data) {
    return
  }

  if (lastMessage.data[lastMessage.data.length - 1].user_id == user_id) {
    return;
  }

  const seenError = await markMessageAsSeen({ params: { chat_message_id, user_id, chat_id } });
  if (seenError.error) {
    console.log("seen message error ", seenError.error.message)
    return
  }

  const oneSeemedMessage = await checkOneSeemedMessage({ params: { chat_id, chat_message_id } })

  if (oneSeemedMessage.error || !oneSeemedMessage.data) {
    return
  }

  io.to(chat_id).emit("messages_seemed_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, oneSeemedMessage.data));
};

export const getChatMessageHandler = async (data: any, socket: Socket) => {

  const { chat_id } = data;
  const { user_id } = socket.data.user;
  const io = getSocketInstanse();

  const messages = await getChatMessages({ params: [chat_id, user_id, null, null, 30] });

  if (!messages.data || messages.error) {
    socket.emit("get_chat_messages_result", new ResponseModel(errorCodes.GENERAL.SOMETHING_WENT_WRONG, 500))
    return
  }

  await Promise.all(
    messages.data
      .filter((e) => e.user_id != user_id)
      .map(async (e) => {
        const chatMessage = e.chat_message_id
        if (e.chat_message_id) {
          await markMessageAsSeen({ params: [chatMessage, user_id, chat_id] })
        }
      })
  );

  const seemedMessages = await getSeemedMessages(chat_id);

  socket.emit("get_chat_messages_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, messages.data));

  io.to(chat_id).emit("messages_seemed_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, seemedMessages.data));

};

export const createChatHandler = async (data: any, socket: Socket) => {
  // Want to start a chat with this user.
    const { to_user_id } = data;
    const { user_id } = socket.data.user;
    const io = getSocketInstanse();

    const chatList = await checkChat({ params : [user_id, to_user_id] })

    if(chatList.data || chatList.error){
      socket.emit("create_chat_result",new ResponseModel(chatList.error ? chatList.error.message : errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500))
      return
    }

    const createChatResult = await createPersonalChat([user_id, to_user_id])

    if(createChatResult.error){
      socket.emit("create_chat_result",new ResponseModel(createChatResult.error.message, 500))
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
