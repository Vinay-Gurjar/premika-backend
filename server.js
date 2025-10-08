import { cleanModelResponses, initDynamoDB } from "#application/application.js";
import Plan from "#models/plan.js";
import router from "#routes/routes.js";
import { handleSocketConnection } from "#sockets/index.js";
import application from "@techveda/node-serverjs";
import axios from "axios";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const socketCors = {
    cors: {
        origin: "*", 
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "x-custom-header", "platform"],
        credentials: true,
    }
}

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, origin || '*');
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-custom-header', 'platform', 'x-razorpay-signature', 'x-razorpay-event-id'],
};

export const { app, io, server, redis } = await application.createServer({
  socket: true,
  socketCors,
  router,
  corsOptions,
  elastiCache: true,
  elastiCacheUrl: "VALKEY_URL",
  // httpProxy: true,
  // httpProxyTarget: process.env.FRONT_END,
  
  externalFunctions:[initDynamoDB, handleSocketConnection]
});

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, "src", "public")));

app.get("/delete_account", (req, res) => {
    const redirect_url = process.env.WEB_APP_URL
    res.render('deleteAcc.ejs', {redirect_url});
})

app.get("/privacy_policy", (req, res) => {
    res.render('privacyPolicy.ejs');
})

app.get("/child_safety", (req, res) => {
    res.render('childSafetyPolicy.ejs');
})

app.get("/refund_policy", (req, res) => {
    res.render('refundPolicy.ejs');
})


app.get('/terms_and_conditions', (req, res) => {
    res.render('termsAndConditions.ejs');
})


app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});