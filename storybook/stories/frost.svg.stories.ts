import { Story, Meta } from "@storybook/web-components";
import { html } from "lit";
import { FrostSvg } from "../../lit-components/index";

export default {
   title: 'Frostflow/Svg',
   argTypes: {
   },
} as Meta;

const Template: Story = ( { count, label } ) => html`
   <frost-svg></frost-svg>
`;

export const Primary = Template.bind( {} );
Primary.args = {
   label: 'Button',
   count: 1,
};