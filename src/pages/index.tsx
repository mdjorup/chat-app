import { withAuthenticator } from "@aws-amplify/ui-react";
import { CognitoUser } from "amazon-cognito-identity-js";
import { Auth, withSSRContext } from "aws-amplify";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { ChatRoom, ListChatRoomsQuery } from "../API";
import { listChatRooms } from "../graphql/queries";

function Home({ chatRooms: [] }: { chatRooms: ChatRoom[] }) {
    const [user, setUser] = useState<CognitoUser>();

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

    return <div>{user?.getUsername()}Hello World!</div>;
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
