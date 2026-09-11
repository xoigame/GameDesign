#!/usr/bin/env node
/** Chạy watcher graph + Vite dev server cùng lúc (cross-platform). */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { watch } from './build-graph.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

watch()

const isWin = process.platform === 'win32'
const vite = spawn(isWin ? 'npx.cmd' : 'npx', ['vite'], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: isWin,
})

vite.on('exit', (code) => process.exit(code === null ? 0 : code))
process.on('SIGINT', () => { vite.kill(); process.exit(0) })
