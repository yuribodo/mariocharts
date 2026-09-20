import type { StorybookConfig } from "@storybook/nextjs";

// Keep Storybook's Webpack plugins and Next's compiler on the same instance.
// https://github.com/storybookjs/storybook/issues/32301
process.env.NEXT_PRIVATE_LOCAL_WEBPACK = "true";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: { name: "@storybook/nextjs", options: {} },
};
export default config;
