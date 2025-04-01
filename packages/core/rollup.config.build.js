import path from 'path'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import del from 'rollup-plugin-delete'
import pkg from './package.json'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
      {
        file: pkg.jsdelivr,
        format: 'umd',
        name: 'LuckyCanvas',
        sourcemap: true,
        globals: {
          'lucky-canvas': 'LuckyCanvas',
        }
      }
    ],
    plugins: [
      del({ targets: ['dist/*', 'types/*'] }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: true,
        inlineSources: true,
      }),
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js', '.ts'],
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
            }
          }],
          '@babel/preset-typescript'
        ]
      }),
      resolve({
        browser: true
      }),
      commonjs(),
      json(),
      terser()
    ]
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'types/index.d.ts', format: 'es' }],
    plugins: [dts()],
  }
]
