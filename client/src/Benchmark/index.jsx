import React from 'react';
import './index.css';

const exampleSchema = `namespace JunkNDump.Sample;
 
struct CharacterCoords {
  x:float;
  y:float;
  t:float;
  a:float;
  fx:bool;
  fy:bool;
}
 
root_type Character;
`;

const exampleUrl = 'https://';

const Benchmark = function () {
  const onBenchmarkStart = () => console.log('benchmark started');

  return (
    <>
      <label className="Benchmark-block fonted">
        Schema
        <textarea className="Benchmark-input" rows={15} cols={30} defaultValue={exampleSchema} />
      </label>
      <label className="Benchmark-block fonted">
        Url
        <input className="Benchmark-input" defaultValue={exampleUrl} />
      </label>
      <label className="Benchmark-block fonted">
        <input className="Benchmark-button fonted" onClick={onBenchmarkStart} type="submit" value="Test connection" />
      </label>
    </>
  );
};

export default Benchmark;
