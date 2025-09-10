export const generateChatName = () => {
  const now = new Date();
  return `Chat - ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export const safeJSONParse = (str) => {
  try {
    // Replace invalid \' with just '
    const fixed = str.replace(/\\'/g, "'");
    return JSON.parse(fixed);
  } catch (e) {
    console.error("Failed to parse:", str, e);
    return null;
  }
}
