import summary from 'rollup-plugin-summary';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';



const InputOutput = [
   ['./dist/src/components/frost-list-grid/FrostListGrid.js', 'build/FrostListGrid.wc.js'],
   ['./dist/src/components/frost-list-grid/field-renderers/FrostPreviewOrOpen.js', 'build/FrostPreviewOrOpen.wc.js']
];


export default InputOutput.map(inpOut => {
   return {
      input: inpOut[0],
      output: {
         file: inpOut[1],
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
   };
});
