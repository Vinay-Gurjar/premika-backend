
import crypto from "crypto";
import { DeNormalizationUser, getUserById, updateUserSubscriptionDetails } from "../helpers/users.js";
import Razorpay from "razorpay";
import { denormalizePlan, getPlanById } from "../helpers/plan.js";
import { entity } from "#entities/entities.js";
import { dateNow, getDataFromResponse } from "#application/application.js";
import { createOrUpdateActivePlan, updateUserActivePlan } from "../helpers/activePlan.js";
import Transaction from "#models/transactions.js";
import { convertToRedisDataString, publish } from "#sockets/redis/subscriberHandler.js";
import { addUserPrefix } from "#sockets/indexHelper.js";
import User from "#models/users.js";

export const handleSignature = (req) => {
  const secret = process.env.CREDENTIALS_KEY;

  if (!secret) throw new Error("Missing credentials key");

  const receivedSignature = req.headers["x-razorpay-signature"];
  const body = req.body;

  if (!body || typeof body !== "object") {
    throw new Error("Invalid body");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  const valid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedSignature || "", "utf8")
  );

  if (!valid) {
    throw new Error("Invalid signature");
  }

  return true;
};


export const sendWebhookSuccess = (res) => {
  return res.status(200).json({ status: "ok"});
}

export const getTransactionUser = async (notes) => {
  return await getUserById(notes?.user.id)
}

export const addTransactionDetails = async (data) => {
  try {
    const {
      userId,
      planId,
      razorpayPlanId,
      paymentId,
      amount,
      invoiceId,
      paymentMethod,
      customerId,
      status,
      payTokenId,
      error_description
    } = data;

    const currUser = await getUserById(userId);
    if (!currUser) throw new Error("Invalid User ID or User not found");

    const transactionItem = {
      SK: dateNow(),
      user: DeNormalizationUser(currUser),
      user_id: currUser.id,
      amount,
      payment_id: paymentId,
      payment_method: paymentMethod,
      customer_id: customerId,
      invoice_id: invoiceId,
      pay_token_id: payTokenId,
      razorpay_plan_id: razorpayPlanId,
      payment_status: status,
    };


    const planData = await getPlanById(planId);
    const plan = getDataFromResponse(planData);
    transactionItem.plan = denormalizePlan(plan);
    transactionItem.plan_id = plan.id;

    if (status === "failed") {
      transactionItem.error_description = error_description || "Payment failed";
    }

    await Transaction.create(transactionItem);

    if (status === "captured") {
      await User.findAndUpdate(
        { PK: currUser.PK },
        { subscription_status: "authenticated", subscription_status_change_date: dateNow() }
      );
    }

    const redisData = convertToRedisDataString(
      "PAYMENT_STATUS",
      addUserPrefix(currUser.id),
      {
        status: status === "captured",
        user_id: currUser.id,
      }
    );

    await publish("payment", redisData);

    console.log(`✅ Transaction recorded for user ${currUser.id}, status: ${status}`);

  } catch (err) {
    console.error("❌ Error in addTransactionDetails:", err, data);
  }
};




export const handleActivePlanDetails = async (userId, subscription_status, subscriptionDetails) => {
  console.log(userId, subscription_status, subscriptionDetails,"userId, subscription_status, subscriptionDetails")
    const updates = {subscription_status, subscription_status_change_date: dateNow()}
    if (subscriptionDetails) updates.subscription_details = subscriptionDetails 
    await updateUserActivePlan(userId, updates)
    await updateUserSubscriptionDetails(userId, updates)
}

export const handleSubscriptionCommonEvents = async (
  userId,
  subscription_status,
  subscriptionDetails
) => {
  const user = await getUserById(userId);

  await createOrUpdateActivePlan(user, subscription_status, {
    ...subscriptionDetails,
    subscription_details: subscriptionDetails,
  });

  await updateUserSubscriptionDetails(userId, {
    subscription_status,
    subscription_details: subscriptionDetails,
  });

};

