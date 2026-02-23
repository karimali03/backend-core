// src/api/chat/chat.route.js
const express = require("express");
const router = express.Router();
const chatController = require("./chat.controller");
const { validateAuth } = require('../../middlewares/auth.middleware');

// Session management endpoints
router.post("/sessions", validateAuth, chatController.createSession);
router.get("/sessions", validateAuth, chatController.getSessions);
router.get("/sessions/:sessionId", validateAuth, chatController.getSession);
router.delete("/sessions/:sessionId", validateAuth, chatController.deleteSession);

// POST /api/v1/chat - Send a message and get analysis response
router.post("/", validateAuth, chatController.chat);

// GET /api/v1/chat/preview/:fileId - Get file data preview
router.get("/preview/:fileId", validateAuth, chatController.getPreview);

// GET /api/v1/chat/preview/lakehouse/:jobId - Get lakehouse data preview
router.get("/preview/lakehouse/:jobId", validateAuth, chatController.getLakehousePreview);

module.exports = router;
