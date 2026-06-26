"use client";
import React, { useState } from "react";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: string;
  time: string;
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "CAU-2354",
    message: "insurance due on 2026-03-01",
    category: "Asset",
    time: "5 min ago",
    read: false,
  },
  {
    id: 2,
    title: "INV-1029",
    message: "payment received from Sunrise Villa",
    category: "Financial",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "EMP-0042",
    message: "leave request awaiting approval",
    category: "Operation",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 4,
    title: "BKG-5521",
    message: "new booking confirmed for Ocean Villa",
    category: "Villa",
    time: "Yesterday",
    read: true,
  },
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sm:px-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-orange-400 px-2 py-0.5 text-theme-xs font-medium text-white">
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="text-theme-sm font-medium text-brand-500 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-gray-600"
        >
          Mark all as read
        </button>
      </div>

      <ul className="flex flex-col">
        {notifications.length === 0 && (
          <li className="px-5 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400 sm:px-6">
            You&apos;re all caught up.
          </li>
        )}
        {notifications.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => markAsRead(item.id)}
              className={`flex w-full gap-3 border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5 sm:px-6 ${
                item.read ? "" : "bg-orange-50/50 dark:bg-white/[0.02]"
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  item.read ? "bg-transparent" : "bg-orange-400"
                }`}
              />
              <span className="block">
                <span className="mb-1.5 block space-x-1 text-theme-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    {item.title}
                  </span>
                  <span>{item.message}</span>
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>{item.category}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                  <span>{item.time}</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
