import { useState } from 'react';

interface Slide {
  alt: string;
  src?: string;
  type?: 'photo' | 'plan';
}

interface Props {
  slides: Slide[];
  projectName: string;
}

const ChevronLeft = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ImagePlaceholder = ({ label }: { label: string }) => (
  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(234,241,248,0.92))]">
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/75 px-6 py-5 text-center shadow-[0_18px_44px_-30px_rgba(7,27,58,0.2)] backdrop-blur-sm">
      <svg
        className="mx-auto text-[var(--color-text-tertiary)]"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <p className="mt-3 text-sm font-medium text-[var(--color-text-tertiary)]">{label}</p>
    </div>
  </div>
);

export default function ProjectSlider({ slides, projectName }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;
  const isPlanSlide = currentSlide?.type === 'plan' || currentIndex === totalSlides - 1;

  const goTo = (index: number) => setCurrentIndex(index);
  const goPrev = () => setCurrentIndex((currentIndex - 1 + totalSlides) % totalSlides);
  const goNext = () => setCurrentIndex((currentIndex + 1) % totalSlides);

  return (
    <div className="group relative aspect-[5/4] w-full overflow-hidden rounded-t-[var(--radius-2xl)] bg-[var(--color-bg-secondary)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.78),transparent_48%)]" />

      {slides.map((slide, index) => (
        <div
          key={`${projectName}-${slide.alt}-${index}`}
          className={`absolute inset-0 transition-opacity duration-300 ${
            index === currentIndex ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={index !== currentIndex}
        >
          {slide.src ? (
            <img
              src={slide.src}
              alt={slide.alt}
              className={`h-full w-full ${slide.type === 'plan' ? 'bg-white object-contain' : 'object-cover'}`}
              loading="lazy"
            />
          ) : (
            <ImagePlaceholder label={slide.alt} />
          )}
        </div>
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[rgba(7,27,58,0.52)] via-[rgba(7,27,58,0.16)] to-transparent" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
        <div className="inline-flex items-center rounded-full border border-white/35 bg-white/18 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {currentIndex + 1} / {totalSlides}
        </div>

        {isPlanSlide && (
          <div className="inline-flex items-center rounded-full bg-[var(--color-accent-primary)] px-3 py-1 text-xs font-semibold text-white shadow-[0_12px_24px_-16px_rgba(8,116,196,0.8)]">
            Планировка
          </div>
        )}
      </div>

      {totalSlides > 1 && (
        <>
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-3">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/88 text-[var(--color-text-primary)] shadow-[0_12px_28px_-20px_rgba(7,27,58,0.45)] backdrop-blur-md transition-all hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-primary)]"
              aria-label={`Предыдущее фото проекта ${projectName}`}
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/88 text-[var(--color-text-primary)] shadow-[0_12px_28px_-20px_rgba(7,27,58,0.45)] backdrop-blur-md transition-all hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-primary)]"
              aria-label={`Следующее фото проекта ${projectName}`}
            >
              <ChevronRight />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 px-4">
            {slides.map((slide, index) => (
              <button
                key={`${projectName}-dot-${slide.alt}-${index}`}
                type="button"
                onClick={() => goTo(index)}
                className={`inline-flex h-2.5 w-2.5 rounded-full border border-white/50 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  currentIndex === index ? 'bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.16)]' : 'bg-white/45 hover:bg-white/75'
                }`}
                aria-label={`Открыть фото ${index + 1} проекта ${projectName}`}
                aria-pressed={currentIndex === index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
