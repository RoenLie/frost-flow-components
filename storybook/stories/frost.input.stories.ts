import { Story, Meta } from "@storybook/web-components";
import { html } from "lit";
import { FrostInput } from "../../lit-components";
FrostInput;


export default {
   title: 'Frostflow/Input',
   argTypes: {
   },
} as Meta;

const Template: Story = ( { label, value } ) => html`
   <frost-input label=${ label } value=${ value }></frost-input>
`;

export const Primary = Template.bind( {} );
Primary.args = {
   label: "input label",
   value: "input value",
};