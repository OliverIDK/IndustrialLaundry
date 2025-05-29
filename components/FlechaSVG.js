// FlechaSVG.js
import React from "react";
import Svg, { Path } from "react-native-svg";

const FlechaSVG = ({ size = 60, color = "blue", rotation = 0 }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: [{ rotate: `${rotation}deg` }] }}
    >
      <Path
        d="M12 2 L19 21 L12 17 L5 21 Z"
        fill={color}
      />
    </Svg>
  );
};

export default FlechaSVG;
