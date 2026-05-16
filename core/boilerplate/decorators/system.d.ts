import { DecoratorTarget, DecoratedValue, PropertyDescriptorExtended, AnyConstructor } from './types';
/**
 * ?쒖뒪??硫붿꽌?쒖쓽 ?먮윭瑜??먮룞?쇰줈 泥섎━?섎뒗 ?곗퐫?덉씠??
 */
export declare function HandleError(defaultReturn?: DecoratedValue): (target: DecoratorTarget, propertyKey: string, descriptor: PropertyDescriptorExtended) => PropertyDescriptorExtended;
/**
 * ?쒖뒪??珥덇린?붾? 濡쒓퉭?섎뒗 ?곗퐫?덉씠??
 */
export declare function LogInitialization(): (target: DecoratorTarget, propertyKey: string, descriptor: PropertyDescriptorExtended) => PropertyDescriptorExtended;
/**
 * ?쒖뒪?쒖쓣 ?먮룞?쇰줈 ?깅줉?섎뒗 ?대옒???곗퐫?덉씠??
 */
export declare function RegisterSystem(systemType: string): <T extends AnyConstructor>(constructor: T) => T;
/**
 * ?쒖뒪?쒖쓽 ?고??꾩쓣 ?먮룞?쇰줈 愿由ы븯???대옒???곗퐫?덉씠??
 */
export declare function ManageRuntime(options?: {
    autoStart?: boolean;
}): <T extends AnyConstructor>(constructor: T) => T;
