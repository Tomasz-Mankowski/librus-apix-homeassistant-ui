// Calls of the HALibrus integration from the cards (WebSocket API).

import type { HomeAssistant } from "../types";

/** Response of the action librus_apix.get_message_content (D-067). */
export interface MessageContent {
  id: string;
  author: string;
  title: string;
  date: string;
  content: string;
  attachments: string[];
}

interface CallServiceResult<T> {
  response: T;
}

/**
 * Full content of a message. Librus is read only the first time (that marks the
 * message read there); later calls return the copy kept by the integration.
 */
export async function getMessageContent(
  hass: HomeAssistant,
  entityId: string,
  messageId: string,
): Promise<MessageContent> {
  const result = await hass.callWS<CallServiceResult<MessageContent>>({
    type: "call_service",
    domain: "librus_apix",
    service: "get_message_content",
    service_data: { entity_id: entityId, message_id: messageId },
    return_response: true,
  });
  return result.response;
}

/** Readable text of a failed call (HA errors are objects with a message). */
export function errorText(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}
