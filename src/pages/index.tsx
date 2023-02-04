import styles from "@/styles/Home.module.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { CognitoUser } from "amazon-cognito-identity-js";
import { API, Auth, withSSRContext } from "aws-amplify";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import {
    ChatRoom,
    CreateChatRoomInput,
    CreateChatRoomMutation,
    ListChatRoomsQuery,
} from "../API";
import { createChatRoom } from "../graphql/mutations";
import { listChatRooms } from "../graphql/queries";
import ChatRoomPanel from "./ChatRoomPanel";

function Home({ preChatRooms = [] }: { preChatRooms: ChatRoom[] }) {
    const [user, setUser] = useState<CognitoUser>();
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([...preChatRooms]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const amplifyUser = await Auth.currentAuthenticatedUser();
                setUser(amplifyUser);
            } catch (err) {
                setUser(undefined);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const getMessages = async () => {
            try {
                const response = (await API.graphql({
                    query: listChatRooms,
                    authMode: "AMAZON_COGNITO_USER_POOLS",
                })) as {
                    auth: any;
                    data: ListChatRoomsQuery;
                };
                console.log("got here");
                setChatRooms([
                    ...(response.data.listChatRooms?.items as ChatRoom[]),
                ]);
            } catch (error) {
                console.log(error);
            }
        };

        getMessages();
    }, [user]);

    const signOut = async () => {
        try {
            Auth.signOut();
        } catch (error) {
            console.log("error signing out: ", error);
        }
    };

    const handleMakeNewChatRoom = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        const form = event.currentTarget;
        const username: string = (
            form.elements.namedItem("username") as HTMLInputElement
        ).value;
        const newMessage: string = (
            form.elements.namedItem("newMessage") as HTMLInputElement
        ).value;
        const chatRoomTitle: string = (
            form.elements.namedItem("chatRoomTitle") as HTMLInputElement
        ).value;

        if (!user) {
            return;
        }

        const newChatRoomDetails: CreateChatRoomInput = {
            title: chatRoomTitle,
            members: [user?.getUsername(), username],
        };

        try {
            const response = (await API.graphql({
                query: createChatRoom,
                authMode: "AMAZON_COGNITO_USER_POOLS",
                variables: { input: newChatRoomDetails },
            })) as {
                auth: any;
                data: CreateChatRoomMutation;
            };
            const newChatRoom = response.data.createChatRoom;
            // const newMessageInput: CreateMessageInput = {
            //     content: newMessage,
            //     owner: user.getUsername(),
            //     chatRoomMessagesId: newChatRoom?.id,
            // };
            // const sentMessageResponse = (await API.graphql({
            //     query: createMessage,
            //     authMode: "AMAZON_COGNITO_USER_POOLS",
            //     variables: { input: newMessageInput },
            // })) as {
            //     auth: any;
            //     data: CreateMessageMutation;
            // };
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={styles.home}>
            <h1>Welcome, {user?.getUsername()}</h1>
            <p>Start a new chat:</p>
            <form onSubmit={handleMakeNewChatRoom}>
                <label htmlFor="username">Username:</label>
                <input type="text" name="username"></input>
                <label htmlFor="newMessage">Message:</label>
                <input type="text" name="newMessage"></input>
                <label htmlFor="chatRoomTitle">New Room Title</label>
                <input type="text" name="chatRoomTitle"></input>
                <button type="submit">New Chat</button>
            </form>
            <ChatRoomPanel chatRooms={chatRooms} />
            <button onClick={signOut}>Sign Out</button>
        </div>
    );
}

export default withAuthenticator(Home);

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const SSR = withSSRContext({ req });

    try {
        const user = await SSR.Auth.currentAuthenticatedUser();
        const response = (await SSR.API.graphql({
            query: listChatRooms,
            // use authMode: AMAZON_COGNITO_USER_POOLS to make a request on the current user's behalf
            authMode: "AMAZON_COGNITO_USER_POOLS",
        })) as {
            auth: any;
            data: ListChatRoomsQuery;
        };
        return {
            props: {
                chatRooms: response.data.listChatRooms?.items,
            },
        };
    } catch {
        return {
            props: {
                chatRooms: [],
            },
        };
    }
};
