// split한 태그의 첫번째 문자열을 가져오는 함수.
export var getTag = function (node) { var _a, _b; return (_b = (_a = node === null || node === void 0 ? void 0 : node.name) === null || _a === void 0 ? void 0 : _a.split("_")) === null || _b === void 0 ? void 0 : _b[0]; };
// 태그와 이름이 일치하는지 확인
export var isEqual = function (tag, node) { var _a, _b; return ((_b = (_a = node === null || node === void 0 ? void 0 : node.name) === null || _a === void 0 ? void 0 : _a.split("_")) === null || _b === void 0 ? void 0 : _b[0]) === tag; };
