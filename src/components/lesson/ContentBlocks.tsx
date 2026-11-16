import { Fragment } from "react";
import { MathRow } from "@/components/matrix/MatrixGrid";
import { Icon } from "@/components/ui/Icon";
import type { ContentBlock } from "@/types";

/** Teks dengan `notasi` di antara backtick ditampilkan sebagai kode matematika. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.92em] font-bold text-ink">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "text":
      return (
        <p className="max-w-[68ch] text-[1.05rem] leading-relaxed text-ink">
          <RichText text={block.body} />
        </p>
      );
    case "list":
      return (
        <div>
          {block.title && <p className="mb-2 font-display text-lg font-semibold text-ink">{block.title}</p>}
          <ul className="max-w-[68ch] space-y-2">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 leading-relaxed text-ink">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-amber" aria-hidden />
                <span>
                  <RichText text={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "math":
      return (
        <figure className="rounded-2xl border border-line bg-bg p-4">
          {block.label && <figcaption className="mb-2 text-sm font-bold text-muted">{block.label}</figcaption>}
          <MathRow parts={block.parts} size="md" />
        </figure>
      );
    case "formula":
      return (
        <div className="rounded-2xl border-2 border-amber bg-amber-soft p-4 sm:p-5">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-ink">
            <Icon name="bolt" size={14} filled />
            Rumus · {block.label}
          </p>
          <div className="scroll-x mt-2">
            <p className="w-max font-mono text-lg font-bold text-ink sm:text-xl">{block.expr}</p>
          </div>
          {block.note && <p className="mt-2 text-sm font-bold text-ink">{block.note}</p>}
        </div>
      );
    case "tip":
      return (
        <div className="flex items-start gap-3 rounded-2xl bg-ice-soft p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-ink">
            <Icon name="footprint" size={18} />
          </span>
          <p className="leading-relaxed text-ink">
            <span className="font-extrabold">Catatan Trixsaurus: </span>
            <RichText text={block.body} />
          </p>
        </div>
      );
    case "example":
      return (
        <article className="overflow-hidden rounded-3xl border border-line bg-surface">
          <header className="bg-leaf px-4 py-3 sm:px-5">
            <p className="font-display text-lg font-semibold text-ink">{block.title}</p>
          </header>
          <div className="space-y-4 p-4 sm:p-5">
            <div>
              <p className="font-bold text-ink">{block.question}</p>
              {block.math && <MathRow parts={block.math} size="md" className="mt-2" />}
            </div>
            <ol className="space-y-3">
              {block.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-on-primary">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="leading-relaxed text-ink">{step.text}</p>
                    {step.math && <MathRow parts={step.math} className="mt-1.5" />}
                  </div>
                </li>
              ))}
            </ol>
            <p className="rounded-2xl bg-amber-soft px-4 py-3 font-bold text-ink">
              <span className="mr-2 text-xs font-extrabold uppercase tracking-widest">Jawaban</span>
              <span className="font-mono">{block.answer}</span>
            </p>
          </div>
        </article>
      );
    default:
      return null;
  }
}

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
