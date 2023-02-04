function MessageComponent({
    text,
    senderUsername,
}: {
    text: string | undefined;
    senderUsername: string | undefined;
}) {
    return (
        <div>
            {text} from {senderUsername}
        </div>
    );
}

export default MessageComponent;
