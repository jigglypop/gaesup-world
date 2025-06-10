"use client";

import Portal from "@components/portal";
import usePortal from "@store/portal";
import { usePortalQuery } from "@store/portal/query";

export default function PortalContainer() {
  const { portals } = usePortalQuery();
  const { update, create } = usePortal();

  return (
    <>
      {[...(portals || []), ...Object.values({ ...update, ...create })].map(
        (portal) => (
          <Portal
            id={portal.id}
            title={portal.title}
            position={portal.position}
          />
        )
      )}
    </>
  );
}
