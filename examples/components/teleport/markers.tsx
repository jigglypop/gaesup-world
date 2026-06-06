import { TeleportMarker } from 'gaesup-world';

import { TELEPORT_POINTS } from './constants';

export function TeleportMarkers() {
  return (
    <>
      {TELEPORT_POINTS.map((destination) => (
        <TeleportMarker key={destination.id} destination={destination} yOffset={0.05} />
      ))}
    </>
  );
}
