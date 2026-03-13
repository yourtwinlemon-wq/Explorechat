import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, Bell, Phone, Video, Mic, Paperclip, Send, Search, Plus, X, Check, UserPlus, ChevronLeft, MoreVertical, Image as ImageIcon } from 'lucide-react';

// Utility to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Utility to format timestamps
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (diff < 604800000) return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ChatOrbitClone() {
  // Core state
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [publicPosts, setPublicPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // UI state
  const [currentView, setCurrentView] = useState('setup'); // setup, chats, discover, notifications, groups, chat, groupChat
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddContact, setShowAddContact] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showShareNumber, setShowShareNumber] = useState(false);
  const [newContactNumber, setNewContactNumber] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [sharePostText, setSharePostText] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);

  // Load data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('chatOrbit_currentUser');
    const savedContacts = localStorage.getItem('chatOrbit_contacts');
    const savedConversations = localStorage.getItem('chatOrbit_conversations');
    const savedRequests = localStorage.getItem('chatOrbit_pendingRequests');
    const savedPosts = localStorage.getItem('chatOrbit_publicPosts');
    const savedGroups = localStorage.getItem('chatOrbit_groups');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentView('chats');
    }
    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedConversations) setConversations(JSON.parse(savedConversations));
    if (savedRequests) setPendingRequests(JSON.parse(savedRequests));
    if (savedPosts) setPublicPosts(JSON.parse(savedPosts));
    if (savedGroups) setGroups(JSON.parse(savedGroups));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem('chatOrbit_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);
  
  useEffect(() => {
    localStorage.setItem('chatOrbit_contacts', JSON.stringify(contacts));
  }, [contacts]);
  
  useEffect(() => {
    localStorage.setItem('chatOrbit_conversations', JSON.stringify(conversations));
  }, [conversations]);
  
  useEffect(() => {
    localStorage.setItem('chatOrbit_pendingRequests', JSON.stringify(pendingRequests));
  }, [pendingRequests]);
  
  useEffect(() => {
    localStorage.setItem('chatOrbit_publicPosts', JSON.stringify(publicPosts));
  }, [publicPosts]);
  
  useEffect(() => {
    localStorage.setItem('chatOrbit_groups', JSON.stringify(groups));
  }, [groups]);

  // Setup user
  const handleSetup = (name, number) => {
    const user = {
      id: generateId(),
      name,
      number,
      createdAt: Date.now()
    };
    setCurrentUser(user);
    setCurrentView('chats');
  };

  // Send message
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const message = {
      id: generateId(),
      text: messageInput,
      sender: currentUser.id,
      timestamp: Date.now(),
      type: 'text'
    };
    
    if (selectedContact) {
      const convKey = `${currentUser.id}_${selectedContact.id}`;
      setConversations(prev => ({
        ...prev,
        [convKey]: [...(prev[convKey] || []), message]
      }));
    } else if (selectedGroup) {
      const groupKey = `group_${selectedGroup.id}`;
      setConversations(prev => ({
        ...prev,
        [groupKey]: [...(prev[groupKey] || []), message]
      }));
    }
    
    setMessageInput('');
  };

  // Add contact with friend request
  const handleAddContact = () => {
    if (!newContactNumber.trim() || !newContactName.trim()) return;
    
    // Create pending request
    const request = {
      id: generateId(),
      from: currentUser.id,
      fromName: currentUser.name,
      fromNumber: currentUser.number,
      toNumber: newContactNumber,
      toName: newContactName,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    setPendingRequests(prev => [...prev, request]);
    
    // For demo purposes, also add as contact immediately
    // In real app, recipient would need to accept
    const contact = {
      id: generateId(),
      name: newContactName,
      number: newContactNumber,
      addedAt: Date.now()
    };
    
    setContacts(prev => [...prev, contact]);
    setNewContactNumber('');
    setNewContactName('');
    setShowAddContact(false);
  };

  // Accept friend request
  const handleAcceptRequest = (requestId) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const contact = {
      id: generateId(),
      name: request.fromName,
      number: request.fromNumber,
      addedAt: Date.now()
    };
    
    setContacts(prev => [...prev, contact]);
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  // Create public post
  const handleShareNumber = () => {
    if (!sharePostText.trim()) return;
    
    const post = {
      id: generateId(),
      userId: currentUser.id,
      userName: currentUser.name,
      userNumber: currentUser.number,
      text: sharePostText,
      timestamp: Date.now(),
      likes: 0
    };
    
    setPublicPosts(prev => [post, ...prev]);
    setSharePostText('');
    setShowShareNumber(false);
  };

  // Create group
  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) return;
    
    const group = {
      id: generateId(),
      name: groupName,
      members: [currentUser.id, ...selectedGroupMembers],
      createdBy: currentUser.id,
      createdAt: Date.now(),
      avatar: '👥'
    };
    
    setGroups(prev => [...prev, group]);
    setGroupName('');
    setSelectedGroupMembers([]);
    setShowCreateGroup(false);
  };

  // Voice recording
  const handleVoiceRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // In real app, would save audio and send
      const message = {
        id: generateId(),
        type: 'voice',
        duration: '0:15',
        sender: currentUser.id,
        timestamp: Date.now()
      };
      
      if (selectedContact) {
        const convKey = `${currentUser.id}_${selectedContact.id}`;
        setConversations(prev => ({
          ...prev,
          [convKey]: [...(prev[convKey] || []), message]
        }));
      }
    } else {
      setIsRecording(true);
    }
  };

  // File upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const message = {
      id: generateId(),
      type: 'file',
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(2) + ' KB',
      sender: currentUser.id,
      timestamp: Date.now()
    };
    
    if (selectedContact) {
      const convKey = `${currentUser.id}_${selectedContact.id}`;
      setConversations(prev => ({
        ...prev,
        [convKey]: [...(prev[convKey] || []), message]
      }));
    }
  };

  // Call functions
  const handleCall = (type) => {
    const message = {
      id: generateId(),
      type: type === 'voice' ? 'call' : 'videoCall',
      duration: 'Calling...',
      sender: currentUser.id,
      timestamp: Date.now()
    };
    
    if (selectedContact) {
      const convKey = `${currentUser.id}_${selectedContact.id}`;
      setConversations(prev => ({
        ...prev,
        [convKey]: [...(prev[convKey] || []), message]
      }));
    }
  };

  // Setup screen
  if (currentView === 'setup') {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all animate-slideUp">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mb-2">
              Chat Orbit
            </h1>
            <p className="text-gray-600">Connect with people around the world</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleSetup(formData.get('name'), formData.get('number'));
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-0 transition-colors"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Number</label>
                <input
                  type="tel"
                  name="number"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-0 transition-colors"
                  placeholder="e.g., +1234567890"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main app
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.number.includes(searchQuery)
  );

  const getCurrentConversation = () => {
    if (selectedContact) {
      return conversations[`${currentUser.id}_${selectedContact.id}`] || [];
    }
    if (selectedGroup) {
      return conversations[`group_${selectedGroup.id}`] || [];
    }
    return [];
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-orange-100 px-6 py-4 flex items-center justify-between">
        {currentView === 'chat' || currentView === 'groupChat' ? (
          <>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentView('chats');
                  setSelectedContact(null);
                  setSelectedGroup(null);
                }}
                className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedContact ? selectedContact.name[0] : selectedGroup?.avatar}
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">
                  {selectedContact?.name || selectedGroup?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedContact?.number || `${selectedGroup?.members.length} members`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCall('voice')}
                className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Phone className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => handleCall('video')}
                className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Video className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-orange-50 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                Chat Orbit
              </h1>
              <p className="text-sm text-gray-600">{currentUser?.name}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-orange-50 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Chats list view */}
        {currentView === 'chats' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-0 mb-4"
              />
              
              {filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No contacts yet</p>
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Add Your First Contact
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map(contact => {
                    const convKey = `${currentUser.id}_${contact.id}`;
                    const messages = conversations[convKey] || [];
                    const lastMessage = messages[messages.length - 1];
                    
                    return (
                      <div
                        key={contact.id}
                        onClick={() => {
                          setSelectedContact(contact);
                          setCurrentView('chat');
                        }}
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {contact.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {lastMessage ? (
                              lastMessage.type === 'text' ? lastMessage.text :
                              lastMessage.type === 'voice' ? '🎤 Voice message' :
                              lastMessage.type === 'file' ? '📎 ' + lastMessage.fileName :
                              lastMessage.type === 'call' ? '📞 Voice call' :
                              lastMessage.type === 'videoCall' ? '📹 Video call' : ''
                            ) : contact.number}
                          </p>
                        </div>
                        {lastMessage && (
                          <span className="text-xs text-gray-400">
                            {formatTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discover/Meet New People view */}
        {currentView === 'discover' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Meet New People</h2>
                <button
                  onClick={() => setShowShareNumber(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Share
                </button>
              </div>
              
              {publicPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No posts yet</p>
                  <p className="text-sm text-gray-400">Be the first to share your number!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publicPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {post.userName[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{post.userName}</h3>
                            <p className="text-sm text-gray-500">{post.userNumber}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{formatTime(post.timestamp)}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{post.text}</p>
                      
                      <button
                        onClick={() => {
                          setNewContactNumber(post.userNumber);
                          setNewContactName(post.userName);
                          setShowAddContact(true);
                        }}
                        className="w-full py-2 bg-orange-50 text-orange-600 rounded-xl font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Contact
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications view */}
        {currentView === 'notifications' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Pending Requests</h2>
              
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map(request => (
                    <div key={request.id} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {request.fromName[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{request.fromName}</h3>
                            <p className="text-sm text-gray-500">{request.fromNumber}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setPendingRequests(prev => prev.filter(r => r.id !== request.id))}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Groups view */}
        {currentView === 'groups' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Groups</h2>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>
              
              {groups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No groups yet</p>
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Create Your First Group
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.map(group => (
                    <div
                      key={group.id}
                      onClick={() => {
                        setSelectedGroup(group);
                        setCurrentView('groupChat');
                      }}
                      className="flex items-center gap-3 p-4 bg-white rounded-2xl hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-2xl">
                        {group.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.members.length} members</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat view */}
        {(currentView === 'chat' || currentView === 'groupChat') && (
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {getCurrentConversation().map(message => {
                const isMe = message.sender === currentUser.id;
                
                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isMe ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white' : 'bg-white text-gray-800'} rounded-2xl px-4 py-3 shadow-sm`}>
                      {message.type === 'text' && (
                        <p>{message.text}</p>
                      )}
                      {message.type === 'voice' && (
                        <div className="flex items-center gap-3">
                          <Mic className="w-5 h-5" />
                          <div className="flex-1 h-8 bg-white/20 rounded-lg"></div>
                          <span className="text-sm">{message.duration}</span>
                        </div>
                      )}
                      {message.type === 'file' && (
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-5 h-5" />
                          <div>
                            <p className="font-medium">{message.fileName}</p>
                            <p className="text-xs opacity-75">{message.fileSize}</p>
                          </div>
                        </div>
                      )}
                      {(message.type === 'call' || message.type === 'videoCall') && (
                        <div className="flex items-center gap-3">
                          {message.type === 'call' ? <Phone className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                          <span>{message.duration}</span>
                        </div>
                      )}
                      <span className="text-xs opacity-75 mt-1 block">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message input */}
            <div className="p-4 bg-white border-t border-orange-100">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={handleVoiceRecord}
                  className={`p-2 rounded-lg transition-colors ${isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-orange-50 text-gray-600'}`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-0"
                />
                
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t border-orange-100 px-6 py-3 flex items-center justify-around">
        <button
          onClick={() => setCurrentView('chats')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'chats' || currentView === 'chat' ? 'text-orange-600' : 'text-gray-500'}`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-medium">Chats</span>
        </button>
        
        <button
          onClick={() => setCurrentView('discover')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'discover' ? 'text-orange-600' : 'text-gray-500'}`}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Discover</span>
        </button>
        
        <button
          onClick={() => setShowAddContact(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-500 hover:text-orange-600"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center -mt-6 shadow-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </button>
        
        <button
          onClick={() => setCurrentView('notifications')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative ${currentView === 'notifications' ? 'text-orange-600' : 'text-gray-500'}`}
        >
          <Bell className="w-6 h-6" />
          {pendingRequests.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          <span className="text-xs font-medium">Requests</span>
        </button>
        
        <button
          onClick={() => setCurrentView('groups')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'groups' || currentView === 'groupChat' ? 'text-orange-600' : 'text-gray-500'}`}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Groups</span>
        </button>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add Contact</h3>
              <button
                onClick={() => {
                  setShowAddContact(false);
                  setNewContactNumber('');
                  setNewContactName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="What name do you want to use?"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number</label>
                <input
                  type="tel"
                  value={newContactNumber}
                  onChange={(e) => setNewContactNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-0"
                />
              </div>
              
              <button
                onClick={handleAddContact}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Number Modal */}
      {showShareNumber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Share Your Number</h3>
              <button
                onClick={() => {
                  setShowShareNumber(false);
                  setSharePostText('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Your number</p>
                <p className="font-semibold text-gray-800">{currentUser?.number}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={sharePostText}
                  onChange={(e) => setSharePostText(e.target.value)}
                  placeholder="Say something about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-0 resize-none"
                />
              </div>
              
              <button
                onClick={handleShareNumber}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Share Publicly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-scaleIn max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Create Group</h3>
              <button
                onClick={() => {
                  setShowCreateGroup(false);
                  setGroupName('');
                  setSelectedGroupMembers([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {contacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => {
                        setSelectedGroupMembers(prev => 
                          prev.includes(contact.id) 
                            ? prev.filter(id => id !== contact.id)
                            : [...prev, contact.id]
                        );
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        selectedGroupMembers.includes(contact.id) 
                          ? 'bg-orange-50 border-2 border-orange-400' 
                          : 'bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {contact.name[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                        <p className="text-sm text-gray-500">{contact.number}</p>
                      </div>
                      {selectedGroupMembers.includes(contact.id) && (
                        <Check className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedGroupMembers.length === 0}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
