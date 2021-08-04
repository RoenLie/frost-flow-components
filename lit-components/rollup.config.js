import summary from 'rollup-plugin-summary';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

export default [
   {
      input: './dist/src/components/frost-list-grid/FrostListGrid.js',
      output: {
         file: 'build/FrostListGrid.wc.js',
         format: 'esm',
      },
      onwarn(warning) {
         if (warning.code !== 'THIS_IS_UNDEFINED') {
            console.error(`(!) ${warning.message}`);
         }
      },
      plugins: [
         replace({ 'Reflect.decorate': 'undefined' }),
         resolve(),
         terser({
            ecma: 2017,
            module: true,
            warnings: true,
            mangle: {
               properties: {
                  regex: /^__/,
               },
            },
         }),
         summary(),
      ],
   },
   {
      input: './dist/src/components/frost-list-grid/field-renderers/FrostPreviewOrOpen.js',
      output: {
         file: 'build/FrostPreviewOrOpen.wc.js',
         format: 'esm',
      },
      onwarn(warning) {
         if (warning.code !== 'THIS_IS_UNDEFINED') {
            console.error(`(!) ${warning.message}`);
         }
      },
      plugins: [
         replace({ 'Reflect.decorate': 'undefined' }),
         resolve(),
         terser({
            ecma: 2017,
            module: true,
            warnings: true,
            mangle: {
               properties: {
                  regex: /^__/,
               },
            },
         }),
         summary(),
      ],
   },
];
