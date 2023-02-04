import styles from "@/styles/ChatRoomComponent.module.css";
import { CognitoUser } from "@aws-amplify/auth";
import { Card, Flex, Text } from "@aws-amplify/ui-react";
import { ChatRoom } from "./API";

function ChatRoomComponent({
    chatRoom,
    active = false,
    onClick,
    user,
}: {
    chatRoom: ChatRoom;
    active: boolean;
    onClick: () => void;
    user: CognitoUser;
}) {
    const getMembersString = (members: string[]) => {
        let username: string = user.getUsername();
        const others = members.filter((value) => value !== username);
        return others.join(", ");
    };
    return (
        <Card
            variation="elevated"
            onClick={onClick}
            backgroundColor={active ? "#4fa8dc" : "transparent"}
            className={styles.chatRoomComponent}
        >
            <Flex justifyContent="space-between">
                <Flex direction="column" gap="s">
                    <Text fontSize="x-large">{chatRoom.title}</Text>
                    <Text>{getMembersString(chatRoom.members)}</Text>
                </Flex>
            </Flex>
        </Card>
        // <div
        //     onClick={onClick}
        //     className={`chatRoomComponent ${active ? "active" : "inactive"}`}
        // >
        //     <Text>{chatRoom.title}</Text>
        //     <Badge variation="success">New</Badge>
        //     {chatRoom.members.map((member) => (
        //         <div key={member}>{member}</div>
        //     ))}
        // </div>
    );
}

export default ChatRoomComponent;
