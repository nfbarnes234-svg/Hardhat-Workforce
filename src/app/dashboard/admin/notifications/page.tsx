"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Button, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/notifications").then((r) => r.json()).then((d) => setNotifications(d.notifications || []));
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAllRead: true }) });
    fetch("/api/notifications").then((r) => r.json()).then((d) => setNotifications(d.notifications || []));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-brand-gray-500 text-sm">Stay updated on all activities</p>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
      </div>
      {notifications.length === 0 ? <EmptyState title="No notifications" /> : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const notif = n as { id: string; title: string; message: string; isRead: boolean; createdAt: string };
            return (
              <Card key={notif.id} className={notif.isRead ? "opacity-60" : ""}>
                <CardBody className="py-3">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <span className="text-xs text-brand-gray-400">{formatDateTime(notif.createdAt)}</span>
                  </div>
                  <p className="text-sm text-brand-gray-500 mt-1">{notif.message}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
