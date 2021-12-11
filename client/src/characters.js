const loaded = [...document.querySelectorAll('img')].map((c) => {
//   const charEl = document.getElementById(c);
  const char = new window.SuperGif({ gif: c, auto_play: false });
  char.load();
  return char;
});

// console.log(loaded);

export default loaded;
