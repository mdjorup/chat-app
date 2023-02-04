import styles from "@/styles/ChatRoomPanel.module.css";
import { API, graphqlOperation } from "aws-amplify";
import { useEffect, useState } from "react";
import { ChatRoom, ListMessagesQuery, Message } from "../API";
import { listMessages } from "../graphql/queries";
import { onCreateMessage } from "../graphql/subscriptions";
import ChatRoomComponent from "./ChatRoomComponent";
import MessageComponent from "./MessageComponent";

// this one renders the list of chat rooms on the left, and passes the messages into the active one on the right

export default function ChatRoomPanel({
    chatRooms = [],
}: {
    chatRooms: ChatRoom[];
}) {
    const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom>();
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        // @ts-ignore
        const subscription = API.graphql(
            graphqlOperation(onCreateMessage) //@ts-ignore
        ).subscribe({
            next: (response) => {
                console.log(response);
            },
        });
    }, []);

    const handleChatRoomClick = async (chatRoom: ChatRoom) => {
        const response = (await API.graphql(
            graphqlOperation(listMessages, {
                filter: {
                    chatRoomMessagesId: {
                        eq: chatRoom.id,
                    },
                },
            })
        )) as {
            data: ListMessagesQuery;
        };
        const messages = response.data.listMessages;
        if (messages) {
            setActiveChatRoom(chatRoom);
            const items = messages.items as Message[];
            setMessages([...items]);
        }
    };

    return (
        <div className={styles.chatRoomPanel}>
            <div className="chatListWrapper">
                <h3>Chat Rooms</h3>
                {chatRooms.map((cr) => (
                    <ChatRoomComponent
                        key={cr.id}
                        chatRoom={cr}
                        active={cr === activeChatRoom}
                        onClick={() => {
                            handleChatRoomClick(cr);
                        }}
                    ></ChatRoomComponent>
                ))}
            </div>
            <div className="chatMessagesWrapper">
                <div className="chatMessagesBody">
                    {messages &&
                        messages.map((message) => (
                            <MessageComponent
                                key={message?.id}
                                text={message?.content}
                                senderUsername={message?.owner}
                            ></MessageComponent>
                        ))}
                    {!activeChatRoom && <h3>No Selected Chat Room</h3>}
                </div>
                <div className="newChatWrapper "></div>
            </div>
        </div>
    );
}
