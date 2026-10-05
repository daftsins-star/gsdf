// reference-mockup.tsx — GSDF Style Guide by Daftsins. The readable source of reference-mockup.html:
// a fictional tape echo, HOLLOW:ECHO, composed ONLY from components/ + icons/ + tokens, laid
// out the way alive:medium is: a list of things to load on the left, the Screen (with the
// hint slot) in the middle and the live controls under it, an inspector on the right.
// The PNG is rendered with a hint showing (?hint=row): the pointer is on MIRE-1 in the list,
// and the Screen previews what loading it would do before the user clicks.
// Its plugin-specific layout CSS (this plugin's App.css) is the comment at the bottom.
import { useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import PluginCanvas from './components/PluginCanvas';
import Masthead from './components/Masthead';
import Screen from './components/Screen';
import List from './components/List';
import type { ListItem } from './components/List';
import CellRow from './components/CellRow';
import BarSlider from './components/BarSlider';
import Pips from './components/Pips';
import KeyValue from './components/KeyValue';
import Badge from './components/Badge';
import { Segment, Toggle } from './components/Segment';
import IconButton from './components/IconButton';
import SignaturePiece from './components/SignaturePiece';
import { HintBars } from './components/Hint';
import { HintApiContext } from './components/hint-core';
import type { Hint } from './components/hint-core';

// A procedural "photo" of a tape reel, so the mockup needs no image file.
function reelImage(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 240;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000'; g.fillRect(0, 0, 240, 240);
  const disc = g.createRadialGradient(90, 80, 10, 120, 120, 112);
  disc.addColorStop(0, '#ffffff'); disc.addColorStop(0.55, '#b4b4b4'); disc.addColorStop(1, '#3c3c3c');
  g.fillStyle = disc; g.beginPath(); g.arc(120, 120, 104, 0, Math.PI * 2); g.fill();
  const tape = g.createRadialGradient(120, 120, 30, 120, 120, 78);
  tape.addColorStop(0, '#a0a0a0'); tape.addColorStop(0.7, '#6a6a6a'); tape.addColorStop(1, '#202020');
  g.fillStyle = tape; g.beginPath(); g.arc(120, 120, 78, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#000';
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 - 0.4;
    g.beginPath(); g.moveTo(120, 120);
    g.arc(120, 120, 70, a, a + 0.75); g.closePath(); g.fill();
  }
  g.fillStyle = '#d8d8d8'; g.beginPath(); g.arc(120, 120, 24, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#000'; g.beginPath(); g.arc(120, 120, 8, 0, Math.PI * 2); g.fill();
  return c;
}
const reel = reelImage();
const fakeLevel = () => 0.55 + 0.45 * Math.sin(performance.now() / 260) * Math.sin(performance.now() / 910);

const FEATURES = [
  { code: 'WOW', name: 'WOW', text: 'Slow pitch drift from an uneven capstan.' },
  { code: 'FLT', name: 'FLUTTER', text: 'Fast pitch shiver from a worn transport.' },
  { code: 'SAT', name: 'SATURATION', text: 'The tape squeezing loud repeats round and warm.' },
  { code: 'HSS', name: 'HISS', text: 'A noise floor that rises as the repeats fade.' },
  { code: 'CRS', name: 'CROSSTALK', text: 'A dark copy of each side leaking into the other.' },
  { code: 'DRP', name: 'DROPOUT', text: 'Worn oxide: a repeat now and then dips away.' },
  { code: 'SPR', name: 'SPREAD', text: 'Left and right repeats drift apart in time.' },
  { code: 'FRZ', name: 'FREEZE', text: 'Freeze runs on BUS instances only: switch this one to BUS to use it.' },
];
const LEVELS = [0.7, 0.35, 0, 0.5, 0.2, 0.15, 0.6, 0];

const REELS: { name: string; code: string; tag: ListItem['tag']; about: string; profile: number[] }[] = [
  { name: 'AMBER-2', code: 'I', tag: 'dim', about: 'Bright and quick.', profile: [0.3, 0.2, 0.4, 0.2, 0.1, 0.1, 0.3, 0] },
  { name: 'GLASS-9', code: 'IV', tag: 'text', about: 'Clean metal tape.', profile: [0.1, 0.1, 0.2, 0.1, 0.1, 0, 0.5, 0] },
  { name: 'MIRE-1', code: 'II', tag: 'rule', about: 'Dark and slow. Long, smeared repeats that sink into the hiss; the wow is the point.', profile: [0.9, 0.5, 0.7, 0.8, 0.4, 0.6, 0.3, 0] },
  { name: 'SOOT-4', code: 'I', tag: 'rule', about: 'Burnt out and loud.', profile: [0.6, 0.6, 0.9, 0.9, 0.3, 0.8, 0.2, 0] },
  { name: 'VELA-7', code: 'II', tag: 'dim', about: 'Soft, wide, polite.', profile: [0.3, 0.2, 0.3, 0.3, 0.2, 0.1, 0.9, 0] },
  { name: 'HOLLOW', code: 'II', tag: 'live', about: 'The house reel.', profile: [0.5, 0.3, 0.6, 0.4, 0.3, 0.2, 0.5, 0] },
  { name: 'KITE-3', code: 'T', tag: 'rule', about: 'Thin and fast.', profile: [0.2, 0.7, 0.3, 0.5, 0.2, 0.3, 0.4, 0] },
  { name: 'ROOK-5', code: 'I', tag: 'dim', about: 'Heavy and boxy.', profile: [0.4, 0.3, 0.8, 0.5, 0.6, 0.3, 0.1, 0] },
  { name: 'LINT-8', code: 'II', tag: 'rule', about: 'Dusty, crackly.', profile: [0.3, 0.4, 0.4, 0.7, 0.3, 0.9, 0.2, 0] },
  { name: 'PALE-6', code: 'IV', tag: 'text', about: 'Airy and clean.', profile: [0.1, 0.1, 0.1, 0.2, 0.1, 0, 0.6, 0] },
  { name: 'ASH-12', code: 'I', tag: 'rule', about: 'Crushed lows.', profile: [0.5, 0.5, 0.9, 0.6, 0.5, 0.4, 0.2, 0] },
  { name: 'DRY-0', code: 'T', tag: 'dim', about: 'Barely tape at all.', profile: [0.05, 0.05, 0.1, 0.05, 0, 0, 0.1, 0] },
];

const reelHint = (r: (typeof REELS)[number]): Hint => ({
  title: r.name,
  value: `${r.code} ${r.code === 'IV' ? 'METAL' : r.code === 'T' ? 'THIN' : 'CHROME'}`,
  text: r.about,
  preview: <HintBars bars={FEATURES.map((f, i) => ({ code: f.code, v: r.profile[i] }))} />,
});

const DIVS: { value: number; label: string; hint: Hint }[] = [
  { value: 0, label: '1/4', hint: { title: 'DIVISION · 1/4', text: 'One repeat per beat.' } },
  { value: 1, label: '1/8', hint: { title: 'DIVISION · 1/8', text: 'Two repeats per beat.' } },
  { value: 2, label: '1/8D', hint: { title: 'DIVISION · 1/8 DOTTED', text: 'The galloping one: three repeats across two beats.' } },
  { value: 3, label: '1/16', hint: { title: 'DIVISION · 1/16', text: 'Four repeats per beat: a slapback smear.' } },
];

/** Shows one fixed hint on mount, so the PNG can show the hint system at work. */
function DemoHint({ hint }: { hint: Hint }) {
  const api = useContext(HintApiContext);
  const [owner] = useState(() => ({}));
  useEffect(() => { api?.show(hint, owner); }, [api, hint, owner]);
  return null;
}

const DEMO = reelHint(REELS[2]);

function App() {
  const [reelSel, setReel] = useState('HOLLOW');
  const [v, setV] = useState<Record<string, number>>({ in: 0.625, fb: 0.48, mix: 0.35 });
  const [div, setDiv] = useState(2);
  const [mode, setMode] = useState(0);
  const [freeze, setFreeze] = useState(false);
  const set = (k: string) => (x: number) => setV((s) => ({ ...s, [k]: x }));
  const params = new URLSearchParams(location.search);
  const loaded = REELS.find((r) => r.name === reelSel)!;

  return (
    <PluginCanvas>
      {params.get('hint') === 'row' && <DemoHint hint={DEMO} />}
      <Masthead
        product="HOLLOW:ECHO"
        presetName="DUSK TAPE"
        onPresets={() => {}}
        buttons={[
          { id: 'heads', label: 'HEADS', onClick: () => {}, hint: { title: 'HEADS', text: 'Open the four playback heads over the deck.' } },
          { id: 'space', label: 'SPACE', onClick: () => {}, hint: { title: 'SPACE', text: 'The stereo field and the room the echoes sit in.' } },
          { id: 'edit', label: 'EDIT', onClick: () => {}, hint: { title: 'EDIT', text: 'Edit this reel’s stages one by one.' } },
        ]}
        version="v1.0.0"
        menu={[{ label: 'SETTINGS', onClick: () => {} }, { label: 'ABOUT', onClick: () => {} }]}
        right={<>
          <span className="mh-seed"><span className="cap">SEED</span> 4127</span>
          <IconButton icon="reset" title="New seed" size="sm" bare hint={{ title: 'NEW SEED', text: 'The same reel on a slightly different machine.' }} />
          <IconButton icon="undo" title="Undo" size="sm" bare />
          <IconButton icon="compare" title="Compare A/B" size="sm" bare />
        </>}
      />

      <div className="body echo">
        <section className="zone">
          <div className="sec-hd"><span>REELS</span><span className="cap">{REELS.length}</span></div>
          <List
            ariaLabel="Reels"
            selected={reelSel}
            onSelect={setReel}
            items={REELS.map((r) => ({ id: r.name, name: r.name, code: r.code, tag: r.tag, marker: r.name === 'GLASS-9', hint: reelHint(r) }))}
          />
        </section>

        <section className="zone zone-pad">
          <div className="sec-hd"><span className="cap">DECK</span><span className="cap">RUNNING</span></div>
          <Screen title={loaded.name} sub={`II CHROME · ${DIVS[div].label}`}>
            <SignaturePiece className="echo-sig" source={{ kind: 'image', image: reel, width: 240, height: 240 }} getLevel={fakeLevel} cell={3} ramp="bone" />
          </Screen>
          <div className="echo-cells">
            <CellRow
              ariaLabel="What each stage is doing"
              cells={FEATURES.map((f, i) => ({
                code: f.code,
                state: f.code === 'FRZ' ? 'off' : f.code === 'SPR' ? 'lit' : 'on',
                level: LEVELS[i],
                hint: { title: f.name, text: f.text },
              }))}
            />
          </div>
          <div className="stack echo-bars">
            <BarSlider label="IN" value={v.in} onChange={set('in')} defaultValue={0.5} bipolar
              format={(x) => { const db = -18 + x * 36; return `${db > 0.05 ? '+' : db < -0.05 ? '-' : ' '}${Math.abs(db).toFixed(1)}DB`; }}
              hint="How hard you hit the tape. More drives the saturation; the output is compensated." />
            <BarSlider label="FDBK" value={v.fb} onChange={set('fb')} defaultValue={0.4}
              format={(x) => `${Math.round(x * 100)}%`} hint="How many times each echo comes back." />
            <BarSlider label="MIX" value={v.mix} onChange={set('mix')} defaultValue={0.35}
              format={(x) => `${Math.round(x * 100)}%`} hint="Dry to wet. 100% is echoes only." />
          </div>
        </section>

        <section className="zone zone-pad">
          <div className="sec-hd"><span>{loaded.name}</span><Badge>LOADED</Badge></div>
          <KeyValue keyWidth={64} rows={[
            { k: 'TYPE', v: 'II CHROME' },
            { k: 'SPEED', v: '7.5 IPS' },
            { k: 'WOW', v: <Pips value={3} label="Wow" />, hint: { title: 'WOW', text: 'How much this reel drifts.' } },
            { k: 'AGE', v: <Pips value={4} label="Age" />, hint: { title: 'AGE', text: 'How worn the oxide is.' } },
            { k: 'HISS', v: <Pips value={2} label="Hiss" />, hint: { title: 'HISS', text: 'How loud the floor is.' } },
          ]} />
          <div className="hr" />
          <KeyValue keyWidth={64} rows={[{ k: 'NOTE', v: 'WARM, SLOW, LOST', dim: true }]} />
          <div className="foot">
            <Segment ariaLabel="Division" label="DIV" size="sm" value={div} onChange={setDiv} options={DIVS}
              hint={{ title: 'DIVISION', text: 'The repeat time, locked to the host tempo.' }} />
            <Segment ariaLabel="Mode" value={mode} onChange={setMode} options={[
              { value: 0, label: 'TRACK', hint: { title: 'TRACK', text: 'Tuned for one instrument: a quieter floor, no freeze.' } },
              { value: 1, label: 'BUS', hint: { title: 'BUS', text: 'Tuned for groups and the mix bus: freeze, more hiss.' } },
            ]} />
            <div className="echo-btns">
              <Toggle on={freeze} onChange={setFreeze} icon="freeze" hint={{ title: 'FREEZE', text: 'Hold the loop that is on the tape now.' }}>FREEZE</Toggle>
              <IconButton icon="dice" title="Random reel" hint={{ title: 'RANDOM', text: 'Load a different reel at random.' }} />
              <IconButton icon="gear" title="Reel settings" />
            </div>
          </div>
        </section>
      </div>
    </PluginCanvas>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

/* App.css — layout for this plugin, tokens only:
.echo { grid-template-columns: 138px minmax(0, 1fr) 176px; }
.echo .zone-pad { padding-bottom: var(--space-3); }
.screen .echo-sig { flex: none; width: 144px; height: 144px; margin-top: 52px; }
.echo-cells { margin-top: var(--space-3); }
.echo-bars { margin-top: var(--space-3); --bar-lbl: 34px; }
.echo-bars .bar-row { --bar-lbl: 34px; --bar-val: 56px; }
.echo-btns { display: grid; grid-template-columns: 1fr 24px 24px; gap: var(--space-1); }
.mh-seed { color: var(--ink-text); }
.mh-seed .cap { margin-right: var(--space-1); }
*/
