import type { Achievement, Dinosaur } from "@/types";

/** Urutan array = urutan penetasan telur. */
export const DINOSAURS: Dinosaur[] = [
  { id: "dino-trice", species: "trice", name: "Triceratops", nickname: "Tritri", rarity: "Umum", era: "Kapur Akhir", color: "#5FA777", accent: "#F0A22E", description: "Tiga tanduknya mengingatkan pada tiga hal penting matriks: baris, kolom, dan ordo.", matrixPower: "Menjaga baris dan kolom tetap rapi." },
  { id: "dino-stego", species: "stego", name: "Stegosaurus", nickname: "Stegi", rarity: "Umum", era: "Jura Akhir", color: "#E08A4A", accent: "#2E7355", description: "Lempeng di punggungnya tersusun rapi seperti elemen yang seletak.", matrixPower: "Menjumlahkan elemen seletak tanpa tertukar." },
  { id: "dino-bronto", species: "bronto", name: "Brontosaurus", nickname: "Bronbron", rarity: "Umum", era: "Jura Akhir", color: "#6BB7B0", accent: "#F7F0DC", description: "Lehernya yang panjang bisa melihat seluruh baris sekaligus.", matrixPower: "Mengalikan skalar ke semua elemen dalam satu tarikan napas." },
  { id: "dino-ptero", species: "ptero", name: "Pteranodon", nickname: "Pteri", rarity: "Langka", era: "Kapur Akhir", color: "#D9A441", accent: "#D94E33", description: "Terbang berputar di atas tebing, menukar pandangan baris menjadi kolom.", matrixPower: "Mentranspose matriks dari udara." },
  { id: "dino-raptor", species: "raptor", name: "Velociraptor", nickname: "Velo", rarity: "Langka", era: "Kapur Akhir", color: "#C76B4F", accent: "#F0A22E", description: "Cepat dan teliti. Tidak pernah salah memasangkan baris dengan kolom.", matrixPower: "Mengalikan baris dengan kolom secepat kilat." },
  { id: "dino-ankylo", species: "ankylo", name: "Ankylosaurus", nickname: "Kiko", rarity: "Langka", era: "Kapur Akhir", color: "#8A9A5B", accent: "#8A6238", description: "Berkulit baja. Ekornya memukul diagonal utama lalu diagonal samping.", matrixPower: "Menghitung determinan dengan satu ayunan ekor." },
  { id: "dino-spino", species: "spino", name: "Spinosaurus", nickname: "Spino", rarity: "Legendaris", era: "Kapur Tengah", color: "#4F8FBF", accent: "#D94E33", description: "Layar di punggungnya menyimpan enam diagonal metode Sarrus.", matrixPower: "Menaklukkan determinan 3 × 3." },
  { id: "dino-rex", species: "rex", name: "Tyrannosaurus Rex", nickname: "Rexa", rarity: "Legendaris", era: "Kapur Akhir", color: "#B5533C", accent: "#F0A22E", description: "Raja prasejarah. Hanya menetas untuk penjelajah yang tekun.", matrixPower: "Membalik matriks apa pun yang punya invers." },
];

export const getDinosaur = (id: string): Dinosaur | undefined => DINOSAURS.find((d) => d.id === id);

export const ACHIEVEMENTS: Achievement[] = [
  { id: "ach-first-step", title: "Jejak Pertama", description: "Selesaikan materi pertamamu.", icon: "footprint" },
  { id: "ach-streak-3", title: "Api Unggun", description: "Belajar 3 hari berturut-turut.", icon: "flame" },
  { id: "ach-streak-7", title: "Penggali Fosil", description: "Bersihkan fosil sampai utuh: streak 7 hari.", icon: "brush" },
  { id: "ach-perfect", title: "Raungan Sempurna", description: "Jawab benar semua soal dalam satu latihan.", icon: "star" },
  { id: "ach-hatch", title: "Penetas Telur", description: "Tetaskan satu telur dinosaurus.", icon: "egg" },
  { id: "ach-half", title: "Penjelajah Lembah", description: "Selesaikan 6 chapter.", icon: "volcano" },
  { id: "ach-collector", title: "Kawanan Kecil", description: "Kumpulkan 5 dinosaurus.", icon: "bone" },
  { id: "ach-master", title: "Raja Matriks", description: "Selesaikan seluruh 12 chapter.", icon: "crown" },
];
