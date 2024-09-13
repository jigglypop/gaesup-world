import { useContext } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useGaesupAnimation({ type, }) {
    const { animationState } = useContext(GaesupWorldContext);
    const dispatch = useContext(GaesupWorldDispatchContext);
    const getAnimationTag = (tag) => {
        const animation = animationState[type].store[tag];
        if (!animation)
            return { name: animationState[type].default, isValid: false };
        if (animation.condition()) {
            return { name: animation.animationName, isValid: true };
        }
        else {
            return { name: animationState[type].default, isValid: false };
        }
    };
    const notify = () => {
        let tag = animationState[type].default;
        for (const key of Object.keys(animationState[type].store)) {
            const checked = getAnimationTag(key);
            if (checked.isValid) {
                tag = checked.name;
                break;
            }
        }
        animationState[type].current = tag;
        dispatch({
            type: "update",
            payload: {
                animationState: Object.assign({}, animationState),
            },
        });
        return tag;
    };
    const unsubscribe = (tag) => {
        delete animationState[type].store[tag];
        dispatch({
            type: "update",
            payload: {
                animationState: Object.assign({}, animationState),
            },
        });
    };
    const subscribe = ({ tag, condition, action, animationName, key, }) => {
        animationState[type].store[tag] = {
            condition,
            action: action || (() => { }),
            animationName: animationName || tag,
            key: key || tag,
        };
        dispatch({
            type: "update",
            payload: {
                animationState: Object.assign({}, animationState),
            },
        });
    };
    const subscribeAll = (props) => {
        const subscribedTags = [];
        props.forEach((item) => {
            animationState[type].store[item.tag] = {
                condition: item.condition,
                action: item.action,
                animationName: item.animationName,
                key: item.key,
            };
            subscribedTags.push(item.tag);
        });
        dispatch({
            type: "update",
            payload: {
                animationState: Object.assign({}, animationState),
            },
        });
        // 구독 해제 함수 반환
        return () => {
            subscribedTags.forEach((tag) => {
                delete animationState[type].store[tag];
            });
            dispatch({
                type: "update",
                payload: {
                    animationState: Object.assign({}, animationState),
                },
            });
        };
    };
    return {
        subscribe,
        subscribeAll,
        store: animationState === null || animationState === void 0 ? void 0 : animationState[type].store,
        unsubscribe,
        notify,
    };
}
