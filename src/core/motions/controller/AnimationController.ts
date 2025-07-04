import { getGlobalAnimationBridge } from "@/core/animation/hooks/useAnimationBridge";
import { GameStatesType } from "@stores/types";

export class AnimationController {
  private animationBridge = getGlobalAnimationBridge();
  private lastAnimation = "idle";

  update(gameStates: GameStatesType) {
    const { isMoving, isRunning, isJumping, isFalling } = gameStates;
    let newAnimation = "idle";

    if (isJumping) {
      newAnimation = "jump_up";
    } else if (isFalling) {
      newAnimation = "fall";
    } else if (isRunning) {
      newAnimation = "run";
    } else if (isMoving) {
      newAnimation = "walk";
    }

    if (newAnimation !== this.lastAnimation) {
      this.animationBridge.execute("character", {
        type: "play",
        animation: newAnimation,
      });
      this.lastAnimation = newAnimation;
    }
  }
} 