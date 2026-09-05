import { WARRIOR_BLUEPRINT } from '../../../../blueprints/characters/warrior'
import { CharacterBlueprint } from '../../../../blueprints/types'
import { Blueprint, BlueprintProperty } from '../../../boilerplate/decorators/blueprint/BlueprintDecorators'
import { DomainBridge } from '../../../boilerplate/decorators/blueprint/BridgeDecorators'

@Blueprint(WARRIOR_BLUEPRINT)
@DomainBridge('motion')
export class WarriorEntity {
  @BlueprintProperty('physics.mass')
  mass: number = 80
  
  @BlueprintProperty('physics.moveSpeed')
  moveSpeed: number = 5
  
  @BlueprintProperty('physics.jumpForce')
  jumpForce: number = 350
  
  @BlueprintProperty('stats.health')
  health: number = 100
  
  @BlueprintProperty('stats.strength')
  strength: number = 15
  
  private position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  private velocity: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  
  constructor() {
    this.initializeFromBlueprint()
  }
  
  private initializeFromBlueprint() {
    const blueprint = Reflect.getMetadata('blueprint', this.constructor) as CharacterBlueprint
    if (blueprint) {
      this.mass = blueprint.physics.mass
      this.moveSpeed = blueprint.physics.moveSpeed
      this.jumpForce = blueprint.physics.jumpForce
      this.health = blueprint.stats.health
      this.strength = blueprint.stats.strength
    }
  }
  
  move(direction: { x: number; z: number }) {
    this.velocity.x = direction.x * this.moveSpeed
    this.velocity.z = direction.z * this.moveSpeed
  }
  
  jump() {
    if (this.position.y === 0) {
      this.velocity.y = this.jumpForce / this.mass
    }
  }
  
  update(deltaTime: number) {
    this.position.x += this.velocity.x * deltaTime
    this.position.y += this.velocity.y * deltaTime
    this.position.z += this.velocity.z * deltaTime
    
    if (this.position.y > 0) {
      this.velocity.y -= 9.81 * deltaTime
    } else {
      this.position.y = 0
      this.velocity.y = 0
    }
  }
  
  getPosition() {
    return { ...this.position }
  }
  
  getStats() {
    return {
      health: this.health,
      strength: this.strength,
      mass: this.mass,
      moveSpeed: this.moveSpeed
    }
  }
} 