import { Story, Meta } from "@storybook/web-components";
import { html } from "lit";
import { FrostFlowButton } from "../../lit-components";
FrostFlowButton;

export default {
   title: 'Frostflow/Button',
   argTypes: {
   },
} as Meta;

const Template: Story = ( { count, label } ) => html`
   <frost-flow-button count=${ count } label=${ label }></frost-flow-button>
`;

export const Primary = Template.bind( {} );
Primary.args = {
   label: 'Button',
   count: 1,
};

export const Secondary = Template.bind( {} );
Secondary.args = {
   label: 'Button',
};

export const Large = Template.bind( {} );
Large.args = {
   size: 'large',
   label: 'Button',
};

export const Small = Template.bind( {} );
Small.args = {
   size: 'small',
   label: 'Button',
};