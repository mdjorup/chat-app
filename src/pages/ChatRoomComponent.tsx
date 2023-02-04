import { ChatRoom } from "../API";

function ChatRoomComponent({
    chatRoom,
    active = false,
    onClick,
}: {
    chatRoom: ChatRoom;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`chatRoomComponent ${active ? "active" : "inactive"}`}
        >
            <h6>{chatRoom.title}</h6>
            {chatRoom.members.map((member) => (
                <div key={member}>{member}</div>
            ))}
        </div>
    );
}

export default ChatRoomComponent;
