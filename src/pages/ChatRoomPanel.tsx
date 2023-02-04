import styles from "@/styles/ChatRoomPanel.module.css";
import { CognitoUser } from "amazon-cognito-identity-js";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { useEffect, useState } from "react";
import {
    ChatRoom,
    CreateMessageInput,
    ListMessagesQuery,
    Message,
} from "../API";
import { createMessage } from "../graphql/mutations";
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

    const [newMessage, setNewMessage] = useState<string>("");

    useEffect(() => {
        // @ts-ignore
        const subscription = API.graphql(
            graphqlOperation(onCreateMessage) //@ts-ignore
        ).subscribe({
            next: (response) => {
                const newMessage = response.value.data.onCreateMessage;
                setMessages((messages) => [...messages, newMessage]);
            },
        });

        return () => {
            subscription.unsubscribe();
        };
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

    const handleNewMessage = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        const message = (
            event.currentTarget.elements.namedItem(
                "newMessage"
            ) as HTMLInputElement
        ).value;
        const user: CognitoUser = await Auth.currentAuthenticatedUser();

        const newMessageInput: CreateMessageInput = {
            content: message,
            owner: user.getUsername(),
            chatRoomMessagesId: activeChatRoom?.id,
        };
        console.log("got here2");
        const response = await API.graphql(
            graphqlOperation(createMessage, { input: newMessageInput })
        );
        setNewMessage("");
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
                {activeChatRoom && (
                    <form onSubmit={handleNewMessage}>
                        <input
                            type="text"
                            name="newMessage"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        ></input>
                        <button>New Chat</button>
                    </form>
                )}
            </div>
        </div>
    );
}
