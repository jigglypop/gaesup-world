import { getGlobalAnimationBridge } from "@/core/animation/hooks/useAnimationBridge";
import { GameStatesType } from "@/core/world/components/Rideable/types";

/**
 * 이동 상태로 캐릭터 클립을 직접 재생하던 이전 결정 경로다. 엔진은 더 이상 사용하지 않는다.
 * @deprecated Animator 컨트롤러(useCharacterAnimator)를 사용한다.
 */
export class AnimationController {
  private animationBridge = getGlobalAnimationBridge();
  private lastAnimation = "idle";
  
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