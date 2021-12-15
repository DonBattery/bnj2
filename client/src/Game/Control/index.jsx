import React, { useEffect, useState, useRef } from 'react';

const dispatch = key => () => starx.notify('Game.Control', key)

export const leftDown = dispatch('l1');
export const leftUp = dispatch('l0');
export const rightDown = dispatch('r1');
export const rightUp = dispatch('r0');
export const upDown = dispatch('u1');
export const upUp = dispatch('u0');


const Control = function ({ children }) {
  return (
    <div className="Control">
        {children}
    </div>
  );
};

window.controls = { leftDown, rightDown, rightUp, upDown, upUp, leftUp }

export default Control;
