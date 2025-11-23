/**
 * MessageInput Component
 *
 * Text input area for sending messages with quick replies
 */

import type * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  onSendMessage: (content: string, attachment?: File) => void;
  disabled?: boolean;
  disabledMessage?: string;
  quickReplies?: string[];
  maxLength?: number;
  t: (key: string) => string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  disabledMessage,
  quickReplies = [],
  maxLength = 500,
  t
}) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() || attachment) {
      onSendMessage(message.trim(), attachment || undefined);
      setMessage('');
      setAttachment(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (reply: string) => {
    onSendMessage(reply);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t('messages.fileTooLarge'));
        return;
      }
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCharacterCountClass = () => {
    const percentage = (message.length / maxLength) * 100;
    if (percentage >= 100) return styles.error;
    if (percentage >= 80) return styles.warning;
    return '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`${styles.inputContainer} ${disabled ? styles.disabled : ''}`}>
      {disabledMessage && (
        <div className={styles.disabledMessage}>{disabledMessage}</div>
      )}

      {quickReplies.length > 0 && !disabled && (
        <div className={styles.quickReplies}>
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className={styles.quickReply}
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {attachment && (
        <div className={styles.attachmentPreview}>
          {attachment.type.startsWith('image/') && (
            <img
              src={URL.createObjectURL(attachment)}
              alt="Preview"
              className={styles.previewImage}
            />
          )}
          <div className={styles.previewInfo}>
            <div className={styles.previewName}>{attachment.name}</div>
            <div className={styles.previewSize}>{formatFileSize(attachment.size)}</div>
          </div>
          <button className={styles.removeButton} onClick={removeAttachment}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className={styles.inputWrapper}>
        <div className={styles.textareaContainer}>
          {message.length > 0 && (
            <div className={`${styles.characterCount} ${getCharacterCountClass()}`}>
              {message.length}/{maxLength}
            </div>
          )}
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyPress={handleKeyPress}
            placeholder={t('messages.typeMessage')}
            disabled={disabled}
            rows={1}
          />
        </div>

        <div className={styles.actions}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            className={styles.actionButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title={t('messages.attachFile')}
          >
            <Paperclip size={20} />
          </button>

          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !attachment)}
          >
            <Send size={16} />
            {t('messages.send')}
          </button>
        </div>
      </div>
    </div>
  );
};
