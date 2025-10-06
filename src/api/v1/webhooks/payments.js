import {
  addTransactionDetails,
  handleActivePlanDetails,
  handleSubscriptionCommonEvents,
  handleSignature,
  sendWebhookSuccess,
} from "./helper.js";
import path from "path";
import fs from "fs";
import { denormalizePlan, getPlanById } from "../helpers/plan.js";
import { getDataFromResponse } from "#application/application.js";


export const razorpayWebhooks = async (req, res) => {
  try {
    res.status(200).json({ status: "ok"});
    // saveWebhookResponse(req.body);
    handleSignature(req);

    const { event, payload } = req.body;

    (async () => {
      try {
        switch (event) {
          case "subscription.charged":
          case "subscription.authenticated":
          case "subscription.resumed":
            await handleSubscriptionCommon(payload, event);
            break;

          case "payment.captured": // done
          case "payment.failed": //  done
            await handlePaymentTransaction(payload, event);
            break;

          case "subscription.pending":
          case "subscription.paused":
          case "subscription.halted":
          case "subscription.cancelled":
            await handleSubscriptionEvent(payload, event);
            break;

          default:
            console.log(`⚠️ Unhandled event type: ${event}`);
        }
      } catch (err) {
        console.error(`❌ Error handling ${event}:`, err);
      }
    })();

  } catch (error) {
    console.error("❌ Razorpay webhook error:", error);
  }
};

export const handlePaymentTransaction = async (payload) => {
  try {
    const paymentEntity = payload?.payment?.entity;
    if (!paymentEntity) throw new Error("Invalid payment entity");

    const {
      id: paymentId,
      amount,
      method,
      invoice_id,
      order_id: paymentOrderId,
      token_id: payTokenId,
      status,
      error_description,
      customer_id,
      notes
    } = paymentEntity;

    const { pid: planId, uid: userId, rpi: razorpayPlanId } = notes || {};

    // 🔹 Common transaction data
    const transactionData = {
      userId,
      planId,
      razorpayPlanId,
      customerId: customer_id,
      status: status?.toLowerCase() || "failed",
      paymentId,
      paymentOrderId,
      amount: amount ? amount / 100 : 0,
      invoiceId: invoice_id,
      paymentMethod: method,
      payTokenId,
      error_description,
    };

    // 🔹 Call addTransactionDetails
    await addTransactionDetails(transactionData);

    console.log(`✅ Payment processed: ${paymentId}, status: ${status}`);

  } catch (error) {
    console.error("❌ Error in handlePaymentTransaction:", error);
  }
};



const handleSubscriptionEvent = async (payload, eventType) => {
  try {
    const sub = payload?.subscription?.entity;
    const { notes, status } = sub || {};
    
    const userId = notes?.uid;

    const isCancelledOrHalted = [
      "subscription.halted",
      "subscription.cancelled",
    ].includes(eventType);

    await handleActivePlanDetails(
      userId,
      isCancelledOrHalted ? 'cancelled' : status,
      isCancelledOrHalted ? {} : undefined
    );

    switch (eventType) {
      case "subscription.pending":
        console.log(`⏳ Subscription pending for user: ${userId}`);
        break;
      case "subscription.paused":
        console.log(
          `⏸️ Subscription paused for user: ${userId}. Access will end soon.`
        );
        break;
      case "subscription.halted":
      case "subscription.cancelled":
        console.log(
          `🛑 Subscription halted/cancelled. Access revoked for user: ${userId}`
        );
        break;
      default:
        console.log(`ℹ️ Subscription event: ${eventType} for user: ${userId}`);
    }
  } catch (error) {
    console.error(`Error handling ${eventType}:`, error);
  }
};



const handleSubscriptionCommon = async (payload, type) => {
  try {
    const subscriptionEntity = payload?.subscription?.entity;
    const {
      id: subscriptionId,
      notes,
      customer_id,
      start_at,
      charge_at,
      end_at,
      status
    } = subscriptionEntity;

    const { pid: planId, uid: userId, rpi: razorpay_plan_id } = notes;

    const planData = await getPlanById(planId);
    const plan = getDataFromResponse(planData)

    const subscriptionDetails = {
      plan_id: planId,
      plan: denormalizePlan(plan),
      razorpay_plan_id,
      start_at,
      end_at,
      next_pay_date: charge_at,
      customer_id,
      subscription_id: subscriptionId,
    };

     await handleSubscriptionCommonEvents(userId, status, subscriptionDetails);
     console.log("AUTHENTICATED")
  } catch (error) {
    console.error(`Error handling subscription ${type}:`, error);
  }
};



const saveWebhookResponse = (data) => {
  try {
    const webhookData = data;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    const filePath = path.join(
      logsDir,
      `webhook-${data.event}${timestamp}.json`
    );

    fs.writeFileSync(filePath, JSON.stringify(webhookData, null, 2));

    console.log(`Webhook response saved to: ${filePath}`);
  } catch (error) {
    console.error("Error saving webhook response:", error.message);
  }
};

