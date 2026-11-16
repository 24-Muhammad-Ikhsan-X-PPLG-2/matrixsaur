import { EggArt } from "../art/DinoArt";

const LoadingEgg = () => {
  return (
    <div
      className="grid min-h-dvh place-items-center bg-bg px-4 text-center"
      role="status"
    >
      <div>
        <EggArt progress={0.5} size={110} wobble className="mx-auto" />
        <p className="mt-4 font-display text-2xl font-semibold text-ink">
          Menyiapkan markas…
        </p>
        <p className="mt-1 text-sm font-bold text-muted">Memuat data contoh</p>
      </div>
    </div>
  );
};

export default LoadingEgg;
