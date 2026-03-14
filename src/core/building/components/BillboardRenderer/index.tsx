import React, { Suspense } from 'react';

import Billboard from '../mesh/billboard';
import { BillboardConfig } from '../../types';

interface Props {
  billboards: BillboardConfig[];
  isEditMode: boolean;
  onClick?: (id: string) => void;
}

export const BillboardRenderer = React.memo(function BillboardRenderer({
  billboards,
  isEditMode,
  onClick,
}: Props) {
  if (billboards.length === 0) return null;

  return (
    <group name="billboard-system">
      {billboards.map((bb) => (
        <group
          key={bb.id}
          position={[bb.position.x, bb.position.y, bb.position.z]}
          rotation={[0, (bb.rotation?.y ?? 0) + Math.PI, 0]}
          {...(isEditMode && onClick ? { onClick: (e: any) => { e.stopPropagation(); onClick(bb.id); } } : {})}
        >
          <Suspense fallback={null}>
            <Billboard
              text={bb.text ?? 'HELLO'}
              imageUrl={bb.imageUrl}
              width={bb.width}
              height={bb.height}
              color={bb.color ?? '#00ff88'}
            />
          </Suspense>
        </group>
      ))}
    </group>
  );
});
