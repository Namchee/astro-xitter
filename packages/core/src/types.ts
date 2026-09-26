import type { TweetUserVerifiedType } from './const';

interface TweetVideoVariant {
  type: string;
  src: string;
}

interface TweetVideo {
  aspectRatio: [number, number];
  contentType: string;
  durationMs?: number;
  poster: string;
  variants: TweetVideoVariant[];
}

interface FullTweet {
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

interface TweetEntities {
  hashtags?: Hashtag[];
  urls?: Url[];
  user_mentions?: UserMention[];
  symbols?: Symbol[];
  media?: Media[];
}

interface TweetBadge {
  url?: string;
  width?: number;
  height?: number;
}

interface TweetHighlightedLabel {
  description: string;
  url?: string;
  badge?: TweetBadge;
  badgeType?: string;
}

export interface TweetUser {
  id: string;
  name: string;
  screen_name: string;
  profile_image_shape: string;
  profile_image_url_https: string;
  is_blue_verified: boolean;
  verified: boolean;
  verified_type?: (typeof TweetUserVerifiedType)[keyof typeof TweetUserVerifiedType];
  highlighted_label?: TweetHighlightedLabel;
}

export interface TweetPhoto {
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

export interface TweetCard {
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

interface TweetTombstoneDetails {
  entities: TweetEntities;
  rtl: boolean;
  text: string;
}

/**
 * Represents a full tweet data fetched from Twitter's API.
 *
 * Contains user profile, the tweet itself, attachments, and other metadata such as
 * parent tweet, quote, etc.
 */
export interface Tweet {
  id_str: string;
  text: string;
  lang: string;
  in_reply_to_screen_name?: string;
  favorite_count: number;
  created_at: string;
  entities: TweetEntities;
  user: TweetUser;
  photos?: TweetPhoto[];
  video?: TweetVideo;
  conversation_count: number;
  news_action_type: string;
  quoted_tweet?: Tweet;
  parent?: Tweet;
  note_tweet?: FullTweet;
  card?: TweetCard;
}

export interface TweetTombstone {
  tombstone: TweetTombstoneDetails;
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

/**
 * A cache interface for Astro Xitter caching mechanism.
 *
 * The interface itself only requires 2 methods to be implemented:
 * `get` which should return a `Tweet` object and
 * `set` which should put a `Tweet` object to cache.
 *
 * The `delete` method is used to enfore 'refresh' when tweet is deleted / made private.
 *
 * Astro Xitter **does not** handle TTL, the consumer must handle it themselves.
 */
export interface XitterCache {
  get: (id: string) => MaybePromise<Tweet | undefined>;

  set: (
    id: string,
    entry: Tweet,
  ) => MaybePromise<void>;

  delete?: (id: string) => MaybePromise<void>;
}
