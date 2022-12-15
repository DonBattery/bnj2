import React, { useEffect, useState, useRef, useCallback } from "react";

//const dispatch = key => starx.notify('Game.Control', key)
const dispatch = (key) => () => {};

export const leftDown = dispatch("l1");
export const leftUp = dispatch("l0");
export const rightDown = dispatch("r1");
export const rightUp = dispatch("r0");
export const upDown = dispatch("u1");
export const upUp = dispatch("u0");

export const fireKey = (isDown) => (directionKey) =>
  dispatch(`${directionKey}${Number(isDown)}`);

const Control = function ({ children }) {
  const onEvent = useCallback(
    (isDown) => (key) => {
      const doFire = fireKey(isDown);
      console.log(isDown, key);
      if (["w", "ArrowUp"].includes(key)) doFire("u");
      if (["a", "ArrowLeft"].includes(key)) doFire("l");
      if (["d", "ArrowRight"].includes(key)) doFire("r");
    },
    []
  );

  return (
    <div
      className="Control"
      tabIndex={0}
      onKeyDown={({ key }) => onEvent(true)(key)}
      onKeyUp={({ key }) => onEvent(false)(key)}
    >
      {children}
    </div>
  );
};

window.controls = { leftDown, rightDown, rightUp, upDown, upUp, leftUp };

export default Control;
