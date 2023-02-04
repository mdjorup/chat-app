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
        ></div>
    );
}

export default ChatRoomComponent;
