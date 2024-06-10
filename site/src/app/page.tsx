import Link from 'next/link'

export default function Home() {
  return (
    <main className="h-full flex flex-col items-center justify-between bg-[#BFDADC]">
      <div className="grid text-center lg:mb-0 lg:max-w-5xl lg:grid-cols-2 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </a>

        <Link
          href={'#todo'}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            App{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </Link>
      </div>

      {/* <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full">
        <h2 className="mb-2 text-4xl font-semibold">🐢 Turtle App </h2>
      </div>

      <div className="z-10 w-full max-w-5xl place-items-center items-center justify-between font-mono text-sm">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white lg:static lg:size-auto lg:bg-none dark:from-black dark:via-black">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Made with ❤️ by Velocity Labs
          </a>
        </div>
      </div> */}
    </main>
  )
}
