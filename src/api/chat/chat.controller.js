// src/api/chat/chat.controller.js
const asyncFun = require('../../middlewares/async.handler');
const response = require('../../utils/ApiResponse');
const ChatService = require('./chat.service');
const ChatRepository = require('./chat.repository');

const chatService = new ChatService();

class ChatController {
    /**
     * Create a new chat session
     * POST /api/v1/chat/sessions
     */
    createSession = asyncFun(async (req, res) => {
        const { title, fileId } = req.body;
        const session = await ChatRepository.createSession(req.user.id, title, fileId);
        return response.success(res, "Session created", session, 201);
    });

    /**
     * Get all chat sessions for the user
     * GET /api/v1/chat/sessions
     */
    getSessions = asyncFun(async (req, res) => {
        const sessions = await ChatRepository.findSessionsByUserId(req.user.id);
        return response.success(res, "Sessions retrieved", sessions);
    });

    /**
     * Get a specific session with messages
     * GET /api/v1/chat/sessions/:sessionId
     */
    getSession = asyncFun(async (req, res) => {
        const { sessionId } = req.params;
        const session = await ChatRepository.findSessionById(sessionId);
        if (!session) {
            return response.fail(res, "Session not found", [], 404);
        }
        return response.success(res, "Session retrieved", session);
    });

    /**
     * Delete a chat session
     * DELETE /api/v1/chat/sessions/:sessionId
     */
    deleteSession = asyncFun(async (req, res) => {
        const { sessionId } = req.params;
        await ChatRepository.deleteSession(sessionId);
        return response.success(res, "Session deleted", null, 204);
    });

    /**
     * Process a chat message and return analysis/chart suggestions
     * POST /api/v1/chat
     * Body: { message: string, fileId?: string, sessionId?: string }
     */
    chat = asyncFun(async (req, res) => {
        const { message, fileId, sessionId } = req.body;

        if (!message || typeof message !== 'string') {
            return response.fail(res, "Message is required", [], 400);
        }

        // Create session if not provided
        let activeSessionId = sessionId;
        if (!activeSessionId) {
            const newSession = await ChatRepository.createSession(req.user.id, message.slice(0, 50), fileId);
            activeSessionId = newSession.id;
        }

        // Save user message
        await ChatRepository.addMessage(activeSessionId, 'user', message);

        // Process message
        const result = await chatService.processMessage(message, fileId, req.user.id);

        // Save assistant response
        await ChatRepository.addMessage(activeSessionId, 'assistant', result.reply, {
            chartSpecs: result.chartSpecs,
            insights: result.insights
        });

        // Include sessionId in response
        result.sessionId = activeSessionId;

        return response.success(res, "Message processed", result);
    });

    /**
     * Get file preview data (parsed rows)
     * GET /api/v1/chat/preview/:fileId
     */
    getPreview = asyncFun(async (req, res) => {
        const { fileId } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const preview = await chatService.getFilePreview(fileId, req.user.id, limit);
        return response.success(res, "Preview retrieved", preview);
    });

    /**
     * Get lakehouse data preview (from MinIO via datalakehouse)
     * GET /api/v1/chat/preview/lakehouse/:jobId
     * Query: projectId, tableName, limit
     */
    getLakehousePreview = asyncFun(async (req, res) => {
        const { jobId } = req.params;
        const { projectId, tableName } = req.query;
        const limit = parseInt(req.query.limit) || 50;

        if (!projectId || !tableName) {
            return response.fail(res, "projectId and tableName are required", [], 400);
        }

        const preview = await chatService.getLakehousePreview(jobId, projectId, tableName, limit);
        return response.success(res, "Lakehouse preview retrieved", preview);
    });
}

module.exports = new ChatController();
