import { useState } from "react";
import { ChatRoom } from "../API";
import ChatRoomComponent from "./ChatRoomComponent";
import MessageComponent from "./MessageComponent";

// this one renders the list of chat rooms on the left, and passes the messages into the active one on the right

export default function ChatRoomPanel({
    chatRooms = [],
}: {
    chatRooms: ChatRoom[];
}) {
    const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom>();

    return (
        <div className="chatRoomPanel">
            <div className="chatListWrapper">
                {chatRooms.map((cr) => (
                    <ChatRoomComponent
                        key={cr.id}
                        chatRoom={cr}
                        active={cr === activeChatRoom}
                        onClick={() => setActiveChatRoom(cr)}
                    ></ChatRoomComponent>
                ))}
            </div>
            <div className="chatMessagesWrapper">
                <div className="chatMessagesBody">
                    {activeChatRoom?.messages?.items.map((message) => (
                        <MessageComponent
                            key={message?.id}
                            text={message?.content}
                            senderUsername={message?.owner}
                        ></MessageComponent>
                    ))}
                </div>
                <div className="newChatWrapper "></div>
            </div>
        </div>
    );
}
