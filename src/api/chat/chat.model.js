// src/api/chat/chat.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ChatSession = sequelize.define('ChatSession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'New Chat'
    },
    fileId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'file_id'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'chat_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'session_id'
    },
    role: {
        type: DataTypes.ENUM('user', 'assistant'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'chat_messages',
    timestamps: false
});

// Define relationships
ChatSession.hasMany(ChatMessage, { as: 'messages', foreignKey: 'session_id' });
ChatMessage.belongsTo(ChatSession, { as: 'session', foreignKey: 'session_id' });

module.exports = { ChatSession, ChatMessage };
