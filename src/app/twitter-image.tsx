import { LUXPADS_OG_ALT, LUXPADS_OG_SIZE, luxpadsShareCardImageResponse } from "@/lib/og/luxpads-share-card";

export const alt = LUXPADS_OG_ALT;
export const size = LUXPADS_OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return luxpadsShareCardImageResponse();
}
