import { MAX_MESSAGE_LENGTH } from "./chatSlice";

export function validateMessage(message) {
    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
        return { 
            valid: false, 
            error: 'Message cannot be empty.' 
        };
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        return { 
            valid: false,
             error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`
        };
    }

    return { valid: true, error: null };
}