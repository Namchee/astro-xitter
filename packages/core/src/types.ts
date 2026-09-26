import type { TweetUserVerifiedType } from './const';

/**
 * A video variant with its MIME type and source URL.
 */
interface TweetVideoVariant {
  type: string;
  src: string;
}

/**
 * Video metadata and available playback variants.
 */
interface TweetVideo {
  aspectRatio: [number, number];
  contentType: string;
  durationMs?: number;
  poster: string;
  variants: TweetVideoVariant[];
}

/**
 * A reference to a complete tweet.
 */
interface FullTweet {
  id: string;
}

/**
 * The start and end positions of an entity in tweet text.
 */
type Indices = [number, number];

/**
 * A hashtag found in tweet text.
 */
export interface Hashtag {
  indices: Indices;
  text: string;
}

/**
 * A user mention found in tweet text.
 */
export interface UserMention {
  id_str: string;
  indices: Indices;
  name: string;
  screen_name: string;
}

/**
 * A media URL included in tweet text.
 */
export interface Media {
  display_url: string;
  expanded_url: string;
  indices: Indices;
  url: string;
}

/**
 * A URL found in tweet text.
 */
export interface Url {
  display_url: string;
  expanded_url: string;
  indices: Indices;
  url: string;
}

/**
 * A cashtag found in tweet text.
 */
export interface Symbol {
  indices: Indices;
  text: string;
}

/**
 * Entities detected in a tweet.
 */
interface TweetEntities {
  hashtags?: Hashtag[];
  urls?: Url[];
  user_mentions?: UserMention[];
  symbols?: Symbol[];
  media?: Media[];
}

/**
 * Image metadata for a highlighted user label.
 */
interface TweetBadge {
  url?: string;
  width?: number;
  height?: number;
}

/**
 * A label highlighted on a user's profile.
 */
interface TweetHighlightedLabel {
  description: string;
  url?: string;
  badge?: TweetBadge;
  badgeType?: string;
}

/**
 * The author of a tweet.
 */
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

/**
 * A photo attached to a tweet.
 */
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

/**
 * A string value in a Twitter card.
 */
export interface StringValue {
  type: 'STRING';
  string_value: string;
}

/**
 * An image value in a Twitter card.
 */
export interface ImageValue {
  type: 'IMAGE';
  image_value: {
    url: string;
    width: number;
    height: number;
    alt?: string;
  };
}

/**
 * A user value in a Twitter card.
 */
export interface UserValue {
  type: 'USER';
  user_value: {
    id_str: string;
    path: string[];
  };
}

/**
 * A value used by a Twitter card binding.
 */
export type BindingValue = StringValue | ImageValue | UserValue;

/**
 * Platform and audience information for a Twitter card.
 */
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

/**
 * A Twitter card attached to a tweet.
 */
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

/**
 * Details explaining why a tweet is unavailable.
 */
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

/**
 * An unavailable tweet and the reason it cannot be displayed.
 */
export interface TweetTombstone {
  tombstone: TweetTombstoneDetails;
}

/**
 * A supported host for fetching tweet data.
 */
export type XitterHost = TwitterHost | NitterHost;

/**
 * The official Twitter host configuration.
 */
interface TwitterHost {
  type: 'twitter';
};

/**
 * A Nitter instance host configuration.
 */
interface NitterHost {
  type: 'nitter';
  origin: string;
}

/**
 * A value that may be returned synchronously or asynchronously.
 */
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
