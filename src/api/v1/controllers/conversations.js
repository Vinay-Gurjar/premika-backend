import {
  cleanModelData,
  sendResponse,
} from "#application/application.js";
import {
  addConversation,
  getConversationById,
  getConversationMessages,
  getConversationsList,
} from "../helpers/conversations.js";
import { getUserById } from "../helpers/users.js";

export const createConversation = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      throw new Error("User ID is required to create a conversation");
    }

    const anotherUser = await getUserById(user_id);

    if (!anotherUser) {
      throw new Error("User not found");
    }

    const conversation = await addConversation(req.user, anotherUser);
    sendResponse(true, res, conversation, "Conversation created successfully");
  } catch (error) {
    console.error("Error creating conversation:", error);
    sendResponse(
      false,
      res,
      null,
      error.message || "Error creating conversation"
    );
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await getConversationsList(req.query, req.user);
    return sendResponse(
      true,
      res,
      conversations,
      "Conversations fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return sendResponse(
      false,
      res,
      null,
      error.message || "Error fetching conversations"
    );
  }
};

export const getPaginatedChats = async (req, res) => {
  try {
    const {conversation_id} = req.query
    const conversation = await getConversationById(conversation_id);
    if (!conversation) throw new Error("Invalid Conversation ID");
    const messageData = await getConversationMessages(req.query)

    const messages = messageData?.data || []
    const messageObjects = []

    messages.forEach((mesageModel) => {
     const message = cleanModelData(mesageModel)
     messageObjects.push(message)
    })

    const responseData = {
      messages: messageObjects,
      last_key: messageData?.LastEvaluatedKey
    };
    sendResponse(true, res, responseData, "Successfully fetched paginated chats")
  } catch (error) {
    console.log("ERROR", error)
    sendResponse(false,res, error.message, "Somethinf went wrong to fetched messages")
  }
};
