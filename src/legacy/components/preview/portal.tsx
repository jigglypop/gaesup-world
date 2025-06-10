"use client";

import Portal from "@components/portal";
import useModal from "@store/modal";
import usePortal from "@store/portal";
import useUpdateRoom from "@store/update";

export default function PortalEditor() {
  const { updateRoom } = useUpdateRoom();
  const { title } = usePortal();
  const { current } = updateRoom;
  const { isOpen } = useModal();

  return (
    <>
      {current && (
        <>
          <group position={isOpen ? [0, 0, 0] : current.position}>
            <Portal
              id={"-1"}
              title={title}
              position={[0, 0, 0]}
            />
          </group>
        </>
      )}
    </>
  );
}
