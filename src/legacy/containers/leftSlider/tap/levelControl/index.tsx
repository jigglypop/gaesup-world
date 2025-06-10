import useUpdateRoom from "@store/update";
import * as S from "./style.css";

const PositionScaleControl = () => {
  const { current, setPositionDelta, setScale } = useUpdateRoom();

  if (!current) return null;

  const handleHeightChange = (axis: "x" | "y" | "z", d: boolean) => {
    if (!current.position) return;
    let delta = 0;
    if (axis === "x") {
      delta = d ? current.position[0] + 1 : current.position[0] - 1;
    } else if (axis === "y") {
      delta = d
        ? Math.min((current.position[1] + 1) / 4, 8)
        : Math.max((current.position[1] - 1) / 4, 0);
    } else {
      delta = d ? current.position[2] + 1 : current.position[2] - 1;
    }

    setPositionDelta(axis, delta);
  };

  const handleScaleChange = (axis: "x" | "y" | "z", increment: boolean) => {
    if (!current.scale) return;
    const currentValue = current.scale[axis === "x" ? 0 : axis === "y" ? 1 : 2];
    const newValue = increment
      ? Math.min(currentValue + 0.5, 4)
      : Math.max(currentValue - 0.5, 0.5);
    setScale(axis, newValue);
  };

  return (
    <div className={S.container}>
      <div className={S.section}>
        <h3 className={S.sectionTitle}>높이</h3>
        <div className={S.scaleControls}>
          {["x", "y", "z"].map((axis) => (
            <div
              key={axis}
              className={S.scaleControl}>
              <button
                onClick={() =>
                  handleHeightChange(axis as "x" | "y" | "z", true)
                }
                className={S.button}>
                ▲
              </button>
              <span className={S.value}>
                {axis.toUpperCase()} :{" "}
                {current?.position?.[
                  axis === "x" ? 0 : axis === "y" ? 1 : 2
                ].toFixed(1)}
              </span>
              <button
                onClick={() =>
                  handleHeightChange(axis as "x" | "y" | "z", false)
                }
                className={S.button}>
                ▼
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className={S.section}>
        <h3 className={S.sectionTitle}>크기</h3>
        <div className={S.scaleControls}>
          {["x", "y", "z"].map((axis) => (
            <div
              key={axis}
              className={S.scaleControl}>
              <button
                onClick={() => handleScaleChange(axis as "x" | "y" | "z", true)}
                className={S.button}>
                ▲
              </button>
              <span className={S.value}>
                {axis.toUpperCase()} :{" "}
                {current?.scale?.[
                  axis === "x" ? 0 : axis === "y" ? 1 : 2
                ].toFixed(1)}
              </span>
              <button
                onClick={() =>
                  handleScaleChange(axis as "x" | "y" | "z", false)
                }
                className={S.button}>
                ▼
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PositionScaleControl;
