/**
 * ChatListItem Component
 *
 * Displays a single chat in the sidebar list
 */

import type * as React from 'react';
import { Clock, Package } from 'lucide-react';
import { Chat } from '../../../../../types/message';
import styles from './ChatListItem.module.css';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: (chat: Chat) => void;
  t: (key: string) => string;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isActive,
  onClick,
  t
}) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('messages.justNow');
    if (minutes < 60) return `${minutes}${t('messages.minAgo')}`;
    if (hours < 24) return `${hours}${t('messages.hourAgo')}`;
    if (days < 7) return `${days}${t('messages.dayAgo')}`;

    return date.toLocaleDateString();
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: t('order.status.pending'),
      confirmed: t('order.status.confirmed'),
      preparing: t('order.status.preparing'),
      ready: t('order.status.ready'),
      out_for_delivery: t('order.status.outForDelivery'),
      delivered: t('order.status.delivered'),
      cancelled: t('order.status.cancelled')
    };

    return statusMap[status] || status;
  };

  const getStatusClass = (status: string): string => {
    const classMap: Record<string, string> = {
      pending: styles.pending,
      confirmed: styles.preparing,
      preparing: styles.preparing,
      ready: styles.ready,
      out_for_delivery: styles.outForDelivery,
      delivered: styles.delivered
    };

    return classMap[status] || '';
  };

  const itemClassName = [
    styles.chatItem,
    isActive ? styles.active : '',
    chat.unreadCount > 0 ? styles.unread : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={itemClassName} onClick={() => onClick(chat)}>
      <div className={styles.chatHeader}>
        <div className={styles.avatar}>
          {getInitials(chat.customerName)}
        </div>
        <div className={styles.chatInfo}>
          <div className={styles.topRow}>
            <span className={styles.customerName}>{chat.customerName}</span>
            <span className={styles.timestamp}>
              {formatTimestamp(chat.updatedAt)}
            </span>
          </div>
          <div className={styles.orderNumber}>
            {t('messages.order')} #{chat.orderNumber}
          </div>
          {chat.lastMessage && (
            <div
              className={`${styles.lastMessage} ${
                chat.unreadCount > 0 ? styles.unread : ''
              }`}
            >
              {chat.lastMessage.senderType === 'store' && `${t('messages.you')}: `}
              {chat.lastMessage.content}
            </div>
          )}
        </div>
      </div>
      <div className={styles.chatFooter}>
        <span className={`${styles.statusBadge} ${getStatusClass(chat.orderStatus)}`}>
          <span className={styles.statusDot} />
          {getStatusLabel(chat.orderStatus)}
        </span>
        {chat.unreadCount > 0 && (
          <span className={styles.unreadBadge}>{chat.unreadCount}</span>
        )}
      </div>
    </div>
  );
};
