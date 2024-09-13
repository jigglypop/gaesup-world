export function gaesupControllerReducer(props, action) {
    switch (action.type) {
        case "init": {
            return Object.assign({}, props);
        }
        case "update": {
            return Object.assign(Object.assign({}, props), action.payload);
        }
    }
}
