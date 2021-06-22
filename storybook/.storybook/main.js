module.exports = {
   stories: [
      "../stories/**/*.stories.mdx",
      "../stories/**/*.stories.@(js|jsx|ts|tsx)"
   ],
   addons: [
      "@storybook/addon-links",
      "@storybook/addon-essentials",
      "storybook-dark-mode"
   ],
   babel: async (options) => {

      const customPlugins = [
         // this one breaks .mdx files when it is added.
         // ["@babel/plugin-transform-typescript", { "allowDeclareFields": true }],
         ["@babel/plugin-proposal-decorators", { "decoratorsBeforeExport": true }],
         ["@babel/plugin-proposal-class-properties", { "loose": true }],
      ];

      customPlugins.forEach(plug => {
         const plugIndex = options.plugins.findIndex(plugin => {
            const path = plugin[0] || plugin;
            const cleanPath = plug[0].replace("@", "").replace(/\//g, "\\");

            return path.includes(cleanPath);
         });

         if (plugIndex < 0) {
            options.plugins.push(plug);
            return;
         }

         options.plugins[plugIndex] = plug;
      });

      return options;
   }
}