// SignaturePiece.tsx — GSDF Style Guide by Daftsins. OPTIONAL — ask the user first.
// One crunchy, audio-reactive picture per plugin: posterized to 4 inks, pixel-crunched,
// boiling at ~7fps. Variants (pick ONE per plugin):
//   reactive image   <SignaturePiece source={{ kind: 'image', image, width, height }} … />
//   visualizer       <SignaturePiece source={{ kind: 'scope', getSamples }} … />
//                    <SignaturePiece source={{ kind: 'spectrum', getBins }} … />
//   generative shape <SignaturePiece source={{ kind: 'shape', seed: 3 }} … />
// Sits in a hairline frame, a whole zone of the body, never behind controls or text.
// Labels go OUTSIDE it (a .sec-hd above), never painted into it.
// Remounts (re-bakes) when size, cell, ramp or boil change — keep those static.
import { useEffect, useRef } from 'react';
import { createSignature, type SignatureOptions } from './signature-core';
import './SignaturePiece.css';

export default function SignaturePiece(props: SignatureOptions & { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    if (!ref.current) return;
    // getLevel is read through the ref so a parent re-render never re-bakes.
    // Source getters (getSamples / getBins) must be stable: read from a ref or module state.
    return createSignature(ref.current, { ...props, getLevel: () => latest.current.getLevel() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.cell, props.ramp, props.boil, props.source.kind]);

  return (
    <div className={`sig${props.className ? ' ' + props.className : ''}`}>
      <canvas ref={ref} className="sig-canvas" aria-hidden="true" />
    </div>
  );
}
