'use client'

// @ts-ignore
import hljs from '@highlightjs/cdn-assets/es/core.min.js'
// @ts-ignore
import bash from '@highlightjs/cdn-assets/es/languages/bash.min.js'
// @ts-ignore
import typescript from '@highlightjs/cdn-assets/es/languages/typescript.min.js'
import { Body, Large } from '@velocitylabs-org/turtle-ui'
import '@highlightjs/cdn-assets/styles/github.min.css'
import { useEffect } from 'react'

const CodeBit = ({ guide }: { guide: { title: string; language?: string; code?: string; description?: string } }) => {
  useEffect(() => {
    hljs.registerLanguage('bash', bash)
    hljs.registerLanguage('typescript', typescript)
    hljs.highlightAll()
  }, [])

  return (
    <li className="flex flex-col gap-4 rounded-3xl" key={guide.title}>
      <Large>{guide.title}</Large>
      {guide.code && (
        <pre className="theme-github turtle-foreground rounded-3xl border border-turtle-foreground pb-4 pt-4">
          <code className={`language-${guide.language} font-mono text-sm`}>{guide.code}</code>
        </pre>
      )}
      {guide.description && <Body>{guide.description}</Body>}
    </li>
  )
}

export default CodeBit
