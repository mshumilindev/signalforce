import { rssConnector } from './rssConnector.js';
import { staticConnector } from './staticConnector.js';
import type { SourceConnector, SourceDefinition } from '../types.js';

const connectorsByType = {
  rss: rssConnector,
  static: staticConnector,
} as const satisfies Record<SourceDefinition['type'], SourceConnector>;

export function getConnectorForSource(source: SourceDefinition): SourceConnector {
  return connectorsByType[source.type];
}
