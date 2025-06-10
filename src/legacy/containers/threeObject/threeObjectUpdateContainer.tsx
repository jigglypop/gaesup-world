"use client";

import ThreeObject from "@common/threeObject";
import useThreeObject from "@store/threeObject";

export default function ThreeObjectUpdateContainer() {
  const { update, create } = useThreeObject();
  const threeObjects = Object.values({
    ...update,
    ...create,
  });

  return (
    <>
      {threeObjects.map((threeObject, key) => (
        <group key={key}>
          <ThreeObject
            {...threeObject}
            isUpdate={true}
          />
        </group>
      ))}
    </>
  );
}
