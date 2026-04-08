/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Source metadata for a cue extracted from a media track.
 *
 * A `TrackSource` instance identifies a cue in a media track (audio, video, subtitles, screen-recording captions,
 * etc.). A *cue* here refers to any discrete segment that was pulled out of the original asset, e.g., a subtitle
 * block, an audio clip, or a timed marker in a screen-recording.
 */
export type TrackSource = {
  /**
   * Identifies this type of source.
   */
  kind?: string;
  /**
   * Start time offset of the track cue in seconds
   */
  start_time: number;
  /**
   * End time offset of the track cue in seconds
   */
  end_time: number;
  /**
   * An identifier of the cue
   */
  identifier?: (string | null);
  /**
   * The name of the voice in this track (the speaker)
   */
  voice?: (string | null);
};

