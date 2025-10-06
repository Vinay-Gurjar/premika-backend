// not assigned complaint methods

export default {
  session: [
    { method: "post", path: "send_otp", handler: "sendOtp" },
    { method: "post", path: "submit_otp", handler: "submitOtp" },
    { method: "post", path: "logout", handler: "logout" },
    { method: "post", path: "sign_in", handler: "siginin"},
    { method: "post", path: "login", handler: "passwordLogin"}
  ],

  application: [
    { method: 'post', path: 'upload_file', handler: 'fileUploader'}
  ],

  user: [
    { method: "post", path: "update_user", handler: "updateUser" },
    { method: "get", path: "get_users", handler: "fetchUsersByLocation" },
    { method: "post", path: "delete_user", handler: "deleteUser" },
    { method: "post", path: "restore_user", handler: "restoreUser" },
    { method: 'post', path: "registration", handler: "consultantRegistration"},
    { method: 'post', path: 'delete_account', handler: "deleteAccount"},
    { method: 'post', path: 'add_device_token', handler: 'addDeviceToken'},
    { method: 'get', path: 'get_registration_stage', handler: 'getRegisrationStage'},
    { method: 'post', path: 'deactivate_account', handler: 'selfDeactivateAccount'},
    { method: 'post', path: 'skip_registration', handler: 'skipRegistration'},
    { method: 'get', path: 'check_user', handler: 'checkUser'},
    { method: 'post', path: 'add_location', handler: 'handleUserLocation'}
  ],

  
  conversation: [
    { method: "post", path: "create", handler: "createConversation" },
    { method: "get", path: "list", handler: "getConversations" },
    { method: "get", path: "get_messages", handler: "getPaginatedChats" },
  ],

  plan: [
    { method: 'get', path: 'list', handler: 'getAllPlans' },
    { method: 'post', path: 'create', handler: "createPlan"},
    { method: 'get', path: 'subscriptions_list', handler: 'getSubscriptionPlans'},
    { method: 'delete', path: 'delete', handler: 'deletePlan'}
  ],

  transaction: [
    { method: 'get', path: 'list', handler: 'getAllTransactions'},
    { method: 'post', path: 'add', handler: 'addTransaction'}
  ],

  credentials: [
    { method: "post", path: "create", handler: "creteCredentials" },
    { method: "get", path: "list", handler: "getCredentials" },
    { method: "get", path: "details", handler: "getCredential" },
    { method: "post", path: "update", handler: "updateCredentials" },
    { method: "post", path: "create_subscriptions", handler: "createSubscription" },
  ],

  webhooks: [
    { method: "post", path: "handle_hooks", handler: "razorpayWebhooks" },
  ]
};

