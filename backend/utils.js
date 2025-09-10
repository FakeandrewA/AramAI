export const generateChatName = () => {
  const now = new Date();
  return `Chat - ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
