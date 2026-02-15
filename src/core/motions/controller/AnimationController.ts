import { getGlobalAnimationBridge } from "@/core/animation/hooks/useAnimationBridge";
import { Profile, HandleError } from '@/core/boilerplate/decorators';
import { GameStatesType } from "@/core/world/components/Rideable/types";

export class AnimationController {
  private animationBridge = getGlobalAnimationBridge();
  private lastAnimation = "idle";
  
  @HandleError()
  @Profile()
  update(gameStates: GameStatesType) {
    const { isMoving, isRunning, isJumping, isFalling, isRiding } = gameStates;
    let newAnimation = "idle";
    if (isRiding) {
      newAnimation = "ride";
    } else if (isJumping) {
      newAnimation = "jump";
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