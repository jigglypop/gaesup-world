import type { RuntimeValue } from '../types';
/**
 * 釉뚮┸吏 硫붿꽌?쒖쓽 ?ㅻ깄??泥섎━瑜??먮룞?쇰줈 濡쒓퉭?섎뒗 ?곗퐫?덉씠??
 */
export declare function LogSnapshot(): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * 釉뚮┸吏 紐낅졊??泥섎━瑜??먮룞?쇰줈 寃利앺븯???곗퐫?덉씠??
 * CoreBridge??executeCommand 硫붿꽌?쒖뿉 ?ъ슜
 */
export declare function ValidateCommand(): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * 釉뚮┸吏瑜??먮룞?쇰줈 ?깅줉?섎뒗 ?대옒???곗퐫?덉씠??
 */
export declare function RegisterBridge(domain: string): <T extends new (...args: RuntimeValue[]) => object>(constructor: T) => T;
/**
 * 釉뚮┸吏 硫붿꽌???몄텧 ???붿쭊 ?곹깭瑜??먮룞?쇰줈 泥댄겕?섎뒗 ?곗퐫?덉씠??
 * 泥?踰덉㎏ ?뚮씪誘명꽣媛 entity/engine??硫붿꽌?쒖뿉 ?ъ슜
 */
export declare function RequireEngine(): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * 釉뚮┸吏 硫붿꽌?쒖뿉???붿쭊 ID濡??붿쭊??媛?몄????섎뒗 寃쎌슦 ?ъ슜
 */
export declare function RequireEngineById(): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * 釉뚮┸吏 ?ㅻ깄?룹쓣 罹먯떛?섎뒗 ?곗퐫?덉씠??
 */
export declare function CacheSnapshot(ttl?: number): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
