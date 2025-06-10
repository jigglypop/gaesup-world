"use client";

import { getThreeObjects } from "@api/threeObject";
import ThreeObject from "@common/threeObject";
import { min } from "@constants/time";
import useThreeObject from "@store/threeObject";
import { threeObjectResponseType } from "@store/threeObject/type";
import { useQuery } from "@tanstack/react-query";

export default function ThreeObjectContainer({
  isUpdate = false,
}: {
  isUpdate: boolean;
}) {
  const { data } = useQuery<threeObjectResponseType>({
    queryKey: ["three_objects"],
    queryFn: getThreeObjects,
    staleTime: 10 * min,
  });
  const { threeObject } = useThreeObject();
  return (
    <>
      {data &&
        data
          .filter(
            (obj) =>
              obj.three_object_id &&
              !threeObject.delete.includes(obj.three_object_id)
          )
          .map((threeObject) => (
            <group key={threeObject.three_object_id}>
              <ThreeObject
                {...threeObject}
                isUpdate={isUpdate}
                color={threeObject.color}
                pamplet_url={threeObject.pamplet_url}
                poster_url={threeObject.poster_url}
              />
            </group>
          ))}
    </>
  );
}
