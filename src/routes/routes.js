import { Router } from "express";
import fileUpload from "express-fileupload";
const router = Router();

import routes from "./routePaths.js";
import { sendOtp, submitOtp, logout, siginin, passwordLogin } from "#api/v1/controllers/session.js";

import authorize from "#middlewares/authorize.js";
import authenticate from "#middlewares/authenticate.js";
import checkActivateStatus from "#middlewares/checkActivateStatus.js";
import { getUsers, updateUser, deleteUser, restoreUser, getRegisrationStage, consultantRegistration, deleteAccount, addDeviceToken, selfDeactivateAccount, skipRegistration, checkUser, handleUserLocation, fetchUsersByLocation, } from "#api/v1/controllers/users.js";
import { createConversation, getConversations, getPaginatedChats } from "#api/v1/controllers/conversations.js";
import { creteCredentials, getCredentials,getCredential, updateCredentials } from "#api/v1/controllers/credentials.js";
import { createPlan, deletePlan, getAllPlans, getSubscriptionPlans } from "#api/v1/controllers/plan.js";
import { addTransaction, getAllTransactions } from "#api/v1/controllers/transaction.js";
import { createSubscription } from "#api/v1/controllers/razorpay.js";
import { fileUploader } from "#application/uploadFile.js";
import { razorpayWebhooks } from "../api/v1/webhooks/payments.js";


const handlers = {
 sendOtp,
 submitOtp,
 updateUser,
 getUsers,
 deleteUser,
 restoreUser,
 logout,
 createConversation,
 getConversations,
 getPaginatedChats,
 creteCredentials,
 getCredentials,
 updateCredentials,
 siginin,
 createPlan,
 getAllPlans,
 getRegisrationStage,
 addTransaction,
 getAllTransactions,
 getSubscriptionPlans,
 deleteAccount,
 addDeviceToken,
 consultantRegistration,
 passwordLogin,
  selfDeactivateAccount,
 createSubscription,
 getCredential,
 deletePlan,
 skipRegistration,
 checkUser,
 handleUserLocation,
 fileUploader,
 razorpayWebhooks,
 fetchUsersByLocation
};

const setupRoutes = (routeConfig) => {
  Object.keys(routeConfig).forEach((routeGroup) => {
    routeConfig[routeGroup].forEach((route) => {
      const middlewares = [handlers[route.handler]];
      const byPassRoute = [
        "siginin",
        "sendOtp",
        "submitOtp",
        "deleteUser",
        "restoreUser",
        "passwordLogin",
        "getSubscriptionPlans",
        "razorpayWebhooks"
      ];
      const fileRoutes = [
        "fileUploader"
      ];

      if (!byPassRoute.includes(route.handler) && routeGroup !== "admin_app" ) {
        middlewares.unshift(
          authenticate,
          authorize(route.handler),
          checkActivateStatus
        ); 
      }

      if (fileRoutes.includes(route.handler)) {
        middlewares.unshift(
          fileUpload({
            useTempFiles: true,
            tempFileDir: "/tmp/",
            limits: { fileSize: 50 * 1024 * 1024 },
          })
        );
      }
      router[route.method](`/api/v1/${routeGroup}/${route.path}`, ...middlewares);
    });
  });
};

setupRoutes(routes);

export default router;

