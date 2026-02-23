// src/api/chat/chat.repository.js
const { ChatSession, ChatMessage } = require('./chat.model');

class ChatRepository {
    async createSession(userId, title = 'New Chat', fileId = null) {
        return await ChatSession.create({
            userId,
            title,
            fileId
        });
    }

    async findSessionsByUserId(userId) {
        return await ChatSession.findAll({
            where: { userId },
            order: [['updated_at', 'DESC']],
            limit: 50
        });
    }

    async findSessionById(sessionId) {
        return await ChatSession.findByPk(sessionId, {
            include: [{
                association: 'messages',
                order: [['created_at', 'ASC']]
            }]
        });
    }

    async updateSessionTitle(sessionId, title) {
        const session = await ChatSession.findByPk(sessionId);
        if (!session) return null;
        session.title = title;
        session.updatedAt = new Date();
        await session.save();
        return session;
    }

    async deleteSession(sessionId) {
        await ChatMessage.destroy({ where: { sessionId } });
        return await ChatSession.destroy({ where: { id: sessionId } });
    }

    async addMessage(sessionId, role, content, metadata = null) {
        const message = await ChatMessage.create({
            sessionId,
            role,
            content,
            metadata
        });

        // Update session's updatedAt
        await ChatSession.update(
            { updatedAt: new Date() },
            { where: { id: sessionId } }
        );

        return message;
    }

    async getMessages(sessionId) {
        return await ChatMessage.findAll({
            where: { sessionId },
            order: [['created_at', 'ASC']]
        });
    }
}

module.exports = new ChatRepository();
