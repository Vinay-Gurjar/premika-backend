import { cleanModelData, cleanModelResponseData, getDataFromResponse } from "#application/application.js";
import { Conversation, Message } from "#models/conversation.js";
import GSI_ENTITY_ID from "#models/GSI_ID_ENTITY.js";
import { entity } from "../../../entities/entities.js";
import { DeNormalizationUser } from "./users.js";


export const addConversation = async (user, anotherUser) => {
  try {

    if (!user || !anotherUser) {
      throw new Error('User not found');
    }

    const conversation = await GSI_ENTITY_ID.find({PK: entity.CONVERSATION, user_ids:`containsArray:-${[anotherUser?.id, user.id]}`});

    if (conversation?.data?.length > 0) {
      return getDataFromResponse(conversation);
    }
    const convo  = {
      user_ids: [user.id, anotherUser.id],
      users: [DeNormalizationUser(user), DeNormalizationUser(anotherUser)]
    }

    const newConversation = await Conversation.create(convo);
    return cleanModelData(newConversation)
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Error creating conversation');
  }
}


export const getConversationsList = async (options, user) => {
  try {
    const { limit = 20, ...rest } = options;
    
    const params = {
      PK: entity.CONVERSATION,
      user_ids: `containsArray:-${[user.id]}`,
      ...rest,
    };

    const conversationsData = await GSI_ENTITY_ID.find(params, Number(limit));
    if (conversationsData?.data && conversationsData.data.length > 0) {
      const updatedConversations = await Promise.all(
        conversationsData.data.map(async (convo) => {
          const messagedata = await Message.find(
            { PK: `${entity.MESSAGE}#${convo.id}`, ScanIndexForward: true },
            1
          );

          if (messagedata) {
            convo.last_message = cleanModelResponseData(messagedata) || {};
          }
          return convo;
        })
      );

      return {
        data: updatedConversations,
        LastEvaluatedKey: conversationsData.LastEvaluatedKey,
      };
    }

  } catch (error) {
    console.error("Error fetching Conversations:", error);
    throw new Error("Error fetching Conversations");
  }
}


export const getConversationsByUserId = async (userId) => {
  try {
    const conversations = await GSI_ENTITY_ID.find({ user_ids: `contains:-${userId}`, PK: entity.CONVERSATION });
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations by user ID:', error);
    throw new Error('Error fetching conversations');
  }
}
  

export const getConversationById = async (id) => {
  return await GSI_ENTITY_ID.find({ SK: id, PK: entity.CONVERSATION });
}


export const getMessageById = async (id) => {
  return await GSI_ENTITY_ID.find({ SK: id, PK: entity.MESSAGE});
};

export const getConversationMessages = async (filters) => {
    if(!filters.start_key || filters.start_key === "undefined" || filters.start_key === "null"){
      filters.start_key = null
    }
    const {conversation_id, limit = 25, ...rest} = filters
     return await Message.find({PK: `${entity.MESSAGE}#${conversation_id}`, ...rest, ScanIndexForward: true}, limit)
}