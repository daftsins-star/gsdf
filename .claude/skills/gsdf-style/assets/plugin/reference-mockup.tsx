// reference-mockup.tsx — GSDF Style Guide by Daftsins. The readable source of reference-mockup.html:
// a fictional tape echo, HOLLOW:ECHO, composed ONLY from components/ + icons/ + tokens.
// Its plugin-specific layout CSS (this plugin's App.css) is the comment at the bottom.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import PluginCanvas from './components/PluginCanvas';
import Masthead from './components/Masthead';
import TabBar from './components/TabBar';
import Knob from './components/Knob';
import BarSlider from './components/BarSlider';
import { Segment, Toggle } from './components/Segment';
import IconButton from './components/IconButton';
import { BigReadout, Meter, Readout } from './components/Meter';
import StatusStrip, { Gap } from './components/StatusStrip';
import SignaturePiece from './components/SignaturePiece';
import Icon from './icons/Icon';

// A procedural "photo" of a tape reel, so the mockup needs no image file.
function reelImage(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 240;
  const g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, 240, 240);
  bg.addColorStop(0, '#333'); bg.addColorStop(1, '#050505');
  g.fillStyle = bg; g.fillRect(0, 0, 240, 240);
  const disc = g.createRadialGradient(90, 80, 10, 120, 120, 112);
  disc.addColorStop(0, '#ffffff'); disc.addColorStop(0.55, '#b4b4b4'); disc.addColorStop(1, '#3c3c3c');
  g.fillStyle = disc; g.beginPath(); g.arc(120, 120, 118, 0, Math.PI * 2); g.fill();
  const tape = g.createRadialGradient(120, 120, 30, 120, 120, 78);
  tape.addColorStop(0, '#a0a0a0'); tape.addColorStop(0.7, '#6a6a6a'); tape.addColorStop(1, '#202020');
  g.fillStyle = tape; g.beginPath(); g.arc(120, 120, 86, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#000';
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 - 0.4;
    g.beginPath(); g.moveTo(120, 120);
    g.arc(120, 120, 76, a, a + 0.75); g.closePath(); g.fill();
  }
  g.fillStyle = '#d8d8d8'; g.beginPath(); g.arc(120, 120, 26, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#000'; g.beginPath(); g.arc(120, 120, 9, 0, Math.PI * 2); g.fill();
  return c;
}
const reel = reelImage();
const fakeLevel = () => 0.55 + 0.45 * Math.sin(performance.now() / 260) * Math.sin(performance.now() / 910);
const fakeDb = () => -14 + 9 * Math.abs(Math.sin(performance.now() / 300));
const fakeOut = () => -4 + 3.6 * Math.abs(Math.sin(performance.now() / 410));

const TABS = [
  { id: 'echo', label: 'ECHO', icon: 'clock' as const },
  { id: 'tone', label: 'TONE', icon: 'eq' as const },
  { id: 'mod', label: 'MOD', icon: 'lfo' as const },
  { id: 'space', label: 'SPACE', icon: 'stereo' as const },
];

