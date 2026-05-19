import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiSend, FiSearch } from "react-icons/fi";
import * as signalR from "@microsoft/signalr";

import { useAuth } from "../context/AuthContext";
import {
  getConversations,
  getConversationMessages,
  createConversation,
  sendMessage,
} from "../services/chatService";

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://giftboxy-backend-1.onrender.com";
const HUB_URL = import.meta.env.VITE_CHAT_HUB_URL || `${BASE_URL}/hubs/chat`;
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80";

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};

function Chat() {
  const { user, isSeller } = useAuth();
  const [searchParams] = useSearchParams();
  const initSellerId = searchParams.get("sellerId");

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [convLoading, setConvLoading] = useState(true);

  const bottomRef = useRef(null);
  const connectionRef = useRef(null);

  const getConvName = (conv) => {
    return conv.otherPersonName ||
      (isSeller
        ? conv.buyerName || conv.buyer?.name || conv.buyer?.fullName
        : conv.sellerName || conv.seller?.storeName || conv.seller?.name) ||
      "User";
  };

  const getConvAvatar = (conv) => {
    return getFullUrl(conv.otherPersonAvatar) ||
      getFullUrl(isSeller ? conv.buyer?.avatarUrl : conv.seller?.avatarUrl) ||
      DEFAULT_AVATAR;
  };

  useEffect(() => {
    getConversations()
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data
          : Array.isArray(data?.items) ? data.items
            : Array.isArray(data?.data) ? data.data : [];
        setConversations(list);

        if (initSellerId) {
          const existing = list.find(
            (c) =>
              String(c.sellerId) === String(initSellerId) ||
              String(c.seller?.id) === String(initSellerId) ||
              String(c.otherPersonId) === String(initSellerId)
          );
          if (existing) {
            setActiveConv(existing);
          } else {
            createConversation({ sellerId: String(initSellerId) })
              .then((r) => {
                const newConv = r.data;
                if (newConv?.id) {
                  setConversations((prev) => [newConv, ...prev]);
                  setActiveConv(newConv);
                }
              })
              .catch(() => toast.error("Conversation could not be created."));
          }
        } else if (list.length > 0) {
          setActiveConv(list[0]);
        }
      })
      .catch(() => { })
      .finally(() => setConvLoading(false));
  }, [initSellerId]);

  useEffect(() => {
    if (!activeConv?.id) return;
    setMessages([]);
    getConversationMessages(activeConv.id)
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data
          : Array.isArray(data?.messages) ? data.messages
            : Array.isArray(data?.items) ? data.items
              : Array.isArray(data?.data) ? data.data : [];
        setMessages(list);
      })
      .catch(() => { });
  }, [activeConv?.id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("ReceiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === message.conversationId
            ? { ...c, lastMessage: message.text || message.content, lastMessageAt: message.createdAt }
            : c
        )
      );
    });

    connection.start().catch(() => { });
    connectionRef.current = connection;
    return () => { connection.stop(); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv?.id) return;
    setSending(true);
    try {
      const res = await sendMessage({
        text: text.trim(),
        conversationId: activeConv.id,
      });
      if (res.data) {
        setMessages((prev) => [...prev, { ...res.data, isOwn: true }]);
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, lastMessage: text.trim(), lastMessageAt: new Date().toISOString() }
            : c
        )
      );
      setText("");
    } catch {
      toast.error("Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) => {
    const name = getConvName(c);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const activeConvName = activeConv ? getConvName(activeConv) : "";
  const activeConvAvatar = activeConv ? getConvAvatar(activeConv) : DEFAULT_AVATAR;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-24">
      <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">Inbox</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-black text-[#1E1B1B]">Messages</h1>

      <div className="mt-6 grid lg:grid-cols-[320px_1fr] gap-5 h-[680px]">
        {/* Sidebar */}
        <div className="bg-white rounded-[28px] border border-[#EFE4DF] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#EFE4DF]">
            <div className="flex items-center gap-2 bg-[#F8F1EC] rounded-full px-4 py-3">
              <FiSearch className="text-[#D90452]" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              <div className="p-6 text-center">
                <div className="w-8 h-8 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#7A7272]">
                No conversations yet.
              </div>
            ) : (
              filteredConvs.map((conv, idx) => {
                const name = getConvName(conv);
                const avatar = getConvAvatar(conv);
                const lastMsg = conv.lastMessage || conv.lastMessageText || "";
                const time = conv.lastMessageAt || conv.updatedAt;
                const unread = conv.unreadCount || 0;
                const isActive = activeConv?.id === conv.id;
                const key = conv.id ?? `conv-${idx}`;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-4 border-b border-[#F5EDE9] hover:bg-[#F8F1EC] transition text-left ${isActive ? "bg-[#F8E7EC]" : ""}`}
                  >
                    <img
                      src={avatar}
                      alt={name}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-black text-sm text-[#1E1B1B] truncate">{name}</p>
                        {time && (
                          <p className="text-[10px] text-[#7A7272] flex-shrink-0 ml-2">
                            {new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-[#7A7272] truncate">{lastMsg}</p>
                        {unread > 0 && (
                          <span className="bg-[#D90452] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-1">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {!activeConv ? (
          <div className="bg-white rounded-[28px] border border-[#EFE4DF] flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#F8E7EC] rounded-full flex items-center justify-center mx-auto text-3xl">💬</div>
              <h3 className="mt-4 font-black text-xl">Select a conversation</h3>
              <p className="mt-2 text-sm text-[#7A7272]">Choose from your messages on the left.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[28px] border border-[#EFE4DF] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFE4DF] flex items-center gap-4">
              <img
                src={activeConvAvatar}
                alt={activeConvName}
                className="w-11 h-11 rounded-full object-cover"
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              />
              <div>
                <p className="font-black text-[#1E1B1B]">{activeConvName}</p>
                <p className="text-xs text-green-500 font-bold">● Active now</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-[#7A7272]">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  console.log("MSG:", msg, "USER ID:", user?.id);
                  const isMine = msg.isOwn === true ||
                    (user?.email && msg.senderName === user.email);

                  return (
                    <div key={msg.id ?? `msg-${idx}`} className={`flex ${isMine ? "justify-end" : "justify-start"} gap-3`}>
                      {!isMine && (
                        <img
                          src={activeConvAvatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                          onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                        />
                      )}
                      <div className={`max-w-[70%] px-4 py-3 rounded-[20px] text-sm leading-relaxed ${isMine
                        ? "bg-[#D90452] text-white rounded-br-[4px]"
                        : "bg-[#F8F1EC] text-[#1E1B1B] rounded-bl-[4px]"
                        }`}>
                        {msg.text || msg.content || msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="px-4 py-4 border-t border-[#EFE4DF] flex items-center gap-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-[#F8F1EC] rounded-full px-5 py-4 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="w-12 h-12 bg-[#D90452] text-white rounded-full flex items-center justify-center disabled:opacity-50"
              >
                <FiSend size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;