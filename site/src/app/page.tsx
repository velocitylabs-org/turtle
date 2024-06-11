import { Features } from '@/components/features'

export default function Home() {
  return (
    <>
      <div className="relative z-20 flex h-[60vh] flex-col items-center justify-center md:mb-20 md:h-[80vh]">
        <h1 className="p-4 text-center text-3xl sm:text-5xl md:w-2/3 lg:text-6xl xl:text-8xl">
          Easily move tokens across blockchains.
        </h1>
        <div className="absolute inset-x-0 -bottom-9 -z-10 md:-bottom-48">
          <svg viewBox="0 0 1440 531" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M-0.5 529.218V529.718H0C128.729 529.718 225.425 504.769 326.196 478.769C330.701 477.606 335.214 476.442 339.739 475.277C445.465 448.068 557.426 420.868 716.864 420.868C874.338 420.868 970.857 444.699 1068.6 468.833L1072.26 469.737C1171.29 494.182 1272.37 518.635 1440 518.635H1440.5V518.135V68.881V68.381H1440C1272.28 68.381 1171.14 131.334 1072.12 194.224L1068.47 196.538C970.713 258.637 874.253 319.911 716.864 319.911C557.544 319.911 445.654 240.287 339.915 160.559C335.381 157.14 330.858 153.721 326.343 150.308C225.605 74.1567 128.837 1.00586 0 1.00586H-0.5V1.50586V529.218Z"
              fill="#A184DC"
              // stroke="#001B04"
            />
          </svg>
        </div>
      </div>

      <section className="bg-info pb-36 pt-20 md:pb-72 lg:pb-96">
        <Features />
      </section>
    </>
  )
}
