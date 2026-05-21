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
const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23F8E7EC'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%23D90452'/%3E%3Cellipse cx='20' cy='34' rx='12' ry='7' fill='%23D90452'/%3E%3C/svg%3E";

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
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const bottomRef = useRef(null);
  const connectionRef = useRef(null);
  const activeConvRef = useRef(activeConv);
  const typingTimeoutRef = useRef(null);
  const typingThrottleRef = useRef(null);

  // Keep activeConvRef in sync for SignalR handlers (avoid stale closure)
  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  const parseList = (data) =>
    Array.isArray(data) ? data
      : Array.isArray(data?.messages) ? data.messages
        : Array.isArray(data?.items) ? data.items
          : Array.isArray(data?.data) ? data.data : [];

  const getConvName = (conv) =>
    conv.otherPersonName ||
    (isSeller
      ? conv.buyerName || conv.buyer?.name || conv.buyer?.fullName
      : conv.sellerName || conv.seller?.storeName || conv.seller?.name) ||
    "User";

  const getConvAvatar = (conv) =>
    getFullUrl(conv.otherPersonAvatar) ||
    getFullUrl(isSeller ? conv.buyer?.avatarUrl : conv.seller?.avatarUrl) ||
    DEFAULT_AVATAR;

  const ownAvatar =
    getFullUrl(user?.avatarUrl || user?.avatar || user?.profileImage) || DEFAULT_AVATAR;

  // Load conversations on mount
  useEffect(() => {
    getConversations()
      .then((res) => {
        const list = parseList(res.data);
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
                if (r.data?.id) {
                  setConversations((prev) => [r.data, ...prev]);
                  setActiveConv(r.data);
                }
              })
              .catch(() => toast.error("Conversation could not be created."));
          }
        } else if (list.length > 0) {
          setActiveConv(list[0]);
        }
      })
      .catch(() => {})
      .finally(() => setConvLoading(false));
  }, [initSellerId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConv?.id) return;
    setMessages([]);
    setIsOtherTyping(false);

    getConversationMessages(activeConv.id)
      .then((res) => setMessages(parseList(res.data)))
      .catch(() => {});

    // Update unread count locally (no backend endpoint for marking read)
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, unreadCount: 0 } : c))
    );

    if (connectionRef.current?.state === "Connected") {
      connectionRef.current.invoke("JoinConversation", String(activeConv.id)).catch(() => {});
    }
  }, [activeConv?.id]);

  // Poll messages every 8 seconds
  useEffect(() => {
    if (!activeConv?.id) return;
    const interval = setInterval(() => {
      getConversationMessages(activeConv.id)
        .then((res) => setMessages(parseList(res.data)))
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [activeConv?.id]);

  // Poll conversations every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getConversations()
        .then((res) => setConversations(parseList(res.data)))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // SignalR connection
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
      // Clear typing indicator when message arrives
      setIsOtherTyping(false);
    });

    connection.on("ReceiveTyping", (data) => {
      const convId = data?.conversationId ?? data;
      if (String(convId) === String(activeConvRef.current?.id)) {
        setIsOtherTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000);
      }
    });

    connection.start()
      .then(() => {
        if (activeConvRef.current?.id) {
          connection.invoke("JoinConversation", String(activeConvRef.current.id)).catch(() => {});
        }
      })
      .catch(() => {});

    connectionRef.current = connection;
    return () => {
      clearTimeout(typingTimeoutRef.current);
      connection.stop();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    // Throttle typing events (max 1 per second)
    if (!typingThrottleRef.current && connectionRef.current?.state === "Connected" && activeConv?.id) {
      connectionRef.current.invoke("Typing", String(activeConv.id)).catch(() => {});
      typingThrottleRef.current = setTimeout(() => { typingThrottleRef.current = null; }, 1000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv?.id) return;
    setSending(true);
    const sentText = text.trim();
    setText("");
    try {
      const res = await sendMessage({ text: sentText, conversationId: activeConv.id });
      if (res.data) {
        setMessages((prev) => [...prev, { ...res.data, isOwn: true }]);
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, lastMessage: sentText, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch {
      toast.error("Message could not be sent.");
      setText(sentText);
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) =>
    getConvName(c).toLowerCase().includes(search.toLowerCase())
  );

  const activeConvName = activeConv ? getConvName(activeConv) : "";
  const activeConvAvatar = activeConv ? getConvAvatar(activeConv) : DEFAULT_AVATAR;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-10 py-4 flex-shrink-0">
        <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">Inbox</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-black text-[#1E1B1B]">Messages</h1>
      </div>

      {/* Chat area — fills remaining height */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-10 pb-4 min-h-0 grid lg:grid-cols-[300px_1fr] gap-4">

        {/* Sidebar */}
        <div className="bg-white rounded-[24px] border border-[#EFE4DF] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#EFE4DF] flex-shrink-0">
            <div className="flex items-center gap-2 bg-[#F8F1EC] rounded-full px-3 py-2.5">
              <FiSearch className="text-[#D90452] flex-shrink-0" size={13} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll">
            {convLoading ? (
              <div className="p-6 flex justify-center">
                <div className="w-7 h-7 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#7A7272]">No conversations yet.</div>
            ) : (
              filteredConvs.map((conv, idx) => {
                const name = getConvName(conv);
                const avatar = getConvAvatar(conv);
                const lastMsg = conv.lastMessage || conv.lastMessageText || "";
                const time = conv.lastMessageAt || conv.updatedAt;
                const unread = conv.unreadCount || 0;
                const isActive = activeConv?.id === conv.id;

                return (
                  <button
                    key={conv.id ?? `conv-${idx}`}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#F5EDE9] hover:bg-[#F8F1EC] transition text-left ${
                      isActive ? "bg-[#F8E7EC]" : ""
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-black text-sm text-[#1E1B1B] truncate">{name}</p>
                        {time && (
                          <p className="text-[10px] text-[#7A7272] flex-shrink-0 ml-1">
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

        {/* Chat area */}
        {!activeConv ? (
          <div className="bg-white rounded-[24px] border border-[#EFE4DF] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#F8E7EC] rounded-full flex items-center justify-center mx-auto text-2xl">
                💬
              </div>
              <h3 className="mt-4 font-black text-lg">Select a conversation</h3>
              <p className="mt-2 text-sm text-[#7A7272]">Choose from your messages on the left.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-[#EFE4DF] flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="px-5 py-3.5 border-b border-[#EFE4DF] flex items-center gap-3 flex-shrink-0">
              <img
                src={activeConvAvatar}
                alt={activeConvName}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              />
              <div>
                <p className="font-black text-[#1E1B1B] text-sm">{activeConvName}</p>
                <p className="text-xs text-green-500 font-bold">● Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scroll px-5 py-4 space-y-3 min-h-0">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-[#7A7272]">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const uid = user?.id;
                  const isMine =
                    msg.isOwn === true ||
                    (uid != null && msg.senderId != null && String(msg.senderId) === String(uid)) ||
                    (uid != null && msg.userId != null && String(msg.userId) === String(uid)) ||
                    (uid != null && msg.buyerId != null && String(msg.buyerId) === String(uid)) ||
                    (user?.email && msg.senderEmail && msg.senderEmail === user.email) ||
                    (user?.email && msg.senderName && msg.senderName === user.email);

                  return (
                    <div
                      key={msg.id ?? `msg-${idx}`}
                      className={`msg-in flex ${isMine ? "justify-end" : "justify-start"} gap-2 items-end`}
                    >
                      {!isMine && (
                        <img
                          src={activeConvAvatar}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                          onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                        />
                      )}
                      <div
                        className={`max-w-[70%] px-4 py-2.5 text-sm leading-relaxed ${
                          isMine
                            ? "bg-[#D90452] text-white rounded-[18px] rounded-br-[4px]"
                            : "bg-[#F8F1EC] text-[#1E1B1B] rounded-[18px] rounded-bl-[4px]"
                        }`}
                      >
                        {msg.text || msg.content || msg.message}
                      </div>
                      {isMine && (
                        <img
                          src={ownAvatar}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                          onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                        />
                      )}
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isOtherTyping && (
                <div className="msg-in flex justify-start gap-2 items-end">
                  <img
                    src={activeConvAvatar}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                    onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                  />
                  <div className="bg-[#F8F1EC] px-4 py-3 rounded-[18px] rounded-bl-[4px]">
                    <div className="flex gap-1 items-center">
                      <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full inline-block" />
                      <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full inline-block" />
                      <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full inline-block" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="px-4 py-3 border-t border-[#EFE4DF] flex items-center gap-3 flex-shrink-0"
            >
              <input
                value={text}
                onChange={handleTextChange}
                placeholder="Type your message..."
                className="flex-1 bg-[#F8F1EC] rounded-full px-5 py-3 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="w-11 h-11 bg-[#D90452] text-white rounded-full flex items-center justify-center disabled:opacity-50 flex-shrink-0"
              >
                <FiSend size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
