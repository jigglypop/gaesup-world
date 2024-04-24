export var calcCharacterColliderProps = function (characterSize) {
    if (!characterSize)
        return null;
    var heightPlusDiameter = characterSize.y / 2;
    var diameter = Math.max(characterSize.x, characterSize.z);
    var radius = diameter / 2;
    var height = heightPlusDiameter - radius;
    var halfHeight = height / 2;
    return {
        height: height,
        halfHeight: halfHeight,
        radius: radius,
        diameter: diameter,
    };
};
