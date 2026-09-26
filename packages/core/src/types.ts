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

export interface Hashtag {
  indices: Indices;
  text: string;
}

export interface UserMention {
  id_str: string;
  indices: Indices;
  name: string;
  screen_name: string;
}

export interface Media {
  display_url: string;
  expanded_url: string;
  indices: Indices;
  url: string;
}

export interface Url {
  display_url: string;
  expanded_url: string;
  indices: Indices;
  url: string;
}

export interface Symbol {
  indices: Indices;
  text: string;
}

interface XitterEntities {
  hashtags?: Hashtag[];
  urls?: Url[];
  user_mentions?: UserMention[];
  symbols?: Symbol[];
  media?: Media[];
}

interface XitterBadge {
  url?: string;
  width?: number;
  height?: number;
}

interface XitterHighlightedLabel {
  description: string;
  url?: string;
  badge?: XitterBadge;
  badgeType?: string;
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
  highlighted_label?: XitterHighlightedLabel;
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

export interface StringValue {
  type: 'STRING';
  string_value: string;
}

export interface ImageValue {
  type: 'IMAGE';
  image_value: {
    url: string;
    width: number;
    height: number;
    alt?: string;
  };
}

export interface UserValue {
  type: 'USER';
  user_value: {
    id_str: string;
    path: string[];
  };
}

export type BindingValue = StringValue | ImageValue | UserValue;

export interface TwitterCardPlatform {
  platform: {
    device: {
      name: string;
      version: string;
    };
    audience?: {
      name: string;
    };
  };
}

export interface XitterCard {
  card_platform: TwitterCardPlatform;
  name: 'summary_large_image' | string;
  url: string;
  binding_values: {
    title?: StringValue;
    description?: StringValue;
    domain?: StringValue;
    site?: UserValue | StringValue;
    vanity_url?: StringValue;
    card_url?: StringValue;

    summary_photo_image?: ImageValue;
    summary_photo_image_small?: ImageValue;
    summary_photo_image_large?: ImageValue;
    summary_photo_image_x_large?: ImageValue;
    summary_photo_image_original?: ImageValue;
    summary_photo_image_alt_text?: StringValue;
    summary_photo_image_color?: StringValue;

    photo_image_full_size?: ImageValue;
    photo_image_full_size_small?: ImageValue;
    photo_image_full_size_large?: ImageValue;
    photo_image_full_size_x_large?: ImageValue;
    photo_image_full_size_original?: ImageValue;
    photo_image_full_size_alt_text?: StringValue;
    photo_image_full_size_color?: StringValue;

    thumbnail_image?: ImageValue;
    thumbnail_image_small?: ImageValue;
    thumbnail_image_large?: ImageValue;
    thumbnail_image_x_large?: ImageValue;
    thumbnail_image_original?: ImageValue;
    thumbnail_image_color?: StringValue;
  };
}

interface XitterTombstoneDetails {
  entities: XitterEntities;
  rtl: boolean;
  text: string;
}

export interface Xitter {
  id_str: string;
  text: string;
  lang: string;
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
  card?: XitterCard;
}

export interface XitterTombstone {
  tombstone: XitterTombstoneDetails;
}

export type XitterHost = TwitterHost | NitterHost;

interface TwitterHost {
  type: 'twitter';
};

interface NitterHost {
  type: 'nitter';
  origin: string;
}

type MaybePromise<T> = T | PromiseLike<T>;

export interface XitterCache {
  get: (id: string) => MaybePromise<Xitter | undefined>;

  set: (
    id: string,
    entry: Xitter,
  ) => MaybePromise<void>;

  delete?: (id: string) => MaybePromise<void>;
}
