import admin from "firebase-admin";
import  serviceAccount from "../../../../macho-d09f5-firebase-adminsdk-fbsvc-6fddece00b.json" with {type: "json"};
import User from "#models/users.js";


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

 export const sendChatNotification = async (email, messageBody, sender, data = {}) => {
  try {
    const userData = await User.find({PK: `USER#${email}`});

    const user = userData?.data[0]
    
    if (!user || !user.device_tokens || user.device_tokens.length === 0) {
      console.log(`No fcm tokens found for user: ${email}`);
      return;
    }

    const item = {
      _id: sender?._id,
      name: sender?.name,
      role: sender?.role,
      conversation_id: data?.conversation_id,
      user: {
        id: user.id,
        photo: user.photo,
        name: user.name,
        role: user.role
      }
    }
    
    const message = {
      data: {
        notification_type: 'chat',
        title: 'Chat',
        body: messageBody,
        item: JSON.stringify(item)
      },
      tokens: user?.device_tokens,
      contentAvailable: true,
      priority: 'high',
    }

    await sendPushNotification(message);
  } catch (error) {
    console.error("Error fetching user or sending notifications:", error);
    throw error
  }
};

export const sendPushNotification = async (message) => {
    try {
      message.android ={priority:"high"}
      message.apns =   {payload: { aps: {contentAvailable: true, sound: 'default'}}}

      // console.log(message,"notification message")
      if (message.tokens.length > 0) {
        const res = await admin.messaging().sendEachForMulticast(message);
      }
    } catch (error) {
      console.log("Something wents wrong to send notification", error)
    }
}