function App() {
  const [tab, setTab] = useState('echo');
  const [v, setV] = useState<Record<string, number>>({
    time: 0.62, fb: 0.48, mix: 0.35, wow: 0.22, flutter: 0.4, age: 0.7, low: 0.18, high: 0.74, drive: 0.42, width: 0.5,
  });
  const [div, setDiv] = useState(2);
  const [sync, setSync] = useState(true);
  const [freeze, setFreeze] = useState(false);
  const [pp, setPp] = useState(true);
  const [bypass, setBypass] = useState(false);
  const set = (k: string) => (x: number) => setV((s) => ({ ...s, [k]: x }));
  const pct = (x: number) => `${Math.round(x * 100)}`;
  const params = new URLSearchParams(location.search);
  const dragging = params.get('drag');

  return (
    <PluginCanvas tabs>
      <Masthead
        product="HOLLOW:ECHO"
        presetName="DUSK TAPE"
        onPresets={() => {}}
        version="v1.0.0"
        menu={[{ label: 'SETTINGS', onClick: () => {} }, { label: 'ABOUT', onClick: () => {} }]}
        right={<>
          <IconButton icon="undo" title="Undo" size="sm" bare />
          <IconButton icon="redo" title="Redo" size="sm" bare />
          <IconButton icon="compare" title="Compare A/B" size="sm" bare />
          <IconButton icon="dice" title="Randomise" size="sm" bare />
          <IconButton icon="power" title="Bypass" size="sm" pressed={bypass} onClick={() => setBypass(!bypass)} />
        </>}
      />
      <TabBar tabs={TABS} current={tab} onSelect={setTab}
        right={<span className="lbl tabs-info"><Icon name="midi" />HOST 120 BPM</span>} />

      <div className="body3">
        <section className="zone">
          <div className="sec-hd"><span className="lbl">TAPE</span><span className="hint">REEL 2</span></div>
          <SignaturePiece className="sig--square" source={{ kind: 'image', image: reel, width: 240, height: 240 }} getLevel={fakeLevel} cell={3} ramp={(params.get('ramp') as 'bone' | 'accent') || 'accent'} />
          <div className="tgl-grid">
            <Toggle on onChange={() => {}} icon="play">RUN</Toggle>
            <Toggle on={false} onChange={() => {}} icon="stop">HOLD</Toggle>
          </div>
          <div className="hr" />
          <BarSlider label="BIAS" icon={<Icon name="sine" />} value={0.55} onChange={() => {}} format={(x) => `${Math.round((x - 0.5) * 200)}`} bipolar />
          <BarSlider label="AZIM" icon={<Icon name="phase" />} value={0.4} onChange={() => {}} format={(x) => `${Math.round(x * 90)}`} />
          <div className="zone-foot">
            <Readout label="SPEED" icon={<Icon name="play" />} value="7.5 IPS" />
            <Readout label="WEAR" icon={<Icon name="warn" />} value="31 %" />
            <Readout label="HISS" icon={<Icon name="noise" />} value="-64 DB" />
            <Segment ariaLabel="Tape" value={1} onChange={() => {}} options={[{ value: 0, label: 'I' }, { value: 1, label: 'II' }, { value: 2, label: 'IV' }]} />
          </div>
        </section>

        <section className="zone zone--knobs">
          <div className="sec-hd"><span className="lbl">ECHO</span><span className="hint">DRAG ↕ · SHIFT FINE</span></div>
          <div className="knob-grid">
            <Knob label="TIME" icon={<Icon name="clock" />} value={v.time} onChange={set('time')} format={(x) => `${Math.round(40 + x * 960)}`} size={44} />
            <Knob label="FDBK" icon={<Icon name="loop" />} value={v.fb} onChange={set('fb')} format={pct} size={44} />
            <Knob label="MIX" icon={<Icon name="meter" />} value={v.mix} onChange={set('mix')} format={pct} size={44} />
          </div>
          <div className="hr" />
          <div className="knob-row">
            <Knob label="WOW" icon={<Icon name="sine" />} value={v.wow} onChange={set('wow')} format={pct} />
            <Knob label="FLUT" icon={<Icon name="noise" />} value={v.flutter} onChange={set('flutter')} format={pct} />
            <Knob label="AGE" icon={<Icon name="drive" />} value={v.age} onChange={set('age')} format={pct} bipolar />
            <Knob label="SPRD" icon={<Icon name="stereo" />} value={0.6} onChange={() => {}} format={pct} />
          </div>
          <div className="hr" />
          <div className="sec-hd"><span className="lbl">HEADS</span><span className="hint">3 OF 4 PLAYING</span></div>
          <div className="heads">
            {[1, 2, 3, 4].map((h) => (
              <button key={h} type="button" className="btn" aria-pressed={h !== 3}><Icon name="play" />H{h}</button>
            ))}
          </div>
          <div className="hr" />
          <div className="sec-hd"><span className="lbl">DIVISION</span><span className="hint">SYNCED TO HOST</span></div>
          <Segment ariaLabel="Division" value={div} onChange={setDiv} options={[
            { value: 0, label: '1/4' }, { value: 1, label: '1/8' }, { value: 2, label: '1/8D' }, { value: 3, label: '1/16' }, { value: 4, label: 'FREE', icon: 'clock' },
          ]} />
        </section>

        <section className="zone">
          <div className="sec-hd"><span className="lbl">TONE</span><span className="hint">POST</span></div>
          <BarSlider label="LOW" icon={<Icon name="highpass" />} value={v.low} onChange={set('low')} format={(x) => `${Math.round(20 + x * 480)}HZ`} />
          <BarSlider label="HIGH" icon={<Icon name="lowpass" />} value={v.high} onChange={set('high')} format={(x) => `${(1 + x * 19).toFixed(1)}K`} />
          <BarSlider label="DRV" icon={<Icon name="drive" />} value={v.drive} onChange={set('drive')} format={(x) => `${(x * 18).toFixed(1)}DB`} />
          <BarSlider label="WIDE" icon={<Icon name="stereo" />} value={v.width} onChange={set('width')} format={(x) => `${Math.round((x - 0.5) * 200)}`} bipolar />
          <div className="hr" />
          <div className="tgl-grid">
            <Toggle on={sync} onChange={setSync} icon="link">SYNC</Toggle>
            <Toggle on={freeze} onChange={setFreeze} icon="freeze">FREEZE</Toggle>
            <Toggle on={pp} onChange={setPp} icon="shuffle">P-PONG</Toggle>
            <Toggle on={false} onChange={() => {}} icon="lock">LOCK</Toggle>
          </div>
          <div className="hr" />
          <Readout label="REPEATS" icon={<Icon name="loop" />} value="≈ 7" />
          <Readout label="TAIL" icon={<Icon name="envelope" />} value="4.1 S" />
          <div className="hr" />
          <div className="sec-hd"><span className="lbl">SNAPSHOT</span><span className="hint">B</span></div>
          <div className="ib-row">
            <IconButton icon="save" title="Save" />
            <IconButton icon="folder" title="Load" />
            <IconButton icon="copy" title="Copy A to B" />
            <IconButton icon="star" title="Favourite" pressed />
            <IconButton icon="trash" title="Delete" />
          </div>
          <div className="hr" />
          <div className="sec-hd"><span className="lbl">OUTPUT</span><span className="hint">POST MIX</span></div>
          <BarSlider label="TRIM" icon={<Icon name="output" />} value={0.5} onChange={() => {}} format={(x) => `${((x - 0.5) * 24).toFixed(1)}DB`} bipolar />
          <BarSlider label="DUCK" icon={<Icon name="speaker" />} value={0.3} onChange={() => {}} format={(x) => `${Math.round(x * 100)}%`} />
          <div className="zone-foot">
            <span className="lbl">DELAY</span>
            <BigReadout value="562" unit="MS" />
          </div>
        </section>
      </div>

      <StatusStrip>
        <span className="lbl"><Icon name="input" />IN</span>
        <Meter getLevel={fakeDb} length={96} />
        <span className="val">-12.0</span>
        <Gap />
        <span className="st-msg">{dragging ? 'TIME 562 MS' : 'DBL-CLICK RESETS'}</span>
        <Gap />
        <span className="lbl"><Icon name="output" />OUT</span>
        <Meter getLevel={fakeOut} length={96} />
        <span className="val">-0.3</span>
      </StatusStrip>
    </PluginCanvas>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

/* App.css — layout for this plugin, tokens only:
.body3 { display: grid; grid-template-columns: 186px minmax(0, 1fr) 176px; min-height: 0; }
.zone--knobs { justify-content: space-between; }
.knob-grid { display: grid; grid-template-columns: repeat(3, 1fr); row-gap: var(--space-3); justify-items: center; padding-top: var(--space-1); }
.tgl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-1); }
.tabs-info { display: inline-flex; align-items: center; gap: var(--space-1); }
.sig--square { flex: none; aspect-ratio: 1 / 1; }
.zone--knobs .knob-grid { flex: 1; align-content: center; }
.zone-foot { margin-top: auto; display: flex; flex-direction: column; gap: var(--space-1); }
.knob-row { display: grid; grid-template-columns: repeat(4, 1fr); justify-items: center; padding: var(--space-1) 0; }
.ib-row { display: flex; gap: var(--space-1); }
.ib-row .ib { flex: 1; }
.heads { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-1); }
.heads .btn { min-width: 0; }
*/
