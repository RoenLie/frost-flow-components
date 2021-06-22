import { Meta, Story } from "@storybook/web-components";
import { html } from "lit";
import "../../es-components/es-integer-input";


export default {
   title: "eye-share/input/integer",
   argTypes: {
      backgroundColor: { control: "color" },
      onClick: { action: "onClick" }
   }
} as Meta;

const template: Story = ( { value } ) => html`<es-integer-input id="intval" value=${ value }></es-integer-input>`;

export const primary = template.bind( {} );
primary.args = {
   value: 5
};
export const secondary = template.bind( {} );
secondary.args = {
   value: 10
};
export const tertiary = template.bind( {} );
tertiary.args = {
   value: 15
};
