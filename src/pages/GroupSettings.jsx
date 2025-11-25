
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator } from
"@/components/ui/dropdown-menu";
import { ArrowLeft, UserPlus, Check, X, MoreVertical, Crown, UserX, Flag, MessageSquare } from "lucide-react"; // Added MessageSquare

// Sample Data (replace with API calls in a real app)
const samplePendingUsers = [
{ id: 'user-pending-1', name: "John Doe", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop" },
{ id: 'user-pending-2', name: "Jane Smith", avatar: "https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=40&h=40&fit=crop" }];


// Updated sample data to match the mockMembers structure from the outline
const mockMembersData = [
{ id: 'user-member-1', name: "Saloni Bhatia", avatar: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=40&h=40&fit=crop", role: "Owner", joinedDate: "Jan 1, 2023" },
{ id: 'user-member-2', name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=40&h=40&fit=crop", role: "Admin", joinedDate: "Feb 15, 2023" },
{ id: 'user-member-3', name: "Mike Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop", role: "Member", joinedDate: "Mar 1, 2023" },
{ id: 'user-member-4', name: "Emma Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop", role: "Member", joinedDate: "Apr 10, 2023" }];

// Helper function to create URLs for navigation. In a real app, this would use a router's create path utility.
const createPageUrl = (path) => path;

export default function GroupSettings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const [pendingUsers, setPendingUsers] = useState(samplePendingUsers);
  // Renamed 'members' state to 'mockMembers' to align with the outline
  const [mockMembers, setMockMembers] = useState(mockMembersData);

  // New states for invite functionality
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  // Added activeTab state as implied by the outline, defaulting to 'members'
  const [activeTab, setActiveTab] = useState('members');

  // Mock group data for the invite modal text regarding privacy
  const [groupData] = useState({ privacy: 'approval' }); // Can be 'approval' or 'open'

  const handleApprove = (userId) => {
    alert(`User ${userId} approved.`);
    // In a real application, you might move the user from pendingUsers to mockMembers here
    setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
  };

  const handleDeny = (userId) => {
    alert(`User ${userId} denied.`);
    setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
  };

  // Updated handleReportMember to accept memberId and retrieve member name
  const handleReportMember = (memberId) => {
    const member = mockMembers.find((m) => m.id === memberId);
    if (member) {
      alert(`Member ${member.name} has been reported. We'll review this report within 24 hours.`);
    }
  };

  // New handler for promoting/demoting a member to/from admin role
  const handlePromoteToAdmin = (memberId) => {
    setMockMembers((prevMembers) =>
    prevMembers.map((member) =>
    member.id === memberId ?
    { ...member, role: member.role === 'Admin' ? 'Member' : 'Admin' } // Toggle role
    : member
    )
    );
    const member = mockMembers.find((m) => m.id === memberId);
    if (member) {
      alert(`${member.name} has been ${member.role === 'Admin' ? 'demoted to Member' : 'promoted to Admin'}.`);
    }
  };

  // New handler for removing a member from the group
  const handleRemoveMember = (memberId) => {
    const member = mockMembers.find((m) => m.id === memberId);
    if (member && window.confirm(`Are you sure you want to remove ${member.name} from the group?`)) {
      setMockMembers((prevMembers) => prevMembers.filter((m) => m.id !== memberId));
      alert(`${member.name} has been removed from the group.`);
    }
  };

  // Add function to start a chat with a member
  const startChatWithMember = (member) => {
    // Navigate to ChatWindow with the member's ID to start a 1-on-1 chat
    navigate(createPageUrl(`ChatWindow?user=${encodeURIComponent(member.name)}`));
  };

  // Add function to navigate to member's profile
  const goToMemberProfile = (member) => {
    navigate(createPageUrl(`CuratorProfile?name=${encodeURIComponent(member.name)}`));
  };

  // New handler for sending invitations
  const handleSendInvites = () => {
    if (!inviteEmails.trim()) {
      alert("Please enter at least one email address.");
      return;
    }

    // Parse emails from textarea (split by comma, newline, or space)
    const emailList = inviteEmails.
    split(/[,\n\s]+/).
    map((email) => email.trim()).
    filter((email) => email && email.includes('@'));

    if (emailList.length === 0) {
      alert('Please enter valid email addresses.');
      return;
    }

    // Simulate sending invitations
    alert(`Invitations sent to ${emailList.length} people:\n${emailList.join('\n')}\n\nThey will receive an email with a link to join your community group.`);

    setShowInviteModal(false);
    setInviteEmails('');
    setInviteMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8"> {/* Changed pb-20 md:pb-8 to py-8 */}
      <div className="mx-auto px-4 max-w-4xl"> {/* Added py-6 as per original, outline removes it */}
        <header className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Manage Group</h1>
            <p className="text-gray-500 text-sm">Review requests and manage members for your community.</p>
          </div>
        </header>

        {/* The overall space-y-8 container which was wrapping sections is being replaced by direct sibling sections within max-w-4xl */}
        {/* The outline's structure puts sections as siblings to the header. I'm keeping a similar flow but adhering to outline's div classes. */}
        {/* Pending Requests */}
        {pendingUsers.length > 0 &&
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8"> {/* Added mb-8 for spacing between sections */}
            <h3 className="text-lg font-semibold mb-4">Pending Requests ({pendingUsers.length})</h3>
            <div className="space-y-3">
              {pendingUsers.map((user) =>
            <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(user.id)}>
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Approve</span>
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleDeny(user.id)}>
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Deny</span>
                    </Button>
                  </div>
                </div>
            )}
            </div>
          </div>
        }

        {/* Members Section - Refactored as per outline */}
        {activeTab === "members" &&
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4"> {/* Added mb-4 to give space from the list below it */}
              <h3 className="text-lg font-semibold">Members ({mockMembers.length})</h3>
              <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Members
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200"> {/* Changed rounded-2xl to rounded-lg as per outline */}
              {mockMembers.map((member, index) =>
            <div key={member.id} className={`p-4 flex items-center justify-between group ${index !== mockMembers.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <button
                onClick={() => goToMemberProfile(member)}
                className="flex items-center gap-3 flex-grow min-w-0 text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">

                    <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0" /* Changed w-10 h-10 to w-12 h-12 */ />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate group-hover:underline">{member.name}</h4>
                        {member.role === 'Owner' &&
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Owner
                          </div>
                    }
                        {member.role === 'Admin' &&
                    <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
                    }
                      </div>
                      <p className="text-sm text-gray-500">Joined {member.joinedDate}</p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 pl-2">
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startChatWithMember(member)}
                  className="hidden sm:inline-flex">

                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>

                    {/* Dropdown menu for member actions, not shown for the 'Owner' role */}
                    {member.role !== 'Owner' &&
                <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full"> {/* Changed h-8 w-8 text-gray-500 to w-8 h-8 rounded-full */}
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                      className="sm:hidden" /* Only show on small screens, as button is for large */
                      onClick={() => startChatWithMember(member)}>

                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat with {member.name.split(' ')[0]}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePromoteToAdmin(member.id)}>
                            <Crown className="w-4 h-4 mr-2" />
                            {member.role === 'Admin' ? 'Remove Admin' : 'Make Admin'} {/* Simplified text */}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                      onClick={() => handleReportMember(member.id)}
                      className="text-red-600">
                            <Flag className="w-4 h-4 mr-2" />
                            Report Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600">
                            <UserX className="w-4 h-4 mr-2" />
                            Remove from Group {/* Changed to 'Remove from Group' */}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                }
                  </div>
                </div>
            )}
            </div>
          </div>
        }
      </div>

      {/* Invite Members Modal - New section */}
      {showInviteModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white mr-5 mb-12 ml-5 pt-5 pr-6 pb-5 pl-6 rounded-2xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Invite Members</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="invite-emails" className="block text-sm font-medium mb-2">Email Addresses</label>
                <textarea
                id="invite-emails"
                className="px-3 w-full border border-gray-300 rounded-lg resize-none focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Enter email addresses, separated by commas or new lines..."
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)} />

                <p className="text-xs text-gray-500 mt-1">
                  You can invite multiple people at once
                </p>
              </div>

              <div>
                <label htmlFor="invite-message" className="block text-sm font-medium mb-2">Invitation Message (optional)</label>
                <textarea
                id="invite-message"
                className="px-3 w-full border border-gray-300 rounded-lg resize-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Add a personal message to your invitation..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)} />

              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 Invitees will receive an email with a link to join your community group.
                  {groupData?.privacy === 'approval' ? ' They will still need approval to join.' : ' They can join immediately.'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button
              variant="outline"
              onClick={() => {
                setShowInviteModal(false);
                setInviteEmails('');
                setInviteMessage('');
              }}>
                Cancel
              </Button>
              <Button
              onClick={handleSendInvites}
              disabled={!inviteEmails.trim()} // Disable if no emails are entered
              className="bg-blue-600 hover:bg-blue-700 text-white">
                Send Invitations
              </Button>
            </div>
          </div>
        </div>
      }

    </div>);

}