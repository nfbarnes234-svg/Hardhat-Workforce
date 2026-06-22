"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardBody, Button, Textarea, Label, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { Paperclip, Download } from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  attachmentUrl?: string;
  attachmentName?: string;
  sender: { firstName: string; role: string };
}

export default function CustomerMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [adminId, setAdminId] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => fetch("/api/messages").then((r) => r.json()).then(setMessages);

  useEffect(() => {
    load();
    fetch("/api/users/admin").then((r) => r.json()).then((d) => setAdminId(d.id || ""));
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) setAttachment({ url: data.url, name: file.name });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;
    setLoading(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: adminId,
        content,
        subject: "Customer Inquiry",
        attachmentUrl: attachment?.url,
        attachmentName: attachment?.name,
      }),
    });
    setContent("");
    setAttachment(null);
    load();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-brand-gray-500 text-sm">Contact the administration team and attach documents</p>
      </div>
      <Card>
        <CardBody>
          <form onSubmit={sendMessage} className="space-y-3">
            <Label>Message to Admin</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type your message..." required />
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1">
                <Paperclip className="w-4 h-4" /> Attach Document
              </Button>
              {attachment && <span className="text-sm text-brand-gray-500">{attachment.name}</span>}
            </div>
            <Button type="submit" loading={loading}>Send Message</Button>
          </form>
        </CardBody>
      </Card>
      {messages.length === 0 ? <EmptyState title="No messages yet" /> : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card key={msg.id}>
              <CardBody>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{msg.sender.firstName} ({msg.sender.role})</span>
                  <span className="text-brand-gray-400">{formatDateTime(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-brand-gray-600">{msg.content}</p>
                {msg.attachmentUrl && (
                  <a href={msg.attachmentUrl} download={msg.attachmentName} className="inline-flex items-center gap-1 text-sm text-brand-orange mt-2 hover:underline">
                    <Download className="w-4 h-4" /> {msg.attachmentName || "Download attachment"}
                  </a>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
