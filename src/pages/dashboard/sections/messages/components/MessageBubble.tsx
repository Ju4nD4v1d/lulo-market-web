/**
 * MessageBubble Component
 *
 * Displays individual messages with different styles for customer/store
 */

import type * as React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../../../../../types/message';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  t: (key: string) => string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, t }) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isStore = message.senderType === 'store';

  return (
    <div className={`${styles.messageWrapper} ${isStore ? styles.store : styles.customer}`}>
      <div className={`${styles.messageBubble} ${isStore ? styles.store : styles.customer}`}>
        <div className={styles.messageContent}>
          {message.content}
        </div>

        {message.attachmentUrl && (
          <div className={styles.attachment}>
            {message.attachmentType === 'image' ? (
              <img
                src={message.attachmentUrl}
                alt={t('messages.attachment')}
                className={styles.attachmentImage}
              />
            ) : (
              <a
                href={message.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.attachmentLink}
              >
                {t('messages.viewAttachment')}
              </a>
            )}
          </div>
        )}

        <div className={styles.messageFooter}>
          <span className={styles.timestamp}>
            {formatTime(message.timestamp)}
          </span>
          {isStore && (
            <span className={styles.readStatus}>
              {message.read ? (
                <CheckCheck className={styles.checkmark} size={14} />
              ) : (
                <Check className={`${styles.checkmark} ${styles.unread}`} size={14} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const SystemMessage: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className={styles.systemMessage}>
      <span className={styles.systemBubble}>{content}</span>
    </div>
  );
};

export const TypingIndicator: React.FC = () => {
  return (
    <div className={`${styles.messageWrapper} ${styles.customer}`}>
      <div className={styles.typingIndicator}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </div>
    </div>
  );
};
