import { withAuthenticator } from "@aws-amplify/ui-react";
import { CognitoUser } from "amazon-cognito-identity-js";
import { API, Auth, withSSRContext } from "aws-amplify";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { ChatRoom, ListChatRoomsQuery } from "../API";
import { listChatRooms } from "../graphql/queries";
import ChatRoomPanel from "./ChatRoomPanel";

function Home({ preChatRooms = [] }: { preChatRooms: ChatRoom[] }) {
    const [user, setUser] = useState<CognitoUser>();
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>(preChatRooms);

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
                setChatRooms([
                    ...(response.data.listChatRooms?.items as ChatRoom[]),
                ]);
            } catch (error) {
                console.log("error getting chat rooms");
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

    return (
        <div>
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
