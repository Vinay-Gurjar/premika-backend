import { entity } from "../../../entities/entities.js";
import { getConversationById } from "#api/v1/helpers/conversations.js";
import { getUserActiveSubscription, getUserById } from "#api/v1/helpers/users.js";
import { dateNow, getDataFromResponse, toBoolean } from "#application/application.js";
import checkActivateStatus from "#middlewares/checkActivateStatus.js";
import { Conversation, Message } from "#models/conversation.js";
import { addConvoPrefix, addUserPrefix, sendErrorEvent } from "#sockets/indexHelper.js";
import {  flashData } from "#sockets/redis/subscriberHandler.js";
import { socketEmitter } from "#sockets/socketListner/socketListner.js";
import { sendChatNotification } from "#api/v1/controllers/pushNotifications.js";


export const createSubscriptionHandler = async (type, socket, ids) => {
  try {
    if (!Array.isArray(ids)) {
         return sendErrorEvent(socket, {
        code: "INVALID_INPUT",
        message: `Expected array of ${type} IDs`,
      })
    }

    const processedIds = ids
      .map((id) => id?.toString().trim())
      .filter((id) => id);

    const userId = socket.user?.id;
    if (!userId) {
      return sendErrorEvent(socket, {
        code: "UNAUTHORIZED",
        message: "User ID missing in socket context",
      });
    }

    const failedIds = [];
    const successfulIds = [];

    for (const id of processedIds) {
      try {
        if (type === "Users") {
          socket.join(addUserPrefix(id));
        } else if (type === "Conversations") {
          socket.join(addConvoPrefix(id));
        }
        successfulIds.push(addConvoPrefix(id));
      } catch (error) {
        console.error(`Failed to subscribe to ${type} ${id}:`, error);
        failedIds.push(id);
      }
    }
  } catch (error) {
    console.error(`Subscription error (${type}):`, error);
          return sendErrorEvent(socket, {
      code: "SUBSCRIPTION_ERROR",
      message: `Failed to process ${type} subscriptions`,
    });
  }
}

export const sendMessage = async (data, socket) => {
  try {
    const {conversation_id, type, content} = data
    if (!content || !type || !content) {
      return sendErrorEvent(socket, "Invalid Params");
    }

    const user = await getUserById(socket.user.id);

    if (!toBoolean(user?.activate)) {
        sendErrorEvent(socket,'invalid user')
      await checkActivateStatus({ user });
      return;
    }

    const conversationData = await getConversationById(conversation_id);
    const conversation = getDataFromResponse(conversationData)
    if (!conversation) {
        sendErrorEvent(socket,'Conversation not found')
      return;
    }

    const usersIds = conversation.user_ids;

    if (!usersIds.includes(user.id)) throw new Error("Invalid Conversation Id");

    const hasSubscription = await getUserActiveSubscription(user);

    if (hasSubscription) {

      if (type === "AUDIO") {
        content = await handleAudioMessage(content, user);
      }

      const message = {
        PK: `${entity.MESSAGE}#${conversation_id}`,
        SK: `MSG#${dateNow()}`,
        sender_id: user.id,
        conversation_id,
        type,
        user_ids: conversation.user_ids,
        content,
      };

      const newMessage = await Message.create(message);

      if (!newMessage) throw new Error("Something went wrong to send message");

      const otherParticipant = conversation.users.find((usr) => usr.id !== user.id)
      await sendChatNotification(
        otherParticipant?.email, 
        `${user.name}: sent you a message: ${content}`,
         user,
         {conversation_id: conversation.id}
        )
      await flashMessageToRedis(newMessage, conversation_id);

      // const participantId = socket.isUser
      //   ? conversation.consultant_id
      //   : conversation.user_id;

      // await sendChatNotification(
      //   participantId,
      //   `${user.name} ${
      //     newMessage?.type === "AUDIO"
      //       ? "sent an audio"
      //       : `sent you a message: ${content}`
      //   }`,
      //   user,
      //   { conversation_id }
      // );
    } else {
      return sendErrorEvent(socket, "Your Subscription is expired");
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return sendErrorEvent(socket,"Failed to send message")
  }
};



export const flashMessageToRedis = async (message, conversation_id) => {
    const messageData = {
    message: {
      content: message.content,
      id: message.id,
      is_delivered: message.is_delivered,
      is_seen: message.is_seen,
      sender_id: message.sender_id,
      type: message.type,
      created_at: message?.created_at,
      PK: message.PK,
      SK: message.SK,
    },
    conversationId: conversation_id,
  }

    await flashData(socketEmitter.NEW_MESSAGE, addConvoPrefix(conversation_id), {...messageData}, 'chat')
};

export const handleTypingStatus = async (data, socket) => {
  try {
    const { conversation_id, is_typing} = data;

    await flashData(
      socketEmitter.TYPING_STATUS,
      addConvoPrefix(conversation_id),
      {
        conversation_id,
        user_id: socket.user.id,
        is_typing,
      },
      "chat"
    );

  } catch (error) {
    console.log(error);
    return sendErrorEvent(
      socket,
      error.message || "something went wrong to send message"
    );
  }
};



export const handleMessageSeen = async (data, socket) => {
  try {
    const { conversation_id, message_id } = data;
    const {data: messageData} = await Message.find({
      PK: `${entity.MESSAGE}#${conversation_id}`,
      id: message_id,
    });
    const message = messageData[0]
    
    if (message) {
    message.is_seen = true;
    await message.save();
    await flashData(socketEmitter.MESSAGE_SEEN, addConvoPrefix(conversation_id),  {
          message_id: message.id,
          conversation_id,
          userId: socket.user.id,
        }, 'chat')  
    } else {
      return sendErrorEvent(socket, "Invalid Conversation id or Message id");
    }
  } catch (error) {
    sendErrorEvent(error.message)
  }
};


export const handleGetUserStatus = async (id, socket) => {
  try {
    if (!id) return
    const user = await getUserById(id);
    if (user) {
      socket.emit(socketEmitter.USER_LIVE_STATUS, {
        id: user.id,
        is_online: user.is_online,
        last_seen: user.last_seen,
      });
    } else {
      sendErrorEvent(socket,"User not found")
    }
  } catch (error) {
    console.error("Error fetching user status:", error);
     sendErrorEvent(socket,"An error occurred while fetching user status")
  }
};

export const handleEnterExitChat = async (data, socket) => {
  try {
    const {id, type} = data
    const {user} = socket

    const conversationData = await Conversation.find({PK:`${entity.CONVERSATION}#${id}`});
    const conversation = getDataFromResponse(conversationData)

    if (!conversation) {
       return sendErrorEvent(socket, "Invalid conversation id")
    }
    let activeMembers = conversation.active_members || [];
    
    if (type === 'exit') {
        if (!activeMembers.includes(user.id)) return
         activeMembers = activeMembers.filter(item => item !== user.id);
    }

    if (type === 'enter') {
        if (activeMembers.includes(user.id)) return
         activeMembers.push(user.id);
    }    
    conversation.active_members = activeMembers
    conversation.save()
  } catch (error) {
    sendErrorEvent(socket, error?.message || "Something went wrong while adding user to conversation")
  }
};



export const handleBroadcastmessage = async (data, socket) => {
      try {
        const {conversation_ids, type, content} = data
        if (!conversation_ids || conversation_ids?.length === 0) {
          throw new Error("Invalid ids array");
        }

        conversation_ids.forEach(async (conversation_id) => {
            await sendMessage({conversation_id, type, content},socket)
        });
      } catch (error) {
       return sendErrorEvent(socket, "Somthing went wrong to broadcast message")
      }
}