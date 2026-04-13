import { Injectable } from '@nestjs/common';

export interface DetectedMention {
  type: 'user' | 'here' | 'channel' | 'everyone';
  userId?: string;
}

@Injectable()
export class MentionDetectorService {
  detect(content: string, userMap: Map<string, string>): DetectedMention[] {
    const mentions: DetectedMention[] = [];

    if (content.includes('@here')) mentions.push({ type: 'here' });
    if (content.includes('@channel')) mentions.push({ type: 'channel' });
    if (content.includes('@everyone')) mentions.push({ type: 'everyone' });

    const regex = /@([a-zA-Z0-9._-]+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const name = match[1].toLowerCase();
      if (['here', 'channel', 'everyone'].includes(name)) continue;
      for (const [userId, displayName] of userMap.entries()) {
        if (displayName.toLowerCase() === name || displayName.toLowerCase().replace(/\s/g, '') === name) {
          mentions.push({ type: 'user', userId });
          break;
        }
      }
    }
    return mentions;
  }
}
