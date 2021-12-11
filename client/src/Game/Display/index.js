/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
/* eslint-disable no-prototype-builtins */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable prefer-template */

const colorDdict = {
  1: '#8ceb34',
  2: 'blue',
  3: 'aqua',
  4: 'red',
};

function numToColor(num) {
  return colorDdict[num] || 'black';
}

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randInt(max) {
  return randRange(0, max - 1);
}

function randomId(length) {
  return Math.random().toString(36).substr(2, length);
}

function getWSURL() {
  const loc = window.location;
  let uri = 'ws:';
  if (loc.protocol === 'https:') {
    uri = 'wss:';
  }
  return uri + `//${loc.host}${loc.pathname}hub?client_id=${ClientID}`;
}

function fixWindow() {
  window.requestAnimFrame = (function () {
    return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.ieRequestAnimationFrame
            || function (callback) {
              window.setTimeout(callback, 1000 / 60);
            };
  }());
}

class Display {
  constructor(world, assets, gamePage, gameCanvas) {
    this.updated = false;
    // console.log(world, gamePage, gameCanvas);

    this.assets = assets || {};

    this.width = world.widthPx();
    this.height = world.heightPx();

    this.widthToHeight = this.width / this.height;

    this.gamePage = gamePage || document.getElementById('GamePage');
    this.gameCanvas = gameCanvas || document.getElementById('GameCanvas');
    this.ctx = this.gameCanvas.getContext('2d');
    this.buffer = document.createElement('canvas').getContext('2d');
    this.buffer.canvas.height = this.height;
    this.buffer.canvas.width = this.width;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    this.drawBox = this.drawBox.bind(this);
    this.drawAnim = this.drawAnim.bind(this);
    this.drawWorld = this.drawWorld.bind(this);

    this.gamePage.classList.remove('hidden');

    window.addEventListener('resize', this.resize);
    window.addEventListener('orientationchange', this.resize);
    this.resize();
  }

  resize() {
    let newWidth = window.innerWidth - 4;
    let newHeight = window.innerHeight - 4;
    const newWidthToHeight = newWidth / newHeight;

    if (newWidthToHeight > this.widthToHeight) {
      newWidth = newHeight * this.widthToHeight;
    } else {
      newHeight = newWidth / this.widthToHeight;
    }

    this.gamePage.style.width = newWidth + 'px';
    this.gamePage.style.height = newHeight + 'px';

    this.gamePage.style.marginTop = (-newHeight / 2) + 'px';
    this.gamePage.style.marginLeft = (-newWidth / 2) + 'px';

    this.gameCanvas.width = newWidth;
    this.gameCanvas.height = newHeight;

    this.gamePage.style.fontSize = (newWidth / this.width / 2) + 'em';
  }

  render() {
    if (!this.updated) {
      return;
    }
    this.ctx.drawImage(
      this.buffer.canvas,
      0,

      0,

      this.buffer.canvas.width,

      this.buffer.canvas.height,
      0,

      0,

      this.ctx.canvas.width,

      this.ctx.canvas.height,
    );
    this.updated = false;
  }

  drawBox(x, y, width, height, color) {
    this.buffer.fillStyle = color;
    this.buffer.fillRect(x, y, width, height);
  }

  drawAnim(destination_x, destination_y, obj_type, anim) {
    // if (!this.assets.hasOwnProperty(obj_type)) {
    //   return
    // };
    // let size = this.assets[obj_type].height;
    // this.buffer.drawImage(this.assets[obj_type], anim * size, 0, size, size, destination_x, destination_y, size, size);
    this.drawBox(destination_x, destination_y, 20, 20, 'red');
  }

  drawWorld(world) {
    this.drawBox(0, 0, this.buffer.canvas.width, this.buffer.canvas.height, world.world_map.background);

    for (let i = 0; i < world.world_map.rows.length; i++) {
      const row = world.world_map.rows[i];
      for (let j = 0; j < row.length; j++) {
        const elem = world.world_map.rows[i][j];
        const color = (elem == '0') ? world.world_map.background : numToColor(elem);
        this.drawBox(
          j * world.world_rules.block_size,
          i * world.world_rules.block_size,
          world.world_rules.block_size,
          world.world_rules.block_size,
          color,
        );
      }
    }

    world.world_objects.forEach((obj) => {
      this.drawAnim(obj.x, obj.y, obj.obj_type, obj.anim);
    });

    this.updated = true;
  }
}

export default Display;
