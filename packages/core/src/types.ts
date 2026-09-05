import type { XitterUserVerifiedType } from './const';

interface XitterVideoVariant {
  type: string;
  src: string;
}

interface XitterVideo {
  aspectRatio: [number, number];
  contentType: string;
  durationMs?: number;
  poster: string;
  variants: XitterVideoVariant[];
}

interface FullXitter {
  id: string;
}

type Indices = [number, number];

interface Hashtag {
  indices: Indices;
  text: string;
}

interface UserMention {
  id_str: string;
  indices: Indices;
  name: string;
  screen_name: string;
}

interface Media {
  display_url: string;
  expanded_url: string;
  indices: Indices;
  url: string;
}

interface Url {
  display_url: string;
  expanded_url: string;
  indices: Indices;
  url: string;
}

interface Symbol {
  indices: Indices;
  text: string;
}

interface XitterEntities {
  hashtags: Hashtag[]
  urls: Url[];
  user_mentions: UserMention[];
  symbols: Symbol[];
  media?: Media[];
}

export interface XitterUser {
  id: string;
  name: string;
  screen_name: string;
  profile_image_shape: string;
  profile_image_url_https: string;
  is_blue_verified: boolean;
  verified: boolean;
  verified_type?: (typeof XitterUserVerifiedType)[keyof typeof XitterUserVerifiedType];
}

export interface XitterPhoto {
  backgroundColor?: {
    red: number;
    green: number;
    blue: number;
  };
  crop?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  expandedUrl: string;
  url: string;
  width: number;
  height: number;
}

export interface Xitter {
  id_str: string;
  text: string;
  in_reply_to_screen_name?: string;
  favorite_count: number;
  created_at: string;
  entities: XitterEntities;
  user: XitterUser;
  photos?: XitterPhoto[];
  video?: XitterVideo;
  conversation_count: number;
  news_action_type: string;
  quoted_tweet?: Xitter;
  parent?: Xitter;
  note_tweet?: FullXitter;
}
