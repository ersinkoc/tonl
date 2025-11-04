/**
 * TONL Streaming API
 *
 * Memory-efficient processing of large files
 */

export {
  streamQuery,
  streamAggregate,
  streamCount,
  streamCollect,
  StreamPipeline,
  type StreamQueryOptions
} from './query.js';

export { createEncodeStream, encodeIterator } from './encode-stream.js';
export { createDecodeStream, decodeIterator } from './decode-stream.js';
export type { StreamEncodeOptions, StreamDecodeOptions } from './types.js';
