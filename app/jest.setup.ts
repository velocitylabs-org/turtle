import '@testing-library/jest-dom'

import { TextDecoder, TextEncoder } from 'util' // Node.js util module

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder
